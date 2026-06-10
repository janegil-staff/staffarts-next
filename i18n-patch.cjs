// i18n-patch.cjs
//
// Idempotent translation patcher — the Staff Arts convention. Run with Node:
//   node i18n-patch.cjs
//
// Add new keys to the NEW_STRINGS map below, providing all 12 languages for
// each key. The script merges them into src/i18n/locales/<lang>.json WITHOUT
// overwriting any key that already exists. Safe to run repeatedly.
//
// Rule (project-wide): every user-facing string must be added to ALL 12
// languages — never a subset. The validation step at the end will refuse to
// write if any key is missing a language.

const fs = require("fs");
const path = require("path");

const LANGS = ["no", "en", "nl", "fr", "de", "it", "sv", "da", "fi", "es", "pl", "pt"];
const LOCALES_DIR = path.join(__dirname, "src", "i18n", "locales");

// ── Add new strings here. Each key needs an entry for every language. ──────
// Example:
// const NEW_STRINGS = {
//   shareWork: {
//     no: "Del verket", en: "Share work", nl: "Werk delen", fr: "Partager l'œuvre",
//     de: "Werk teilen", it: "Condividi opera", sv: "Dela verk", da: "Del værk",
//     fi: "Jaa teos", es: "Compartir obra", pl: "Udostępnij pracę", pt: "Partilhar obra",
//   },
// };
const NEW_STRINGS = {};

function validate(strings) {
  const problems = [];
  for (const [key, byLang] of Object.entries(strings)) {
    for (const lang of LANGS) {
      if (byLang[lang] == null || byLang[lang] === "") {
        problems.push(`  "${key}" is missing language "${lang}"`);
      }
    }
  }
  if (problems.length) {
    console.error("Refusing to patch — incomplete translations:\n" + problems.join("\n"));
    process.exit(1);
  }
}

function run() {
  if (Object.keys(NEW_STRINGS).length === 0) {
    console.log("No new strings to add. Edit NEW_STRINGS in i18n-patch.cjs.");
    return;
  }
  validate(NEW_STRINGS);

  let totalAdded = 0;
  for (const lang of LANGS) {
    const file = path.join(LOCALES_DIR, `${lang}.json`);
    const dict = JSON.parse(fs.readFileSync(file, "utf8"));
    let added = 0;
    for (const [key, byLang] of Object.entries(NEW_STRINGS)) {
      if (!(key in dict)) {
        dict[key] = byLang[lang];
        added++;
      }
    }
    // Keep keys sorted for clean diffs.
    const sorted = {};
    Object.keys(dict)
      .sort()
      .forEach((k) => {
        sorted[k] = dict[k];
      });
    fs.writeFileSync(file, JSON.stringify(sorted, null, 2) + "\n", "utf8");
    totalAdded += added;
    console.log(`${lang}.json: +${added} keys`);
  }
  console.log(`Done. Added ${totalAdded} key/value pairs across ${LANGS.length} files.`);
}

run();
