import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

type BuildfolioIconProps = SVGProps<SVGSVGElement> & {
  variant?: "color" | "mono";
};

/* =========================================================
   BUILDFOLIO ICON
   ---------------------------------------------------------
   Modern abstract folded-ribbon mark.

   IMPORTANT:
   - No BuildFolio text
   - No terminal symbol
   - No ">" symbol
   - No wordmark
   - Works as app icon, favicon and sidebar logo

   Brand colors:
   - Deep plum / black background
   - Bright magenta ribbon
   ========================================================= */

export function BuildfolioIcon({
  className,
  variant = "color",
  ...props
}: BuildfolioIconProps) {
  const mono = variant === "mono";

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      className={cn("shrink-0", className)}
      {...props}
    >
      <defs>
        {/* =====================================================
            BACKGROUND GRADIENT
            ===================================================== */}

        <linearGradient
          id="buildfolio-bg"
          x1="8"
          y1="6"
          x2="58"
          y2="60"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#220914" />
          <stop offset="0.5" stopColor="#180710" />
          <stop offset="1" stopColor="#0D0509" />
        </linearGradient>

        {/* =====================================================
            MAGENTA MAIN GRADIENT
            ===================================================== */}

        <linearGradient
          id="buildfolio-magenta-top"
          x1="13"
          y1="12"
          x2="52"
          y2="38"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#FF1493" />
          <stop offset="0.45" stopColor="#F00078" />
          <stop offset="1" stopColor="#C9005F" />
        </linearGradient>

        {/* =====================================================
            MAGENTA LOWER GRADIENT
            ===================================================== */}

        <linearGradient
          id="buildfolio-magenta-bottom"
          x1="13"
          y1="48"
          x2="52"
          y2="30"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#FF1493" />
          <stop offset="0.5" stopColor="#E50070" />
          <stop offset="1" stopColor="#B80055" />
        </linearGradient>

        {/* =====================================================
            SOFT GLOW
            ===================================================== */}

        <filter
          id="buildfolio-glow"
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
        >
          <feGaussianBlur
            stdDeviation="2"
            result="blur"
          />

          <feColorMatrix
            in="blur"
            type="matrix"
            values="
              1 0 0 0 0.95
              0 1 0 0 0.00
              0 0 1 0 0.35
              0 0 0 0.35 0
            "
          />
        </filter>

        {/* =====================================================
            RIBBON SHADOW
            ===================================================== */}

        <filter
          id="buildfolio-shadow"
          x="-30%"
          y="-30%"
          width="160%"
          height="160%"
        >
          <feDropShadow
            dx="0"
            dy="2"
            stdDeviation="1.5"
            floodColor="#000000"
            floodOpacity="0.4"
          />
        </filter>
      </defs>

      {/* =====================================================
          APP ICON BACKGROUND
          ===================================================== */}

      <rect
        x="1"
        y="1"
        width="62"
        height="62"
        rx="17"
        fill={mono ? "currentColor" : "url(#buildfolio-bg)"}
      />

      {/* =====================================================
          SUBTLE BORDER
          ===================================================== */}

      {!mono && (
        <rect
          x="1.5"
          y="1.5"
          width="61"
          height="61"
          rx="16.5"
          fill="none"
          stroke="#FF4DA8"
          strokeOpacity="0.18"
          strokeWidth="1"
        />
      )}

      {/* =====================================================
          MAGENTA GLOW
          ===================================================== */}

      {!mono && (
        <path
          d="
            M17 19
            C15 19 14 21 15.5 22
            L40 37
            L16 52
            C14 53 14.5 56 17 56
            H31
            C32.5 56 34 55.5 35.5 54.5
            L51 44
            C54 42 54 38 51 36
            L25 18
            C23 16.5 20 16.5 17 19
            Z
          "
          fill="#F00078"
          opacity="0.22"
          filter="url(#buildfolio-glow)"
        />
      )}

      {/* =====================================================
          MAIN RIBBON
          -----------------------------------------------------
          Upper diagonal ribbon.
          ===================================================== */}

      <g filter="url(#buildfolio-shadow)">
        <path
          d="
            M18.5 15
            C15.5 13.2 12 15.3 12 18.8
            V23.8
            C12 26.3 13.3 28.7 15.5 30
            L39.8 44.2
            L48.5 38.8
            L25.2 25.1
            C23.2 23.9 22 21.7 22 19.4
            V18.8
            C22 16.6 20.7 16 18.5 15
            Z
          "
          fill={
            mono
              ? "var(--background)"
              : "url(#buildfolio-magenta-top)"
          }
        />

        {/* =====================================================
            LOWER RIBBON
            ===================================================== */}

        <path
          d="
            M39.8 32.2
            L15.5 46.4
            C13.3 47.7 12 50.1 12 52.6
            V55.1
            C12 58.7 15.7 60.7 18.7 58.9
            L48.5 41.2
            C51.5 39.4 51.5 35.1 48.5 33.3
            L39.8 28.1
            L39.8 32.2
            Z
          "
          fill={
            mono
              ? "var(--background)"
              : "url(#buildfolio-magenta-bottom)"
          }
        />

        {/* =====================================================
            FOLD / OVERLAP
            ===================================================== */}

        {!mono && (
          <path
            d="
              M39.8 32.2
              L48.5 38.8
              L39.8 44.2
              L31.2 39.1
              Z
            "
            fill="#9D0049"
            fillOpacity="0.65"
          />
        )}

        {/* =====================================================
            TOP RIBBON HIGHLIGHT
            ===================================================== */}

        {!mono && (
          <path
            d="
              M17.2 16.8
              C15.4 15.8 13.5 17.1 13.5 19.2
              V22.5
              C13.5 24.5 14.5 26.1 16.2 27.1
              L38.2 40
            "
            fill="none"
            stroke="#FF4DA8"
            strokeOpacity="0.42"
            strokeWidth="1"
            strokeLinecap="round"
          />
        )}

        {/* =====================================================
            LOWER RIBBON HIGHLIGHT
            ===================================================== */}

        {!mono && (
          <path
            d="
              M16.5 48.2
              L42.8 32.7
            "
            fill="none"
            stroke="#FF4DA8"
            strokeOpacity="0.32"
            strokeWidth="1"
            strokeLinecap="round"
          />
        )}
      </g>

      {/* =====================================================
          SMALL MAGENTA LIGHT
          ===================================================== */}

      {!mono && (
        <circle
          cx="48"
          cy="16"
          r="1.4"
          fill="#FF4DA8"
          opacity="0.65"
        />
      )}
    </svg>
  );
}

/* =========================================================
   BUILDFOLIO LOGO
   ---------------------------------------------------------
   IMPORTANT:
   This intentionally contains ONLY the icon.
   There is NO BuildFolio text.

   Existing components can continue using:

       <BuildfolioLogo />

   without changing all your existing imports.
   ========================================================= */

export function BuildfolioLogo({
  className,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <BuildfolioIcon
      className={className}
      {...props}
    />
  );
}