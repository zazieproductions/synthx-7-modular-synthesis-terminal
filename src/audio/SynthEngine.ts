/**
 * Framework-agnostic synthesis engine built on the Web Audio API.
 *
 * The engine owns the entire audio graph and all voice bookkeeping. It has no
 * React dependency, which keeps it testable in isolation and ready for future
 * drivers (MIDI input, patch persistence, recording, polyphony expansion).
 *
 * Signal chain:
 *
 *   OSC1 ─► gain ─┐
 *                  ├─► envelope ─► filter ─► distortion ─► dry ─────────────┐
 *   OSC2 ─► gain ─┘                                    ├─► delay ─► wet ──► mix bus
 *                                                      └─► reverb ─► wet ──┘
 *   mix bus ─► master ─► spectrum analyser ─► limiter ─► scope analyser ─► out
 *
 * A single dry path plus per-effect wet sends avoids the double-dry-path gain
 * error present in the original implementation, and a soft limiter before the
 * destination guards against harsh clipping at high drive settings.
 */
import { generateImpulseResponse, makeDistortionCurve } from './dsp';
import { noteFrequency } from './notes';
import { DEFAULT_STATE } from '../state/defaults';
import { clamp, clamp01 } from '../utils/math';
import type {
  AudioEngineStatus,
  FilterType,
  OscType,
  SynthParameterKey,
  SynthState,
} from '../types/synth';

/** Maximum simultaneous voices before oldest-note stealing kicks in. */
export const MAX_POLYPHONY = 16;

/** Smoothing time constant for live parameter changes (seconds). */
const PARAM_RAMP_SECONDS = 0.01;

/** Extra time (seconds) allowed after release before a voice is torn down. */
const VOICE_STOP_TAIL_SECONDS = 0.1;

/** Minimum enforceable envelope segment length (seconds). */
const MIN_ENVELOPE_SECONDS = 0.001;

/** A single sounding voice. */
interface Voice {
  note: string;
  osc1: OscillatorNode;
  osc2: OscillatorNode;
  osc1Gain: GainNode;
  osc2Gain: GainNode;
  envelope: GainNode;
}

export type AudioContextFactory = () => AudioContext;

function defaultAudioContextFactory(): AudioContext {
  if (typeof window === 'undefined' || typeof window.AudioContext !== 'function') {
    throw new Error('The Web Audio API is not supported in this browser.');
  }
  return new window.AudioContext();
}

/** Normalise an unknown thrown value into a human-readable message. */
function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export class SynthEngine {
  private context: AudioContext | null = null;

  private master: GainNode | null = null;
  private outputBus: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private distortion: WaveShaperNode | null = null;
  private delay: DelayNode | null = null;
  private delayFeedback: GainNode | null = null;
  private delayReturn: GainNode | null = null;
  private convolver: ConvolverNode | null = null;
  private reverbReturn: GainNode | null = null;
  private limiter: DynamicsCompressorNode | null = null;
  private spectrumAnalyser: AnalyserNode | null = null;
  private scopeAnalyser: AnalyserNode | null = null;
  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;

  private readonly voices = new Map<string, Voice>();
  private parameters: SynthState = { ...DEFAULT_STATE };
  private status: AudioEngineStatus = 'idle';
  private errorMessage: string | null = null;

  private readonly createAudioContext: AudioContextFactory;

  constructor(createAudioContext: AudioContextFactory = defaultAudioContextFactory) {
    this.createAudioContext = createAudioContext;
  }

  // ------------------------------------------------------------------ state

  get currentStatus(): AudioEngineStatus {
    return this.status;
  }

  get error(): string | null {
    return this.errorMessage;
  }

  get isReady(): boolean {
    return this.status === 'ready';
  }

  get sampleRate(): number | null {
    return this.context?.sampleRate ?? null;
  }

  get activeVoiceCount(): number {
    return this.voices.size;
  }

  get state(): Readonly<SynthState> {
    return this.parameters;
  }

  get analyser(): AnalyserNode | null {
    return this.spectrumAnalyser;
  }

  get scopeAnalyserNode(): AnalyserNode | null {
    return this.scopeAnalyser;
  }

  private get now(): number {
    return this.context?.currentTime ?? 0;
  }

  // ------------------------------------------------------------------- init

  /**
   * Create the AudioContext and build the node graph. Idempotent: calling it
   * again simply resumes an existing context. Throws if audio is unavailable.
   */
  init(): void {
    if (this.context) {
      void this.resume();
      return;
    }

    this.status = 'initializing';
    this.errorMessage = null;

    let context: AudioContext;
    try {
      context = this.createAudioContext();
    } catch (error) {
      this.status = 'error';
      this.errorMessage = toErrorMessage(error);
      throw error;
    }

    this.context = context;

    try {
      this.buildGraph(context);
      this.applyParameterSet(this.parameters);
      this.status = 'ready';
    } catch (error) {
      this.status = 'error';
      this.errorMessage = toErrorMessage(error);
      void context.close().catch(() => undefined);
      this.context = null;
      throw error;
    }
  }

  /** Resume a suspended context (required to satisfy autoplay policies). */
  async resume(): Promise<void> {
    if (!this.context) return;
    if (this.context.state !== 'running') {
      await this.context.resume();
    }
  }

  private buildGraph(context: AudioContext): void {
    const params = this.parameters;

    // Master section.
    this.outputBus = context.createGain();
    this.outputBus.gain.value = 1;

    this.master = context.createGain();
    this.master.gain.value = params.masterVolume;

    this.spectrumAnalyser = context.createAnalyser();
    this.spectrumAnalyser.fftSize = 2048;
    this.spectrumAnalyser.smoothingTimeConstant = 0.8;

    this.scopeAnalyser = context.createAnalyser();
    this.scopeAnalyser.fftSize = 2048;
    this.scopeAnalyser.smoothingTimeConstant = 0.5;

    // Safety limiter before the output.
    this.limiter = context.createDynamicsCompressor();
    this.limiter.threshold.value = -6;
    this.limiter.knee.value = 6;
    this.limiter.ratio.value = 12;
    this.limiter.attack.value = 0.003;
    this.limiter.release.value = 0.25;

    // Filter.
    this.filter = context.createBiquadFilter();
    this.filter.type = params.filterType;
    this.filter.frequency.value = params.filterFreq;
    this.filter.Q.value = params.filterQ;
    this.filter.gain.value = params.filterGain;

    // Distortion (unity-gain curve when drive is 0).
    this.distortion = context.createWaveShaper();
    this.distortion.curve = makeDistortionCurve(params.distortion);
    this.distortion.oversample = '4x';

    // Delay send with feedback loop.
    this.delay = context.createDelay(2);
    this.delay.delayTime.value = params.delayTime;
    this.delayFeedback = context.createGain();
    this.delayFeedback.gain.value = params.delayFeedback;
    this.delayReturn = context.createGain();
    this.delayReturn.gain.value = params.delayMix;

    // Reverb send (convolution).
    this.convolver = context.createConvolver();
    this.convolver.buffer = generateImpulseResponse(context, 2, 2);
    this.reverbReturn = context.createGain();
    this.reverbReturn.gain.value = params.reverbMix;

    // LFO -> filter cutoff.
    this.lfo = context.createOscillator();
    this.lfo.type = params.lfoType;
    this.lfo.frequency.value = params.lfoRate;
    this.lfoGain = context.createGain();
    this.lfoGain.gain.value = params.lfoDepth;

    // Wire the graph.
    this.filter.connect(this.distortion);

    // Dry path.
    this.distortion.connect(this.outputBus);

    // Delay path.
    this.distortion.connect(this.delay);
    this.delay.connect(this.delayFeedback);
    this.delayFeedback.connect(this.delay);
    this.delay.connect(this.delayReturn);
    this.delayReturn.connect(this.outputBus);

    // Reverb path.
    this.distortion.connect(this.convolver);
    this.convolver.connect(this.reverbReturn);
    this.reverbReturn.connect(this.outputBus);

    // LFO routing.
    this.lfo.connect(this.lfoGain);
    this.lfoGain.connect(this.filter.frequency);

    // Output chain.
    this.outputBus.connect(this.master);
    this.master.connect(this.spectrumAnalyser);
    this.spectrumAnalyser.connect(this.limiter);
    this.limiter.connect(this.scopeAnalyser);
    this.scopeAnalyser.connect(context.destination);

    this.lfo.start();
  }

  // -------------------------------------------------------------- parameters

  /**
   * Update a single parameter in both the stored state and the live graph.
   * Typed so that callers cannot pass the wrong value type for a given key.
   */
  setParameter<K extends SynthParameterKey>(key: K, value: SynthState[K]): void {
    const next: SynthState = { ...this.parameters, [key]: value } as SynthState;
    this.parameters = next;
    this.applySingleParameter(key, value);
  }

  /** Merge a patch over the current state and apply every changed key. */
  applyPatch(patch: Partial<SynthState>): void {
    const next: SynthState = { ...this.parameters, ...patch };
    this.parameters = next;
    for (const [key, value] of Object.entries(patch)) {
      this.applySingleParameter(key as SynthParameterKey, value);
    }
  }

  private applyParameterSet(state: SynthState): void {
    for (const key of Object.keys(state) as SynthParameterKey[]) {
      this.applySingleParameter(key, state[key]);
    }
  }

  /**
   * Push a value into the audio graph. The `as` narrowings here are safe: the
   * literal `key` in each branch guarantees the runtime type of `value`, and
   * `setParameter` is the only (typed) entry point.
   */
  private applySingleParameter(key: SynthParameterKey, value: SynthState[SynthParameterKey]): void {
    switch (key) {
      case 'masterVolume':
        this.master?.gain.setTargetAtTime(clamp01(value as number), this.now, PARAM_RAMP_SECONDS);
        break;
      case 'filterType':
        if (this.filter) this.filter.type = value as FilterType;
        break;
      case 'filterFreq':
        this.filter?.frequency.setTargetAtTime(value as number, this.now, PARAM_RAMP_SECONDS);
        break;
      case 'filterQ':
        this.filter?.Q.setTargetAtTime(value as number, this.now, PARAM_RAMP_SECONDS);
        break;
      case 'filterGain':
        this.filter?.gain.setTargetAtTime(value as number, this.now, PARAM_RAMP_SECONDS);
        break;
      case 'delayTime':
        this.delay?.delayTime.setTargetAtTime(value as number, this.now, PARAM_RAMP_SECONDS);
        break;
      case 'delayFeedback':
        this.delayFeedback?.gain.setTargetAtTime(
          clamp(value as number, 0, 0.95),
          this.now,
          PARAM_RAMP_SECONDS,
        );
        break;
      case 'delayMix':
        this.delayReturn?.gain.setTargetAtTime(
          clamp01(value as number),
          this.now,
          PARAM_RAMP_SECONDS,
        );
        break;
      case 'distortion':
        if (this.distortion) this.distortion.curve = makeDistortionCurve(value as number);
        break;
      case 'reverbMix':
        this.reverbReturn?.gain.setTargetAtTime(
          clamp01(value as number),
          this.now,
          PARAM_RAMP_SECONDS,
        );
        break;
      case 'lfoRate':
        this.lfo?.frequency.setTargetAtTime(value as number, this.now, PARAM_RAMP_SECONDS);
        break;
      case 'lfoDepth':
        this.lfoGain?.gain.setTargetAtTime(value as number, this.now, PARAM_RAMP_SECONDS);
        break;
      case 'lfoType':
        if (this.lfo) this.lfo.type = value as OscType;
        break;
      // Voice-scoped parameters only affect notes triggered after the change,
      // matching the behaviour of a hardware synth patch.
      case 'osc1Type':
      case 'osc1Detune':
      case 'osc1Gain':
      case 'osc2Type':
      case 'osc2Detune':
      case 'osc2Gain':
      case 'attack':
      case 'decay':
      case 'sustain':
      case 'release':
        break;
    }
  }

  // ------------------------------------------------------------------ voices

  /**
   * Trigger a note. Creates the context on demand (user gesture), resumes a
   * suspended context, enforces the polyphony cap by stealing the oldest
   * voice, and schedules the attack/decay/sustain envelope.
   */
  noteOn(note: string): void {
    if (!this.context) this.init();
    if (this.status !== 'ready' || !this.context) return;

    const context = this.context;
    void this.resume();

    // Idempotent retrigger guard.
    if (this.voices.has(note)) return;

    const frequency = noteFrequency(note);
    if (frequency === undefined) return;

    // Oldest-note stealing when the cap is reached.
    if (this.voices.size >= MAX_POLYPHONY) {
      const oldest = this.voices.keys().next();
      if (!oldest.done && oldest.value !== undefined) {
        this.noteOff(oldest.value);
      }
    }

    const params = this.parameters;
    const t0 = context.currentTime;
    const attack = Math.max(params.attack, MIN_ENVELOPE_SECONDS);
    const decay = Math.max(params.decay, MIN_ENVELOPE_SECONDS);

    const envelope = context.createGain();
    envelope.gain.setValueAtTime(0, t0);
    envelope.gain.linearRampToValueAtTime(1, t0 + attack);
    envelope.gain.linearRampToValueAtTime(Math.max(params.sustain, 0), t0 + attack + decay);

    const osc1 = context.createOscillator();
    osc1.type = params.osc1Type;
    osc1.frequency.value = frequency;
    osc1.detune.value = params.osc1Detune;
    const osc1Gain = context.createGain();
    osc1Gain.gain.value = params.osc1Gain;

    const osc2 = context.createOscillator();
    osc2.type = params.osc2Type;
    osc2.frequency.value = frequency;
    osc2.detune.value = params.osc2Detune;
    const osc2Gain = context.createGain();
    osc2Gain.gain.value = params.osc2Gain;

    const filter = this.filter;
    if (!filter) return;

    osc1.connect(osc1Gain);
    osc1Gain.connect(envelope);
    osc2.connect(osc2Gain);
    osc2Gain.connect(envelope);
    envelope.connect(filter);

    osc1.start();
    osc2.start();

    this.voices.set(note, { note, osc1, osc2, osc1Gain, osc2Gain, envelope });
  }

  /** Release a note: ramp the envelope down and schedule node teardown. */
  noteOff(note: string): void {
    const voice = this.voices.get(note);
    if (!voice) return;
    this.voices.delete(note);

    const context = this.context;
    if (!context) return;

    const release = Math.max(this.parameters.release, MIN_ENVELOPE_SECONDS);
    const now = context.currentTime;
    const envelopeParam = voice.envelope.gain;

    if (typeof envelopeParam.cancelAndHoldAtTime === 'function') {
      envelopeParam.cancelAndHoldAtTime(now);
    } else {
      envelopeParam.cancelScheduledValues(now);
      envelopeParam.setValueAtTime(envelopeParam.value, now);
    }
    envelopeParam.linearRampToValueAtTime(0, now + release);

    const stopAt = now + release + VOICE_STOP_TAIL_SECONDS;
    try {
      voice.osc1.stop(stopAt);
      voice.osc2.stop(stopAt);
    } catch {
      // The oscillators were already stopped; nothing to do.
    }

    voice.osc1.onended = () => {
      this.disconnectVoice(voice);
    };
  }

  /** Immediately release every sounding voice. */
  allNotesOff(): void {
    for (const note of [...this.voices.keys()]) {
      this.noteOff(note);
    }
  }

  private disconnectVoice(voice: Voice): void {
    voice.osc1.disconnect();
    voice.osc2.disconnect();
    voice.osc1Gain.disconnect();
    voice.osc2Gain.disconnect();
    voice.envelope.disconnect();
  }

  // ----------------------------------------------------------------- dispose

  /** Tear down the entire graph and release the AudioContext. */
  dispose(): void {
    this.allNotesOff();

    this.lfo?.stop();
    this.lfo?.disconnect();
    this.lfoGain?.disconnect();

    this.filter?.disconnect();
    this.distortion?.disconnect();
    this.delay?.disconnect();
    this.delayFeedback?.disconnect();
    this.delayReturn?.disconnect();
    this.convolver?.disconnect();
    this.reverbReturn?.disconnect();
    this.outputBus?.disconnect();
    this.master?.disconnect();
    this.spectrumAnalyser?.disconnect();
    this.scopeAnalyser?.disconnect();
    this.limiter?.disconnect();

    const context = this.context;
    this.context = null;
    this.status = 'idle';
    this.errorMessage = null;

    if (context) {
      void context.close().catch(() => undefined);
    }
  }
}
