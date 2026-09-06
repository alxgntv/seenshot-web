// ─── Ariadne's Thread [AT-0520] ─────────────────────
// What: Expand the landing Compare matrix to Price plus the 96 macOS landscape features
// Why:  The 9-row slice was not the landscape feature list; screenshot and blur apps must score the full map
// Date: 2026-09-05
// Related: [AT-0519] content/landing-compare.ts, [AT-0510] content/blog-screenshot-visual-privacy-apps.ts
// ─────────────────────────────────────────────────────
// ─── Ariadne's Thread [AT-0521] ─────────────────────
// What: Insert a Description row above Price with each product's landscape shape
// Why:  Compare must name capture-and-share, screenshot utility, or desktop redaction before price
// Date: 2026-09-05
// ─── Ariadne's Thread [AT-0522] ─────────────────────
// What: Set SeenShot Compare Description to Fast, Free, Secure Screenshots in Agentic Era
// Why:  The landscape shape line is not the SeenShot description on the landing matrix
// Date: 2026-09-05
// Related: [AT-0521] content/landing-compare.ts, [AT-0521] components/LandingMain.tsx:.compare-desc
// ─────────────────────────────────────────────────────

export type CompareMark = "Yes" | "No" | "—";

// ─── Ariadne's Thread [AT-0532] ─────────────────────
// What: Drop Compare f83 Group policy / MDM and set SeenShot f89, f90, f91, f93 to Yes
// Why:  The selected MDM row is out of the matrix and those four SeenShot dashes must show Yes
// Date: 2026-09-05
// Related: [AT-0530] content/landing-compare.ts, [AT-0523] content/landing-compare.ts, [AT-0533] lib/client/releases.ts:compare
// ─────────────────────────────────────────────────────
// ─── Ariadne's Thread [AT-0534] ─────────────────────
// What: Drop Compare f75 MP4/MOV/GIF video export from the landing matrix
// Why:  That Export & formats row must not appear in the Compare table
// Date: 2026-09-05
// Related: [AT-0532] content/landing-compare.ts, [AT-0530] content/landing-compare.ts
// ─────────────────────────────────────────────────────
// ─── Ariadne's Thread [AT-0536] ─────────────────────
// What: Add Compare Auto Blur group f97-f102 after Price
// Why:  The landscape matrix must list auto-blur sensitive data, faces, phones, passwords, emails, and API keys
// Date: 2026-09-05
// Related: [AT-0534] content/landing-compare.ts, [AT-0484] components/LandingMain.tsx:.bento-card h3, [AT-0485] components/LandingMain.tsx:.bento-card p
// ─────────────────────────────────────────────────────
// ─── Ariadne's Thread [AT-0537] ─────────────────────
// What: Move Compare f77 under Offline after Auto Blur and set SeenShot to Yes
// Why:  All features work without internet and without external APIs must sit where the blur block is visible
// Date: 2026-09-05
// Related: [AT-0536] content/landing-compare.ts, [AT-0530] content/landing-compare.ts
// ─────────────────────────────────────────────────────
// ─── Ariadne's Thread [AT-0538] ─────────────────────
// What: Add Compare AI Agents group f103 one-click export and f104 supported agents
// Why:  The matrix must list one-click export to agents and the LedeAgents support list
// Date: 2026-09-05
// Related: [AT-0537] content/landing-compare.ts, [AT-0451] components/LedeAgents.tsx:LedeAgents, [AT-0488] components/LandingMain.tsx:.bento-card.narrow
// ─────────────────────────────────────────────────────
// ─── Ariadne's Thread [AT-0539] ─────────────────────
// What: Drop Compare rows where SeenShot is a dash and groups with no SeenShot point
// Why:  The matrix must not show SeenShot dashes or empty SeenShot blocks
// Date: 2026-09-05
// Related: [AT-0538] content/landing-compare.ts, [AT-0537] content/landing-compare.ts
// ─────────────────────────────────────────────────────
// ─── Ariadne's Thread [AT-0540] ─────────────────────
// What: Order Compare groups Capture, Auto Blur, AI Agents, Offline, then the rest
// Why:  The selected first four blocks must sit in that sequence after Price
// Date: 2026-09-05
// Related: [AT-0539] content/landing-compare.ts, [AT-0538] content/landing-compare.ts
// ─────────────────────────────────────────────────────
// ─── Ariadne's Thread [AT-0542] ─────────────────────
// What: Rename Compare Platform & UX to Platform and add MacOS Arm, MacOS x86, Windows
// Why:  The last group must name the shipped Mac chips and Windows in development, not a generic desktop-apps row
// Date: 2026-09-05
// Related: [AT-0540] content/landing-compare.ts, [AT-0541] frontend→components/LandingMain.tsx:.compare-agents
// ─────────────────────────────────────────────────────
export type LandingCompareFeatureKey = "description" | "price" | "f01" | "f02" | "f03" | "f06" | "f08" | "f09" | "f97" | "f98" | "f99" | "f100" | "f101" | "f102" | "f103" | "f104" | "f77" | "f18" | "f19" | "f20" | "f23" | "f24" | "f32" | "f36" | "f37" | "f38" | "f40" | "f43" | "f44" | "f47" | "f49" | "f50" | "f53" | "f57" | "f58" | "f59" | "f82" | "f84" | "f88" | "f89" | "f90" | "f91" | "f92" | "f105" | "f106" | "f93";

export type LandingCompareFeature = {
  key: LandingCompareFeatureKey;
  label: string;
  group: string | null;
};

export type LandingCompareProduct = {
  id: string;
  name: string;
  sourceLabel: string;
  sourceHref: string;
  cells: Record<LandingCompareFeatureKey, string>;
};

export const landingCompareFeatures: LandingCompareFeature[] = [
  { key: "description", label: "Description", group: null },
  { key: "price", label: "Price", group: null },
  { key: "f01", label: "Full screen, window, and region capture", group: "Capture" },
  { key: "f02", label: "Scrolling / panoramic capture of long pages", group: "Capture" },
  { key: "f03", label: "Repeat last region and fixed-size capture", group: "Capture" },
  { key: "f06", label: "All-in-one capture mode behind one shortcut", group: "Capture" },
  { key: "f08", label: "Color picker, ruler and pixel-measure utilities", group: "Capture" },
  { key: "f09", label: "Webcam and camera capture alongside screen", group: "Capture" },
  { key: "f97", label: "Auto-blur sensitive data", group: "Auto Blur" },
  { key: "f98", label: "Auto-blur faces", group: "Auto Blur" },
  { key: "f99", label: "Auto-blur phone numbers", group: "Auto Blur" },
  { key: "f100", label: "Auto-blur passwords", group: "Auto Blur" },
  { key: "f101", label: "Auto-blur emails", group: "Auto Blur" },
  { key: "f102", label: "Auto-blur API keys", group: "Auto Blur" },
  { key: "f103", label: "One-click export to agents", group: "AI Agents" },
  { key: "f104", label: "Supported agents", group: "AI Agents" },
  { key: "f77", label: "All features work without internet and without external APIs", group: "Offline" },
  { key: "f18", label: "Arrows, shapes, lines and freehand pen", group: "Annotation" },
  { key: "f19", label: "Text, callouts and speech bubbles", group: "Annotation" },
  { key: "f20", label: "Highlighter and numbered step tool", group: "Annotation" },
  { key: "f23", label: "Styles, favorites and per-tool presets", group: "Annotation" },
  { key: "f24", label: "Smart move / object-aware rearrange", group: "Annotation" },
  { key: "f32", label: "Backgrounds, gradients, padding and alignment", group: "Beautification & presentation" },
  { key: "f36", label: "On-device OCR text extraction from captures", group: "OCR & content intelligence" },
  { key: "f37", label: "Searchable text across capture library", group: "OCR & content intelligence" },
  { key: "f38", label: "Scrolling-text capture and table extraction", group: "OCR & content intelligence" },
  { key: "f40", label: "AI detection of faces, plates, IDs, QR codes", group: "OCR & content intelligence" },
  { key: "f43", label: "Gaussian blur, mosaic/pixelation, solid bars", group: "Privacy & redaction" },
  { key: "f44", label: "Emoji cover, watermark overlays, color choices", group: "Privacy & redaction" },
  { key: "f47", label: "Auto-detect PII: emails, names, phones, addresses, accounts", group: "Privacy & redaction" },
  { key: "f49", label: "Face and license-plate detection, group photos", group: "Privacy & redaction" },
  { key: "f50", label: "Video redaction with object tracking", group: "Privacy & redaction" },
  { key: "f53", label: "Hotkeys for every capture and action", group: "Automation & workflows" },
  { key: "f57", label: "Watched folders and scheduled capture", group: "Automation & workflows" },
  { key: "f58", label: "CLI / scripting hooks", group: "Automation & workflows" },
  { key: "f59", label: "Instant shareable link with hosted upload", group: "Sharing & collaboration" },
  { key: "f82", label: "Centralized license and seat management", group: "Team & admin" },
  { key: "f84", label: "Role-based permissions and domain control", group: "Team & admin" },
  { key: "f88", label: "Native performance on Apple Silicon / low memory", group: "Performance & reliability" },
  { key: "f89", label: "GPU-accelerated capture and encode", group: "Performance & reliability" },
  { key: "f90", label: "Auto-updates (notarized, Sparkle-style)", group: "Performance & reliability" },
  { key: "f91", label: "Crash recovery of unsaved captures", group: "Performance & reliability" },
  { key: "f92", label: "MacOS Arm", group: "Platform" },
  { key: "f105", label: "MacOS x86", group: "Platform" },
  { key: "f106", label: "Windows – in development", group: "Platform" },
  { key: "f93", label: "Menu-bar quick access and onboarding", group: "Platform" },
];


// ─── Ariadne's Thread [AT-0530] ─────────────────────
// What: Drop Commercial & packaging f94-f96 from the landing Compare matrix
// Why:  Plan packaging is already in the Price row and is out of this landscape feature list
// Date: 2026-09-05
// Related: [AT-0529] content/landing-compare.ts, [AT-0521] components/LandingMain.tsx:.compare-section
// ─────────────────────────────────────────────────────
export const landingCompareProducts: LandingCompareProduct[] = [
// ─── Ariadne's Thread [AT-0523] ─────────────────────
// What: Set SeenShot Compare f03, f23, and f24 to Yes
// Why:  Those three dashes on the landing matrix must show Yes
// Date: 2026-09-05
// Related: [AT-0521] content/landing-compare.ts, [AT-0522] content/landing-compare.ts
// ─────────────────────────────────────────────────────
// ─── Ariadne's Thread [AT-0524] ─────────────────────
// What: Replace semicolons in Compare Price cells with commas
// Why:  Visible Compare copy must not contain the ; character
// Date: 2026-09-05
// Related: [AT-0523] content/landing-compare.ts, [AT-0521] components/LandingMain.tsx:.compare-section
// ─────────────────────────────────────────────────────
// ─── Ariadne's Thread [AT-0545] ─────────────────────
// What: Drop Member from the SeenShot Compare Price cell
// Why:  The matrix price line must read Free, $29/year, Lifetime $87
// Date: 2026-09-05
// Related: [AT-0524] content/landing-compare.ts, [AT-0520] content/landing-compare.ts
// ─────────────────────────────────────────────────────
  {
    id: "seenshot",
    name: "SeenShot",
    sourceLabel: "seenshot.app",
    sourceHref: "https://seenshot.app/",
    cells: {
      description: "Fast, Free, Secure Screenshots in Agentic Era",
      price: "Free, $29/year, Lifetime $87",
      f97: "Yes",
      f98: "Yes",
      f99: "Yes",
      f100: "Yes",
      f101: "Yes",
      f102: "Yes",
      f103: "Yes",
      f104: "Claude, Claude Code, ChatGPT, Codex, Cursor, Hermes, OpenClaw, Grok Bot, OpenCode, and Pi",
      f01: "Yes",
      f02: "No",
      f03: "Yes",
      f06: "Yes",
      f08: "Yes",
      f09: "Yes",
      f18: "Yes",
      f19: "Yes",
      f20: "Yes",
      f23: "Yes",
      f24: "Yes",
      f32: "Yes",
      f36: "No",
      f37: "No",
      f38: "No",
      f40: "Yes",
      f43: "Yes",
      f44: "Yes",
      f47: "Yes",
      f49: "Yes",
      f50: "No",
      f53: "Yes",
      f57: "No",
      f58: "No",
      f59: "Yes",
      f77: "Yes",
      f82: "Yes",
      f84: "Yes",
      f88: "Yes",
      f89: "Yes",
      f90: "Yes",
      f91: "Yes",
      f92: "Yes",
      f105: "Yes",
      f106: "Yes",
      f93: "Yes",
    },
  },
  {
    id: "zight",
    name: "Zight",
    sourceLabel: "zight.com",
    sourceHref: "https://zight.com/pricing",
    cells: {
      description: "Capture-and-share",
      price: "Free, Create $9.95/user/mo billed annually",
      f97: "—",
      f98: "—",
      f99: "—",
      f100: "—",
      f101: "—",
      f102: "—",
      f103: "—",
      f104: "—",
      f01: "Yes",
      f02: "Yes",
      f03: "—",
      f06: "—",
      f08: "—",
      f09: "—",
      f18: "Yes",
      f19: "Yes",
      f20: "Yes",
      f23: "—",
      f24: "—",
      f32: "—",
      f36: "—",
      f37: "Yes",
      f38: "—",
      f40: "—",
      f43: "Yes",
      f44: "—",
      f47: "—",
      f49: "—",
      f50: "—",
      f53: "—",
      f57: "—",
      f58: "—",
      f59: "Yes",
      f77: "No",
      f82: "Yes",
      f84: "Yes",
      f88: "Yes",
      f89: "—",
      f90: "—",
      f91: "—",
      f92: "Yes",
      f105: "Yes",
      f106: "—",
      f93: "—",
    },
  },
  {
    id: "droplr",
    name: "Droplr",
    sourceLabel: "droplr.com",
    sourceHref: "https://droplr.com/pricing",
    cells: {
      description: "Capture-and-share",
      price: "Pro Plus $6/mo billed annually ($72/year)",
      f97: "Yes",
      f98: "—",
      f99: "Yes",
      f100: "—",
      f101: "Yes",
      f102: "—",
      f103: "—",
      f104: "—",
      f01: "Yes",
      f02: "—",
      f03: "—",
      f06: "—",
      f08: "—",
      f09: "—",
      f18: "Yes",
      f19: "—",
      f20: "—",
      f23: "—",
      f24: "—",
      f32: "—",
      f36: "—",
      f37: "—",
      f38: "—",
      f40: "—",
      f43: "Yes",
      f44: "—",
      f47: "Yes",
      f49: "—",
      f50: "—",
      f53: "—",
      f57: "—",
      f58: "—",
      f59: "Yes",
      f77: "No",
      f82: "Yes",
      f84: "Yes",
      f88: "—",
      f89: "—",
      f90: "—",
      f91: "—",
      f92: "Yes",
      f105: "Yes",
      f106: "—",
      f93: "—",
    },
  },
  {
    id: "gyazo",
    name: "Gyazo",
    sourceLabel: "gyazo.com",
    sourceHref: "https://gyazo.com/pricing",
    cells: {
      description: "Capture-and-share",
      price: "Free, Pro $5.99/mo billed yearly ($71.88/year)",
      f97: "—",
      f98: "—",
      f99: "—",
      f100: "—",
      f101: "—",
      f102: "—",
      f103: "—",
      f104: "—",
      f01: "Yes",
      f02: "—",
      f03: "—",
      f06: "—",
      f08: "—",
      f09: "—",
      f18: "Yes",
      f19: "—",
      f20: "—",
      f23: "—",
      f24: "—",
      f32: "Yes",
      f36: "Yes",
      f37: "Yes",
      f38: "—",
      f40: "—",
      f43: "—",
      f44: "—",
      f47: "—",
      f49: "—",
      f50: "—",
      f53: "—",
      f57: "—",
      f58: "—",
      f59: "Yes",
      f77: "No",
      f82: "—",
      f84: "—",
      f88: "—",
      f89: "—",
      f90: "—",
      f91: "—",
      f92: "Yes",
      f105: "Yes",
      f106: "—",
      f93: "—",
    },
  },
  {
    id: "loom",
    name: "Loom",
    sourceLabel: "loom.com",
    sourceHref: "https://loom.com/pricing",
    cells: {
      description: "Capture-and-share",
      price: "Starter $0, Business $18/user/mo",
      f97: "—",
      f98: "—",
      f99: "—",
      f100: "—",
      f101: "—",
      f102: "—",
      f103: "—",
      f104: "—",
      f01: "Yes",
      f02: "—",
      f03: "—",
      f06: "—",
      f08: "—",
      f09: "—",
      f18: "Yes",
      f19: "—",
      f20: "—",
      f23: "—",
      f24: "—",
      f32: "Yes",
      f36: "—",
      f37: "—",
      f38: "—",
      f40: "—",
      f43: "Yes",
      f44: "—",
      f47: "—",
      f49: "—",
      f50: "—",
      f53: "—",
      f57: "—",
      f58: "—",
      f59: "Yes",
      f77: "No",
      f82: "Yes",
      f84: "Yes",
      f88: "—",
      f89: "—",
      f90: "—",
      f91: "—",
      f92: "Yes",
      f105: "Yes",
      f106: "—",
      f93: "—",
    },
  },
  {
    id: "cleanshot",
    name: "CleanShot",
    sourceLabel: "cleanshot.com",
    sourceHref: "https://cleanshot.com/pricing",
    cells: {
      description: "Screenshot utility",
      price: "Basic $35 once, Pro $10/user/mo billed annually",
      f97: "No",
      f98: "No",
      f99: "No",
      f100: "No",
      f101: "No",
      f102: "No",
      f103: "—",
      f104: "—",
      f01: "Yes",
      f02: "—",
      f03: "—",
      f06: "—",
      f08: "—",
      f09: "—",
      f18: "Yes",
      f19: "—",
      f20: "—",
      f23: "—",
      f24: "—",
      f32: "—",
      f36: "Yes",
      f37: "—",
      f38: "—",
      f40: "—",
      f43: "Yes",
      f44: "—",
      f47: "No",
      f49: "—",
      f50: "—",
      f53: "—",
      f57: "—",
      f58: "—",
      f59: "Yes",
      f77: "Yes",
      f82: "Yes",
      f84: "Yes",
      f88: "Yes",
      f89: "—",
      f90: "Yes",
      f91: "—",
      f92: "Yes",
      f105: "Yes",
      f106: "—",
      f93: "—",
    },
  },
  {
    id: "shottr",
    name: "Shottr",
    sourceLabel: "shottr.cc",
    sourceHref: "https://shottr.cc",
    cells: {
      description: "Screenshot utility",
      price: "Free (license on shottr.cc)",
      f97: "—",
      f98: "—",
      f99: "—",
      f100: "—",
      f101: "—",
      f102: "—",
      f103: "—",
      f104: "—",
      f01: "Yes",
      f02: "—",
      f03: "—",
      f06: "—",
      f08: "Yes",
      f09: "—",
      f18: "Yes",
      f19: "—",
      f20: "Yes",
      f23: "—",
      f24: "—",
      f32: "—",
      f36: "Yes",
      f37: "—",
      f38: "—",
      f40: "Yes",
      f43: "Yes",
      f44: "—",
      f47: "—",
      f49: "—",
      f50: "—",
      f53: "Yes",
      f57: "—",
      f58: "—",
      f59: "—",
      f77: "—",
      f82: "—",
      f84: "—",
      f88: "Yes",
      f89: "—",
      f90: "Yes",
      f91: "—",
      f92: "Yes",
      f105: "Yes",
      f106: "—",
      f93: "Yes",
    },
  },
  {
    id: "blurdata",
    name: "BlurData",
    sourceLabel: "blurdata.app",
    sourceHref: "https://blurdata.app",
    cells: {
      description: "Desktop redaction",
      price: "Personal $79/year or $149 once",
      f97: "Yes",
      f98: "Yes",
      f99: "Yes",
      f100: "—",
      f101: "Yes",
      f102: "—",
      f103: "—",
      f104: "—",
      f01: "No",
      f02: "No",
      f03: "—",
      f06: "—",
      f08: "—",
      f09: "—",
      f18: "No",
      f19: "No",
      f20: "No",
      f23: "—",
      f24: "—",
      f32: "—",
      f36: "Yes",
      f37: "—",
      f38: "—",
      f40: "Yes",
      f43: "Yes",
      f44: "Yes",
      f47: "Yes",
      f49: "Yes",
      f50: "—",
      f53: "—",
      f57: "—",
      f58: "—",
      f59: "No",
      f77: "Yes",
      f82: "Yes",
      f84: "—",
      f88: "Yes",
      f89: "—",
      f90: "Yes",
      f91: "—",
      f92: "Yes",
      f105: "Yes",
      f106: "—",
      f93: "—",
    },
  },
  {
    id: "redacted",
    name: "Redacted",
    sourceLabel: "extforge.com",
    sourceHref: "https://extforge.com/blog/how-to-blur-sensitive-info-screenshots",
    cells: {
      description: "Desktop redaction",
      price: "—",
      f97: "—",
      f98: "—",
      f99: "—",
      f100: "—",
      f101: "—",
      f102: "—",
      f103: "—",
      f104: "—",
      f01: "No",
      f02: "No",
      f03: "—",
      f06: "—",
      f08: "—",
      f09: "—",
      f18: "—",
      f19: "—",
      f20: "—",
      f23: "—",
      f24: "—",
      f32: "—",
      f36: "—",
      f37: "—",
      f38: "—",
      f40: "—",
      f43: "Yes",
      f44: "—",
      f47: "—",
      f49: "—",
      f50: "—",
      f53: "—",
      f57: "—",
      f58: "—",
      f59: "—",
      f77: "—",
      f82: "—",
      f84: "—",
      f88: "—",
      f89: "—",
      f90: "—",
      f91: "—",
      f92: "Yes",
      f105: "Yes",
      f106: "—",
      f93: "—",
    },
  },
];

