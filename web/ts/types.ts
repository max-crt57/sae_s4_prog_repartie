export interface StationVelo {
    lat: number;
    lon: number;
    name: string;
    address?: string;
    num_bikes_available?: number;
    num_docks_available?: number;
}

export interface Incident {
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

export interface Restaurant {
    id: number;
    nom: string;
    latitude: number;
    longitude: number;
    ouvertureMin: number;
    fermetureMin: number;
}