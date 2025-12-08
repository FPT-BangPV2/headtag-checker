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
