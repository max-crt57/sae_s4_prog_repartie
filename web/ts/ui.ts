import { map } from './mapUtils';

// liaison des clics sur les onglets avec le changement d'affichage
export function setupTabs() {
    document.getElementById('tab-map')!.addEventListener('click', () => switchTab('map'));
    document.getElementById('tab-report')!.addEventListener('click', () => switchTab('report'));
}

// basculer l'onglet actif et afficher la section correspondante
export function switchTab(tab: 'map' | 'report'): void {
    // on cache ou affiche les sections html concernées
    document.getElementById('map-section')!.classList.toggle('hidden', tab !== 'map');
    document.getElementById('report-section')!.classList.toggle('hidden', tab !== 'report');

    // mise a jour de la classe active sur les boutons
    document.getElementById('tab-map')!.classList.toggle('active', tab === 'map');
    document.getElementById('tab-report')!.classList.toggle('active', tab === 'report');

    // on force leaflet a recalculer la taille de la carte si on l'affiche
    if (tab === 'map') setTimeout(() => map.invalidateSize(), 50);
}
