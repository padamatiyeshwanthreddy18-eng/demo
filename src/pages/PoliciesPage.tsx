import React, { useState, useEffect } from 'react';
import { SecurityPolicy } from '../server/types.js';
import { fetchPolicies } from '../services/api.js';
import {
  FileCode,
  Shield,
  Search,
  RefreshCw,
  XCircle,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { Tooltip } from '../components/Tooltip.js';

export const PoliciesPage: React.FC = () => {
  const [policies, setPolicies] = useState<SecurityPolicy[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadPolicies = async () => {
    setLoading(true);
    try {
      const data = await fetchPolicies();
      setPolicies(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPolicies();
  }, []);

  const categories = ['ALL', 'IDENTITY', 'AI SECURITY', 'DATA', 'EXECUTION', 'RISK'];

  const mapCategory = (cat: string) => {
    if (cat === 'INJECTION') return 'AI SECURITY';
    if (cat === 'SENSITIVITY' || cat === 'CRITICAL_ASSET' || cat === 'DATABASE') return 'DATA';
    if (cat === 'OPERATION') return 'EXECUTION';
    return cat;
  };

  const filtered = policies.filter(p => {
    const displayCat = mapCategory(p.category);
    const matchesCat = filterCategory === 'ALL' || displayCat === filterCategory;
    const matchesSearch =
      searchQuery === '' ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.condition.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="w-full space-y-6 pb-12 font-sans selection:bg-[#CBFF70]/20 selection:text-[#CBFF70]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#CBFF70] animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#CBFF70] font-semibold">
              Deterministic Invariants
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold text-[#F0F4F8] tracking-tight">
            Security Policy Matrix
          </h1>
          <p className="text-xs text-[#9DAAB8] mt-0.5">
            Deterministic authorization rules governing autonomous agents. Hard invariant policies strictly override model hallucination.
          </p>
        </div>

        {/* Search & Refresh */}
        <div className="flex items-center gap-2 text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#5C6978] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search policies..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-[#151B21] border border-[#2A343E] rounded-lg pl-8 pr-3 py-1.5 text-[#F0F4F8] text-xs font-mono focus:outline-none focus:border-[#CBFF70] w-48 sm:w-56 shadow-xs"
            />
          </div>

          <button
            onClick={loadPolicies}
            className="p-1.5 rounded-lg bg-[#151B21] border border-[#2A343E] text-[#9DAAB8] hover:text-[#F0F4F8] hover:bg-[#1B232B] transition-colors cursor-pointer shadow-xs"
            title="Refresh policies"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#CBFF70]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Category Filter Controls */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
              filterCategory === cat
                ? 'bg-[#1B232B] text-[#CBFF70] font-semibold border border-[#2A343E]'
                : 'text-[#9DAAB8] hover:text-[#F0F4F8] hover:bg-[#151B21]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Policy Matrix Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(policy => {
          const isDeny = policy.action === 'DENY';
          const isApproval = policy.action === 'REQUIRE_APPROVAL';

          return (
            <div
              key={policy.id}
              className="control-panel p-5 flex flex-col justify-between space-y-3 relative hover:border-[#384654] transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#CBFF70]">
                      {policy.code}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#101419] text-[#9DAAB8] border border-[#2A343E]">
                      {mapCategory(policy.category)}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                      isDeny
                        ? 'bg-[#FF8585]/15 text-[#FF8585] border-[#FF8585]/30'
                        : isApproval
                        ? 'bg-[#FFD080]/15 text-[#FFD080] border-[#FFD080]/30'
                        : 'bg-[#69E2AD]/15 text-[#69E2AD] border-[#69E2AD]/30'
                    }`}
                  >
                    {isDeny ? 'HARD BLOCK' : isApproval ? 'ESCROW' : 'ALLOW'}
                  </span>
                </div>

                <h3 className="font-semibold text-sm text-[#F0F4F8] mb-1">
                  {policy.name}
                </h3>

                <p className="text-xs text-[#9DAAB8] leading-relaxed mb-3">
                  {policy.description}
                </p>

                {/* Condition DSL Syntax */}
                <div className="p-2.5 rounded-lg bg-[#0E1318] border border-[#2A343E] font-mono text-[11px] text-[#AB98FF] overflow-x-auto">
                  <code>{policy.condition}</code>
                </div>
              </div>

              <div className="pt-2 border-t border-[#2A343E] flex items-center justify-between text-xs font-mono text-[#5C6978]">
                <span>Enforcement: ACTIVE</span>
                <span className="text-[#69E2AD] font-semibold">Priority 1 Invariant</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
