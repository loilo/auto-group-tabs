<template>
  <OverlayDialog :title="msg.settingsTitle" contrast>
    <template #activator="data">
      <slot name="activator" v-bind="data" />
    </template>

    <Card>
      <TransferDialog>
        <template #activator="{ props: activatorProps }">
          <NavigationCardSection v-bind="activatorProps">
            <Text>
              {{ msg.settingsTransferConfigurationTitle }}
              <template #secondary>
                {{ msg.settingsTransferConfigurationSubtitle }}
              </template>
            </Text>
          </NavigationCardSection>
        </template>
      </TransferDialog>
      <NavigationCardSection @click="reloadRuntime()">
        <Text>
          {{ msg.settingsForceReloadTitle }}
          <template #secondary>
            {{ msg.settingsForceReloadSubtitle }}
          </template>
        </Text>
      </NavigationCardSection>
    </Card>
  </OverlayDialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import Card from '@/components/Card/Card.vue'
import NavigationCardSection from '@/components/Card/NavigationCardSection.vue'
import Text from '@/components/Text.vue'
import OverlayDialog from './OverlayDialog.vue'
import TransferDialog from './TransferDialog.vue'

const emit = defineEmits<{
  (e: 'close'): void
}>()

const step = ref('base')

function reloadRuntime() {
  chrome.runtime.sendMessage('reload')
  window.close()
}

function close() {
  emit('close')
}
</script>

<style scoped>
.settings-dialog {
  background-color: var(--dimmed-background);
}
</style>
