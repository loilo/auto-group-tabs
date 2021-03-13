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
        height="34"
        viewBox="0 0 19 34"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M20.5 1.5v34h-19v-3H3c2.167 0 3.742-.62 4.81-1.69C8.88 29.743 9.5 28.168 9.5 26h0V8c0-2.167.463-3.842 1.56-4.94C12.159 1.964 13.834 1.5 16 1.5h4.5z"
          stroke="currentColor"
          stroke-width="3"
          style="fill: var(--tab-background)"
          fill-rule="evenodd"
        />
      </svg>
      <span class="tab-title">{{ tabTitle }}</span>
      <svg
        class="tab-image"
        width="19"
        height="34"
        viewBox="3 0 19 34"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1.329 1.5l4.783.003c2.066.042 3.664.526 4.71 1.614C11.882 4.215 12.33 5.87 12.33 8h0v18c0 2.167.62 3.742 1.689 4.81 1.069 1.07 2.644 1.69 4.81 1.69h1.5v3h-19v-34z"
          stroke="currentColor"
          stroke-width="3"
          style="fill: var(--tab-background)"
          fill-rule="evenodd"
        />
      </svg>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    groupTitle: String,
    tabTitle: String
  }
}
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
    grid-template-rows: 1fr 22px 3px;
    gap: 3px;
    height: 34px;
    overflow: hidden;
    max-width: 131px;

    .group-label {
      grid-row: 2 / span 1;
      border-radius: 5px;
      padding: 6px 7px;
      font-size: 12px;
      font-weight: 500;
      letter-spacing: 0;
      line-height: 1;
      background-color: var(--group-color);
      color: var(--group-foreground);
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
      }
    }

    .group-underline {
      grid-row: 3 / span 1;
      height: 6px;
      background-color: var(--group-color);
      border-top-left-radius: 3px;
    }
  }

  .tab {
    width: 176px;
    height: 34px;
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
      border-top: 3px solid var(--group-color);

      cursor: default;
    }

    .tab-image {
      color: var(--group-color);
    }
  }
}
</style>
