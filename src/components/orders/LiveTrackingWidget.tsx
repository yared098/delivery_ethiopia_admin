import { useEffect, useState } from 'react';
import {
  MapPin,
  Navigation,
  Clock,
  Bell,
  Wifi,
  WifiOff,
  Truck,
  ExternalLink,
} from 'lucide-react';
import { useOrderTracking } from '@/hooks/useOrderTracking';
import { cn } from '@/lib/utils';

interface Props {
  orderId: string;
  receiverLat?: number | null;
  receiverLng?: number | null;
}

export function LiveTrackingWidget({ orderId, receiverLat, receiverLng }: Props) {
  const { connected, lastLocation, lastAlert, lastStatusChange } = useOrderTracking(orderId);
  const [showAlert, setShowAlert] = useState(false);

  // Show alert popup for 6 seconds when it arrives
  useEffect(() => {
    if (lastAlert) {
      setShowAlert(true);
      const t = setTimeout(() => setShowAlert(false), 6000);
      return () => clearTimeout(t);
    }
  }, [lastAlert]);

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <Navigation className="h-4 w-4 text-primary-600" />
          Live Tracking
        </h3>
        <div>
          {connected ? (
            <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
              <Wifi className="h-3 w-3" /> Live
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-gray-500 font-medium">
              <WifiOff className="h-3 w-3" /> Connecting...
            </span>
          )}
        </div>
      </div>

      {/* Proximity Alert Popup */}
      {showAlert && lastAlert && (
        <div
          className={cn(
            'mb-4 p-3 rounded-md border-2 flex items-center gap-3 animate-pulse',
            lastAlert.level === 'AT_DOOR'
              ? 'bg-green-50 border-green-500 text-green-900'
              : lastAlert.level === 'ARRIVING'
              ? 'bg-blue-50 border-blue-500 text-blue-900'
              : 'bg-amber-50 border-amber-500 text-amber-900',
          )}
        >
          <Bell className="h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-medium">{lastAlert.message}</p>
            <p className="text-xs opacity-75">
              {lastAlert.distanceMeters < 1000
                ? `${Math.round(lastAlert.distanceMeters)} m away`
                : `${(lastAlert.distanceMeters / 1000).toFixed(1)} km away`}
            </p>
          </div>
        </div>
      )}

      {/* Status Change Notice */}
      {lastStatusChange && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-md">
          <p className="text-sm">
            <b>Status:</b> {lastStatusChange.status.replace(/_/g, ' ')}
          </p>
          {lastStatusChange.note && (
            <p className="text-xs mt-0.5">{lastStatusChange.note}</p>
          )}
        </div>
      )}

      {/* Location info */}
      {lastLocation ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
              <Truck className="h-5 w-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">
                {lastLocation.courierName || 'Courier'}
              </p>
              <p className="text-xs text-gray-500">
                Updated {new Date(lastLocation.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>

          {lastLocation.distanceToReceiver != null && (
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 rounded-md">
                <p className="text-xs text-blue-600 mb-1">Distance remaining</p>
                <p className="text-lg font-bold text-blue-900">
                  {lastLocation.distanceToReceiver < 1
                    ? `${Math.round(lastLocation.distanceToReceiver * 1000)} m`
                    : `${lastLocation.distanceToReceiver.toFixed(1)} km`}
                </p>
              </div>
              {lastLocation.etaMinutes != null && (
                <div className="p-3 bg-green-50 rounded-md">
                  <p className="text-xs text-green-600 mb-1">ETA</p>
                  <p className="text-lg font-bold text-green-900">
                    {lastLocation.etaMinutes} min
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded">
            📍 {lastLocation.lat.toFixed(5)}, {lastLocation.lng.toFixed(5)}
          </div>

          <a
            href={`https://www.google.com/maps?q=${lastLocation.lat},${lastLocation.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary-600 hover:underline inline-flex items-center gap-1"
          >
            <MapPin className="h-3 w-3" /> Open in Google Maps
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">Waiting for courier location...</p>
          <p className="text-xs mt-1">
            Live updates will appear here once the courier starts moving
          </p>
        </div>
      )}
    </div>
  );
}
