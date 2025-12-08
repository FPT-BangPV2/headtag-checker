(function () {
  "use strict";

  // ===================================
  // FILE: extension/rules/base.rule.js
  // ===================================
  class BaseRule {
    addTag(result, type, name, value, href = "") {
      result.head.tags.push({ type, name, value: value?.trim() || "", href });
    }
  }

  // ===================================
  // FILE: extension/rules/title.rule.js
  // ===================================
  // ./rules/title.Rule.js
  class TitleRule extends BaseRule {
    run(doc, result) {
      const metaTitle = doc.querySelector("title");

      if (!metaTitle || !metaTitle.textContent.trim()) {
        result.head.errors.push({
          title: "Missing <title> tag",
          desc: "Most important for SEO",
          tag: "title",
          elementKey: "title",
          severity: "error",
        });
      } else {
        const text = metaTitle.textContent.trim();
        this.addTag(result, "title", "title", text);
        if (text.length < 10)
          result.head.warnings.push({
            title: "Title too short",
            desc: "Less than 10 characters",
            tag: "title",
            display: text,
            elementKey: "title",
            severity: "warning",
          });
        if (text.length > 70)
          result.head.warnings.push({
            title: "Title too long",
            desc: `${text.length} characters (up to 70)`,
            display: text,
            elementKey: "title",
            severity: "warning",
          });
      }
    }
  }

  // ===================================
  // FILE: extension/rules/description.rule.js
  // ===================================
  // ./rules/description.rule.js
  class DescriptionRule extends BaseRule {
    run(doc, result) {
      const metaDescription = doc.querySelector('meta[name="description"]');

      if (!metaDescription || !metaDescription.content?.trim()) {
        result.head.errors.push({
          title: "Missing meta description",
          desc: "Increase click-through rate from Google",
          tag: 'meta name="description"',
          elementKey: "meta:description",
          severity: "error",
        });
      } else {
        const content = metaDescription.content.trim();
        this.addTag(result, "meta", "description", content);

        if (content.length > 160)
          result.head.warnings.push({
            title: "Meta description is too long",
            desc: `${content.length} characters (maximum 160)`,
            tag: 'meta name="description"',
            elementKey: "meta:description",
            severity: "warning",
          });
      }
    }
  }

  // ===================================
  // FILE: extension/rules/robots.rule.js
  // ===================================
  // ./rules/robots.rule.js
  class RobotsRule {
    run(doc, result) {
      const meta = doc.querySelector('meta[name="robots"]');
      if (meta) {
        const content = meta.content.toLowerCase();
        result.head.tags.push({ type: "meta", name: "robots", value: content });
        if (content.includes("noindex")) {
          result.head.errors.push({
            title: "Noindex applied",
            desc: "Google will NOT index this page!",
          });
        }
      }
    }
  }

  // ===================================
  // FILE: extension/rules/canonical.rule.js
  // ===================================
  // ./rules/canonical.rule.js
  class CanonicalRule extends BaseRule {
    run(doc, result) {
      const link = doc.querySelector('link[rel="canonical"]');
      if (!link?.href) {
        result.head.warnings.push({
          title: "Missing canonical URL",
          desc: "Prevent content duplication",
        });
      } else {
        this.addTag(result, "link", "canonical", link.href, link.href);
        const current = location.href.split("?")[0].split("#")[0];
        if (link.href !== current && !link.href.includes(current)) {
          result.head.warnings.push({ title: "Canonical does not match the current URL" });
        }
      }
    }
  }

  // ===================================
  // FILE: extension/rules/og.rule.js
  // ===================================
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

  // ===================================
  // FILE: extension/rules/viewport.rule.js
  // ===================================
  // ./rules/viewport.rule.js
  class ViewportRule {
    run(doc, result) {
      const meta = doc.querySelector('meta[name="viewport"]');
      if (!meta) {
        result.head.errors.push({
          title: "Missing meta viewport",
          desc: "The page is not responsive on mobile",
        });
      } else {
        result.head.tags.push({ type: "meta", name: "viewport", value: meta.content });
      }
    }
  }

  // ===================================
  // FILE: extension/rules/favicon.rule.js
  // ===================================
  // ./rules/favicon.rule.js
  class FaviconRule {
    run(doc, result) {
      const hasFavicon = doc.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
      const hasApple = doc.querySelector(
        'link[rel="apple-touch-icon"], link[rel="apple-touch-icon-precomposed"]'
      );
      if (!hasFavicon)
        result.head.warnings.push({
          title: "Missing  favicon",
          desc: "Display on browser tab",
          tag: "link",
          display: "favicon",
          elementKey: "favicon",
          severity: "warning",
        });
      if (!hasApple)
        result.head.warnings.push({
          title: "Missing  apple-touch-icon",
          desc: "Display on iPhone/iPad",
          tag: "link",
          display: "apple-touch-icon",
          elementKey: "apple-touch-icon",
          severity: "warning",
        });
    }
  }

  // ===================================
  // FILE: extension/rules/language.rule.js
  // ===================================
  // ./rules/language.rule.js
  class LanguageRule {
    run(doc, result) {
      const lang = doc.documentElement.getAttribute("lang");
      if (!lang) {
        result.head.warnings.push({
          title: "Missing lang attribute",
          desc: 'Add <html lang="vi"> or en, ja...',
        });
      } else {
        result.head.tags.push({ type: "html", name: "lang", value: lang });
      }
    }
  }

  // ===================================
  // FILE: extension/rules/headings.rule.js
  // ===================================
  // ./rules/headings.rule.js
  class HeadingsRule {
    run(doc, result) {
      const h1s = doc.querySelectorAll("h1");
      if (h1s.length === 0) result.body.errors.push({ title: "Thiếu thẻ H1" });
      if (h1s.length > 1)
        result.body.errors.push({ title: `Có ${h1s.length} thẻ H1 (chỉ nên có 1)` });
      let lastLevel = 0;
      doc.querySelectorAll("h1,h2,h3,h4,h5,h6").forEach((h) => {
        const level = parseInt(h.tagName[1]);
        if (lastLevel > 0 && level > lastLevel + 1) {
          result.body.warnings.push({ title: `Bỏ cấp heading: H${lastLevel} → H${level}` });
        }
        lastLevel = level;
      });
    }
  }

  // ===================================
  // FILE: extension/rules/images.rule.js
  // ===================================
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

  // ===================================
  // FILE: extension/rules/duplicates.rule.js
  // ===================================
  // ./rules/duplicates.rule.js
  class DuplicatesRule {
    run(doc, result) {
      const seen = new Map();

      doc.querySelectorAll('meta[name], meta[property], link[rel="canonical"]').forEach((el) => {
        const key =
          el.getAttribute("name") || el.getAttribute("property") || el.getAttribute("ref");
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

  // ===================================
  // FILE: extension/rules/structuredData.rule.js
  // ===================================
  // ./rules/structuredData.rule.js
  class StructuredDataRule {
    run(doc, result) {
      const hasJsonLd = doc.querySelector('script[type="application/ld+json"]');
      if (!hasJsonLd) {
        result.head.warnings.push({
          title: "Missing Structured Data (JSON-LD)",
          desc: "Increase chances of Rich Results",
        });
      } else {
        result.head.tags.push({
          type: "script",
          name: "application/ld+json",
          value: "Already exists.",
        });
        result.structuredData = true;
      }
    }
  }

  // ===================================
  // FILE: extension/content/entry.js
  // ===================================
  class SEOTagScanner {
    constructor() {
      this.rules = [
        new TitleRule(),
        new DescriptionRule(),
        new RobotsRule(),
        new CanonicalRule(),
        new OpenGraphRule(),
        new ViewportRule(),
        new FaviconRule(),
        new LanguageRule(),
        new HeadingsRule(),
        new ImagesRule(),
        new DuplicatesRule(),
        new StructuredDataRule(),
      ];
    }
    scan() {
      const result = {
        url: location.href.split("?")[0].split("#")[0],
        timestamp: new Date().toISOString(),
        summary: { errors: 0, warnings: 0 },
        head: { errors: [], warnings: [], tags: [] },
        body: { errors: [], warnings: [] },
        duplicates: [],
        images: [],
      };

      this.rules.forEach((rule) => rule.run(document, result));
      result.summary.errors = result.head.errors.length + result.body.errors.length;
      result.summary.warnings = result.head.warnings.length + result.body.warnings.length;
      return result;
    }
  }

  const scanner = new SEOTagScanner();

  function performScan() {
    const result = scanner.scan();
    Highlighter.apply(result);

    // Send result to background script
    chrome.runtime.sendMessage({
      action: "scanComplete",
      data: result,
    });

    console.log("[SEO Tag Inspector] Scan completed:", result.summary);
  }

  // ===================================
  // FILE: extension/highlighter/index.js
  // ===================================
  class Highlighter {
    static apply(result) {
      result.duplicates.forEach((d) => {
        document
          .querySelectorAll(`meta[property="${d.name}"], meta[name="${d.name}"]`)
          .forEach((el) => {
            if ((el.getAttribute("content") || el.getAttribute("href")) === d.value) {
              el.style.outline = "4px solid #ff006e";
              el.style.background = "rgba(255,0,110,0.1)";
            }
          });
      });
    }
  }

  // ===================================
  // AUTO RUN + SCAN LISTENER
  // ===================================
  performScan();

  chrome.runtime.onMessage.addListener((msg, sender, respond) => {
    if (msg.action === "runScan") {
      performScan();
      respond({ success: true });
    }
    return true;
  });
})();
