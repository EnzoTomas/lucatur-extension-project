'use strict';

const MOCK_VEHICLES = [
  {
    id: '00000000-0000-0000-0000-000000000020',
    placa: 'AAA-0000',
    modelo: 'Ônibus Urbano',
    status: 'em_viagem',
    motorista: 'João Silva',
    lat: -23.5505,
    lng: -46.6333,
  },
  {
    id: '00000000-0000-0000-0000-000000000021',
    placa: 'BBB-1111',
    modelo: 'Micro-ônibus',
    status: 'disponivel',
    motorista: 'Maria Souza',
    lat: -23.5605,
    lng: -46.6433,
  },
  {
    id: '00000000-0000-0000-0000-000000000022',
    placa: 'CCC-2222',
    modelo: 'Van Executiva',
    status: 'manutencao',
    motorista: null,
    lat: -23.5405,
    lng: -46.6233,
  },
];

const STATUS_COLORS = {
  em_viagem:  '#22c55e',
  disponivel: '#3b82f6',
  manutencao: '#f59e0b',
  inativo:    '#6b7280',
};

const MapModule = (() => {
  let map = null;
  const markers = new Map();

  function init(containerId) {
    const {
      MAP_TILES_URL,
      MAP_DEFAULT_CENTER_LAT,
      MAP_DEFAULT_CENTER_LNG,
      MAP_DEFAULT_ZOOM,
    } = window.ENV ?? {};

    map = new maplibregl.Map({
      container: containerId,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: [MAP_TILES_URL ?? 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors',
          },
        },
        layers: [{ id: 'osm-layer', type: 'raster', source: 'osm' }],
      },
      center: [MAP_DEFAULT_CENTER_LNG ?? -46.6333, MAP_DEFAULT_CENTER_LAT ?? -23.5505],
      zoom: MAP_DEFAULT_ZOOM ?? 13,
    });

    return map;
  }

  function addOrUpdateVehicle(vehicle) {
    const { id, lat, lng, placa, status, motorista } = vehicle;
    const color = STATUS_COLORS[status] ?? STATUS_COLORS.inativo;

    const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
      <strong>${placa}</strong><br/>
      ${status}<br/>
      ${motorista ? motorista : 'Sem motorista'}
    `);

    if (markers.has(id)) {
      markers.get(id).setLngLat([lng, lat]);
      return;
    }

    const el = document.createElement('div');
    el.className = 'vehicle-marker';
    el.style.cssText = `
      width: 32px; height: 32px;
      background: ${color};
      border: 2px solid white;
      border-radius: 50%;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      font-size: 14px;
    `;
    el.textContent = '🚌';

    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([lng, lat])
      .setPopup(popup)
      .addTo(map);

    markers.set(id, marker);
  }

  function flyToVehicle(vehicleId) {
    const marker = markers.get(vehicleId);
    if (!marker) return;
    const { lng, lat } = marker.getLngLat();
    map.flyTo({ center: [lng, lat], zoom: 16, duration: 1000 });
  }

  return { init, addOrUpdateVehicle, flyToVehicle };
})();

const RealtimeModule = (() => {
  let channel = null;

  function subscribe(supabaseClient, onUpdate) {
    channel = supabaseClient
      .channel('localizacoes-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'localizacoes' },
        (payload) => {
          const { viagem_id, latitude, longitude } = payload.new;
          onUpdate({ viagem_id, lat: latitude, lng: longitude });
        }
      )
      .subscribe();
  }

  function unsubscribe() {
    if (channel) channel.unsubscribe();
  }

  return { subscribe, unsubscribe };
})();

const StatsModule = (() => {
  function render(vehicles) {
    const counts = vehicles.reduce((acc, v) => {
      acc[v.status] = (acc[v.status] ?? 0) + 1;
      return acc;
    }, {});

    const stats = [
      { label: 'Em Viagem',   value: counts.em_viagem  ?? 0, color: 'green'  },
      { label: 'Disponíveis', value: counts.disponivel ?? 0, color: 'blue'   },
      { label: 'Manutenção',  value: counts.manutencao ?? 0, color: 'yellow' },
      { label: 'Total Frota', value: vehicles.length,        color: 'gray'   },
    ];

    const container = document.getElementById('stats-container');
    if (!container) return;

    container.innerHTML = stats
      .map(
        ({ label, value, color }) => `
        <div class="stat-card stat-card--${color}">
          <span class="stat-value">${value}</span>
          <span class="stat-label">${label}</span>
        </div>`
      )
      .join('');
  }

  return { render };
})();

const VehicleListModule = (() => {
  function render(vehicles, onSelectVehicle) {
    const container = document.getElementById('vehicle-list');
    if (!container) return;

    container.innerHTML = vehicles
      .map(
        (v) => `
        <div class="vehicle-item vehicle-item--${v.status}"
             data-id="${v.id}"
             role="button"
             tabindex="0">
          <span class="vehicle-plate">${v.placa}</span>
          <span class="vehicle-model">${v.modelo}</span>
          <span class="vehicle-status badge badge--${v.status}">${v.status}</span>
          ${v.motorista ? `<span class="vehicle-driver">${v.motorista}</span>` : ''}
        </div>`
      )
      .join('');

    container.querySelectorAll('.vehicle-item').forEach((el) => {
      el.addEventListener('click', () => onSelectVehicle(el.dataset.id));
    });
  }

  return { render };
})();

async function initDashboard(supabaseClient) {
  MapModule.init('map-container');

  const vehicles = MOCK_VEHICLES;

  vehicles.forEach((v) => MapModule.addOrUpdateVehicle(v));
  StatsModule.render(vehicles);
  VehicleListModule.render(vehicles, (vehicleId) => MapModule.flyToVehicle(vehicleId));

  if (supabaseClient) {
    RealtimeModule.subscribe(supabaseClient, ({ viagem_id, lat, lng }) => {
      console.info(`[Realtime] viagem=${viagem_id} lat=${lat} lng=${lng}`);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const supabaseClient = null; // substituir por createSupabaseClient()

  initDashboard(supabaseClient).catch((err) => {
    console.error('[Dashboard]', err);
  });
});

if (typeof module !== 'undefined') {
  module.exports = { initDashboard, MapModule, RealtimeModule, StatsModule };
}
