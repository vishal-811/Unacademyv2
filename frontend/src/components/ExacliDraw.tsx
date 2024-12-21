import { Excalidraw } from "@excalidraw/excalidraw";

export function ExcalidrawComponent() {
  return (
    <>
      <div className="w-full h-full">
        <Excalidraw onChange={(e)=>{
            console.log(e)
        }} />
      </div>
    </>
  );
}
