"use client"

import type { MutableRefObject } from "react"
import { useThree, useFrame } from "@react-three/fiber"
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from "@react-three/postprocessing"
import { BlendFunction } from "postprocessing"
import { useRef } from "react"
import * as THREE from "three"
import { Sun } from "./sun"
import { Starfield } from "./starfield"

// module-level so the effect isn't rebuilt on every render
const CA_OFFSET = new THREE.Vector2(0.0003, 0.0004)

const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)

// Scroll-driven Icarus intro. progress 0 = pressed against the sun's surface
// (the ENTER gate), progress 1 = camera pulled back and the sun swung to the
// right as the landing hero. A gentle pointer parallax rides on top.
export function Scene({
  progressRef,
  entered,
}: {
  progressRef: MutableRefObject<number>
  entered: boolean
}) {
  const sunGroup = useRef<THREE.Group>(null)
  const { camera, size } = useThree()
  // Mobile keeps its tuned framing. From tablet up the sun is sized off the
  // visible frustum at the settled camera distance, so it fills the right side
  // and bleeds off the edge instead of shrinking into a small ball.
  let settledX = 3.0
  let settledScale = 1.5
  if (size.width >= 768) {
    const SETTLED_Z = 8.6
    const LOOK_X = 0.85
    const SUN_RADIUS = 1.35
    const halfH = SETTLED_Z * Math.tan(THREE.MathUtils.degToRad(45 / 2))
    const halfW = halfH * (size.width / size.height)
    const r = Math.min(halfH * 0.64, halfW * 0.28)
    settledScale = r / SUN_RADIUS
    settledX = LOOK_X + halfW - r * 1.25 - halfW * 0.1
  }

  useFrame((state, delta) => {
    const d = Math.min(delta, 1 / 30)
    const t = state.clock.elapsedTime
    const e = easeInOut(THREE.MathUtils.clamp(progressRef.current, 0, 1))

    // parallax is subtle at the surface, opens up as you pull away
    const par = entered ? 0.25 + 0.75 * e : 0.12
    const targetZ = THREE.MathUtils.lerp(3.4, 8.6, e)
    const targetX = state.pointer.x * 0.5 * par
    const targetY = THREE.MathUtils.lerp(0.15, 0.4, e) + state.pointer.y * 0.4 * par

    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 3, d)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, 3, d)
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 3.2, d)
    camera.lookAt(THREE.MathUtils.lerp(0, 0.85, e), THREE.MathUtils.lerp(0, 0.12, e), 0)

    if (sunGroup.current) {
      const breath = 1 + Math.sin(t * 0.5) * 0.012
      sunGroup.current.scale.setScalar(THREE.MathUtils.lerp(2.0, settledScale, e) * breath)
      sunGroup.current.position.set(
        THREE.MathUtils.lerp(0, settledX, e),
        THREE.MathUtils.lerp(0, 0.4, e),
        0,
      )
    }
  })

  return (
    <>
      <Starfield />
      <ambientLight intensity={0.2} />

      <group ref={sunGroup} position={[0, 0, 0]} scale={2}>
        <Sun />
      </group>

      <EffectComposer multisampling={0}>
        <Bloom intensity={0.78} luminanceThreshold={0.4} luminanceSmoothing={0.9} mipmapBlur radius={0.7} />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={CA_OFFSET}
          radialModulation={false}
          modulationOffset={0}
        />
        <Vignette eskil={false} offset={0.22} darkness={0.92} />
      </EffectComposer>
    </>
  )
}
