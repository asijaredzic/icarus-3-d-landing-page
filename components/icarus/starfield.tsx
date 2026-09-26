"use client"

import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Stars } from "@react-three/drei"
import * as THREE from "three"
import { glslNoise } from "./glsl"

const nebulaVertex = /* glsl */ `
varying vec3 vDir;
void main(){
  vDir = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

// Navy nebula with a warm ember bloom drifting toward the sun's corner.
const nebulaFragment = /* glsl */ `
uniform float uTime;
varying vec3 vDir;
${glslNoise}
void main(){
  vec3 d = normalize(vDir);
  float clouds = fbm(d * 2.1 + vec3(0.0, uTime * 0.01, 0.0));
  clouds = smoothstep(-0.2, 0.9, clouds);

  vec3 base  = vec3(0.020, 0.028, 0.060);   // deep navy
  vec3 cool  = vec3(0.055, 0.090, 0.210);   // steel blue
  vec3 ember = vec3(0.34, 0.12, 0.02);      // warm bloom

  float warm = smoothstep(0.30, 1.0, clouds) * (0.5 - 0.5 * d.x);
  vec3 col = base + cool * clouds * 0.7 + ember * warm * 0.6;

  gl_FragColor = vec4(col, 1.0);
}
`

export function Starfield() {
  const farRef = useRef<THREE.Group>(null)
  const nearRef = useRef<THREE.Group>(null)
  const nebUniforms = useMemo(() => ({ uTime: { value: 0 } }), [])

  useFrame((state, delta) => {
    nebUniforms.uTime.value += delta
    const t = state.clock.elapsedTime
    const px = state.pointer.x
    const py = state.pointer.y
    if (farRef.current) {
      farRef.current.rotation.y = t * 0.006 + px * 0.05
      farRef.current.rotation.x = py * 0.03
    }
    if (nearRef.current) {
      nearRef.current.rotation.y = t * 0.012 + px * 0.1
      nearRef.current.rotation.x = py * 0.06
    }
  })

  return (
    <group>
      <mesh scale={80}>
        <sphereGeometry args={[1, 32, 32]} />
        <shaderMaterial
          uniforms={nebUniforms}
          vertexShader={nebulaVertex}
          fragmentShader={nebulaFragment}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
      <group ref={farRef}>
        <Stars radius={60} depth={40} count={2600} factor={3.4} saturation={0} fade speed={0.4} />
      </group>
      <group ref={nearRef}>
        <Stars radius={30} depth={20} count={900} factor={5} saturation={0} fade speed={0.6} />
      </group>
    </group>
  )
}
