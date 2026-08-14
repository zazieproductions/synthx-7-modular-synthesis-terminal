import { useState } from 'react';
import { FACTORY_PRESETS } from '../state/presets';
import { useSynth } from '../state/useSynth';

/** Preset bank. Each button loads its patch through the engine. */
export function PatchSelector() {
  const { loadPreset } = useSynth();
  const [activePreset, setActivePreset] = useState('init');

  const handleSelect = (presetId: string) => {
    setActivePreset(presetId);
    loadPreset(presetId);
  };

  return (
    <section
      className="border border-[#1a1a2e] rounded-sm overflow-hidden panel-glow-pink"
      aria-label="Presets"
    >
      <header className="px-2 py-1 border-b border-[#1a1a2e]">
        <h2 className="text-[9px] text-[#ff0066] font-mono opacity-70">PATCHES // PRESET BANK</h2>
      </header>
      <div
        className="p-1.5 flex flex-wrap gap-1"
        style={{ background: 'rgba(10,10,15,0.6)' }}
        role="group"
        aria-label="Preset selection"
      >
        {FACTORY_PRESETS.map((preset) => {
          const active = activePreset === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              aria-pressed={active}
              title={preset.description}
              onClick={() => handleSelect(preset.id)}
              className={`px-2 py-1 text-[9px] font-mono rounded-sm border transition-colors ${
                active
                  ? 'bg-[#ff0066] text-[#0a0a0f] border-[#ff0066] font-bold'
                  : 'border-[#1a1a2e] text-[#6b7280] hover:border-[#ff006640] hover:text-[#ff0066]'
              }`}
            >
              {preset.name}
            </button>
          );
        })}
      </div>
    </section>
  );
}
