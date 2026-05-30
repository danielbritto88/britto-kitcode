const PREFIX = 'tc_photo_';

function storageKey(vehicleId: string): string {
  return `${PREFIX}${vehicleId}`;
}

export function saveLocalPhoto(vehicleId: string, dataUrl: string): boolean {
  try {
    localStorage.setItem(storageKey(vehicleId), dataUrl);
    return true;
  } catch {
    return false;
  }
}

export function getLocalPhotoUrl(vehicleId: string): string | null {
  try {
    return localStorage.getItem(storageKey(vehicleId));
  } catch {
    return null;
  }
}

export function deleteLocalPhoto(vehicleId: string): void {
  try {
    localStorage.removeItem(storageKey(vehicleId));
  } catch {
    // ignora
  }
}

export function isLocalPhotoKey(key: string | null): boolean {
  return !!key && key.startsWith('local:');
}

export function localPhotoVehicleId(key: string): string {
  return key.replace('local:', '');
}
