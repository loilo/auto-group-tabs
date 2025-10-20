import { computed, ref, watchEffect } from 'vue'
import { defineStore } from 'pinia'

export const useDialog = defineStore('dialog', () => {
  const openDialogs = ref(new Set<string>())
  const counter = ref(0)
  const hasOpenDialogs = computed(() => openDialogs.value.size > 0)

  watchEffect(() => {
    document.body.classList.toggle('no-scroll', hasOpenDialogs.value)
  })

  return { counter, openDialogs }
})
