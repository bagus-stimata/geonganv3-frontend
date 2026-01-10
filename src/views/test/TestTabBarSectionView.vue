<template>
  <div class="page">
    <!-- STICKY TABBAR (pure HTML, no Vuetify) -->
    <div ref="floatSentinel" class="float-sentinel" aria-hidden="true"></div>
    <header :class="['toolbar toolbar--top tabbar-toolbar', { 'is-floating': isFloating }]" ref="appBarRef">
      <div class="btn-toggle-wrap" role="tablist" aria-label="Section Tabs">
        <VBtnToggle
          class="btn-toggle"
          v-model="active"
          density="compact"
          divided
          mandatory
          rounded="xl"
        >
          <VBtn
            v-for="s in sections"
            :key="s.id"
            :value="s.id"
            size="x-small"
            variant="outlined"
            class="btn-toggle__item text-caption"
            @click.prevent="scrollTo(s.id)"
            density="compact"
            base-color="black"
            active-color="teal"
          >
            {{ s.label }}
          </VBtn>
        </VBtnToggle>
      </div>
    </header>

    <!-- spacer untuk menghindari layout jump saat toolbar fixed di mobile -->
    <div class="toolbar-spacer" aria-hidden="true"></div>

    <!-- CONTENT -->
    <main class="content">
      <section
        v-for="s in sections"
        :key="s.id"
        :id="s.id"
        class="section my-16"
      >
        <h2 class="text-h5 mb-4">{{ s.label }}</h2>

        <p v-for="i in 6" :key="i" class="mb-3">
          {{ s.label }} — paragraf ke-{{ i }}. Konten dummy…
        </p>

        <div v-if="s.withImage" class="my-6 text-center">
          <img
            src="https://picsum.photos/1200/600"
            alt="illustration"
            style="width:100%;height:auto;object-fit:cover;aspect-ratio:2/1;"
            @load="reobserve()"
          />
        </div>

        <hr class="mt-10" />
      </section>
    </main>

  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, nextTick } from 'vue'

// Offset kapan tabbar mulai nempel (px). Positif = lebih cepat nempel; negatif = lebih lambat
const STICKY_THRESHOLD_PX = 12

// Try to detect global app menubar height (fixed/sticky header)
const APP_BAR_SELECTORS = [
  '[data-app-menubar]',
  '.app-menubar',
  '.v-app-bar',
  'header[role="banner"]',
  'header.site-header',
]

const getCssVarPx = (name) => parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name)) || 0

const detectAppTop = () => {
  for (const sel of APP_BAR_SELECTORS) {
    const el = document.querySelector(sel)
    if (!el) continue
    const cs = getComputedStyle(el)
    if (cs.position === 'fixed' || cs.position === 'sticky') {
      const h = el.getBoundingClientRect().height || el.offsetHeight || 0
      if (h > 0) return h
    }
  }
  return 0
}

const sections = ref([
  { id: 'data',       label: 'Data Pemohon' },
  { id: 'dokumen',    label: 'Dokumen', withImage: true }, // gambar di tengah
  { id: 'persetujuan',label: 'Persetujuan' },
  { id: 'ttd',        label: 'Tanda Tangan' },
])

const active = ref(sections.value[0].id)
const appBarRef = ref(null)
const floatSentinel = ref(null)
let observer
let floatObserver

const isFloating = ref(false)

const observeFloat = async () => {
  // (re)create observer with current appTop offset
  if (floatObserver) { floatObserver.disconnect(); floatObserver = null }

  const sentinel = floatSentinel.value
  if (!sentinel) return

  const appTop = getCssVarPx('--app-top')
  // Stick when the sentinel scrolls past the top (just under app menubar)
  floatObserver = new IntersectionObserver((entries) => {
    for (const e of entries) {
      // When sentinel is NOT intersecting the viewport top area, enable floating
      isFloating.value = !e.isIntersecting
    }
  }, {
    root: null,
    threshold: 0,
    rootMargin: `-${appTop + STICKY_THRESHOLD_PX}px 0px 0px 0px`,
  })

  floatObserver.observe(sentinel)
}

const getHeaderOffset = () => {
  // hitung tinggi sticky bar biar scroll-nya pas
  const el = appBarRef.value?.$el ?? appBarRef.value
  return el ? el.getBoundingClientRect().height : 64
}

const scrollTo = async (id) => {
  const target = document.getElementById(id)
  if (!target) return
  const offset = getHeaderOffset() + getCssVarPx('--app-top') + 8
  const y = target.getBoundingClientRect().top + window.scrollY - offset
  window.scrollTo({ top: y, behavior: 'smooth' })
  // opsional sync hash
  history.replaceState(null, '', `#${id}`)
}

const observeActiveSection = () => {
  const offset = getHeaderOffset() + getCssVarPx('--app-top')
  // rootMargin top negatif supaya "aktif" saat bagian lewat tepat di bawah header
  observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            active.value = e.target.id
          }
        })
      },
      {
        root: null,
        threshold: 0.3,
        rootMargin: `-${offset + STICKY_THRESHOLD_PX}px 0px -40% 0px`,
      }
  )

  sections.value.forEach((s) => {
    const el = document.getElementById(s.id)
    if (el) observer.observe(el)
  })
}

const cleanupObserver = () => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
}

const reobserve = async () => {
  // panggil ini setelah image load / layout berubah
  cleanupObserver()
  const appTop = detectAppTop()
  document.documentElement.style.setProperty('--app-top', `${appTop}px`)
  const h = getHeaderOffset()
  document.documentElement.style.setProperty('--toolbar-h', `${h}px`)
  await observeFloat()
  await nextTick()
  observeActiveSection()
}

onMounted(async () => {
  await nextTick()
  const appTop = detectAppTop()
  document.documentElement.style.setProperty('--app-top', `${appTop}px`)
  // tambahin scroll-margin-top sebagai fallback (kalau pakai anchor link)
  const offset = getHeaderOffset() + 8
  document.documentElement.style.setProperty('--sticky-offset', `${offset}px`)
  const h = getHeaderOffset()
  document.documentElement.style.setProperty('--toolbar-h', `${h}px`)

  observeActiveSection()

  // re-init saat window resize (tinggi app-bar bisa berubah)
  window.addEventListener('resize', reobserve)

  await observeFloat()
})

onBeforeUnmount(() => {
  cleanupObserver()
  if (floatObserver) {
    floatObserver.disconnect()
    floatObserver = null
  }
  window.removeEventListener('resize', reobserve)
})
</script>

<style scoped>
.toolbar {
  position: relative;
  z-index: 1000;
  display: flex; align-items: center; justify-content: flex-start;
  gap: 12px; padding: 10px 16px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  backdrop-filter: saturate(120%) blur(6px);
  transition: transform .18s ease, box-shadow .18s ease;
}
.toolbar--top { top: 0; }

.is-floating {
  position: fixed !important;
  top: var(--app-top, 0px);
  left: 0; right: 0;
  width: 100%;
  z-index: 1800; /* di bawah menubar app */
  box-shadow: 0 6px 16px rgba(0,0,0,.06);
}
.is-floating + .toolbar-spacer { height: var(--toolbar-h, 56px); }
.toolbar-spacer { height: 0; transition: height .18s ease; }

.float-sentinel { position: relative; height: 1px; }

.page {
  min-height: 100vh;             /* biar konten penuh, tapi biarkan WINDOW yang scroll */
  display: grid;
  grid-template-rows: auto 1fr;
}

/* Content padding */
.content { padding: 16px; }

/* Anchor offset so heading isn't hidden behind sticky bar */
.section { scroll-margin-top: var(--sticky-offset, 72px); }

/* Mobile tweaks */
@media (max-width: 768px) {
  .toolbar-spacer { display: none; }
  .tabbar-toolbar { padding: 8px 14px; }
}

@media (min-width: 769px) {
  .toolbar-spacer { display: none; }
}

/* Vuetify button group wrapper (scrollable on small screens) */
.btn-toggle-wrap{ overflow-x:auto; padding:4px 4px; }
.btn-toggle{ display:inline-flex; gap:6px; }
.btn-toggle__item{ text-transform:none; letter-spacing:.2px; }

@media (max-width:768px){
  .btn-toggle__item{ min-height:30px; height:30px; font-size:.83rem; padding-inline:10px; }
}
</style>
