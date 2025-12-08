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
