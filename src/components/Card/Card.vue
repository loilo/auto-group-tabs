<template>
  <div
    class="card"
    :class="{
      'card-seamless': seamless
    }"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  seamless?: boolean
}>()
</script>

<style lang="scss" scoped>
.card {
  --card-shadow-color: 60, 64, 67;
  --card-section-separator-color: var(--separator);
  --card-shadow: rgba(var(--card-shadow-color), 0.3) 0 1px 2px 0,
    rgba(var(--card-shadow-color), 0.15) 0 1px 3px 1px;

  @media (prefers-color-scheme: dark) {
    --card-shadow-color: 0, 0, 0;
  }

  box-shadow: var(--card-shadow);
  border-radius: var(--mdc-shape-small, 4px);
  background-color: var(--background);

  &.card-seamless {
    --card-shadow: none;
  }
}
</style>
