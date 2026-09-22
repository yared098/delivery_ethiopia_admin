import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/lib/auth';

const WS_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1')
  .replace('/api/v1', '');

export interface TrackingUpdate {
  orderId: string;
  lat: number;
  lng: number;
  courierId: string;
  courierName?: string;
  timestamp: string;
  distanceToReceiver?: number;
  etaMinutes?: number;
  status: string;
}

export interface ProximityAlert {
  orderId: string;
  level: 'NEARBY' | 'CLOSE' | 'ARRIVING' | 'AT_DOOR';
  distanceMeters: number;
  message: string;
}

export interface StatusChange {
  orderId: string;
  status: string;
  note?: string;
  timestamp: string;
}

let globalSocket: Socket | null = null;

function getSocket(): Socket {
  if (globalSocket && globalSocket.connected) return globalSocket;

  const token = useAuthStore.getState().accessToken;

  globalSocket = io(`${WS_URL}/tracking`, {
    transports: ['websocket', 'polling'],
    auth: { token },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10,
  });

  return globalSocket;
}

export function useOrderTracking(orderId: string | null) {
  const [connected, setConnected] = useState(false);
  const [lastLocation, setLastLocation] = useState<TrackingUpdate | null>(null);
  const [lastAlert, setLastAlert] = useState<ProximityAlert | null>(null);
  const [lastStatusChange, setLastStatusChange] = useState<StatusChange | null>(null);
  const [events, setEvents] = useState<any[]>([]);

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!orderId) return;

    const socket = getSocket();
    socketRef.current = socket;

    const handleConnect = () => {
      setConnected(true);
      socket.emit('order:subscribe', { orderId });
    };

    const handleDisconnect = () => setConnected(false);

    const handleLocationUpdate = (data: TrackingUpdate) => {
      if (data.orderId === orderId) setLastLocation(data);
    };

    const handleProximityAlert = (data: ProximityAlert) => {
      if (data.orderId === orderId) setLastAlert(data);
    };

    const handleStatusChange = (data: StatusChange) => {
      if (data.orderId === orderId) setLastStatusChange(data);
    };

    const handleOrderEvent = (data: any) => {
      if (data.orderId === orderId) {
        setEvents((prev) => [data.event, ...prev]);
      }
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('location:update', handleLocationUpdate);
    socket.on('proximity:alert', handleProximityAlert);
    socket.on('status:change', handleStatusChange);
    socket.on('order:event', handleOrderEvent);

    if (socket.connected) {
      setConnected(true);
      socket.emit('order:subscribe', { orderId });
    }

    return () => {
      socket.emit('order:unsubscribe', { orderId });
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('location:update', handleLocationUpdate);
      socket.off('proximity:alert', handleProximityAlert);
      socket.off('status:change', handleStatusChange);
      socket.off('order:event', handleOrderEvent);
    };
  }, [orderId]);

  return { connected, lastLocation, lastAlert, lastStatusChange, events };
}

export function disconnectSocket() {
  if (globalSocket) {
    globalSocket.disconnect();
    globalSocket = null;
  }
}
