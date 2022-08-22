<script lang="ts" setup>
import Tag from './Tag.vue'
import Select from './Form/Select.vue'

import { onMounted, watch } from 'vue'
import {
  useChromeState,
  useGroupConfigurations,
  useSyncedCopy
} from '@/composables'
import { computed } from '@vue/reactivity'
import { until } from '@vueuse/core'
import {
  createGroupConfigurationMatcher,
  saveGroupConfigurations
} from '@/util/group-configurations'

const groups = useGroupConfigurations()

const groupColors = computed(() =>
  Object.fromEntries(groups.data.value.map(group => [group.id, group.color]))
)

const isRunningInExtension = typeof chrome.runtime !== 'undefined'

const [currentTab] = isRunningInExtension
  ? await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true
    })
  : []

await until(groups.loaded).toBeTruthy()
await until(() =>
  isRunningInExtension ? useChromeState().tabGroups.loaded.value : true
).toBeTruthy()

const tabGroup = computed(() =>
  currentTab && currentTab.groupId !== chrome.tabGroups.TAB_GROUP_ID_NONE
    ? useChromeState().tabGroups.items.value.find(
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

const options = useSyncedCopy(() => [
  ...groups.data.value.map(group => ({
    value: group.id,
    label: group.title
  }))
])

const value = useSyncedCopy(() => props.modelValue)

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'new'): void
}>()

onMounted(() => {
  console.log('TAB?', currentTab)
  console.log('ANY GROUP?', tabGroup.value)
  console.log('CONFIGURED GROUP?', tabGroupConfigured.value)
  if (tabGroupConfigured.value) {
    emit('update:modelValue', tabGroupConfigured.value.id)
  }
})

watch(value, async value => {
  if (value === 'add-new') {
    emit('new')
    emit('update:modelValue', value)
  } else if (value === 'add-from-current') {
    const id = crypto.randomUUID()

    const groupsChanged = until(groups.data).changed()
    await saveGroupConfigurations([
      ...groups.data.value,
      {
        id,
        title: tabGroup.value!.title ?? '',
        color: tabGroup.value!.color,
        matchers: [],
        options: { strict: false }
      }
    ])
    await groupsChanged

    emit('update:modelValue', id)
  } else {
    emit('update:modelValue', value)
  }
})
</script>

<template>
  <Select :options="options" :label="msg.popupSelectLabel" v-model="value">
    <template v-if="tabGroup && !tabGroupConfigured" #before>
      <mwc-list-item value="add-from-current" class="add-from-current">
        <span class="create-group-item">
          <span class="create-group-item-label">
            {{ msg.popupAddCurrentGroup }}
          </span>
          <Tag :color="tabGroup!.color" :title="tabGroup!.title" />
        </span>
      </mwc-list-item>
      <li divider role="separator"></li>
    </template>
    <template #default="{ value, label }">
      <Tag :color="groupColors[value]" :title="label" />
    </template>
    <template #after>
      <li divider role="separator"></li>
      <mwc-list-item value="add-new" class="add-new">
        <span class="create-group-item">
          <span class="create-group-item-label">
            {{ msg.popupCreateGroup }}
          </span>
        </span>
      </mwc-list-item>
    </template>
  </Select>
</template>

<style lang="scss" scoped>
.create-group-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--mdc-theme-primary);

  &::before {
    content: 'add';
    font-family: var(--mdc-icon-font, 'Material Icons');
    font-weight: normal;
    font-style: normal;
    font-size: 22px;
    line-height: 1;
    letter-spacing: normal;
    text-transform: none;
    display: inline-block;
    white-space: nowrap;
    overflow-wrap: normal;
    direction: ltr;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizelegibility;
    font-feature-settings: 'liga';
  }
}

.create-group-item-label {
  font-size: 14px;
  font-weight: 500;
  margin-top: 0.15em;
}

.add-from-current {
  margin-bottom: 6px;
}

.add-new {
  margin-top: 6px;
}
</style>
