const http = require('http');

/**
 * Main request handler that works for both CLI and Google Cloud Functions.
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
const handleRequest = (req, res) => {
  // Strip query string if present

  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Transfer-Encoding': 'chunked',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
  });

  res.write(`
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Declarative Grandfather Clock</title>
  <style>
    /* ==========================================================================
       1. Global Styles & Environment
       ========================================================================== */
    :root {
      --bg-gradient: radial-gradient(circle at 50% 30%, #2a1b18 0%, #120907 70%, #080403 100%);
      --wood-dark: #2b1108;
      --wood-mid: #4a2111;
      --wood-light: #6e331b;
      --wood-highlight: #8c4325;
      --brass-light: #ffe89e;
      --brass-mid: #d4af37;
      --brass-dark: #8a6d1c;
      --brass-shadow: #47370a;

      /* Default fallback variable values */
      --h: 11;
      --m: 53;
      --s: 32;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Cinzel', 'Georgia', 'Times New Roman', serif;
      background: var(--bg-gradient);
      color: #e0d0b8;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
      overflow-x: hidden;
    }

    /* Container layout */
    .app-container {
      display: flex;
      flex-wrap: wrap;
      gap: 3rem;
      align-items: center;
      justify-content: center;
      max-width: 1200px;
      width: 100%;
    }

    header {
      text-align: center;
      margin-bottom: 2rem;
    }

    header h1 {
      font-size: 2.2rem;
      font-weight: 700;
      letter-spacing: 2px;
      color: var(--brass-light);
      text-shadow: 0 2px 10px rgba(212, 175, 55, 0.3), 0 4px 20px rgba(0, 0, 0, 0.8);
      margin-bottom: 0.5rem;
    }

    header p {
      font-size: 1rem;
      color: #b39b7d;
      font-style: italic;
    }

    /* ==========================================================================
       2. CSS DATA-ATTRIBUTE TIME MAPPING ENGINE
       ==========================================================================
       This section extracts time values from data-hours, data-minutes, and
       data-seconds attributes on the grandfather-clock <div> into CSS variables,
       and calculates rotation angles for the clock hands purely via CSS.
       ========================================================================== */

    /* Modern CSS attr() Time Mapping Engine */
    .grandfather-clock {
      --h: attr(data-hours type(<number>), 0);
      --m: attr(data-minutes type(<number>), 0);
      --s: attr(data-seconds type(<number>), 0);
    }

    /* Hands Rotation CSS Formulas */
    .hand.hour {
      /* 30deg per hour + 0.5deg per minute + (0.5/60)deg per second */
      transform: rotate(calc((var(--h) * 30deg) + (var(--m) * 0.5deg) + (var(--s) * 0.008333deg)));
      transition: transform 0.5s cubic-bezier(0.4, 2.08, 0.55, 0.44);
    }

    .hand.minute {
      /* 6deg per minute + 0.1deg per second */
      transform: rotate(calc((var(--m) * 6deg) + (var(--s) * 0.1deg)));
      transition: transform 0.5s cubic-bezier(0.4, 2.08, 0.55, 0.44);
    }

    .hand.second {
      /* 6deg per second */
      transform: rotate(calc(var(--s) * 6deg));
      transition: transform 0.2s cubic-bezier(0.4, 2.08, 0.55, 0.44);
    }


    /* ==========================================================================
       3. Grandfather Clock Visual Architecture & Wooden Case Styling
       ========================================================================== */

    .grandfather-clock {
      position: relative;
      width: 270px;
      display: flex;
      flex-direction: column;
      align-items: center;
      filter: drop-shadow(0 25px 35px rgba(0, 0, 0, 0.85));
      user-select: none;
    }

    /* --- Top Bonnet & Swan Neck Pediment --- */
    .clock-pediment {
      position: relative;
      width: 270px;
      height: 75px;
      background: linear-gradient(90deg, var(--wood-dark) 0%, var(--wood-mid) 20%, var(--wood-light) 50%, var(--wood-mid) 80%, var(--wood-dark) 100%);
      border-radius: 120px 120px 0 0;
      border: 3px solid var(--wood-highlight);
      border-bottom: none;
      box-shadow: inset 0 5px 15px rgba(255, 255, 255, 0.15), inset 0 -10px 20px rgba(0, 0, 0, 0.6);
      display: flex;
      justify-content: center;
      align-items: flex-start;
    }

    .finial {
      position: absolute;
      top: -32px;
      width: 28px;
      height: 48px;
      background: radial-gradient(circle at 35% 30%, var(--brass-light), var(--brass-mid) 60%, var(--brass-dark) 100%);
      border-radius: 50% 50% 40% 40%;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.6);
      z-index: 10;
    }

    .finial::before {
      content: '';
      position: absolute;
      top: -12px;
      left: 50%;
      transform: translateX(-50%);
      width: 10px;
      height: 14px;
      background: radial-gradient(circle at 30% 30%, var(--brass-light), var(--brass-mid));
      border-radius: 50%;
    }

    .finial::after {
      content: '';
      position: absolute;
      bottom: -6px;
      left: 50%;
      transform: translateX(-50%);
      width: 36px;
      height: 8px;
      background: linear-gradient(90deg, var(--brass-dark), var(--brass-light), var(--brass-dark));
      border-radius: 3px;
    }

    .moulding-top {
      width: 280px;
      height: 14px;
      background: linear-gradient(90deg, var(--wood-dark), var(--wood-light) 50%, var(--wood-dark));
      border: 2px solid var(--wood-highlight);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.7);
      margin-top: -2px;
      z-index: 5;
    }

    /* --- Clock Hood (Upper Dial Section) --- */
    .clock-hood {
      position: relative;
      width: 250px;
      height: 250px;
      background: linear-gradient(90deg, var(--wood-dark) 0%, var(--wood-mid) 15%, var(--wood-light) 50%, var(--wood-mid) 85%, var(--wood-dark) 100%);
      border: 3px solid var(--wood-highlight);
      padding: 12px;
      display: flex;
      justify-content: center;
      align-items: center;
      box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.8);
    }

    .hood-glass-door {
      position: relative;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0) 70%);
      border: 4px solid var(--brass-mid);
      border-radius: 50% 50% 4px 4px;
      padding: 8px;
      display: flex;
      justify-content: center;
      align-items: center;
      box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.6), 0 0 10px rgba(212, 175, 55, 0.4);
    }

    /* --- Clock Face & Dial --- */
    .clock-face {
      position: relative;
      width: 200px;
      height: 200px;
      background: radial-gradient(circle, #fffdfa 0%, #f7eedb 70%, #ebd7b2 100%);
      border-radius: 50%;
      border: 6px solid var(--brass-mid);
      box-shadow: 0 0 0 2px var(--brass-dark), inset 0 0 12px rgba(0, 0, 0, 0.4);
    }

    /* Moon Phase Arch sub-dial */
    .moon-phase {
      position: absolute;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      width: 90px;
      height: 45px;
      background: radial-gradient(circle at 50% 100%, #152238 0%, #0a1128 100%);
      border-radius: 45px 45px 0 0;
      border: 2px solid var(--brass-mid);
      overflow: hidden;
    }

    .moon-phase .stars {
      position: absolute;
      width: 100%;
      height: 100%;
      background-image:
        radial-gradient(1px 1px at 20px 10px, #fff, rgba(0, 0, 0, 0)),
        radial-gradient(1.5px 1.5px at 70px 15px, #ffe89e, rgba(0, 0, 0, 0)),
        radial-gradient(1px 1px at 45px 8px, #fff, rgba(0, 0, 0, 0)),
        radial-gradient(1px 1px at 30px 25px, #fff, rgba(0, 0, 0, 0));
    }

    .moon-phase .moon {
      position: absolute;
      bottom: 2px;
      left: 32px;
      width: 24px;
      height: 24px;
      background: radial-gradient(circle at 35% 35%, #fffbdf, #ffd700 70%, #d4af37 100%);
      border-radius: 50%;
      box-shadow: 0 0 8px rgba(255, 232, 158, 0.8);
    }

    /* Roman Numerals Positioning */
    .roman-numeral {
      position: absolute;
      width: 24px;
      height: 24px;
      top: calc(50% - 12px);
      left: calc(50% - 12px);
      text-align: center;
      line-height: 24px;
      font-size: 0.95rem;
      font-weight: 700;
      color: #2b180d;
      text-shadow: 0 1px 1px rgba(255, 255, 255, 0.8);
    }

    .num-12 {
      transform: rotate(0deg) translateY(-72px) rotate(0deg);
    }

    .num-1 {
      transform: rotate(30deg) translateY(-72px) rotate(-30deg);
    }

    .num-2 {
      transform: rotate(60deg) translateY(-72px) rotate(-60deg);
    }

    .num-3 {
      transform: rotate(90deg) translateY(-72px) rotate(-90deg);
    }

    .num-4 {
      transform: rotate(120deg) translateY(-72px) rotate(-120deg);
    }

    .num-5 {
      transform: rotate(150deg) translateY(-72px) rotate(-150deg);
    }

    .num-6 {
      transform: rotate(180deg) translateY(-72px) rotate(-180deg);
    }

    .num-7 {
      transform: rotate(210deg) translateY(-72px) rotate(-210deg);
    }

    .num-8 {
      transform: rotate(240deg) translateY(-72px) rotate(-240deg);
    }

    .num-9 {
      transform: rotate(270deg) translateY(-72px) rotate(-270deg);
    }

    .num-10 {
      transform: rotate(300deg) translateY(-72px) rotate(-300deg);
    }

    .num-11 {
      transform: rotate(330deg) translateY(-72px) rotate(-330deg);
    }

    /* Central Hand Arbor / Pivot Cap */
    .arbor-cap {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 14px;
      height: 14px;
      background: radial-gradient(circle at 30% 30%, var(--brass-light), var(--brass-mid) 70%, var(--brass-dark));
      border-radius: 50%;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.6), inset 0 1px 2px rgba(255, 255, 255, 0.8);
      z-index: 25;
    }

    /* Hands Positioning & Base Styles */
    .hand {
      position: absolute;
      top: 50%;
      left: 50%;
      transform-origin: 50% 100%;
      z-index: 20;
    }

    .hand-svg {
      display: block;
      width: 100%;
      height: 100%;
      filter: drop-shadow(2px 3px 3px rgba(0, 0, 0, 0.4));
    }

    .hand.hour {
      width: 14px;
      height: 54px;
      margin-left: -7px;
      margin-top: -54px;
    }

    .hand.minute {
      width: 10px;
      height: 74px;
      margin-left: -5px;
      margin-top: -74px;
    }

    .hand.second {
      width: 6px;
      height: 84px;
      margin-left: -3px;
      margin-top: -70px;
      /* extends slightly behind center pivot */
      transform-origin: 50% 83.33%;
    }

    /* --- Clock Waist / Middle Trunk Section --- */
    .moulding-mid-1 {
      width: 260px;
      height: 12px;
      background: linear-gradient(90deg, var(--wood-dark), var(--wood-light) 50%, var(--wood-dark));
      border: 2px solid var(--wood-highlight);
      z-index: 5;
    }

    .clock-waist {
      position: relative;
      width: 220px;
      height: 340px;
      background: linear-gradient(90deg, var(--wood-dark) 0%, var(--wood-mid) 15%, var(--wood-light) 50%, var(--wood-mid) 85%, var(--wood-dark) 100%);
      border: 3px solid var(--wood-highlight);
      padding: 12px;
      display: flex;
      justify-content: center;
      box-shadow: inset 0 0 25px rgba(0, 0, 0, 0.9);
    }

    .waist-glass-window {
      position: relative;
      width: 100%;
      height: 100%;
      background: radial-gradient(ellipse at 50% 20%, #1c0e07 0%, #0d0603 100%);
      border: 3px solid var(--brass-dark);
      border-radius: 6px;
      overflow: hidden;
      box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.95);
    }

    /* Glass glare overlay */
    .waist-glass-window::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0) 45%, rgba(255, 255, 255, 0.04) 100%);
      pointer-events: none;
      z-index: 15;
    }

    /* Pendulum & Weights */
    .chains {
      position: absolute;
      top: 0;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: space-around;
      padding: 0 45px;
      pointer-events: none;
    }

    .chain {
      width: 2px;
      height: 220px;
      background: repeating-linear-gradient(0deg, var(--brass-dark) 0px, var(--brass-light) 3px, var(--brass-shadow) 6px);
      box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.7);
    }

    .weights {
      position: absolute;
      top: 70px;
      width: 100%;
      display: flex;
      justify-content: space-around;
      padding: 0 35px;
      pointer-events: none;
    }

    .weight {
      width: 22px;
      height: 130px;
      background: linear-gradient(90deg, var(--brass-shadow) 0%, var(--brass-mid) 30%, var(--brass-light) 60%, var(--brass-dark) 100%);
      border-radius: 4px 4px 10px 10px;
      box-shadow: 3px 5px 10px rgba(0, 0, 0, 0.8), inset 0 2px 4px rgba(255, 255, 255, 0.5);
      border: 1px solid var(--brass-dark);
    }

    .weight.left {
      transform: translateY(-15px);
    }

    .weight.right {
      transform: translateY(15px);
    }

    /* Animated Swinging Pendulum */
    .pendulum-assembly {
      position: absolute;
      top: -10px;
      left: 50%;
      transform: translateX(-50%);
      width: 60px;
      height: 290px;
      transform-origin: 50% 0%;
      animation: pendulum-swing 2.4s ease-in-out infinite alternate;
      z-index: 10;
    }

    .pendulum-assembly.paused {
      animation-play-state: paused;
    }

    .pendulum-rod {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 4px;
      height: 230px;
      background: linear-gradient(90deg, var(--brass-dark), var(--brass-light), var(--brass-dark));
      box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.6);
    }

    .pendulum-bob {
      position: absolute;
      bottom: 10px;
      left: 50%;
      transform: translateX(-50%);
      width: 52px;
      height: 52px;
      background: radial-gradient(circle at 35% 35%, var(--brass-light) 0%, var(--brass-mid) 50%, var(--brass-dark) 85%, var(--brass-shadow) 100%);
      border-radius: 50%;
      border: 2px solid var(--brass-light);
      box-shadow: 0 6px 15px rgba(0, 0, 0, 0.8), inset 0 0 8px rgba(255, 255, 255, 0.7);
    }

    @keyframes pendulum-swing {
      0% {
        transform: translateX(-50%) rotate(-4.5deg);
      }

      100% {
        transform: translateX(-50%) rotate(4.5deg);
      }
    }

    /* --- Base / Lower Pedestal Section --- */
    .moulding-mid-2 {
      width: 250px;
      height: 14px;
      background: linear-gradient(90deg, var(--wood-dark), var(--wood-light) 50%, var(--wood-dark));
      border: 2px solid var(--wood-highlight);
      z-index: 5;
    }

    .clock-base {
      position: relative;
      width: 270px;
      height: 110px;
      background: linear-gradient(90deg, var(--wood-dark) 0%, var(--wood-mid) 15%, var(--wood-light) 50%, var(--wood-mid) 85%, var(--wood-dark) 100%);
      border: 3px solid var(--wood-highlight);
      border-bottom: none;
      display: flex;
      justify-content: center;
      align-items: center;
      box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.8);
    }

    .base-panel {
      width: 210px;
      height: 75px;
      border: 3px double var(--wood-highlight);
      background: linear-gradient(135deg, rgba(0, 0, 0, 0.4), rgba(255, 255, 255, 0.03));
      box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .base-emblem {
      width: 40px;
      height: 40px;
      border: 2px solid var(--brass-dark);
      transform: rotate(45deg);
      background: radial-gradient(circle, var(--brass-mid), var(--brass-shadow));
      opacity: 0.7;
    }

    .clock-feet {
      width: 286px;
      height: 20px;
      background: linear-gradient(90deg, var(--wood-dark), var(--wood-mid) 50%, var(--wood-dark));
      border: 2px solid var(--wood-highlight);
      border-radius: 0 0 8px 8px;
      box-shadow: 0 8px 15px rgba(0, 0, 0, 0.9);
    }


    /* ==========================================================================
       4. Information Section
       ========================================================================== */

    .info-panel {
      background: rgba(30, 18, 14, 0.85);
      border: 2px solid var(--brass-dark);
      border-radius: 12px;
      padding: 1.8rem;
      width: 440px;
      max-width: 100%;
      box-shadow: 0 15px 30px rgba(0, 0, 0, 0.7), inset 0 0 15px rgba(212, 175, 55, 0.1);
      backdrop-filter: blur(8px);
    }

    .panel-title {
      font-size: 1.3rem;
      color: var(--brass-light);
      border-bottom: 1px solid var(--brass-dark);
      padding-bottom: 0.6rem;
      margin-bottom: 1.2rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    a {
      color: var(--brass-light);
    }

    /* Responsive adjustment */
    @media (max-width: 768px) {
      .app-container {
        flex-direction: column;
      }

      .info-panel {
        width: 100%;
      }
    }
  </style>
  <?start name="extra-css"><?end>
</head>

<body>

  <header>
    <h1>Declarative Grandfather Clock</h1>
    <p>Hand rotation driven purely by CSS data-attribute selectors</p>
  </header>

  <div class="app-container">

    <!-- ==========================================================================
         TARGET HTML DIV: Grandfather Clock with Time Data Attributes
         ========================================================================== -->
    <div id="grandfather-clock" class="grandfather-clock" data-hours="${(new Date).getHours()}" data-minutes="${(new Date).getMinutes()}" data-seconds="${(new Date).getSeconds()}">

      <!-- Top Bonnet & Finial -->
      <div class="finial"></div>
      <div class="clock-pediment"></div>
      <div class="moulding-top"></div>

      <!-- Upper Hood (Clock Face Section) -->
      <div class="clock-hood">
        <div class="hood-glass-door">
          <div class="clock-face">

            <!-- Moon Phase Arch -->
            <div class="moon-phase">
              <div class="stars"></div>
              <div class="moon"></div>
            </div>

            <!-- Roman Numerals -->
            <div class="roman-numeral num-12">XII</div>
            <div class="roman-numeral num-1">I</div>
            <div class="roman-numeral num-2">II</div>
            <div class="roman-numeral num-3">III</div>
            <div class="roman-numeral num-4">IV</div>
            <div class="roman-numeral num-5">V</div>
            <div class="roman-numeral num-6">VI</div>
            <div class="roman-numeral num-7">VII</div>
            <div class="roman-numeral num-8">VIII</div>
            <div class="roman-numeral num-9">IX</div>
            <div class="roman-numeral num-10">X</div>
            <div class="roman-numeral num-11">XI</div>

            <!-- SVG Clock Hands (Rotated by CSS formulas based on data attributes) -->

            <!-- Hour Hand -->
            <div class="hand hour">
              <svg class="hand-svg" viewBox="0 0 20 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="brass-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#47370a" />
                    <stop offset="50%" stop-color="#ffe89e" />
                    <stop offset="100%" stop-color="#8a6d1c" />
                  </linearGradient>
                </defs>
                <path
                  d="M10 0 L15 15 C19 22 19 28 15 35 L12 37 L12 90 L16 94 L16 100 L4 100 L4 94 L8 90 L8 37 L5 35 C1 28 1 22 5 15 Z M10 18 C8 18 8 26 10 26 C12 26 12 18 10 18 Z"
                  fill="url(#brass-grad)" />
              </svg>
            </div>

            <!-- Minute Hand -->
            <div class="hand minute">
              <svg class="hand-svg" viewBox="0 0 16 140" preserveAspectRatio="none">
                <path
                  d="M8 0 L12 18 C16 30 16 42 12 52 L10 55 L10 132 L14 135 L14 140 L2 140 L2 135 L6 132 L6 55 L4 52 C0 42 0 30 4 18 Z M8 22 C6.5 22 6.5 32 8 32 C9.5 32 9.5 22 8 22 Z"
                  fill="url(#brass-grad)" />
              </svg>
            </div>

            <!-- Second Hand -->
            <div class="hand second">
              <svg class="hand-svg" viewBox="0 0 10 160" preserveAspectRatio="none">
                <path
                  d="M5 0 L7 125 L10 130 C12 134 12 142 10 146 L7 150 L7 160 L3 160 L3 150 L0 146 C-2 142 -2 134 0 130 L3 125 Z"
                  fill="#c026d3" />
                <circle cx="5" cy="138" r="3" fill="#ffe89e" />
              </svg>
            </div>

            <!-- Center Pivot Cap -->
            <div class="arbor-cap"></div>

          </div>
        </div>
      </div>

      <!-- Middle Trunk (Waist) Section -->
      <div class="moulding-mid-1"></div>
      <div class="clock-waist">
        <div class="waist-glass-window">

          <!-- Golden Chains -->
          <div class="chains">
            <div class="chain"></div>
            <div class="chain"></div>
          </div>

          <!-- Brass Weights -->
          <div class="weights">
            <div class="weight left"></div>
            <div class="weight right"></div>
          </div>

          <!-- Swinging Pendulum -->
          <div id="pendulum" class="pendulum-assembly">
            <div class="pendulum-rod"></div>
            <div class="pendulum-bob"></div>
          </div>

        </div>
      </div>

      <!-- Base Section -->
      <div class="moulding-mid-2"></div>
      <div class="clock-base">
        <div class="base-panel">
          <div class="base-emblem"></div>
        </div>
      </div>
      <div class="clock-feet"></div>

    </div>

    <!-- Info Panel -->
    <div class="info-panel">
      <div class="panel-title">
        <span>⏱️</span> Streaming Grandfather Clock
      </div>
        <p>
          <strong>How it works:</strong> This non-JavaScript clock uses modern CSS to render the clock and the time based on data attributes. Then it uses the <code>&lt;template for&gt;</code> to stream in updates to those data attributes by replacing the HTML.
        </p>
        <br>
        <p>
          Inspired by <a href="https://www.netlify.com/blog/2018/08/02/exploring-the-potential-of-friction-free-deployments/">Phil Hawksworth</a>.
        </p>
        <br>
        <p>
          <em>Note this is only a demonstration to show what's possible with <code>&lt;template for&gt;</code> out-of-order streaming. It's the wrong way of doing this, and it should be done with JavaScript. But it's fun! And we all need a little more fun in our lives.</em> 🤷‍♂️
        </p>
    </div>

  </div>
  `);
  if (typeof res.flush === 'function') res.flush();

  let counter = 0;

  const timer = setInterval(() => {
    if (res.destroyed) {
      clearInterval(timer);
      return;
    }

    res.write(`  <template for="extra-css">
    <?start name="extra-css">
    <style>
      .grandfather-clock {
        --h: ${(new Date).getHours()};
        --m: ${(new Date).getMinutes()};
        --s: ${(new Date).getSeconds()};
      }
    </style>
    <?end>
  </template>\n\n`);

    if (typeof res.flush === 'function') {
      res.flush();
    }

    if (counter > 100) {
      clearInterval(timer);
      res.end();
    }
  }, 1000);

};

// Export for Google Cloud Functions
// Uses the deployment name as the entry point
exports['declarative-patching-counter'] = handleRequest;
// Fallback exports
exports.serve = handleRequest;
exports.handler = handleRequest;

// Start server if run directly via CLI
if (require.main === module) {
  const port = process.env.PORT || 8080;
  const server = http.createServer(handleRequest);
  server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
  });
}
