import { useState, useMemo } from 'react';
import type { SimulatedEmail } from '../types';
import {
  Mail,
  Send,
  Inbox as InboxIcon,
  Filter,
  Search,
  Eye,
  Reply,
  Clock,
  AlertCircle,
} from 'lucide-react';

type TabFilter = 'All' | 'Inbox' | 'Outbox';

const STATUS_CONFIG: Record<
  SimulatedEmail['status'],
  { label: string; bg: string; text: string }
> = {
  sent: { label: 'Sent', bg: 'bg-gray-700', text: 'text-gray-300' },
  delivered: { label: 'Delivered', bg: 'bg-blue-900/60', text: 'text-blue-300' },
  read: { label: 'Read', bg: 'bg-green-900/60', text: 'text-green-300' },
  replied: { label: 'Replied', bg: 'bg-emerald-900/60', text: 'text-emerald-300' },
  no_response: { label: 'No Response', bg: 'bg-red-900/60', text: 'text-red-300' },
};

const STATUS_ICONS: Record<SimulatedEmail['status'], React.ReactNode> = {
  sent: <Send className="w-3 h-3" />,
  delivered: <Mail className="w-3 h-3" />,
  read: <Eye className="w-3 h-3" />,
  replied: <Reply className="w-3 h-3" />,
  no_response: <AlertCircle className="w-3 h-3" />,
};

const CATEGORY_LABELS: Record<SimulatedEmail['category'], string> = {
  reconfirmation: 'Reconfirmation',
  reminder: 'Reminder',
  response: 'Response',
  follow_up: 'Follow-up',
};

const EMAILS_PER_PAGE = 20;

export default function Inbox({ emails }: { emails: SimulatedEmail[] }) {
  const [activeTab, setActiveTab] = useState<TabFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Sort emails by date descending
  const sortedEmails = useMemo(
    () => [...emails].sort((a, b) => b.date.localeCompare(a.date)),
    [emails],
  );

  // Filter by tab
  const tabFiltered = useMemo(() => {
    if (activeTab === 'Inbox') return sortedEmails.filter((e) => e.type === 'inbox');
    if (activeTab === 'Outbox') return sortedEmails.filter((e) => e.type === 'outbox');
    return sortedEmails;
  }, [sortedEmails, activeTab]);

  // Filter by search query
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return tabFiltered;
    const q = searchQuery.toLowerCase();
    return tabFiltered.filter(
      (e) =>
        e.subject.toLowerCase().includes(q) ||
        e.clientCode.toLowerCase().includes(q) ||
        e.from.toLowerCase().includes(q) ||
        e.to.toLowerCase().includes(q),
    );
  }, [tabFiltered, searchQuery]);

  // Stats computed from the full (tab-filtered, search-filtered) set
  const stats = useMemo(() => {
    const s = { total: filtered.length, sent: 0, delivered: 0, read: 0, replied: 0, no_response: 0 };
    for (const e of filtered) {
      s[e.status]++;
    }
    return s;
  }, [filtered]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / EMAILS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedEmails = filtered.slice(
    (safeCurrentPage - 1) * EMAILS_PER_PAGE,
    safeCurrentPage * EMAILS_PER_PAGE,
  );

  // Reset page when filters change
  const handleTabChange = (tab: TabFilter) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const tabs: { label: TabFilter; icon: React.ReactNode }[] = [
    { label: 'All', icon: <Mail className="w-4 h-4" /> },
    { label: 'Inbox', icon: <InboxIcon className="w-4 h-4" /> },
    { label: 'Outbox', icon: <Send className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Mail className="w-6 h-6 text-blue-400" />
        <h2 className="text-xl font-bold text-white">Email Inbox / Outbox</h2>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            onClick={() => handleTabChange(tab.label)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === tab.label
                ? 'bg-blue-600 text-white'
                : 'bg-navy-800 text-gray-400 hover:bg-navy-700 hover:text-gray-200'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search by subject, client code, from or to..."
          className="w-full bg-navy-800 border border-navy-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
        />
        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
      </div>

      {/* Stats bar */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-1.5 text-xs bg-navy-800 rounded-full px-3 py-1.5 text-gray-300">
          <Mail className="w-3 h-3" />
          Total: <span className="font-semibold text-white">{stats.total}</span>
        </span>
        <span className="flex items-center gap-1.5 text-xs bg-navy-800 rounded-full px-3 py-1.5 text-gray-400">
          <Send className="w-3 h-3" />
          Sent: <span className="font-semibold text-gray-200">{stats.sent}</span>
        </span>
        <span className="flex items-center gap-1.5 text-xs bg-navy-800 rounded-full px-3 py-1.5 text-blue-400">
          <Mail className="w-3 h-3" />
          Delivered: <span className="font-semibold text-blue-300">{stats.delivered}</span>
        </span>
        <span className="flex items-center gap-1.5 text-xs bg-navy-800 rounded-full px-3 py-1.5 text-green-400">
          <Eye className="w-3 h-3" />
          Read: <span className="font-semibold text-green-300">{stats.read}</span>
        </span>
        <span className="flex items-center gap-1.5 text-xs bg-navy-800 rounded-full px-3 py-1.5 text-emerald-400">
          <Reply className="w-3 h-3" />
          Replied: <span className="font-semibold text-emerald-300">{stats.replied}</span>
        </span>
        <span className="flex items-center gap-1.5 text-xs bg-navy-800 rounded-full px-3 py-1.5 text-red-400">
          <AlertCircle className="w-3 h-3" />
          No Response: <span className="font-semibold text-red-300">{stats.no_response}</span>
        </span>
      </div>

      {/* Email list */}
      <div className="space-y-2">
        {paginatedEmails.length === 0 && (
          <div className="bg-navy-800 rounded-lg p-8 text-center">
            <Mail className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No emails found</p>
          </div>
        )}

        {paginatedEmails.map((email) => {
          const isExpanded = expandedId === email.id;
          const statusCfg = STATUS_CONFIG[email.status];

          return (
            <div
              key={email.id}
              className="bg-navy-800 rounded-lg p-4 mb-2 cursor-pointer hover:bg-navy-700 transition"
              onClick={() => setExpandedId(isExpanded ? null : email.id)}
            >
              {/* Email card header */}
              <div className="flex items-start gap-3">
                {/* Direction icon */}
                <div className="mt-1 flex-shrink-0">
                  {email.type === 'outbox' ? (
                    <Send className="w-5 h-5 text-blue-400" />
                  ) : (
                    <InboxIcon className="w-5 h-5 text-green-400" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-white truncate">
                      {email.subject}
                    </h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Category badge */}
                      <span className="text-[10px] bg-navy-900 text-gray-500 rounded px-2 py-0.5">
                        {CATEGORY_LABELS[email.category]}
                      </span>
                      {/* Status badge */}
                      <span
                        className={`flex items-center gap-1 text-xs rounded-full px-2.5 py-0.5 ${statusCfg.bg} ${statusCfg.text}`}
                      >
                        {STATUS_ICONS[email.status]}
                        {statusCfg.label}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                    <span className="truncate">
                      {email.from} <span className="text-gray-600">-&gt;</span> {email.to}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {email.date}
                    <span className="ml-2 text-gray-600">|</span>
                    <span className="text-gray-500">{email.clientCode}</span>
                  </div>
                </div>
              </div>

              {/* Expanded body */}
              {isExpanded && (
                <div className="mt-4 bg-navy-900 rounded p-4">
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
                    {email.body}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-gray-500">
            Showing {(safeCurrentPage - 1) * EMAILS_PER_PAGE + 1}-
            {Math.min(safeCurrentPage * EMAILS_PER_PAGE, filtered.length)} of{' '}
            {filtered.length} emails
          </p>
          <div className="flex items-center gap-1">
            <button
              disabled={safeCurrentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 text-xs rounded-lg bg-navy-800 text-gray-400 hover:bg-navy-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => {
                // Show first, last, and pages around current
                if (page === 1 || page === totalPages) return true;
                if (Math.abs(page - safeCurrentPage) <= 1) return true;
                return false;
              })
              .reduce<(number | 'ellipsis')[]>((acc, page, idx, arr) => {
                if (idx > 0 && page - (arr[idx - 1] as number) > 1) {
                  acc.push('ellipsis');
                }
                acc.push(page);
                return acc;
              }, [])
              .map((item, idx) =>
                item === 'ellipsis' ? (
                  <span key={`ellipsis-${idx}`} className="px-2 text-xs text-gray-600">
                    ...
                  </span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setCurrentPage(item)}
                    className={`px-3 py-1.5 text-xs rounded-lg transition ${
                      safeCurrentPage === item
                        ? 'bg-blue-600 text-white'
                        : 'bg-navy-800 text-gray-400 hover:bg-navy-700'
                    }`}
                  >
                    {item}
                  </button>
                ),
              )}
            <button
              disabled={safeCurrentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 text-xs rounded-lg bg-navy-800 text-gray-400 hover:bg-navy-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
