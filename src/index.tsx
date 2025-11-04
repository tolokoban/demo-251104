import { createRoot } from "react-dom/client"
import { tgdLoadGlb } from "@tolokoban/tgd"

import { State } from "@/state"

import App from "./app"

import GlbURL from "@/gfx/digital_stencil_plaque.glb"

import "./index.css"

async function start() {
    const glb = await tgdLoadGlb(GlbURL)
    State.assets.glb.value = glb
    const container = document.getElementById("app")
    if (!container) throw new Error("Missing element with id #app!")

    createRoot(container).render(<MainPage />)

    const splash = document.getElementById("tgd-logo")
    if (splash) {
        splash.classList.add("vanish")
        window.setTimeout(() => splash.parentNode?.removeChild(splash), 1000)
    }
}

function MainPage() {
    return <App />
}

start()
