import { useEffect, useRef, useState } from "react";
import lastUpdate from "./hot-reload.ts";
import "./App.css";
import { Message } from "~/devtools";
import { DevtoolsOverlay } from "./components/DevtoolsOverlay";

function App() {
  const iframeRef = useDevtoolsListener();
  const [isPulsing, setIsPulsing] = useState(false);
  useEffect(() => {
    setIsPulsing(true);
    const timer = setTimeout(() => {
      setIsPulsing(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [lastUpdate]);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div
        style={{
          color: isPulsing ? "purple" : "inherit",
          transition: "color 0.3s ease-in-out",
          fontWeight: isPulsing ? "bold" : "normal",
          transform: isPulsing ? "scale(1.05)" : "scale(1)",
          display: "inline-block",
        }}
      >
        last updated: {lastUpdate}
      </div>
      <div style={{ position: "relative" }}>
        <iframe
          key={lastUpdate}
          ref={iframeRef}
          style={{ height: "75vh", width: "75vw" }}
          src="http://localhost:4200"
        />
        <DevtoolsOverlay iframeRef={iframeRef} />
      </div>
    </div>
  );
}

const useDevtoolsListener = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleMessage = (event: any) => {
      if (event.origin !== "http://localhost:4200") return;
      console.log("Message received:", event.data);
    };

    window.addEventListener("message", handleMessage);

    return () => window.removeEventListener("message", handleMessage);
  }, [lastUpdate, iframeRef.current]);

  return iframeRef;
};

export default App;
