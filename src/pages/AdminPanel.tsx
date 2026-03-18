import { useState } from 'react';
import { Users, UserPlus, Trash2, ShieldCheck, ShieldOff } from 'lucide-react';
import type { User } from '../types';
import { getDemoUsers } from '../utils/auth';

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>(getDemoUsers);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const addUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;
    const newUser: User = {
      id: Date.now(),
      email: newEmail,
      name: newName,
      role: 'user',
      created_at: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, newUser]);
    setNewName('');
    setNewEmail('');
    setShowAddForm(false);
  };

  const toggleRole = (id: number) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, role: u.role === 'admin' ? 'user' : 'admin' } : u
      )
    );
  };

  const deleteUser = (id: number) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">User Management</h2>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition text-sm font-medium"
        >
          <UserPlus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={addUser} className="bg-navy-800 rounded-xl p-6 border border-navy-700">
          <h3 className="text-lg font-semibold text-white mb-4">Add New User</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Name</label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 bg-navy-900 border border-navy-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Full name"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full px-3 py-2 bg-navy-900 border border-navy-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="email@silverbacking.com"
                required
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition text-sm">
              Create User
            </button>
            <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-navy-700 hover:bg-navy-600 text-gray-300 rounded-lg transition text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-navy-800 rounded-xl overflow-hidden border border-navy-700">
        <table className="w-full">
          <thead>
            <tr className="bg-navy-900">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">User</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Role</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Created</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-700">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-navy-700/50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 text-sm font-medium">
                      {user.name.charAt(0)}
                    </div>
                    <span className="text-white font-medium">{user.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-400 text-sm">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.role === 'admin'
                      ? 'bg-purple-500/20 text-purple-300'
                      : 'bg-gray-500/20 text-gray-300'
                  }`}>
                    {user.role === 'admin' ? <ShieldCheck className="w-3 h-3" /> : null}
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500 text-sm">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => toggleRole(user.id)}
                      className="p-1.5 rounded-lg hover:bg-navy-600 text-gray-400 hover:text-blue-400 transition"
                      title={user.role === 'admin' ? 'Remove admin' : 'Make admin'}
                    >
                      {user.role === 'admin' ? <ShieldOff className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="p-1.5 rounded-lg hover:bg-navy-600 text-gray-400 hover:text-red-400 transition"
                      title="Delete user"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
