import AtomicState from "@tolokoban/react-state"
import { TgdDataGlb } from "@tolokoban/tgd"

export const State = {
    assets: {
        glb: new AtomicState<TgdDataGlb | null>(null),
        skybox: new AtomicState({
            imagePosX: new Image(),
            imagePosY: new Image(),
            imagePosZ: new Image(),
            imageNegX: new Image(),
            imageNegY: new Image(),
            imageNegZ: new Image(),
        }),
    },
}
