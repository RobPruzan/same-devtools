import { useEffect, useRef } from "react";
import { Message } from "~/devtools";

interface Props {
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
}

export function DevtoolsOverlay({ iframeRef }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const iframe = iframeRef.current;
    if (!canvas || !iframe) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const handleMessage = (event: MessageEvent<Message>) => {
      if (event.origin !== "http://localhost:4200") return;
      
      if (event.data.kind === "mouse-position-update") {
        const iframeRect = iframe.getBoundingClientRect();
        const { rect } = event.data;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = "rgba(138, 43, 226, 0.8)";
        ctx.lineWidth = 2;
        ctx.strokeRect(
          rect.x,
          rect.y,
          rect.width,
          rect.height
        );
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