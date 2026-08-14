import { describe, expect, it } from 'vitest';
import { FACTORY_PRESETS, getPresetById, resolvePreset } from './presets';
import { PARAMETER_SPECS } from './parameters';
import { DEFAULT_STATE } from './defaults';
import type { ChoiceParameterKey, SynthState } from '../types/synth';

const CHOICE_KEYS: readonly ChoiceParameterKey[] = [
  'osc1Type',
  'osc2Type',
  'filterType',
  'lfoType',
];
const NUMERIC_KEYS = Object.keys(PARAMETER_SPECS) as (keyof typeof PARAMETER_SPECS)[];

function isValidKey(key: string): key is keyof SynthState {
  return key in DEFAULT_STATE;
}

describe('factory presets', () => {
  it('has a unique id and name for every preset', () => {
    const ids = new Set(FACTORY_PRESETS.map((p) => p.id));
    const names = new Set(FACTORY_PRESETS.map((p) => p.name));
    expect(ids.size).toBe(FACTORY_PRESETS.length);
    expect(names.size).toBe(FACTORY_PRESETS.length);
  });

  it('only references valid parameter keys', () => {
    for (const preset of FACTORY_PRESETS) {
      for (const key of Object.keys(preset.patch)) {
        expect(isValidKey(key), `${preset.id} references unknown key ${key}`).toBe(true);
      }
    }
  });

  it('keeps numeric values inside their parameter ranges', () => {
    for (const preset of FACTORY_PRESETS) {
      for (const key of Object.keys(preset.patch) as (keyof SynthState)[]) {
        const value = preset.patch[key];
        if (typeof value !== 'number') continue;
        const spec = PARAMETER_SPECS[key as keyof typeof PARAMETER_SPECS];
        expect(spec, `no spec for ${key}`).toBeDefined();
        expect(value, `${preset.id}.${key} below min`).toBeGreaterThanOrEqual(spec.min);
        expect(value, `${preset.id}.${key} above max`).toBeLessThanOrEqual(spec.max);
      }
    }
  });

  it('keeps choice values within their enums', () => {
    for (const preset of FACTORY_PRESETS) {
      for (const key of CHOICE_KEYS) {
        const value = preset.patch[key];
        if (value === undefined) continue;
        expect([
          'sine',
          'square',
          'sawtooth',
          'triangle',
          'lowpass',
          'highpass',
          'bandpass',
          'notch',
        ]).toContain(value);
      }
    }
  });

  it('resolves a preset to a complete state', () => {
    const resolved = resolvePreset(FACTORY_PRESETS[0]!);
    expect(resolved).toEqual(DEFAULT_STATE);
    expect(NUMERIC_KEYS.every((key) => key in resolved)).toBe(true);
  });

  it('looks presets up by id', () => {
    expect(getPresetById('bass')?.name).toBe('BASS');
    expect(getPresetById('missing')).toBeUndefined();
  });
});
