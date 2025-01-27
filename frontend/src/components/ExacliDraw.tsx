import { Excalidraw } from "@excalidraw/excalidraw";
import { useSocket } from "../strore/useSocket";
import { RoleType, useRole } from "../strore/useRole";
import { useExcaliData } from "../strore/useExcaliData";
import { useEffect, useState } from "react";
import {
  AppState,
  ExcalidrawImperativeAPI,
} from "@excalidraw/excalidraw/types/types";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import { useExcaliRoomId } from "../strore/useExcaliRoomId";

export function ExcalidrawComponent() {
  const excalidrawData = useExcaliData((state) => state.excalidrawData);
  const Socket = useSocket((state) => state.socket);
  const roleStore = useRole();
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI>();

  const ExcaliRoomId = useExcaliRoomId((state) => state.ExcaliRoomId);

    
  const handleChange = (
    elements: readonly ExcalidrawElement[],
    appState: AppState
  ) => {

    if (roleStore.role === RoleType.student) return;

    if (Socket && Socket.readyState === WebSocket.OPEN) {
      Socket.send(
        JSON.stringify({
          type: "excali_draw_event",
          data: {
            roomId: ExcaliRoomId,
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
    <div className="w-full h-full object-cover">
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
