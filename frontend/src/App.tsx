import { BrowserRouter, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import HomePage from "./pages/HomePage"
import SignupPage from "./pages/Signup"
import SigninPage from "./pages/Signin"

function App() {

  return (
    <BrowserRouter>
     <Navbar/>
       <Routes>
         <Route path="/" element={<HomePage/>}/>
         <Route path="/signup" element ={<SignupPage/>}/>
         <Route path="signin" element={<SigninPage/>}/>
       </Routes>
    </BrowserRouter> 
  )
}

export default App
