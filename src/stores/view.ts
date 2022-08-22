import { ComponentInternalInstance, computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useEventBus } from '@vueuse/core'

function getEditStore() {
  const editViews = ref(new Set<ComponentInternalInstance>())

  function register(component: ComponentInternalInstance) {
    editViews.value.add(component)
  }

  function deregister(component: ComponentInternalInstance) {
    editViews.value.delete(component)
  }

  function isRegistered(component: ComponentInternalInstance) {
    return editViews.value.has(component)
  }

  const hasAny = computed(() => editViews.value.size > 0)

  const closeBus = useEventBus<void>('close')
  function sendCloseSignal() {
    closeBus.emit()
  }
  function onCloseSignal(callback: () => void) {
    closeBus.on(callback)
  }

  return {
    register,
    deregister,
    isRegistered,
    hasAny,
    sendCloseSignal,
    onCloseSignal
  }
}

export const useViewStore = defineStore('view', () => {
  return { edit: getEditStore() }
})
