import { createRoot } from "react-dom/client"
import { tgdLoadGlb, tgdLoadImages } from "@tolokoban/tgd"

import { State } from "@/state"

import App from "./app"

import GlbURL from "@/gfx/digital_stencil_plaque.glb"
import PosX from "@/gfx/Skybox/posX.webp" // +X
import PosY from "@/gfx/Skybox/posY.webp" // +Y
import PosZ from "@/gfx/Skybox/posZ.webp" // +Z
import NegX from "@/gfx/Skybox/negX.webp" // -X
import NegY from "@/gfx/Skybox/negY.webp" // -Y
import NegZ from "@/gfx/Skybox/negZ.webp" // -Z

import "./index.css"

async function start() {
    const container = document.getElementById("app")
    if (!container) throw new Error("Missing element with id #app!")
    const glb = await tgdLoadGlb(GlbURL)
    State.assets.glb.value = glb
    const images = await tgdLoadImages([PosX, PosY, PosZ, NegX, NegY, NegZ])
    for (const image of images) {
        if (!image) throw new Error("Unable to load an image of the Skybox!")
    }
    const [imagePosX, imagePosY, imagePosZ, imageNegX, imageNegY, imageNegZ] =
        images as HTMLImageElement[]
    State.assets.skybox.value = {
        imagePosX,
        imagePosY,
        imagePosZ,
        imageNegX,
        imageNegY,
        imageNegZ,
    }
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
