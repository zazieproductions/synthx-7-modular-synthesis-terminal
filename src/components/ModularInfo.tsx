import { useState, useEffect } from 'react';
import type { SynthState } from '../hooks/useSynthEngine';

interface Props {
  state: SynthState;
  isAudioReady: boolean;
}

export function ModularInfo({ state, isAudioReady }: Props) {
  const [cpuLoad, setCpuLoad] = useState(3.2);
  const [memUsage, setMemUsage] = useState(2.4);
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCpuLoad(prev => Math.max(1, Math.min(15, prev + (Math.random() - 0.5) * 2)));
      setMemUsage(prev => Math.max(2, Math.min(8, prev + (Math.random() - 0.5) * 0.3)));
      setUptime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const osc1Freq = state.osc1Detune !== 0 ? `det:${state.osc1Detune >= 0 ? '+' : ''}${state.osc1Detune}ct` : 'det:0ct';
  const osc2Freq = state.osc2Detune !== 0 ? `det:${state.osc2Detune >= 0 ? '+' : ''}${state.osc2Detune}ct` : 'det:0ct';

  return (
    <div className="border border-[#1a1a2e] rounded-sm overflow-hidden panel-glow-amber">
      <div className="px-2 py-1 border-b border-[#1a1a2e]">
        <span className="text-[9px] text-[#ffaa00] font-mono opacity-70">
          MODULAR // SIGNAL CHAIN
        </span>
      </div>
      <div className="p-2 font-mono text-[9px] space-y-1.5" style={{ background: 'rgba(10,10,15,0.6)' }}>
        {/* System Status */}
        <div className="flex justify-between text-[#6b7280]">
          <span>SYS STATUS</span>
          <span className={isAudioReady ? 'text-[#00ff41]' : 'text-[#ffaa00]'}>
            {isAudioReady ? '● ONLINE' : '○ STANDBY'}
          </span>
        </div>
        
        {/* Signal chain visualization */}
        <div className="flex items-center gap-1 flex-wrap">
          <span className="px-1.5 py-0.5 rounded-sm border border-[#00ff4130] text-[#00ff41] bg-[#00ff4108]">OSC1:{state.osc1Type.slice(0,3).toUpperCase()}</span>
          <span className="text-[#1a1a2e]">+</span>
          <span className="px-1.5 py-0.5 rounded-sm border border-[#00e5ff30] text-[#00e5ff] bg-[#00e5ff08]">OSC2:{state.osc2Type.slice(0,3).toUpperCase()}</span>
          <span className="text-[#1a1a2e]">→</span>
          <span className="px-1.5 py-0.5 rounded-sm border border-[#ffaa0030] text-[#ffaa00] bg-[#ffaa0008]">FLT:{state.filterType.slice(0,4).toUpperCase()}</span>
          <span className="text-[#1a1a2e]">→</span>
          <span className="px-1.5 py-0.5 rounded-sm border border-[#ff006630] text-[#ff0066] bg-[#ff006608]">ENV</span>
          <span className="text-[#1a1a2e]">→</span>
          <span className="px-1.5 py-0.5 rounded-sm border border-[#a855f730] text-[#a855f7] bg-[#a855f708]">OUT</span>
        </div>

        {/* OSC Details */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-[#00ff41]">OSC-1</div>
            <div className="text-[#6b7280]">type: {state.osc1Type}</div>
            <div className="text-[#6b7280]">gain: {state.osc1Gain.toFixed(2)}</div>
            <div className="text-[#6b7280]">{osc1Freq}</div>
          </div>
          <div>
            <div className="text-[#00e5ff]">OSC-2</div>
            <div className="text-[#6b7280]">type: {state.osc2Type}</div>
            <div className="text-[#6b7280]">gain: {state.osc2Gain.toFixed(2)}</div>
            <div className="text-[#6b7280]">{osc2Freq}</div>
          </div>
        </div>

        {/* Filter Details */}
        <div>
          <div className="text-[#ffaa00]">FILTER</div>
          <div className="text-[#6b7280]">type: {state.filterType} | freq: {state.filterFreq.toFixed(0)}Hz | Q: {state.filterQ.toFixed(2)}</div>
        </div>

        {/* Effects chain */}
        <div>
          <div className="text-[#a855f7]">FX CHAIN</div>
          <div className="text-[#6b7280]">delay: {state.delayTime.toFixed(2)}s fb:{state.delayFeedback.toFixed(2)} mix:{state.delayMix.toFixed(2)}</div>
          <div className="text-[#6b7280]">reverb: mix {state.reverbMix.toFixed(2)} | dist: {state.distortion.toFixed(2)}</div>
          <div className="text-[#6b7280]">lfo: {state.lfoType} @ {state.lfoRate.toFixed(1)}Hz depth:{state.lfoDepth.toFixed(0)}</div>
        </div>

        {/* System metrics */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#1a1a2e]">
          <div>
            <div className="text-[#6b7280]">CPU</div>
            <div className="text-[#00ff41]">{cpuLoad.toFixed(1)}%</div>
            <div className="h-1 bg-[#1a1a2e] rounded-full overflow-hidden">
              <div className="h-full bg-[#00ff41] rounded-full transition-all" style={{ width: `${cpuLoad * 5}%` }} />
            </div>
          </div>
          <div>
            <div className="text-[#6b7280]">MEM</div>
            <div className="text-[#00e5ff]">{memUsage.toFixed(1)}MB</div>
            <div className="h-1 bg-[#1a1a2e] rounded-full overflow-hidden">
              <div className="h-full bg-[#00e5ff] rounded-full transition-all" style={{ width: `${memUsage * 5}%` }} />
            </div>
          </div>
          <div>
            <div className="text-[#6b7280]">UPTIME</div>
            <div className="text-[#ffaa00]">{formatUptime(uptime)}</div>
            <div className="h-1 bg-[#1a1a2e] rounded-full overflow-hidden">
              <div className="h-full bg-[#ffaa00] rounded-full transition-all" style={{ width: '60%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
