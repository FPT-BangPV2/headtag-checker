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
