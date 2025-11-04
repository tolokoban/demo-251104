import { State } from "@/state"
import {
    TgdContext,
    TgdLight,
    TgdMaterialDiffuse,
    TgdPainterMeshGltf,
    TgdPainterNode,
    TgdVec3,
} from "@tolokoban/tgd"

const NAMES = [
    "Lemanic",
    "Arvana",
    "Banya mist",
    "Banya Std",
    "Fuzar",
    "Giparan",
    "Kronik Antik",
    "Kronik grotesk",
    "Kronik vision",
    "Medley",
    "Oni",
    "Ortank",
    "Ortank Hangeul",
    "Superheat",
]

export class PainterMain extends TgdPainterNode {
    static readonly width = 5.04
    static readonly height = 6.36

    constructor(context: TgdContext, index: number) {
        super()
        const asset = State.assets.glb.value
        if (!asset) throw new Error("Asset has not been loaded yet!")

        const materialSocle = new TgdMaterialDiffuse({
            lockLightsToCamera: true,
            light: new TgdLight({
                direction: new TgdVec3(0.3, -1, -1).normalize(),
            }),
            color: [0.8, 0.8, 0.9, 1],
        })
        const materialLetter = new TgdMaterialDiffuse({
            lockLightsToCamera: true,
            light: new TgdLight({
                direction: new TgdVec3(0.3, -1, -1).normalize(),
            }),
            color: [0.7, 0.7, 0.8, 1],
        })
        const socle = new TgdPainterMeshGltf(context, {
            asset,
            meshIndexOrName: "Stencil",
            material: materialSocle,
        })
        const letter = new TgdPainterMeshGltf(context, {
            asset,
            meshIndexOrName: NAMES[index],
            material: materialLetter,
        })
        this.add(socle, letter)
        const col = index % 7
        const row = Math.floor(index / 7)
        const x = (col - 3) * PainterMain.width
        const y = (0.5 - row) * PainterMain.height
        this.transfo.setPosition(x, y, 0)
    }
}
