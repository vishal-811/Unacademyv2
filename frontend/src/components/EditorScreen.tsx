// import { Excalidraw } from "@excalidraw/excalidraw";
// import { useSocket } from "../strore/useSocket";
// import { useEffect } from "react";

// const socket = useSocket((state) => state.socket);

// export const EditorScreen = () =>{

//   useEffect(() => {
//     if(!socket) return;
 
//     socket.onopen = () => {
//       console.log("Admin connected to the excalidraw");
//     }
    
//     socket.onclose = () =>{
//       console.log("Admin close the socket connection");
//     }
//  })

//     return(
//        <div>
//            <Excalidraw
//               onChange={(e) => {
//                 socket?.send( JSON.stringify({
//                     type: "excali_draw_event",
//                     data: {
//                       roomId: "2e674758-2615-4a12-a553-f7b43255439d",
//                       excaliEvent: e,
//                     },
//                   }))
//               }}
//             />
//        </div>    
//     )
// }