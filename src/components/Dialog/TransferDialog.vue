<template>
  <OverlayDialog
    :title="msg.settingsTransferConfigurationTitle"
    class="transfer-dialog"
    contrast
    :class="{ dragging }"
    @dragenter="onDragenter"
    @dragleave="onDragleave"
    @dragover.prevent="noop"
    @drop="onDrop"
  >
    <template #activator="data">
      <slot name="activator" v-bind="data" />
    </template>

    <div v-if="dragging" class="drop-zone">Drop file to import</div>

    <Card class="transfer-card">
      <CardSection tight>
        <h2 class="subtitle-2">{{ msg.headlineExport }}</h2>
      </CardSection>
      <CardSection tight ghost>
        <v-btn @click="exportToFile">
          {{ msg.buttonExport }}
        </v-btn>
      </CardSection>
    </Card>
    <Card class="transfer-card">
      <CardSection tight>
        <h2 class="subtitle-2">{{ msg.headlineImport }}</h2>
      </CardSection>
      <CardSection tight ghost>
        <div>
          <input
            type="file"
            ref="importFileRef"
            @change="importFromFileInput"
            style="display: none"
          />
          <v-btn @click="pickFile" :disabled="importing">
            {{ msg.buttonImport }}
          </v-btn>
          <p class="warning-message">
            <v-icon class="warning-icon" icon="mdi-alert" />
            <span>{{ msg.importDiscardWarning }}</span>
          </p>

          <SlideVertical :duration="0.3">
            <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
          </SlideVertical>
        </div>
      </CardSection>
    </Card>

    <Snackbar v-model="showImportSuccessSnackbar">
      {{ msg.importSuccess }}
    </Snackbar>
  </OverlayDialog>
</template>

<script setup lang="ts">
import { noop } from '@vueuse/shared'
import { destr } from 'destr'
import date from 'php-date'
import { inject, ref } from 'vue'

import Card from '@/components/Card/Card.vue'
import CardSection from '@/components/Card/CardSection.vue'
import Snackbar from '@/components/Snackbar.vue'
import SlideVertical from '@/components/Util/SlideVertical.vue'
import OverlayDialog from './OverlayDialog.vue'

import { toRawDeep, useGroupConfigurations, useSyncedCopy } from '@/composables'
import { saveGroupConfigurations } from '@/util/group-configurations'
import { GroupConfigurationSchemas } from '@/util/schemas'
import { Translation } from '@/util/types'
import { autoResetRef } from '@vueuse/core'
// import { getOptions, saveOption } from '@/util/options'

const emit = defineEmits<{
  (e: 'close'): void
}>()

const msg = inject<Translation>('msg')!

const groupConfigurations = useGroupConfigurations()

function exportToFile() {
  const serializedGroupConfigurations = JSON.stringify(
    toRawDeep(groupConfigurations.data.value),
  )
  const filename = `auto-group-tabs-export--${date('Y-m-d_H:i:s')}.json`

  const blob = new Blob([serializedGroupConfigurations], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
}

const showImportSuccessSnackbar = ref(false)
const dragging = ref(false)
const importFileRef = ref()
const importing = ref(false)
const errorMessage = ref()

function pickFile() {
  importFileRef.value.click()
}

async function importFromFileInput() {
  const file = importFileRef.value.files[0]

  if (file) {
    importFile(file)
  }
}

async function importFile(file: File) {
  errorMessage.value = ''
  importing.value = true

  const rawContent = await file.text()
  const parsedContent = destr(rawContent)

  if (typeof parsedContent === 'undefined') {
    errorMessage.value = msg.importFormatError
    importing.value = false
    console.error('Imported file does not contain valid JSON')
    return
  }

  const parsedResult = GroupConfigurationSchemas.safeParse(parsedContent)
  if (!parsedResult.success) {
    errorMessage.value = msg.importFormatError
    importing.value = false
    console.error(parsedResult.error)
    return
  }

  groupsCopy.value = parsedResult.data

  showImportSuccessSnackbar.value = true

  importing.value = false
}

const groupsCopy = useSyncedCopy(groupConfigurations.data, () => {
  // Sync back to storage
  saveGroupConfigurations(groupsCopy.value)
})

function close() {
  emit('close')
}

const dragLeaveBlocked = autoResetRef(false, 0)
function onDragenter() {
  dragging.value = true
  dragLeaveBlocked.value = true
}

function onDragleave() {
  if (!dragLeaveBlocked.value) {
    dragging.value = false
  }
}
function onDrop(event: DragEvent) {
  event.preventDefault()
  dragging.value = false

  const file = event.dataTransfer?.files[0]
  if (file) {
    importFile(file)
  }
}
</script>

<style scoped>
.transfer-dialog {
  &.dragging {
    :deep(*) {
      pointer-events: none !important;
    }
  }
}

.transfer-card + .transfer-card {
  margin-top: var(--body-padding);
}

.drop-zone {
  --drop-zone-background: rgb(0 0 0 / 30%);
  --drop-zone-foreground: rgb(var(--v-theme-primary));

  @media (prefers-color-scheme: dark) {
    --drop-zone-background: rgb(0 0 0 / 70%);
  }

  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--drop-zone-background);
  color: var(--drop-zone-foreground);
  font-size: 1.5rem;
  font-weight: bold;
  z-index: 1000;
  pointer-events: none;
}

.warning-message {
  display: flex;
  align-items: center;
}
</style>
