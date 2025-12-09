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
