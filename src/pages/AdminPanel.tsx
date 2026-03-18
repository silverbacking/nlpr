import { useState } from 'react';
import { Users, UserPlus, Trash2, ShieldCheck, ShieldOff, Key, AlertCircle } from 'lucide-react';
import type { User } from '../types';
import { getUsers, addUser, deleteUser, toggleUserRole, changeUserPassword } from '../utils/auth';

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>(getUsers);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'user' | 'admin'>('user');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [changingPassword, setChangingPassword] = useState<number | null>(null);
  const [tempPassword, setTempPassword] = useState('');

  const refresh = () => setUsers(getUsers());

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      addUser(newName, newEmail, newPassword, newRole);
      refresh();
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      setNewRole('user');
      setShowAddForm(false);
      setSuccess('User created successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleToggleRole = (id: number) => {
    toggleUserRole(id);
    refresh();
  };

  const handleDelete = (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      deleteUser(id);
      refresh();
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleChangePassword = (id: number) => {
    if (!tempPassword || tempPassword.length < 4) {
      setError('Password must be at least 4 characters');
      setTimeout(() => setError(''), 3000);
      return;
    }
    changeUserPassword(id, tempPassword);
    setChangingPassword(null);
    setTempPassword('');
    setSuccess('Password updated');
    setTimeout(() => setSuccess(''), 3000);
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

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
          <ShieldCheck className="w-4 h-4 flex-shrink-0" />
          {success}
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleAddUser} className="bg-navy-800 rounded-xl p-6 border border-navy-700">
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
                placeholder="email@company.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 bg-navy-900 border border-navy-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                minLength={4}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as 'user' | 'admin')}
                className="w-full px-3 py-2 bg-navy-900 border border-navy-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
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
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    {changingPassword === user.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="password"
                          value={tempPassword}
                          onChange={(e) => setTempPassword(e.target.value)}
                          placeholder="New password"
                          className="px-2 py-1 bg-navy-900 border border-navy-600 rounded text-white text-sm w-32 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          autoFocus
                        />
                        <button
                          onClick={() => handleChangePassword(user.id)}
                          className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => { setChangingPassword(null); setTempPassword(''); }}
                          className="px-2 py-1 bg-navy-700 hover:bg-navy-600 text-gray-300 rounded text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => setChangingPassword(user.id)}
                          className="p-1.5 rounded-lg hover:bg-navy-600 text-gray-400 hover:text-yellow-400 transition"
                          title="Change password"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleRole(user.id)}
                          className="p-1.5 rounded-lg hover:bg-navy-600 text-gray-400 hover:text-blue-400 transition"
                          title={user.role === 'admin' ? 'Remove admin' : 'Make admin'}
                        >
                          {user.role === 'admin' ? <ShieldOff className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-1.5 rounded-lg hover:bg-navy-600 text-gray-400 hover:text-red-400 transition"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
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
