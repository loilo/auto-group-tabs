<template>
  <div class="switch-list-item" :class="{ 'two-line': $slots.secondary }">
    <div>
      <slot />
      <div class="secondary" v-if="$slots.secondary">
        <slot name="secondary" />
      </div>
    </div>
    <mwc-switch
      class="switch"
      :checked="modelValue"
      @change="$emit('update:modelValue', $event.target.checked)"
    />
  </div>
</template>

<script setup>
import { defineEmit, defineProps } from 'vue'

defineEmit(['update:modelValue'])

defineProps({
  modelValue: Boolean
})
</script>

<style lang="scss" scoped>
.switch-list-item {
  -webkit-font-smoothing: antialiased;
  font-family: var(
    --mdc-typography-subtitle1-font-family,
    var(--mdc-typography-font-family, Roboto, sans-serif)
  );
  font-size: var(--mdc-typography-subtitle1-font-size, 1rem);
  font-weight: var(--mdc-typography-subtitle1-font-weight, 400);
  letter-spacing: var(--mdc-typography-subtitle1-letter-spacing, 0.009375em);
  text-decoration: var(--mdc-typography-subtitle1-text-decoration, inherit);
  text-transform: var(--mdc-typography-subtitle1-text-transform, inherit);
  line-height: 1.5rem;
  margin: 0px;
  list-style-type: none;
  color: var(--mdc-theme-text-primary-on-background, rgba(0, 0, 0, 0.87));
  padding: var(--mdc-list-vertical-padding, 8px) 0;

  user-select: none;
  -webkit-tap-highlight-color: transparent;
  display: flex;
  position: relative;
  align-items: center;
  justify-content: flex-start;
  overflow: hidden;
  padding-top: 0px;
  padding-bottom: 0px;
  padding-left: var(--mdc-list-side-padding, 16px);
  padding-right: var(--mdc-list-side-padding, 16px);
  outline: none;
  height: 48px;
  color: var(--mdc-theme-text-primary-on-background, rgba(0, 0, 0, 0.87));

  &.two-line {
    height: 72px;
  }

  .secondary {
    color: var(--mdc-theme-text-secondary-on-background, rgba(0, 0, 0, 0.54));
    -webkit-font-smoothing: antialiased;
    font-family: var(
      --mdc-typography-body2-font-family,
      var(--mdc-typography-font-family, Roboto, sans-serif)
    );
    font-size: var(--mdc-typography-body2-font-size, 0.875rem);
    font-weight: var(--mdc-typography-body2-font-weight, 400);
    letter-spacing: var(--mdc-typography-body2-letter-spacing, 0.0178571em);
    text-decoration: var(--mdc-typography-body2-text-decoration, inherit);
    text-transform: var(--mdc-typography-body2-text-transform, inherit);
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    margin-top: 0px;
    line-height: normal;
    display: block;
  }

  .switch {
    margin-left: auto;
    --mdc-theme-secondary: var(--mdc-theme-primary);
  }
}
</style>
