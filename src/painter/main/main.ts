import { State } from "@/state"
import {
    tgdActionCreateTransfoInterpolation,
    tgdActionCreateVec3Interpolation,
    TgdAnimation,
    tgdCalcMix,
    TgdContext,
    TgdLight,
    TgdMaterialDiffuse,
    TgdPainterMeshGltf,
    TgdPainterNode,
    TgdQuat,
    TgdVec3,
} from "@tolokoban/tgd"
import { Material } from "./material"

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
    static readonly width = 5.08
    static readonly height = 6.4

    readonly name: string
    readonly xOrigin: number
    readonly yOrigin: number

    private animating: "none" | "foreward" | "backward" = "none"
    private readonly materialSocle: Material
    private readonly materialLetter: Material
    private runningAnimations: TgdAnimation[] = []
    private _transition = 0

    constructor(
        private readonly context: TgdContext,
        index: number
    ) {
        super()
        const asset = State.assets.glb.value
        if (!asset) throw new Error("Asset has not been loaded yet!")

        this.name = NAMES[index] ?? `Invalid index #${index}!`
        const materialSocle = (this.materialSocle = new Material({
            color2D: [0.1, 0.1, 0.1, 1],
            color3D: [0.5, 0.5, 0.5, 1],
        }))
        const materialLetter = (this.materialLetter = new Material({
            color2D: [1, 1, 1, 1],
            color3D: [0.4, 0.4, 0.4, 1],
        }))
        const socle = new TgdPainterMeshGltf(context, {
            asset,
            meshIndexOrName: "Stencil",
            material: materialSocle,
        })
        const letter = new TgdPainterMeshGltf(context, {
            asset,
            meshIndexOrName: this.name,
            material: materialLetter,
        })
        this.add(
            socle,
            new TgdPainterNode({
                children: [letter],
                transfo: {
                    /**
                     * Little shift to avoid Z fighting.
                     */
                    position: [0, 0, 0.1],
                },
            })
        )
        const col = index % 7
        const row = Math.floor(index / 7)
        const x = (col - 3) * PainterMain.width
        const y = (0.5 - row) * PainterMain.height
        this.transfo.setPosition(x, y, 0)
        this.xOrigin = x
        this.yOrigin = y
    }

    private get transition() {
        return this._transition
    }
    private set transition(value: number) {
        this._transition = value
        this.materialSocle.transition = value
        this.materialLetter.transition = value
    }

    readonly select = () => {
        console.log("Select", this.name)
        if (this.animating !== "none") return

        const { xOrigin, yOrigin, context } = this
        this.animating = "foreward"
        const actionMove = tgdActionCreateVec3Interpolation({
            from: [xOrigin, yOrigin, 0],
            to: [xOrigin / 10, 0, 7.5],
            action: (vec) => {
                this.transfo.setPosition(...vec)
            },
        })
        this.runningAnimations = context.animSchedule({
            duration: 0.2,
            action: (alpha) => {
                this.transition = alpha
                actionMove(alpha)
            },
            onEnd: () => {
                const duration = 30
                this.runningAnimations = context.animSchedule({
                    duration,
                    action: (alpha) => {
                        const t = alpha * duration
                        const t1 = t
                        const t2 = t * 1.344
                        const orientation = new TgdQuat()
                        orientation.rotateAroundX(Math.sin(t1) * 0.15)
                        orientation.rotateAroundY(Math.sin(t2) * 0.15)
                        this.transfo.orientation = orientation
                    },
                    onEnd: () => {
                        this.unselect()
                    },
                })
            },
        })
    }

    readonly unselect = () => {
        if (this.animating !== "foreward") return

        this.animating = "backward"
        const { xOrigin, yOrigin, context, transition } = this
        for (const animation of this.runningAnimations) {
            context.animCancel(animation)
        }
        this.runningAnimations = []
        const actionMove = tgdActionCreateTransfoInterpolation(
            this.transfo,
            this.transfo,
            {
                position: [xOrigin, yOrigin, 0],
                orientation: new TgdQuat(),
            }
        )
        context.animSchedule({
            duration: 0.2,
            action: (alpha) => {
                this.transition = tgdCalcMix(transition, 0, alpha)
                actionMove(alpha)
            },
            onEnd: () => (this.animating = "none"),
        })
    }

    hitTest(xWorld: number, yWorld: number): boolean {
        const x = Math.abs(xWorld - this.xOrigin)
        const y = Math.abs(yWorld - this.yOrigin)
        return x < PainterMain.width / 2 && y < PainterMain.height / 2
    }
}
