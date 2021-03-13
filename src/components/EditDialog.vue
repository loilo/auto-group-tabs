<template>
  <div class="edit-dialog" @keydown.esc="cancel" @keydown.enter="save">
    <focus-trap>
      <TabBar
        tab-title="Vorschau"
        :group-title="editTitle"
        class="preview"
        :style="{ '--group-color': `var(--group-${editColor})` }"
      />

      <Textfield
        ref="titleField"
        class="group-title"
        v-model="editTitle"
        :placeholder="msg.groupTitlePlaceholder"
      />

      <ColorMenu ref="colorMenu" v-model="editColor" />

      <div class="actions-bar">
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
      </div>
    </focus-trap>
  </div>
</template>

<script>
import ColorMenu from './ColorMenu.vue'

export default {
  components: { ColorMenu },
  props: {
    title: String,
    color: String,
    deletable: Boolean
  },
  data() {
    return {
      editTitle: this.title,
      editColor: this.color
    }
  },
  emits: ['save', 'cancel', 'delete', 'close'],
  mounted() {
    this.$refs.colorMenu.refresh()
    this.editTitle = this.title
    this.editColor = this.color

    requestAnimationFrame(() => {
      this.$refs.titleField.focus()
      this.$refs.titleField.select()
    })
  },
  methods: {
    close() {
      this.$refs.dialog.close()
    },
    save() {
      this.$emit('save', this.editTitle, this.editColor)
      this.$emit('close')
    },
    cancel() {
      this.$emit('cancel')
      this.$emit('close')
    },
    remove() {
      this.$emit('delete')
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
.edit-dialog {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 0 var(--body-padding);
  z-index: 5;

  box-shadow: 0 -2px 2px rgb(0 0 0 / 25%);
  background-color: var(--background);
}

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
  max-width: 100%;
  margin: 0 calc(-1 * var(--body-padding)) var(--body-padding);
  padding: 8px var(--body-padding) 0 !important;
}

.actions-bar {
  position: absolute;
  bottom: var(--body-padding);
  left: var(--body-padding);
  right: var(--body-padding);
  z-index: 5;
  display: flex;
  gap: 12px;
}

.button-delete {
  order: -2;
}

.button-cancel {
  margin-left: auto;
  order: -1;
}
</style>
