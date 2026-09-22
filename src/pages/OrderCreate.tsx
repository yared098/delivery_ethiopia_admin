import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  User,
  MapPin,
  Package,
  CheckCircle2,
  Plus,
  Trash2,
  Send,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  MessageSquare,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCreateOrder } from '@/hooks/useOrders';
import { useLookupCustomer } from '@/hooks/useCustomers';
import { useRegions } from '@/hooks/useRegions';
import { useBranches } from '@/hooks/useBranches';
import { ItemType, PaymentParty, type Customer } from '@/types';
import { cn } from '@/lib/utils';

const ITEM_TYPE_LABELS: Record<ItemType, string> = {
  PARCEL: 'Parcel',
  DOCUMENT: 'Document',
  BOX: 'Box / Carton',
  ENVELOPE: 'Envelope',
  FOOD: 'Food',
  ELECTRONICS: 'Electronics',
  CLOTHING: 'Clothing',
  MEDICINE: 'Medicine',
  FRAGILE_ITEM: 'Fragile Item',
  OTHER: 'Other',
};

interface ItemForm {
  type?: ItemType;
  description: string;
  quantity: number;
  weightKg: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  declaredValue?: number;
  isFragile: boolean;
  isRefrigerated: boolean;
}

interface SenderForm {
  customerId?: string;
  name: string;
  phone: string;
  address: string;
  lat?: number;
  lng?: number;
}

interface ReceiverForm {
  customerId?: string;
  name: string;
  phone: string;
  address: string;
  lat?: number;
  lng?: number;
  sendLink: boolean;
}

/**
 * Shape of the receiverLink object returned by the backend
 * when the order was created with `sendReceiverLink: true`.
 */
interface ReceiverLinkResult {
  id: string;
  shortCode: string;
  url: string;
  expiresAt: string;
  phone: string;
}

interface CreateOrderResult {
  order: { id: string; trackingNumber: string; status: string };
  receiverLink: ReceiverLinkResult | null;
  courierAssigned: any | null;
}

export function OrderCreate() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [error, setError] = useState('');

  const [sender, setSender] = useState<SenderForm>({
    name: '',
    phone: '',
    address: '',
  });
  const [receiver, setReceiver] = useState<ReceiverForm>({
    name: '',
    phone: '',
    address: '',
    sendLink: false,
  });
  const [items, setItems] = useState<ItemForm[]>([
    {
      description: '',
      quantity: 1,
      weightKg: 0,
      isFragile: false,
      isRefrigerated: false,
    },
  ]);

  const [originBranchId, setOriginBranchId] = useState('');
  const [regionId, setRegionId] = useState('');
  const [paymentParty, setPaymentParty] = useState<PaymentParty>(PaymentParty.SENDER);
  const [codAmount, setCodAmount] = useState(0);
  const [packageDescription, setPackageDescription] = useState('');

  // 🆕 Result of a successful create that included a receiver link
  const [linkResult, setLinkResult] = useState<CreateOrderResult | null>(null);

  const senderLookup = useLookupCustomer(sender.phone.length >= 9 ? sender.phone : null);
  const receiverLookup = useLookupCustomer(receiver.phone.length >= 9 ? receiver.phone : null);

  const { data: regions = [] } = useRegions();
  const { data: branches = [] } = useBranches({ regionId: regionId || undefined });

  const create = useCreateOrder();

  const canProceed = (): boolean => {
    setError('');
    if (step === 1) {
      if (!sender.name.trim()) {
        setError('Sender name is required');
        return false;
      }
      if (!/^(\+?251|0)?9\d{8}$/.test(sender.phone)) {
        setError('Invalid sender phone (e.g. 0911223344)');
        return false;
      }
      return true;
    }
    if (step === 2) {
      if (!/^(\+?251|0)?9\d{8}$/.test(receiver.phone)) {
        setError('Invalid receiver phone');
        return false;
      }
      // If we're NOT sending a link, address is required.
      // If we ARE sending a link, name/address are optional.
      if (!receiver.sendLink) {
        if (!receiver.name.trim()) {
          setError('Receiver name is required (or check "Send link")');
          return false;
        }
        if (!receiver.address.trim()) {
          setError('Receiver address is required (or check "Send link")');
          return false;
        }
      }
      return true;
    }
    if (step === 3) {
      const valid = items.every(
        (it) =>
          it.description.trim().length >= 2 &&
          it.weightKg > 0 &&
          (it.quantity || 1) >= 1,
      );
      if (!valid) {
        setError('Each item needs a name (min 2 chars) and weight > 0');
        return false;
      }
      return true;
    }
    return true;
  };

  const next = () => {
    if (canProceed()) setStep(step + 1);
  };

  const back = () => setStep(step - 1);

  const addItem = () => {
    setItems([
      ...items,
      {
        description: '',
        quantity: 1,
        weightKg: 0,
        isFragile: false,
        isRefrigerated: false,
      },
    ]);
  };

  const removeItem = (i: number) => {
    setItems(items.filter((_, idx) => idx !== i));
  };

  const updateItem = (i: number, patch: Partial<ItemForm>) => {
    setItems(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  };

  const applySenderLookup = (c: Customer) => {
    setSender({
      customerId: c.id,
      name: c.name || '',
      phone: c.phone,
      address: c.defaultAddress || '',
      lat: c.defaultLat ?? undefined,
      lng: c.defaultLng ?? undefined,
    });
  };

  const applyReceiverLookup = (c: Customer) => {
    setReceiver({
      ...receiver,
      customerId: c.id,
      name: c.name || '',
      phone: c.phone,
      address: c.defaultAddress || '',
      lat: c.defaultLat ?? undefined,
      lng: c.defaultLng ?? undefined,
    });
  };

  const handleSubmit = async () => {
    if (!canProceed()) return;

    const payload = {
      sender: {
        customerId: sender.customerId,
        name: sender.name,
        phone: sender.phone,
        address: sender.address || undefined,
        lat: sender.lat,
        lng: sender.lng,
      },
      receiver: {
        customerId: receiver.customerId,
        // When sendLink is true, omit address + GPS so backend treats it as "unknown location"
        name: receiver.sendLink ? undefined : receiver.name || undefined,
        phone: receiver.phone,
        address: receiver.sendLink ? undefined : receiver.address || undefined,
        lat: receiver.sendLink ? undefined : receiver.lat,
        lng: receiver.sendLink ? undefined : receiver.lng,
      },
      items: items.map((it) => ({
        type: it.type,
        description: it.description,
        quantity: it.quantity,
        weightKg: it.weightKg,
        lengthCm: it.lengthCm,
        widthCm: it.widthCm,
        heightCm: it.heightCm,
        declaredValue: it.declaredValue,
        isFragile: it.isFragile,
        isRefrigerated: it.isRefrigerated,
      })),
      originBranchId: originBranchId || undefined,
      packageDescription: packageDescription || undefined,
      paymentParty,
      sendReceiverLink: receiver.sendLink,
      codAmount: codAmount || undefined,
    };

    try {
      const res = (await create.mutateAsync(payload)) as CreateOrderResult;

      // 🆕 If the backend returned a receiver link, show the success panel
      if (res.receiverLink) {
        setLinkResult(res);
        return; // stay on page — user will see the link panel
      }

      // Otherwise → normal redirect
      navigate(`/orders/${res.order.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create order');
    }
  };

  // ══════════════════════════════════════════════════
  // SUCCESS PANEL — shown after creating an order that
  // included a receiver link
  // ══════════════════════════════════════════════════
  if (linkResult?.receiverLink) {
    return (
      <ReceiverLinkSuccess
        result={linkResult}
        onGoToOrder={() => navigate(`/orders/${linkResult.order.id}`)}
        onCreateAnother={() => {
          setLinkResult(null);
          setStep(1);
          setSender({ name: '', phone: '', address: '' });
          setReceiver({ name: '', phone: '', address: '', sendLink: false });
          setItems([
            {
              description: '',
              quantity: 1,
              weightKg: 0,
              isFragile: false,
              isRefrigerated: false,
            },
          ]);
          setOriginBranchId('');
          setRegionId('');
          setPaymentParty(PaymentParty.SENDER);
          setCodAmount(0);
          setPackageDescription('');
        }}
      />
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Link
        to="/orders"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Orders
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">New Order</h1>
        <p className="text-sm text-gray-500 mt-1">Create a new delivery order</p>
      </div>

      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center">
          {[1, 2, 3, 4].map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={cn(
                  'flex items-center justify-center h-9 w-9 rounded-full text-sm font-semibold transition-colors',
                  s < step
                    ? 'bg-green-500 text-white'
                    : s === step
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-500',
                )}
              >
                {s < step ? <CheckCircle2 className="h-5 w-5" /> : s}
              </div>
              {i < 3 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2 transition-colors',
                    s < step ? 'bg-green-500' : 'bg-gray-200',
                  )}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs font-medium text-gray-500">
          <span>Sender</span>
          <span>Receiver</span>
          <span>Items</span>
          <span>Review</span>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          STEP 1: SENDER
      ══════════════════════════════════════════════════ */}
      {step === 1 && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-primary-600" /> Sender Information
          </h2>

          <div className="space-y-4">
            <div className="relative">
              <Input
                label="Sender Phone *"
                placeholder="0911223344"
                value={sender.phone}
                onChange={(e) => setSender({ ...sender, phone: e.target.value })}
                autoFocus
              />
              {senderLookup.isLoading && (
                <div className="absolute right-3 top-[34px]">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                </div>
              )}
            </div>

            {senderLookup.data && !sender.customerId && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-xs text-blue-800 mb-2">✅ Existing customer found:</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{senderLookup.data.name}</p>
                    <p className="text-xs text-gray-600 font-mono">
                      {senderLookup.data.phone}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    className="text-xs"
                    onClick={() => applySenderLookup(senderLookup.data!)}
                  >
                    Use this
                  </Button>
                </div>
              </div>
            )}

            <Input
              label="Sender Name *"
              placeholder="Almaz Tesfaye"
              value={sender.name}
              onChange={(e) => setSender({ ...sender, name: e.target.value })}
            />

            <div>
              <label className="label">Sender Address</label>
              <textarea
                className="input min-h-[60px]"
                placeholder="Bole, Addis Ababa"
                value={sender.address}
                onChange={(e) => setSender({ ...sender, address: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Latitude (optional)"
                type="number"
                step="any"
                placeholder="9.03"
                value={sender.lat?.toString() || ''}
                onChange={(e) =>
                  setSender({
                    ...sender,
                    lat: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
              <Input
                label="Longitude (optional)"
                type="number"
                step="any"
                placeholder="38.74"
                value={sender.lng?.toString() || ''}
                onChange={(e) =>
                  setSender({
                    ...sender,
                    lng: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
            </div>

            <div className="border-t pt-4">
              <label className="label">Origin Branch</label>
              <div className="grid grid-cols-2 gap-4">
                <select
                  className="input"
                  value={regionId}
                  onChange={(e) => {
                    setRegionId(e.target.value);
                    setOriginBranchId('');
                  }}
                >
                  <option value="">Select region...</option>
                  {regions.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
                <select
                  className="input"
                  value={originBranchId}
                  onChange={(e) => setOriginBranchId(e.target.value)}
                  disabled={!regionId}
                >
                  <option value="">
                    {regionId ? 'Select branch...' : 'Select region first'}
                  </option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          STEP 2: RECEIVER
      ══════════════════════════════════════════════════ */}
      {step === 2 && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary-600" /> Receiver Information
          </h2>

          <div className="space-y-4">
            <div className="relative">
              <Input
                label="Receiver Phone *"
                placeholder="0915566778"
                value={receiver.phone}
                onChange={(e) => setReceiver({ ...receiver, phone: e.target.value })}
                autoFocus
              />
              {receiverLookup.isLoading && (
                <div className="absolute right-3 top-[34px]">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                </div>
              )}
            </div>

            {receiverLookup.data && !receiver.customerId && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-xs text-blue-800 mb-2">✅ Existing customer found:</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{receiverLookup.data.name}</p>
                    <p className="text-xs text-gray-600 font-mono">
                      {receiverLookup.data.phone}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    className="text-xs"
                    onClick={() => applyReceiverLookup(receiverLookup.data!)}
                  >
                    Use this
                  </Button>
                </div>
              </div>
            )}

            <Input
              label="Receiver Name"
              placeholder="Kebede Alemu"
              value={receiver.name}
              onChange={(e) => setReceiver({ ...receiver, name: e.target.value })}
              disabled={receiver.sendLink}
            />

            <div>
              <label className="label">Receiver Address</label>
              <textarea
                className="input min-h-[60px]"
                placeholder="Adama, Oromia"
                value={receiver.address}
                onChange={(e) => setReceiver({ ...receiver, address: e.target.value })}
                disabled={receiver.sendLink}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Latitude"
                type="number"
                step="any"
                placeholder="8.54"
                value={receiver.lat?.toString() || ''}
                onChange={(e) =>
                  setReceiver({
                    ...receiver,
                    lat: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                disabled={receiver.sendLink}
              />
              <Input
                label="Longitude"
                type="number"
                step="any"
                placeholder="39.27"
                value={receiver.lng?.toString() || ''}
                onChange={(e) =>
                  setReceiver({
                    ...receiver,
                    lng: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                disabled={receiver.sendLink}
              />
            </div>

            <div className="border-t pt-4">
              <label
                className="flex items-start gap-3 p-4 rounded-md border-2 cursor-pointer transition-colors"
                style={{
                  borderColor: receiver.sendLink ? '#3b82f6' : '#e5e7eb',
                  backgroundColor: receiver.sendLink ? '#eff6ff' : 'transparent',
                }}
              >
                <input
                  type="checkbox"
                  checked={receiver.sendLink}
                  onChange={(e) =>
                    setReceiver({ ...receiver, sendLink: e.target.checked })
                  }
                  className="mt-0.5"
                />
                <div>
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Send className="h-4 w-4 text-blue-600" />
                    Send location request link to receiver
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Use this if you don't know the receiver's address. We'll send
                    an SMS with a secure link — the receiver shares their GPS
                    location, then the order becomes ready.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          STEP 3: ITEMS
      ══════════════════════════════════════════════════ */}
      {step === 3 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Package className="h-5 w-5 text-primary-600" /> Package Items
            </h2>
            <Button variant="secondary" onClick={addItem}>
              <Plus className="h-4 w-4" /> Add Item
            </Button>
          </div>

          <div className="space-y-4">
            {items.map((item, i) => (
              <div key={i} className="border border-gray-200 rounded-md p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-700">Item {i + 1}</p>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(i)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* ✅ Item name — free text (required) */}
                <Input
                  label="Item name *"
                  placeholder="e.g. Books, Old clothes, Laptop bag..."
                  value={item.description}
                  onChange={(e) => updateItem(i, { description: e.target.value })}
                  required
                />

                <div className="grid grid-cols-3 gap-3 mt-3">
                  <Input
                    label="Quantity"
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(i, { quantity: Number(e.target.value) })
                    }
                  />
                  <Input
                    label="Weight per item (kg) *"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="2.5"
                    value={item.weightKg || ''}
                    onChange={(e) =>
                      updateItem(i, { weightKg: Number(e.target.value) })
                    }
                  />
                  <Input
                    label="Declared value (ETB)"
                    type="number"
                    min="0"
                    placeholder="500"
                    value={item.declaredValue || ''}
                    onChange={(e) =>
                      updateItem(i, {
                        declaredValue: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                  />
                </div>

                {/* Optional advanced options */}
                <details className="mt-3">
                  <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                    Advanced options (optional)
                  </summary>
                  <div className="mt-3 space-y-3">
                    <div>
                      <label className="label text-xs">Category (optional)</label>
                      <select
                        className="input"
                        value={item.type || ''}
                        onChange={(e) =>
                          updateItem(i, {
                            type: (e.target.value || undefined) as ItemType,
                          })
                        }
                      >
                        <option value="">— Uncategorized —</option>
                        {Object.entries(ITEM_TYPE_LABELS).map(([k, v]) => (
                          <option key={k} value={k}>{v}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <Input
                        label="Length (cm)"
                        type="number"
                        step="0.1"
                        value={item.lengthCm || ''}
                        onChange={(e) =>
                          updateItem(i, {
                            lengthCm: e.target.value
                              ? Number(e.target.value)
                              : undefined,
                          })
                        }
                      />
                      <Input
                        label="Width (cm)"
                        type="number"
                        step="0.1"
                        value={item.widthCm || ''}
                        onChange={(e) =>
                          updateItem(i, {
                            widthCm: e.target.value
                              ? Number(e.target.value)
                              : undefined,
                          })
                        }
                      />
                      <Input
                        label="Height (cm)"
                        type="number"
                        step="0.1"
                        value={item.heightCm || ''}
                        onChange={(e) =>
                          updateItem(i, {
                            heightCm: e.target.value
                              ? Number(e.target.value)
                              : undefined,
                          })
                        }
                      />
                    </div>

                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.isFragile}
                          onChange={(e) =>
                            updateItem(i, { isFragile: e.target.checked })
                          }
                        />
                        📦 Fragile
                      </label>
                      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.isRefrigerated}
                          onChange={(e) =>
                            updateItem(i, { isRefrigerated: e.target.checked })
                          }
                        />
                        ❄️ Refrigerated
                      </label>
                    </div>
                  </div>
                </details>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <label className="label">General Package Notes</label>
            <textarea
              className="input min-h-[60px]"
              placeholder="Any special handling instructions..."
              value={packageDescription}
              onChange={(e) => setPackageDescription(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          STEP 4: REVIEW
      ══════════════════════════════════════════════════ */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <User className="h-4 w-4 text-primary-600" /> Sender
              </h3>
              <button
                onClick={() => setStep(1)}
                className="text-xs text-primary-600 hover:underline"
              >
                Edit
              </button>
            </div>
            <div className="text-sm space-y-1 text-gray-700">
              <p><b>{sender.name}</b></p>
              <p className="font-mono text-xs text-gray-500">{sender.phone}</p>
              {sender.address && <p>{sender.address}</p>}
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary-600" /> Receiver
              </h3>
              <button
                onClick={() => setStep(2)}
                className="text-xs text-primary-600 hover:underline"
              >
                Edit
              </button>
            </div>
            <div className="text-sm space-y-1 text-gray-700">
              <p><b>{receiver.name || '(not provided)'}</b></p>
              <p className="font-mono text-xs text-gray-500">{receiver.phone}</p>
              {receiver.sendLink ? (
                <p className="text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded inline-block">
                  📩 Location link will be sent via SMS after order is created
                </p>
              ) : (
                receiver.address && <p>{receiver.address}</p>
              )}
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Package className="h-4 w-4 text-primary-600" /> Items
              </h3>
              <button
                onClick={() => setStep(3)}
                className="text-xs text-primary-600 hover:underline"
              >
                Edit
              </button>
            </div>
            <div className="space-y-2">
              {items.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span>
                    {item.quantity}× <b>{item.description || '(unnamed)'}</b>
                    {item.type && (
                      <span className="text-xs text-gray-400 ml-1">
                        ({ITEM_TYPE_LABELS[item.type]})
                      </span>
                    )}
                    {item.isFragile && (
                      <span className="ml-2 text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">
                        Fragile
                      </span>
                    )}
                    {item.isRefrigerated && (
                      <span className="ml-2 text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                        Refrigerated
                      </span>
                    )}
                  </span>
                  <span className="text-gray-600">
                    {item.weightKg * (item.quantity || 1)} kg
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Payment</h3>
            <div className="grid grid-cols-3 gap-3">
              {Object.values(PaymentParty).map((p) => (
                <label
                  key={p}
                  className={cn(
                    'p-3 rounded-md border-2 text-center cursor-pointer transition-colors',
                    paymentParty === p
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300',
                  )}
                >
                  <input
                    type="radio"
                    name="paymentParty"
                    className="sr-only"
                    checked={paymentParty === p}
                    onChange={() => setPaymentParty(p)}
                  />
                  <p className="text-sm font-medium">
                    {p === 'SENDER' ? 'Sender pays' : p === 'RECEIVER' ? 'Receiver pays' : 'Split'}
                  </p>
                </label>
              ))}
            </div>

            {paymentParty === PaymentParty.RECEIVER && (
              <div className="mt-4">
                <Input
                  label="COD Amount (goods value in ETB)"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={codAmount || ''}
                  onChange={(e) => setCodAmount(Number(e.target.value))}
                />
              </div>
            )}
          </div>

          <div className="text-xs text-gray-500 bg-blue-50 border border-blue-200 px-4 py-3 rounded-md">
            💡 Final price will be calculated automatically based on distance,
            weight, item type, and special handling.
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t">
        <Button
          variant="secondary"
          onClick={step === 1 ? () => navigate('/orders') : back}
        >
          <ArrowLeft className="h-4 w-4" />
          {step === 1 ? 'Cancel' : 'Back'}
        </Button>

        {step < 4 ? (
          <Button onClick={next}>
            Next <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} loading={create.isPending}>
            {receiver.sendLink ? (
              <>
                <Send className="h-4 w-4" /> Create & Send Link
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" /> Create Order
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// RECEIVER LINK SUCCESS PANEL
// ══════════════════════════════════════════════════════
function ReceiverLinkSuccess({
  result,
  onGoToOrder,
  onCreateAnother,
}: {
  result: CreateOrderResult;
  onGoToOrder: () => void;
  onCreateAnother: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const link = result.receiverLink!;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const expiresAt = new Date(link.expiresAt);
  const hoursLeft = Math.max(
    0,
    Math.round((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60)),
  );

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
          <CheckCircle2 className="h-9 w-9 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Order Created</h1>
        <p className="text-sm text-gray-500 mt-1">
          Tracking #{result.order.trackingNumber}
        </p>
      </div>

      <div className="card p-6 mb-4">
        <div className="flex items-start gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <MessageSquare className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Location request link sent
            </h2>
            <p className="text-sm text-gray-600 mt-0.5">
              We sent an SMS to{' '}
              <span className="font-mono text-gray-800">{link.phone}</span>.
              They'll tap the link, share their GPS, and the order will
              automatically become ready for a courier.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <label className="label text-xs">Link URL</label>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={link.url}
              className="input flex-1 text-sm font-mono bg-gray-50"
              onFocus={(e) => e.target.select()}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={copy}
              className="whitespace-nowrap"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-green-600" /> Copied                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" /> Copy
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="label text-xs">Short code</label>
              <p className="text-sm font-mono text-gray-800 bg-gray-50 px-3 py-2 rounded">
                {link.shortCode}
              </p>
            </div>
            <div>
              <label className="label text-xs flex items-center gap-1">
                <Clock className="h-3 w-3" /> Expires in
              </label>
              <p className="text-sm text-gray-800 bg-gray-50 px-3 py-2 rounded">
                {hoursLeft} hours
              </p>
            </div>
          </div>

          <a
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary-600 hover:underline mt-4"
          >
            <ExternalLink className="h-3 w-3" /> Preview what the receiver sees
          </a>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6">
        <p className="text-xs text-amber-800">
          <b>What happens next?</b> When the receiver opens the link and shares
          their location, the order status changes from{' '}
          <code className="font-mono bg-amber-100 px-1 rounded">
            AWAITING_RECEIVER_LOCATION
          </code>{' '}
          to{' '}
          <code className="font-mono bg-amber-100 px-1 rounded">
            PENDING_PAYMENT
          </code>
          , and a courier can be assigned.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="secondary" onClick={onCreateAnother}>
          <Plus className="h-4 w-4" /> Create Another
        </Button>
        <Button onClick={onGoToOrder}>
          View Order <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}