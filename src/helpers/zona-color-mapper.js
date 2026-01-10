class ZonaColorMapper {
    constructor() {
        this.zonaPalette = {
            // Kawasan Lindung
            'pembangkit tenaga listrik': '#4f7ea8',
            'kawasan peruntukan industri': '#451f39',
            'industri': '#735a83',
            'pariwisata': '#9575CD',

            'hutan lindung': '#373655',
            'perlindungan setempat': '#3777b6',
            'ruang terbuka hijau': '#7CFC00',

            'rimba kota': '#35473d',
            'taman kota': '#4f776a',
            'taman kecamatan': '#589e71',
            'taman kelurahan': '#429365',
            'taman rw': '#44b17b',
            'taman rt': '#35ae68',
            'pemakaman': '#26e174',
            'jalur hijau': '#08f382',

            // 'konservasi': '#35473d',
            'taman hutan raya': '#625fac',

            // Zona Perumahan
            'perumahan kepadatan tinggi': '#cc8b26',
            'perumahan kepadatan sedang': '#e6c538',
            'perumahan kepadatan rendah': '#FFF59D',
            'perumahan': '#fff7ce', // fallback umum

            //Zona SPU
            'spu skala kota': '#5e3161',
            'spu skala kecamatan': '#95589a',
            'spu skala kelurahan': '#c58cc6',
            'spu skala rw': '#ddbbe1',

            //Zona Ruang Terbuka Non Hijau
            'ruang terbuka non hijau': '#0f447a',

            // Zona Perdagangan dan Jasa
            'perdagangan dan jasa skala kota': '#9c2d4f',
            'perdagangan dan jasa skala wp': '#c85c7f',
            'perdagangan dan jasa skala swp': '#dd899e',
            'perdagangan dan jasa': '#d17e97',

            // Zona Perkantoran
            'perkantoran pemerintahan': '#5a4f6c',
            'perkantoran pemerintah': '#675f78', // sinonim
            'perkantoran swasta': '#675f78',
            'perkantoran': '#675f78',

            // Lainnya
            'peruntukan lainnya': '#9E9E9E',
            'pengelolaan persampahan': '#5D4037',
            'pengelolaan perpasiran': '#4E342E',
            'transportasi': '#911614',
            'pertahanan dan keamanan': '#532778',

            // Pertanian (⚠️ hortikultura = kuning, sesuai request)
            'pertanian tanaman tahunan': '#1B5E20',
            'pertanian tanaman pangan lahan basah': '#A5D6A7',
            'pertanian tanaman pangan lahan kering': '#DCE775',
            'pertanian campuran': '#66BB6A',

            'pertanian': '#66BB6A',
            'tanaman pangan': '#c3d75e',
            'hortikultura': '#FDD835', // ← KUNING
            'peternakan': '#8da57c',   // kalau mau kuning juga, ganti di sini

            // Hutan Produksi & Perikanan
            'hutan produksi tetap': '#2E8B57',
            'hutan produksi terbatas': '#c2d679',
            'hutan produksi': '#2E8B57',

            //Zona Perikanan
            'perikanan budidaya': '#60abdf',

            //Zona Badan Air
            'badan air': '#1e6ea5',
            'sungai': '#1e6ea5',
            'danau': '#1e6ea5',
            'situ': '#1e6ea5',
            'waduk': '#1e6ea5',

            // Default
            'default': '#9E9E9E'
        };

        this.paletteKeysDesc = Object.keys(this.zonaPalette)
            .filter(k => k !== 'default')
            .sort((a, b) => b.length - a.length);
    }

    norm(s = '') {
        return String(s).toLowerCase().trim();
    }

    findZoneHexByIncludes(descRaw = '') {
        const desc = this.norm(descRaw);
        for (const key of this.paletteKeysDesc) {
            if (desc.includes(key)) {
                return { canonical: key, hex: this.zonaPalette[key] };
            }
        }
        // console.log(this.getRandomColor())
        // return { canonical: 'default', hex: this.zonaPalette['default'] };
        return { canonical: 'default', hex: this.getRandomColor() };
    }
    getDescCandidate(props = {}) {
        // urutan prioritas, sama seperti yang kamu pakai
        const keys = [
            'description','Description',
            'pola_ruang','POLA_RUANG',
            'NAMOBJ','KETERANGAN','Keterangan',
            // -- last resort
            'Desa','DESA','desa'
        ];
        for (const k of keys) {
            const v = props?.[k];
            if (typeof v === 'string' && v.trim() !== '') {
                return v
            }
        }
        return '';
    }

    getRandomColor() {
        const letters = "0123456789ABCDEF";
        let color = "#";
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
}
export default new ZonaColorMapper()