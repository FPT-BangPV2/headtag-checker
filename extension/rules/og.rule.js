class OpenGraphRule extends BaseRule {
  run(doc, result) {
    const prefix = document.head.getAttribute("prefix") || "";
    console.log("prefix::", prefix);

    if (!prefix.includes("og: https://ogp.me/ns#")) {
      result.head.warnings.push({
        title: "Missing Open Graph prefix",
        desc: "Add to <head> tag",
        code: '<head prefix="og: https://ogp.me/ns#">',
        tag: "head",
        elementKey: "og:prefix",
        severity: "warning",
      });
    }

    const required = ["og:title", "og:type", "og:image", "og:url", "og:description"];
    const found = new Set();

    doc.querySelectorAll('meta[property^="og:"]').forEach((m) => {
      const property = m.getAttribute("property");
      const content = m.getAttribute("content")?.trim();

      if (property && content) {
        this.addTag(result, "meta", property, content);
        found.add(property);
      }
    });

    required.forEach((tag) => {
      if (!found.has(tag)) {
        result.head.warnings.push({
          title: `Missing ${tag}`,
          desc: "Important for perfect social sharing",
          code: `<meta property="${tag}" content="...">`,
          tag: `meta property="${tag}"`,
          elementKey: tag,
          severity: "warning",
        });
      }
    });
  }
}
