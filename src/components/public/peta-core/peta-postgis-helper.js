import FileService from '@/services/apiservices/file-service'
import ETipePeta from "@/models/e-tipe-peta";

import L from "leaflet";

export function resolveMarkerImageUrl(markerImage) {
    const v = (markerImage == null) ? '' : String(markerImage).trim()
    if (!v) return ''
    if (/^https?:\/\//i.test(v)) return v
    try {
        return FileService.fileMarker(v)
    } catch (e) {
        console.warn('[marker-helper][resolveMarkerImageUrl] fallback raw value', e)
        return v
    }
}
export function isPointTipePeta(tipePeta) {
    try {
        if (ETipePeta?.POINT != null && tipePeta === ETipePeta.POINT) return true
        const s = String(tipePeta ?? '').trim().toUpperCase()
        if (s === 'POINT') return true
        const n = Number(tipePeta)
        return Number.isFinite(n) && n === 1
    } catch (e) {
        console.warn('[PetaPostgis][isPointTipePeta] failed', e)
        return true
    }
}

export function getMarkerIconForFeature(feature) {
    try {
        const debugOn = (this.$props?.debugMarkerIcon === true)
        const debugMarker = (...args) => {
            if (!debugOn) return
            try { console.log('[PetaPostgis][markerIcon]', ...args) } catch (e) { console.warn('[markerIcon] debug log failed', e) }
        }

        const propsFeature = feature?.properties || {}
        const dsIdRaw = (
            propsFeature.__datasetId ??
            propsFeature.__datasetBean ??
            propsFeature.ftDatasetBean ??
            propsFeature.ft_dataset_bean ??
            propsFeature.datasetId ??
            propsFeature.dataset_id ??
            propsFeature.ftDatasetId ??
            propsFeature.datasetBean ??
            propsFeature.idDataset ??
            propsFeature.id_dataset
        )

        let dsId = (dsIdRaw == null || String(dsIdRaw).trim() === '') ? null : Number(dsIdRaw)

        if ((!Number.isFinite(dsId) || dsId == null || dsId <= 0) && Number.isFinite(feature?.__datasetId)) {
            dsId = Number(feature.__datasetId)
        }

        if (!Number.isFinite(dsId) || dsId == null || dsId <= 0) {
            debugMarker('checkpoint: dsId missing/invalid', { dsIdRaw, dsId, featureId: feature?.id, markerKey: propsFeature?.__markerKey })
            dsId = null
        } else {
            debugMarker('checkpoint: dsId ok', { dsId })
        }

        const list = Array.isArray(this.itemsMapsetSelected) ? this.itemsMapsetSelected : []
        let ds = null

        if (dsId == null && list.length === 1) {
            ds = list[0]
            debugMarker('checkpoint: ds fallback single selected', { dsId: null, selectedCount: list.length })
        }

        if (!ds && dsId != null && list.length > 0) {
            ds = list.find(x => {
                const xid = Number(
                    x?.id ?? x?.datasetId ?? x?.dataset_id ?? x?.ftDatasetBean ?? x?.ft_dataset_bean ?? x?.ftDatasetId ?? x?.datasetBean
                )
                return Number.isFinite(xid) && xid === dsId
            })
            debugMarker('checkpoint: ds match by dsId', { dsId, found: Boolean(ds), selectedCount: list.length })
        }

        if (!ds) {
            debugMarker('checkpoint: ds not found -> default marker', { dsId, selectedCount: list.length })
            return null
        }

        const tipePeta = ds?.tipePeta ?? ds?.tipe_peta
        if (tipePeta != null && !this.isPointTipePeta(tipePeta)) {
            debugMarker('checkpoint: tipePeta not POINT -> skip custom icon', { tipePeta, dsId: ds?.id ?? dsId })
            return null
        }

        const markerImageFromFeature = (propsFeature?.markerImage ?? propsFeature?.marker_image ?? null)
        const markerImageFromDataset = (ds?.markerImage ?? ds?.marker_image ?? null)

        const markerImageRaw = (markerImageFromFeature != null && String(markerImageFromFeature).trim() !== '')
            ? markerImageFromFeature
            : markerImageFromDataset

        if (markerImageRaw == null || String(markerImageRaw).trim() === '') {
            debugMarker('checkpoint: markerImage missing -> default marker', { dsId: ds?.id ?? dsId })
            return null
        }

        const markerImageUrl = resolveMarkerImageUrl(markerImageRaw)
        if (!markerImageUrl) {
            debugMarker('checkpoint: resolveMarkerImageUrl failed -> default marker', { dsId: ds?.id ?? dsId })
            return null
        }

        const iconSize = [32, 32]
        const cacheKey = `${markerImageUrl}|${iconSize[0]}x${iconSize[1]}`
        const cached = this._markerIconCache.get(cacheKey)
        if (cached) {
            debugMarker('checkpoint: icon cache hit', { cacheKey })
            return cached
        }

        const icon = L.icon({
            iconUrl: markerImageUrl,
            iconSize,
            iconAnchor: [16, 32],
            popupAnchor: [0, -32],
            shadowUrl: undefined,
            shadowSize: undefined,
            shadowAnchor: undefined
        })

        this._markerIconCache.set(cacheKey, icon)
        debugMarker('checkpoint: icon created', { cacheKey })
        return icon
    } catch (e) {
        console.warn('[PetaPostgis][getMarkerIconForFeature] failed, fallback default marker', e)
        return null
    }
}

export function safeParseGeojson(v, idForLog) {
    if (!v) return null
    if (typeof v === 'object') return v
    if (typeof v !== 'string') return null
    try {
        return JSON.parse(v)
    } catch (e) {
        console.error('[viewport] geojsonForMap JSON.parse failed', { id: idForLog, err: e, sample: String(v).slice(0, 160) })
        return null
    }
}

export function  normalizePropertiesShowKeys(v) {
  if (v == null) return []
  if (Array.isArray(v)) {
    return v.map(x => String(x ?? '').trim()).filter(Boolean)
  }
  if (typeof v === 'string') {
    const s = v.trim()
    if (!s) return []
    try {
      const parsed = JSON.parse(s)
      if (Array.isArray(parsed)) {
        return parsed.map(x => String(x ?? '').trim()).filter(Boolean)
      }
    } catch (e) {
      // ignore JSON parse error, fallback comma
    }
    return s.split(',').map(x => x.trim()).filter(Boolean)
  }
  if (typeof v === 'object') {
    return Object.keys(v).map(x => String(x ?? '').trim()).filter(Boolean)
  }
  return []
}


