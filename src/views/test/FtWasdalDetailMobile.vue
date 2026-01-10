<template>
  <div>
    <!-- STICKY TABBAR (pure HTML, no Vuetify) -->
    <div ref="floatSentinel" class="float-sentinel" aria-hidden="true"></div>
    <header :class="['toolbar toolbar--top tabbar-toolbar', { 'is-floating': isFloating }]" ref="appBarRef">
      <span>
        <v-icon>mdi-arrow-left</v-icon>
      </span>
      <span class="btn-toggle-wrap" role="tablist" aria-label="Section Tabs">
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
      </span>
    </header>

    <!-- spacer untuk menghindari layout jump saat toolbar fixed di mobile -->
    <div class="toolbar-spacer" aria-hidden="true"></div>

    <!-- CONTENT -->
    <main class="content">
      <section
          v-for="s in sections"
          :key="s.id"
          :id="s.id"
          class="section my-2"
      >
        <p v-if="s.withText" class="text-caption mb-2">Section: {{ s.label }} — placeholder content.</p>

        <div v-if="s.withImage" class="my-6 text-center">
          <img
              src="https://picsum.photos/1200/600"
              alt="illustration"
              style="width:100%;height:auto;object-fit:cover;aspect-ratio:2/1;"
              @load="reobserve()"
          />
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { useStickyTabbar } from "./FtWasdalDetailMobile.sticky.js"

const sections = ref([
  { id: "profile", label: "Profile", withText: true },
  { id: "peta", label: "Peta", withImage: true, withText: true },
  { id: "fasilitasi", label: "Fasilitasi", withText: true },
  { id: "simpan", label: "Simpan", withText: true }
])

const { active, isFloating, appBarRef, floatSentinel, scrollTo, reobserve } = useStickyTabbar(sections)

</script>

<style scoped src="./FtWasdalDetailMobile.sticky.css"></style>
