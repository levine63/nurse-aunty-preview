// apps/pwa-sandbox/ui-core.js - ONE UI for served (app.js) + single-file (standalone) builds.
// IMCI flow: general danger signs first, then main complaints; follow-ups reveal only when their
// complaint is ticked. All prompt text comes from the phrase bank (engine.t) so it is
// plain-language and translatable. engine = { triageEval, derive, orsGate, gd, t, orsContainers, malariaRegion }.
var FOLLOWUP_IMAGES = {
  chest_indrawing: "Baby's chest with the skin just below the ribs pulling INWARD as the child breathes in.",
  stridor_calm: "Child breathing in with a harsh sound; a small ear icon to show 'listen'.",
  bloody_stool: "Stool with visible red streaks of blood.",
  sunken_eyes: "Two faces side by side: normal eyes vs sunken eyes.",
  skin_pinch_slow: "Fingers pinching belly skin; the skin 'tent' stays up = slow return."
};
var FOLLOWUP_IMAGE_ASSETS = {
  chest_indrawing: "img.user_supplied.chest_indrawing_v1",
  bloody_stool: "img.generated.blood_stool_sample_v1",
  sunken_eyes: "img.user_supplied.sunken_eyes_dehydration_v1",
  skin_pinch_slow: "img.user_supplied.skin_pinch_dehydration_v1"
};
var EXTRA_PRESENTING = [{ id: "ear_problem" }, { id: "tooth_mouth" }, { id: "other_problem" }];
var EAR_FU = [
  { id: "ear_discharge", img: "Child holding ear with a small warning mark for pus or discharge." },
  { id: "ear_swelling_behind", img: "Side view of child with tender swelling behind the ear highlighted." }
];
var DENTAL_FU = [
  { id: "tooth_severe_pain", img: "Child pointing to tooth or mouth pain." },
  { id: "mouth_face_swelling", img: "Face or gum swelling highlighted with a clinic arrow." },
  { id: "mouth_injury_bleeding", img: "Mouth injury or bleeding after a fall, shown without gore." },
  { id: "mouth_breathing_swallowing", img: "Mouth or face swelling with breathing or swallowing warning icon." }
];

function clinicalVariableRegistry(table, subjectScope) {
  var registry = { generalDangerSigns: [], presentingSymptoms: [], followupsBySymptom: {}, measurementsBySymptom: {}, modifiers: [], derived: [] };
  var inputs = (table && table.inputs) || {};
  var applies = function (input) {
    var scopes = input.subjectScopes || [];
    return !scopes.length || scopes.indexOf(subjectScope) >= 0;
  };
  var hasRole = function (input, role) { return (input.clinicalVariableRoles || []).indexOf(role) >= 0; };
  var desc = function (id, input) {
    return {
      id: id,
      type: input.type,
      kind: input.kind,
      label: input.label && input.label.en,
      roles: input.clinicalVariableRoles || [],
      followupFor: input.followupFor || [],
      prototypeAssignment: input.prototypeAssignment
    };
  };
  var pushByParent = function (out, item) {
    for (var i = 0; i < item.followupFor.length; i++) {
      var parent = item.followupFor[i];
      out[parent] = out[parent] || [];
      out[parent].push(item);
    }
  };
  Object.keys(inputs).forEach(function (id) {
    var input = inputs[id];
    if (!applies(input)) return;
    var item = desc(id, input);
    if (hasRole(input, "general_danger_sign")) registry.generalDangerSigns.push(item);
    if (hasRole(input, "presenting_symptom")) registry.presentingSymptoms.push(item);
    if (hasRole(input, "symptom_followup") && input.type === "boolean") pushByParent(registry.followupsBySymptom, item);
    if (hasRole(input, "measurement")) {
      if (item.followupFor.length) pushByParent(registry.measurementsBySymptom, item);
      else registry.modifiers.push(item);
    }
    if (hasRole(input, "modifier")) registry.modifiers.push(item);
    if (hasRole(input, "derived")) registry.derived.push(item);
  });
  return registry;
}

export function mountUI(engine) {
  var $ = function (id) { return document.getElementById(id); };
  var t = engine.t;
  var phraseBank = engine.phraseBank || {};
  phraseBank.phrases = phraseBank.phrases || {};
  var catalog = engine.featureCatalog || {};
  catalog.subjects = Array.isArray(catalog.subjects) ? catalog.subjects : [];
  catalog.types = Array.isArray(catalog.types) ? catalog.types : [];
  catalog.topics = Array.isArray(catalog.topics) ? catalog.topics : [];
  catalog.personIntentRoutes = Array.isArray(catalog.personIntentRoutes) ? catalog.personIntentRoutes : [];
  catalog.features = Array.isArray(catalog.features) ? catalog.features : [];
  var toolCards = engine.toolCards || {};
  toolCards.cards = Array.isArray(toolCards.cards) ? toolCards.cards : [];
  var storyCards = engine.storyCards || {};
  storyCards.cards = Array.isArray(storyCards.cards) ? storyCards.cards : [];
  var playerDecks = engine.playerDecks || {};
  playerDecks.decks = Array.isArray(playerDecks.decks) ? playerDecks.decks : [];
  var screenCards = engine.screenCards || {};
  screenCards.cards = Array.isArray(screenCards.cards) ? screenCards.cards : [];
  var clinicalScreens = engine.clinicalScreens || {};
  clinicalScreens.screens = Array.isArray(clinicalScreens.screens) ? clinicalScreens.screens : [];
  var clinicalScreensById = {};
  clinicalScreens.screens.forEach(function (screen) { clinicalScreensById[screen.id] = screen; });
  var screenClinicalIr = engine.screenClinicalIr || {};
  var guidanceComparisons = engine.guidanceComparisons || {};
  guidanceComparisons.sources = Array.isArray(guidanceComparisons.sources) ? guidanceComparisons.sources : [];
  guidanceComparisons.comparisons = Array.isArray(guidanceComparisons.comparisons) ? guidanceComparisons.comparisons : [];
  var assetManifest = engine.assetManifest || {};
  assetManifest.assets = Array.isArray(assetManifest.assets) ? assetManifest.assets : [];
  assetManifest.budget = assetManifest.budget || {};
  var assetApprovalRegister = engine.assetApprovalRegister || {};
  assetApprovalRegister.approvalStates = assetApprovalRegister.approvalStates || {};
  var mediaPacks = engine.mediaPacks || (typeof MEDIA_PACKS !== "undefined" ? MEDIA_PACKS : {});
  mediaPacks.packs = Array.isArray(mediaPacks.packs) ? mediaPacks.packs : [];
  var chwQualityStandards = engine.chwQualityStandards || {};
  chwQualityStandards.components = Array.isArray(chwQualityStandards.components) ? chwQualityStandards.components : [];
  chwQualityStandards.featureMappings = Array.isArray(chwQualityStandards.featureMappings) ? chwQualityStandards.featureMappings : [];
  var moduleContracts = engine.moduleContracts || {};
  moduleContracts.contracts = Array.isArray(moduleContracts.contracts) ? moduleContracts.contracts : [];
  var moduleRegistry = engine.moduleRegistry || {};
  moduleRegistry.modules = Array.isArray(moduleRegistry.modules) ? moduleRegistry.modules : [];
  moduleRegistry.diagnostics = Array.isArray(moduleRegistry.diagnostics) ? moduleRegistry.diagnostics : [];
  var progressTrackers = engine.progressTrackers || {};
  progressTrackers.trackers = Array.isArray(progressTrackers.trackers) ? progressTrackers.trackers : [];
  var triagePredicateTable = engine.triagePredicateTable || {};
  var childClinicalRegistry = clinicalVariableRegistry(triagePredicateTable, "child_under5");
  var DANGER = childClinicalRegistry.generalDangerSigns.length ? childClinicalRegistry.generalDangerSigns : [{ id: "unable_to_drink" }, { id: "vomits_everything" }, { id: "convulsions" }, { id: "lethargic_unconscious" }];
  var MAIN = (childClinicalRegistry.presentingSymptoms.length ? childClinicalRegistry.presentingSymptoms : [{ id: "cough" }, { id: "diarrhoea" }, { id: "fever" }]).concat(EXTRA_PRESENTING);
  var COUGH_FU = (childClinicalRegistry.followupsBySymptom.cough || [{ id: "chest_indrawing" }, { id: "stridor_calm" }]).map(function (q) { return { id: q.id, img: FOLLOWUP_IMAGES[q.id], assetId: FOLLOWUP_IMAGE_ASSETS[q.id] }; });
  var DIAR_FU = (childClinicalRegistry.followupsBySymptom.diarrhoea || [{ id: "bloody_stool" }, { id: "sunken_eyes" }, { id: "skin_pinch_slow" }, { id: "restless_irritable" }, { id: "drinks_eagerly" }]).map(function (q) { return { id: q.id, img: FOLLOWUP_IMAGES[q.id], assetId: FOLLOWUP_IMAGE_ASSETS[q.id] }; });
  var FEVER_MEASUREMENTS = childClinicalRegistry.measurementsBySymptom.fever || [{ id: "fever_days" }];
  var mode = "subject", selected = "child_under5", activeSubject = "child_under5", activePersonId = null, dangerPersonId = null, search = "", hotspot = false, slideIndex = 0, activeSlides = [], orsDeckContainerId = "", careEntryStartsCheck = false;
  var FEATURE_PAGE_SIZE = 6, featureLimit = FEATURE_PAGE_SIZE;
  // Progress is a caregiver-confirmed prototype record, but it must never leak
  // between children who share a phone.  Keep the per-person key beside the
  // renderer rather than using a single household-wide counter.
  var dentalBrushesTodayByPerson = {}, dentalZone = -1;
  var kmcMinutesToday = 0, kmcActive = false;
  var handwashStep = 0;
  var breastfeedingStep = 0;
  var pncView = "acute", pncSelections = {}, pncAnsweredViews = {};
  var under5DangerGateUpdate = null;
  var under5Stage = "danger", under5BranchQueue = [], under5BranchIndex = 0;
  var under5ResultMarkup = "", under5ResultShowsBreathing = false, under5ShowingSupport = false;
  // A duration is a required numeric field, not a checklist surface. Keep its stage
  // name in one constant so the registry's checklist-coverage audit remains exact.
  var DIARRHOEA_DURATION_STAGE = "diarrhoea_duration";
  // Registry-rendered one-choice screens are replaced as the caregiver advances. Retain
  // their explicit selections separately so the decision engine and Back both see them.
  var coughChoiceState = {};
  var bfAidView = "baby_urgent", bfAidSelections = {};
  var feedingPlanSelections = {};
  var safeWaterSelections = {};
  var uiTimer = null;
  var currentPrototypeMusic = null;
  var moduleOverrides = {};
  var editingPersonId = null;
  var people = [
    { id: "demo_child", name: "Lina", subject: "child_under5", note: "30 months", birthDate: "2024-01-01" },
    { id: "demo_baby", name: "Noor", subject: "newborn_baby", note: "", birthDate: "2026-06-20" },
    { id: "demo_mother", name: "Meena", subject: "newborn_mom", note: "" },
    { id: "demo_pregnancy", name: "Rina", subject: "pregnancy", note: "" }
  ];
  var initialPeople = JSON.parse(JSON.stringify(people));
  var demoActions = [
    { id: "demo-wrong", title: "1. Something's wrong", body: "Choose who needs urgent checks, then open the right checklist.", primary: true },
    { id: "demo-diarrhoea", title: "2. Child has diarrhoea", body: "Check danger signs, then show ORS and zinc support if it is appropriate." },
    { id: "demo-ors", title: "3. Mix ORS", body: "Practice the offline ORS mixing lesson." },
    { id: "demo-brushing", title: "4. Brush teeth", body: "Start the two-minute timer and mark the star chart." },
    { id: "demo-nudge", title: "5. Plan pregnancy visit", body: "Make a simple birth-preparedness checklist." }
  ];
  function byId(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }
  function personById(id) {
    for (var i = 0; i < people.length; i++) if (people[i].id === id) return people[i];
    return null;
  }
  function personRoleLabel(person) {
    if (!person) return "";
    if (person.subject === "pregnancy") return tx("tx.person.role.pregnant", "Pregnant");
    if (person.subject === "newborn_mom") return tx("tx.person.role.new_mother", "New mother");
    if (person.subject === "newborn_baby") return tx("tx.person.role.newborn", "Newborn");
    if (person.subject === "child_under5") return tx("tx.person.role.child", "Child");
    if (person.subject === "school_child") return tx("tx.person.role.school_child", "School-age child");
    var subject = byId(catalog.subjects, person.subject);
    return subject ? t(subject.titleSlug) : person.subject;
  }
  function personSummary(person) {
    if (!person) return "";
    var role = personRoleLabel(person);
    var note = String(person.note || "")
      .replace(/\s*-\s*demo(?: child| baby)?\s*$/i, "")
      .replace(/\s*-\s*new mom\s*$/i, "")
      .replace(/^\s*(pregnant|newborn|postpartum)\s*$/i, "")
      .trim();
    return note ? role + ", " + note : role;
  }
  function selectedPersonName() {
    var person = activePersonId ? personById(activePersonId) : null;
    if (person) return person.name;
    var subject = byId(catalog.subjects, selected);
    return subject ? t(subject.titleSlug) : "my family";
  }
  function cardByFeature(id) {
    for (var i = 0; i < toolCards.cards.length; i++) if (toolCards.cards[i].featureId === id) return toolCards.cards[i];
    return null;
  }
  function storyByFeature(id) {
    for (var i = 0; i < storyCards.cards.length; i++) if (storyCards.cards[i].featureId === id) return storyCards.cards[i];
    return null;
  }
  var KMC_PROTOTYPE_NEWBORN_DAYS = 28;
  function daysSinceBirth(person) {
    var birth = parseDateOnly(person && person.birthDate);
    if (!birth) return null;
    var today = new Date();
    today = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return Math.floor((today.getTime() - birth.getTime()) / 86400000);
  }
  function kmcEligiblePerson(person) {
    if (!person || person.subject !== "newborn_baby") return false;
    if (person.pretermLowBirthWeight === true || person.kmcAdvised === true) return true;
    var days = daysSinceBirth(person);
    return days !== null && days >= 0 && days < KMC_PROTOTYPE_NEWBORN_DAYS;
  }
  function eligibleKmcBaby() {
    var active = activePersonId ? personById(activePersonId) : null;
    if (kmcEligiblePerson(active)) return active;
    for (var i = 0; i < people.length; i++) if (kmcEligiblePerson(people[i])) return people[i];
    return null;
  }
  function kmcEligibilityMessage() {
    var newborns = people.filter(function (person) { return person.subject === "newborn_baby"; });
    if (!newborns.length) return "Add a newborn first. This prototype shows the kangaroo care timer only for a very young newborn, or for a baby marked preterm, low-birth-weight, or health-worker-advised for kangaroo mother care.";
    var notes = newborns.map(function (person) {
      var days = daysSinceBirth(person);
      var age = days === null ? "birth date missing" : days + " days old";
      return person.name + " is " + age;
    }).join("; ");
    return notes + ". This prototype shows the kangaroo care timer only before 28 days of age unless the baby is marked preterm, low-birth-weight, or health-worker-advised for kangaroo mother care.";
  }
  function deckByFeature(id) {
    for (var i = 0; i < playerDecks.decks.length; i++) if (playerDecks.decks[i].featureId === id) return playerDecks.decks[i];
    return null;
  }
  function containerById(id) {
    for (var i = 0; i < engine.orsContainers.length; i++) if (engine.orsContainers[i].id === id) return engine.orsContainers[i];
    return null;
  }
  function screenByFeature(id) {
    for (var i = 0; i < screenCards.cards.length; i++) if (screenCards.cards[i].featureId === id) return screenCards.cards[i];
    return null;
  }
  function comparisonByFeature(id) {
    for (var i = 0; i < guidanceComparisons.comparisons.length; i++) if (guidanceComparisons.comparisons[i].featureId === id) return guidanceComparisons.comparisons[i];
    return null;
  }
  function sourceById(id) {
    for (var i = 0; i < guidanceComparisons.sources.length; i++) if (guidanceComparisons.sources[i].id === id) return guidanceComparisons.sources[i];
    return null;
  }
  function contractByFeature(id) {
    for (var i = 0; i < moduleContracts.contracts.length; i++) if (moduleContracts.contracts[i].featureId === id) return moduleContracts.contracts[i];
    return null;
  }
  function trackerByModule(id) {
    for (var i = 0; i < progressTrackers.trackers.length; i++) if (progressTrackers.trackers[i].moduleId === id) return progressTrackers.trackers[i];
    return null;
  }
  function approvedMediaAsset(asset) {
    var text = String((asset.approvalStatus || "") + " " + (asset.clinicalReviewStatus || "") + " " + (asset.localReviewStatus || "")).toLowerCase();
    return /approved/.test(text) && !/needs approval|review needed|pending|not approved/.test(text);
  }
  function assetScore(asset) {
    var score = 0;
    score += Number(asset.displayPriority || 0);
    if (approvedMediaAsset(asset)) score += 100;
    if (String(asset.regionFocus || "").toLowerCase() === "north india prototype draft") score += 20;
    if (asset.targetPath) score += 3;
    if (asset.altText) score += 2;
    if (/codex_generated|generated/.test(String(asset.sourceType || "").toLowerCase())) score += 1;
    return score;
  }
  function renderableAsset(asset) {
    return !!asset && (/^data:image\//i.test(asset.targetPath || "") || /\.(svg|png|webp|jpe?g)$/i.test(asset.targetPath || "")) && !!asset.altText;
  }
  function displayAssetByFeature(id) {
    var candidates = assetManifest.assets.filter(function (asset) {
      var generatedDraft = asset.sourceType === "codex_generated_svg_draft" || asset.sourceType === "codex_generated_png_draft" || asset.sourceType === "codex_generated_reference_draft";
      return (asset.featureIds || []).indexOf(id) >= 0 && (generatedDraft || approvedMediaAsset(asset)) && renderableAsset(asset);
    });
    candidates.sort(function (a, b) {
      var score = assetScore(b) - assetScore(a);
      return score || String(a.assetId || "").localeCompare(String(b.assetId || ""));
    });
    return candidates[0] || null;
  }
  function assetById(assetId) {
    for (var i = 0; i < assetManifest.assets.length; i++) if (assetManifest.assets[i].assetId === assetId) return assetManifest.assets[i];
    return null;
  }
  function displayAsset(featureId, assetId) {
    var exact = assetId ? assetById(assetId) : null;
    if (renderableAsset(exact)) return exact;
    return featureId ? displayAssetByFeature(featureId) : null;
  }
  function caregiverAlt(text) {
    return String(text || "")
      .replace(/\bPrototype\s+/gi, "")
      .replace(/\bprototype\s+/gi, "")
      .replace(/\bdraft\s+/gi, "")
      .replace(/\s+/g, " ")
      .trim();
  }
  function assetThumb(assetId, label) {
    var asset = assetById(assetId);
    if (!asset || !asset.targetPath) return "";
    return '<figure class="dosecard"><img src="' + esc(asset.targetPath) + '" alt="' + esc(caregiverAlt(asset.altText || label || "")) + '" data-asset-id="' + esc(asset.assetId || "") + '"><figcaption>' + esc(label || caregiverAlt(asset.altText) || "") + "</figcaption></figure>";
  }
  function featureThumb(featureId) {
    var asset = displayAssetByFeature(featureId);
    if (!asset) return "";
    return '<img class="featurethumb" src="' + esc(asset.targetPath) + '" alt="' + esc(caregiverAlt(asset.altText)) + '" loading="lazy">';
  }
  function esc(s) {
    return String(s || "").replace(/[&<>"']/g, function (ch) {
      return ch === "&" ? "&amp;" : ch === "<" ? "&lt;" : ch === ">" ? "&gt;" : ch === '"' ? "&quot;" : "&#39;";
    });
  }
  function tx(slug, fallback, vars) {
    var text = t(slug);
    if (!text || text === slug) text = fallback;
    vars = vars || {};
    Object.keys(vars).forEach(function (key) {
      text = text.split("{" + key + "}").join(String(vars[key]));
    });
    return text;
  }
  function localizeCaregiverChrome() {
    [document.body].forEach(function (root) {
      if (!root || !root.querySelectorAll) return;
      root.querySelectorAll("[data-i18n]").forEach(function (node) {
        node.textContent = tx(node.getAttribute("data-i18n"), node.textContent);
      });
      root.querySelectorAll("[data-i18n-placeholder]").forEach(function (node) {
        node.setAttribute("placeholder", tx(node.getAttribute("data-i18n-placeholder"), node.getAttribute("placeholder") || ""));
      });
      root.querySelectorAll("[data-i18n-aria-label]").forEach(function (node) {
        node.setAttribute("aria-label", tx(node.getAttribute("data-i18n-aria-label"), node.getAttribute("aria-label") || ""));
      });
      root.querySelectorAll("[data-i18n-title]").forEach(function (node) {
        node.setAttribute("title", tx(node.getAttribute("data-i18n-title"), node.getAttribute("title") || ""));
      });
    });
  }
  function renderVisual(featureId, description, assetId) {
    var asset = displayAsset(featureId, assetId);
    if (asset) {
      return '<img class="visualasset" src="' + esc(asset.targetPath) + '" alt="' + esc(caregiverAlt(asset.altText)) + '" data-asset-id="' + esc(asset.assetId) + '" loading="eager" decoding="async">';
    }
    return '<div class="visualfallback" role="img" aria-label="' + esc(description || "Prototype illustration pending") + '"><strong>' + esc(tx("tx.visual.pending_title", "Prototype illustration pending")) + '</strong><span>' + esc(description || tx("tx.visual.pending_body", "A reviewed local image will replace this draft panel.")) + "</span></div>";
  }
  function questionAssetHtml(q) {
    if (q && q.id === "chest_indrawing") return chestIndrawingFlipbookHtml();
    var asset = q && q.assetId ? assetById(q.assetId) : null;
    if (renderableAsset(asset)) {
      var image = '<img src="' + esc(asset.targetPath) + '" alt="' + esc(caregiverAlt(asset.altText)) + '" data-asset-id="' + esc(asset.assetId) + '" loading="lazy">';
      return '<figure class="questionasset">' + image + '<figcaption>' + esc(q.img || caregiverAlt(asset.altText)) + '</figcaption><details><summary>' + esc(tx("tx.triage.show_larger_example", "Show larger example")) + '</summary>' + image + '</details></figure>';
    }
    return q && q.img ? '<div class="imgph">Image: ' + esc(q.img) + "</div>" : "";
  }
  function questionExamplesHtml(items) {
    var examples = (items || []).map(questionAssetHtml).filter(Boolean).join("");
    if (!examples) return "";
    return '<details class="questionexamples"><summary>' +
      esc(tx("tx.clinical_screen.under5.picture_examples", "Show picture examples")) +
      "</summary>" + examples + "</details>";
  }
  function signExampleHtml(id) {
    var asset = assetById(FOLLOWUP_IMAGE_ASSETS[id]);
    if (!renderableAsset(asset)) return "";
    var alt = tx("tx.q_" + id, caregiverAlt(asset.altText));
    return '<details class="sign-example"><summary>' + esc(tx("tx.clinical.show_me", "Show me")) + '</summary>' +
      '<img src="' + esc(asset.targetPath) + '" alt="' + esc(alt) + '" data-asset-id="' + esc(asset.assetId) + '"></details>';
  }
  function chestIndrawingFlipbookHtml() {
    var outward = assetById("img.user_supplied.chest_indrawing_breath_out_v2");
    var inward = assetById("img.user_supplied.chest_indrawing_pulls_in_v2");
    if (!renderableAsset(outward) || !renderableAsset(inward)) return "";
    return '<aside class="breath-flipbook" aria-label="' + esc(tx("tx.chest_flipbook.title", "Watch one breath")) + '">' +
      '<h4>' + esc(tx("tx.chest_flipbook.title", "Watch the lower chest")) + '</h4>' +
      '<p>' + esc(tx("tx.chest_flipbook.instruction", "When the child breathes in, the chest and belly move out. Look at the space between the ribs and belly.")) + '</p>' +
      '<img class="breath-frame" id="chestflipframe1" src="' + esc(outward.targetPath) + '" alt="' + esc(tx("tx.chest_flipbook.frame_out_alt", "Child's chest and belly moving out as the child breathes in.")) + '" data-asset-id="' + esc(outward.assetId) + '">' +
      '<img class="breath-frame" id="chestflipframe2" src="' + esc(inward.targetPath) + '" alt="' + esc(tx("tx.chest_flipbook.frame_in_alt", "Child's lower chest pulling inward while the child breathes in.")) + '" data-asset-id="' + esc(inward.assetId) + '" hidden>' +
      '<span class="breath-frame-label" id="chestfliplabel" aria-live="polite">' + esc(tx("tx.chest_flipbook.frame_normal", "Normal breathing")) + '</span>' +
      '<div class="breath-controls"><button id="chestflipshowin" type="button">' + esc(tx("tx.chest_flipbook.show_in", "Show pulling-in example")) + '</button><button class="ghost" id="chestflipshowout" type="button">' + esc(tx("tx.chest_flipbook.show_out", "Show normal breathing")) + '</button></div></aside>';
  }
  function stridorSoundExampleHtml() {
    var asset = assetById("audio.clinical.stridor_example_cc_by_sa_3");
    if (!asset || !asset.targetPath) return "";
    return '<aside class="soundexample" aria-label="' + esc(tx("tx.stridor_sound.play", "Hear an example")) + '">' +
      '<p>' + esc(tx("tx.stridor_sound.hint_short", "Listen to an example of a harsh sound when breathing in.")) + '</p>' +
      '<div class="slidecontrols wrap-controls"><button id="stridorsoundplay" type="button" data-asset-id="' + esc(asset.assetId) + '">' + esc(tx("tx.stridor_sound.play", "Hear an example")) + '</button>' +
      '<button class="ghost" id="stridorsoundstop" type="button">' + esc(tx("tx.stridor_sound.stop", "Stop sound")) + '</button>' +
      '<span id="stridorsoundstatus" class="muted" aria-live="polite"></span></div>' +
      '<details class="media-attribution"><summary>' + esc(tx("tx.stridor_sound.attribution_link", "View source and licence")) + '</summary><p>' + esc(tx("tx.stridor_sound.attribution_summary", "Sound: 'Stridor NP OGG 2.ogg,' Wikimedia Commons. Recording supplied by James Heilman, MD; processed by Natural Philo. CC BY-SA 3.0. No changes made.")) +
      ' <a href="https://commons.wikimedia.org/wiki/File:Stridor_NP_OGG_2.ogg" target="_blank" rel="noopener noreferrer">' + esc(tx("tx.stridor_sound.attribution_link", "View source and licence")) + '</a></p></details></aside>';
  }
  function stopChestFlipbook() {
    // The comparison is deliberately manual: it remains understandable when motion is
    // reduced or unavailable, and it cannot keep moving after the caregiver changes screen.
  }
  function showChestFlipbookFrame(frame) {
    var first = $("chestflipframe1"), second = $("chestflipframe2"), label = $("chestfliplabel");
    if (!first || !second) { stopChestFlipbook(); return; }
    first.hidden = frame !== 1;
    second.hidden = frame !== 2;
    if (label) label.textContent = frame === 1
      ? tx("tx.chest_flipbook.frame_normal", "Normal breathing")
      : tx("tx.chest_flipbook.frame_in", "Lower chest pulling in");
  }
  function bindChestFlipbook() {
    showChestFlipbookFrame(1);
    var showIn = $("chestflipshowin"), showOut = $("chestflipshowout");
    if (showIn && !showIn.dataset.bound) {
      showIn.dataset.bound = "chest-flipbook";
      showIn.addEventListener("click", function () { showChestFlipbookFrame(2); });
    }
    if (showOut && !showOut.dataset.bound) {
      showOut.dataset.bound = "chest-flipbook";
      showOut.addEventListener("click", function () { showChestFlipbookFrame(1); });
    }
  }
  function traceDetails(label, body) {
    return '<details class="trace"><summary>' + esc(label || "Prototype review details") + '</summary>' + esc(body || "") + "</details>";
  }
  function reviewerDetails(body) {
    return traceDetails(tx("tx.review_details.prototype", "Prototype review details"), body);
  }
  function reviewDetailsHtml(featureId, note) {
    return reviewerDetails((note ? note + " " : "") + provenanceSummary(featureId) + assetSummary(featureId) + contractSummary(featureId));
  }
  function combinedReviewDetailsHtml(featureIds, note) {
    var body = note ? note + " " : "";
    for (var i = 0; i < featureIds.length; i++) body += provenanceSummary(featureIds[i]) + assetSummary(featureIds[i]) + contractSummary(featureIds[i]);
    return reviewerDetails(body);
  }
  function friendlyOtherMessage() {
    return tx("tx.other_unknown_professional", "I don't know about that. Please see a healthcare professional if you are concerned.");
  }
  function backHomeHtml() {
    if (mode === "person-intent" && activePersonId && personById(activePersonId)) {
      return '<p><button class="ghost" id="backperson" type="button">' + esc(tx("tx.nav.back_to_person", "Back to {personName}", { personName: personById(activePersonId).name })) + "</button></p>";
    }
    return '<p><button class="ghost" id="backhome" type="button">' + esc(tx("tx.nav.back_home", "Back to home screen")) + '</button></p>';
  }
  function backToUnder5QuestionsHtml() {
    return '<p><button class="ghost" id="backtounder5questions" type="button">' + esc(tx("tx.nav.back_to_questions", "Back to questions")) + '</button></p>';
  }
  function backToUnder5ResultHtml() {
    return '<p><button class="ghost" id="backtounder5result" type="button">' + esc(tx("tx.nav.back_to_advice", "Back to advice")) + '</button></p>';
  }
  function careRouteNextAction(route, severity) {
    var urgent = severity === "emergency" || severity === "urgent_clinic";
    if (route === "dental_or_clinic") {
      return urgent
        ? tx("tx.result.action_dental_urgent", "Seek urgent medical or dental care now.")
        : tx("tx.result.action_dental_today", "Arrange dental or clinic review today.");
    }
    if (route === "child_clinic") {
      return urgent
        ? tx("tx.result.action_child_clinic_urgent", "Seek urgent clinic care now.")
        : tx("tx.result.action_child_clinic_today", "Arrange clinic or health-worker review today.");
    }
    if (route === "newborn_clinic") {
      return urgent
        ? tx("tx.result.action_newborn_urgent", "Go to urgent newborn care now.")
        : tx("tx.result.action_newborn_today", "Contact a health worker or facility today.");
    }
    if (route === "postpartum_clinic") {
      return urgent
        ? tx("tx.result.action_postpartum_urgent", "Seek urgent postpartum or clinic care now.")
        : tx("tx.result.action_postpartum_today", "Contact postpartum, maternity, or clinic care today.");
    }
    if (route === "maternity_clinic") {
      return urgent
        ? tx("tx.result.action_maternity_urgent", "Seek urgent maternity or clinic care now.")
        : tx("tx.result.action_maternity_today", "Contact maternity or clinic care today.");
    }
    if (route === "nutrition_clinic") {
      return urgent
        ? tx("tx.result.action_nutrition_urgent", "Seek urgent nutrition or clinic care now.")
        : tx("tx.result.action_nutrition_today", "Arrange nutrition or clinic review today.");
    }
    if (route === "home_watch") {
      return tx("tx.result.action_watch_safety", "Keep watching and seek help if a danger sign appears.");
    }
    if (route === "professional") {
      return tx("tx.result.action_see_professional", "See a healthcare professional if you are concerned.");
    }
    return urgent ? tx("tx.result.action_seek_urgent_care", "Seek urgent care now.") : tx("tx.result.action_arrange_clinic", "Arrange clinic or health-worker review today.");
  }
  function routeForResult(opts) {
    opts = opts || {};
    if (opts.careRoute) return opts.careRoute;
    if (opts.kind === "home") return "home_watch";
    return "child_clinic";
  }
  function resultRouteLabel(route, kind, severity) {
    var urgent = severity === "emergency" || severity === "urgent_clinic";
    if (route === "home_watch" || kind === "home") return tx("tx.result.route_home", "Home support");
    if (route === "dental_or_clinic") return urgent ? tx("tx.result.route_go_now", "Go now") : tx("tx.result.route_dental_today", "Clinic or dental care today");
    if (route === "newborn_clinic") return urgent ? tx("tx.result.route_newborn_now", "Urgent newborn care") : tx("tx.result.route_clinic_today", "Clinic or health worker today");
    if (route === "postpartum_clinic") return urgent ? tx("tx.result.route_postpartum_now", "Urgent postpartum care") : tx("tx.result.route_clinic_today", "Clinic or health worker today");
    if (route === "maternity_clinic") return urgent ? tx("tx.result.route_maternity_now", "Urgent maternity care") : tx("tx.result.route_clinic_today", "Clinic or health worker today");
    if (urgent) return tx("tx.result.route_go_now", "Go now");
    return tx("tx.result.route_clinic_today", "Clinic or health worker today");
  }
  function resultActionCardHtml(opts) {
    opts = opts || {};
    var kind = opts.kind === "home" ? "home" : "refer";
    var route = routeForResult(opts);
    var nextAction = opts.nextAction || careRouteNextAction(route, opts.severity);
    var screenAttr = opts.screenId ? ' data-screen-id="' + esc(opts.screenId) + '"' : "";
    var html = '<div class="result ' + kind + '" data-tool="result_action_renderer" data-care-route="' + esc(route) + '"' + screenAttr + '><div class="result-band">' + esc(resultRouteLabel(route, kind, opts.severity)) + '</div><div class="result-body"><h2>' + esc(opts.title || tx("tx.result.title", "Result")) + "</h2>";
    var paragraphs = opts.paragraphs || [];
    if (nextAction) {
      html += '<p class="result-action"><strong>' + esc(tx("tx.result.next_action_label", "What to do")) + ':</strong> ' + esc(nextAction) + "</p>";
    }
    if (opts.bodyHtml) html += opts.bodyHtml;
    for (var i = 0; i < paragraphs.length; i++) html += "<p>" + esc(paragraphs[i]) + "</p>";
    if (opts.nextButtonId && opts.nextButtonLabel) {
      html += '<button class="result-action-button" id="' + esc(opts.nextButtonId) + '" type="button">' + esc(opts.nextButtonLabel) + "</button>";
    }
    if (opts.extraHtml) html += opts.extraHtml;
    return html + "</div></div>";
  }
  function setSlideResult(opts) {
    $("slidetext").innerHTML = resultActionCardHtml(opts) + backHomeHtml();
    bindBackHome($("slidetext"));
    moveToNextStep("slidetext");
  }
  function selectedChecklistItems(ids, names) {
    var checked = ids.filter(function (id) { return !!$(id).checked; });
    var selectedItems = checked.map(function (id) { return names[id] || id; }).join(", ") || tx("tx.tool.checklist.nothing_selected", "nothing selected yet");
    return { checked: checked, selectedItems: selectedItems };
  }
  function setChecklistSummary(opts) {
    opts = opts || {};
    var summary = selectedChecklistItems(opts.ids || [], opts.names || {});
    $("slidetext").textContent = tx(opts.slug, opts.fallback, {
      count: summary.checked.length,
      total: (opts.ids || []).length,
      selectedItems: summary.selectedItems
    });
    if (typeof opts.after === "function") opts.after(summary);
    return summary;
  }
  function showSubmittedChecklistResult(opts) {
    opts = opts || {};
    var summary = selectedChecklistItems(opts.ids || [], opts.names || {});
    var missingItems = (opts.ids || []).filter(function (id) {
      return !summary.checked.includes(id);
    }).map(function (id) {
      return opts.names && opts.names[id] ? opts.names[id] : id;
    });
    var summaryText = tx(opts.slug, opts.fallback, {
      count: summary.checked.length,
      total: (opts.ids || []).length,
      selectedItems: summary.selectedItems
    });
    var readinessText = missingItems.length
      ? tx("tx.tool.checklist.still_to_do", "Still to do: {missingItems}.", { missingItems: missingItems.join(", ") })
      : tx("tx.tool.checklist.all_ready", "All listed items are ready. Review the plan again if something changes.");
    setSlideResult({
      kind: "home",
      careRoute: "home_watch",
      title: opts.title || "Your plan",
      nextAction: opts.nextAction || "Use the saved steps below. Review the checklist again when something changes.",
      paragraphs: [summaryText, readinessText]
    });
    $("slideimage").classList.add("hidden");
    var againId = opts.againId || "checklistreviewagain";
    $("slidecache").innerHTML =
      '<div class="slidecontrols"><button id="' + esc(againId) + '" type="button">' +
      esc(opts.againLabel || "Review checklist again") +
      "</button></div>" +
      (opts.featureId ? reviewDetailsHtml(opts.featureId, opts.reviewText || "Submitted checklist result.") : "");
    var again = $(againId);
    if (again && !again.dataset.bound) {
      again.dataset.bound = "submitted-checklist";
      again.addEventListener("click", function () {
        $("slideimage").classList.remove("hidden");
        $("slidetext").textContent = opts.bodyText || "";
        if (typeof opts.render === "function") opts.render();
        moveToNextStep("slidecache");
      });
    }
    if (typeof opts.after === "function") opts.after(summary);
    return summary;
  }
  function bindExplicitAnswerGate(opts) {
    opts = opts || {};
    var ids = opts.ids || [];
    var noneId = opts.noneId;
    var action = $(opts.actionId);
    var feedback = opts.feedbackId ? $(opts.feedbackId) : null;
    if (action && feedback && action.setAttribute) action.setAttribute("aria-describedby", opts.feedbackId);
    if (feedback && feedback.setAttribute) feedback.setAttribute("aria-live", "polite");
    function update() {
      var answered = ids.some(function (id) { return !!($(id) && $(id).checked); });
      if (action) action.disabled = !answered;
      // The disabled primary action already shows that an answer is needed. Repeating a
      // generic status after every selection adds noise and has repeatedly obscured the
      // actual question. A caller may opt into a specific unanswered message when needed.
      if (feedback) feedback.textContent = !answered && opts.showRequiredFeedback
        ? (opts.requiredSlug ? tx(opts.requiredSlug, opts.requiredFallback) : opts.requiredFallback || tx("tx.danger_checklist.answer_required", "Choose every sign that is happening, or choose None of these."))
        : "";
      return answered;
    }
    ids.forEach(function (id) {
      var box = $(id);
      if (!box || box.dataset.explicitAnswerGate) return;
      box.dataset.explicitAnswerGate = opts.actionId || "explicit";
      box.addEventListener("change", function () {
        if (opts.singleSelect && box.checked) {
          ids.forEach(function (otherId) {
            if (otherId !== id && $(otherId)) $(otherId).checked = false;
          });
        } else if (id === noneId && box.checked) {
          ids.forEach(function (otherId) {
            if (otherId !== noneId && $(otherId)) $(otherId).checked = false;
          });
        } else if (id !== noneId && box.checked && noneId && $(noneId)) {
          $(noneId).checked = false;
        }
        update();
      });
    });
    update();
    return update;
  }
  function clinicalScreen(surfaceId) {
    var screen = clinicalScreensById[surfaceId];
    if (!screen) throw new Error("Unregistered clinical screen: " + surfaceId);
    return screen;
  }
  function clinicalChecklistOptionIds(screen, options) {
    return (options || screen.options || []).map(function (option) { return option.id; });
  }
  function renderClinicalChecklist(surfaceId, opts) {
    opts = opts || {};
    var screen = clinicalScreen(surfaceId);
    var groups = opts.groups || screen.groups || [];
    var options = opts.options || screen.options || [];
    var optionById = {};
    options.forEach(function (option) { optionById[option.id] = option; });
    var selected = opts.selected || {};
    var html = '<div class="slidecontrols checklist-controls clinical-checklist" data-clinical-screen-id="' + esc(surfaceId) + '">';
    if (screen.introSlug && !opts.omitIntro) html += '<p class="muted">' + esc(tx(screen.introSlug, screen.introSlug)) + "</p>";
    if (opts.beforeFieldsHtml) html += opts.beforeFieldsHtml;
    groups.forEach(function (group) {
      html += '<fieldset class="symptom-group"><legend>' + esc(group.legend || tx(group.legendSlug, group.legendSlug)) + '</legend>';
      (group.optionIds || []).forEach(function (optionId) {
        var option = optionById[optionId];
        if (!option) throw new Error("Clinical screen " + surfaceId + " references unknown option " + optionId);
        var label = option.label || tx(option.labelSlug, option.labelSlug);
        html += '<label><input id="' + esc(option.id) + '" type="checkbox" data-clinical-option-kind="' + esc(option.kind) + '"' +
          (selected[option.stateId || option.id] ? " checked" : "") + "> " + esc(label) + "</label>";
        if (typeof opts.optionHelpHtml === "function") html += opts.optionHelpHtml(option) || "";
      });
      html += "</fieldset>";
    });
    if (opts.afterFieldsHtml) html += opts.afterFieldsHtml;
    if (!opts.omitAction) html += '<button id="' + esc(screen.actionId) + '" type="button">' + esc(tx(screen.actionSlug, screen.actionSlug)) + "</button>";
    if (!opts.omitFeedback) html += '<p class="checklist-feedback" id="' + esc(screen.feedbackId) + '"></p>';
    if (opts.afterActionHtml) html += opts.afterActionHtml;
    return html + "</div>";
  }
  function bindClinicalChecklist(surfaceId, opts) {
    opts = opts || {};
    var screen = clinicalScreen(surfaceId);
    var options = opts.options || screen.options || [];
    var ids = clinicalChecklistOptionIds(screen, options);
    var noneId = opts.noneId || screen.noneId;
    var state = opts.state || null;
    ids.forEach(function (id) {
      var box = $(id);
      if (!box) throw new Error("Clinical screen " + surfaceId + " did not render option " + id);
      var option = options.find(function (candidate) { return candidate.id === id; });
      box.checked = state ? !!state[(option && option.stateId) || id] : false;
    });
    var update = bindExplicitAnswerGate({
      ids: ids,
      noneId: noneId,
      actionId: opts.actionId || screen.actionId,
      feedbackId: opts.feedbackId || screen.feedbackId,
      singleSelect: opts.singleSelect === true,
      readySlug: opts.readySlug,
      readyFallback: opts.readyFallback,
      requiredSlug: opts.requiredSlug,
      requiredFallback: opts.requiredFallback,
      showRequiredFeedback: opts.showRequiredFeedback === true
    });
    ids.forEach(function (id) {
      var box = $(id);
      box.addEventListener("change", function () {
        if (state) {
          options.forEach(function (option) {
            state[option.stateId || option.id] = !!($(option.id) && $(option.id).checked);
          });
        }
        if (typeof opts.onChange === "function") opts.onChange(id, !!box.checked);
      });
    });
    return { screen: screen, ids: ids, update: update };
  }
  function compareClinicalValues(left, op, right) {
    if (op === ">") return left > right;
    if (op === "<") return left < right;
    if (op === ">=") return left >= right;
    if (op === "<=") return left <= right;
    if (op === "==") return left === right;
    if (op === "!=") return left !== right;
    throw new Error("unknown clinical expression op '" + op + "'");
  }
  function evalClinicalExpression(expression, inputs, predicates) {
    if (!expression || typeof expression !== "object") throw new Error("bad clinical expression");
    if (expression.ref) {
      if (!(expression.ref in predicates)) throw new Error("unknown predicate ref '" + expression.ref + "'");
      return predicates[expression.ref];
    }
    if (expression.not) return !evalClinicalExpression(expression.not, inputs, predicates);
    if (expression.allOf) return expression.allOf.every(function (child) { return evalClinicalExpression(child, inputs, predicates); });
    if (expression.anyOf) return expression.anyOf.some(function (child) { return evalClinicalExpression(child, inputs, predicates); });
    if (expression.atLeast != null) return (expression.of || []).filter(function (child) { return evalClinicalExpression(child, inputs, predicates); }).length >= expression.atLeast;
    if (expression.var) {
      if ("is" in expression) return inputs[expression.var] === expression.is;
      if ("equals" in expression) return inputs[expression.var] === expression.equals;
      if ("op" in expression) return compareClinicalValues(inputs[expression.var], expression.op, expression.value);
    }
    throw new Error("unrecognized clinical expression: " + JSON.stringify(expression));
  }
  function evaluateScreenClinicalDecision(predicateIr, decisionIr, inputs, guidelineVersion) {
    var predicates = {};
    for (var i = 0; i < (predicateIr.predicates || []).length; i++) {
      var predicate = predicateIr.predicates[i];
      predicates[predicate.id] = evalClinicalExpression(predicate, inputs, predicates);
    }
    if (decisionIr.hitPolicy === "collect_then_resolve") {
      var matches = [];
      for (var r = 0; r < (decisionIr.rules || []).length; r++) {
        var rule = decisionIr.rules[r];
        if (evalClinicalExpression(rule.when, inputs, predicates)) matches.push({ rule: rule, index: r });
      }
      if (matches.length) {
        var rank = {};
        var order = decisionIr.severityOrder || ["emergency", "urgent_clinic", "routine_clinic", "home_care", "followup"];
        for (var s = 0; s < order.length; s++) rank[order[s]] = s;
        matches.sort(function (left, right) {
          var a = rank[left.rule.then.severity] == null ? 999 : rank[left.rule.then.severity];
          var b = rank[right.rule.then.severity] == null ? 999 : rank[right.rule.then.severity];
          return (a - b) || (left.index - right.index);
        });
        var out = {};
        Object.keys(matches[0].rule.then || {}).forEach(function (key) { out[key] = matches[0].rule.then[key]; });
        out.firedRuleId = matches[0].rule.id;
        out.matchedRules = matches.map(function (entry) { return entry.rule.id; });
        out.predicates = predicates;
        out.guidelineVersion = guidelineVersion;
        return out;
      }
      var fallback = {};
      Object.keys(decisionIr.default || {}).forEach(function (key) { fallback[key] = decisionIr.default[key]; });
      fallback.firedRuleId = "__default__";
      fallback.matchedRules = [];
      fallback.predicates = predicates;
      fallback.guidelineVersion = guidelineVersion;
      return fallback;
    }
    for (var f = 0; f < (decisionIr.rules || []).length; f++) {
      var firstRule = decisionIr.rules[f];
      if (evalClinicalExpression(firstRule.when, inputs, predicates)) {
        var first = {};
        Object.keys(firstRule.then || {}).forEach(function (key) { first[key] = firstRule.then[key]; });
        first.firedRuleId = firstRule.id;
        first.matchedRules = [firstRule.id];
        first.predicates = predicates;
        first.guidelineVersion = guidelineVersion;
        return first;
      }
    }
    var def = {};
    Object.keys(decisionIr.default || {}).forEach(function (key) { def[key] = decisionIr.default[key]; });
    def.firedRuleId = "__default__";
    def.matchedRules = [];
    def.predicates = predicates;
    def.guidelineVersion = guidelineVersion;
    return def;
  }
  function screenDecision(featureId, selectedVariableIds) {
    var card = screenByFeature(featureId);
    var set = card && card.clinicalVariableSet;
    var ir = screenClinicalIr[featureId];
    if (!set || !ir || !ir.predicates || !ir.decisions) return { firedRuleId: "__missing_ir__", matchedRules: [], severity: "followup", predicates: {}, action: "FOLLOWUP", guidelineVersion: "missing-generated-screen-ir" };
    var aliases = {
      anc_triage: { pregbleeding: "ancbleeding", pregheadvision: "ancheadvision", pregbreathing: "ancbreathing", pregpainfever: "ancpainfever", pregmovement: "ancmovement", pregother: "ancother" },
      pnc_lactation: {
        pncclots: "pncbleeding",
        pncplacenta: "pncbleeding",
        pncsmelldischarge: "pncbleeding",
        pncchestpain: "pncbreathing",
        pncfastheart: "pncbreathing",
        pncdizzyfaint: "pncbreathing",
        pncbellypain: "pncheadvision",
        pncswelling: "pncheadvision"
      },
      kohl_lead_screen: { kohlaway: "kohlaccess" },
    };
    var inputs = {};
    Object.keys(ir.predicates.inputs || {}).forEach(function (id) { inputs[id] = false; });
    if (set.presentation) inputs[set.presentation] = true;
    (selectedVariableIds || []).forEach(function (raw) {
      var id = (aliases[featureId] && aliases[featureId][raw]) || raw;
      if (id in inputs) inputs[id] = true;
      else if ((featureId + "_" + id) in inputs) inputs[featureId + "_" + id] = true;
    });
    return evaluateScreenClinicalDecision(ir.predicates, ir.decisions, inputs, ir.predicates.guidelineVersionExpected || "prototype-screen-card");
  }
  function screenDecisionTraceHtml(featureId, decision) {
    if (!decision) return "";
    return '<details class="trace" data-screen-decision-engine="' + esc(featureId) + '"><summary>' + esc(tx("tx.review_details.clinical_engine", "Clinical review details")) + '</summary>' + esc(screenDecisionTraceText(decision)) + "</details>";
  }
  function screenDecisionTraceText(decision) {
    var text = "Generated predicate/DMN IR for reviewer audit only. Fired " + decision.firedRuleId + "; matched " + (decision.matchedRules || []).join(", ") + "; severity " + decision.severity + ".";
    return text;
  }
  function appendScreenDecisionTrace(featureId, decision) {
    var cache = $("slidecache");
    if (!cache || !decision) return;
    if (document.createElement && cache.appendChild) {
      var div = document.createElement("details");
      div.className = "trace";
      div.setAttribute("data-screen-decision-engine", featureId);
      var summary = document.createElement("summary");
      summary.textContent = tx("tx.review_details.clinical_engine", "Clinical review details");
      div.appendChild(summary);
      div.appendChild(document.createTextNode(screenDecisionTraceText(decision)));
      cache.appendChild(div);
    } else {
      cache.innerHTML += screenDecisionTraceHtml(featureId, decision);
    }
  }
  function trackerContractHtml(moduleId) {
    var tracker = trackerByModule(moduleId);
    if (!tracker) return "";
    var nudge = tracker.nudge && tracker.nudge.enabled
      ? " NudgeCoordinator intent: " + (tracker.nudge.urgencyTier || "routine") + " tier, " + (tracker.nudge.bundleKey || "unbundled") + " bundle, " + ((tracker.nudge.channelsAllowed || []).join("/") || "in_app") + " channels."
      : " NudgeCoordinator intent: none for user-facing reminders.";
    return reviewerDetails("ProgressTracker: " + (tracker.trackerId || moduleId) + " uses " + (tracker.mode || "tracker") + " with " + (tracker.renderer || "default renderer") + "." + nudge);
  }
  function nudgeStatusPanelHtml(id, state, detail) {
    return '<div class="progress-panel" data-tool="nudge_status" id="' + esc(id) + '"><strong>' + esc(tx("tx.tool.nudge_status.title", "Reminder status")) + "</strong><div>" + esc(state || tx("tx.tool.nudge_status.idle", "No reminder requested yet.")) + '</div><div class="muted">' + esc(detail || tx("tx.tool.nudge_status.prototype_idle", "Prototype reminders are shown here; nothing is sent.")) + "</div></div>";
  }
  function setNudgeStatus(id, state, detail) {
    var status = $(id);
    if (!status) return;
    status.className = "progress-panel";
    status.setAttribute && status.setAttribute("data-tool", "nudge_status");
    status.innerHTML = '<strong>' + esc(tx("tx.tool.nudge_status.title", "Reminder status")) + "</strong><div>" + esc(state || tx("tx.tool.nudge_status.idle", "No reminder requested yet.")) + '</div><div class="muted">' + esc(detail || tx("tx.tool.nudge_status.prototype_idle", "Prototype reminders are shown here; nothing is sent.")) + "</div>";
  }
  function orsZincCareGuideHtml() {
    return '<div class="progress-panel" data-tool="ors_zinc_care_guide">' +
      '<strong>' + esc(tx("tx.ors_zinc.guide.title", "ORS and zinc: how often")) + '</strong>' +
      '<p>' + esc(tx("tx.ors_zinc.guide.ors_until_stop", "Keep giving ORS after each loose stool until diarrhoea stops. Give small sips often; if the child vomits, wait 10 minutes, then continue more slowly.")) + '</p>' +
      '<div class="zinc-guide">' +
      '<div class="zinc-guide-card"><strong>' + esc(tx("tx.ors_zinc.guide.under2_title", "Child under 2 years")) + '</strong>' + esc(tx("tx.ors_zinc.guide.under2_body", "Give 50 to 100 mL ORS after each loose stool, plus usual feeding or breastfeeding.")) + '</div>' +
      '<div class="zinc-guide-card"><strong>' + esc(tx("tx.ors_zinc.guide.age2plus_title", "Child age 2 years or older")) + '</strong>' + esc(tx("tx.ors_zinc.guide.age2plus_body", "Give 100 to 200 mL ORS after each loose stool, plus usual food and fluids.")) + '</div>' +
      '</div>' +
      '<p class="muted">' + esc(tx("tx.ors_zinc.guide.prototype_note", "Prototype WHO-style education only. Use the local ORS packet and local zinc product instructions before real use.")) + '</p></div>';
  }
  function zincCalendarHtml() {
    var boxes = "";
    for (var i = 1; i <= 10; i++) boxes += '<div class="zinc-box" aria-label="Zinc day ' + i + '">Day ' + i + '</div>';
    return '<div class="zinc-calendar" role="img" aria-label="' + esc(tx("tx.zinc.calendar.alt", "Ten-day zinc course calendar")) + '">' + boxes + "</div>";
  }
  function selectedChildAgeMonths() {
    var person = activePersonId ? personById(activePersonId) : null;
    if (!person || !person.birthDate) return null;
    try {
      return engine.derive({ birth_date: person.birthDate, now: new Date().toISOString(), temp_entered_value: 0 }, engine.gd).age_mo;
    } catch (e) {
      return null;
    }
  }
  function zincMixingGuideHtml() {
    var ageMonths = selectedChildAgeMonths();
    var person = activePersonId ? personById(activePersonId) : null;
    var underSix = ageMonths !== null && ageMonths < 6;
    var ageNote = ageMonths === null
      ? tx("tx.zinc.mixing.age_unknown", "The child's age is not available, so both age bands are shown. Confirm the dose from the local product label or a trained health worker.")
      : tx("tx.zinc.mixing.age_selected", "The app used {name}'s saved date of birth to show the age band for this child.", { name: person ? person.name : tx("tx.person.role.child", "the child") });
    var doseCard = underSix
      ? '<div class="zinc-guide-card"><strong>' + esc(tx("tx.zinc.mixing.under6_title", "Under 6 months")) + '</strong>' + esc(tx("tx.zinc.mixing.under6_body", "WHO recommends 10 mg zinc once each day. Use a local 10 mg dose or the exact product instruction from a CHW, clinic, or pharmacy. Dissolve the dose in a spoon or small cup with clean water or breastmilk, then give it slowly.")) + '</div>'
      : (ageMonths !== null
        ? '<div class="zinc-guide-card"><strong>' + esc(tx("tx.zinc.mixing.older_title", "6 months or older")) + '</strong>' + esc(tx("tx.zinc.mixing.older_body", "WHO recommends 20 mg zinc once each day. If the local product is a dispersible tablet, dissolve the dose in a spoon or small cup with clean water or breastmilk, then give it slowly.")) + '</div>'
        : '<div class="zinc-guide-card"><strong>' + esc(tx("tx.zinc.mixing.under6_title", "Under 6 months")) + '</strong>' + esc(tx("tx.zinc.mixing.under6_body", "WHO recommends 10 mg zinc once each day. Use a local 10 mg dose or the exact product instruction from a CHW, clinic, or pharmacy. Dissolve the dose in a spoon or small cup with clean water or breastmilk, then give it slowly.")) + '</div><div class="zinc-guide-card"><strong>' + esc(tx("tx.zinc.mixing.older_title", "6 months or older")) + '</strong>' + esc(tx("tx.zinc.mixing.older_body", "WHO recommends 20 mg zinc once each day. If the local product is a dispersible tablet, dissolve the dose in a spoon or small cup with clean water or breastmilk, then give it slowly.")) + '</div>');
    return '<div class="progress-panel" data-tool="zinc_mixing_guide">' +
      '<strong>' + esc(tx("tx.zinc.mixing.title", "Prepare and give zinc")) + '</strong>' +
      '<p class="muted">' + esc(ageNote) + '</p>' +
      '<div class="zinc-guide">' + doseCard + '</div>' +
      '<div class="inlinevisual">' + renderVisual("zinc_tracker", "Dissolve the dispersible zinc dose in a spoon or small cup with clean water or breastmilk.", "img.generated.zinc_prepare_dispersible_v2") + '</div>' +
      '<p><strong>' + esc(tx("tx.zinc.mixing.prepare_step", "1. Dissolve the dose in a spoon or small cup.")) + '</strong></p>' +
      '<div class="inlinevisual">' + renderVisual("zinc_tracker", "Caregiver slowly giving dissolved zinc from a spoon to a seated toddler.", "img.generated.zinc_give_toddler_v1") + '</div>' +
      '<p><strong>' + esc(tx("tx.zinc.mixing.give_step", "2. Give it slowly with the child sitting upright.")) + '</strong></p>' +
      '<p>' + esc(tx("tx.zinc.mixing.course", "Give zinc every day for 10 days in this prototype. Keep giving ORS until diarrhoea stops.")) + '</p>' +
      '<p class="muted">' + esc(tx("tx.zinc.mixing.no_guess", "Do not split tablets, change doses, or mix zinc into a full ORS bottle unless the local product label or a trained health worker says to.")) + '</p></div>';
  }
  function bindBackHome(scope) {
    var root = scope || document;
    var personBtn = root.querySelector ? root.querySelector("#backperson") : $("backperson");
    if (personBtn && !personBtn.dataset.bound) {
      personBtn.dataset.bound = "backperson";
      personBtn.addEventListener("click", returnToActivePersonPage);
    }
    var btn = root.querySelector ? root.querySelector("#backhome") : $("backhome");
    if (btn && !btn.dataset.bound) {
      btn.dataset.bound = "backhome";
      btn.addEventListener("click", function () {
        showPanel("");
        mode = "subject";
        selected = activeSubject || "child_under5";
        dangerPersonId = null;
        if ($("out")) $("out").innerHTML = "";
        renderCatalog();
      });
    }
  }
  function bindUnder5Back(scope) {
    var root = scope || document;
    var questions = root.querySelector ? root.querySelector("#backtounder5questions") : $("backtounder5questions");
    if (questions && !questions.dataset.bound) {
      questions.dataset.bound = "under5-questions";
      questions.addEventListener("click", returnToPreviousUnder5Step);
    }
    var advice = root.querySelector ? root.querySelector("#backtounder5result") : $("backtounder5result");
    if (advice && !advice.dataset.bound) {
      advice.dataset.bound = "under5-result";
      advice.addEventListener("click", restoreUnder5Result);
    }
  }
  function returnToActivePersonPage() {
    var person = activePersonId ? personById(activePersonId) : null;
    if (!person) {
      goHome();
      return;
    }
    cancelAllUiTimers();
    mode = "person-intent";
    selected = "";
    activeSubject = person.subject;
    dangerPersonId = null;
    search = "";
    if ($("search")) $("search").value = "";
    featureLimit = FEATURE_PAGE_SIZE;
    renderCatalog();
    showPanel("catalog");
    moveToNextStep("filtertitle");
  }
  function returnFromWork() {
    if (mode === "person-intent" && activePersonId && personById(activePersonId)) {
      returnToActivePersonPage();
      return;
    }
    goHome();
  }
  function goHome() {
    cancelAllUiTimers();
    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    showPanel("");
    mode = "subject";
    selected = activeSubject || "child_under5";
    dangerPersonId = null;
    if ($("out")) $("out").innerHTML = "";
    renderCatalog();
  }
  function containerVisual(c) {
    var id = c && c.id ? c.id : "";
    var label = esc(localizedContainerLabel(c));
    if (c && c.iconPath) {
      return '<img class="cardvisual containerphoto" src="' + esc(c.iconPath) + '" alt="' + label + ' with ORS sachet for scale">';
    }
    var shape = '<rect x="28" y="22" width="30" height="42" rx="8" fill="#e9f4f1" stroke="#0b6b5b" stroke-width="2"/>';
    var mark = "";
    if (id === "ceramic_mug") shape = '<path d="M26 28 h30 v30 a8 8 0 0 1 -8 8 h-14 a8 8 0 0 1 -8 -8 z" fill="#e9f4f1" stroke="#0b6b5b" stroke-width="2"/><path d="M56 36 h9 a8 8 0 0 1 0 16 h-9" fill="none" stroke="#0b6b5b" stroke-width="2"/>';
    if (id === "water_bottle_500") shape = '<path d="M36 18 h16 v8 h5 v42 h-26 v-42 h5 z" fill="#e9f4f1" stroke="#0b6b5b" stroke-width="2"/>';
    if (id === "soda_bottle_1500") {
      shape = '<path d="M35 12 h18 v10 c5 5 7 11 7 20 v32 h-32 v-32 c0 -9 2 -15 7 -20 z" fill="#e9f4f1" stroke="#0b6b5b" stroke-width="2"/>';
      mark = '<line x1="28" y1="44" x2="60" y2="44" stroke="#b3261e" stroke-width="3"/><text x="63" y="48" font-size="10" fill="#b3261e">1 L</text>';
    }
    return '<svg class="cardvisual" viewBox="0 0 150 90" role="img" aria-label="' + label + ' with ORS sachet for scale">' +
      shape + mark +
      '<rect x="88" y="26" width="34" height="46" rx="3" fill="#fff4cf" stroke="#6b4d00" stroke-width="2"/><text x="96" y="48" font-size="11" fill="#6b4d00">ORS</text><text x="92" y="61" font-size="7" fill="#6b4d00">sachet</text>' +
      '<text x="12" y="84" font-size="9" fill="#666">' + label + '</text></svg>';
  }
  function localizedContainerLabel(container) {
    if (!container || !container.labels) return "container";
    var locale = $("preflanguage") ? $("preflanguage").value : "en";
    return container.labels[locale] || container.labels.en || "container";
  }
  function provenanceSummary(featureId) {
    var comparison = comparisonByFeature(featureId);
    if (!comparison) return "";
    var pubs = (comparison.sourceIds || []).map(function (id) {
      var source = sourceById(id);
      return source ? source.publisher : id;
    }).filter(Boolean);
    var unique = [];
    for (var i = 0; i < pubs.length; i++) if (unique.indexOf(pubs[i]) < 0) unique.push(pubs[i]);
    return " sources: " + (unique.join(", ") || "none loaded") + "; review: " + comparison.status + "; " + comparison.codexDecision;
  }
  function assetSummary(featureId) {
    var hits = assetManifest.assets.filter(function (asset) {
      return (asset.featureIds || []).indexOf(featureId) >= 0;
    });
    if (!hits.length) return "";
    var selected = displayAssetByFeature(featureId);
    var shown = selected ? [selected] : [];
    for (var h = 0; h < hits.length && shown.length < 2; h++) {
      if (shown.indexOf(hits[h]) < 0) shown.push(hits[h]);
    }
    var audioHit = hits.filter(function (asset) { return asset.assetType === "prototype_audio"; })[0];
    if (audioHit && shown.indexOf(audioHit) < 0) shown.push(audioHit);
    return " asset: " + shown.map(function (asset) {
      var review = asset.clinicalReviewStatus || asset.localReviewStatus || asset.approvalStatus || "Review Needed";
      return asset.assetId + " (" + asset.sourceType + "; " + review + ")";
    }).join(", ") + mediaAssemblySummary(featureId);
  }
  function mediaAssemblySummary(featureId) {
    for (var p = 0; p < mediaPacks.packs.length; p++) {
      var pack = mediaPacks.packs[p];
      var feature = (pack.features || []).filter(function (candidate) { return candidate.featureId === featureId; })[0];
      if (!feature) continue;
      var layerNotes = [];
      for (var i = 0; i < (feature.layers || []).length; i++) {
        var layer = feature.layers[i];
        if (layer.source === "text") {
          layerNotes.push(layer.role + ": text");
        } else if (layer.source === "placeholder") {
          layerNotes.push(layer.role + ": placeholder");
        } else if (layer.source === "pack_asset") {
          var reusable = null;
          for (var r = 0; r < (pack.reusableAssets || []).length; r++) {
            if ((pack.reusableAssets[r].roles || []).indexOf(layer.assetRole) >= 0) reusable = pack.reusableAssets[r];
          }
          var asset = assetById(layer.assetId || (reusable && reusable.assetId));
          layerNotes.push(layer.role + ": " + (asset ? asset.assetId : "missing pack asset"));
        } else {
          var selectedAsset = displayAssetByFeature(featureId);
          layerNotes.push(layer.role + ": " + (selectedAsset ? selectedAsset.assetId : "placeholder"));
        }
      }
      return " media assembly: " + pack.packId + " (" + pack.reviewStatus + "); layers " + layerNotes.join(", ") + ".";
    }
    return "";
  }
  function contractSummary(featureId) {
    var contract = contractByFeature(featureId);
    if (!contract) return "";
    var writes = (contract.writes || []).slice(0, 4).join(", ") || "none";
    var fhir = (contract.fhirResources || []).slice(0, 5).join(", ") || "none";
    return " contract: writes " + writes + "; FHIR " + fhir + "; security " + (contract.securityPosture || "not declared") + "; review " + (contract.reviewStatus || "not declared") + ".";
  }
  function titles(list) {
    return list.map(function (x) { return { id: x.id, title: t(x.titleSlug) }; });
  }
  function featureByLaunch(launch) {
    for (var i = 0; i < catalog.features.length; i++) {
      if (catalog.features[i].launch === launch) return catalog.features[i];
    }
    return null;
  }
  function registryRecordByLaunch(launch) {
    for (var i = 0; i < moduleRegistry.modules.length; i++) {
      if (moduleRegistry.modules[i].launch === launch) return moduleRegistry.modules[i];
    }
    return null;
  }
  function registryErrors() {
    return moduleRegistry.diagnostics.filter(function (diagnostic) { return diagnostic.severity === "error"; });
  }
  function launchFromRegistry(launch) {
    var errors = registryErrors();
    if (errors.length) return { ok: false, error: "Module registry has blocking diagnostics." };
    var record = registryRecordByLaunch(launch);
    if (!record || !record.renderer) return { ok: false, error: "Unknown launch: " + launch };
    return { ok: true, featureId: record.featureId, renderer: record.renderer };
  }
  function moveToNextStep(id) {
    var panel = $(id);
    if (!panel) return;
    if (!panel.getAttribute || panel.getAttribute("tabindex") == null) {
      if (panel.setAttribute) panel.setAttribute("tabindex", "-1");
    }
    if (panel.setAttribute) panel.setAttribute("data-next-step-focus", "true");
    if (panel.scrollIntoView) panel.scrollIntoView({ behavior: "auto", block: "start" });
    if (panel.focus) {
      try { panel.focus({ preventScroll: true }); }
      catch (e) { panel.focus(); }
    }
  }
  var activeShellScreen = "home";
  var activeShellTitle = "";
  function shellScreenLabel() {
    if (activeShellScreen === "people") return tx("tx.shell.nav_people", "People");
    if (activeShellScreen === "learn") return tx("tx.shell.learn_and_practice", "Learn and practice");
    if (activeShellScreen === "tools") return tx("tx.shell.nav_tools", "Tools");
    if (activeShellScreen === "urgent-who") return tx("tx.shell.something_wrong", "Something is wrong");
    if (activeShellScreen === "urgent-check") return under5StageTitle();
    if (activeShellScreen === "work") return activeShellTitle || ($("slidetitle") && $("slidetitle").textContent ? $("slidetitle").textContent : tx("tx.shell.activity", "Activity"));
    return tx("tx.shell.today", "Today");
  }
  function triageProgressHtml() {
    if (activeShellScreen !== "urgent-check") return "";
    var activeStep = under5Stage === "danger" ? "danger"
      : under5Stage === "complaints" ? "symptoms"
      : under5Stage === "result" ? "result"
      : "details";
    var steps = [
      { id: "danger", label: tx("tx.triage.chrome.progress_danger", "Danger signs"), active: activeStep === "danger", done: activeStep !== "danger" },
      { id: "symptoms", label: tx("tx.triage.chrome.progress_main_problem", "Main problem"), active: activeStep === "symptoms", done: activeStep === "details" || activeStep === "result" },
      { id: "details", label: tx("tx.triage.chrome.progress_details", "Details"), active: activeStep === "details", done: activeStep === "result" }
    ];
    steps.push({ id: "result", label: tx("tx.triage.chrome.progress_result", "Result"), active: activeStep === "result", done: false });
    return steps.map(function (step) {
      return '<span class="progressstep ' + (step.active ? "active " : "") + (step.done ? "done" : "") + '"' + (step.active ? ' aria-current="step"' : "") + '>' + esc(step.label) + "</span>";
    }).join("");
  }
  function applyShellVisibility() {
    var demoEnabled = $("demomodeon") && $("demomodeon").checked;
    var showHome = activeShellScreen === "home";
    var showCatalog = activeShellScreen === "people" || activeShellScreen === "learn" || activeShellScreen === "tools" || activeShellScreen === "urgent-who";
    var showWork = activeShellScreen === "work";
    var showTriage = activeShellScreen === "urgent-check";
    if ($("todaypanel")) $("todaypanel").classList.toggle("hidden", !(showHome && !demoEnabled));
    if ($("demomode")) $("demomode").classList.toggle("hidden", !(showHome && demoEnabled));
    if ($("catalogshell")) $("catalogshell").classList.toggle("hidden", !showCatalog);
    var choosingPerson = activeShellScreen === "people" && mode === "subject" && !activePersonId;
    var routeChosen = !!search || (mode === "person-intent" && !!selected) || (mode === "learn" && !!selected) || (mode === "type" && !!selected);
    if ($("familypanel")) $("familypanel").classList.toggle("hidden", !choosingPerson);
    if ($("catalogstep")) $("catalogstep").classList.toggle("hidden", choosingPerson);
    if ($("featurelist")) $("featurelist").classList.toggle("hidden", choosingPerson);
    if ($("catalogtoolbar")) $("catalogtoolbar").classList.toggle("hidden", !routeChosen);
    if ($("slideshow")) $("slideshow").classList.toggle("hidden", !showWork);
    if ($("triagepanel")) $("triagepanel").classList.toggle("hidden", !showTriage);
    if ($("screenbar")) $("screenbar").classList.toggle("hidden", showHome);
    if ($("screenlabel")) $("screenlabel").textContent = shellScreenLabel();
    if ($("screenprogress")) $("screenprogress").innerHTML = triageProgressHtml();
    ["navhome", "navpeople", "navlearn", "navtools", "navurgent"].forEach(function (id) {
      var nav = $(id);
      if (!nav) return;
      var on = (id === "navhome" && activeShellScreen === "home") ||
        (id === "navpeople" && activeShellScreen === "people") ||
        (id === "navlearn" && activeShellScreen === "learn") ||
        (id === "navtools" && activeShellScreen === "tools") ||
        (id === "navurgent" && (activeShellScreen === "urgent-who" || activeShellScreen === "urgent-check"));
      nav.classList.toggle("active", on);
    });
  }
  function showCatalogScreen(screen, nextMode, nextSelected, startCareCheck) {
    stopReadAloudForContextChange("Read-aloud stopped because the screen changed.");
    activeShellScreen = screen || "people";
    if (nextMode) mode = nextMode;
    if (nextSelected) selected = nextSelected;
    if (screen === "people") { mode = "subject"; selected = ""; activeSubject = ""; activePersonId = null; dangerPersonId = null; careEntryStartsCheck = !!startCareCheck; }
    if (screen === "learn") { mode = "learn"; selected = ""; activePersonId = null; }
    if (screen === "tools") { mode = "type"; selected = ""; activePersonId = null; }
    featureLimit = FEATURE_PAGE_SIZE;
    search = "";
    if ($("search")) $("search").value = "";
    renderCatalog();
    applyShellVisibility();
    moveToNextStep("catalogshell");
  }
  function showPanel(id) {
    stopReadAloudForContextChange("Read-aloud stopped because the screen changed.");
    if ($("slideshow") && $("slideshow").setAttribute) $("slideshow").setAttribute("data-screen-id", "");
    if (id === "slideshow" && $("slideimage")) $("slideimage").classList.remove("hidden");
    if (id === "slideshow") activeShellScreen = "work";
    else if (id === "triagepanel") activeShellScreen = "urgent-check";
    else if (id === "catalog") activeShellScreen = mode === "danger" && !dangerPersonId ? "urgent-who" : (mode === "learn" ? "learn" : mode === "type" ? "tools" : "people");
    else { activeShellScreen = "home"; activeShellTitle = ""; }
    applyShellVisibility();
    updateSlideNavigation(id === "slideshow" && activeSlides.length > 1);
    if (id === "slideshow" || id === "triagepanel") moveToNextStep(id);
    else if (id === "catalog") moveToNextStep("catalogshell");
  }
  function updateSlideNavigation(visible) {
    var isDeck = !!visible && activeSlides.length > 1;
    var prev = $("slideprev"), next = $("slidenext"), read = $("slideread");
    if (prev) {
      prev.classList.toggle("hidden", !isDeck);
      prev.disabled = !isDeck || slideIndex === 0;
      prev.classList.toggle("ghost", prev.disabled);
      prev.setAttribute("aria-hidden", isDeck ? "false" : "true");
    }
    if (next) {
      next.classList.toggle("hidden", !isDeck);
      next.disabled = !isDeck || slideIndex === activeSlides.length - 1;
      next.classList.toggle("ghost", next.disabled);
      next.setAttribute("aria-hidden", isDeck ? "false" : "true");
    }
    // The listening control is live on any visible work screen. Deck pages need it
    // too, but ordinary tools and checklists must not be accidentally disabled.
    if (read) {
      var readableWorkVisible = isDeck || !!($("slideshow") && !$("slideshow").classList.contains("hidden"));
      read.disabled = !readableWorkVisible;
      read.classList.toggle("ghost", !readableWorkVisible);
      read.setAttribute("aria-disabled", readableWorkVisible ? "false" : "true");
    }
  }
  function refocusActiveWorkPanel() {
    setTimeout(function () {
      var slideshow = $("slideshow");
      var triage = $("triagepanel");
      if (slideshow && !slideshow.classList.contains("hidden")) moveToNextStep("slideshow");
      else if (triage && !triage.classList.contains("hidden")) moveToNextStep("triagepanel");
    }, 0);
  }
  function todayIsoDate() {
    return new Date().toISOString().slice(0, 10);
  }
  function applyBirthDateBounds() {
    var today = todayIsoDate();
    ["persondob", "dob"].forEach(function (id) {
      var input = $(id);
      if (!input) return;
      input.min = input.min || "1900-01-01";
      input.max = today;
    });
  }
  function isFutureBirthDate(value) {
    return /^\d{4}-\d{2}-\d{2}$/.test(value || "") && value > todayIsoDate();
  }
  function updateAgeFromDob() {
    var dob = $("dob");
    if (!dob) return;
    var v = dob.value;
    if (!v) { $("age").textContent = ""; return; }
    if (isFutureBirthDate(v)) {
      dob.value = "";
      $("age").textContent = tx("tx.triage.chrome.future_birth_date", "Date of birth cannot be in the future.");
      return;
    }
    try { $("age").textContent = tx("tx.triage.chrome.age_months", "Age: {months} months", { months: engine.derive({ birth_date: v, now: new Date().toISOString(), temp_entered_value: 0 }, engine.gd).age_mo }); } catch (e) { $("age").textContent = ""; }
  }
  function applyKnownDob(person) {
    if (!person || !person.birthDate || !$("dob")) return;
    $("dob").value = person.birthDate;
    updateAgeFromDob();
  }
  function childPeople() {
    return people.filter(function (p) { return p.subject === "child_under5"; });
  }
  function defaultChildPerson() {
    var person = activePersonId ? personById(activePersonId) : null;
    if (!person && dangerPersonId) person = personById(dangerPersonId);
    if (!person || person.subject !== "child_under5") person = personById("demo_child") || childPeople()[0] || null;
    return person && person.subject === "child_under5" ? person : null;
  }
  function defaultChildDob() {
    var person = defaultChildPerson();
    return person && person.subject === "child_under5" ? person.birthDate || "" : "";
  }
  function renderChildSelect(selectedId) {
    var select = $("triagechildselect");
    if (!select) return;
    var kids = childPeople();
    select.innerHTML = kids.map(function (p) {
      return '<option value="' + esc(p.id) + '">' + esc(p.name) + (p.birthDate ? " - " + esc(tx("tx.triage.chrome.date_of_birth", "Date of birth")) + " " + esc(p.birthDate) : "") + "</option>";
    }).join("") + '<option value="">' + esc(tx("tx.triage.chrome.add_unknown_child", "Add/unknown child")) + "</option>";
    select.value = selectedId || "";
  }
  function dangerAcknowledged() {
    if ($("s_no_danger_signs") && $("s_no_danger_signs").checked) return true;
    for (var i = 0; i < DANGER.length; i++) {
      var box = $("s_" + DANGER[i].id);
      if (box && box.checked) return true;
    }
    return false;
  }
  function updateDangerGate() {
    var ack = under5DangerGateUpdate ? under5DangerGateUpdate() : dangerAcknowledged();
    if (activeShellScreen === "urgent-check") applyShellVisibility();
    return ack;
  }
  function resetDangerGate() {
    if ($("s_no_danger_signs")) $("s_no_danger_signs").checked = false;
    updateDangerGate();
  }
  function resetUnder5TriageSession() {
    // A triage check is a new caregiver report.  Do not carry any clinical
    // answer, result, or timed-breathing state into another entry or child.
    var panel = $("triagepanel");
    if (panel && panel.querySelectorAll) {
      var boxes = panel.querySelectorAll('input[type="checkbox"]');
      for (var i = 0; i < boxes.length; i++) boxes[i].checked = false;
    }
    ["diarrhoeadays", "feverdays", "fevertempvalue"].forEach(function (id) {
      if ($(id)) $(id).value = "";
    });
    if ($("diarrhoeadays")) delete $("diarrhoeadays").dataset.notSure;
    if ($("feverrdt")) $("feverrdt").value = "not_done";
    if ($("fevertempunit")) $("fevertempunit").value = "unknown";
    if ($("fevertempsite")) $("fevertempsite").value = "unknown";
    if ($("out")) $("out").innerHTML = "";
    resetRR();
    resetDangerGate();
  }
  function markNoDangerSignsForDemo() {
    if ($("s_no_danger_signs")) $("s_no_danger_signs").checked = true;
    DANGER.forEach(function (q) { var box = $("s_" + q.id); if (box) box.checked = false; });
    updateDangerGate();
  }
  function prepareChildTriage(person) {
    activeSubject = "child_under5";
    under5Stage = "danger";
    under5BranchQueue = [];
    under5BranchIndex = 0;
    coughChoiceState = {};
    resetUnder5TriageSession();
    person = person && person.subject === "child_under5" ? person : defaultChildPerson();
    if (person) {
      activePersonId = person.id;
      dangerPersonId = person.id;
      renderChildSelect(person.id);
      applyKnownDob(person);
    } else {
      renderChildSelect("");
    }
    renderUnder5DangerGate();
    showUnder5Stage("danger");
  }
  function cancelUiCountdown() {
    if (uiTimer && uiTimer.interval !== null) {
      clearInterval(uiTimer.interval);
    }
    uiTimer = null;
    stopPrototypeMusic(null, "Prototype tune stopped.");
  }
  function cancelAllUiTimers() {
    cancelUiCountdown();
  }
  function formatTimerClock(seconds) {
    var remaining = Math.max(0, Math.ceil(seconds));
    var minutes = Math.floor(remaining / 60);
    var secs = remaining % 60;
    return minutes + ":" + (secs < 10 ? "0" : "") + secs;
  }
  function uiTimerStatusText(timer) {
    if (!timer) return "Timer idle.";
    if (timer.status === "paused") return timer.label + " timer paused.";
    if (timer.status === "complete") return timer.label + " timer complete.";
    if (timer.status === "idle") return timer.label + " timer ready.";
    return timer.label + " timer running.";
  }
  function updateUiTimerControls() {
    var timer = uiTimer;
    var status = $("timerstatus");
    if (status) status.textContent = uiTimerStatusText(timer);
    var clock = $("timerclock");
    var caption = $("timercaption");
    var bar = $("timerbarfill");
    if (timer && clock) clock.textContent = timer.mode === "elapsed" ? formatTimerClock(timer.elapsed || 0) : formatTimerClock(timer.remaining);
    if (timer && caption) {
      if (timer.mode === "elapsed") {
        caption.textContent = timer.status === "idle"
          ? (timer.idleCaption || "Ready to start.")
          : (timer.runningCaption || "Elapsed time. Stop when finished.");
      } else {
        caption.textContent = timer.status === "complete"
          ? "Done."
          : (timer.status === "idle" ? "Ready to start again." : timer.remaining + " seconds remaining.");
      }
    }
    if (timer && bar) {
      var pct = timer.mode === "elapsed"
        ? (timer.duration > 0 ? Math.max(0, Math.min(100, ((timer.elapsed || 0) / timer.duration) * 100)) : 0)
        : (timer.duration > 0 ? Math.max(0, Math.min(100, (timer.remaining / timer.duration) * 100)) : 0);
      bar.style.width = pct + "%";
      bar.setAttribute && bar.setAttribute("aria-valuenow", String(Math.round(pct)));
    }
    if (!timer) return;
    var start = timer.startId ? $(timer.startId) : null;
    var pause = timer.pauseId ? $(timer.pauseId) : null;
    var reset = timer.resetId ? $(timer.resetId) : null;
    if (start) {
      start.disabled = timer.status === "running";
      start.textContent = timer.status === "running" ? "Timer running" : (timer.status === "paused" ? "Resume timer" : timer.startText);
    }
    if (pause) {
      pause.disabled = timer.status === "idle" || timer.status === "complete";
      pause.textContent = timer.status === "paused" ? "Resume" : "Pause";
    }
    if (reset) reset.disabled = false;
  }
  function runUiCountdownTick() {
    if (!uiTimer || uiTimer.status !== "running") return;
    if (uiTimer.mode === "elapsed") {
      uiTimer.elapsed = (uiTimer.elapsed || 0) + 1;
      updateUiTimerControls();
      return;
    }
    uiTimer.remaining = Math.max(uiTimer.remaining - 1, 0);
    updateUiTimerControls();
    if (uiTimer.remaining <= 0) {
      if (uiTimer.interval !== null) clearInterval(uiTimer.interval);
      uiTimer.interval = null;
      uiTimer.status = "complete";
      updateUiTimerControls();
      if (uiTimer.onComplete) uiTimer.onComplete();
    }
  }
  function scheduleUiCountdown() {
    if (!uiTimer) return;
    if (uiTimer.interval !== null) clearInterval(uiTimer.interval);
    uiTimer.interval = setInterval(runUiCountdownTick, 1000);
    if (uiTimer.interval && uiTimer.interval.unref) uiTimer.interval.unref();
  }
  function startUiCountdown(label, seconds, onComplete, controls) {
    cancelUiCountdown();
    var duration = Math.max(0, Math.ceil(seconds));
    controls = controls || {};
    uiTimer = {
      mode: "countdown",
      label: label,
      duration: duration,
      remaining: duration,
      elapsed: 0,
      status: "running",
      interval: null,
      onComplete: onComplete || null,
      startId: controls.startId || "",
      pauseId: controls.pauseId || "",
      resetId: controls.resetId || "",
      startText: controls.startText || "Start",
      musicAssetId: controls.musicAssetId || "",
      musicStatusId: controls.musicStatusId || "musicstatus",
      musicLoop: controls.musicLoop !== false
    };
    updateUiTimerControls();
    if (uiTimer.musicAssetId) playPrototypeMusic(uiTimer.musicAssetId, uiTimer.musicStatusId, uiTimer.musicLoop);
    if (duration <= 0) runUiCountdownTick();
    else scheduleUiCountdown();
  }
  function startUiElapsedTimer(label, targetSeconds, controls) {
    cancelUiCountdown();
    var duration = Math.max(1, Math.ceil(targetSeconds || 3600));
    controls = controls || {};
    uiTimer = {
      mode: "elapsed",
      label: label,
      duration: duration,
      remaining: 0,
      elapsed: 0,
      status: "running",
      interval: null,
      onComplete: null,
      startId: controls.startId || "",
      pauseId: controls.pauseId || "",
      resetId: controls.resetId || "",
      startText: controls.startText || "Start",
      musicAssetId: controls.musicAssetId || "",
      musicStatusId: controls.musicStatusId || "musicstatus",
      musicLoop: controls.musicLoop !== false,
      idleCaption: controls.idleCaption || "Ready to start.",
      runningCaption: controls.runningCaption || "Elapsed time. Stop when finished."
    };
    updateUiTimerControls();
    if (uiTimer.musicAssetId) playPrototypeMusic(uiTimer.musicAssetId, uiTimer.musicStatusId, uiTimer.musicLoop);
    scheduleUiCountdown();
  }
  function pauseOrResumeUiCountdown() {
    if (!uiTimer) return;
    if (uiTimer.status === "running") {
      if (uiTimer.interval !== null) clearInterval(uiTimer.interval);
      uiTimer.interval = null;
      uiTimer.status = "paused";
      pausePrototypeMusic();
      updateUiTimerControls();
      return;
    }
    if (uiTimer.status === "paused") {
      uiTimer.status = "running";
      resumePrototypeMusic();
      updateUiTimerControls();
      scheduleUiCountdown();
    }
  }
  function resetUiCountdown() {
    if (!uiTimer) return;
    if (uiTimer.interval !== null) clearInterval(uiTimer.interval);
    uiTimer.interval = null;
    uiTimer.remaining = uiTimer.mode === "elapsed" ? 0 : uiTimer.duration;
    uiTimer.elapsed = 0;
    uiTimer.status = "idle";
    stopPrototypeMusic(null, "Prototype tune stopped. Tap Start to play it again.");
    updateUiTimerControls();
  }
  function bindUiCountdownButton(id, action) {
    var button = $(id);
    if (button && !button.dataset.bound) {
      button.dataset.bound = "timer";
      button.addEventListener("click", action);
    }
  }
  function timerPanelHtml(title, durationLabel, readyText, options) {
    options = options || {};
    var music = options.includeMusic === false ? "" : '<div class="muted" id="musicstatus">Tune ready.</div>';
    var ariaLabel = options.ariaLabel || (title + " remaining time");
    return '<div class="progress-panel timer-panel"><div class="timer-topline"><strong>' + esc(title) + '</strong><span id="timerstatus">' + esc(readyText || "Timer ready.") + '</span></div><div class="timer-clock" id="timerclock">' + esc(durationLabel) + '</div><div class="timerbar" role="progressbar" aria-label="' + esc(ariaLabel) + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="100"><div class="timerbarfill" id="timerbarfill"></div></div><div class="timer-caption" id="timercaption">Tap Start when ready.</div>' + music + '</div>';
  }
  function setMusicStatus(statusId, text) {
    var node = statusId ? $(statusId) : $("musicstatus");
    if (node) node.textContent = text;
  }
  function stopPrototypeMusic(statusId, text) {
    if (currentPrototypeMusic && currentPrototypeMusic.audio) {
      try {
        currentPrototypeMusic.audio.pause();
        currentPrototypeMusic.audio.currentTime = 0;
      } catch (e) {
        // Best-effort cleanup only; visible status still matters more for the prototype.
      }
    }
    var priorStatus = statusId || (currentPrototypeMusic && currentPrototypeMusic.statusId);
    currentPrototypeMusic = null;
    if (text) setMusicStatus(priorStatus, text);
  }
  function pausePrototypeMusic() {
    if (!currentPrototypeMusic) return;
    if (currentPrototypeMusic.audio) {
      try { currentPrototypeMusic.audio.pause(); } catch (e) { return; }
    }
    setMusicStatus(currentPrototypeMusic.statusId, "Tune paused.");
  }
  function resumePrototypeMusic() {
    if (!currentPrototypeMusic || !currentPrototypeMusic.audio) return;
    try {
      var playResult = currentPrototypeMusic.audio.play();
      if (playResult && playResult.catch) playResult.catch(function () {
        setMusicStatus(currentPrototypeMusic.statusId, "Tap Play tune if the browser blocked audio.");
      });
      setMusicStatus(currentPrototypeMusic.statusId, "Tune playing.");
    } catch (e) {
      setMusicStatus(currentPrototypeMusic.statusId, "Tune could not play in this browser.");
    }
  }
  function playPrototypeMusic(assetId, statusId, loop, labels) {
    labels = labels || {};
    var message = function (key, fallback) { return labels[key] || fallback; };
    var asset = assetById(assetId);
    if (!asset || !asset.targetPath) {
      setMusicStatus(statusId, message("missing", "Tune is missing from the asset manifest."));
      return false;
    }
    stopPrototypeMusic(statusId, "");
    if (typeof Audio === "undefined") {
      currentPrototypeMusic = { audio: null, assetId: assetId, statusId: statusId, loop: !!loop, context: labels.context || "" };
      setMusicStatus(statusId, message("unavailable", "Tune ready; audio playback is unavailable in this test browser."));
      return false;
    }
    try {
      var audio = new Audio(asset.targetPath);
      audio.loop = !!loop;
      audio.onended = function () { setMusicStatus(statusId, message("complete", "Tune complete.")); };
      audio.onerror = function () { setMusicStatus(statusId, message("failed", "Tune could not load; keep using the visible timer.")); };
      currentPrototypeMusic = { audio: audio, assetId: assetId, statusId: statusId, loop: !!loop, context: labels.context || "" };
      var playResult = audio.play();
      if (playResult && playResult.catch) playResult.catch(function () {
        setMusicStatus(statusId, message("blocked", "Tap Play tune if the browser blocked audio."));
      });
      setMusicStatus(statusId, message("playing", "Tune playing."));
      return true;
    } catch (e) {
      currentPrototypeMusic = null;
      setMusicStatus(statusId, message("failed", "Tune could not play in this browser."));
      return false;
    }
  }
  function togglePrototypeMusic(assetId, statusId, loop, labels) {
    labels = labels || {};
    if (currentPrototypeMusic && currentPrototypeMusic.assetId === assetId) {
      stopPrototypeMusic(statusId, labels.stopped || "Tune stopped.");
      return false;
    }
    return playPrototypeMusic(assetId, statusId, loop, labels);
  }
  function stopPrototypeMusicForContext(context) {
    if (!context || !currentPrototypeMusic || currentPrototypeMusic.context !== context) return;
    stopPrototypeMusic(currentPrototypeMusic.statusId, "");
  }
  var currentPrototypeSpeechText = "";
  var prototypeSpeechPaused = false;
  var prototypeSpeechActive = false;
  // Every context change gets a new generation.  Browser speech callbacks can arrive after
  // cancel(), so handlers must prove they still belong to the visible screen before updating it.
  var prototypeSpeechGeneration = 0;
  var guidedSpeechItems = [];
  var guidedSpeechIndex = 0;
  var guidedSpeechActive = false;
  var guidedSpeechElement = null;
  function clearGuidedSpeechHighlight() {
    if (guidedSpeechElement && guidedSpeechElement.classList) guidedSpeechElement.classList.remove("is-speaking");
    guidedSpeechElement = null;
  }
  function collectReadAloudItems() {
    if (!document.querySelectorAll) return [];
    var candidates = document.querySelectorAll("main h1, main h2, main h3, main legend, main p, main label, main button");
    return Array.prototype.filter.call(candidates, function (el) {
      if (!el || !el.textContent || !el.textContent.trim()) return false;
      if (el.closest && (el.closest(".hidden") || el.closest(".reviewer-settings") || el.closest(".trace"))) return false;
      if (typeof window !== "undefined" && window.getComputedStyle) {
        var style = window.getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden") return false;
      }
      return true;
    });
  }
  function updateGuidedListenButton() {
    var button = $("listenbutton"), label = $("listenlabel");
    if (button) button.setAttribute("aria-pressed", guidedSpeechActive ? "true" : "false");
    if (label) label.textContent = guidedSpeechActive ? tx("tx.stop_listening", "Stop") : tx("tx.listen", "Listen");
  }
  function stopGuidedReading(message) {
    guidedSpeechActive = false;
    guidedSpeechItems = [];
    guidedSpeechIndex = 0;
    clearGuidedSpeechHighlight();
    cancelPrototypeSpeech(message || "Read-aloud stopped.");
    updateGuidedListenButton();
  }
  function speakNextGuidedItem() {
    if (!guidedSpeechActive || guidedSpeechIndex >= guidedSpeechItems.length) {
      stopGuidedReading("Read-aloud complete.");
      return;
    }
    clearGuidedSpeechHighlight();
    var el = guidedSpeechItems[guidedSpeechIndex++];
    guidedSpeechElement = el;
    if (el.classList) el.classList.add("is-speaking");
    if (el.scrollIntoView) el.scrollIntoView({ block: "center", behavior: "smooth" });
    var Utterance = typeof window !== "undefined" && window.SpeechSynthesisUtterance ? window.SpeechSynthesisUtterance : null;
    if (!Utterance || !window.speechSynthesis) { stopGuidedReading("Read-aloud is unavailable in this browser."); return; }
    var utterance = new Utterance((el.textContent || "").replace(/\s+/g, " ").trim());
    utterance.lang = "en";
    var speechGeneration = prototypeSpeechGeneration;
    utterance.onend = function () {
      if (!guidedSpeechActive || speechGeneration !== prototypeSpeechGeneration) return;
      speakNextGuidedItem();
    };
    utterance.onerror = function () {
      if (!guidedSpeechActive || speechGeneration !== prototypeSpeechGeneration) return;
      stopGuidedReading("Read-aloud error. The text remains visible.");
    };
    window.speechSynthesis.speak(utterance);
    setReadAloudStatus("Reading the highlighted item.");
  }
  function startGuidedReading() {
    stopGuidedReading();
    guidedSpeechItems = collectReadAloudItems();
    if (!guidedSpeechItems.length) { setReadAloudStatus("There is no readable text on this screen."); return; }
    guidedSpeechActive = true;
    updateGuidedListenButton();
    speakNextGuidedItem();
  }
  function setReadAloudStatus(message) {
    var localStatus = $("audiostatus");
    var globalStatus = $("globalaudiostatus");
    if (localStatus) localStatus.textContent = message;
    if (globalStatus) globalStatus.textContent = message;
  }
  function setGlobalReadAloudPauseLabel(label) {
    var button = $("slidepauseaudio");
    if (button) button.textContent = label;
  }
  function cancelPrototypeSpeech(message) {
    var wasActive = prototypeSpeechActive || prototypeSpeechPaused;
    prototypeSpeechGeneration += 1;
    if (typeof window !== "undefined" && window.speechSynthesis && window.speechSynthesis.cancel) {
      try { window.speechSynthesis.cancel(); } catch (e) { return false; }
    }
    prototypeSpeechPaused = false;
    prototypeSpeechActive = false;
    setGlobalReadAloudPauseLabel("Pause");
    if (message && wasActive) setReadAloudStatus(message);
    return true;
  }
  function stopReadAloudForContextChange(message) {
    var wasReading = guidedSpeechActive || prototypeSpeechActive || prototypeSpeechPaused;
    guidedSpeechActive = false;
    guidedSpeechItems = [];
    guidedSpeechIndex = 0;
    clearGuidedSpeechHighlight();
    // A changed page must stop active speech so words never describe the wrong page.
    // Do not announce a stop when the caregiver was not listening.
    cancelPrototypeSpeech(wasReading ? (message || "Read-aloud stopped.") : "");
    updateGuidedListenButton();
  }
  function selectPreferredSpeechVoice() {
    if (typeof window === "undefined" || !window.speechSynthesis || !window.speechSynthesis.getVoices) return null;
    var voices = window.speechSynthesis.getVoices() || [];
    var englishVoices = voices.filter(function (voice) { return /^en/i.test(voice.lang || ""); });
    var pool = englishVoices.length ? englishVoices : voices;
    var preferredVoice = pool.filter(function (voice) {
      return /female|woman|zira|samantha|jenny|aria|victoria|karen|serena|susan|tessa|moira|eva/i.test((voice.name || "") + " " + (voice.voiceURI || ""));
    })[0];
    return preferredVoice || pool[0] || null;
  }
  function playPrototypeSpeech(text) {
    var Utterance = typeof window !== "undefined" && window.SpeechSynthesisUtterance ? window.SpeechSynthesisUtterance : (typeof SpeechSynthesisUtterance !== "undefined" ? SpeechSynthesisUtterance : null);
    text = (text || "").replace(/\s+/g, " ").trim();
    if (!text) {
      setReadAloudStatus("Read-aloud needs visible text on this screen.");
      return false;
    }
    if (typeof window === "undefined" || !window.speechSynthesis || !Utterance) {
      setReadAloudStatus("Read-aloud ready; browser speech synthesis is unavailable here.");
      return false;
    }
    // A screen-level reading request supersedes any guided item sequence.
    guidedSpeechActive = false;
    guidedSpeechItems = [];
    guidedSpeechIndex = 0;
    clearGuidedSpeechHighlight();
    updateGuidedListenButton();
    cancelPrototypeSpeech();
    currentPrototypeSpeechText = text;
    var utterance = new Utterance(text);
    var speechGeneration = prototypeSpeechGeneration;
    utterance.lang = "en";
    var preferredVoice = selectPreferredSpeechVoice();
    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.pitch = 1.05;
    utterance.onend = function () {
      if (speechGeneration !== prototypeSpeechGeneration) return;
      prototypeSpeechPaused = false;
      prototypeSpeechActive = false;
      setGlobalReadAloudPauseLabel("Pause");
      setReadAloudStatus("Read-aloud complete.");
    };
    utterance.onerror = function () {
      if (speechGeneration !== prototypeSpeechGeneration) return;
      prototypeSpeechPaused = false;
      prototypeSpeechActive = false;
      setGlobalReadAloudPauseLabel("Pause");
      setReadAloudStatus("Read-aloud error; show the text and try again.");
    };
    window.speechSynthesis.speak(utterance);
    prototypeSpeechPaused = false;
    prototypeSpeechActive = true;
    setGlobalReadAloudPauseLabel("Pause");
    setReadAloudStatus("Read-aloud playing through browser speech synthesis.");
    return true;
  }
  function pausePrototypeSpeech() {
    if (typeof window === "undefined" || !window.speechSynthesis || !window.speechSynthesis.pause) {
      setReadAloudStatus("Pause unavailable in this browser; the text remains visible.");
      return false;
    }
    try {
      if (prototypeSpeechPaused && window.speechSynthesis.resume) {
        window.speechSynthesis.resume();
        prototypeSpeechPaused = false;
        setGlobalReadAloudPauseLabel("Pause");
        setReadAloudStatus("Read-aloud playing through browser speech synthesis.");
        return true;
      }
      window.speechSynthesis.pause();
      prototypeSpeechPaused = true;
      setGlobalReadAloudPauseLabel("Resume");
      setReadAloudStatus("Read-aloud paused.");
      return true;
    } catch (e) {
      setReadAloudStatus("Pause unavailable in this browser; the text remains visible.");
      return false;
    }
  }
  function stopPrototypeSpeech() {
    // An explicit Stop deserves confirmation even if a previous page change already
    // ended the audio. Context changes, by contrast, stay quiet when nothing was playing.
    var stopped = cancelPrototypeSpeech();
    if (stopped) setReadAloudStatus("Read-aloud stopped.");
    return stopped;
  }
  function restartPrototypeSpeech(text) {
    var nextText = (text || currentPrototypeSpeechText || "").replace(/\s+/g, " ").trim();
    if (!nextText) nextText = currentScreenReadAloudText();
    return playPrototypeSpeech(nextText);
  }
  function readableTextFromElement(el) {
    if (!el) return "";
    if (typeof el.cloneNode !== "function") return (el.textContent || "").replace(/\s+/g, " ").trim();
    var clone = el.cloneNode(true);
    var remove = clone.querySelectorAll("details, script, style, .trace, .provenance, .prototype-review");
    for (var i = 0; i < remove.length; i++) remove[i].parentNode.removeChild(remove[i]);
    return (clone.textContent || "").replace(/\s+/g, " ").trim();
  }
  function currentScreenReadAloudText() {
    var pieces = [];
    ["slidetitle", "slidetext", "slidecache", "out"].forEach(function (id) {
      var text = readableTextFromElement($(id));
      if (text && pieces.indexOf(text) === -1) pieces.push(text);
    });
    return pieces.join(". ").slice(0, 3500);
  }
  function openModuleRecord(feature, title) {
    var launched = launchFromRegistry(feature.launch);
    if (!launched.ok) {
      showPrototypeCard(title || (feature ? t(feature.titleSlug) : tx("tx.prototype.unavailable.title", "Not available in this prototype")), prototypeUnavailableBody(), tx("tx.prototype.unavailable.visual", "This activity is not available in the current prototype build."), feature && feature.id, launched.error);
      return;
    }
    var renderer = launched.renderer;
    if (renderer.kind === "triage") { prepareChildTriage(defaultChildPerson()); showPanel("triagepanel"); }
    else if (renderer.kind === "ors.voucher") openDemoDiarrhoeaGate();
    else if (renderer.kind === "sequence.deck") showDeck(feature.id);
    else if (renderer.launch === "dental.brushing") showDentalBrushingCoach();
    else if (renderer.launch === "dental.triage") showDentalTriageChecklist();
    else if (renderer.kind.indexOf("tool.") === 0) showToolCard(feature.id);
    else if (renderer.kind === "story.deck") showStoryCard(feature.id);
    else if (renderer.kind === "screen.checklist") showScreenCard(feature.id);
    else showPrototypeCard(title || (feature ? t(feature.titleSlug) : tx("tx.prototype.unavailable.title", "Not available in this prototype")), prototypeUnavailableBody(), tx("tx.prototype.unavailable.visual", "This activity is not available in the current prototype build."), feature && feature.id, "Unsupported renderer kind: " + renderer.kind);
  }
  function openLaunch(launch, title) {
    activeShellTitle = title || "";
    var feature = featureByLaunch(launch);
    if (feature) {
      activeShellTitle = t(feature.titleSlug) || title || "";
      openModuleRecord(feature, title);
      refocusActiveWorkPanel();
      return;
    }
    showPrototypeCard(title || tx("tx.prototype.unavailable.title", "Not available in this prototype"), prototypeUnavailableBody(), tx("tx.prototype.unavailable.visual", "This activity is not available in the current prototype build."), null, "Unknown launch id: " + launch);
  }
  function urgentFeaturesForSubject(subject) {
    return (catalog.features || []).filter(function (f) {
      return profileAllows(f) && !!f.dangerEligible && (f.subject || []).indexOf(subject) >= 0;
    });
  }
  function beginDangerFlow() {
    // Urgent must never silently reuse the last person viewed.  A shared phone
    // may be in a different caregiver's hands, and the wrong subject opens the
    // wrong danger screen.  Always make the subject choice explicit.
    mode = "danger";
    selected = "who";
    dangerPersonId = null;
    renderCatalog();
    showPanel("catalog");
  }
  function selectDangerPerson(personId) {
    var person = personById(personId);
    if (!person) return;
    activePersonId = person.id;
    dangerPersonId = person.id;
    activeSubject = person.subject;
    selected = "danger";
    renderCatalog();
    if (activeSubject === "child_under5") {
      prepareChildTriage(person);
      showPanel("triagepanel");
      $("out").innerHTML = "";
    } else if (activeSubject === "pregnancy") {
      showPregnancyUrgentIntake(person);
    } else if (activeSubject === "newborn_mom") {
      showPncLactationDangerChecklist();
    } else if (activeSubject === "newborn_baby") {
      showNewbornDangerChecklist();
    } else {
      var urgent = urgentFeaturesForSubject(activeSubject);
      if (urgent.length) openLaunch(urgent[0].launch, t(urgent[0].titleSlug));
    }
  }
  function openColdFluSickChildCheck() {
    activeSubject = "child_under5";
    activePersonId = "demo_child";
    mode = "danger";
    selected = "danger";
    dangerPersonId = "demo_child";
    renderCatalog();
    applyKnownDob(personById(dangerPersonId));
    resetDangerGate();
    markNoDangerSignsForDemo();
    showPanel("triagepanel");
    var cough = $("s_cough");
    if (cough) cough.checked = true;
    if ($("coughgroup")) $("coughgroup").classList.remove("hidden");
    if ($("rrsection")) $("rrsection").classList.remove("hidden");
  }
  function openDemoDiarrhoeaGate() {
    activeSubject = "child_under5";
    activePersonId = "demo_child";
    mode = "danger";
    selected = "danger";
    dangerPersonId = "demo_child";
    renderCatalog();
    prepareChildTriage(personById(dangerPersonId));
    showPanel("triagepanel");
    $("out").innerHTML = "";
    showUnder5Stage("danger");
  }
  function openDemoNudgePreview() {
    mode = "subject";
    selected = "pregnancy";
    activeSubject = "pregnancy";
    activePersonId = "demo_pregnancy";
    dangerPersonId = null;
    search = "";
    if ($("search")) $("search").value = "";
    renderCatalog();
    openLaunch("tool.anc_birth_plan", "Pregnancy visits");
  }
  function resetDemoState() {
    people = JSON.parse(JSON.stringify(initialPeople));
    clearPersonEditor(true, true);
    mode = "subject";
    selected = "child_under5";
    activeSubject = "child_under5";
    activePersonId = null;
    dangerPersonId = null;
    search = "";
    hotspot = false;
    slideIndex = 0;
    activeSlides = [];
    orsDeckContainerId = "";
    dentalBrushesTodayByPerson = {};
    dentalZone = -1;
    kmcMinutesToday = 0;
    kmcActive = false;
    handwashStep = 0;
    cancelAllUiTimers();
    moduleOverrides = {};
    if ($("search")) $("search").value = "";
    if ($("hotspotmode")) $("hotspotmode").checked = false;
    if ($("personname")) $("personname").value = "";
    if ($("persondob")) $("persondob").value = "";
    if ($("out")) $("out").innerHTML = "";
    if ($("triagepanel") && $("triagepanel").querySelectorAll) {
      var boxes = $("triagepanel").querySelectorAll('input[type="checkbox"]');
      for (var i = 0; i < boxes.length; i++) boxes[i].checked = false;
    }
    ["coughgroup", "rrsection", "diargroup", "fevergroup", "eargroup", "dentalgroup", "measlesgroup"].forEach(function (id) {
      if ($(id)) $(id).classList.add("hidden");
    });
    if ($("feverdays")) $("feverdays").value = "";
    if ($("fevernotimproving")) $("fevernotimproving").checked = false;
    if ($("feverrdt")) $("feverrdt").value = "not_done";
    if ($("fevertempvalue")) $("fevertempvalue").value = "";
    if ($("fevertempunit")) $("fevertempunit").value = "unknown";
    if ($("fevertempsite")) $("fevertempsite").value = "unknown";
    if ($("dob")) $("dob").value = "";
    if ($("age")) $("age").textContent = "";
    showPanel("");
    renderPeople();
    renderCatalog();
  }
  function renderDemoMode() {
    if (!$("demoactions")) return;
    var demoEnabled = $("demomodeon") && $("demomodeon").checked;
    if ($("demomode")) $("demomode").classList.toggle("hidden", !demoEnabled);
    if ($("todaypanel")) $("todaypanel").classList.toggle("hidden", !!demoEnabled);
    if (!demoEnabled) {
      $("demoactions").innerHTML = "";
      return;
    }
    $("demoactions").innerHTML = demoActions.map(function (action) {
      return '<button class="demo-action ' + (action.primary ? "primary" : "") + '" id="' + action.id + '" type="button"><strong>' + esc(action.title) + '</strong><span>' + esc(action.body) + "</span></button>";
    }).join("");
    var bind = function (id, fn) {
      var btn = $(id);
      if (btn && !btn.dataset.bound) { btn.dataset.bound = "demo"; btn.addEventListener("click", fn); }
    };
    bind("demo-wrong", beginDangerFlow);
    bind("demo-diarrhoea", openDemoDiarrhoeaGate);
    bind("demo-ors", function () { openLaunch("seq.ors_mixing", "ORS mixing slideshow"); });
    bind("demo-brushing", function () { openLaunch("dental.brushing", "Toothbrushing coach"); });
    bind("demo-nudge", openDemoNudgePreview);
  }
  function renderDoors() {
    var doors = [
      { id: "subject", title: "My family", selected: "child_under5" },
      { id: "topic", title: "Topics", selected: "child_health" },
      { id: "learn", title: "Education & stories", selected: "learn" },
      { id: "type", title: "Tools", selected: "triage" },
      { id: "danger", title: "Something's wrong", selected: "danger", danger: true }
    ];
    $("maindoors").innerHTML = doors.map(function (d) {
      return '<button class="tab ' + (mode === d.id ? "active " : "") + (d.danger ? "dangerdoor" : "") + '" data-mode="' + d.id + '" data-selected="' + d.selected + '" type="button">' + d.title + "</button>";
    }).join("");
    var btns = $("maindoors").querySelectorAll ? $("maindoors").querySelectorAll(".tab") : [];
    for (var i = 0; i < btns.length; i++) btns[i].addEventListener("click", function () {
      mode = this.dataset.mode; selected = this.dataset.selected;
      search = "";
      if ($("search")) $("search").value = "";
      if (mode === "subject") { activeSubject = selected; activePersonId = null; dangerPersonId = null; }
      renderCatalog();
      if (mode === "danger") beginDangerFlow();
      else showPanel("catalog");
    });
  }
  function renderPeople() {
    if (!$("peoplelist")) return;
    $("peoplelist").innerHTML = people.map(function (p) {
      var label = p.name + ", " + personSummary(p) + (p.birthDate ? ", date of birth " + p.birthDate : "");
      return '<div class="person-card">' +
        '<button class="person" data-person="' + esc(p.id) + '" data-subject="' + esc(p.subject) + '" aria-label="' + esc(label) + '" title="' + esc(label) + '" type="button"><strong>' + esc(p.name) + '</strong><span> - ' + esc(personSummary(p)) + '</span></button>' +
        '<button class="ghost edit-person" data-person="' + esc(p.id) + '" aria-label="Edit ' + esc(p.name) + '" title="Edit ' + esc(p.name) + '" type="button">Edit</button>' +
        "</div>";
    }).join("");
    var list = $("peoplelist").querySelectorAll ? $("peoplelist").querySelectorAll(".person") : [];
    for (var i = 0; i < list.length; i++) list[i].addEventListener("click", function () {
      var startCareCheck = careEntryStartsCheck;
      // The home care door already states the caregiver's purpose.  Carry that
      // intent through the person selection instead of asking the same question
      // again.  My family still opens the full person-options view.
      careEntryStartsCheck = false;
      mode = "person-intent";
      selected = "";
      activeSubject = this.dataset.subject;
      activePersonId = this.dataset.person || null;
      dangerPersonId = null;
      featureLimit = FEATURE_PAGE_SIZE;
      if (startCareCheck) {
        selected = "check";
        if (openDeclaredPersonIntentDestination()) return;
        // Only skip the second choice when a governed direct-care route exists.
        // Other subjects keep their options rather than guessing a destination.
        selected = "";
      }
      renderCatalog();
      showPanel("catalog");
      moveToNextStep("filtertitle");
    });
    var editList = $("peoplelist").querySelectorAll ? $("peoplelist").querySelectorAll(".edit-person") : [];
    for (var e = 0; e < editList.length; e++) editList[e].addEventListener("click", function () {
      openPersonEditor(this.dataset.person);
    });
  }
  function clearPersonEditor(clearFeedback, closeEditor) {
    editingPersonId = null;
    if ($("personname")) $("personname").value = "";
    if ($("persondob")) $("persondob").value = "";
    if ($("personrole")) $("personrole").value = "child_under5";
    if ($("personeditlabel")) $("personeditlabel").textContent = "Add a person";
    if ($("addperson")) $("addperson").textContent = "Add person";
    if ($("cancelperson")) $("cancelperson").classList.add("hidden");
    if (clearFeedback && $("personeditfeedback")) $("personeditfeedback").textContent = "";
    if (closeEditor && $("personeditor")) $("personeditor").open = false;
  }
  function openPersonEditor(personId) {
    var person = personById(personId);
    if (!person) return;
    editingPersonId = person.id;
    if ($("personeditor")) $("personeditor").open = true;
    if ($("personeditlabel")) $("personeditlabel").textContent = "Editing " + person.name;
    if ($("personname")) $("personname").value = person.name || "";
    if ($("personrole")) $("personrole").value = person.subject || "child_under5";
    if ($("persondob")) $("persondob").value = person.birthDate || "";
    if ($("addperson")) $("addperson").textContent = "Save changes";
    if ($("cancelperson")) $("cancelperson").classList.remove("hidden");
    if ($("personeditfeedback")) $("personeditfeedback").textContent = "Change the details, then tap Save changes.";
    moveToNextStep("personname");
  }
  function confirmPersonChange(message) {
    if ($("personeditfeedback")) {
      $("personeditfeedback").textContent = message;
      moveToNextStep("personeditfeedback");
    }
    if ($("status")) {
      $("status").style.color = "#173f37";
      $("status").textContent = message;
    }
  }
  function renderRoleSelect() {
    if (!$("personrole")) return;
    var options = (catalog.subjects || []).map(function (s) { return '<option value="' + s.id + '">' + t(s.titleSlug) + "</option>"; });
    if (options.length) $("personrole").innerHTML = options.join("");
    if (!$("personrole").value) $("personrole").value = "child_under5";
  }
  function renderChips() {
    if (mode === "subject" && !activePersonId) {
      $("filtertitle").textContent = "Choose a person";
      $("filterchips").innerHTML = "";
      return;
    }
    if (mode === "danger" && !dangerPersonId) {
      $("filtertitle").textContent = "Something's wrong: Who?";
      $("filterchips").innerHTML = people.map(function (p) {
        var dob = p.birthDate ? "DOB " + p.birthDate : "DOB unknown";
        return '<button class="chip danger-person" data-person="' + p.id + '" data-subject="' + p.subject + '" type="button"><strong>' + esc(p.name) + '</strong><span> - ' + esc(personSummary(p)) + " - " + esc(dob) + "</span></button>";
      }).join("");
      var peopleChips = $("filterchips").querySelectorAll ? $("filterchips").querySelectorAll(".danger-person") : [];
      for (var p = 0; p < peopleChips.length; p++) peopleChips[p].addEventListener("click", function () { selectDangerPerson(this.dataset.person); });
      return;
    }
    var personForDanger = dangerPersonId ? personById(dangerPersonId) : null;
    var items = mode === "person-intent" ? [
      { id: "check", title: activeSubject === "pregnancy" ? tx("tx.navigation.pregnancy_check", "Pregnancy check") : "Check a problem" },
      { id: "learn", title: "Learn or practise" },
      { id: "tools", title: "Use a tool" }
    ] : mode === "learn" ? [
      { id: "learn_child", title: "Children and babies" },
      { id: "learn_family", title: "Pregnancy and family" },
      { id: "learn_home", title: "Home and hygiene" }
    ] : mode === "type" ? [
      { id: "tools_quick", title: "Timers and helpers" },
      { id: "tools_reminders", title: "Reminders" },
      { id: "tools_trackers", title: "Track progress" }
    ] : mode === "topic" ? titles(catalog.topics) : mode === "danger" ? [{ id: "danger", title: "Urgent checks for " + (personForDanger ? personForDanger.name : "this person") }] : titles(catalog.subjects);
    var subject = byId(catalog.subjects, activeSubject);
    $("filtertitle").textContent = mode === "person-intent" ? "What does " + selectedPersonName() + " need?" : mode === "topic" ? "Choose a health topic" : mode === "learn" ? "Choose one kind of lesson" : mode === "type" ? "Choose one kind of tool" : mode === "danger" ? "Checking " + (personForDanger ? personForDanger.name : (subject ? t(subject.titleSlug) : activeSubject)) : "For " + selectedPersonName();
    $("filterchips").innerHTML = items.map(function (it) {
      return '<button class="chip' + (selected === it.id ? " active" : "") + '" data-id="' + it.id + '" type="button">' + esc(it.title) + "</button>";
    }).join("");
    var chips = $("filterchips").querySelectorAll ? $("filterchips").querySelectorAll(".chip") : [];
    for (var i = 0; i < chips.length; i++) chips[i].addEventListener("click", function () {
      selected = this.dataset.id;
      featureLimit = FEATURE_PAGE_SIZE;
      if (mode === "subject") { activeSubject = selected; activePersonId = null; dangerPersonId = null; }
      if (openDeclaredPersonIntentDestination()) return;
      if (openOnlyEligibleDestination()) return;
      renderCatalog();
      moveToNextStep("featurelist");
    });
  }
  function topicInGroup(feature, group) {
    var topics = feature.topic || [];
    var groups = {
      learn_child: ["child_health", "diarrhoea_ors", "dental", "immunization", "newborn", "nutrition", "vision_hearing", "cold_flu"],
      learn_family: ["anc_birth", "pnc_breastfeeding", "preparedness"],
      learn_home: ["safe_water", "handwashing", "sanitation", "malaria", "lead_kohl", "chronic_meds"]
    };
    return (groups[group] || []).some(function (topic) { return topics.indexOf(topic) >= 0; });
  }
  function featureMatches(f) {
    if (!caregiverCatalogFeature(f)) return false;
    if (!search && f.integratedIntoBySubject && f.integratedIntoBySubject[activeSubject]) return false;
    var aliases = {
      u5_triage: "sick child cough diarrhoea diarrhea fever ear tooth mouth rash measles",
      dental_brushing: "brush teeth toothbrush toothbrushing brushing timer teeth timer",
      dental_triage: "tooth pain toothache mouth pain dental pain",
      breastfeeding_aid_triage: "breastfeeding assistant breastfeeding audio read aloud breastfeeding triage assistant breastfeeding aid baby feeding help latch milk supply wet nappies newborn feeding breast problem breastfeeding problem",
      handwashing_timer: "wash hands hand wash soap",
      ors_slideshow: "ors mix mixing oral rehydration",
      ors_voucher: "ors zinc diarrhoea diarrhea",
      safe_water_chlorine: "chlorine instructions safe water water treatment disinfect treat drinking water",
      chlorine_contact_timer: "chlorine wait timer chlorine instructions safe water wait contact time 30 minutes",
      chlorine_dose_helper: "chlorine instructions dose label table local product safe water"
    };
    var hay = (t(f.titleSlug) + " " + f.id + " " + (f.topic || []).join(" ") + " " + (f.type || []).join(" ") + " " + (aliases[f.id] || "")).toLowerCase();
    if (search) return hay.indexOf(search) >= 0;
    if (hotspot && hotspotRelevant(f)) return true;
    if (mode === "danger") return !!dangerPersonId && !!f.dangerEligible && (f.subject || []).indexOf(activeSubject) >= 0;
    if (mode === "person-intent") {
      if (!selected || (f.subject || []).indexOf(activeSubject) < 0) return false;
      if (selected === "check") return !!f.dangerEligible || (f.type || []).indexOf("triage") >= 0;
      if (selected === "learn") return (f.type || []).indexOf("story") >= 0 || (f.type || []).indexOf("howto") >= 0;
      return (f.type || []).some(function (type) { return ["tool", "reminder", "tracker"].indexOf(type) >= 0; });
    }
    if (mode === "learn") return !!selected && ((f.type || []).indexOf("story") >= 0 || (f.type || []).indexOf("howto") >= 0) && topicInGroup(f, selected);
    if (mode === "topic") return (f.topic || []).indexOf(selected) >= 0;
    if (mode === "type") {
      if (!selected) return false;
      if (selected === "tools_reminders") return (f.type || []).indexOf("reminder") >= 0;
      if (selected === "tools_trackers") return (f.type || []).indexOf("tracker") >= 0;
      if (selected === "tools_quick") return (f.type || []).indexOf("tool") >= 0;
      return (f.type || []).indexOf(selected) >= 0;
    }
    return (f.subject || []).indexOf(selected) >= 0;
  }
  function hotspotRelevant(f) {
    var topics = f.topic || [];
    return !!f.dangerEligible || topics.indexOf("safe_water") >= 0 || topics.indexOf("handwashing") >= 0 || topics.indexOf("diarrhoea_ors") >= 0 || topics.indexOf("sanitation") >= 0;
  }
  function profileAllows(f) {
    var profile = $("memoryprofile") && $("memoryprofile").value ? $("memoryprofile").value : "low_1gb";
    return !f.memoryProfile || f.memoryProfile.indexOf(profile) >= 0;
  }
  function caregiverCatalogFeature(f) {
    return (f.audience || "caregiver") !== "reviewer";
  }
  function featureVisible(f) {
    if (!profileAllows(f) || !caregiverCatalogFeature(f)) return false;
    if (f.id === "kmc_timer" && !eligibleKmcBaby()) return false;
    if (moduleOverrides[f.id] === true) return true;
    if (moduleOverrides[f.id] === false) return false;
    return featureMatches(f);
  }
  function eligibleFeaturesForCurrentView() {
    return (catalog.features || []).filter(featureVisible).sort(function (a, b) {
      if (moduleOverrides[a.id] === true && moduleOverrides[b.id] !== true) return -1;
      if (moduleOverrides[b.id] === true && moduleOverrides[a.id] !== true) return 1;
      return t(a.titleSlug).localeCompare(t(b.titleSlug));
    });
  }
  function openDeclaredPersonIntentDestination() {
    if (mode !== "person-intent" || !selected) return false;
    var route = catalog.personIntentRoutes.find(function (item) {
      return item.subject === activeSubject && item.intent === selected;
    });
    if (!route) return false;
    var feature = byId(catalog.features, route.featureId);
    if (!feature || !profileAllows(feature) || !caregiverCatalogFeature(feature)) return false;
    $("featurelist").innerHTML = "";
    openLaunch(feature.launch, t(feature.titleSlug));
    return true;
  }
  function openOnlyEligibleDestination() {
    var features = eligibleFeaturesForCurrentView();
    if (features.length !== 1) return false;
    $("featurelist").innerHTML = "";
    openLaunch(features[0].launch, t(features[0].titleSlug));
    return true;
  }
  function activeForManager(f) {
    if (!profileAllows(f) || !caregiverCatalogFeature(f)) return false;
    if (moduleOverrides[f.id] === true) return true;
    if (moduleOverrides[f.id] === false) return false;
    return featureMatches(f);
  }
  function renderFeatureList() {
    var hasForcedModule = Object.keys(moduleOverrides).some(function (id) { return moduleOverrides[id] === true; });
    if ((mode === "subject" && !activePersonId && !search && !hotspot && !hasForcedModule) || ((mode === "person-intent" || mode === "learn" || mode === "type") && !selected && !search && !hotspot && !hasForcedModule)) {
      $("featurelist").innerHTML = "";
      return;
    }
    if (mode === "danger" && selected === "who") {
      $("featurelist").innerHTML = "";
      return;
    }
    if (mode === "danger" && dangerPersonId && !hotspot) {
      var person = personById(dangerPersonId);
      $("featurelist").innerHTML = '<div class="muted">' + esc(tx("tx.catalog.urgent_intake_hidden_modules", "The app is asking signs now for {person}. Modules are hidden during urgent intake.", { person: person ? person.name : t("tx.catalog.this_person") })) + "</div>";
      return;
    }
    var features = eligibleFeaturesForCurrentView();
    var shown = features.slice(0, featureLimit);
    $("featurelist").innerHTML = shown.map(function (f) {
      var summary = featureSummary(f);
      return '<button class="feature" data-launch="' + f.launch + '" type="button"><strong>' + t(f.titleSlug) + '</strong>' + featureThumb(f.id) + (summary ? '<span>' + esc(summary) + '</span>' : "") + "</button>";
    }).join("") + (features.length > shown.length ? '<button class="ghost show-more" id="showmorefeatures" type="button">Show ' + Math.min(FEATURE_PAGE_SIZE, features.length - shown.length) + ' more</button>' : "");
    if (!features.length) $("featurelist").innerHTML = '<div class="muted">' + esc(tx("tx.catalog.no_results", "No results for \"{query}\". Try \"brush teeth\", \"ORS\", \"chlorine\", or \"newborn\". You can also browse by person, topic, or Education & stories.", { query: search || t("tx.catalog.this_view") })) + "</div>";
    var cards = $("featurelist").querySelectorAll ? $("featurelist").querySelectorAll(".feature") : [];
    for (var i = 0; i < cards.length; i++) cards[i].addEventListener("click", function () {
      var launch = this.dataset.launch;
      if (mode === "danger" && launch === "triage.under5") applyKnownDob(personById(dangerPersonId));
      openLaunch(launch, this.querySelector("strong").textContent || tx("tx.prototype.unavailable.title", "Not available in this prototype"));
    });
    var showMore = $("showmorefeatures");
    if (showMore) showMore.addEventListener("click", function () {
      featureLimit += FEATURE_PAGE_SIZE;
      renderFeatureList();
      moveToNextStep("featurelist");
    });
  }
  function featureSummary(feature) {
    if (!feature) return "";
    // Caregiver-facing catalog summaries resolve through the phrase bank so they translate.
    // The English literal stays here only as the tx() fallback, matching the wording in the
    // slug, so a missing slug degrades to the previous copy instead of an empty card.
    var actionSummaries = {
      u5_triage: "Check danger signs first, then only the symptoms happening now.",
      ors_voucher: "Ask for ORS and zinc, then see how much to give after each loose stool.",
      ors_slideshow: "Choose your cup or bottle, then mix one sachet with exactly 1 litre.",
      zinc_tracker: "Mix zinc safely and mark the 10-day course.",
      dental_brushing: "Start a two-minute brushing timer and mark the star chart.",
      dental_triage: "Check tooth or mouth danger signs and choose where to get help.",
      immunization_reminders: "Use the child's birthday to find the next vaccine visit.",
      anc_birth_plan: "Prepare transport, contacts, documents, and birth supplies.",
      pnc_lactation: "Check postpartum, feeding, mood, and safety concerns step by step.",
      breastfeeding_aid_triage: "Get calm feeding help, or switch to urgent checks if needed.",
      safe_water_chlorine: "Check the local product label before treating drinking water.",
      chlorine_contact_timer: "Time the wait after using a locally approved chlorine dose.",
      handwashing_timer: "Practice each handwashing step with a big 20-second timer.",
      kmc_timer: "Time a skin-to-skin session only for an eligible young baby."
    };
    if (actionSummaries[feature.id]) {
      return tx("tx.feature_" + feature.id + "_summary", actionSummaries[feature.id]);
    }
    var card = cardByFeature(feature.id);
    if (card && card.bodySlug) return caregiverCardSummary(t(card.bodySlug));
    var screen = screenByFeature(feature.id);
    if (screen && screen.bodySlug) return caregiverCardSummary(t(screen.bodySlug));
    var story = storyByFeature(feature.id);
    if (story && story.slides && story.slides.length && story.slides[0].bodySlug) return caregiverCardSummary(t(story.slides[0].bodySlug));
    return "";
  }
  function caregiverCardSummary(text) {
    var s = String(text || "").trim();
    if (!s) return "";
    if (/\b(CODEX|DMN|FHIR|Scheduler|Nudge Coordinator|broker|pipeline|contract|placeholder|preview|future)\b/i.test(s)) return "";
    s = s.replace(/\bThis prototype\b/gi, "This screen")
      .replace(/\bthe prototype\b/gi, "this screen")
      .replace(/\bin this prototype\b/gi, "here")
      .replace(/\bprototype\b/gi, "screen");
    var first = s.split(/(?<=[.!?])\s+/)[0] || s;
    if (first.length > 150) first = first.slice(0, 147).replace(/\s+\S*$/, "") + "...";
    return first;
  }
  function renderModuleManager() {
    if (!$("moduletoggles")) return;
    var manageable = (catalog.features || []).filter(function (f) { return caregiverCatalogFeature(f) && profileAllows(f) && f.status !== "planned"; });
    var activeCount = manageable.filter(activeForManager).length;
    if ($("modulesummary")) $("modulesummary").textContent = activeCount + " active modules for this profile" + (hotspot ? " + hotspot" : "") + ".";
    $("moduletoggles").innerHTML = manageable.map(function (f) {
      var active = activeForManager(f);
      var verb = active ? "Remove" : "Add";
      return '<button class="module-toggle ' + (active ? "active" : "") + '" data-feature="' + f.id + '" type="button">' + verb + ' ' + t(f.titleSlug) + '</button>';
    }).join("");
    var toggles = $("moduletoggles").querySelectorAll ? $("moduletoggles").querySelectorAll(".module-toggle") : [];
    for (var i = 0; i < toggles.length; i++) toggles[i].addEventListener("click", function () {
      var fid = this.dataset.feature;
      var feature = byId(catalog.features, fid);
      var active = feature ? activeForManager(feature) : false;
      if (moduleOverrides[fid] === true && active) delete moduleOverrides[fid];
      else moduleOverrides[fid] = !active;
      renderFeatureList();
      renderModuleManager();
    });
  }
  function renderCatalog() { renderDoors(); renderChips(); renderFeatureList(); renderModuleManager(); renderDemoMode(); applyShellVisibility(); }
  function showSlides(slides) {
    activeSlides = Array.isArray(slides) && slides.length ? slides : [];
    slideIndex = 0;
    renderSlide();
    showPanel("slideshow");
  }
  function changeSlide(nextIndex) {
    if (!activeSlides.length) return false;
    var boundedIndex = Math.max(0, Math.min(activeSlides.length - 1, nextIndex));
    if (boundedIndex === slideIndex) return false;
    stopReadAloudForContextChange("Read-aloud stopped.");
    slideIndex = boundedIndex;
    renderSlide();
    return true;
  }
  function moveSlide(delta) {
    if (!activeSlides.length) return false;
    return changeSlide(slideIndex + delta);
  }
  function renderSlide() {
    var slide = activeSlides[slideIndex] || {};
    $("slidetitle").textContent = slide.titleSlug ? t(slide.titleSlug) : (slide.title || "");
    activeShellTitle = $("slidetitle").textContent || activeShellTitle;
    $("slideimage").innerHTML = renderVisual(slide.featureId, slide.img, orsMeasureVisualAsset(slide));
    $("slidetext").textContent = slideText(slide);
    // Deck metadata (cache profile, review state, authoring notes) never belongs in
    // caregiver copy. Each step renderer supplies only the extra help that is useful now.
    $("slidecache").innerHTML = "";
    renderOrsDeckStepControls(slide);
    renderStoryActions(slide.featureId);
    updateSlideNavigation(activeSlides.length > 1);
    updateOrsSlideNavigation(slide);
    applyShellVisibility();
  }
  function deckToSlides(deck) {
    return (deck && Array.isArray(deck.steps) ? deck.steps : []).map(function (step) {
      return {
        id: step.id,
        titleSlug: step.titleSlug || deck.titleSlug,
        bodySlug: step.bodySlug,
        img: step.imageDesc || step.imageAsset || "Image placeholder for this step.",
        imageAsset: step.imageAsset,
        featureId: deck.featureId
      };
    });
  }
  function orsMeasureVisualAsset(slide) {
    if (!slide || slide.featureId !== "ors_slideshow" || slide.id !== "measure") return slide && slide.imageAsset;
    var container = containerById(orsDeckContainerId);
    // Container-specific pictures prevent a correct instruction being paired with a
    // misleading number of cups. New containers can declare their own visual in config.
    return (container && container.orsMeasurementVisualAssetId) || slide.imageAsset;
  }
  function slideText(slide) {
    if (slide.featureId !== "ors_slideshow") return slide.sourceName ? slide.sourceName + ": " + t(slide.bodySlug) : t(slide.bodySlug);
    var container = containerById(orsDeckContainerId);
    if (slide.id === "measure") {
      if (!container) return tx("tx.seq_ors_step2_need_container", "First choose the container you will use. Then this step will tell you exactly how many times to fill it.");
      return orsMixInstruction(localizedContainerLabel(container), Number(container.volumeMl) || 0, container.slug);
    }
    if (slide.id === "mix") {
      if (!container) return tx("tx.seq_ors_step3_need_container", "Choose a container first, then add one full ORS sachet only after the water has been measured.");
      return tx("tx.seq_ors_step3_chosen", "Now add one full ORS sachet to the measured water for {container}. Stir or shake well until the powder is mixed.", { container: localizedContainerLabel(container) });
    }
    return t(slide.bodySlug);
  }
  function orsContainerCardsHtml() {
    return '<div class="grid ors-container-grid">' + engine.orsContainers.filter(function (c) { return c.kind === "ors"; }).map(function (c) {
      var selectedClass = c.id === orsDeckContainerId ? " selected" : "";
      var label = localizedContainerLabel(c);
      var volume = String(c.volumeMl) + " mL";
      return '<button class="card ors-container-choice' + selectedClass + '" data-container-id="' + esc(c.id) + '" type="button">' + containerVisual(c) + '<strong>' + esc(label) + '</strong>' + (label.indexOf(volume) >= 0 ? "" : '<div class="vol">' + esc(volume) + "</div>") + "</button>";
    }).join("") + "</div>";
  }
  function renderOrsDeckStepControls(slide) {
    if (slide.featureId !== "ors_slideshow") return;
    var container = containerById(orsDeckContainerId);
    if (slide.id === "choose_container") {
      $("slidecache").innerHTML = '<div class="slidecontrols checklist-controls"><p class="muted">' + esc(tx("tx.ors.deck.choose_prompt", "Tap the cup, mug, or bottle you will really use. The lesson will continue after you choose.")) + '</p>' + orsContainerCardsHtml() + '<p id="orscontainerstatus" class="muted">' + esc(container ? tx("tx.ors.deck.selected", "Selected: {container}", { container: localizedContainerLabel(container) }) : tx("tx.ors.deck.none_selected", "No container selected yet.")) + "</p></div>";
      bindOrsContainerChoices(true);
    } else if (slide.id === "measure") {
      $("slidecache").innerHTML = '<div class="mix-instruction"><h3>' + esc(tx("tx.ors.mix.selected_title", "Mixing instruction")) + '</h3><p>' + esc(container ? tx("tx.ors.deck.using_container", "Using: {container}", { container: localizedContainerLabel(container) }) : tx("tx.ors.deck.choose_first", "Choose a container first.")) + '</p>' + (container ? containerVisual(container) : orsContainerCardsHtml()) + '</div>';
      if (!container) bindOrsContainerChoices(false);
    } else if (slide.id === "mix" && container) {
      $("slidecache").innerHTML = '<div class="mix-instruction"><h3>' + esc(tx("tx.ors.deck.full_sachet_title", "Full sachet only after measuring")) + '</h3><p>' + esc(tx("tx.ors.deck.full_sachet_body", "Use one full ORS sachet with the measured water. Do not guess a partial sachet.")) + '</p></div>';
    }
  }
  function bindOrsContainerChoices(advanceAfterChoice) {
    var choices = $("slidecache").querySelectorAll ? $("slidecache").querySelectorAll(".ors-container-choice") : [];
    for (var i = 0; i < choices.length; i++) choices[i].addEventListener("click", function () {
      orsDeckContainerId = this.dataset.containerId || "";
      if (advanceAfterChoice) {
        changeSlide(Math.min(activeSlides.length - 1, slideIndex + 1));
        return;
      }
      renderSlide();
    });
  }
  function updateOrsSlideNavigation(slide) {
    if (slide.featureId !== "ors_slideshow") return;
    if ($("slidenext") && slide.id === "choose_container") {
      $("slidenext").disabled = !orsDeckContainerId;
      $("slidenext").textContent = orsDeckContainerId ? "Next" : "Choose container first";
    } else if ($("slidenext")) {
      $("slidenext").disabled = false;
      $("slidenext").textContent = "NEXT";
    }
  }
  function storyCardToSlides(card) {
    var frames = Array.isArray(card.frames) ? card.frames : [];
    return frames.map(function (slug) {
      return {
        titleSlug: card.titleSlug,
        bodySlug: slug,
        img: card.imageDesc,
        featureId: card.featureId,
        sourceName: card.sourceName,
        note: "source: " + card.source + " " + card.governanceStatus + ". Adapted summary only." + provenanceSummary(card.featureId) + assetSummary(card.featureId) + contractSummary(card.featureId)
      };
    });
  }
  function quizSpecForFeature(featureId) {
    var specs = {
      hh_handwashing_story: {
        question: "After the handwashing story, what is the best next step before eating or feeding a child?",
        options: [
          { id: "soap", label: "Wash hands with soap and clean water", correct: true },
          { id: "wipe", label: "Wipe hands on clothing" },
          { id: "wait", label: "Wait until hands look dirty" }
        ],
        correctFeedback: "Correct. Soap and clean water before eating or feeding is the habit this story is practicing.",
        retryFeedback: "Try again. The story is checking the handwashing habit, not illness or diagnosis."
      },
      hh_safe_water_story: {
        question: "What should the family do before drinking water that may be unsafe?",
        options: [
          { id: "cover", label: "Store it uncovered" },
          { id: "treat", label: "Use the local approved treatment plan and a covered container", correct: true },
          { id: "guess", label: "Guess the chlorine amount" }
        ],
        correctFeedback: "Correct. The safe-water story points to local approved treatment and covered storage.",
        retryFeedback: "Try again. This quiz never gives a dose; it checks the safe-water habit only."
      },
      hh_dental_story: {
        question: "What does the toothbrushing story ask the child to practice?",
        options: [
          { id: "sugar", label: "Choose sweets before sleep" },
          { id: "brush", label: "Brush morning and night with adult help when needed", correct: true },
          { id: "pain", label: "Ignore tooth pain" }
        ],
        correctFeedback: "Correct. The story links to brushing practice and keeps tooth-pain concerns separate.",
        retryFeedback: "Try again. The quiz checks brushing practice, not dental treatment."
      },
      hh_cold_flu_story: {
        question: "What is the prevention habit in the cold and flu story?",
        options: [
          { id: "cough", label: "Cover coughs and wash hands", correct: true },
          { id: "share", label: "Share cups when sick" },
          { id: "hide", label: "Hide breathing trouble" }
        ],
        correctFeedback: "Correct. Cover coughs and wash hands; use the sick-child check separately if the child is unwell.",
        retryFeedback: "Try again. This quiz checks prevention habits and is not a danger-sign screen."
      }
    };
    return specs[featureId] || null;
  }
  function showQuizRunner(featureId) {
    var spec = quizSpecForFeature(featureId);
    var card = storyByFeature(featureId);
    if (!spec || !card) {
      showPrototypeCard(tx("tx.prototype.quiz_unavailable.title", "Quiz not available"), tx("tx.prototype.quiz_unavailable.body", "This story does not have a quick quiz in the current prototype. You can keep reading or choose another activity."), tx("tx.prototype.unavailable.visual", "This activity is not available in the current prototype build."), featureId, "QuizRunner has no education quiz configured for " + featureId);
      return;
    }
    activeSlides = [];
    showPanel("slideshow");
    $("slidetitle").textContent = "Quick quiz";
    $("slideimage").innerHTML = renderVisual(featureId, card.imageDesc);
    $("slidetext").textContent = spec.question;
    $("slidecache").innerHTML =
      '<div class="slidecontrols quiz-controls" role="group" aria-label="Quick quiz answers">' +
      spec.options.map(function (option) {
        return '<button class="ghost quizanswer" id="quiz_' + esc(option.id) + '" type="button" data-correct="' + (option.correct ? "true" : "false") + '">' + esc(option.label) + "</button>";
      }).join("") +
      '</div><div class="progress-panel" id="quizstatus"><strong>QuizRunner</strong><div class="muted">Education-only comprehension check. No diagnosis, triage, eligibility, or health record is created.</div></div>' +
      traceDetails("Prototype review details", "QuizRunner prototype over Player slideshow/form pattern. Not reachable from danger-sign routing. " + provenanceSummary(featureId) + contractSummary(featureId));
    spec.options.forEach(function (option) {
      var button = $("quiz_" + option.id);
      if (button && !button.dataset.bound) {
        button.dataset.bound = "quiz";
        button.addEventListener("click", function () {
          var status = $("quizstatus");
          var message = option.correct ? spec.correctFeedback : spec.retryFeedback;
          $("slidetext").textContent = message;
          if (status) status.innerHTML = '<strong>QuizRunner</strong><div class="muted">' + esc(message) + "</div>";
        });
      }
    });
  }
  function runDeckAction(action) {
    if (!action || !action.launch) return;
    if (action.launch === "tool.quiz_runner") {
      showQuizRunner(action.quizFeatureId);
      return;
    }
    if (action.launch === "triage.cough") {
      openColdFluSickChildCheck();
      return;
    }
    openLaunch(action.launch, t(action.labelSlug));
  }
  function renderStoryActions(featureId) {
    var card = storyByFeature(featureId);
    var actions = card && Array.isArray(card.actions) ? card.actions : [];
    if (!actions.length) return;
    var storySource = card && card.sourceName ? "source: " + card.sourceName + ". " : "";
    $("slidecache").innerHTML = reviewerDetails(storySource + "Story actions are Player deck actions: read aloud, quiz, timer, or related checklist. " + provenanceSummary(featureId) + assetSummary(featureId) + contractSummary(featureId)) + '<div class="slidecontrols"><button class="ghost" id="storyreadaloud" type="button">Read this page aloud</button>' + actions.map(function (action) {
      var cls = action.style === "ghost" ? ' class="ghost"' : "";
      return '<button' + cls + ' id="' + esc(action.id) + '" type="button">' + esc(t(action.labelSlug)) + "</button>";
    }).join("") + '<span id="audiostatus" class="muted">Read-aloud idle.</span></div>';
    var read = $("storyreadaloud");
    if (read && !read.dataset.bound) {
      read.dataset.bound = "storyreadaloud";
      read.addEventListener("click", function () {
        playPrototypeSpeech(($("slidetitle").textContent || "") + ". " + ($("slidetext").textContent || ""));
      });
    }
    actions.forEach(function (action) {
      var button = $(action.id);
      if (button && !button.dataset.bound) {
        button.dataset.bound = "deckaction";
        button.addEventListener("click", function () { runDeckAction(action); });
      }
    });
  }
  function showDeck(featureId) {
    var deck = deckByFeature(featureId);
    if (!deck) {
      showPrototypeCard(t("tx.feature_" + featureId), prototypeUnavailableBody(), tx("tx.prototype.unavailable.visual", "This activity is not available in the current prototype build."), featureId, "Missing deck for " + featureId);
      return;
    }
    if (featureId === "ors_slideshow") orsDeckContainerId = "";
    showSlides(deckToSlides(deck));
    if (featureId === "ors_slideshow" && $("slideshow") && $("slideshow").setAttribute) $("slideshow").setAttribute("data-screen-id", "support.ors_directions");
  }
  function prototypeUnavailableBody() {
    return tx("tx.prototype.unavailable.body", "This activity is not ready in the current prototype. Try another activity, or use the search box to find a related topic.");
  }
  function showPrototypeCard(title, body, img, featureId, reviewNote) {
    activeSlides = [];
    showPanel("slideshow");
    $("slidetitle").textContent = title;
    $("slideimage").innerHTML = renderVisual(featureId, img);
    $("slidetext").textContent = body;
    $("slidecache").innerHTML = reviewerDetails("CODEX Decision - needs approval. Prototype content only." + (reviewNote ? " " + reviewNote + "." : "") + (featureId ? contractSummary(featureId) : ""));
  }
  function dentalTrackerPerson() {
    var person = activePersonId ? personById(activePersonId) : null;
    if (!person || person.subject !== "child_under5") person = defaultChildPerson();
    return person && person.subject === "child_under5" ? person : null;
  }
  function dentalTrackerKey() {
    var person = dentalTrackerPerson();
    return person ? person.id : "unassigned_child";
  }
  function dentalBrushesToday() {
    return dentalBrushesTodayByPerson[dentalTrackerKey()] || 0;
  }
  function recordDentalBrushing() {
    var key = dentalTrackerKey();
    dentalBrushesTodayByPerson[key] = Math.min(2, dentalBrushesToday() + 1);
  }
  function dentalProgressText() {
    var tracker = trackerByModule("dental_brushing") || {};
    var target = tracker.targetCount || 2;
    var complete = dentalBrushesToday();
    var remaining = Math.max(0, target - complete);
    return "Morning / Night. Today: " + complete + " of " + target + ". " + (remaining ? remaining + " brushing session" + (remaining === 1 ? "" : "s") + " left." : "Daily prototype target reached.");
  }
  function dentalStarChart() {
    var tracker = trackerByModule("dental_brushing") || {};
    var target = tracker.targetCount || 2;
    var stars = [];
    var complete = dentalBrushesToday();
    for (var i = 0; i < target; i++) stars.push(i < complete ? "&#9733;" : "&#9734;");
    return stars.join(" ");
  }
  function renderDentalControls() {
    var doseHtml = '<div class="dosegrid" aria-label="Prototype toothpaste amount examples">' + assetThumb("img.generated.rice_grain_toothpaste_v1", "Under 3: tiny smear about one grain of rice") + assetThumb("img.generated.pea_size_toothpaste_v1", "Age 3 and up: pea-sized amount") + "</div>";
    $("slidecache").innerHTML = doseHtml + timerPanelHtml("Toothbrush timer", "2:00", "Ready") + '<div class="progress-panel"><div class="progress-row"><span>Star chart</span><span class="stars">' + dentalStarChart() + '</span></div><div class="muted">' + esc(dentalProgressText()) + '</div></div><div class="slidecontrols wrap-controls"><button id="dentalstart" type="button">Start brushing timer</button><button class="ghost" id="dentalpause" type="button" disabled>Pause</button><button class="ghost" id="dentalreset" type="button">Reset timer</button><button class="ghost" id="dentalnext" type="button">Next zone</button><button class="ghost" id="dentaldone" type="button">Done brushing</button><button class="ghost" id="dentaltune" type="button">Play tune</button></div>' + traceDetails("Prototype review details", "Dental brushing coach. Review the bundled brushing tune source before field release. " + provenanceSummary("dental_brushing") + assetSummary("dental_brushing") + contractSummary("dental_brushing")) + trackerContractHtml("dental_brushing");
    var start = $("dentalstart"), next = $("dentalnext"), done = $("dentaldone"), tune = $("dentaltune");
    if (start && !start.dataset.bound) { start.dataset.bound = "dental"; start.addEventListener("click", function () {
      if (uiTimer && uiTimer.startId === "dentalstart" && uiTimer.status === "paused") {
        pauseOrResumeUiCountdown();
        return;
      }
      dentalZone = 0;
      updateDentalZone();
      startUiCountdown("Brushing", 120, null, { startId: "dentalstart", pauseId: "dentalpause", resetId: "dentalreset", startText: "Start brushing timer", musicAssetId: "audio.prototype.toothbrushing_happy_ukulele", musicStatusId: "musicstatus", musicLoop: true });
    }); }
    bindUiCountdownButton("dentalpause", pauseOrResumeUiCountdown);
    bindUiCountdownButton("dentalreset", resetUiCountdown);
    if (next && !next.dataset.bound) { next.dataset.bound = "dental"; next.addEventListener("click", function () { dentalZone = dentalZone < 0 ? 0 : (dentalZone + 1) % 4; updateDentalZone(); }); }
    if (done && !done.dataset.bound) { done.dataset.bound = "dental"; done.addEventListener("click", function () { cancelUiCountdown(); recordDentalBrushing(); dentalZone = -1; $("slidetext").textContent = tx("tx.tool_dental_brushing.done", "Nice work. This prototype recorded one synthetic brushing session for today. Brush morning and night; an adult should help young children and make sure toothpaste is spat out."); renderDentalControls(); }); }
    if (tune && !tune.dataset.bound) { tune.dataset.bound = "dental"; tune.addEventListener("click", function () { $("slidetext").textContent = tx("tx.tool_dental_brushing.tune_placeholder", "Brushing tune is playing. Keep brushing all the way around: outside, inside, chewing surfaces, and tongue. Spit out the toothpaste when you finish."); togglePrototypeMusic("audio.prototype.toothbrushing_happy_ukulele", "musicstatus", true); }); }
    updateUiTimerControls();
  }
  function updateDentalZone() {
    var zones = [
      "outside teeth - small circles along the front and cheek side",
      "inside teeth - gentle strokes along the tongue side",
      "chewing teeth - short back-and-forth strokes",
      "spit out - do not swallow toothpaste"
    ];
    var zone = Math.max(0, dentalZone);
    $("slidetext").textContent = tx("tx.tool_dental_brushing.zone_step", "Step {step} of 4: brush the {zone}. Keep going until all four zones are done.", { step: zone + 1, zone: zones[zone] });
    renderDentalControls();
  }
  function showDentalBrushingCoach() {
    activeSlides = [];
    dentalZone = -1;
    showPanel("slideshow");
    $("slidetitle").textContent = t("tx.feature_dental_brushing");
    $("slideimage").innerHTML = renderVisual("dental_brushing", "Toothbrush with a rice-grain or pea-size amount of toothpaste, depending on age.");
    $("slidetext").textContent = tx("tx.tool_dental_brushing_body", "A two-minute brushing coach for morning and night with a synthetic star chart. Use a small amount of fluoride toothpaste, help young children brush, and ask a local dentist or CHW about the right amount for the child's age.");
    renderDentalControls();
  }
  function renderDentalTriageChecklist() {
    $("slidecache").innerHTML =
      renderClinicalChecklist("dental_triage.main") +
      reviewDetailsHtml("dental_triage", "Dental triage checklist. No antibiotics, pain medicines, extraction advice, or diagnosis.");
    var ids = bindClinicalChecklist("dental_triage.main").ids;
    var review = $("dentalreview");
    if (review && !review.dataset.bound) {
      review.dataset.bound = "dentaltriage";
      review.addEventListener("click", function () {
        var checked = ids.filter(function (id) { return !!$(id).checked; });
        if (!checked.length) return;
        var decision = screenDecision("dental_triage", checked);
        var names = {
          dentalbreathing: "breathing or swallowing trouble",
          dentalswelling: "swelling",
          dentalfever: "fever",
          dentalinjury: "injury",
          dentalpain: "severe tooth pain",
          dentalbleeding: "bleeding",
          dentalother: "other tooth or mouth concern",
          dentalnone: "none of these"
        };
        var selectedNames = checked.map(function (id) { return names[id]; }).join(", ") || "no urgent sign selected";
        if (decision.severity === "emergency") {
          setSlideResult({
            kind: "refer",
            careRoute: "dental_or_clinic",
            severity: decision.severity,
            title: t("tx.feature_dental_triage"),
            paragraphs: [tx("tx.dental_triage.emergency", "Seek urgent medical/dental care now for breathing or swallowing trouble with mouth, jaw, or tooth symptoms. Do not wait for a dental appointment or this app. No antibiotics, pain medicines, or dental procedures are advised here; this is no diagnosis.")]
          });
        } else if (decision.severity === "routine_clinic" && ($("dentalswelling").checked || $("dentalfever").checked || $("dentalinjury").checked || $("dentalbleeding").checked)) {
          setSlideResult({
            kind: "refer",
            careRoute: "dental_or_clinic",
            severity: decision.severity,
            title: t("tx.feature_dental_triage"),
            paragraphs: [tx("tx.dental_triage.same_day", "Arrange same-day dental or clinic care for {selectedSigns}. Dental infection or injury can worsen and needs local professional review. No antibiotics, pain medicines, extraction advice, or home remedies are given here; this is no diagnosis.", { selectedSigns: selectedNames })]
          });
        } else if (decision.severity === "routine_clinic" && $("dentalpain").checked) {
          setSlideResult({
            kind: "refer",
            careRoute: "dental_or_clinic",
            severity: decision.severity,
            title: t("tx.feature_dental_triage"),
            paragraphs: [tx("tx.dental_triage.pain", "Call a dentist, clinic, or trusted CHW soon for severe or worsening tooth pain, especially if it affects eating, sleeping, or school. Escalate today if swelling, fever, injury, or bleeding appears. No antibiotics or diagnosis are provided in this prototype.")]
          });
        } else if ($("dentalother").checked) {
          setSlideResult({
            kind: "refer",
            careRoute: "professional",
            severity: "routine_clinic",
            title: tx("tx.dental_triage.other_title", "Other tooth or mouth concern"),
            paragraphs: [friendlyOtherMessage()]
          });
        } else {
          setSlideResult({
            kind: "home",
            careRoute: "home_watch",
            title: t("tx.feature_dental_triage"),
            paragraphs: [tx("tx.dental_triage.no_urgent", "No urgent dental sign selected in this prototype. Keep brushing guidance visible, avoid sugary snacks/drinks when possible, and ask a dentist or CHW if pain, swelling, injury, fever, or bleeding starts. This screen does not diagnose the problem.")]
          });
        }
        renderDentalTriageChecklist();
        appendScreenDecisionTrace("dental_triage", decision);
      });
    }
  }
  function showDentalTriageChecklist() {
    activeSlides = [];
    showPanel("slideshow");
    $("slidetitle").textContent = t("tx.feature_dental_triage");
    $("slideimage").innerHTML = renderVisual("dental_triage", "Child holding cheek; separate small icons for swelling, injury, fever, severe pain, and breathing trouble.");
    $("slidetext").textContent = tx("tx.dental_triage_intro", "Check tooth pain, swelling, fever, bleeding, or mouth injury. This is conservative referral support, not a diagnosis, and it does not recommend antibiotics, pain medicines, or dental procedures.");
    renderDentalTriageChecklist();
  }
  function renderZincTracker() {
    var dayControls = "";
    for (var i = 1; i <= 10; i++) dayControls += '<label><input id="zincday' + i + '" type="checkbox"> Day ' + i + '</label>';
    $("slidecache").innerHTML = zincMixingGuideHtml() + '<div class="progress-panel"><strong>' + esc(tx("tx.zinc.calendar.title", "Zinc 10-day calendar")) + '</strong>' + zincCalendarHtml() + '<p>' + esc(tx("tx.zinc.calendar.body", "Mark each day after the zinc dose is given. Do not stop early unless a clinician or local product instruction says to.")) + '</p></div>' + nudgeStatusPanelHtml("zincnudgestatus") + '<div class="slidecontrols checklist-controls">' + dayControls + '<button id="zincsave" type="button">Save zinc days</button><button id="zincstartreminder" type="button">Start 10-day reminder</button><button class="ghost" id="zinchelp" type="button">Need help now</button></div>' + reviewDetailsHtml("zinc_tracker", "Zinc course tracker. WHO-style prototype education: 10 mg daily under 6 months, 20 mg daily at 6 months or older, 10-day demo course; local product and clinician/CHW instructions control before real use.") + trackerContractHtml("zinc_tracker");
    for (var d = 1; d <= 10; d++) {
      var box = $("zincday" + d);
      if (box && !box.dataset.bound) { box.dataset.bound = "zinc"; box.addEventListener("change", function () { return; }); }
    }
    var save = $("zincsave"), startReminder = $("zincstartreminder"), help = $("zinchelp");
    if (save && !save.dataset.bound) {
      save.dataset.bound = "zinc";
      save.addEventListener("click", function () {
        var checked = [];
        for (var d = 1; d <= 10; d++) if ($("zincday" + d).checked) checked.push("Day " + d);
        $("slidetext").textContent = tx("tx.tool_zinc_tracker.summary", "Zinc tracker saved: {count} of 10 days selected - {selectedItems}. Keep giving ORS until diarrhoea stops. Zinc is once daily for 10 days in this prototype; use the age amount and local product instructions.", { count: checked.length, selectedItems: checked.join(", ") || "nothing selected yet" });
        renderZincTracker();
      });
    }
    if (startReminder && !startReminder.dataset.bound) {
      startReminder.dataset.bound = "zinc";
      startReminder.addEventListener("click", function () {
        setNudgeStatus("zincnudgestatus", tx("tx.zinc.reminder.started", "10-day zinc reminder started."), tx("tx.zinc.reminder.detail", "Prototype local reminder request: once each evening for 10 days. Nothing is sent outside this app."));
        if ($("zincnudgestatus") && $("zincnudgestatus").setAttribute) $("zincnudgestatus").setAttribute("data-screen-id", "support.zinc_reminder");
        $("slidetext").textContent = tx("tx.zinc.reminder.screen_status", "I will show a prototype local reminder each evening for 10 days. Keep giving ORS until diarrhoea stops, and use urgent danger signs instead of waiting for a reminder.");
      });
    }
    if (help && !help.dataset.bound) {
      help.dataset.bound = "zinc";
      help.addEventListener("click", function () {
        $("slidetext").textContent = tx("tx.tool_zinc_tracker.urgent", "Seek urgent care now for diarrhoea danger signs such as blood in stool, unable to drink or breastfeed, repeated vomiting, lethargy, severe dehydration, fever, or the child getting worse. Start ORS if the child can drink, but do not wait for the zinc tracker.");
        renderZincTracker();
      });
    }
  }
  function showZincTracker() {
    activeSlides = [];
    showPanel("slideshow");
    var card = cardByFeature("zinc_tracker");
    $("slidetitle").textContent = t("tx.feature_zinc_tracker");
    $("slideimage").innerHTML = renderVisual("zinc_tracker", card ? card.imageDesc : "Caregiver giving dissolved zinc from a spoon to a child.", "img.generated.zinc_spoon_child_v1");
    $("slidetext").textContent = tx("tx.tool_zinc_tracker_body", "Use ORS until diarrhoea stops. Give zinc once each day for 10 days in this prototype: 10 mg under 6 months, 20 mg from 6 months and older. Mix a dispersible zinc dose in a spoon or small cup with clean water or breastmilk, then give it slowly. Local product instructions and CHW/clinic advice control before real use.");
    renderZincTracker();
    if ($("slideshow") && $("slideshow").setAttribute) $("slideshow").setAttribute("data-screen-id", "support.zinc_course");
  }
  function renderAncBirthPlanChecklist() {
    var reviewText = "ANC birth-plan checklist - local schedule not generated. CODEX Decision - needs approval. " + provenanceSummary("anc_birth_plan") + assetSummary("anc_birth_plan") + contractSummary("anc_birth_plan");
    $("slidecache").innerHTML = '<div class="slidecontrols checklist-controls"><label><input id="ancfacility" type="checkbox"> Birth facility and health-worker contact chosen</label><label><input id="anctransport" type="checkbox"> transport route and expected cost discussed</label><label><input id="ancsupport" type="checkbox"> Companion/support person named</label><label><input id="ancsupplies" type="checkbox"> Documents and clean newborn supplies gathered</label><label><input id="ancdangerplan" type="checkbox"> Danger signs and emergency contact reviewed</label><button id="ancsave" type="button">Save plan</button><button class="ghost" id="ancreminder" type="button">Request evening reminder</button>' + nudgeStatusPanelHtml("ancnudgestatus") + '</div>' + trackerContractHtml("anc_birth_plan") + traceDetails("Prototype review details", reviewText);
    var ids = ["ancfacility", "anctransport", "ancsupport", "ancsupplies", "ancdangerplan"];
    for (var i = 0; i < ids.length; i++) {
      var box = $(ids[i]);
      if (box && !box.dataset.bound) { box.dataset.bound = "anc"; box.addEventListener("change", function () { return; }); }
    }
    var save = $("ancsave"), reminder = $("ancreminder");
    if (save && !save.dataset.bound) {
      save.dataset.bound = "anc";
      save.addEventListener("click", function () {
        var names = {
          ancfacility: "facility/contact",
          anctransport: "transport/cost",
          ancsupport: "companion/support",
          ancsupplies: "documents/supplies",
          ancdangerplan: "danger signs/emergency contact"
        };
        showSubmittedChecklistResult({
          ids: ids, names: names, slug: "tx.tool_anc_birth_plan.summary",
          fallback: "Birth preparedness plan saved: {count} of {total} items selected - {selectedItems}. Use the approved local ANC schedule for visit dates, and use pregnancy danger signs for urgent care instead of waiting for a planned visit.",
          title: "Your birth preparedness plan", nextAction: "Complete any missing plan items with a health worker or clinic, and use the pregnancy danger check if something is wrong.",
          againId: "ancreviewagain", againLabel: "Review birth plan again", featureId: "anc_birth_plan",
          bodyText: tx("tx.tool_anc_birth_plan_body", "Birth preparedness checklist for pregnancy visits. Choose facility/contact, transport, companion, supplies, and emergency plan items now; no visit dates are generated until a local schedule, such as the local ANC schedule, is approved."),
          render: renderAncBirthPlanChecklist
        });
      });
    }
    if (reminder && !reminder.dataset.bound) {
      reminder.dataset.bound = "anc";
      reminder.addEventListener("click", function () {
        setNudgeStatus("ancnudgestatus", "Reminder requested for this evening.", "One gentle generic local reminder, quiet hours respected, no SMS or real push sent.");
        $("slidetext").textContent = tx("tx.tool_anc_birth_plan.nudge_requested", "Reminder requested for this evening. In this prototype it is only a visible local plan: no SMS, WhatsApp, calendar entry, or background notification is sent.");
      });
    }
  }
  function showAncBirthPlanChecklist() {
    activeSlides = [];
    showPanel("slideshow");
    var card = cardByFeature("anc_birth_plan");
    $("slidetitle").textContent = t("tx.feature_anc_birth_plan");
    $("slideimage").innerHTML = renderVisual("anc_birth_plan", card ? card.imageDesc : "Pregnant person reviewing a birth preparedness checklist.");
    $("slidetext").textContent = tx("tx.tool_anc_birth_plan_body", "Birth preparedness checklist for pregnancy visits. Choose facility/contact, transport, companion, supplies, and emergency plan items now; no visit dates are generated until a local schedule, such as the local ANC schedule, is approved.");
    renderAncBirthPlanChecklist();
  }
  function renderDeliveryKitChecklist() {
    $("slidecache").innerHTML = reviewDetailsHtml("delivery_kit_checklist", "Delivery kit checklist. Preparedness only; no facility routing.") + '<div class="slidecontrols"><label><input id="deliveryfacility" type="checkbox"> facility contact is written down</label><label><input id="deliverytransport" type="checkbox"> transport/cost plan is ready</label><label><input id="deliverycompanion" type="checkbox"> companion/support person is chosen</label><label><input id="deliverydocs" type="checkbox"> documents and pregnancy record are packed</label><label><input id="deliverycloths" type="checkbox"> clean cloths and newborn wrap are packed</label><label><input id="deliverydanger" type="checkbox"> danger signs and emergency contact reviewed</label><button id="deliverysave" type="button">Save kit list</button></div>';
    var ids = ["deliveryfacility", "deliverytransport", "deliverycompanion", "deliverydocs", "deliverycloths", "deliverydanger"];
    for (var i = 0; i < ids.length; i++) {
      var box = $(ids[i]);
      if (box && !box.dataset.bound) { box.dataset.bound = "delivery"; box.addEventListener("change", function () { return; }); }
    }
    var save = $("deliverysave");
    if (save && !save.dataset.bound) {
      save.dataset.bound = "delivery";
      save.addEventListener("click", function () {
        var names = {
          deliveryfacility: "facility contact",
          deliverytransport: "transport/cost",
          deliverycompanion: "companion/support",
          deliverydocs: "documents/record",
          deliverycloths: "clean cloths",
          deliverydanger: "danger signs/emergency contact"
        };
        showSubmittedChecklistResult({
          ids: ids, names: names, slug: "tx.tool_delivery_kit.summary",
          fallback: "Delivery kit list saved: {count} of {total} items selected - {selectedItems}. This is preparedness-only support, not facility routing or clinical advice. Use local skilled-birth guidance, and use pregnancy danger signs for urgent care instead of waiting for a planned birth visit.",
          title: "Your delivery kit plan", nextAction: "Complete any missing items before the planned birth visit. Use the pregnancy danger check if something is wrong.",
          againId: "deliveryreviewagain", againLabel: "Review kit list again", featureId: "delivery_kit_checklist",
          bodyText: tx("tx.tool_delivery_kit_body", "A birth preparedness kit checklist for practical planning: facility contact, transport/cost, companion, documents, clean cloths, newborn wrap, and emergency contact. This prototype is preparedness-only and must follow local skilled-birth guidance."),
          render: renderDeliveryKitChecklist
        });
      });
    }
  }
  function showDeliveryKitChecklist() {
    activeSlides = [];
    showPanel("slideshow");
    var card = cardByFeature("delivery_kit_checklist");
    $("slidetitle").textContent = t("tx.feature_delivery_kit_checklist");
    $("slideimage").innerHTML = renderVisual("delivery_kit_checklist", card ? card.imageDesc : "Birth preparedness checklist with contacts, transport, documents, and clean cloths.");
    $("slidetext").textContent = tx("tx.tool_delivery_kit_body", "A birth preparedness kit checklist for practical planning: facility contact, transport/cost, companion, documents, clean cloths, newborn wrap, and emergency contact. This prototype is preparedness-only and must follow local skilled-birth guidance.");
    renderDeliveryKitChecklist();
  }
  function kmcProgressText() {
    return "Today: " + kmcMinutesToday + " minutes of synthetic skin-to-skin session time.";
  }
  function kmcElapsedSeconds() {
    if (!kmcActive || !uiTimer || uiTimer.mode !== "elapsed" || uiTimer.label !== "Kangaroo care") return 0;
    return Math.max(0, uiTimer.elapsed || 0);
  }
  function kmcTimerText() {
    if (!kmcActive) {
      return kmcMinutesToday ? "Timer stopped. " + kmcProgressText() : "Timer idle. Tap Start when the baby is safely skin-to-skin.";
    }
    var seconds = kmcElapsedSeconds();
    var minutes = Math.floor(seconds / 60);
    var remainder = seconds % 60;
    return "Kangaroo care timer running: " + minutes + "m " + (remainder < 10 ? "0" : "") + remainder + "s. Keep the baby warm, visible, and safely positioned.";
  }
  function renderKmcTimer() {
    $("slidecache").innerHTML = timerPanelHtml("Kangaroo care timer", "0:00", kmcTimerText(), { includeMusic: false, ariaLabel: "Kangaroo care elapsed time toward one hour" }) + '<div class="progress-panel"><div class="progress-row"><span>' + esc(kmcProgressText()) + '</span></div><div class="muted">Keep this screen open while timing; phone alerts may not work if the phone sleeps.</div></div><div class="slidecontrols wrap-controls"><button id="kmcstart" type="button"' + (kmcActive ? " disabled" : "") + '>Start session</button><button class="ghost" id="kmcstop" type="button"' + (!kmcActive ? " disabled" : "") + '>Stop and record</button><button class="ghost" id="kmcadd" type="button">Add 15 minutes</button><button class="ghost" id="kmchelp" type="button">Need help now</button></div>' + traceDetails("Prototype review details", "KMC session timer. Supportive only; newborn danger signs and health-worker guidance override. CODEX Decision - needs approval. " + provenanceSummary("kmc_timer") + assetSummary("kmc_timer") + contractSummary("kmc_timer")) + trackerContractHtml("kmc_timer");
    updateUiTimerControls();
    var start = $("kmcstart"), stop = $("kmcstop"), add = $("kmcadd"), help = $("kmchelp");
    if (start && !start.dataset.bound) {
      start.dataset.bound = "kmc";
      start.addEventListener("click", function () {
        kmcActive = true;
        startUiElapsedTimer("Kangaroo care", 3600, { startId: "kmcstart", startText: "Start session", idleCaption: "Tap Start when the baby is safely skin-to-skin.", runningCaption: "Elapsed skin-to-skin time. Stop when the session ends." });
        $("slidetext").textContent = tx("tx.tool_kmc_timer.started", "Session started. A visible foreground timer is running. Keep the baby skin-to-skin as advised by a health worker, support feeding, and keep the baby warm and safely positioned.");
        renderKmcTimer();
      });
    }
    if (stop && !stop.dataset.bound) {
      stop.dataset.bound = "kmc";
      stop.addEventListener("click", function () {
        var recorded = Math.max(1, Math.ceil(kmcElapsedSeconds() / 60));
        kmcMinutesToday += recorded;
        kmcActive = false;
        cancelUiCountdown();
        $("slidetext").textContent = tx("tx.tool_kmc_timer.stopped", "Session stopped and {minutes} synthetic minute recorded. Continue only while the caregiver and baby are safe and comfortable, and follow the health worker's plan for preterm or low-birth-weight care.", { minutes: recorded });
        renderKmcTimer();
      });
    }
    if (add && !add.dataset.bound) {
      add.dataset.bound = "kmc";
      add.addEventListener("click", function () {
        kmcMinutesToday += 15;
        $("slidetext").textContent = tx("tx.tool_kmc_timer.summary", "KMC session recorded: {minutes} minutes recorded today. Continue only while the caregiver and baby are safe and comfortable, and follow the health worker's plan for preterm or low-birth-weight care.", { minutes: kmcMinutesToday });
        renderKmcTimer();
      });
    }
    if (help && !help.dataset.bound) {
      help.dataset.bound = "kmc";
      help.addEventListener("click", function () {
        kmcActive = false;
        cancelUiCountdown();
        $("slidetext").textContent = tx("tx.tool_kmc_timer.urgent", "Ask a trusted health worker or clinic for help now for newborn danger signs such as poor feeding, breathing trouble, fever or low temperature, convulsions, jaundice, or if the caregiver feels unsafe or exhausted. Do not wait for this timer.");
        renderKmcTimer();
      });
    }
  }
  function showKmcTimer() {
    activeSlides = [];
    showPanel("slideshow");
    var card = cardByFeature("kmc_timer");
    $("slidetitle").textContent = t("tx.feature_kmc_timer");
    $("slideimage").innerHTML = renderVisual("kmc_timer", card ? card.imageDesc : "Caregiver holding a newborn skin-to-skin under a wrap with a session timer.");
    var baby = eligibleKmcBaby();
    if (!baby) {
      cancelUiCountdown();
      kmcActive = false;
      $("slidetext").textContent = kmcEligibilityMessage();
      $("slidecache").innerHTML = '<div class="result-card"><strong>Kangaroo care timer hidden</strong><p>' + esc(kmcEligibilityMessage()) + '</p><p class="muted">Use newborn danger checks for urgent concerns. This prototype does not decide who needs kangaroo mother care.</p></div>' + traceDetails("Prototype review details", "KMC direct launch blocked because no synthetic baby meets the prototype eligibility gate. " + provenanceSummary("kmc_timer") + assetSummary("kmc_timer") + contractSummary("kmc_timer"));
      return;
    }
    $("slidetext").textContent = tx("tx.tool_kmc_timer_body", "Supportive skin-to-skin session tracker for preterm or low-birth-weight babies when a health worker has advised kangaroo mother care. It records synthetic minutes only and does not replace newborn danger checks.");
    renderKmcTimer();
  }
  function renderFamilyPreparednessChecklist() {
    $("slidecache").innerHTML = reviewDetailsHtml("family_preparedness", "Family preparedness checklist. Offline household readiness.") + '<div class="slidecontrols"><label><input id="familysupplies" type="checkbox"> water/ORS and safe-water supplies are ready</label><label><input id="familycontact" type="checkbox"> clinic contact and emergency contacts are written down</label><label><input id="familytransport" type="checkbox"> transport plan and expected cost are discussed</label><label><input id="familydocs" type="checkbox"> IDs, health records, and key documents are together</label><label><input id="familymeds" type="checkbox"> medicines, refills, and special child/pregnancy needs are checked</label><label><input id="familymeetup" type="checkbox"> family meet-up or communication plan is agreed</label><button id="familyready" type="button">Review checklist</button></div>';
    var ids = ["familysupplies", "familycontact", "familytransport", "familydocs", "familymeds", "familymeetup"];
    for (var i = 0; i < ids.length; i++) {
      var box = $(ids[i]);
      if (box && !box.dataset.bound) { box.dataset.bound = "family"; box.addEventListener("change", function () { return; }); }
    }
    var ready = $("familyready");
    if (ready && !ready.dataset.bound) {
      ready.dataset.bound = "family";
      ready.addEventListener("click", function () {
        var names = {
          familysupplies: "water/ORS",
          familycontact: "clinic contact",
          familytransport: "transport",
          familydocs: "documents",
          familymeds: "medicines/refills",
          familymeetup: "family meet-up plan"
        };
        showSubmittedChecklistResult({
          ids: ids, names: names, slug: "tx.tool_family_preparedness.summary",
          fallback: "Family readiness list saved: {count} of {total} items selected - {selectedItems}. This is non-clinical offline household preparedness support. Follow local emergency instructions, and seek urgent care for danger signs instead of relying on the checklist.",
          title: "Your family readiness plan", nextAction: "Complete the missing readiness items with your family. Seek urgent care for danger signs.",
          againId: "familyreviewagain", againLabel: "Review family checklist again", featureId: "family_preparedness",
          bodyText: tx("tx.tool_family_preparedness_body", "An offline household readiness checklist for families: water/ORS, clinic contact, transport, documents, medicines/refills, and a family meet-up plan. This is non-clinical preparedness support and must follow local emergency instructions."),
          render: renderFamilyPreparednessChecklist
        });
      });
    }
  }
  function showFamilyPreparednessChecklist() {
    activeSlides = [];
    showPanel("slideshow");
    var card = cardByFeature("family_preparedness");
    $("slidetitle").textContent = t("tx.feature_family_preparedness");
    $("slideimage").innerHTML = renderVisual("family_preparedness", card ? card.imageDesc : "Household checklist with water, ORS, contacts, documents, medicines, and transport.");
    $("slidetext").textContent = tx("tx.tool_family_preparedness_body", "An offline household readiness checklist for families: water/ORS, clinic contact, transport, documents, medicines/refills, and a family meet-up plan. This is non-clinical preparedness support and must follow local emergency instructions.");
    renderFamilyPreparednessChecklist();
  }
  function renderChronicRefillTracker() {
    $("slidecache").innerHTML = reviewDetailsHtml("chronic_refill_tracker", "Medicine refill tracker. Medicine-list and refill planning only.") + '<div class="slidecontrols"><label><input id="refilllist" type="checkbox"> medicine list includes prescriptions, over-the-counter medicines, vitamins, and supplements</label><label><input id="refilllabel" type="checkbox"> labels or original containers are available and readable</label><label><input id="refillcontact" type="checkbox"> clinic/pharmacy contact and refill route are known</label><label><input id="refillcalendar" type="checkbox"> next refill or visit reminder is written down</label><label><input id="refillquestions" type="checkbox"> questions or side-effect concerns are ready for clinician/pharmacist</label><button id="refillreview" type="button">Review refill plan</button><button class="ghost" id="refillhelp" type="button">Medicine concern now</button></div>' + trackerContractHtml("chronic_refill_tracker");
    var ids = ["refilllist", "refilllabel", "refillcontact", "refillcalendar", "refillquestions"];
    for (var i = 0; i < ids.length; i++) {
      var box = $(ids[i]);
      if (box && !box.dataset.bound) { box.dataset.bound = "refill"; box.addEventListener("change", function () { return; }); }
    }
    var review = $("refillreview"), help = $("refillhelp");
    if (review && !review.dataset.bound) {
      review.dataset.bound = "refill";
      review.addEventListener("click", function () {
        var names = {
          refilllist: "medicine list",
          refilllabel: "labels/original containers",
          refillcontact: "clinic/pharmacy contact",
          refillcalendar: "refill or visit reminder",
          refillquestions: "questions"
        };
        showSubmittedChecklistResult({
          ids: ids, names: names, slug: "tx.tool_chronic_refill.summary",
          fallback: "Medicine refill plan saved: {count} of {total} items selected - {selectedItems}. No dose advice is given here; do not start, stop, split, or change medicines because of this prototype. Use the medicine label and clinician/pharmacist instructions, and bring the medicine list and questions to the next refill or visit.",
          title: "Your medicine refill plan", nextAction: "Bring the medicine list, labels, and questions to the next clinic or pharmacy visit.",
          againId: "refillreviewagain", againLabel: "Review refill plan again", featureId: "chronic_refill_tracker",
          bodyText: tx("tx.tool_chronic_refill_body", "Medicine list and refill planning helper. Keep a medicine list, check labels or original containers, plan clinic/pharmacy contact, and write questions for a clinician or pharmacist. It does not give dose advice or change medicines."),
          render: renderChronicRefillTracker
        });
      });
    }
    if (help && !help.dataset.bound) {
      help.dataset.bound = "refill";
      help.addEventListener("click", function () {
        $("slidetext").textContent = tx("tx.tool_chronic_refill.urgent", "Seek urgent care or trusted clinical help now for serious side effects, trouble breathing, fainting, swelling of lips/face, severe rash, poisoning concern, overdose, or a child taking medicine by mistake; do not wait for this refill tracker, and call local poison/emergency services where available.");
        renderChronicRefillTracker();
      });
    }
  }
  function showChronicRefillTracker() {
    activeSlides = [];
    showPanel("slideshow");
    var card = cardByFeature("chronic_refill_tracker");
    $("slidetitle").textContent = t("tx.feature_chronic_refill_tracker");
    $("slideimage").innerHTML = renderVisual("chronic_refill_tracker", card ? card.imageDesc : "Medicine refill checklist with pill bottle, calendar, and clinic or pharmacy contact.");
    $("slidetext").textContent = tx("tx.tool_chronic_refill_body", "Medicine list and refill planning helper. Keep a medicine list, check labels or original containers, plan clinic/pharmacy contact, and write questions for a clinician or pharmacist. It does not give dose advice or change medicines.");
    renderChronicRefillTracker();
  }
  function renderLaborClock() {
    $("slidecache").innerHTML = reviewDetailsHtml("labor_clock", "Labor clock. Foreground timing and transport planning shell.") + '<div class="slidecontrols"><label>Local threshold minutes <input id="laborthreshold" type="number" min="1" value="60"></label><label>Transport buffer minutes <input id="labortransport" type="number" min="0" value="45"></label><button id="laborreview" type="button">Review labor clock</button><button class="ghost" id="laborhelp" type="button">Danger signs now</button></div>';
    var review = $("laborreview"), help = $("laborhelp");
    if (review && !review.dataset.bound) {
      review.dataset.bound = "labor";
      review.addEventListener("click", function () {
        var threshold = ($("laborthreshold").value || "").trim() || "not set";
        var transport = ($("labortransport").value || "").trim() || "not set";
        $("slidetext").textContent = tx("tx.tool_labor_clock.summary", "Labor clock plan saved using local threshold: {threshold} minutes and transport buffer: {transport} minutes. Use this as a foreground planning aid only; pregnancy danger signs override any timer.", { threshold: threshold, transport: transport });
      });
    }
    if (help && !help.dataset.bound) {
      help.dataset.bound = "labor";
      help.addEventListener("click", function () {
        $("slidetext").textContent = tx("tx.tool_labor_clock.urgent", "Seek urgent care now for pregnancy or labor danger signs such as bleeding, fluid leaking, severe headache or vision change, trouble breathing, severe belly pain, fever, severe vomiting, baby movement stopping or slowing, or feeling unsafe. Do not wait for the labor clock.");
      });
    }
  }
  function showLaborClock() {
    activeSlides = [];
    showPanel("slideshow");
    var card = cardByFeature("labor_clock");
    $("slidetitle").textContent = t("tx.feature_labor_clock");
    $("slideimage").innerHTML = renderVisual("labor_clock", card ? card.imageDesc : "Labor timing support visual with a foreground clock, clinic arrow, local threshold, transport buffer, and danger override.");
    $("slidetext").textContent = tx("tx.tool_labor_clock_body", "Labor clock for locally approved timing thresholds and transport planning. Use it only as a visible foreground planning aid, and use pregnancy danger signs for urgent care instead of waiting for any timer.");
    renderLaborClock();
  }
  function renderBednetReminder() {
    $("slidecache").innerHTML = reviewDetailsHtml("bednet_hanging_reminder", "Bednet reminder. Malaria prevention support only.") + '<div class="slidecontrols"><label><input id="bednetpreg" type="checkbox"> pregnant person has a sleeping place protected by a net</label><label><input id="bednetchild" type="checkbox"> child sleeping place is protected by a net</label><label><input id="bednethang" type="checkbox"> net is hung and tucked in before sleep</label><label><input id="bednetrepair" type="checkbox"> holes, tears, or missing hanging points are checked for repair</label><button id="bednetsave" type="button">Review bednet plan</button></div>' + trackerContractHtml("bednet_hanging_reminder");
    var ids = ["bednetpreg", "bednetchild", "bednethang", "bednetrepair"];
    var save = $("bednetsave");
    if (save && !save.dataset.bound) {
      save.dataset.bound = "bednet";
      save.addEventListener("click", function () {
        var names = { bednetpreg: "pregnant person", bednetchild: "child", bednethang: "hung/tucked net", bednetrepair: "repair" };
        showSubmittedChecklistResult({
          ids: ids, names: names, slug: "tx.tool_bednet.summary",
          fallback: "Bednet reminder plan saved: {count} of {total} items selected - {selectedItems}. Use locally recommended insecticide-treated nets where malaria risk exists. This is prevention support only; fever needs local malaria guidance, testing, and care.",
          title: "Your bednet plan", nextAction: "Hang, tuck, or repair the nets that are not ready before the next sleep.",
          againId: "bednetreviewagain", againLabel: "Review bednet plan again", featureId: "bednet_hanging_reminder",
          bodyText: tx("tx.tool_bednet_body", "Malaria prevention reminder for bednet hanging, checking, and repair. Prioritize pregnant people and children where local malaria risk and bednet guidance apply."),
          render: renderBednetReminder
        });
      });
    }
  }
  function showBednetReminder() {
    activeSlides = [];
    showPanel("slideshow");
    var card = cardByFeature("bednet_hanging_reminder");
    $("slidetitle").textContent = t("tx.feature_bednet_hanging_reminder");
    $("slideimage").innerHTML = renderVisual("bednet_hanging_reminder", card ? card.imageDesc : "Caregiver tucking a bednet around a sleeping area with a repair reminder and malaria-prevention cue.");
    $("slidetext").textContent = tx("tx.tool_bednet_body", "Malaria prevention reminder for bednet hanging, checking, and repair. Prioritize pregnant people and children where local malaria risk and bednet guidance apply.");
    renderBednetReminder();
  }
  function renderDehydrationGuide() {
    $("slidecache").innerHTML = reviewDetailsHtml("dehydration_visual_guide", "Dehydration guide. Danger signs first; not a diagnosis.") +
      renderClinicalChecklist("dehydration_guide.main");
    var ids = bindClinicalChecklist("dehydration_guide.main").ids;
    var review = $("dehydreview");
    if (review && !review.dataset.bound) {
      review.dataset.bound = "dehyd";
      review.addEventListener("click", function () {
        var checked = ids.filter(function (id) { return !!$(id).checked; });
        if (!checked.length) return;
        var names = { dehydunable: "unable to drink", dehydsunken: "sunken eyes", dehydlethargy: "lethargy", dehydblood: "blood in stool/worse" };
        var dangerChecked = checked.filter(function (id) { return id !== "dehydother" && id !== "dehydnone"; });
        var selectedNames = dangerChecked.map(function (id) { return names[id]; }).join(", ");
        if (dangerChecked.length) $("slidetext").textContent = tx("tx.tool_dehydration_guide.urgent", "Seek urgent care now for dehydration danger signs: {selectedSigns}. Give ORS if the child can drink, but do not delay care. This text-only guide is not a diagnosis or dehydration classification.", { selectedSigns: selectedNames });
        else if ($("dehydother").checked) $("slidetext").textContent = friendlyOtherMessage();
        else $("slidetext").textContent = tx("tx.tool_dehydration_guide.no_urgent", "No dehydration danger sign selected in this prototype. Keep giving ORS if the child can drink, continue feeding/breastfeeding as locally advised, and return for danger signs. This is not a diagnosis.");
        renderDehydrationGuide();
      });
    }
  }
  function showDehydrationGuide() {
    activeSlides = [];
    showPanel("slideshow");
    var card = cardByFeature("dehydration_visual_guide");
    $("slidetitle").textContent = t("tx.feature_dehydration_visual_guide");
    $("slideimage").innerHTML = renderVisual("dehydration_visual_guide", card ? card.imageDesc : "Caregiver watching a tired child with cup, water bottle, and dehydration concern cues; not a diagnosis image.");
    $("slidetext").textContent = tx("tx.tool_dehydration_guide_body", "Dehydration guide for diarrhoea. It starts with danger signs first, then supports ORS if the child can drink.");
    renderDehydrationGuide();
  }
  function renderComplementaryFeedingCard() {
    $("slidecache").innerHTML = reviewDetailsHtml("complementary_feeding_card", "Complementary feeding card. Nutrition education only.") + '<div class="slidecontrols"><label><input id="feedingage" type="checkbox"' + (feedingPlanSelections.feedingage ? " checked" : "") + '> child is around 6 months or older</label><label><input id="feedingdiverse" type="checkbox"' + (feedingPlanSelections.feedingdiverse ? " checked" : "") + '> varied foods are planned from locally available options</label><label><input id="feedingresponsive" type="checkbox"' + (feedingPlanSelections.feedingresponsive ? " checked" : "") + '> caregiver can feed slowly and responsively</label><label><input id="feedinghygiene" type="checkbox"' + (feedingPlanSelections.feedinghygiene ? " checked" : "") + '> hands, utensils, and water are clean</label><label><input id="feedingsick" type="checkbox"' + (feedingPlanSelections.feedingsick ? " checked" : "") + '> plan to seek help if child is sick, losing weight, or not eating</label><button id="feedingsave" type="button">Review feeding plan</button></div>';
    var ids = ["feedingage", "feedingdiverse", "feedingresponsive", "feedinghygiene", "feedingsick"];
    var save = $("feedingsave");
    if (save && !save.dataset.bound) {
      save.dataset.bound = "feeding";
      save.addEventListener("click", function () {
        ids.forEach(function (id) { feedingPlanSelections[id] = !!$(id).checked; });
        showComplementaryFeedingResult(ids);
      });
    }
  }
  function showComplementaryFeedingResult(ids) {
    var readyLabels = {
      feedingage: tx("tx.feeding_plan.ready_age", "child is around 6 months or older"),
      feedingdiverse: tx("tx.feeding_plan.ready_diverse", "varied foods are planned"),
      feedingresponsive: tx("tx.feeding_plan.ready_responsive", "caregiver can feed slowly and patiently"),
      feedinghygiene: tx("tx.feeding_plan.ready_hygiene", "hands, utensils, and water are clean"),
      feedingsick: tx("tx.feeding_plan.ready_help", "caregiver plans to seek help for illness, weight loss, or not eating")
    };
    var nextLabels = {
      feedingage: tx("tx.feeding_plan.next_age", "Wait until the child is around 6 months old before starting these foods; ask a health worker if you are unsure."),
      feedingdiverse: tx("tx.feeding_plan.next_diverse", "Plan more than one kind of locally available food."),
      feedingresponsive: tx("tx.feeding_plan.next_responsive", "Feed slowly and patiently, and stop when the child shows they are full."),
      feedinghygiene: tx("tx.feeding_plan.next_hygiene", "Wash hands and use clean water, utensils, and serving dishes."),
      feedingsick: tx("tx.feeding_plan.next_help", "Contact a health worker or clinic if the child is sick, losing weight, or not eating.")
    };
    var ready = ids.filter(function (id) { return !!feedingPlanSelections[id]; }).map(function (id) { return readyLabels[id]; });
    var next = ids.filter(function (id) { return !feedingPlanSelections[id]; }).map(function (id) { return nextLabels[id]; });
    var readyText = ready.length ? ready.join("; ") : tx("tx.feeding_plan.ready_none", "no plan items selected yet");
    var nextText = next.length ? next.join(" ") : tx("tx.feeding_plan.next_complete", "Keep using this plan, continue breastfeeding where possible, and ask a health worker or clinic if feeding becomes difficult.");
    setSlideResult({
      kind: "home",
      careRoute: "home_watch",
      title: tx("tx.feeding_plan.result_title", "Your feeding plan"),
      nextAction: tx("tx.feeding_plan.result_action", "Use the next steps below, then review the plan again when something changes."),
      bodyHtml: '<p>' + esc(tx("tx.feeding_plan.count", "{count} of {total} plan items selected.", { count: ready.length, total: ids.length })) + '</p><p><strong>' + esc(tx("tx.feeding_plan.ready_label", "Ready")) + ":</strong> " + esc(readyText) + '.</p><p><strong>' + esc(tx("tx.feeding_plan.next_label", "Next")) + ":</strong> " + esc(nextText) + "</p>",
      paragraphs: [tx("tx.feeding_plan.continue_breastfeeding", "Keep breastfeeding where possible while adding age-appropriate foods.")]
    });
    $("slideimage").classList.add("hidden");
    $("slidecache").innerHTML = '<div class="slidecontrols"><button id="feedingreviewagain" type="button">' + esc(tx("tx.feeding_plan.review_again", "Review feeding plan again")) + "</button></div>" + reviewDetailsHtml("complementary_feeding_card", "Complementary feeding card. Nutrition education only.");
    var again = $("feedingreviewagain");
    if (again && !again.dataset.bound) {
      again.dataset.bound = "feeding";
      again.addEventListener("click", function () {
        $("slideimage").classList.remove("hidden");
        $("slidetext").textContent = tx("tx.tool_complementary_feeding_body", "Complementary feeding support for children around 6 months and older: varied foods, responsive feeding, hygiene, and continued breastfeeding where possible.");
        renderComplementaryFeedingCard();
        moveToNextStep("slidecache");
      });
    }
  }
  function showComplementaryFeedingCard() {
    activeSlides = [];
    feedingPlanSelections = {};
    showPanel("slideshow");
    var card = cardByFeature("complementary_feeding_card");
    $("slidetitle").textContent = t("tx.feature_complementary_feeding_card");
    $("slideimage").innerHTML = renderVisual("complementary_feeding_card", card ? card.imageDesc : "Caregiver feeding a young child from a bowl with varied foods, cup, and handwashing cue.");
    $("slidetext").textContent = tx("tx.tool_complementary_feeding_body", "Complementary feeding support for children around 6 months and older: varied foods, responsive feeding, hygiene, and continued breastfeeding where possible.");
    renderComplementaryFeedingCard();
  }
  function renderChlorineDoseHelper() {
    $("slidecache").innerHTML = reviewDetailsHtml("chlorine_dose_helper", "Chlorine dose helper. Echoes local table values only; no generic dose.") + '<div class="slidecontrols"><label>Local table dose (mL) <input id="chlorinedoseml" type="number" min="0" step="0.1"></label><label>Water volume (L) <input id="chlorinevolume" type="number" min="0" step="0.1"></label><button id="chlorinedosereview" type="button">Review entered dose</button></div>';
    var review = $("chlorinedosereview");
    if (review && !review.dataset.bound) {
      review.dataset.bound = "chlorinedose";
      review.addEventListener("click", function () {
        var dose = ($("chlorinedoseml").value || "").trim();
        var volume = ($("chlorinevolume").value || "").trim();
        if (dose && volume) $("slidetext").textContent = tx("tx.tool_chlorine_dose_helper.echo", "For {volume} L, use {dose} mL only because you entered it from a local approved table or product label. This helper does not invent a dose, interpolate between products, or replace the label. Seek urgent care for dehydration or danger signs.", { dose: dose, volume: volume });
        else $("slidetext").textContent = tx("tx.tool_chlorine_dose_helper.missing", "Enter both values from the approved local table or product label. This prototype does not invent a dose and should not be used without local WASH/product approval.");
      });
    }
  }
  function showChlorineDoseHelper() {
    activeSlides = [];
    showPanel("slideshow");
    var card = cardByFeature("chlorine_dose_helper");
    $("slidetitle").textContent = t("tx.feature_chlorine_dose_helper");
    $("slideimage").innerHTML = renderVisual("chlorine_dose_helper", card ? card.imageDesc : "Covered water container and unbranded chlorine product beside a local-table checklist; no generic dose.");
    $("slidetext").textContent = tx("tx.tool_chlorine_dose_helper_body", "Chlorine dose helper for an approved local table or product label. It echoes values you enter from that local table and does not calculate or invent a chlorine dose.");
    renderChlorineDoseHelper();
  }
  function renderSanitationChecklist() {
    $("slidecache").innerHTML = reviewDetailsHtml("sanitation_checklist", "Sanitation checklist. Household WASH support only.") + '<div class="slidecontrols"><label><input id="sanitationlatrine" type="checkbox"> latrine or toilet is usable and private enough</label><label><input id="sanitationhandwash" type="checkbox"> handwashing station has soap or ash and water</label><label><input id="sanitationchildfeces" type="checkbox"> diapers or child stool are kept away from hands, food, and drinking water, then put in a toilet/latrine or handled by local WASH guidance</label><label><input id="sanitationcleaning" type="checkbox"> cleaning supplies are stored away from children and food</label><label><input id="sanitationcontact" type="checkbox"> local WASH contact or repair route is known</label><label><input id="sanitationother" type="checkbox"> something else worries me</label><label><input id="sanitationnone" type="checkbox"> none of these</label><button id="sanitationreview" type="button">Show sanitation steps</button></div>';
    var ids = ["sanitationlatrine", "sanitationhandwash", "sanitationchildfeces", "sanitationcleaning", "sanitationcontact", "sanitationother", "sanitationnone"];
    var review = $("sanitationreview");
    if (review && !review.dataset.bound) {
      review.dataset.bound = "sanitation";
      review.addEventListener("click", function () {
        var names = { sanitationlatrine: "latrine", sanitationhandwash: "handwashing station", sanitationchildfeces: "child stool kept away from hands, food, and water", sanitationcleaning: "cleaning supplies stored away from children and food", sanitationcontact: "local WASH contact", sanitationother: "other WASH concern", sanitationnone: "none of these" };
        if ($("sanitationother").checked) {
          setSlideResult({ kind: "clinic", careRoute: "professional_fallback", title: "Ask about the concern", nextAction: friendlyOtherMessage() });
          $("slideimage").classList.add("hidden");
          $("slidecache").innerHTML = '<div class="slidecontrols"><button id="sanitationreviewagain" type="button">Review sanitation checklist again</button></div>';
          $("sanitationreviewagain").addEventListener("click", function () {
            $("slideimage").classList.remove("hidden");
            $("slidetext").textContent = tx("tx.tool_sanitation_body", "Sanitation checklist for latrine or toilet access, handwashing station, child feces disposal, cleaning supplies, and local WASH contact.");
            renderSanitationChecklist();
            moveToNextStep("slidecache");
          });
        } else {
          showSubmittedChecklistResult({
            ids: ids, names: names, slug: "tx.tool_sanitation.summary",
            fallback: "Sanitation checklist saved: {count} of {total} items selected - {selectedItems}. Keep child stool, diapers, cleaning chemicals, and dirty water away from children's hands, food, and drinking water. Follow the local WASH program for latrine, waste, and repair guidance. Use diarrhoea danger signs and urgent care pathways instead of waiting on this checklist.",
            title: "Your sanitation steps", nextAction: "Complete missing steps and contact the local WASH program for latrine, waste, or repair help.",
            againId: "sanitationreviewagain", againLabel: "Review sanitation checklist again", featureId: "sanitation_checklist",
            bodyText: tx("tx.tool_sanitation_body", "Sanitation checklist for latrine or toilet access, handwashing station, child feces disposal, cleaning supplies, and local WASH contact."),
            render: renderSanitationChecklist
          });
        }
      });
    }
  }
  function showSanitationChecklist() {
    activeSlides = [];
    showPanel("slideshow");
    var card = cardByFeature("sanitation_checklist");
    $("slidetitle").textContent = t("tx.feature_sanitation_checklist");
    $("slideimage").innerHTML = renderVisual("sanitation_checklist", card ? card.imageDesc : "Household WASH scene with latrine, handwashing, and child-stool disposal cues.");
    $("slidetext").textContent = tx("tx.tool_sanitation_body", "Sanitation checklist for latrine or toilet access, handwashing station, child feces disposal, cleaning supplies, and local WASH contact.");
    renderSanitationChecklist();
  }
  function renderSafeWaterChlorineChecker() {
    var reviewText = "Safe-water chlorine checker - no dose shown; local label/table controls. CODEX Decision - needs approval. " + provenanceSummary("safe_water_chlorine") + assetSummary("safe_water_chlorine") + contractSummary("safe_water_chlorine");
    $("slidecache").innerHTML =
      '<div class="slidecontrols checklist-controls"><fieldset class="symptom-group"><legend>Before anyone drinks treated water</legend>' +
      '<label><input id="safewaterlabel" type="checkbox"> I have the local chlorine product label or approved dose table</label>' +
      '<label><input id="safewaterdose" type="checkbox"> I checked the dose on that label or table</label>' +
      '<label><input id="safewaterwait" type="checkbox"> I checked the wait time before drinking</label>' +
      '<label><input id="safewatercover" type="checkbox"> The treated water is in a clean covered container</label>' +
      '</fieldset><button id="safewaterreview" type="button">Show safe-water steps</button></div>' +
      traceDetails("Prototype review details", reviewText);
    var ids = ["safewaterlabel", "safewaterdose", "safewaterwait", "safewatercover"];
    for (var i = 0; i < ids.length; i++) {
      var box = $(ids[i]);
      var id = ids[i];
      if (box && !box.dataset.bound) { box.dataset.bound = "safewater"; box.addEventListener("change", (function (boxId) { return function () { safeWaterSelections[boxId] = !!$(boxId).checked; }; })(id)); }
    }
    for (var j = 0; j < ids.length; j++) {
      var saved = $(ids[j]);
      if (saved) saved.checked = !!safeWaterSelections[ids[j]];
    }
    var review = $("safewaterreview");
    if (review && !review.dataset.bound) {
      review.dataset.bound = "safewater";
      review.addEventListener("click", function () {
        for (var k = 0; k < ids.length; k++) if ($(ids[k])) safeWaterSelections[ids[k]] = !!$(ids[k]).checked;
        var names = {
          safewaterlabel: "local product label",
          safewaterdose: "approved local dose table",
          safewaterwait: "contact/wait time",
          safewatercover: "clean covered container"
        };
        showSubmittedChecklistResult({
          ids: ids, names: names, slug: "tx.tool_safe_water_chlorine.summary",
          fallback: "Ready now ({count} of {total}): {selectedItems}. This app does not give a chlorine dose; use the local product label or approved local table. Seek urgent care for diarrhoea danger signs.",
          title: "Your safe-water steps", nextAction: "Do not drink the water until the product label or approved local table dose and wait time have been followed.",
          againId: "safewaterreviewagain", againLabel: "Review safe-water steps again", featureId: "safe_water_chlorine",
          bodyText: tx("tx.tool_safe_water_chlorine_body", "Use this when you have a local chlorine product label or an approved local dose table. Check the label or table, wait the required time, and keep treated water in a clean covered container."),
          render: renderSafeWaterChlorineChecker
        });
      });
    }
  }
  function showSafeWaterChlorineChecker() {
    activeSlides = [];
    showPanel("slideshow");
    var card = cardByFeature("safe_water_chlorine");
    safeWaterSelections = {};
    $("slidetitle").textContent = t("tx.feature_safe_water_chlorine");
    $("slideimage").innerHTML = renderVisual("safe_water_chlorine", card ? card.imageDesc : "Covered water container and locally approved chlorine product label.");
    $("slidetext").textContent = tx("tx.tool_safe_water_chlorine_body", "Use this when you have a local chlorine product label or an approved local dose table. Check the label or table, wait the required time, and keep treated water in a clean covered container.");
    renderSafeWaterChlorineChecker();
  }
  function renderChlorineContactTimer() {
    $("slidecache").innerHTML = reviewDetailsHtml("chlorine_contact_timer", "Chlorine wait timer. Foreground wait helper only; no dose shown.") + timerPanelHtml("Chlorine wait timer", "30:00", "Ready", { includeMusic: false }) + '<div class="slidecontrols"><label><input id="chlorineproduct" type="checkbox"> local product label or approved dose table is checked</label><label><input id="chlorinecovered" type="checkbox"> covered container is ready</label><button id="chlorinestart" type="button">Start 30-minute wait</button><button class="ghost" id="chlorinepause" type="button" disabled>Pause</button><button class="ghost" id="chlorinereset" type="button">Reset timer</button><button class="ghost" id="chlorinedone" type="button">Mark wait complete</button></div>';
    var ids = ["chlorineproduct", "chlorinecovered"];
    for (var i = 0; i < ids.length; i++) {
      var box = $(ids[i]);
      if (box && !box.dataset.bound) { box.dataset.bound = "chlorine"; box.addEventListener("change", function () { return; }); }
    }
    var start = $("chlorinestart"), done = $("chlorinedone");
    if (start && !start.dataset.bound) {
      start.dataset.bound = "chlorine";
      start.addEventListener("click", function () {
        startUiCountdown("Chlorine wait", 1800, null, { startId: "chlorinestart", pauseId: "chlorinepause", resetId: "chlorinereset", startText: "Start 30-minute wait" });
        $("slidetext").textContent = tx("tx.tool_chlorine_timer.started", "30-minute wait started in this foreground prototype. Keep the treated water covered and nearby; the phone may sleep, so do not rely on this as a background alert. Use the local product label or local program if it gives a different wait time.");
      });
    }
    bindUiCountdownButton("chlorinepause", pauseOrResumeUiCountdown);
    bindUiCountdownButton("chlorinereset", resetUiCountdown);
    if (done && !done.dataset.bound) {
      done.dataset.bound = "chlorine";
      done.addEventListener("click", function () {
        var names = {
          chlorineproduct: "local product label or approved dose table",
          chlorinecovered: "covered container"
        };
        setChecklistSummary({ ids: ids, names: names, slug: "tx.tool_chlorine_timer.summary", fallback: "Chlorine wait check saved: {count} of {total} items selected - {selectedItems}. No chlorine dose is shown in this prototype. Follow the local program, product label, or approved local table for dose and wait time, and store treated water in a clean covered container." });
      });
    }
  }
  function showChlorineContactTimer() {
    activeSlides = [];
    showPanel("slideshow");
    var card = cardByFeature("chlorine_contact_timer");
    $("slidetitle").textContent = t("tx.feature_chlorine_contact_timer");
    $("slideimage").innerHTML = renderVisual("chlorine_contact_timer", card ? card.imageDesc : "Covered water container with chlorine product and wait clock.");
    $("slidetext").textContent = tx("tx.tool_chlorine_timer_body", "Chlorine wait timer for locally treated water. Use only an approved local chlorine dose instruction, keep the container covered, and wait 30 minutes or the local program wait time before drinking.");
    renderChlorineContactTimer();
  }
  function renderBoilWaterTimer() {
    $("slidecache").innerHTML = reviewDetailsHtml("boil_water_timer", "Boil-water timer. Foreground rolling-boil helper.") + timerPanelHtml("Boil water timer", "1:00", "Ready", { includeMusic: false }) + '<div class="slidecontrols"><label><input id="boilclear" type="checkbox"> clear water is ready, or cloudy water has been filtered or settled</label><label><input id="boilrolling" type="checkbox"> water is at a rolling boil</label><label><input id="boilcovered" type="checkbox"> clean covered container is ready for cooling and storage</label><button id="boilstart" type="button">Start 1-minute boil</button><button class="ghost" id="boilpause" type="button" disabled>Pause</button><button class="ghost" id="boilreset" type="button">Reset timer</button><button class="ghost" id="boilcool" type="button">Mark cooled and covered</button></div>';
    var ids = ["boilclear", "boilrolling", "boilcovered"];
    for (var i = 0; i < ids.length; i++) {
      var box = $(ids[i]);
      if (box && !box.dataset.bound) { box.dataset.bound = "boil"; box.addEventListener("change", function () { return; }); }
    }
    var start = $("boilstart"), cool = $("boilcool");
    if (start && !start.dataset.bound) {
      start.dataset.bound = "boil";
      start.addEventListener("click", function () {
        startUiCountdown("Boil water", 60, null, { startId: "boilstart", pauseId: "boilpause", resetId: "boilreset", startText: "Start 1-minute boil" });
        $("slidetext").textContent = tx("tx.tool_boil_water_timer.started", "1-minute rolling boil started in this foreground prototype. Boil for 3 minutes above 6,500 feet, and follow any local advisory if it gives a different instruction. Let the water cool before drinking.");
      });
    }
    bindUiCountdownButton("boilpause", pauseOrResumeUiCountdown);
    bindUiCountdownButton("boilreset", resetUiCountdown);
    if (cool && !cool.dataset.bound) {
      cool.dataset.bound = "boil";
      cool.addEventListener("click", function () {
        var names = {
          boilclear: "clear water",
          boilrolling: "rolling boil",
          boilcovered: "clean covered container"
        };
        setChecklistSummary({ ids: ids, names: names, slug: "tx.tool_boil_water_timer.summary", fallback: "Boil-water check saved: {count} of {total} items selected - {selectedItems}. Cool boiled water in a clean covered container and keep it covered. Do not use boiling or disinfecting to make water safe if it may contain fuel or toxic chemicals; use bottled or another safe source and follow local health advice." });
      });
    }
  }
  function showBoilWaterTimer() {
    activeSlides = [];
    showPanel("slideshow");
    var card = cardByFeature("boil_water_timer");
    $("slidetitle").textContent = t("tx.feature_boil_water_timer");
    $("slideimage").innerHTML = renderVisual("boil_water_timer", card ? card.imageDesc : "Covered pot at a rolling boil beside a one-minute clock.");
    $("slidetext").textContent = tx("tx.tool_boil_water_timer_body", "Boil-water timer for clear water at a rolling boil. Use one minute as prototype education, use 3 minutes above 6,500 feet, cool in a clean covered container, and follow local public-health advisories.");
    renderBoilWaterTimer();
  }
  function renderCholeraHotspotAlert() {
    $("slidecache").innerHTML = reviewDetailsHtml("cholera_hotspot_alert", "Cholera hotspot alert checklist. Local alert wording controls release copy.") + '<div class="slidecontrols"><label><input id="cholerasafe" type="checkbox"> safe water plan is ready</label><label><input id="cholerahands" type="checkbox"> handwashing soap or sanitizer is ready</label><label><input id="choleralatrine" type="checkbox"> latrine/toilet cleanliness plan is ready</label><label><input id="choleraors" type="checkbox"> ORS packets or ORS plan are ready</label><label><input id="choleraclinic" type="checkbox"> clinic/CHW contact and transport are known</label><button id="choleraplan" type="button">Review alert plan</button><button class="ghost" id="cholerahelp" type="button">Need help now</button></div>';
    var ids = ["cholerasafe", "cholerahands", "choleralatrine", "choleraors", "choleraclinic"];
    for (var i = 0; i < ids.length; i++) {
      var box = $(ids[i]);
      if (box && !box.dataset.bound) { box.dataset.bound = "cholera"; box.addEventListener("change", function () { return; }); }
    }
    var plan = $("choleraplan"), help = $("cholerahelp");
    if (plan && !plan.dataset.bound) {
      plan.dataset.bound = "cholera";
      plan.addEventListener("click", function () {
        var names = {
          cholerasafe: "safe water",
          cholerahands: "handwashing",
          choleralatrine: "latrine/toilet cleanliness",
          choleraors: "ORS",
          choleraclinic: "clinic/CHW contact"
        };
        showSubmittedChecklistResult({
          ids: ids, names: names, slug: "tx.tool_cholera_hotspot_alert.summary",
          fallback: "Cholera readiness check saved: {count} of {total} items selected - {selectedItems}. Follow the local public-health authority for alert timing and wording. Keep urgent dehydration care visible and do not rely on phone alerts while the phone is asleep.",
          title: "Your cholera readiness plan", nextAction: "Complete missing water, hygiene, ORS, contact, and transport steps now.",
          againId: "cholerareviewagain", againLabel: "Review readiness plan again", featureId: "cholera_hotspot_alert",
          bodyText: tx("tx.tool_cholera_hotspot_alert_body", "During a cholera or diarrhoea hotspot, prioritize safe water, handwashing, latrine cleanliness, ORS readiness, and urgent care for dehydration. Local public-health authorities control alert timing and wording."),
          render: renderCholeraHotspotAlert
        });
      });
    }
    if (help && !help.dataset.bound) {
      help.dataset.bound = "cholera";
      help.addEventListener("click", function () {
        $("slidetext").textContent = tx("tx.tool_cholera_hotspot_alert.urgent", "Seek urgent care now for dehydration or danger signs such as very watery diarrhoea, repeated vomiting, lethargy, inability to drink, or signs of severe illness. Start ORS if the person can drink, but do not wait for this checklist or a phone alert.");
      });
    }
  }
  function showCholeraHotspotAlert() {
    activeSlides = [];
    showPanel("slideshow");
    var card = cardByFeature("cholera_hotspot_alert");
    $("slidetitle").textContent = t("tx.feature_cholera_hotspot_alert");
    $("slideimage").innerHTML = renderVisual("cholera_hotspot_alert", card ? card.imageDesc : "Water safety alert with safe water, handwashing, latrine, ORS, and clinic icons.");
    $("slidetext").textContent = tx("tx.tool_cholera_hotspot_alert_body", "During a cholera or diarrhoea hotspot, prioritize safe water, handwashing, latrine cleanliness, ORS readiness, and urgent care for dehydration. Local public-health authorities control alert timing and wording.");
    renderCholeraHotspotAlert();
  }
  function renderHandwashingCoach(step) {
    var current = typeof step === "number" ? step : 0;
    handwashStep = current;
    $("slidecache").innerHTML = reviewDetailsHtml("handwashing_timer", "Handwashing coach. Visible 20-second timer and practice steps.") + timerPanelHtml("Handwashing timer", "0:20", "Ready") + '<div class="progress-panel"><div class="muted">Coach covers palms, backs, between fingers, thumbs, and under nails.</div></div><div class="slidecontrols"><button id="handwashstart" type="button">Start</button><button class="ghost" id="handwashpause" type="button" disabled>Pause</button><button class="ghost" id="handwashreset" type="button">Reset timer</button><button class="ghost" id="handwashnext" type="button">Next step</button><button class="ghost" id="handwashdone" type="button">Done</button><button class="ghost" id="handwashtune" type="button">Play tune</button></div>' + trackerContractHtml("handwashing_timer");
    var steps = [
      tx("tx.tool_handwashing_timer.step_wet", "Step 1 of 5: wet hands with clean running water, then add soap."),
      tx("tx.tool_handwashing_timer.step_palms", "Step 2 of 5: rub palms together, then scrub the backs of both hands."),
      tx("tx.tool_handwashing_timer.step_fingers", "Step 3 of 5: scrub between fingers, around thumbs, and under nails as part of the 20-second lather."),
      tx("tx.tool_handwashing_timer.step_rinse", "Step 4 of 5: rinse well under clean running water."),
      tx("tx.tool_handwashing_timer.step_dry", "Step 5 of 5: dry hands with a clean towel or air dry them.")
    ];
    var start = $("handwashstart"), next = $("handwashnext"), done = $("handwashdone"), tune = $("handwashtune");
    if (start && !start.dataset.bound) {
      start.dataset.bound = "handwash";
      start.addEventListener("click", function () {
        if (uiTimer && uiTimer.startId === "handwashstart" && uiTimer.status === "paused") {
          pauseOrResumeUiCountdown();
          return;
        }
        handwashStep = 0;
        $("slidetext").textContent = steps[0];
        renderHandwashingCoach(0);
        startUiCountdown("Handwashing", 20, null, { startId: "handwashstart", pauseId: "handwashpause", resetId: "handwashreset", startText: "Start", musicAssetId: "audio.prototype.handwashing_children_summer_loop", musicStatusId: "musicstatus", musicLoop: true });
      });
    }
    bindUiCountdownButton("handwashpause", pauseOrResumeUiCountdown);
    bindUiCountdownButton("handwashreset", resetUiCountdown);
    if (next && !next.dataset.bound) {
      next.dataset.bound = "handwash";
      next.addEventListener("click", function () {
        handwashStep = (handwashStep + 1) % steps.length;
        $("slidetext").textContent = steps[handwashStep];
        renderHandwashingCoach(handwashStep);
      });
    }
    if (done && !done.dataset.bound) {
      done.dataset.bound = "handwash";
      done.addEventListener("click", function () {
        cancelUiCountdown();
        $("slidetext").textContent = tx("tx.tool_handwashing_timer.done", "20-second handwashing recorded. Wash with soap and clean water at key times such as before eating or feeding children and after toilet/cleaning tasks. Do not rely on phone alerts while the phone is asleep.");
        renderHandwashingCoach(current);
      });
    }
    if (tune && !tune.dataset.bound) {
      tune.dataset.bound = "handwash";
      tune.addEventListener("click", function () {
        $("slidetext").textContent = tx("tx.tool_handwashing_timer.tune_note", "Handwashing tune is playing. Keep rubbing with soap while the countdown runs, including backs of hands, between fingers, thumbs, and under nails.");
        togglePrototypeMusic("audio.prototype.handwashing_children_summer_loop", "musicstatus", true);
      });
    }
    updateUiTimerControls();
  }
  function showHandwashingCoach() {
    activeSlides = [];
    handwashStep = 0;
    showPanel("slideshow");
    var card = cardByFeature("handwashing_timer");
    $("slidetitle").textContent = t("tx.feature_handwashing_timer");
    $("slideimage").innerHTML = renderVisual("handwashing_timer", card ? card.imageDesc : "Hands under clean running water with soap bubbles and a simple 20-second clock.");
    $("slidetext").textContent = tx("tx.tool_handwashing_timer_body", "Wash with soap and clean water. Rub palms, backs of hands, between fingers, thumbs, and nails for at least 20 seconds.");
    renderHandwashingCoach(0);
  }
  function breastfeedingScripts() {
    return [
      tx("tx.tool_breastfeeding_audio.step_positioning", "Step 1 of 4: positioning. Sit comfortably, bring the baby close, and keep the baby's head, shoulders, and body facing the breast."),
      tx("tx.tool_breastfeeding_audio.step_attachment", "Step 2 of 4: attachment. Aim for a deep latch/attachment with the baby close and comfortable; pain, nipple injury, or repeated slipping off needs skilled support."),
      tx("tx.tool_breastfeeding_audio.step_cues", "Step 3 of 4: signs the baby is ready to feed. Offer the breast when the baby turns toward the breast, opens the mouth, licks the lips, sucks a hand, or becomes restless. Try not to wait for crying."),
      tx("tx.tool_breastfeeding_audio.step_after_feed", "Step 4 of 4: after the feed. Notice whether you saw or heard swallowing and whether the baby seems calm. Keep track of wet nappies. Ask a health worker or clinic to watch a full feed and weigh the baby if you do not see or hear swallowing, wet nappies become fewer, or you remain worried.")
    ];
  }
  function renderBreastfeedingTipVisual(step, featureId, fallbackDescription) {
    var assets = [
      "img.generated.newborn_feeding_support_v1",
      "img.user_supplied.breastfeeding_latch_v1",
      "img.generated.newborn_feeding_support_v1",
      "img.generated.breastfeeding_after_feed_v1"
    ];
    var descriptions = [
      "A fully clothed mother holds her newborn close while a trusted older woman supports comfortable positioning.",
      "Close breastfeeding attachment view showing the baby's mouth and comfortable latch position.",
      "A mother notices observable signs that her baby is ready to feed.",
      "A calm baby rests upright after feeding while the caregiver keeps track of wet nappies."
    ];
    $("slideimage").innerHTML = renderVisual(featureId, descriptions[step] || fallbackDescription, assets[step]);
  }
  function renderBreastfeedingHelper(step) {
    var scripts = breastfeedingScripts();
    breastfeedingStep = ((typeof step === "number" ? step : breastfeedingStep) + scripts.length) % scripts.length;
    $("slidetext").textContent = scripts[breastfeedingStep];
    $("slidecache").innerHTML = reviewDetailsHtml("breastfeeding_audio", "Breastfeeding audio helper. on demand read-aloud and help prompts.") + '<div class="slidecontrols wrap-controls"><button id="bfplay" type="button">Play</button><button class="ghost" id="bfpause" type="button">Pause</button><button class="ghost" id="bfstop" type="button">Stop</button><button class="ghost" id="bfprev" type="button">Previous tip</button><button class="ghost" id="bfnext" type="button">Next tip</button><button class="ghost" id="bfhelp" type="button">Need help now</button><span id="audiostatus" class="muted">Read-aloud idle.</span></div>';
    setReadAloudStatus("Read-aloud idle.");
    var play = $("bfplay"), pause = $("bfpause"), stop = $("bfstop"), prev = $("bfprev"), next = $("bfnext"), help = $("bfhelp");
    if (play && !play.dataset.bound) { play.dataset.bound = "bf"; play.addEventListener("click", function () { var currentScripts = breastfeedingScripts(); $("slidetext").textContent = currentScripts[breastfeedingStep]; playPrototypeSpeech(currentScripts[breastfeedingStep]); }); }
    if (pause && !pause.dataset.bound) { pause.dataset.bound = "bf"; pause.addEventListener("click", pausePrototypeSpeech); }
    if (stop && !stop.dataset.bound) { stop.dataset.bound = "bf"; stop.addEventListener("click", stopPrototypeSpeech); }
    if (prev && !prev.dataset.bound) { prev.dataset.bound = "bf"; prev.addEventListener("click", function () { stopReadAloudForContextChange("Read-aloud stopped because the tip changed."); renderBreastfeedingHelper(breastfeedingStep - 1); }); }
    if (next && !next.dataset.bound) { next.dataset.bound = "bf"; next.addEventListener("click", function () { stopReadAloudForContextChange("Read-aloud stopped because the tip changed."); renderBreastfeedingHelper(breastfeedingStep + 1); }); }
    if (help && !help.dataset.bound) { help.dataset.bound = "bf"; help.addEventListener("click", function () { stopReadAloudForContextChange("Read-aloud stopped because the screen changed."); $("slidetext").textContent = tx("tx.tool_breastfeeding_audio.urgent", "Ask a trusted health worker or clinic for help now if the baby is feeding poorly, cannot be woken to feed, has trouble breathing, has fever or cold skin, or if the caregiver has severe breast pain/redness, feels unsafe, or feels overwhelmed. Do not wait for this audio helper."); }); }
  }
  function showBreastfeedingHelper() {
    activeSlides = [];
    breastfeedingStep = 0;
    showPanel("slideshow");
    var card = cardByFeature("breastfeeding_audio");
    $("slidetitle").textContent = t("tx.feature_breastfeeding_audio");
    $("slideimage").innerHTML = renderVisual("breastfeeding_audio", card ? card.imageDesc : "Breastfeeding positioning and support audio helper.");
    renderBreastfeedingHelper(0);
  }
  function renderBreastfeedingAssistant(step) {
    var scripts = breastfeedingScripts();
    breastfeedingStep = ((typeof step === "number" ? step : breastfeedingStep) + scripts.length) % scripts.length;
    $("slidetext").textContent = scripts[breastfeedingStep];
    renderBreastfeedingTipVisual(breastfeedingStep, "breastfeeding_aid_triage", "New mother and newborn with breastfeeding support.");
    var nextLabel = breastfeedingStep === scripts.length - 1 ? tx("tx.bf.assistant.back_to_first", "Back to tip 1") : tx("tx.bf.assistant.next_tip", "Next tip");
    var remainingTips = scripts.length - breastfeedingStep;
    $("slidecache").innerHTML = reviewDetailsHtml("breastfeeding_aid_triage", "Breastfeeding assistant mode. Practical read-aloud support shares content with the breastfeeding triage module and keeps urgent checks one tap away.") +
      '<div class="slidecontrols wrap-controls"><button id="bfassistplay" type="button">' + esc(tx("tx.bf.assistant.play_tip", "Play this tip")) + '</button><button id="bfassistplayall" type="button">' + esc(tx("tx.bf.assistant.play_from_current", "Play from this tip ({count} tips)", { count: remainingTips })) + '</button><button class="ghost" id="bfassistpause" type="button">Pause</button><button class="ghost" id="bfassiststop" type="button">Stop</button><button class="ghost" id="bfassistprev" type="button"' + (breastfeedingStep === 0 ? " disabled" : "") + '>Previous tip</button><button class="ghost" id="bfassistnext" type="button">' + esc(nextLabel) + '</button><button class="dangerdoor" id="bfassisturgent" type="button">Check urgent signs</button><span id="audiostatus" class="muted">Read-aloud idle.</span></div>';
    setReadAloudStatus("Read-aloud idle.");
    var play = $("bfassistplay"), playAll = $("bfassistplayall"), pause = $("bfassistpause"), stop = $("bfassiststop"), prev = $("bfassistprev"), next = $("bfassistnext"), urgent = $("bfassisturgent");
    if (play && !play.dataset.bound) { play.dataset.bound = "bfassist"; play.addEventListener("click", function () { var currentScripts = breastfeedingScripts(); $("slidetext").textContent = currentScripts[breastfeedingStep]; playPrototypeSpeech(currentScripts[breastfeedingStep]); }); }
    if (playAll && !playAll.dataset.bound) { playAll.dataset.bound = "bfassist"; playAll.addEventListener("click", function () { playPrototypeSpeech(breastfeedingScripts().slice(breastfeedingStep).join(" ")); }); }
    if (pause && !pause.dataset.bound) { pause.dataset.bound = "bfassist"; pause.addEventListener("click", pausePrototypeSpeech); }
    if (stop && !stop.dataset.bound) { stop.dataset.bound = "bfassist"; stop.addEventListener("click", stopPrototypeSpeech); }
    if (prev && !prev.dataset.bound) { prev.dataset.bound = "bfassist"; prev.addEventListener("click", function () { stopReadAloudForContextChange("Read-aloud stopped because the tip changed."); renderBreastfeedingAssistant(breastfeedingStep - 1); }); }
    if (next && !next.dataset.bound) { next.dataset.bound = "bfassist"; next.addEventListener("click", function () { stopReadAloudForContextChange("Read-aloud stopped because the tip changed."); renderBreastfeedingAssistant(breastfeedingStep + 1); }); }
    if (urgent && !urgent.dataset.bound) { urgent.dataset.bound = "bfassist"; urgent.addEventListener("click", function () { stopReadAloudForContextChange("Read-aloud stopped because the screen changed."); showBreastfeedingAidTriage("triage"); }); }
  }
  function showBreastfeedingAssistant() {
    activeSlides = [];
    breastfeedingStep = 0;
    activeShellTitle = tx("tx.bf.assistant_title", "Breastfeeding assistant");
    showPanel("slideshow");
    var card = screenByFeature("breastfeeding_aid_triage");
    $("slidetitle").textContent = tx("tx.bf.assistant_title", "Breastfeeding assistant");
    renderBreastfeedingAssistant(0);
  }
  function bfAidIds() {
    return ["bfaidinfantcannotfeed", "bfaidinfanthardtowake", "bfaidinfantbreathing", "bfaidinfantconvulsions", "bfaidinfantveryhotcold", "bfaidinfantyellowpalms", "bfaidmotherbleeding", "bfaidmotherfaint", "bfaidmotherbreathless", "bfaidmotherconvulsions", "bfaidmotherheadache", "bfaidmotherupperbelly", "bfaidmotherfever", "bfaidsmelldischarge", "bfaidbreastred", "bfaidbreastswelling", "bfaidfeedsfew", "bfaidwetfew", "bfaidswallowing", "bfaidpainfeed", "bfaidslipoff", "bfaidcracked", "bfaidwater", "bfaidcolostrum", "bfaidother"];
  }
  function bfAidInfantDangerIds() {
    return ["bfaidinfantcannotfeed", "bfaidinfanthardtowake", "bfaidinfantbreathing", "bfaidinfantconvulsions", "bfaidinfantveryhotcold", "bfaidinfantyellowpalms"];
  }
  function bfAidMotherDangerIds() {
    return ["bfaidmotherbleeding", "bfaidmotherfaint", "bfaidmotherbreathless", "bfaidmotherconvulsions", "bfaidmotherheadache", "bfaidmotherupperbelly"];
  }
  function bfAidChecked(ids) {
    return ids.some(function (id) { return !!bfAidSelections[id]; });
  }
  function bfAidNoneSelected() {
    return ["bfaidbabynone", "bfaidmothernone", "bfaidfeedingnone", "bfaidbreastnone", "bfaidattachmentnone"].some(function (id) {
      return !!bfAidSelections[id];
    });
  }
  function bfAidSurfaceId(view) {
    return "breastfeeding_aid." + (view || bfAidView);
  }
  function bfAidIntro(view) {
    if (view === "baby_urgent") return tx("tx.bf.progress.baby_intro", "First check the baby. Choose every sign you see, or choose Something else worries me or None of these.");
    if (view === "mother_urgent") return tx("tx.bf.progress.mother_intro", "Now check the mother. Choose every sign she has, or choose Something else worries me or None of these.");
    if (view === "feeding") return tx("tx.bf.progress.feeding_intro", "Check feeding and wet nappies. Choose what is happening now, or choose Something else worries me or None of these.");
    if (view === "breast") return tx("tx.bf.progress.breast_intro", "Check breast redness or swelling. Choose what is happening now, or choose Something else worries me or None of these.");
    if (view === "attachment") return tx("tx.bf.progress.attachment_intro", "Check attachment, pain, and milk questions. Choose what is happening now, or choose Something else worries me or None of these.");
    return tx("tx.bf.progress.categories_intro", "No listed urgent sign was selected. Choose the kind of breastfeeding help you need.");
  }
  function setBreastfeedingAidView(view) {
    bfAidView = view;
    $("slidetext").textContent = bfAidIntro(view);
    renderBreastfeedingAidTriage();
    moveToNextStep(view === "categories" ? "slidecache" : "slidetext");
  }
  function renderBreastfeedingAidCategories() {
    $("slidecache").innerHTML = '<div class="slidecontrols"><div class="segmented pnc-categories">' +
      '<button id="bfaidnav_feeding" type="button">' + esc(tx("tx.bf.progress.feeding_button", "Feeding and wet nappies")) + '</button>' +
      '<button id="bfaidnav_breast" type="button">' + esc(tx("tx.bf.progress.breast_button", "Breast redness or swelling")) + '</button>' +
      '<button id="bfaidnav_attachment" type="button">' + esc(tx("tx.bf.progress.attachment_button", "Attachment, pain, or milk questions")) + "</button></div></div>" +
      reviewDetailsHtml("breastfeeding_aid_triage", "Progressive breastfeeding aid and triage. Urgent baby and mother gates are completed before focused support.");
    ["feeding", "breast", "attachment"].forEach(function (view) {
      var button = $("bfaidnav_" + view);
      if (button && !button.dataset.bound) {
        button.dataset.bound = "bfaid";
        button.addEventListener("click", function () { setBreastfeedingAidView(view); });
      }
    });
  }
  function renderBreastfeedingAidTriage() {
    if (bfAidView === "categories") {
      renderBreastfeedingAidCategories();
      return;
    }
    var surfaceId = bfAidSurfaceId();
    $("slidecache").innerHTML = renderClinicalChecklist(surfaceId, { selected: bfAidSelections }) +
      reviewDetailsHtml("breastfeeding_aid_triage", "Progressive breastfeeding aid and triage. The active gate is registry-backed; later concerns remain hidden until urgent baby and mother gates are answered.");
    var binding = bindClinicalChecklist(surfaceId, { state: bfAidSelections });
    var ids = binding.ids;
    var review = $(binding.screen.actionId);
    if (review && !review.dataset.bound) {
      review.dataset.bound = "bfaid";
      review.addEventListener("click", function () {
        for (var i = 0; i < ids.length; i++) if ($(ids[i])) bfAidSelections[ids[i]] = !!$(ids[i]).checked;
        if (bfAidView === "baby_urgent" && bfAidSelections.bfaidbabynone && !bfAidChecked(bfAidInfantDangerIds()) && !bfAidSelections.bfaidother) {
          setBreastfeedingAidView("mother_urgent");
          return;
        }
        if (bfAidView === "mother_urgent" && bfAidSelections.bfaidmothernone && !bfAidChecked(bfAidMotherDangerIds()) && !(bfAidSelections.bfaidmotherfever && bfAidSelections.bfaidsmelldischarge) && !bfAidSelections.bfaidother) {
          setBreastfeedingAidView("categories");
          return;
        }
        reviewBreastfeedingAidTriage();
      });
    }
  }
  function reviewBreastfeedingAidTriage() {
    var checked = bfAidIds().filter(function (id) { return !!bfAidSelections[id]; });
    if (!checked.length && !bfAidNoneSelected()) return;
    var decisionChecked = checked.filter(function (id) { return id !== "bfaidother"; });
    var decision = screenDecision("breastfeeding_aid_triage", decisionChecked);
    var infantDanger = bfAidChecked(bfAidInfantDangerIds());
    var motherDanger = bfAidChecked(bfAidMotherDangerIds()) || (bfAidSelections.bfaidmotherfever && bfAidSelections.bfaidsmelldischarge);
    var breastToday = bfAidSelections.bfaidbreastswelling || bfAidSelections.bfaidbreastred || bfAidSelections.bfaidmotherfever;
    var intakeToday = bfAidSelections.bfaidfeedsfew || bfAidSelections.bfaidwetfew || bfAidSelections.bfaidswallowing;
    var attachment = bfAidSelections.bfaidpainfeed || bfAidSelections.bfaidslipoff || bfAidSelections.bfaidcracked;
    var counsel = [];
    if (bfAidSelections.bfaidwater) counsel.push(tx("tx.bf.result.exclusive", "Breast milk alone gives babies under 6 months the food and water they need, even in hot weather. Water, honey, or other milk can make the baby ill and can reduce breastfeeding."));
    if (bfAidSelections.bfaidcolostrum) counsel.push(tx("tx.bf.result.colostrum", "The first thick yellow milk is the baby's first protection against illness. It should be given, not thrown away."));
    if (infantDanger) {
      setSlideResult({
        kind: "refer",
        careRoute: "newborn_clinic",
        severity: "emergency",
        title: tx("tx.bf.title.infant_urgent", "Urgent newborn feeding help"),
        paragraphs: [tx("tx.bf.result.infant_urgent", "Go to urgent newborn care now. Keep the baby warm. Do not force the baby to feed. Bring the mother and baby together if possible.")]
      });
    } else if (motherDanger) {
      setSlideResult({
        kind: "refer",
        careRoute: "postpartum_clinic",
        severity: "emergency",
        title: tx("tx.bf.title.mother_urgent", "Urgent postpartum breastfeeding help"),
        paragraphs: [tx("tx.bf.result.mother_urgent", "Seek urgent postpartum care now. Say that the mother recently gave birth and that breastfeeding or baby feeding is also a concern. Take the baby with her if possible.")]
      });
    } else if (breastToday) {
      setSlideResult({
        kind: "refer",
        careRoute: "postpartum_clinic",
        severity: "routine_clinic",
        title: tx("tx.bf.title.breast_today", "Breast concern to check today"),
        paragraphs: [tx("tx.bf.result.breast_today", "Contact a health worker or clinic today for the breast concern. Keep feeding as the baby normally wants if it is comfortable; do not deeply rub or press the sore area.")].concat(counsel)
      });
    } else if (intakeToday) {
      setSlideResult({
        kind: "refer",
        careRoute: "newborn_clinic",
        severity: "routine_clinic",
        title: tx("tx.bf.title.intake_today", "Feeding and weight check today"),
        paragraphs: [tx("tx.bf.result.intake_today", "See a health worker today for a feeding and weight check. While you wait, keep offering the breast often.")].concat(counsel)
      });
    } else if (attachment) {
      setSlideResult({
        kind: "refer",
        careRoute: "professional",
        severity: "followup",
        title: tx("tx.bf.title.attachment", "Watch a full feed together"),
        paragraphs: [tx("tx.bf.result.attachment_observe", "A trained person needs to watch a whole feed. Ask a health worker to watch the baby feed within the next few days, sooner if pain is severe or the baby is not feeding well.")].concat(counsel),
        nextAction: tx("tx.bf.result.attachment_action", "Ask a health worker to watch a full feed within the next few days.")
      });
    } else if (bfAidSelections.bfaidother) {
      setSlideResult({
        kind: "home",
        careRoute: "professional",
        title: tx("tx.bf.title.other", "Other breastfeeding concern"),
        paragraphs: [friendlyOtherMessage()]
      });
    } else if (counsel.length) {
      setSlideResult({
        kind: "home",
        careRoute: "home_watch",
        title: tx("tx.bf.title.milk_only", "Breast milk only support"),
        paragraphs: counsel,
        nextAction: tx("tx.result.action_watch_safety", "Keep watching and seek help if a danger sign appears.")
      });
    } else {
      setSlideResult({
        kind: "home",
        careRoute: "home_watch",
        title: tx("tx.bf.title.reassuring", "No listed breastfeeding danger sign selected"),
        paragraphs: [tx("tx.bf.result.reassuring", "No listed breastfeeding danger sign or concern is selected. Keep feeding whenever the baby shows hunger, and seek help if anything changes or you remain concerned.")],
        nextAction: tx("tx.result.action_watch_safety", "Keep watching and seek help if a danger sign appears.")
      });
    }
    $("slidecache").innerHTML = '<div class="slidecontrols"><button id="bfaidreviewanother" type="button">' + esc(tx("tx.bf.progress.review_another", "Review another breastfeeding concern")) + "</button></div>" +
      reviewDetailsHtml("breastfeeding_aid_triage", "Progressive breastfeeding aid and triage result. The checklist is replaced so the result is the active task.");
    var another = $("bfaidreviewanother");
    if (another && !another.dataset.bound) {
      another.dataset.bound = "bfaid";
      another.addEventListener("click", function () {
        if (bfAidSelections.bfaidbabynone && bfAidSelections.bfaidmothernone) setBreastfeedingAidView("categories");
        else {
          bfAidSelections = {};
          setBreastfeedingAidView("baby_urgent");
        }
      });
    }
    appendScreenDecisionTrace("breastfeeding_aid_triage", decision);
  }
  function breastfeedingAidEntryMode() {
    var q = (search || "").toLowerCase();
    if (mode === "danger") return "triage";
    if (q.indexOf("triage") >= 0 || q.indexOf("problem") >= 0 || q.indexOf("wrong") >= 0) return "triage";
    return "assist";
  }
  function showBreastfeedingAidTriage(entryMode, startView) {
    if (entryMode === "assist") {
      showBreastfeedingAssistant();
      return;
    }
    activeSlides = [];
    bfAidSelections = {};
    bfAidView = startView || "baby_urgent";
    if (bfAidView !== "baby_urgent") bfAidSelections.bfaidbabynone = true;
    if (["feeding", "breast", "attachment", "categories"].indexOf(bfAidView) >= 0) bfAidSelections.bfaidmothernone = true;
    activeShellTitle = t("tx.feature_breastfeeding_aid_triage");
    showPanel("slideshow");
    var card = screenByFeature("breastfeeding_aid_triage");
    $("slidetitle").textContent = t("tx.feature_breastfeeding_aid_triage");
    $("slideimage").innerHTML = renderVisual("breastfeeding_aid_triage", card ? card.imageDesc : "New mother and newborn with breastfeeding support and urgent-care contact.");
    $("slidetext").textContent = bfAidIntro(bfAidView);
    renderBreastfeedingAidTriage();
  }
  var WHO_PROTOTYPE_IMMUNIZATION_SCHEDULE = [
    { day: 0, visit: "Birth vaccines", vaccines: ["BCG", "hepatitis B birth dose", "polio birth dose"] },
    { day: 42, visit: "6-week vaccine visit", vaccines: ["DTP-containing vaccine dose 1", "polio dose 1", "PCV dose 1", "rotavirus dose 1"] },
    { day: 70, visit: "10-week vaccine visit", vaccines: ["DTP-containing vaccine dose 2", "polio dose 2", "PCV dose 2", "rotavirus dose 2"] },
    { day: 98, visit: "14-week vaccine visit", vaccines: ["DTP-containing vaccine dose 3", "polio dose 3", "PCV dose 3", "IPV dose 1"] },
    { day: 274, visit: "9-month measles visit", vaccines: ["measles-containing vaccine dose 1"] },
    { day: 365, visit: "12-month MMR visit", vaccines: ["measles, mumps, and rubella vaccine"] },
    { day: 548, visit: "18-month MMR follow-up", vaccines: ["measles, mumps, and rubella follow-up dose"] }
  ];
  function parseDateOnly(value) {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    var parts = value.split("-").map(function (part) { return Number(part); });
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  function addDays(date, days) {
    var next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    next.setDate(next.getDate() + days);
    return next;
  }
  function formatDateLong(date) {
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  }
  function immunizationPerson() {
    var active = activePersonId ? personById(activePersonId) : null;
    if (active && (active.subject === "newborn_baby" || active.subject === "child_under5")) return active;
    for (var i = 0; i < people.length; i++) if (people[i].subject === "newborn_baby") return people[i];
    for (var j = 0; j < people.length; j++) if (people[j].subject === "child_under5") return people[j];
    return null;
  }
  function nextWhoImmunizationVisit(person) {
    var birth = parseDateOnly(person && person.birthDate);
    if (!birth) return null;
    var today = new Date();
    today = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    for (var i = 0; i < WHO_PROTOTYPE_IMMUNIZATION_SCHEDULE.length; i++) {
      var row = WHO_PROTOTYPE_IMMUNIZATION_SCHEDULE[i];
      var due = addDays(birth, row.day);
      if (due >= today) {
        var alertDate = addDays(due, -2);
        return { person: person, visit: row.visit, due: due, alertDate: alertDate, vaccines: row.vaccines };
      }
    }
    return null;
  }
  function immunizationPlanCard(plan) {
    if (!plan) {
      return '<div class="immun-plan-card" id="immunplan-card"><strong>Next vaccine visit</strong><p>Add or choose a child with a birth date to calculate the next WHO-style prototype vaccine visit.</p><p>Use the vaccine card and local clinic/EPI schedule before any real appointment or reminder.</p></div>';
    }
    return '<div class="immun-plan-card" id="immunplan-card"><strong id="immunperson">' + esc(plan.person.name) + "'s next WHO-style vaccine visit</strong><p>" + esc(formatDateLong(plan.due)) + " - " + esc(plan.visit) + "</p><ul>" + plan.vaccines.map(function (item) { return "<li>" + esc(item) + "</li>"; }).join("") + "</ul><p>Prototype reminder: " + esc(formatDateLong(plan.alertDate)) + ". Use the child vaccine card and local clinic/EPI schedule before real care.</p></div>";
  }
  function immunizationPlanText(plan) {
    if (!plan) return "Add or choose a child with a birth date before planning a vaccine reminder. Use the vaccine card and local clinic/EPI schedule before real care.";
    return plan.person.name + "'s next WHO-style vaccine visit is " + formatDateLong(plan.due) + " for " + plan.vaccines.join(", ") + ". Prototype reminder: " + formatDateLong(plan.alertDate) + ". Confirm with the child vaccine card and local clinic/EPI schedule before real care.";
  }
  function renderImmunizationPlanner() {
    var nextVisit = nextWhoImmunizationVisit(immunizationPerson());
    $("slidecache").innerHTML = reviewDetailsHtml("immunization_reminders", "Immunization reminder planner. WHO-style prototype schedule calculation; confirm against the child vaccine card and approved local EPI schedule.") + immunizationPlanCard(nextVisit) + '<div class="slidecontrols checklist-controls"><label><input id="immuncard" type="checkbox"> Child vaccine card is available</label><label><input id="immunclinic" type="checkbox"> clinic/CHW contact or vaccination site is known</label><label><input id="immunschedule" type="checkbox"> local clinic/EPI schedule will be checked before the visit</label><label><input id="immunreminder" type="checkbox"> caregiver wants a reminder task</label><button id="immunplan" type="button">Plan reminder</button></div>' + trackerContractHtml("immunization_reminders");
    var ids = ["immuncard", "immunclinic", "immunschedule", "immunreminder"];
    for (var i = 0; i < ids.length; i++) {
      var box = $(ids[i]);
      if (box && !box.dataset.bound) { box.dataset.bound = "immun"; box.addEventListener("change", function () { return; }); }
    }
    var plan = $("immunplan");
    if (plan && !plan.dataset.bound) {
      plan.dataset.bound = "immun";
      plan.addEventListener("click", function () {
        var names = {
          immuncard: "vaccine card",
          immunclinic: "clinic/CHW contact",
          immunschedule: "local EPI schedule check",
          immunreminder: "reminder task"
        };
        var summary = selectedChecklistItems(ids, names);
        var summaryText = tx("tx.tool_immunization_reminders.summary", "{personPlan} Plan saved: {count} of {total} items selected - {selectedItems}.", {
          personPlan: immunizationPlanText(nextVisit),
          count: summary.checked.length,
          total: ids.length,
          selectedItems: summary.selectedItems
        });
        setSlideResult({
          kind: "home", careRoute: "home_watch", title: "Your vaccine reminder plan",
          nextAction: "Confirm this plan against the child's vaccine card and local clinic or EPI schedule.",
          paragraphs: [summaryText]
        });
        $("slideimage").classList.add("hidden");
        $("slidecache").innerHTML = immunizationPlanCard(nextVisit) + '<div class="slidecontrols"><button id="immunreviewagain" type="button">Review vaccine plan again</button></div>' + reviewDetailsHtml("immunization_reminders", "Immunization reminder planner. WHO-style prototype schedule calculation; confirm against the child vaccine card and approved local EPI schedule.") + trackerContractHtml("immunization_reminders");
        $("immunreviewagain").addEventListener("click", function () {
          $("slideimage").classList.remove("hidden");
          $("slidetext").textContent = tx("tx.tool_immunization_reminders_body", "Reminder planner for vaccine visits. This prototype calculates the next WHO-style routine visit from the child's birth date, then asks you to confirm with the vaccine card and local EPI schedule before real care.");
          renderImmunizationPlanner();
          moveToNextStep("slidecache");
        });
      });
    }
  }
  function showImmunizationPlanner() {
    activeSlides = [];
    showPanel("slideshow");
    var card = cardByFeature("immunization_reminders");
    $("slidetitle").textContent = t("tx.feature_immunization_reminders");
    $("slideimage").innerHTML = renderVisual("immunization_reminders", card ? card.imageDesc : "Caregiver checking a vaccine card with a local clinic reminder.");
    $("slidetext").textContent = tx("tx.tool_immunization_reminders_body", "Reminder planner for vaccine visits. This prototype calculates the next WHO-style routine visit from the child's birth date, then asks you to confirm with the vaccine card and local EPI schedule before real care.");
    renderImmunizationPlanner();
  }
  function renderPncReminderPlanner() {
    $("slidecache").innerHTML = reviewDetailsHtml("pnc_reminders", "PNC reminder planner. No visit dates calculated.") + '<div class="slidecontrols"><label><input id="pncmom" type="checkbox"> mother check is planned</label><label><input id="pncnewborn" type="checkbox"> newborn check is planned</label><label><input id="pncfeeding" type="checkbox"> feeding or breastfeeding support question is ready</label><label><input id="pnccontact" type="checkbox"> CHW/clinic contact is confirmed</label><button id="pncplan" type="button">Plan PNC reminder</button></div>' + trackerContractHtml("pnc_reminders");
    var ids = ["pncmom", "pncnewborn", "pncfeeding", "pnccontact"];
    for (var i = 0; i < ids.length; i++) {
      var box = $(ids[i]);
      if (box && !box.dataset.bound) { box.dataset.bound = "pnc"; box.addEventListener("change", function () { return; }); }
    }
    var plan = $("pncplan");
    if (plan && !plan.dataset.bound) {
      plan.dataset.bound = "pnc";
      plan.addEventListener("click", function () {
        var names = {
          pncmom: "mother check",
          pncnewborn: "newborn check",
          pncfeeding: "feeding support question",
          pnccontact: "CHW/clinic contact"
        };
        showSubmittedChecklistResult({
          ids: ids, names: names, slug: "tx.tool_pnc_reminders.summary",
          fallback: "PNC reminder plan saved: {count} of {total} items selected - {selectedItems}. No visit dates are calculated in this prototype. Use the approved local PNC schedule, and use mother or baby danger signs for urgent care instead of waiting for a routine reminder.",
          title: "Your mother-and-baby visit plan", nextAction: "Confirm the visit schedule with a CHW or clinic. Use the danger checks if the mother or baby becomes unwell.",
          againId: "pncreviewagain", againLabel: "Review visit plan again", featureId: "pnc_reminders",
          bodyText: tx("tx.tool_pnc_reminders_body", "Reminder planner for new mother and baby visits. Prepare the mother check, newborn check, feeding support question, and CHW/clinic contact using the approved local schedule; this prototype does not calculate visit dates."),
          render: renderPncReminderPlanner
        });
      });
    }
  }
  function showPncReminderPlanner() {
    activeSlides = [];
    showPanel("slideshow");
    var card = cardByFeature("pnc_reminders");
    $("slidetitle").textContent = t("tx.feature_pnc_reminders");
    $("slideimage").innerHTML = renderVisual("pnc_reminders", card ? card.imageDesc : "New mother and baby visit checklist with CHW or clinic contact.");
    $("slidetext").textContent = tx("tx.tool_pnc_reminders_body", "Reminder planner for new mother and baby visits. Prepare the mother check, newborn check, feeding support question, and CHW/clinic contact using the approved local schedule; this prototype does not calculate visit dates.");
    renderPncReminderPlanner();
  }
  function renderChannelTwinsPreview() {
    $("slidecache").innerHTML = traceDetails("Prototype review details", "Message channel review only. Nothing is sent by SMS, IVR, WhatsApp, CHW dispatch, or outbound messaging. CODEX Decision - needs approval. " + provenanceSummary("channel_twins_preview") + assetSummary("channel_twins_preview") + contractSummary("channel_twins_preview")) + '<div class="slidecontrols"><label><input id="twinsapp" type="checkbox"> app card</label><label><input id="twinssms" type="checkbox"> SMS copy</label><label><input id="twinsivr" type="checkbox"> IVR prompt</label><label><input id="twinswa" type="checkbox"> WhatsApp flow</label><label><input id="twinschw" type="checkbox"> CHW script</label><button id="twinsreview" type="button">Review message examples</button></div>';
    if ($("twinsreview")) {
      $("twinsreview").addEventListener("click", function () {
        var ids = ["twinsapp", "twinssms", "twinsivr", "twinswa", "twinschw"];
        var names = { twinsapp: "app card", twinssms: "SMS", twinsivr: "IVR", twinswa: "WhatsApp", twinschw: "CHW script" };
        var selected = selectedChecklistItems(ids, names).checked.map(function (id) { return names[id]; });
        var label = selected.length === 5 ? "app card, SMS, IVR, WhatsApp, and CHW script" : (selected.join(", ") || "no channels selected yet");
        setSlideResult({
          kind: "home",
          title: "Your message-channel review",
          nextAction: "Keep the same approved safety, privacy, opt-out, and local-language meaning in every selected channel.",
          paragraphs: [tx("tx.tool_channel_twins.summary", "Message review: {selectedChannels} generated from approved canonical content only. Keep danger wording, privacy wording, opt-out wording, and local-language review together before any channel is released. Nothing is sent.", { selectedChannels: label })]
        });
        $("slideimage").classList.add("hidden");
        $("slidecache").innerHTML = '<div class="slidecontrols"><button id="twinsreviewagain" type="button">Review channels again</button></div>' + reviewDetailsHtml("channel_twins_preview", "Message channel review only. Nothing is sent.");
        $("twinsreviewagain").addEventListener("click", function () {
          $("slideimage").classList.remove("hidden");
          $("slidetext").textContent = tx("tx.tool_channel_twins_body", "Review message examples for one module across an app card, SMS, IVR prompt, WhatsApp flow, and CHW script. Nothing is sent.");
          renderChannelTwinsPreview();
          moveToNextStep("slidecache");
        });
      });
    }
  }
  function showChannelTwinsPreview() {
    activeSlides = [];
    showPanel("slideshow");
    var card = cardByFeature("channel_twins_preview");
    $("slidetitle").textContent = t("tx.feature_channel_twins_preview");
    $("slideimage").innerHTML = renderVisual("channel_twins_preview", card ? card.imageDesc : "Message examples across app card, SMS, IVR, WhatsApp, and CHW script.");
    $("slidetext").textContent = tx("tx.tool_channel_twins_body", "Review message examples for one module across an app card, SMS, IVR prompt, WhatsApp flow, and CHW script. Nothing is sent.");
    renderChannelTwinsPreview();
  }
  function renderReferralFollowupQueue() {
    $("slidecache").innerHTML = reviewDetailsHtml("referral_followup_queue", t("tx.tool_referral_followup.prototype_note")) + '<div class="slidecontrols checklist-controls"><fieldset class="symptom-group"><legend>' + esc(t("tx.tool_referral_followup.legend")) + '</legend><label><input id="referraldanger" type="checkbox"> ' + esc(t("tx.tool_referral_followup.option_danger")) + '</label><label><input id="referralors" type="checkbox"> ' + esc(t("tx.tool_referral_followup.option_ors")) + '</label><label><input id="referralcontact" type="checkbox"> ' + esc(t("tx.tool_referral_followup.option_contact")) + '</label><label><input id="referralfailed" type="checkbox"> ' + esc(t("tx.tool_referral_followup.option_failed")) + '</label><label><input id="referralconflict" type="checkbox"> ' + esc(t("tx.tool_referral_followup.option_conflict")) + '</label><label><input id="referralresolved" type="checkbox"> ' + esc(t("tx.tool_referral_followup.option_resolved")) + '</label></fieldset><button id="referralreview" type="button">' + esc(t("tx.tool_referral_followup.action_review")) + '</button><button class="ghost" id="referralretry" type="button">' + esc(t("tx.tool_referral_followup.action_retry")) + '</button><button class="ghost" id="referralcancel" type="button">' + esc(t("tx.tool_referral_followup.action_cancel")) + '</button><p class="muted" id="referralqueuefeedback">' + esc(t("tx.tool_referral_followup.status_saved")) + "</p></div>";
    if ($("referralreview")) {
      $("referralreview").addEventListener("click", function () {
        var reasons = [];
        if ($("referraldanger").checked) reasons.push("danger referral");
        if ($("referralors").checked) reasons.push("ORS/zinc voucher");
        if ($("referralcontact").checked) reasons.push("CHW contact attempt");
        if ($("referralfailed").checked) reasons.push("failed message retry");
        if ($("referralconflict").checked) reasons.push("conflict review");
        if ($("referralresolved").checked) {
          $("slidetext").textContent = tx("tx.tool_referral_followup.closed", "Referral follow-up closure note: went to clinic or issue resolved. Keep original risk history visible for audit, and record who confirmed closure before closing a real referral. No live messaging or facility update is sent by this prototype.");
          $("referralqueuefeedback").textContent = t("tx.tool_referral_followup.status_closed");
        } else {
          $("slidetext").textContent = tx("tx.tool_referral_followup.open", "Referral follow-up task opened for {selectedReasons}; record call/visit status as unresolved until a caregiver, CHW, or facility status is reviewed. No live messaging or call/visit is triggered by this prototype.", { selectedReasons: reasons.join(", ") || "selected risk event" });
          $("referralqueuefeedback").textContent = t("tx.tool_referral_followup.status_open");
        }
      });
    }
    if ($("referralretry")) {
      $("referralretry").addEventListener("click", function () {
        $("slidetext").textContent = tx("tx.tool_referral_followup.retry", "Retry queued in prototype mode. The app would ask Messaging to retry failed sends when a real adapter exists; this demo only records the retry request locally.");
        $("referralqueuefeedback").textContent = t("tx.tool_referral_followup.status_retry");
      });
    }
    if ($("referralcancel")) {
      $("referralcancel").addEventListener("click", function () {
        $("slidetext").textContent = tx("tx.tool_referral_followup.cancel", "Task canceled in prototype mode. A real queue would keep the audit trail, who canceled it, and why it was safe to close.");
        $("referralqueuefeedback").textContent = t("tx.tool_referral_followup.status_cancel");
      });
    }
  }
  function showReferralFollowupQueue() {
    activeSlides = [];
    showPanel("slideshow");
    var card = cardByFeature("referral_followup_queue");
    $("slidetitle").textContent = t("tx.feature_referral_followup_queue");
    $("slideimage").innerHTML = renderVisual("referral_followup_queue", card ? card.imageDesc : "Caregiver and health worker at a clinic doorway with contact card, phone, saved status, retry, and closure cues.");
    $("slidetext").textContent = tx("tx.tool_referral_followup_body", "Referral follow-up queue for closed-loop service support after danger screens or ORS/voucher use. This is synthetic task modeling only; no real call, message, or facility handoff is sent.");
    renderReferralFollowupQueue();
  }
  function renderSharedPhonePrivacyMode() {
    $("slidecache").innerHTML = reviewDetailsHtml("shared_phone_privacy_mode", t("tx.tool_shared_phone_privacy.prototype_note")) + '<div class="slidecontrols checklist-controls"><fieldset class="symptom-group"><legend>' + esc(t("tx.tool_shared_phone_privacy.subject_legend")) + '</legend><label>' + esc(t("tx.tool_shared_phone_privacy.subject_label")) + ' <select id="privacysubject"><option value="me">' + esc(t("tx.tool_shared_phone_privacy.subject_me")) + '</option><option value="child">' + esc(t("tx.tool_shared_phone_privacy.subject_child")) + '</option><option value="someone_else">' + esc(t("tx.tool_shared_phone_privacy.subject_someone_else")) + '</option></select></label></fieldset><fieldset class="symptom-group"><legend>' + esc(t("tx.tool_shared_phone_privacy.before_saving")) + '</legend><label><input id="privacyshared" type="checkbox"> ' + esc(t("tx.tool_shared_phone_privacy.option_shared")) + '</label><label><input id="privacyhide" type="checkbox"> ' + esc(t("tx.tool_shared_phone_privacy.option_hide")) + '</label><label><input id="privacynotification" type="checkbox"> ' + esc(t("tx.tool_shared_phone_privacy.option_notification")) + '</label><label><input id="privacylocal" type="checkbox"> ' + esc(t("tx.tool_shared_phone_privacy.option_local")) + '</label><label><input id="privacyexport" type="checkbox"> ' + esc(t("tx.tool_shared_phone_privacy.option_export")) + '</label></fieldset><button id="privacyreview" type="button">' + esc(t("tx.tool_shared_phone_privacy.action_record")) + '</button><button class="ghost" id="privacyexportbtn" type="button">' + esc(t("tx.tool_shared_phone_privacy.action_export")) + '</button><button class="ghost" id="privacydeletebtn" type="button">' + esc(t("tx.tool_shared_phone_privacy.action_delete")) + '</button><p class="muted" id="privacyfeedback">' + esc(t("tx.tool_shared_phone_privacy.status_empty")) + "</p></div>";
    if ($("privacyreview")) {
      $("privacyreview").addEventListener("click", function () {
        var protections = [];
        var subjectNames = { me: t("tx.tool_shared_phone_privacy.subject_me_lower"), child: t("tx.tool_shared_phone_privacy.subject_child_lower"), someone_else: t("tx.tool_shared_phone_privacy.subject_someone_else_lower") };
        var subject = subjectNames[$("privacysubject").value] || "me";
        if ($("privacyshared").checked) protections.push("shared-phone warning");
        if ($("privacyhide").checked) protections.push("quick hide and private labels");
        if ($("privacynotification").checked) protections.push("notification wording");
        if ($("privacylocal").checked) protections.push("local-only storage");
        if ($("privacyexport").checked) protections.push("user-owned export and opt-out");
        $("slidetext").textContent = tx("tx.tool_shared_phone_privacy.summary", "Shared phone privacy choices for {subject}: {selectedProtections}. Use quick hide, private labels, neutral notification wording, opt-out, local-only storage, and user-owned export before saving sensitive information.", { subject: subject, selectedProtections: protections.join(", ") || "no protection selected yet" });
        $("privacyfeedback").textContent = tx("tx.tool_shared_phone_privacy.status_recorded", "Consent choice recorded locally for {subject}. A released app would use the approved account and privacy system.", { subject: subject });
      });
    }
    if ($("privacyexportbtn")) {
      $("privacyexportbtn").addEventListener("click", function () {
        $("slidetext").textContent = tx("tx.tool_shared_phone_privacy.export", "Export explanation: show what private entries exist, who they belong to, and how to save a user-owned copy. This demo has no private records to export.");
        $("privacyfeedback").textContent = t("tx.tool_shared_phone_privacy.status_export");
      });
    }
    if ($("privacydeletebtn")) {
      $("privacydeletebtn").addEventListener("click", function () {
        $("slidetext").textContent = tx("tx.tool_shared_phone_privacy.delete", "Delete explanation: confirm the subject, explain what will be removed, keep the required review record, and then delete local private entries. This demo has no private records to delete.");
        $("privacyfeedback").textContent = t("tx.tool_shared_phone_privacy.status_delete");
      });
    }
  }
  function showSharedPhonePrivacyMode() {
    activeSlides = [];
    showPanel("slideshow");
    var card = cardByFeature("shared_phone_privacy_mode");
    $("slidetitle").textContent = t("tx.feature_shared_phone_privacy_mode");
    $("slideimage").innerHTML = renderVisual("shared_phone_privacy_mode", card ? card.imageDesc : "Shared phone with shield, quick-hide cue, neutral notification, private labels, opt-out, export, and delete choices.");
    $("slidetext").textContent = tx("tx.tool_shared_phone_privacy_body", "Shared phone privacy mode for sensitive modules on a shared phone. Choose quick hide, private labels, neutral notifications, local-only saving, and export/delete choices before storing sensitive information.");
    renderSharedPhonePrivacyMode();
  }
  function renderPartnerServiceDashboard() {
    $("slidecache").innerHTML = reviewDetailsHtml("partner_service_dashboard", "Partner service dashboard. Aggregate synthetic dashboard only.") + '<div class="slidecontrols"><label><input id="dashaggregate" type="checkbox"> aggregate counts only</label><label><input id="dashsource" type="checkbox"> source/approval status</label><label><input id="dashreferral" type="checkbox"> unresolved referrals</label><label><input id="dashlanguage" type="checkbox"> language readiness</label><button id="dashreview" type="button">Review dashboard signals</button></div>';
    if ($("dashreview")) {
      $("dashreview").addEventListener("click", function () {
        var signals = [];
        if ($("dashaggregate").checked) signals.push("aggregate only");
        if ($("dashsource").checked) signals.push("source/approval status");
        if ($("dashreferral").checked) signals.push("unresolved referrals");
        if ($("dashlanguage").checked) signals.push("language readiness");
        setSlideResult({
          kind: "home",
          title: "Your dashboard-signal review",
          nextAction: "Use only aggregate synthetic signals until access, security, partner, and data-sharing controls are approved.",
          paragraphs: [tx("tx.tool_partner_dashboard.summary", "Partner service dashboard summary: {selectedSignals}. Include channel performance and service feedback only as aggregate synthetic signals until partner agreements, role-based access, server security, and data-sharing review exist. No individual surveillance or production analytics are enabled.", { selectedSignals: signals.join(", ") || "no dashboard signal selected yet" })]
        });
        $("slideimage").classList.add("hidden");
        $("slidecache").innerHTML = '<div class="slidecontrols"><button id="dashreviewagain" type="button">Review dashboard signals again</button></div>' + reviewDetailsHtml("partner_service_dashboard", "Partner service dashboard. Aggregate synthetic dashboard only.");
        $("dashreviewagain").addEventListener("click", function () {
          $("slideimage").classList.remove("hidden");
          $("slidetext").textContent = tx("tx.tool_partner_dashboard_body", "Partner service dashboard for aggregate synthetic operational signals: source/approval status, language readiness, unresolved referrals, channel performance, and service feedback.");
          renderPartnerServiceDashboard();
          moveToNextStep("slidecache");
        });
      });
    }
  }
  function showPartnerServiceDashboard() {
    activeSlides = [];
    showPanel("slideshow");
    var card = cardByFeature("partner_service_dashboard");
    $("slidetitle").textContent = t("tx.feature_partner_service_dashboard");
    $("slideimage").innerHTML = renderVisual("partner_service_dashboard", card ? card.imageDesc : "Health worker and supervisor reviewing privacy-safe aggregate charts for source status, language readiness, referral closure, and service quality.");
    $("slidetext").textContent = tx("tx.tool_partner_dashboard_body", "Partner service dashboard for aggregate synthetic operational signals: source/approval status, language readiness, unresolved referrals, channel performance, and service feedback.");
    renderPartnerServiceDashboard();
  }
  function showToolCard(featureId) {
    if (featureId === "zinc_tracker") {
      showZincTracker();
      return;
    }
    if (featureId === "anc_birth_plan") {
      showAncBirthPlanChecklist();
      return;
    }
    if (featureId === "breastfeeding_audio") {
      showBreastfeedingHelper();
      return;
    }
    if (featureId === "immunization_reminders") {
      showImmunizationPlanner();
      return;
    }
    if (featureId === "pnc_reminders") {
      showPncReminderPlanner();
      return;
    }
    if (featureId === "delivery_kit_checklist") {
      showDeliveryKitChecklist();
      return;
    }
    if (featureId === "kmc_timer") {
      showKmcTimer();
      return;
    }
    if (featureId === "family_preparedness") {
      showFamilyPreparednessChecklist();
      return;
    }
    if (featureId === "chronic_refill_tracker") {
      showChronicRefillTracker();
      return;
    }
    if (featureId === "labor_clock") {
      showLaborClock();
      return;
    }
    if (featureId === "bednet_hanging_reminder") {
      showBednetReminder();
      return;
    }
    if (featureId === "dehydration_visual_guide") {
      showDehydrationGuide();
      return;
    }
    if (featureId === "complementary_feeding_card") {
      showComplementaryFeedingCard();
      return;
    }
    if (featureId === "chlorine_dose_helper") {
      showChlorineDoseHelper();
      return;
    }
    if (featureId === "sanitation_checklist") {
      showSanitationChecklist();
      return;
    }
    if (featureId === "channel_twins_preview") {
      showChannelTwinsPreview();
      return;
    }
    if (featureId === "referral_followup_queue") {
      showReferralFollowupQueue();
      return;
    }
    if (featureId === "shared_phone_privacy_mode") {
      showSharedPhonePrivacyMode();
      return;
    }
    if (featureId === "partner_service_dashboard") {
      showPartnerServiceDashboard();
      return;
    }
    if (featureId === "safe_water_chlorine") {
      showSafeWaterChlorineChecker();
      return;
    }
    if (featureId === "chlorine_contact_timer") {
      showChlorineContactTimer();
      return;
    }
    if (featureId === "boil_water_timer") {
      showBoilWaterTimer();
      return;
    }
    if (featureId === "cholera_hotspot_alert") {
      showCholeraHotspotAlert();
      return;
    }
    if (featureId === "handwashing_timer") {
      showHandwashingCoach();
      return;
    }
    var card = cardByFeature(featureId);
    var feature = byId(catalog.features, featureId);
    if (!card) {
      showPrototypeCard(feature ? t(feature.titleSlug) : featureId, prototypeUnavailableBody(), tx("tx.prototype.unavailable.visual", "This activity is not available in the current prototype build."), featureId, "Missing tool card for " + featureId);
      return;
    }
    activeSlides = [];
    showPanel("slideshow");
    $("slidetitle").textContent = t(card.titleSlug);
    $("slideimage").innerHTML = renderVisual(featureId, card.imageDesc);
    var metric = "";
    if (card.durationSeconds) metric = " Timer target: " + card.durationSeconds + " seconds.";
    if (card.durationMinutes) metric = " Timer target: " + card.durationMinutes + " minute" + (card.durationMinutes === 1 ? "" : "s") + ".";
    if (card.courseDays) metric = " Course tracker: " + card.courseDays + "-day check-off.";
    if (card.kind === "console") metric = qualitySummary();
    $("slidetext").textContent = t(card.bodySlug) + metric;
    $("slidecache").innerHTML = reviewerDetails(card.cacheNote + " " + card.governanceStatus + "." + provenanceSummary(featureId) + assetSummary(featureId) + contractSummary(featureId));
  }
  function showStoryCard(featureId) {
    var card = storyByFeature(featureId);
    var feature = byId(catalog.features, featureId);
    if (!card) {
      showPrototypeCard(feature ? t(feature.titleSlug) : featureId, prototypeUnavailableBody(), tx("tx.prototype.unavailable.visual", "This activity is not available in the current prototype build."), featureId, "Missing story card for " + featureId);
      return;
    }
    showSlides(storyCardToSlides(card));
  }
  function renderKohlLeadChecklist() {
    $("slidecache").innerHTML =
      renderClinicalChecklist("kohl_lead.main") +
      reviewDetailsHtml("kohl_lead_screen", "Kohl lead exposure checklist. Exposure education only.");
    var ids = bindClinicalChecklist("kohl_lead.main").ids;
    var review = $("kohlreview");
    if (review && !review.dataset.bound) {
      review.dataset.bound = "kohl";
      review.addEventListener("click", function () {
        var checked = ids.filter(function (id) { return !!$(id).checked; });
        if (!checked.length) return;
        var decisionChecked = checked.filter(function (id) { return id !== "kohlnone"; });
        var names = {
          kohlchild: "child use",
          kohlpregnant: "pregnancy or nursing use",
          kohlunknown: "unknown or imported product",
          kohlaway: "product kept away from children",
          kohlother: "another concern"
        };
        var selectedNames = decisionChecked.map(function (id) { return names[id]; }).join(", ");
        var decision = screenDecision("kohl_lead_screen", decisionChecked);
        if (decision.severity === "routine_clinic" && ($("kohlchild").checked || $("kohlpregnant").checked || $("kohlunknown").checked)) {
          $("slidetext").textContent = tx("tx.screen_kohl.exposure", "Stop using the product for now and keep it away from children, food, and medicines. Exposure flags: {selectedNames}. Lead in cosmetics cannot be detected by looking at or tasting a product; ask a healthcare provider about blood lead testing if a child, pregnant/nursing person, or household member may have been exposed. No diagnosis is made here, and this prototype does not identify safe products.", { selectedNames: selectedNames });
        } else if ($("kohlother").checked) {
          $("slidetext").textContent = friendlyOtherMessage();
        } else if ($("kohlaway").checked) {
          $("slidetext").textContent = tx("tx.screen_kohl.away", "Good temporary step: keep the product away from children, food, and medicines. If anyone has used the product, ask a healthcare provider or local public-health program whether blood lead testing is needed. No diagnosis is made here, and this prototype does not identify safe products.");
        } else {
          $("slidetext").textContent = tx("tx.danger_checklist.none_result", "None of these selected. Keep watching and seek care if anything changes or you remain concerned. This screen does not decide that everything is safe.");
        }
        renderKohlLeadChecklist();
        appendScreenDecisionTrace("kohl_lead_screen", decision);
      });
    }
  }
  function showKohlLeadChecklist() {
    activeSlides = [];
    showPanel("slideshow");
    var card = screenByFeature("kohl_lead_screen");
    $("slidetitle").textContent = t("tx.feature_kohl_lead_screen");
    $("slideimage").innerHTML = renderVisual("kohl_lead_screen", card ? card.imageDesc : "Kohl or kajal container marked as a possible lead-risk item, away from children.");
    $("slidetext").textContent = tx("tx.screen_kohl_body", "Some kohl, kajal, surma, or similar eye products may contain lead. This exposure checklist supports stopping use, keeping products away from children, and asking about blood lead testing; it is not a diagnosis.");
    renderKohlLeadChecklist();
  }
  function renderChildVisionChecklist() {
    $("slidecache").innerHTML =
      renderClinicalChecklist("child_vision.main") +
      reviewDetailsHtml("child_vision_screen", "Child vision referral checklist. Referral support only; not a vision test.");
    var ids = bindClinicalChecklist("child_vision.main").ids;
    var review = $("visionreview");
    if (review && !review.dataset.bound) {
      review.dataset.bound = "vision";
      review.addEventListener("click", function () {
        var checked = ids.filter(function (id) { return !!$(id).checked; });
        if (!checked.length) return;
        var decisionChecked = checked.filter(function (id) { return id !== "visionnone"; });
        var decision = screenDecision("child_vision_screen", decisionChecked);
        var names = {
          visionsquint: "squinting",
          visionrub: "eye rubbing or discomfort",
          visionheadache: "headaches or trouble after reading/schoolwork",
          visionteacher: "caregiver/teacher concern",
          visionurgent: "sudden vision change, eye injury, or severe eye pain",
          visionother: "another vision concern"
        };
        var selectedNames = decisionChecked.map(function (id) { return names[id]; }).join(", ");
        if (decision.severity === "emergency") {
          $("slidetext").textContent = tx("tx.screen_vision.urgent", "Seek urgent eye/medical care now for sudden vision change, eye injury, or severe eye pain. Do not wait for a routine school screen or this app. This is not a vision test and does not diagnose an eye condition.");
        } else if (decision.severity === "routine_clinic") {
          $("slidetext").textContent = tx("tx.screen_vision.concerns", "Concern flags: {selectedNames}. Help the family schedule a vision screening or eye exam through the child's clinic, school program, or local eye-care pathway. This is not a vision test, does not diagnose vision problems, and should not replace an exam by a trained provider.", { selectedNames: selectedNames });
        } else if ($("visionother").checked) {
          $("slidetext").textContent = friendlyOtherMessage();
        } else {
          $("slidetext").textContent = tx("tx.danger_checklist.none_result", "None of these selected. Keep watching and seek care if anything changes or you remain concerned. This screen does not decide that everything is safe.");
        }
        renderChildVisionChecklist();
        appendScreenDecisionTrace("child_vision_screen", decision);
      });
    }
  }
  function showChildVisionChecklist() {
    activeSlides = [];
    showPanel("slideshow");
    var card = screenByFeature("child_vision_screen");
    $("slidetitle").textContent = t("tx.feature_child_vision_screen");
    $("slideimage").innerHTML = renderVisual("child_vision_screen", card ? card.imageDesc : "School-age child looking at a board with eye-check and clinic icons.");
    $("slidetext").textContent = tx("tx.screen_vision_body", "Referral-support checklist for child eye concerns. It helps decide when to schedule a vision screening or eye exam, and it is not a vision test or diagnosis.");
    renderChildVisionChecklist();
  }
  function renderChildHearingChecklist() {
    $("slidecache").innerHTML =
      renderClinicalChecklist("child_hearing.main") +
      reviewDetailsHtml("child_hearing_screen", "Child hearing referral checklist. Referral support only; not a hearing test.");
    var ids = bindClinicalChecklist("child_hearing.main").ids;
    var review = $("hearingreview");
    if (review && !review.dataset.bound) {
      review.dataset.bound = "hearing";
      review.addEventListener("click", function () {
        var checked = ids.filter(function (id) { return !!$(id).checked; });
        if (!checked.length) return;
        var decisionChecked = checked.filter(function (id) { return id !== "hearingnone"; });
        var decision = screenDecision("child_hearing_screen", decisionChecked);
        var names = {
          hearingconcern: "caregiver concern",
          hearingspeech: "speech or language concern",
          hearingfailed: "failed or missed hearing screening follow-up",
          hearingspecialist: "hearing specialist follow-up",
          hearinginfant: "infant 1-3-6 follow-up timing",
          hearingother: "another hearing concern"
        };
        var selectedNames = decisionChecked.map(function (id) { return names[id]; }).join(", ");
        if (decision.severity === "routine_clinic" && $("hearinginfant").checked) {
          $("slidetext").textContent = tx("tx.screen_hearing.infant_pathway", "Use the infant hearing 1-3-6 pathway: screen by 1 month, diagnostic hearing evaluation by 3 months if the baby does not pass screening, and early intervention by 6 months if hearing loss is confirmed. This prototype is not a hearing test and does not diagnose.");
        } else if (decision.severity === "routine_clinic" && $("hearingfailed").checked) {
          $("slidetext").textContent = tx("tx.screen_hearing.failed_screen", "Arrange a full hearing test, also called an audiology evaluation, as soon as possible after a child does not pass a hearing screening or missed follow-up. This prototype is not a hearing test and does not diagnose hearing loss.");
        } else if (decision.severity === "routine_clinic") {
          $("slidetext").textContent = tx("tx.screen_hearing.concerns", "Concern flags: {selectedNames}. Help the family schedule a hearing screening or audiology evaluation through the child's clinic, school program, CHW, or local hearing pathway. This is not a hearing test, does not diagnose, and should not replace evaluation by a trained provider.", { selectedNames: selectedNames });
        } else if ($("hearingother").checked) {
          $("slidetext").textContent = friendlyOtherMessage();
        } else {
          $("slidetext").textContent = tx("tx.danger_checklist.none_result", "None of these selected. Keep watching and seek care if anything changes or you remain concerned. This screen does not decide that everything is safe.");
        }
        renderChildHearingChecklist();
        appendScreenDecisionTrace("child_hearing_screen", decision);
      });
    }
  }
  function showChildHearingChecklist() {
    activeSlides = [];
    showPanel("slideshow");
    var card = screenByFeature("child_hearing_screen");
    $("slidetitle").textContent = t("tx.feature_child_hearing_screen");
    $("slideimage").innerHTML = renderVisual("child_hearing_screen", card ? card.imageDesc : "Child listening to a soft sound with hearing-screen and specialist icons.");
    $("slidetext").textContent = tx("tx.screen_hearing_body", "Referral-support checklist for child hearing concerns. It helps plan hearing screening, audiology evaluation, and infant 1-3-6 follow-up; it is not a hearing test or diagnosis.");
    renderChildHearingChecklist();
  }
  function renderPregnancyUrgentIntake(person) {
    $("slidecache").innerHTML =
      renderClinicalChecklist("pregnancy.urgent") +
      combinedReviewDetailsHtml(["anc_triage", "labor_clock"], "Pregnancy urgent intake. Pooled danger signs and presenting concerns.");
    var ids = bindClinicalChecklist("pregnancy.urgent").ids;
    var names = {
      urgent_preg_bleeding: "bleeding, fluid leaking, or bad-smelling discharge",
      urgent_preg_headvision: "severe headache, vision change, dizziness, fainting, or swelling",
      urgent_preg_breathing: "trouble breathing, chest pain, or fast heartbeat",
      urgent_preg_painfever: "severe belly pain, fever, or severe vomiting/unable to drink",
      urgent_preg_movement: "baby movement stopped or slowed",
      urgent_labor_contractions: "regular contractions, waters breaking, or labor concern",
      urgent_preg_unsafe: "thoughts of harm or feeling unsafe",
      urgent_preg_other: "other pregnancy concern not listed",
      urgent_preg_none: "none of these"
    };
    var review = $("urgentpregreview");
    if (review && !review.dataset.bound) {
      review.dataset.bound = "pregurgent";
      review.addEventListener("click", function () {
        var checked = ids.filter(function (id) { return !!$(id).checked; });
        var decisionChecked = checked.filter(function (id) { return id !== "urgent_preg_none"; });
        var selectedNames = decisionChecked.map(function (id) { return names[id]; }).join(", ");
        if (!checked.length) return;
        if ($("urgent_preg_none").checked) {
          $("slidetext").textContent = tx("tx.danger_checklist.none_result", "None of these selected. Keep watching and seek care if anything changes or you remain concerned. This screen does not decide that everything is safe.");
        } else if ($("urgent_preg_other").checked && decisionChecked.length === 1) {
          $("slidetext").textContent = tx("tx.urgent_pregnancy.other", "Other pregnancy concern is outside this prototype check. Contact a clinic or maternity care provider for assessment, especially if symptoms are new, worsening, or you remain concerned.");
        } else if ($("urgent_labor_contractions").checked && decisionChecked.length === 1) {
          $("slidetext").textContent = tx("tx.urgent_pregnancy.labor", "Labor concern selected for {personName}: {selectedNames}. This prototype cannot decide whether labor is normal or dangerous. Use the approved local labor plan, transport plan, and maternity contact; seek urgent care now if any danger sign appears.", { personName: person ? person.name : "this pregnant person", selectedNames: selectedNames });
        } else {
          $("slidetext").textContent = tx("tx.urgent_pregnancy.urgent", "Seek urgent care now for {personName} because these signs were checked: {selectedNames}. Tell the clinic or CHW the person is pregnant. This is not a diagnosis and gives no medicine advice; do not wait for a phone alert or module.", { personName: person ? person.name : "the pregnant person", selectedNames: selectedNames });
        }
        renderPregnancyUrgentIntake(person);
      });
    }
  }
  function showPregnancyUrgentIntake(person) {
    activeSlides = [];
    activeShellTitle = tx("tx.urgent_pregnancy.title", "Pregnancy urgent check");
    showPanel("slideshow");
    $("slidetitle").textContent = activeShellTitle;
    $("slideimage").innerHTML = renderVisual("anc_triage", "Pregnant person with clinic card, transport plan, contraction timer, and separate warning-sign icons without implying diagnosis.");
    $("slidetext").textContent = tx("tx.urgent_pregnancy.intro", "For {personName}, check every danger sign or presents-with concern that is happening now. More than one can be selected. The app pools pregnancy danger signs and labor concerns before any module is chosen.", { personName: person ? person.name : "the pregnant person" });
    renderPregnancyUrgentIntake(person);
  }
  function renderPregnancyDangerChecklist() {
    $("slidecache").innerHTML =
      renderClinicalChecklist("pregnancy.catalog") +
      reviewDetailsHtml("anc_triage", "Pregnancy danger checklist. Conservative urgent-routing support only.");
    var ids = bindClinicalChecklist("pregnancy.catalog").ids;
    var review = $("pregreview");
    if (review && !review.dataset.bound) {
      review.dataset.bound = "pregdanger";
      review.addEventListener("click", function () {
        var checked = ids.filter(function (id) { return !!$(id).checked; });
        var decisionChecked = checked.filter(function (id) { return id !== "pregnone"; });
        var names = {
          pregbleeding: "bleeding or fluid leaking",
          pregheadvision: "severe headache, vision change, dizziness, fainting, or swelling",
          pregbreathing: "trouble breathing, chest pain, or fast heartbeat",
          pregpainfever: "severe belly pain, fever, or severe vomiting",
          pregmovement: "baby movement stopping or slowing",
          pregharming: "thoughts of harm or feeling unsafe",
          pregother: "another pregnancy concern"
        };
        var selectedNames = decisionChecked.map(function (id) { return names[id]; }).join(", ");
        if (!checked.length) return;
        var decision = screenDecision("anc_triage", decisionChecked);
        if ($("pregnone").checked) {
          setSlideResult({
            kind: "home",
            title: tx("tx.screen_anc.none_title", "No listed pregnancy danger sign selected"),
            paragraphs: [tx("tx.danger_checklist.none_result", "None of these selected. Keep watching and seek care if anything changes or you remain concerned. This screen does not decide that everything is safe.")],
            nextAction: tx("tx.result.action_watch_safety", "Keep watching and seek help if a danger sign appears.")
          });
        } else if ($("pregother").checked && decisionChecked.length === 1) {
          setSlideResult({
            kind: "refer",
            careRoute: "professional",
            severity: decision.severity,
            title: tx("tx.screen_anc.other_title", "Other pregnancy concern"),
            paragraphs: [friendlyOtherMessage()]
          });
        } else if (decision.severity === "emergency") {
          setSlideResult({
            kind: "refer",
            careRoute: "maternity_clinic",
            severity: decision.severity,
            title: tx("tx.screen_anc.urgent_title", "Urgent pregnancy concern"),
            paragraphs: [tx("tx.screen_anc.urgent", "Selected signs: {selectedSigns}. When asking for help, say that the person is pregnant. If there are thoughts of harm or feeling unsafe, seek trusted emergency or crisis support now. This screen does not diagnose the problem or give medicine advice; do not wait for this app.", { selectedSigns: selectedNames })]
          });
        } else {
          setSlideResult({
            kind: "refer",
            careRoute: "professional",
            severity: decision.severity,
            title: tx("tx.screen_anc.other_title", "Other pregnancy concern"),
            paragraphs: [friendlyOtherMessage()]
          });
        }
        $("slidecache").innerHTML = '<div class="slidecontrols"><button id="pregcheckagain" type="button">' + esc(tx("tx.pregnancy_check.check_again", "Check pregnancy signs again")) + "</button></div>" +
          reviewDetailsHtml("anc_triage", "Pregnancy danger checklist result. The checklist is replaced so the result is the active task.");
        var again = $("pregcheckagain");
        if (again && !again.dataset.bound) {
          again.dataset.bound = "pregdanger";
          again.addEventListener("click", function () {
            $("slidetext").textContent = tx("tx.screen_anc_body", "Pregnancy danger checklist for bleeding or fluid leaking, severe headache or vision change, trouble breathing, severe belly pain or fever, baby movement change, and feeling unsafe. It is urgent-routing support, not a diagnosis.");
            renderPregnancyDangerChecklist();
            moveToNextStep("slidecache");
          });
        }
        appendScreenDecisionTrace("anc_triage", decision);
      });
    }
  }
  function showPregnancyDangerChecklist() {
    activeSlides = [];
    showPanel("slideshow");
    var card = screenByFeature("anc_triage");
    $("slidetitle").textContent = t("tx.feature_anc_triage");
    $("slideimage").innerHTML = renderVisual("anc_triage", card ? card.imageDesc : "Pregnant person holding a phone and clinic card with urgent warning signs.");
    $("slidetext").textContent = tx("tx.screen_anc_body", "Pregnancy danger checklist for bleeding or fluid leaking, severe headache or vision change, trouble breathing, severe belly pain or fever, baby movement change, and feeling unsafe. It is urgent-routing support, not a diagnosis.");
    renderPregnancyDangerChecklist();
  }
  function pncConcernNames() {
    return {
      pncacutenone: "no acute danger signs",
      pncacutemorenone: "no additional urgent signs",
      pncbleeding: "heavy bleeding or pads are soaking quickly",
      pncclots: "large blood clots came out",
      pncplacenta: "pieces of placenta or membrane came out after birth",
      pncsmelldischarge: "discharge smells bad after birth",
      pncbreathing: "trouble breathing",
      pncchestpain: "chest pain",
      pncfastheart: "heartbeat feels very fast or pounding",
      pncdizzyfaint: "dizziness or fainting",
      pncheadvision: "severe headache or vision changes",
      pncbellypain: "severe belly pain",
      pncswelling: "severe swelling of the face, hands, or legs",
      pncfeverbreast: "fever, weakness, or breast red/pain with feeling ill",
      pncbabyfeeding: "baby is feeding poorly or not feeding",
      pncbabywake: "caregiver cannot wake the baby for feeding",
      pncprivate: "private-parts, discharge, wound, or urination concern",
      pnccoughfeverdiarrhea: "cough, fever, diarrhoea, vomiting, or getting weaker",
      pncharm: "thoughts of harm or feeling unsafe",
      pncother: "something else worries me",
      pncnone: "none of these"
    };
  }
  function pncAcuteIds() {
    return ["pncbleeding", "pncclots", "pncplacenta", "pncsmelldischarge", "pncbreathing", "pncchestpain", "pncfastheart", "pncdizzyfaint", "pncheadvision", "pncbellypain", "pncswelling", "pncother"];
  }
  function pncImmediateIds() {
    return ["pncbleeding", "pncclots", "pncplacenta", "pncbreathing", "pncchestpain", "pncdizzyfaint", "pncother"];
  }
  function pncAdditionalAcuteIds() {
    return ["pncsmelldischarge", "pncfastheart", "pncheadvision", "pncbellypain", "pncswelling", "pncother"];
  }
  function pncAcuteDangerIds() {
    return ["pncbleeding", "pncclots", "pncplacenta", "pncsmelldischarge", "pncbreathing", "pncchestpain", "pncfastheart", "pncdizzyfaint", "pncheadvision", "pncbellypain", "pncswelling"];
  }
  function pncAcuteAnswered() {
    return !!(pncAnsweredViews.acute && pncAnsweredViews.acute_more);
  }
  function pncCurrentViewAnswered() {
    var screen = clinicalScreen("postpartum." + pncView);
    return !!pncAnsweredViews[pncView] &&
      screen.options.some(function (option) { return !!pncSelections[option.stateId || option.id]; });
  }
  function updatePncAcuteGate() {
    var answered = pncAcuteAnswered();
    ["breast", "private", "illness", "mood", "other"].forEach(function (view) {
      var nav = $("pncnav_" + view);
      if (nav) nav.disabled = !answered;
    });
  }
  function pncResultTitle() {
    if (pncSelections.pncharm) return tx("tx.screen_pnc.title_safety", "Safety support now");
    if (pncSelections.pncbabyfeeding || pncSelections.pncbabywake) return tx("tx.screen_pnc.title_newborn_feeding", "Urgent newborn feeding help");
    if (pncSelections.pncprivate) return tx("tx.screen_pnc.title_private", "Private-parts or discharge concern");
    if (pncSelections.pncbleeding || pncSelections.pncclots || pncSelections.pncplacenta || pncSelections.pncsmelldischarge) return tx("tx.screen_pnc.title_bleeding", "Bleeding or discharge after birth");
    if (pncSelections.pncbreathing || pncSelections.pncchestpain || pncSelections.pncfastheart || pncSelections.pncdizzyfaint) return tx("tx.screen_pnc.title_breathing", "Breathing or chest concern");
    if (pncSelections.pncheadvision || pncSelections.pncbellypain || pncSelections.pncswelling) return tx("tx.screen_pnc.title_headvision", "Headache, vision, pain, or swelling");
    if (pncSelections.pncfeverbreast) return tx("tx.screen_pnc.title_breast", "Breast pain or fever concern");
    if (pncSelections.pnccoughfeverdiarrhea) return tx("tx.screen_pnc.title_illness", "Postpartum illness concern");
    if (pncSelections.pncother) return tx("tx.screen_pnc.title_other", "Other postpartum concern");
    return tx("tx.screen_pnc.title_default", "Postpartum concern check");
  }
  function pncReviewSelection(ids) {
    var names = pncConcernNames();
    var checked = Object.keys(pncSelections).filter(function (id) { return !!pncSelections[id]; });
    var decisionChecked = checked.filter(function (id) { return id !== "pncnone" && id !== "pncacutenone" && id !== "pncacutemorenone"; });
    var decision = screenDecision("pnc_lactation", decisionChecked);
    var nonNoneChecked = checked.filter(function (id) { return id !== "pncnone" && id !== "pncacutenone" && id !== "pncacutemorenone"; });
    var selectedNames = nonNoneChecked.map(function (id) { return names[id]; }).join(", ") || "no danger sign selected";
    if (pncSelections.pncharm) {
      setSlideResult({
        kind: "refer",
        careRoute: "postpartum_clinic",
        severity: decision.severity,
        title: pncResultTitle(),
        paragraphs: [tx("tx.screen_pnc.harm", "Seek trusted emergency or crisis support now for thoughts of harm or feeling unsafe. Keep the mother and baby with a trusted helper if possible. This is not a diagnosis and no medicine advice is given here; do not wait for this app.")],
        nextAction: tx("tx.result.action_postpartum_safety", "Seek trusted emergency, crisis, or urgent postpartum support now.")
      });
    } else if (pncSelections.pncbabyfeeding || pncSelections.pncbabywake) {
      setSlideResult({
        kind: "refer",
        careRoute: "newborn_clinic",
        severity: decision.severity,
        title: pncResultTitle(),
        paragraphs: [tx("tx.screen_pnc.newborn_feeding", "Seek urgent newborn care now if the baby is feeding poorly, not feeding, or cannot be woken to feed. Bring the mother and baby together when possible and say that the baby is newborn and the person recently gave birth. This is not a diagnosis and no medicine advice is given here; do not wait for this app.")]
      });
    } else if (pncSelections.pncother && nonNoneChecked.length === 1) {
      setSlideResult({
        kind: "home",
        careRoute: "professional",
        title: pncResultTitle(),
        paragraphs: [friendlyOtherMessage()]
      });
    } else if (nonNoneChecked.length) {
      setSlideResult({
        kind: "refer",
        careRoute: "postpartum_clinic",
        severity: decision.severity,
        title: pncResultTitle(),
        paragraphs: (pncSelections.pncother ? [friendlyOtherMessage()] : []).concat([tx("tx.screen_pnc.urgent", "Selected signs: {selectedSigns}. When asking for help, say that the person recently gave birth. This screen does not diagnose the problem or give medicine advice; do not wait for this app.", { selectedSigns: selectedNames })])
      });
    } else if (pncSelections.pncnone) {
      setSlideResult({
        kind: "home",
        title: tx("tx.screen_pnc.title_none", "No listed postpartum danger sign selected"),
        paragraphs: [tx("tx.screen_pnc.none_checked", "None of these selected. Keep the mother and baby visit plan visible and seek care if anything changes or you remain concerned. This screen does not decide that everything is safe.")],
        nextAction: tx("tx.result.action_watch_safety", "Keep watching and seek help if a danger sign appears.")
      });
    } else {
      setSlideResult({
        kind: "home",
        title: tx("tx.screen_pnc.title_default", "Postpartum concern check"),
        paragraphs: [tx("tx.screen_pnc.no_urgent", "No postpartum danger sign selected in this prototype. Keep feeding support and the local postnatal plan visible, and seek care quickly if heavy bleeding, bad-smelling discharge, trouble breathing, chest pain, severe headache or vision change, fever, breast red/pain with feeling ill, baby feeding poorly, baby cannot be woken to feed, or feeling unsafe appears. This is not a diagnosis and no medicine advice is given here.")],
        nextAction: tx("tx.result.action_watch_safety", "Keep watching and seek help if a danger sign appears.")
      });
    }
    $("slideimage").classList.add("hidden");
    $("slidecache").innerHTML =
      '<div class="slidecontrols"><button id="pncdangerreviewagain" type="button">Review postpartum concerns again</button></div>' +
      traceDetails("Prototype review details", "Postpartum danger-check result. Submitted choices are replaced by the result so the caregiver does not mistake a rebuilt checklist for feedback. " + provenanceSummary("pnc_lactation") + assetSummary("pnc_lactation") + contractSummary("pnc_lactation"));
    var again = $("pncdangerreviewagain");
    if (again && !again.dataset.bound) {
      again.dataset.bound = "pncdanger";
      again.addEventListener("click", function () {
        $("slideimage").classList.remove("hidden");
        pncView = "acute";
        pncSelections = {};
        pncAnsweredViews = {};
        $("slidetext").textContent = tx("tx.screen_pnc_lactation_body", "Choose the concern area below. The app will ask focused urgent questions. It is referral support, not a diagnosis.");
        renderPncLactationDangerChecklist();
        moveToNextStep("slidecache");
      });
    }
    moveToNextStep("slidetext");
  }
  function renderPncLactationDangerChecklist() {
    var reviewText = "Postpartum and lactation danger checklist - conservative referral support only. No diagnosis, no medicine advice, no mastitis treatment, and no breastfeeding replacement decision. CODEX Decision - needs approval." + provenanceSummary("pnc_lactation") + assetSummary("pnc_lactation") + contractSummary("pnc_lactation");
    var surfaceId = "postpartum." + pncView;
    var categoryButtons = [
      ["breast", "Check breasts or feeding"],
      ["private", "Check private parts or discharge"],
      ["illness", "Check cough, fever, or diarrhoea"],
      ["mood", "Check mood or safety"],
      ["other", "Other or none of these"]
    ].map(function (pair) {
      return '<button class="ghost pnc-nav" id="pncnav_' + pair[0] + '" type="button">' + pair[1] + '</button>';
    }).join("");
    $("slidecache").innerHTML = renderClinicalChecklist(surfaceId, {
      selected: pncSelections,
      beforeFieldsHtml: pncView !== "acute" && pncView !== "acute_more" ? '<button class="ghost" id="pncnav_acute" type="button">Back to acute signs</button>' : "",
      afterFieldsHtml: pncView === "acute_more" ? '<div class="segmented pnc-categories">' + categoryButtons + "</div>" : ""
    }) +
      traceDetails("Prototype review details", reviewText);
    var ids = bindClinicalChecklist(surfaceId, {
      state: pncSelections,
      onChange: function () {
        pncAnsweredViews[pncView] = true;
        updatePncAcuteGate();
      }
    }).ids;
    ["acute", "breast", "private", "illness", "mood", "other"].forEach(function (view) {
      var nav = $("pncnav_" + view);
      if (nav && !nav.dataset.bound) {
        nav.dataset.bound = "pncdanger";
        nav.addEventListener("click", function () {
          if (!pncAcuteAnswered() && view !== "acute") { updatePncAcuteGate(); return; }
          if (view === "breast") { showBreastfeedingAidTriage("triage"); return; }
          pncView = view;
          renderPncLactationDangerChecklist();
        });
      }
    });
    var review = $(clinicalScreen(surfaceId).actionId);
    if (review && !review.dataset.bound) {
      review.dataset.bound = "pncdanger";
      review.addEventListener("click", function () {
        if (!pncCurrentViewAnswered()) { updatePncAcuteGate(); return; }
        if (pncView === "acute") {
          var immediateConcern = pncImmediateIds().some(function (id) { return !!pncSelections[id]; });
          if (immediateConcern) { pncReviewSelection(ids); return; }
          pncView = "acute_more";
          renderPncLactationDangerChecklist();
          moveToNextStep("slidecache");
          return;
        }
        pncReviewSelection(ids);
      });
    }
    updatePncAcuteGate();
  }
  function showPncLactationDangerChecklist() {
    activeSlides = [];
    activeShellTitle = tx("tx.screen_pnc.main_title", "Postpartum and newborn urgent checks");
    showPanel("slideshow");
    var card = screenByFeature("pnc_lactation");
    pncView = "acute";
    pncSelections = {};
    pncAnsweredViews = {};
    $("slidetitle").textContent = activeShellTitle;
    $("slideimage").innerHTML = renderVisual("pnc_lactation", card ? card.imageDesc : "Postpartum parent and newborn with breastfeeding support and urgent warning signs.");
    $("slidetext").textContent = tx("tx.screen_pnc_lactation_body", "Choose the concern area below. The app will ask focused urgent questions. It is referral support, not a diagnosis.");
    renderPncLactationDangerChecklist();
  }
  function renderNewbornDangerChecklist() {
    var reviewText = "Newborn danger checklist - conservative referral support only. No diagnosis, no medicine advice, no temperature diagnosis, and no home-treatment delay. CODEX Decision - needs approval. Source: WHO/UNICEF newborn danger-sign guidance. " + provenanceSummary("newborn_triage") + assetSummary("newborn_triage") + contractSummary("newborn_triage");
    $("slidecache").innerHTML = renderClinicalChecklist("newborn.main") + traceDetails("Prototype review details", reviewText);
    var ids = bindClinicalChecklist("newborn.main").ids;
    var review = $("newbornreview");
    if (review && !review.dataset.bound) {
      review.dataset.bound = "newborndanger";
      review.addEventListener("click", function () {
        var dangerIds = ["newbornfeeding", "newbornbreathing", "newborntemp", "newbornmovement", "newbornjaundice"];
        var checked = ids.filter(function (id) { return !!$(id).checked; });
        if (!checked.length) return;
        var decision = screenDecision("newborn_triage", checked);
        var urgent = dangerIds.filter(function (id) { return !!$(id).checked; });
        var names = {
          newbornfeeding: "not feeding, feeding poorly, or cannot wake to feed",
          newbornbreathing: "difficult or fast breathing, chest indrawing, blue/gray color, or pauses",
          newborntemp: "fever, too hot, too cold, or cold skin",
          newbornmovement: "no movement, reduced activity, very sleepy/floppy baby, or convulsions",
          newbornjaundice: "yellow palms or soles or worsening jaundice concern",
          newbornsmall: "small or early baby",
          newbornother: "other newborn concern not listed",
          newbornnone: "none of these"
        };
        var selectedNames = urgent.map(function (id) { return names[id]; }).join(", ") || "no urgent newborn danger sign selected";
        if (decision.severity === "emergency") {
          setSlideResult({
            kind: "refer",
            careRoute: "newborn_clinic",
            severity: decision.severity,
            title: tx("tx.screen_newborn.urgent_title", "Urgent newborn care now"),
            bodyHtml: '<p><strong>' + esc(tx("tx.result.because_checked", "Because you checked")) + ':</strong> ' + esc(selectedNames) + '.</p>',
            paragraphs: [tx("tx.screen_newborn.urgent", "Keep the baby warm on the way if possible. Tell the clinic or health worker the baby is newborn. Do not wait for this app.")]
          });
        } else if ($("newbornsmall").checked) {
          setSlideResult({
            kind: "refer",
            careRoute: "newborn_clinic",
            severity: decision.severity,
            title: tx("tx.screen_newborn.small_title", "Health worker today"),
            paragraphs: [tx("tx.screen_newborn.small", "A small or early baby should be checked today, even if no urgent sign is selected. Keep the baby warm and follow the local feeding/postnatal plan. If any urgent sign appears, go for urgent newborn care now.")]
          });
        } else if ($("newbornother").checked) {
          setSlideResult({
            kind: "home",
            careRoute: "professional",
            title: tx("tx.screen_newborn.other_title", "Ask a health worker"),
            paragraphs: [tx("tx.screen_newborn.other", "I do not know about that newborn concern. Please contact a health worker or clinic, especially if the baby is changing, feeding differently, seems unwell, or you remain concerned.")]
          });
        } else {
          setSlideResult({
            kind: "home",
            title: tx("tx.screen_newborn.no_urgent_title", "Keep watching"),
            paragraphs: [tx("tx.danger_checklist.none_result", "None of these selected. Keep watching and seek care if anything changes or you remain concerned. This screen does not decide that everything is safe.")],
            nextAction: tx("tx.result.action_watch_safety", "Keep watching and seek help if a danger sign appears.")
          });
        }
        $("slideimage").classList.add("hidden");
        $("slidecache").innerHTML = '<div class="slidecontrols"><button id="newborncheckagain" type="button">Check newborn signs again</button></div>' +
          traceDetails("Prototype review details", "Newborn danger-check result. Submitted choices are replaced by the result so urgent instructions are not followed by another copy of the checklist. " + provenanceSummary("newborn_triage") + assetSummary("newborn_triage") + contractSummary("newborn_triage"));
        $("newborncheckagain").addEventListener("click", function () {
          $("slideimage").classList.remove("hidden");
          $("slidetext").textContent = tx("tx.screen_newborn_body", "Check the urgent signs first. If any urgent sign is selected, the safest prototype recommendation is urgent newborn care now.");
          renderNewbornDangerChecklist();
          moveToNextStep("slidecache");
        });
        moveToNextStep("slidetext");
      });
    }
  }
  function showNewbornDangerChecklist() {
    activeSlides = [];
    activeShellTitle = t("tx.feature_newborn_triage");
    showPanel("slideshow");
    var card = screenByFeature("newborn_triage");
    $("slidetitle").textContent = activeShellTitle;
    $("slideimage").innerHTML = renderVisual("newborn_triage", card ? card.imageDesc : "Newborn wrapped beside caregiver and health worker with feeding, breathing, temperature, movement, and jaundice symbols.");
    $("slidetext").textContent = tx("tx.screen_newborn_body", "Check the urgent signs first. If any urgent sign is selected, the safest prototype recommendation is urgent newborn care now.");
    renderNewbornDangerChecklist();
  }
  function renderChildEarChecklist(checkedIds) {
    var checkedSet = {};
    (checkedIds || []).forEach(function (id) { checkedSet[id] = true; });
    var reviewText = "Child ear check - prototype referral support only. No antibiotic, ear-drop, ear-cleaning, or diagnosis advice. CODEX Decision - needs approval. " + provenanceSummary("child_ear_check") + assetSummary("child_ear_check") + contractSummary("child_ear_check");
    $("slidecache").innerHTML =
      renderClinicalChecklist("child_ear.main", { selected: checkedSet }) +
      traceDetails("Prototype review details", reviewText);
    var ids = bindClinicalChecklist("child_ear.main", { state: checkedSet }).ids;
    var review = $("earreview");
    if (review) review.textContent = tx("tx.danger_checklist.review_action", "Show what to do");
    if (review && !review.dataset.bound) {
      review.dataset.bound = "earcheck";
      review.addEventListener("click", function () {
        var checked = ids.filter(function (id) { return !!$(id).checked; });
        if (!checked.length) return;
        var names = {
          earpain: "ear pain",
          eardischarge: "ear discharge",
          eardischargeold: "long-lasting or uncertain discharge duration",
          earbehind: "tender swelling behind the ear",
          earother: "other ear concern",
          earnone: "none of these"
        };
        var selectedNames = checked.map(function (id) { return names[id]; }).join(", ") || "no ear concern selected";
        var decision = screenDecision("child_ear_check", checked);
        if (decision.severity === "emergency") {
          setSlideResult({
            kind: "refer",
            careRoute: "child_clinic",
            severity: decision.severity,
            title: tx("tx.screen_ear.urgent_title", "Urgent ear swelling"),
            paragraphs: [tx("tx.screen_ear.urgent", "Seek urgent clinic care now for tender swelling behind the ear. This can be serious and should not wait for home care or this app. No antibiotic, no ear drops, and no diagnosis are given here.")]
          });
        } else if (decision.severity === "routine_clinic") {
          setSlideResult({
            kind: "refer",
            careRoute: "child_clinic",
            severity: decision.severity,
            title: tx("tx.screen_ear.same_day_title", "Ear care today"),
            paragraphs: [tx("tx.screen_ear.same_day", "Arrange clinic or health worker today for {selectedSigns}. Tell the health worker how long discharge has been present if known. No antibiotic, no ear drops, and no diagnosis are given here.", { selectedSigns: selectedNames })]
          });
        } else if ($("earother").checked) {
          setSlideResult({
            kind: "refer",
            careRoute: "professional",
            severity: "routine_clinic",
            title: tx("tx.screen_ear.other_title", "Other ear concern"),
            paragraphs: [friendlyOtherMessage()]
          });
        } else {
          setSlideResult({
            kind: "home",
            title: tx("tx.screen_ear.no_urgent_title", "Keep watching"),
            paragraphs: [tx("tx.screen_ear.no_urgent", "No ear danger item selected in this prototype. Keep routine child care visible, and seek care if ear pain, discharge, fever, swelling behind the ear, or a caregiver concern appears. This is not a diagnosis and gives no medicine advice.")],
            nextAction: tx("tx.result.action_watch_safety", "Keep watching and seek help if a danger sign appears.")
          });
        }
        renderChildEarChecklist(checked);
        var feedback = $("earfeedback");
        if (feedback) feedback.textContent = checked.length ? "Result shown above. You can change the checked signs and show what to do again." : "No ear signs selected. Change the checklist if something is happening.";
        appendScreenDecisionTrace("child_ear_check", decision);
      });
    }
  }
  function showChildEarChecklist() {
    activeSlides = [];
    showPanel("slideshow");
    var card = screenByFeature("child_ear_check");
    $("slidetitle").textContent = t("tx.feature_child_ear_check");
    $("slideimage").innerHTML = renderVisual("child_ear_check", card ? card.imageDesc : "Child holding one ear beside a caregiver with ear pain, discharge, swelling-behind-ear, and clinic-arrow cues.");
    $("slidetext").textContent = tx("tx.screen_ear_body", "This is an ear pain and discharge concern screen. It supports same-day referral and does not diagnose or give ear medicine.");
    renderChildEarChecklist();
  }
  function renderChildMeaslesChecklist() {
    $("slidecache").innerHTML =
      renderClinicalChecklist("child_measles.main") +
      reviewDetailsHtml("child_measles_rash_check", "Measles rash check. Conservative referral and outbreak support only.");
    var ids = bindClinicalChecklist("child_measles.main").ids;
    var review = $("measlesreview");
    if (review && !review.dataset.bound) {
      review.dataset.bound = "measlescheck";
      review.addEventListener("click", function () {
        var checked = ids.filter(function (id) { return !!$(id).checked; });
        if (!checked.length) return;
        var decisionChecked = checked.filter(function (id) { return id !== "measlesnone"; });
        var decision = screenDecision("child_measles_rash_check", decisionChecked);
        var respiratory = $("measlescough").checked || $("measleseyes").checked;
        if (decision.severity === "emergency") {
          $("slidetext").textContent = tx("tx.screen_measles.urgent", "Seek urgent care now for eye or mouth complications, breathing trouble, a general danger sign, or a very ill child. Tell the clinic there is fever/rash concern before arrival if possible. This is not a diagnosis and gives no medicine advice.");
        } else if ($("measlesrash").checked && respiratory) {
          $("slidetext").textContent = tx("tx.screen_measles.same_day", "Contact a clinic or health worker today for fever with rash plus cough, runny nose, or red watery eyes. If possible, separate the child from others while arranging care and follow local measles/outbreak instructions. This is not a diagnosis and does not decide vaccine status.");
        } else if ($("measlesrash").checked) {
          $("slidetext").textContent = tx("tx.screen_measles.rash_only", "Rash concern selected. Contact a clinic or health worker today if fever, cough, runny nose, red eyes, exposure to measles, or caregiver worry is present. Separate the child from others if local health workers advise it. This is not a diagnosis.");
        } else if ($("measlesother").checked) {
          $("slidetext").textContent = friendlyOtherMessage();
        } else {
          $("slidetext").textContent = tx("tx.danger_checklist.none_result", "None of these selected. Keep watching and seek care if anything changes or you remain concerned. This screen does not decide that everything is safe.");
        }
        renderChildMeaslesChecklist();
        appendScreenDecisionTrace("child_measles_rash_check", decision);
      });
    }
  }
  function showChildMeaslesChecklist() {
    activeSlides = [];
    showPanel("slideshow");
    var card = screenByFeature("child_measles_rash_check");
    $("slidetitle").textContent = t("tx.feature_child_measles_rash_check");
    $("slideimage").innerHTML = renderVisual("child_measles_rash_check", card ? card.imageDesc : "Child with fever-and-rash concern, cough/runny-eye symbols, separation cue, and clinic arrow; not a diagnostic rash image.");
    $("slidetext").textContent = tx("tx.screen_measles_body", "Measles rash check for fever with rash, cough or runny nose, red watery eyes, and eye or mouth complications. This supports referral and outbreak follow-up; it is not a diagnosis.");
    renderChildMeaslesChecklist();
  }
  function renderChildMuacChecklist() {
    $("slidecache").innerHTML =
      renderClinicalChecklist("child_muac.main") +
      reviewDetailsHtml("child_muac_malnutrition_screen", "MUAC nutrition screen. Referral support only.");
    var ids = bindClinicalChecklist("child_muac.main").ids;
    var review = $("muacreview");
    if (review && !review.dataset.bound) {
      review.dataset.bound = "muaccheck";
      review.addEventListener("click", function () {
        var checked = ids.filter(function (id) { return !!$(id).checked; });
        if (!checked.length) return;
        var decisionChecked = checked.filter(function (id) { return id !== "muacnone"; });
        var decision = screenDecision("child_muac_malnutrition_screen", decisionChecked);
        if (decision.severity === "emergency") {
          var reasons = [];
          if ($("muacred").checked) reasons.push("red zone");
          if ($("muacswelling").checked) reasons.push("swelling of both feet");
          if ($("muacsick").checked) reasons.push("illness or danger signs");
          setSlideResult({
            kind: "refer",
            careRoute: "nutrition_clinic",
            severity: decision.severity,
            title: t("tx.feature_child_muac_malnutrition_screen"),
            paragraphs: [tx("tx.screen_muac.urgent", "Seek urgent nutrition or clinic care now for {selectedSigns}. Keep feeding and fluids only as the child can safely take them while arranging care. This screen does not calculate malnutrition, does not diagnose, and does not give feeding treatment.", { selectedSigns: reasons.join(", ") })]
          });
        } else if (decision.severity === "routine_clinic") {
          var follow = $("muacyellow").checked ? "yellow zone" : "visible wasting, weight loss, poor appetite, or caregiver concern";
          setSlideResult({
            kind: "refer",
            careRoute: "nutrition_clinic",
            severity: decision.severity,
            title: t("tx.feature_child_muac_malnutrition_screen"),
            paragraphs: [tx("tx.screen_muac.followup", "Plan a nutrition or clinic visit soon for {selectedSigns}. Bring the child growth card or MUAC tape result if available. This screen does not calculate malnutrition and local nutrition protocols control counseling.", { selectedSigns: follow })]
          });
        } else if ($("muacother").checked) {
          setSlideResult({
            kind: "refer",
            careRoute: "professional",
            severity: "routine_clinic",
            title: t("tx.feature_child_muac_malnutrition_screen"),
            paragraphs: [friendlyOtherMessage()]
          });
        } else {
          setSlideResult({
            kind: "home",
            title: t("tx.feature_child_muac_malnutrition_screen"),
            paragraphs: [tx("tx.danger_checklist.none_result", "None of these selected. Keep watching and seek care if anything changes or you remain concerned. This screen does not decide that everything is safe.")],
            nextAction: tx("tx.result.action_watch_safety", "Keep watching and seek help if a danger sign appears.")
          });
        }
        renderChildMuacChecklist();
        appendScreenDecisionTrace("child_muac_malnutrition_screen", decision);
      });
    }
  }
  function showChildMuacChecklist() {
    activeSlides = [];
    showPanel("slideshow");
    var card = screenByFeature("child_muac_malnutrition_screen");
    $("slidetitle").textContent = t("tx.feature_child_muac_malnutrition_screen");
    $("slideimage").innerHTML = renderVisual("child_muac_malnutrition_screen", card ? card.imageDesc : "Caregiver using a MUAC tape with color bands, food bowl, and bilateral foot-swelling cue; not a diagnosis image.");
    $("slidetext").textContent = tx("tx.screen_muac_body", "MUAC nutrition screen for local MUAC tape color, swelling of both feet, visible wasting, and illness concerns. It is referral support, not a diagnosis, and does not calculate malnutrition.");
    renderChildMuacChecklist();
  }
  function renderChildInjuryChecklist() {
    $("slidecache").innerHTML =
      renderClinicalChecklist("child_injury.main") +
      reviewDetailsHtml("child_injury_first_aid_check", "Child injury first-aid check. Emergency routing only.");
    var ids = bindClinicalChecklist("child_injury.main").ids;
    var review = $("injuryreview");
    if (review && !review.dataset.bound) {
      review.dataset.bound = "injurycheck";
      review.addEventListener("click", function () {
        var checked = ids.filter(function (id) { return !!$(id).checked; });
        if (!checked.length) return;
        var decisionChecked = checked.filter(function (id) { return id !== "injurynone"; });
        var decision = screenDecision("child_injury_first_aid_check", decisionChecked);
        if (decision.severity === "emergency" && $("injuryunconscious").checked) {
          setSlideResult({
            kind: "refer",
            careRoute: "child_clinic",
            severity: decision.severity,
            title: t("tx.feature_child_injury_first_aid_check"),
            paragraphs: [tx("tx.screen_injury.emergency", "Get emergency help now for unconsciousness, seizure, breathing trouble, blue/gray color, or a child who cannot wake after injury. Use local emergency services or a trained first-aid provider while arranging transport. This is no diagnosis and not treatment.")]
          });
        } else if (decision.severity === "emergency" || decision.severity === "routine_clinic") {
          var concerns = [];
          if ($("injurybleeding").checked) concerns.push("bleeding or deep wound");
          if ($("injuryburn").checked) concerns.push("burn");
          if ($("injuryhead").checked) concerns.push("head injury warning signs");
          if ($("injurybone").checked) concerns.push("broken bone, poisoning, drowning, electrocution, severe pain, or unsafe situation");
          setSlideResult({
            kind: "refer",
            careRoute: "child_clinic",
            severity: decision.severity,
            title: t("tx.feature_child_injury_first_aid_check"),
            paragraphs: [tx("tx.screen_injury.urgent", "Seek urgent medical care now for {selectedSigns}. Follow local first-aid training or emergency-dispatch instructions while arranging care. This is no diagnosis and not treatment.", { selectedSigns: concerns.join(", ") })]
          });
        } else if ($("injuryother").checked) {
          setSlideResult({
            kind: "refer",
            careRoute: "professional",
            severity: "routine_clinic",
            title: t("tx.feature_child_injury_first_aid_check"),
            paragraphs: [friendlyOtherMessage()]
          });
        } else {
          setSlideResult({
            kind: "home",
            title: t("tx.feature_child_injury_first_aid_check"),
            paragraphs: [tx("tx.danger_checklist.none_result", "None of these selected. Keep watching and seek care if anything changes or you remain concerned. This screen does not decide that everything is safe.")],
            nextAction: tx("tx.result.action_watch_safety", "Keep watching and seek help if a danger sign appears.")
          });
        }
        renderChildInjuryChecklist();
        appendScreenDecisionTrace("child_injury_first_aid_check", decision);
      });
    }
  }
  function showChildInjuryChecklist() {
    activeSlides = [];
    showPanel("slideshow");
    var card = screenByFeature("child_injury_first_aid_check");
    $("slidetitle").textContent = t("tx.feature_child_injury_first_aid_check");
    $("slideimage").innerHTML = renderVisual("child_injury_first_aid_check", card ? card.imageDesc : "Caregiver beside a child with first-aid kit, bandage, burn/bleeding symbols, and urgent-care arrow without gore.");
    $("slidetext").textContent = tx("tx.screen_injury_body", "Injury first-aid check for emergency warning signs after a child injury. It helps route to emergency or urgent care; it is not treatment, not first-aid training, and not a diagnosis.");
    renderChildInjuryChecklist();
  }
  function showScreenCard(featureId) {
    if (featureId === "newborn_triage") {
      showNewbornDangerChecklist();
      return;
    }
    if (featureId === "anc_triage") {
      showPregnancyDangerChecklist();
      return;
    }
    if (featureId === "pnc_lactation") {
      showPncLactationDangerChecklist();
      return;
    }
    if (featureId === "breastfeeding_aid_triage") {
      showBreastfeedingAidTriage(breastfeedingAidEntryMode());
      return;
    }
    if (featureId === "kohl_lead_screen") {
      showKohlLeadChecklist();
      return;
    }
    if (featureId === "child_vision_screen") {
      showChildVisionChecklist();
      return;
    }
    if (featureId === "child_hearing_screen") {
      showChildHearingChecklist();
      return;
    }
    if (featureId === "child_ear_check") {
      showChildEarChecklist();
      return;
    }
    if (featureId === "child_measles_rash_check") {
      showChildMeaslesChecklist();
      return;
    }
    if (featureId === "child_muac_malnutrition_screen") {
      showChildMuacChecklist();
      return;
    }
    if (featureId === "child_injury_first_aid_check") {
      showChildInjuryChecklist();
      return;
    }
    var card = screenByFeature(featureId);
    var feature = byId(catalog.features, featureId);
    if (!card) {
      showPrototypeCard(feature ? t(feature.titleSlug) : featureId, prototypeUnavailableBody(), tx("tx.prototype.unavailable.visual", "This activity is not available in the current prototype build."), featureId, "Missing screen card for " + featureId);
      return;
    }
    activeSlides = [];
    showPanel("slideshow");
    $("slidetitle").textContent = t(card.titleSlug);
    $("slideimage").innerHTML = renderVisual(featureId, card.imageDesc);
    var signs = (card.signSlugs || []).map(function (slug) { return t(slug); }).join(" | ");
    $("slidetext").textContent = t(card.bodySlug) + " Check: " + signs + " Action: " + t(card.actionSlug);
    $("slidecache").innerHTML = reviewerDetails("source: " + card.source + " " + card.sourceName + ". " + card.governanceStatus + "." + provenanceSummary(featureId) + assetSummary(featureId) + contractSummary(featureId));
  }
  function qualitySummary() {
    var statuses = {};
    for (var i = 0; i < catalog.features.length; i++) statuses[catalog.features[i].status] = (statuses[catalog.features[i].status] || 0) + 1;
    var approved = 0, needs = 0;
    for (var j = 0; j < catalog.features.length; j++) {
      if ((catalog.features[j].governanceStatus || "").indexOf("CODEX Decision") >= 0) needs++;
      else approved++;
    }
    var spend = typeof assetManifest.budget.usdCommitted === "number" ? assetManifest.budget.usdCommitted : 0;
    var ceiling = typeof assetManifest.budget.usdCeiling === "number" ? assetManifest.budget.usdCeiling : 20;
    var publishers = {};
    for (var k = 0; k < guidanceComparisons.sources.length; k++) {
      var pub = guidanceComparisons.sources[k].publisher || "Unknown";
      publishers[pub.split(" ")[0]] = true;
    }
    var publisherKeys = Object.keys(publishers).sort();
    var priorityPublishers = ["WHO", "UNICEF", "CDC"];
    var orderedPublishers = [];
    for (var priorityIndex = 0; priorityIndex < priorityPublishers.length; priorityIndex++) {
      if (publishers[priorityPublishers[priorityIndex]]) orderedPublishers.push(priorityPublishers[priorityIndex]);
    }
    for (var publisherIndex = 0; publisherIndex < publisherKeys.length; publisherIndex++) {
      if (orderedPublishers.indexOf(publisherKeys[publisherIndex]) < 0) orderedPublishers.push(publisherKeys[publisherIndex]);
    }
    var publisherNames = orderedPublishers.slice(0, 6).join(", ") || "none loaded";
    var approvalQueue = guidanceComparisons.comparisons.filter(function (c) {
      return ((c.codexDecision || "") + " " + (c.status || "")).toLowerCase().indexOf("need") >= 0 || ((c.codexDecision || "") + " " + (c.status || "")).toLowerCase().indexOf("review") >= 0;
    }).slice(0, 4).map(function (c) { return c.featureId; }).join(", ");
    var sourceTypes = {}, reviewStatuses = {};
    for (var m = 0; m < assetManifest.assets.length; m++) {
      var asset = assetManifest.assets[m];
      var sourceType = asset.sourceType || "unknown_source";
      var reviewStatus = asset.clinicalReviewStatus || asset.localReviewStatus || asset.approvalStatus || "Review Needed";
      sourceTypes[sourceType] = (sourceTypes[sourceType] || 0) + 1;
      reviewStatuses[reviewStatus] = (reviewStatuses[reviewStatus] || 0) + 1;
    }
    var sourceQueue = Object.keys(sourceTypes).sort().slice(0, 5).map(function (key) { return key + "=" + sourceTypes[key]; }).join(", ") || "none";
    var reviewQueue = Object.keys(reviewStatuses).sort().slice(0, 5).map(function (key) { return key + "=" + reviewStatuses[key]; }).join(", ") || "none";
    var approvalStates = assetApprovalRegister.approvalStates || {};
    var approvalCount = Array.isArray(approvalStates.approved) ? approvalStates.approved.length : 0;
    var notApprovedCount = Array.isArray(approvalStates.notApproved) ? approvalStates.notApproved.length : 0;
    var graphicsNeededCount = Array.isArray(approvalStates.graphicsNeeded) ? approvalStates.graphicsNeeded.length : 0;
    var noGraphicsCount = Array.isArray(approvalStates.noGraphicsNeeded) ? approvalStates.noGraphicsNeeded.length : 0;
    var standardsSource = chwQualityStandards.source && chwQualityStandards.source.title ? chwQualityStandards.source.title : "CHW quality standards";
    var standardLabels = chwQualityStandards.components.slice(0, 6).map(function (c) { return c.label ? c.label.toLowerCase() : c.id; }).join(", ") || "none loaded";
    var phraseSlugs = Object.keys(phraseBank.phrases || {});
    var bnReady = 0;
    for (var n = 0; n < phraseSlugs.length; n++) {
      var item = phraseBank.phrases[phraseSlugs[n]] || {};
      if (item["bn-BD"] && item["bn-BD"].text) bnReady++;
    }
    var bnPending = Math.max(0, phraseSlugs.length - bnReady);
    var fhirSeen = {};
    for (var q = 0; q < moduleContracts.contracts.length; q++) {
      var resources = moduleContracts.contracts[q].fhirResources || [];
      for (var r = 0; r < resources.length; r++) fhirSeen[resources[r]] = true;
    }
    var fhirNames = Object.keys(fhirSeen).sort().join(", ") || "none declared";
    var contractPosture = moduleContracts.securityPosture || "prototype posture not declared";
    return " Catalog: " + catalog.features.length + " features; runnable or source-backed items: " + ((statuses.prototype || 0) + (statuses.source_identified || 0) + (statuses.implemented || 0)) + "; items still needing approval: " + needs + "; draft-verified or other status: " + approved + "; media: " + assetManifest.assets.length + " candidates; $" + spend + " image spend of $" + ceiling + " ceiling. Source coverage: " + guidanceComparisons.sources.length + " sources from " + publisherNames + "; " + guidanceComparisons.comparisons.length + " comparisons. Approval queue: " + (approvalQueue || "none") + " needs approval. Media queue: sources " + sourceQueue + "; reviews " + reviewQueue + ". Media approval register: " + approvalCount + " approved, " + notApprovedCount + " not approved, " + graphicsNeededCount + " graphics/audio needed, " + noGraphicsCount + " text-only items; approval tracking is separate from draft iteration. CHW AIM quality standards: " + chwQualityStandards.components.length + " checks from " + standardsSource + "; mapped features " + chwQualityStandards.featureMappings.length + "; includes " + standardLabels + ". Localization: English fallback loaded; Bangla " + bnReady + "/" + phraseSlugs.length + " phrases translated, " + bnPending + " pending sign-off. Module review records: " + moduleContracts.contracts.length + " features; health-record resource types " + fhirNames + "; security posture " + contractPosture + ".";
  }
  if ($("search")) $("search").addEventListener("input", function () {
    search = String($("search").value || "").toLowerCase();
    featureLimit = FEATURE_PAGE_SIZE;
    renderFeatureList();
    applyShellVisibility();
  });
  if ($("todaybrush")) $("todaybrush").addEventListener("click", function () { openLaunch("dental.brushing", "Toothbrushing coach"); });
  if ($("homecare")) $("homecare").addEventListener("click", function () { showCatalogScreen("people", null, null, true); });
  if ($("homelearn")) $("homelearn").addEventListener("click", function () { showCatalogScreen("learn"); });
  if ($("hometools")) $("hometools").addEventListener("click", function () { showCatalogScreen("tools"); });
  if ($("navhome")) $("navhome").addEventListener("click", goHome);
  if ($("navpeople")) $("navpeople").addEventListener("click", function () { showCatalogScreen("people"); });
  if ($("navlearn")) $("navlearn").addEventListener("click", function () { showCatalogScreen("learn"); });
  if ($("navtools")) $("navtools").addEventListener("click", function () { showCatalogScreen("tools"); });
  if ($("navurgent")) $("navurgent").addEventListener("click", beginDangerFlow);
  if ($("screenback")) $("screenback").addEventListener("click", function () {
    if (activeShellScreen === "urgent-check") returnToPreviousUnder5Step();
    else returnFromWork();
  });
  if ($("showprefs")) $("showprefs").addEventListener("click", function () {
    if ($("localprefs")) $("localprefs").classList.toggle("hidden");
    if ($("localprefs") && !$("localprefs").classList.contains("hidden")) moveToNextStep("localprefs");
  });
  var howToStep = 0;
  var howToSlides = [
    { titleSlug: "tx.howto.hear_title", titleFallback: "Hear this screen", textSlug: "tx.howto.hear_body", textFallback: "Tap Listen to hear the important words and choices. A yellow outline shows what the app is reading. Tap Stop at any time." },
    { titleSlug: "tx.howto_questions_title", titleFallback: "Answer one step at a time", textSlug: "tx.multi_select_instruction", textFallback: "Choose every item that is true. You can choose more than one." },
    { titleSlug: "tx.howto_lists_title", titleFallback: "Choose all that apply", textSlug: "tx.multi_select_instruction", textFallback: "Choose every item that is true. You can choose more than one." }
  ];
  function renderHowTo() {
    var slide = howToSlides[howToStep];
    $("howtoprogress").textContent = tx("tx.howto.step", "Step {current} of {total}", { current: howToStep + 1, total: howToSlides.length });
    $("howtotitle").textContent = tx(slide.titleSlug, slide.titleFallback);
    $("howtotext").textContent = tx(slide.textSlug, slide.textFallback);
    $("howtoprev").disabled = howToStep === 0;
    $("howtonext").disabled = howToStep === howToSlides.length - 1;
  }
  function showHowTo() {
    stopGuidedReading();
    howToStep = 0;
    $("howtopanel").classList.remove("hidden");
    renderHowTo();
    moveToNextStep("howtopanel");
  }
  function enhanceMultiSelect(root) {
    if (!root || !root.querySelectorAll) return;
    var groups = root.querySelectorAll(".slidecontrols, .symptom-group, fieldset");
    Array.prototype.forEach.call(groups, function (group) {
      if (!group.querySelectorAll || group.querySelectorAll('input[type="checkbox"]').length < 2) return;
      if (group.closest && group.closest(".clinical-checklist")) return;
      // A staged wrapper (for example, diarrhoea) can contain later hidden clinical
      // checklists. It is not itself a checklist and must not receive their generic
      // multi-select instruction.
      if (group.querySelector && group.querySelector(".clinical-checklist")) return;
      var nestedGroups = group.children ? Array.prototype.filter.call(group.children, function (child) {
        return child.matches && child.matches(".symptom-group, fieldset") &&
          child.querySelectorAll && child.querySelectorAll('input[type="checkbox"]').length >= 2;
      }) : [];
      if (nestedGroups.length) return;
      if (group.querySelector && group.querySelector(".multi-select-instruction")) return;
      var note = document.createElement ? document.createElement("p") : null;
      if (!note) return;
      note.className = "multi-select-instruction";
      note.textContent = tx("tx.multi_select_instruction", "Choose every item that is true. You can choose more than one.");
      group.insertBefore(note, group.firstChild);
    });
  }
  function syncDuplicateWorkTitle() {
    var shellTitle = $("screenlabel");
    var contentTitle = $("slidetitle");
    if (!shellTitle || !contentTitle) return;
    var shellText = String(shellTitle.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
    var contentText = String(contentTitle.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
    var duplicate = !!shellText && shellText === contentText;
    contentTitle.classList.toggle("duplicate-shell-title", duplicate);
    if (duplicate) contentTitle.setAttribute("aria-hidden", "true");
    else contentTitle.removeAttribute("aria-hidden");
  }
  if (typeof MutationObserver !== "undefined" && $("appmain")) {
    var multiSelectObserver = new MutationObserver(function () { enhanceMultiSelect($("appmain")); });
    multiSelectObserver.observe($("appmain"), { childList: true, subtree: true });
    enhanceMultiSelect($("appmain"));
    var workTitleObserver = new MutationObserver(syncDuplicateWorkTitle);
    if ($("screenlabel")) workTitleObserver.observe($("screenlabel"), { childList: true, characterData: true, subtree: true });
    if ($("slidetitle")) workTitleObserver.observe($("slidetitle"), { childList: true, characterData: true, subtree: true });
    syncDuplicateWorkTitle();
  }
  if ($("listenbutton")) $("listenbutton").addEventListener("click", function () { guidedSpeechActive ? stopGuidedReading() : startGuidedReading(); });
  if ($("howtobutton")) $("howtobutton").addEventListener("click", showHowTo);
  if ($("howtoprev")) $("howtoprev").addEventListener("click", function () { howToStep = Math.max(0, howToStep - 1); renderHowTo(); });
  if ($("howtonext")) $("howtonext").addEventListener("click", function () { howToStep = Math.min(howToSlides.length - 1, howToStep + 1); renderHowTo(); });
  if ($("howtodone")) $("howtodone").addEventListener("click", function () { $("howtopanel").classList.add("hidden"); });
  if (typeof window !== "undefined" && window.location && /(?:\?|&)review=1(?:&|$)/.test(window.location.search || "") && $("reviewersettings")) {
    $("reviewersettings").classList.remove("hidden");
    if (document.body && document.body.classList) document.body.classList.add("reviewer-mode");
  }
  if ($("closeprefs")) $("closeprefs").addEventListener("click", function () {
    if ($("localprefs")) $("localprefs").classList.add("hidden");
  });
  function updatePreferenceSummary() {
    if (!$("prefsummary")) return;
    var locale = $("preflanguage") ? $("preflanguage").value : "en";
    var languageNames = { en: "English", fr: "Fran\u00e7ais", "hi-IN": "\u0939\u093f\u0928\u094d\u0926\u0940 (\u092e\u0938\u094c\u0926\u093e)", "bn-BD": "Bangla pending review" };
    var lang = languageNames[locale] || "English";
    var privacy = $("prefprivacy") && $("prefprivacy").checked ? tx("tx.prefs.privacy_extra", "extra privacy on") : tx("tx.prefs.privacy_standard", "standard prototype mode");
    var generic = $("prefgeneric") && $("prefgeneric").checked ? tx("tx.prefs.reminders_generic", "generic reminders") : tx("tx.prefs.reminders_specific", "specific reminder wording");
    var quiet = $("prefquiet") && $("prefquiet").value ? $("prefquiet").value : tx("tx.prefs.not_set", "not set");
    $("prefsummary").textContent = tx("tx.prefs.summary", "Language: {language}. Privacy: {privacy}. Reminders: {reminders}. Quiet starts: {quiet}.", { language: lang, privacy: privacy, reminders: generic, quiet: quiet });
  }
  if ($("preflanguage")) $("preflanguage").addEventListener("change", function () {
    var locale = $("preflanguage").value;
    if (engine.setLocale) engine.setLocale(locale);
    if (document.documentElement) document.documentElement.lang = locale;
    localizeCaregiverChrome();
    renderHowTo();
    updatePreferenceSummary();
    applyShellVisibility();
    refreshVisibleUnder5TriageForLocale();
    $("status").textContent = tx("tx.language.changed", "Language changed. This screen and newly opened activities use the selected language when a draft is available.");
  });
  ["preflanguage", "prefquiet", "prefprivacy", "prefgeneric"].forEach(function (id) {
    if ($(id)) $(id).addEventListener("change", updatePreferenceSummary);
  });
  if ($("addperson")) $("addperson").addEventListener("click", function () {
    var name = ($("personname").value || "").trim() || "New person";
    var subject = $("personrole").value || "child_under5";
    var birthDate = $("persondob") && $("persondob").value ? $("persondob").value : "";
    if (isFutureBirthDate(birthDate)) {
      $("status").textContent = "Date of birth cannot be in the future.";
      $("status").style.color = "#b3261e";
      return;
    }
    if (editingPersonId) {
      var editedPerson = personById(editingPersonId);
      if (!editedPerson) {
        clearPersonEditor(true, false);
        return;
      }
      editedPerson.name = name;
      editedPerson.subject = subject;
      editedPerson.birthDate = birthDate;
      editedPerson.note = editedPerson.note || "edited in prototype";
      if (activePersonId === editedPerson.id || dangerPersonId === editedPerson.id) activeSubject = subject;
      renderPeople();
      clearPersonEditor(false, false);
      renderCatalog();
      confirmPersonChange("Saved changes for " + name + ".");
      return;
    }
    var personId = "person_" + people.length;
    people.push({ id: personId, name: name, subject: subject, note: "added in prototype", birthDate: birthDate });
    clearPersonEditor(false, false);
    renderPeople();
    mode = "subject"; selected = subject; activeSubject = subject; activePersonId = personId; dangerPersonId = null; renderCatalog();
    confirmPersonChange("Added " + name + ".");
  });
  if ($("cancelperson")) $("cancelperson").addEventListener("click", function () {
    clearPersonEditor(true, true);
    if ($("status")) $("status").textContent = "Editing cancelled.";
    moveToNextStep("personeditlabel");
  });
  if ($("memoryprofile")) $("memoryprofile").addEventListener("change", renderCatalog);
  if ($("hotspotmode")) $("hotspotmode").addEventListener("change", function () { hotspot = !!$("hotspotmode").checked; renderCatalog(); });
  if ($("demomodeon")) $("demomodeon").addEventListener("change", renderCatalog);
  if ($("showtriage")) $("showtriage").addEventListener("click", beginDangerFlow);
  if ($("resetdemo")) $("resetdemo").addEventListener("click", resetDemoState);
  if ($("slidehome")) $("slidehome").addEventListener("click", goHome);
  if ($("slideread")) $("slideread").addEventListener("click", function () {
    playPrototypeSpeech(currentScreenReadAloudText());
  });
  if ($("slidepauseaudio")) $("slidepauseaudio").addEventListener("click", pausePrototypeSpeech);
  if ($("sliderestartaudio")) $("sliderestartaudio").addEventListener("click", function () {
    restartPrototypeSpeech(currentScreenReadAloudText());
  });
  if ($("slideprev")) $("slideprev").addEventListener("click", function () { moveSlide(-1); });
  if ($("slidenext")) $("slidenext").addEventListener("click", function () { moveSlide(1); });
  if (typeof globalThis !== "undefined") {
    globalThis.__MAMMA_CLINICAL_SCREENS = clinicalScreens;
    globalThis.__openClinicalSurfaceForQA = function (surfaceId) {
      var screen = clinicalScreen(surfaceId);
      if (screen.entry.kind === "under5_urgent") {
        prepareChildTriage(defaultChildPerson());
        showPanel("triagepanel");
        showUnder5Stage(screen.entry.view || "danger");
      } else if (screen.entry.kind === "person_urgent") {
        showPregnancyUrgentIntake(people.filter(function (person) { return person.subject === "pregnancy"; })[0] || null);
      } else if (screen.entry.kind === "progressive") {
        if (screen.featureId === "breastfeeding_aid_triage") {
          showBreastfeedingAidTriage("triage", screen.entry.view);
        } else {
          showPncLactationDangerChecklist();
          if (screen.entry.view !== "acute") {
            pncSelections.pncacutenone = true;
            pncAnsweredViews.acute = true;
            pncView = screen.entry.view;
            renderPncLactationDangerChecklist();
          }
        }
      } else {
        var previousMode = mode;
        if (screen.entry.intent === "urgent_check") mode = "danger";
        openLaunch(screen.entry.launch, "");
        mode = previousMode;
      }
      return surfaceId;
    };
  }
  applyBirthDateBounds();
  renderRoleSelect();
  renderPeople();
  renderCatalog();
  updatePreferenceSummary();

  var uncheck = function (list) { list.forEach(function (q) { var e = $("s_" + q.id); if (e) e.checked = false; }); };
  function under5StageTitle() {
    var person = personById(activePersonId);
    var name = person && person.subject === "child_under5" ? person.name : tx("tx.triage.chrome.child_default", "Child");
    // The progress strip and question name the step. The shell keeps only the subject
    // visible, rather than echoing the step two more times.
    return tx("tx.triage.chrome.child_check_subject", "Checking {name}", { name: name });
  }
  function hideUnder5StageRegions() {
    [
      "triagechildgroup", "dangergroup", "complaintgroup", "coughgroup", "rrsection",
      "diargroup", "diarrhoeadurationfields", "diarrhoeastoolfields", "diarrhoeadehydrationsigns", "fevergroup",
      "fevercoursefields", "fevermeasurementfields", "eargroup", "dentalgroup", "measlesgroup", "out"
    ].forEach(function (id) {
      if ($(id)) $(id).classList.add("hidden");
    });
  }
  function renderUnder5RegistryGate(surfaceId, targetId, onContinue, opts) {
    var target = $(targetId);
    if (!target) return;
    target.innerHTML = renderClinicalChecklist(surfaceId, opts || {});
    var binding = bindClinicalChecklist(surfaceId, opts || {});
    var action = $(binding.screen.actionId);
    if (action && !action.dataset.bound) {
      action.dataset.bound = surfaceId;
      action.addEventListener("click", function () {
        stopPrototypeMusicForContext(surfaceId);
        if (typeof onContinue === "function") onContinue();
      });
    }
  }
  function renderUnder5DangerGate() {
    var dangerOptions = DANGER.map(function (q) {
      return { id: "s_" + q.id, label: t("tx.q_" + q.id), kind: "positive" };
    });
    dangerOptions.push({
      id: "s_no_danger_signs",
      label: tx("tx.clinical_screen.under5.none", "No danger signs"),
      kind: "none"
    });
    var dangerGroups = [{
      id: "under5_danger_signs",
      legend: tx("tx.clinical_screen.under5.legend", "Choose every danger sign that is happening"),
      optionIds: dangerOptions.map(function (option) { return option.id; })
    }];
    $("dangersigns").innerHTML = renderClinicalChecklist("under5.general_danger", {
      groups: dangerGroups,
      options: dangerOptions
    });
    under5DangerGateUpdate = bindClinicalChecklist("under5.general_danger", {
      options: dangerOptions,
      onChange: function () {
        if (activeShellScreen === "urgent-check") applyShellVisibility();
      }
    }).update;
    var action = $("triagedangercontinue");
    if (action && !action.dataset.bound) {
      action.dataset.bound = "under5-danger";
      action.addEventListener("click", function () {
        var dangerSelected = DANGER.some(function (q) { return !!($("s_" + q.id) && $("s_" + q.id).checked); });
        if (dangerSelected) finishUnder5Triage();
        else showUnder5Stage("complaints");
      });
    }
  }
  function renderUnder5ComplaintGate() {
    renderUnder5RegistryGate("under5.presenting_complaints", "mainsigns", function () {
      under5BranchQueue = [];
      if ($("s_cough").checked) under5BranchQueue.push("cough_chest", "cough_sound");
      if ($("s_diarrhoea").checked) under5BranchQueue.push(DIARRHOEA_DURATION_STAGE, "diarrhoea_stool", "diarrhoea_dehydration");
      if ($("s_fever").checked) under5BranchQueue.push("fever_course", "fever_measurement");
      if ($("s_ear_problem").checked) under5BranchQueue.push("ear");
      if ($("s_tooth_mouth").checked) under5BranchQueue.push("tooth_mouth");
      if ($("s_measles_rash").checked) under5BranchQueue.push("measles");
      under5BranchIndex = 0;
      if (under5BranchQueue.length) showUnder5Stage(under5BranchQueue[0]);
      else finishUnder5Triage();
    });
  }
  function advanceUnder5Branch() {
    under5BranchIndex += 1;
    if (under5BranchIndex < under5BranchQueue.length) showUnder5Stage(under5BranchQueue[under5BranchIndex]);
    else {
      stopPrototypeMusicForContext("under5.followup.cough_sound");
      finishUnder5Triage();
    }
  }
  function renderUnder5CoughChestGate() {
    renderUnder5RegistryGate("under5.followup.cough_chest", "coughsigns", advanceUnder5Branch, {
      beforeFieldsHtml: chestIndrawingFlipbookHtml(),
      singleSelect: true,
      state: coughChoiceState,
      requiredFallback: tx("tx.cough.answer_required", "Choose one answer to continue.")
    });
    bindChestFlipbook();
  }
  function renderUnder5CoughSoundGate() {
    renderUnder5RegistryGate("under5.followup.cough_sound", "coughsigns", advanceUnder5Branch, {
      beforeFieldsHtml: stridorSoundExampleHtml(),
      singleSelect: true,
      state: coughChoiceState,
      requiredFallback: tx("tx.cough.answer_required", "Choose one answer to continue.")
    });
    var play = $("stridorsoundplay");
    if (play && !play.dataset.bound) {
      play.dataset.bound = "stridor-example";
      play.addEventListener("click", function () {
        stopReadAloudForContextChange(tx("tx.stridor_sound.status.stopped", "Sound example stopped."));
        togglePrototypeMusic("audio.clinical.stridor_example_cc_by_sa_3", "stridorsoundstatus", false, {
          context: "under5.followup.cough_sound",
          unavailable: tx("tx.stridor_sound.status.ready", "Sound example ready; playback is unavailable in this browser."),
          playing: tx("tx.stridor_sound.status.playing", "Sound example playing."),
          complete: tx("tx.stridor_sound.status.complete", "Sound example complete."),
          stopped: tx("tx.stridor_sound.status.stopped", "Sound example stopped."),
          failed: tx("tx.stridor_sound.status.failed", "Sound example could not load. If you are worried about breathing, seek urgent care."),
          blocked: tx("tx.stridor_sound.status.failed", "Sound example could not load. If you are worried about breathing, seek urgent care.")
        });
      });
    }
    var stop = $("stridorsoundstop");
    if (stop && !stop.dataset.bound) {
      stop.dataset.bound = "stridor-example";
      stop.addEventListener("click", function () {
        if (currentPrototypeMusic && currentPrototypeMusic.assetId === "audio.clinical.stridor_example_cc_by_sa_3") {
          stopPrototypeMusic("stridorsoundstatus", tx("tx.stridor_sound.status.stopped", "Sound example stopped."));
        } else {
          setMusicStatus("stridorsoundstatus", tx("tx.stridor_sound.status.stopped", "Sound example stopped."));
        }
      });
    }
  }
  function bindDiarrhoeaDurationGate() {
    var input = $("diarrhoeadays"), notSure = $("diarrhoeadaysnotsure"), action = $("triagediarrhoeadayscontinue"), feedback = $("diarrhoeadaysfeedback");
    function update() {
      var entered = !!(input && String(input.value || "") !== "");
      var unsure = !!(input && input.dataset.notSure === "true");
      if (action) action.disabled = !(entered || unsure);
      if (feedback) feedback.textContent = entered || unsure ? "" : tx("tx.diarrhoea_duration.answer_required", "Enter the number of days or choose Not sure.");
    }
    if (input && !input.dataset.durationBound) {
      input.dataset.durationBound = "true";
      input.addEventListener("input", function () { delete input.dataset.notSure; update(); });
      input.addEventListener("change", function () { delete input.dataset.notSure; update(); });
    }
    if (notSure && !notSure.dataset.durationBound) {
      notSure.dataset.durationBound = "true";
      notSure.addEventListener("click", function () { if (input) { input.value = ""; input.dataset.notSure = "true"; } update(); });
    }
    if (action && !action.dataset.durationBound) {
      action.dataset.durationBound = "true";
      action.addEventListener("click", advanceUnder5Branch);
    }
    update();
  }
  function renderUnder5DiarrhoeaStoolGate() {
    renderUnder5RegistryGate("under5.followup.diarrhoea_stool", "diarrhoeastoolsigns", advanceUnder5Branch, {
      optionHelpHtml: function (option) { return option.id === "s_bloody_stool" ? signExampleHtml("bloody_stool") : ""; }
    });
  }
  function renderUnder5DiarrhoeaDehydrationGate() {
    renderUnder5RegistryGate("under5.followup.diarrhoea_dehydration", "diarrhoeadehydrationsigns", advanceUnder5Branch, {
      optionHelpHtml: function (option) {
        var id = option.id.replace(/^s_/, "");
        return id === "sunken_eyes" || id === "skin_pinch_slow" ? signExampleHtml(id) : "";
      }
    });
  }
  function renderUnder5FeverCourseGate() {
    renderUnder5RegistryGate("under5.followup.fever_course", "fevercoursesigns", advanceUnder5Branch);
  }
  function renderUnder5FeverMeasurementGate() {
    renderUnder5RegistryGate("under5.followup.fever_measurement", "fevermeasurementsigns", advanceUnder5Branch);
  }
  function renderUnder5EarGate() {
    renderUnder5RegistryGate("under5.followup.ear", "earsigns", advanceUnder5Branch);
  }
  function renderUnder5ToothMouthGate() {
    renderUnder5RegistryGate("under5.followup.tooth_mouth", "dentalsigns", advanceUnder5Branch);
  }
  function renderUnder5MeaslesGate() {
    renderUnder5RegistryGate("under5.followup.measles", "measlessigns", advanceUnder5Branch);
  }
  function showUnder5Stage(stage) {
    if (stage !== "cough_sound") stopPrototypeMusicForContext("under5.followup.cough_sound");
    if (stage !== "cough_chest") stopChestFlipbook();
    under5Stage = stage;
    hideUnder5StageRegions();
    if (stage === "danger") {
      renderUnder5DangerGate();
      $("triagechildgroup").classList.remove("hidden");
      $("dangergroup").classList.remove("hidden");
      moveToNextStep("dangergroup");
    } else if (stage === "complaints") {
      renderUnder5ComplaintGate();
      $("complaintgroup").classList.remove("hidden");
      moveToNextStep("complaintgroup");
    } else if (stage === "cough_chest") {
      renderUnder5CoughChestGate();
      $("coughgroup").classList.remove("hidden");
      moveToNextStep("coughgroup");
    } else if (stage === "cough_sound") {
      renderUnder5CoughSoundGate();
      $("coughgroup").classList.remove("hidden");
      moveToNextStep("coughgroup");
    } else if (stage === DIARRHOEA_DURATION_STAGE) {
      $("diargroup").classList.remove("hidden");
      $("diarrhoeadurationfields").classList.remove("hidden");
      bindDiarrhoeaDurationGate();
      moveToNextStep("diargroup");
    } else if (stage === "diarrhoea_stool") {
      renderUnder5DiarrhoeaStoolGate();
      $("diargroup").classList.remove("hidden");
      $("diarrhoeastoolfields").classList.remove("hidden");
      moveToNextStep("diargroup");
    } else if (stage === "diarrhoea_dehydration") {
      renderUnder5DiarrhoeaDehydrationGate();
      $("diargroup").classList.remove("hidden");
      $("diarrhoeadehydrationsigns").classList.remove("hidden");
      moveToNextStep("diargroup");
    } else if (stage === "fever_course") {
      renderUnder5FeverCourseGate();
      $("fevergroup").classList.remove("hidden");
      $("fevercoursefields").classList.remove("hidden");
      moveToNextStep("fevergroup");
    } else if (stage === "fever_measurement") {
      renderUnder5FeverMeasurementGate();
      $("fevergroup").classList.remove("hidden");
      $("fevermeasurementfields").classList.remove("hidden");
      moveToNextStep("fevergroup");
    } else if (stage === "ear") {
      renderUnder5EarGate();
      $("eargroup").classList.remove("hidden");
      moveToNextStep("eargroup");
    } else if (stage === "tooth_mouth") {
      renderUnder5ToothMouthGate();
      $("dentalgroup").classList.remove("hidden");
      moveToNextStep("dentalgroup");
    } else if (stage === "measles") {
      renderUnder5MeaslesGate();
      $("measlesgroup").classList.remove("hidden");
      moveToNextStep("measlesgroup");
    }
    applyShellVisibility();
  }
  function returnToPreviousUnder5Step() {
    if (under5Stage === "danger") { returnFromWork(); return; }
    if (under5ShowingSupport) { restoreUnder5Result(); return; }
    if (under5Stage === "result") {
      if (under5BranchQueue.length && under5BranchQueue[under5BranchIndex]) showUnder5Stage(under5BranchQueue[under5BranchIndex]);
      else showUnder5Stage("complaints");
      return;
    }
    if (under5Stage === "complaints") {
      under5Stage = "danger";
      hideUnder5StageRegions();
      $("triagechildgroup").classList.remove("hidden");
      $("dangergroup").classList.remove("hidden");
      moveToNextStep("dangergroup");
      applyShellVisibility();
      return;
    }
    if (under5BranchIndex > 0) {
      under5BranchIndex -= 1;
      showUnder5Stage(under5BranchQueue[under5BranchIndex]);
      return;
    }
    under5Stage = "complaints";
    hideUnder5StageRegions();
    $("complaintgroup").classList.remove("hidden");
    moveToNextStep("complaintgroup");
    applyShellVisibility();
  }
  function snapshotUnder5Inputs() {
    var snapshot = {};
    var panel = $("triagepanel");
    if (!panel || !panel.querySelectorAll) return snapshot;
    var fields = panel.querySelectorAll("input, select");
    for (var i = 0; i < fields.length; i++) {
      var field = fields[i];
      if (!field.id) continue;
      snapshot[field.id] = { value: field.value, checked: !!field.checked };
    }
    return snapshot;
  }
  function restoreUnder5Inputs(snapshot) {
    Object.keys(snapshot || {}).forEach(function (id) {
      var field = $(id);
      if (!field) return;
      if (Object.prototype.hasOwnProperty.call(snapshot[id], "value")) field.value = snapshot[id].value;
      if (Object.prototype.hasOwnProperty.call(snapshot[id], "checked")) field.checked = snapshot[id].checked;
    });
  }
  function refreshVisibleUnder5TriageForLocale() {
    var panel = $("triagepanel");
    var snapshot = snapshotUnder5Inputs();
    renderChildSelect(snapshot.triagechildselect ? snapshot.triagechildselect.value : "");
    if (!panel || panel.classList.contains("hidden")) {
      updateAgeFromDob();
      return;
    }
    if (under5Stage === "result") {
      finishUnder5Triage();
      return;
    }
    var stage = under5Stage;
    showUnder5Stage(stage);
    restoreUnder5Inputs(snapshot);
    updateAgeFromDob();
    if (stage === "danger") updateDangerGate();
  }
  function showUnder5ResultStage(showBreathing) {
    under5Stage = "result";
    hideUnder5StageRegions();
    $("out").classList.remove("hidden");
    if (showBreathing) $("rrsection").classList.remove("hidden");
    applyShellVisibility();
    moveToNextStep("out");
  }
  function bindUnder5ResultActions() {
    var out = $("out");
    bindUnder5Back(out);
    var reassess = $("triagereassess");
    if (reassess && !reassess.dataset.bound) {
      reassess.dataset.bound = "under5-reassess";
      reassess.addEventListener("click", finishUnder5Triage);
    }
    var openOrs = $("openorscard");
    if (openOrs && !openOrs.dataset.bound) {
      openOrs.dataset.bound = "under5-ors-card";
      openOrs.addEventListener("click", function () {
        under5ShowingSupport = true;
        out.innerHTML = requestCardHtml() + backToUnder5ResultHtml();
        bindUnder5Back(out);
        bindRequestCardActions();
        applyShellVisibility();
        moveToNextStep("out");
      });
    }
  }
  function restoreUnder5Result() {
    if (!under5ResultMarkup) { returnToPreviousUnder5Step(); return; }
    under5ShowingSupport = false;
    $("out").innerHTML = under5ResultMarkup;
    showUnder5ResultStage(under5ResultShowsBreathing);
    bindUnder5ResultActions();
  }
  function showResolvedUnder5Result(markup, showBreathing) {
    under5ResultShowsBreathing = !!showBreathing;
    under5ResultMarkup = markup + backToUnder5QuestionsHtml();
    restoreUnder5Result();
  }
  function finishUnder5Triage() {
    var action = $("assess");
    if (action && action.click) action.click();
    else if (action && action._fire) action._fire("click");
  }

  renderUnder5DangerGate();
  showUnder5Stage("danger");
  renderChildSelect(defaultChildPerson() ? defaultChildPerson().id : "");
  if ($("triagechildselect")) $("triagechildselect").addEventListener("change", function () {
    var select = $("triagechildselect");
    var person = select && select.value ? personById(select.value) : null;
    if (person) {
      activePersonId = person.id;
      dangerPersonId = person.id;
      activeSubject = "child_under5";
      applyKnownDob(person);
    } else {
      activePersonId = null;
      dangerPersonId = null;
      if ($("dob")) $("dob").value = "";
      updateAgeFromDob();
    }
    under5Stage = "danger";
    under5BranchQueue = [];
    under5BranchIndex = 0;
    resetUnder5TriageSession();
    showUnder5Stage("danger");
  });
  var rr = null, taps = 0, timer = null;
  function setRRReady(message, keepResult) {
    clearInterval(timer);
    timer = null;
    taps = 0;
    if (!keepResult) rr = null;
    $("rridle").classList.remove("hidden");
    $("rrcounting").classList.add("hidden");
    $("rrstart").classList.remove("hidden");
    $("rragain").classList.add("hidden");
    $("rrcancel").classList.toggle("hidden", !keepResult);
    $("tapnum").textContent = tx("tx.rr.breath_count", "{count} breaths", { count: 0 });
    $("rrleft").textContent = tx("tx.triage.chrome.tap_instruction", "Tap once each time the child breathes in or the chest rises.");
    $("rrout").textContent = message || tx("tx.rr.not_measured", "not measured. When counting starts, tap once for each breath you see.");
  }
  function setRRMeasured() {
    $("rridle").classList.remove("hidden");
    $("rrcounting").classList.add("hidden");
    $("rrstart").classList.add("hidden");
    $("rragain").classList.remove("hidden");
    $("rrcancel").classList.add("hidden");
    $("rrout").textContent = tx("tx.rr.measured", "breathing rate: {rate} per minute. Tap Time again if you want to repeat the count.", { rate: rr });
  }
  function resetRR() { setRRReady(t("tx.rr.not_measured"), false); }
  $("rrstart").addEventListener("click", function () {
    taps = 0; rr = null;
    var windowSeconds = (typeof window !== "undefined" && window.__MAMMA_RR_TIMER_SECONDS) ? Number(window.__MAMMA_RR_TIMER_SECONDS) : 60;
    if (!isFinite(windowSeconds) || windowSeconds <= 0) windowSeconds = 60;
    var left = Math.round(windowSeconds);
    $("rridle").classList.add("hidden"); $("rrcounting").classList.remove("hidden"); $("tapnum").textContent = tx("tx.rr.breath_count", "{count} breaths", { count: 0 }); $("rrleft").textContent = tx("tx.rr.counting_left", "{seconds}s left. Tap once for each breath in or chest rise.", { seconds: left });
    clearInterval(timer);
    timer = setInterval(function () { left--; $("rrleft").textContent = tx("tx.rr.counting_left", "{seconds}s left. Tap once for each breath in or chest rise.", { seconds: left }); if (left <= 0) { clearInterval(timer); timer = null; rr = Math.round((taps * 60) / windowSeconds); setRRMeasured(); } }, 1000);
    if (timer && timer.unref) timer.unref();
  });
  $("rragain").addEventListener("click", function () {
    var previous = rr;
    setRRReady(tx("tx.rr.ready_again", "Ready to time again. Previous result: {rate} per minute. Tap Start to begin, or Cancel to keep the previous result.", { rate: previous }), true);
  });
  $("rrcancel").addEventListener("click", function () {
    if (rr !== null) setRRMeasured();
    else resetRR();
  });
  $("rrtapbtn").addEventListener("click", function () { taps++; $("tapnum").textContent = tx("tx.rr.breath_count", "{count} breaths", { count: taps }); });

  $("dob").addEventListener("change", updateAgeFromDob);

  function checkedInputLabels(inputs) {
    var labels = {
      cough: "cough",
      diarrhoea: "diarrhoea",
      fever: "fever",
      measles_rash: "fever with a spreading rash",
      ear_problem: "ear pain or ear discharge",
      tooth_mouth: "tooth or mouth pain, swelling, or injury",
      other_problem: "other child problem not listed",
      bloody_stool: "blood in stool",
      unable_to_drink: "unable to drink or breastfeed",
      vomits_everything: "vomits everything",
      convulsions: "convulsions",
      lethargic_unconscious: "lethargic or unconscious",
      chest_indrawing: "chest indrawing",
      stridor_calm: "stridor when calm",
      sunken_eyes: "sunken eyes",
      skin_pinch_slow: "skin pinch returns slowly",
      restless_irritable: "restless or irritable",
      drinks_eagerly: "drinks eagerly",
      ear_discharge: "ear discharge",
      ear_swelling_behind: "tender swelling behind the ear",
      tooth_severe_pain: "severe tooth or mouth pain",
      mouth_face_swelling: "mouth, gum, or face swelling",
      mouth_injury_bleeding: "mouth injury or bleeding",
      mouth_breathing_swallowing: "trouble breathing or swallowing with mouth/face problem",
      measles_cough: "cough or runny nose with the rash",
      measles_eyes: "red or watery eyes with the rash",
      measles_mouth: "mouth sores or trouble drinking with the rash",
      measles_breathing: "breathing trouble with the rash"
    };
    var out = [];
    Object.keys(labels).forEach(function (key) { if (inputs[key] === true) out.push(labels[key]); });
    return out;
  }
  function absentSafetyLabels(inputs) {
    var checks = [
      ["bloody_stool", "blood in stool"],
      ["unable_to_drink", "unable to drink or breastfeed"],
      ["vomits_everything", "vomits everything"],
      ["convulsions", "convulsions"],
      ["lethargic_unconscious", "lethargic or unconscious"]
    ];
    return checks.filter(function (pair) { return inputs[pair[0]] !== true; }).map(function (pair) { return pair[1]; });
  }
  function homeCareSafetyHtml(kind) {
    var triggers = tx("tx.u5.safety.general", "Take the child to the clinic if any danger sign appears, the child gets worse, cannot drink, vomits everything, has convulsions, becomes very sleepy or hard to wake, or you remain worried.");
    if (kind === "diarrhoea") {
      triggers = tx("tx.u5.safety.diarrhoea", "Take the child to the clinic if diarrhoea gets worse, blood appears in stool, the child drinks poorly, vomits everything, shows dehydration signs, has fever, or diarrhoea is not improving after 2 days.");
    } else if (kind === "cough") {
      triggers = tx("tx.u5.safety.cough", "Take the child to the clinic if breathing becomes fast or difficult, the chest pulls in, the child cannot drink, fever appears or persists, cough is not improving, or any danger sign appears.");
    } else if (kind === "fever") {
      triggers = tx("tx.u5.safety.fever", "Take the child to the clinic if fever lasts 7 days or more, is not improving, the child gets a rash, stiff neck, breathing trouble, a danger sign, or seems worse at any time.");
    }
    return "<p>" + esc(triggers) + "</p>";
  }
  function childModuleConcerns(inputs) {
    var concerns = [];
    var dentalSelected = [];
    if (inputs.mouth_breathing_swallowing) dentalSelected.push("dentalbreathing");
    if (inputs.mouth_face_swelling) dentalSelected.push("dentalswelling");
    if (inputs.mouth_injury_bleeding) {
      dentalSelected.push("dentalinjury");
      dentalSelected.push("dentalbleeding");
    }
    if (inputs.tooth_severe_pain) dentalSelected.push("dentalpain");
    var dentalDecision = inputs.tooth_mouth || dentalSelected.length ? screenDecision("dental_triage", dentalSelected) : null;
    if (dentalDecision && dentalDecision.severity === "emergency") {
      concerns.push({ source: "dental_triage", result: dentalDecision, resultScreen: "triage.result.tooth_mouth_emergency", html: resultActionCardHtml({
        kind: "refer",
        careRoute: "dental_or_clinic",
        severity: dentalDecision.severity,
        screenId: "triage.result.tooth_mouth_emergency",
        title: tx("tx.u5.mouth_face_emergency.title", "Mouth or face emergency concern"),
        paragraphs: [tx("tx.u5.mouth_face_emergency.body", "Because you checked trouble breathing or swallowing with a tooth, mouth, or face problem, seek urgent medical or dental care now. This prototype does not diagnose or give medicine.")]
      }) + screenDecisionTraceHtml("dental_triage", dentalDecision) });
    } else if (dentalDecision && dentalDecision.severity === "routine_clinic") {
      var dentalReasons = [];
      if (inputs.tooth_severe_pain) dentalReasons.push("severe or worsening tooth or mouth pain");
      if (inputs.mouth_face_swelling) dentalReasons.push("mouth, gum, or face swelling");
      if (inputs.mouth_injury_bleeding) dentalReasons.push("mouth injury, broken tooth, or bleeding");
      concerns.push({ source: "dental_triage", result: dentalDecision, resultScreen: "triage.result.tooth_mouth_clinic", html: resultActionCardHtml({
        kind: "refer",
        careRoute: "dental_or_clinic",
        severity: dentalDecision.severity,
        screenId: "triage.result.tooth_mouth_clinic",
        title: tx("tx.u5.tooth_mouth_concern.title", "Tooth or mouth concern"),
        paragraphs: [tx("tx.u5.tooth_mouth_concern.body", "Because you checked tooth or mouth concern{reasons}, arrange dental or clinic review. Go today for swelling, fever, injury, bleeding, worsening pain, or trouble eating or sleeping. This is no diagnosis and no medicine advice.", { reasons: dentalReasons.length ? " with " + dentalReasons.join(", ") : "" })]
      }) + screenDecisionTraceHtml("dental_triage", dentalDecision) });
    } else if (dentalDecision && dentalDecision.severity === "home_care") {
      concerns.push({ source: "dental_triage", result: dentalDecision, resultScreen: "triage.result.tooth_mouth_home", html: resultActionCardHtml({
        kind: "home",
        careRoute: "home_watch",
        severity: dentalDecision.severity,
        screenId: "triage.result.tooth_mouth_home",
        title: tx("tx.u5.tooth_mouth_concern.title", "Tooth or mouth concern"),
        paragraphs: [tx("tx.dental_triage.no_urgent", "No urgent dental sign selected in this prototype. Keep brushing guidance visible, avoid sugary snacks/drinks when possible, and ask a dentist or CHW if pain, swelling, injury, fever, or bleeding starts. This is no diagnosis.")],
        extraHtml: homeCareSafetyHtml("")
      }) + screenDecisionTraceHtml("dental_triage", dentalDecision) });
    }
    var earSelected = [];
    if (inputs.ear_discharge) earSelected.push("eardischarge");
    if (inputs.ear_swelling_behind) earSelected.push("earbehind");
    var earDecision = inputs.ear_problem || earSelected.length ? screenDecision("child_ear_check", earSelected) : null;
    if (earDecision && earDecision.severity === "emergency") {
      concerns.push({ source: "child_ear_check", result: earDecision, resultScreen: "triage.result.ear_emergency", html: resultActionCardHtml({
        kind: "refer",
        careRoute: "child_clinic",
        severity: earDecision.severity,
        screenId: "triage.result.ear_emergency",
        title: tx("tx.u5.ear_danger.title", "Urgent ear concern"),
        paragraphs: [tx("tx.u5.ear_danger.body", "Tender swelling behind the ear can be serious. Do not wait for home care.")]
      }) + screenDecisionTraceHtml("child_ear_check", earDecision) });
    } else if (earDecision && earDecision.severity === "routine_clinic") {
      var earReasons = [];
      if (inputs.ear_discharge) earReasons.push("ear discharge");
      concerns.push({ source: "child_ear_check", result: earDecision, resultScreen: "triage.result.ear_clinic", html: resultActionCardHtml({
        kind: "refer",
        careRoute: "child_clinic",
        severity: earDecision.severity,
        screenId: "triage.result.ear_clinic",
        title: tx("tx.u5.ear_concern.title", "Ear concern"),
        paragraphs: [tx("tx.u5.ear_concern.body", "Because you checked ear pain or discharge{reasons}, arrange clinic or health-worker care today. This prototype gives no antibiotic, no ear drops, and no diagnosis.", { reasons: earReasons.length ? " with " + earReasons.join(", ") : "" })]
      }) + screenDecisionTraceHtml("child_ear_check", earDecision) });
    } else if (earDecision && earDecision.severity === "home_care") {
      concerns.push({ source: "child_ear_check", result: earDecision, resultScreen: "triage.result.ear_home", html: resultActionCardHtml({
        kind: "home",
        careRoute: "home_watch",
        severity: earDecision.severity,
        screenId: "triage.result.ear_home",
        title: tx("tx.screen_ear.no_urgent_title", "Keep watching"),
        paragraphs: [tx("tx.screen_ear.no_urgent", "No ear danger item selected in this prototype. Keep routine child care visible, and seek care if ear pain, discharge, fever, swelling behind the ear, or a caregiver concern appears. This is not a diagnosis and gives no medicine advice.")],
        extraHtml: homeCareSafetyHtml("")
      }) + screenDecisionTraceHtml("child_ear_check", earDecision) });
    }
    var measlesSelected = [];
    if (inputs.measles_rash) measlesSelected.push("measlesrash");
    if (inputs.measles_cough) measlesSelected.push("measlescough");
    if (inputs.measles_eyes) measlesSelected.push("measleseyes");
    if (inputs.measles_mouth) measlesSelected.push("measlesmouth");
    if (inputs.measles_breathing) measlesSelected.push("measlesbreathing");
    var measlesDecision = inputs.measles_rash || measlesSelected.length ? screenDecision("child_measles_rash_check", measlesSelected) : null;
    if (measlesDecision && measlesDecision.severity === "emergency") {
      concerns.push({ source: "child_measles_rash_check", result: measlesDecision, resultScreen: "triage.result.measles_emergency", html: resultActionCardHtml({
        kind: "refer",
        careRoute: "child_clinic",
        severity: measlesDecision.severity,
        screenId: "triage.result.measles_emergency",
        title: tx("tx.feature_child_measles_rash_check", "Fever and spreading rash concern"),
        paragraphs: [tx("tx.screen_measles.urgent", "Seek urgent care now for eye or mouth complications, breathing trouble, a general danger sign, or a very ill child. Tell the clinic there is fever/rash concern before arrival if possible. This is not a diagnosis and gives no medicine advice.")]
      }) + screenDecisionTraceHtml("child_measles_rash_check", measlesDecision) });
    } else if (measlesDecision) {
      var measlesFollowup = inputs.measles_cough || inputs.measles_eyes
        ? tx("tx.screen_measles.same_day", "Contact a clinic or health worker today for fever with rash plus cough, runny nose, or red watery eyes. If possible, separate the child from others while arranging care and follow local measles/outbreak instructions. This is not a diagnosis and does not decide vaccine status.")
        : tx("tx.screen_measles.rash_only", "Rash concern selected. Contact a clinic or health worker today if fever, cough, runny nose, red eyes, exposure to measles, or caregiver worry is present. Separate the child from others if local health workers advise it. This is not a diagnosis.");
      concerns.push({ source: "child_measles_rash_check", result: measlesDecision, resultScreen: "triage.result.measles_clinic", html: resultActionCardHtml({
        kind: "refer",
        careRoute: "child_clinic",
        severity: measlesDecision.severity,
        screenId: "triage.result.measles_clinic",
        title: tx("tx.feature_child_measles_rash_check", "Fever and spreading rash concern"),
        paragraphs: [measlesFollowup]
      }) + screenDecisionTraceHtml("child_measles_rash_check", measlesDecision) });
    }
    if (inputs.other_problem) {
      concerns.push({
        source: "other_problem",
        result: { severity: "routine_clinic", action: "REFER", classification: "other_child_concern" },
        resultScreen: "triage.result.other_concern",
        html: resultActionCardHtml({
          kind: "refer",
          careRoute: "professional",
          severity: "routine_clinic",
          screenId: "triage.result.other_concern",
          title: tx("tx.u5.other_concern.title", "Other child concern"),
          paragraphs: [friendlyOtherMessage()]
        })
      });
    }
    return concerns;
  }
  function triageResultWhyHtml(r, inputs) {
    var reasons = checkedInputLabels(inputs);
    // The duration is the useful fact in a diarrhoea decision. Showing both "diarrhoea"
    // and "diarrhoea for 11 days" is redundant, so use the more specific version.
    if (String(r.classification || "").indexOf("diarrhoea") >= 0) {
      reasons = reasons.filter(function (reason) { return reason !== "diarrhoea"; });
      if (inputs.diarrhoea_days != null && Number(inputs.diarrhoea_days) > 0) {
        reasons.push(tx("tx.result.diarrhoea_days", "Diarrhoea for {days} days", { days: inputs.diarrhoea_days }));
      }
    }
    if (!reasons.length) return "";
    return '<details class="result-why" data-result-why="true"><summary>' + esc(tx("tx.result.show_why", "Show me why")) + '</summary><p><strong>' + esc(tx("tx.result.your_answers", "What you told us")) + ':</strong> ' + esc(reasons.join(", ")) + ".</p></details>";
  }
  function triageResultHtml(r, inputs, screenId) {
    var isHome = r.action === "HOME_CARE_ORS_ZINC" || r.action === "HOME_CARE_ADVICE";
    var whyHtml = triageResultWhyHtml(r, inputs);
    if (r.classification === "incomplete_assessment") {
      return resultActionCardHtml({
        kind: "refer",
        careRoute: "child_clinic",
        severity: r.severity,
        screenId: screenId,
        title: tx("tx.u5.result.incomplete.title", "Age needed for this check"),
        paragraphs: [tx("tx.u5.result.incomplete.body", "We need the child's age or date of birth to finish this sick-child check. If you cannot enter it, arrange clinic or health-worker assessment. If the child seems very ill or has any danger sign, go urgently.")]
      });
    }
    if (r.classification === "diarrhoea_no_dehydration") {
      return resultActionCardHtml({
        kind: "home",
        careRoute: "home_watch",
        screenId: screenId,
        title: tx("tx.u5.result.diarrhoea_no_dehydration.title", "Diarrhoea home-care check"),
        paragraphs: [tx("tx.u5.result.diarrhoea_no_dehydration.plan", "Give fluids now. Open the ORS and zinc request card, then choose the container you will use to mix ORS. Keep watching for the danger signs below.")],
        nextAction: tx("tx.result.action_home_ors_watch", "Show the ORS and zinc request card, and watch for danger signs."),
        nextButtonId: "openorscard",
        nextButtonLabel: tx("tx.ors.request_card.open_button", "Open ORS request card"),
        extraHtml: homeCareSafetyHtml("diarrhoea") + whyHtml
      });
    }
    if (r.classification === "diarrhoea_some_dehydration") {
      return resultActionCardHtml({
        kind: "refer",
        careRoute: "child_clinic",
        severity: r.severity,
        screenId: screenId,
        title: tx("tx.u5.result.diarrhoea_some_dehydration.title", "Diarrhoea dehydration concern"),
        paragraphs: [tx("tx.u5.result.diarrhoea_some_dehydration.plan", "Plan B is not a diagnosis. In this prototype, diarrhoea plus dehydration concern routes to clinic or CHW assessment for the local care pathway. Do not show the ORS/zinc request card from this finding."), t(r.slug)],
        extraHtml: homeCareSafetyHtml("diarrhoea") + whyHtml
      });
    }
    var kind = r.classification.indexOf("cough") >= 0 ? "cough" : r.classification.indexOf("fever") >= 0 ? "fever" : "";
    var caregiverTitles = {
      very_severe: ["tx.u5.result.title.very_severe", "Go for urgent care now"],
      dysentery: ["tx.u5.result.title.dysentery", "Blood in the stool - clinic care now"],
      pneumonia: ["tx.u5.result.title.pneumonia", "Breathing concern - clinic care now"],
      cough_or_cold: ["tx.u5.result.title.cough_home", "Cough home care"],
      fever_malaria_test_needed: ["tx.u5.result.title.fever_test", "Fever - ask about a malaria test"],
      fever_malaria_positive: ["tx.u5.result.title.fever_positive", "Positive malaria test - clinic care"],
      fever_prolonged: ["tx.u5.result.title.fever_prolonged", "Fever for 7 days or more"],
      fever_persistent_not_improving: ["tx.u5.result.title.fever_not_improving", "Fever is not improving"],
      fever_no_malaria: ["tx.u5.result.title.fever_home", "Fever home care"],
      unclassified: ["tx.u5.result.title.next", "What to do next"]
    };
    var caregiverTitle = caregiverTitles[r.classification] || caregiverTitles.unclassified;
    return resultActionCardHtml({
      kind: isHome ? "home" : "refer",
      careRoute: isHome ? "home_watch" : "child_clinic",
      severity: r.severity,
      screenId: screenId,
      title: tx(caregiverTitle[0], caregiverTitle[1]),
      paragraphs: [t(r.slug)],
      extraHtml: (isHome ? homeCareSafetyHtml(kind) : "") + whyHtml
    });
  }
  function orsSachetVolumeMl() {
    var v = engine.gd && engine.gd.get ? Number(engine.gd.get("diarrhoea.ors.sachetVolumeMl")) : 0;
    return isFinite(v) && v > 0 ? v : 1000;
  }
  function orsMixInstruction(label, volumeMl, slug) {
    var sachetMl = orsSachetVolumeMl();
    var cleanLabel = label || "selected container";
    if (volumeMl === sachetMl) {
      return tx("tx.ors.mix.exact", "Fill the {container} with {sachetMl} mL of clean water. Add one full ORS sachet and stir or shake well. Use it the same day.", { container: cleanLabel, sachetMl: sachetMl });
    }
    if (slug === "tx.ors_soda_bottle_1500") {
      return tx("tx.ors.mix.marked_bottle", "Use this option only if this bottle has a clear {sachetMl} mL mark. Fill exactly to that mark, add one full ORS sachet, and shake. If the line is missing or hard to see, do not guess; choose a correctly marked {sachetMl} mL container or ask a CHW, pharmacy, or clinic.", { sachetMl: sachetMl });
    }
    if (volumeMl > 0 && volumeMl < sachetMl && sachetMl % volumeMl === 0) {
      return tx("tx.ors.mix.measured_repeats", "This container holds {volumeMl} mL. For one full ORS sachet, fill it {fills} times to make {sachetMl} mL of clean water, then add the full sachet and stir. Count carefully; if you cannot measure exactly, ask a CHW, pharmacy, or clinic.", { volumeMl: volumeMl, fills: sachetMl / volumeMl, sachetMl: sachetMl });
    }
    if (volumeMl > 0 && volumeMl < sachetMl) {
      var fullFills = Math.floor(sachetMl / volumeMl);
      var remainder = (sachetMl / volumeMl) - fullFills;
      if (fullFills > 0 && Math.abs(remainder - (1 / 3)) < 0.01) {
        return tx("tx.ors.mix.partial_repeats", "This {container} holds {volumeMl} mL. For one full ORS sachet, fill it {fullFills} full times, then one more time to about {fraction}. That makes about {sachetMl} mL of clean water. Add one full sachet and stir well.", {
          container: cleanLabel,
          volumeMl: volumeMl,
          fullFills: fullFills,
          fraction: tx("tx.ors.mix.one_third_full", "one-third full"),
          sachetMl: sachetMl
        });
      }
    }
    if (volumeMl > 0 && volumeMl < sachetMl) {
      return tx("tx.ors.mix.small_container", "This container holds {volumeMl} mL, but a full ORS sachet is for {sachetMl} mL of clean water. Use it only if local instructions show exactly how much powder to use for this volume; do not guess a fraction of a sachet. Prefer a clearly marked {sachetMl} mL container for one full sachet.", { volumeMl: volumeMl, sachetMl: sachetMl });
    }
    if (volumeMl > sachetMl) {
      return tx("tx.ors.mix.large_container", "This container is larger than the {sachetMl} mL water amount for one full ORS sachet. Do not fill it to the top unless a local health worker or package instruction says so. Use a clear {sachetMl} mL mark or choose a correctly marked container.", { sachetMl: sachetMl });
    }
    return t(slug);
  }
  function requestCardHtml() {
    var orsVisual = renderVisual("ors_slideshow", "ORS sachet added to exactly one liter of clean water in a marked container.", "img.generated.ors_1l_mix_instruction_v2");
    return '<div class="result home request-card" id="orsrequestcard" data-screen-id="support.ors_request_card"><h2>' + esc(tx("tx.ors.request_card.title", "ORS and zinc request card")) + '</h2><div class="inlinevisual">' + orsVisual + '</div><p class="request-instruction">' + esc(tx("tx.ors.request_card.body", "Show this text to a drug seller, pharmacy, clinic, or CHW.")) + '</p><p class="muted public-distribution-note">' + esc(tx("tx.ors.request_card.public_distribution_note", "Depending on the local program, this card may be used alongside\u2014or replaced by\u2014free ORS at a clinic or a call to the local community health worker.")) + '</p><div class="seller-card"><strong>' + esc(tx("tx.ors.request_card.seller_label", "Text for drug seller")) + '</strong>' + esc(t("tx.voucher_ors_zinc")) + '</div><p class="fineprint">' + esc(tx("tx.ors.request_card.fineprint", "This is not a coupon, prescription, diagnosis, or payment voucher. It is a prototype request card to help a caregiver ask for ORS and zinc. It does not ask for antibiotics unless a trained clinician or local guideline says they are needed.")) + '</p>' + orsZincCareGuideHtml() + '<div class="slidecontrols wrap-controls"><button id="openorsdirections" type="button">' + esc(t("tx.feature_ors_slideshow")) + '</button><button class="ghost" id="openzincsupport" type="button">' + esc(t("tx.feature_zinc_tracker")) + '</button></div></div>';
  }
  function bindRequestCardActions() {
    var directions = $("openorsdirections");
    if (directions && !directions.dataset.bound) {
      directions.dataset.bound = "orsdirections";
      directions.addEventListener("click", function () { openLaunch("seq.ors_mixing", t("tx.feature_ors_slideshow")); });
    }
    var zinc = $("openzincsupport");
    if (zinc && !zinc.dataset.bound) {
      zinc.dataset.bound = "zincsupport";
      zinc.addEventListener("click", function () { openLaunch("tool.zinc_tracker", t("tx.feature_zinc_tracker")); });
    }
  }

  $("status").textContent = "Ready - guideline pack " + engine.gd.version + (engine.malariaRegion ? " (malaria area)" : "") + ".";
  $("status").classList.add("status-ready");
  $("status").style.color = "#0b6b5b";
  updateDangerGate();

  $("assess").addEventListener("click", function () {
    var out = $("out");
    var b = function (id) { var e = $("s_" + id); return !!(e && e.checked); };
    if (!dangerAcknowledged()) {
      out.innerHTML = '<div class="result refer"><h2>' + esc(tx("tx.u5.danger_required.title", "Answer danger signs first")) + '</h2><p>' + esc(tx("tx.u5.danger_required.body", "Check any general danger sign that is happening now. If none are happening, check No danger signs before continuing.")) + '</p></div>';
      updateDangerGate();
      applyShellVisibility();
      return;
    }
    var dobValue = $("dob").value || defaultChildDob();
    if (!$("dob").value && dobValue) { $("dob").value = dobValue; updateAgeFromDob(); }
    var ageKnown = !!dobValue, age_mo = 0, age_days_completed = 0;
    try {
      if (ageKnown) {
        var derivedAge = engine.derive({ birth_date: dobValue, now: new Date().toISOString(), temp_entered_value: 0 }, engine.gd);
        age_mo = derivedAge.age_mo;
        age_days_completed = derivedAge.age_days_completed;
      }
    } catch (e) {}
    var diarrhoeaDurationRaw = $("diarrhoeadays") ? String($("diarrhoeadays").value || "") : "";
    var feverDurationRaw = $("feverdays") ? String($("feverdays").value || "") : "";
    var feverDurationKnown = !b("fever") || feverDurationRaw !== "";
    var feverTempRaw = $("fevertempvalue") ? String($("fevertempvalue").value || "") : "";
    var feverTempValue = Number(feverTempRaw);
    var feverTempUnit = $("fevertempunit") ? $("fevertempunit").value : "unknown";
    var feverTempSite = $("fevertempsite") ? $("fevertempsite").value : "unknown";
    var feverTempValid = feverTempRaw !== "" && isFinite(feverTempValue) && feverTempSite === "axillary" && (feverTempUnit === "C" || feverTempUnit === "F");
    var feverTempC = feverTempValid && feverTempUnit === "F"
      ? engine.derive({ birth_date: dobValue || new Date().toISOString(), now: new Date().toISOString(), temp_entered_value: feverTempValue }, engine.gd).temp_c_from_f
      : (feverTempValid ? feverTempValue : 0);
    var inputs = {
      age_mo: age_mo, respiratory_rate: rr == null ? 0 : rr, key_data_missing: !ageKnown,
      age_days_completed: age_days_completed,
      malaria_region: !!engine.malariaRegion,
      diarrhoea_days: diarrhoeaDurationRaw !== "" ? Number(diarrhoeaDurationRaw) || 0 : 0,
      diarrhoea_duration_known: !b("diarrhoea") || diarrhoeaDurationRaw !== "",
      fever_days: feverDurationKnown ? Number(feverDurationRaw) || 0 : 0,
      fever_duration_known: feverDurationKnown,
      fever_not_improving: !!($("fevernotimproving") && $("fevernotimproving").checked),
      rdt_state: $("feverrdt") ? $("feverrdt").value : "not_done",
      temp_c_axillary: feverTempC,
      temp_c_axillary_valid: feverTempValid,
      cough: b("cough"), diarrhoea: b("diarrhoea"), fever: b("fever"), bloody_stool: b("bloody_stool"),
      unable_to_drink: b("unable_to_drink"), vomits_everything: b("vomits_everything"), convulsions: b("convulsions"),
      lethargic_unconscious: b("lethargic_unconscious"), chest_indrawing: b("chest_indrawing") || !!coughChoiceState.s_chest_indrawing, stridor_calm: b("stridor_calm") || !!coughChoiceState.s_stridor_calm,
      sunken_eyes: b("sunken_eyes"), skin_pinch_slow: b("skin_pinch_slow"), restless_irritable: b("restless_irritable"), drinks_eagerly: b("drinks_eagerly"),
      ear_problem: b("ear_problem"), ear_discharge: b("ear_discharge"), ear_swelling_behind: b("ear_swelling_behind"),
      tooth_mouth: b("tooth_mouth"), tooth_severe_pain: b("tooth_severe_pain"), mouth_face_swelling: b("mouth_face_swelling"), mouth_injury_bleeding: b("mouth_injury_bleeding"), mouth_breathing_swallowing: b("mouth_breathing_swallowing"),
      measles_rash: b("measles_rash"), measles_cough: b("measles_cough"), measles_eyes: b("measles_eyes"), measles_mouth: b("measles_mouth"), measles_breathing: b("measles_breathing"),
      other_problem: b("other_problem") || b("cough_chest_unsure") || b("cough_sound_unsure") || !!coughChoiceState.s_cough_chest_unsure || !!coughChoiceState.s_cough_sound_unsure || b("diarrhoea_dehydration_other") ||
        b("fever_other") || b("fever_measurement_other") ||
        b("ear_other") || b("tooth_mouth_other") || b("measles_other")
    };
    var r = engine.triageEval(inputs, engine.gd);
    var presentations = ["cough", "diarrhoea", "fever", "tooth_mouth", "ear_problem", "measles_rash", "other_problem"].filter(function (id) { return inputs[id] === true; });
    var supplemental = childModuleConcerns(inputs);
    var journey = engine.resolveTriageJourney({
      presentations: presentations,
      coreResult: r,
      supplementalResults: supplemental,
      needsRespiratoryRate: inputs.cough && rr == null,
      needsDiarrhoeaDuration: inputs.diarrhoea && diarrhoeaDurationRaw === ""
    });
    var html = "";
    if (journey.primary.source === "core") {
      html = triageResultHtml(r, inputs, journey.resultScreen);
    } else if (journey.primary.source === "measure_breathing") {
      html = resultActionCardHtml({
        kind: "refer",
        careRoute: "child_clinic",
        severity: "ask_more",
        screenId: journey.resultScreen,
        title: tx("tx.u5.measure_breathing.title", "Measure breathing first"),
        paragraphs: [tx("tx.u5.measure_breathing.body", "There is cough, so count the breathing rate (Start 60-second count), then Assess again.")],
        nextAction: tx("tx.result.action_measure_breathing", "Use Start 60-second count, then show the result."),
        nextButtonId: "triagereassess",
        nextButtonLabel: tx("tx.clinical_screen.under5.action", "Assess")
      });
    } else if (journey.primary.source === "diarrhoea_duration") {
      html = resultActionCardHtml({
        kind: "refer",
        careRoute: "professional",
        severity: "ask_more",
        screenId: journey.resultScreen,
        title: tx("tx.u5.diarrhoea_duration_required.title", "Tell us how long the diarrhoea has lasted"),
        paragraphs: [tx("tx.u5.diarrhoea_duration_required.body", "Enter the number of days the child has had loose or watery stools, then assess again. If you are not sure, contact a clinic or health worker.")]
      });
    } else {
      html = journey.primary.html || "";
    }
    var preds = Object.entries(r.predicates).filter(function (kv) { return kv[1]; }).map(function (kv) { return "p." + kv[0]; }).join(", ") || "(none true)";
    html += traceDetails("Prototype rule trace", "severity: " + r.severity + "   rule: " + r.firedRuleId + "   matched: " + r.matchedRules.join(",") + "\naction: " + r.action + "   pack: " + r.guidelineVersion + "\npredicates true: " + preds);
    showResolvedUnder5Result(html, journey.primary.source === "measure_breathing");
  });
}
