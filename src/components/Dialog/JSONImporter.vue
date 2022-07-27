<template>
  <OverlayDialog @keydown.esc="cancel" @keydown.enter="save">
    <Textfield ref="jsonField" class="group-title" v-model="editJSON" :placeholder="msg.jsonPlaceholder" />
    <div>
      {{ currentJson }}
    </div>
    <template v-slot:actionsBar>
      <mwc-button class="button-save" dialogAction="ok" unelevated @click="save" v-text="msg.buttonSave" />
      <mwc-button class="button-cancel" style="--mdc-theme-primary: var(--dimmed)" @click="cancel"
        v-text="msg.buttonCancel" />
    </template>
  </OverlayDialog>
</template>

<script setup lang="ts">
import ColorMenu from '@/components/Form/ColorMenu.vue'
import Textfield from '@/components/Form/Textfield.vue'
import TabBar from '@/components/TabBar.vue'
import OverlayDialog from './OverlayDialog.vue'
import { computed, inject, onMounted, onBeforeMount, ref, defineAsyncComponent } from 'vue'
import { useGroupConfigurations } from '@/composables'
import { readStorage } from '../../util/storage'
import * as conflictManager from '@/util/conflict-manager'
import { Translation } from '@/util/types'
import { html } from 'lit-html'

const props = withDefaults(
  defineProps<{
    id?: string
    title?: string
    color: chrome.tabGroups.ColorEnum
    deletable?: boolean
    json?: string
  }>(),
  {
    title: '',
    deletable: false,
  }
)
const editJSON = ref(conflictManager.withoutMarker(props.title))
const groups = useGroupConfigurations()
const msg = inject<Translation>('msg')!
const jsonField = ref()

const currentJson = JSON.stringify(groups.data.value, null, "\t")

const emit = defineEmits<{
  (e: 'save', editJSON: string): void
  (e: 'delete'): void
  (e: 'cancel'): void
  (e: 'close'): void
}>()

onMounted(() => {
  // Need to wait for the <mwc-*> custom elements to render
  requestAnimationFrame(() => {
    jsonField.value.focus()
    jsonField.value.select()
  })

})

function save(event: KeyboardEvent) {
  if (!groups.loaded.value) {
    alert(
      'JSON could not be loaded. This should never happen. Please report this bug to the extension author.'
    )
    return
  }
  // TODO: VALIDATE JSON
  event.preventDefault()
  emit('save', editJSON.value)
  console.log("This is not working")
  emit('close')
}

function cancel() {
  emit('cancel')
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

.button-delete {
  order: -2;
}

.button-cancel {
  margin-left: auto;
  order: -1;
}
</style>
