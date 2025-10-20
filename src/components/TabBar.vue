<template>
  <div class="tab-bar">
    <div class="group">
      <div
        ref="groupLabelRef"
        class="group-label"
        :class="{ overflowing, empty: !groupTitle }"
        v-text="groupTitle"
      />
      <div class="group-underline"></div>
    </div>
    <div class="tab">
      <svg
        class="tab-image"
        width="19"
        height="34"
        viewBox="0 0 19 34"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g :clip-path="`url(#${id}-open)`">
          <path
            d="M20 1v34H0v-2a9 9 0 0 0 9-9V11A10 10 0 0 1 19 1h1Z"
            style="fill: var(--tab-background)"
            stroke="currentColor"
            stroke-width="2"
          />
        </g>
        <defs>
          <clipPath :id="`${id}-open`">
            <rect width="19" height="34" style="fill: var(--tab-background)" />
          </clipPath>
        </defs>
      </svg>

      <div class="tab-title-wrapper">
        <span class="tab-title">{{ tabTitle }}</span>
      </div>

      <svg
        class="tab-image tab-image-close"
        width="19"
        height="34"
        viewBox="0 0 19 34"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g :clip-path="`url(#${id}-open)`">
          <path
            d="M20 1v34H0v-2a9 9 0 0 0 9-9V11A10 10 0 0 1 19 1h1Z"
            style="fill: var(--tab-background)"
            stroke="currentColor"
            stroke-width="2"
          />
        </g>
        <defs>
          <clipPath :id="`${id}-open`">
            <rect width="19" height="34" style="fill: var(--tab-background)" />
          </clipPath>
        </defs>
      </svg>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, onMounted, ref, watch, useId } from 'vue'

const props = defineProps<{
  groupTitle: string
  tabTitle: string
}>()

const groupLabelRef = ref<HTMLDivElement>()
const overflowing = ref(false)
function updateOverflowing() {
  overflowing.value =
    groupLabelRef.value!.scrollWidth > groupLabelRef.value!.clientWidth
}

const id = useId()

onMounted(() => {
  updateOverflowing()
})
watch(
  () => props.groupTitle,
  () => {
    // oxlint-disable-next-line @typescript-eslint/no-floating-promises
    nextTick(() => {
      updateOverflowing()
    })
  },
)
</script>

<style scoped>
.tab-bar {
  --tab-bar-background: #e3e3e3;
  --tab-bar-border: #caced6;
  --tab-background: #ffffff;
  --tab-foreground: #1f1f1f;
  --group-foreground: #ffffff;

  @media (prefers-color-scheme: dark) {
    --tab-bar-background: #3c4043;
    --tab-bar-border: #353535;
    --tab-background: rgb(var(--v-theme-dark-grey));
    --tab-foreground: #f1f3f4;
    --group-foreground: #202124;
  }

  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica,
    Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
  background-color: var(--tab-bar-background);
  border-top: 1px solid var(--tab-bar-border);

  display: flex;
  justify-content: flex-start;
  padding: 8px 0 0;

  .group {
    display: grid;
    grid-template-rows: auto 20px 8px 2px;
    grid-template-areas: '.' 'label' '.' 'underline';
    height: 34px;
    overflow: hidden;
    max-width: 131px;

    .group-label {
      grid-area: label;
      display: flex;
      align-items: center;
      position: relative;
      margin-right: 5px;
      border-radius: 6px;
      padding: 0 6px;
      font-size: 12px;
      font-weight: 500;
      letter-spacing: -0.1px;
      line-height: 1;
      background-color: var(--group-color);
      color: var(--group-foreground-color, var(--group-foreground));
      white-space: pre;
      overflow: hidden;
      cursor: default;

      &.overflowing::after {
        content: '';
        position: absolute;
        right: 0;
        top: 0;
        height: 100%;
        width: 24px;
        background: linear-gradient(
          to left,
          var(--group-color),
          var(--group-color) 4px,
          transparent
        );
      }

      &.empty {
        padding: 0;
        width: 20px;
        height: 20px;
      }
    }

    .group-underline {
      grid-area: underline;
      height: 4px;
      background-color: var(--group-color);
      border-top-left-radius: 2px;
    }
  }

  .tab {
    width: 176px;
    height: 34px;
    margin-left: -3px;
    overflow: hidden;
    display: flex;
    align-items: stretch;

    .tab-title-wrapper {
      background: var(--tab-background);
    }

    .tab-title {
      display: flex;
      align-items: center;
      min-width: 120px;
      height: 24px;
      padding: 0 10px 0 0;

      font-size: 12px;
      font-weight: 500;
      letter-spacing: 0;
      line-height: 1;

      color: var(--tab-foreground);
      border-top: 2px solid var(--group-color);

      cursor: default;
    }

    .tab-image {
      color: var(--group-color);

      &.tab-image-close {
        transform: scaleX(-1);
      }
    }
  }
}
</style>
