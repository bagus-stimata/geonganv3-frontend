// utils/deepEqualCanonical.js
export function deepEqualCanonical(a, b, opts = {}) {
    const {
        arrayMode = 'sort-ids', // default: sort by id kalau ada
        idKey = 'id',
        caseInsensitive = false
    } = opts;

    const norm = (v) => {
        if (v == null) return null;
        if (typeof v === 'number') return Number.isFinite(v) ? v : null;
        if (typeof v === 'boolean') return v;
        if (v instanceof Date) return v.toISOString();
        if (typeof v === 'string') {
            const s = v.trim();
            return caseInsensitive ? s.toLowerCase() : s;
        }
        if (Array.isArray(v)) {
            let arr = v.map(norm);
            if (arrayMode === 'sort-ids') {
                const canSort = arr.every(x => x && typeof x === 'object' && idKey in x);
                if (canSort) {
                    arr = arr.slice().sort((x, y) => {
                        const xi = x[idKey], yi = y[idKey];
                        if (typeof xi === 'number' && typeof yi === 'number') return xi - yi;
                        return String(xi).localeCompare(String(yi));
                    });
                } else {
                    arr = arr.slice().sort((x, y) => JSON.stringify(x).localeCompare(JSON.stringify(y)));
                }
            }
            return arr;
        }
        if (typeof v === 'object') {
            const out = {};
            for (const k of Object.keys(v).sort()) out[k] = norm(v[k]);
            return out;
        }
        return v;
    };

    return JSON.stringify(norm(a)) === JSON.stringify(norm(b));
}