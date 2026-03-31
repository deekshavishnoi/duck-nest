'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/hooks/useAppData';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import { DuckCouple, DuckSitting, DuckFootprints, FlowerDoodle } from '@/components/ui/DuckDoodles';

type Step = 'welcome' | 'signup' | 'login' | 'join' | 'forgot-password';

function getInviteFromURL(): string | null {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get('invite');
}

/* ---- Google icon SVG ---- */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export default function Onboarding() {
  const inviteFromURL = getInviteFromURL();
  const [step, setStep] = useState<Step>(inviteFromURL ? 'join' : 'welcome');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <DuckScene />

      <AnimatePresence mode="wait">
        {step === 'welcome' && (
          <WelcomeScreen key="welcome" onSignUp={() => setStep('signup')} onLogIn={() => setStep('login')} onJoin={() => setStep('join')} />
        )}
        {step === 'signup' && (
          <SignUpScreen key="signup" onBack={() => setStep('welcome')} onGoToLogin={() => setStep('login')} />
        )}
        {step === 'login' && (
          <LoginScreen key="login" onBack={() => setStep('welcome')} onForgotPassword={() => setStep('forgot-password')} />
        )}
        {step === 'join' && (
          <JoinScreen key="join" onBack={() => setStep('welcome')} initialCode={inviteFromURL || ''} />
        )}
        {step === 'forgot-password' && (
          <ForgotPasswordScreen key="forgot" onBack={() => setStep('login')} />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---- Password Input with toggle ---- */
function PasswordInput({
  value,
  onChange,
  placeholder,
  autoComplete,
  name,
  minLength,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  autoComplete: string;
  name: string;
  minLength?: number;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        name={name}
        required
        minLength={minLength}
        className="w-full bg-white border-2 border-amber-100/60 rounded-2xl px-4 py-3 pr-11 text-sm focus:outline-none focus:border-blue-300 placeholder:text-slate-300 transition-colors"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        tabIndex={-1}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-blue-500 transition-colors"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

function DuckScene() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Warm ambient glows */}
      <div className="absolute top-[15%] left-[10%] w-40 h-40 bg-amber-100/25 rounded-full blur-3xl" />
      <div className="absolute bottom-[25%] right-[10%] w-36 h-36 bg-blue-100/20 rounded-full blur-3xl" />
      <div className="absolute top-[55%] left-[60%] w-28 h-28 bg-pink-100/15 rounded-full blur-3xl" />

      {/* Floating elements */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: `${15 + i * 18}%`, top: `${10 + (i % 3) * 25}%`, filter: 'saturate(0.7)' }}
          animate={{
            y: [0, -15, 0],
            rotate: [0, i % 2 === 0 ? 5 : -5, 0],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.4,
          }}
        >
          <span className="text-2xl opacity-30">{['🐥', '🌼', '🐤', '🌸', '🦆'][i]}</span>
        </motion.div>
      ))}

      {/* Corner doodle accents */}
      <div className="absolute bottom-8 left-4 opacity-10">
        <FlowerDoodle size={24} />
      </div>
      <div className="absolute top-12 right-6 opacity-10">
        <FlowerDoodle size={20} />
      </div>
    </div>
  );
}

function WelcomeScreen({ onSignUp, onLogIn, onJoin }: { onSignUp: () => void; onLogIn: () => void; onJoin: () => void }) {
  const { logInWithGoogle } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await logInWithGoogle();
      if (!result.success) {
        setError(result.error || 'Google sign-in failed');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="relative z-10 w-full max-w-sm text-center space-y-8"
    >
      {/* Logo */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="mb-2"
      >
        <DuckCouple size={50} className="mx-auto opacity-80" />
      </motion.div>
      <div>
        <h1 className="text-3xl font-bold text-slate-800">DuckNest</h1>
        <p className="text-sm text-amber-600/50 mt-1">a cozy little world for two</p>
        <DuckFootprints className="opacity-30 mx-auto max-w-[180px] mt-2" />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-xl">{error}</div>
      )}

      <div className="space-y-3">
        <button
          onClick={onSignUp}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3.5 rounded-2xl text-sm font-semibold transition-all shadow-lg shadow-blue-200 active:scale-[0.98]"
        >
          <UserPlus className="w-4 h-4" />
          Create your nest
        </button>
        <button
          onClick={onLogIn}
          className="w-full flex items-center justify-center gap-2 bg-white hover:bg-amber-50 text-slate-600 py-3.5 rounded-2xl text-sm font-semibold transition-all border-2 border-amber-200/60 active:scale-[0.98]"
        >
          Log in
        </button>
        <button
          onClick={onJoin}
          className="w-full text-xs text-amber-600/50 hover:text-amber-700 transition-colors"
        >
          Have an invite code? <span className="underline">Join a nest</span>
        </button>

        <div className="flex items-center gap-3 pt-2">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">or continue with</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        <button
          onClick={handleGoogle}
          disabled={loading}
          className="mx-auto flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-500 py-2.5 px-5 rounded-xl text-xs font-medium transition-all border border-slate-200 active:scale-[0.98] disabled:opacity-60"
        >
          <GoogleIcon className="w-4 h-4" />
          Google
        </button>
      </div>
    </motion.div>
  );
}

function SignUpScreen({ onBack, onGoToLogin }: { onBack: () => void; onGoToLogin: () => void }) {
  const { signUp, logInWithGoogle } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await signUp(name, email, password);
      if (!result.success) {
        setError(result.error || 'Something went wrong');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await logInWithGoogle();
      if (!result.success) {
        setError(result.error || 'Google sign-in failed');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      onSubmit={handleSubmit}
      className="relative z-10 w-full max-w-sm space-y-5"
    >
      <button type="button" onClick={onBack} className="text-xs text-blue-600/50 hover:text-slate-600">&larr; Back</button>
      <div className="text-center">
        <div className="mb-2"><DuckSitting size={44} className="mx-auto opacity-70" /></div>
        <h2 className="text-xl font-bold text-slate-800">Create your nest</h2>
        <p className="text-xs text-slate-600/50 mt-1">Set up your account to get started</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-xl">
          <span>{error}</span>
          {error.includes('already') && (
            <button type="button" onClick={onGoToLogin} className="ml-1 text-blue-600 font-semibold underline hover:text-blue-700">Log in instead?</button>
          )}
        </div>
      )}

      <div className="space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          autoComplete="name"
          name="name"
          required
          className="w-full bg-white border-2 border-amber-100/60 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-blue-300 placeholder:text-slate-300 transition-colors"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          autoComplete="email"
          name="email"
          required
          className="w-full bg-white border-2 border-amber-100/60 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-blue-300 placeholder:text-slate-300 transition-colors"
        />
        <PasswordInput
          value={password}
          onChange={setPassword}
          placeholder="Password (min 6 characters)"
          autoComplete="new-password"
          name="new-password"
          minLength={6}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white py-3.5 rounded-2xl text-sm font-semibold transition-all shadow-lg shadow-blue-200"
      >
        {loading ? 'Creating...' : 'Create account 🐥'}
      </button>
      <p className="text-[10px] text-slate-400 text-center">A verification email will be sent to confirm your address</p>

      <div className="flex items-center gap-3 pt-1">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-[10px] text-slate-400 uppercase tracking-wider">or continue with</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading}
        className="mx-auto flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-500 py-2.5 px-5 rounded-xl text-xs font-medium transition-all border border-slate-200 active:scale-[0.98] disabled:opacity-60"
      >
        <GoogleIcon className="w-4 h-4" />
        Google
      </button>
    </motion.form>
  );
}

function LoginScreen({ onBack, onForgotPassword }: { onBack: () => void; onForgotPassword: () => void }) {
  const { logIn, logInWithGoogle } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await logIn(email, password);
      if (!result.success) {
        setError(result.error || 'Something went wrong');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await logInWithGoogle();
      if (!result.success) {
        setError(result.error || 'Google sign-in failed');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      onSubmit={handleSubmit}
      className="relative z-10 w-full max-w-sm space-y-5"
    >
      <button type="button" onClick={onBack} className="text-xs text-blue-600/50 hover:text-slate-600">&larr; Back</button>
      <div className="text-center">
        <p className="text-4xl mb-2">🦆</p>
        <h2 className="text-xl font-bold text-slate-800">Welcome back</h2>
        <p className="text-xs text-slate-600/50 mt-1">Log in to your nest</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-xl">{error}</div>
      )}

      <div className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          autoComplete="email"
          name="email"
          required
          className="w-full bg-white border-2 border-amber-100/60 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-blue-300 placeholder:text-slate-300 transition-colors"
        />
        <PasswordInput
          value={password}
          onChange={setPassword}
          placeholder="Password"
          autoComplete="current-password"
          name="password"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white py-3.5 rounded-2xl text-sm font-semibold transition-all shadow-lg shadow-blue-200"
      >
        {loading ? 'Logging in...' : 'Log in'}
      </button>

      <button
        type="button"
        onClick={onForgotPassword}
        className="w-full text-xs text-blue-500/60 hover:text-blue-600 transition-colors text-center"
      >
        Forgot your password?
      </button>

      <div className="flex items-center gap-3 pt-1">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-[10px] text-slate-400 uppercase tracking-wider">or continue with</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading}
        className="mx-auto flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-500 py-2.5 px-5 rounded-xl text-xs font-medium transition-all border border-slate-200 active:scale-[0.98] disabled:opacity-60"
      >
        <GoogleIcon className="w-4 h-4" />
        Google
      </button>
    </motion.form>
  );
}

function JoinScreen({ onBack, initialCode = '' }: { onBack: () => void; initialCode?: string }) {
  const { joinWithInvite, joinWithInviteGoogle } = useApp();
  const [code, setCode] = useState(initialCode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await joinWithInvite(code, name, email, password);
      if (!result.success) {
        setError(result.error || 'Something went wrong');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    if (!code.trim()) {
      setError('Please enter the invite code first');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const result = await joinWithInviteGoogle(code);
      if (!result.success) {
        setError(result.error || 'Google sign-in failed');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      onSubmit={handleSubmit}
      className="relative z-10 w-full max-w-sm space-y-5"
    >
      <button type="button" onClick={onBack} className="text-xs text-blue-600/50 hover:text-slate-600">&larr; Back</button>
      <div className="text-center">
        <p className="text-4xl mb-2">💌</p>
        <h2 className="text-xl font-bold text-slate-800">Join a nest</h2>
        <p className="text-xs text-amber-600/40 mt-1">Enter the invite code from your partner</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-xl">{error}</div>
      )}

      <div className="space-y-3">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Invite code"
          autoComplete="off"
          name="invite-code"
          required
          maxLength={8}
          className="w-full bg-white border-2 border-blue-200 rounded-2xl px-4 py-3 text-sm text-center font-mono tracking-widest focus:outline-none focus:border-blue-400 placeholder:text-slate-300 transition-colors uppercase"
        />

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          autoComplete="name"
          name="name"
          required
          className="w-full bg-white border-2 border-amber-100/60 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-blue-300 placeholder:text-slate-300 transition-colors"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          autoComplete="email"
          name="email"
          required
          className="w-full bg-white border-2 border-amber-100/60 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-blue-300 placeholder:text-slate-300 transition-colors"
        />
        <PasswordInput
          value={password}
          onChange={setPassword}
          placeholder="Password (min 6 characters)"
          autoComplete="new-password"
          name="new-password"
          minLength={6}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white py-3.5 rounded-2xl text-sm font-semibold transition-all shadow-lg shadow-blue-200"
      >
        {loading ? 'Joining...' : 'Join the nest 🐤'}
      </button>

      <div className="flex items-center gap-3 pt-1">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-[10px] text-slate-400 uppercase tracking-wider">or continue with</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading}
        className="mx-auto flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-500 py-2.5 px-5 rounded-xl text-xs font-medium transition-all border border-slate-200 active:scale-[0.98] disabled:opacity-60"
      >
        <GoogleIcon className="w-4 h-4" />
        Google
      </button>
    </motion.form>
  );
}

function ForgotPasswordScreen({ onBack }: { onBack: () => void }) {
  const { resetPassword } = useApp();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await resetPassword(email);
    setLoading(false);
    if (result.success) {
      setSent(true);
    } else {
      setError(result.error || 'Something went wrong');
    }
  };

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        className="relative z-10 w-full max-w-sm space-y-5 text-center"
      >
        <p className="text-4xl">📧</p>
        <h2 className="text-xl font-bold text-slate-800">Check your email</h2>
        <p className="text-sm text-slate-500">
          We sent a password reset link to <strong className="text-slate-700">{email}</strong>
        </p>
        <button
          onClick={onBack}
          className="text-sm text-blue-500 hover:text-blue-600 font-medium"
        >
          Back to login
        </button>
      </motion.div>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      onSubmit={handleSubmit}
      className="relative z-10 w-full max-w-sm space-y-5"
    >
      <button type="button" onClick={onBack} className="text-xs text-blue-600/50 hover:text-slate-600">&larr; Back</button>
      <div className="text-center">
        <p className="text-4xl mb-2">🔑</p>
        <h2 className="text-xl font-bold text-slate-800">Reset password</h2>
        <p className="text-xs text-slate-600/50 mt-1">We&apos;ll send you a link to reset it</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-xl">{error}</div>
      )}

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        autoComplete="email"
        name="email"
        required
        className="w-full bg-white border-2 border-amber-100/60 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-blue-300 placeholder:text-slate-300 transition-colors"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white py-3.5 rounded-2xl text-sm font-semibold transition-all shadow-lg shadow-blue-200"
      >
        {loading ? 'Sending...' : 'Send reset link'}
      </button>
    </motion.form>
  );
}
