import React, { useState, useEffect, useRef } from 'react';
import { 
  Footprints, ArrowUp, Trophy, Sparkles, 
  RotateCcw, ShieldCheck, AlertTriangle, ArrowRight 
} from 'lucide-react';
import { Currency, ChickenDifficulty } from '../types';
import { soundManager } from '../utils/sound';
import { triggerTelegramHaptic } from '../utils/telegram';
import confetti from 'canvas-confetti';

interface ChickenRoadGameProps {
  balance: number;
  currency: Currency;
  isDemoMode: boolean;
  language: 'en' | 'am';
  onDeductBalance: (amount: number) => void;
  onCreditBalance: (amount: number) => void;
  onOpenDeposit: () => void;
}

interface LaneConfig {
  step: number;
  multiplier: number;
  dangerRate: number;
  vehicleType: 'taxi' | 'sports' | 'jeep' | 'truck';
  speed: number;
  direction: 1 | -1;
}

const DIFFICULTY_CONFIG: Record<ChickenDifficulty, LaneConfig[]> = {
  EASY: [
    { step: 1, multiplier: 1.15, dangerRate: 0.08, vehicleType: 'taxi', speed: 2.2, direction: 1 },
    { step: 2, multiplier: 1.35, dangerRate: 0.12, vehicleType: 'jeep', speed: 2.6, direction: -1 },
    { step: 3, multiplier: 1.62, dangerRate: 0.15, vehicleType: 'truck', speed: 1.8, direction: 1 },
    { step: 4, multiplier: 1.98, dangerRate: 0.18, vehicleType: 'sports', speed: 3.5, direction: -1 },
    { step: 5, multiplier: 2.45, dangerRate: 0.22, vehicleType: 'jeep', speed: 2.8, direction: 1 },
    { step: 6, multiplier: 3.10, dangerRate: 0.26, vehicleType: 'taxi', speed: 2.5, direction: -1 },
    { step: 7, multiplier: 4.10, dangerRate: 0.30, vehicleType: 'truck', speed: 2.0, direction: 1 },
    { step: 8, multiplier: 5.60, dangerRate: 0.34, vehicleType: 'sports', speed: 3.8, direction: -1 },
    { step: 9, multiplier: 8.00, dangerRate: 0.38, vehicleType: 'jeep', speed: 2.9, direction: 1 },
    { step: 10, multiplier: 12.50, dangerRate: 0.42, vehicleType: 'truck', speed: 2.2, direction: -1 },
  ],
  MEDIUM: [
    { step: 1, multiplier: 1.25, dangerRate: 0.15, vehicleType: 'taxi', speed: 2.4, direction: 1 },
    { step: 2, multiplier: 1.65, dangerRate: 0.20, vehicleType: 'jeep', speed: 2.8, direction: -1 },
    { step: 3, multiplier: 2.25, dangerRate: 0.25, vehicleType: 'sports', speed: 4.0, direction: 1 },
    { step: 4, multiplier: 3.20, dangerRate: 0.30, vehicleType: 'truck', speed: 2.2, direction: -1 },
    { step: 5, multiplier: 4.80, dangerRate: 0.35, vehicleType: 'jeep', speed: 3.0, direction: 1 },
    { step: 6, multiplier: 7.50, dangerRate: 0.40, vehicleType: 'taxi', speed: 2.7, direction: -1 },
    { step: 7, multiplier: 12.00, dangerRate: 0.44, vehicleType: 'sports', speed: 4.2, direction: 1 },
    { step: 8, multiplier: 20.00, dangerRate: 0.48, vehicleType: 'truck', speed: 2.5, direction: -1 },
    { step: 9, multiplier: 35.00, dangerRate: 0.52, vehicleType: 'jeep', speed: 3.2, direction: 1 },
    { step: 10, multiplier: 70.00, dangerRate: 0.56, vehicleType: 'sports', speed: 4.5, direction: -1 },
  ],
  HARD: [
    { step: 1, multiplier: 1.50, dangerRate: 0.26, vehicleType: 'sports', speed: 4.2, direction: 1 },
    { step: 2, multiplier: 2.30, dangerRate: 0.34, vehicleType: 'truck', speed: 2.5, direction: -1 },
    { step: 3, multiplier: 3.80, dangerRate: 0.40, vehicleType: 'jeep', speed: 3.4, direction: 1 },
    { step: 4, multiplier: 6.50, dangerRate: 0.46, vehicleType: 'sports', speed: 4.6, direction: -1 },
    { step: 5, multiplier: 12.00, dangerRate: 0.52, vehicleType: 'taxi', speed: 3.0, direction: 1 },
    { step: 6, multiplier: 24.00, dangerRate: 0.56, vehicleType: 'truck', speed: 2.6, direction: -1 },
    { step: 7, multiplier: 48.00, dangerRate: 0.60, vehicleType: 'jeep', speed: 3.6, direction: 1 },
    { step: 8, multiplier: 95.00, dangerRate: 0.65, vehicleType: 'sports', speed: 5.0, direction: -1 },
  ],
  DAREDEVIL: [
    { step: 1, multiplier: 2.20, dangerRate: 0.48, vehicleType: 'sports', speed: 4.8, direction: 1 },
    { step: 2, multiplier: 5.50, dangerRate: 0.55, vehicleType: 'truck', speed: 2.8, direction: -1 },
    { step: 3, multiplier: 14.00, dangerRate: 0.62, vehicleType: 'jeep', speed: 3.8, direction: 1 },
    { step: 4, multiplier: 38.00, dangerRate: 0.68, vehicleType: 'sports', speed: 5.2, direction: -1 },
    { step: 5, multiplier: 95.00, dangerRate: 0.72, vehicleType: 'truck', speed: 3.0, direction: 1 },
    { step: 6, multiplier: 250.00, dangerRate: 0.78, vehicleType: 'sports', speed: 5.5, direction: -1 },
  ],
};

interface VehicleItem {
  id: number;
  laneIndex: number;
  x: number;
  speed: number;
  direction: 1 | -1;
  type: 'taxi' | 'sports' | 'jeep' | 'truck';
  width: number;
  color: string;
}

export const ChickenRoadGame: React.FC<ChickenRoadGameProps> = ({
  balance,
  currency,
  isDemoMode,
  language,
  onDeductBalance,
  onCreditBalance,
  onOpenDeposit,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [betAmount, setBetAmount] = useState<number>(20);
  const [difficulty, setDifficulty] = useState<ChickenDifficulty>('MEDIUM');
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'CASHED_OUT' | 'CRASHED'>('IDLE');
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [crashedLane, setCrashedLane] = useState<number | null>(null);

  const [historyRuns, setHistoryRuns] = useState<Array<{ id: string; mult: number; won: boolean; amount: number }>>([
    { id: '1', mult: 2.25, won: true, amount: 45 },
    { id: '2', mult: 1.00, won: false, amount: 20 },
    { id: '3', mult: 4.80, won: true, amount: 96 },
    { id: '4', mult: 1.25, won: true, amount: 25 },
  ]);

  const lanes = DIFFICULTY_CONFIG[difficulty];
  const activeMultiplier = currentStep > 0 ? lanes[currentStep - 1].multiplier : 1.0;
  const currentWinAmount = betAmount * activeMultiplier;

  // Refs for smooth 60fps canvas rendering without React re-render lags
  const currentStepRef = useRef(currentStep);
  currentStepRef.current = currentStep;

  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  const crashedLaneRef = useRef(crashedLane);
  crashedLaneRef.current = crashedLane;

  const chickenPosRef = useRef({
    x: 0,
    y: 0,
    targetY: 0,
    jumpArc: 0,
    isJumping: false,
    jumpProgress: 0,
    wingFlap: 0,
    rotation: 0,
  });

  const vehiclesRef = useRef<VehicleItem[]>([]);
  const cameraYRef = useRef<number>(0);
  const animFrameIdRef = useRef<number | null>(null);

  const quickChips = [10, 20, 50, 100, 250, 500];

  // Initialize and spawn traffic vehicles on road lanes
  useEffect(() => {
    const list: VehicleItem[] = [];
    lanes.forEach((lane, laneIdx) => {
      // 2 or 3 vehicles per lane spaced out
      const count = 2;
      for (let i = 0; i < count; i++) {
        const colors = {
          taxi: '#eab308',
          sports: '#ef4444',
          jeep: '#16a34a',
          truck: '#2563eb',
        };
        const widths = {
          taxi: 55,
          sports: 50,
          jeep: 54,
          truck: 75,
        };

        list.push({
          id: laneIdx * 10 + i,
          laneIndex: laneIdx,
          x: (i * 350 + Math.random() * 100) * (lane.direction === 1 ? 1 : -1),
          speed: lane.speed * (0.9 + Math.random() * 0.2),
          direction: lane.direction,
          type: lane.vehicleType,
          width: widths[lane.vehicleType],
          color: colors[lane.vehicleType],
        });
      }
    });
    vehiclesRef.current = list;
  }, [difficulty, lanes]);

  // Main Canvas Render Loop (Top-Down Video Game View)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Lane dimensions
      const laneHeight = 64;
      const totalLanes = lanes.length;
      const curbHeight = 70;
      const finishHeight = 80;
      const roadTotalHeight = curbHeight + totalLanes * laneHeight + finishHeight;

      // Center the road
      const roadLeft = Math.max(0, (width - 680) / 2);
      const roadWidth = Math.min(width, 680);

      // Camera smooth follow: track chicken Y
      const currentStepVal = currentStepRef.current;
      const targetCameraY = Math.max(
        0,
        Math.min(roadTotalHeight - height, (totalLanes - currentStepVal) * laneHeight - height / 2 + 60)
      );
      cameraYRef.current += (targetCameraY - cameraYRef.current) * 0.1;
      const camY = cameraYRef.current;

      ctx.save();
      ctx.translate(0, -camY);

      // 1. Draw Savannah / Grass Borders on left and right
      ctx.fillStyle = '#064e3b'; // Lush deep grass
      ctx.fillRect(0, 0, width, roadTotalHeight);

      // Decorative grass flowers
      ctx.fillStyle = '#fef08a';
      for (let i = 0; i < roadTotalHeight; i += 80) {
        ctx.fillRect(roadLeft - 20, i + 10, 4, 4);
        ctx.fillRect(roadLeft + roadWidth + 16, i + 35, 4, 4);
      }

      // 2. Draw Main Asphalt Road
      ctx.fillStyle = '#18181b'; // Dark asphalt
      ctx.fillRect(roadLeft, 0, roadWidth, roadTotalHeight);

      // Road Curbs (Red and white striped curbs)
      for (let y = 0; y < roadTotalHeight; y += 24) {
        ctx.fillStyle = (y / 24) % 2 === 0 ? '#ef4444' : '#f4f4f5';
        ctx.fillRect(roadLeft, y, 6, 24);
        ctx.fillRect(roadLeft + roadWidth - 6, y, 6, 24);
      }

      // 3. Draw Finish Line at Top (y = 0 to finishHeight)
      ctx.fillStyle = '#047857';
      ctx.fillRect(roadLeft + 6, 0, roadWidth - 12, finishHeight);

      // Checkered finish line pattern
      const checkSize = 14;
      for (let cx = roadLeft + 6; cx < roadLeft + roadWidth - 12; cx += checkSize) {
        for (let cy = finishHeight - 28; cy < finishHeight; cy += checkSize) {
          ctx.fillStyle = (Math.floor(cx / checkSize) + Math.floor(cy / checkSize)) % 2 === 0 ? '#ffffff' : '#000000';
          ctx.fillRect(cx, cy, checkSize, checkSize);
        }
      }

      // Finish Trophy Sign
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🏆 FINISH LINE - MAX PAYOUT 🏆', roadLeft + roadWidth / 2, finishHeight - 40);

      // 4. Draw Individual Road Lanes (from top down)
      lanes.forEach((lane, idx) => {
        // Lane Y position (lane 1 is near bottom, lane 10 near top)
        const laneY = finishHeight + (totalLanes - 1 - idx) * laneHeight;
        const isPassed = currentStepVal >= lane.step;
        const isCrashLane = crashedLaneRef.current === lane.step;

        // Lane highlight overlay
        if (isCrashLane) {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
          ctx.fillRect(roadLeft + 6, laneY, roadWidth - 12, laneHeight);
        } else if (isPassed) {
          ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
          ctx.fillRect(roadLeft + 6, laneY, roadWidth - 12, laneHeight);
        }

        // White dashed road center line
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([16, 16]);
        ctx.beginPath();
        ctx.moveTo(roadLeft + 10, laneY + laneHeight);
        ctx.lineTo(roadLeft + roadWidth - 10, laneY + laneHeight);
        ctx.stroke();
        ctx.setLineDash([]);

        // Lane Multiplier Badge Stamped on Road (Left & Right)
        ctx.font = 'black 12px monospace';
        ctx.fillStyle = isPassed ? '#34d399' : 'rgba(255, 255, 255, 0.45)';
        ctx.textAlign = 'left';
        ctx.fillText(`LANE #${lane.step} • ${lane.multiplier.toFixed(2)}x`, roadLeft + 16, laneY + 22);

        ctx.textAlign = 'right';
        ctx.fillText(`SAFE: ${((1 - lane.dangerRate) * 100).toFixed(0)}%`, roadLeft + roadWidth - 16, laneY + 22);
      });

      // 5. Draw Starting Sidewalk Curb at Bottom
      const startCurbY = finishHeight + totalLanes * laneHeight;
      ctx.fillStyle = '#3f3f46'; // Sidewalk stone
      ctx.fillRect(roadLeft + 6, startCurbY, roadWidth - 12, curbHeight);

      // Zebra crossing stripes at start
      ctx.fillStyle = '#ffffff';
      for (let zx = roadLeft + 25; zx < roadLeft + roadWidth - 25; zx += 35) {
        ctx.fillRect(zx, startCurbY + 8, 20, curbHeight - 16);
      }

      ctx.fillStyle = '#a1a1aa';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('STARTING PEDESTRIAN CROSSING', roadLeft + roadWidth / 2, startCurbY + curbHeight / 2 + 4);

      // 6. Update and Draw Moving Traffic Vehicles
      vehiclesRef.current.forEach((veh) => {
        const laneIdx = veh.laneIndex;
        const laneY = finishHeight + (totalLanes - 1 - laneIdx) * laneHeight;

        // Move vehicle
        veh.x += veh.speed * veh.direction;

        // Wrap around road boundaries with wide margin
        if (veh.direction === 1 && veh.x > roadLeft + roadWidth + 120) {
          veh.x = roadLeft - 150;
        } else if (veh.direction === -1 && veh.x < roadLeft - 150) {
          veh.x = roadLeft + roadWidth + 120;
        }

        const carY = laneY + 28;

        // Draw Vehicle Body
        ctx.save();
        ctx.translate(veh.x, carY);
        if (veh.direction === -1) {
          ctx.scale(-1, 1);
        }

        // Car Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(0, 8, veh.width / 2 + 4, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Main Car Chassis
        ctx.fillStyle = veh.color;
        ctx.beginPath();
        ctx.roundRect(-veh.width / 2, -12, veh.width, 24, 6);
        ctx.fill();
        ctx.strokeStyle = '#09090b';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Windshield (Cyan/Ice reflection)
        ctx.fillStyle = '#67e8f9';
        ctx.fillRect(-veh.width / 4, -9, veh.width / 2.5, 18);

        // Headlights Beam
        ctx.fillStyle = 'rgba(254, 240, 138, 0.35)';
        ctx.beginPath();
        ctx.moveTo(veh.width / 2, -6);
        ctx.lineTo(veh.width / 2 + 45, -14);
        ctx.lineTo(veh.width / 2 + 45, 14);
        ctx.lineTo(veh.width / 2, 6);
        ctx.closePath();
        ctx.fill();

        // Front Headlights
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(veh.width / 2 - 2, -8, 4, 4);
        ctx.fillRect(veh.width / 2 - 2, 4, 4, 4);

        // Rear brake lights
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(-veh.width / 2 - 2, -8, 3, 4);
        ctx.fillRect(-veh.width / 2 - 2, 4, 3, 4);

        // Vehicle Wheels
        ctx.fillStyle = '#18181b';
        ctx.fillRect(-veh.width / 2 + 8, -15, 10, 4);
        ctx.fillRect(veh.width / 2 - 18, -15, 10, 4);
        ctx.fillRect(-veh.width / 2 + 8, 11, 10, 4);
        ctx.fillRect(veh.width / 2 - 18, 11, 10, 4);

        ctx.restore();
      });

      // 7. Update and Draw the Animated Chicken!
      const chicken = chickenPosRef.current;
      const targetStep = currentStepRef.current;

      // Calculate Target Y
      let targetYVal = startCurbY + 35; // At starting curb
      if (targetStep > 0) {
        targetYVal = finishHeight + (totalLanes - targetStep) * laneHeight + laneHeight / 2;
      }
      chicken.targetY = targetYVal;

      // Smooth step hop animation
      if (chicken.isJumping) {
        chicken.jumpProgress += 0.12;
        if (chicken.jumpProgress >= 1) {
          chicken.jumpProgress = 1;
          chicken.isJumping = false;
        }
        // Parabolic jump arc: sin(0 -> pi) * 26px elevation
        chicken.jumpArc = Math.sin(chicken.jumpProgress * Math.PI) * 26;
        chicken.y = chicken.y + (chicken.targetY - chicken.y) * 0.25;
      } else {
        chicken.jumpArc = 0;
        chicken.y += (chicken.targetY - chicken.y) * 0.2;
      }

      chicken.x = roadLeft + roadWidth / 2;

      // Wing flap animation
      chicken.wingFlap = Math.sin(Date.now() / 150) * 0.2;

      // Draw Chicken at (chicken.x, chicken.y - chicken.jumpArc)
      ctx.save();
      ctx.translate(chicken.x, chicken.y - chicken.jumpArc);

      const isCrashed = gameStateRef.current === 'CRASHED';
      const isWinner = gameStateRef.current === 'CASHED_OUT';

      // Chicken Shadow on asphalt
      ctx.save();
      ctx.translate(0, 16 + chicken.jumpArc);
      ctx.beginPath();
      const shadowScale = Math.max(0.4, 1 - chicken.jumpArc / 40);
      ctx.ellipse(0, 0, 18 * shadowScale, 8 * shadowScale, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fill();
      ctx.restore();

      if (isCrashed) {
        // --- Flattened / Crashed Comic Chicken ---
        ctx.rotate(0.5);
        // Feathers burst around
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(-28, -25, 6, 6);
        ctx.fillRect(25, -20, 6, 6);
        ctx.fillRect(-15, 25, 5, 5);

        // Flattened body
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.ellipse(0, 0, 24, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Tire skid mark across body
        ctx.strokeStyle = '#18181b';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(-15, -6);
        ctx.lineTo(15, 6);
        ctx.stroke();

        // Dizzy X-eyes
        ctx.strokeStyle = '#09090b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-8, -4); ctx.lineTo(-2, 2);
        ctx.moveTo(-2, -4); ctx.lineTo(-8, 2);
        ctx.moveTo(4, -4); ctx.lineTo(10, 2);
        ctx.moveTo(10, -4); ctx.lineTo(4, 2);
        ctx.stroke();

        // Comic Dizzy Stars above
        ctx.font = '16px sans-serif';
        ctx.fillText('💫', -10, -18);
        ctx.fillText('⭐', 12, -22);
      } else {
        // --- Alive, Cute, Bouncing Chicken ---
        const breathing = Math.sin(Date.now() / 250) * 1.5;

        // Plump Golden Body
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.ellipse(0, breathing, 18, 15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Light yellow belly
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.ellipse(3, breathing + 3, 11, 9, 0, 0, Math.PI * 2);
        ctx.fill();

        // Flapping Wings
        ctx.save();
        ctx.translate(-14, breathing);
        ctx.rotate(-0.2 + chicken.wingFlap);
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.ellipse(0, 0, 8, 12, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.translate(14, breathing);
        ctx.rotate(0.2 - chicken.wingFlap);
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.ellipse(0, 0, 8, 12, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Head
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(0, -12 + breathing, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Red Crown / Comb on top of head
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(-4, -23 + breathing, 4, 0, Math.PI * 2);
        ctx.arc(0, -26 + breathing, 5, 0, Math.PI * 2);
        ctx.arc(5, -23 + breathing, 4, 0, Math.PI * 2);
        ctx.fill();

        // Red Wattle under beak
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.ellipse(0, -2 + breathing, 3, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Orange Beak (facing forward/up)
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.moveTo(-4, -8 + breathing);
        ctx.lineTo(4, -8 + breathing);
        ctx.lineTo(0, -1 + breathing);
        ctx.closePath();
        ctx.fill();

        // Big Cartoon Eyes
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-4, -13 + breathing, 3.5, 0, Math.PI * 2);
        ctx.arc(4, -13 + breathing, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Pupils looking up towards road
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(-4, -14.5 + breathing, 2, 0, Math.PI * 2);
        ctx.arc(4, -14.5 + breathing, 2, 0, Math.PI * 2);
        ctx.fill();

        // Orange Feet
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(-7, 13 + breathing, 4, 6);
        ctx.fillRect(3, 13 + breathing, 4, 6);

        // Winner Golden Sunglasses & Trophy
        if (isWinner) {
          ctx.fillStyle = '#09090b';
          ctx.fillRect(-8, -16 + breathing, 16, 5);
          ctx.font = '18px sans-serif';
          ctx.fillText('🏆', 14, -12);
        }
      }

      ctx.restore();
      ctx.restore(); // Restore camera translation

      // 8. HUD Overlay (Current Step & Multiplier directly on screen)
      ctx.save();
      ctx.fillStyle = 'rgba(9, 9, 11, 0.85)';
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(14, 14, 210, 52, 12);
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 10px sans-serif';
      ctx.fillStyle = '#a1a1aa';
      ctx.fillText('LIVE MULTIPLIER:', 26, 32);

      ctx.font = 'black 22px monospace';
      ctx.fillStyle = isCrashed ? '#ef4444' : isWinner ? '#10b981' : '#f59e0b';
      ctx.fillText(`${activeMultiplier.toFixed(2)}x`, 26, 56);

      // Status indicator on top right
      ctx.fillStyle = 'rgba(9, 9, 11, 0.85)';
      ctx.beginPath();
      ctx.roundRect(width - 150, 14, 136, 36, 10);
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = isCrashed ? '#ef4444' : isWinner ? '#34d399' : '#38bdf8';
      ctx.textAlign = 'center';
      const statusText = isCrashed
        ? '💥 SQUAWK! CRASH'
        : isWinner
        ? '🎉 CASHED OUT!'
        : gameStateRef.current === 'PLAYING'
        ? '🐔 CROSSING ROAD'
        : 'READY TO START';
      ctx.fillText(statusText, width - 82, 36);

      ctx.restore();

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [lanes, activeMultiplier]);

  // Start Game Handler
  const handleStartGame = () => {
    soundManager.playClick();
    if (balance < betAmount) {
      onOpenDeposit();
      return;
    }

    onDeductBalance(betAmount);
    setGameState('PLAYING');
    setCurrentStep(0);
    setCrashedLane(null);

    // Reset chicken to curb
    chickenPosRef.current.isJumping = false;
    chickenPosRef.current.jumpProgress = 0;
    soundManager.playChickenCluck();
    triggerTelegramHaptic('impact', 'light');
  };

  // Step Forward Handler (Chicken hops to next lane)
  const handleStepForward = () => {
    if (gameState !== 'PLAYING') return;

    // Trigger chicken jump arc physics
    chickenPosRef.current.isJumping = true;
    chickenPosRef.current.jumpProgress = 0;
    soundManager.playChickenCluck();
    triggerTelegramHaptic('selection');

    setTimeout(() => {
      const nextStep = currentStep + 1;
      const targetLane = lanes[nextStep - 1];

      // Check crash hit probability
      const hitRoll = Math.random();
      if (hitRoll < targetLane.dangerRate) {
        // Vehicle collision!
        soundManager.playCarScreech();
        triggerTelegramHaptic('notification', 'error');
        setCrashedLane(nextStep);
        setCurrentStep(nextStep);
        setGameState('CRASHED');
        setHistoryRuns((prev) => [
          { id: `ch-${Date.now()}`, mult: 0, won: false, amount: betAmount },
          ...prev.slice(0, 10),
        ]);
      } else {
        // Safe lane!
        setCurrentStep(nextStep);
        triggerTelegramHaptic('impact', 'medium');

        // If crossed the very last finish line:
        if (nextStep === lanes.length) {
          handleCashOut(targetLane.multiplier);
        }
      }
    }, 180);
  };

  // Cash Out Handler
  const handleCashOut = (multOverride?: number) => {
    if (gameState !== 'PLAYING') return;

    const winMult = multOverride || activeMultiplier;
    const winAmount = betAmount * winMult;

    soundManager.playCashout();
    triggerTelegramHaptic('notification', 'success');
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    onCreditBalance(winAmount);
    setGameState('CASHED_OUT');

    setHistoryRuns((prev) => [
      { id: `ch-${Date.now()}`, mult: winMult, won: true, amount: winAmount },
      ...prev.slice(0, 10),
    ]);
  };

  return (
    <div className="flex flex-col gap-3 select-none">
      {/* Top Banner / Past Multiplier History strip */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-2.5 sm:p-3 flex flex-wrap items-center justify-between gap-2 shadow-xl">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🐔</span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-black text-white">
                SAFARI CHICKEN ROAD (የዶሮ መንገድ)
              </h2>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                VIDEO SIMULATOR
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              {language === 'am' ? 'ዶሮዋ ስትሻገር ከላይ በቀጥታ ይመልከቱ!' : 'Watch the chicken cross the highway live from above!'}
            </p>
          </div>
        </div>

        {/* Runs History */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-xs text-neutral-500 font-bold mr-1">RUNS:</span>
          {historyRuns.map((run) => (
            <span
              key={run.id}
              className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border transition ${
                run.won
                  ? 'bg-emerald-950/80 text-emerald-400 border-emerald-700/60 shadow-sm'
                  : 'bg-red-950/80 text-red-400 border-red-800/60'
              }`}
            >
              {run.won ? `${run.mult.toFixed(2)}x` : '💥 HIT!'}
            </span>
          ))}
        </div>
      </div>

      {/* TOP: Cinematic Live Video Canvas Arena (Just like Aviator Flight Canvas!) */}
      <div className="relative w-full h-[320px] sm:h-[400px] md:h-[440px] rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950 shadow-2xl">
        <canvas ref={canvasRef} className="w-full h-full block cursor-pointer" onClick={() => {
          if (gameState === 'PLAYING') handleStepForward();
        }} />

        {/* Center Prompt Banner during Idle or Crash */}
        {gameState === 'IDLE' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none bg-neutral-950/40 backdrop-blur-[2px]">
            <div className="bg-neutral-900/90 border border-neutral-700/80 px-6 py-4 rounded-2xl shadow-2xl flex flex-col items-center gap-2">
              <span className="text-3xl animate-bounce">🐔</span>
              <h3 className="text-white font-black text-base uppercase tracking-wider">
                {language === 'am' ? 'ዶሮዋ ለመሻገር ተዘጋጅታለች!' : 'CHICKEN IS AT THE STARTING CURB!'}
              </h3>
              <p className="text-xs text-amber-400 font-semibold">
                {language === 'am' ? 'ውርርድ ያስቀምጡና መሻገር ይጀምሩ' : 'Place your wager below to start crossing'}
              </p>
            </div>
          </div>
        )}

        {gameState === 'CRASHED' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none bg-red-950/40 backdrop-blur-[2px] animate-fade-in">
            <div className="bg-red-950/90 border border-red-500/80 px-6 py-4 rounded-2xl shadow-2xl flex flex-col items-center gap-1">
              <span className="text-3xl">🚗💥</span>
              <h3 className="text-red-400 font-black text-xl uppercase tracking-wider">
                {language === 'am' ? 'ዶሮዋ በመኪና ተገጭታለች!' : 'SQUAWK! CHICKEN GOT HIT!'}
              </h3>
              <p className="text-xs text-red-200">
                {language === 'am' ? 'እንደገና ለመሞከር ተወራረዱ' : 'Better luck next time!'}
              </p>
            </div>
          </div>
        )}

        {gameState === 'CASHED_OUT' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none bg-emerald-950/40 backdrop-blur-[2px] animate-fade-in">
            <div className="bg-emerald-950/90 border border-emerald-500/80 px-6 py-4 rounded-2xl shadow-2xl flex flex-col items-center gap-1">
              <span className="text-3xl">🏆🎉</span>
              <h3 className="text-emerald-400 font-black text-xl uppercase tracking-wider">
                {language === 'am' ? 'አሸንፈዋል!' : 'CASHED OUT SUCCESSFULLY!'}
              </h3>
              <div className="text-white font-mono font-black text-2xl">
                +{currentWinAmount.toFixed(2)} {currency} (@{activeMultiplier.toFixed(2)}x)
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM: Betting Controls & Multiplier Ladder (Like Aviator Control Consoles!) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
        {/* Left 4 Cols: Danger Level & Quick Chips */}
        <div className="lg:col-span-5 bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-xl">
          {/* Difficulty Selector */}
          <div>
            <label className="text-xs font-black text-neutral-400 block mb-1.5 uppercase">
              {language === 'am' ? 'የጨዋታ ከባድነት (Difficulty)' : 'Danger Difficulty'}
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['EASY', 'MEDIUM', 'HARD', 'DAREDEVIL'] as ChickenDifficulty[]).map((diff) => (
                <button
                  key={diff}
                  type="button"
                  disabled={gameState === 'PLAYING'}
                  onClick={() => {
                    setDifficulty(diff);
                    setCurrentStep(0);
                    setGameState('IDLE');
                  }}
                  className={`py-2 px-1 rounded-xl text-xs font-black transition border ${
                    difficulty === diff
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-neutral-950 border-amber-400 shadow-md ring-1 ring-amber-400'
                      : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
                  } disabled:opacity-50 cursor-pointer`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Bet Amount Stepper */}
          <div>
            <div className="flex items-center justify-between text-xs font-black text-neutral-400 uppercase mb-1.5">
              <span>{language === 'am' ? 'የውርርድ መጠን' : 'Bet Amount'}</span>
              <span className="font-mono text-sm text-white font-bold">{betAmount} {currency}</span>
            </div>

            <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-xl p-1 mb-2">
              <button
                disabled={gameState === 'PLAYING'}
                onClick={() => setBetAmount((prev) => Math.max(5, prev - 10))}
                className="w-10 h-10 rounded-lg bg-neutral-900 text-white font-black hover:bg-neutral-800 disabled:opacity-40 text-lg active:scale-95 transition"
              >
                -
              </button>
              <input
                type="number"
                disabled={gameState === 'PLAYING'}
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(5, Number(e.target.value) || 5))}
                className="flex-1 bg-transparent text-center font-mono font-black text-xl text-white outline-none"
              />
              <button
                disabled={gameState === 'PLAYING'}
                onClick={() => setBetAmount((prev) => prev + 10)}
                className="w-10 h-10 rounded-lg bg-neutral-900 text-white font-black hover:bg-neutral-800 disabled:opacity-40 text-lg active:scale-95 transition"
              >
                +
              </button>
            </div>

            {/* Quick Chips */}
            <div className="grid grid-cols-6 gap-1">
              {quickChips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  disabled={gameState === 'PLAYING'}
                  onClick={() => setBetAmount(chip)}
                  className={`py-1.5 rounded-lg text-xs font-mono font-black border transition ${
                    betAmount === chip
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/60'
                      : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
                  } disabled:opacity-40 cursor-pointer`}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right 7 Cols: The BIG Action Buttons & Ladder */}
        <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-xl">
          {/* Multiplier Step Ladder Horizontal Strip */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-neutral-400 mb-1.5">
              <span>LANE PROGRESS & MULTIPLIERS:</span>
              <span className="font-mono text-emerald-400 font-bold">
                CURRENT: {activeMultiplier.toFixed(2)}x
              </span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {lanes.map((lane) => {
                const isPassed = currentStep >= lane.step;
                const isCurrent = currentStep === lane.step;
                return (
                  <div
                    key={lane.step}
                    className={`px-2.5 py-1.5 rounded-xl border text-center shrink-0 min-w-[55px] font-mono transition ${
                      isCurrent
                        ? 'bg-amber-500 text-neutral-950 font-black border-amber-400 shadow-md ring-2 ring-amber-400'
                        : isPassed
                        ? 'bg-emerald-950/80 text-emerald-400 font-bold border-emerald-700/60'
                        : 'bg-neutral-950 text-neutral-400 border-neutral-800'
                    }`}
                  >
                    <div className="text-[10px] opacity-75">#{lane.step}</div>
                    <div className="text-xs font-black">{lane.multiplier.toFixed(2)}x</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2">
            {gameState === 'PLAYING' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Step Forward Button */}
                <button
                  onClick={handleStepForward}
                  className="h-18 sm:h-20 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:brightness-110 active:scale-95 text-neutral-950 font-black text-base uppercase tracking-wider shadow-lg shadow-orange-950/40 flex flex-col items-center justify-center p-2 cursor-pointer transition"
                >
                  <div className="flex items-center gap-1.5">
                    <Footprints className="w-5 h-5 stroke-[2.5]" />
                    <span>{language === 'am' ? 'ተራመድ' : 'STEP FORWARD'}</span>
                  </div>
                  <span className="text-xs text-neutral-900/80 mt-0.5">
                    Jump to Lane #{currentStep + 1}
                  </span>
                </button>

                {/* Cash Out Button */}
                {currentStep > 0 ? (
                  <button
                    onClick={() => handleCashOut()}
                    className="h-18 sm:h-20 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:brightness-110 active:scale-95 text-neutral-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-950/50 flex flex-col items-center justify-center p-2 cursor-pointer transition animate-pulse"
                  >
                    <span className="text-xs font-black tracking-widest">
                      {language === 'am' ? 'ገንዘብ ውሰድ' : 'CASH OUT'}
                    </span>
                    <span className="font-mono text-xl sm:text-2xl font-black">
                      {currentWinAmount.toFixed(2)} {currency}
                    </span>
                    <span className="text-[11px] text-neutral-900/80">
                      @{activeMultiplier.toFixed(2)}x Multiplier
                    </span>
                  </button>
                ) : (
                  <div className="h-18 sm:h-20 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-xs text-neutral-500 font-bold text-center px-4">
                    Make your first step onto Lane #1 to unlock Cash Out!
                  </div>
                )}
              </div>
            ) : (
              /* Start Game Button */
              <button
                onClick={handleStartGame}
                disabled={balance < betAmount}
                className="w-full h-18 sm:h-20 rounded-2xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 hover:brightness-110 active:scale-95 text-white font-black text-lg uppercase tracking-wider shadow-lg shadow-orange-950/50 flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-50"
              >
                <span>{language === 'am' ? 'ተወራረድና ጀምር' : 'START CHICKEN RUN'}</span>
                <span className="font-mono text-xl">({betAmount} {currency})</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
