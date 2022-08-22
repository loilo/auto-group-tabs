<template>
  <div class="ui-select" :class="$attrs.class">
    <mwc-select
      ref="selectRef"
      class="select"
      fullwidth
      v-bind="$attrs"
      :value="modelValue"
      @change="onChange"
      @focus="emit('focus', $event)"
      @blur="emit('blur', $event)"
      :validityTransform.prop="validityTransform"
    >
      <slot name="before" />
      <template v-for="option in options" :key="option.value">
        <mwc-list-item
          :data-value="option.value"
          :value="option.value"
          :selected="option.value === modelValue"
        >
          <slot
            v-bind="{
              value: option.value,
              label: option.label,
              selected: option.value === modelValue
            }"
          >
            {{ option.label }}
          </slot>
        </mwc-list-item>
      </template>
      <slot name="after" />
    </mwc-select>
    <div class="invalid-matcher" v-if="isInvalid" v-html="validationMessage" />
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
  options: Array<{ value: string; label: string }>
  validationMessage?: string
  validator?: (value: string) => boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', modelValue: string): void
  (e: 'change', event: Event): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
}>()

const isInvalid = ref(false)
const selectRef = ref<HTMLSelectElement>()

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
  delete (selectRef.value as any).validityTransform
})

function onChange(event: any) {
  isInvalid.value = !isValid()
  emit('update:modelValue', event.target.value)
  emit('change', event)
}

function isValid() {
  return selectRef.value?.checkValidity()
}

function blur() {
  selectRef.value!.blur()
}

function focus() {
  selectRef.value!.focus()
}

function validate() {
  isInvalid.value = !isValid()
  selectRef.value!.reportValidity()
}

defineExpose({
  blur,
  focus,
  isValid,
  validate
})

onMounted(() => {
  const sheet = new CSSStyleSheet()
  ;(sheet as any).replaceSync(`
  .mdc-select--filled:not(.mdc-select--activated) .mdc-select__anchor {
    border-radius: var(--mdc-shape-small, 4px);
  }
  `)
  const selectElement: any = selectRef.value
  selectElement.shadowRoot.adoptedStyleSheets.push(sheet)

  nextTick(() => {
    isInvalid.value = !isValid()
    selectRef.value!.reportValidity()
  })
})
</script>

<style lang="scss" scoped>
.ui-select {
  width: 100%;
}

mwc-select {
  width: 100%;
}
</style>
