# Auto-Group Tabs

This is a Google Chrome extension which enables the configuration of tab groups for certain URLs. Navigating to such a URL will automatically add the tab to its configured group (creating the group if it does not exist).

## Development

This project is built with [Vue 3](https://v3.vuejs.org/) and [Vite 2](https://vitejs.dev/).

### Setup

Clone this project:

```bash
git clone https://github.com/loilo/auto-group-tabs.git
```

Step into the cloned folder and install [npm](https://www.npmjs.com/) dependencies:

```bash
npm ci
```

### Development of the Options UI

The fastest way to tinker with the heart of this extension — its options page — is to run the `dev` script:

```bash
npm run dev
```

This will start up the Vite dev server and serve the options page on [localhost:6655](http://localhost:6655/). Having the options page directly in the browser allows for comfort features like hot module reloading to be usable during development.

In this mode, Chrome extension APIs accessed during production (e.g. `chrome.i18n` and `chrome.storage`) use browser-based fallbacks.

> **Note:** You probably want to use the [device toolbar](https://developers.google.com/web/tools/chrome-devtools/device-mode) of Chrome's devtools to give the options page a proper viewport. Chrome's options overlays are (at the time of writing) 400px wide, and I used a height of 350px during development.

### Testing in Chrome

To test the extension in Chrome, you'll have to do a production build of it:

```bash
npm run build
```

This will create a subfolder with the name `extension` inside the project, which can be installed in your Chrome browser.
