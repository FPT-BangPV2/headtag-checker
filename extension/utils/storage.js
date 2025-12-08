"use strict";
/**
 * utils/storage.js
 * Promise wrappers for chrome.storage.local (merged with state).
 */
/**
 * Generate storage key for tab
 * @param {number} tabId
 * @returns {string}
 */
export function storageKeyForTab(tabId) {
  return `scan_${tabId}`;
}
/**
 * Set items
 * @param {Object} obj
 * @returns {Promise<void>}
 */
export function setStorage(obj) {
  return new Promise((res, rej) => {
    chrome.storage.local.set(obj, () => {
      if (chrome.runtime.lastError) rej(chrome.runtime.lastError);
      else res();
    });
  });
}
/**
 * Get item
 * @param {string} key
 * @returns {Promise<any>}
 */
export function getStorage(key) {
  console.log("Getting storage for key:", key);
  return new Promise((res, rej) => {
    chrome.storage.local.get(key, (v) => {
      if (chrome.runtime.lastError) rej(chrome.runtime.lastError);
      else res(v[key] || null);
    });
  });
}
/**
 * Get last scan for tab
 * @param {number} tabId
 * @returns {Promise<ScanResult|null>}
 */
export function getLastScanForTab(tabId) {
  return getStorage(storageKeyForTab(tabId));
}

/**
 * @param {*} tabId
 * @returns
 */
export async function clearScanForTab(tabId) {
  if (!tabId) return;
  const key = storageKeyForTab(tabId);
  return new Promise((resolve) => {
    chrome.storage.local.remove(key, () => {
      resolve();
    });
  });
}
