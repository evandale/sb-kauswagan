/* Editable settings. Never put passwords or API keys here. */
window.SBK = window.SBK || {};

SBK.CONFIG = {
  spreadsheetId: "1EhSaEGW4j3s88A3ZJWmLqWdsd7VfTS1NM-u1ReyXQtw", // Sheet must be shared "Anyone with the link: Viewer"
  sheetName: "Documents",
  appsScriptUrl: "",        // Optional Apps Script Web App URL (takes priority; hides Draft rows server-side)
  timeoutMs: 12000,
  cacheKey: "sbk-bulletin-cache-v1",
  cacheFreshMs: 5 * 60 * 1000, // reuse a saved copy this long before asking the Sheet again (shared by all pages)
  showFolderLinks: false,
  folders: { announcements: "", ordinances: "", resolutions: "", publications: "",
             contractsAndMOA: "", publicHearings: "", updates: "" }
};

SBK.SITE = {
  sealUrl: "assets/images/municipal-seal.png", // relative to the site root, or a full https:// URL
  sbLogoUrl: "assets/images/sb-logo.png",
  address: "Municipal Hall, Poblacion, Kauswagan, Lanao del Norte (placeholder)",
  phone: "Tel: (000) 000-0000 (placeholder)",
  email: "sb.kauswagan@example.gov.ph (placeholder)",
  newDays: 30,              // "New" badge window
  previewCount: 3           // items shown per category on the homepage before "View All"
};
