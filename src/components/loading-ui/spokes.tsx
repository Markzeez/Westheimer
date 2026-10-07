import type { SVGProps } from "react";

export function Spokes(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`animate-spin ${props.className ?? ""}`}
      aria-hidden="true"
      {...props}
    >
      {Array.from({ length: 8 }, (_, index) => (
        <line
          key={index}
          x1="24"
          y1="5"
          x2="24"
          y2="12"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          opacity={1 - index * 0.1}
          transform={`rotate(${index * 45} 24 24)`}
        />
      ))}
    </svg>
  );
}