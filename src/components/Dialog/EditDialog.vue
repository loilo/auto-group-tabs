<script setup lang="ts">
import Card from '@/components/Card/Card.vue'
import CardSection from '@/components/Card/CardSection.vue'
import ColorMenu from '@/components/Form/ColorMenu.vue'
import ToggleLabel from '@/components/Form/ToggleLabel.vue'
import LabelText from '@/components/LabelText.vue'
import TabBar from '@/components/TabBar.vue'
import SlideVertical from '@/components/Util/SlideVertical.vue'
import OverlayDialog from './OverlayDialog.vue'

import { useGroupConfigurations } from '@/composables'
import { useViewStore } from '@/stores'
import * as conflictManager from '@/util/conflict-manager'
import { SaveOptions, Translation } from '@/util/types'
import { useStyleTag } from '@vueuse/core'
import {
  computed,
  getCurrentInstance,
  inject,
  nextTick,
  onUnmounted,
  ref,
  useTemplateRef,
  watch,
} from 'vue'

const props = withDefaults(
  defineProps<{
    id?: string
    title?: string
    color: `${chrome.tabGroups.Color}`
    options?: SaveOptions
    deletable?: boolean
  }>(),
  {
    title: '',
    deletable: false,
    options: () => ({
      strict: false,
      merge: false,
    }),
  },
)

const emit = defineEmits<{
  (
    e: 'save',
    title: string,
    color: `${chrome.tabGroups.Color}`,
    options: SaveOptions,
  ): void
  (e: 'delete'): void
  (e: 'cancel'): void
}>()

const show = defineModel<boolean>({ default: false })

const groups = useGroupConfigurations()

const showAdvanced = ref(false)

const editTitle = ref(conflictManager.withoutMarker(props.title))
const editTitleLazy = ref(editTitle.value)
const editColor = ref(props.color)
const editStrict = ref(props.options.strict)
const editMerge = ref(props.options.merge)
const editFieldBlurred = ref(false)

const colorMenu = ref()
const titleField = useTemplateRef('titleField')

const viewStore = useViewStore()

viewStore.edit.onCloseSignal(cancel)

const { load } = useStyleTag(`html {
  min-height: 515px;
}`)

watch(
  show,
  async isShown => {
    if (!isShown) return

    // Reset edit fields
    editTitle.value = conflictManager.withoutMarker(props.title)
    editTitleLazy.value = editTitle.value
    editColor.value = props.color
    editStrict.value = props.options.strict
    editMerge.value = props.options.merge
    editFieldBlurred.value = false

    await nextTick()

    load()

    viewStore.edit.register(getCurrentInstance()!)
    colorMenu.value.refresh()

    titleField.value?.focus()
    titleField.value?.select()
  },
  { immediate: true },
)

onUnmounted(() => {
  viewStore.edit.deregister(getCurrentInstance()!)
})

const msg = inject<Translation>('msg')!

const titleErrorMessages = computed(() => {
  const messages: string[] = []

  const conflictingGroup = groups.data.value.find(
    group =>
      group.color === editColor.value &&
      group.title === editTitleLazy.value &&
      group.id !== props.id,
  )
  if (conflictingGroup) {
    messages.push(msg.duplicateGroupError)
  }

  return messages
})

function save(event: KeyboardEvent) {
  if (!groups.loaded.value) {
    alert(
      'Groups could not be loaded. This should never happen. Please report this bug to the extension author.',
    )
    return
  }

  if (!titleField.value?.isValid) return

  event.preventDefault()
  emit('save', editTitle.value, editColor.value, {
    strict: editStrict.value,
    merge: editMerge.value,
  })
  show.value = false
}

function cancel() {
  emit('cancel')
  show.value = false
}

function remove() {
  emit('delete')
  show.value = false
}
</script>

<template>
  <OverlayDialog
    class="edit-dialog-overlay"
    v-model="show"
    @keydown.enter="save"
  >
    <template #activator="data">
      <slot name="activator" v-bind="data" />
    </template>

    <TabBar
      :tab-title="msg.previewTitle"
      :group-title="editTitle"
      class="preview"
      :style="{
        '--group-color': `var(--group-${editColor})`,
        '--group-foreground-color': `var(--group-${editColor}-foreground)`,
      }"
    />

    <v-text-field
      ref="titleField"
      class="group-title"
      :model-value="editTitle"
      @update:model-value="editTitle = $event"
      @change="editTitleLazy = $event.target.value"
      @blur="editFieldBlurred = true"
      :label="msg.groupTitlePlaceholder"
      validate-on="blur"
      :error-messages="editFieldBlurred ? titleErrorMessages : []"
    />

    <ColorMenu
      ref="colorMenu"
      v-model="editColor"
      @update:model-value="titleField?.validate()"
    />

    <v-btn
      class="toggle-advanced-button"
      variant="text"
      :append-icon="showAdvanced ? 'mdi-chevron-up' : 'mdi-chevron-down'"
      @click="showAdvanced = !showAdvanced"
    >
      {{ msg.headlineAdvanced }}
    </v-btn>

    <SlideVertical :duration="0.3">
      <Card v-if="showAdvanced" seamless>
        <CardSection ghost tight collapse seamless class="radio-container">
          <v-checkbox id="edit-dialog-strict" v-model="editStrict" />
          <ToggleLabel for="edit-dialog-strict">
            <LabelText>
              {{ msg.checkboxStrict }}
              <template #secondary>
                {{ msg.checkboxStrictDescription }}
              </template>
            </LabelText>
          </ToggleLabel>
        </CardSection>

        <CardSection ghost tight collapse seamless class="radio-container">
          <v-checkbox id="edit-dialog-merge" v-model="editMerge" />
          <ToggleLabel for="edit-dialog-merge">
            <LabelText>
              {{ msg.checkboxMerge }}
              <template #secondary>
                {{ msg.checkboxMergeDescription }}
              </template>
            </LabelText>
          </ToggleLabel>
        </CardSection>
      </Card>
    </SlideVertical>

    <template #actions>
      <v-btn class="button-save" dialogAction="ok" @click="save">
        {{ msg.buttonSave }}
      </v-btn>
      <v-btn variant="text" class="button-cancel" @click="cancel" color="grey">
        {{ msg.buttonCancel }}
      </v-btn>
      <v-btn
        v-if="deletable"
        variant="text"
        class="button-delete"
        @click="remove"
        color="group-red"
      >
        {{ msg.buttonDeleteGroup }}
      </v-btn>
    </template>
  </OverlayDialog>
</template>

<style scoped>
.group-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;

  font-size: 14px;
  font-weight: 400;
  cursor: default;

  &.grey {
    --group-color: var(--group-grey);
  }
  &.blue {
    --group-color: var(--group-blue);
  }
  &.red {
    --group-color: var(--group-red);
  }
  &.yellow {
    --group-color: var(--group-yellow);
  }
  &.green {
    --group-color: var(--group-green);
  }
  &.pink {
    --group-color: var(--group-pink);
  }
  &.purple {
    --group-color: var(--group-purple);
  }
  &.cyan {
    --group-color: var(--group-cyan);
  }

  .tag {
    position: relative;
    display: inline-block;
    border-radius: 5px;
    padding: 0.35em 0.6em;
    margin-left: 0.5em;
    color: var(--group-foreground);
    background-color: var(--group-color);
    z-index: 1;

    &:empty {
      display: none;
    }
  }

  .divider {
    position: absolute;
    top: 1.65em;
    margin: 0;
    padding: 0;
    border: none;
    width: 100%;
    height: 4px;
    border-radius: 1px;
    background-color: var(--group-color);
  }

  .edit {
    margin-left: auto;
    margin-right: 0.25em;
    z-index: 1;
    color: var(--foreground);
    background: var(--background);
  }
}

:global(.edit-dialog-overlay .dialog-container) {
  padding-top: 0;
}

.group-title {
  margin: 1.5rem 0;
}

.preview {
  width: 100vw;
  box-sizing: border-box;
  margin: 0 calc(-1 * var(--body-padding)) var(--body-padding);
  padding: 8px var(--body-padding) 0 !important;
}

.toggle-advanced-button {
  margin-top: var(--body-padding);
}

.button-delete {
  order: -2;
}

.button-cancel {
  margin-left: auto;
  order: -1;
}

.radio-container {
  display: flex;
  align-items: center;

  & > *:first-child {
    flex-shrink: 0;
  }
}
</style>
