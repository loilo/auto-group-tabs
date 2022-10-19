<script lang="ts" setup>
import { onMounted, onUnmounted } from 'vue'
import { useDialog } from '@/stores'

const dialog = useDialog()

onMounted(() => {
  dialog.counter++
  document.body.classList.add('no-scroll')
})

onUnmounted(() => {
  dialog.counter--

  if (dialog.counter === 0) {
    document.body.classList.remove('no-scroll')
  }
})
</script>

<template>
  <div class="dialog" role="dialog">
    <focus-trap>
      <div class="dialog-container">
        <div class="content">
          <slot />
        </div>
        <div class="actions-bar" v-if="$slots.actionsBar">
          <slot name="actionsBar" />
        </div>
      </div>
    </focus-trap>
  </div>
</template>

<style lang="scss" scoped>
:global(.no-scroll) {
  overflow: hidden !important;
}

.dialog {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 0 var(--body-padding);
  z-index: 5;

  overflow: auto;

  box-shadow: 0 -2px 2px rgb(0 0 0 / 25%);
  background-color: var(--background);

  ::v-deep(mwc-top-app-bar-fixed) {
    margin: 0 calc(-1 * var(--body-padding)) var(--body-padding);
  }

  @supports (overflow-y: overlay) {
    overflow-y: overlay;

    &::-webkit-scrollbar {
      width: 16px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: var(--blue-grey);
      border-radius: 10px;
      border: 6px solid transparent;
      box-sizing: content-box;
      background-clip: padding-box;
      transition: border-width 400ms;
    }

    &::-webkit-scrollbar-thumb:hover {
      border-width: 5px;
    }

    &::-webkit-scrollbar-track-piece {
      background: 0 0;
    }
  }
}

.actions-bar {
  display: flex;
  width: 100%;
  margin-left: auto;
  padding-bottom: var(--body-padding);
  z-index: 5;
  gap: 12px;
  grid-row: 2 / span 1;
}

focus-trap {
  height: 100%;
}

.dialog-container {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr auto;
  gap: var(--body-padding);
  height: 100%;
}

.content {
  grid-row: 1 / span 1;
  padding-bottom: var(--body-padding);
}
</style>
