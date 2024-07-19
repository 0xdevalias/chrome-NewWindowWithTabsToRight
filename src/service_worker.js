import Analytics from './google-analytics.js';

/**
 * Handles the extension's installation event.
 * Sets up context menus.
 *
 * @see {@link https://developer.chrome.com/docs/extensions/reference/api/runtime#event-onInstalled}
 * @see {@link https://developer.chrome.com/docs/extensions/reference/api/contextMenus#method-create}
 * @see {@link https://developer.chrome.com/docs/extensions/develop/ui/context-menu}
 */
chrome.runtime.onInstalled.addListener(async (details) => {
  const menuContexts = ["page"];

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
    id: 'contextMenu-separator',
    type: "separator"
  });

  chrome.contextMenus.create({
    contexts: menuContexts,
    parentId: menuRoot,
    id: aboutTheDeveloper.name,
    title: "About the Developer"
  });

  await Analytics.fireEvent('extension_lifecycle', {
    reason: details.reason
  });
});

/**
 * Handles context menu item clicks.
 *
 * @param {object} info - Information about the item clicked and the context where the click happened.
 * @param {object} tab - The details of the tab where the click happened.
 *
 * @see {@link https://developer.chrome.com/docs/extensions/reference/api/contextMenus#event-onClicked}
 */
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const handlers = {
    newWindowWithCurrentAndTabsToRight,
    newWindowWithTabsToRight,
    aboutTheDeveloper,
  };

  await handlers[info.menuItemId]?.(tab);

  await Analytics.fireEvent('task_triggered', {
    source: 'contextMenu',
    task: info.menuItemId
  });
});

/**
 * Handles keyboard command execution.
 *
 * @param {string} command - The name of the command.
 * @param {object} tab - The details of the tab where the command was executed.
 *
 * @see {@link https://developer.chrome.com/docs/extensions/reference/api/commands#event-onCommand}
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
 * Opens a new window with the current tab and tabs to the right.
 *
 * @param {object} tab - The details of the current tab.
 */
async function newWindowWithCurrentAndTabsToRight(tab) {
  const tabIds = await getTabIdsToMove({ tab, includeCurrentTab: true });
  await createWindowWithTabs(tabIds);
}

/**
 * Opens a new window with tabs to the right of the current tab.
 *
 * @param {object} tab - The details of the current tab.
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
  chrome.tabs.create({ url: "http://devalias.net/dev/chrome-extensions/new-window-with-tabs-to-right/", active: true });
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
