import L from 'leaflet';

export function senderIcon() {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background: #3b82f6;
      width: 32px;
      height: 32px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <span style="transform: rotate(45deg); color: white; font-size: 14px;">📦</span>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

export function receiverIcon() {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background: #10b981;
      width: 32px;
      height: 32px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <span style="transform: rotate(45deg); color: white; font-size: 14px;">🏠</span>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

export function courierIcon(isMoving = false) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      position: relative;
      background: #f59e0b;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 12px rgba(245, 158, 11, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      ${isMoving ? 'animation: pulse-ring 1.5s infinite;' : ''}
    ">
      <span style="color: white; font-size: 18px;">🚴</span>
      ${
        isMoving
          ? `<span style="
        position: absolute;
        top: -4px;
        right: -4px;
        width: 12px;
        height: 12px;
        background: #10b981;
        border-radius: 50%;
        border: 2px solid white;
      "></span>`
          : ''
      }
    </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
}
