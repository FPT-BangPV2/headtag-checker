class Highlighter {
  static apply(result) {
    result.duplicates.forEach((d) => {
      document
        .querySelectorAll(`meta[property="${d.name}"], meta[name="${d.name}"]`)
        .forEach((el) => {
          if ((el.getAttribute("content") || el.getAttribute("href")) === d.value) {
            el.style.outline = "4px solid #ff006e";
            el.style.background = "rgba(255,0,110,0.1)";
          }
        });
    });
  }
}
