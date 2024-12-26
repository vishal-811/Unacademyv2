import { RouterProvider } from "react-router-dom";
// import AppInitializer from "./lib/appInitializer/AppInitializer";
import router from "./Router"

function App(){
  return (
    <>
     {/* <AppInitializer/> */}
     <RouterProvider router = {router}/> 
     </>
  )
}

export default App;

