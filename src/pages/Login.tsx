import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Building2, ArrowLeft, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
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
  };

  const switchTab = (t: LoginTab) => {
    setTab(t);
    setError('');
    setCode('');
    setPassword('');
    setStep('credentials');
    setTempToken('');
  };

  return (
    <div className="min-h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-100 p-4">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary-700">🚚 Deliver ET</h1>
            <p className="text-gray-500 mt-2">Staff Portal</p>
          </div>

          {/* ─── Tab Selector ─── */}
          {step === 'credentials' && (
            <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-md">
              <button
                type="button"
                onClick={() => switchTab('super-admin')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2 rounded text-sm font-medium transition-colors',
                  tab === 'super-admin'
                    ? 'bg-white text-primary-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900',
                )}
              >
                <Crown className="h-4 w-4" />
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => switchTab('staff')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2 rounded text-sm font-medium transition-colors',
                  tab === 'staff'
                    ? 'bg-white text-primary-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900',
                )}
              >
                <Building2 className="h-4 w-4" />
                Staff
              </button>
            </div>
          )}

          {/* ─── SUPER ADMIN: PHONE ─── */}
          {tab === 'super-admin' && step === 'credentials' && (
            <form onSubmit={handleSuperRequestOtp} className="space-y-4">
              <div className="text-xs text-purple-700 bg-purple-50 border border-purple-200 px-3 py-2 rounded">
                👑 <b>Super Admin:</b> Log in with phone + OTP. No password.
              </div>

              <Input
                label="Phone Number"
                placeholder="0911111111"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                autoFocus
              />

              {error && (
                <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" loading={requestSuperOtp.isPending}>
                <Smartphone className="h-4 w-4" /> Send OTP
              </Button>
            </form>
          )}

          {/* ─── SUPER ADMIN: OTP ─── */}
          {tab === 'super-admin' && step === 'otp' && (
            <form onSubmit={handleSuperVerifyOtp} className="space-y-4">
              <div className="text-sm text-gray-600 text-center mb-4">
                Enter the 6-digit code sent to <b>{phone}</b>
              </div>

              <Input
                label="OTP Code"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                autoFocus
                maxLength={6}
              />

              {error && (
                <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" loading={verifySuperOtp.isPending}>
                Verify & Login
              </Button>

              <button
                type="button"
                onClick={resetForm}
                className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="h-3 w-3" /> Change phone
              </button>
            </form>
          )}

          {/* ─── STAFF: PHONE + PASSWORD ─── */}
          {tab === 'staff' && step === 'credentials' && (
            <form onSubmit={handleStaffLogin} className="space-y-4">
              <div className="text-xs text-blue-700 bg-blue-50 border border-blue-200 px-3 py-2 rounded">
                🏛️ <b>Staff:</b> Enter the phone number and password given by
                your Super Admin.
              </div>

              <Input
                label="Phone Number"
                placeholder="0911111112"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                autoFocus
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />

              {error && (
                <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" loading={staffLogin.isPending}>
                Continue → Send OTP
              </Button>

              <p className="text-xs text-gray-500 text-center">
                After password verification, we'll send an OTP to your phone.
              </p>
            </form>
          )}

          {/* ─── STAFF: OTP ─── */}
          {tab === 'staff' && step === 'otp' && (
            <form onSubmit={handleStaffVerify} className="space-y-4">
              <div className="text-sm text-center mb-4">
                <div className="text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded mb-3">
                  ✅ Password verified
                </div>
                <div className="text-gray-600">
                  Enter the 6-digit code sent to <b>{phone}</b>
                </div>
              </div>

              <Input
                label="OTP Code"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                autoFocus
                maxLength={6}
              />

              {error && (
                <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" loading={staffVerify.isPending}>
                Verify & Login
              </Button>

              <button
                type="button"
                onClick={resetForm}
                className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="h-3 w-3" /> Back
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          For staff only — Super Admin · Regional Admin · Branch Manager
        </p>
      </div>
    </div>
  );
}
