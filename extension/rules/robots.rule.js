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
          display: content,
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
        tag: "meta",
        display: "meta:robots",
        elementKey: "meta:robots",
        suggestion: 'Add <meta name="robots" content="index, follow"> if needed.',
        reference: "https://developers.google.com/search/docs/advanced/robots/robots_meta_tag",
      });
    }
  }
}
