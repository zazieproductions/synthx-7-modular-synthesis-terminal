import { beforeEach, describe, expect, it } from 'vitest';
import { SynthEngine } from './SynthEngine';
import { createMockAudioContext } from '../test/audioMocks';
import type { MockAudioContext } from '../test/audioMocks';
import { NOTE_NAMES } from './notes';

describe('SynthEngine', () => {
  let mockContext: MockAudioContext;

  beforeEach(() => {
    mockContext = createMockAudioContext();
  });

  function createEngine() {
    return new SynthEngine(() => mockContext as unknown as AudioContext);
  }

  it('starts idle and not ready', () => {
    const engine = createEngine();
    expect(engine.currentStatus).toBe('idle');
    expect(engine.isReady).toBe(false);
    expect(engine.activeVoiceCount).toBe(0);
  });

  it('becomes ready after init and reports the sample rate', () => {
    const engine = createEngine();
    engine.init();
    expect(engine.currentStatus).toBe('ready');
    expect(engine.isReady).toBe(true);
    expect(engine.sampleRate).toBe(44_100);
  });

  it('creates a voice on noteOn and releases it on noteOff', () => {
    const engine = createEngine();
    engine.init();
    // init() creates the LFO oscillator; reset the spy to count voice oscillators.
    mockContext.createOscillator.mockClear();
    engine.noteOn('C4');
    expect(engine.activeVoiceCount).toBe(1);
    expect(mockContext.createOscillator).toHaveBeenCalledTimes(2);

    engine.noteOff('C4');
    expect(engine.activeVoiceCount).toBe(0);
  });

  it('is idempotent for repeated noteOn of the same note', () => {
    const engine = createEngine();
    engine.init();
    engine.noteOn('C4');
    engine.noteOn('C4');
    expect(engine.activeVoiceCount).toBe(1);
  });

  it('ignores unknown note names', () => {
    const engine = createEngine();
    engine.init();
    engine.noteOn('H4');
    expect(engine.activeVoiceCount).toBe(0);
  });

  it('steals the oldest voice at the polyphony cap', () => {
    const engine = createEngine();
    engine.init();
    // Trigger 17 distinct notes; the cap is 16, so the oldest is stolen.
    for (const note of NOTE_NAMES.slice(0, 17)) {
      engine.noteOn(note);
    }
    expect(engine.activeVoiceCount).toBe(16);
  });

  it('updates state through setParameter and applyPatch', () => {
    const engine = createEngine();
    engine.init();
    engine.setParameter('masterVolume', 0.25);
    expect(engine.state.masterVolume).toBe(0.25);

    engine.applyPatch({ filterFreq: 800, filterType: 'highpass' });
    expect(engine.state.filterFreq).toBe(800);
    expect(engine.state.filterType).toBe('highpass');
  });

  it('resumes a suspended context when a note is played', () => {
    const engine = createEngine();
    engine.init();
    mockContext.state = 'suspended';
    engine.noteOn('C4');
    expect(mockContext.resume).toHaveBeenCalled();
  });

  it('closes the context on dispose', () => {
    const engine = createEngine();
    engine.init();
    engine.dispose();
    expect(engine.currentStatus).toBe('idle');
    expect(mockContext.close).toHaveBeenCalled();
  });
});
