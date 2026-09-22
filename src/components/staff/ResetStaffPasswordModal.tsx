import { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useResetStaffPassword } from '@/hooks/useStaff';
import type { Staff } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
  staff: Staff | null;
}

export function ResetStaffPasswordModal({ open, onClose, staff }: Props) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');

  const reset = useResetStaffPassword();

  useEffect(() => {
    if (open) {
      setPassword('');
      setConfirm('');
      setError('');
      setShow(false);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (!staff) return;

    try {
      await reset.mutateAsync({ id: staff.id, password });
      onClose();
    } catch {
      // toast in hook
    }
  };

  if (!staff) return null;

  return (
    <Modal open={open} onClose={onClose} title={`Reset Password — ${staff.name}`} size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Input
            label="New Password"
            type={show ? 'text' : 'password'}
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoFocus
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600"
            tabIndex={-1}
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <Input
          label="Confirm Password"
          type={show ? 'text' : 'password'}
          placeholder="Re-type password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          minLength={8}
        />

        {error && (
          <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error}</div>
        )}

        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs px-3 py-2 rounded">
          ⚠️ User will be logged out of all sessions.
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button type="button" variant="secondary" onClick={onClose} disabled={reset.isPending}>
            Cancel
          </Button>
          <Button type="submit" loading={reset.isPending}>
            Reset Password
          </Button>
        </div>
      </form>
    </Modal>
  );
}
