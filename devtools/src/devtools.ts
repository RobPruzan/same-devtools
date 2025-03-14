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

export type ChildToParentMessage = {
  kind: "mouse-position-update";
  rect: DOMRect;
};

export type ParentToChildMessage = {
  kind: "something";
};

// | {
//     kind: string;
//   };

const sendMessage = (message: ChildToParentMessage) => {
  window.parent.postMessage(message, TARGET_ORIGIN);
};

window.addEventListener("message", (event) => {
  if (event.origin !== TARGET_ORIGIN) {
    return;
  }
  const message = event.data;
  console.log("Received message from parent:", message);
});
