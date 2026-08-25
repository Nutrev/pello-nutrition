// lib/knowledge-graph.ts
// Pello Knowledge Graph — nodes and edges for the nutrition intelligence network

export type NodeType = "product" | "ingredient" | "brand" | "goal" | "study" | "category";

export interface GraphNode {
  id: string;
  type: NodeType;
  label: string;
  sublabel?: string;
  weight?: number;      // for sizing nodes
  color?: string;
  data?: Record<string, any>;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: string;
  label?: string;
  strength?: number;   // 0-1, affects edge thickness
}

export interface KnowledgeGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// ── NODE COLORS ───────────────────────────────────────────────

export const NODE_COLORS: Record<NodeType, string> = {
  product: "#2D4A2D",
  ingredient: "#C8860A",
  brand: "#185FA5",
  goal: "#7A9E7A",
  study: "#534AB7",
  category: "#B84C2E",
};

// ── CORE GRAPH DATA ───────────────────────────────────────────

export const GRAPH_NODES: GraphNode[] = [
  // Goals
  { id: "goal-endurance", type: "goal", label: "Endurance", weight: 10 },
  { id: "goal-recovery", type: "goal", label: "Recovery", weight: 9 },
  { id: "goal-muscle", type: "goal", label: "Muscle", weight: 8 },
  { id: "goal-health", type: "goal", label: "Health", weight: 7 },
  { id: "goal-sleep", type: "goal", label: "Sleep", weight: 6 },
  { id: "goal-gut", type: "goal", label: "Gut health", weight: 5 },
  { id: "goal-immunity", type: "goal", label: "Immunity", weight: 5 },

  // Key ingredients
  { id: "ing-caffeine", type: "ingredient", label: "Caffeine", sublabel: "Proven ergogenic", weight: 9 },
  { id: "ing-creatine", type: "ingredient", label: "Creatine", sublabel: "Most researched", weight: 10 },
  { id: "ing-maltodextrin", type: "ingredient", label: "Maltodextrin", sublabel: "Primary carb fuel", weight: 8 },
  { id: "ing-fructose", type: "ingredient", label: "Fructose", sublabel: "Dual transporter", weight: 7 },
  { id: "ing-sodium", type: "ingredient", label: "Sodium", sublabel: "Key electrolyte", weight: 9 },
  { id: "ing-beetroot", type: "ingredient", label: "Beetroot Nitrate", sublabel: "Vasodilation", weight: 7 },
  { id: "ing-tart-cherry", type: "ingredient", label: "Tart Cherry", sublabel: "Anti-inflammatory", weight: 7 },
  { id: "ing-magnesium", type: "ingredient", label: "Magnesium", sublabel: "300+ reactions", weight: 8 },
  { id: "ing-whey", type: "ingredient", label: "Whey Protein", sublabel: "Fast absorbing", weight: 8 },
  { id: "ing-omega3", type: "ingredient", label: "Omega-3 EPA/DHA", sublabel: "Anti-inflammatory", weight: 7 },
  { id: "ing-iron", type: "ingredient", label: "Iron", sublabel: "O2 transport", weight: 7 },
  { id: "ing-vitd", type: "ingredient", label: "Vitamin D3", sublabel: "Immune + bone", weight: 6 },
  { id: "ing-beta-alanine", type: "ingredient", label: "Beta-Alanine", sublabel: "Lactate buffer", weight: 6 },
  { id: "ing-bicarb", type: "ingredient", label: "Sodium Bicarbonate", sublabel: "Acid buffer", weight: 6 },
  { id: "ing-probiotics", type: "ingredient", label: "Probiotics", sublabel: "Gut microbiome", weight: 6 },
  { id: "ing-glutamine", type: "ingredient", label: "L-Glutamine", sublabel: "Gut integrity", weight: 5 },
  { id: "ing-ashwagandha", type: "ingredient", label: "Ashwagandha", sublabel: "Cortisol reduction", weight: 5 },
  { id: "ing-collagen", type: "ingredient", label: "Collagen", sublabel: "Connective tissue", weight: 5 },
  { id: "ing-hydrogel", type: "ingredient", label: "Hydrogel System", sublabel: "Maurten tech", weight: 6 },

  // Brands
  { id: "brand-maurten", type: "brand", label: "Maurten", weight: 9 },
  { id: "brand-sis", type: "brand", label: "Science in Sport", weight: 8 },
  { id: "brand-precision", type: "brand", label: "Precision Fuel", weight: 8 },
  { id: "brand-thorne", type: "brand", label: "Thorne", weight: 9 },
  { id: "brand-momentous", type: "brand", label: "Momentous", weight: 8 },
  { id: "brand-skratch", type: "brand", label: "Skratch Labs", weight: 7 },
  { id: "brand-swissrx", type: "brand", label: "SwissRX", weight: 7 },
  { id: "brand-gu", type: "brand", label: "GU Energy", weight: 7 },
  { id: "brand-amacx", type: "brand", label: "Amacx", weight: 6 },

  // Key products
  { id: "prod-maurten-gel", type: "product", label: "Maurten Gel 100", sublabel: "$3.17/gel", weight: 8 },
  { id: "prod-sis-beta-fuel", type: "product", label: "SiS Beta Fuel Gel", sublabel: "$2.80/gel", weight: 7 },
  { id: "prod-thorne-creatine", type: "product", label: "Thorne Creatine", sublabel: "$0.42/serving", weight: 8 },
  { id: "prod-momentous-whey", type: "product", label: "Momentous Whey", sublabel: "$2.60/serving", weight: 7 },
  { id: "prod-pillar-mag", type: "product", label: "PILLAR Triple Mg", sublabel: "$1.40/serving", weight: 7 },
  { id: "prod-lmnt", type: "product", label: "LMNT Electrolytes", sublabel: "$1.33/serving", weight: 7 },
  { id: "prod-nordic-omega3", type: "product", label: "Nordic Naturals Omega-3", sublabel: "$1.17/serving", weight: 6 },

  // Studies (key ones)
  { id: "study-caffeine-endo", type: "study", label: "Caffeine & Endurance", sublabel: "500+ studies", weight: 8 },
  { id: "study-creatine-atp", type: "study", label: "Creatine & ATP", sublabel: "1000+ studies", weight: 9 },
  { id: "study-nitrate-vo2", type: "study", label: "Nitrate & VO2 max", sublabel: "Jones et al.", weight: 7 },
  { id: "study-cherry-doms", type: "study", label: "Cherry & DOMS", sublabel: "Howatson 2010", weight: 6 },
  { id: "study-iron-vo2", type: "study", label: "Iron & VO2 max", sublabel: "Multiple RCTs", weight: 7 },
  { id: "study-dual-carb", type: "study", label: "Dual Carb Absorption", sublabel: "Jeukendrup 2010", weight: 8 },
];

export const GRAPH_EDGES: GraphEdge[] = [
  // Ingredients → Goals
  { source: "ing-caffeine", target: "goal-endurance", type: "supports", strength: 0.9 },
  { source: "ing-creatine", target: "goal-muscle", type: "supports", strength: 1.0 },
  { source: "ing-creatine", target: "goal-endurance", type: "supports", strength: 0.6 },
  { source: "ing-maltodextrin", target: "goal-endurance", type: "supports", strength: 0.9 },
  { source: "ing-fructose", target: "goal-endurance", type: "supports", strength: 0.8 },
  { source: "ing-sodium", target: "goal-endurance", type: "supports", strength: 0.8 },
  { source: "ing-beetroot", target: "goal-endurance", type: "supports", strength: 0.8 },
  { source: "ing-tart-cherry", target: "goal-recovery", type: "supports", strength: 0.85 },
  { source: "ing-magnesium", target: "goal-sleep", type: "supports", strength: 0.9 },
  { source: "ing-magnesium", target: "goal-recovery", type: "supports", strength: 0.7 },
  { source: "ing-whey", target: "goal-muscle", type: "supports", strength: 0.95 },
  { source: "ing-whey", target: "goal-recovery", type: "supports", strength: 0.85 },
  { source: "ing-omega3", target: "goal-recovery", type: "supports", strength: 0.8 },
  { source: "ing-omega3", target: "goal-health", type: "supports", strength: 0.85 },
  { source: "ing-iron", target: "goal-endurance", type: "supports", strength: 0.85 },
  { source: "ing-iron", target: "goal-health", type: "supports", strength: 0.8 },
  { source: "ing-vitd", target: "goal-immunity", type: "supports", strength: 0.85 },
  { source: "ing-vitd", target: "goal-health", type: "supports", strength: 0.8 },
  { source: "ing-beta-alanine", target: "goal-endurance", type: "supports", strength: 0.7 },
  { source: "ing-bicarb", target: "goal-endurance", type: "supports", strength: 0.75 },
  { source: "ing-probiotics", target: "goal-gut", type: "supports", strength: 0.9 },
  { source: "ing-probiotics", target: "goal-immunity", type: "supports", strength: 0.75 },
  { source: "ing-glutamine", target: "goal-gut", type: "supports", strength: 0.8 },
  { source: "ing-glutamine", target: "goal-recovery", type: "supports", strength: 0.6 },
  { source: "ing-ashwagandha", target: "goal-sleep", type: "supports", strength: 0.75 },
  { source: "ing-ashwagandha", target: "goal-recovery", type: "supports", strength: 0.7 },
  { source: "ing-collagen", target: "goal-health", type: "supports", strength: 0.7 },
  { source: "ing-collagen", target: "goal-recovery", type: "supports", strength: 0.65 },

  // Products → Ingredients
  { source: "prod-maurten-gel", target: "ing-maltodextrin", type: "contains", strength: 0.9 },
  { source: "prod-maurten-gel", target: "ing-fructose", type: "contains", strength: 0.8 },
  { source: "prod-maurten-gel", target: "ing-hydrogel", type: "contains", strength: 1.0 },
  { source: "prod-maurten-gel", target: "ing-sodium", type: "contains", strength: 0.5 },
  { source: "prod-sis-beta-fuel", target: "ing-maltodextrin", type: "contains", strength: 0.9 },
  { source: "prod-sis-beta-fuel", target: "ing-fructose", type: "contains", strength: 0.8 },
  { source: "prod-sis-beta-fuel", target: "ing-sodium", type: "contains", strength: 0.7 },
  { source: "prod-thorne-creatine", target: "ing-creatine", type: "contains", strength: 1.0 },
  { source: "prod-momentous-whey", target: "ing-whey", type: "contains", strength: 1.0 },
  { source: "prod-pillar-mag", target: "ing-magnesium", type: "contains", strength: 1.0 },
  { source: "prod-lmnt", target: "ing-sodium", type: "contains", strength: 1.0 },
  { source: "prod-nordic-omega3", target: "ing-omega3", type: "contains", strength: 1.0 },

  // Brands → Products
  { source: "brand-maurten", target: "prod-maurten-gel", type: "makes", strength: 1.0 },
  { source: "brand-sis", target: "prod-sis-beta-fuel", type: "makes", strength: 1.0 },
  { source: "brand-thorne", target: "prod-thorne-creatine", type: "makes", strength: 1.0 },
  { source: "brand-momentous", target: "prod-momentous-whey", type: "makes", strength: 1.0 },
  { source: "brand-skratch", target: "prod-lmnt", type: "makes", strength: 0.0 },
  { source: "brand-momentous", target: "prod-nordic-omega3", type: "makes", strength: 0.0 },

  // Studies → Ingredients
  { source: "study-caffeine-endo", target: "ing-caffeine", type: "studies", strength: 1.0 },
  { source: "study-creatine-atp", target: "ing-creatine", type: "studies", strength: 1.0 },
  { source: "study-nitrate-vo2", target: "ing-beetroot", type: "studies", strength: 1.0 },
  { source: "study-cherry-doms", target: "ing-tart-cherry", type: "studies", strength: 1.0 },
  { source: "study-iron-vo2", target: "ing-iron", type: "studies", strength: 1.0 },
  { source: "study-dual-carb", target: "ing-maltodextrin", type: "studies", strength: 0.8 },
  { source: "study-dual-carb", target: "ing-fructose", type: "studies", strength: 0.8 },

  // Ingredients → Hydrogel tech
  { source: "ing-hydrogel", target: "ing-maltodextrin", type: "enhances", strength: 0.8 },
  { source: "ing-hydrogel", target: "ing-fructose", type: "enhances", strength: 0.8 },
];

// ── HELPERS ───────────────────────────────────────────────────

export function getNodeConnections(nodeId: string): {
  connected: GraphNode[];
  edges: GraphEdge[];
} {
  const edges = GRAPH_EDGES.filter(
    (e) => e.source === nodeId || e.target === nodeId
  );
  const connectedIds = new Set(
    edges.flatMap((e) => [e.source, e.target]).filter((id) => id !== nodeId)
  );
  const connected = GRAPH_NODES.filter((n) => connectedIds.has(n.id));
  return { connected, edges };
}

export function getSubgraph(nodeId: string, depth = 1): KnowledgeGraph {
  const visited = new Set<string>([nodeId]);
  const nodeQueue = [nodeId];
  const edgeSet = new Set<string>();

  for (let d = 0; d < depth; d++) {
    const current = [...nodeQueue];
    nodeQueue.length = 0;
    current.forEach((id) => {
      GRAPH_EDGES.forEach((e) => {
        if (e.source === id && !visited.has(e.target)) {
          visited.add(e.target);
          nodeQueue.push(e.target);
          edgeSet.add(`${e.source}→${e.target}`);
        }
        if (e.target === id && !visited.has(e.source)) {
          visited.add(e.source);
          nodeQueue.push(e.source);
          edgeSet.add(`${e.source}→${e.target}`);
        }
      });
    });
  }

  return {
    nodes: GRAPH_NODES.filter((n) => visited.has(n.id)),
    edges: GRAPH_EDGES.filter((e) => edgeSet.has(`${e.source}→${e.target}`)),
  };
}