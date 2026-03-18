import { useState, useMemo } from 'react';
import type { Client } from '../types';
import type { WorkflowStage } from '../types';
import { getWorkflowStage } from '../utils/simulateData';
import {
  Circle,
  PlayCircle,
  Clock,
  Eye,
  CheckCircle,
  FileSignature,
  Archive,
} from 'lucide-react';

const STAGES: {
  stage: WorkflowStage;
  icon: React.ReactNode;
  color: string;
  accent: string;
  bgAccent: string;
}[] = [
  {
    stage: 'Not Started',
    icon: <Circle className="w-4 h-4" />,
    color: 'text-gray-400',
    accent: 'border-gray-500',
    bgAccent: 'bg-gray-500/20',
  },
  {
    stage: 'Assigned',
    icon: <PlayCircle className="w-4 h-4" />,
    color: 'text-blue-400',
    accent: 'border-blue-500',
    bgAccent: 'bg-blue-500/20',
  },
  {
    stage: 'In Progress',
    icon: <Clock className="w-4 h-4" />,
    color: 'text-indigo-400',
    accent: 'border-indigo-500',
    bgAccent: 'bg-indigo-500/20',
  },
  {
    stage: 'Under Review',
    icon: <Eye className="w-4 h-4" />,
    color: 'text-purple-400',
    accent: 'border-purple-500',
    bgAccent: 'bg-purple-500/20',
  },
  {
    stage: 'QA',
    icon: <CheckCircle className="w-4 h-4" />,
    color: 'text-amber-400',
    accent: 'border-amber-500',
    bgAccent: 'bg-amber-500/20',
  },
  {
    stage: 'Sign Off',
    icon: <FileSignature className="w-4 h-4" />,
    color: 'text-teal-400',
    accent: 'border-teal-500',
    bgAccent: 'bg-teal-500/20',
  },
  {
    stage: 'Archived',
    icon: <Archive className="w-4 h-4" />,
    color: 'text-green-400',
    accent: 'border-green-500',
    bgAccent: 'bg-green-500/20',
  },
];

const RISK_BORDER: Record<Client['riskRating'], string> = {
  High: 'border-l-red-500',
  Medium: 'border-l-amber-500',
  Low: 'border-l-green-500',
};

const RISK_DOT: Record<Client['riskRating'], string> = {
  High: 'bg-red-500',
  Medium: 'bg-amber-500',
  Low: 'bg-green-500',
};

const MAX_CARDS_PER_COLUMN = 20;

export default function Workflow({ clients }: { clients: Client[] }) {
  const [regulationFilter, setRegulationFilter] = useState<string>('All');
  const [riskFilter, setRiskFilter] = useState<string>('All');

  // Derive available regulations
  const regulations = useMemo(() => {
    const set = new Set<string>();
    for (const c of clients) {
      if (c.regulation) set.add(c.regulation);
    }
    return ['All', ...Array.from(set).sort()];
  }, [clients]);

  const riskOptions = ['All', 'High', 'Medium', 'Low'];

  // Filter clients
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      if (regulationFilter !== 'All' && c.regulation !== regulationFilter) return false;
      if (riskFilter !== 'All' && c.riskRating !== riskFilter) return false;
      return true;
    });
  }, [clients, regulationFilter, riskFilter]);

  // Group clients into workflow stages
  const stageGroups = useMemo(() => {
    const groups: Record<WorkflowStage, Client[]> = {
      'Not Started': [],
      Assigned: [],
      'In Progress': [],
      'Under Review': [],
      QA: [],
      'Sign Off': [],
      Archived: [],
    };

    for (const client of filteredClients) {
      const stage = getWorkflowStage(client);
      groups[stage].push(client);
    }

    return groups;
  }, [filteredClients]);

  // Summary bar data
  const totalFiltered = filteredClients.length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <PlayCircle className="w-6 h-6 text-indigo-400" />
        <h2 className="text-xl font-bold text-white">PR Workflow Pipeline</h2>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 uppercase tracking-wide">Regulation</label>
          <select
            value={regulationFilter}
            onChange={(e) => setRegulationFilter(e.target.value)}
            className="bg-navy-800 border border-navy-700 rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            {regulations.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 uppercase tracking-wide">Risk Rating</label>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-navy-800 border border-navy-700 rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            {riskOptions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div className="ml-auto text-xs text-gray-500">
          {totalFiltered} client{totalFiltered !== 1 ? 's' : ''} total
        </div>
      </div>

      {/* Summary bar - stacked horizontal progress */}
      <div className="bg-navy-800 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
            Stage Distribution
          </span>
        </div>
        {totalFiltered > 0 ? (
          <div className="flex rounded-full overflow-hidden h-6">
            {STAGES.map((s) => {
              const count = stageGroups[s.stage].length;
              if (count === 0) return null;
              const pct = (count / totalFiltered) * 100;
              return (
                <div
                  key={s.stage}
                  className={`${s.bgAccent} flex items-center justify-center transition-all`}
                  style={{ width: `${pct}%`, minWidth: count > 0 ? '24px' : '0' }}
                  title={`${s.stage}: ${count}`}
                >
                  <span className={`text-[10px] font-semibold ${s.color} truncate px-1`}>
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex rounded-full overflow-hidden h-6 bg-navy-900" />
        )}
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
          {STAGES.map((s) => (
            <span key={s.stage} className="flex items-center gap-1.5 text-[10px] text-gray-500">
              <span className={s.color}>{s.icon}</span>
              {s.stage}: {stageGroups[s.stage].length}
            </span>
          ))}
        </div>
      </div>

      {/* Kanban board */}
      <div className="flex overflow-x-auto gap-4 p-4 -mx-4">
        {STAGES.map((stageDef) => {
          const stageClients = stageGroups[stageDef.stage];
          const displayedClients = stageClients.slice(0, MAX_CARDS_PER_COLUMN);
          const overflow = stageClients.length - MAX_CARDS_PER_COLUMN;

          return (
            <div
              key={stageDef.stage}
              className="bg-navy-800 rounded-xl min-w-[220px] flex-shrink-0 flex flex-col max-h-[calc(100vh-320px)]"
            >
              {/* Column header */}
              <div className={`flex items-center gap-2 p-3 border-b border-navy-700`}>
                <span className={stageDef.color}>{stageDef.icon}</span>
                <span className="text-sm font-semibold text-gray-200 truncate">
                  {stageDef.stage}
                </span>
                <span
                  className={`ml-auto text-xs font-bold rounded-full px-2 py-0.5 ${stageDef.bgAccent} ${stageDef.color}`}
                >
                  {stageClients.length}
                </span>
              </div>

              {/* Cards container */}
              <div className="p-2 overflow-y-auto flex-1 space-y-2">
                {displayedClients.length === 0 && (
                  <p className="text-xs text-gray-600 text-center py-4">No clients</p>
                )}

                {displayedClients.map((client) => (
                  <div
                    key={client.code}
                    className={`bg-navy-900 rounded-lg p-3 mb-2 border-l-4 ${RISK_BORDER[client.riskRating]} hover:bg-navy-850 transition`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className="text-sm font-bold text-white truncate">
                        {client.code}
                      </span>
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${RISK_DOT[client.riskRating]}`} />
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      {client.regulation && (
                        <span className="text-[10px] bg-navy-800 text-gray-400 rounded px-1.5 py-0.5">
                          {client.regulation}
                        </span>
                      )}
                      <span
                        className={`text-[10px] rounded px-1.5 py-0.5 ${
                          client.riskRating === 'High'
                            ? 'bg-red-900/40 text-red-400'
                            : client.riskRating === 'Medium'
                              ? 'bg-amber-900/40 text-amber-400'
                              : 'bg-green-900/40 text-green-400'
                        }`}
                      >
                        {client.riskRating}
                      </span>
                    </div>
                    {client.prTeamMember && (
                      <p className="text-[10px] text-gray-500 mt-1.5 truncate">
                        {client.prTeamMember}
                      </p>
                    )}
                  </div>
                ))}

                {overflow > 0 && (
                  <div className="text-center py-2">
                    <span className="text-xs text-gray-500">
                      +{overflow} more
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
