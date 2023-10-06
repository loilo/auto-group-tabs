<template>
  <OverlayDialog class="settings-dialog" @keydown.esc="close">
    <AppBar :label="msg.settingsTitle" @back="close" />

    <Card>
      <NavigationCardSection @click="step = 'transfer'">
        <Text>
          {{ msg.settingsTransferConfigurationTitle }}
          <template #secondary>
            {{ msg.settingsTransferConfigurationSubtitle }}
          </template>
        </Text>
      </NavigationCardSection>
      <NavigationCardSection @click="reloadRuntime()">
        <Text>
          {{ msg.settingsForceReloadTitle }}
          <template #secondary>
            {{ msg.settingsForceReloadSubtitle }}
          </template>
        </Text>
      </NavigationCardSection>
    </Card>

    <transition name="from-right">
      <TransferDialog v-if="step === 'transfer'" @close="step = 'base'" />
    </transition>
  </OverlayDialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import AppBar from '@/components/AppBar.vue'
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

<style lang="scss" scoped>
.settings-dialog {
  background-color: var(--dimmed-background);
}
</style>
