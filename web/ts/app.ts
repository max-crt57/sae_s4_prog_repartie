import { map } from './mapUtils';
import { loadBikes, loadIncidents, loadRestaurants, defaultApiBase, getApiBase } from './api';
import { setupReservationEvents } from './reservation';
import { setupTabs } from './ui';

const apiBaseInput = document.getElementById('api-base') as HTMLInputElement;
const statusEl = document.getElementById('status') as HTMLElement;

apiBaseInput.value = localStorage.getItem('API_BASE') || defaultApiBase;

function setStatus(message: string): void {
    statusEl.textContent = message;
}

document.getElementById('save-api')!.addEventListener('click', () => {
    localStorage.setItem('API_BASE', getApiBase());
    setStatus(`Proxy enregistré : ${getApiBase()}`);
});

document.getElementById('reload')!.addEventListener('click', () => {
    setStatus("Chargement...");
    Promise.all([loadBikes(), loadIncidents(), loadRestaurants()])
        .then(() => setStatus("Prêt."))
        .catch(err => setStatus("Erreur !"));
});

setupTabs();
setupReservationEvents();

window.addEventListener('load', () => setTimeout(() => map.invalidateSize(), 100));

// initialisation
Promise.all([loadBikes(), loadIncidents(), loadRestaurants()]).catch(err => console.error(err));