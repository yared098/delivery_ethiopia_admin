import { useEffect, useMemo, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCreateRegionalAdmin, useCreateBranchManager } from '@/hooks/useStaff';
import { useRegions } from '@/hooks/useRegions';
import { useBranches } from '@/hooks/useBranches';

type StaffRole = 'REGIONAL_ADMIN' | 'BRANCH_MANAGER';

interface Props {
  open: boolean;
  onClose: () => void;
  role: StaffRole | null;
}

export function CreateStaffModal({ open, onClose, role }: Props) {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [regionId, setRegionId] = useState('');
  const [branchId, setBranchId] = useState('');
  const [password, setPassword] = useState('');
  const [mustChangePassword, setMustChangePassword] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const { data: regions = [] } = useRegions();
  const { data: branches = [] } = useBranches({
    regionId: regionId || undefined,
  });

  const createRegional = useCreateRegionalAdmin();
  const createManager = useCreateBranchManager();

  const isRegional = role === 'REGIONAL_ADMIN';
  const needsBranch = role === 'BRANCH_MANAGER';

  const filteredBranches = useMemo(
    () => branches.filter((b) => b.regionId === regionId),
    [branches, regionId],
  );

  useEffect(() => {
    if (open) {
      setPhone('');
      setName('');
      setEmail('');
      setRegionId('');
      setBranchId('');
      setPassword('');
      setMustChangePassword(true);
      setShowPassword(false);
    }
  }, [open, role]);

  useEffect(() => {
    setBranchId('');
  }, [regionId]);

  const title = isRegional ? 'Create Regional Admin' : 'Create Branch Manager';
  const submitFn = isRegional ? createRegional : createManager;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: any = {
      phone,
      name,
      email: email || undefined,
      regionId,
      password: password || undefined,
      mustChangePassword: password ? mustChangePassword : undefined,
    };

    if (needsBranch) payload.branchId = branchId;

    try {
      await submitFn.mutateAsync(payload);
      onClose();
    } catch {
      // toast in hook
    }
  };

  if (!role) return null;

  return (
    <Modal open={open} onClose={onClose} title={title} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Person info */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Phone Number *"
            placeholder="0911111112"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            autoFocus
            pattern="(\+?251|0)?9\d{8}"
            title="Ethiopian phone"
          />
          <Input
            label="Full Name *"
            placeholder="Oromia Regional Admin"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <Input
          label="Email (optional)"
          type="email"
          placeholder="oromia@deliver.et"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Region */}
        <div>
          <label className="label">Assign to Region *</label>
          <select
            className="input"
            value={regionId}
            onChange={(e) => setRegionId(e.target.value)}
            required
          >
            <option value="">Select a region...</option>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.code})
              </option>
            ))}
          </select>
          {regions.length === 0 && (
            <p className="mt-1 text-xs text-amber-600">
              ⚠️ No regions found. Create a region first.
            </p>
          )}
        </div>

        {/* Branch (only for Branch Manager) */}
        {needsBranch && (
          <div>
            <label className="label">Assign to Branch *</label>
            <select
              className="input"
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              required
              disabled={!regionId}
            >
              <option value="">
                {regionId ? 'Select a branch...' : 'Select a region first'}
              </option>
              {filteredBranches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
            {regionId && filteredBranches.length === 0 && (
              <p className="mt-1 text-xs text-amber-600">
                ⚠️ No branches in this region yet. Create a branch first.
              </p>
            )}
          </div>
        )}

        {/* Password */}
        <div className="border-t pt-4 mt-2">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-700">
              Optional Login Credentials
            </h4>
            <span className="text-xs text-gray-500">
              Can always log in via OTP
            </span>
          </div>

          <div className="relative">
            <Input
              label="Password (optional)"
              type={showPassword ? 'text' : 'password'}
              placeholder="Leave empty for OTP-only login"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              title="Minimum 8 characters"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {password && (
            <label className="flex items-center gap-2 mt-3 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={mustChangePassword}
                onChange={(e) => setMustChangePassword(e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              Require password change on first login
            </label>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitFn.isPending}>
            Cancel
          </Button>
          <Button type="submit" loading={submitFn.isPending}>
            Create Account
          </Button>
        </div>
      </form>
    </Modal>
  );
}
