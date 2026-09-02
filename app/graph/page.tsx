"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  GRAPH_NODES, GRAPH_EDGES, NODE_COLORS,
  GraphNode, NodeType, getNodeConnections
} from "@/lib/knowledge-graph";

const TYPE_LABELS: Record<NodeType, string> = {
  product: "Product",
  ingredient: "Ingredient",
  brand: "Brand",
  goal: "Goal",
  study: "Study",
  category: "Category",
};

const FILTER_OPTIONS: { type: NodeType | "all"; label: string }[] = [
  { type: "all", label: "All" },
  { type: "goal", label: "Goals" },
  { type: "ingredient", label: "Ingredients" },
  { type: "product", label: "Products" },
  { type: "brand", label: "Brands" },
  { type: "study", label: "Studies" },
];

interface SimNode extends GraphNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  fx?: number;
  fy?: number;
}

function useForceSimulation(nodes: GraphNode[], edges: typeof GRAPH_EDGES, width: number, height: number) {
  const [positions, setPositions] = useState<Map<string, { x: number; y: number }>>(new Map());
  const simRef = useRef<SimNode[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!width || !height) return;

    // Initialize positions in a circle
    const simNodes: SimNode[] = nodes.map((n, i) => {
      const angle = (i / nodes.length) * 2 * Math.PI;
      const r = Math.min(width, height) * 0.35;
      return {
        ...n,
        x: width / 2 + r * Math.cos(angle) + (Math.random() - 0.5) * 50,
        y: height / 2 + r * Math.sin(angle) + (Math.random() - 0.5) * 50,
        vx: 0, vy: 0,
      };
    });
    simRef.current = simNodes;

    const tick = () => {
      const sn = simRef.current;
      const cx = width / 2, cy = height / 2;
      const alpha = 0.3;

      // Forces
      for (let i = 0; i < sn.length; i++) {
        const a = sn[i];
        if (a.fx !== undefined) { a.x = a.fx; a.y = a.fy!; continue; }

        // Center gravity
        a.vx += (cx - a.x) * 0.002 * alpha;
        a.vy += (cy - a.y) * 0.002 * alpha;

        // Repulsion
        for (let j = i + 1; j < sn.length; j++) {
          const b = sn[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy) || 1;
          const repulse = 2000 / (d * d);
          a.vx += (dx / d) * repulse;
          a.vy += (dy / d) * repulse;
          b.vx -= (dx / d) * repulse;
          b.vy -= (dy / d) * repulse;
        }
      }

      // Link attraction
      edges.forEach((e) => {
        const a = sn.find((n) => n.id === e.source);
        const b = sn.find((n) => n.id === e.target);
        if (!a || !b) return;
        const dx = b.x - a.x, dy = b.y - a.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        const target = 120;
        const force = (d - target) * 0.05 * alpha * (e.strength ?? 0.5);
        a.vx += (dx / d) * force;
        a.vy += (dy / d) * force;
        b.vx -= (dx / d) * force;
        b.vy -= (dy / d) * force;
      });

      // Integrate
      sn.forEach((n) => {
        if (n.fx !== undefined) return;
        n.vx *= 0.8; n.vy *= 0.8;
        n.x = Math.max(40, Math.min(width - 40, n.x + n.vx));
        n.y = Math.max(40, Math.min(height - 40, n.y + n.vy));
      });

      setPositions(new Map(sn.map((n) => [n.id, { x: n.x, y: n.y }])));
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [nodes.length, edges.length, width, height]);

  return { positions, simNodes: simRef };
}

export default function GraphPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [filter, setFilter] = useState<NodeType | "all">("all");
  const [search, setSearch] = useState("");
  const [dragging, setDragging] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setDims({
          w: containerRef.current.clientWidth,
          h: containerRef.current.clientHeight,
        });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const visibleNodes = GRAPH_NODES.filter((n) => {
    if (filter !== "all" && n.type !== filter) return false;
    if (search && !n.label.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const visibleIds = new Set(visibleNodes.map((n) => n.id));
  const visibleEdges = GRAPH_EDGES.filter(
    (e) => visibleIds.has(e.source) && visibleIds.has(e.target)
  );

  const { positions, simNodes } = useForceSimulation(visibleNodes, visibleEdges, dims.w, dims.h);

  const selectedConnections = selectedNode ? getNodeConnections(selectedNode.id) : null;
  const connectedIds = new Set(selectedConnections?.connected.map((n) => n.id) ?? []);

  const getNodeRadius = (n: GraphNode) => {
    const base = n.weight ?? 5;
    return Math.max(18, Math.min(36, base * 3.2));
  };

  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setDragging(nodeId);
  };

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!dragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const sn = simNodes.current;
    const node = sn.find((n) => n.id === dragging);
    if (node) { node.fx = x; node.fy = y; node.x = x; node.y = y; }
  }, [dragging, simNodes]);

  const handleMouseUp = useCallback(() => {
    if (dragging) {
      const sn = simNodes.current;
      const node = sn.find((n) => n.id === dragging);
      if (node) { delete node.fx; delete node.fy; }
    }
    setDragging(null);
  }, [dragging, simNodes]);

  return (
    <div className="min-h-screen">
      <nav className="border-b border-sand bg-cream/80 backdrop-blur-sm sticky top-0 z-50">
  <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
    <Link href="/" className="font-display font-bold text-lg tracking-tight">
      Pel<span className="text-moss">lo</span>
    </Link>
    <div className="flex items-center gap-3">
      <Link href="/products" className="hidden sm:block text-sm text-muted hover:text-ink transition-colors">All products</Link>
      <Link href="/guides" className="hidden md:block text-sm text-muted hover:text-ink transition-colors">Guides</Link>
      <Link href="/compare" className="hidden md:block text-sm text-muted hover:text-ink transition-colors">Compare</Link>
      <Link href="/query" className="hidden lg:block text-sm text-muted hover:text-ink transition-colors">Query</Link>
      <Link href="/ingredients" className="hidden lg:block text-sm text-muted hover:text-ink transition-colors">Ingredients</Link>
      
      <Link href="/quiz" className="btn-secondary text-xs py-1.5 px-3">Build my plan →</Link>
    </div>
  </div>
</nav>

      <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 56px)" }}>
        {/* Left panel */}
        <div className="w-64 flex-shrink-0 border-r border-sand bg-cream/60 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-sand">
            <h1 className="font-display font-bold text-base mb-1">Nutrition graph</h1>
            <p className="text-xs text-muted">
              {GRAPH_NODES.length} nodes · {GRAPH_EDGES.length} connections
            </p>
          </div>

          {/* Search */}
          <div className="p-3 border-b border-sand">
            <input
              type="text"
              placeholder="Search nodes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/60 border border-sand rounded-lg px-3 py-2 text-xs outline-none focus:border-muted"
            />
          </div>

          {/* Filter */}
          <div className="p-3 border-b border-sand">
            <div className="text-xs font-mono text-muted uppercase tracking-widest mb-2">Filter by type</div>
            <div className="space-y-1">
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.type}
                  onClick={() => setFilter(opt.type)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-left transition-all ${filter === opt.type ? "bg-moss/10 text-moss font-medium" : "hover:bg-sand/50 text-muted"}`}
                >
                  {opt.type !== "all" && (
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: NODE_COLORS[opt.type as NodeType] }} />
                  )}
                  {opt.label}
                  <span className="ml-auto font-mono text-xs">
                    {opt.type === "all" ? GRAPH_NODES.length : GRAPH_NODES.filter((n) => n.type === opt.type).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="p-3 border-b border-sand">
            <div className="text-xs font-mono text-muted uppercase tracking-widest mb-2">Legend</div>
            <div className="space-y-1.5">
              {Object.entries(NODE_COLORS).map(([type, color]) => (
                <div key={type} className="flex items-center gap-2 text-xs text-muted">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                  {TYPE_LABELS[type as NodeType]}
                </div>
              ))}
            </div>
          </div>

          {/* Selected node info */}
          {selectedNode && (
            <div className="p-3 flex-1 overflow-y-auto">
              <div className="text-xs font-mono text-muted uppercase tracking-widest mb-2">Selected</div>
              <div className="card bg-white/60 p-3 mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: NODE_COLORS[selectedNode.type] }} />
                  <span className="text-xs font-mono text-muted">{TYPE_LABELS[selectedNode.type]}</span>
                </div>
                <div className="font-display font-semibold text-sm">{selectedNode.label}</div>
                {selectedNode.sublabel && (
                  <div className="text-xs text-muted mt-0.5">{selectedNode.sublabel}</div>
                )}
              </div>

              {selectedConnections && selectedConnections.connected.length > 0 && (
                <div>
                  <div className="text-xs font-mono text-muted uppercase tracking-widest mb-2">
                    {selectedConnections.connected.length} connections
                  </div>
                  <div className="space-y-1">
                    {selectedConnections.connected.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => setSelectedNode(n)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-sand/50 text-left transition-all"
                      >
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: NODE_COLORS[n.type] }} />
                        <span className="text-xs truncate">{n.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => setSelectedNode(null)}
                className="mt-3 text-xs text-muted underline underline-offset-2"
              >
                Clear selection
              </button>
            </div>
          )}
        </div>

        {/* Graph canvas */}
        <div ref={containerRef} className="flex-1 relative bg-cream/30 overflow-hidden">
          {dims.w > 0 && (
            <svg
              width={dims.w}
              height={dims.h}
              className="absolute inset-0 cursor-grab active:cursor-grabbing"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <defs>
                <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="#E8E0D0" />
                </marker>
              </defs>

              {/* Edges */}
              {visibleEdges.map((edge, i) => {
                const sp = positions.get(edge.source);
                const tp = positions.get(edge.target);
                if (!sp || !tp) return null;
                const isHighlighted = selectedNode && (
                  edge.source === selectedNode.id || edge.target === selectedNode.id
                );
                const opacity = selectedNode ? (isHighlighted ? 0.8 : 0.1) : 0.25;
                const color = isHighlighted ? NODE_COLORS[
                  (GRAPH_NODES.find(n => n.id === edge.source)?.type ?? "ingredient")
                ] : "#C8C0B0";

                return (
                  <line
                    key={i}
                    x1={sp.x} y1={sp.y}
                    x2={tp.x} y2={tp.y}
                    stroke={color}
                    strokeWidth={isHighlighted ? (edge.strength ?? 0.5) * 3 : 1}
                    strokeOpacity={opacity}
                    strokeDasharray={edge.type === "studies" ? "4,3" : undefined}
                  />
                );
              })}

              {/* Nodes */}
              {visibleNodes.map((node) => {
                const pos = positions.get(node.id);
                if (!pos) return null;
                const r = getNodeRadius(node);
                const isSelected = selectedNode?.id === node.id;
                const isConnected = connectedIds.has(node.id);
                const isHovered = hoveredNode === node.id;
                const dimmed = selectedNode && !isSelected && !isConnected;
                const opacity = dimmed ? 0.25 : 1;
                const color = NODE_COLORS[node.type];

                return (
                  <g
                    key={node.id}
                    transform={`translate(${pos.x},${pos.y})`}
                    style={{ opacity, cursor: "pointer" }}
                    onClick={() => setSelectedNode(isSelected ? null : node)}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    onMouseDown={(e) => handleMouseDown(e, node.id)}
                  >
                    {/* Glow ring for selected */}
                    {(isSelected || isHovered) && (
                      <circle r={r + 6} fill="none" stroke={color} strokeWidth={2} strokeOpacity={0.3} />
                    )}

                    {/* Main circle */}
                    <circle
                      r={r}
                      fill={isSelected ? color : `${color}22`}
                      stroke={color}
                      strokeWidth={isSelected ? 0 : 1.5}
                    />

                    {/* Label */}
                    <text
                      textAnchor="middle"
                      dy="0.35em"
                      fontSize={Math.max(9, Math.min(12, r * 0.38))}
                      fontWeight={isSelected ? "600" : "400"}
                      fill={isSelected ? "#F5F0E8" : "#1A1A1A"}
                      fontFamily="DM Sans"
                      style={{ pointerEvents: "none", userSelect: "none" }}
                    >
                      {node.label.length > 12 ? node.label.slice(0, 11) + "…" : node.label}
                    </text>

                    {/* Sublabel on hover */}
                    {isHovered && node.sublabel && (
                      <text
                        textAnchor="middle"
                        y={r + 16}
                        fontSize={9}
                        fill="#8A8478"
                        fontFamily="DM Mono"
                        style={{ pointerEvents: "none", userSelect: "none" }}
                      >
                        {node.sublabel}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          )}

          {/* Instructions overlay */}
          {!selectedNode && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-sm border border-sand rounded-xl px-4 py-2">
              <p className="text-xs text-muted font-mono">Click a node to explore connections · Drag to rearrange</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
