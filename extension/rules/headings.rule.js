// ./rules/headings.rule.js
class HeadingsRule {
  run(doc, result) {
    const h1s = doc.querySelectorAll("h1");
    if (h1s.length === 0) result.body.errors.push({ title: "Thiếu thẻ H1" });
    if (h1s.length > 1)
      result.body.errors.push({ title: `Có ${h1s.length} thẻ H1 (chỉ nên có 1)` });
    let lastLevel = 0;
    doc.querySelectorAll("h1,h2,h3,h4,h5,h6").forEach((h) => {
      const level = parseInt(h.tagName[1]);
      if (lastLevel > 0 && level > lastLevel + 1) {
        result.body.warnings.push({ title: `Bỏ cấp heading: H${lastLevel} → H${level}` });
      }
      lastLevel = level;
    });
  }
}
