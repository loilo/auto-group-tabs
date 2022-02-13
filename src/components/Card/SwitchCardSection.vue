<template>
  <CardSection class="switch-card-section">
    <ToggleLabel class="toggle-label" :for="id">
      <slot />
    </ToggleLabel>

    <mwc-switch class="card-checkbox" :id="id" />
  </CardSection>
</template>

<script setup lang="ts">
import ToggleLabel from '@/components/Form/ToggleLabel.vue'
import CardSection from './CardSection.vue'

import { computed, useAttrs } from 'vue'

const attrs = useAttrs()
const id = computed(() => `switch-${attrs.id ?? crypto.randomUUID()}`)
</script>

<style lang="scss" scoped>
.switch-card-section {
  cursor: pointer;
}

.toggle-label {
  cursor: inherit;
}
</style>
