<template>
  <div class="align-self-center">
    <v-dialog
        v-model="dialogShow"
        :style="{ zIndex: formDialogOptions.zIndex }"
        @keydown.esc.prevent="closeDialog"
        transition="dialog-top-transition"
        persistent
        fullscreen
        :hide-overlay="$vuetify.display.smAndDown"
    >
      <v-card class="camera-card">
        <v-toolbar class="grey lighten-3" elevation="0" density="compact" style="position: sticky; top: 0; z-index: 2000;">
          <v-btn icon @click="closeDialog">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <v-toolbar-title>Camera</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
        <v-card-text class="camera-body justify-center">
          <div v-show="cameraVisible" class="justify-center text-center camera-container">
            <video
                ref="videoEl"
                autoplay
                muted
                playsinline
                id="cam"
                style="max-width: 100%; border-radius: 12px;"
            />
          </div>
          <div v-show="cameraVisible" class="mt-2 text-center">
            <v-btn width="120" elevation="2" variant="elevated" class="capture-btn rounded-xl"
                   color="red" @click="capture" prepend-icon="mdi-camera">
              Capture
            </v-btn>
          </div>

          <div v-show="canvasVisible" class="flex-container justify-center">
            <div class="text-center">
              <canvas id="canvas" ref="canvasEl" style="max-width: 100%; border-radius: 12px;" />
              <div class="mt-4">
                <span v-for="f in filters" :key="f.key" class="mr-2">
                  <v-btn size="small" variant="outlined" @click="runFilter(f.key)">{{ f.label }}</v-btn>
                </span>
              </div>
              <div class="mt-3 d-flex ga-2 justify-center">
                <v-btn size="small" variant="outlined" prepend-icon="mdi-rotate-left" @click="rotateLeft">Rotate Left</v-btn>
                <v-btn size="small" variant="outlined" prepend-icon="mdi-rotate-right" @click="rotateRight">Rotate Right</v-btn>
              </div>
              <div class="mt-4 d-flex ga-2 justify-center">
                <v-btn class="rounded"  color="red" variant="elevated" @click="retake" prepend-icon="mdi-arrow-left">Ambil Ulang</v-btn>
                <v-btn  class="rounded" variant="elevated" color="primary" :loading="dialogProgres" @click="startUpload" prepend-icon="mdi-cloud-upload">
                  Upload
                </v-btn>
              </div>
            </div>
          </div>
          <div v-if="progress" class="mt-6">
            <v-progress-linear
                v-model="progress"
                color="light-blue"
                height="25"
                reactive
            >
              <strong>{{ progress }} %</strong>
            </v-progress-linear>
          </div>
        </v-card-text>
      </v-card>

      <v-alert v-if="message" type="info" variant="tonal" class="ma-3">
        {{ message }}
      </v-alert>

      <close-confirm-dialog
          ref="refCloseConfirmDialog"
          @eventFromCloseConfirm="passingEventFromCloseConfirm"
      />
    </v-dialog>
    <v-dialog v-model="dialogProgres" hide-overlay persistent width="300">
      <v-card color="primary" dark>
        <v-card-text>
          Please Wait...
          <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import UploadService from "@/services/apiservices/file-upload-service";
import CloseConfirmDialog from "@/components/utils/CloseConfirmDialog";

import { onMounted, onBeforeUnmount, reactive, ref, nextTick } from "vue";
import { applyPresetOnCanvas, clarendon, gingham, aden } from "instagram-filters";

export default {
  name: "camera-dialog",
  components: { CloseConfirmDialog },
  props: {
    parentId: Number,
  },
  setup(props, { emit }) {
    // Refs
    const videoEl = ref(null);
    const canvasEl = ref(null);
    const mediaStream = ref(null);

    // UI state
    const dialogShow = ref(false);
    const dialogProgres = ref(false);
    const cameraVisible = ref(true);
    const canvasVisible = ref(false);

    // Filters (Indonesian labels)
    // keep internal keys for processing, show localized labels on buttons
    const filters = ref([
      { key: "clarendon", label: "Tegas" },
      { key: "gingham",  label: "Pudar" },
      { key: "aden",     label: "Lembut" },
    ]);

    // ===== Rotation state =====
    const rotation = ref(0); // degrees: 0,90,180,270

    // Upload state
    const currentImage = ref(undefined); // Blob for upload
    const previewImage = ref(undefined); // DataURL for <img>
    const progress = ref(0);
    const message = ref("");

    const formDialogOptions = reactive({
      title1: "",
      title2: "",
      message1: "",
      message2: "",
      errorMessage: "",
      color: "grey lighten-3",
      width: 1000,
      zIndex: 1000,
      noconfirm: false,
    });

    // ===== Camera handling =====
    const openCamera = async () => {
      // Helper to try opening with a specific resolution and mode
      const openWithRes = async (w, h, mode /* 'exact' | 'ideal' */) => {
        const video = {
          facingMode: { ideal: "environment" },
        };
        if (mode === "exact") {
          video.width = { exact: w };
          video.height = { exact: h };
        } else {
          video.width = { ideal: w };
          video.height = { ideal: h };
        }
        // Prefer no internal resampling when supported (Chrome/Android)
        video.resizeMode = "none";
        return navigator.mediaDevices.getUserMedia({ audio: false, video });
      };

      const candidates = [
        // { w: 3840, h: 2160 }, // 4K (UHD)
        { w: 2560, h: 1440 }, // 2K (QHD)
        { w: 1920, h: 1080 }, // Full HD
        { w: 1280, h: 720 },  // HD
      ];

      let stream = null;
      // 1) Try exact for each candidate
      for (const { w, h } of candidates) {
        try {
          stream = await openWithRes(w, h, "exact");
          break;
        } catch (_) { /* ignore and fall through */ }
      }
      // 2) If still none, try ideal for each candidate
      if (!stream) {
        for (const { w, h } of candidates) {
          try {
            stream = await openWithRes(w, h, "ideal");
            break;
          } catch (_) { /* ignore and fall through */ }
        }
      }
      // 3) Final fallback: let the browser pick any working camera
      if (!stream) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: { facingMode: { ideal: "environment" } },
          });
        } catch (e) {
          console.error(e);
          message.value = "Cannot access camera: " + (e?.message || e);
          return;
        }
      }

      // Attach and play
      mediaStream.value = stream;
      if (videoEl.value) {
        videoEl.value.srcObject = mediaStream.value;
        try {
          await videoEl.value.play(); // iOS Safari needs explicit play()
        } catch (_) { /* ignore */ }
      }

      // 4) Try to upgrade to device's max supported resolution (if supported)
      try {
        const track = mediaStream.value?.getVideoTracks?.()[0];
        const caps = track?.getCapabilities?.();
        if (track && caps) {
          const desired = {};
          if (caps.width && typeof caps.width.max === "number") desired.width = caps.width.max;
          if (caps.height && typeof caps.height.max === "number") desired.height = caps.height.max;

          // keep a sane 16:9 aspect ratio if the device exposes the range
          if (caps.aspectRatio && typeof caps.aspectRatio.min === "number" && typeof caps.aspectRatio.max === "number") {
            const sixteenNine = 16 / 9;
            desired.aspectRatio = Math.min(Math.max(sixteenNine, caps.aspectRatio.min), caps.aspectRatio.max);
          }

          if (Array.isArray(caps.resizeMode) ? caps.resizeMode.includes("none") : caps.resizeMode === "none") {
            desired.resizeMode = "none";
          }

          await track.applyConstraints(desired).catch(() => {});
        }
      } catch (e) {
        console.warn("Could not apply max camera constraints:", e);
      }
    };

    const stopCamera = () => {
      if (mediaStream.value) {
        mediaStream.value.getTracks().forEach(t => t.stop());
        mediaStream.value = null;
      }
    };

    // Helper to get active stream resolution
    const getActiveResolution = () => {
      const video = videoEl.value;
      if (!video) return { w: 1280, h: 720 };
      const track = video.srcObject?.getVideoTracks?.()[0];
      const settings = track?.getSettings?.() || {};
      const w = settings.width || video.videoWidth || 1280;
      const h = settings.height || video.videoHeight || 720;
      return { w, h };
    };

    // ===== Capture / Preview =====
    const capture = async () => {
      await nextTick();
      const video = videoEl.value;
      const canvas = canvasEl.value;
      if (!video || !canvas) return;

      // 1) Try full-res ImageCapture if available
      try {
        const track = video.srcObject?.getVideoTracks?.()[0];
        if (track && typeof window !== "undefined" && "ImageCapture" in window) {
          const ic = new window.ImageCapture(track);
          const photoBlob = await ic.takePhoto(); // full sensor resolution (device-dependent)

          // Draw blob to canvas to keep filter workflow consistent
          const img = await new Promise((resolve, reject) => {
            const url = URL.createObjectURL(photoBlob);
            const image = new Image();
            image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
            image.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
            image.src = url;
          });

          // Canvas at natural photo size
          canvas.width  = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          const ctx = canvas.getContext("2d");
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          previewImage.value = canvas.toDataURL("image/jpeg", 0.92);
          currentImage.value = photoBlob; // keep original blob (highest quality)
          cameraVisible.value = false;
          canvasVisible.value = true;
          rotation.value = 0;
          return;
        }
      } catch (e) {
        // Fallback to canvas capture if ImageCapture failed
        console.warn("ImageCapture failed, using canvas fallback:", e);
      }

      // 2) Fallback: capture from <video> at active stream resolution
      const { w, h } = getActiveResolution();
      // Set canvas to stream resolution to avoid downscale
      canvas.width  = w;
      canvas.height = h;

      const ctx = canvas.getContext("2d");
      // Draw full frame 1:1 (no letterboxing) since canvas == stream resolution
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(video, 0, 0, w, h);

      // Preview + Blob
      previewImage.value = canvas.toDataURL("image/jpeg", 0.92);
      await new Promise((resolve) =>
        canvas.toBlob((blob) => {
          currentImage.value = blob;
          resolve();
        }, "image/jpeg", 0.92)
      );

      cameraVisible.value = false;
      canvasVisible.value = true;
      rotation.value = 0;
    };

    const retake = () => {
      rotation.value = 0;
      currentImage.value = undefined;
      previewImage.value = undefined;
      cameraVisible.value = true;
      canvasVisible.value = false;
    };

    // ===== Rotation helpers =====
    const applyRotation = (delta) => {
      const canvas = canvasEl.value;
      if (!canvas) return;
      rotation.value = (rotation.value + delta + 360) % 360;

      // Copy current canvas to an offscreen canvas
      const srcW = canvas.width;
      const srcH = canvas.height;
      const off = document.createElement("canvas");
      off.width = srcW;
      off.height = srcH;
      const offCtx = off.getContext("2d");
      offCtx.drawImage(canvas, 0, 0);

      // Determine new canvas size after rotation
      const angle = rotation.value;
      const radians = (angle * Math.PI) / 180;
      const newW = angle % 180 === 0 ? srcW : srcH;
      const newH = angle % 180 === 0 ? srcH : srcW;

      // Resize and redraw with rotation
      canvas.width = newW;
      canvas.height = newH;
      const ctx = canvas.getContext("2d");
      ctx.save();
      ctx.translate(newW / 2, newH / 2);
      ctx.rotate(radians);
      ctx.drawImage(off, -srcW / 2, -srcH / 2);
      ctx.restore();

      // Update preview + blob
      previewImage.value = canvas.toDataURL("image/jpeg", 0.92);
      canvas.toBlob((blob) => {
        currentImage.value = blob;
      }, "image/jpeg", 0.92);
    };

    const rotateLeft = () => applyRotation(-90);
    const rotateRight = () => applyRotation(90);

    // ===== Filters =====
    const runFilter = (filter) => {
      const canvas = canvasEl.value;
      if (!canvas) return;
      switch (filter) {
        case "clarendon":
          applyPresetOnCanvas(canvas, clarendon());
          break;
        case "gingham":
          applyPresetOnCanvas(canvas, gingham());
          break;
        case "aden":
          applyPresetOnCanvas(canvas, aden());
          break;
      }
      // refresh preview + blob after filter
      previewImage.value = canvas.toDataURL("image/jpeg", 0.92);
      canvas.toBlob((blob) => {
        currentImage.value = blob;
      }, "image/jpeg", 0.92);
    };

    // ===== Public API =====
    const showDialog = async () => {
      dialogShow.value = true;
      progress.value = 0;
      message.value = "";
      currentImage.value = undefined;
      previewImage.value = undefined;
      cameraVisible.value = true;
      canvasVisible.value = false;

      await nextTick();
      await openCamera();
    };

    const closeDialog = () => {
      stopCamera();
      dialogShow.value = false;
    };

    onMounted(() => {
      // camera dibuka saat showDialog()
    });

    onBeforeUnmount(() => {
      stopCamera();
    });

    // ===== Upload =====
    const startUpload = async () => {
      if (!currentImage.value) {
        message.value = "Please capture an image first!";
        return;
      }
      progress.value = 0;
      dialogProgres.value = true;

      try {
        // Siapkan FormData (lebih kompatibel ke banyak backend)
        const formData = new FormData();
        const fileName = `capture_${Date.now()}.jpg`;
        const file = new File([currentImage.value], fileName, { type: "image/jpeg" });
        formData.append("file", file);

        // Kalau UploadService.uploadImage butuh blob langsung, ganti ke currentImage.value
        const response = await UploadService.uploadImage(file, (event) => {
          if (event && event.total) {
            progress.value = Math.round((100 * event.loaded) / event.total);
          }
        });

        message.value = response?.data?.message || fileName;

        // Emit ke parent
        const messageToParent = {
          fileName: message.value,
          description: "", // isi kalau ada input deskripsi
        };
        emit("eventUploadSuccess", messageToParent);

      } catch (err) {
        progress.value = 0;
        message.value = "Could not upload the image! " + err;
      } finally {
        dialogProgres.value = false;
      }
    };

    return {
      // refs
      videoEl,
      canvasEl,
      // state
      dialogShow,
      dialogProgres,
      cameraVisible,
      canvasVisible,
      filters,
      previewImage,
      progress,
      message,
      formDialogOptions,
      // rotation
      rotation,
      rotateLeft,
      rotateRight,
      // methods
      showDialog,
      closeDialog,
      capture,
      retake,
      runFilter,
      startUpload,
    };
  },

  // ===== Option API bits (bila masih pakai CloseConfirmDialog lama) =====
  data() {
    return {
      itemDefault: {},
      itemModified: {},
    };
  },
  computed: {
    isItemModified() {
      const defaultItem = JSON.stringify(this.itemDefault || {});
      const modifiedItem = JSON.stringify(this.itemModified || {});
      return defaultItem !== modifiedItem;
    },
  },
  methods: {
    passingEventFromCloseConfirm(value) {
      if (value === "OKE") {
        this.$emit("eventFromFormDialog1", this.itemModified);
        this.closeDialog();
      }
    },
  },
};
</script>

<style scoped>
.preview {
  max-width: 200px;
}
.flex-container {
  display: flex;
  gap: 16px;
}

.camera-card {
  height: 100vh;
  display: flex;
  flex-direction: column;
}
.camera-body {
  flex: 1;            /* fill below toolbar */
  position: relative; /* contain absolutely positioned camera */
  padding: 0;         /* no extra space */
}
.camera-container {
  position: absolute;
  inset: 0;           /* top:0; right:0; bottom:0; left:0 */
  width: 100%;
  height: 100%;
  background: black;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;         /* stay under toolbar */
}

#cam {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.capture-btn {
  position: absolute;
  bottom: 35px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
}
</style>