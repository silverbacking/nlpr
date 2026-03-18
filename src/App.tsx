import { useState, useEffect, useMemo } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import type { Client, AuthState, SimulatedEmail } from './types';
import { getStoredAuth, clearAuth } from './utils/auth';
import { generateSimulatedEmails } from './utils/simulateData';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ClientsTable from './pages/ClientsTable';
import ClientDetail from './pages/ClientDetail';
import Inbox from './pages/Inbox';
import Workflow from './pages/Workflow';
import AdminPanel from './pages/AdminPanel';

const STORAGE_KEY = 'nlpr_clients';

function loadClients(): Client[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveClients(clients: Client[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
}

export default function App() {
  const [auth, setAuth] = useState<AuthState>(getStoredAuth);
  const [clients, setClients] = useState<Client[]>(loadClients);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const navigate = useNavigate();

  const emails = useMemo<SimulatedEmail[]>(() => {
    if (clients.length === 0) return [];
    return generateSimulatedEmails(clients);
  }, [clients]);

  useEffect(() => {
    if (clients.length > 0) saveClients(clients);
  }, [clients]);

  const handleLogin = (newAuth: AuthState) => {
    setAuth(newAuth);
  };

  const handleLogout = () => {
    clearAuth();
    setAuth({ user: null, token: null });
  };

  const handleDataLoaded = (newClients: Client[]) => {
    setClients(newClients);
    setSelectedClient(null);
  };

  const handleSelectClient = (code: string) => {
    setSelectedClient(code);
    navigate('/clients');
  };

  const handleBackFromDetail = () => {
    setSelectedClient(null);
  };

  if (!auth.user) {
    return <Login onLogin={handleLogin} />;
  }

  const selected = selectedClient ? clients.find((c) => c.code === selectedClient) : null;

  return (
    <Layout
      user={auth.user}
      onLogout={handleLogout}
      clients={clients}
      onDataLoaded={handleDataLoaded}
    >
      {selected ? (
        <ClientDetail
          client={selected}
          onBack={handleBackFromDetail}
          emails={emails.filter((e) => e.clientCode === selected.code)}
        />
      ) : (
        <Routes>
          <Route path="/" element={<Dashboard clients={clients} />} />
          <Route
            path="/clients"
            element={<ClientsTable clients={clients} onSelectClient={handleSelectClient} />}
          />
          <Route path="/inbox" element={<Inbox emails={emails} />} />
          <Route path="/workflow" element={<Workflow clients={clients} />} />
          {auth.user.role === 'admin' && (
            <Route path="/admin" element={<AdminPanel />} />
          )}
        </Routes>
      )}
    </Layout>
  );
}
