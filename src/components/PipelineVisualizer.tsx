import React from 'react';
import { User, Bot, Brain, Fingerprint, Compass, ShieldAlert, Sparkles, Sliders, ShieldCheck, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export type PipelineStageStatus = 'WAITING' | 'ANALYZING' | 'PASSED' | 'WARNING' | 'BLOCKED' | 'INJECTION';

export interface PipelineStageInfo {
  id: string;
  name: string;
  subtitle: string;
  icon: any;
  status: PipelineStageStatus;
  detail?: string;
}

interface PipelineVisualizerProps {
  stages: PipelineStageInfo[];
  currentAnalyzingStage?: string;
  isProcessing?: boolean;
}

export const PipelineVisualizer: React.FC<PipelineVisualizerProps> = ({
  stages,
  currentAnalyzingStage,
  isProcessing
}) => {
  const getStatusColor = (status: PipelineStageStatus) => {
    switch (status) {
      case 'ANALYZING':
        return {
          border: 'border-cyan-400',
          bg: 'bg-cyan-950/70',
          text: 'text-cyan-300',
          glow: 'shadow-[0_0_20px_rgba(6,182,212,0.6)] animate-pulse',
          line: 'from-cyan-400 to-cyan-500 shadow-[0_0_10px_#06b6d4]'
        };
      case 'PASSED':
        return {
          border: 'border-emerald-500',
          bg: 'bg-emerald-950/70',
          text: 'text-emerald-300',
          glow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]',
          line: 'from-emerald-500 to-emerald-400'
        };
      case 'WARNING':
        return {
          border: 'border-amber-500',
          bg: 'bg-amber-950/70',
          text: 'text-amber-300',
          glow: 'shadow-[0_0_15px_rgba(245,158,11,0.4)]',
          line: 'from-amber-500 to-amber-400'
        };
      case 'BLOCKED':
        return {
          border: 'border-red-500',
          bg: 'bg-red-950/80',
          text: 'text-red-300',
          glow: 'shadow-[0_0_20px_rgba(239,68,68,0.5)]',
          line: 'from-red-500 to-red-600'
        };
      case 'INJECTION':
        return {
          border: 'border-purple-500',
          bg: 'bg-purple-950/80',
          text: 'text-purple-300',
          glow: 'shadow-[0_0_20px_rgba(168,85,247,0.6)] animate-pulse',
          line: 'from-purple-500 to-purple-400'
        };
      default: // WAITING
        return {
          border: 'border-slate-800',
          bg: 'bg-slate-900/40',
          text: 'text-slate-500',
          glow: '',
          line: 'from-slate-800 to-slate-800'
        };
    }
  };

  return (
    <div className="w-full overflow-x-auto pb-4 pt-2">
      <div className="min-w-[900px] flex items-center justify-between relative px-2">
        {stages.map((stage, index) => {
          const colors = getStatusColor(stage.status);
          const Icon = stage.icon;
          const isCurrent = currentAnalyzingStage === stage.id;

          return (
            <React.Fragment key={stage.id}>
              {/* Pipeline Node */}
              <div className="flex flex-col items-center relative group">
                <div
                  className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center transition-all duration-300 relative cursor-default ${colors.border} ${colors.bg} ${colors.glow}`}
                >
                  <Icon className={`w-6 h-6 ${colors.text} transition-colors`} />

                  {/* Pulsing beacon if currently analyzing */}
                  {stage.status === 'ANALYZING' && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                    </span>
                  )}

                  {/* Node Status Badge */}
                  {stage.status === 'PASSED' && (
                    <span className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-0.5 text-slate-950">
                      <CheckCircle2 className="w-3 h-3 text-slate-950" />
                    </span>
                  )}
                  {stage.status === 'WARNING' && (
                    <span className="absolute -bottom-1 -right-1 bg-amber-500 rounded-full p-0.5 text-slate-950">
                      <AlertTriangle className="w-3 h-3 text-slate-950" />
                    </span>
                  )}
                  {(stage.status === 'BLOCKED' || stage.status === 'INJECTION') && (
                    <span className="absolute -bottom-1 -right-1 bg-red-500 rounded-full p-0.5 text-slate-950">
                      <XCircle className="w-3 h-3 text-slate-950" />
                    </span>
                  )}
                </div>

                {/* Node Label */}
                <div className="mt-2 text-center flex flex-col items-center">
                  <span className="font-cyber font-semibold text-xs text-slate-200 tracking-wide">
                    {stage.name}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {stage.subtitle}
                  </span>
                  <span
                    className={`mt-1 px-1.5 py-0.2 rounded text-[9px] font-mono font-bold tracking-wider uppercase border ${
                      stage.status === 'WAITING'
                        ? 'bg-slate-900/60 border-slate-800 text-slate-500'
                        : stage.status === 'ANALYZING'
                        ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300'
                        : stage.status === 'PASSED'
                        ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                        : stage.status === 'WARNING'
                        ? 'bg-amber-950/80 border-amber-500/50 text-amber-300'
                        : stage.status === 'INJECTION'
                        ? 'bg-purple-950/80 border-purple-500/50 text-purple-300'
                        : 'bg-red-950/80 border-red-500/50 text-red-300'
                    }`}
                  >
                    {stage.status}
                  </span>
                </div>
              </div>

              {/* Connector line between stages */}
              {index < stages.length - 1 && (
                <div className="flex-1 mx-2 relative flex items-center justify-center">
                  <div className="w-full h-1 bg-slate-800/80 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 bg-gradient-to-r ${
                        stage.status === 'PASSED'
                          ? 'w-full from-emerald-500 to-emerald-400'
                          : stage.status === 'WARNING'
                          ? 'w-full from-amber-500 to-amber-400'
                          : stage.status === 'BLOCKED' || stage.status === 'INJECTION'
                          ? 'w-full from-red-500 to-red-400'
                          : stage.status === 'ANALYZING'
                          ? 'w-3/4 from-cyan-500 to-cyan-300 animate-pulse'
                          : 'w-0'
                      }`}
                    />
                  </div>
                  {/* Flow arrow / data packet */}
                  {stage.status === 'ANALYZING' && (
                    <div className="absolute w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8] animate-ping" />
                  )}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
