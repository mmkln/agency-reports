export function findValidationIssue(issues, path) {
  return issues.find((issue) => issue.path === path) ?? null
}

export function findValidationIssueMessage(issues, path) {
  return findValidationIssue(issues, path)?.message ?? ''
}

export function findValidationIssuesForPath(issues, path) {
  return issues.filter((issue) => (
    issue.path === path || issue.path.startsWith(`${path}.`)
  ))
}

export function findRequiredMappingIssue(issues, signalKey) {
  return issues.find((issue) => (
    issue.code === 'required_mapping_missing'
    && issue.meta?.signal_key === signalKey
  )) ?? null
}
