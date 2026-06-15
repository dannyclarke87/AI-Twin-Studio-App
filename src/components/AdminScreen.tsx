import React, { useState, useEffect } from 'react';
import { collection, doc, deleteDoc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/firebaseErrors';
import { User } from '../types';
import { LogOut, Trash2, Edit2, Check, X, LayoutGrid } from 'lucide-react';

interface AdminScreenProps {
  onLogout: () => void;
  onExit: () => void;
}

export function AdminScreen({ onLogout, onExit }: AdminScreenProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<'unpaid' | 'paid' | 'admin'>('unpaid');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      const fetchedUsers: User[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        fetchedUsers.push({
          id: doc.id,
          email: data.email,
          status: data.status,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString()
        });
      });
      setUsers(fetchedUsers);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'users');
    });

    return () => unsub();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
        await deleteDoc(doc(db, 'users', id));
    } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `users/${id}`);
    }
  };

  const startEdit = (user: User) => {
    setEditingId(user.id);
    setEditStatus(user.status);
  };

  const saveEdit = async (id: string) => {
    try {
        await updateDoc(doc(db, 'users', id), {
            status: editStatus,
            updatedAt: serverTimestamp()
        });
        setEditingId(null);
    } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${id}`);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  return (
    <div className="min-h-[100dvh] bg-zinc-950 flex flex-col font-sans text-zinc-100">
      {/* Top Bar */}
      <div className="px-8 py-6 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between shadow-sm flex-shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#dcfb80] uppercase leading-none mb-1">
            Admin Panel
          </h1>
          <p className="text-sm text-zinc-400">Manage user registrations</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onExit}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-zinc-800 text-zinc-100 hover:bg-zinc-700 transition-colors"
          >
            <LayoutGrid size={18} />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-zinc-400 hover:text-[#ff6b6b] hover:bg-zinc-800 transition-colors"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Log Out</span>
          </button>
        </div>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-4 text-sm">{error}</div>}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-zinc-950 border-b border-zinc-800 uppercase tracking-wider text-xs font-semibold text-zinc-500">
                  <tr>
                    <th className="px-6 py-4">UID</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Created At</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                        No users registered yet.
                      </td>
                    </tr>
                  ) : (
                    users.map(user => (
                      <tr key={user.id} className="hover:bg-zinc-800/50 transition-colors group">
                        <td className="px-6 py-4 text-zinc-400 font-mono text-xs">{user.id}</td>
                        <td className="px-6 py-4 font-medium">{user.email}</td>
                        <td className="px-6 py-4">
                          {editingId === user.id ? (
                            <select 
                              value={editStatus}
                              onChange={(e) => setEditStatus(e.target.value as any)}
                              className="bg-zinc-950 border border-zinc-700 text-zinc-100 text-sm rounded-md focus:ring-[#dcfb80] focus:border-[#dcfb80] block w-full p-2"
                            >
                              <option value="unpaid">Unpaid</option>
                              <option value="paid">Paid</option>
                              <option value="admin">Admin</option>
                            </select>
                          ) : (
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide
                              ${user.status === 'paid' ? 'bg-[#dcfb80]/10 text-[#dcfb80] border border-[#dcfb80]/20' : 
                                user.status === 'admin' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                                'bg-red-500/10 text-red-400 border border-red-500/20'}
                            `}>
                              {user.status}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-zinc-400">
                          {new Date(user.createdAt).toLocaleDateString()} {new Date(user.createdAt).toLocaleTimeString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {editingId === user.id ? (
                            <div className="flex justify-end gap-2">
                              <button onClick={() => saveEdit(user.id)} className="p-1.5 text-green-400 hover:bg-green-400/10 rounded transition-colors" title="Save">
                                <Check size={18} />
                              </button>
                              <button onClick={cancelEdit} className="p-1.5 text-zinc-400 hover:bg-zinc-700 rounded transition-colors" title="Cancel">
                                <X size={18} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => startEdit(user)} className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-colors" title="Edit Status">
                                <Edit2 size={18} />
                              </button>
                              <button onClick={() => handleDelete(user.id)} className="p-1.5 text-zinc-400 hover:text-[#ff6b6b] hover:bg-red-500/10 rounded transition-colors" title="Delete User">
                                <Trash2 size={18} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
