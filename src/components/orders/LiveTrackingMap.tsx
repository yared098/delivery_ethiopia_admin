import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { useOrderTracking } from '@/hooks/useOrderTracking';
import { senderIcon, receiverIcon, courierIcon } from './map-markers';
import { Navigation, Loader2, ExternalLink } from 'lucide-react';
import '@/lib/leaflet-fix';

interface Props {
  orderId: string;
  senderLat?: number | null;
  senderLng?: number | null;
  receiverLat?: number | null;
  receiverLng?: number | null;
  courierLat?: number | null;
  courierLng?: number | null;
  courierName?: string;
  courierPhone?: string;
}

export function LiveTrackingMap({
  orderId,
  senderLat,
  senderLng,
  receiverLat,
  receiverLng,
  courierLat,
  courierLng,
  courierName,
  courierPhone,
}: Props) {
  const { connected, lastLocation } = useOrderTracking(orderId);
  const mapRef = useRef<any>(null);

  // Live courier position (prefer socket data over initial prop)
  const liveCourierLat = lastLocation?.lat ?? courierLat ?? null;
  const liveCourierLng = lastLocation?.lng ?? courierLng ?? null;

  // Determine center of the map
  const center = useMemo<[number, number]>(() => {
    // Prefer courier's position
    if (liveCourierLat != null && liveCourierLng != null) {
      return [liveCourierLat, liveCourierLng];
    }
    // Fall back to receiver
    if (receiverLat != null && receiverLng != null) {
      return [receiverLat, receiverLng];
    }
    // Fall back to sender
    if (senderLat != null && senderLng != null) {
      return [senderLat, senderLng];
    }
    // Default to Addis Ababa
    return [9.0192, 38.7525];
  }, [liveCourierLat, liveCourierLng, receiverLat, receiverLng, senderLat, senderLng]);

  // Fit bounds when we have all coordinates
  useEffect(() => {
    if (!mapRef.current) return;
    const points: [number, number][] = [];
    if (senderLat != null && senderLng != null) points.push([senderLat, senderLng]);
    if (receiverLat != null && receiverLng != null) points.push([receiverLat, receiverLng]);
    if (liveCourierLat != null && liveCourierLng != null) points.push([liveCourierLat, liveCourierLng]);

    if (points.length >= 2) {
      try {
        mapRef.current.fitBounds(points, { padding: [50, 50], maxZoom: 15 });
      } catch {
        // fitBounds can fail if map not ready
      }
    }
  }, [senderLat, senderLng, receiverLat, receiverLng, liveCourierLat, liveCourierLng]);

  // Build path: sender → courier → receiver
  const pathPoints = useMemo<[number, number][]>(() => {
    const points: [number, number][] = [];
    if (senderLat != null && senderLng != null) points.push([senderLat, senderLng]);
    if (liveCourierLat != null && liveCourierLng != null)
      points.push([liveCourierLat, liveCourierLng]);
    if (receiverLat != null && receiverLng != null) points.push([receiverLat, receiverLng]);
    return points;
  }, [senderLat, senderLng, liveCourierLat, liveCourierLng, receiverLat, receiverLng]);

  const googleMapsUrl =
    liveCourierLat != null && liveCourierLng != null
      ? `https://www.google.com/maps?q=${liveCourierLat},${liveCourierLng}`
      : null;

  const googleDirectionsUrl =
    senderLat != null && receiverLat != null
      ? `https://www.google.com/maps/dir/?api=1&origin=${senderLat},${senderLng}&destination=${receiverLat},${receiverLng}`
      : null;

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Navigation className="h-4 w-4 text-primary-600" />
          <h3 className="text-sm font-semibold">Live Map</h3>
          {connected ? (
            <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              Live
            </span>
          ) : (
            <span className="text-xs text-gray-400">Connecting...</span>
          )}
        </div>

        <div className="flex gap-2">
          {googleMapsUrl && (
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary-600 hover:underline inline-flex items-center gap-1"
            >
              Courier map <ExternalLink className="h-3 w-3" />
            </a>
          )}
          {googleDirectionsUrl && (
            <a
              href={googleDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary-600 hover:underline inline-flex items-center gap-1"
            >
              Directions <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="relative">
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: '450px', width: '100%' }}
          ref={mapRef}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Sender marker */}
          {senderLat != null && senderLng != null && (
            <Marker position={[senderLat, senderLng]} icon={senderIcon()}>
              <Popup>
                <div className="text-xs">
                  <p className="font-semibold mb-1">📦 Pickup Location</p>
                  <p>Lat: {senderLat.toFixed(5)}</p>
                  <p>Lng: {senderLng.toFixed(5)}</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Receiver marker */}
          {receiverLat != null && receiverLng != null && (
            <Marker position={[receiverLat, receiverLng]} icon={receiverIcon()}>
              <Popup>
                <div className="text-xs">
                  <p className="font-semibold mb-1">🏠 Delivery Location</p>
                  <p>Lat: {receiverLat.toFixed(5)}</p>
                  <p>Lng: {receiverLng.toFixed(5)}</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Courier marker (live) */}
          {liveCourierLat != null && liveCourierLng != null && (
            <Marker
              position={[liveCourierLat, liveCourierLng]}
              icon={courierIcon(!!lastLocation)}
            >
              <Popup>
                <div className="text-xs">
                  <p className="font-semibold mb-1">🚴 {courierName || 'Courier'}</p>
                  {courierPhone && <p>📞 {courierPhone}</p>}
                  {lastLocation?.distanceToReceiver != null && (
                    <p className="mt-1">
                      📍 {lastLocation.distanceToReceiver < 1
                        ? `${Math.round(lastLocation.distanceToReceiver * 1000)} m away`
                        : `${lastLocation.distanceToReceiver.toFixed(1)} km away`}
                    </p>
                  )}
                  {lastLocation?.etaMinutes != null && (
                    <p>⏱️ ETA {lastLocation.etaMinutes} min</p>
                  )}
                </div>
              </Popup>
            </Marker>
          )}

          {/* Path line */}
          {pathPoints.length >= 2 && (
            <Polyline
              positions={pathPoints}
              color="#6366f1"
              weight={3}
              opacity={0.6}
              dashArray="8, 8"
            />
          )}
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-md shadow-md px-3 py-2 text-xs space-y-1 pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="text-sm">📦</span>
            <span>Pickup</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">🚴</span>
            <span>Courier {connected && <span className="text-green-600">●</span>}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">🏠</span>
            <span>Delivery</span>
          </div>
        </div>
      </div>

      {/* Status bar */}
      {(lastLocation?.distanceToReceiver != null || lastLocation?.etaMinutes != null) && (
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center gap-6 flex-wrap text-sm">
          {lastLocation.distanceToReceiver != null && (
            <div>
              <span className="text-gray-500">Distance:</span>{' '}
              <span className="font-semibold">
                {lastLocation.distanceToReceiver < 1
                  ? `${Math.round(lastLocation.distanceToReceiver * 1000)} m`
                  : `${lastLocation.distanceToReceiver.toFixed(1)} km`}
              </span>
            </div>
          )}
          {lastLocation.etaMinutes != null && (
            <div>
              <span className="text-gray-500">ETA:</span>{' '}
              <span className="font-semibold text-green-600">
                {lastLocation.etaMinutes} min
              </span>
            </div>
          )}
          {lastLocation.timestamp && (
            <div className="text-xs text-gray-400 ml-auto">
              Updated {new Date(lastLocation.timestamp).toLocaleTimeString()}
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {liveCourierLat == null && liveCourierLng == null && (
        <div className="px-5 py-4 border-t border-gray-100 bg-amber-50 text-xs text-amber-800">
          ⏳ Waiting for courier's GPS signal. Location will appear once the courier
          is online.
        </div>
      )}
    </div>
  );
}
