"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  ACADEMY_CLICK_EFFECT_EVENT,
  ACADEMY_DRAWING_COMPLETE_EVENT,
  type AcademyClickEffectDetail,
} from "./academy-events";
import { useMotionEnabled } from "./motion-preference";
import styles from "./academy-interactions.module.css";

type Point = {
  x: number;
  y: number;
};

type InkStroke = {
  points: Point[];
  endedAt: number | null;
};

type PendingPress = {
  pointerId: number;
  startedAt: number;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  timer: number | null;
  drawing: boolean;
  interactive: boolean;
  suppressEffect: boolean;
};

type Motif = "paw" | "flower" | "bow" | "sparkle" | "flourish" | "ripple";

type Burst = {
  id: number;
  x: number;
  y: number;
  motif: Motif;
  twist: number;
  driftX: number;
};

type BurstStyle = CSSProperties & {
  "--burst-x": string;
  "--burst-y": string;
  "--burst-twist": string;
  "--burst-drift-x": string;
};

const LONG_PRESS_MS = 200;
const STROKE_HOLD_MS = 2_000;
const STROKE_FADE_MS = 900;
const BURST_LIFETIME_MS = 980;
const MAX_BURSTS = 8;
const MAX_STROKE_POINTS = 3_200;
const CLICK_DISTANCE = 14;
const HOLD_SLOP = 12;

const MOTIFS: readonly Motif[] = [
  "paw",
  "flower",
  "bow",
  "sparkle",
  "flourish",
  "ripple",
];

const INTERACTIVE_SELECTOR = [
  "a[href]",
  "button",
  "input",
  "select",
  "textarea",
  "summary",
  "label",
  "audio",
  "video",
  "img",
  "[contenteditable='true']",
  "[role='button']",
  "[role='link']",
  "[role='menuitem']",
  "[role='switch']",
  "[role='tab']",
  "[data-academy-no-draw]",
].join(",");

const EFFECT_EXCLUSION_SELECTOR = [
  "[data-academy-no-effect]",
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "li",
  "dt",
  "dd",
  "time",
  "figcaption",
  "span",
  "strong",
  "em",
  "small",
].join(",");

const KEYBOARD_TARGET_SELECTOR = [
  "a[href]",
  "button",
  "summary",
  "input[type='button']",
  "input[type='submit']",
  "input[type='reset']",
  "input[type='checkbox']",
  "input[type='radio']",
  "[role='button']",
  "[role='link']",
  "[role='menuitem']",
  "[role='switch']",
  "[role='tab']",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function isInteractiveTarget(target: EventTarget | null) {
  return target instanceof Element && target.closest(INTERACTIVE_SELECTOR) !== null;
}

function suppressesClickEffect(target: EventTarget | null) {
  return target instanceof Element && target.closest(EFFECT_EXCLUSION_SELECTOR) !== null;
}

function keyboardTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement) || target.isContentEditable) return null;
  const element = target.closest<HTMLElement>(KEYBOARD_TARGET_SELECTOR);
  if (!element || element.matches(":disabled") || element.getAttribute("aria-disabled") === "true") {
    return null;
  }
  return element;
}

function pointDistance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function pathThrough(ctx: CanvasRenderingContext2D, points: readonly Point[]) {
  if (points.length === 0) return;

  ctx.beginPath();
  if (points.length === 1) {
    const point = points[0];
    ctx.moveTo(point.x - 0.01, point.y);
    ctx.lineTo(point.x + 0.01, point.y);
    return;
  }

  ctx.moveTo(points[0].x, points[0].y);
  for (let index = 1; index < points.length - 1; index += 1) {
    const point = points[index];
    const next = points[index + 1];
    ctx.quadraticCurveTo(
      point.x,
      point.y,
      (point.x + next.x) / 2,
      (point.y + next.y) / 2,
    );
  }
  const last = points[points.length - 1];
  ctx.lineTo(last.x, last.y);
}

function paintStroke(
  ctx: CanvasRenderingContext2D,
  stroke: InkStroke,
  opacity: number,
  dark: boolean,
) {
  const first = stroke.points[0];
  const last = stroke.points[stroke.points.length - 1];
  if (!first || !last || opacity <= 0) return;

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.shadowColor = dark ? "rgba(184, 158, 255, 0.34)" : "rgba(111, 72, 177, 0.22)";
  ctx.shadowBlur = 10;
  ctx.strokeStyle = dark ? "rgba(176, 151, 244, 0.22)" : "rgba(111, 76, 176, 0.17)";
  ctx.lineWidth = 9;
  pathThrough(ctx, stroke.points);
  ctx.stroke();

  ctx.shadowBlur = 0;
  const ink = ctx.createLinearGradient(first.x, first.y, last.x + 0.01, last.y + 0.01);
  if (dark) {
    ink.addColorStop(0, "rgba(211, 191, 255, 0.94)");
    ink.addColorStop(0.5, "rgba(162, 132, 232, 0.91)");
    ink.addColorStop(1, "rgba(236, 192, 226, 0.88)");
  } else {
    ink.addColorStop(0, "rgba(125, 85, 190, 0.91)");
    ink.addColorStop(0.5, "rgba(154, 116, 216, 0.88)");
    ink.addColorStop(1, "rgba(194, 126, 181, 0.84)");
  }
  ctx.strokeStyle = ink;
  ctx.lineWidth = 5;
  pathThrough(ctx, stroke.points);
  ctx.stroke();

  ctx.strokeStyle = dark ? "rgba(250, 240, 255, 0.56)" : "rgba(245, 232, 255, 0.68)";
  ctx.lineWidth = 1.35;
  pathThrough(ctx, stroke.points);
  ctx.stroke();
  ctx.restore();
}

function MotifDrawing({ motif }: { motif: Motif }) {
  if (motif === "paw") {
    return (
      <svg viewBox="0 0 48 48" role="presentation">
        <ellipse cx="24" cy="29" rx="10.5" ry="8.5" />
        <ellipse cx="12.7" cy="19" rx="4" ry="5" transform="rotate(-24 12.7 19)" />
        <ellipse cx="21" cy="13.7" rx="4" ry="5.2" transform="rotate(-7 21 13.7)" />
        <ellipse cx="30.5" cy="14.5" rx="4" ry="5.1" transform="rotate(9 30.5 14.5)" />
        <ellipse cx="37" cy="21" rx="3.8" ry="4.8" transform="rotate(25 37 21)" />
      </svg>
    );
  }

  if (motif === "flower") {
    return (
      <svg viewBox="0 0 48 48" role="presentation">
        <path d="M24 22C15 21 11 15 14 10c3-5 9-2 11 6 2-8 8-11 11-6 3 5-1 11-10 12 9 2 12 8 8 13-4 4-9 0-10-8-2 8-8 12-12 8-4-5 0-11 9-13Z" />
        <circle cx="24" cy="22" r="3.4" />
        <path d="M25 27c1 5 0 9-3 13" className={styles.detailLine} />
      </svg>
    );
  }

  if (motif === "bow") {
    return (
      <svg viewBox="0 0 48 48" role="presentation">
        <path d="M22 23C14 15 7 14 7 20c0 6 7 8 15 5m4-2c8-8 15-9 15-3 0 6-7 8-15 5" />
        <path d="M21 21c2-2 5-2 7 0v7c-2 2-5 2-7 0Z" />
        <path d="m22 29-7 10 8-3m3-7 7 10-8-3" />
      </svg>
    );
  }

  if (motif === "sparkle") {
    return (
      <svg viewBox="0 0 48 48" role="presentation">
        <path d="M25 6c1 11 5 16 15 18-10 2-14 7-15 18-2-11-6-16-16-18 10-2 14-7 16-18Z" />
        <path d="M9 8v8M5 12h8M40 7v6M37 10h6" className={styles.detailLine} />
      </svg>
    );
  }

  if (motif === "flourish") {
    return (
      <svg viewBox="0 0 48 48" role="presentation">
        <path d="M5 29c7-16 17 9 27-5 4-5 1-10-4-9-7 1-8 14 1 18 5 2 10 0 14-4" />
        <path d="M8 35c7 2 13 1 18-2M37 18l5-4M39 22l6-1" className={styles.detailLine} />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 48 48" role="presentation">
      <ellipse cx="24" cy="25" rx="16" ry="8" />
      <ellipse cx="24" cy="25" rx="10" ry="4.5" className={styles.detailLine} />
      <path d="M14 14c4-5 16-6 22 0M18 9c4-2 8-2 12 0" className={styles.detailLine} />
    </svg>
  );
}

export function AcademyInteractions() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const pixelRatioRef = useRef(1);
  const strokesRef = useRef<InkStroke[]>([]);
  const activeStrokeRef = useRef<InkStroke | null>(null);
  const pendingPressRef = useRef<PendingPress | null>(null);
  const nextBurstIdRef = useRef(0);
  const lastMotifIndexRef = useRef(-1);
  const burstTimersRef = useRef(new Map<number, number>());
  const previousUserSelectRef = useRef<string | null>(null);
  const motionEnabled = useMotionEnabled();
  const motionEnabledRef = useRef(motionEnabled);
  const [bursts, setBursts] = useState<Burst[]>([]);

  const unlockSelection = useCallback(() => {
    if (previousUserSelectRef.current === null) return;
    document.body.style.userSelect = previousUserSelectRef.current;
    previousUserSelectRef.current = null;
    rootRef.current?.removeAttribute("data-drawing");
  }, []);

  const lockSelection = useCallback(() => {
    if (previousUserSelectRef.current === null) {
      previousUserSelectRef.current = document.body.style.userSelect;
      document.body.style.userSelect = "none";
    }
    window.getSelection()?.removeAllRanges();
    if (rootRef.current) rootRef.current.dataset.drawing = "true";
  }, []);

  const paintFrame = useCallback(function frame(now: number) {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) {
      animationFrameRef.current = null;
      return;
    }

    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.restore();
    context.setTransform(pixelRatioRef.current, 0, 0, pixelRatioRef.current, 0, 0);

    const dark = document.documentElement.dataset.theme === "dark";
    const lifetime = STROKE_HOLD_MS + STROKE_FADE_MS;
    const alive: InkStroke[] = [];

    for (const stroke of strokesRef.current) {
      const elapsed = stroke.endedAt === null ? 0 : now - stroke.endedAt;
      if (stroke.endedAt !== null && elapsed >= lifetime) continue;

      const opacity = stroke.endedAt === null || elapsed <= STROKE_HOLD_MS
        ? 1
        : Math.max(0, 1 - (elapsed - STROKE_HOLD_MS) / STROKE_FADE_MS);
      paintStroke(context, stroke, opacity, dark);
      alive.push(stroke);
    }

    strokesRef.current = alive;
    animationFrameRef.current = alive.length > 0
      ? window.requestAnimationFrame(frame)
      : null;
  }, []);

  const requestPaint = useCallback(() => {
    if (animationFrameRef.current === null) {
      animationFrameRef.current = window.requestAnimationFrame(paintFrame);
    }
  }, [paintFrame]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (canvas && context) {
      context.save();
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.restore();
    }
  }, []);

  const clearDrawing = useCallback(() => {
    const pending = pendingPressRef.current;
    if (pending?.timer !== null && pending?.timer !== undefined) {
      window.clearTimeout(pending.timer);
    }
    pendingPressRef.current = null;
    activeStrokeRef.current = null;
    strokesRef.current = [];
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    unlockSelection();
    clearCanvas();
  }, [clearCanvas, unlockSelection]);

  const clearBursts = useCallback((updateView = true) => {
    burstTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    burstTimersRef.current.clear();
    if (updateView) setBursts([]);
  }, []);

  const removeBurst = useCallback((id: number) => {
    const timer = burstTimersRef.current.get(id);
    if (timer !== undefined) window.clearTimeout(timer);
    burstTimersRef.current.delete(id);
    setBursts((current) => current.filter((burst) => burst.id !== id));
  }, []);

  const createBurst = useCallback((x: number, y: number) => {
    if (!motionEnabledRef.current) return false;

    const offset = 1 + Math.floor(Math.random() * (MOTIFS.length - 1));
    const motifIndex = (lastMotifIndexRef.current + offset) % MOTIFS.length;
    lastMotifIndexRef.current = motifIndex;

    const burst: Burst = {
      id: ++nextBurstIdRef.current,
      x,
      y,
      motif: MOTIFS[motifIndex],
      twist: -12 + Math.random() * 24,
      driftX: -9 + Math.random() * 18,
    };

    setBursts((current) => [...current.slice(-(MAX_BURSTS - 1)), burst]);
    const timer = window.setTimeout(() => removeBurst(burst.id), BURST_LIFETIME_MS);
    burstTimersRef.current.set(burst.id, timer);
    return true;
  }, [removeBurst]);

  const beginStroke = useCallback((pending: PendingPress) => {
    if (!motionEnabledRef.current || pendingPressRef.current !== pending || pending.interactive) return;

    pending.timer = null;
    pending.drawing = true;
    const stroke: InkStroke = {
      points: [{ x: pending.startX, y: pending.startY }],
      endedAt: null,
    };
    if (pointDistance(stroke.points[0], { x: pending.lastX, y: pending.lastY }) > 1) {
      stroke.points.push({ x: pending.lastX, y: pending.lastY });
    }

    const now = window.performance.now();
    strokesRef.current = [
      ...strokesRef.current.filter((item) => item.endedAt === null || now - item.endedAt < STROKE_HOLD_MS + STROKE_FADE_MS),
      stroke,
    ].slice(-12);
    activeStrokeRef.current = stroke;
    lockSelection();
    requestPaint();
  }, [lockSelection, requestPaint]);

  const appendPointerPoints = useCallback((event: PointerEvent) => {
    const stroke = activeStrokeRef.current;
    if (!stroke) return;

    const samples = typeof event.getCoalescedEvents === "function"
      ? event.getCoalescedEvents()
      : [event];
    for (const sample of samples) {
      const point = { x: sample.clientX, y: sample.clientY };
      const previous = stroke.points[stroke.points.length - 1];
      if (!previous || pointDistance(previous, point) >= 1.35) {
        stroke.points.push(point);
      }
    }

    if (stroke.points.length > MAX_STROKE_POINTS) {
      const recentStart = stroke.points.length - 96;
      stroke.points = stroke.points.filter((_, index) => index % 2 === 0 || index >= recentStart);
    }
    requestPaint();
  }, [requestPaint]);

  const finishStroke = useCallback((event?: PointerEvent) => {
    if (event) appendPointerPoints(event);
    const stroke = activeStrokeRef.current;
    if (stroke) stroke.endedAt = window.performance.now();
    activeStrokeRef.current = null;
    unlockSelection();
    requestPaint();
    return stroke !== null;
  }, [appendPointerPoints, requestPaint, unlockSelection]);

  useEffect(() => {
    motionEnabledRef.current = motionEnabled;
    if (!motionEnabled) {
      clearDrawing();
      clearBursts();
    }
  }, [clearBursts, clearDrawing, motionEnabled]);

  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const pixelRatio = Math.min(Math.max(window.devicePixelRatio || 1, 1), 3);
      const width = Math.max(1, window.innerWidth);
      const height = Math.max(1, window.innerHeight);
      pixelRatioRef.current = pixelRatio;
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      requestPaint();
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas, { passive: true });
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [requestPaint]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!motionEnabledRef.current || !event.isPrimary || event.button !== 0) return;
      if (pendingPressRef.current) return;

      const pending: PendingPress = {
        pointerId: event.pointerId,
        startedAt: window.performance.now(),
        startX: event.clientX,
        startY: event.clientY,
        lastX: event.clientX,
        lastY: event.clientY,
        timer: null,
        drawing: false,
        interactive: isInteractiveTarget(event.target),
        suppressEffect: isInteractiveTarget(event.target) || suppressesClickEffect(event.target),
      };
      pendingPressRef.current = pending;

      if ((event.pointerType === "mouse" || event.pointerType === "") && !pending.interactive) {
        pending.timer = window.setTimeout(() => beginStroke(pending), LONG_PRESS_MS);
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      const pending = pendingPressRef.current;
      if (!pending || event.pointerId !== pending.pointerId) return;

      pending.lastX = event.clientX;
      pending.lastY = event.clientY;

      if (pending.drawing) {
        event.preventDefault();
        appendPointerPoints(event);
        return;
      }

      const moved = Math.hypot(event.clientX - pending.startX, event.clientY - pending.startY);
      if (moved > HOLD_SLOP && pending.timer !== null) {
        window.clearTimeout(pending.timer);
        pending.timer = null;
      }
    };

    const endPress = (event: PointerEvent, canceled: boolean) => {
      const pending = pendingPressRef.current;
      if (!pending || event.pointerId !== pending.pointerId) return;

      if (pending.timer !== null) window.clearTimeout(pending.timer);
      pendingPressRef.current = null;

      if (pending.drawing) {
        const completed = finishStroke(event);
        if (!canceled && completed) {
          window.dispatchEvent(new Event(ACADEMY_DRAWING_COMPLETE_EVENT));
        }
        return;
      }

      if (canceled) return;
      const distance = Math.hypot(event.clientX - pending.startX, event.clientY - pending.startY);
      const duration = window.performance.now() - pending.startedAt;
      if (!pending.suppressEffect && distance <= CLICK_DISTANCE && duration < 700) {
        const created = createBurst(event.clientX, event.clientY);
        const isMouse = event.pointerType === "mouse" || event.pointerType === "";
        if (created && isMouse) {
          window.dispatchEvent(new CustomEvent<AcademyClickEffectDetail>(
            ACADEMY_CLICK_EFFECT_EVENT,
            { detail: { clientX: event.clientX, clientY: event.clientY } },
          ));
        }
      }
    };

    const handlePointerUp = (event: PointerEvent) => endPress(event, false);
    const handlePointerCancel = (event: PointerEvent) => endPress(event, true);
    const handleWindowBlur = () => {
      const pending = pendingPressRef.current;
      if (!pending) return;
      if (pending.timer !== null) window.clearTimeout(pending.timer);
      pendingPressRef.current = null;
      if (pending.drawing) finishStroke();
    };

    const handleKeyboardActivation = (event: KeyboardEvent) => {
      if (event.repeat || (event.key !== "Enter" && event.key !== " ")) return;
      const target = keyboardTarget(event.target);
      if (!target) return;
      const bounds = target.getBoundingClientRect();
      if (bounds.width <= 0 || bounds.height <= 0) return;
      createBurst(
        Math.min(window.innerWidth, Math.max(0, bounds.left + bounds.width / 2)),
        Math.min(window.innerHeight, Math.max(0, bounds.top + bounds.height / 2)),
      );
    };

    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("pointermove", handlePointerMove, { passive: false });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });
    window.addEventListener("pointercancel", handlePointerCancel, { passive: true });
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("keydown", handleKeyboardActivation);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerCancel);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("keydown", handleKeyboardActivation);
    };
  }, [appendPointerPoints, beginStroke, createBurst, finishStroke]);

  useEffect(() => () => {
    clearDrawing();
    clearBursts(false);
  }, [clearBursts, clearDrawing]);

  return (
    <div ref={rootRef} className={styles.root} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} />
      <div className={styles.burstLayer}>
        {bursts.map((burst) => {
          const burstStyle: BurstStyle = {
            "--burst-x": `${burst.x}px`,
            "--burst-y": `${burst.y}px`,
            "--burst-twist": `${burst.twist}deg`,
            "--burst-drift-x": `${burst.driftX}px`,
          };
          return (
            <span
              key={burst.id}
              className={styles.burst}
              data-motif={burst.motif}
              style={burstStyle}
            >
              <span className={styles.ring} />
              <span className={styles.motif}>
                <MotifDrawing motif={burst.motif} />
              </span>
              <i className={styles.sparkOne} />
              <i className={styles.sparkTwo} />
            </span>
          );
        })}
      </div>
    </div>
  );
}
