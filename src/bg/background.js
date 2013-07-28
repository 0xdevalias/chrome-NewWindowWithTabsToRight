/**
 * @overview Handles the background functionality for the 'New Window With Tabs To Right' extension.
 * @version 0.0.1
 * @author Glenn 'devalias' Grant <feedback@devalias.net>
 * @copyright Copyright (c) 2013 Glenn 'devalias' Grant (http://devalias.net)
 * @license The MIT License (MIT) (see LICENSE.md)
 */

// TODO: Document each function (find a good JS standard way to do this)
// TODO: Abstract the API stuff into a seperate/reusable file
// TODO: Add copyright header with my info (name, website, etc)
// TODO: Add Google Analytics tracking
// TODO: Add an 'options' page with my info (name, website, blog, github, etc. donations?)
//         Feedback/suggestions/comments/criticisms/binary love notes? => feedback@devalias.net
//         Mention why I created this? (eg. For sesh, ping the developer or something?)
//         New sesh with: tabs to right, current and tabs to right
// TODO: Create my own icon for this

// Menu Actions
function newWindowWithTabsToRight(info, currentTab) {
  getTabsForParentWindowOfTab(currentTab, function(tabs) {
    var tabIds = getIdsForTabsToRightOf(currentTab.index, tabs);
    createWindowWithTabs(tabIds, function(tabs) {
      // TODO: Maybe ensure tabs were moved?
    });
  });
}

function newWindowWithCurrentAndTabsToRight(info, currentTab) {
  getTabsForParentWindowOfTab(currentTab, function(tabs) {
    var tabIds = getIdsForCurrentAndTabsToRightOf(currentTab.index, tabs);
    createWindowWithTabs(tabIds, function(tabs) {
      // TODO: Maybe ensure tabs were moved?
    });
  });
}

// Menu
// TODO: Abstract the API stuff
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
  // "enabled": false,
  "title": "..this tab and tabs to right",
  "contexts": ["page"],
  "onclick": newWindowWithCurrentAndTabsToRight
});
