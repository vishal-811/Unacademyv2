import WebSocket from "ws";
import { BroadCastMessage } from "../lib/utils";
import { ExcaliDrawEventData } from "../types";

export function handleExcaliDrawEvent(
  data: ExcaliDrawEventData,
  ws: WebSocket
) {
  if (!data) {
    ws.send("please provide a roomId");
  }
  const { roomId, excaliEvent } = data;

  // Off the view mode for the subscribers.
  const updatedExcaliEvent = { ...excaliEvent.appState };
  updatedExcaliEvent.collaborators = [];
  updatedExcaliEvent.viewModeEnabled = true;

  const finalExcaliEvent = {
    elements: excaliEvent.elements,
    appState: updatedExcaliEvent,
  };
  BroadCastMessage(roomId, ws, { excaliData: finalExcaliEvent });
  // Write in a kafka for the record.
}