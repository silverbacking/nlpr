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

function loadClientsLocal(): Client[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveClientsLocal(clients: Client[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
}

async function loadClientsFromServer(): Promise<{ clients: Client[]; name: string | null }> {
  try {
    const res = await fetch('/api/clients');
    if (!res.ok) return { clients: [], name: null };
    const data = await res.json();
    return { clients: data.clients || [], name: data.name || null };
  } catch {
    return { clients: [], name: null };
  }
}

async function saveClientsToServer(clients: Client[], name: string, uploadedBy: string): Promise<void> {
  try {
    await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clients, name, uploadedBy }),
    });
  } catch {
    // Fallback: already saved to localStorage
  }
}

export default function App() {
  const [auth, setAuth] = useState<AuthState>(getStoredAuth);
  const [clients, setClients] = useState<Client[]>(loadClientsLocal);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const navigate = useNavigate();

  const emails = useMemo<SimulatedEmail[]>(() => {
    if (clients.length === 0) return [];
    return generateSimulatedEmails(clients);
  }, [clients]);

  // On login, try to load clients from server if local is empty
  useEffect(() => {
    if (auth.user && clients.length === 0) {
      setDataLoading(true);
      loadClientsFromServer().then(({ clients: serverClients }) => {
        if (serverClients.length > 0) {
          setClients(serverClients);
          saveClientsLocal(serverClients);
        }
      }).finally(() => setDataLoading(false));
    }
  }, [auth.user]);

  useEffect(() => {
    if (clients.length > 0) saveClientsLocal(clients);
  }, [clients]);

  const handleLogin = (newAuth: AuthState) => {
    setAuth(newAuth);
  };

  const handleLogout = () => {
    clearAuth();
    setAuth({ user: null, token: null });
  };

  const handleDataLoaded = (newClients: Client[], fileName?: string) => {
    setClients(newClients);
    setSelectedClient(null);
    // Save to server in background
    const name = fileName || 'Upload';
    const uploadedBy = auth.user?.email || 'unknown';
    saveClientsToServer(newClients, name, uploadedBy);
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
      dataLoading={dataLoading}
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
