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
