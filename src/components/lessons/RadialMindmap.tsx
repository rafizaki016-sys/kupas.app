"use client";

import { useState } from "react";
import { Maximize2, Minus, Plus } from "lucide-react";

type MindmapBranch = {
  title: string;
  detail: string;
};

type RadialMindmapProps = {
  rootLabel: string;
  branches: MindmapBranch[];
};

export default function RadialMindmap({ rootLabel, branches }: RadialMindmapProps) {
  const [mapZoom, setMapZoom] = useState<number>(100);
  const [activeBranchIdx, setActiveBranchIdx] = useState<number>(0);

  const safeBranches =
    branches.length > 0
      ? branches.slice(0, 8)
      : [{ title: "Konsep Utama", detail: rootLabel }];

  const centerX = 430;
  const centerY = 270;
  const radiusX = 275;
  const radiusY = 190;

  return (
    <div
      className="relative min-h-[calc(100vh-3.5rem)] w-full overflow-hidden"
      style={{
        backgroundColor: "#faf6ee",
        backgroundImage: "radial-gradient(#d5cdc0 1.25px, transparent 1.25px)",
        backgroundSize: "18px 18px",
      }}
    >
      {/* Zoom Controls + Percentage Pill */}
      <div className="absolute left-4 top-4 z-20 flex items-center gap-2.5 sm:left-6 sm:top-6">
        <div className="flex flex-col overflow-hidden rounded-2xl border-[1.5px] border-[#1d2433] bg-[#fffdf8] shadow-[3px_3px_0_#1d2433]">
          <button
            type="button"
            aria-label="Reset zoom peta"
            onClick={() => setMapZoom(100)}
            className="grid h-9 w-9 place-items-center border-b border-[#e5ddd0] text-[#1d2433] hover:bg-[#dfe8ff]"
          >
            <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Perbesar peta"
            onClick={() => setMapZoom((z) => Math.min(125, z + 10))}
            className="grid h-9 w-9 place-items-center border-b border-[#e5ddd0] text-[#1d2433] hover:bg-[#dfe8ff]"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Perkecil peta"
            onClick={() => setMapZoom((z) => Math.max(70, z - 10))}
            className="grid h-9 w-9 place-items-center text-[#1d2433] hover:bg-[#dfe8ff]"
          >
            <Minus className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>

        <span className="rounded-full border-[1.5px] border-[#1d2433] bg-[#fffdf8] px-3 py-1 text-xs font-extrabold text-[#1d2433] shadow-[2px_2px_0_#1d2433]">
          {mapZoom}%
        </span>
      </div>

      {/* Radial Canvas */}
      <div className="flex min-h-[580px] w-full items-center justify-center overflow-x-auto px-4 py-12">
        <div
          className="relative h-[540px] w-[860px] shrink-0 transition-transform duration-200"
          style={{ transform: `scale(${mapZoom / 100})` }}
        >
          {/* Curved Connector Lines */}
          <svg
            viewBox="0 0 860 540"
            className="pointer-events-none absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            {safeBranches.map((br, idx) => {
              const angleDeg = -90 + (360 / safeBranches.length) * idx;
              const rad = (angleDeg * Math.PI) / 180;
              const endX = centerX + Math.cos(rad) * radiusX;
              const endY = centerY + Math.sin(rad) * radiusY;
              const ctrlX = centerX + Math.cos(rad - 0.14) * (radiusX * 0.56);
              const ctrlY = centerY + Math.sin(rad - 0.14) * (radiusY * 0.56);
              const isActive = activeBranchIdx === idx;

              return (
                <path
                  key={`${br.title}-line-${idx}`}
                  d={`M ${centerX} ${centerY} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`}
                  fill="none"
                  stroke={isActive ? "#1e4fd8" : "#8e96a6"}
                  strokeWidth={isActive ? 2.2 : 1.5}
                />
              );
            })}
          </svg>

          {/* Center Root Node */}
          <button
            type="button"
            onClick={() => setActiveBranchIdx(0)}
            style={{ left: `${centerX}px`, top: `${centerY}px` }}
            className="absolute z-10 w-[210px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border-[1.5px] border-[#1d2433] bg-[#162238] px-4 py-3 text-center text-xs font-extrabold leading-snug text-white shadow-[4px_4px_0_#1d2433]"
          >
            {rootLabel}
          </button>

          {/* Radial Branch Nodes */}
          {safeBranches.map((br, idx) => {
            const angleDeg = -90 + (360 / safeBranches.length) * idx;
            const rad = (angleDeg * Math.PI) / 180;
            const x = centerX + Math.cos(rad) * radiusX;
            const y = centerY + Math.sin(rad) * radiusY;
            const isTopHighlight = idx === 0;
            const isSelected = activeBranchIdx === idx;

            return (
              <button
                key={`${br.title}-node-${idx}`}
                type="button"
                onClick={() => setActiveBranchIdx(idx)}
                style={{ left: `${x}px`, top: `${y}px` }}
                className={`absolute z-10 w-[184px] -translate-x-1/2 -translate-y-1/2 rounded-xl border-[1.5px] border-[#1d2433] px-3.5 py-2 text-center text-xs font-bold leading-snug shadow-[3px_3px_0_#1d2433] transition hover:-translate-y-[calc(50%+2px)] ${
                  isTopHighlight
                    ? "bg-[#1e4fd8] text-white"
                    : isSelected
                      ? "bg-[#dfe8ff] text-[#1d2433]"
                      : "bg-white text-[#1d2433]"
                }`}
              >
                <span className="line-clamp-2">{br.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Branch Detail Card */}
      {safeBranches[activeBranchIdx] && (
        <div className="mx-auto mb-6 max-w-[640px] px-4">
          <div className="rounded-2xl border-[1.5px] border-[#1d2433] bg-[#fffdf8] p-4 shadow-[4px_4px_0_#1d2433]">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1e4fd8]">
              CABANG TERPILIH
            </span>
            <h2 className="mt-1 text-sm font-extrabold text-[#1d2433]">
              {safeBranches[activeBranchIdx].title}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-[#5d6578]">
              {safeBranches[activeBranchIdx].detail}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
