<template>
  <transition
    @before-enter="beforeEnter"
    @enter="enter"
    @after-enter="resetEnter"
    @enter-cancelled="cancel"
    @leave="leave"
    @after-leave="resetLeave"
    @leave-cancelled="cancel"
    appear
  >
    <slot />
  </transition>
</template>

<script setup lang="ts">
import gsap from 'gsap'

const MINIMUM_DURATION_FRACTION = 0.9

const props = withDefaults(
  defineProps<{
    disabled?: boolean
    duration?: number
  }>(),
  { duration: 0.6 },
)

const emit = defineEmits<{
  (e: 'after-enter'): void
}>()

function cancel(el: Element) {
  gsap.killTweensOf(el)
  gsap.set(el, {
    height: '',
  })
}

function beforeEnter(el: Element) {
  if (props.disabled) return

  gsap.set(el, {
    opacity: 0,
  })
}

function enter(el: Element, done: () => void) {
  if (props.disabled) {
    done()
    return
  }

  // Clamp the animated content to avoid animation outside the viewport
  let rect = el.getBoundingClientRect()
  let availableHeight = window.innerHeight - rect.top

  // Element is outside viewport, don't animate
  if (availableHeight < 0 || rect.bottom < 0) {
    done()
    return
  }

  let effectiveHeight = Math.min(availableHeight, rect.height)
  let effectiveHeightFraction = effectiveHeight / window.innerHeight

  let duration = Math.max(
    MINIMUM_DURATION_FRACTION * props.duration,
    effectiveHeightFraction * props.duration,
  )
  let effectiveDuration = duration
  if (effectiveHeight < rect.height) {
    let hiddenHeight = rect.height - effectiveHeight
    let hiddenHeightFraction = hiddenHeight / effectiveHeight
    effectiveDuration *= 1 + hiddenHeightFraction
  }

  gsap.set(el, {
    overflow: 'hidden',
  })

  if (effectiveDuration > duration) {
    gsap.set(el, {
      opacity: '',
      height: `${effectiveHeight}px`,
    })

    gsap.from(el, {
      duration: duration,
      opacity: 0,
      height: 0,
      marginTop: 0,
      marginBottom: 0,
      paddingTop: 0,
      paddingBottom: 0,
      onComplete() {
        done()
      },
    })
  } else {
    gsap.set(el, {
      opacity: '',
    })

    gsap.from(el, {
      duration,
      opacity: 0,
      height: 0,
      marginTop: 0,
      marginBottom: 0,
      paddingTop: 0,
      paddingBottom: 0,
      onComplete() {
        done()
      },
    })
  }
}

function leave(el: Element, done: () => void) {
  if (props.disabled) {
    done()
    return
  }

  // Clamp the animated content to avoid animation outside the viewport
  let rect = el.getBoundingClientRect()
  let availableHeight = window.innerHeight - rect.top
  let effectiveHeight = Math.min(availableHeight, rect.height)
  let effectiveHeightFraction = effectiveHeight / window.innerHeight

  let duration = Math.max(
    MINIMUM_DURATION_FRACTION * props.duration,
    effectiveHeightFraction * props.duration,
  )

  gsap.set(el, {
    overflow: 'hidden',
  })

  if (effectiveHeight < rect.height) {
    gsap.set(el, {
      height: `${effectiveHeight}px`,
    })
  }

  gsap.to(el, {
    duration,
    height: 0,
    opacity: 0,
    marginTop: 0,
    marginBottom: 0,
    paddingTop: 0,
    paddingBottom: 0,
    onComplete() {
      done()
    },
  })
}

function reset(el: Element) {
  if (props.disabled) return

  gsap.set(el, {
    height: '',
    opacity: '',
    marginTop: '',
    marginBottom: '',
    paddingTop: '',
    paddingBottom: '',
    overflow: '',
  })
}

function resetEnter(el: Element) {
  reset(el)
  emit('after-enter')
}

function resetLeave(el: Element) {
  reset(el)
}
</script>
