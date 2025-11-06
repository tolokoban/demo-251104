import {
    ArrayNumber4,
    TgdMaterial,
    TgdTextureCube,
    TgdVec3,
    TgdVec4,
} from "@tolokoban/tgd"

interface MaterialOptions {
    color2D: TgdVec4 | ArrayNumber4
    color3D: TgdVec4 | ArrayNumber4
    skybox: TgdTextureCube
}

export class Material extends TgdMaterial {
    public transition = 0
    public lightColor2D = 1
    public readonly color2D = new TgdVec4()
    public readonly color3D = new TgdVec4()

    private readonly lightDir = new TgdVec3(0.1, -0.5, -1).normalize()

    constructor(options: MaterialOptions) {
        super({
            debug: true,
            attPosition: "POSITION",
            attNormal: "NORMAL",
            varyings: { varNormal: "vec3", varPosition: "vec4" },
            uniforms: {
                /**
                 * 0.0 = 2D
                 * 1.0 = 3D
                 */
                uniTransition: "float",
                uniColor2D: "vec4",
                uniColor3D: "vec4",
                uniLightDir: "vec3",
                uniSpecularExponent: "float",
                uniSpecularIntensity: "float",
                uniTransfoMatrix: "mat4",
                uniSkybox: "samplerCube",
            },
            setUniforms: (program, time, delay) => {
                program.uniform1f("uniTransition", this.transition)
                program.uniform4fv(
                    "uniColor2D",
                    this.color2D
                        .clone()
                        .scale4([
                            this.lightColor2D,
                            this.lightColor2D,
                            this.lightColor2D,
                            1,
                        ])
                )
                program.uniform4fv("uniColor3D", this.color3D)
                program.uniform3fv("uniLightDir", this.lightDir)
                program.uniform1f("uniSpecularExponent", 30)
                program.uniform1f("uniSpecularIntensity", 10)
                options.skybox.activate(0, program, "uniSkybox")
            },
            vertexShaderCode: () => [
                `varNormal = ${this.attNormal};`,
                `varPosition = uniTransfoMatrix * ${this.attPosition};`,
            ],
            vertexShaderCodeForGetPosition: [
                "pos.z *= uniTransition;",
                "return pos;",
            ],
            extraFragmentShaderFunctions: () => ({
                getColor2D: [
                    `vec4 getColor2D() {`,
                    ["return uniColor2D;"],
                    "}",
                ],
                getSkyboxColor: [
                    `vec4 getSkyboxColor(vec3 normal) {`,
                    [
                        `vec3 normal2 = mat3(1, 0, 0, 0, 0, -1, 0, 1, 0) * mat3(uniTransfoMatrix) * normal;`,
                        `vec4 skybox = texture(uniSkybox, reflect(varPosition.xyz, normal2));`,
                        `skybox *= skybox;`,
                        `return skybox;`,
                    ],
                    "}",
                ],
                getColor3D: [
                    `vec4 getColor3D() {`,
                    [
                        `vec3 normal = normalize(varNormal);`,
                        `vec4 skybox = getSkyboxColor(normal);`,
                        `float light = 1.0 - dot(normal, uniLightDir);`,
                        "light *= .5;",
                        `vec4 color = uniColor3D * skybox;`,
                        `vec3 reflection = reflect(uniLightDir, normal);`,
                        `float spec = max(0.0, reflection.z);`,
                        `spec = pow(spec, uniSpecularExponent) * uniSpecularIntensity;`,
                        `color = vec4(`,
                        `  color.rgb * (`,
                        `    .5 * skybox.rgb + vec3(.7, .8, .9) * light`,
                        `  ) + skybox.rgb * spec,`,
                        `  1.0`,
                        `);`,
                        `return color;`,
                    ],
                    "}",
                ],
            }),
            fragmentShaderCode: [
                "return mix(getColor2D(), getColor3D(), uniTransition);",
            ],
        })
        this.color2D.from(options.color2D)
        this.color3D.from(options.color3D)
    }
}
