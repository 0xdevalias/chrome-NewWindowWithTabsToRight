export const STORAGE_KEYS = {
  SETTINGS: 'settings',
};

export const DEFAULT_SETTINGS = {
  showInPageContext: true,
};

export const CONTEXT_MENU_SETTINGS_KEYS = ['showInPageContext'];

/**
 * Retrieves the extension settings from storage, applying defaults if necessary.
 *
 * @returns {Promise<object>} A promise that resolves to the settings object.
 */
export async function getSettings() {
  const result = await chrome.storage.sync.get(STORAGE_KEYS.SETTINGS);
  return {
    ...DEFAULT_SETTINGS,
    ...result[STORAGE_KEYS.SETTINGS],
  };
}

/**
 * Updates the extension settings in storage using an updater function.
 *
 * Note: Setting changes are reacted to in the storage change listener
 *
 * @param {function} updater - A function that receives the current settings and returns the new settings.
 * @returns {Promise<void>}
 */
export async function setSettings(updater) {
  const currentSettings = await getSettings();
  const newSettings = updater(currentSettings);
  await chrome.storage.sync.set({ [STORAGE_KEYS.SETTINGS]: newSettings });
}
