<template>
  <div class="page-signature">
    <div class="bg-cyan pa-1">
      <VueSignaturePad
        ref="sigRef"
        :options="padOptions"
        :height="height"
        :min-width="minWidth"
        :max-width="maxWidth"
        class="sig-canvas"
      />
    </div>

    <div class="toolbar">
      <label class="stroke">
        Tebal
        <input type="range" min="0.4" max="3" step="0.1" v-model.number="stroke" />
        <span>{{ stroke.toFixed(1) }}px</span>
      </label>
      <button @click="clear">Clear</button>
      <button @click="undo">Undo</button>
      <button @click="save">Save</button>
    </div>
    <img v-if="imgUrl" :src="imgUrl" alt="preview" class="preview" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { VueSignaturePad } from '@selemondev/vue3-signature-pad'

const sigRef = ref(null)
const height = ref(180)
const stroke = ref(1.1)
const minWidth = computed(() => Math.max(0.4, stroke.value * 0.8))
const maxWidth = computed(() => Math.max(0.8, stroke.value * 1.6))
const imgUrl = ref(null)

const padOptions = computed(() => ({
  throttle: 2,
  minDistance: 0,
  backgroundColor: '#ffffff',
  penColor: '#111827',
}))

function _pad() {
  const c = sigRef.value
  if (!c) return null
  const exposed = c?.$?.exposed
  return c.signaturePad || exposed?.signaturePad || c.$refs?.signaturePad || null
}

function clear() {
  const c = sigRef.value
  if (!c) return
  if (typeof c.clearCanvas === 'function') return c.clearCanvas()
  if (typeof c.clearSignature === 'function') return c.clearSignature()
  if (typeof c.clear === 'function') return c.clear()
  const pad = _pad()
  if (pad?.clear) pad.clear()
}

function undo() {
  const c = sigRef.value
  if (!c) return
  if (typeof c.undo === 'function') return c.undo()
  if (typeof c.undoSignature === 'function') return c.undoSignature()
  const pad = _pad()
  if (!pad?.toData || !pad?.fromData) return
  const data = pad.toData()
  if (Array.isArray(data) && data.length) {
    data.pop()
    pad.fromData(data)
  }
}

function save() {
  const c = sigRef.value
  let dataUrl = null

  if (c?.saveSignature) dataUrl = c.saveSignature('image/png')
  else {
    const pad = _pad()
    if (!pad) return
    if (pad.isEmpty?.()) return
    dataUrl = pad.toDataURL?.() || null
  }
  if (!dataUrl) return
  imgUrl.value = dataUrl

  const a = document.createElement('a')
  a.href = dataUrl
  a.download = `signature-${Date.now()}.png`
  document.body.appendChild(a)
  a.click()
  a.remove()
}
</script>

<style scoped>
.page-signature { max-width: 640px; margin: 0 auto; padding: 16px; }
.sig-canvas { border: 2px dashed #cbd5e1; border-radius: 12px; background: #fff; touch-action: none; }
.toolbar { display: flex; gap: 10px; margin-top: 12px; align-items: center; flex-wrap: wrap; }
.toolbar .stroke { display: flex; align-items: center; gap: 8px; font-weight: 600; }
.toolbar .stroke input { width: 160px; }
.preview { display: block; margin-top: 12px; max-width: 100%; border-radius: 10px; border: 1px solid #e5e7eb; }
</style>