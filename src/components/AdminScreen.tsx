import React, { useState, useEffect } from 'react';
import { collection, doc, deleteDoc, updateDoc, onSnapshot, serverTimestamp, setDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/firebaseErrors';
import { User } from '../types';
import { LogOut, Trash2, Edit2, Check, X, LayoutGrid, Plus } from 'lucide-react';

interface AdminScreenProps {
  onLogout: () => void;
  onExit: () => void;
}

export function AdminScreen({ onLogout, onExit }: AdminScreenProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<'unpaid' | 'paid' | 'admin' | 'legacy'>('unpaid');
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

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserStatus, setNewUserStatus] = useState<'unpaid' | 'paid' | 'admin' | 'legacy'>('paid');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const confirmDelete = async (id: string) => {
    try {
        await deleteDoc(doc(db, 'users', id));
        setDeletingId(null);
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

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail.trim()) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const emailLower = newUserEmail.toLowerCase().trim();
      
      // Check if user already exists
      const q = query(collection(db, 'users'), where('email', '==', emailLower));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // User exists, just update their status
        const existingDoc = querySnapshot.docs[0];
        await updateDoc(doc(db, 'users', existingDoc.id), {
          status: newUserStatus,
          updatedAt: serverTimestamp()
        });
      } else {
        // User doesn't exist, create an email-based entry
        await setDoc(doc(db, 'users', emailLower), {
          email: emailLower,
          status: newUserStatus,
          createdAt: serverTimestamp()
        });
      }
      
      setIsAddingUser(false);
      setNewUserEmail('');
      setNewUserStatus('paid');
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to add user. Check console for details.');
    } finally {
      setIsSubmitting(false);
    }
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
          
          <div className="mb-6 flex justify-between items-center bg-zinc-900 border border-zinc-800 p-4 rounded-xl shadow-sm">
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">Registered Users</h2>
              <p className="text-sm text-zinc-400">Total: {users.length}</p>
            </div>
            
            {!isAddingUser ? (
              <button
                onClick={() => setIsAddingUser(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#dcfb80] text-zinc-900 rounded-md font-semibold text-sm hover:bg-[#cbe870] transition-colors"
              >
                <Plus size={16} />
                <span>Add User</span>
              </button>
            ) : (
              <form onSubmit={handleAddUser} className="flex items-center gap-3">
                <input
                  type="email"
                  placeholder="Email address"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="bg-zinc-950 border border-zinc-700 text-zinc-100 text-sm rounded-md px-3 py-2 w-64 focus:outline-none focus:border-[#dcfb80]"
                />
                <select
                  value={newUserStatus}
                  onChange={(e) => setNewUserStatus(e.target.value as any)}
                  className="bg-zinc-950 border border-zinc-700 text-zinc-100 text-sm rounded-md px-3 py-2 focus:outline-none focus:border-[#dcfb80]"
                >
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="legacy">Legacy</option>
                  <option value="admin">Admin</option>
                </select>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#dcfb80] text-zinc-900 rounded-md font-semibold text-sm hover:bg-[#cbe870] transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Adding...' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingUser(false)}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-md font-semibold text-sm hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
              </form>
            )}
          </div>

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
                              <option value="legacy">Legacy</option>
                              <option value="admin">Admin</option>
                            </select>
                          ) : (
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide
                              ${user.status === 'paid' ? 'bg-[#dcfb80]/10 text-[#dcfb80] border border-[#dcfb80]/20' : 
                                user.status === 'legacy' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
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
                          {deletingId === user.id ? (
                            <div className="flex justify-end gap-2 items-center">
                              <span className="text-xs text-red-400 font-medium">Delete?</span>
                              <button onClick={() => confirmDelete(user.id)} className="p-1.5 text-red-400 hover:bg-red-400/10 rounded transition-colors" title="Confirm Delete">
                                <Check size={18} />
                              </button>
                              <button onClick={() => setDeletingId(null)} className="p-1.5 text-zinc-400 hover:bg-zinc-700 rounded transition-colors" title="Cancel">
                                <X size={18} />
                              </button>
                            </div>
                          ) : editingId === user.id ? (
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
                              <button onClick={() => setDeletingId(user.id)} className="p-1.5 text-zinc-400 hover:text-[#ff6b6b] hover:bg-red-500/10 rounded transition-colors" title="Delete User">
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
