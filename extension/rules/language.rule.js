// ./rules/language.rule.js
class LanguageRule {
  run(doc, result) {
    const lang = doc.documentElement.getAttribute("lang");
    if (!lang) {
      result.head.warnings.push({
        title: "Missing lang attribute",
        desc: 'Add <html lang="vi"> or en, ja...',
      });
    } else {
      result.head.tags.push({ type: "html", name: "lang", value: lang });
    }
  }
}
