/**
 * Minimal Web Audio stubs for exercising the engine without a real
 * AudioContext (which jsdom does not provide). Every method is a jest.fn so
 * tests can assert on connect/start/stop behaviour.
 */
import { vi } from 'vitest';

export interface MockAudioParam {
  value: number;
  setTargetAtTime: ReturnType<typeof vi.fn>;
  setValueAtTime: ReturnType<typeof vi.fn>;
  linearRampToValueAtTime: ReturnType<typeof vi.fn>;
  exponentialRampToValueAtTime: ReturnType<typeof vi.fn>;
  cancelScheduledValues: ReturnType<typeof vi.fn>;
  cancelAndHoldAtTime: ReturnType<typeof vi.fn>;
}

export interface MockAudioNode {
  connect: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
}

function createParam(value = 0): MockAudioParam {
  return {
    value,
    setTargetAtTime: vi.fn(),
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
    cancelScheduledValues: vi.fn(),
    cancelAndHoldAtTime: vi.fn(),
  };
}

function createNode(): MockAudioNode {
  return { connect: vi.fn(), disconnect: vi.fn() };
}

export interface MockOscillatorNode extends MockAudioNode {
  type: string;
  frequency: MockAudioParam;
  detune: MockAudioParam;
  start: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
  onended: (() => void) | null;
}

export interface MockAudioContext {
  sampleRate: number;
  currentTime: number;
  state: string;
  destination: MockAudioNode;
  createGain: ReturnType<typeof vi.fn>;
  createAnalyser: ReturnType<typeof vi.fn>;
  createBiquadFilter: ReturnType<typeof vi.fn>;
  createWaveShaper: ReturnType<typeof vi.fn>;
  createDelay: ReturnType<typeof vi.fn>;
  createConvolver: ReturnType<typeof vi.fn>;
  createDynamicsCompressor: ReturnType<typeof vi.fn>;
  createOscillator: ReturnType<typeof vi.fn>;
  createBuffer: ReturnType<typeof vi.fn>;
  resume: ReturnType<typeof vi.fn>;
  close: ReturnType<typeof vi.fn>;
}

export function createMockAudioContext(): MockAudioContext {
  const context: MockAudioContext = {
    sampleRate: 44_100,
    currentTime: 0,
    state: 'suspended',
    destination: createNode(),
    createGain: vi.fn(() => ({ ...createNode(), gain: createParam(1) })),
    createAnalyser: vi.fn(() => ({
      ...createNode(),
      fftSize: 2048,
      smoothingTimeConstant: 0.8,
      frequencyBinCount: 1024,
      getByteFrequencyData: vi.fn(),
      getFloatTimeDomainData: vi.fn(),
    })),
    createBiquadFilter: vi.fn(() => ({
      ...createNode(),
      type: 'lowpass',
      frequency: createParam(350),
      Q: createParam(1),
      gain: createParam(0),
    })),
    createWaveShaper: vi.fn(() => ({ ...createNode(), curve: null, oversample: 'none' })),
    createDelay: vi.fn(() => ({ ...createNode(), delayTime: createParam(0) })),
    createConvolver: vi.fn(() => ({ ...createNode(), buffer: null })),
    createDynamicsCompressor: vi.fn(() => ({
      ...createNode(),
      threshold: createParam(-24),
      knee: createParam(30),
      ratio: createParam(12),
      attack: createParam(0.003),
      release: createParam(0.25),
    })),
    createOscillator: vi.fn((): MockOscillatorNode => ({
      ...createNode(),
      type: 'sine',
      frequency: createParam(440),
      detune: createParam(0),
      start: vi.fn(),
      stop: vi.fn(),
      onended: null,
    })),
    createBuffer: vi.fn((channels: number, length: number, sampleRate: number) => ({
      numberOfChannels: channels,
      length,
      sampleRate,
      getChannelData: vi.fn(() => new Float32Array(length)),
    })),
    resume: vi.fn(() => Promise.resolve()),
    close: vi.fn(() => Promise.resolve()),
  };
  return context;
}
