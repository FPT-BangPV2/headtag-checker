// ./rules/images.rule.js
class ImagesRule {
  run(doc, result) {
    doc.querySelectorAll("img").forEach((img, index) => {
      const src = img.currentSrc || img.src || "";

      if (!src) return;

      const key = `img:${index}`;
      const shortName = this.shortenUrl(src);
      const hasAlt = img.alt?.trim() && img.alt !== "";
      const hasLazy = img.loading === "lazy" || img.hasAttribute("loading");
      const hasSrcset = img.hasAttribute("srcset");
      const hasWidth = img.hasAttribute("width");
      const hasHeight = img.hasAttribute("height");

      if (!hasAlt)
        result.body.warnings.push({
          title: "Missing alt attribute",
          desc: "Improves accessibility & Google images SEO",
          tag: "img",
          display: shortName,
          elementKey: key,
          severity: "warning",
        });

      if (!hasLazy && !src.includes("data:"))
        result.body.warnings.push({
          title: 'Should use loading="lazy"',
          desc: "Improves pages speed",
          tag: "img",
          display: shortName,
          elementKey: key,
          severity: "warning",
        });

      if (!hasSrcset) {
        result.body.warnings.push({
          title: "Missing srcset attribute",
          desc: "Needed for responsive images",
          tag: "img",
          display: shortName,
          elementKey: key,
          severity: "warning",
        });
      }

      if (!hasWidth && !hasHeight) {
        result.body.warnings.push({
          title: "Missing width/height",
          desc: "Prevent layout shift (CLS)",
          tag: "img",
          display: shortName,
          elementKey: key,
          severity: "warning",
        });
      }
    });
  }

  shortenUrl(url) {
    try {
      const ur = new URL(url);
      const parts = ur.pathname.split("/");
      return parts.slice(-2).join("/");
    } catch (error) {
      return url.split("/").pop() || url;
    }
  }
}
