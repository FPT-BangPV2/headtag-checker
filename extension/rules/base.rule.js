class BaseRule {
  addTag(result, type, name, value, href = "") {
    result.head.tags.push({ type, name, value: value?.trim() || "", href });
  }
}
