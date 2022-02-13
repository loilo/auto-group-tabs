<template>
  <div class="ui-textfield" :class="$attrs.class">
    <mwc-textfield
      ref="textfield"
      class="textfield"
      fullwidth
      v-bind="$attrs"
      :value="modelValue"
      @input="
        emit('update:modelValue', $event.target.value), emit('input', $event)
      "
      @change="onChange"
      @focus="emit('focus', $event)"
      @blur="emit('blur', $event)"
      :validityTransform.prop="validityTransform"
    />
    <div class="invalid-matcher" v-if="isInvalid" v-html="validationMessage" />
  </div>
</template>

<script lang="ts">
export default {
  inheritAttrs: false
}
</script>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps<{
  modelValue: string
  validationMessage?: string
  validator?: (value: string) => boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', modelValue: string): void
  (e: 'input', event: InputEvent): void
  (e: 'change', event: Event): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
}>()

const isInvalid = ref(false)
const textfield = ref()

const validityTransform = computed(() =>
  props.validator
    ? (value: string, nativeValidity: ValidityState) => {
        const customValidationResult = props.validator!(value)
        if (!customValidationResult) {
          return {
            valid: false,
            customError: true
          }
        }

        return {}
      }
    : undefined
)

onBeforeUnmount(() => {
  delete textfield.value.validityTransform
})

function onChange(event: Event) {
  isInvalid.value = !isValid()
  emit('change', event)
}

function isValid() {
  return textfield.value?.checkValidity()
}

function blur() {
  textfield.value.blur()
}

function focus() {
  textfield.value.focus()
}

function select() {
  textfield.value.select()
}

function validate() {
  isInvalid.value = !isValid()
  textfield.value.reportValidity()
}

defineExpose({
  blur,
  focus,
  select,
  isValid,
  validate
})

onMounted(() => {
  nextTick(() => {
    isInvalid.value = !isValid()
    textfield.value.reportValidity()
  })
})
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
