import type { SVGProps } from "react";

// Ikon garis sederhana. Dekoratif: tersembunyi dari pembaca layar.
function Svg(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    />
  );
}

export const IconMic = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}><rect x="9" y="3" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></Svg>
);
export const IconUpload = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}><path d="M12 16V4M7 9l5-5 5 5M5 20h14" /></Svg>
);
export const IconLink = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></Svg>
);
export const IconArrow = (p: SVGProps<SVGSVGElement>) => (
  <Svg strokeWidth={2} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></Svg>
);
export const IconCards = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}><rect x="3" y="6" width="14" height="11" rx="2" /><path d="M7 20h12a2 2 0 0 0 2-2V9" /></Svg>
);
export const IconNote = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}><path d="M6 3h9l4 4v14H6z" /><path d="M9 11h7M9 15h7M9 7h3" /></Svg>
);
export const IconDoc = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}><path d="M6 3h9l4 4v14H6z" /><path d="M14 3v5h5" /></Svg>
);
export const IconSlide = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M12 16v4M8 20h8" /></Svg>
);
export const IconPlay = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M10 9.5l5 2.5-5 2.5z" /></Svg>
);
