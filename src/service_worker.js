import Analytics from './google-analytics.js';
import { CONTEXT_MENU_SETTINGS_KEYS, STORAGE_KEYS, getSettings, setSettings } from "./settings.js";

const ABOUT_THE_DEVELOPER_URL = 'https://www.devalias.net/dev/chrome-extensions/new-window-with-tabs-to-right/';

/**
 * Fired when the extension is first installed, when the extension is updated to a new version, and when Chrome is
 * updated to a new version.
 *
 * @see {@link https://developer.chrome.com/docs/extensions/reference/api/runtime#event-onInstalled}
 */
chrome.runtime.onInstalled.addListener(async (details) => {
  await updateContextMenus();

  await Analytics.fireEvent('extension_lifecycle', {
    reason: details.reason
  });
});

/**
 * Fired when an action icon is clicked. This event will not fire if the action has a popup.
 *
 * @param {object} tab - The details of the tab where the action button was clicked.
 *
 * @see {@link https://developer.chrome.com/docs/extensions/reference/api/action#event-onClicked}
 * @see {@link https://developer.chrome.com/docs/extensions/reference/api/tabs#type-Tab}
 * @see {@link https://developer.chrome.com/docs/extensions/develop/ui/implement-action}
 */
chrome.action.onClicked.addListener(async (tab) => {
  await newWindowWithCurrentAndTabsToRight(tab);

  await Analytics.fireEvent('task_triggered', {
    source: 'action',
    task: 'actionIcon'
  });
});

/**
 * Fired when a context menu item is clicked.
 *
 * @param {object} info - Information about the item clicked and the context where the click happened.
 * @param {object} tab - The details of the tab where the click happened.
 *
 * @see {@link https://developer.chrome.com/docs/extensions/reference/api/contextMenus#event-onClicked}
 * @see {@link https://developer.chrome.com/docs/extensions/reference/api/contextMenus#type-OnClickData}
 * @see {@link https://developer.chrome.com/docs/extensions/reference/api/tabs#type-Tab}
 */
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const handlers = {
    newWindowWithCurrentAndTabsToRight,
    newWindowWithTabsToRight,
    aboutTheDeveloper,
    togglePageContextMenu,
  };

  await handlers[info.menuItemId]?.(tab);

  await Analytics.fireEvent('task_triggered', {
    source: 'contextMenu',
    task: info.menuItemId
  });
});

/**
 * Fired when a registered command is activated using a keyboard shortcut.
 *
 * @param {string} command - The name of the command.
 * @param {object} tab - The details of the tab where the command was executed.
 *
 * @see {@link https://developer.chrome.com/docs/extensions/reference/api/commands#event-onCommand}
 * @see {@link https://developer.chrome.com/docs/extensions/reference/api/tabs#type-Tab}
 */
chrome.commands.onCommand.addListener(async (command, tab) => {
  const handlers = {
    newWindowWithCurrentAndTabsToRight,
    newWindowWithTabsToRight,
  };

  await handlers[command]?.(tab);

  await Analytics.fireEvent('task_triggered', {
    source: 'command',
    task: command
  });
});

/**
 * Fired when one or more storage items change.
 *
 * Handles changes to the extension's settings/etc.
 *
 * @see {@link https://developer.chrome.com/docs/extensions/reference/storage#event-onChanged}
 * @see {@link https://developer.chrome.com/docs/extensions/reference/api/storage#type-StorageChange}
 */
chrome.storage.onChanged.addListener(async (changes, areaName) => {
  if (areaName === 'sync' && STORAGE_KEYS.SETTINGS in changes) {
    const { oldValue = {}, newValue = {} } = changes[STORAGE_KEYS.SETTINGS];

    // Check if any context menu-related settings have changed
    const contextMenuSettingsChanged = CONTEXT_MENU_SETTINGS_KEYS.some((key) => {
      return oldValue[key] !== newValue[key];
    });

    if (contextMenuSettingsChanged) {
      await updateContextMenus();
    }
  }
});

/**
 * Updates the context menus based on the current settings.
 *
 * @see {@link https://developer.chrome.com/docs/extensions/reference/api/contextMenus#method-removeAll}
 * @see {@link https://developer.chrome.com/docs/extensions/reference/api/contextMenus#method-create}
 * @see {@link https://developer.chrome.com/docs/extensions/develop/ui/context-menu}
 */
async function updateContextMenus() {
  // Get settings from storage
  const settings = await getSettings();

  // Determine the contexts based on settings
  const menuContexts = ["action"];
  if (settings.showInPageContext) {
    menuContexts.push("page");
  }

  // Remove all existing context menus
  await chrome.contextMenus.removeAll();

  // Create context menus

  const menuRoot = chrome.contextMenus.create({
    contexts: menuContexts,
    id: 'rootContextMenu',
    title: "New window with.."
  });

  chrome.contextMenus.create({
    contexts: menuContexts,
    parentId: menuRoot,
    id: newWindowWithCurrentAndTabsToRight.name,
    title: "..this tab and tabs to right"
  });

  chrome.contextMenus.create({
    contexts: menuContexts,
    parentId: menuRoot,
    id: newWindowWithTabsToRight.name,
    title: "..tabs to right"
  });

  chrome.contextMenus.create({
    contexts: menuContexts,
    parentId: menuRoot,
    id: 'contextMenu-separator-1',
    type: "separator"
  });

  // Create 'Options' submenu

  const optionsMenu = chrome.contextMenus.create({
    contexts: menuContexts,
    parentId: menuRoot,
    id: 'optionsMenu',
    title: 'Options'
  });

  chrome.contextMenus.create({
    contexts: menuContexts,
    parentId: optionsMenu,
    id: togglePageContextMenu.name,
    title: 'Show page context menu',
    type: 'checkbox',
    checked: settings.showInPageContext,
  });

  chrome.contextMenus.create({
    contexts: menuContexts,
    parentId: menuRoot,
    id: 'contextMenu-separator-2',
    type: "separator"
  });

  chrome.contextMenus.create({
    contexts: menuContexts,
    parentId: menuRoot,
    id: aboutTheDeveloper.name,
    title: "About the Developer"
  });
}

/**
 * Opens a new window with the current tab and tabs to the right.
 *
 * @param {object} tab - The details of the current tab.
 *
 * @see {@link https://developer.chrome.com/docs/extensions/reference/api/tabs#type-Tab}
 */
async function newWindowWithCurrentAndTabsToRight(tab) {
  const tabIds = await getTabIdsToMove({ tab, includeCurrentTab: true });
  await createWindowWithTabs(tabIds);
}

/**
 * Opens a new window with tabs to the right of the current tab.
 *
 * @param {object} tab - The details of the current tab.
 *
 * @see {@link https://developer.chrome.com/docs/extensions/reference/api/tabs#type-Tab}
 */
async function newWindowWithTabsToRight(tab) {
  const tabIds = await getTabIdsToMove({ tab, includeCurrentTab: false });
  await createWindowWithTabs(tabIds);
}

/**
 * Opens a new tab with information about the developer.
 *
 * @see {@link https://developer.chrome.com/docs/extensions/reference/api/tabs#method-create}
 */
async function aboutTheDeveloper() {
  await chrome.tabs.create({ url: ABOUT_THE_DEVELOPER_URL, active: true });
}

/**
 * Toggles the option to show the 'page' context menu on or off.
 */
async function togglePageContextMenu() {
  await setSettings(settings => ({
    ...settings,
    showInPageContext: !settings.showInPageContext,
  }));
}

/**
 * Gets the IDs of tabs to move based on the current tab and whether to include the current tab.
 *
 * @param {object} options - Options for getting tab IDs.
 * @param {object} options.tab - The details of the current tab.
 * @param {boolean} options.includeCurrentTab - Whether to include the current tab.
 * @returns {Promise<number[]>} A promise that resolves to an array of tab IDs.
 *
 * @see {@link https://developer.chrome.com/docs/extensions/reference/api/tabs#method-query}
 * @see {@link https://developer.chrome.com/docs/extensions/reference/api/tabs#type-Tab}
 */
async function getTabIdsToMove({ tab, includeCurrentTab }) {
  let currentTab = tab;

  if (!currentTab) {
    const [activeTab] = await chrome.tabs.query({ currentWindow: true, active: true });
    currentTab = activeTab;
  }

  if (!currentTab || typeof currentTab.index === 'undefined' || typeof currentTab.windowId === 'undefined') return [];

  const tabs = await chrome.tabs.query({ windowId: currentTab.windowId });
  if (!tabs || tabs.length === 0) return [];

  const startIndex = includeCurrentTab ? currentTab.index : currentTab.index + 1;
  return tabs.filter(t => t.index >= startIndex).map(t => t.id);
}

/**
 * Creates a new window with the specified tabs.
 *
 * @param {number[]} tabIds - The IDs of the tabs to move to the new window.
 *
 * @see {@link https://developer.chrome.com/docs/extensions/reference/api/windows#method-create}
 * @see {@link https://developer.chrome.com/docs/extensions/reference/api/tabs#method-move}
 */
async function createWindowWithTabs(tabIds) {
  if (!tabIds || tabIds.length === 0) return;

  const newWindow = await chrome.windows.create({ tabId: tabIds[0] });
  if (tabIds.length > 1) {
    await chrome.tabs.move(tabIds.slice(1), { windowId: newWindow.id, index: -1 });
  }
}
