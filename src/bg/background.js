/**
 * @overview Handles the background functionality for the 'New Window With Tabs To Right' extension.
 * @version 0.0.1
 * @author Glenn 'devalias' Grant <feedback@devalias.net>
 * @copyright Copyright (c) 2013 Glenn 'devalias' Grant (http://devalias.net)
 * @license The MIT License (MIT) (see LICENSE.md)
 */

// Menu Actions
function newWindowWithTabsToRight(info, currentTab) {
  _gaq.push(['_trackEvent', 'contextMenu', 'clicked', 'newWindowWithTabsToRight']);
  getTabsForParentWindowOfTab(currentTab, function(tabs) {
    var tabIds = getIdsForTabsToRightOf(currentTab.index, tabs);
    createWindowWithTabs(tabIds, function(tabs) {
      // TODO: Maybe ensure tabs were moved?
    });
  });
}

function newWindowWithCurrentAndTabsToRight(info, currentTab) {
  _gaq.push(['_trackEvent', 'contextMenu', 'clicked', 'newWindowWithCurrentAndTabsToRight']);
  getTabsForParentWindowOfTab(currentTab, function(tabs) {
    var tabIds = getIdsForCurrentAndTabsToRightOf(currentTab.index, tabs);
    createWindowWithTabs(tabIds, function(tabs) {
      // TODO: Maybe ensure tabs were moved?
    });
  });
}

function aboutTheDeveloper(info, currentTab) {
  _gaq.push(['_trackEvent', 'contextMenu', 'clicked', 'aboutTheDeveloper']);
  createTabWithUrl("http://www.devalias.net/chrome-extensions/new-window-with-tabs-to-right/", true);
}

// Keybinding handlers
chrome.commands.onCommand.addListener(function(command) {
    var qOptions = {currentWindow: true, active: true}
    chrome.tabs.query(qOptions, function(arrayOfTabs) {
		var curTab = arrayOfTabs[0];
        if (command == "newWindowWithTabsToRight") {
            newWindowWithTabsToRight(qOptions, curTab);
        }
        else if (command == "newWindowWithThisAndTabsToRight") {
            newWindowWithThisAndTabsToRight(qOptions, curTab);
        }
	});
});

// Menu
// TODO: Abstract the chrome API stuff into library
var menuRoot = chrome.contextMenus.create({
  "type": "normal",
  "title": "New window with..",
  "contexts": ["page"]
});

var menuWithTabsToRight = chrome.contextMenus.create({
  "type": "normal",
  "parentId": menuRoot,
  "title": "..tabs to right",
  "contexts": ["page"],
  "onclick": newWindowWithTabsToRight
});

var menuWithThisTabAndTabsToRight = chrome.contextMenus.create({
  "type": "normal",
  "parentId": menuRoot,
  "title": "..this tab and tabs to right",
  "contexts": ["page"],
  "onclick": newWindowWithCurrentAndTabsToRight
});

var menuSeparator = chrome.contextMenus.create({
  "type": "separator",
  "parentId": menuRoot,
  "contexts": ["page"],
});

var menuAboutTheDeveloper = chrome.contextMenus.create({
  "type": "normal",
  "parentId": menuRoot,
  "title": "About the Developer",
  "contexts": ["page"],
  "onclick": aboutTheDeveloper
});
