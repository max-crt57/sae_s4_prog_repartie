// On importe les outils depuis nos nouveaux modules
import { StationVelo, Incident } from './types';
import { map, layers, veloIcon, incidentIcon, escapeHtml, parsePolylinePoint } from './mapUtils';

// gestion du dom et du proxy
const defaultApiBase: string = location.port === '8080' ? `${location.protocol}//${location.host}` : 'http://localhost:8080';
const apiBaseInput = document.getElementById('api-base') as HTMLInputElement;
const statusEl = document.getElementById('status') as HTMLElement;

apiBaseInput.value = localStorage.getItem('API_BASE') || defaultApiBase;

function apiBase(): string {
    return apiBaseInput.value.replace(/\/$/, '');
}

function setStatus(message: string): void {
    statusEl.textContent = message;
}

// requetes api
async function loadBikes(): Promise<void> {
    layers.velos.clearLayers();
    const [infoRes, statusRes] = await Promise.all([
        fetch('https://api.cyclocity.fr/contracts/nancy/gbfs/v2/station_information.json'),
        fetch('https://api.cyclocity.fr/contracts/nancy/gbfs/v2/station_status.json')
    ]);

    if (!infoRes.ok || !statusRes.ok) throw new Error("Erreur API Vélos");

    const infoData = await infoRes.json();
    const statusData = await statusRes.json();
    const statusMap = new Map();
    
    statusData.data.stations.forEach((status: any) => statusMap.set(status.station_id, status));

    infoData.data.stations.forEach((station: any) => {
        const status = statusMap.get(station.station_id);
        const bikes = status ? status.num_bikes_available : 0;
        const docks = status ? status.num_docks_available : 0;

        import('leaflet').then(L => {
            L.marker([station.lat, station.lon], { icon: veloIcon(bikes) }).bindPopup(`
                <strong>${escapeHtml(station.name)}</strong><br>
                ${escapeHtml(station.address || '')}<br>
                <span class="badge">Vélos : ${bikes}</span>
                <span class="badge">Places : ${docks}</span>
            `).addTo(layers.velos);
        });
    });
}

async function loadIncidents(): Promise<void> {
    layers.incidents.clearLayers();
    const response = await fetch(`${apiBase()}/api/incidents`);
    if (!response.ok) throw new Error("Erreur API Incidents");
    
    const data = await response.json();

    if (data.incidents) {
        import('leaflet').then(L => {
            data.incidents.forEach((incident: Incident) => {
                const coords = parsePolylinePoint(incident.location?.polyline);
                if (coords) {
                    const dateDebut = new Date(incident.starttime).toLocaleDateString('fr-FR');
                    const dateFin = new Date(incident.endtime).toLocaleDateString('fr-FR');

                    L.marker(coords, { icon: incidentIcon() }).bindPopup(`
                        <strong>Incident : ${escapeHtml(incident.short_description)}</strong><br>
                        <em>${escapeHtml(incident.location.location_description)}</em><br>
                        <hr style="margin: 5px 0;">
                        <span class="badge">Du ${dateDebut} au ${dateFin}</span>
                    `).addTo(layers.incidents);
                }
            });
        });
    }
}

// evenements
document.getElementById('save-api')!.addEventListener('click', () => {
    localStorage.setItem('API_BASE', apiBase());
    setStatus(`Proxy enregistré : ${apiBase()}`);
});

document.getElementById('reload')!.addEventListener('click', () => {
    setStatus("Chargement...");
    Promise.all([loadBikes(), loadIncidents()])
        .then(() => setStatus("Prêt."))
        .catch(err => setStatus("Erreur !"));
});

function switchTab(tab: 'map' | 'report'): void {
    document.getElementById('map-section')!.classList.toggle('hidden', tab !== 'map');
    document.getElementById('report-section')!.classList.toggle('hidden', tab !== 'report');
    document.getElementById('tab-map')!.classList.toggle('active', tab === 'map');
    document.getElementById('tab-report')!.classList.toggle('active', tab === 'report');
    if (tab === 'map') setTimeout(() => map.invalidateSize(), 50);
}

document.getElementById('tab-map')!.addEventListener('click', () => switchTab('map'));
document.getElementById('tab-report')!.addEventListener('click', () => switchTab('report'));

window.addEventListener('load', () => setTimeout(() => map.invalidateSize(), 100));

// initialisation
Promise.all([loadBikes(), loadIncidents()]).catch(err => console.error(err));