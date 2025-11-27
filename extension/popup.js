document.getElementById("extractBtn").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        function: extractMetadata,
      },
      (results) => {
        if (results && results[0] && results[0].result) {
          displayMetadata(results[0].result);
          document.getElementById("copyBtn").disabled = false;
        } else {
          document.getElementById("metadata").textContent =
            "Error extracting metadata";
          document.getElementById("copyBtn").disabled = true;
        }
      }
    );
  });
});

document.getElementById("copyBtn").addEventListener("click", () => {
  const metadataText = document.getElementById("metadata").textContent;
  navigator.clipboard
    .writeText(metadataText)
    .then(() => {
      const copyBtn = document.getElementById("copyBtn");
      copyBtn.textContent = "Copied!";
      setTimeout(() => {
        copyBtn.textContent = "Copy to Clipboard";
      }, 2000);
    })
    .catch((err) => {
      console.error("Failed to copy: ", err);
      alert("Failed to copy metadata");
    });
});

function extractMetadata() {
  const head = document.head;
  const metadata = {
    title: head.querySelector("title")?.textContent.trim() || "",
    canonical: head.querySelector("link[rel='canonical']")?.href || "",
    meta: {},
    duplicates: [],
    hasDuplicates: false,
    missingTags: [],
    warnings: [],
  };

  const requiredTags = [
    "description",
    "robots",
    "og:title",
    "og:description",
    "og:image",
    "twitter:card",
    "twitter:title",
    "twitter:image",
  ];

  const exclusiveMetaNames = ["fb:app_id", "next-head-count", "viewport"];
  const seen = new Map();

  // Check title
  const titleTags = head.querySelectorAll("title");
  if (titleTags.length === 0) {
    metadata.missingTags.push("title");
  } else if (titleTags.length > 1) {
    metadata.warnings.push("Multiple <title> tags found");
  }

  // Check canonical
  const canonicalTags = head.querySelectorAll("link[rel='canonical']");
  if (canonicalTags.length === 0) {
    metadata.missingTags.push("link_canonical");
  } else if (canonicalTags.length > 1) {
    metadata.warnings.push("Multiple canonical tags found");
  }

  // Collect meta tags
  head.querySelectorAll("meta[name], meta[property]").forEach((meta) => {
    const name = meta.getAttribute("name") || meta.getAttribute("property");
    if (!name || exclusiveMetaNames.includes(name)) return;

    const content = meta.getAttribute("content")?.trim() || "";
    const combinedKey = `${name}:${content}`;

    // Check duplicates
    if (seen.has(combinedKey)) {
      metadata.duplicates.push(meta.outerHTML);
    } else {
      seen.set(combinedKey, true);
    }

    // Save meta info
    const metaInfo = {};
    Array.from(meta.attributes).forEach((attr) => {
      metaInfo[attr.name] = attr.value;
    });
    metadata.meta[name] = metaInfo;
  });

  // Check required tags
  requiredTags.forEach((tag) => {
    if (!metadata.meta[tag]) {
      metadata.missingTags.push(tag);
    }
  });

  if (metadata.duplicates.length > 0) {
    metadata.hasDuplicates = true;
  }

  return metadata;
}

function displayMetadata(metadata) {
  // let output = "";
  // Hiển thị đẹp dưới dạng JSON
  const output = JSON.stringify(metadata, null, 2);

  // for (let key in metadata) {
  //   output += `${key}: ${metadata[key]}\n`;
  // }
  document.getElementById("metadata").textContent = output;
}
