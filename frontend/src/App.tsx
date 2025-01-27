import { RouterProvider } from "react-router-dom";
import AppInitializer from "./lib/appInitializer/AppInitializer";
import router from "./Router"
import { Toaster } from "sonner";

function App(){
  return (
    <>
    <Toaster position="bottom-right" expand={false} richColors/>
     <AppInitializer/>
     <RouterProvider router = {router}/> 
     </>
  )
}

export default App;

