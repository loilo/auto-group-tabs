<template>
  <div class="ui-textarea" :class="$attrs.class">
    <mwc-textarea
      ref="textareaRef"
      class="textarea"
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
import { computed, onBeforeUnmount, ref } from 'vue'

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
const textareaRef = ref()

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
  delete textareaRef.value.validityTransform
})

function onChange(event: Event) {
  isInvalid.value = !isValid()
  emit('change', event)
}

function isValid() {
  return textareaRef.value?.checkValidity()
}

function blur() {
  textareaRef.value.blur()
}

function focus() {
  textareaRef.value.focus()
}

function select() {
  textareaRef.value.select()
}

function validate() {
  isInvalid.value = !isValid()
  textareaRef.value.reportValidity()
}

defineExpose({
  blur,
  focus,
  select,
  isValid,
  validate
})
</script>

<style lang="scss" scoped>
.ui-textarea {
  width: 100%;
}

mwc-textarea {
  width: 100%;
}
</style>
