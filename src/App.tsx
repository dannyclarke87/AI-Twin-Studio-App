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
          let currentUserStatus: AuthState = 'unpaid';

          if (!userSnap.exists()) {
            const isDefaultAdmin = firebaseUser.email === 'danny@easypeasybusiness.com';
            
            // Check if user was pre-added by email and migrate them
            const emailDocRef = doc(db, 'users', firebaseUser.email.toLowerCase());
            let statusToSet: AuthState = isDefaultAdmin ? 'admin' : 'unpaid';
            
            let hasLegacyData = false;
            try {
              const emailDocSnap = await getDoc(emailDocRef);
              if (emailDocSnap.exists()) {
                const legacyData = emailDocSnap.data() as User;
                statusToSet = legacyData.status;
                hasLegacyData = true;
              }
            } catch (e) {
              console.error('Failed to check pre-approved user:', e);
            }
            
            currentUserStatus = statusToSet;
            await setDoc(userRef, {
              email: firebaseUser.email,
              status: currentUserStatus,
              createdAt: serverTimestamp(),
            });
            
            if (hasLegacyData) {
              try {
                await deleteDoc(emailDocRef);
              } catch (e) {
                console.error('Failed to delete legacy email doc', e);
              }
            }
            setAuthState(currentUserStatus);
          } else {
            const userData = userSnap.data() as User;
            currentUserStatus = userData.status;
            setAuthState(currentUserStatus);
          }

          // Handle successful Stripe payment redirect
          const urlParams = new URLSearchParams(window.location.search);
          const sessionId = urlParams.get('session_id');
          if (sessionId && currentUserStatus === 'unpaid') {
            try {
              const res = await fetch('/api/verify-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId })
              });
              const data = await res.json();
              if (data.success && data.userId === firebaseUser.uid) {
                 await updateDoc(userRef, {
                    status: 'paid',
                    updatedAt: serverTimestamp()
                 });
                 setAuthState('paid');
                 // Remove session_id from URL to prevent re-verifying
                 window.history.replaceState({}, document.title, window.location.pathname);
              }
            } catch (err) {
              console.error('Failed to verify session', err);
            }
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
            const res = await fetch('/api/create-checkout-session', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ userId: auth.currentUser.uid })
            });

            if (!res.ok) {
               const errData = await res.json();
               throw new Error(errData.error || 'Failed to create checkout session');
            }

            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (err) {
            console.error("Upgrade error:", err);
            alert("Payment setup is incomplete. Ensure STRIPE_SECRET_KEY is set in your environment.");
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
      
      {(authState === 'paid' || authState === 'legacy' || (authState === 'admin' && viewState === 'dashboard')) && (
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

