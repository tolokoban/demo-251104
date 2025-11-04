import {
    TgdCameraPerspective,
    TgdContext,
    TgdControllerCameraOrbit,
    tgdEasingFunctionOutBack,
    TgdPainterClear,
    TgdPainterLogic,
    TgdPainterState,
    TgdQuat,
    webglPresetDepth,
} from "@tolokoban/tgd"

import { State } from "@/state"
import { PainterMain } from "@/painter/main/main"

export function useGameHandler() {
    return (canvas: HTMLCanvasElement | null) => {
        if (!canvas) return

        const camera = new TgdCameraPerspective({
            transfo: {
                distance: 20,
                position: [0, 0, 0],
            },
            far: 1000,
            near: 0.1,
            fovy: Math.PI / 4,
            zoom: 1,
        })
        const context = new TgdContext(canvas, { camera })
        const state = new TgdPainterState(context, {
            depth: webglPresetDepth.lessOrEqual,
            children: [
                new TgdPainterLogic(() => {
                    const ratio = PainterMain.width / PainterMain.height
                    if (context.aspectRatio > ratio) {
                        camera.spaceHeightAtTarget = 2 * PainterMain.height
                    } else {
                        camera.spaceWidthAtTarget = 7 * PainterMain.width
                    }
                }),
                new TgdPainterClear(context, {
                    color: [0, 0, 0, 1],
                    depth: 1,
                }),
            ],
        })
        context.add(state)
        const asset = State.assets.glb.value
        if (!asset) throw new Error("Asset has not been loaded yet!")

        for (let index = 0; index < 14; index++) {
            const mesh = new PainterMain(context, index)
            state.add(mesh)
            context.animSchedule({
                action: (t: number) => {
                    mesh.transfo.setOrientation(
                        new TgdQuat().rotateAroundX(Math.PI * 2 * t)
                    )
                },
                delay: index * 0.5,
                duration: 3,
                easingFunction: tgdEasingFunctionOutBack,
            })
        }
        new TgdControllerCameraOrbit(context, {
            inertiaOrbit: 900,
        })
        context.paint()
    }
}
