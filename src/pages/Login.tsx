import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Crown,
  Building2,
  ArrowLeft,
  Smartphone,
  Lock,
  Phone,
  ShieldCheck,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  useRequestSuperAdminOtp,
  useVerifySuperAdminOtp,
  useStaffLogin,
  useStaffLoginVerify,
} from '@/hooks/useAuth';
import { apiError } from '@/lib/api';
import { cn } from '@/lib/utils';

type LoginTab = 'super-admin' | 'staff';
type Step = 'credentials' | 'otp';

export function Login() {
  const navigate = useNavigate();

  const [tab, setTab] = useState<LoginTab>('super-admin');
  const [step, setStep] = useState<Step>('credentials');
  const [error, setError] = useState('');

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const requestSuperOtp = useRequestSuperAdminOtp();
  const verifySuperOtp = useVerifySuperAdminOtp();
  const staffLogin = useStaffLogin();
  const staffVerify = useStaffLoginVerify();

  // ── SUPER ADMIN ──
  const handleSuperRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await requestSuperOtp.mutateAsync(phone);
      setStep('otp');
    } catch (err) {
      setError(apiError(err));
    }
  };

  const handleSuperVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await verifySuperOtp.mutateAsync({ phone, code });
      navigate('/');
    } catch (err) {
      setError(apiError(err));
    }
  };

  // ── STAFF ──
  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await staffLogin.mutateAsync({ phone, password });
      setTempToken(res.tempToken);
      setStep('otp');
    } catch (err) {
      setError(apiError(err));
    }
  };

  const handleStaffVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await staffVerify.mutateAsync({ tempToken, code });
      navigate('/');
    } catch (err) {
      setError(apiError(err));
    }
  };

  const resetForm = () => {
    setStep('credentials');
    setCode('');
    setPassword('');
    setError('');
    setTempToken('');
    setShowPassword(false);
  };

  const switchTab = (t: LoginTab) => {
    setTab(t);
    setError('');
    setCode('');
    setPassword('');
    setStep('credentials');
    setTempToken('');
    setShowPassword(false);
  };

  const isSuper = tab === 'super-admin';
  const accent = isSuper ? 'purple' : 'blue';

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 p-4">
      {/* Soft colored orbs — colors shift with tab */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className={cn(
            'absolute -top-40 -left-40 h-[34rem] w-[34rem] rounded-full blur-[130px] animate-[float_9s_ease-in-out_infinite] transition-colors duration-700',
            isSuper ? 'bg-purple-300/40' : 'bg-blue-300/40',
          )}
        />
        <div
          className={cn(
            'absolute -bottom-40 -right-40 h-[34rem] w-[34rem] rounded-full blur-[130px] animate-[float_11s_ease-in-out_infinite_reverse] transition-colors duration-700',
            isSuper ? 'bg-fuchsia-300/35' : 'bg-cyan-300/35',
          )}
        />
        <div
          className={cn(
            'absolute top-1/2 left-1/2 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[130px] animate-[float_13s_ease-in-out_infinite] transition-colors duration-700',
            isSuper ? 'bg-pink-300/25' : 'bg-indigo-300/25',
          )}
        />
      </div>

      {/* Soft grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,0,0,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.6) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Soft colored glow behind card */}
        <div
          className={cn(
            'absolute -inset-1 rounded-3xl opacity-40 blur-2xl transition-all duration-700',
            isSuper
              ? 'bg-gradient-to-r from-purple-300 via-fuchsia-300 to-pink-300'
              : 'bg-gradient-to-r from-blue-300 via-cyan-300 to-indigo-300',
          )}
        />

        {/* ─── WHITE CARD ─── */}
        <div className="relative rounded-3xl border border-gray-200/80 bg-white p-8 shadow-xl shadow-gray-200/50">
          {/* Header */}
          <div className="mb-8 text-center">
            <div
              className={cn(
                'mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl shadow-lg transition-all duration-500',
                isSuper
                  ? 'bg-gradient-to-br from-purple-500 to-fuchsia-500 shadow-purple-300/50'
                  : 'bg-gradient-to-br from-blue-500 to-cyan-500 shadow-blue-300/50',
              )}
            >
              🚚
            </div>
            <h1 className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-600 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
              Deliver ET
            </h1>
            <p className="mt-1 text-sm font-medium tracking-wide text-gray-400">
              STAFF PORTAL
            </p>
          </div>

          {/* ─── Tab Selector ─── */}
          {step === 'credentials' && (
            <div className="relative mb-6 flex gap-1 rounded-xl border border-gray-200 bg-gray-100 p-1">
              <TabButton
                active={tab === 'super-admin'}
                onClick={() => switchTab('super-admin')}
                icon={<Crown className="h-4 w-4" />}
                label="Super Admin"
                accent="purple"
              />
              <TabButton
                active={tab === 'staff'}
                onClick={() => switchTab('staff')}
                icon={<Building2 className="h-4 w-4" />}
                label="Staff"
                accent="blue"
              />
            </div>
          )}

          {/* Step indicator */}
          {step === 'otp' && (
            <div className="mb-6 flex items-center justify-center gap-2">
              <StepDot active={false} done label="1" accent={accent} />
              <div className={cn('h-px w-10', isSuper ? 'bg-purple-400/60' : 'bg-blue-400/60')} />
              <StepDot active done={false} label="2" accent={accent} />
            </div>
          )}

          {/* ─── SUPER ADMIN: PHONE ─── */}
          {tab === 'super-admin' && step === 'credentials' && (
            <form onSubmit={handleSuperRequestOtp} className="space-y-5">
              <HintBanner
                icon={<Crown className="h-3.5 w-3.5" />}
                tone="purple"
                title="Super Admin"
                text="Log in with phone + OTP. No password required."
              />

              <LightInput
                label="Phone Number"
                placeholder="0911111111"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                autoFocus
                icon={<Phone className="h-4 w-4" />}
              />

              {error && <ErrorBanner message={error} />}

              <GradientButton
                type="submit"
                loading={requestSuperOtp.isPending}
                accent="purple"
              >
                <Smartphone className="h-4 w-4" /> Send OTP
              </GradientButton>
            </form>
          )}

          {/* ─── SUPER ADMIN: OTP ─── */}
          {tab === 'super-admin' && step === 'otp' && (
            <form onSubmit={handleSuperVerifyOtp} className="space-y-5">
              <OtpHeader phone={phone} accent="purple" />

              <OtpInput value={code} onChange={setCode} accent="purple" />

              {error && <ErrorBanner message={error} />}

              <GradientButton
                type="submit"
                loading={verifySuperOtp.isPending}
                accent="purple"
                disabled={code.length < 6}
              >
                <ShieldCheck className="h-4 w-4" /> Verify & Login
              </GradientButton>

              <BackButton onClick={resetForm} label="Change phone" />
            </form>
          )}

          {/* ─── STAFF: PHONE + PASSWORD ─── */}
          {tab === 'staff' && step === 'credentials' && (
            <form onSubmit={handleStaffLogin} className="space-y-5">
              <HintBanner
                icon={<Building2 className="h-3.5 w-3.5" />}
                tone="blue"
                title="Staff"
                text="Enter the phone and password given by your Super Admin."
              />

              <LightInput
                label="Phone Number"
                placeholder="0911111112"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                autoFocus
                icon={<Phone className="h-4 w-4" />}
              />

              {/* Password field with show/hide toggle */}
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Password
                </span>
                <div className="group relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-gray-600">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-12 pr-12 text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </label>

              {error && <ErrorBanner message={error} />}

              <GradientButton type="submit" loading={staffLogin.isPending} accent="blue">
                Continue → Send OTP
              </GradientButton>

              <p className="text-center text-xs text-gray-400">
                After password verification, we'll send an OTP to your phone.
              </p>
            </form>
          )}

          {/* ─── STAFF: OTP ─── */}
          {tab === 'staff' && step === 'otp' && (
            <form onSubmit={handleStaffVerify} className="space-y-5">
              <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                <ShieldCheck className="h-4 w-4" />
                Password verified
              </div>

              <OtpHeader phone={phone} accent="blue" />

              <OtpInput value={code} onChange={setCode} accent="blue" />

              {error && <ErrorBanner message={error} />}

              <GradientButton
                type="submit"
                loading={staffVerify.isPending}
                accent="blue"
                disabled={code.length < 6}
              >
                <ShieldCheck className="h-4 w-4" /> Verify & Login
              </GradientButton>

              <BackButton onClick={resetForm} label="Back" />
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          For staff only — Super Admin · Regional Admin · Branch Manager
        </p>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -30px) scale(1.1); }
        }
      `}</style>
    </div>
  );
}

/* ---------- Sub-components ---------- */

function TabButton({
  active,
  onClick,
  icon,
  label,
  accent,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  accent: 'purple' | 'blue';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all duration-300',
        active
          ? accent === 'purple'
            ? 'bg-white text-purple-700 shadow-sm shadow-purple-200/50 ring-1 ring-purple-300/60'
            : 'bg-white text-blue-700 shadow-sm shadow-blue-200/50 ring-1 ring-blue-300/60'
          : 'text-gray-500 hover:text-gray-800',
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function StepDot({
  active,
  done,
  label,
  accent,
}: {
  active: boolean;
  done: boolean;
  label: string;
  accent: 'purple' | 'blue';
}) {
  const accentRing =
    accent === 'purple'
      ? 'border-purple-400 bg-purple-100 text-purple-700 shadow-sm shadow-purple-200'
      : 'border-blue-400 bg-blue-100 text-blue-700 shadow-sm shadow-blue-200';
  return (
    <div
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold transition-all duration-300',
        active
          ? accentRing
          : done
            ? 'border-emerald-300 bg-emerald-100 text-emerald-700'
            : 'border-gray-200 bg-gray-50 text-gray-400',
      )}
    >
      {done ? '✓' : label}
    </div>
  );
}

function HintBanner({
  icon,
  tone,
  title,
  text,
}: {
  icon: React.ReactNode;
  tone: 'purple' | 'blue';
  title: string;
  text: string;
}) {
  return (
    <div
      className={cn(
        'flex items-start gap-2.5 rounded-xl border px-3 py-2.5 text-xs',
        tone === 'purple'
          ? 'border-purple-200 bg-purple-50 text-purple-800'
          : 'border-blue-200 bg-blue-50 text-blue-800',
      )}
    >
      <span
        className={cn(
          'mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md',
          tone === 'purple' ? 'bg-purple-200/70' : 'bg-blue-200/70',
        )}
      >
        {icon}
      </span>
      <span>
        <b className="text-gray-900">{title}:</b> {text}
      </span>
    </div>
  );
}

function OtpHeader({ phone, accent }: { phone: string; accent: 'purple' | 'blue' }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-center text-sm text-gray-600">
      Enter the 6-digit code sent to{' '}
      <span
        className={cn(
          'font-semibold',
          accent === 'purple' ? 'text-purple-700' : 'text-blue-700',
        )}
      >
        {phone}
      </span>
    </div>
  );
}

function LightInput({
  label,
  icon,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; icon?: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
        {label}
      </span>
      <div className="group relative">
        {icon && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-gray-600">
            {icon}
          </span>
        )}
        <input
          {...props}
          className={cn(
            'w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pr-4 text-gray-900 placeholder-gray-400 outline-none transition-all',
            'focus:border-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-200',
            icon ? 'pl-12' : 'pl-4',
          )}
        />
      </div>
    </label>
  );
}

function OtpInput({
  value,
  onChange,
  accent,
}: {
  value: string;
  onChange: (v: string) => void;
  accent: 'purple' | 'blue';
}) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, ' ').slice(0, 6).split('');

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const handleChange = (i: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next = digits
      .map((d, idx) => (idx === i ? digit : d))
      .join('')
      .replace(/ /g, '');
    onChange(next);
    if (digit && i < 5) inputsRef.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i].trim() && i > 0) {
      inputsRef.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted);
    inputsRef.current[Math.min(pasted.length, 5)]?.focus();
  };

  const focusRing =
    accent === 'purple'
      ? 'focus:border-purple-400 focus:ring-2 focus:ring-purple-200 focus:bg-white'
      : 'focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:bg-white';

  return (
    <div className="flex justify-between gap-2" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (inputsRef.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d.trim()}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className={cn(
            'h-14 w-full rounded-xl border border-gray-200 bg-gray-50 text-center text-xl font-bold text-gray-900 outline-none transition-all',
            focusRing,
          )}
        />
      ))}
    </div>
  );
}

function GradientButton({
  children,
  loading,
  accent,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  accent: 'purple' | 'blue';
}) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={cn(
        'group relative w-full overflow-hidden rounded-xl px-4 py-3.5 font-semibold text-white shadow-lg transition-all hover:shadow-xl active:scale-[0.98] disabled:opacity-50',
        accent === 'purple'
          ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 shadow-purple-300/50 hover:shadow-purple-400/50'
          : 'bg-gradient-to-r from-blue-600 to-cyan-600 shadow-blue-300/50 hover:shadow-blue-400/50',
      )}
    >
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      <span className="relative flex items-center justify-center gap-2">
        {loading ? (
          <>
            <Spinner /> Please wait...
          </>
        ) : (
          children
        )}
      </span>
    </button>
  );
}

function BackButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2 text-sm text-gray-400 transition-colors hover:text-gray-700"
    >
      <ArrowLeft className="h-3.5 w-3.5" /> {label}
    </button>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
      <span className="mt-0.5">⚠️</span>
      <span>{message}</span>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}