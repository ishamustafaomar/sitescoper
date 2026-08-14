export type ChangelogEntry = {
  id: string;
  date: string; // ISO date
  titleKey: string;
  descKey: string;
};

// Add new big changes at the top. `id` must be stable & unique.
export const CHANGELOG: ChangelogEntry[] = [
  {
    id: "2026-08-14-free-early-access",
    date: "2026-08-14",
    titleKey: "changelog.entries.freeEarlyAccess.title",
    descKey: "changelog.entries.freeEarlyAccess.desc",
  },
  {
    id: "2026-08-14-integration-requests",
    date: "2026-08-14",
    titleKey: "changelog.entries.integrationRequests.title",
    descKey: "changelog.entries.integrationRequests.desc",
  },
  {
    id: "2026-08-14-connections",
    date: "2026-08-14",
    titleKey: "changelog.entries.connections.title",
    descKey: "changelog.entries.connections.desc",
  },
  {
    id: "2026-07-15-multilanguage",
    date: "2026-07-15",
    titleKey: "changelog.entries.multilanguage.title",
    descKey: "changelog.entries.multilanguage.desc",
  },
];

export const LATEST_CHANGELOG_ID = CHANGELOG[0]?.id ?? "";