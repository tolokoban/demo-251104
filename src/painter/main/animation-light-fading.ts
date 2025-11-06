import {
    TgdAnimation,
    tgdCalcMix,
    tgdCalcRandom,
    TgdContext,
    tgdEasingFunctionInOutBounce,
} from "@tolokoban/tgd"

const MAX_LIGHT = 1
const MIN_LIGHT = 0.1

export class AnimationLightFading {
    private runningAnimations: TgdAnimation[] = []

    constructor(
        private readonly target: {
            context: TgdContext
            lightColor2D: number
            name: string
        }
    ) {}

    animToDark() {
        this.clear()
        const { target } = this
        const { context, lightColor2D } = target
        const duration =
            tgdCalcRandom(0.3, 1) * Math.abs(MIN_LIGHT - lightColor2D)
        this.runningAnimations = context.animSchedule({
            name: `${this.target.name} (to DARK)`,
            duration,
            delay: tgdCalcRandom(0.5),
            action: (alpha: number) => {
                target.lightColor2D = tgdCalcMix(lightColor2D, MIN_LIGHT, alpha)
            },
        })
    }

    animToLight() {
        this.clear()
        const { target } = this
        const { context, lightColor2D } = target
        const duration =
            tgdCalcRandom(1, 2) * Math.abs(MAX_LIGHT - lightColor2D)
        this.runningAnimations = context.animSchedule({
            name: `${this.target.name} (to LIGHT)`,
            duration,
            delay: tgdCalcRandom(0.5),
            action: (alpha: number) => {
                target.lightColor2D = tgdCalcMix(lightColor2D, MAX_LIGHT, alpha)
            },
        })
    }

    clear() {
        for (const anim of this.runningAnimations) {
            this.target.context.animCancel(anim)
        }
        this.runningAnimations = []
    }
}
