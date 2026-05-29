'use strict';

const GPS_CONFIG = {
  interval: window.ENV?.GPS_TRACKING_INTERVAL_MS ?? 10000,
  minDistance: window.ENV?.GPS_MIN_DISTANCE_METERS ?? 20,
  maxAge: 30000,
  timeout: 15000,
  highAccuracy: true,
};

let trackingState = {
  active: false,
  watchId: null,
  viagemId: null,
  lastPosition: null,
  totalDistanceMeters: 0,
  pointsRecorded: 0,
  startedAt: null,
};

// Haversine — distância em metros entre dois pontos GPS
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

let db = null;

async function initLocalDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('lucatur_gps', 1);

    request.onupgradeneeded = (event) => {
      const database = event.target.result;

      if (!database.objectStoreNames.contains('pending_locations')) {
        const store = database.createObjectStore('pending_locations', {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('viagem_id', 'viagem_id', { unique: false });
        store.createIndex('synced', 'synced', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };

    request.onerror = () => reject(request.error);
  });
}

async function saveLocationLocally(location) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pending_locations', 'readwrite');
    const store = tx.objectStore('pending_locations');
    const req = store.add({ ...location, synced: false, saved_at: Date.now() });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function syncPendingLocations(supabaseClient, viagemId) {
  if (!db) return;

  const pending = await new Promise((resolve) => {
    const tx = db.transaction('pending_locations', 'readonly');
    const req = tx.objectStore('pending_locations').index('synced').getAll(false);
    req.onsuccess = () => resolve(req.result);
  });

  if (pending.length === 0) return;

  const payload = pending.map(({ id: _id, synced: _s, saved_at: _sa, ...loc }) => ({
    ...loc,
    viagem_id: viagemId,
  }));

  const { error } = await supabaseClient.from('localizacoes').insert(payload);

  if (error) {
    console.warn('[GPS] Falha ao sincronizar pontos:', error.message);
    return;
  }

  const txUpdate = db.transaction('pending_locations', 'readwrite');
  const storeUpdate = txUpdate.objectStore('pending_locations');
  for (const record of pending) {
    storeUpdate.put({ ...record, synced: true });
  }
}

async function startTracking(viagemId, supabaseClient) {
  if (trackingState.active) return;

  if (!navigator.geolocation) {
    throw new Error('Geolocation API não disponível neste dispositivo.');
  }

  await initLocalDatabase();

  trackingState = {
    active: true,
    watchId: null,
    viagemId,
    lastPosition: null,
    totalDistanceMeters: 0,
    pointsRecorded: 0,
    startedAt: Date.now(),
  };

  trackingState.watchId = navigator.geolocation.watchPosition(
    (position) => onNewPosition(position, supabaseClient),
    onPositionError,
    {
      enableHighAccuracy: GPS_CONFIG.highAccuracy,
      maximumAge: GPS_CONFIG.maxAge,
      timeout: GPS_CONFIG.timeout,
    }
  );
}

async function onNewPosition(position, supabaseClient) {
  const { latitude, longitude, accuracy, speed } = position.coords;

  // Descarta leituras com precisão abaixo de 100m — evita saltos GPS em áreas fechadas
  if (accuracy > 100) return;

  if (trackingState.lastPosition) {
    const dist = haversineDistance(
      trackingState.lastPosition.latitude,
      trackingState.lastPosition.longitude,
      latitude,
      longitude
    );

    if (dist < GPS_CONFIG.minDistance) return;

    trackingState.totalDistanceMeters += dist;
  }

  const locationRecord = {
    viagem_id: trackingState.viagemId,
    latitude,
    longitude,
    precisao: accuracy,
    velocidade: speed ? speed * 3.6 : null, // m/s → km/h
    registrado_em: new Date(position.timestamp).toISOString(),
  };

  // Salva localmente antes de tentar enviar — garante que nenhum ponto se perde offline
  await saveLocationLocally(locationRecord);

  trackingState.lastPosition = { latitude, longitude };
  trackingState.pointsRecorded++;

  if (navigator.onLine && supabaseClient) {
    await syncPendingLocations(supabaseClient, trackingState.viagemId);
  }

  window.dispatchEvent(
    new CustomEvent('gps:position', {
      detail: {
        latitude,
        longitude,
        totalKm: trackingState.totalDistanceMeters / 1000,
        pointsRecorded: trackingState.pointsRecorded,
      },
    })
  );
}

function onPositionError(error) {
  const messages = {
    1: 'Permissão de localização negada.',
    2: 'Posição indisponível (GPS sem sinal).',
    3: 'Timeout ao obter posição GPS.',
  };
  console.error('[GPS]', messages[error.code] ?? error.message);
}

async function stopTracking(supabaseClient) {
  if (!trackingState.active) return;

  if (trackingState.watchId !== null) {
    navigator.geolocation.clearWatch(trackingState.watchId);
  }

  if (supabaseClient) {
    await syncPendingLocations(supabaseClient, trackingState.viagemId);
  }

  const summary = {
    viagemId: trackingState.viagemId,
    totalKm: (trackingState.totalDistanceMeters / 1000).toFixed(2),
    pointsRecorded: trackingState.pointsRecorded,
    durationMs: Date.now() - trackingState.startedAt,
  };

  trackingState = {
    active: false,
    watchId: null,
    viagemId: null,
    lastPosition: null,
    totalDistanceMeters: 0,
    pointsRecorded: 0,
    startedAt: null,
  };

  return summary;
}

if (typeof module !== 'undefined') {
  module.exports = { startTracking, stopTracking, haversineDistance };
}
