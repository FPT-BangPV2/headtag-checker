// ./rules/structuredData.rule.js
class StructuredDataRule {
  run(doc, result) {
    const hasJsonLd = doc.querySelector('script[type="application/ld+json"]');
    if (!hasJsonLd) {
      result.head.warnings.push({
        title: "Missing Structured Data (JSON-LD)",
        desc: "Increase chances of Rich Results",
        tag: "img",
        display: shortName,
        elementKey: key,
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
