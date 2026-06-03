import L from 'leaflet';

interface StationVelo {
    lat: number;
    lon: number;
    name: string;
    address?: string;
    num_bikes_available?: number;
    num_docks_available?: number;
}

interface Incident {
    id: string;
    short_description: string;
    description: string;
    starttime: string;
    endtime: string;
    location: {
        street: string;
        polyline: string;
        location_description: string;
    };
}

// Gestion du proxy
const defaultApiBase: string = location.port === '8080' ? `${location.protocol}//${location.host}` : 'http://localhost:8080';
const apiBaseInput = document.getElementById('api-base') as HTMLInputElement;
const statusEl = document.getElementById('status') as HTMLElement;

apiBaseInput.value = localStorage.getItem('API_BASE') || defaultApiBase;

// Fonction qui nettoie l'URL (enlève le / à la fin)
function apiBase(): string {
    return apiBaseInput.value.replace(/\/$/, '');
}

// Fonction pour afficher des messages
function setStatus(message: string): void {
    statusEl.textContent = message;
}

// MAP
const map = L.map('map');

map.setView([48.6921, 6.1844], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
}).addTo(map);

const layers = {
    velos: L.layerGroup().addTo(map),
    incidents: L.layerGroup().addTo(map)
};

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

// Icon incident
function incidentIcon(): L.DivIcon {
    return L.divIcon({
        className: 'custom-leaflet-icon',
        html: `<div class="incident-pin" style="background-color: #f39c12; font-size: 16px;"><span>!</span></div>`,
        iconSize: [30, 42], iconAnchor: [15, 34], popupAnchor: [0, -30]
    });
}

function parsePolylinePoint(polyline?: string): [number, number] | null {
    if (!polyline) return null;
    const parts = polyline.trim().split(/\s+/).map(Number);
    if (parts.length < 2 || Number.isNaN(parts[0]) || Number.isNaN(parts[1])) return null;
    return [parts[0], parts[1]];
}

// VELO
async function loadBikes(): Promise<void> {
    layers.velos.clearLayers();

    const [infoRes, statusRes] = await Promise.all([
        fetch('https://api.cyclocity.fr/contracts/nancy/gbfs/v2/station_information.json'),
        fetch('https://api.cyclocity.fr/contracts/nancy/gbfs/v2/station_status.json')
    ]);

    if (!infoRes.ok || !statusRes.ok) {
        throw new Error("Erreur lors de la récupération des données vélos");
    }

    const infoData = await infoRes.json();
    const statusData = await statusRes.json();

    const stationsInfo = infoData.data.stations;
    const stationsStatus = statusData.data.stations;

    const statusMap = new Map();
    stationsStatus.forEach((status: any) => {
        statusMap.set(status.station_id, status);
    });

    stationsInfo.forEach((station: any) => {
        const status = statusMap.get(station.station_id);
        
        const bikes = status ? status.num_bikes_available : 0;
        const docks = status ? status.num_docks_available : 0;

        L.marker([station.lat, station.lon], {
            icon: veloIcon(bikes)
        }).bindPopup(`
            <strong>${escapeHtml(station.name)}</strong><br>
            ${escapeHtml(station.address || '')}<br>
            <span class="badge">Vélos : ${bikes}</span>
            <span class="badge">Places : ${docks}</span>
        `).addTo(layers.velos);
    });
}

// INCIDENTS
async function loadIncidents(): Promise<void> {
    layers.incidents.clearLayers();
    const response = await fetch(`${apiBase()}/api/incidents`);
    if (!response.ok) throw new Error("Erreur lors de la récupération des incidents");
    
    const data = await response.json();

    if (data.incidents) {
        data.incidents.forEach((incident: Incident) => {
            const coords = parsePolylinePoint(incident.location?.polyline);
            
            if (coords) {
                const dateDebut = new Date(incident.starttime).toLocaleDateString('fr-FR');
                const dateFin = new Date(incident.endtime).toLocaleDateString('fr-FR');

                L.marker(coords, { icon: incidentIcon() })
                    .bindPopup(`
                        <strong>Incident : ${escapeHtml(incident.short_description)}</strong><br>
                        <em>${escapeHtml(incident.location.location_description)}</em><br>
                        <hr style="margin: 5px 0;">
                        <span class="badge">Du ${dateDebut} au ${dateFin}</span>
                    `)
                    .addTo(layers.incidents);
            }
        });
    }
}

document.getElementById('save-api')!.addEventListener('click', () => {
    localStorage.setItem('API_BASE', apiBase());
    setStatus(`Proxy enregistré : ${apiBase()}`);
});

document.getElementById('tab-map')!.addEventListener('click', () => switchTab('map'));
document.getElementById('tab-report')!.addEventListener('click', () => switchTab('report'));

function switchTab(tab: 'map' | 'report'): void {
    document.getElementById('map-section')!.classList.toggle('hidden', tab !== 'map');
    document.getElementById('report-section')!.classList.toggle('hidden', tab !== 'report');

    document.getElementById('tab-map')!.classList.toggle('active', tab === 'map');
    document.getElementById('tab-report')!.classList.toggle('active', tab === 'report');

    if (tab === 'map') setTimeout(() => map.invalidateSize(), 50);
}

Promise.all([loadBikes(), loadIncidents()]).catch(err => console.error("Erreur au chargement:", err));

document.getElementById('reload')!.addEventListener('click', () => {
    const statusSpan = document.getElementById('status')!;
    statusSpan.textContent = "Chargement...";
    
    Promise.all([loadBikes(), loadIncidents()]).then(() => statusSpan.textContent = "Prêt.").catch(err => statusSpan.textContent = "Erreur !");
});

window.addEventListener('load', () => {
    setTimeout(() => map.invalidateSize(), 100);
});