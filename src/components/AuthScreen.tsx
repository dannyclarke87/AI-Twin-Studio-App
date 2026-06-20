import React, { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';

interface AuthScreenProps {
  onLogin: (email: string) => void;
}

export function AuthScreen({ onLogin }: AuthScreenProps) {
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [view, setView] = useState<'signin' | 'signup' | 'forgot-password'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isResetSending, setIsResetSending] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      if (result.user && result.user.email) {
        onLogin(result.user.email.toLowerCase().trim());
      }
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        setError("The Google sign-in window was closed before completion. Please try again or sign up with email and password.");
      } else if (err.code === 'auth/popup-blocked') {
        setError("The Google sign-in popup was blocked by your browser. Please allow popups or use email and password to log in.");
      } else {
        setError(err.message);
      }
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
       setError("Email and password are required.");
       return;
    }
    try {
        setError(null);
        setSuccessMessage(null);
        if (view === 'signup') {
            const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
            if (result.user && result.user.email) {
                onLogin(result.user.email.toLowerCase().trim());
            }
        } else {
            const result = await signInWithEmailAndPassword(auth, email.trim(), password);
            if (result.user && result.user.email) {
                onLogin(result.user.email.toLowerCase().trim());
            }
        }
    } catch (err: any) {
        let msg = err.message;
        if (err.code === 'auth/email-already-in-use') msg = 'Email is already in use. Please sign in.';
        else if (err.code === 'auth/invalid-credential') msg = 'Invalid email or password.';
        else if (err.code === 'auth/weak-password') msg = 'Password should be at least 6 characters.';
        setError(msg);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError("Please key in your email address to receive the password reset link.");
      return;
    }
    try {
      setError(null);
      setSuccessMessage(null);
      setIsResetSending(true);
      await sendPasswordResetEmail(auth, cleanEmail);
      setSuccessMessage("A password reset link has been successfully sent to your email address! Please check your inbox and your spam/junk folder.");
    } catch (err: any) {
      let msg = err.message;
      if (err.code === 'auth/user-not-found') {
        msg = "We couldn't find an account matching that email address. Please double check.";
      } else if (err.code === 'auth/invalid-email') {
        msg = "Please enter a valid email address.";
      }
      setError(msg);
    } finally {
      setIsResetSending(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-zinc-950 p-4 font-sans text-zinc-100">
      <div className="w-full max-w-[400px] bg-zinc-900 border border-zinc-700 rounded-xl p-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] flex flex-col items-center text-center">
        <h2 className="text-2xl font-semibold mb-2">
          {view === 'signin' && 'Welcome to Studio'}
          {view === 'signup' && 'Create an Account'}
          {view === 'forgot-password' && 'Reset Password'}
        </h2>
        <p className="text-sm text-zinc-400 mb-8">
          {view === 'signin' && 'Sign in to start building.'}
          {view === 'signup' && 'Get started with AI Twin Studio.'}
          {view === 'forgot-password' && 'Enter your email to receive a password reset link.'}
        </p>

        {error && <div className="text-red-400 text-sm mb-4 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-md w-full">{error}</div>}
        {successMessage && <div className="text-emerald-400 text-sm mb-4 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-md w-full text-left">{successMessage}</div>}
        
        {view === 'forgot-password' ? (
          <form onSubmit={handlePasswordReset} className="w-full flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-4 py-3 text-zinc-100 focus:outline-none focus:border-[#dcfb80] transition-colors font-sans"
            />
            <button
              type="submit"
              disabled={isResetSending}
              className="w-full bg-[#dcfb80] text-black font-semibold py-3 rounded-md hover:opacity-90 transition-opacity flex items-center justify-center"
            >
              {isResetSending ? 'Sending reset link...' : 'Send Reset Link'}
            </button>
            <button
              type="button"
              onClick={() => {
                setView('signin');
                setError(null);
                setSuccessMessage(null);
              }}
              className="text-zinc-400 hover:text-white text-sm mt-2 transition-colors underline"
            >
              Back to sign in
            </button>
          </form>
        ) : (
          <>
            <form onSubmit={handleEmailAuth} className="w-full flex flex-col gap-4 mb-6">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-4 py-3 text-zinc-100 focus:outline-none focus:border-[#dcfb80] transition-colors"
              />
              <div className="w-full flex flex-col items-end">
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-4 py-3 text-zinc-100 focus:outline-none focus:border-[#dcfb80] transition-colors"
                />
                {view === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setView('forgot-password');
                      setError(null);
                      setSuccessMessage(null);
                    }}
                    className="text-zinc-500 hover:text-[#dcfb80] text-xs mt-2 transition-colors underline focus:outline-none"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="w-full bg-[#dcfb80] text-black font-semibold py-3 rounded-md hover:opacity-90 transition-opacity"
              >
                {view === 'signup' ? 'Sign up' : 'Sign in'}
              </button>
            </form>

            <div className="flex items-center gap-4 w-full mb-6">
                <div className="h-px bg-zinc-700 flex-1"></div>
                <span className="text-sm text-zinc-500">OR</span>
                <div className="h-px bg-zinc-700 flex-1"></div>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="w-full bg-zinc-800 text-zinc-100 border border-zinc-700 font-semibold py-3 flex items-center justify-center gap-2 rounded-md hover:bg-zinc-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </button>

            <div className="mt-8 text-sm text-zinc-400">
                {view === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button 
                    onClick={() => {
                      setView(view === 'signup' ? 'signin' : 'signup');
                      setError(null);
                      setSuccessMessage(null);
                    }}
                    className="text-white hover:text-[#dcfb80] underline transition-colors"
                    type="button"
                >
                    {view === 'signup' ? 'Sign in' : 'Sign up'}
                </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
