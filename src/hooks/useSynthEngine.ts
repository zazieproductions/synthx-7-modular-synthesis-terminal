import { useRef, useCallback, useState, useEffect } from 'react';

export type OscType = 'sine' | 'square' | 'sawtooth' | 'triangle';
export type FilterType = 'lowpass' | 'highpass' | 'bandpass' | 'notch';

export interface SynthState {
  masterVolume: number;
  osc1Type: OscType;
  osc1Detune: number;
  osc1Gain: number;
  osc2Type: OscType;
  osc2Detune: number;
  osc2Gain: number;
  filterType: FilterType;
  filterFreq: number;
  filterQ: number;
  filterGain: number;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  delayTime: number;
  delayFeedback: number;
  delayMix: number;
  distortion: number;
  reverbMix: number;
  lfoRate: number;
  lfoDepth: number;
  lfoType: OscType;
}

const NOTE_FREQS: Record<string, number> = {
  'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81,
  'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00,
  'A#3': 233.08, 'B3': 246.94,
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63,
  'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00,
  'A#4': 466.16, 'B4': 493.88,
  'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25,
  'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00,
  'A#5': 932.33, 'B5': 987.77,
  'C6': 1046.50,
};

export { NOTE_FREQS };

interface ActiveNote {
  osc1: OscillatorNode;
  osc2: OscillatorNode;
  gainNode: GainNode;
  envelopeGain: GainNode;
}

export function useSynthEngine() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const analyserTimeRef = useRef<AnalyserNode | null>(null);
  const delayNodeRef = useRef<DelayNode | null>(null);
  const delayFeedbackRef = useRef<GainNode | null>(null);
  const delayMixRef = useRef<GainNode | null>(null);
  const dryMixRef = useRef<GainNode | null>(null);
  const distortionRef = useRef<WaveShaperNode | null>(null);
  const convolverRef = useRef<ConvolverNode | null>(null);
  const reverbMixRef = useRef<GainNode | null>(null);
  const reverbDryRef = useRef<GainNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);
  const lfoGainRef = useRef<GainNode | null>(null);
  const activeNotesRef = useRef<Map<string, ActiveNote>>(new Map());
  const stateRef = useRef<SynthState>(getDefaultState());
  const [state, setState] = useState<SynthState>(getDefaultState());
  const [isAudioReady, setIsAudioReady] = useState(false);

  function getDefaultState(): SynthState {
    return {
      masterVolume: 0.5,
      osc1Type: 'sawtooth',
      osc1Detune: 0,
      osc1Gain: 0.7,
      osc2Type: 'square',
      osc2Detune: -7,
      osc2Gain: 0.3,
      filterType: 'lowpass',
      filterFreq: 2000,
      filterQ: 2,
      filterGain: 0,
      attack: 0.05,
      decay: 0.2,
      sustain: 0.6,
      release: 0.3,
      delayTime: 0.3,
      delayFeedback: 0.3,
      delayMix: 0.2,
      distortion: 0,
      reverbMix: 0.15,
      lfoRate: 4,
      lfoDepth: 0,
      lfoType: 'sine',
    };
  }

  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;

    // Master gain
    const masterGain = ctx.createGain();
    masterGain.gain.value = stateRef.current.masterVolume;
    masterGainRef.current = masterGain;

    // Analyser (frequency domain)
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.8;
    analyserRef.current = analyser;

    // Analyser (time domain)
    const analyserTime = ctx.createAnalyser();
    analyserTime.fftSize = 2048;
    analyserTime.smoothingTimeConstant = 0.8;
    analyserTimeRef.current = analyserTime;

    // Filter
    const filter = ctx.createBiquadFilter();
    filter.type = stateRef.current.filterType;
    filter.frequency.value = stateRef.current.filterFreq;
    filter.Q.value = stateRef.current.filterQ;
    filter.gain.value = stateRef.current.filterGain;
    filterRef.current = filter;

    // Distortion
    const distortion = ctx.createWaveShaper();
    distortion.curve = makeDistortionCurve(stateRef.current.distortion) as Float32Array<ArrayBuffer>;
    distortion.oversample = '4x';
    distortionRef.current = distortion;

    // Delay
    const delayNode = ctx.createDelay(2);
    delayNode.delayTime.value = stateRef.current.delayTime;
    delayNodeRef.current = delayNode;

    const delayFeedback = ctx.createGain();
    delayFeedback.gain.value = stateRef.current.delayFeedback;
    delayFeedbackRef.current = delayFeedback;

    const delayMix = ctx.createGain();
    delayMix.gain.value = stateRef.current.delayMix;
    delayMixRef.current = delayMix;

    const dryMix = ctx.createGain();
    dryMix.gain.value = 1 - stateRef.current.delayMix;
    dryMixRef.current = dryMix;

    // Reverb (convolver with generated impulse)
    const convolver = ctx.createConvolver();
    convolver.buffer = generateReverbImpulse(ctx, 2, 2);
    convolverRef.current = convolver;

    const reverbMix = ctx.createGain();
    reverbMix.gain.value = stateRef.current.reverbMix;
    reverbMixRef.current = reverbMix;

    const reverbDry = ctx.createGain();
    reverbDry.gain.value = 1 - stateRef.current.reverbMix;
    reverbDryRef.current = reverbDry;

    // LFO
    const lfo = ctx.createOscillator();
    lfo.type = stateRef.current.lfoType;
    lfo.frequency.value = stateRef.current.lfoRate;
    lfoGainRef.current = ctx.createGain();
    lfoGainRef.current.gain.value = stateRef.current.lfoDepth;
    lfo.connect(lfoGainRef.current!);
    lfoGainRef.current!.connect(filter.frequency);
    lfo.start();
    lfoRef.current = lfo;

    // Signal chain: filter -> distortion -> [dry/delay/reverb] -> analyser -> master -> output
    filter.connect(distortion);
    
    // Dry path
    distortion.connect(dryMix);
    dryMix.connect(analyser);

    // Delay path
    distortion.connect(delayNode);
    delayNode.connect(delayFeedback);
    delayFeedback.connect(delayNode);
    delayNode.connect(delayMix);
    delayMix.connect(analyser);

    // Reverb path
    distortion.connect(convolver);
    convolver.connect(reverbMix);
    reverbMix.connect(analyser);
    distortion.connect(reverbDry);
    reverbDry.connect(analyser);

    analyser.connect(masterGain);
    masterGain.connect(analyserTime);
    analyserTime.connect(ctx.destination);

    setIsAudioReady(true);
  }, []);

  const noteOn = useCallback((note: string) => {
    if (!audioCtxRef.current) initAudio();
    const ctx = audioCtxRef.current!;
    if (!ctx) return;

    if (activeNotesRef.current.has(note)) return;

    const freq = NOTE_FREQS[note];
    if (!freq) return;

    const s = stateRef.current;

    // Envelope gain
    const envelopeGain = ctx.createGain();
    envelopeGain.gain.setValueAtTime(0, ctx.currentTime);
    envelopeGain.gain.linearRampToValueAtTime(1, ctx.currentTime + s.attack);
    envelopeGain.gain.linearRampToValueAtTime(s.sustain, ctx.currentTime + s.attack + s.decay);

    // Osc 1
    const osc1 = ctx.createOscillator();
    osc1.type = s.osc1Type;
    osc1.frequency.value = freq;
    osc1.detune.value = s.osc1Detune;
    const osc1Gain = ctx.createGain();
    osc1Gain.gain.value = s.osc1Gain;
    osc1.connect(osc1Gain);
    osc1Gain.connect(envelopeGain);

    // Osc 2
    const osc2 = ctx.createOscillator();
    osc2.type = s.osc2Type;
    osc2.frequency.value = freq;
    osc2.detune.value = s.osc2Detune;
    const osc2Gain = ctx.createGain();
    osc2Gain.gain.value = s.osc2Gain;
    osc2.connect(osc2Gain);
    osc2Gain.connect(envelopeGain);

    // Connect to filter
    envelopeGain.connect(filterRef.current!);

    osc1.start();
    osc2.start();

    activeNotesRef.current.set(note, { osc1, osc2, gainNode: envelopeGain, envelopeGain });
  }, [initAudio]);

  const noteOff = useCallback((note: string) => {
    const active = activeNotesRef.current.get(note);
    if (!active) return;

    const ctx = audioCtxRef.current!;
    const s = stateRef.current;
    const now = ctx.currentTime;

    active.envelopeGain.gain.cancelScheduledValues(now);
    active.envelopeGain.gain.setValueAtTime(active.envelopeGain.gain.value, now);
    active.envelopeGain.gain.linearRampToValueAtTime(0, now + s.release);

    setTimeout(() => {
      try {
        active.osc1.stop();
        active.osc2.stop();
      } catch (e) { /* already stopped */ }
    }, (s.release + 0.1) * 1000);

    activeNotesRef.current.delete(note);
  }, []);

  const noteOffAll = useCallback(() => {
    activeNotesRef.current.forEach((_, note) => noteOff(note));
  }, [noteOff]);

  const updateState = useCallback(<K extends keyof SynthState>(key: K, value: SynthState[K]) => {
    setState(prev => {
      const next = { ...prev, [key]: value };
      stateRef.current = next;
      return next;
    });

    // Apply to audio nodes
    if (!audioCtxRef.current) return;

    switch (key) {
      case 'masterVolume':
        masterGainRef.current?.gain.setTargetAtTime(value as number, audioCtxRef.current!.currentTime, 0.01);
        break;
      case 'filterType':
        if (filterRef.current) filterRef.current.type = value as FilterType;
        break;
      case 'filterFreq':
        filterRef.current?.frequency.setTargetAtTime(value as number, audioCtxRef.current!.currentTime, 0.01);
        break;
      case 'filterQ':
        filterRef.current?.Q.setTargetAtTime(value as number, audioCtxRef.current!.currentTime, 0.01);
        break;
      case 'filterGain':
        filterRef.current?.gain.setTargetAtTime(value as number, audioCtxRef.current!.currentTime, 0.01);
        break;
      case 'delayTime':
        delayNodeRef.current?.delayTime.setTargetAtTime(value as number, audioCtxRef.current!.currentTime, 0.01);
        break;
      case 'delayFeedback':
        delayFeedbackRef.current?.gain.setTargetAtTime(value as number, audioCtxRef.current!.currentTime, 0.01);
        break;
      case 'delayMix':
        delayMixRef.current?.gain.setTargetAtTime(value as number, audioCtxRef.current!.currentTime, 0.01);
        dryMixRef.current?.gain.setTargetAtTime(1 - (value as number), audioCtxRef.current!.currentTime, 0.01);
        break;
      case 'distortion':
        if (distortionRef.current) distortionRef.current.curve = makeDistortionCurve(value as number) as Float32Array<ArrayBuffer>;
        break;
      case 'reverbMix':
        reverbMixRef.current?.gain.setTargetAtTime(value as number, audioCtxRef.current!.currentTime, 0.01);
        reverbDryRef.current?.gain.setTargetAtTime(1 - (value as number), audioCtxRef.current!.currentTime, 0.01);
        break;
      case 'lfoRate':
        lfoRef.current?.frequency.setTargetAtTime(value as number, audioCtxRef.current!.currentTime, 0.01);
        break;
      case 'lfoDepth':
        lfoGainRef.current?.gain.setTargetAtTime(value as number, audioCtxRef.current!.currentTime, 0.01);
        break;
      case 'lfoType':
        if (lfoRef.current) lfoRef.current.type = value as OscType;
        break;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      noteOffAll();
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  return {
    state,
    updateState,
    noteOn,
    noteOff,
    noteOffAll,
    initAudio,
    isAudioReady,
    analyserRef,
    analyserTimeRef,
    audioCtxRef,
  };
}

function makeDistortionCurve(amount: number): Float32Array {
  const k = amount * 100;
  const samples = 44100;
  const curve = new Float32Array(samples);
  const deg = Math.PI / 180;
  for (let i = 0; i < samples; i++) {
    const x = (i * 2) / samples - 1;
    curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
  }
  return curve;
}

function generateReverbImpulse(ctx: AudioContext, duration: number, decay: number): AudioBuffer {
  const length = ctx.sampleRate * duration;
  const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    const data = impulse.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }
  return impulse;
}
