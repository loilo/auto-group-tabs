<template>
  <CardSection tag="button" class="navigation-card-section">
    <slot />

    <ArrowRightIcon class="arrow-right" />
  </CardSection>
</template>

<script setup lang="ts">
import ArrowRightIcon from '@/components/ArrowRightIcon.vue'
import CardSection from './CardSection.vue'
</script>

<style scoped>
.navigation-card-section {
  cursor: pointer;
}

.arrow-right {
  color: var(--dimmed-foreground);
  flex-shrink: 0;
}
</style>
