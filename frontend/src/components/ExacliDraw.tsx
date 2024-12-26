import { Excalidraw } from "@excalidraw/excalidraw";
import { useSocket } from "../strore/useSocket";
import { RoleType, useRole } from "../strore/useRole";
import { useExcaliData } from "../strore/useExcaliData";
import { useEffect, useState } from "react";
import {
  AppState,
  ExcalidrawImperativeAPI,
  BinaryFiles,
} from "@excalidraw/excalidraw/types/types";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";


export function ExcalidrawComponent() {
  const excalidrawData = useExcaliData((state) => state.excalidrawData);
  const socket = useSocket((state) => state.socket);
  const roleStore = useRole();
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI>();

  const handleChange = (
    elements: readonly ExcalidrawElement[],
    appState: AppState,
    files: BinaryFiles
  ) => {
    if (roleStore.role === RoleType.student) return;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: "excali_draw_event",
          data: {
            roomId: "2e674758-2615-4a12-a553-f7b43255439d",
            excaliEvent: { elements: elements, appState: appState },
          },
        })
      );
    } else {
      console.error("WebSocket is not open. Cannot send event.");
    }
  };

  useEffect(() => {
    if (excalidrawData) {
      excalidrawAPI?.updateScene(excalidrawData);
    }
  }, [excalidrawData]);

  return (
    <div className="w-full h-full">
      {roleStore.role === RoleType.instructor ? (
        <Excalidraw
          initialData={{
            elements: [],
            appState: {},
          }}
          onChange={handleChange}
        />
      ) : (
        <Excalidraw
          initialData={{
            elements: [],
            appState: {},
          }}
          excalidrawAPI={(api) => setExcalidrawAPI(api)}
          viewModeEnabled={true}
        />
      )}
    </div>
  );
}
