<template>
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle :style="{ fill }" cx="8" cy="8" r="8" fill-rule="evenodd" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ color: string }>()
const fill = computed(() => `var(--group-${props.color})`)
</script>
