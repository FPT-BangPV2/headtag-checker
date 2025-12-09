// ./rules/favicon.rule.js
class FaviconRule extends BaseRule {
  run(doc, result) {
    console.log("FaviconRule result::", result);

    const hasFavicon = doc.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
    const hasApple = doc.querySelector(
      'link[rel="apple-touch-icon"], link[rel="apple-touch-icon-precomposed"]'
    );
    if (!hasFavicon) {
      this.pushIssue(result, "head", this.severityMap.warning, {
        title: "Missing favicon",
        desc: "Favicon displays on browser tabs and improves brand recognition.",
        tag: "link",
        display: "favicon",
        elementKey: "favicon",
        suggestion: 'Add <link rel="icon" href="favicon.ico"> or similar.',
        reference: "https://developers.google.com/search/docs/appearance/favicon-in-search",
      });
    }
    if (!hasApple) {
      this.pushIssue(result, "head", this.severityMap.warning, {
        title: "Missing apple-touch-icon",
        desc: "Required for iOS devices to display icon on home screen.",
        tag: "link",
        display: "apple-touch-icon",
        elementKey: "apple-touch-icon",
        suggestion: 'Add <link rel="apple-touch-icon" href="apple-touch-icon.png">.',
        reference:
          "https://developers.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html",
      });
    }
  }
}
