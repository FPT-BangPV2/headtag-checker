(function () {
  "use strict";

  // ===================================
  // FILE: extension/rules/base.rule.js
  // ===================================
  class BaseRule {
    constructor() {
      this.severityMap = {
        error: "error", // Critical: Must fix, affects indexing or core functionality.
        warning: "warning", // Optimization: Recommended, affects performance or best practices.
      };
    }

    // Standardized push method for consistency.
    pushIssue(result, section, severity, issue) {
      const group = severity === this.severityMap.error ? "errors" : "warnings";
      result[section][group].push({
        ...issue,
        severity,
        suggestion: issue.suggestion || "Follow Google SEO guidelines.",
        reference: issue.reference || "https://developers.google.com/search/docs",
      });
    }

    addTag(result, type, name, value, href = "") {
      result.head.tags.push({ type, name, value: value?.trim() || "", href });
    }

    // Each rule must implement run(doc, result)
    run() {
      throw new Error("Rule must implement run method.");
    }
  }

  // ===================================
  // FILE: extension/rules/title.rule.js
  // ===================================
  class TitleRule extends BaseRule {
    run(doc, result) {
      const metaTitle = doc.querySelector("title");
      if (!metaTitle || !metaTitle.textContent.trim()) {
        this.pushIssue(result, "head", this.severityMap.error, {
          title: "Missing <title> tag",
          desc: "The title tag is crucial for SEO as it defines the page title in search results.",
          tag: "title",
          elementKey: "title",
          suggestion: "Add <title>Your Page Title</title> with 10-70 characters.",
          reference: "https://developers.google.com/search/docs/appearance/title-link",
        });
      } else {
        const text = metaTitle.textContent.trim();
        this.addTag(result, "title", "title", text);

        if (text.length < 10) {
          this.pushIssue(result, "head", this.severityMap.warning, {
            title: "Title too short",
            desc: "Titles under 10 characters may not effectively describe the page.",
            tag: "title",
            display: text,
            elementKey: "title",
            suggestion: "Extend title to at least 10 characters for better SEO.",
          });
        }
        if (text.length > 70) {
          this.pushIssue(result, "head", this.severityMap.warning, {
            title: "Title too long",
            desc: `${text.length} characters (recommended up to 70).`,
            tag: "title",
            display: text,
            elementKey: "title",
            suggestion: "Shorten title to 70 characters or less.",
          });
        }
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
        this.pushIssue(result, "head", this.severityMap.error, {
          title: "Missing meta description",
          desc: "Description influences click-through rates in SERPs.",
          tag: 'meta name="description"',
          elementKey: "meta:description",
          suggestion:
            'Add <meta name="description" content="Your description here (up to 160 chars)">.',
          reference: "https://developers.google.com/search/docs/appearance/snippet",
        });
      } else {
        const content = metaDescription.content.trim();
        this.addTag(result, "meta", "description", content);
        if (content.length > 160) {
          this.pushIssue(result, "head", this.severityMap.warning, {
            title: "Meta description too long",
            desc: `${content.length} characters (recommended max 160).`,
            tag: 'meta name="description"',
            elementKey: "meta:description",
            suggestion: "Shorten to 160 characters or less.",
          });
        }
      }
    }
  }

  // ===================================
  // FILE: extension/rules/robots.rule.js
  // ===================================
  // ./rules/robots.rule.js
  class RobotsRule extends BaseRule {
    run(doc, result) {
      console.log("RobotsRule result::", result);
      const meta = doc.querySelector('meta[name="robots"]');
      if (meta) {
        const content = meta.content.toLowerCase();
        this.addTag(result, "meta", "robots", content);

        if (content.includes("noindex")) {
          this.pushIssue(result, "head", this.severityMap.error, {
            title: "Noindex directive found",
            desc: "Prevents Google from indexing the page.",
            tag: 'meta name="robots"',
            elementKey: "meta:robots",
            suggestion: "Remove noindex if page should be indexed.",
            reference: "https://developers.google.com/search/docs/advanced/robots/robots_meta_tag",
          });
        }
      } else {
        // Optional: Warn if missing, but robots is not always required
        console.log("no meta", result);
        this.pushIssue(result, "head", this.severityMap.warning, {
          title: "Missing meta robots",
          desc: "Controls crawling and indexing.",
          tag: 'meta name="robots"',
          display: "meta:robots",
          elementKey: "meta:robots",
          suggestion: 'Add <meta name="robots" content="index, follow"> if needed.',
          reference: "https://developers.google.com/search/docs/advanced/robots/robots_meta_tag",
        });
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
        this.pushIssue(result, "head", this.severityMap.warning, {
          title: "Missing canonical URL",
          desc: "Canonical helps prevent duplicate content issues.",
          suggestion: 'Add <link rel="canonical" href="https://example.com/page">.',
          reference:
            "https://developers.google.com/search/docs/advanced/crawling/consolidate-duplicate-urls",
        });
      } else {
        this.addTag(result, "link", "canonical", link.href, link.href);
        const current = location.href.split("?")[0].split("#")[0];
        if (link.href !== current && !link.href.includes(current)) {
          this.pushIssue(result, "head", this.severityMap.warning, {
            title: "Canonical does not match current URL",
            desc: "Mismatch may confuse search engines.",
            suggestion: "Ensure canonical points to the preferred URL.",
          });
        }
      }
    }
  }

  // ===================================
  // FILE: extension/rules/og.rule.js
  // ===================================
  class OpenGraphRule extends BaseRule {
    run(doc, result) {
      const prefix = doc.head.getAttribute("prefix") || "";
      if (!prefix.includes("og: https://ogp.me/ns#")) {
        this.pushIssue(result, "head", this.severityMap.warning, {
          title: "Missing Open Graph prefix",
          desc: "Required for Open Graph protocol.",
          code: '<head prefix="og: https://ogp.me/ns#">',
          tag: "head",
          elementKey: "og:prefix",
          suggestion: "Add prefix attribute to <head>.",
          reference: "https://ogp.me/",
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
          this.pushIssue(result, "head", this.severityMap.warning, {
            title: `Missing ${tag}`,
            desc: "Important for social sharing previews.",
            code: `<meta property="${tag}" content="...">`,
            tag: `meta property="${tag}"`,
            elementKey: tag,
            suggestion: "Add all required OG tags.",
            reference: "https://developers.facebook.com/docs/sharing/webmasters/",
          });
        }
      });
    }
  }

  // ===================================
  // FILE: extension/rules/viewport.rule.js
  // ===================================
  // ./rules/viewport.rule.js
  class ViewportRule extends BaseRule {
    run(doc, result) {
      const meta = doc.querySelector('meta[name="viewport"]');
      if (!meta) {
        this.pushIssue(result, "head", this.severityMap.error, {
          title: "Missing meta viewport",
          desc: "Viewport meta is essential for mobile responsiveness.",
          suggestion: 'Add <meta name="viewport" content="width=device-width, initial-scale=1">.',
          reference:
            "https://developers.google.com/search/mobile-sites/mobile-seo/responsive-design",
        });
      } else {
        this.addTag(result, "meta", "viewport", meta.content);
      }
    }
  }

  // ===================================
  // FILE: extension/rules/favicon.rule.js
  // ===================================
  // ./rules/favicon.rule.js
  class FaviconRule extends BaseRule {
    run(doc, result) {
      console.log("FaviconRule result::", result);

      const hasFavicon = doc.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
      const hasApple = doc.querySelector(
        'link[rel="apple-touch-icon"], link[rel="apple-touch-icon-precomposed"]'
      );
      if (!hasFavicon) {
        this.pushIssue(result, "head", this.severityMap.warning, {
          title: "Missing favicon",
          desc: "Favicon displays on browser tabs and improves brand recognition.",
          tag: "link",
          display: "favicon",
          elementKey: "favicon",
          suggestion: 'Add <link rel="icon" href="favicon.ico"> or similar.',
          reference: "https://developers.google.com/search/docs/appearance/favicon-in-search",
        });
      }
      if (!hasApple) {
        this.pushIssue(result, "head", this.severityMap.warning, {
          title: "Missing apple-touch-icon",
          desc: "Required for iOS devices to display icon on home screen.",
          tag: "link",
          display: "apple-touch-icon",
          elementKey: "apple-touch-icon",
          suggestion: 'Add <link rel="apple-touch-icon" href="apple-touch-icon.png">.',
          reference:
            "https://developers.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html",
        });
      }
    }
  }

  // ===================================
  // FILE: extension/rules/language.rule.js
  // ===================================
  // ./rules/language.rule.js
  class LanguageRule extends BaseRule {
    run(doc, result) {
      console.log("LanguageRule result::", result);

      const lang = doc.documentElement.getAttribute("lang");
      if (!lang) {
        this.pushIssue(result, "head", this.severityMap.warning, {
          title: "Missing lang attribute",
          desc: "Specifies page language for accessibility and SEO.",
          tag: "html",
          elementKey: "html:lang",
          suggestion: 'Add <html lang="en"> or appropriate code.',
          reference:
            "https://developers.google.com/search/docs/advanced/guidelines/language-of-page",
        });
      } else {
        this.addTag(result, "html", "lang", lang);
      }
    }
  }

  // ===================================
  // FILE: extension/rules/headings.rule.js
  // ===================================
  // ./rules/headings.rule.js
  class HeadingsRule extends BaseRule {
    run(doc, result) {
      const h1s = doc.querySelectorAll("h1");
      if (h1s.length === 0) {
        this.pushIssue(result, "body", this.severityMap.error, {
          title: "Missing H1 tag",
          desc: "H1 is important for page structure and SEO.",
          suggestion: "Add one <h1>Main Heading</h1>.",
          reference: "https://developers.google.com/search/docs/appearance/heading-tags",
        });
      }
      if (h1s.length > 1) {
        this.pushIssue(result, "body", this.severityMap.error, {
          title: `Multiple H1 tags (${h1s.length})`,
          desc: "Pages should have only one H1 for clear hierarchy.",
          suggestion: "Use only one H1; downgrade others to H2 or lower.",
        });
      }
      let lastLevel = 0;
      doc.querySelectorAll("h1,h2,h3,h4,h5,h6").forEach((h) => {
        const level = parseInt(h.tagName[1]);
        if (lastLevel > 0 && level > lastLevel + 1) {
          this.pushIssue(result, "body", this.severityMap.warning, {
            title: `Skipped heading level: H${lastLevel} to H${level}`,
            desc: "Headings should follow sequential order for accessibility and SEO.",
            suggestion: "Ensure headings are in order without skips.",
          });
        }
        lastLevel = level;
      });
    }
  }

  // ===================================
  // FILE: extension/rules/images.rule.js
  // ===================================
  // ./rules/images.rule.js
  class ImagesRule extends BaseRule {
    run(doc, result) {
      doc.querySelectorAll("img").forEach((img, index) => {
        const src = img.currentSrc || img.src || "";
        if (!src) return;
        const key = `img:${index}`;
        const shortName = this.shortenUrl(src);
        const hasAlt = img.alt?.trim();
        const hasLazy = img.loading === "lazy" || img.hasAttribute("loading");
        const hasSrcset = img.hasAttribute("srcset");
        const hasWidth = img.hasAttribute("width");
        const hasHeight = img.hasAttribute("height");
        if (!hasAlt) {
          this.pushIssue(result, "body", this.severityMap.warning, {
            title: "Missing alt attribute",
            desc: "Alt text improves accessibility and image SEO.",
            tag: "img",
            display: shortName,
            elementKey: key,
            suggestion: 'Add alt="Descriptive text".',
            reference:
              "https://developers.google.com/search/docs/advanced/guidelines/google-images",
          });
        }
        if (!hasLazy && !src.includes("data:")) {
          this.pushIssue(result, "body", this.severityMap.warning, {
            title: 'Missing loading="lazy"',
            desc: "Lazy loading improves page speed.",
            tag: "img",
            display: shortName,
            elementKey: key,
            suggestion: 'Add loading="lazy" to offscreen images.',
            reference: "https://developers.google.com/search/docs/appearance/lazy-loading",
          });
        }
        if (!hasSrcset) {
          this.pushIssue(result, "body", this.severityMap.warning, {
            title: "Missing srcset attribute",
            desc: "Srcset enables responsive images.",
            tag: "img",
            display: shortName,
            elementKey: key,
            suggestion: "Add srcset with different resolutions.",
            reference: "https://developers.google.com/search/docs/appearance/responsive-images",
          });
        }
        if (!hasWidth || !hasHeight) {
          this.pushIssue(result, "body", this.severityMap.warning, {
            title: "Missing width or height",
            desc: "Prevents layout shifts (CLS score).",
            tag: "img",
            display: shortName,
            elementKey: key,
            suggestion: "Add width and height attributes.",
            reference: "https://developers.google.com/search/docs/appearance/core-web-vitals",
          });
        }
        // Collect images for potential export
        result.images.push(shortName);
      });
    }
    shortenUrl(url) {
      try {
        const ur = new URL(url);
        const parts = ur.pathname.split("/");
        return parts.slice(-2).join("/");
      } catch {
        return url.split("/").pop() || url;
      }
    }
  }

  // ===================================
  // FILE: extension/rules/duplicates.rule.js
  // ===================================
  // ./rules/duplicates.rule.js
  class DuplicatesRule extends BaseRule {
    run(doc, result) {
      const seen = new Map();

      doc.querySelectorAll('meta[name], meta[property], link[rel="canonical"]').forEach((el) => {
        const key =
          el.getAttribute("name") || el.getAttribute("property") || el.getAttribute("rel");
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

  // ===================================
  // FILE: extension/rules/structuredData.rule.js
  // ===================================
  class StructuredDataRule extends BaseRule {
    run(doc, result) {
      const hasJsonLd = doc.querySelector('script[type="application/ld+json"]');
      if (!hasJsonLd) {
        this.pushIssue(result, "head", this.severityMap.warning, {
          title: "Missing Structured Data (JSON-LD)",
          desc: "Enhances search results with rich snippets.",
          suggestion: 'Add <script type="application/ld+json">{...}</script>.',
          reference:
            "https://developers.google.com/search/docs/advanced/structured-data/intro-structured-data",
        });
      } else {
        this.addTag(result, "script", "application/ld+json", "Present");
        // Optionally parse and validate, but keep simple for now
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

  // Listen for messages from popup/background
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === "runScan") {
      performScan();
      sendResponse({ success: true });
    }
  });

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
