"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { GRAPH_NODES, GRAPH_EDGES, NODE_COLORS, GraphNode, getSubgraph } from "@/lib/knowledge-graph";

interface MiniGraphProps {
  productId?: string;
  ingredientId?: string;
  goalId?: string;
  height?: number;
}

interface SimNode extends GraphNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export default function MiniGraph({ productId, ingredientId, goalId, height = 280 }: MiniGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 0, h: height });
  const [positions, setPositions] = useState<Map<string, { x: number; y: number }>>(new Map());
  const [selected, setSelected] = useState<GraphNode | null>(null);
  const rafRef = useRef<number>(0);

  const rootId = productId
    ? GRAPH_NODES.find((n) => n.id === `prod-${productId}` || n.data?.productId === productId)?.id
    : ingredientId
    ? `ing-${ingredientId}`
    : goalId
    ? `goal-${goalId}`
    : null;

  const subgraph = rootId ? getSubgraph(rootId, 1) : { nodes: [], edges: [] };

  // If no matching node in graph, show a friendly fallback
  const hasData = subgraph.nodes.length > 0;

  useEffect(() => {
    if (containerRef.current) {
      setDims({ w: containerRef.current.clientWidth, h: height });
    }
  }, [height]);

  useEffect(() => {
    if (!hasData || !dims.w) return;
    const { nodes, edges } = subgraph;
    const cx = dims.w / 2, cy = dims.h / 2;

    const simNodes: SimNode[] = nodes.map((n, i) => {
      const angle = (i / nodes.length) * 2 * Math.PI;
      const r = Math.min(dims.w, dims.h) * 0.3;
      return {
        ...n,
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
        vx: 0, vy: 0,
      };
    });

    // Pin root node to center
    const root = simNodes.find((n) => n.id === rootId);
    if (root) { root.x = cx; root.y = cy; }

    const tick = () => {
      simNodes.forEach((a, i) => {
        if (a.id === rootId) return;
        a.vx += (cx - a.x) * 0.003;
        a.vy += (cy - a.y) * 0.003;

        simNodes.forEach((b, j) => {
          if (i === j) return;
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy) || 1;
          const rep = 1500 / (d * d);
          a.vx += (dx / d) * rep;
          a.vy += (dy / d) * rep;
        });
      });

      edges.forEach((e) => {
        const a = simNodes.find((n) => n.id === e.source);
        const b = simNodes.find((n) => n.id === e.target);
        if (!a || !b) return;
        const dx = b.x - a.x, dy = b.y - a.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        const target = 90;
        const force = (d - target) * 0.08;
        if (a.id !== rootId) { a.vx += (dx / d) * force; a.vy += (dy / d) * force; }
        if (b.id !== rootId) { b.vx -= (dx / d) * force; b.vy -= (dy / d) * force; }
      });

      simNodes.forEach((n) => {
        if (n.id === rootId) return;
        n.vx *= 0.75; n.vy *= 0.75;
        n.x = Math.max(30, Math.min(dims.w - 30, n.x + n.vx));
        n.y = Math.max(30, Math.min(dims.h - 30, n.y + n.vy));
      });

      setPositions(new Map(simNodes.map((n) => [n.id, { x: n.x, y: n.y }])));
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [hasData, dims.w, dims.h, rootId]);

  if (!hasData) return null;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-display font-semibold text-sm">Knowledge graph</h3>
          <p className="text-xs text-muted">{subgraph.nodes.length} connected nodes</p>
        </div>
        <Link href="/graph" className="text-xs text-moss underline underline-offset-2">
          Full graph →
        </Link>
      </div>

      <div ref={containerRef} style={{ height }} className="relative bg-sand/20 rounded-xl overflow-hidden">
        {dims.w > 0 && (
          <svg width={dims.w} height={dims.h}>
            {subgraph.edges.map((edge, i) => {
              const sp = positions.get(edge.source);
              const tp = positions.get(edge.target);
              if (!sp || !tp) return null;
              const color = NODE_COLORS[subgraph.nodes.find(n => n.id === edge.source)?.type ?? "ingredient"];
              return (
                <line key={i}
                  x1={sp.x} y1={sp.y} x2={tp.x} y2={tp.y}
                  stroke={color} strokeWidth={1.5} strokeOpacity={0.3}
                  strokeDasharray={edge.type === "studies" ? "3,2" : undefined}
                />
              );
            })}

            {subgraph.nodes.map((node) => {
              const pos = positions.get(node.id);
              if (!pos) return null;
              const isRoot = node.id === rootId;
              const r = isRoot ? 28 : 18;
              const color = NODE_COLORS[node.type];
              const isSelected = selected?.id === node.id;

              return (
                <g key={node.id}
                  transform={`translate(${pos.x},${pos.y})`}
                  style={{ cursor: "pointer" }}
                  onClick={() => setSelected(isSelected ? null : node)}
                >
                  {isSelected && <circle r={r + 5} fill="none" stroke={color} strokeWidth={2} strokeOpacity={0.4} />}
                  <circle r={r}
                    fill={isRoot ? color : `${color}22`}
                    stroke={color}
                    strokeWidth={isRoot ? 0 : 1.5}
                  />
                  <text textAnchor="middle" dy="0.35em"
                    fontSize={isRoot ? 10 : 8}
                    fontWeight={isRoot ? "600" : "400"}
                    fill={isRoot ? "#F5F0E8" : "#1A1A1A"}
                    fontFamily="DM Sans"
                    style={{ pointerEvents: "none", userSelect: "none" }}
                  >
                    {node.label.length > 10 ? node.label.slice(0, 9) + "…" : node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        )}

        {/* Selected node tooltip */}
        {selected && (
          <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur-sm border border-sand rounded-lg px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: NODE_COLORS[selected.type] }} />
              <span className="text-xs font-medium">{selected.label}</span>
              {selected.sublabel && <span className="text-xs text-muted">· {selected.sublabel}</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}