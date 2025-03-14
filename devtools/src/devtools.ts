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

const sendMessage = (message: ChildToParentMessage) => {
  window.parent.postMessage(message, TARGET_ORIGIN);
};

const handleParentMessage = (message: ParentToChildMessage) => {
  console.log("the message", message);
};

window.addEventListener("message", (event) => {
  if (event.origin !== TARGET_ORIGIN) {
    return;
  }
  handleParentMessage(event.data as any);
});

/**
 *
 * basically treat this as a websocket connection
 */

/**
 *
 * todo: we need a ping pong server so parent knows if the child connection got interrupted
 */
