/**
 * React bindings for the audio engine.
 *
 * The provider is the only place that talks to `SynthEngine`. It owns the
 * small amount of UI-facing state (current parameters, engine status, log)
 * and exposes a stable API through context, keeping the engine and the UI
 * cleanly separated.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { SynthEngine } from '../audio/SynthEngine';
import { formatTimestamp } from '../utils/format';
import { DEFAULT_STATE } from './defaults';
import { getPresetById } from './presets';
import { SynthContext } from './context';
import type { SynthContextValue } from './context';
import type {
  AudioEngineStatus,
  LogEntry,
  LogLevel,
  SynthParameterKey,
  SynthPatch,
  SynthState,
} from '../types/synth';

const MAX_LOG_ENTRIES = 80;

export function SynthProvider({ children }: { children: ReactNode }) {
  const engineRef = useRef<SynthEngine | null>(null);
  if (engineRef.current === null) {
    engineRef.current = new SynthEngine();
  }

  const [state, setState] = useState<SynthState>(DEFAULT_STATE);
  const [status, setStatus] = useState<AudioEngineStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sampleRate, setSampleRate] = useState<number | null>(null);
  const [activeVoiceCount, setActiveVoiceCount] = useState(0);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [timeAnalyser, setTimeAnalyser] = useState<AnalyserNode | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);

  const pushLog = useCallback((level: LogLevel, message: string) => {
    setLog((previous) => {
      const entry: LogEntry = {
        id: Date.now() + Math.random(),
        timestamp: formatTimestamp(new Date()),
        level,
        message,
      };
      const next = [...previous, entry];
      return next.length > MAX_LOG_ENTRIES ? next.slice(next.length - MAX_LOG_ENTRIES) : next;
    });
  }, []);

  const initAudio = useCallback(async () => {
    const engine = engineRef.current;
    if (!engine) return;

    if (engine.isReady) {
      try {
        await engine.resume();
      } catch {
        /* The context may already be running; nothing to do. */
      }
      return;
    }

    setStatus('initializing');
    setErrorMessage(null);
    pushLog('SYS', 'Booting audio engine…');

    try {
      engine.init();
      await engine.resume();
      setState(engine.state as SynthState);
      setSampleRate(engine.sampleRate);
      setAnalyser(engine.analyser);
      setTimeAnalyser(engine.scopeAnalyserNode);
      setStatus('ready');
      pushLog('AUD', `AudioContext ready @ ${engine.sampleRate ?? '?'} Hz`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown audio error';
      setStatus('error');
      setErrorMessage(message);
      pushLog('ERR', `Audio init failed: ${message}`);
    }
  }, [pushLog]);

  const setParameter = useCallback(<K extends SynthParameterKey>(key: K, value: SynthState[K]) => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.setParameter(key, value);
    setState(engine.state as SynthState);
  }, []);

  const applyPatch = useCallback((patch: SynthPatch) => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.applyPatch(patch);
    setState(engine.state as SynthState);
  }, []);

  const loadPreset = useCallback(
    (presetId: string) => {
      const preset = getPresetById(presetId);
      if (!preset) return;
      applyPatch(preset.patch);
      pushLog('SYS', `Loaded preset: ${preset.name}`);
    },
    [applyPatch, pushLog],
  );

  const noteOn = useCallback((note: string) => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.noteOn(note);
    setActiveVoiceCount(engine.activeVoiceCount);
  }, []);

  const noteOff = useCallback((note: string) => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.noteOff(note);
    setActiveVoiceCount(engine.activeVoiceCount);
  }, []);

  const noteOffAll = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.allNotesOff();
    setActiveVoiceCount(engine.activeVoiceCount);
  }, []);

  // Stuck-note prevention: release everything if the tab loses focus or hides.
  useEffect(() => {
    const releaseAll = () => {
      engineRef.current?.allNotesOff();
      setActiveVoiceCount(0);
    };
    const onVisibilityChange = () => {
      if (document.hidden) releaseAll();
    };
    window.addEventListener('blur', releaseAll);
    window.addEventListener('pagehide', releaseAll);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.removeEventListener('blur', releaseAll);
      window.removeEventListener('pagehide', releaseAll);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  // Dispose the engine when the provider unmounts.
  useEffect(() => {
    return () => {
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, []);

  const value = useMemo<SynthContextValue>(
    () => ({
      state,
      status,
      errorMessage,
      sampleRate,
      activeVoiceCount,
      analyser,
      timeAnalyser,
      log,
      isAudioReady: status === 'ready',
      initAudio,
      setParameter,
      applyPatch,
      loadPreset,
      noteOn,
      noteOff,
      noteOffAll,
    }),
    [
      state,
      status,
      errorMessage,
      sampleRate,
      activeVoiceCount,
      analyser,
      timeAnalyser,
      log,
      initAudio,
      setParameter,
      applyPatch,
      loadPreset,
      noteOn,
      noteOff,
      noteOffAll,
    ],
  );

  return <SynthContext.Provider value={value}>{children}</SynthContext.Provider>;
}
