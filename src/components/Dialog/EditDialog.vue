<template>
  <OverlayDialog @keydown.esc="cancel" @keydown.enter="save">
    <TabBar
      :tab-title="msg.previewTitle"
      :group-title="editTitle"
      class="preview"
      :style="{
        '--group-color': `var(--group-${editColor})`,
        '--group-foreground-color': `var(--group-${editColor}-foreground)`
      }"
    />

    <Textfield
      ref="titleField"
      class="group-title"
      v-model="editTitle"
      :placeholder="msg.groupTitlePlaceholder"
      :validator="checkForDuplicates"
      :validation-message="msg.duplicateGroupError"
    />

    <ColorMenu
      ref="colorMenu"
      v-model="editColor"
      @update:model-value="titleField.validate()"
    />

    <mwc-button
      class="toggle-advanced-button"
      :icon="showAdvanced ? 'expand_less' : 'expand_more'"
      trailingicon
      @click="showAdvanced = !showAdvanced"
    >
      {{ msg.headlineAdvanced }}
    </mwc-button>

    <SlideVertical :duration="0.3">
      <Card v-if="showAdvanced" seamless>
        <CardSection ghost tight collapse seamless class="radio-container">
          <mwc-checkbox
            id="edit-dialog-strict"
            :checked="editStrict"
            @change="editStrict = $event.target.checked"
          />
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
          <mwc-checkbox
            id="edit-dialog-merge"
            :checked="editMerge"
            @change="editMerge = $event.target.checked"
          />
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

    <template v-slot:actionsBar>
      <mwc-button
        class="button-save"
        dialogAction="ok"
        unelevated
        @click="save"
        v-text="msg.buttonSave"
      />
      <mwc-button
        class="button-cancel"
        style="--mdc-theme-primary: var(--dimmed)"
        @click="cancel"
        v-text="msg.buttonCancel"
      />
      <mwc-button
        v-if="deletable"
        class="button-delete"
        @click="remove"
        v-text="msg.buttonDeleteGroup"
        style="--mdc-theme-primary: var(--group-red)"
      />
    </template>
  </OverlayDialog>
</template>

<script setup lang="ts">
import Card from '@/components/Card/Card.vue'
import CardSection from '@/components/Card/CardSection.vue'
import ColorMenu from '@/components/Form/ColorMenu.vue'
import Textfield from '@/components/Form/Textfield.vue'
import ToggleLabel from '@/components/Form/ToggleLabel.vue'
import SlideVertical from '@/components/Util/SlideVertical.vue'
import TabBar from '@/components/TabBar.vue'
import LabelText from '@/components/LabelText.vue'
import OverlayDialog from './OverlayDialog.vue'

import { getCurrentInstance, onMounted, onUnmounted, ref } from 'vue'
import { useGroupConfigurations } from '@/composables'
import * as conflictManager from '@/util/conflict-manager'
import { SaveOptions } from '@/util/types'
import { useViewStore } from '@/stores'
import { useStyleTag } from '@vueuse/core'

const props = withDefaults(
  defineProps<{
    id?: string
    title?: string
    color: chrome.tabGroups.ColorEnum
    options?: SaveOptions
    deletable?: boolean
  }>(),
  {
    title: '',
    deletable: false,
    options: () => ({
      strict: false,
      merge: false
    })
  }
)

const emit = defineEmits<{
  (
    e: 'save',
    title: string,
    color: chrome.tabGroups.ColorEnum,
    options: SaveOptions
  ): void
  (e: 'delete'): void
  (e: 'cancel'): void
  (e: 'close'): void
}>()

const groups = useGroupConfigurations()

const showAdvanced = ref(false)

const editTitle = ref(conflictManager.withoutMarker(props.title))
const editColor = ref(props.color)
const editStrict = ref(props.options.strict)
const editMerge = ref(props.options.merge)

const colorMenu = ref()
const titleField = ref()

const viewStore = useViewStore()

viewStore.edit.onCloseSignal(cancel)

const { load } = useStyleTag(`html {
  min-height: 515px;
}`)

onMounted(() => {
  load()

  viewStore.edit.register(getCurrentInstance()!)
  colorMenu.value.refresh()

  // Need to wait for the <mwc-*> custom elements to render
  requestAnimationFrame(() => {
    titleField.value.focus()
    titleField.value.select()
  })
})

onUnmounted(() => {
  viewStore.edit.deregister(getCurrentInstance()!)
})

function checkForDuplicates() {
  const conflictingGroup = groups.data.value.find(
    group => group.color === editColor.value && group.title === editTitle.value
  )

  if (!conflictingGroup) return true
  if (props.id) return props.id === conflictingGroup.id

  return false
}

function save(event: KeyboardEvent) {
  if (!groups.loaded.value) {
    alert(
      'Groups could not be loaded. This should never happen. Please report this bug to the extension author.'
    )
    return
  }

  if (!titleField.value.isValid()) return

  event.preventDefault()
  emit('save', editTitle.value, editColor.value, {
    strict: editStrict.value,
    merge: editMerge.value
  })
  emit('close')
}

function cancel() {
  emit('cancel')
  emit('close')
}

function remove() {
  emit('delete')
  emit('close')
}
</script>

<style lang="scss" scoped>
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

  .eyedropper {
    color: var(--foreground);
    background: var(--background);
    z-index: 1;
    padding-left: 0.25em;
    margin-right: -1px;
  }

  .color-button {
    --mdc-theme-primary: var(--group-color);
  }
}

mwc-dialog {
  @media (prefers-color-scheme: dark) {
    --mdc-dialog-box-shadow: 0px 11px 15px -7px rgba(0, 0, 0, 1),
      0px 24px 38px 3px rgba(0, 0, 0, 1), 0px 9px 46px 8px rgba(0, 0, 0, 1);
  }
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
}
</style>
