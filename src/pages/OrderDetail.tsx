// import { useState } from 'react';
// import { useParams, useNavigate, Link } from 'react-router-dom';
// import {
//   ArrowLeft,
//   Package,
//   MapPin,
//   User,
//   Truck,
//   Copy,
//   Send,
//   AlertCircle,
//   Loader2,
//   Clock,
//   Ban,
//   Navigation,
//   DollarSign,
//   Activity,
//   Info,
// } from 'lucide-react';
// import { LiveTrackingMap } from '@/components/orders/LiveTrackingMap';
// import { LiveTrackingWidget } from '@/components/orders/LiveTrackingWidget';
// import { Button } from '@/components/ui/Button';
// import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
// import { useOrder, useCancelOrder, useSendReceiverLink } from '@/hooks/useOrders';
// import { OrderStatus, ItemType } from '@/types';
// import { toast } from 'sonner';
// import { cn } from '@/lib/utils';

// const STATUS_COLORS: Record<OrderStatus, string> = {
//   DRAFT: 'bg-gray-100 text-gray-700 border border-gray-200',
//   AWAITING_RECEIVER_LOCATION: 'bg-purple-50 text-purple-700 border border-purple-200',
//   PENDING_PAYMENT: 'bg-amber-50 text-amber-700 border border-amber-200',
//   PAID: 'bg-blue-50 text-blue-700 border border-blue-200',
//   ASSIGNED: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
//   PICKED_UP: 'bg-cyan-50 text-cyan-700 border border-cyan-200',
//   IN_TRANSIT: 'bg-sky-50 text-sky-700 border border-sky-200',
//   OUT_FOR_DELIVERY: 'bg-orange-50 text-orange-700 border border-orange-200',
//   DELIVERED: 'bg-green-50 text-green-700 border border-green-200',
//   FAILED: 'bg-red-50 text-red-700 border border-red-200',
//   CANCELLED: 'bg-gray-100 text-gray-600 border border-gray-200',
//   RETURNED: 'bg-pink-50 text-pink-700 border border-pink-200',
// };

// const STATUS_LABELS: Record<OrderStatus, string> = {
//   DRAFT: 'Draft',
//   AWAITING_RECEIVER_LOCATION: 'Awaiting Receiver Location',
//   PENDING_PAYMENT: 'Pending Payment',
//   PAID: 'Paid',
//   ASSIGNED: 'Assigned to Courier',
//   PICKED_UP: 'Picked Up',
//   IN_TRANSIT: 'In Transit',
//   OUT_FOR_DELIVERY: 'Out for Delivery',
//   DELIVERED: 'Delivered',
//   FAILED: 'Failed',
//   CANCELLED: 'Cancelled',
//   RETURNED: 'Returned',
// };

// const ITEM_TYPE_LABELS: Record<ItemType, string> = {
//   PARCEL: 'Parcel',
//   DOCUMENT: 'Document',
//   BOX: 'Box',
//   ENVELOPE: 'Envelope',
//   FOOD: 'Food',
//   ELECTRONICS: 'Electronics',
//   CLOTHING: 'Clothing',
//   MEDICINE: 'Medicine',
//   FRAGILE_ITEM: 'Fragile',
//   OTHER: 'Other',
// };

// type TabKey = 'overview' | 'tracking' | 'items' | 'payment' | 'activity';

// function formatDate(d: string | null | undefined) {
//   if (!d) return '—';
//   return new Date(d).toLocaleDateString('en-GB', {
//     day: '2-digit',
//     month: 'short',
//     year: 'numeric',
//     hour: '2-digit',
//     minute: '2-digit',
//   });
// }

// export function OrderDetail() {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();
//   const { data: order, isLoading, error } = useOrder(id || null);
//   const cancel = useCancelOrder();
//   const sendLink = useSendReceiverLink();
//   const [cancelOpen, setCancelOpen] = useState(false);

//   const isTerminal = order?.status === 'DELIVERED' || order?.status === 'CANCELLED';
//   const needsReceiverLocation = order?.status === 'AWAITING_RECEIVER_LOCATION';
//   const activeLink = order?.receiverLinks?.find((l) => l.status === 'ACTIVE');
//   const showLiveTracking =
//     order?.courier &&
//     ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(order.status);

//   // Default tab based on order state
//   const [tab, setTab] = useState<TabKey>(() => {
//     if (showLiveTracking) return 'tracking';
//     return 'overview';
//   });

//   if (isLoading) {
//     return (
//       <div className="p-8 flex items-center justify-center min-h-[60vh]">
//         <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
//       </div>
//     );
//   }

//   if (error || !order) {
//     return (
//       <div className="p-8">
//         <div className="card p-12 text-center">
//           <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
//           <h2 className="text-lg font-semibold mb-2">Order not found</h2>
//           <Button onClick={() => navigate('/orders')}>
//             <ArrowLeft className="h-4 w-4" /> Back to Orders
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   const copyTracking = () => {
//     navigator.clipboard.writeText(order.trackingNumber);
//     toast.success('Tracking number copied');
//   };

//   const handleCancel = async () => {
//     try {
//       await cancel.mutateAsync(order.id);
//       setCancelOpen(false);
//     } catch {}
//   };

//   const handleSendLink = async () => {
//     try {
//       await sendLink.mutateAsync(order.id);
//     } catch {}
//   };

//   // ─── Tabs ───
//   const tabs: Array<{ key: TabKey; label: string; icon: any; badge?: number }> = [
//     { key: 'overview', label: 'Overview', icon: Info },
//     { key: 'tracking', label: 'Live Track', icon: Navigation },
//     { key: 'items', label: 'Items', icon: Package, badge: order.items?.length },
//     { key: 'payment', label: 'Payment', icon: DollarSign },
//     { key: 'activity', label: 'Activity', icon: Activity, badge: order.events?.length },
//   ];

//   return (
//     <div className="p-8 max-w-6xl mx-auto">
//       {/* Back */}
//       <Link
//         to="/orders"
//         className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 mb-4"
//       >
//         <ArrowLeft className="h-4 w-4" /> Back to Orders
//       </Link>

//       {/* ─── Compact Header ─── */}
//       <div className="card p-5 mb-6">
//         <div className="flex items-start justify-between gap-6 flex-wrap">
//           <div className="flex-1 min-w-0">
//             <div className="flex items-center gap-3 mb-2 flex-wrap">
//               <h1 className="text-xl font-bold font-mono text-gray-900 truncate">
//                 {order.trackingNumber}
//               </h1>
//               <button
//                 onClick={copyTracking}
//                 className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
//                 title="Copy tracking number"
//               >
//                 <Copy className="h-4 w-4" />
//               </button>
//               <span
//                 className={cn(
//                   'inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold',
//                   STATUS_COLORS[order.status],
//                 )}
//               >
//                 <span className="h-1.5 w-1.5 rounded-full bg-current" />
//                 {STATUS_LABELS[order.status]}
//               </span>
//             </div>
//             <p className="text-xs text-gray-500">
//               Created {formatDate(order.createdAt)} · Fee:{' '}
//               <span className="font-semibold text-gray-900">
//                 {order.deliveryFee.toFixed(2)} ETB
//               </span>
//             </p>
//           </div>

//           {/* Actions */}
//           <div className="flex gap-2 flex-wrap">
//             {!isTerminal && (
//               <>
//                 {needsReceiverLocation && (
//                   <Button
//                     onClick={handleSendLink}
//                     loading={sendLink.isPending}
//                     className="text-sm"
//                   >
//                     <Send className="h-4 w-4" />
//                     {activeLink ? 'Resend Link' : 'Send Link'}
//                   </Button>
//                 )}
//                 <Button
//                   variant="danger"
//                   onClick={() => setCancelOpen(true)}
//                   className="text-sm"
//                 >
//                   <Ban className="h-4 w-4" /> Cancel
//                 </Button>
//               </>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* ─── Awaiting receiver location banner ─── */}
//       {needsReceiverLocation && (
//         <div className="card p-4 mb-6 border-2 border-purple-200 bg-purple-50">
//           <div className="flex items-start gap-3">
//             <Clock className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
//             <div className="flex-1">
//               <p className="text-sm font-medium text-purple-900">
//                 Waiting for receiver to share location
//               </p>
//               <p className="text-xs text-purple-700 mt-1">
//                 The receiver needs to open the link and share their GPS location
//                 before we can calculate the price and assign a courier.
//               </p>
//               {activeLink && (
//                 <div className="mt-2 text-xs text-purple-800">
//                   <b>Link expires:</b> {formatDate(activeLink.expiresAt)}
//                   {activeLink.openedAt && (
//                     <>
//                       {' · '}
//                       <b>Opened:</b> {formatDate(activeLink.openedAt)}
//                     </>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ─── Tabs ─── */}
//       <div className="card overflow-hidden">
//         {/* Tab bar */}
//         <div className="border-b border-gray-200 bg-gray-50">
//           <div className="flex overflow-x-auto">
//             {tabs.map((t) => {
//               const Icon = t.icon;
//               const isActive = tab === t.key;
//               const isLive = t.key === 'tracking' && showLiveTracking;
//               return (
//                 <button
//                   key={t.key}
//                   onClick={() => setTab(t.key)}
//                   className={cn(
//                     'flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2',
//                     isActive
//                       ? 'bg-white text-primary-700 border-primary-600'
//                       : 'text-gray-600 border-transparent hover:text-gray-900 hover:bg-white/50',
//                   )}
//                 >
//                   <Icon className="h-4 w-4" />
//                   {t.label}
//                   {t.badge != null && t.badge > 0 && (
//                     <span
//                       className={cn(
//                         'text-[10px] px-1.5 py-0.5 rounded-full font-semibold',
//                         isActive
//                           ? 'bg-primary-100 text-primary-700'
//                           : 'bg-gray-200 text-gray-600',
//                       )}
//                     >
//                       {t.badge}
//                     </span>
//                   )}
//                   {isLive && (
//                     <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
//                   )}
//                 </button>
//               );
//             })}
//           </div>
//         </div>

//         {/* Tab content */}
//         <div className="p-6">
//           {/* ─── OVERVIEW ─── */}
//           {tab === 'overview' && (
//             <div className="space-y-6">
//               {/* Route */}
//               <div>
//                 <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
//                   <MapPin className="h-4 w-4 text-primary-600" /> Route
//                 </h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="p-4 border-l-4 border-primary-500 bg-gray-50 rounded-r-md">
//                     <p className="text-[10px] uppercase text-gray-500 font-semibold mb-1">
//                       From
//                     </p>
//                     <p className="font-medium text-gray-900">{order.senderName}</p>
//                     <p className="text-sm text-gray-600 font-mono">
//                       {order.senderPhone}
//                     </p>
//                     {order.senderAddress && (
//                       <p className="text-sm text-gray-500 mt-1">
//                         {order.senderAddress}
//                       </p>
//                     )}
//                   </div>

//                   <div className="p-4 border-l-4 border-green-500 bg-gray-50 rounded-r-md">
//                     <p className="text-[10px] uppercase text-gray-500 font-semibold mb-1">
//                       To
//                     </p>
//                     <p className="font-medium text-gray-900">
//                       {order.receiverName || '(unknown)'}
//                     </p>
//                     <p className="text-sm text-gray-600 font-mono">
//                       {order.receiverPhone}
//                     </p>
//                     {order.receiverAddress && (
//                       <p className="text-sm text-gray-500 mt-1">
//                         {order.receiverAddress}
//                       </p>
//                     )}
//                     {order.receiverLat && order.receiverLng && (
//                       <p className="text-xs text-green-600 mt-1">
//                         📍 GPS: {order.receiverLat.toFixed(4)},{' '}
//                         {order.receiverLng.toFixed(4)}
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* Assigned courier */}
//               {order.courier && (
//                 <div>
//                   <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
//                     <Truck className="h-4 w-4 text-primary-600" /> Assigned Courier
//                   </h3>
//                   <div className="flex items-center gap-4 p-4 bg-orange-50 border border-orange-200 rounded-md">
//                     <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold flex-shrink-0">
//                       {order.courier.name[0]?.toUpperCase()}
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <p className="font-medium">{order.courier.name}</p>
//                       <p className="text-sm text-gray-600 font-mono">
//                         {order.courier.phone}
//                       </p>
//                       {order.courier.vehiclePlate && (
//                         <p className="text-xs text-gray-500">
//                           {order.courier.vehicleType} · {order.courier.vehiclePlate}
//                         </p>
//                       )}
//                     </div>
//                     {order.courier.rating != null && (
//                       <div className="text-right">
//                         <p className="text-yellow-500 text-lg">
//                           ⭐ {order.courier.rating.toFixed(1)}
//                         </p>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}

//               {/* Quick stats */}
//               <div>
//                 <h3 className="text-sm font-semibold text-gray-700 mb-3">
//                   Quick Stats
//                 </h3>
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//                   <StatBox label="Items" value={String(order.items?.length || 0)} />
//                   <StatBox
//                     label="Total weight"
//                     value={`${order.totalWeightKg} kg`}
//                   />
//                   <StatBox
//                     label="Distance"
//                     value={order.distanceKm ? `${order.distanceKm} km` : '—'}
//                   />
//                   <StatBox
//                     label="Fee"
//                     value={`${order.deliveryFee.toFixed(0)} ETB`}
//                   />
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* ─── LIVE TRACKING (Map + Widget) ─── */}
//           {tab === 'tracking' && (
//             <div className="space-y-4">
//               {showLiveTracking ? (
//                 <>
//                   {/* Interactive Map */}
//                   <LiveTrackingMap
//                     orderId={order.id}
//                     senderLat={order.senderLat}
//                     senderLng={order.senderLng}
//                     receiverLat={order.receiverLat}
//                     receiverLng={order.receiverLng}
//                     courierLat={order.courier?.currentLat}
//                     courierLng={order.courier?.currentLng}
//                     courierName={order.courier?.name}
//                     courierPhone={order.courier?.phone}
//                   />

//                   {/* Widget below for stats */}
//                   <LiveTrackingWidget
//                     orderId={order.id}
//                     receiverLat={order.receiverLat}
//                     receiverLng={order.receiverLng}
//                   />
//                 </>
//               ) : !order.courier ? (
//                 <div className="text-center py-12">
//                   <Navigation className="h-12 w-12 text-gray-300 mx-auto mb-3" />
//                   <p className="text-sm font-medium text-gray-700 mb-1">
//                     No courier assigned yet
//                   </p>
//                   <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4">
//                     Assign a courier from the Overview tab to enable live tracking.
//                   </p>
//                   <Button
//                     onClick={() => setTab('overview')}
//                     variant="secondary"
//                     className="text-sm"
//                   >
//                     Go to Overview
//                   </Button>
//                 </div>
//               ) : (
//                 <div className="text-center py-12">
//                   <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
//                   <p className="text-sm font-medium text-gray-700 mb-1">
//                     Waiting for pickup
//                   </p>
//                   <p className="text-xs text-gray-500 max-w-sm mx-auto">
//                     {order.courier.name} has been assigned. Live tracking will
//                     begin once the courier picks up the package.
//                   </p>
//                   <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-md text-xs">
//                     <span className="text-gray-500">Status:</span>
//                     <span className="font-medium">
//                       {STATUS_LABELS[order.status]}
//                     </span>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* ─── ITEMS ─── */}
//           {tab === 'items' && (
//             <div>
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
//                   <Package className="h-4 w-4 text-primary-600" />
//                   {order.items?.length || 0} item
//                   {order.items?.length !== 1 ? 's' : ''}
//                 </h3>
//                 <p className="text-xs text-gray-500">
//                   Total: <b>{order.totalWeightKg} kg</b>
//                 </p>
//               </div>

//               {order.items?.length ? (
//                 <div className="space-y-3">
//                   {order.items.map((item, idx) => (
//                     <div
//                       key={item.id}
//                       className="p-4 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
//                     >
//                       <div className="flex justify-between items-start gap-4">
//                         <div className="flex-1 min-w-0">
//                           <div className="flex items-center gap-2 mb-1">
//                             <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-mono">
//                               #{idx + 1}
//                             </span>
//                             <p className="font-medium text-gray-900">
//                               {item.description || ITEM_TYPE_LABELS[item.type]}
//                             </p>
//                           </div>
//                           <p className="text-xs text-gray-500">
//                             {item.quantity}× {ITEM_TYPE_LABELS[item.type]}
//                           </p>
//                           <div className="flex gap-2 mt-2 flex-wrap">
//                             {item.isFragile && (
//                               <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200">
//                                 📦 Fragile
//                               </span>
//                             )}
//                             {item.isRefrigerated && (
//                               <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">
//                                 ❄️ Refrigerated
//                               </span>
//                             )}
//                             {item.declaredValue && (
//                               <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
//                                 Value: {item.declaredValue} ETB
//                               </span>
//                             )}
//                           </div>
//                         </div>
//                         <div className="text-right flex-shrink-0">
//                           <p className="text-sm font-medium text-gray-900">
//                             {item.weightKg * item.quantity} kg
//                           </p>
//                           <p className="text-xs text-gray-500">
//                             {item.weightKg} kg × {item.quantity}
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <p className="text-sm text-gray-500 text-center py-8">No items</p>
//               )}

//               {order.packageDescription && (
//                 <div className="mt-6 p-4 bg-gray-50 rounded-md">
//                   <p className="text-xs uppercase text-gray-500 font-semibold mb-1">
//                     Package notes
//                   </p>
//                   <p className="text-sm text-gray-700">
//                     {order.packageDescription}
//                   </p>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* ─── PAYMENT ─── */}
//           {tab === 'payment' && (
//             <div className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <h3 className="text-sm font-semibold text-gray-700 mb-3">
//                     Payment Info
//                   </h3>
//                   <div className="space-y-2">
//                     <Row label="Payment party" value={order.paymentParty} />
//                     <Row
//                       label="Payment status"
//                       value={
//                         <span
//                           className={cn(
//                             'text-xs px-2 py-0.5 rounded font-medium',
//                             order.paymentStatus === 'PAID'
//                               ? 'bg-green-50 text-green-700'
//                               : order.paymentStatus === 'PENDING'
//                               ? 'bg-amber-50 text-amber-700'
//                               : 'bg-gray-100 text-gray-600',
//                           )}
//                         >
//                           {order.paymentStatus}
//                         </span>
//                       }
//                     />
//                     {order.paymentMethod && (
//                       <Row label="Method" value={order.paymentMethod} />
//                     )}
//                   </div>
//                 </div>

//                 <div>
//                   <h3 className="text-sm font-semibold text-gray-700 mb-3">
//                     Pricing
//                   </h3>
//                   <div className="space-y-2">
//                     <Row
//                       label="Delivery fee"
//                       value={
//                         <span className="font-bold text-primary-600">
//                           {order.deliveryFee.toFixed(2)} ETB
//                         </span>
//                       }
//                     />
//                     <Row
//                       label="COD amount"
//                       value={`${order.codAmount.toFixed(2)} ETB`}
//                     />
//                     <Row
//                       label="Courier earning"
//                       value={`${order.courierEarning.toFixed(2)} ETB`}
//                     />
//                     <Row
//                       label="Platform fee"
//                       value={`${order.platformFee.toFixed(2)} ETB`}
//                     />
//                   </div>
//                 </div>
//               </div>

//               {order.pricingBreakdown && (
//                 <div className="p-4 bg-gray-50 rounded-md">
//                   <p className="text-xs uppercase text-gray-500 font-semibold mb-2">
//                     Price Breakdown
//                   </p>
//                   <pre className="text-xs text-gray-700 overflow-auto">
//                     {JSON.stringify(order.pricingBreakdown, null, 2)}
//                   </pre>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* ─── ACTIVITY ─── */}
//           {tab === 'activity' && (
//             <div>
//               <h3 className="text-sm font-semibold text-gray-700 mb-4">
//                 Activity Timeline ({order.events?.length || 0})
//               </h3>
//               {order.events?.length ? (
//                 <div className="space-y-4">
//                   {order.events.map((ev, idx) => (
//                     <div key={ev.id} className="flex gap-3">
//                       <div className="flex flex-col items-center flex-shrink-0">
//                         <div
//                           className={cn(
//                             'h-3 w-3 rounded-full mt-1',
//                             idx === 0
//                               ? 'bg-primary-500 ring-4 ring-primary-100'
//                               : 'bg-gray-300',
//                           )}
//                         />
//                         {idx < order.events!.length - 1 && (
//                           <div className="flex-1 w-px bg-gray-200 my-1" />
//                         )}
//                       </div>
//                       <div className="flex-1 pb-4">
//                         <p className="text-sm font-medium">
//                           {STATUS_LABELS[ev.status]}
//                         </p>
//                         {ev.note && (
//                           <p className="text-xs text-gray-600 mt-0.5">{ev.note}</p>
//                         )}
//                         <p className="text-xs text-gray-400 mt-1">
//                           {formatDate(ev.createdAt)}
//                           {ev.actorName && ` · by ${ev.actorName}`}
//                         </p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <p className="text-sm text-gray-500 text-center py-8">
//                   No activity yet
//                 </p>
//               )}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Cancel dialog */}
//       <ConfirmDialog
//         open={cancelOpen}
//         onClose={() => setCancelOpen(false)}
//         onConfirm={handleCancel}
//         title="Cancel Order"
//         message={`Cancel order ${order.trackingNumber}? This cannot be undone.`}
//         confirmText="Cancel Order"
//         variant="danger"
//         loading={cancel.isPending}
//       />
//     </div>
//   );
// }

// // ─── Helper components ───

// function StatBox({ label, value }: { label: string; value: string }) {
//   return (
//     <div className="p-3 bg-gray-50 rounded-md">
//       <p className="text-xs text-gray-500 mb-1">{label}</p>
//       <p className="text-base font-bold text-gray-900">{value}</p>
//     </div>
//   );
// }

// function Row({ label, value }: { label: string; value: React.ReactNode }) {
//   return (
//     <div className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-0">
//       <span className="text-sm text-gray-500">{label}</span>
//       <span className="text-sm font-medium text-gray-900">{value}</span>
//     </div>
//   );
// }

import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  MapPin,
  User,
  Truck,
  Copy,
  Send,
  AlertCircle,
  Loader2,
  Clock,
  Ban,
  Navigation,
  DollarSign,
  Activity,
  Info,
  Check,
  ExternalLink,
  Link2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { LiveTrackingMap } from '@/components/orders/LiveTrackingMap';
import { LiveTrackingWidget } from '@/components/orders/LiveTrackingWidget';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useOrder, useCancelOrder, useSendReceiverLink } from '@/hooks/useOrders';
import { OrderStatus, ItemType } from '@/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const STATUS_COLORS: Record<OrderStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700 border border-gray-200',
  AWAITING_RECEIVER_LOCATION: 'bg-purple-50 text-purple-700 border border-purple-200',
  PENDING_PAYMENT: 'bg-amber-50 text-amber-700 border border-amber-200',
  PAID: 'bg-blue-50 text-blue-700 border border-blue-200',
  ASSIGNED: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  PICKED_UP: 'bg-cyan-50 text-cyan-700 border border-cyan-200',
  IN_TRANSIT: 'bg-sky-50 text-sky-700 border border-sky-200',
  OUT_FOR_DELIVERY: 'bg-orange-50 text-orange-700 border border-orange-200',
  DELIVERED: 'bg-green-50 text-green-700 border border-green-200',
  FAILED: 'bg-red-50 text-red-700 border border-red-200',
  CANCELLED: 'bg-gray-100 text-gray-600 border border-gray-200',
  RETURNED: 'bg-pink-50 text-pink-700 border border-pink-200',
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  DRAFT: 'Draft',
  AWAITING_RECEIVER_LOCATION: 'Awaiting Receiver Location',
  PENDING_PAYMENT: 'Pending Payment',
  PAID: 'Paid',
  ASSIGNED: 'Assigned to Courier',
  PICKED_UP: 'Picked Up',
  IN_TRANSIT: 'In Transit',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  FAILED: 'Failed',
  CANCELLED: 'Cancelled',
  RETURNED: 'Returned',
};

const ITEM_TYPE_LABELS: Record<ItemType, string> = {
  PARCEL: 'Parcel',
  DOCUMENT: 'Document',
  BOX: 'Box',
  ENVELOPE: 'Envelope',
  FOOD: 'Food',
  ELECTRONICS: 'Electronics',
  CLOTHING: 'Clothing',
  MEDICINE: 'Medicine',
  FRAGILE_ITEM: 'Fragile',
  OTHER: 'Other',
};

type TabKey = 'overview' | 'tracking' | 'items' | 'payment' | 'activity';

function formatDate(d: string | null | undefined) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function timeUntil(d: string | null | undefined): string {
  if (!d) return '—';
  const ms = new Date(d).getTime() - Date.now();
  if (ms <= 0) return 'expired';
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading, error } = useOrder(id || null);
  const cancel = useCancelOrder();
  const sendLink = useSendReceiverLink();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const isTerminal = order?.status === 'DELIVERED' || order?.status === 'CANCELLED';
  const needsReceiverLocation = order?.status === 'AWAITING_RECEIVER_LOCATION';

  // Pick the latest receiver link (active if any, else most recent)
  const allLinks = order?.receiverLinks ?? [];
  const activeLink =
    allLinks.find((l) => l.status === 'ACTIVE') ?? allLinks[0] ?? null;

  const showLiveTracking =
    order?.courier &&
    ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(order.status);

  const [tab, setTab] = useState<TabKey>(() => {
    if (showLiveTracking) return 'tracking';
    return 'overview';
  });

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-8">
        <div className="card p-12 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Order not found</h2>
          <Button onClick={() => navigate('/orders')}>
            <ArrowLeft className="h-4 w-4" /> Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  const copyTracking = () => {
    navigator.clipboard.writeText(order.trackingNumber);
    toast.success('Tracking number copied');
  };

  const handleCancel = async () => {
    try {
      await cancel.mutateAsync(order.id);
      setCancelOpen(false);
    } catch {}
  };

  const handleSendLink = async () => {
    try {
      await sendLink.mutateAsync(order.id);
      toast.success('Receiver link sent via SMS');
    } catch {}
  };

  const copyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy link');
    }
  };

  const tabs: Array<{ key: TabKey; label: string; icon: any; badge?: number }> = [
    { key: 'overview', label: 'Overview', icon: Info },
    { key: 'tracking', label: 'Live Track', icon: Navigation },
    { key: 'items', label: 'Items', icon: Package, badge: order.items?.length },
    { key: 'payment', label: 'Payment', icon: DollarSign },
    { key: 'activity', label: 'Activity', icon: Activity, badge: order.events?.length },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Link
        to="/orders"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Orders
      </Link>

      {/* ─── Compact Header ─── */}
      <div className="card p-5 mb-6">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-xl font-bold font-mono text-gray-900 truncate">
                {order.trackingNumber}
              </h1>
              <button
                onClick={copyTracking}
                className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                title="Copy tracking number"
              >
                <Copy className="h-4 w-4" />
              </button>
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold',
                  STATUS_COLORS[order.status],
                )}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {STATUS_LABELS[order.status]}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Created {formatDate(order.createdAt)} · Fee:{' '}
              <span className="font-semibold text-gray-900">
                {order.deliveryFee.toFixed(2)} ETB
              </span>
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            {!isTerminal && (
              <>
                {needsReceiverLocation && (
                  <Button
                    onClick={handleSendLink}
                    loading={sendLink.isPending}
                    className="text-sm"
                  >
                    <Send className="h-4 w-4" />
                    {activeLink ? 'Resend Link' : 'Send Link'}
                  </Button>
                )}
                <Button
                  variant="danger"
                  onClick={() => setCancelOpen(true)}
                  className="text-sm"
                >
                  <Ban className="h-4 w-4" /> Cancel
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          RECEIVER LINK CARD — only when awaiting location
      ══════════════════════════════════════════════════ */}
      {needsReceiverLocation && activeLink && (
        <ReceiverLinkCard
          link={activeLink}
          receiverPhone={order.receiverPhone}
          onCopy={() => copyLink(activeLink.url)}
          onResend={handleSendLink}
          resending={sendLink.isPending}
          copied={copied}
        />
      )}

      {/* Fallback: awaiting location but no link yet */}
      {needsReceiverLocation && !activeLink && (
        <div className="card p-4 mb-6 border-2 border-dashed border-purple-200 bg-purple-50/50">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-purple-900">
                Waiting for receiver to share location
              </p>
              <p className="text-xs text-purple-700 mt-1">
                No receiver link generated yet. Click <b>Send Link</b> to create
                one and notify the receiver via SMS.
              </p>
            </div>
            <Button
              onClick={handleSendLink}
              loading={sendLink.isPending}
              className="text-sm flex-shrink-0"
            >
              <Send className="h-4 w-4" /> Send Link
            </Button>
          </div>
        </div>
      )}

      {/* ─── Tabs ─── */}
      <div className="card overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex overflow-x-auto">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = tab === t.key;
              const isLive = t.key === 'tracking' && showLiveTracking;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={cn(
                    'flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2',
                    isActive
                      ? 'bg-white text-primary-700 border-primary-600'
                      : 'text-gray-600 border-transparent hover:text-gray-900 hover:bg-white/50',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {t.label}
                  {t.badge != null && t.badge > 0 && (
                    <span
                      className={cn(
                        'text-[10px] px-1.5 py-0.5 rounded-full font-semibold',
                        isActive
                          ? 'bg-primary-100 text-primary-700'
                          : 'bg-gray-200 text-gray-600',
                      )}
                    >
                      {t.badge}
                    </span>
                  )}
                  {isLive && (
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          {/* ─── OVERVIEW ─── */}
          {tab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary-600" /> Route
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border-l-4 border-primary-500 bg-gray-50 rounded-r-md">
                    <p className="text-[10px] uppercase text-gray-500 font-semibold mb-1">
                      From
                    </p>
                    <p className="font-medium text-gray-900">{order.senderName}</p>
                    <p className="text-sm text-gray-600 font-mono">
                      {order.senderPhone}
                    </p>
                    {order.senderAddress && (
                      <p className="text-sm text-gray-500 mt-1">
                        {order.senderAddress}
                      </p>
                    )}
                  </div>

                  <div className="p-4 border-l-4 border-green-500 bg-gray-50 rounded-r-md">
                    <p className="text-[10px] uppercase text-gray-500 font-semibold mb-1">
                      To
                    </p>
                    <p className="font-medium text-gray-900">
                      {order.receiverName || '(unknown)'}
                    </p>
                    <p className="text-sm text-gray-600 font-mono">
                      {order.receiverPhone}
                    </p>
                    {order.receiverAddress && (
                      <p className="text-sm text-gray-500 mt-1">
                        {order.receiverAddress}
                      </p>
                    )}
                    {order.receiverLat && order.receiverLng && (
                      <p className="text-xs text-green-600 mt-1">
                        📍 GPS: {order.receiverLat.toFixed(4)},{' '}
                        {order.receiverLng.toFixed(4)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {order.courier && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Truck className="h-4 w-4 text-primary-600" /> Assigned Courier
                  </h3>
                  <div className="flex items-center gap-4 p-4 bg-orange-50 border border-orange-200 rounded-md">
                    <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold flex-shrink-0">
                      {order.courier.name[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{order.courier.name}</p>
                      <p className="text-sm text-gray-600 font-mono">
                        {order.courier.phone}
                      </p>
                      {order.courier.vehiclePlate && (
                        <p className="text-xs text-gray-500">
                          {order.courier.vehicleType} · {order.courier.vehiclePlate}
                        </p>
                      )}
                    </div>
                    {order.courier.rating != null && (
                      <div className="text-right">
                        <p className="text-yellow-500 text-lg">
                          ⭐ {order.courier.rating.toFixed(1)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Quick Stats
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <StatBox label="Items" value={String(order.items?.length || 0)} />
                  <StatBox label="Total weight" value={`${order.totalWeightKg} kg`} />
                  <StatBox
                    label="Distance"
                    value={order.distanceKm ? `${order.distanceKm} km` : '—'}
                  />
                  <StatBox
                    label="Fee"
                    value={`${order.deliveryFee.toFixed(0)} ETB`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ─── TRACKING ─── */}
          {tab === 'tracking' && (
            <div className="space-y-4">
              {showLiveTracking ? (
                <>
                  <LiveTrackingMap
                    orderId={order.id}
                    senderLat={order.senderLat}
                    senderLng={order.senderLng}
                    receiverLat={order.receiverLat}
                    receiverLng={order.receiverLng}
                    courierLat={order.courier?.currentLat}
                    courierLng={order.courier?.currentLng}
                    courierName={order.courier?.name}
                    courierPhone={order.courier?.phone}
                  />
                  <LiveTrackingWidget
                    orderId={order.id}
                    receiverLat={order.receiverLat}
                    receiverLng={order.receiverLng}
                  />
                </>
              ) : !order.courier ? (
                <div className="text-center py-12">
                  <Navigation className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    No courier assigned yet
                  </p>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4">
                    Assign a courier from the Overview tab to enable live tracking.
                  </p>
                  <Button
                    onClick={() => setTab('overview')}
                    variant="secondary"
                    className="text-sm"
                  >
                    Go to Overview
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Waiting for pickup
                  </p>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    {order.courier.name} has been assigned. Live tracking will
                    begin once the courier picks up the package.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ─── ITEMS ─── */}
          {tab === 'items' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary-600" />
                  {order.items?.length || 0} item
                  {order.items?.length !== 1 ? 's' : ''}
                </h3>
                <p className="text-xs text-gray-500">
                  Total: <b>{order.totalWeightKg} kg</b>
                </p>
              </div>

              {order.items?.length ? (
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-4 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-mono">
                              #{idx + 1}
                            </span>
                            <p className="font-medium text-gray-900">
                              {item.description || ITEM_TYPE_LABELS[item.type]}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500">
                            {item.quantity}× {ITEM_TYPE_LABELS[item.type]}
                          </p>
                          <div className="flex gap-2 mt-2 flex-wrap">
                            {item.isFragile && (
                              <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200">
                                📦 Fragile
                              </span>
                            )}
                            {item.isRefrigerated && (
                              <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">
                                ❄️ Refrigerated
                              </span>
                            )}
                            {item.declaredValue && (
                              <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                Value: {item.declaredValue} ETB
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-medium text-gray-900">
                            {item.weightKg * item.quantity} kg
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.weightKg} kg × {item.quantity}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">No items</p>
              )}

              {order.packageDescription && (
                <div className="mt-6 p-4 bg-gray-50 rounded-md">
                  <p className="text-xs uppercase text-gray-500 font-semibold mb-1">
                    Package notes
                  </p>
                  <p className="text-sm text-gray-700">
                    {order.packageDescription}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ─── PAYMENT ─── */}
          {tab === 'payment' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Payment Info
                  </h3>
                  <div className="space-y-2">
                    <Row label="Payment party" value={order.paymentParty} />
                    <Row
                      label="Payment status"
                      value={
                        <span
                          className={cn(
                            'text-xs px-2 py-0.5 rounded font-medium',
                            order.paymentStatus === 'PAID'
                              ? 'bg-green-50 text-green-700'
                              : order.paymentStatus === 'PENDING'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-gray-100 text-gray-600',
                          )}
                        >
                          {order.paymentStatus}
                        </span>
                      }
                    />
                    {order.paymentMethod && (
                      <Row label="Method" value={order.paymentMethod} />
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Pricing
                  </h3>
                  <div className="space-y-2">
                    <Row
                      label="Delivery fee"
                      value={
                        <span className="font-bold text-primary-600">
                          {order.deliveryFee.toFixed(2)} ETB
                        </span>
                      }
                    />
                    <Row
                      label="COD amount"
                      value={`${order.codAmount.toFixed(2)} ETB`}
                    />
                    <Row
                      label="Courier earning"
                      value={`${order.courierEarning.toFixed(2)} ETB`}
                    />
                    <Row
                      label="Platform fee"
                      value={`${order.platformFee.toFixed(2)} ETB`}
                    />
                  </div>
                </div>
              </div>

              {order.pricingBreakdown && (
                <div className="p-4 bg-gray-50 rounded-md">
                  <p className="text-xs uppercase text-gray-500 font-semibold mb-2">
                    Price Breakdown
                  </p>
                  <pre className="text-xs text-gray-700 overflow-auto">
                    {JSON.stringify(order.pricingBreakdown, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* ─── ACTIVITY ─── */}
          {tab === 'activity' && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-4">
                Activity Timeline ({order.events?.length || 0})
              </h3>
              {order.events?.length ? (
                <div className="space-y-4">
                  {order.events.map((ev, idx) => (
                    <div key={ev.id} className="flex gap-3">
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div
                          className={cn(
                            'h-3 w-3 rounded-full mt-1',
                            idx === 0
                              ? 'bg-primary-500 ring-4 ring-primary-100'
                              : 'bg-gray-300',
                          )}
                        />
                        {idx < order.events!.length - 1 && (
                          <div className="flex-1 w-px bg-gray-200 my-1" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="text-sm font-medium">
                          {STATUS_LABELS[ev.status]}
                        </p>
                        {ev.note && (
                          <p className="text-xs text-gray-600 mt-0.5">{ev.note}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(ev.createdAt)}
                          {ev.actorName && ` · by ${ev.actorName}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">
                  No activity yet
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleCancel}
        title="Cancel Order"
        message={`Cancel order ${order.trackingNumber}? This cannot be undone.`}
        confirmText="Cancel Order"
        variant="danger"
        loading={cancel.isPending}
      />
    </div>
  );
}

// ══════════════════════════════════════════════════
// RECEIVER LINK CARD
// ══════════════════════════════════════════════════
interface ReceiverLinkCardProps {
  link: {
    id: string;
    shortCode: string;
    url: string;
    status: string;
    expiresAt: string;
    openedAt?: string | null;
    filledAt?: string | null;
    otpVerified?: boolean;
  };
  receiverPhone: string;
  onCopy: () => void;
  onResend: () => void;
  resending: boolean;
  copied: boolean;
}

function ReceiverLinkCard({
  link,
  receiverPhone,
  onCopy,
  onResend,
  resending,
  copied,
}: ReceiverLinkCardProps) {
  const isActive = link.status === 'ACTIVE';
  const isUsed = link.status === 'USED';
  const isExpired =
    link.status === 'EXPIRED' ||
    (!isUsed && new Date(link.expiresAt).getTime() < Date.now());

  const stateColor = isUsed
    ? 'border-green-200 bg-green-50'
    : isExpired
    ? 'border-red-200 bg-red-50'
    : 'border-purple-200 bg-purple-50';

  const stateIcon = isUsed ? (
    <CheckCircle2 className="h-5 w-5 text-green-600" />
  ) : isExpired ? (
    <XCircle className="h-5 w-5 text-red-600" />
  ) : (
    <Clock className="h-5 w-5 text-purple-600" />
  );

  const stateTitle = isUsed
    ? 'Receiver shared their location ✓'
    : isExpired
    ? 'Link expired'
    : 'Waiting for receiver to share location';

  return (
    <div className={cn('card p-5 mb-6 border-2', stateColor)}>
      <div className="flex items-start gap-3 mb-4">
        <div className="flex-shrink-0 mt-0.5">{stateIcon}</div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900">{stateTitle}</h3>
          <p className="text-xs text-gray-600 mt-0.5">
            {isUsed ? (
              <>
                Location received{' '}
                {link.filledAt ? `on ${formatDate(link.filledAt)}` : ''}. Order is
                ready for courier assignment.
              </>
            ) : isExpired ? (
              <>
                The link expired. Click <b>Resend Link</b> to generate a fresh
                one and send an SMS.
              </>
            ) : (
              <>
                We sent an SMS to{' '}
                <span className="font-mono font-semibold text-gray-800">
                  {receiverPhone}
                </span>
                . The receiver will tap the link to share their GPS.
              </>
            )}
          </p>
        </div>
      </div>

      {/* Link URL — only show when active or used */}
      <div className="mb-3">
        <label className="label text-xs flex items-center gap-1">
          <Link2 className="h-3 w-3" /> Receiver link
        </label>
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={link.url}
            onClick={(e) => (e.target as HTMLInputElement).select()}
            className="input flex-1 text-xs font-mono bg-white"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={onCopy}
            className="whitespace-nowrap text-xs"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-green-600" /> Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" /> Copy
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Metadata grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <MetaBox label="Short code" value={link.shortCode} mono />
        <MetaBox
          label="Status"
          value={
            <span
              className={cn(
                'text-xs font-semibold px-2 py-0.5 rounded',
                isUsed
                  ? 'bg-green-100 text-green-700'
                  : isExpired
                  ? 'bg-red-100 text-red-700'
                  : 'bg-purple-100 text-purple-700',
              )}
            >
              {isUsed ? 'Used' : isExpired ? 'Expired' : 'Active'}
            </span>
          }
        />
        <MetaBox
          label="Expires"
          value={
            isUsed
              ? '—'
              : isExpired
              ? 'expired'
              : `in ${timeUntil(link.expiresAt)}`
          }
        />
        <MetaBox
          label="Opened"
          value={link.openedAt ? formatDate(link.openedAt) : 'Not yet'}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-gray-200/60">
        <a
          href={link.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-700 bg-white border border-primary-200 rounded-md hover:bg-primary-50"
        >
          <ExternalLink className="h-3.5 w-3.5" /> Preview page
        </a>
        {!isUsed && (
          <Button
            type="button"
            variant="secondary"
            onClick={onResend}
            loading={resending}
            className="text-xs"
          >
            <Send className="h-3.5 w-3.5" /> Resend SMS
          </Button>
        )}
      </div>
    </div>
  );
}

function MetaBox({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="bg-white/70 border border-gray-200 rounded-md px-3 py-2">
      <p className="text-[10px] uppercase text-gray-500 font-semibold mb-0.5">
        {label}
      </p>
      <p className={cn('text-xs text-gray-900', mono && 'font-mono')}>{value}</p>
    </div>
  );
}

// ─── Helper components ───

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 bg-gray-50 rounded-md">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-base font-bold text-gray-900">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}