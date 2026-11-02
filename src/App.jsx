import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin"
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"
import { useEffect } from "react"

import UpdatePassword from "./pages/UpdatePassword";


import "./App.css"

import Navbar from "./components/Navbar"
import Hero from "./components/Hero"
import SelectedWork from "./components/SelectedWork"
import About from "./components/About"
import Skills from "./components/Skills"
import Contact from "./components/Contact"
import Resume from "./components/Resume"
import DinePointCaseStudy from "./components/DinePointCaseStudy"
import BMSCECaseStudy from "./components/BMSCECaseStudy"
import DynamicCaseStudy from "./components/DynamicCaseStudy";

function HomePage() {
  const location = useLocation()

  useEffect(() => {
    if (!location.hash) return

    const sectionId = location.hash.slice(1)

    // Wait until the homepage section is rendered.
    requestAnimationFrame(() => {
      document.getElementById(sectionId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    })
  }, [location.pathname, location.hash])

  return (
    <>
      <Navbar />

      <main>
        <Hero />
        <SelectedWork />
        <About />
        <Skills />
        <Resume />
        <Contact />
      </main>
    </>
  )
}


function DinePointPage() {
  return (
    <>
      <Navbar />
      <DinePointCaseStudy />
    </>
  )
}
function BMSCEPage() {
  return (
    <>
      <Navbar />
      <BMSCECaseStudy />
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
     <Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/dinepoint" element={<DinePointPage />} />
  <Route path="/bmsce" element={<BMSCEPage />} />
  <Route path="/project/:projectId" element={<DynamicCaseStudy />} />
  <Route path="/admin" element={<AdminLogin />} />
  <Route path="/update-password" element={<UpdatePassword />} />
  <Route path="/admin/dashboard" element={<AdminDashboard />} />
</Routes>
    </BrowserRouter>
  )
}

export default App

