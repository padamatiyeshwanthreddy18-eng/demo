import React, { useState, useEffect } from 'react';
import { SecurityPolicy } from '../server/types.js';
import { fetchPolicies } from '../services/api.js';
import {
  FileCode,
  Shield,
  Search,
  RefreshCw,
  XCircle,
  Clock
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
    <div className="w-full space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#18212F] tracking-tight">
            Security Policies
          </h1>
          <p className="text-xs text-[#596579] mt-0.5">
            Deterministic authorization rules governing autonomous agents. Security policies override raw model predictions.
          </p>
        </div>

        {/* Search & Refresh */}
        <div className="flex items-center gap-2 text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#8A94A3] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search policies..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-white border border-[#D8DEE6] rounded-[7px] pl-8 pr-3 py-1.5 text-[#18212F] focus:outline-none focus:border-[#168C82] w-48 sm:w-56 text-xs shadow-xs"
            />
          </div>

          <button
            onClick={loadPolicies}
            className="p-1.5 rounded-[7px] bg-white border border-[#CDD3DB] text-[#596579] hover:text-[#18212F] hover:bg-[#F1F3F5] transition-colors cursor-pointer shadow-xs"
            title="Refresh policies"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Category Filter Controls */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-[6px] text-xs transition-colors cursor-pointer ${
              filterCategory === cat
                ? 'bg-[#E7F5F3] text-[#116F68] font-semibold border border-[#168C82]/30 shadow-xs'
                : 'text-[#596579] hover:text-[#18212F] bg-white border border-[#E2E6EB]'
            }`}
          >
            {cat === 'ALL' ? 'All Policies' : cat === 'AI SECURITY' ? 'AI Security' : cat.charAt(0) + cat.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Policy Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(policy => {
          const isDeny = policy.action === 'DENY';
          const displayCat = mapCategory(policy.category);

          return (
            <div
              key={policy.id}
              className="aegis-panel p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-xs text-[#168C82] bg-[#E7F5F3] px-2 py-0.5 rounded-[4px] border border-[#168C82]/20">
                      {policy.code}
                    </span>
                    <span className="text-[11px] text-[#8A94A3] font-medium">
                      {displayCat}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-[4px] flex items-center gap-1 ${
                      isDeny ? 'bg-[#FDECEC] text-[#E65353] border border-[#E65353]/30' : 'bg-[#FFF4DE] text-[#D99018] border border-[#D99018]/30'
                    }`}
                  >
                    {isDeny ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    <span>{policy.action}</span>
                  </span>
                </div>

                <h3 className="font-semibold text-sm text-[#18212F] mb-1">
                  {policy.name}
                </h3>
                <p className="text-xs text-[#596579] leading-relaxed mb-3">
                  {policy.description}
                </p>

                <div className="p-2.5 bg-[#F6F7F9] rounded-[7px] border border-[#E2E6EB] text-xs font-mono text-[#18212F] mb-3">
                  <span className="text-[#8A94A3] select-none text-[11px] block mb-0.5 font-sans font-medium">RULE CONDITION:</span>
                  <code className="text-[#168C82] font-semibold">{policy.condition}</code>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E2E6EB] flex items-center justify-between text-xs text-[#8A94A3]">
                <span>Priority: <strong className="text-[#18212F] font-mono">{policy.priority}</strong></span>
                <span className="text-[#21A67A] font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#21A67A]" /> Active Rule
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
