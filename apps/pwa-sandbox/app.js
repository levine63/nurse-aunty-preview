// Served build: load the compiled engines + data, then hand off to the shared UI (ui-core.js).
import { mountUI } from "./ui-core.js";
import { resolveTriageJourney } from "../../packages/core/src/triageJourney.js";
function fail(m) { var s = document.getElementById("status"); if (s) { s.textContent = m; s.style.color = "#b3261e"; } console.error(m); }
if (typeof window !== "undefined") {
  window.addEventListener("error", function (e) { fail("Script error: " + (e.message || e.error)); });
  window.addEventListener("unhandledrejection", function (e) { fail("Load error: " + (e.reason && e.reason.message ? e.reason.message : e.reason)); });
}
(async function () {
  try {
    const [rules, calc, ors] = await Promise.all([
      import("../../modules/triage/generated/rules.gen.js"),
      import("../../modules/triage/generated/calc.gen.js"),
      import("../../modules/ors-voucher/generated/rules.gen.js"),
    ]);
    const grab = async (u) => { const r = await fetch(u); if (!r.ok) throw new Error(u + " → " + r.status); return r.json(); };
    const [pack, phraseDoc, containerDoc, featureCatalog, toolCards, storyCards, playerDecks, screenCards, clinicalScreens, guidanceComparisons, assetManifest, assetApprovalRegister, northIndiaMediaPack, chwQualityStandards, moduleContracts, moduleRegistry, progressTrackers, triagePredicateTable] = await Promise.all([
      grab("../../guidelines/bd-2012.json"), grab("../../i18n/phrase_bank.json"), grab("../../config/containers.json"),
      grab("../../content/feature_catalog.json"), grab("../../content/tool_cards.json"), grab("../../content/story_cards.json"),
      grab("../../content/player_decks.json"), grab("../../content/screen_cards.json"), grab("../../content/clinical_screens.json"), grab("../../content/guidance_comparisons.json"), grab("../../content/asset_manifest.json"),
      grab("../../content/asset_approval_register.json"), grab("../../content/media_packs/north_india_prototype.json"), grab("../../content/chw_quality_standards.json"), grab("../../content/module_contracts.json"), grab("../../content/module_registry.json"), grab("../../content/progress_trackers.json"), grab("../../modules/triage/ir/predicates.json"),
    ]);
    const screenClinicalIr = Object.fromEntries(await Promise.all((screenCards.cards || [])
      .filter((card) => card.clinicalVariableSet)
      .map(async (card) => [card.featureId, {
        predicates: await grab("../../modules/generated-screen-ir/" + card.featureId + "/ir/predicates.json"),
        decisions: await grab("../../modules/generated-screen-ir/" + card.featureId + "/ir/decisions.json"),
      }])));
    let activeLocale = "en";
    mountUI({
      triageEval: rules.evaluate, derive: calc.derive, orsGate: ors.evaluate,
      resolveTriageJourney,
      gd: { version: pack.version, get: (p) => p.split(".").reduce((o, k) => (o == null ? undefined : o[k]), pack) },
      t: (s) => {
        const phrase = phraseDoc.phrases[s];
        const localized = phrase && phrase[activeLocale] && phrase[activeLocale].text;
        return localized || (phrase && phrase.en ? phrase.en.text : s);
      },
      setLocale: (locale) => { activeLocale = phraseDoc.locales.includes(locale) ? locale : "en"; },
      phraseBank: phraseDoc,
      orsContainers: containerDoc.containers.filter((c) => c.kind === "ors"),
      malariaRegion: !!(pack.malaria && (pack.malaria.testing_relevant || pack.malaria.region)),
      featureCatalog,
      toolCards,
      storyCards,
      playerDecks,
      screenCards,
      clinicalScreens,
      guidanceComparisons,
      assetManifest,
      assetApprovalRegister,
      mediaPacks: { packs: [northIndiaMediaPack] },
      chwQualityStandards,
      moduleContracts,
      moduleRegistry,
      progressTrackers,
      triagePredicateTable,
      screenClinicalIr,
    });
  } catch (e) { fail("Could not load engine (" + e.message + "). Serve from the repo root: node tools/serve.mjs"); }
})();
