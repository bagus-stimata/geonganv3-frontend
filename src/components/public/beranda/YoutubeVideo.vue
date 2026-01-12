<template>
  <div class="bg-grey-lighten-5">
    <div
      class="logos d-flex align-center justify-center"
      :class="{ 'flex-wrap': isSmAndDown, 'flex-nowrap': !isSmAndDown }"
    >
      <!-- youtube video Card -->
      <v-container >
        <div class="text-h4 mt-8 mb-6 font-weight-black color-text-second text-center">
          Video <span class="color-text-primary">Terkait</span>
        </div>
        <v-row v-if="youtubeVideos.length === 0">
          <v-col>
            <div class="text-center mt-2 my-6">No available videos</div>
          </v-col>
        </v-row>
        <v-row dense class="justify-center" v-else>
          <v-col
              v-for="(video, index) in youtubeVideos"
              :key="video.videoId || index"
              cols="12"
              sm="6"
              md="4"
              lg="3"
          >
            <v-card class="youtube-card rounded-lg overflow-hidden" elevation="1">
              <div class="video-wrapper">
                <iframe
                    :src="video.embedSrc"
                    title="YouTube video player"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                ></iframe>
              </div>

              <v-card-text class="py-2 text-center">
                <div class="text-subtitle-2 font-weight-medium" style="line-height: 1.1;">
                  {{ video.title }}
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

    </div>


  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useDisplay } from "vuetify";
import FDinCarouselService from "@/services/apiservices/f-din-carousel-service";

// eslint-disable-next-line no-undef
defineProps({
  fdinCarousels: {
    type: Array,
    default: () => []
  }
});

const { smAndDown } = useDisplay();
const isSmAndDown = computed(() => smAndDown.value);


// --- BEGIN: YouTube timestamp helpers ---
const parseYoutubeStartTime = (raw) => {
  if (!raw) return "";

  // normalize input
  const val = raw.toString().trim();

  // already embed params
  if (val.includes("?start=")) return val;

  // handle t=84s or t=1m24s
  if (val.includes("t=")) {
    const tPart = val.split("t=")[1];
    let seconds = 0;

    const minMatch = tPart.match(/(\d+)m/);
    const secMatch = tPart.match(/(\d+)s/);

    if (minMatch) seconds += parseInt(minMatch[1], 10) * 60;
    if (secMatch) seconds += parseInt(secMatch[1], 10);

    if (!minMatch && !secMatch && /^\d+$/.test(tPart)) {
      seconds = parseInt(tPart, 10);
    }

    return `?start=${seconds}`;
  }

  return "";
};

const buildYoutubeEmbedSrc = (videoId) => {
  const [idPart, queryPart] = videoId.split("?");
  const startParam = parseYoutubeStartTime(queryPart);
  return `https://www.youtube.com/embed/${idPart}${startParam}`;
};
// --- END: YouTube timestamp helpers ---

const youtubeVideos = ref([]);

const fetchFDinCarousel = async () => {
  console.log("Fetch FDinCarousel");
  try {
    const response = await FDinCarouselService.getAllFDinCarouselByTypePublic(2);
    console.log(response.data);

    const active = (response?.data || []).filter(x => x.statusActive === true);
    youtubeVideos.value = active
      .map(item => ({
        videoId: (item.remark || "").trim(),
        title: (item.kode1 || "").trim(),
        embedSrc: buildYoutubeEmbedSrc((item.remark || "").trim())
      }))
      .filter(v => v.videoId); // buang yang kosong biar iframe aman
  } catch (e) {
    console.error("fetchFDinCarousel failed:", e);
  }
};


onMounted(() => {
  fetchFDinCarousel();
});
</script>

<style scoped>

.flex-wrap {
  flex-wrap: wrap;
}

.flex-nowrap {
  flex-wrap: nowrap;
}


.youtube-card {
  transition: box-shadow 0.25s ease, transform 0.25s ease;
}

.youtube-card:hover {
  box-shadow: 0px 8px 22px rgba(0, 0, 0, 0.2);
  transform: translateY(-3px);
}

.video-wrapper {
  position: relative;
  width: 100%;
  padding-top: 56.25%;
}

.video-wrapper iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
</style>