import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Mail,
  GitBranch,
  Settings,
  LogOut,
  Upload,
  Download,
  Shield,
  Menu,
  X,
} from 'lucide-react';
import { useState, useRef } from 'react';
import type { User, Client } from '../types';
import { parseClientsSheet, exportToExcel } from '../utils/parseExcel';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
  clients: Client[];
  onDataLoaded: (clients: Client[]) => void;
}

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/clients', icon: Users, label: 'Clients' },
  { to: '/inbox', icon: Mail, label: 'Inbox / Outbox' },
  { to: '/workflow', icon: GitBranch, label: 'PR Workflow' },
];

export default function Layout({ children, user, onLogout, clients, onDataLoaded }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadSuccess(null);
    try {
      const buffer = await file.arrayBuffer();
      const parsed = parseClientsSheet(buffer);
      onDataLoaded(parsed);
      setUploadSuccess(`✅ Loaded ${parsed.length} clients from "${file.name}"`);
      setTimeout(() => setUploadSuccess(null), 5000);
    } catch (err) {
      alert('Error parsing Excel file. Please ensure it contains a "Clients" sheet.');
    } finally {
      setUploading(false);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExport = () => {
    if (clients.length === 0) {
      alert('No data to export. Please upload an Excel file first.');
      return;
    }
    exportToExcel(clients);
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
      isActive
        ? 'bg-blue-600/20 text-blue-400'
        : 'text-gray-400 hover:bg-navy-700 hover:text-white'
    }`;

  return (
    <div className="flex h-screen overflow-hidden bg-navy-950">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-navy-900 border-r border-navy-700 flex flex-col transform transition-transform lg:transform-none ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-navy-700">
          <div className="w-9 h-9 rounded-xl bg-blue-600/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">NLPR</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Periodic Review</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={linkClass}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}

          {user.role === 'admin' && (
            <NavLink to="/admin" className={linkClass} onClick={() => setSidebarOpen(false)}>
              <Settings className="w-4 h-4" />
              Admin
            </NavLink>
          )}

          <div className="pt-4 mt-4 border-t border-navy-700">
            <p className="px-4 mb-2 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Data</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-navy-700 hover:text-white transition"
            >
              {uploading ? (
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {uploading ? 'Loading...' : 'Upload Excel'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleUpload}
              className="hidden"
            />
            <button
              onClick={handleExport}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-navy-700 hover:text-white transition"
            >
              <Download className="w-4 h-4" />
              Export Excel
            </button>
          </div>
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-navy-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 text-sm font-medium">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
            <button onClick={onLogout} className="p-1.5 rounded-lg hover:bg-navy-700 text-gray-400 hover:text-red-400 transition" title="Sign out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-navy-900 border-b border-navy-700">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-400">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-white font-bold">NLPR</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {clients.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 rounded-2xl bg-navy-800 flex items-center justify-center mb-4">
                <Upload className="w-10 h-10 text-gray-600" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">No Data Loaded</h2>
              <p className="text-gray-400 mb-6 max-w-md">
                Upload the Excel file containing client data to get started. The file should contain a &quot;Clients&quot; sheet with periodic review information.
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition font-medium"
              >
                <Upload className="w-4 h-4" />
                Upload Excel File
              </button>
            </div>
          ) : (
            children
          )}
        </main>
      </div>

      {/* Upload success toast */}
      {uploadSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-green-600/90 backdrop-blur text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-up">
          <span className="text-sm font-medium">{uploadSuccess}</span>
          <button
            onClick={() => setUploadSuccess(null)}
            className="text-white/70 hover:text-white text-lg leading-none"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
