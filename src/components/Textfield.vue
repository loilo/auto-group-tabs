<template>
  <div class="ui-textfield" :class="$attrs.class">
    <mwc-textfield
      ref="textfield"
      class="textfield"
      fullwidth
      v-bind="$attrs"
      :value="modelValue"
      @input="
        $emit('update:modelValue', $event.target.value), bubble.input($event)
      "
      @change="onChange"
      @focus="bubble.focus"
      @blur="bubble.blur"
    />
    <div class="invalid-matcher" v-if="isInvalid" v-html="errorMessage" />
  </div>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    modelValue: String,
    errorMessage: String
  },
  data: () => ({
    isInvalid: false
  }),
  emits: ['update:modelValue', 'input', 'change', 'focus', 'blur'],
  mounted() {
    this.$nextTick(() => {
      this.isInvalid = !this.isValid()
      this.$refs.textfield.reportValidity()
    })
  },
  methods: {
    onChange(...args) {
      this.isInvalid = !this.isValid()
      this.bubble.change(...args)
    },
    isValid() {
      return this.$refs.textfield.checkValidity()
    },
    focus() {
      this.$refs.textfield.focus()
    },
    select() {
      this.$refs.textfield.select()
    }
  }
}
</script>

<style lang="scss" scoped>
.ui-textfield {
  width: 100%;
}

mwc-textfield {
  width: 100%;
  height: 40px;
  border-radius: var(--mdc-shape-small, 4px);
  overflow: hidden;
}
</style>
