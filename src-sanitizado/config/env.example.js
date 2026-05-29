// Copie para env.js e preencha com suas credenciais de desenvolvimento.
// Nunca commite env.js.

const ENV = {
  SUPABASE_URL: 'https://your-project-id.supabase.co',
  SUPABASE_ANON_KEY: 'your-supabase-anon-key-here',

  APP_NAME: 'LucaTur',
  APP_VERSION: '1.0.0',

  MAP_TILES_URL: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  MAP_DEFAULT_CENTER_LAT: -23.5505,
  MAP_DEFAULT_CENTER_LNG: -46.6333,
  MAP_DEFAULT_ZOOM: 13,

  OSRM_BASE_URL: 'https://router.project-osrm.org',

  GPS_TRACKING_INTERVAL_MS: 10000,
  GPS_MIN_DISTANCE_METERS: 20,
};

if (typeof module !== 'undefined') {
  module.exports = ENV;
} else {
  window.ENV = ENV;
}
