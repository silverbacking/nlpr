import { useState, useMemo } from 'react';
import { Search, Filter, ChevronUp, ChevronDown, Download, ArrowUpDown } from 'lucide-react';
import type { Client } from '../types';
import { getWorkflowStage } from '../utils/simulateData';

interface ClientsTableProps {
  clients: Client[];
  onSelectClient: (code: string) => void;
}

type SortField =
  | 'code'
  | 'regulation'
  | 'status'
  | 'riskRating'
  | 'dueDate'
  | 'prTeamMember'
  | 'prStatus'
  | 'workflowStage';

type SortDirection = 'asc' | 'desc';

const ROWS_PER_PAGE = 25;

const WORKFLOW_ORDER = [
  'Not Started',
  'Assigned',
  'In Progress',
  'Under Review',
  'QA',
  'Sign Off',
  'Archived',
];

const RISK_ORDER: Record<string, number> = { High: 3, Medium: 2, Low: 1 };

function riskBadge(risk: string) {
  const base = 'px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap';
  switch (risk) {
    case 'High':
      return <span className={`${base} bg-red-900/60 text-red-300 border border-red-700/50`}>High</span>;
    case 'Medium':
      return <span className={`${base} bg-amber-900/60 text-amber-300 border border-amber-700/50`}>Medium</span>;
    case 'Low':
      return <span className={`${base} bg-green-900/60 text-green-300 border border-green-700/50`}>Low</span>;
    default:
      return <span className={`${base} bg-gray-800 text-gray-300`}>{risk}</span>;
  }
}

function isOverdue(dateStr: string | null): boolean {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

export default function ClientsTable({ clients, onSelectClient }: ClientsTableProps) {
  const [search, setSearch] = useState('');
  const [filterRegulation, setFilterRegulation] = useState('All');
  const [filterRisk, setFilterRisk] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortDir, setSortDir] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Unique statuses for filter dropdown
  const uniqueStatuses = useMemo(
    () => Array.from(new Set(clients.map((c) => c.status).filter(Boolean))).sort(),
    [clients],
  );

  // Pre-compute workflow stages
  const clientsWithStage = useMemo(
    () => clients.map((c) => ({ ...c, _workflowStage: getWorkflowStage(c) })),
    [clients],
  );

  // Filter
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return clientsWithStage.filter((c) => {
      if (filterRegulation !== 'All' && c.regulation !== filterRegulation) return false;
      if (filterRisk !== 'All' && c.riskRating !== filterRisk) return false;
      if (filterStatus !== 'All' && c.status !== filterStatus) return false;
      if (q) {
        const haystack = [
          c.code,
          c.regulation,
          c.status,
          c.prTeamMember ?? '',
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [clientsWithStage, search, filterRegulation, filterRisk, filterStatus]);

  // Sort
  const sorted = useMemo(() => {
    const copy = [...filtered];
    const dir = sortDir === 'asc' ? 1 : -1;

    copy.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'code':
          cmp = a.code.localeCompare(b.code);
          break;
        case 'regulation':
          cmp = a.regulation.localeCompare(b.regulation);
          break;
        case 'status':
          cmp = a.status.localeCompare(b.status);
          break;
        case 'riskRating':
          cmp = (RISK_ORDER[a.riskRating] ?? 0) - (RISK_ORDER[b.riskRating] ?? 0);
          break;
        case 'dueDate':
          cmp = (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999');
          break;
        case 'prTeamMember':
          cmp = (a.prTeamMember ?? '').localeCompare(b.prTeamMember ?? '');
          break;
        case 'prStatus':
          cmp = (a.prStatus ?? '').localeCompare(b.prStatus ?? '');
          break;
        case 'workflowStage':
          cmp = WORKFLOW_ORDER.indexOf(a._workflowStage) - WORKFLOW_ORDER.indexOf(b._workflowStage);
          break;
      }
      return cmp * dir;
    });

    return copy;
  }, [filtered, sortField, sortDir]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sorted.length / ROWS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * ROWS_PER_PAGE;
  const pageRows = sorted.slice(pageStart, pageStart + ROWS_PER_PAGE);

  // Reset page when filters change
  const handleSearch = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };
  const handleFilterRegulation = (val: string) => {
    setFilterRegulation(val);
    setCurrentPage(1);
  };
  const handleFilterRisk = (val: string) => {
    setFilterRisk(val);
    setCurrentPage(1);
  };
  const handleFilterStatus = (val: string) => {
    setFilterStatus(val);
    setCurrentPage(1);
  };

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 ml-1 opacity-40" />;
    }
    return sortDir === 'asc' ? (
      <ChevronUp className="w-3.5 h-3.5 ml-1 text-blue-400" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 ml-1 text-blue-400" />
    );
  }

  const selectClasses =
    'bg-navy-800 text-white border border-navy-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer';

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by code, regulation, status, or team member..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-navy-800 border border-navy-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
      </div>

      {/* Filter dropdowns row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <Filter className="w-4 h-4" />
          <span>Filters:</span>
        </div>

        <select
          value={filterRegulation}
          onChange={(e) => handleFilterRegulation(e.target.value)}
          className={selectClasses}
        >
          <option value="All">Regulation: All</option>
          <option value="WWFT">WWFT</option>
          <option value="WTT">WTT</option>
          <option value="COSEC">COSEC</option>
          <option value="REMIT">REMIT</option>
        </select>

        <select
          value={filterRisk}
          onChange={(e) => handleFilterRisk(e.target.value)}
          className={selectClasses}
        >
          <option value="All">Risk Rating: All</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => handleFilterStatus(e.target.value)}
          className={selectClasses}
        >
          <option value="All">Status: All</option>
          {uniqueStatuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <div className="ml-auto text-sm text-gray-400">
          Showing {sorted.length} of {clients.length} clients
        </div>
      </div>

      {/* Table */}
      <div className="bg-navy-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-navy-900 sticky top-0 z-10">
              <tr>
                {(
                  [
                    ['code', 'Code'],
                    ['regulation', 'Regulation'],
                    ['status', 'Status'],
                    ['riskRating', 'Risk Rating'],
                    ['dueDate', 'Due Date'],
                    ['prTeamMember', 'PR Team Member'],
                    ['prStatus', 'PR Status'],
                    ['workflowStage', 'Workflow Stage'],
                  ] as [SortField, string][]
                ).map(([field, label]) => (
                  <th
                    key={field}
                    onClick={() => handleSort(field)}
                    className="px-4 py-3 uppercase text-xs text-gray-400 font-semibold tracking-wider cursor-pointer select-none hover:text-gray-200 transition-colors whitespace-nowrap"
                  >
                    <div className="flex items-center">
                      {label}
                      <SortIcon field={field} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                    No clients match the current filters.
                  </td>
                </tr>
              ) : (
                pageRows.map((client, idx) => {
                  const overdue = isOverdue(client.dueDate) && !client.dateReviewComplete && !client.signedOffAndArchivedDate;
                  return (
                    <tr
                      key={client.code}
                      onClick={() => onSelectClient(client.code)}
                      className={`cursor-pointer border-t border-navy-700/50 transition-colors hover:bg-navy-700 ${
                        idx % 2 === 0 ? 'bg-navy-900' : 'bg-navy-850'
                      }`}
                    >
                      <td className="px-4 py-3 font-medium text-white whitespace-nowrap">
                        {client.code}
                      </td>
                      <td className="px-4 py-3 text-gray-300 whitespace-nowrap">
                        {client.regulation}
                      </td>
                      <td className="px-4 py-3 text-gray-300 whitespace-nowrap">
                        {client.status}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {riskBadge(client.riskRating)}
                      </td>
                      <td
                        className={`px-4 py-3 whitespace-nowrap ${
                          overdue ? 'text-red-400 font-medium' : 'text-gray-300'
                        }`}
                      >
                        {client.dueDate ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-300 whitespace-nowrap">
                        {client.prTeamMember ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-300 whitespace-nowrap">
                        {client.prStatus ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-300 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-navy-700 text-gray-300 text-xs">
                          {client._workflowStage}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-navy-700/50">
            <span className="text-sm text-gray-400">
              Page {safePage} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="px-4 py-1.5 text-sm rounded-lg bg-navy-700 text-gray-300 hover:bg-navy-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="px-4 py-1.5 text-sm rounded-lg bg-navy-700 text-gray-300 hover:bg-navy-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
