<script lang="ts" setup>
import GroupTag from '@/components/GroupTag.vue'

import { computed } from 'vue'
import { useChromeState, useGroupConfigurations } from '@/composables'
import { until } from '@vueuse/core'
import { createGroupConfigurationMatcher } from '@/util/group-configurations'

const [currentTab] = await chrome.tabs.query({
  active: true,
  lastFocusedWindow: true
})

const groups = useGroupConfigurations()
await until(groups.loaded).toBeTruthy()

const chromeState = useChromeState()
const tabGroup = computed(() =>
  currentTab && currentTab.groupId !== chrome.tabGroups.TAB_GROUP_ID_NONE
    ? chromeState.tabGroups.items.value.find(
        tabGroup => tabGroup.id === currentTab!.groupId
      )
    : undefined
)

const tabGroupPredicate = computed(() =>
  tabGroup.value ? createGroupConfigurationMatcher(tabGroup.value) : () => false
)

const tabGroupConfigured = computed(() =>
  groups.data.value.find(tabGroupPredicate.value)
)

const emit = defineEmits<{
  (
    e: 'createGroup',
    title: string,
    color: chrome.tabGroups.ColorEnum,
    tabs: chrome.tabs.Tab[]
  ): void
  (e: 'editGroup', id: string): void
}>()

function edit() {
  emit('editGroup', tabGroupConfigured.value!.id)
}
</script>

<template>
  <mwc-button v-if="tabGroup && tabGroupConfigured" icon="tab" @click="edit">
    {{ msg.popupEditCurrentGroup }} &nbsp;
    <GroupTag :color="tabGroup.color" :title="tabGroup.title" dense />
  </mwc-button>
</template>

<style lang="scss" scoped>
.suggestions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-bottom: 0.25rem;
}

.suggestions-title {
  color: var(--dimmed-foreground);
  font-weight: var(--mdc-typography-button-font-weight, 500);
}
</style>
