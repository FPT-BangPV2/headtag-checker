// ./rules/duplicates.rule.js
class DuplicatesRule {
  run(doc, result) {
    const seen = new Map();

    doc.querySelectorAll('meta[name], meta[property], link[rel="canonical"]').forEach((el) => {
      const key = el.getAttribute("name") || el.getAttribute("property") || el.getAttribute("ref");
      const value = el.getAttribute("content") || el.getAttribute("href") || "";

      if (!key || !value) return;
      const id = `${key}:${value}`;

      if (seen.has(id)) {
        if (!result.duplicates.some((d) => d.name === key && d.value === value)) {
          result.duplicates.push({ name: key, value, count: seen.get(id) + 1 });
          result.head.errors.push({
            title: `Duplicate ${key}`,
            desc: `Content: "${value}"`,
            tag: key.includes("og:") ? `meta property="${key}"` : `meta name="${key}"`,
            display: value,
            elementKey: id,
            severity: "error",
          });
        }
      } else {
        seen.set(id, 1);
      }
    });
  }
}
