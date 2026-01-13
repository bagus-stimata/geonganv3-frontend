const EBeritaCateg = Object.freeze({
    PEMERINTAH: "Pemerintah",
    TEKNOLOGI: "Teknologi",
    EKONOMI: "Ekonomi",
    INFRASTRUKTUR: "Infrastruktur",
    PENDIDIKAN: "Pendidikan",
    KESEHATAN: "Kesehatan",
    SOSIAL: "Sosial"
})

const EBeritaCategs = Object.freeze([
    {
        id: EBeritaCateg.PEMERINTAH,
        description:  EBeritaCateg.PEMERINTAH
    },
    {
        id: EBeritaCateg.TEKNOLOGI,
        description:  EBeritaCateg.TEKNOLOGI
    },
    {
        id: EBeritaCateg.EKONOMI,
        description:  EBeritaCateg.EKONOMI
    },
    {
        id: EBeritaCateg.INFRASTRUKTUR,
        description:  EBeritaCateg.INFRASTRUKTUR
    },
    {
        id: EBeritaCateg.PENDIDIKAN,
        description:  EBeritaCateg.PENDIDIKAN
    },
    {
        id: EBeritaCateg.KESEHATAN,
        description:  EBeritaCateg.KESEHATAN
    },
    {
        id: EBeritaCateg.SOSIAL,
        description:  EBeritaCateg.SOSIAL
    },

])
export {EBeritaCateg as default, EBeritaCategs}