<!-- StickyToolbars.vue -->
<template>
  <div class="page">
    <!-- TOP STICKY TOOLBAR -->
    <header class="toolbar toolbar--top">
      <h3>Form Berita Acara</h3>
      <div class="actions">
        <button @click="onSave">Save</button>
        <button @click="onCancel">Cancel</button>
      </div>
    </header>

    <!-- CONTENT SCROLLABLE -->
    <main class="content">
      <p v-for="i in 50" :key="i">Konten panjang {{ i }}</p>
    </main>

    <!-- BOTTOM STICKY ACTION BAR (mobile-friendly) -->
    <footer class="toolbar toolbar--bottom">
      <button @click="onPrev">Prev</button>
      <button @click="onNext">Next</button>
      <button class="primary" @click="onSubmit">Submit</button>
    </footer>
  </div>
</template>

<script setup>
const onSave = () => console.log('save')
const onCancel = () => console.log('cancel')
const onPrev = () => console.log('prev')
const onNext = () => console.log('next')
const onSubmit = () => console.log('submit')
</script>

<style scoped>
.page { min-height: 100vh; display: grid; grid-template-rows: auto 1fr auto; }

/* Sticky bars */
.toolbar {
  position: sticky;
  z-index: 1000;
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; padding: 10px 16px;
  background: var(--bg, #fff);
  border-bottom: 1px solid #e5e7eb;
  backdrop-filter: saturate(120%) blur(6px);
}
.toolbar--top { top: 0; }
.toolbar--bottom {
  bottom: 0;
  border-top: 1px solid #e5e7eb; border-bottom: none;
}

/* Content area */
.content { padding: 16px; }

/* Simple buttons */
button { padding: 8px 12px; border-radius: 10px; border: 1px solid #d1d5db; background: #f9fafb; }
button.primary { background: #2563eb; color:#fff; border-color:#2563eb; }

.actions { display: flex; gap: 8px; }

/* iOS safe-area for bottom bar */
@supports(padding: max(0px)) {
  .toolbar--bottom { padding-bottom: max(10px, env(safe-area-inset-bottom)); }
}
</style>
