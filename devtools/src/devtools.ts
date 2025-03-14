let z: any = { ref: null };
z.ref = z;

const TARGET_ORIGIN = "http://localhost:5173";

document.addEventListener("mousemove", (e) => {
  const target = e.target;

  if (!(target instanceof Element)) {
    return;
  }

  const rect = target.getBoundingClientRect();

  sendMessage({
    kind: "mouse-position-update",
    rect,
  });
});

export type Message =
  | {
      kind: "mouse-position-update";
      rect: DOMRect
    }
  // | {
  //     kind: string;
  //   };

const sendMessage = (message: Message) => {
  window.parent.postMessage(message, TARGET_ORIGIN);
};
