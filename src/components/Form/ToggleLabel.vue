<template>
  <label class="label" :for="props.for" @click="handleClick">
    <slot />
  </label>
</template>

<script setup lang="ts">
const props = defineProps<{
  for: string
}>()

function handleClick(event: MouseEvent) {
  event.preventDefault()
  document.getElementById(props.for)?.click()
}
</script>
