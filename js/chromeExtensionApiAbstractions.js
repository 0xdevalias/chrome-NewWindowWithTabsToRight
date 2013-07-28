/**
 * @overview A collection of Chrome Extension API Abstractions to make my life easier.
 * @version 0.1.0
 * @author Glenn 'devalias' Grant <feedback@devalias.net>
 * @copyright Copyright (c) 2013 Glenn 'devalias' Grant (http://devalias.net)
 * @license The MIT License (MIT) (see LICENSE.md)
 */

// ----------------------------------------------------------
// Chrome API
// ----------------------------------------------------------

/**
 * Gets all tabs that have the specified properties, or all tabs if no properties are specified.
 * @name ChromeExtensionAPI~QueryTabs
 * @param {ChromeExtensionAPI~QueryTabsOptions} queryInfo - Options for the Query Tabs method.
 * @param {ChromeExtensionAPI~QueryTabsCallback} callback - Callback for the Query Tabs method.
 * @see <a href="http://developer.chrome.com/extensions/tabs.html#method-query">Chrome Extension API - Tabs - Query</a>
 */
function queryTabs(queryInfo, callback) {
  chrome.tabs.query(queryInfo, callback);
}

/**
 * Moves one or more tabs to a new position within its window, or to a new window.
 * @name ChromeExtensionAPI~MoveTabs
 * @param {number|number[]} tabIds - The tab id or list of tab ids to move.
 * @param {ChromeExtensionAPI~MoveTabsOptions} moveProperties - Options for the Move Tabs method.
 * @param {ChromeExtensionAPI~MoveTabsCallback} callback - Callback for the Move Tabs method.
 * @see <a href="http://developer.chrome.com/extensions/tabs.html#method-move">Chrome Extension API - Tabs - Move</a>
 */
function moveTabs(tabIds, moveProperties, callback) {
  // Ref: http://developer.chrome.com/extensions/tabs.html#method-move
  chrome.tabs.move(tabIds, moveProperties, callback);
}

/**
 * Creates (opens) a new browser with any optional sizing, position or default URL provided.
 * @name ChromeExtensionAPI~CreateWindow
 * @param {ChromeExtensionAPI~CreateWindowOptions} createData - Options for the Create Window method.
 * @param {ChromeExtensionAPI~CreateWindowCallback} callback - Callback for the Create Window method.
 * @see <a href="http://developer.chrome.com/extensions/windows.html#method-create">Chrome Extension API - Windows - Create</a>
 */
function createWindow(createData, callback) {
  chrome.windows.create(createData, callback)
}

// ----------------------------------------------------------
// Chrome API - Abstractions
// ----------------------------------------------------------

/** Return an array of all tabs for the specified window id.
 * @since 1.0.0
 * @param {number} windowId - ID of the window to get tabs from.
 * @param {ChromeExtensionAPI~QueryTabsCallback} callback - Array of tabs for window.
 * @see queryTabs
 */
function getTabsForWindowId(windowId, callback) {
  queryTabs({
    "windowId": windowId
  },
  callback);
}

/** Return an array of all tabs for the parent window of supplied tab.
 * @since 1.0.0
 * @param {ChromeExtensionAPI~Tab} tab - Tab to use the parent window of.
 * @param {ChromeExtensionAPI~QueryTabsCallback} callback - Array of tabs for parent window.
 * @see getTabsForWindowId
 */
function getTabsForParentWindowOfTab(tab, callback) {
  getTabsForWindowId(tab.windowId, callback);
}

/** Return an array of all tab ID's including and to the right of the supplied tab index.
 * @since 1.0.0
 * @param {number} tabIndex - Get tabs including and right of this tab index.
 * @param {ChromeExtensionAPI~Tab[]} tabs - An array of tab objects to extract the id's from.
 * @returns {number[]} Array of tabId's
 */
function getIdsForCurrentAndTabsToRightOf(tabIndex, tabs) {
  var tabIds = [];
  for (var i = tabIndex; i < tabs.length; i++) {
      tabIds[tabIds.length] = tabs[i].id;
    }
  return tabIds;
}

/** Return an array of all tab ID's right of the supplied tab index (not including the supplied tab index).
 * @since 1.0.0
 * @param {number} tabIndex - Get tabs right of this tab index.
 * @param {ChromeExtensionAPI~Tab[]} tabs - An array of tab objects to extract the id's from.
 * @returns {number[]} Array of tabId's
 * @see getIdsForCurrentAndTabsToRightOf
 */
function getIdsForTabsToRightOf(tabIndex, tabs) {
  return getIdsForCurrentAndTabsToRightOf(tabIndex+1, tabs);
}

/** Create a new window and move the supplied tab ID's to it.
 * @since 1.0.0
 * @param {number[]} tabIds - The id's of the tabs to moved.
 * @param {ChromeExtensionAPI~MoveTabsCallback} callback - Details about the moved tabs
 * @see ChromeExtensionAPI~CreateWindow
 * @see moveTabs
 */
function createWindowWithTabs(tabIds, callback) {
  if (!tabIds | tabIds.length < 1)
  {
    alert("There are no tabs to make a new window with.");
    return;
  }

  createWindow({"tabId": tabIds[0]}, function(newWindow) {
    moveTabs(tabIds, {"windowId": newWindow.id, "index": -1}, callback);
  });
}

// ----------------------------------------------------------
// End Chrome API - Abstractions
// ----------------------------------------------------------

// ----------------------------------------------------------
// Chrome Extension API - Typedef and Callback doco
// ----------------------------------------------------------

// ---------
// Windows
// ---------

/** A Chrome Extension API - Windows - Window object
 * @typedef {object} ChromeExtensionAPI~Window
 * @see <a href="http://http://developer.chrome.com/extensions/windows.html#type-Window">Chrome Extension API - Windows - Window</a>
 */

/** Options for Chrome Extension API - Windows - Create Windows method
 * @typedef {object} ChromeExtensionAPI~CreateWindowOptions
 * @see ChromeExtensionAPI~CreateWindow
 * @see <a href="http://developer.chrome.com/extensions/windows.html#method-create">Chrome Extension API - Windows - Create Window Options</a>
 */

/**
 * Callback function for Chrome Extension API - Windows - Create method
 * @callback ChromeExtensionAPI~CreateWindowCallback
 * @param {ChromeExtensionAPI~Window} window - Contains details about the created window
 * @see ChromeExtensionAPI~CreateWindow
 * @see <a href="http://developer.chrome.com/extensions/windows.html#method-create">Chrome Extension API - Windows - Create</a>
 */

// ---------
// Tabs
// ---------

/** A Chrome Extension API - Tabs - Tab object
 * @typedef {object} ChromeExtensionAPI~Tab
 * @see <a href="http://developer.chrome.com/extensions/tabs.html#type-Tab">Chrome Extension API - Tabs - Tab</a>
 */

/** Options for Chrome Extension API - Tabs - Query method
 * @typedef {object} ChromeExtensionAPI~QueryTabsOptions
 * @see ChromeExtensionAPI~CreateTab
 * @see <a href="http://developer.chrome.com/extensions/tabs.html#method-query">Chrome Extension API - Tabs - Query</a>
 */

/**
 * Callback function for Chrome Extension API - Tabs - Query method.
 * @callback ChromeExtensionAPI~QueryTabsCallback
 * @param {ChromeExtensionAPI~Tab[]} tabs - Results for the queried tabs.
 * @see <a href="http://developer.chrome.com/extensions/tabs.html#method-query">Chrome Extension API - Tabs - Query</a>
 */

/** Options for Chrome Extension API - Tabs - Move method
 * @typedef {object} ChromeExtensionAPI~MoveTabsOptions
 * @see ChromeExtensionAPI~MoveTab
 * @see <a href="http://developer.chrome.com/extensions/tabs.html#method-move">Chrome Extension API - Tabs - Move</a>
 */

/**
 * Callback function for Chrome Extension API - Tabs - Move method.
 * @callback ChromeExtensionAPI~MoveTabsCallback
 * @param {ChromeExtensionAPI~Tab|ChromeExtensionAPI~Tab[]} tabs - Details about the moved tabs.
 * @see <a href="http://developer.chrome.com/extensions/tabs.html#method-move">Chrome Extension API - Tabs - Move</a>
 */

// ----------------------------------------------------------
// End Chrome Extension API - Typedef and Callback doco
// ----------------------------------------------------------
