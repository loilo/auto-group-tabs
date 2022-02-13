<template>
  <mwc-top-app-bar-fixed dense>
    <mwc-icon-button
      class="white"
      icon="arrow_back"
      slot="navigationIcon"
      @click="emit('back')"
      ref="backButton"
    />
    <h2 slot="title">{{ props.label }}</h2>
  </mwc-top-app-bar-fixed>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const props = defineProps<{
  label: string
  autofocus?: boolean
}>()
const emit = defineEmits<{
  (e: 'back'): void
}>()

const backButton = ref()

onMounted(() => {
  if (props.autofocus) {
    // Need to wait for the <mwc-*> custom elements to render
    requestAnimationFrame(() => {
      backButton.value.focus()
    })
  }
})
</script>

<style lang="scss" scoped>
mwc-top-app-bar-fixed {
  --mdc-theme-primary: #3367d6;

  @media (prefers-color-scheme: dark) {
    --mdc-theme-on-primary: var(--foreground);
    --mdc-theme-primary: var(--background);
    border-bottom: 1px solid var(--separator);
  }
}

h2 {
  font-size: 1.125rem;
  margin: 0;
  line-height: 1;
  font-weight: 500;
}
</style>
