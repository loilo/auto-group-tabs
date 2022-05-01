import { ref } from 'vue'

// A control switch to ignore Chrome runtime events during a certain period
// This is needed mostly during browser startup and initial assignment of tab groups
// because for some reason, Chrome fires strange tab group change events in that period,
// leading to inappropriate re-labeling/re-coloring of a tab group
export const ignoreChromeRuntimeEvents = ref(false)
