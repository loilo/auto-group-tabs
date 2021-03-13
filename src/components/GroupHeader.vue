<template>
  <div class="group-header" :class="[color]">
    <span class="tag">{{ title }}</span>
    <div class="edit" v-if="editable">
      <mwc-icon-button icon="create" @click="edit" />
    </div>
    <hr class="divider" />
  </div>

  <transition name="from-right">
    <EditDialog
      v-if="showEditDialog"
      :title="title"
      :color="color"
      @save="save"
      @delete="remove"
      @close="showEditDialog = false"
      deletable
    />
  </transition>
</template>

<script setup>
import { defineEmit, defineProps, ref } from 'vue'
import ColorMenu from './ColorMenu.vue'

let props = defineProps({
  title: String,
  color: String,
  editable: Boolean
})

const emit = defineEmit(['update:title', 'update:color', 'delete'])

const showEditDialog = ref(false)

function edit() {
  showEditDialog.value = true
}

function save(title, color) {
  emit('update:title', title)
  emit('update:color', color)
}

function remove() {
  emit('delete')
}

const colorMenu = ref()
const changeColor = value => {
  emit('update:color', value)
  // emit('update:title', editTitle.value)
  // emit('update:color', editColor.value)
  // editMode.value = false
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
  margin: 0.5rem 0 1rem;
}

.preview {
  width: 100vw;
  max-width: 100%;
  margin: -20px -24px 20px;
  padding: 8px 24px 0 !important;
  border-radius: var(--mdc-shape-medium, 4px) var(--mdc-shape-medium, 4px) 0 0;
}

.delete-button {
  position: absolute;
  bottom: 8px;
  left: 8px;
  z-index: 1;
}
</style>
