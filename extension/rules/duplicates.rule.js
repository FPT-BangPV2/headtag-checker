// ./rules/duplicates.rule.js
class DuplicatesRule extends BaseRule {
  run(doc, result) {
    const seen = new Map();

    doc.querySelectorAll('meta[name], meta[property], link[rel="canonical"]').forEach((el) => {
      const key = el.getAttribute("name") || el.getAttribute("property") || el.getAttribute("rel");
      const value = el.getAttribute("content") || el.getAttribute("href") || "";

      if (!key || !value) return;
      const id = `${key}:${value}`;
      if (seen.has(id)) {
        const count = seen.get(id) + 1;
        seen.set(id, count);
        if (count === 2) {
          // Only push once
          result.duplicates.push({ name: key, value, count });
          this.pushIssue(result, "head", this.severityMap.error, {
            title: `Duplicate ${key}`,
            desc: `Content: "${value}" (appears ${count} times).`,
            tag: key.includes("og:") ? `meta property="${key}"` : `meta name="${key}"`,
            display: value,
            elementKey: id,
            suggestion: "Remove duplicates to avoid confusion in parsing.",
            reference:
              "https://developers.google.com/search/docs/advanced/guidelines/duplicated-content",
          });
        }
      } else {
        seen.set(id, 1);
      }
    });
  }
}
