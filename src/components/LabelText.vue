<template>
  <div class="text">
    <div class="primary">
      <slot />
    </div>
    <div class="secondary" v-if="$slots.secondary">
      <slot name="secondary" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.secondary {
  margin-top: 6px;
  color: var(--dimmed-foreground);
}
</style>
