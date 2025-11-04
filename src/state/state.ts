import AtomicState from "@tolokoban/react-state"
import { TgdDataGlb } from "@tolokoban/tgd"

export const State = {
    assets: {
        glb: new AtomicState<TgdDataGlb | null>(null),
    },
}
