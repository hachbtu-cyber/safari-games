import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { GameStatus } from '../types';

interface FlightArenaProps {
  status: GameStatus;
  currentMultiplier: number;
  finalMultiplier: number | null;
  countdownSeconds: number;
  maxCountdown: number;
  language: 'en' | 'am';
}

export const FlightArena: React.FC<FlightArenaProps> = ({
  status,
  currentMultiplier,
  finalMultiplier,
  countdownSeconds,
  maxCountdown,
  language,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number }>>([]);
  const propAngleRef = useRef<number>(0);

  const currentMultiplierRef = useRef(currentMultiplier);
  currentMultiplierRef.current = currentMultiplier;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      // Handle high-dpi sizing
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // 1. Clear & draw dark savanna sunset gradient background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#0a0a0c'); // Deep space dusk
      bgGrad.addColorStop(0.65, '#120b12'); // Rich safari twilight
      bgGrad.addColorStop(1, '#1c0f0a'); // Warm savanna horizon glow
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Draw radar/flight coordinate grid lines
      ctx.strokeStyle = 'rgba(255, 120, 60, 0.06)';
      ctx.lineWidth = 1;
      const stepX = Math.max(40, width / 12);
      const stepY = Math.max(30, height / 8);

      for (let x = 0; x < width; x += stepX) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = 0; y < height; y += stepY) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Base runway line at bottom
      const groundY = height - 36;
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.25)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(20, groundY);
      ctx.lineTo(width - 20, groundY);
      ctx.stroke();

      // Axis labels (altitude / time)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.font = '10px monospace';
      ctx.fillText('0.00s', 24, groundY + 16);
      ctx.fillText('SAFARI RADAR 2.4 GHz', width - 150, groundY + 16);

      // Increment propeller spin
      propAngleRef.current += status === 'FLYING' ? 0.45 : 0.15;

      // Calculate plane position based on game status
      let planeX = 60;
      let planeY = groundY - 14;
      let angle = 0;

      if (status === 'FLYING') {
        const activeMult = currentMultiplierRef.current;
        const logMult = Math.log(Math.max(1, activeMult));
        // Clamp plane max X to ~82% of width, Y to ~20% of height
        const targetProgress = Math.min(0.9, logMult / 2.8);
        
        // Sine wave micro-turbulence to look like authentic flight!
        const turbulence = Math.sin(Date.now() / 240) * 4;

        planeX = 50 + targetProgress * (width - 140);
        planeY = (groundY - 14) - Math.pow(targetProgress, 0.85) * (height * 0.72) + turbulence;

        // Angle of plane matches curve slope
        angle = -Math.min(0.55, Math.max(0.12, (groundY - planeY) / (planeX + 100)));

        // 3. Draw curved flight trajectory line
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(40, groundY);

        // Control point for quadratic curve
        const cpX = planeX * 0.45;
        const cpY = groundY;

        ctx.quadraticCurveTo(cpX, cpY, planeX - 10, planeY + 8);
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.shadowColor = '#f97316';
        ctx.shadowBlur = 12;
        ctx.stroke();

        // Trajectory fill gradient underneath curve
        ctx.lineTo(planeX - 10, groundY);
        ctx.lineTo(40, groundY);
        ctx.closePath();
        const areaGrad = ctx.createLinearGradient(0, planeY, 0, groundY);
        areaGrad.addColorStop(0, 'rgba(239, 68, 68, 0.18)');
        areaGrad.addColorStop(1, 'rgba(239, 68, 68, 0.01)');
        ctx.fillStyle = areaGrad;
        ctx.fill();
        ctx.restore();

        // 4. Generate and update rocket/exhaust particles
        if (Math.random() < 0.8) {
          particlesRef.current.push({
            x: planeX - 16,
            y: planeY + 12 + (Math.random() * 4 - 2),
            vx: -2 - Math.random() * 3,
            vy: (Math.random() - 0.5) * 1.5,
            life: 1.0,
            maxLife: 20 + Math.random() * 15,
            size: 3 + Math.random() * 4,
          });
        }
      } else if (status === 'CRASHED') {
        // Plane has shot away into the top-right distance
        planeX = width + 100;
        planeY = -50;
      } else {
        // WAITING: idling at start position
        planeX = 65;
        planeY = groundY - 14;
        angle = 0;
      }

      // Draw exhaust particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 1 / p.maxLife;

        if (p.life <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        const pAlpha = Math.max(0, p.life * 0.7);
        ctx.fillStyle = `rgba(249, 115, 22, ${pAlpha})`;
        ctx.shadowColor = '#ea580c';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
      }

      // 5. Draw the Safari Airplane (Bush Plane / Aviator Prop Plane)
      if (status !== 'CRASHED' || planeX < width + 50) {
        ctx.save();
        ctx.translate(planeX, planeY);
        ctx.rotate(angle);

        // Aircraft Shadow
        ctx.save();
        ctx.translate(0, 18);
        ctx.scale(1, 0.3);
        ctx.beginPath();
        ctx.ellipse(0, 0, 24, 6, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.fill();
        ctx.restore();

        // Aircraft Fuselage (Red & Yellow Safari racer)
        // Main body
        const bodyGrad = ctx.createLinearGradient(-26, 0, 24, 0);
        bodyGrad.addColorStop(0, '#b91c1c'); // Dark red tail
        bodyGrad.addColorStop(0.6, '#ef4444'); // Crimson mid
        bodyGrad.addColorStop(1, '#f97316'); // Bright nose

        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.moveTo(24, 0); // Nose cone
        ctx.quadraticCurveTo(15, -9, -16, -7); // Top roof
        ctx.lineTo(-24, -18); // Tail fin top
        ctx.lineTo(-20, -3); // Tail back
        ctx.lineTo(-24, 3); // Tail lower
        ctx.quadraticCurveTo(0, 7, 24, 0); // Belly
        ctx.closePath();
        ctx.fill();

        // Cockpit canopy (Cyan/Ice glass reflection)
        ctx.fillStyle = '#67e8f9';
        ctx.beginPath();
        ctx.ellipse(5, -4, 9, 4, -0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#0891b2';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Main Wing (Golden Safari stripe)
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(6, 2);
        ctx.lineTo(-12, 14);
        ctx.lineTo(-18, 11);
        ctx.lineTo(-2, 0);
        ctx.closePath();
        ctx.fill();

        // Propeller spinner & spinning blades at nose (x = 24)
        ctx.save();
        ctx.translate(25, 0);
        ctx.fillStyle = '#374151';
        ctx.beginPath();
        ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Spinning blur disk or blades
        ctx.rotate(propAngleRef.current);
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.85)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(0, -15);
        ctx.lineTo(0, 15);
        ctx.stroke();

        // Propeller blur circle
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();

        ctx.restore();
      }

      ctx.restore();
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [status]);

  return (
    <div className="relative w-full h-[280px] sm:h-[360px] md:h-[400px] lg:h-[430px] rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950 shadow-2xl select-none">
      {/* Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Safari watermark badge */}
      <div className="absolute top-3 left-4 pointer-events-none flex items-center gap-2">
        <span className="text-[11px] font-black tracking-widest text-neutral-500 uppercase">
          SAFARI PROVABLY FAIR ENGINE
        </span>
      </div>

      {/* Center Dynamic HUD Display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        {/* State: WAITING (Countdown) */}
        {status === 'WAITING' && (
          <div className="flex flex-col items-center gap-3 bg-neutral-950/80 px-6 py-4 rounded-2xl border border-neutral-800/80 backdrop-blur-md shadow-2xl animate-fade-in">
            <div className="relative flex items-center justify-center w-16 h-16">
              {/* Circular SVG spinner countdown */}
              <svg className="w-16 h-16 transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-neutral-800"
                  fill="transparent"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-red-500 transition-all duration-100"
                  fill="transparent"
                  strokeDasharray={175.9}
                  strokeDashoffset={175.9 * (1 - countdownSeconds / maxCountdown)}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute font-mono font-black text-xl text-white">
                {countdownSeconds.toFixed(1)}s
              </span>
            </div>

            <div className="text-center">
              <h3 className="font-extrabold text-white text-base sm:text-lg tracking-wide uppercase">
                {language === 'am' ? 'ቀጣዩ ዙር እየተዘጋጀ ነው' : 'WAITING FOR NEXT ROUND'}
              </h3>
              <p className="text-xs text-orange-400 font-medium">
                {language === 'am' ? 'ውርርድዎን አሁኑኑ ያስቀምጡ!' : 'Place your bet now before takeoff'}
              </p>
            </div>

            {/* Linear progress bar */}
            <div className="w-48 sm:w-60 h-2 bg-neutral-800 rounded-full overflow-hidden border border-neutral-700/50">
              <div
                className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 rounded-full transition-all duration-100"
                style={{ width: `${(countdownSeconds / maxCountdown) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* State: FLYING (Active Multiplier) */}
        {status === 'FLYING' && (
          <div className="flex flex-col items-center select-none transform -translate-y-2">
            <div className="font-black text-5xl sm:text-7xl md:text-8xl tracking-tight text-white drop-shadow-[0_10px_25px_rgba(249,115,22,0.4)] font-mono">
              {currentMultiplier.toFixed(2)}x
            </div>
            <div className="mt-1 flex items-center gap-2 px-3 py-1 rounded-full bg-orange-950/60 border border-orange-700/50 text-orange-300 text-xs font-semibold tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{language === 'am' ? 'አውሮፕላኑ እየበረረ ነው' : 'PLANE IN FLIGHT'}</span>
            </div>
          </div>
        )}

        {/* State: CRASHED ("FLEW AWAY") */}
        {status === 'CRASHED' && (
          <div className="flex flex-col items-center gap-1 select-none animate-bounce-short">
            <div className="text-red-500 font-black text-2xl sm:text-3xl md:text-4xl tracking-widest uppercase drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]">
              {language === 'am' ? 'አውሮፕላኑ በረረ!' : 'FLEW AWAY!'}
            </div>
            <div className="font-mono font-black text-4xl sm:text-6xl md:text-7xl text-neutral-400 drop-shadow">
              {finalMultiplier?.toFixed(2)}x
            </div>
            <span className="text-xs text-neutral-500 font-medium">
              {language === 'am' ? 'ቀጣዩ ዙር በቅርቡ ይጀምራል...' : 'Next round starts shortly...'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
