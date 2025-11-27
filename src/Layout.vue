<template>
  <v-layout>
    <slot />
  </v-layout>
</template>

<style>
:root {
  --body-padding: 16px;

  --black: #202124;
  --white: #ffffff;

  --grey: #5f6367;
  --light-grey: #f8f9fa;
  --dark-grey: #292a2d;

  --blue-grey: #9aa0a6;

  --dimmed-background: var(--light-grey);
  --background: var(--white);
  --foreground: var(--black);
  --dimmed-foreground: var(--grey);
  --dimmed-primary: #a6c7f3;
  --super-dimmed-primary: #dfe7f1;

  --dimmed: var(--grey);
  --super-dimmed: hsla(210, 4%, 39%, 0.133);

  --group-foreground: var(--white);
  --group-grey: #5f6369;
  --group-blue: #1974e8;
  --group-red: #da3025;
  --group-yellow: #f9ab04;
  --group-yellow-foreground: var(--black);
  --group-green: #198139;
  --group-pink: #d01984;
  --group-purple: #a143f5;
  --group-cyan: #027b84;
  --group-orange: #fa913e;
  --group-orange-foreground: var(--black);

  --separator: rgb(0 0 0 / 6%);

  @media (prefers-color-scheme: dark) {
    --background: var(--dark-grey);
    --dimmed-background: var(--black);
    --foreground: #e8eaed;
    --dimmed-foreground: var(--blue-grey);
    --dimmed-primary: #7c99be;
    --super-dimmed-primary: #38557a;

    --dimmed: #9fa4a9;
    --super-dimmed: #9fa4a933;

    --group-foreground: var(--black);
    --group-grey: #dadce0;
    --group-blue: #8ab3f8;
    --group-red: #f18b82;
    --group-yellow: #fdd664;
    --group-green: #81ca95;
    --group-pink: #ff8bcc;
    --group-purple: #c58afa;
    --group-cyan: #78d9ed;
    --group-orange: #fcad70;

    --separator: rgb(255 255 255 / 10%);
  }
}

:not(custom-element):where([hidden]) {
  display: none;
}

body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  box-sizing: border-box;
  height: var(--body-height, auto);
  min-height: max(350px, 100%);
  margin: 0;
  padding: 0;

  background-color: var(--background);
  color: var(--foreground);
  font-family: Roboto, system-ui, sans-serif;
  font-size: 14px;

  @supports (overflow-y: overlay) {
    overflow-y: overlay;

    &::-webkit-scrollbar {
      width: 16px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: var(--blue-grey);
      border-radius: 10px;
      border: 6px solid transparent;
      box-sizing: content-box;
      background-clip: padding-box;
      transition: border-width 400ms;
    }

    &::-webkit-scrollbar-thumb:hover {
      border-width: 5px;
    }

    &::-webkit-scrollbar-track-piece {
      background: 0 0;
    }
  }
}

.h6 {
  font-size: 20px;
  font-weight: 500;
  letter-spacing: 0.15px;
  margin: 0;
}

.subtitle-2 {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.1px;
}

.headline-margin {
  margin: 2em 0 0;
}

hr {
  padding: 0;
  margin: 2rem 0 1.5rem;
  height: 0;
  border: none;
  border-bottom: 1px solid var(--super-dimmed);
}

.error-message {
  color: rgb(var(--v-theme-error));
  font-weight: 500;
  font-size: 14px;
}

.warning-message {
  color: rgb(var(--v-theme-warning));
  font-weight: 500;
  font-size: 14px;
  display: flex;
  gap: 0.75em;
}

.success-message {
  color: rgb(var(--v-theme-success));
  font-weight: 500;
  font-size: 14px;
}

[fullwidth] {
  width: 100%;
}

.from-right-leave-active,
.from-right-enter-active {
  transition: transform 450ms, opacity 300ms;
}

.from-right-leave-to,
.from-right-enter-from {
  opacity: 0;
  transform: translateX(30%);
}

.from-right-leave-from,
.from-right-enter-to {
  opacity: 1;
  transform: translateX(0%);
}
</style>
