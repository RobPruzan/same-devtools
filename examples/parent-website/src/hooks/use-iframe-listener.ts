import { ParentToChildMessage } from "~/devtools";

export const useIFrameMessenger = ({
  iframe,
}: {
  iframe: HTMLIFrameElement | null;
}) => {
  const sendMessageToChild = (message: ParentToChildMessage) => {
    if (!iframe || !iframe.contentWindow) return;

    iframe.contentWindow.postMessage(message, "http://localhost:4200");
  };

  return sendMessageToChild;
};
