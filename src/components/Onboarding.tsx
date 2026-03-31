'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/hooks/useAppData';
import { ArrowRight, UserPlus, Eye, EyeOff } from 'lucide-react';

type Step = 'welcome' | 'signup' | 'login' | 'join';

export default function Onboarding() {
  const [step, setStep] = useState<Step>('welcome');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <DuckScene />

      <AnimatePresence mode="wait">
        {step === 'welcome' && (
          <WelcomeScreen key="welcome" onSignUp={() => setStep('signup')} onLogIn={() => setStep('login')} onJoin={() => setStep('join')} />
        )}
        {step === 'signup' && (
          <SignUpScreen key="signup" onBack={() => setStep('welcome')} />
        )}
        {step === 'login' && (
          <LoginScreen key="login" onBack={() => setStep('welcome')} />
        )}
        {step === 'join' && (
          <JoinScreen key="join" onBack={() => setStep('welcome')} />
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
        className="w-full bg-white border-2 border-amber-100 rounded-2xl px-4 py-3 pr-11 text-sm focus:outline-none focus:border-amber-300 placeholder:text-amber-300 transition-colors"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        tabIndex={-1}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-300 hover:text-amber-500 transition-colors"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

function DuckScene() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Floating elements */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl"
          style={{ left: `${15 + i * 18}%`, top: `${10 + (i % 3) * 25}%` }}
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
          {['🐥', '🌼', '🐤', '🌸', '🦆'][i]}
        </motion.div>
      ))}
    </div>
  );
}

function WelcomeScreen({ onSignUp, onLogIn, onJoin }: { onSignUp: () => void; onLogIn: () => void; onJoin: () => void }) {
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
        className="text-7xl mb-2"
      >
        🦆
      </motion.div>
      <div>
        <h1 className="text-3xl font-bold text-amber-900">DuckNest</h1>
        <p className="text-sm text-amber-700/60 mt-1">a cozy little world for two</p>
      </div>

      <div className="space-y-3">
        <button
          onClick={onSignUp}
          className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white py-3.5 rounded-2xl text-sm font-semibold transition-all shadow-lg shadow-amber-200 active:scale-[0.98]"
        >
          <UserPlus className="w-4 h-4" />
          Create your nest
        </button>
        <button
          onClick={onJoin}
          className="w-full flex items-center justify-center gap-2 bg-white hover:bg-amber-50 text-amber-700 py-3.5 rounded-2xl text-sm font-semibold transition-all border-2 border-amber-200 active:scale-[0.98]"
        >
          <ArrowRight className="w-4 h-4" />
          Join with invite code
        </button>
        <button
          onClick={onLogIn}
          className="text-xs text-amber-600/50 hover:text-amber-700 transition-colors pt-2"
        >
          Already have an account? <span className="underline">Log in</span>
        </button>
      </div>
    </motion.div>
  );
}

function SignUpScreen({ onBack }: { onBack: () => void }) {
  const { signUp } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = signUp(name, email, password);
    if (!result.success) {
      setLoading(false);
      setError(result.error || 'Something went wrong');
    }
    // On success, isLoggedIn becomes true → AppShell renders the app
  };

  return (
    <motion.form
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      onSubmit={handleSubmit}
      className="relative z-10 w-full max-w-sm space-y-5"
    >
      <button type="button" onClick={onBack} className="text-xs text-amber-600/50 hover:text-amber-700">&larr; Back</button>
      <div className="text-center">
        <p className="text-4xl mb-2">🐣</p>
        <h2 className="text-xl font-bold text-amber-900">Create your nest</h2>
        <p className="text-xs text-amber-700/50 mt-1">Set up your account to get started</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-xl">{error}</div>
      )}

      <div className="space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          autoComplete="name"
          name="name"
          required
          className="w-full bg-white border-2 border-amber-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-amber-300 placeholder:text-amber-300 transition-colors"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          autoComplete="email"
          name="email"
          required
          className="w-full bg-white border-2 border-amber-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-amber-300 placeholder:text-amber-300 transition-colors"
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
        className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white py-3.5 rounded-2xl text-sm font-semibold transition-all shadow-lg shadow-amber-200"
      >
        {loading ? 'Creating...' : 'Create account 🐥'}
      </button>
    </motion.form>
  );
}

function LoginScreen({ onBack }: { onBack: () => void }) {
  const { logIn } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = logIn(email, password);
    if (!result.success) {
      setLoading(false);
      setError(result.error || 'Something went wrong');
    }
    // On success, isLoggedIn becomes true → AppShell renders the app
  };

  return (
    <motion.form
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      onSubmit={handleSubmit}
      className="relative z-10 w-full max-w-sm space-y-5"
    >
      <button type="button" onClick={onBack} className="text-xs text-amber-600/50 hover:text-amber-700">&larr; Back</button>
      <div className="text-center">
        <p className="text-4xl mb-2">🦆</p>
        <h2 className="text-xl font-bold text-amber-900">Welcome back</h2>
        <p className="text-xs text-amber-700/50 mt-1">Log in to your nest</p>
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
          className="w-full bg-white border-2 border-amber-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-amber-300 placeholder:text-amber-300 transition-colors"
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
        className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white py-3.5 rounded-2xl text-sm font-semibold transition-all shadow-lg shadow-amber-200"
      >
        {loading ? 'Logging in...' : 'Log in'}
      </button>
    </motion.form>
  );
}

function JoinScreen({ onBack }: { onBack: () => void }) {
  const { joinWithInvite } = useApp();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = joinWithInvite(code, name, email, password);
    if (!result.success) {
      setLoading(false);
      setError(result.error || 'Something went wrong');
    }
    // On success, isLoggedIn becomes true → AppShell renders the app
  };

  return (
    <motion.form
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      onSubmit={handleSubmit}
      className="relative z-10 w-full max-w-sm space-y-5"
    >
      <button type="button" onClick={onBack} className="text-xs text-amber-600/50 hover:text-amber-700">&larr; Back</button>
      <div className="text-center">
        <p className="text-4xl mb-2">💌</p>
        <h2 className="text-xl font-bold text-amber-900">Join a nest</h2>
        <p className="text-xs text-amber-700/50 mt-1">Enter the invite code from your partner</p>
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
          className="w-full bg-white border-2 border-amber-200 rounded-2xl px-4 py-3 text-sm text-center font-mono tracking-widest focus:outline-none focus:border-amber-400 placeholder:text-amber-300 transition-colors uppercase"
        />
        <div className="h-px bg-amber-100" />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          autoComplete="name"
          name="name"
          required
          className="w-full bg-white border-2 border-amber-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-amber-300 placeholder:text-amber-300 transition-colors"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          autoComplete="email"
          name="email"
          required
          className="w-full bg-white border-2 border-amber-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-amber-300 placeholder:text-amber-300 transition-colors"
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
        className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white py-3.5 rounded-2xl text-sm font-semibold transition-all shadow-lg shadow-amber-200"
      >
        {loading ? 'Joining...' : 'Join the nest 🐤'}
      </button>
    </motion.form>
  );
}
