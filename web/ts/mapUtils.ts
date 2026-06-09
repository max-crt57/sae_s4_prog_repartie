import L from 'leaflet';

// On exporte la carte et les calques pour que app.ts puisse s'en servir
export const map = L.map('map').setView([48.6921, 6.1844], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
}).addTo(map);

export const layers = {
    velos: L.layerGroup().addTo(map),
    incidents: L.layerGroup().addTo(map)
};

// icones
export function veloIcon(bikesAvailable: number = 0): L.DivIcon {
    const statusClass = bikesAvailable > 0 ? 'dispo' : 'vide';
    const bikeSvg = `<svg viewBox="0 0 24 24"><path d="M15.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM5 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5zm5.8-10l2.4-2.4.8.8c1.3 1.3 3 2.1 5.1 2.1V9c-1.5 0-2.7-.6-3.6-1.5l-1.9-1.9c-.5-.4-1-.6-1.6-.6s-1.1.2-1.4.6L7.8 8.4c-.4.4-.6.9-.6 1.4 0 .6.2 1.1.6 1.4L11 14v5h2v-6.2l-2.2-2.3zM19 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5z"/></svg>`;

    return L.divIcon({
        className: 'custom-leaflet-icon',
        html: `<div class="velo-pin ${statusClass}">${bikeSvg}</div>`,
        iconSize: [30, 42], iconAnchor: [15, 34], popupAnchor: [0, -30]
    });
}

export function incidentIcon(): L.DivIcon {
    return L.divIcon({
        className: 'custom-leaflet-icon',
        html: `<div class="incident-pin" style="background-color: #f39c12; font-size: 16px;"><span>!</span></div>`,
        iconSize: [30, 42], iconAnchor: [15, 34], popupAnchor: [0, -30]

    });
}

// utilitaires
export function escapeHtml(value: unknown): string {
    return String(value ?? '').replace(/[&<>'"]/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[c] as string));
}

export function parsePolylinePoint(polyline?: string): [number, number] | null {
    if (!polyline) return null;
    const parts = polyline.trim().split(/\s+/).map(Number);
    if (parts.length < 2 || Number.isNaN(parts[0]) || Number.isNaN(parts[1])) return null;
    return [parts[0], parts[1]];
}