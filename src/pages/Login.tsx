import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRequestStaffOtp, useVerifyStaffOtp } from '@/hooks/useAuth';
import { apiError } from '@/lib/api';

export function Login() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [error, setError] = useState('');

  const requestOtp = useRequestStaffOtp();
  const verifyOtp = useVerifyStaffOtp();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await requestOtp.mutateAsync(phone);
      setStep('otp');
    } catch (err) {
      setError(apiError(err));
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await verifyOtp.mutateAsync({ phone, code });
      navigate('/');
    } catch (err) {
      setError(apiError(err));
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-100 p-4">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary-700">🚚 Deliver ET</h1>
            <p className="text-gray-500 mt-2">Staff Portal</p>
          </div>

          {step === 'phone' ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
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
              <Button type="submit" className="w-full" loading={requestOtp.isPending}>
                Send OTP
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
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
              <Button type="submit" className="w-full" loading={verifyOtp.isPending}>
                Verify & Login
              </Button>
              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setCode('');
                  setError('');
                }}
                className="w-full text-sm text-gray-500 hover:text-gray-700"
              >
                ← Change phone number
              </button>
            </form>
          )}
        </div>
        <p className="text-center text-xs text-gray-400 mt-4">
          For staff only — Super Admin, Regional Admin, Branch Manager
        </p>
      </div>
    </div>
  );
}
