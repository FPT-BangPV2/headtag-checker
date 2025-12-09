// utils/csv.js
// Improved: Better headers, grouped by section, more comprehensive (includes suggestions, references).
export function exportCSV(filename, scan) {
  const rows = [];
  rows.push([
    "Section",
    "Type",
    "Name/Property",
    "Value",
    "Issue Title",
    "Description",
    "Suggestion",
    "Reference",
    "Count",
  ]); // Enhanced headers
  // Head Tags
  rows.push(["", "", "", "", "", "Head Tags", "", "", ""]); // Separator
  scan.head.tags
    .sort((a, b) => a.type.localeCompare(b.type))
    .forEach((t) => {
      rows.push(["Head", "Tag", t.type, t.name, t.value, "", "", "", ""]);
    });
  // Duplicates
  rows.push(["", "", "", "", "", "Duplicates", "", "", ""]);
  scan.duplicates.forEach((d) => {
    rows.push([
      "Head/Body",
      "Duplicate",
      d.name,
      d.value,
      "Duplicated",
      "",
      "Remove duplicates",
      "Google Dupe Content Guide",
      d.count,
    ]);
  });
  // Head Errors
  rows.push(["", "", "", "", "", "Head Errors", "", "", ""]);
  scan.head.errors.forEach((i) => {
    rows.push([
      "Head",
      "Error",
      i.tag || "",
      i.display || "",
      i.title,
      i.desc,
      i.suggestion,
      i.reference,
      "",
    ]);
  });
  // Head Warnings
  rows.push(["", "", "", "", "", "Head Warnings", "", "", ""]);
  scan.head.warnings.forEach((w) => {
    rows.push([
      "Head",
      "Warning",
      w.tag || "",
      w.display || "",
      w.title,
      w.desc,
      w.suggestion,
      w.reference,
      "",
    ]);
  });
  // Body Errors
  rows.push(["", "", "", "", "", "Body Errors", "", "", ""]);
  scan.body.errors.forEach((i) => {
    rows.push([
      "Body",
      "Error",
      i.tag || "",
      i.display || "",
      i.title,
      i.desc,
      i.suggestion,
      i.reference,
      "",
    ]);
  });
  // Body Warnings
  rows.push(["", "", "", "", "", "Body Warnings", "", "", ""]);
  scan.body.warnings.forEach((w) => {
    rows.push([
      "Body",
      "Warning",
      w.tag || "",
      w.display || "",
      w.title,
      w.desc,
      w.suggestion,
      w.reference,
      "",
    ]);
  });
  // Images (if any)
  if (scan.images.length) {
    rows.push(["", "", "", "", "", "Images", "", "", ""]);
    scan.images.forEach((img) => {
      rows.push(["Body", "Image", "", img, "", "", "", "", ""]);
    });
  }
  const csvContent = rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
