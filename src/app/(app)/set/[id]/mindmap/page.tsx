"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
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
  const kids
