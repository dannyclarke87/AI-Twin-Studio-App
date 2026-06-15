/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { handleFirestoreError, OperationType } from './utils/firebaseErrors';
import { AuthState, User } from './types';
import { AuthScreen } from './components/AuthScreen';
import { PaywallScreen } from './components/PaywallScreen';
import { DashboardScreen } from './components/DashboardScreen';
import { SettingsModal } from './components/SettingsModal';
import { AdminScreen } from './components/AdminScreen';

export default function App() {
  const [authState, setAuthState] = useState<AuthState>('logged-out');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewState, setViewState] = useState<'dashboard' | 'admin'>('admin');

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && firebaseUser.email) {
        setCurrentUserEmail(firebaseUser.email);
        
        // Listen to user document in Firestore
        const userRef = doc(db, 'users', firebaseUser.uid);
        
        // Check if user exists first
        try {
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            const isDefaultAdmin = firebaseUser.email === 'danny@easypeasybusiness.com';
            await setDoc(userRef, {
              email: firebaseUser.email,
              status: isDefaultAdmin ? 'admin' : 'unpaid',
              createdAt: serverTimestamp(),
            });
            setAuthState(isDefaultAdmin ? 'admin' : 'unpaid');
          } else {
            const userData = userSnap.data() as User;
            setAuthState(userData.status);
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, `users/${firebaseUser.uid}`);
        }

        // Setup real-time listener for status changes
        const unsubscribeSnapshot = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data() as User;
                setAuthState(data.status);
            }
        }, (error) => {
            handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
        });

        setLoading(false);
        return () => unsubscribeSnapshot();
      } else {
        setCurrentUserEmail(null);
        setAuthState('logged-out');
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const handleLogin = (email: string) => {
    // Auth object listener handles the logic
  };

  const handleUpgrade = async () => {
    if (auth.currentUser) {
        try {
            const userRef = doc(db, 'users', auth.currentUser.uid);
            await updateDoc(userRef, {
                status: 'paid',
                updatedAt: serverTimestamp()
            });
        } catch (err) {
           handleFirestoreError(err, OperationType.UPDATE, `users/${auth.currentUser.uid}`);
        }
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (loading) {
     return <div className="min-h-[100dvh] bg-zinc-950 flex items-center justify-center"><div className="text-zinc-500">Loading...</div></div>;
  }

  return (
    <>
      {authState === 'logged-out' && (
        <AuthScreen onLogin={handleLogin} />
      )}
      
      {authState === 'unpaid' && (
        <PaywallScreen onUpgrade={handleUpgrade} onLogout={handleLogout} />
      )}
      
      {(authState === 'paid' || (authState === 'admin' && viewState === 'dashboard')) && (
        <DashboardScreen 
          onLogout={handleLogout} 
          onOpenSettings={() => setIsSettingsOpen(true)}
          isAdmin={authState === 'admin'}
          onOpenAdmin={() => setViewState('admin')}
        />
      )}

      {authState === 'admin' && viewState === 'admin' && (
        <AdminScreen 
          onLogout={handleLogout} 
          onExit={() => setViewState('dashboard')} 
        />
      )}

      {isSettingsOpen && (
        <SettingsModal onClose={() => setIsSettingsOpen(false)} />
      )}
    </>
  );
}

