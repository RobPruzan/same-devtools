import { useEffect, useRef, useState } from "react";
import { ChildToParentMessage } from "~/devtools";
import { useIFrameMessenger } from "../hooks/use-iframe-listener";

interface Props {
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
}

interface RectPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function DevtoolsOverlay({ iframeRef }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentRectRef = useRef<RectPosition | null>(null);
  const targetRectRef = useRef<RectPosition | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const lastThrottleTimeRef = useRef<number>(0);
  const lastElementRef = useRef<Element | null>(null);


  useEffect(() => {
    const canvas = canvasRef.current;
    const iframe = iframeRef.current;
    if (!canvas || !iframe) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const handleMessage = (event: MessageEvent<ChildToParentMessage>) => {
      if (event.origin !== "http://localhost:4200") return;

      if (event.data.kind === "mouse-position-update") {
        const now = Date.now();
        const throttleInterval = 50;

        if (now - lastThrottleTimeRef.current >= throttleInterval) {
          const iframeRect = iframe.getBoundingClientRect();
          const { rect } = event.data;

          targetRectRef.current = {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
          };

          if (!currentRectRef.current) {
            currentRectRef.current = { ...targetRectRef.current };
          }

          if (rafIdRef.current === null) {
            rafIdRef.current = requestAnimationFrame(animateRect);
          }

          lastThrottleTimeRef.current = now;
        }
      }
    };

    const lerp = (start: number, end: number, t: number): number => {
      return start * (1 - t) + end * t;
    };

    const animateRect = () => {
      if (
        !ctx ||
        !canvas ||
        !currentRectRef.current ||
        !targetRectRef.current
      ) {
        rafIdRef.current = null;
        return;
      }

      const current = currentRectRef.current;
      const target = targetRectRef.current;
      const lerpFactor = 0.2;

      current.x = lerp(current.x, target.x, lerpFactor);
      current.y = lerp(current.y, target.y, lerpFactor);
      current.width = lerp(current.width, target.width, lerpFactor);
      current.height = lerp(current.height, target.height, lerpFactor);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "rgba(138, 43, 226, 0.8)";
      ctx.lineWidth = 2;
      ctx.strokeRect(current.x, current.y, current.width, current.height);

      const isCloseEnough =
        Math.abs(current.x - target.x) < 0.5 &&
        Math.abs(current.y - target.y) < 0.5 &&
        Math.abs(current.width - target.width) < 0.5 &&
        Math.abs(current.height - target.height) < 0.5;

      if (isCloseEnough) {
        Object.assign(current, target);
        rafIdRef.current = null;
      } else {
        rafIdRef.current = requestAnimationFrame(animateRect);
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      if (iframe) {
        const rect = iframe.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    });

    resizeObserver.observe(iframe);
    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
      resizeObserver.disconnect();
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [iframeRef]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        pointerEvents: "none",
        top: 0,
        left: 0,
      }}
    />
  );
}
