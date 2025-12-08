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
