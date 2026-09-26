"use client"

import type { MutableRefObject } from "react"
import { useThree, useFrame } from "@react-three/fiber"
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from "@react-three/postprocessing"
import { BlendFunction } from "postprocessing"
import { useRef } from "react"
import * as THREE from "three"
import { Sun } from "./sun"
import { Starfield } from "./starfield"

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
  const { camera } = useThree()

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
      sunGroup.current.scale.setScalar(THREE.MathUtils.lerp(2.0, 1.5, e) * breath)
      sunGroup.current.position.set(
        THREE.MathUtils.lerp(0, 3.0, e),
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

      <EffectComposer>
        <Bloom intensity={0.78} luminanceThreshold={0.4} luminanceSmoothing={0.9} mipmapBlur radius={0.7} />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={new THREE.Vector2(0.0003, 0.0004)}
          radialModulation={false}
          modulationOffset={0}
        />
        <Vignette eskil={false} offset={0.22} darkness={0.92} />
      </EffectComposer>
    </>
  )
}
