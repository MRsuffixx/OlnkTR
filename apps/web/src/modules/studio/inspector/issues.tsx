"use client";

import { useTranslations } from "next-intl";
import { createContext, use, useDeferredValue, useMemo, type ReactNode } from "react";
import { validateProfileDocument, type DocumentIssue } from "@olnktr/validators";
import { useStudio } from "../store/context";

/**
 * Live publish validation. The same validator the server runs on publish
 * (`validateProfileDocument`) runs here on a deferred copy of the draft, so
 * field errors appear while typing without blocking input.
 */
const IssuesContext = createContext<Map<string, DocumentIssue[]>>(new Map());

export function IssuesProvider({ children }: { children: ReactNode }) {
  const doc = useStudio((state) => state.doc);
  const deferred = useDeferredValue(doc);
  const issues = useMemo(() => {
    const map = new Map<string, DocumentIssue[]>();
    for (const issue of validateProfileDocument(deferred)) {
      map.set(issue.target, [...(map.get(issue.target) ?? []), issue]);
    }
    return map;
  }, [deferred]);
  return <IssuesContext value={issues}>{children}</IssuesContext>;
}

export function useIssues() {
  return use(IssuesContext);
}

export function useIssueCount() {
  const issues = useIssues();
  let count = 0;
  for (const list of issues.values()) count += list.length;
  return count;
}

/** Returns a translated message for the first issue at `path` of `target`. */
export function useFieldError() {
  const issues = useIssues();
  const t = useTranslations("studio.issues");
  return (target: string, path: string): string | null => {
    const issue = issues
      .get(target)
      ?.find((item) => item.path === path || item.path.startsWith(`${path}.`));
    if (!issue) return null;
    switch (issue.code) {
      case "too_small":
      case "invalid_type":
        return t("required");
      case "too_big":
        return t("tooLong");
      case "invalid_format":
        return path.endsWith("url") || path.endsWith("href") || path.endsWith("src")
          ? t("invalidUrl")
          : t("invalidFormat");
      case "invalid_value":
        return t("invalidValue");
      default:
        return issue.message;
    }
  };
}
