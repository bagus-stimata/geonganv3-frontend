<template>
  <v-card :style="{ height: cardHeight }" class="page-signature" elevation="0">
    <div class="mt-n2 d-flex">
      <v-icon v-if="isEditing" @click="clear" color="green-darken-2" class="ml-1">mdi-broom</v-icon>
      <v-icon v-if="isEditing" @click="cancel"  class="ml-2" size="large" color="success">mdi-undo</v-icon>
      <v-spacer></v-spacer>
    </div>
    <div class="bg-cyan pa-1" v-if="isEditing">
      <VueSignaturePad
          v-if="isEditing"
          ref="sigRef"
          :options="padOptions"
          :height="heightPx"
          :min-width="minWidth"
          :max-width="maxWidth"
          class="sig-canvas"
      />
    </div>

    <div v-if="imgUrl && !isEditing">
      <v-img :height="heightPx" :src="imgUrl" alt="preview" class="preview disabled" contain />
    </div>

    <div class="d-flex">
      <v-spacer></v-spacer>
      <v-icon @click="editSignature" v-if="!isEditing" class="mt-n8 mr-1" size="large" color="orange">mdi-pencil-circle</v-icon>
      <v-icon @click="saveSignature" v-if="isEditing" class="mt-n8 mr-1" size="large" color="primary">mdi-check-circle</v-icon>
    </div>

    <div class="text-center text-caption mx-4 my-1 narrow-line-height">
      Tulis tanda tangan anda di atas area yang disediakan
    </div>

    <!-- Tidak digunakan -->
    <div class="toolbar" v-if="false">
      <label class="stroke">
        Tebal
        <input type="range" min="0.4" max="3" step="0.1" v-model.number="stroke" />
        <span>{{ stroke.toFixed(1) }}px</span>
      </label>
      <button @click="clear">Clear</button>
      <button @click="undo">Undo</button>
      <button @click="saveSignature">Save</button>
    </div>
  </v-card>
</template>

<script setup>
/* eslint-env vue/setup-compiler-macros */
import {ref, watch, nextTick, computed, onMounted, defineEmits} from 'vue'
import { VueSignaturePad } from '@selemondev/vue3-signature-pad'
import UploadService from "@/services/apiservices/file-upload-service";

const props = defineProps({
  fileImageUrl: {
    type: String,
    default: '',
  },
  itemFile: {
    type: Object,
    default: undefined,
  },
})

watch(
    () => props.fileImageUrl,
    async (newUrl) => {
      if (!newUrl) return
      await nextTick()
      await loadFromUrl(newUrl)
    },
    { immediate: true } // supaya langsung load kalau pertama kali sudah ada URL
)
defineExpose({
  loadFromUrl,
  editSignature,
  saveSignature,
  clear,
})

const emit = defineEmits(['saveSignature'])

const sigRef = ref(null)
const height = ref(130)
const heightPx = computed(() => `${height.value}px`)
const cardHeight = computed(() => `${height.value + 65}px`) // offset toolbar + padding

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
const isEditing = ref(false)

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
  // if (typeof c.clearSignature === 'function') return c.clearSignature()
  if (typeof c.clear === 'function') return c.clear()
  const pad = _pad()
  if (pad?.clear) pad.clear()
}

function cancel(){
  loadFromUrl(props.fileImageUrl)
  isEditing.value = false
}

function undo() {
  const c = sigRef.value
  if (!c) return
  if (typeof c.undo === 'function') return c.undo()
  // if (typeof c.undoSignature === 'function') return c.undoSignature()
  const pad = _pad()
  if (!pad?.toData || !pad?.fromData) return
  const data = pad.toData()
  if (Array.isArray(data) && data.length) {
    data.pop()
    pad.fromData(data)
  }

}

async function loadFromUrl(url) {
  if (!url) return
  imgUrl.value = url
  isEditing.value = false
}

function editSignature() {
  isEditing.value = true
  // clear canvas to start fresh
  clear()
}
function saveSignature() {
  // Grab image data from the pad/component
  const c = sigRef.value
  let dataUrl = null

  if (c?.saveSignature) {
    dataUrl = c.saveSignature('image/png')
  } else {
    const pad = _pad()
    if (!pad) return
    if (pad.isEmpty?.()) return
    dataUrl = pad.toDataURL?.('image/png') || null
  }

  if (!dataUrl) return

  // Update preview and exit edit mode
  imgUrl.value = dataUrl
  isEditing.value = false

  // Convert to File for upload
  const file = dataURLtoFile(dataUrl, 'signature.png')

  // Upload and emit to parent
  UploadService.uploadSignature(file, () => {})
    .then((response) => {
      const fileName = response?.data?.message || ''

      const messageToParent = {
        fileName: fileName,
        description: dataUrl,
        itemFile: props.itemFile,
      }
      emit('saveSignature', messageToParent)
    })
    .catch((err) => {
      console.error('Could not upload the image!', err)
    })
}

function dataURLtoFile(dataUrl, filename) {
  const arr = dataUrl.split(',')
  const mime = arr[0].match(/:(.*?);/)[1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type: mime })
}

onMounted(() => {
  // loadFromUrl(props.fileImageUrl)

  // loadFromUrl("https://upload.wikimedia.org/wikipedia/commons/b/b1/Logo_kota_batu_%281%29.png")
})
</script>

<style scoped>
.narrow-line-height {
  line-height: 1.0; /* relatif, jadi lebih responsif */
}
.page-signature { max-width: 640px; margin: 0 auto; padding: 16px; }
.sig-canvas {
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  background: #fff;
  touch-action: none;
}
.toolbar { display: flex; gap: 10px; margin-top: 12px; align-items: center; flex-wrap: wrap; }
.toolbar .stroke { display: flex; align-items: center; gap: 8px; font-weight: 600; }
.toolbar .stroke input { width: 160px; }
.preview { display: block; margin-top: 12px; max-width: 100%; border-radius: 10px; border: 1px solid #e5e7eb; }
</style>

<style scoped>
.preview.disabled {
  background: rgba(128, 128, 128, 0.25); /* grey overlay with opacity */
}


</style>