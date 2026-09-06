"use client";

import { createPortal } from "react-dom";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  ACADEMY_BRAND_HEART_EVENT,
  ACADEMY_CLICK_EFFECT_EVENT,
  ACADEMY_DRAWING_COMPLETE_EVENT,
  type AcademyClickEffectDetail,
} from "./academy-events";
import { useMotionEnabled } from "./motion-preference";
import { usePetVisible } from "./pet-preference";
import styles from "./academy-customizer.module.css";

type StandardPetAction = "sleep" | "move" | "happy" | "cheer" | "jump" | "drowsy";
type SpecialPetAction = "painting" | "heart";
type PetAction = "idle" | StandardPetAction | SpecialPetAction;
type PetDragPhase =
  | "idle"
  | "lifting"
  | "dragging"
  | "dropping"
  | "landing"
  | "recovering"
  | "celebrating";
type PetDragFrame = 0 | 1 | 2 | 3 | 4 | 5 | 6;
type PetDragArt = "idle" | "sprite";
type PetTurnFrame = 0 | 1 | 2 | 3 | 4;
type PetVisibilityPhase = "hidden" | "entering" | "visible" | "exiting";

type PetDragSession = {
  pointerId: number;
  lastClientX: number;
  lastClientY: number;
  dragStartClientX: number;
  dragStartClientY: number;
  dragStartLeft: number;
  dragStartTop: number;
  dragStartUserX: number;
  dragStartUserY: number;
  airFrame: 2 | 3;
  hasMoved: boolean;
};

const ACTIONS: readonly StandardPetAction[] = [
  "happy",
  "move",
  "cheer",
  "jump",
  "drowsy",
  "sleep",
];

const ACTION_COPY: Record<PetAction, string> = {
  idle: "Ready when you are.",
  sleep: "Zzz… library nap.",
  move: "Tiny campus walk!",
  happy: "This is going well!",
  cheer: "Hi! www",
  jump: "Boing!",
  drowsy: "Five more minutes…",
  painting: "Nice painting!",
  heart: "♥︎",
};

const ACTION_DURATION: Record<Exclude<PetAction, "idle">, number> = {
  sleep: 5_600,
  move: 5_200,
  happy: 3_800,
  cheer: 4_200,
  jump: 2_800,
  drowsy: 5_200,
  painting: 4_800,
  heart: 4_200,
};

const AUTO_ACTION_MIN = 18_000;
const AUTO_ACTION_RANGE = 12_000;
const PET_TURN_TOTAL_MS = 420;
const PET_TURN_FIRST_FRAME_MS = 48;
const PET_TURN_FRAME_INTERVAL_MS = 64;
const PET_TURN_SETTLE_MS = 372;
const PET_HOLD_MS = 100;
const PET_PICKUP_ART_MS = 52;
const PET_LIFT_MS = 188;
const PET_DROP_MS = 160;
const PET_LAND_MS = 480;
const PET_RECOVER_MS = 520;
const PET_CELEBRATE_MS = 860;
const PET_STILL_LAND_MS = 360;
const PET_ENTRANCE_MS = 1_050;
const PET_EXIT_MS = 980;
const PET_DRAG_MOVE_THRESHOLD = 5;
const PET_VIEWPORT_MARGIN = 8;
const PET_PICKUP_COPY = "Eep—an adventure!";
const PET_LANDING_COPY = "Soft landing… nailed it!";
const PET_CELEBRATE_COPY = "Ta-da! My new favorite spot ✨";
const PET_ENTRANCE_COPY = "I'm here!";
const PET_EXIT_COPY = "See you soon!";

const subscribeToHydration = () => () => undefined;
const getHydratedSnapshot = () => true;
const getServerHydratedSnapshot = () => false;

const IZUMI_FRAME_WIDTH = 480;
const IZUMI_FRAME_HEIGHT = 680;

function IzumiFrame({ index, label }: { index: number; label: string }) {
  return (
    <span
      className={styles.izumiFrame}
      data-frame={index}
      role="img"
      aria-label={label}
    >
      <Image
        className={styles.izumiSprite}
        src="/media/izumi-idle-sprite.webp"
        alt=""
        width={IZUMI_FRAME_WIDTH * 4}
        height={IZUMI_FRAME_HEIGHT}
        draggable={false}
        decoding="async"
        unoptimized
      />
    </span>
  );
}

function IzumiIllustration() {
  return (
    <span className={styles.izumiArt}>
      <span className={styles.izumiPose} data-pose="idle">
        <IzumiFrame index={0} label="Izumi Sakurai standing quietly" />
      </span>
      <span className={styles.izumiPose} data-pose="wave">
        <IzumiFrame index={1} label="Izumi Sakurai smiling and waving" />
      </span>
      <span className={styles.izumiPose} data-pose="startled">
        <IzumiFrame index={2} label="Izumi Sakurai making a surprised hop" />
      </span>
      <span className={styles.izumiPose} data-pose="sleep">
        <IzumiFrame index={3} label="Izumi Sakurai sleeping" />
      </span>
      <svg className={styles.izumiMarks} viewBox="0 0 480 680" aria-hidden="true">
        <g className={styles.izumiZzz}>
          <path d="M347 122h50l-47 48h54M383 75h38l-35 36h40" />
        </g>
        <g className={styles.izumiSparkles}>
          <path d="M72 147v46M49 170h46M409 240v54m-27-27h54M93 95l13 22 22 13-22 13-13 22-13-22-22-13 22-13Z" />
        </g>
        <g className={styles.izumiMotionMarks}>
          <path d="M92 407H38m66 39H22m79 39H54" />
        </g>
      </svg>
    </span>
  );
}

function IzumiDragIllustration() {
  return (
    <span className={styles.izumiDragArt}>
      <Image
        className={styles.izumiDragSprite}
        src="/media/izumi-drag-sprite-v2.webp"
        alt=""
        width={1920}
        height={1360}
        draggable={false}
        decoding="async"
        unoptimized
      />
    </span>
  );
}

function IzumiTurnIllustration() {
  return (
    <span className={styles.izumiTurnArt}>
      <Image
        className={styles.izumiTurnSprite}
        src="/media/izumi-turn-sprite.webp"
        alt=""
        width={2400}
        height={680}
        draggable={false}
        decoding="async"
        unoptimized
      />
    </span>
  );
}

function IzumiReactionIllustration() {
  return (
    <span className={styles.izumiReactionArt}>
      <Image
        className={styles.izumiReactionSprite}
        src="/media/izumi-reaction-sprite.webp"
        alt=""
        width={960}
        height={680}
        draggable={false}
        unoptimized
      />
    </span>
  );
}

function IzumiAppearanceIllustration() {
  return (
    <span className={styles.izumiAppearanceArt}>
      <Image
        className={styles.izumiAppearanceSprite}
        src="/media/izumi-appearance-sprite.webp"
        alt=""
        width={960}
        height={680}
        draggable={false}
        unoptimized
      />
    </span>
  );
}

function AcademyPet() {
  const motionEnabled = useMotionEnabled();
  const petVisible = usePetVisible();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const bubbleRafRef = useRef<number | null>(null);
  const returnTimerRef = useRef<number | null>(null);
  const bubbleTimerRef = useRef<number | null>(null);
  const autoTimerRef = useRef<number | null>(null);
  const walkTimerRef = useRef<number | null>(null);
  const turnTimersRef = useRef<number[]>([]);
  const turnTokenRef = useRef(0);
  const holdTimerRef = useRef<number | null>(null);
  const liftArtTimerRef = useRef<number | null>(null);
  const liftEndTimerRef = useRef<number | null>(null);
  const dropTimerRef = useRef<number | null>(null);
  const landingTimerRef = useRef<number | null>(null);
  const recoveryTimerRef = useRef<number | null>(null);
  const celebrationTimerRef = useRef<number | null>(null);
  const appearanceTimerRef = useRef<number | null>(null);
  const actionIndexRef = useRef(0);
  const autoActionIndexRef = useRef(0);
  const facingRef = useRef<"left" | "right">("left");
  const turningRef = useRef(false);
  const actionRef = useRef<PetAction>("idle");
  const roamXRef = useRef(0);
  const userXRef = useRef(0);
  const userYRef = useRef(0);
  const dragPhaseRef = useRef<PetDragPhase>("idle");
  const dragSessionRef = useRef<PetDragSession | null>(null);
  const visibilityPhaseRef = useRef<PetVisibilityPhase>(petVisible ? "entering" : "hidden");
  const suppressClickRef = useRef(false);
  const [action, setAction] = useState<PetAction>("idle");
  const [dragPhase, setDragPhase] = useState<PetDragPhase>("idle");
  const [dragFrame, setDragFrame] = useState<PetDragFrame>(0);
  const [dragArt, setDragArt] = useState<PetDragArt>("idle");
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [reactionCopy, setReactionCopy] = useState<string | null>(null);
  const [visibilityPhase, setVisibilityPhase] = useState<PetVisibilityPhase>(
    petVisible ? "entering" : "hidden",
  );

  const updateVisibilityPhase = useCallback((next: PetVisibilityPhase) => {
    visibilityPhaseRef.current = next;
    setVisibilityPhase(next);
  }, []);

  const setPetDragPhase = useCallback((next: PetDragPhase) => {
    dragPhaseRef.current = next;
    if (buttonRef.current) buttonRef.current.dataset.dragPhase = next;
    setDragPhase(next);
  }, []);

  const setPetDragFrame = useCallback((next: PetDragFrame) => {
    if (buttonRef.current) buttonRef.current.dataset.dragFrame = String(next);
    setDragFrame(next);
  }, []);

  const syncBubblePosition = useCallback(() => {
    const button = buttonRef.current;
    const bubble = bubbleRef.current;
    if (!button || !bubble) return;
    const bounds = button.getBoundingClientRect();
    const left = Math.max(PET_VIEWPORT_MARGIN, Math.min(
      bounds.left + bounds.width * 0.28 - bubble.offsetWidth,
      window.innerWidth - bubble.offsetWidth - PET_VIEWPORT_MARGIN,
    ));
    const top = Math.max(PET_VIEWPORT_MARGIN, Math.min(
      bounds.top + bounds.height * 0.18 - bubble.offsetHeight,
      window.innerHeight - bubble.offsetHeight - PET_VIEWPORT_MARGIN,
    ));
    bubble.style.left = `${Math.round(left)}px`;
    bubble.style.top = `${Math.round(top)}px`;
  }, []);

  const scheduleBubblePosition = useCallback(() => {
    if (bubbleRafRef.current !== null) window.cancelAnimationFrame(bubbleRafRef.current);
    bubbleRafRef.current = window.requestAnimationFrame(() => {
      syncBubblePosition();
      bubbleRafRef.current = null;
    });
  }, [syncBubblePosition]);

  const setUserPosition = useCallback((x: number, y: number) => {
    const roundedX = Math.round(x);
    const roundedY = Math.round(y);
    userXRef.current = roundedX;
    userYRef.current = roundedY;
    const button = buttonRef.current;
    if (!button) return;
    button.style.setProperty("--pet-user-x", `${roundedX}px`);
    button.style.setProperty("--pet-user-y", `${roundedY}px`);
    scheduleBubblePosition();
  }, [scheduleBubblePosition]);

  const clearDragTimers = useCallback(() => {
    if (holdTimerRef.current !== null) window.clearTimeout(holdTimerRef.current);
    if (liftArtTimerRef.current !== null) window.clearTimeout(liftArtTimerRef.current);
    if (liftEndTimerRef.current !== null) window.clearTimeout(liftEndTimerRef.current);
    if (dropTimerRef.current !== null) window.clearTimeout(dropTimerRef.current);
    if (landingTimerRef.current !== null) window.clearTimeout(landingTimerRef.current);
    if (recoveryTimerRef.current !== null) window.clearTimeout(recoveryTimerRef.current);
    if (celebrationTimerRef.current !== null) window.clearTimeout(celebrationTimerRef.current);
    holdTimerRef.current = null;
    liftArtTimerRef.current = null;
    liftEndTimerRef.current = null;
    dropTimerRef.current = null;
    landingTimerRef.current = null;
    recoveryTimerRef.current = null;
    celebrationTimerRef.current = null;
  }, []);

  const clearActionTimers = useCallback(() => {
    if (returnTimerRef.current !== null) window.clearTimeout(returnTimerRef.current);
    if (bubbleTimerRef.current !== null) window.clearTimeout(bubbleTimerRef.current);
    if (walkTimerRef.current !== null) window.clearTimeout(walkTimerRef.current);
    returnTimerRef.current = null;
    bubbleTimerRef.current = null;
    walkTimerRef.current = null;
    if (buttonRef.current) buttonRef.current.dataset.travel = "resting";
  }, []);

  const clearTurnTimers = useCallback(() => {
    turnTokenRef.current += 1;
    turnTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    turnTimersRef.current = [];
    turningRef.current = false;
    if (buttonRef.current) {
      buttonRef.current.dataset.turning = "idle";
      delete buttonRef.current.dataset.turnTarget;
      delete buttonRef.current.dataset.turnFrame;
    }
  }, []);

  const beginTurn = useCallback((nextFacing: "left" | "right") => {
    const button = buttonRef.current;
    if (
      !button
      || visibilityPhaseRef.current !== "visible"
      || dragPhaseRef.current !== "idle"
      || dragSessionRef.current !== null
      || nextFacing === facingRef.current
    ) return 0;

    if (!motionEnabled) {
      facingRef.current = nextFacing;
      button.dataset.facing = nextFacing;
      button.dataset.turning = "idle";
      return 0;
    }

    if (turningRef.current) return PET_TURN_TOTAL_MS;

    const token = turnTokenRef.current + 1;
    turnTokenRef.current = token;
    turningRef.current = true;
    button.dataset.turnTarget = nextFacing;
    button.dataset.turning = "preparing";

    const orderedFrames: readonly PetTurnFrame[] = nextFacing === "right"
      ? [0, 1, 2, 3, 4]
      : [4, 3, 2, 1, 0];
    orderedFrames.forEach((frame, index) => {
      const timer = window.setTimeout(() => {
        if (
          turnTokenRef.current !== token
          || dragPhaseRef.current !== "idle"
          || dragSessionRef.current !== null
        ) return;
        button.dataset.turnFrame = String(frame);
        button.dataset.turning = "frames";
      }, PET_TURN_FIRST_FRAME_MS + index * PET_TURN_FRAME_INTERVAL_MS);
      turnTimersRef.current.push(timer);
    });

    turnTimersRef.current.push(window.setTimeout(() => {
      if (
        turnTokenRef.current !== token
        || dragPhaseRef.current !== "idle"
        || dragSessionRef.current !== null
      ) return;
      facingRef.current = nextFacing;
      button.dataset.facing = nextFacing;
      button.dataset.turning = "settling";
    }, PET_TURN_SETTLE_MS));

    turnTimersRef.current.push(window.setTimeout(() => {
      if (
        turnTokenRef.current !== token
        || dragPhaseRef.current !== "idle"
        || dragSessionRef.current !== null
      ) return;
      button.dataset.turning = "idle";
      delete button.dataset.turnTarget;
      delete button.dataset.turnFrame;
      turningRef.current = false;
      turnTimersRef.current = [];
    }, PET_TURN_TOTAL_MS));

    return PET_TURN_TOTAL_MS;
  }, [motionEnabled]);

  const startCampusWalk = useCallback(() => {
    const button = buttonRef.current;
    if (
      !button
      || visibilityPhaseRef.current !== "visible"
      || dragPhaseRef.current !== "idle"
    ) return;

    const maxTravel = Math.min(220, Math.max(88, window.innerWidth * 0.16));
    const baseLeft = button.offsetLeft + userXRef.current;
    const minimumRoam = PET_VIEWPORT_MARGIN - baseLeft;
    const maximumRoam = window.innerWidth
      - PET_VIEWPORT_MARGIN
      - button.offsetWidth
      - baseLeft;
    const walkMinimum = Math.max(minimumRoam, roamXRef.current - maxTravel);
    const walkMaximum = Math.min(maximumRoam, roamXRef.current + maxTravel);
    let nextX = walkMinimum + Math.random() * Math.max(0, walkMaximum - walkMinimum);
    if (Math.abs(nextX - roamXRef.current) < 54) {
      nextX = Math.abs(walkMinimum - roamXRef.current) > Math.abs(walkMaximum - roamXRef.current)
        ? walkMinimum
        : walkMaximum;
    }

    roamXRef.current = nextX;
    button.dataset.travel = "walking";
    walkTimerRef.current = window.setTimeout(() => {
      button.dataset.travel = "walking";
      button.style.setProperty("--pet-roam-x", `${Math.round(nextX)}px`);
      walkTimerRef.current = null;
    }, 80);
  }, []);

  const runAction = useCallback((next: StandardPetAction) => {
    if (
      !motionEnabled
      || visibilityPhaseRef.current !== "visible"
      || dragPhaseRef.current !== "idle"
    ) return;
    clearActionTimers();
    setReactionCopy(null);
    actionRef.current = next;
    setAction(next);
    setBubbleVisible(true);
    if (next === "move") startCampusWalk();
    returnTimerRef.current = window.setTimeout(() => {
      actionRef.current = "idle";
      if (buttonRef.current) buttonRef.current.dataset.travel = "resting";
      setAction("idle");
      returnTimerRef.current = null;
    }, ACTION_DURATION[next]);
    bubbleTimerRef.current = window.setTimeout(() => {
      setBubbleVisible(false);
      bubbleTimerRef.current = null;
    }, Math.min(ACTION_DURATION[next] - 250, 4_700));
  }, [clearActionTimers, motionEnabled, startCampusWalk]);

  const runNextAction = useCallback(() => {
    const next = ACTIONS[actionIndexRef.current % ACTIONS.length];
    actionIndexRef.current += 1;
    runAction(next);
    return next;
  }, [runAction]);

  const scheduleAutoAction = useCallback(function schedule(afterAction = 0) {
    if (autoTimerRef.current !== null) window.clearTimeout(autoTimerRef.current);
    if (!motionEnabled || !petVisible || document.hidden) return;

    const quietTime = AUTO_ACTION_MIN + Math.random() * AUTO_ACTION_RANGE;
    autoTimerRef.current = window.setTimeout(() => {
      if (
        visibilityPhaseRef.current !== "visible"
        || dragPhaseRef.current !== "idle"
      ) {
        schedule(2_000);
        return;
      }
      autoActionIndexRef.current += 1;
      const next = autoActionIndexRef.current % 3 === 0
        ? "move"
        : ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
      runAction(next);
      schedule(ACTION_DURATION[next]);
    }, afterAction + quietTime);
  }, [motionEnabled, petVisible, runAction]);

  const runSpecialAction = useCallback((next: SpecialPetAction) => {
    if (
      visibilityPhaseRef.current !== "visible"
      || dragPhaseRef.current !== "idle"
      || dragSessionRef.current !== null
    ) return;

    if (autoTimerRef.current !== null) window.clearTimeout(autoTimerRef.current);
    autoTimerRef.current = null;
    clearActionTimers();
    clearTurnTimers();
    setReactionCopy(ACTION_COPY[next]);
    actionRef.current = next;
    setAction(next);
    setBubbleVisible(true);

    const duration = ACTION_DURATION[next];
    returnTimerRef.current = window.setTimeout(() => {
      actionRef.current = "idle";
      setAction("idle");
      setReactionCopy(null);
      returnTimerRef.current = null;
    }, duration);
    bubbleTimerRef.current = window.setTimeout(() => {
      setBubbleVisible(false);
      bubbleTimerRef.current = null;
    }, duration - 240);
    scheduleAutoAction(duration);
  }, [clearActionTimers, clearTurnTimers, scheduleAutoAction]);

  useEffect(() => {
    if (appearanceTimerRef.current !== null) {
      window.clearTimeout(appearanceTimerRef.current);
      appearanceTimerRef.current = null;
    }
    if (autoTimerRef.current !== null) {
      window.clearTimeout(autoTimerRef.current);
      autoTimerRef.current = null;
    }

    clearActionTimers();
    clearTurnTimers();
    clearDragTimers();
    actionRef.current = "idle";
    setAction("idle");
    setDragArt("idle");
    setPetDragFrame(0);
    setPetDragPhase("idle");

    const button = buttonRef.current;
    const session = dragSessionRef.current;
    if (button && session && button.hasPointerCapture(session.pointerId)) {
      button.releasePointerCapture(session.pointerId);
    }
    dragSessionRef.current = null;

    if (petVisible) {
      if (visibilityPhaseRef.current === "hidden") {
        roamXRef.current = 0;
        userXRef.current = 0;
        userYRef.current = 0;
        facingRef.current = "left";
      }
      updateVisibilityPhase("entering");
      setReactionCopy(PET_ENTRANCE_COPY);
      setBubbleVisible(true);
      appearanceTimerRef.current = window.setTimeout(() => {
        updateVisibilityPhase("visible");
        appearanceTimerRef.current = null;
        bubbleTimerRef.current = window.setTimeout(() => {
          setBubbleVisible(false);
          setReactionCopy(null);
          bubbleTimerRef.current = null;
        }, 850);
      }, PET_ENTRANCE_MS);
    } else if (visibilityPhaseRef.current === "hidden") {
      setBubbleVisible(false);
      setReactionCopy(null);
    } else {
      updateVisibilityPhase("exiting");
      setReactionCopy(PET_EXIT_COPY);
      setBubbleVisible(true);
      appearanceTimerRef.current = window.setTimeout(() => {
        updateVisibilityPhase("hidden");
        setBubbleVisible(false);
        setReactionCopy(null);
        appearanceTimerRef.current = null;
      }, PET_EXIT_MS);
    }

    return () => {
      if (appearanceTimerRef.current !== null) {
        window.clearTimeout(appearanceTimerRef.current);
        appearanceTimerRef.current = null;
      }
    };
  }, [
    clearActionTimers,
    clearDragTimers,
    clearTurnTimers,
    petVisible,
    setPetDragFrame,
    setPetDragPhase,
    updateVisibilityPhase,
  ]);

  useEffect(() => {
    if (!motionEnabled || !petVisible) return;
    scheduleAutoAction();
    const handleVisibility = () => {
      if (autoTimerRef.current !== null) window.clearTimeout(autoTimerRef.current);
      autoTimerRef.current = null;
      if (!document.hidden) scheduleAutoAction();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      if (autoTimerRef.current !== null) window.clearTimeout(autoTimerRef.current);
      autoTimerRef.current = null;
    };
  }, [motionEnabled, petVisible, scheduleAutoAction]);

  useEffect(() => {
    scheduleBubblePosition();
  }, [action, bubbleVisible, dragPhase, reactionCopy, scheduleBubblePosition, visibilityPhase]);

  useEffect(() => {
    const handleDrawingComplete = () => runSpecialAction("painting");
    const handleBrandHeart = () => runSpecialAction("heart");

    window.addEventListener(ACADEMY_DRAWING_COMPLETE_EVENT, handleDrawingComplete);
    window.addEventListener(ACADEMY_BRAND_HEART_EVENT, handleBrandHeart);
    return () => {
      window.removeEventListener(ACADEMY_DRAWING_COMPLETE_EVENT, handleDrawingComplete);
      window.removeEventListener(ACADEMY_BRAND_HEART_EVENT, handleBrandHeart);
    };
  }, [runSpecialAction]);

  useEffect(() => {
    if (action !== "move" || !bubbleVisible) return;
    let frame = 0;
    const followWalk = () => {
      syncBubblePosition();
      frame = window.requestAnimationFrame(followWalk);
    };
    frame = window.requestAnimationFrame(followWalk);
    return () => window.cancelAnimationFrame(frame);
  }, [action, bubbleVisible, syncBubblePosition]);

  useEffect(() => {
    if (!motionEnabled) {
      clearTurnTimers();
      const idleTimer = window.setTimeout(() => {
        if (actionRef.current === "painting" || actionRef.current === "heart") return;
        clearActionTimers();
        actionRef.current = "idle";
        roamXRef.current = 0;
        buttonRef.current?.style.setProperty("--pet-roam-x", "0px");
        if (buttonRef.current) buttonRef.current.dataset.travel = "resting";
        setAction("idle");
        setBubbleVisible(false);
      }, 0);
      return () => window.clearTimeout(idleTimer);
    }

    const handleClickEffect = (event: Event) => {
      const detail = (event as CustomEvent<AcademyClickEffectDetail>).detail;
      const button = buttonRef.current;
      if (
        !button
        || !Number.isFinite(detail?.clientX)
        || visibilityPhaseRef.current !== "visible"
        || dragPhaseRef.current !== "idle"
        || actionRef.current !== "idle"
        || turningRef.current
      ) return;

      const bounds = button.getBoundingClientRect();
      const centerX = bounds.left + bounds.width / 2;
      beginTurn(detail.clientX < centerX ? "left" : "right");
    };

    window.addEventListener(ACADEMY_CLICK_EFFECT_EVENT, handleClickEffect);
    return () => {
      window.removeEventListener(ACADEMY_CLICK_EFFECT_EVENT, handleClickEffect);
    };
  }, [beginTurn, clearActionTimers, clearTurnTimers, motionEnabled]);

  useEffect(() => {
    const keepInsideViewport = () => {
      const button = buttonRef.current;
      if (!button || dragPhaseRef.current === "dragging") return;

      const bounds = button.getBoundingClientRect();
      const maximumLeft = Math.max(PET_VIEWPORT_MARGIN, window.innerWidth - bounds.width - PET_VIEWPORT_MARGIN);
      const maximumTop = Math.max(PET_VIEWPORT_MARGIN, window.innerHeight - bounds.height - PET_VIEWPORT_MARGIN);
      const clampedLeft = Math.min(maximumLeft, Math.max(PET_VIEWPORT_MARGIN, bounds.left));
      const clampedTop = Math.min(maximumTop, Math.max(PET_VIEWPORT_MARGIN, bounds.top));
      if (clampedLeft !== bounds.left || clampedTop !== bounds.top) {
        const renderedX = bounds.left - button.offsetLeft;
        const renderedY = bounds.top - button.offsetTop;
        roamXRef.current = 0;
        button.style.setProperty("--pet-roam-x", "0px");
        setUserPosition(
          renderedX + clampedLeft - bounds.left,
          renderedY + clampedTop - bounds.top,
        );
      }
    };

    const handleResize = () => {
      keepInsideViewport();
      scheduleBubblePosition();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [scheduleBubblePosition, setUserPosition]);

  useEffect(() => () => {
    clearActionTimers();
    clearTurnTimers();
    clearDragTimers();
    if (bubbleRafRef.current !== null) window.cancelAnimationFrame(bubbleRafRef.current);
    if (autoTimerRef.current !== null) window.clearTimeout(autoTimerRef.current);
    if (appearanceTimerRef.current !== null) window.clearTimeout(appearanceTimerRef.current);
    const button = buttonRef.current;
    const session = dragSessionRef.current;
    if (button && session && button.hasPointerCapture(session.pointerId)) {
      button.releasePointerCapture(session.pointerId);
    }
    dragSessionRef.current = null;
  }, [clearActionTimers, clearDragTimers, clearTurnTimers]);

  const updateDraggedPosition = useCallback((clientX: number, clientY: number) => {
    const button = buttonRef.current;
    const session = dragSessionRef.current;
    if (!button || !session) return;

    const rawLeft = session.dragStartLeft + clientX - session.dragStartClientX;
    const rawTop = session.dragStartTop + clientY - session.dragStartClientY;
    const maximumLeft = Math.max(
      PET_VIEWPORT_MARGIN,
      window.innerWidth - button.offsetWidth - PET_VIEWPORT_MARGIN,
    );
    const maximumTop = Math.max(
      PET_VIEWPORT_MARGIN,
      window.innerHeight - button.offsetHeight - PET_VIEWPORT_MARGIN,
    );
    const nextLeft = Math.min(maximumLeft, Math.max(PET_VIEWPORT_MARGIN, rawLeft));
    const nextTop = Math.min(maximumTop, Math.max(PET_VIEWPORT_MARGIN, rawTop));
    setUserPosition(
      session.dragStartUserX + nextLeft - session.dragStartLeft,
      session.dragStartUserY + nextTop - session.dragStartTop,
    );

  }, [setUserPosition]);

  const beginDrag = useCallback((pointerId: number) => {
    const button = buttonRef.current;
    const session = dragSessionRef.current;
    if (!button || !session || session.pointerId !== pointerId) return;

    if (autoTimerRef.current !== null) window.clearTimeout(autoTimerRef.current);
    autoTimerRef.current = null;
    clearActionTimers();
    clearTurnTimers();
    setDragArt("idle");
    actionRef.current = "idle";
    setAction("idle");

    // Freeze any in-progress campus walk at its visually rendered position,
    // then make the user's drag offset the single source of truth.
    const renderedBounds = button.getBoundingClientRect();
    const renderedX = renderedBounds.left - button.offsetLeft;
    const renderedY = renderedBounds.top - button.offsetTop;
    setPetDragFrame(session.airFrame);
    setPetDragPhase("lifting");
    roamXRef.current = 0;
    button.style.setProperty("--pet-roam-x", "0px");
    setUserPosition(renderedX, renderedY);

    session.dragStartClientX = session.lastClientX;
    session.dragStartClientY = session.lastClientY;
    session.dragStartLeft = renderedBounds.left;
    session.dragStartTop = renderedBounds.top;
    session.dragStartUserX = renderedX;
    session.dragStartUserY = renderedY;
    // Lock one purpose-drawn airborne pose to the direction that Izumi had
    // when picked up. Pointer movement never changes her facing in the air.
    setReactionCopy(PET_PICKUP_COPY);
    setBubbleVisible(true);

    try {
      if (!button.hasPointerCapture(pointerId)) button.setPointerCapture(pointerId);
    } catch {
      // Pointer capture is an enhancement; the pointer handlers still reset safely.
    }

    if (motionEnabled) {
      liftArtTimerRef.current = window.setTimeout(() => {
        if (dragSessionRef.current?.pointerId === pointerId) setDragArt("sprite");
        liftArtTimerRef.current = null;
      }, PET_PICKUP_ART_MS);
      liftEndTimerRef.current = window.setTimeout(() => {
        const activeSession = dragSessionRef.current;
        if (activeSession?.pointerId === pointerId) {
          setPetDragPhase("dragging");
        }
        liftEndTimerRef.current = null;
      }, PET_LIFT_MS);
    } else {
      setDragArt("sprite");
      setPetDragFrame(session.airFrame);
      setPetDragPhase("dragging");
    }
  }, [
    clearActionTimers,
    clearTurnTimers,
    motionEnabled,
    setPetDragFrame,
    setPetDragPhase,
    setUserPosition,
  ]);

  const finishDrag = useCallback((pointerId: number, cancelled = false) => {
    const button = buttonRef.current;
    const session = dragSessionRef.current;
    if (!button || !session || session.pointerId !== pointerId) return;

    const wasDragging = session.hasMoved;
    clearDragTimers();
    dragSessionRef.current = null;
    try {
      if (button.hasPointerCapture(pointerId)) button.releasePointerCapture(pointerId);
    } catch {
      // Pointer capture may already have been released by the browser.
    }

    if (!wasDragging) {
      setReactionCopy(null);
      setBubbleVisible(false);
      setDragArt("idle");
      setPetDragFrame(0);
      setPetDragPhase("idle");
      if (cancelled) scheduleAutoAction();
      return;
    }

    suppressClickRef.current = true;
    if (cancelled) {
      setReactionCopy(null);
      setBubbleVisible(false);
      setDragArt("idle");
      setPetDragFrame(0);
      setPetDragPhase("idle");
      scheduleAutoAction();
      return;
    }

    setReactionCopy(PET_LANDING_COPY);
    setBubbleVisible(true);
    if (bubbleTimerRef.current !== null) window.clearTimeout(bubbleTimerRef.current);
    bubbleTimerRef.current = window.setTimeout(() => {
      setBubbleVisible(false);
      setReactionCopy(null);
      bubbleTimerRef.current = null;
    }, 2_600);

    if (!motionEnabled) {
      setPetDragFrame(5);
      setPetDragPhase("landing");
      landingTimerRef.current = window.setTimeout(() => {
        setDragArt("idle");
        setPetDragFrame(0);
        setPetDragPhase("idle");
        landingTimerRef.current = null;
        scheduleAutoAction();
      }, PET_STILL_LAND_MS);
      return;
    }

    const bounds = button.getBoundingClientRect();
    const availableDrop = Math.max(
      0,
      window.innerHeight - PET_VIEWPORT_MARGIN - bounds.bottom,
    );
    setPetDragFrame(4);
    setPetDragPhase("dropping");
    setUserPosition(userXRef.current, userYRef.current + Math.min(14, availableDrop));
    dropTimerRef.current = window.setTimeout(() => {
      setPetDragFrame(5);
      setPetDragPhase("landing");
      dropTimerRef.current = null;
      landingTimerRef.current = window.setTimeout(() => {
        setPetDragFrame(6);
        setPetDragPhase("recovering");
        landingTimerRef.current = null;
        recoveryTimerRef.current = window.setTimeout(() => {
          setDragArt("idle");
          setPetDragPhase("celebrating");
          setReactionCopy(PET_CELEBRATE_COPY);
          recoveryTimerRef.current = null;
          celebrationTimerRef.current = window.setTimeout(() => {
            setPetDragFrame(0);
            setPetDragPhase("idle");
            celebrationTimerRef.current = null;
            scheduleAutoAction(1_800);
          }, PET_CELEBRATE_MS);
        }, PET_RECOVER_MS);
      }, PET_LAND_MS);
    }, PET_DROP_MS);
  }, [
    clearDragTimers,
    motionEnabled,
    scheduleAutoAction,
    setPetDragFrame,
    setPetDragPhase,
    setUserPosition,
  ]);

  // A disabled pet should not download sprite sheets or keep hidden art animating.
  if (visibilityPhase === "hidden") return null;

  return (
    <div
      className={styles.petLayer}
      data-motion={motionEnabled ? "on" : "off"}
      data-visibility={visibilityPhase}
    >
      <button
        ref={buttonRef}
        className={styles.petButton}
        data-academy-no-effect
        data-action={action}
        data-facing="left"
        data-travel="resting"
        data-turning="idle"
        data-drag-phase={dragPhase}
        data-drag-frame={dragFrame}
        data-drag-art={dragArt}
        data-species="izumi"
        type="button"
        tabIndex={visibilityPhase === "visible" ? 0 : -1}
        aria-label="Izumi Sakurai companion. Click for another action. Hold for 0.1 seconds, then drag to move her."
        title="Click to say hello · Hold 0.1 seconds, then drag to move Izumi"
        onPointerDown={(event) => {
          if (event.pointerType !== "mouse" || event.button !== 0 || !event.isPrimary) return;
          if (visibilityPhaseRef.current !== "visible") return;
          if (dragPhaseRef.current !== "idle") return;

          clearDragTimers();
          suppressClickRef.current = false;
          dragSessionRef.current = {
            pointerId: event.pointerId,
            lastClientX: event.clientX,
            lastClientY: event.clientY,
            dragStartClientX: event.clientX,
            dragStartClientY: event.clientY,
            dragStartLeft: 0,
            dragStartTop: 0,
            dragStartUserX: userXRef.current,
            dragStartUserY: userYRef.current,
            airFrame: facingRef.current === "left" ? 2 : 3,
            hasMoved: false,
          };
          try {
            if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
              event.currentTarget.setPointerCapture(event.pointerId);
            }
          } catch {
            // Pointer capture keeps the pending hold stable outside the button.
          }
          holdTimerRef.current = window.setTimeout(() => {
            const session = dragSessionRef.current;
            holdTimerRef.current = null;
            if (!session || session.pointerId !== event.pointerId || session.hasMoved) return;
            session.hasMoved = true;
            suppressClickRef.current = true;
            beginDrag(event.pointerId);
          }, PET_HOLD_MS);
        }}
        onPointerMove={(event) => {
          const session = dragSessionRef.current;
          if (!session || session.pointerId !== event.pointerId) return;
          session.lastClientX = event.clientX;
          session.lastClientY = event.clientY;
          if (dragPhaseRef.current === "idle") {
            const deltaX = event.clientX - session.dragStartClientX;
            const deltaY = event.clientY - session.dragStartClientY;
            if (
              deltaX * deltaX + deltaY * deltaY
              >= PET_DRAG_MOVE_THRESHOLD * PET_DRAG_MOVE_THRESHOLD
            ) {
              session.hasMoved = true;
              suppressClickRef.current = true;
              if (holdTimerRef.current !== null) {
                window.clearTimeout(holdTimerRef.current);
                holdTimerRef.current = null;
              }
            }
            return;
          }
          if (!session.hasMoved) {
            const deltaX = event.clientX - session.dragStartClientX;
            const deltaY = event.clientY - session.dragStartClientY;
            session.hasMoved = deltaX * deltaX + deltaY * deltaY
              >= PET_DRAG_MOVE_THRESHOLD * PET_DRAG_MOVE_THRESHOLD;
            if (session.hasMoved) suppressClickRef.current = true;
          }
          if (
            session.hasMoved
            && (dragPhaseRef.current === "lifting" || dragPhaseRef.current === "dragging")
          ) {
            event.preventDefault();
            updateDraggedPosition(event.clientX, event.clientY);
          }
        }}
        onPointerUp={(event) => {
          const session = dragSessionRef.current;
          if (!session || session.pointerId !== event.pointerId) return;
          if (dragPhaseRef.current === "idle") {
            if (holdTimerRef.current !== null) {
              window.clearTimeout(holdTimerRef.current);
              holdTimerRef.current = null;
            }
            dragSessionRef.current = null;
            try {
              if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                event.currentTarget.releasePointerCapture(event.pointerId);
              }
            } catch {
              // The browser may release capture before this handler finishes.
            }
            return;
          }
          if (!session.hasMoved) {
            const deltaX = event.clientX - session.dragStartClientX;
            const deltaY = event.clientY - session.dragStartClientY;
            session.hasMoved = deltaX * deltaX + deltaY * deltaY
              >= PET_DRAG_MOVE_THRESHOLD * PET_DRAG_MOVE_THRESHOLD;
            if (session.hasMoved) suppressClickRef.current = true;
          }
          if (
            session.hasMoved
            && (dragPhaseRef.current === "lifting" || dragPhaseRef.current === "dragging")
          ) {
            updateDraggedPosition(event.clientX, event.clientY);
          }
          finishDrag(event.pointerId);
        }}
        onPointerCancel={(event) => {
          finishDrag(event.pointerId, true);
          suppressClickRef.current = false;
        }}
        onLostPointerCapture={(event) => {
          if (dragSessionRef.current?.pointerId === event.pointerId) {
            finishDrag(event.pointerId, true);
            suppressClickRef.current = false;
          }
        }}
        onDragStart={(event) => event.preventDefault()}
        onClick={(event) => {
          if (visibilityPhaseRef.current !== "visible") return;
          if (suppressClickRef.current) {
            suppressClickRef.current = false;
            event.preventDefault();
            event.stopPropagation();
            return;
          }
          const next = runNextAction();
          scheduleAutoAction(ACTION_DURATION[next]);
        }}
      >
        <span className={styles.stage} aria-hidden="true">
          <span className={styles.facing}>
            <IzumiIllustration />
            <IzumiReactionIllustration />
          </span>
          <IzumiDragIllustration />
          <IzumiTurnIllustration />
          <IzumiAppearanceIllustration />
        </span>
      </button>
      <span
        ref={bubbleRef}
        className={styles.bubble}
        data-academy-no-effect
        data-visible={bubbleVisible ? "true" : "false"}
        role="status"
        aria-live="polite"
      >
        {reactionCopy ?? ACTION_COPY[action]}
      </span>
    </div>
  );
}

export function AcademyCustomizer() {
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    getHydratedSnapshot,
    getServerHydratedSnapshot,
  );

  return hydrated ? createPortal(<AcademyPet />, document.body) : null;
}
