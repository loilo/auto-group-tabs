<template>
  <div class="tab-bar">
    <div class="group">
      <div
        class="group-label"
        :class="{ empty: !groupTitle }"
        v-text="groupTitle"
      />
      <div class="group-underline"></div>
    </div>
    <div class="tab">
      <svg
        class="tab-image"
        width="19"
        height="33"
        viewBox="0 0 19 33"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M20 1v40h-48v-9H1a6.977 6.977 0 0 0 4.871-1.973 6.978 6.978 0 0 0 2.125-4.794L8 7c0-1.657.672-3.157 1.757-4.243A5.981 5.981 0 0 1 14 1h6Z"
          style="fill: var(--tab-background)"
          stroke="currentColor"
          stroke-width="2"
          fill-rule="evenodd"
        />
      </svg>
      <span class="tab-title">{{ tabTitle }}</span>
      <svg
        class="tab-image"
        width="19"
        height="33"
        viewBox="0 0 19 33"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5 1c1.657 0 3.157.672 4.243 1.757A5.981 5.981 0 0 1 11 7v17.985c.063 1.988.856 3.739 2.112 4.995A6.875 6.875 0 0 0 18 32h29v9H-1V1Z"
          style="fill: var(--tab-background)"
          stroke="currentColor"
          stroke-width="2"
          fill-rule="evenodd"
        />
      </svg>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  groupTitle: string
  tabTitle: string
}>()
</script>

<style lang="scss" scoped>
.tab-bar {
  --tab-bar-background: #dfe1e5;
  --tab-bar-border: #caced6;
  --tab-background: #ffffff;
  --tab-foreground: #4e5055;
  --group-foreground: #ffffff;

  @media (prefers-color-scheme: dark) {
    --tab-bar-background: #000000;
    --tab-bar-border: #353535;
    --tab-background: var(--mdc-theme-surface, #353535);
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
    grid-template-rows: auto 22px 2px;
    gap: 4px;
    height: 33px;
    overflow: hidden;
    max-width: 131px;

    .group-label {
      grid-row: 2 / span 1;
      border-radius: 5px;
      padding: 5px 7px;
      font-size: 12px;
      font-weight: 500;
      letter-spacing: 0;
      line-height: 1;
      background-color: var(--group-color);
      color: var(--group-foreground-color, var(--group-foreground));
      white-space: pre;
      overflow: hidden;
      text-overflow: ellipsis;
      cursor: default;

      &.empty {
        padding: 0;
        width: 14px;
        height: 14px;
        border-radius: 7px;
        margin-top: 4px;
        margin-right: 4px;
      }
    }

    .group-underline {
      grid-row: 3 / span 1;
      height: 4px;
      background-color: var(--group-color);
      border-top-left-radius: 2px;
    }
  }

  .tab {
    width: 176px;
    height: 33px;
    margin-left: -3px;
    overflow: hidden;
    display: flex;
    align-items: stretch;

    .tab-title {
      display: flex;
      align-items: center;
      min-width: 120px;
      padding: 0 10px 0 4px;

      font-size: 12px;
      font-weight: 500;
      letter-spacing: 0;
      line-height: 1;

      background: var(--tab-background);
      color: var(--tab-foreground);
      border-top: 2px solid var(--group-color);

      cursor: default;
    }

    .tab-image {
      color: var(--group-color);
    }
  }
}
</style>
