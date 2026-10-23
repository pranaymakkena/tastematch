// ── Core entity types ────────────────────────────────────────────────────────

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  affinity?: number;
  imageUrl?: string;
  description?: string;
}

export type EntityType =
  | "movie"
  | "tv_show"
  | "artist"
  | "place"
  | "brand"
  | "destination"
  | "book"
  | "podcast"
  | "person"
  | "video_game"
  | "unknown";

export const QLOO_ENTITY_TYPES: Record<EntityType, string> = {
  movie: "urn:entity:movie",
  tv_show: "urn:entity:tv_show",
  artist: "urn:entity:artist",
  place: "urn:entity:place",
  brand: "urn:entity:brand",
  destination: "urn:entity:destination",
  book: "urn:entity:book",
  podcast: "urn:entity:podcast",
  person: "urn:entity:person",
  video_game: "urn:entity:video_game",
  unknown: "urn:entity:place",
};

// ── Person profile ────────────────────────────────────────────────────────────

export interface PersonProfile {
  name: string;
  ageRange?: string;
  location?: string;
  rawInput: string;
  entities: ExtractedEntity[];
}

export interface ExtractedEntity {
  id: string; // temporary local ID
  text: string; // original text from user
  category: "film" | "music" | "food" | "fashion" | "travel" | "hobby" | "other";
  qlooEntityId?: string; // resolved Qloo entity ID
  qlooEntityType?: string; // resolved Qloo entity type URN
  qlooEntityName?: string; // canonical Qloo name
  affinity?: number;
}

// ── Qloo API types ────────────────────────────────────────────────────────────

export interface QlooSearchResult {
  entity_id: string;
  name: string;
  type: string;
  score?: number;
  images?: { url: string }[];
  description?: string;
}

export interface QlooInsightEntity {
  entity_id: string;
  name: string;
  type: string;
  affinity: number;       // mapped from entity.query.affinity
  popularity?: number;
  images?: { url: string }[];
  tags?: QlooTag[];
}

export interface QlooTag {
  tag_id: string;
  name: string;
  type?: string;
}

export interface QlooInsightsResponse {
  results?: {
    entities?: Array<{
      entity_id?: string;
      name?: string;
      type?: string;
      subtype?: string;
      popularity?: number;
      tags?: QlooTag[];
      images?: { url: string }[];
      query?: {
        affinity?: number;
        [key: string]: unknown;
      };
      [key: string]: unknown;
    }>;
  };
  tags?: QlooTag[];
}

// ── Agent state & pipeline ────────────────────────────────────────────────────

export interface AgentState {
  personA: PersonProfile;
  personB: PersonProfile;
  location: string;
  budget: string;
  goal: string;
  // Qloo-resolved data
  qlooEntitiesA: QlooInsightEntity[];
  qlooEntitiesB: QlooInsightEntity[];
  qlooTagsA: QlooTag[];
  qlooTagsB: QlooTag[];
  sharedTags: QlooTag[];
  bridgeEntities: QlooInsightEntity[];
  // Final output
  result?: MatchResult;
}

// ── Match result ──────────────────────────────────────────────────────────────

export interface MatchResult {
  culturalBridge: CulturalBridge;
  unexpectedMatch: UnexpectedMatch;
  sharedPlan: PlanItem[];
  whyItWorks: string;
  qlooDiscovered: DiscoveredEntity[];
  matchScore: MatchScore;
  reasoning: ReasoningChain;
}

export interface CulturalBridge {
  themes: string[];
  description: string;
  personAConnections: string[];
  personBConnections: string[];
}

export interface UnexpectedMatch {
  title: string;
  category: string;
  description: string;
  whyUnexpected: string;
  qlooEvidence: string;
}

export interface PlanItem {
  time: string;
  title: string;
  description: string;
  type: "activity" | "food" | "entertainment" | "experience";
}

export interface DiscoveredEntity {
  name: string;
  type: string;
  affinity: number;
  relevance: string;
}

export interface MatchScore {
  overall: number;
  dimensions: {
    label: string;
    score: number;
    basis: string;
  }[];
  caveat: string;
}

export interface ReasoningChain {
  personAProfile: string;
  personBProfile: string;
  qlooInsights: string;
  bridgeLogic: string;
  finalSelection: string;
}

// ── Request / response for API routes ────────────────────────────────────────

export interface AnalyzeRequest {
  personA: PersonProfile;
  personB: PersonProfile;
  location: string;
  budget: string;
  goal: string;
}

export interface AnalyzeResponse {
  success: boolean;
  result?: MatchResult;
  error?: string;
  qlooAvailable: boolean;
}

export interface SearchRequest {
  query: string;
  type?: string;
}

export interface SearchResponse {
  success: boolean;
  results?: QlooSearchResult[];
  error?: string;
}

// ── Demo profiles ─────────────────────────────────────────────────────────────

export interface DemoProfile {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  personA: {
    name: string;
    ageRange: string;
    rawInput: string;
  };
  personB: {
    name: string;
    ageRange: string;
    rawInput: string;
  };
  location: string;
  goal: string;
}
