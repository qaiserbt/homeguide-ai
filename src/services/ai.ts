import type { Property, Room } from "../types/property";
import { formatCurrency, formatNumber } from "../utils/format";

/**
 * AI service seam. Every function here runs on local property data today.
 * To connect a real model later (OpenAI, etc.), replace the function
 * bodies with API calls — keep the signatures the same so no caller needs
 * to change. NEVER put an API key in this file; call a backend endpoint
 * that holds the key server-side instead.
 */

const UNKNOWN_ANSWER =
  "I don't have that information for this property yet. You can contact the listing agent for confirmation.";

interface QAMatcher {
  test: (q: string) => boolean;
  answer: (property: Property) => string;
}

const matchers: QAMatcher[] = [
  {
    test: (q) => /basement/.test(q) && /(separate|private|own) entrance/.test(q),
    answer: (p) =>
      p.basement
        ? p.basement.separateEntrance
          ? "Yes! This home has a separate entrance to the basement" +
            (p.basement.description ? ` — ${lowerFirst(p.basement.description)}` : ".")
          : "This basement does not have a separate entrance."
        : UNKNOWN_ANSWER,
  },
  {
    test: (q) => /basement/.test(q) && /(finish|complet)/.test(q),
    answer: (p) =>
      p.basement
        ? p.basement.finished
          ? `Yes, this home has a finished basement.${p.basement.description ? ` ${p.basement.description}` : ""}`
          : "This home's basement is unfinished."
        : UNKNOWN_ANSWER,
  },
  {
    test: (q) => /basement/.test(q),
    answer: (p) =>
      p.basement
        ? `${p.basement.finished ? "This home has a finished basement" : "This home has a basement"}${
            p.basement.separateEntrance ? " with a separate entrance" : ""
          }.${p.basement.description ? ` ${p.basement.description}` : ""}`
        : UNKNOWN_ANSWER,
  },
  {
    test: (q) => /bedroom/.test(q),
    answer: (p) => `This home has ${p.bedrooms} bedrooms.`,
  },
  {
    test: (q) => /bathroom|washroom/.test(q),
    answer: (p) => `This home has ${p.bathrooms} bathrooms.`,
  },
  {
    test: (q) => /(square feet|sq\.?\s?ft|size of the home|how big)/.test(q),
    answer: (p) => `This home is approximately ${formatNumber(p.squareFeet)} square feet.`,
  },
  {
    test: (q) => /(pool)/.test(q),
    answer: () =>
      "I don't have information confirming a pool for this property. " +
      "You can contact the listing agent for confirmation.",
  },
  {
    test: (q) => /backyard|yard|outdoor space/.test(q),
    answer: (p) => {
      const backyard = p.rooms.find((r) => r.type === "backyard");
      return backyard ? backyard.description : UNKNOWN_ANSWER;
    },
  },
  {
    test: (q) => /school/.test(q),
    answer: (p) =>
      p.schools.length > 0
        ? `Nearby schools include: ${p.schools.map((s) => `${s.name} (${s.type})`).join(", ")}.`
        : UNKNOWN_ANSWER,
  },
  {
    test: (q) => /(monthly|property) tax/.test(q),
    answer: (p) =>
      p.taxes
        ? `Property taxes for ${p.taxes.year} were ${formatCurrency(p.taxes.amount)} annually — approximately ${formatCurrency(
            Math.round(p.taxes.amount / 12)
          )} per month.`
        : UNKNOWN_ANSWER,
  },
  {
    test: (q) => /condo fee|maintenance fee/.test(q),
    answer: (p) =>
      p.condoFees
        ? `Condo fees are ${formatCurrency(p.condoFees)} per month.`
        : "This property does not have condo fees.",
  },
  {
    test: (q) => /(parking|garage)/.test(q),
    answer: (p) =>
      p.parking
        ? `Parking: ${p.parking.type}, ${p.parking.spaces} space${p.parking.spaces === 1 ? "" : "s"}.${
            p.parking.description ? ` ${p.parking.description}` : ""
          }`
        : UNKNOWN_ANSWER,
  },
  {
    test: (q) => /(lot size|frontage|depth)/.test(q),
    answer: (p) =>
      p.lot
        ? [p.lot.frontage && `Frontage: ${p.lot.frontage}`, p.lot.depth && `Depth: ${p.lot.depth}`, p.lot.description]
            .filter(Boolean)
            .join(". ") || UNKNOWN_ANSWER
        : UNKNOWN_ANSWER,
  },
  {
    test: (q) => /(price|cost|asking|list(ed)? for)/.test(q),
    answer: (p) => `This property is listed at ${formatCurrency(p.price)}.`,
  },
  {
    test: (q) => /(kitchen)/.test(q),
    answer: (p) => describeRoomType(p, "kitchen"),
  },
  {
    test: (q) => /(primary|master) (bedroom|suite)/.test(q),
    answer: (p) => describeRoomType(p, "primary-bedroom"),
  },
  {
    test: (q) => /(neighbourhood|neighborhood|amenities|nearby|shopping|transit)/.test(q),
    answer: (p) =>
      p.amenities.length > 0
        ? `Nearby amenities include: ${p.amenities.map((a) => a.name).join(", ")}.`
        : UNKNOWN_ANSWER,
  },
  {
    test: (q) => /(agent|realtor|contact|showing)/.test(q),
    answer: (p) =>
      `${p.agent.name}, ${p.agent.title} at ${p.agent.brokerage}, can help — call or text ${p.agent.phone}, or email ${p.agent.email}.`,
  },
  {
    test: (q) => /(how many rooms|what rooms|room list)/.test(q),
    answer: (p) => `This tour includes: ${p.rooms.map((r) => r.name).join(", ")}.`,
  },
];

function describeRoomType(property: Property, type: Room["type"]): string {
  const room = property.rooms.find((r) => r.type === type);
  if (!room) return UNKNOWN_ANSWER;
  const featureList = room.features.map((f) => f.title).join(", ");
  return `${room.description}${featureList ? ` Features include: ${featureList}.` : ""}`;
}

function lowerFirst(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

/**
 * Answers a visitor's question using ONLY facts present in `property`.
 * Replace this body with a call to an LLM (constrained to the same
 * property JSON as context, with the same "don't know" fallback) when
 * ready — the function signature stays identical for callers.
 */
export function answerPropertyQuestion(property: Property, question: string): string {
  const q = question.toLowerCase().trim();
  if (!q) return UNKNOWN_ANSWER;
  const match = matchers.find((m) => m.test(q));
  return match ? match.answer(property) : UNKNOWN_ANSWER;
}

/**
 * Builds a template narration script from a room's name and feature list.
 * Used by the admin Room Builder's "Generate Narration" button. Replace
 * with an LLM call later for more natural, varied phrasing.
 */
export function generateRoomNarration(room: Pick<Room, "name" | "features" | "description">): string {
  const titles = room.features.map((f) => f.title.toLowerCase());
  const intro = `Welcome to the ${room.name.toLowerCase()}.`;

  if (titles.length === 0) return `${intro} ${room.description}`.trim();
  if (titles.length === 1) return `${intro} You'll notice the ${titles[0]} — a real highlight of this space.`;

  const [highlight, ...remaining] = titles;
  const remainingList =
    remaining.length > 1
      ? `${remaining.slice(0, -1).join(", ")} and ${remaining[remaining.length - 1]}`
      : remaining[0];

  return `${intro} You'll notice the ${highlight}, providing a real highlight here. This space also features ${remainingList}.`;
}
