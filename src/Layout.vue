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

  --grey: #5f6369;
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
  --group-blue: #436bd7;
  --group-red: #db1b2b;
  --group-yellow: #ffd036;
  --group-yellow-foreground: var(--black);
  --group-green: #188129;
  --group-pink: #c809a8;
  --group-purple: #9d39f3;
  --group-cyan: #007b83;
  --group-orange: #ff9436;
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
    --group-grey: #dfe2e9;
    --group-blue: #a8bcff;
    --group-red: #ff928b;
    --group-yellow: #ffdd7a;
    --group-green: #87eb84;
    --group-pink: #ff96de;
    --group-purple: #cb93ff;
    --group-cyan: #88e3eb;
    --group-orange: #ffb379;

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
  transition:
    transform 450ms,
    opacity 300ms;
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
