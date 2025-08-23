<template>
  <div class="ui-textfield" :class="$attrs.class">
    <mwc-textfield
      ref="textfieldRef"
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
    <div
      class="invalid-matcher"
      v-if="isInvalid"
      v-html="validityMessageString"
    />
  </div>
</template>

<script lang="ts">
export default {
  inheritAttrs: false
}
</script>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps<{
  modelValue: string
  validationMessage?: string | ((validity: ValidityState) => string)
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
const validity = ref<ValidityState | undefined>()
const textfieldRef = ref()

const validityMessageString = computed(() =>
  props.validationMessage
    ? typeof props.validationMessage === 'string'
      ? props.validationMessage
      : props.validationMessage(validity.value!)
    : ''
)

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
  delete textfieldRef.value.validityTransform
})

function updateValidity() {
  isInvalid.value = !isValid()
  validity.value = textfieldRef.value.validity
}

function onChange(event: Event) {
  updateValidity()
  emit('change', event)
}

function isValid() {
  return textfieldRef.value?.checkValidity()
  textfieldRef.value!.validity
}

function blur() {
  textfieldRef.value.blur()
}

function focus() {
  textfieldRef.value.focus()
}

function select() {
  textfieldRef.value.select()
}

function validate() {
  updateValidity()
  textfieldRef.value.reportValidity()
}

defineExpose({
  blur,
  focus,
  select,
  isValid,
  validate
})

onMounted(() => {
  const sheet = new CSSStyleSheet()
  ;(sheet as any).replaceSync(`
  .mdc-text-field {
    border-radius: var(--mdc-shape-small, 4px);
  }

  .mdc-text-field--filled {
    height: 40px;
  }
  `)
  textfieldRef.value.shadowRoot.adoptedStyleSheets.push(sheet)

  nextTick(() => {
    updateValidity()
    textfieldRef.value.reportValidity()
  })
})
</script>

<style lang="scss" scoped>
.ui-textfield {
  width: 100%;
}

mwc-textfield {
  width: 100%;
}
</style>
