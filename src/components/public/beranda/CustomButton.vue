<template>
  <router-link :to="link" class="no-underline">
    <v-card
        height="100"
        width="110"
        elevation="0"
        class="pa-2 custom-btn"
    >
      <div class="text-subtitle-2">{{ label }}</div>
      <v-icon size="x-large" class="mt-1">{{ icon }}</v-icon>
    </v-card>
  </router-link>
</template>

<script>
export default {
  name: 'CustomButton',
  props: {
    label: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      required: true
    },
    link: {
      type: String,
      required: true
    }
  }
}
</script>

<style scoped>
.custom-link {
  text-decoration: none;
  color: inherit;
}

.custom-btn:hover {
  background-color: rgba(80, 160, 84, 0.4); /* Warna latar belakang tipis saat hover */
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1); /* Bayangan saat dihover */
  cursor: pointer;
}
.no-underline {
  text-decoration: none;
}

</style>