import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, Cpu, Activity, Users, FileText, CheckCircle2, AlertTriangle, GitFork, Eye } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingApprovalsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, pendingApprovalsCount }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'analyzer', label: 'Analyze', icon: Cpu },
    { id: 'monitor', label: 'Live Monitor', icon: Activity },
    { id: 'agents', label: 'Agents', icon: Users },
    { id: 'policies', label: 'Policies', icon: FileText },
    { id: 'approvals', label: 'Approvals', icon: CheckCircle2, badge: pendingApprovalsCount },
    { id: 'alerts', label: 'Alerts', icon: ShieldAlert },
    { id: 'veil', label: 'Threat Veil', icon: Eye },
    { id: 'audit', label: 'Audit', icon: FileText },
    { id: 'architecture', label: 'Architecture', icon: GitFork }
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#030712]/90 backdrop-blur-md border-b border-cyan-500/20 py-3 shadow-[0_4px_30px_rgba(0,0,0,0.8)]'
          : 'bg-[#030712]/40 backdrop-blur-sm border-b border-cyan-500/10 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Left */}
        <button
          onClick={() => setActiveTab('overview')}
          className="flex items-center gap-3 group text-left transition-transform hover:scale-105 cursor-pointer"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-600/30 border border-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.4)] group-hover:border-cyan-300 transition-colors">
            <Shield className="w-5 h-5 text-cyan-400 group-hover:text-cyan-200" />
            <div className="absolute inset-0 rounded-lg bg-cyan-400/10 animate-ping pointer-events-none" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-cyber font-bold text-lg tracking-wider text-white group-hover:text-cyan-300 transition-colors">
                AEGIS<span className="text-cyan-400">.AI</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 font-mono tracking-widest">
                v2.6
              </span>
            </div>
            <div className="text-[10px] uppercase font-mono text-cyan-400/70 tracking-wider">
              Agent Permission Governor
            </div>
          </div>
        </button>

        {/* Center Navigation Links */}
        <nav className="hidden xl:flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-cyan-500/20 backdrop-blur-md">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'text-cyan-300 bg-cyan-950/60 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-1.5 py-0.2 text-[10px] font-bold font-mono rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Mobile / Compact Nav Pills for smaller screens */}
        <div className="flex xl:hidden items-center gap-1">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="bg-slate-900 border border-cyan-500/30 text-cyan-300 rounded-lg px-2.5 py-1 text-xs font-mono focus:outline-none focus:border-cyan-400"
          >
            {navItems.map(i => (
              <option key={i.id} value={i.id}>
                {i.label} {i.badge ? `(${i.badge})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* System Online Status Right */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-mono shadow-[0_0_10px_rgba(16,185,129,0.15)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold tracking-wider">SYSTEM ONLINE</span>
          </div>
        </div>
      </div>
    </header>
  );
};
