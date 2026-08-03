// GENERATED FILE — DO NOT EDIT.  Plain-JS twin (browser use).  hitPolicy: collect_then_resolve
function req(gd, path) { const v = gd.get(path); if (typeof v !== "number") throw new Error("rules: missing guideline '" + path + "' (pack " + gd.version + ")"); return v; }
export function evaluate(i, gd) {
  const p_age_out_of_scope = ((i.age_mo < 2) || (i.age_mo >= 60));
  const p_fast_breathing = (((i.age_mo >= 2) && (i.age_mo < 12) && (i.respiratory_rate >= req(gd, "ari.fastBreathing.age2to11moBpm"))) || ((i.age_mo >= 12) && (i.age_mo < 60) && (i.respiratory_rate >= req(gd, "ari.fastBreathing.age12to59moBpm"))));
  const p_any_general_danger_sign = ((i.unable_to_drink === true) || (i.vomits_everything === true) || (i.convulsions === true) || (i.lethargic_unconscious === true));
  const p_severe_dehydration = (([(i.lethargic_unconscious === true), (i.sunken_eyes === true), (i.skin_pinch_slow === true), (i.unable_to_drink === true)].filter(Boolean).length) >= 2);
  const p_some_dehydration = ((!p_severe_dehydration) && (([(i.restless_irritable === true), (i.sunken_eyes === true), (i.drinks_eagerly === true), (i.skin_pinch_slow === true)].filter(Boolean).length) >= 2));
  const p_pneumonia_signs = ((i.cough === true) && p_fast_breathing);
  const p_severe_respiratory = ((i.chest_indrawing === true) || (i.stridor_calm === true));
  const p_measured_fever_axillary = ((i.temp_c_axillary_valid === true) && (i.temp_c_axillary >= req(gd, "fever.entry_min_C_axillary")));
  const p_fever_present = ((i.fever === true) || p_measured_fever_axillary);
  const p_young_infant_0_59d_or_age_unknown = ((i.key_data_missing === true) || (i.age_days_completed <= req(gd, "young_infant.max_age_days_completed")));
  const p_fever_prolonged = ((i.fever_duration_known === true) && (i.fever_days >= req(gd, "fever.prolonged_min_days")));
  const p_fever_persistent_not_improving = ((i.fever_duration_known === true) && (i.fever_days >= req(gd, "fever.persistent_no_improvement_min_days")) && (i.fever_not_improving === true));
  const p_rdt_missing_invalid_or_unknown = ((i.rdt_state === "not_done") || (i.rdt_state === "invalid") || (i.rdt_state === "unknown"));
  const predicates = {
    age_out_of_scope: p_age_out_of_scope,
    fast_breathing: p_fast_breathing,
    any_general_danger_sign: p_any_general_danger_sign,
    severe_dehydration: p_severe_dehydration,
    some_dehydration: p_some_dehydration,
    pneumonia_signs: p_pneumonia_signs,
    severe_respiratory: p_severe_respiratory,
    measured_fever_axillary: p_measured_fever_axillary,
    fever_present: p_fever_present,
    young_infant_0_59d_or_age_unknown: p_young_infant_0_59d_or_age_unknown,
    fever_prolonged: p_fever_prolonged,
    fever_persistent_not_improving: p_fever_persistent_not_improving,
    rdt_missing_invalid_or_unknown: p_rdt_missing_invalid_or_unknown,
  };
  const matches = [];
  if ((p_any_general_danger_sign || p_severe_dehydration || p_severe_respiratory)) matches.push({ i: 0, id: "R1_urgent", then: { classification: "very_severe", recommendation: "Refer urgently to hospital", action: "REFER_URGENT", slug: "tx.refer_urgent", severity: "emergency" } });
  if ((p_fever_present && p_young_infant_0_59d_or_age_unknown)) matches.push({ i: 1, id: "R1a_young_infant_possible_fever", then: { classification: "young_infant_possible_fever", recommendation: "A baby age 0-59 completed days who may have fever needs urgent care now. Do not wait for a thermometer or malaria test.", action: "REFER_URGENT", slug: "tx.refer_young_infant_fever", severity: "urgent_clinic" } });
  if ((i.key_data_missing === true)) matches.push({ i: 2, id: "R1b_missing_key_data", then: { classification: "incomplete_assessment", recommendation: "Key data unavailable; refer to clinic for assessment", action: "REFER", slug: "tx.refer_incomplete", severity: "routine_clinic" } });
  if (p_age_out_of_scope) matches.push({ i: 3, id: "R1c_age_out_of_scope", then: { classification: "outside_under5_sick_child_scope", recommendation: "This prototype sick-child table is only for children age 2-59 months. Use newborn, young-infant, or older-child local care pathway.", action: "REFER", slug: "tx.refer_age_out_of_scope", severity: "routine_clinic" } });
  if ((p_fever_present && (i.fever_duration_known === false))) matches.push({ i: 4, id: "R1d_fever_missing_key_data", then: { classification: "fever_incomplete_assessment", recommendation: "An important fever answer is missing or unclear; contact a clinic or health worker today.", action: "REFER", slug: "tx.refer_fever_incomplete", severity: "routine_clinic" } });
  if (((i.diarrhoea === true) && (i.bloody_stool === true))) matches.push({ i: 5, id: "R2_dysentery", then: { classification: "dysentery", recommendation: "Refer; dysentery needs clinician (antibiotics may be indicated)", action: "REFER", slug: "tx.refer_dysentery", severity: "urgent_clinic" } });
  if (p_pneumonia_signs) matches.push({ i: 6, id: "R3_pneumonia", then: { classification: "pneumonia", recommendation: "Refer/assess at clinic for pneumonia management", action: "REFER", slug: "tx.refer_pneumonia", severity: "urgent_clinic" } });
  if (((i.diarrhoea === true) && p_some_dehydration)) matches.push({ i: 7, id: "R4_diarrhoea_some_dehydration", then: { classification: "diarrhoea_some_dehydration", recommendation: "Diarrhoea with dehydration concern: explain checked signs and route to clinic/CHW for local Plan B pathway. ORS may be offered if the child can drink, but this prototype does not issue a voucher for dehydration concern.", action: "REFER", slug: "tx.clinical_referral_required", severity: "routine_clinic" } });
  if ((i.diarrhoea === true)) matches.push({ i: 8, id: "R5_diarrhoea_no_dehydration", then: { classification: "diarrhoea_no_dehydration", recommendation: "Simple watery diarrhoea: explain Plan A antecedents, show ORS/zinc request card for drug seller/pharmacy/CHW, watch for danger signs, and tell caregiver to go to clinic if still concerned, worse, blood in stool, poor drinking, vomiting everything, fever, dehydration signs, or not improving after 2 days.", action: "HOME_CARE_ORS_ZINC", slug: "tx.home_care_ors", severity: "home_care" } });
  if (((i.cough === true) && (!p_fast_breathing))) matches.push({ i: 9, id: "R6_cough_no_fast_breathing", then: { classification: "cough_or_cold", recommendation: "Home care; go to clinic if still concerned, breathing becomes fast or difficult, chest pulls in, child cannot drink, fever appears or persists, cough is not improving, or any danger sign appears", action: "HOME_CARE_ADVICE", slug: "tx.home_care_cough", severity: "home_care" } });
  if ((p_fever_present && (i.malaria_region === true) && p_rdt_missing_invalid_or_unknown)) matches.push({ i: 10, id: "R7_fever_malaria_test_needed", then: { classification: "fever_malaria_test_needed", recommendation: "Where malaria testing applies, ask a clinic or health worker for a current test. Do not delay urgent care and do not choose a medicine from this prototype.", action: "REFER", slug: "tx.refer_fever_malaria_test", severity: "routine_clinic" } });
  if ((p_fever_present && (i.malaria_region === true) && (i.rdt_state === "positive"))) matches.push({ i: 11, id: "R7b_fever_malaria_positive", then: { classification: "fever_malaria_positive", recommendation: "A positive malaria test needs same-day review under the approved local protocol. This prototype does not choose a medicine.", action: "REFER", slug: "tx.refer_fever_malaria_positive", severity: "routine_clinic" } });
  if ((p_fever_present && p_fever_prolonged)) matches.push({ i: 12, id: "R8_fever_prolonged", then: { classification: "fever_prolonged", recommendation: "Fever for 7 days or more; refer for assessment", action: "REFER", slug: "tx.refer_fever_prolonged", severity: "routine_clinic" } });
  if ((p_fever_present && p_fever_persistent_not_improving)) matches.push({ i: 13, id: "R8b_fever_persistent_not_improving", then: { classification: "fever_persistent_not_improving", recommendation: "The fever is continuing without improvement; contact a clinic or health worker today.", action: "REFER", slug: "tx.refer_fever_persistent", severity: "routine_clinic" } });
  if ((p_fever_present && (i.age_days_completed > req(gd, "young_infant.max_age_days_completed")) && (i.fever_duration_known === true) && (!p_fever_prolonged) && (!p_fever_persistent_not_improving) && ((i.malaria_region === false) || (i.rdt_state === "negative")))) matches.push({ i: 14, id: "R9_fever_home", then: { classification: "fever_no_malaria", recommendation: "Care at home and watch closely only when every important answer is reassuring. Offer fluids; seek care if the child worsens, is not improving, develops a danger sign, or the caregiver remains worried.", action: "HOME_CARE_ADVICE", slug: "tx.home_care_fever", severity: "home_care" } });
  const RANK = {"emergency":0,"urgent_clinic":1,"routine_clinic":2,"ask_more":3,"home_care":4,"followup":5};
  if (matches.length) {
    matches.sort((a, b) => (RANK[a.then.severity] - RANK[b.then.severity]) || (a.i - b.i));
    const w = matches[0];
    return { ...(w.then), firedRuleId: w.id, matchedRules: matches.map((m) => m.id), predicates, guidelineVersion: gd.version };
  }
  return { classification: "unclassified", recommendation: "Reassess / CHW follow-up", action: "FOLLOWUP", slug: "tx.followup", severity: "followup", firedRuleId: "__default__", matchedRules: [], predicates, guidelineVersion: gd.version };
}
