import {
    TgdCameraPerspective,
    TgdContext,
    TgdControllerCameraOrbit,
    tgdEasingFunctionOutBack,
    TgdPainterClear,
    TgdPainterLogic,
    TgdPainterState,
    TgdQuat,
    TgdTextureCube,
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
                    context.camera.fitSpaceAtTarget(
                        7.35 * PainterMain.width,
                        2.1 * PainterMain.height
                    )
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

        const skybox = new TgdTextureCube(context, State.assets.skybox.value)
        const letters: PainterMain[] = []
        for (let index = 0; index < 14; index++) {
            const mesh = new PainterMain(context, index, skybox)
            letters.push(mesh)
            state.add(mesh)
            // context.animSchedule({
            //     action: (t: number) => {
            //         mesh.transfo.setOrientation(
            //             new TgdQuat().rotateAroundX(Math.PI * 2 * t)
            //         )
            //     },
            //     delay: index * 0.5,
            //     duration: 3,
            //     easingFunction: tgdEasingFunctionOutBack,
            // })
        }
        context.paint()
        const findLetterAtPosition = (xScreen: number, yScreen: number) => {
            const { camera } = context
            const x = (camera.spaceWidthAtTarget * xScreen) / 2
            const y = (camera.spaceHeightAtTarget * yScreen) / 2
            for (const letter of letters) {
                if (letter.hitTest(x, y)) return letter
            }
            return undefined
        }
        context.inputs.pointer.eventTap.addListener((evt) => {
            for (const letter of letters) letter.unselect()
            const letter = findLetterAtPosition(evt.x, evt.y)
            if (!letter) return

            letter.select()
        })
    }
}
