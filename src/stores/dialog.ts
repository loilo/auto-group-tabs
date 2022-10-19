import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useDialog = defineStore('dialog', () => {
  const counter = ref(0)

  return { counter }
})
