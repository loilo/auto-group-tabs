<script lang="ts" setup>
import { useDialog } from '@/stores'
import { useId, watch } from 'vue'

const props = defineProps<{
  title?: string
  contrast?: boolean
}>()

const model = defineModel<boolean>({ default: false })

const dialog = useDialog()

const dialogId = useId()

watch(
  model,
  value => {
    if (value) {
      dialog.openDialogs.add(dialogId)
    } else {
      dialog.openDialogs.delete(dialogId)
    }
  },
  { immediate: true },
)
</script>

<template>
  <v-dialog v-model="model" transition="from-right" fullscreen>
    <template #activator="data">
      <slot name="activator" v-bind="data" />
    </template>

    <v-card
      class="dialog-card"
      :color="contrast ? 'dialog-contrast' : 'dialog'"
    >
      <v-toolbar v-if="title" density="compact">
        <v-btn icon="mdi-arrow-left" color="white" @click="model = false" />

        <v-toolbar-title>{{ title }}</v-toolbar-title>
      </v-toolbar>

      <v-container class="dialog-container">
        <div class="dialog-content">
          <slot />
        </div>

        <div v-if="$slots.actions" class="dialog-actions">
          <slot name="actions" />
        </div>
      </v-container>
    </v-card>
  </v-dialog>
</template>

<style scoped>
:global(.no-scroll) {
  overflow: clip !important;
}

.dialog-card {
  min-height: 100%;
}

.dialog-container {
  display: flex;
  flex-direction: column;
  min-height: max-content;
  height: 100%;
  gap: var(--body-padding);
}

.dialog-actions {
  margin-top: auto;
  display: flex;
  width: 100%;
  z-index: 5;
  gap: 12px;
}
</style>
