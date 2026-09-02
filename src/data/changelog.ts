export type ChangelogEntry = {
  id: string;
  date: string; // ISO date
  titleKey: string;
  descKey: string;
};

// Add new big changes at the top. `id` must be stable & unique.
export const CHANGELOG: ChangelogEntry[] = [
  {
    id: "2026-09-02-trial-and-annual",
    date: "2026-09-02",
    titleKey: "changelog.entries.trialAndAnnual.title",
    descKey: "changelog.entries.trialAndAnnual.desc",
  },
  {
    id: "2026-08-29-new-logo",
    date: "2026-08-29",
    titleKey: "changelog.entries.newLogo.title",
    descKey: "changelog.entries.newLogo.desc",
  },
  {
    id: "2026-08-27-cleaner-reports",
    date: "2026-08-27",
    titleKey: "changelog.entries.cleanerReports.title",
    descKey: "changelog.entries.cleanerReports.desc",
  },
  {
    id: "2026-08-27-editorial-redesign",
    date: "2026-08-27",
    titleKey: "changelog.entries.editorialRedesign.title",
    descKey: "changelog.entries.editorialRedesign.desc",
  },
  {
    id: "2026-08-21-gated-share-links",
    date: "2026-08-21",
    titleKey: "changelog.entries.gatedShareLinks.title",
    descKey: "changelog.entries.gatedShareLinks.desc",
  },
  {

    id: "2026-08-18-pro-paid",
    date: "2026-08-18",
    titleKey: "changelog.entries.proPaid.title",
    descKey: "changelog.entries.proPaid.desc",
  },
  {
    id: "2026-07-15-multilanguage",
    date: "2026-07-15",
    titleKey: "changelog.entries.multilanguage.title",
    descKey: "changelog.entries.multilanguage.desc",
  },
];

export const LATEST_CHANGELOG_ID = CHANGELOG[0]?.id ?? "";