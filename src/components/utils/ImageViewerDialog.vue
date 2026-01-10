<template>
  <v-dialog v-model="dialogShow" fullscreen>
    <v-toolbar class="color-bg-second text-white" density="compact" flat>
      <v-btn
          density="compact"
          prepend-icon="mdi-download"
          @click="downloadImage"
      >Download</v-btn>
      <v-btn
          class="mx-2"
          icon="mdi-rotate-right"
          density="compact"
          @click="rotateCw90"
      ></v-btn>
      <v-btn
          class="mx-2"
          icon="mdi-rotate-left"
          density="compact"
          @click="rotateCcw90"
      ></v-btn>

      <v-spacer></v-spacer>
      <v-btn icon @click="closeDialog" density="compact">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-toolbar>
    <v-card style="background-color: rgb(0, 0, 0, 0.85);">
      <v-img
          :key="cacheBust"
          :lazy-src="lookupImageUrlFileName(fileName)"
          :src="lookupImageUrlLazyFileName(fileName)"
          min-width="180"
          height="180"
          content
      ></v-img>

    </v-card>
  </v-dialog>
</template>

<script>
import FileService from "@/services/apiservices/file-service";

export default {
  name: "ImageViewerDialog",
  components: {},
  data() {
    return {
      dialogShow: false,
      fileName: "",
      cacheBust: 0,
      isRotating: false,
    };
  },

  props: {
    infoDialogTitle: String,
  },
  computed: {},
  methods: {
    rotateCw90() {
      FileService.rotateCw90(this.fileName).then((response) => {
        this.isRotating =true
        // If backend returns a version/timestamp, prefer it; else bump locally
        this.cacheBust = response?.data?.version ?? Date.now();
      }).catch((e) => {
        // fallback: still force refresh to reflect any partial success
        this.cacheBust = Date.now();
        console.error(e);
      });
    },
    rotateCcw90() {
      FileService.rotateCcw90(this.fileName).then((response) => {
        this.isRotating =true
        this.cacheBust = response?.data?.version ?? Date.now();
      }).catch((e) => {
        this.cacheBust = Date.now();
        console.error(e);
      });
    },

    showDialog(imageFile) {
      this.dialogShow = !this.dialogShow;
      this.fileName = imageFile;
      this.cacheBust = 0;
      this.isRotating = false;
    },
    setDialogState(value) {
      this.dialogShow = value;
      if (this.isRotating) {
        this.$emit("rotating", true);
      }
    },
    closeDialog() {
      this.dialogShow = false;
      if (this.isRotating) {
        this.$emit("rotating", true);
      }
    },
    lookupImageUrlFileName(fileName) {
      if (fileName === undefined) {
        return require("@/assets/images/no_image_available.jpeg");
      } else {
        const base = FileService.image_url_ori(fileName);
        return `${base}?v=${this.cacheBust}`;
      }
    },
    lookupImageUrlLazyFileName(fileName) {
      const base = FileService.image_url_low(fileName);
      return `${base}?v=${this.cacheBust}`;
    },
    async downloadImage() {
      try {
        const url = this.lookupImageUrlFileName(this.fileName);
        const res = await fetch(url, {
          credentials: 'include',
          mode: 'cors',
          redirect: 'follow',
          headers: { Accept: 'image/*' }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const contentType = (res.headers.get('Content-Type') || '').toLowerCase();
        const blob = await res.blob();

        // --- Magic-byte sniffing to truly verify image ---
        const headBuf = await blob.slice(0, 16).arrayBuffer();
        const head = new Uint8Array(headBuf);
        const isJPEG = head[0] === 0xFF && head[1] === 0xD8 && head[2] === 0xFF;
        const isPNG  = head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4E && head[3] === 0x47;
        const isGIF  = head[0] === 0x47 && head[1] === 0x49 && head[2] === 0x46; // "GIF"
        const isRIFF = head[0] === 0x52 && head[1] === 0x49 && head[2] === 0x46 && head[3] === 0x46; // "RIFF"
        let isWEBP = false;
        if (isRIFF && head.length >= 12) {
          // bytes 8-12 should be "WEBP"
          isWEBP = head[8] === 0x57 && head[9] === 0x45 && head[10] === 0x42 && head[11] === 0x50;
        }
        const looksLikeImage = isJPEG || isPNG || isGIF || isWEBP || contentType.startsWith('image/');

        // Additional HTML heuristic: small text-ish payload containing "<html"
        let looksLikeHtml = false;
        if (!looksLikeImage || blob.size < 2_000_000 /* 2MB heuristic */) {
          try {
            const textHead = await blob.slice(0, 256).text();
            looksLikeHtml = /<\s*!doctype\s+html|<\s*html[\s>]/i.test(textHead);
          } catch (_) { /* ignore */ }
        }

        if (!looksLikeImage || looksLikeHtml) {
          console.error('downloadImage: payload is not an image (likely HTML/redirect).', { contentType, size: blob.size });
          this.$emit?.('notify', { type: 'error', text: 'Gagal download: respons bukan gambar (kemungkinan redirect/login).' });
          window.open(url, '_blank');
          return;
        }

        // Decide extension with priority: magic-byte → content-type → original name
        let ext = 'jpg';
        if (isPNG)  ext = 'png';
        else if (isGIF)  ext = 'gif';
        else if (isWEBP) ext = 'webp';
        else if (isJPEG) ext = 'jpg';
        else if (contentType.includes('image/png'))  ext = 'png';
        else if (contentType.includes('image/gif'))  ext = 'gif';
        else if (contentType.includes('image/webp')) ext = 'webp';
        else if (contentType.includes('image/jpeg') || contentType.includes('image/jpg')) ext = 'jpg';
        else {
          const parts = (this.fileName || '').split('.');
          if (parts.length > 1) ext = parts.pop();
        }

        // Build safe filename (strip .html/.htm if any)
        const raw = (this.fileName || 'image').split('?')[0].split('#')[0];
        const baseName = raw.replace(/\.(html?|jpg|jpeg|png|webp|gif)$/i, '');
        const fileName = `${baseName}.${ext}`;

        // iOS Safari: use DataURL fallback
        const isIosSafari =
          /iP(hone|ad|od)/.test(navigator.platform) ||
          (!!navigator.userAgent.match(/iPad|iPhone|iPod/) && !window.MSStream);
        if (isIosSafari) {
          const reader = new FileReader();
          reader.onload = () => {
            const a = document.createElement('a');
            a.href = reader.result;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            a.remove();
          };
          reader.readAsDataURL(blob);
          return;
        }

        // Default: ObjectURL download
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(blobUrl);
      } catch (err) {
        console.error('downloadImage error:', err);
        const fallback = this.lookupImageUrlFileName(this.fileName);
        window.open(fallback, '_blank');
      }
    },
  },
};
</script>

<style scoped>
</style>