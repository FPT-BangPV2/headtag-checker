"use strict";

/**
 * popup/popup.js
 * SEO Tag Inspector Pro – Manifest V3 compatible
 */

import { sendRuntimeMessage } from "../utils/messaging.js";
import { exportCSV } from "../utils/csv.js";
import { getLastScanForTab, clearScanForTab } from "../utils/storage.js";

/* ====================== CONSTANTS & SELECTORS ====================== */
const SELECTORS = {
  scanBtn: "#scanBtn",
  clearBtn: "#clearBtn",
  copyJson: "#copyJson",
  downloadCsv: "#downloadCsv",
  url: "#url",
  errors: "#errors",
  warnings: "#warnings",
  headCount: "#head-count",
  bodyCount: "#body-count",
  result: "#result",
  tabs: ".tab",
};

const els = {};
Object.keys(SELECTORS).forEach((key) => {
  els[key] = document.querySelector(SELECTORS[key]);
});

/* ====================== STATE ====================== */
let activeTabId = null;
let currentUrl = "";

/* ====================== UTILS ====================== */
const escapeHtml = (str) => {
  if (typeof str !== "string") return str;
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
};

const truncate = (str, len = 60) => {
  return str.length > len ? str.slice(0, len - 3) + "..." : str;
};

const shortenUrl = (url) => {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts.length === 0) return url;
    return parts.slice(-2).join("/") || url;
  } catch {
    return url.split("/").pop() || url;
  }
};

const getTagDisplay = (item) => {
  if (item.tag) return item.tag;
  if (item.property) return `meta property="${item.property}"`;
  if (item.name) return `meta name="${item.name}"`;
  if (item.rel) return `link rel="${item.rel}"`;
  return "tag";
};

const getIcon = (item) => {
  if (item.type === "title") return "T";
  if (item.name === "description") return "D";
  if (item.property?.startsWith("og:")) return "OG";
  if (item.rel === "canonical") return "C";
  return "M";
};

/* ====================== RENDER HELPERS ====================== */
const createIssueCard = (group) => {
  const isError = group.issues.some((i) => i.severity === "error");
  const displayText = group.display ? truncate(group.display, 70) : "";

  return `${group.issues
    .map(
      (iss) => `
            <div class="card ${isError ? "error" : "warning"}">
                <div class="card-header">
                    <span class="tag">&lt;${escapeHtml(getTagDisplay(group.tag))}&gt;</span>
                    ${
                      displayText
                        ? `<strong title="${escapeHtml(group.display)}">${escapeHtml(
                            displayText
                          )}</strong>`
                        : ""
                    }
                </div>
                ${iss.desc ? `<p class="card-desc">${escapeHtml(iss.desc)}</p>` : ""}
                ${iss.code ? `<code class="card-code">${escapeHtml(iss.code)}</code>` : ""}
                <div class="tip">${
                  iss.tip || (isError ? "Needs immediate fixing" : "Should be optimized")
                }</div>
            </div>`
    )
    .join("")} `;
};

const renderPerfectState = () => `
 <div class="perfect">
   <div class="perfect-icon">✓</div>
   <p>No SEO issues detected. Awesome!</p>
 </div>
`;

const renderTagGrid = (tags) => {
  if (!tags || tags.length === 0) {
    return '<p class="muted">No important meta tags detected</p>';
  }
  return `
    <h3 class="section-title">Important Meta Tags Detected</h3>
    <div class="tag-grid">${tags
      .map((t) => {
        const label = t.property || t.name || t.rel || t.type;
        const value = t.value || t.href || "";
        const truncated = value.length > 80 ? value.slice(0, 77) + "..." : value;
        return `
          <div class="tag-card" title="${escapeHtml(value)}">
              <div class="tag-wrap ">
                  <span class="tag-icon">${getIcon(t)}</span>
                  <span class="tag-label">${escapeHtml(label)}</span>
              </div>
              <div class="tag-value truncate-3-lines">${escapeHtml(truncated)}</div>
          </div>
      `;
      })
      .join("")}
    </div>
  `;
};

/* ====================== MAIN RENDER ====================== */
const renderResult = (scan) => {
  if (!scan || scan.summary.errors + scan.summary.warnings === 0) {
    els.result.innerHTML = `<div class="tab-pane">${renderPerfectState()}</div><div class="tab-pane" style="display:none;">${renderPerfectState()}</div>`;
    els.headCount.textContent = "0";
    els.bodyCount.textContent = "0";
    return;
  }

  const grouped = {};
  // Group HEAD & BODY
  const addToGroup = (items, severity = "warning") => {
    console.log("addToGroup:::", items);
    // const grouped = {};
    items.forEach((item) => {
      const key = item.elementKey || "general";
      if (!grouped[key]) {
        grouped[key] = {
          tag: item.tag || getTagDisplay(item),
          display: item.display || item.title,
          issues: [],
        };
      }
      grouped[key].issues.push({ ...item, severity });
    });
    return Object.values(grouped).map(createIssueCard).join("");
  };

  console.log(grouped);

  // Head: errors + warnings
  const headErrorsHTML = addToGroup(scan.head.errors, "error");
  const headWarningsHTML = addToGroup(scan.head.warnings, "warning");
  // Body: errors + warnings
  const bodyErrorsHTML = addToGroup(scan.body.errors, "error");
  const bodyWarningsHTML = addToGroup(scan.body.warnings, "warning");

  let headHTML = "";
  let bodyHTML = "";

  Object.values(grouped).forEach((group) => {
    const html = createIssueCard(group);
    if (group.tag === "img" || /^h[1-6]$/.test(group.tag)) {
      bodyHTML += html;
    } else {
      headHTML += html;
    }
  });

  // ADD BACK HEAD TAGS GRID – ONLY IN HEAD TAB
  const tagGridHTML = scan.head.tags.length > 0 ? renderTagGrid(scan.head.tags) : "";

  // Fallback if no issue exists.
  headHTML = `
    ${headErrorsHTML}
    ${headWarningsHTML}
    ${tagGridHTML}
    ${
      !headErrorsHTML && !headWarningsHTML && !tagGridHTML
        ? '<p class="muted">No issues in &lt;head&gt;</p>'
        : ""
    }
 `;
  bodyHTML = `
    ${bodyErrorsHTML}
    ${bodyWarningsHTML}
    ${!bodyErrorsHTML && !bodyWarningsHTML ? '<p class="muted">No issues in body</p>' : ""}
 `;

  els.result.innerHTML = `
   <div id="head" class="tab-pane">${headHTML}</div>
   <div id="body" class="tab-pane" style="display:none;">${bodyHTML}</div>
 `;

  // Update counts
  els.headCount.textContent = scan.head.errors.length + scan.head.warnings.length;
  els.bodyCount.textContent = scan.body.errors.length + scan.body.warnings.length;
};

/* ====================== TAB SWITCHING ====================== */
const initTabs = () => {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      document.querySelectorAll(".tab-pane").forEach((pane) => (pane.style.display = "none"));
      document.getElementById(tab.dataset.tab).style.display = "block";
    });
  });
};

/* ====================== ACTIONS ====================== */
const setLoading = (yes) => {
  els.scanBtn.disabled = yes;
  if (yes) {
    els.result.innerHTML = `
     <div class="loading">
       <div class="spinner"></div>
       <p>Analyzing the website...</p>
     </div>`;
  }
};

const loadCurrentScan = async () => {
  const scan = await getLastScanForTab(activeTabId);
  els.errors.textContent = scan?.summary.errors ?? 0;
  els.warnings.textContent = scan?.summary.warnings ?? 0;
  renderResult(scan);
};

/* ====================== INIT ====================== */
document.addEventListener("DOMContentLoaded", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  activeTabId = tab?.id;
  currentUrl = new URL(tab.url).origin + new URL(tab.url).pathname;
  els.url.textContent = currentUrl.length > 60 ? currentUrl.slice(0, 57) + "..." : currentUrl;

  initTabs();
  await loadCurrentScan();

  // Scan
  els.scanBtn.addEventListener("click", async () => {
    setLoading(true);
    try {
      await sendRuntimeMessage({ action: "runScan" });
      await loadCurrentScan();
    } catch (err) {
      els.result.innerHTML = `<div class="error-msg">Error: ${escapeHtml(err.message)}</div>`;
    } finally {
      setLoading(false);
    }
  });

  // Clear
  els.clearBtn.addEventListener("click", async () => {
    await clearScanForTab(activeTabId);
    await sendRuntimeMessage({ action: "clearScan", tabId: activeTabId }); // reset badge
    els.errors.textContent = els.warnings.textContent = "0";
    els.headCount.textContent = els.bodyCount.textContent = "0";
    els.result.innerHTML = '<div class="placeholder">Results deleted. Click Scan to recheck!</div>';
  });

  // Copy
  els.copyJson.addEventListener("click", async () => {
    const scan = await getLastScanForTab(activeTabId);
    if (!scan) return alert("No data to copy!");
    await navigator.clipboard.writeText(JSON.stringify(scan, null, 2));
    alert("JSON has been copied to the clipboard!");
  });

  // Export
  els.downloadCsv.addEventListener("click", async () => {
    const scan = await getLastScanForTab(activeTabId);
    if (!scan) return alert("No data to export!");
    exportCSV(`SEO-Report-${new Date().toISOString().split("T")[0]}.csv`, scan);
  });
});
