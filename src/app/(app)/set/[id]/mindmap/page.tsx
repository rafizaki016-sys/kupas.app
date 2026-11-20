"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  Maximize2,
  MessageSquare,
  Minus,
  Network,
  Plus,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLocalSet, StudySet } from "@/lib/data";

interface MindNode {
  label: string;
  children?: MindNode[];
}

interface PositionedNode {
  id: string;
  label: string;
  depth: number;
  branchIndex: number;
  x: number;
  y: number;
  w: number;
  h: number;
  hasChildren: boolean;
  childCount: number;
  isCollapsed: boolean;
}

interface Edge {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
}

const BRANCH_STYLES = [
  { border: "#0F766E", bg: "#F0FDFA", text: "#115E59", line: "#0F766E" },
  { border: "#0369A1", bg: "#F0F9FF", text: "#075985", line: "#0284C7" },
  { border: "#B45309", bg: "#FFFBEB", text: "#92400E", line: "#D97706" },
  { border: "#4338CA", bg: "#EEF2FF", text: "#3730A3", line: "#4F46E5" },
  { border: "#15803D", bg: "#F0FDF4", text: "#166534", line: "#16A34A" },
];

const NODE_H = 52;
const V_GAP = 16;
const H_GAP = 76;
const PADDING = 48;

function getNodeWidth(depth: number): number {
  if (depth === 0) return 220;
  if (depth === 1) return 200;
  return 210;
}

function buildLayout(root: MindNode, collapsed: Set<string>) {
  const nodes: PositionedNode[] = [];
  const edges: Edge[] = [];
  const heightCache = new Map<string, number>();

  function measure(node: MindNode, id: string): number {
    const kids = node.children ?? [];
    if (kids.length === 0 || collapsed.has(id)) {
      heightCache.set(id, NODE_H);
      return NODE_H;
    }
    let total = 0;
    kids.forEach((child, idx) => {
      total += measure(child, `${id}-${idx}`);
      if (idx > 0) total += V_GAP;
    });
    const h = Math.max(NODE_H, total);
    heightCache.set(id, h);
    return h;
  }

  function place(
    node: MindNode,
    id: string,
    depth: number,
    branchIndex: number,
    x: number,
    topY: number
  ): PositionedNode {
    const subtreeH = heightCache.get(id) ?? NODE_H;
    const w = getNodeWidth(depth);
    const y = topY + (subtreeH - NODE_H) / 2;
    const kids = node.children ?? [];
    const isCollapsed = collapsed.has(id);

    const current: PositionedNode = {
      id,
      label: node.label,
      depth,
      branchIndex,
      x,
      y,
      w,
      h: NODE_H,
      hasChildren: kids.length > 0,
      childCount: kids.length,
      isCollapsed,
    };
    nodes.push(current);

    if (kids.length > 0 && !isCollapsed) {
      let cursorY = topY;
      const nextX = x + w + H_GAP;
      kids.forEach((child, idx) => {
        const childId = `${id}-${idx}`;
        const childBranch = depth === 0 ? idx : branchIndex;
        const childH = heightCache.get(childId) ?? NODE_H;
        const childNode = place(child, childId, depth + 1, childBranch, nextX, cursorY);
        const palette = BRANCH_STYLES[childBranch % BRANCH_STYLES.length];
        edges.push({
          id: `${id}->${childId}`,
          x1: current.x + current.w,
          y1: current.y + current.h / 2,
          x2: childNode.x,
          y2: childNode.y + childNode.h / 2,
          color: palette.line,
        });
        cursorY += childH + V_GAP;
      });
    }

    return current;
  }

  const totalH = measure(root, "root");
  place(root, "root", 0, 0, PADDING, PADDING);

  const maxX = nodes.reduce((acc, n) => Math.max(acc, n.x + n.w), 600);
  const canvasW = maxX + PADDING * 2;
  const canvasH = Math.max(380, totalH + PADDING * 2);

  return { nodes, edges, canvasW, canvasH };
}

function collectBranchIds(node: MindNode, id = "root", out: string[] = []): string[] {
  const kids = node.children ?? [];
  if (kids.length > 0 && id !== "root") out.push(id);
  kids.forEach((child, idx) => collectBranchIds(child, `${id}-${idx}`, out));
  return out;
}

export default function MindMapPage() {
  const { id } = useParams<{ id: string }>();
  const [set, setSet] = useState<StudySet | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ active: boolean; startX: number; startY: number; origX: number; origY: number }>({
    active: false,
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0,
  });

  useEffect(() => {
    setSet(getLocalSet(id));
  }, [id]);

  const root = set?.mindmap ?? null;

  const layout = useMemo(() => {
    if (!root) return null;
    return buildLayout(root, collapsed);
  }, [root, collapsed]);

  function toggleNode(nodeId: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  }

  function handleExpandAll() {
    setCollapsed(new Set());
  }

  function handleCollapseAll() {
    if (!root) return;
    setCollapsed(new Set(collectBranchIds(root)));
  }

  function handleResetView() {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest("button")) return;
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      origX: pan.x,
      origY: pan.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current.active) return;
    setPan({
      x: dragRef.current.origX + (e.clientX - dragRef.current.startX),
      y: dragRef.current.origY + (e.clientY - dragRef.current.startY),
    });
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  }

  if (!root || !layout) {
    return (
      <div className="mx-auto max-w-[960px] p-6">
        <div className="rounded-lg border border-border bg-surface p-8 text-center text-sm text-muted">
          Peta konsep belum tersedia untuk materi ini.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1120px] p-4 md:p-6">
      {/* Toolbar Atas */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface p-4 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent/10 text-accent">
            <Network className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-base font-bold text-text">Peta Konsep Interaktif</h1>
            <p className="text-xs text-muted">
              Geser kanvas untuk menjelajah · Klik cabang untuk membuka atau melipat
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="secondary" onClick={handleExpandAll}>
            Buka Semua
          </Button>
          <Button size="sm" variant="secondary" onClick={handleCollapseAll}>
            Lipat Cabang
          </Button>
          <div className="flex items-center rounded-md border border-border bg-surface-subtle p-0.5">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.15).toFixed(2))))}
              aria-label="Perkecil"
              className="rounded p-1.5 text-text hover:bg-surface"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-12 text-center text-xs font-semibold text-text">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(1.75, Number((z + 0.15).toFixed(2))))}
              aria-label="Perbesar"
              className="rounded p-1.5 text-text hover:bg-surface"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <Button size="sm" variant="secondary" onClick={handleResetView} aria-label="Reset posisi">
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Kanvas Mind Map */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative mt-4 h-[520px] w-full cursor-grab overflow-hidden rounded-lg border border-border bg-surface shadow-sm active:cursor-grabbing"
        style={{
          backgroundImage: "radial-gradient(#CBD5E1 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          touchAction: "none",
        }}
      >
        <div
          style={{
            width: layout.canvasW,
            height: layout.canvasH,
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
          }}
          className="relative transition-transform duration-75"
        >
          {/* Garis Lengkung Penghubung */}
          <svg
            width={layout.canvasW}
            height={layout.canvasH}
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
          >
            {layout.edges.map((edge) => {
              const midX = (edge.x1 + edge.x2) / 2;
              const d = `M ${edge.x1} ${edge.y1} C ${midX} ${edge.y1}, ${midX} ${edge.y2}, ${edge.x2} ${edge.y2}`;
              return (
                <path
                  key={edge.id}
                  d={d}
                  fill="none"
                  stroke={edge.color}
                  strokeWidth={2.2}
                  strokeOpacity={0.55}
                />
              );
            })}
          </svg>

          {/* Kartu Node */}
          {layout.nodes.map((node) => {
            const isRoot = node.depth === 0;
            const palette = BRANCH_STYLES[node.branchIndex % BRANCH_STYLES.length];
            const isSelected = selectedLabel === node.label;

            return (
              <button
                key={node.id}
