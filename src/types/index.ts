// ══════════════════════════════════════════════════
// ENUMS
// ══════════════════════════════════════════════════

export enum StaffRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  REGIONAL_ADMIN = 'REGIONAL_ADMIN',
  BRANCH_MANAGER = 'BRANCH_MANAGER',
}

export enum AccountType {
  STAFF = 'STAFF',
  COURIER = 'COURIER',
  CUSTOMER = 'CUSTOMER',
}

export enum CourierStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
}

export enum VehicleType {
  MOTORCYCLE = 'MOTORCYCLE',
  BICYCLE = 'BICYCLE',
  CAR = 'CAR',
  VAN = 'VAN',
  TRUCK = 'TRUCK',
}

export enum PaymentProviderType {
  MOBILE_MONEY = 'MOBILE_MONEY',
  CARD = 'CARD',
  BANK = 'BANK',
  CASH = 'CASH',
  WALLET = 'WALLET',
  CRYPTO = 'CRYPTO',
}

export enum OrderStatus {
  DRAFT = 'DRAFT',
  AWAITING_RECEIVER_LOCATION = 'AWAITING_RECEIVER_LOCATION',
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PAID = 'PAID',
  ASSIGNED = 'ASSIGNED',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED',
}

export enum ItemType {
  PARCEL = 'PARCEL',
  DOCUMENT = 'DOCUMENT',
  BOX = 'BOX',
  ENVELOPE = 'ENVELOPE',
  FOOD = 'FOOD',
  ELECTRONICS = 'ELECTRONICS',
  CLOTHING = 'CLOTHING',
  MEDICINE = 'MEDICINE',
  FRAGILE_ITEM = 'FRAGILE_ITEM',
  OTHER = 'OTHER',
}

export enum PaymentParty {
  SENDER = 'SENDER',
  RECEIVER = 'RECEIVER',
  SPLIT = 'SPLIT',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
  FAILED = 'FAILED',
}

// ══════════════════════════════════════════════════
// CORE
// ══════════════════════════════════════════════════

export interface Staff {
  id: string;
  phone: string;
  name: string;
  email: string | null;
  role: StaffRole;
  regionId: string | null;
  branchId: string | null;
  isActive: boolean;
  phoneVerified: boolean;
  mustChangePassword?: boolean;
  createdAt: string;
  region?: { id: string; name: string; code: string } | null;
  branch?: { id: string; name: string; code: string } | null;
}

export interface Region {
  id: string;
  name: string;
  code: string;
  createdById: string | null;
  createdAt: string;
  createdBy?: { id: string; name: string; phone: string } | null;
  _count?: { staff: number; branches: number; couriers: number };
}

export interface Branch {
  id: string;
  regionId: string;
  name: string;
  code: string;
  city: string | null;
  woreda: string | null;
  address: string | null;
  phone: string | null;
  lat: number | null;
  lng: number | null;
  isActive: boolean;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
  region?: { id: string; name: string; code: string };
  createdBy?: { id: string; name: string; phone: string } | null;
  _count?: { staff: number; couriers: number };
}

export interface Courier {
  id: string;
  phone: string;
  name: string;
  email: string | null;
  regionId: string;
  branchId: string;
  vehicleType: VehicleType;
  vehiclePlate: string | null;
  vehicleModel: string | null;
  vehicleColor: string | null;
  vehicleYear: number | null;
  licenseNumber: string | null;
  maxWeightKg: number | null;
  maxVolumeL: number | null;
  handlesFragile: boolean;
  handlesRefrigerated: boolean;
  nationalIdNumber: string | null;
  nationalIdImageUrl: string | null;
  licenseImageUrl: string | null;
  vehicleImageUrl: string | null;
  selfieUrl: string | null;
  status: CourierStatus;
  rejectionReason: string | null;
  approvedById: string | null;
  approvedAt: string | null;
  rejectedById: string | null;
  rejectedAt: string | null;
  isActive: boolean;
  phoneVerified: boolean;
  suspendedAt: string | null;
  suspendedById: string | null;
  rating: number;
  totalDeliveries: number;
  totalFailed: number;
  isOnline: boolean;
  currentLat: number | null;
  currentLng: number | null;
  lastSeenAt: string | null;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
  region?: { id: string; name: string; code: string };
  branch?: { id: string; name: string; code: string };
}

export interface Customer {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  phoneVerified: boolean;
  emailVerified: boolean;
  isActive: boolean;
  defaultAddress: string | null;
  defaultLat: number | null;
  defaultLng: number | null;
  registeredById: string | null;
  registeredByType: AccountType | null;
  registeredBy?: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
  _count?: { ordersSent: number; ordersReceived: number };
}

export interface PaymentProvider {
  id: string;
  code: string;
  name: string;
  description: string | null;
  type: PaymentProviderType;
  logoUrl: string | null;
  color: string | null;
  sortOrder: number;
  isEnabled: boolean;
  isTestMode: boolean;
  feePercent: number;
  feeFixed: number;
  minAmount: number | null;
  maxAmount: number | null;
  merchantId: string | null;
  webhookUrl: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: { id: string; name: string } | null;
  updatedBy?: { id: string; name: string } | null;
}

// ══════════════════════════════════════════════════
// ORDER
// ══════════════════════════════════════════════════

export interface OrderItem {
  id: string;
  orderId: string;
  type: ItemType;
  description: string | null;
  quantity: number;
  weightKg: number;
  lengthCm: number | null;
  widthCm: number | null;
  heightCm: number | null;
  volumeL: number | null;
  declaredValue: number | null;
  isFragile: boolean;
  isRefrigerated: boolean;
  photoUrl: string | null;
}

export interface OrderEvent {
  id: string;
  orderId: string;
  status: OrderStatus;
  note: string | null;
  location: string | null;
  lat: number | null;
  lng: number | null;
  actorType: AccountType | null;
  actorId: string | null;
  actorName: string | null;
  isPublic: boolean;
  createdAt: string;
}

export interface ReceiverLink {
  id: string;
  shortCode: string;
  status: string;
  expiresAt: string;
  openedAt: string | null;
  filledAt: string | null;
  otpVerified: boolean;
}

export interface Order {
  id: string;
  trackingNumber: string;
  trackingToken: string | null;
  trackingUrl: string | null;

  senderId: string | null;
  senderName: string;
  senderPhone: string;
  senderAddress: string | null;
  senderLat: number | null;
  senderLng: number | null;

  receiverId: string | null;
  receiverName: string | null;
  receiverPhone: string;
  receiverAddress: string | null;
  receiverLat: number | null;
  receiverLng: number | null;
  receiverLocationSource: string | null;

  originBranchId: string | null;
  destBranchId: string | null;
  courierId: string | null;
  distanceKm: number | null;

  totalWeightKg: number;
  totalVolumeL: number;
  isFragile: boolean;
  isRefrigerated: boolean;
  packageDescription: string | null;

  deliveryFee: number;
  codAmount: number;
  courierEarning: number;
  platformFee: number;
  pricingBreakdown: any;

  paymentParty: PaymentParty;
  paymentMethod: string | null;
  paymentStatus: PaymentStatus;

  status: OrderStatus;
  createdAt: string;
  paidAt: string | null;
  assignedAt: string | null;
  pickedUpAt: string | null;
  deliveredAt: string | null;
  failedAt: string | null;
  cancelledAt: string | null;

  deliveryPhotoUrl: string | null;
  deliverySignatureUrl: string | null;
  receiverConfirmed: boolean;
  failureReason: string | null;

  lastCourierLat: number | null;
  lastCourierLng: number | null;
  lastTrackedAt: string | null;
  estimatedArrival: string | null;

  createdById: string | null;

  // Relations
  sender?: { id: string; name: string | null; phone: string; email?: string | null };
  receiver?: { id: string; name: string | null; phone: string; email?: string | null };
  courier?: {
    id: string;
    name: string;
    phone: string;
    vehicleType?: VehicleType;
    vehiclePlate?: string | null;
    rating?: number;
    currentLat?: number | null;
    currentLng?: number | null;
  } | null;
  originBranch?: { id: string; name: string; code: string } | null;
  destBranch?: { id: string; name: string; code: string } | null;
  createdBy?: { id: string; name: string } | null;

  items?: OrderItem[];
  events?: OrderEvent[];
  receiverLinks?: ReceiverLink[];
  payments?: any[];
  _count?: { items: number };
}

// ══════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse extends AuthTokens {
  account: Staff;
  accountType: AccountType;
  mustChangePassword?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
