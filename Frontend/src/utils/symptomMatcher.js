const SPECIALITY_CONFIG = [
  {
    speciality: "General physician",
    keywords: [
      "fever",
      "cold",
      "cough",
      "body pain",
      "fatigue",
      "infection",
      "flu",
      "weakness",
      "headache",
      "dizziness",
      "sore throat",
      "blood pressure",
    ],
    reasons: [
      "best for common illnesses, fever, weakness, and first medical evaluation",
      "helps when symptoms are broad and you need the right starting point",
    ],
    nextStep: "Book a primary consultation for first-line diagnosis and referral if needed.",
  },
  {
    speciality: "Gynecologist",
    keywords: [
      "period",
      "pregnancy",
      "pcos",
      "pelvic pain",
      "vaginal",
      "menstrual",
      "fertility",
      "uterus",
      "ovary",
      "breast pain",
      "pregnant",
    ],
    reasons: [
      "suited for menstrual health, pelvic concerns, pregnancy, and reproductive care",
      "recommended when symptoms are linked to hormonal or reproductive health",
    ],
    nextStep: "Choose an in-person visit if the symptoms are new, painful, or recurring.",
  },
  {
    speciality: "Dermatologist",
    keywords: [
      "skin",
      "rash",
      "itching",
      "itchy",
      "acne",
      "eczema",
      "psoriasis",
      "allergy",
      "hair fall",
      "pigmentation",
      "fungal",
      "pimple",
    ],
    reasons: [
      "recommended for skin, scalp, and visible allergy-related issues",
      "useful when the main concern is rash, acne, itching, or hair loss",
    ],
    nextStep: "Upload clear photos later in the flow if you want faster dermatologist context.",
  },
  {
    speciality: "Pediatricians",
    keywords: [
      "child",
      "baby",
      "kid",
      "infant",
      "newborn",
      "toddler",
      "vaccination",
      "teething",
      "child fever",
    ],
    reasons: [
      "best for infants, children, and age-specific medical needs",
      "ideal when the patient is a child and symptoms need pediatric assessment",
    ],
    nextStep: "Book with a pediatrician if the concern is for a child under 16.",
  },
  {
    speciality: "Neurologist",
    keywords: [
      "migraine",
      "seizure",
      "numbness",
      "tingling",
      "memory",
      "vertigo",
      "tremor",
      "nerve",
      "paralysis",
      "blackout",
    ],
    reasons: [
      "recommended for persistent headaches, nerve symptoms, or neurological concerns",
      "appropriate when symptoms involve sensation, balance, or seizure-like events",
    ],
    nextStep: "Choose this when symptoms are recurring or clearly nerve-related.",
  },
  {
    speciality: "Gastroenterologist",
    keywords: [
      "stomach",
      "abdomen",
      "gastric",
      "acidity",
      "vomiting",
      "nausea",
      "constipation",
      "diarrhea",
      "bloating",
      "indigestion",
      "ulcer",
      "liver",
    ],
    reasons: [
      "best fit for digestive, abdominal, and gut-related symptoms",
      "recommended when the issue centers on pain, acidity, bowel changes, or nausea",
    ],
    nextStep: "Pick this if the symptoms are mainly digestive or keep returning after meals.",
  },
];

const URGENT_KEYWORDS = [
  "chest pain",
  "shortness of breath",
  "breathing trouble",
  "unconscious",
  "stroke",
  "seizure",
  "fainted",
  "fainting",
  "heavy bleeding",
  "pregnancy bleeding",
  "severe pain",
];

const SOON_KEYWORDS = [
  "fever",
  "vomiting",
  "rash",
  "dizziness",
  "migraine",
  "pelvic pain",
  "abdominal pain",
  "numbness",
];

const normalize = (value = "") => value.toLowerCase().replace(/\s+/g, " ").trim();

export const analyzeSymptoms = (input = "") => {
  const normalizedInput = normalize(input);

  if (!normalizedInput) {
    return null;
  }

  const scoredMatches = SPECIALITY_CONFIG.map((item) => {
    const matchedKeywords = item.keywords.filter((keyword) =>
      normalizedInput.includes(keyword)
    );

    return {
      ...item,
      score: matchedKeywords.length,
      matchedKeywords,
    };
  }).sort((a, b) => b.score - a.score);

  const fallbackConfig = SPECIALITY_CONFIG.find(
    (item) => item.speciality === "General physician"
  );
  const fallback = {
    ...fallbackConfig,
    score: 0,
    matchedKeywords: [],
  };

  const bestMatch = scoredMatches[0]?.score > 0 ? scoredMatches[0] : fallback;
  const alternatives = scoredMatches
    .filter(
      (item) =>
        item.speciality !== bestMatch.speciality &&
        item.score > 0 &&
        item.score >= Math.max(bestMatch.score - 1, 1)
    )
    .slice(0, 2);

  let urgency = "Routine";
  let urgencyMessage =
    "Symptoms look suitable for a standard appointment based on the text provided.";

  if (URGENT_KEYWORDS.some((keyword) => normalizedInput.includes(keyword))) {
    urgency = "Priority";
    urgencyMessage =
      "Some symptoms may need urgent medical attention. If the condition feels severe or worsening, seek immediate care.";
  } else if (SOON_KEYWORDS.some((keyword) => normalizedInput.includes(keyword))) {
    urgency = "Soon";
    urgencyMessage =
      "A consultation soon would be a good idea so the issue can be assessed before it worsens.";
  }

  return {
    input: input.trim(),
    speciality: bestMatch.speciality,
    matchedKeywords: bestMatch.matchedKeywords || [],
    reasons: bestMatch.reasons,
    alternatives,
    urgency,
    urgencyMessage,
    nextStep: bestMatch.nextStep,
  };
};

export const symptomPrompts = [
  "Fever, body pain, and weakness",
  "Skin rash with itching",
  "Missed period and pelvic pain",
  "Child has cough and fever",
  "Acidity and stomach bloating",
  "Migraine and numbness in hand",
];
