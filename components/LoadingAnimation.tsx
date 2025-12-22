import React, { useEffect, useRef } from "react";

interface LoadingAnimationProps {
  message?: string;
  submessage?: string;
}

export default function LoadingAnimation({
  message = "Analyzing",
  submessage,
}: LoadingAnimationProps) {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const pathElement = pathRef.current;
    if (!pathElement) return;

    try {
      const pathLength = pathElement.getTotalLength();
      
      pathElement.style.setProperty('--path-length', `${pathLength}`);
      pathElement.style.strokeDasharray = `${pathLength}`;
      pathElement.style.strokeDashoffset = `${pathLength}`;
    } catch (error) {
      console.error("Error calculating path length:", error);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 w-full">
      {/* Animated S Logo */}
      <div className="relative mb-8 w-24 h-24 md:w-32 md:h-32">
        <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
          viewBox="0 0 400 400"
          className="block"
        >
          <defs>
            <style>
              {`
                @keyframes draw-path {
                  0% {
                    stroke-dashoffset: var(--path-length);
                  }
                  50% {
                    stroke-dashoffset: 0;
                  }
                  100% {
                    stroke-dashoffset: var(--path-length);
                  }
                }

                .animated-s-path {
                  fill: none;
                  stroke: #f59e0b; /* amber-500 */
                  stroke-width: 5;
                  stroke-linecap: round;
                  animation: draw-path 5s ease-in-out infinite;
                }

                @media (prefers-reduced-motion: reduce) {
                  .animated-s-path {
                    animation: none;
                    stroke-dashoffset: 0;
                  }
                }
              `}
            </style>
          </defs>
          <g>
            <path
              ref={pathRef}
              className="animated-s-path"
              d="M214.150 98.751 C 189.919 103.180,170.398 123.930,169.325 146.400 C 168.628 160.980,173.693 173.320,193.212 204.600 C 216.917 242.587,220.637 253.997,213.816 267.800 C 202.601 290.495,174.523 293.002,151.000 273.408 C 119.612 247.264,114.406 217.420,136.751 191.724 C 138.318 189.923,139.600 188.301,139.600 188.121 C 139.600 187.941,135.644 183.840,130.809 179.009 L 122.018 170.225 120.571 171.613 C 104.016 187.477,95.596 213.012,99.908 234.279 C 107.941 273.899,153.772 312.987,189.400 310.602 C 221.621 308.445,246.184 279.412,241.427 249.107 C 239.253 235.262,233.761 223.661,215.444 194.225 C 192.312 157.050,190.031 147.782,200.708 134.349 C 215.768 115.401,239.425 117.142,261.202 138.800 C 284.178 161.651,286.347 186.432,267.240 207.790 L 264.386 210.979 273.090 219.690 C 277.877 224.480,282.007 228.400,282.268 228.400 C 282.530 228.400,283.941 227.067,285.405 225.438 C 312.652 195.114,310.419 158.020,279.424 126.076 C 258.967 104.993,234.968 94.947,214.150 98.751"
            />
          </g>
        </svg>
      </div>

      {/* Brand name with animated gradient */}
      <div className="mb-4">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 bg-clip-text text-transparent animate-gradient motion-reduce:animate-none bg-[length:200%_auto]">
          solu AI
        </h2>
      </div>

      {/* Loading message */}
      <div className="text-center space-y-2">
        <p
          className="text-lg font-medium text-slate-900 flex items-center justify-center gap-2"
          data-testid="text-loading-message"
        >
          {message}
          <span className="inline-flex gap-1 pt-2">
            <span
              className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce motion-reduce:animate-none"
              style={{ animationDelay: "0ms" }}
            ></span>
            <span
              className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce motion-reduce:animate-none"
              style={{ animationDelay: "150ms" }}
            ></span>
            <span
              className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce motion-reduce:animate-none"
              style={{ animationDelay: "300ms" }}
            ></span>
          </span>
        </p>
        {submessage && (
          <p
            className="text-sm text-slate-500 max-w-md mx-auto"
            data-testid="text-loading-submessage"
          >
            {submessage}
          </p>
        )}
      </div>
    </div>
  );
}