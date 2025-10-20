<script lang="ts" setup>
const model = defineModel<boolean>({ default: false })
</script>

<template>
  <v-snackbar v-model="model" color="snackbar">
    <slot />

    <template #actions>
      <slot name="actions" />

      <v-btn icon="mdi-close" color="blue-grey" @click="model = false" />
    </template>
  </v-snackbar>
</template>
