<template>
  <component
    :is="tag"
    class="card-section"
    :class="{
      'card-section-ghost': ghost,
      'card-section-tight': tight,
      'card-section-collapse': collapse
    }"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    tag?: string
    ghost?: boolean
    tight?: boolean
    collapse?: boolean
  }>(),
  {
    tag: 'div'
  }
)
</script>

<style lang="scss" scoped>
.card-section {
  background-color: transparent;
  text-align: left;
  margin: 0;
  border: none;
  color: inherit;
  box-sizing: border-box;
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: var(--body-padding);
  padding: var(--body-padding);
  min-height: 54px;
  transition: box-shadow 150ms;

  &.card-section-tight {
    &:not(:first-child) {
      padding-top: calc(0.75 * var(--body-padding));
    }

    &:not(:last-child) {
      padding-bottom: calc(0.75 * var(--body-padding));
    }
  }

  &.card-section-collapse {
    justify-content: flex-start;
  }

  &:not(.card-section-ghost):not(:first-child) {
    border-top: 1px solid var(--card-section-separator-color);
  }

  &:focus:focus-visible {
    box-shadow: 0 0 0 3px var(--mdc-theme-primary);
  }
}
</style>
