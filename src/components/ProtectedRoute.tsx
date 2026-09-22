import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/auth';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { accessToken, account } = useAuthStore();

  useEffect(() => {
    if (!accessToken || !account) {
      navigate('/login', { replace: true });
    }
  }, [accessToken, account, navigate]);

  if (!accessToken || !account) return null;
  return <>{children}</>;
}
