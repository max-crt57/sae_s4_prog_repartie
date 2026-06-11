import { StationVelo, Incident, Restaurant } from './types';
import { layers, veloIcon, incidentIcon, restaurantIcon, escapeHtml, parsePolylinePoint } from './mapUtils';
import { checkTablesAndOpenModal } from './reservation';
import * as L from 'leaflet';

// adresse de base du proxy http par defaut (sur le port 8080)
export const defaultApiBase: string = location.port === '8080' ? `${location.protocol}//${location.host}` : 'http://localhost:8080';

// recuperer l'url de l'api saisie par l'utilisateur
export function getApiBase(): string {
    const apiBaseInput = document.getElementById('api-base') as HTMLInputElement;
    return apiBaseInput.value.replace(/\/$/, '');
}

// charger les stations de velo en libre service
export async function loadBikes(): Promise<void> {
    layers.velos.clearLayers();

    // on interroge les deux api gbfs de la metropole (nancy)
    const [infoRes, statusRes] = await Promise.all([
        fetch('https://api.cyclocity.fr/contracts/nancy/gbfs/v2/station_information.json'),
        fetch('https://api.cyclocity.fr/contracts/nancy/gbfs/v2/station_status.json')
    ]);

    if (!infoRes.ok || !statusRes.ok) throw new Error("Erreur API Vélos");

    const infoData = await infoRes.json();
    const statusData = await statusRes.json();
    const statusMap = new Map();

    // on met les statuts dans une map pour accelerer la recherche
    statusData.data.stations.forEach((status: { station_id: number; num_bikes_available: number; num_docks_available: number }) => statusMap.set(status.station_id, status));

    // on cree les marqueurs pour chaque station
    infoData.data.stations.forEach((station: { station_id: number; lat: number; lon: number; name: string; address: string }) => {
        const status = statusMap.get(station.station_id);
        const bikes = status ? status.num_bikes_available : 0;
        const docks = status ? status.num_docks_available : 0;

        // ajout du marqueur avec l'icone coloree selon la disponibilite
        L.marker([station.lat, station.lon], { icon: veloIcon(bikes) }).bindPopup(`
            <strong>${escapeHtml(station.name)}</strong><br>
            ${escapeHtml(station.address || '')}<br>
            <span class="badge">Vélos : ${bikes}</span>
            <span class="badge">Places : ${docks}</span>
        `).addTo(layers.velos);
    });
}

// charger les incidents routiers
export async function loadIncidents(): Promise<void> {
    layers.incidents.clearLayers();

    // appel a l'api des incidents via le proxy java (contournement cors)
    const response = await fetch(`${getApiBase()}/api/incidents`);
    if (!response.ok) throw new Error("Erreur API Incidents");

    const data = await response.json();

    if (data.incidents) {
        data.incidents.forEach((incident: Incident) => {
            // parsing des coordonnees waze
            const coords = parsePolylinePoint(incident.location?.polyline);
            if (coords) {
                const dateDebut = new Date(incident.starttime).toLocaleDateString('fr-FR');
                const dateFin = new Date(incident.endtime).toLocaleDateString('fr-FR');

                // ajout du marqueur d'incident avec sa description
                L.marker(coords, { icon: incidentIcon() }).bindPopup(`
                    <strong>Incident : ${escapeHtml(incident.short_description)}</strong><br>
                    <em>${escapeHtml(incident.location.location_description)}</em><br>
                    <hr class="popup-hr">
                    <span class="badge">Du ${dateDebut} au ${dateFin}</span>
                `).addTo(layers.incidents);
            }
        });
    }
}

// recuperer l'heure actuelle au format yyyy-mm-ddthh:mm pour l'input datetime
export function getCurrentDateTimeLocal() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
}

// charger la liste des restaurants depuis la base de donnees oracle
export async function loadRestaurants(): Promise<void> {
    layers.restaurants.clearLayers();

    // appel au proxy qui interroge le serveur rmi
    const response = await fetch(`${getApiBase()}/api/restaurants`);
    if (!response.ok) throw new Error("Erreur API Restaurants");

    const data = await response.json();

    if (Array.isArray(data)) {
        data.forEach((restau: Restaurant) => {
            // conversion des minutes d'ouverture en chaine lisible hh:mm
            const ouverture = String(Math.floor(restau.ouvertureMin / 60)).padStart(2, '0') + "h" + String(restau.ouvertureMin % 60).padStart(2, '0');
            const fermeture = String(Math.floor(restau.fermetureMin / 60)).padStart(2, '0') + "h" + String(restau.fermetureMin % 60).padStart(2, '0');

            // marqueur avec formulaire de reservation dans la popup
            const marker = L.marker([restau.latitude, restau.longitude], { icon: restaurantIcon() }).bindPopup(`
                <strong>Restaurant : ${escapeHtml(restau.nom)}</strong>
                <hr class="popup-hr">
                <span class="badge">Ouvert de ${ouverture} à ${fermeture}</span>
                <div class="popup-form">
                    <label>Date & Heure :</label>
                    <input type="datetime-local" class="popup-datetime" min="${getCurrentDateTimeLocal()}" required>
                    <label>Convives :</label>
                    <input type="number" class="popup-guests" min="1" value="2" required>
                    <button class="btn-check-tables">Voir les tables disponibles</button>
                </div>
            `);

            // on attache l'evenement au clic sur le bouton de la popup quand elle s'ouvre
            marker.on('popupopen', () => {
                const btn = document.querySelector('.leaflet-popup .btn-check-tables');
                if (btn) {
                    btn.addEventListener('click', () => checkTablesAndOpenModal(restau));
                }
            });
            marker.addTo(layers.restaurants);
        });
    }
}
