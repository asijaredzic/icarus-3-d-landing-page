"use client"

import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Billboard } from "@react-three/drei"
import * as THREE from "three"
import { glslNoise } from "./glsl"

const surfaceVertex = /* glsl */ `
varying vec3 vPos;
varying vec3 vNormal;
void main(){
  vPos = position;
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

// Smooth photosphere with a soft terminator that follows the pointer. The
// night side melts into a deep ember glow (not pure black) so the star always
// reads as a beautiful, living thing rather than a cut-out disc.
const surfaceFragment = /* glsl */ `
uniform float uTime;
uniform vec2 uMouse;
varying vec3 vPos;
varying vec3 vNormal;
${glslNoise}
void main(){
  vec3 p = normalize(vPos);
  float t = uTime * 0.05;
  vec3 flow = vec3(0.0, t, 0.0);

  // layered convection — smooth swells with a hint of fine granulation
  float n1 = fbm(p * 1.9 + flow);
  float n2 = fbm(p * 4.2 + n1 * 0.6 - flow * 0.7);
  float gran = fbm(p * 8.5 + n2 * 0.5 + flow * 1.3);
  float heat = clamp(0.5 + 0.27 * n1 + 0.16 * n2 + 0.09 * gran, 0.0, 1.0);

  // richer, prettier plasma gradient
  vec3 deep   = vec3(0.52, 0.09, 0.01);
  vec3 orange = vec3(1.0, 0.38, 0.05);
  vec3 amber  = vec3(1.0, 0.66, 0.20);
  vec3 gold   = vec3(1.0, 0.85, 0.48);
  vec3 white  = vec3(1.0, 0.97, 0.88);

  vec3 col = mix(deep, orange, smoothstep(0.18, 0.48, heat));
  col = mix(col, amber, smoothstep(0.48, 0.74, heat));
  col = mix(col, gold, smoothstep(0.74, 0.92, heat));
  col = mix(col, white, smoothstep(0.93, 1.03, heat));

  // slow drifting shimmer so it feels alive up close
  float shimmer = fbm(p * 3.1 + vec3(t * 2.0, -t, t));
  col += gold * smoothstep(0.6, 1.0, shimmer) * 0.13;

  // terminator — light direction gently follows the pointer
  vec3 L = normalize(vec3(0.42 + uMouse.x * 0.5, 0.26 + uMouse.y * 0.5, 0.74));
  float ndl = dot(normalize(vNormal), L);
  float lit = smoothstep(-0.35, 0.62, ndl); // soft, wide terminator

  // molten ember rim exactly at the day/night boundary
  float rim = smoothstep(-0.32, 0.0, ndl) * (1.0 - smoothstep(0.0, 0.5, ndl));

  // deep ember night side instead of pure black — keeps the disc pretty
  vec3 night = vec3(0.14, 0.02, 0.005);
  col = mix(night, col, lit);
  col += vec3(1.0, 0.34, 0.05) * rim * 1.15;

  // limb glow — a little on the dark side too so the whole rim catches fire
  float fres = pow(1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0), 2.2);
  col += fres * vec3(1.0, 0.5, 0.14) * (0.55 + 0.55 * lit);

  col *= 1.16;
  gl_FragColor = vec4(col, 1.0);
}
`

const flareVertex = /* glsl */ `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

// Soft, warm corona — organic rays that breathe, kept restrained.
const flareFragment = /* glsl */ `
uniform float uTime;
varying vec2 vUv;
${glslNoise}
void main(){
  vec2 pc = vUv - 0.5;
  float r = length(pc) * 2.0;
  if (r > 1.0) discard;
  float ang = atan(pc.y, pc.x);

  float wobble = fbm(vec3(ang * 2.4, uTime * 0.16, 0.0)) * 2.6;
  float rays = 0.5 + 0.5 * sin(ang * 13.0 + wobble);
  rays = pow(rays, 6.0);
  float rayFall = smoothstep(1.0, 0.16, r);
  float halo = pow(smoothstep(1.0, 0.0, r), 2.3);
  float intensity = halo * 0.6 + rays * rayFall * 0.28;

  vec3 core = vec3(1.0, 0.78, 0.42);
  vec3 outer = vec3(0.95, 0.26, 0.03);
  vec3 col = mix(outer, core, smoothstep(0.8, 0.0, r));
  gl_FragColor = vec4(col * intensity, intensity);
}
`

const hazeFragment = /* glsl */ `
uniform float uTime;
varying vec2 vUv;
${glslNoise}
void main(){
  vec2 pc = vUv - 0.5;
  float r = length(pc) * 2.0;
  if (r > 1.0) discard;
  float halo = pow(smoothstep(1.0, 0.0, r), 2.5);
  float n = 0.85 + 0.15 * fbm(vec3(pc * 3.0, uTime * 0.03));
  vec3 col = mix(vec3(0.30, 0.05, 0.01), vec3(1.0, 0.48, 0.15), halo);
  gl_FragColor = vec4(col, halo * n * 0.26);
}
`

export function Sun() {
  const surfaceUniforms = useMemo(
    () => ({ uTime: { value: 0 }, uMouse: { value: new THREE.Vector2(0, 0) } }),
    [],
  )
  const flareUniforms = useMemo(() => ({ uTime: { value: 0 } }), [])
  const hazeUniforms = useMemo(() => ({ uTime: { value: 0 } }), [])
  const surfRef = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    const d = Math.min(delta, 1 / 30)
    surfaceUniforms.uTime.value += delta
    flareUniforms.uTime.value += delta
    hazeUniforms.uTime.value += delta
    // pointer-reactive light direction, gently damped
    const m = surfaceUniforms.uMouse.value
    m.x = THREE.MathUtils.damp(m.x, state.pointer.x, 2.4, d)
    m.y = THREE.MathUtils.damp(m.y, state.pointer.y, 2.4, d)
    if (surfRef.current) surfRef.current.rotation.y += delta * 0.03
  })

  return (
    <group>
      <Billboard position={[0, 0, -0.6]}>
        <mesh scale={13}>
          <planeGeometry args={[1, 1]} />
          <shaderMaterial
            uniforms={hazeUniforms}
            vertexShader={flareVertex}
            fragmentShader={hazeFragment}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </Billboard>

      <Billboard position={[0, 0, -0.3]}>
        <mesh scale={6.6}>
          <planeGeometry args={[1, 1]} />
          <shaderMaterial
            uniforms={flareUniforms}
            vertexShader={flareVertex}
            fragmentShader={flareFragment}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </Billboard>

      <mesh ref={surfRef}>
        <sphereGeometry args={[1.35, 128, 128]} />
        <shaderMaterial uniforms={surfaceUniforms} vertexShader={surfaceVertex} fragmentShader={surfaceFragment} />
      </mesh>

      <pointLight color={"#ff7a1a"} intensity={45} distance={44} decay={2} />
    </group>
  )
}
