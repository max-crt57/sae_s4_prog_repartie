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

// ICON
function icon(className: string, text: string): L.DivIcon {
    return L.divIcon({
        className: '',
        html: `<div class="${className}">${text}</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
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
        L.marker([station.lat, station.lon], {
            icon: icon('marker-bike', 'V')
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