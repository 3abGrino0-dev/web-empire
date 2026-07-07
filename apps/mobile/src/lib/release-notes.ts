export interface ReleaseNotesEntry {
  version: string;
  channel: "preview" | "production";
  title: string;
  body: string;
  required: boolean;
}

export const releaseNotes: ReleaseNotesEntry[] = [
  {
    version: "1.0.1",
    channel: "preview",
    title: "UI polish and update flow",
    body: "Improved the mobile experience with stronger visual hierarchy, safer update checks, and more polished settings.",
    required: false,
  },
  {
    version: "1.0.0",
    channel: "production",
    title: "Web Empire mobile launch",
    body: "Initial mobile release with secure session handling, tools, wallet, and settings.",
    required: false,
  },
];

export const currentReleaseNote = releaseNotes[0];
