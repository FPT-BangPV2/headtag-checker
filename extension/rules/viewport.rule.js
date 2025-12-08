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
