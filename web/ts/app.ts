import L from 'leaflet';

interface BikeStation {
    lat: number;
    lon: number;
    name: string;
    address?: string;
    num_bikes_available?: number;
    num_docks_available?: number;
}

// DOM
const defaultApiBase: string = location.port === '8080' ? `${location.protocol}//${location.host}` : 'http://localhost:8080';

const apiBaseInput = document.getElementById('api-base') as HTMLInputElement;
const statusEl = document.getElementById('status') as HTMLElement;

apiBaseInput.value = localStorage.getItem('API_BASE') || defaultApiBase;

// MAP
const map = L.map('map');

map.setView([48.6921, 6.1844], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
}).addTo(map);

const layers = {
    bikes: L.layerGroup().addTo(map)
};

// si / à la fin, ça l'enlève
function apiBase(): string {
    return apiBaseInput.value.replace(/\/$/, '');
}

function setStatus(message: string): void {
    statusEl.textContent = message;
}

// FETCH
async function fetchJson<T = any>(path: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${apiBase()}${path}`, options);
    const data = await response.json();

    if (!response.ok || data.status === 'error') {
        throw new Error(data.message || `Erreur HTTP ${response.status}`);
    }

    return data;
}

// ICONE
function veloIcon(bikesAvailable: number = 0): L.DivIcon {
    // Si des vélos sont dispos, la classe est 'dispo' (vert), sinon 'vide' (rouge)
    const statusClass = bikesAvailable > 0 ? 'dispo' : 'vide';
    
    // Le dessin (SVG) du vélo
    const bikeSvg = `<svg viewBox="0 0 24 24"><path d="M15.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM5 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5zm5.8-10l2.4-2.4.8.8c1.3 1.3 3 2.1 5.1 2.1V9c-1.5 0-2.7-.6-3.6-1.5l-1.9-1.9c-.5-.4-1-.6-1.6-.6s-1.1.2-1.4.6L7.8 8.4c-.4.4-.6.9-.6 1.4 0 .6.2 1.1.6 1.4L11 14v5h2v-6.2l-2.2-2.3zM19 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5z"/></svg>`;

    return L.divIcon({
        className: 'custom-leaflet-icon',
        html: `<div class="velo-pin ${statusClass}">${bikeSvg}</div>`,
        iconSize: [30, 42], // Taille totale (le pin dépasse de la boite)
        iconAnchor: [15, 34], // Pointe exacte sur la carte (moitié largeur, bas du pin)
        popupAnchor: [0, -30] // Le popup s'ouvrira juste au-dessus du pin
    });
}

// UTILS
function escapeHtml(value: unknown): string {
    return String(value ?? '').replace(/[&<>'"]/g, c => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    }[c] as string));
}

// VELO
async function loadBikes(): Promise<void> {
    layers.bikes.clearLayers();

    const data = await fetchJson<{ stations: BikeStation[] }>('/api/bikes');

    data.stations.forEach(station => {
        // On récupère le nombre de vélos (0 si indéfini)
        const bikes = station.num_bikes_available ?? 0;

        L.marker([station.lat, station.lon], {
            icon: veloIcon(bikes)
        })
            .bindPopup(`
                <strong>${escapeHtml(station.name)}</strong><br>
                ${escapeHtml(station.address || '')}<br>
                <span class="badge">Vélos : ${station.num_bikes_available ?? '?'}</span>
                <span class="badge">Places : ${station.num_docks_available ?? '?'}</span>
            `)
            .addTo(layers.bikes);
    });
}

// RELOAD
async function reloadAll(): Promise<void> {
    try {
        setStatus('Chargement...');
        await Promise.all([loadBikes()]);
        setStatus('Données chargées.');
    } catch (e: any) {
        console.error(e);
        setStatus(`Erreur : ${e.message}`);
    }
}

// EVENTS
document.getElementById('save-api')!.addEventListener('click', () => {
    localStorage.setItem('API_BASE', apiBase());
    setStatus(`Proxy enregistré : ${apiBase()}`);
});

document.getElementById('reload')!.addEventListener('click', reloadAll);

document.getElementById('tab-map')!.addEventListener('click', () => switchTab('map'));
document.getElementById('tab-report')!.addEventListener('click', () => switchTab('report'));

function switchTab(tab: 'map' | 'report'): void {
    document.getElementById('map-section')!.classList.toggle('hidden', tab !== 'map');
    document.getElementById('report-section')!.classList.toggle('hidden', tab !== 'report');

    document.getElementById('tab-map')!.classList.toggle('active', tab === 'map');
    document.getElementById('tab-report')!.classList.toggle('active', tab === 'report');

    if (tab === 'map') setTimeout(() => map.invalidateSize(), 50);
}

// INIT
reloadAll();

window.addEventListener('load', () => {
    setTimeout(() => map.invalidateSize(), 100);
});