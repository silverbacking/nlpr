import { useMemo } from 'react';
import type { Client, Activity } from '../types';
import { computeKPIs, getAlerts, generateActivities } from '../utils/simulateData';
import {
  Users,
  AlertTriangle,
  Shield,
  CheckCircle,
  Clock,
  Mail,
  FileCheck,
  UserCheck,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatDistanceToNow } from 'date-fns';

const REGULATION_COLORS: Record<string, string> = {
  WWFT: '#3b82f6',
  WTT: '#8b5cf6',
  COSEC: '#10b981',
  REMIT: '#f59e0b',
};

const RISK_COLORS: Record<string, string> = {
  Low: '#10b981',
  Medium: '#f59e0b',
  High: '#ef4444',
};

function getActivityIcon(type: Activity['type']) {
  switch (type) {
    case 'email_sent':
      return <Mail className="w-4 h-4 text-blue-400" />;
    case 'review_completed':
      return <FileCheck className="w-4 h-4 text-green-400" />;
    case 'sign_off':
      return <UserCheck className="w-4 h-4 text-purple-400" />;
    default:
      return <CheckCircle className="w-4 h-4 text-gray-400" />;
  }
}

export default function Dashboard({ clients }: { clients: Client[] }) {
  const kpis = useMemo(() => computeKPIs(clients), [clients]);
  const alerts = useMemo(() => getAlerts(clients), [clients]);
  const activities = useMemo(() => generateActivities(clients).slice(0, 15), [clients]);

  const regulationData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of clients) {
      const reg = c.regulation || 'Unknown';
      counts[reg] = (counts[reg] || 0) + 1;
    }
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [clients]);

  const riskData = useMemo(() => {
    const counts: Record<string, number> = { Low: 0, Medium: 0, High: 0 };
    for (const c of clients) {
      if (counts[c.riskRating] !== undefined) {
        counts[c.riskRating]++;
      }
    }
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [clients]);

  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-navy-800 rounded-xl p-6 hover:bg-navy-700 transition">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-6 h-6 text-blue-400" />
            <span className="text-sm text-gray-400">Total Clients</span>
          </div>
          <p className="text-3xl font-bold text-white">{kpis.totalClients}</p>
        </div>

        <div className="bg-navy-800 rounded-xl p-6 hover:bg-navy-700 transition">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <span className="text-sm text-gray-400">Delayed PRs</span>
          </div>
          <p className="text-3xl font-bold text-white">{kpis.delayedPRs}</p>
        </div>

        <div className="bg-navy-800 rounded-xl p-6 hover:bg-navy-700 transition">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-6 h-6 text-amber-400" />
            <span className="text-sm text-gray-400">High Risk Clients</span>
          </div>
          <p className="text-3xl font-bold text-white">{kpis.highRiskClients}</p>
        </div>

        <div className="bg-navy-800 rounded-xl p-6 hover:bg-navy-700 transition">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <span className="text-sm text-gray-400">PRs Completed This Month</span>
          </div>
          <p className="text-3xl font-bold text-white">{kpis.prsCompletedThisMonth}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut Chart - Clients by Regulation */}
        <div className="bg-navy-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Clients by Regulation</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={regulationData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
                nameKey="name"
                paddingAngle={2}
              >
                {regulationData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={REGULATION_COLORS[entry.name] || '#6b7280'}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a2847',
                  border: '1px solid #263c6b',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Legend
                wrapperStyle={{ color: '#d1d5db' }}
                formatter={(value: string) => (
                  <span className="text-gray-300">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart - Risk Rating Distribution */}
        <div className="bg-navy-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Risk Rating Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={riskData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#263c6b" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a2847',
                  border: '1px solid #263c6b',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {riskData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={RISK_COLORS[entry.name] || '#6b7280'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row: Alerts + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts Panel */}
        <div className="lg:col-span-2 bg-navy-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-semibold text-white">Alerts</h3>
          </div>

          <div className="space-y-3">
            {/* Critical */}
            <div className="bg-navy-900 rounded-lg p-4 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-400">
                    Critical - Overdue &gt; 6 months
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {alerts.critical.length} client{alerts.critical.length !== 1 ? 's' : ''}
                    {alerts.critical.length > 0 && (
                      <span className="ml-2 text-gray-500">
                        {alerts.critical
                          .slice(0, 3)
                          .map((c) => c.code)
                          .join(', ')}
                        {alerts.critical.length > 3 && ` +${alerts.critical.length - 3} more`}
                      </span>
                    )}
                  </p>
                </div>
                <span className="text-2xl font-bold text-red-400">
                  {alerts.critical.length}
                </span>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-navy-900 rounded-lg p-4 border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-400">
                    Warning - Overdue &gt; 3 months
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {alerts.warning.length} client{alerts.warning.length !== 1 ? 's' : ''}
                    {alerts.warning.length > 0 && (
                      <span className="ml-2 text-gray-500">
                        {alerts.warning
                          .slice(0, 3)
                          .map((c) => c.code)
                          .join(', ')}
                        {alerts.warning.length > 3 && ` +${alerts.warning.length - 3} more`}
                      </span>
                    )}
                  </p>
                </div>
                <span className="text-2xl font-bold text-orange-400">
                  {alerts.warning.length}
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="bg-navy-900 rounded-lg p-4 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-400">
                    Due in next 30 days
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {alerts.info.length} client{alerts.info.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <span className="text-2xl font-bold text-blue-400">
                  {alerts.info.length}
                </span>
              </div>
            </div>

            {/* High Risk No Review */}
            <div className="bg-navy-900 rounded-lg p-4 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-400">
                    High risk without recent review
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {alerts.highRiskNoReview.length} client{alerts.highRiskNoReview.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <span className="text-2xl font-bold text-yellow-400">
                  {alerts.highRiskNoReview.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-navy-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[400px]">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-navy-700 transition"
              >
                <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-300 truncate">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formatDistanceToNow(new Date(activity.timestamp), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            ))}
            {activities.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No recent activity
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
