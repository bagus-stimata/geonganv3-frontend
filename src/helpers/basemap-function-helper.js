// ===== Basemaps =====
import L from "leaflet";

const googleSatellite = {
    id: 'googleSatellite',
    name: 'Google Sat',
    url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    attribution: '&copy; Google',
    maxZoom: 22
}
const googleHybrid = {
    id: 'googleHybrid',
    name: 'Google Hybrid',
    url: 'https://mt1.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',
    attribution: '&copy; Google',
    maxZoom: 22
}
const googleRoadmap = {
    id: 'googleRoadmap',
    name: 'Google Roadmap',
    url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    attribution: '&copy; Google',
    maxZoom: 22
}
const googleTerrain = {
    id: 'googleTerrain',
    name: 'Google Terrain',
    url: 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
    attribution: '&copy; Google',
    maxZoom: 22
}

export const basemaps = {
    osm: {
        id: 'osm',
        name: 'OSM',
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
    },
    esriWorldImagery: {
        id: 'esriWorldImagery',
        name: 'Esri Imagery',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: '&copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics',
        maxZoom: 18
    },
    googleSatellite,
    googleHybrid,
    googleRoadmap,
    googleTerrain
}

const DEFAULT_MARKER_IMG = require('@/assets/images/my-marker.webp')
export const defaultMarkerIcon = L.icon({
    iconUrl: DEFAULT_MARKER_IMG,
    iconRetinaUrl: DEFAULT_MARKER_IMG,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
})

export function safeByteSizeOf(v) {
    try {
        if (v == null) return 0
        if (typeof v === 'string') return new Blob([v]).size
        return new Blob([JSON.stringify(v)]).size
    } catch (e) {
        try { return String(v).length } catch (err) { console.warn('[byteSize] fallback failed', err); return 0 }
    }
}

export function hashStringFNV1a(str) {
    const s = typeof str === 'string' ? str : String(str ?? '')
    let h = 0x811c9dc5
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i)
        h = (h + (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)) >>> 0
    }
    return h.toString(16)
}

