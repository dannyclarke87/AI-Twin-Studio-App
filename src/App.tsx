/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { handleFirestoreError, OperationType } from './utils/firebaseErrors';
import { AuthState, User } from './types';
import { AuthScreen } from './components/AuthScreen';
import { PaywallScreen } from './components/PaywallScreen';
import { SalesPage } from './components/SalesPage';
import { DashboardScreen } from './components/DashboardScreen';
import { SettingsModal } from './components/SettingsModal';
import { AdminScreen } from './components/AdminScreen';
import { GettingStartedScreen } from './components/GettingStartedScreen';

function getFirstPromoterTid() {
  try {
    const match = document.cookie.match(/(^|;)\s*_fprom_track\s*=\s*([^;]+)/);
    return match ? match[2] : '';
  } catch (e) {
    return '';
  }
}

export default function App() {
  const [authState, setAuthState] = useState<AuthState>('logged-out');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewState, setViewState] = useState<'dashboard' | 'admin' | 'getting_started'>('getting_started');
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  useEffect(() => {
    // Initialize First Promoter Tracking if account ID is set in the environment
    const fpId = (import.meta as any).env?.VITE_FIRST_PROMOTER_ID;
    if (fpId && fpId !== 'your_first_promoter_account_id_here') {
      const win = window as any;
      
      // Inject First Promoter script dynamically if not present
      if (!win.fprom) {
        win.fprom = function() {
          (win.fprom.q = win.fprom.q || []).push(arguments);
        };
        try {
          const doc = document;
          const script = doc.createElement('script');
          script.async = true;
          script.src = 'https://cdn.firstpromoter.com/fprom.js';
          const firstScript = doc.getElementsByTagName('script')[0];
          if (firstScript && firstScript.parentNode) {
            firstScript.parentNode.insertBefore(script, firstScript);
          } else {
            doc.head.appendChild(script);
          }
        } catch (e) {
          console.error('Error dynamic-loading fprom script', e);
        }
      }

      win.fprom('init', fpId);
      win.fprom('track', 'click');
    }
  }, []);

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      // Clean up any existing snapshot listener first
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (firebaseUser && firebaseUser.email) {
        setCurrentUserEmail(firebaseUser.email);
        
        // Listen to user document in Firestore
        const userRef = doc(db, 'users', firebaseUser.uid);
        
        // Check if user exists first
        let currentUserStatus: AuthState = 'unpaid';
        try {
          const userSnap = await getDoc(userRef);

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
            
            // Trigger GHL webhook for new registrations
            try {
              await fetch('/api/user-registered', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({
                   email: firebaseUser.email,
                   uid: firebaseUser.uid,
                   status: currentUserStatus
                 })
              });
            } catch (err) {
              console.error('Failed to trigger registration webhook', err);
            }

            // Track First Promoter affiliate signup event
            try {
              const win = window as any;
              if (win.fprom) {
                win.fprom('track', 'signup', {
                  email: firebaseUser.email,
                  uid: firebaseUser.uid,
                });
              }
            } catch (e) {
              console.error('First Promoter signup error', e);
            }
            
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

          // Handle successful Stripe payment redirect / upgrades dynamically
          const urlParams = new URLSearchParams(window.location.search);
          const sessionId = urlParams.get('session_id');
          if (sessionId) {
            try {
              const res = await fetch('/api/verify-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId })
              });
              const data = await res.json();
              if (data.success && data.userId === firebaseUser.uid) {
                  const verifiedTier = data.tier || 'elite';
                  currentUserStatus = verifiedTier;
                  setAuthState(verifiedTier);
                  // Remove session_id from URL to prevent re-verifying
                  window.history.replaceState({}, document.title, window.location.pathname);
              }
            } catch (err) {
              console.error('Failed to verify session', err);
            }
          }
        } catch (err) {
          try {
            handleFirestoreError(err, OperationType.GET, `users/${firebaseUser.uid}`);
          } catch (e) {
            console.error("Firestore error handled:", e);
          }
        } finally {
          setAuthState(currentUserStatus);
          setLoading(false);
        }

        // Setup real-time listener for status changes
        unsubscribeSnapshot = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data() as User;
                setAuthState(data.status);
            }
        }, (error) => {
            // Only log errors if the user is still signed in/auth has not been cleared
            if (auth.currentUser) {
              try {
                handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
              } catch (e) {
                console.error("Firestore onSnapshot error handled:", e);
              }
            }
        });
      } else {
        setCurrentUserEmail(null);
        setAuthState('logged-out');
        setLoading(false);
      }
    });

    return () => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
      unsubscribeAuth();
    };
  }, []);

  const handleLogin = (email: string) => {
    // Auth object listener handles the logic
  };

  const handleUpgrade = async (tier: 'starter' | 'pro' | 'elite' = 'elite') => {
    if (auth.currentUser) {
        try {
            const res = await fetch('/api/create-checkout-session', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ 
                 userId: auth.currentUser.uid,
                 tier,
                 fpromTid: getFirstPromoterTid()
               })
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

  const isUserPaid = ['paid', 'starter', 'pro', 'elite', 'legacy', 'admin'].includes(authState) || isPreviewMode;

  return (
    <>
      {(!isUserPaid) && (
        <SalesPage 
          onUpgrade={handleUpgrade} 
          onLogin={handleLogin} 
          isLoggedIn={authState === 'unpaid'} 
          currentUserEmail={currentUserEmail}
          currentUserStatus={authState}
          onLogout={handleLogout}
        />
      )}
      
      {isUserPaid && viewState === 'dashboard' && (
        <DashboardScreen 
          onLogout={isPreviewMode ? () => { setIsPreviewMode(false); setViewState('getting_started'); } : handleLogout} 
          onOpenSettings={() => setIsSettingsOpen(true)}
          isAdmin={authState === 'admin'}
          onOpenAdmin={() => setViewState('admin')}
          onGettingStarted={() => setViewState('getting_started')}
          userStatus={isPreviewMode ? 'elite' : authState}
          onUpgrade={handleUpgrade}
          isPreviewMode={isPreviewMode}
        />
      )}

      {(isUserPaid || authState === 'admin') && viewState === 'getting_started' && (
        <GettingStartedScreen
          onBackToDashboard={() => setViewState('dashboard')}
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

