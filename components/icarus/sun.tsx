"use client"

import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Billboard } from "@react-three/drei"
import * as THREE from "three"
import { glslNoise } from "./glsl"

const FLARE_EVERY = 6.5

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
uniform float uPulse;
void main(){
  vec3 p = normalize(vPos);
  float t = uTime * 0.05;
  vec3 flow = vec3(0.0, t, 0.0);

  // domain-warped convection so the plasma visibly boils and churns
  vec3 warp = vec3(fbm(p * 2.2 + flow), fbm(p * 2.2 - flow + 3.1), fbm(p * 2.2 + 7.7));
  float n1 = fbm(p * 1.9 + warp * 0.9 + flow);
  float n2 = fbm(p * 4.6 + n1 * 0.8 - flow * 0.9);
  float gran = fbm(p * 11.0 + n2 * 0.6 + flow * 2.2);
  float heat = clamp(0.48 + 0.3 * n1 + 0.17 * n2 + 0.12 * gran, 0.0, 1.0);

  // logo palette: crimson → red → burnt orange, with only hot seams turning amber
  vec3 crimson = vec3(0.32, 0.035, 0.012);
  vec3 red     = vec3(0.78, 0.14, 0.03);
  vec3 orange  = vec3(0.95, 0.34, 0.06);
  vec3 amber   = vec3(1.0, 0.56, 0.17);
  vec3 hot     = vec3(1.0, 0.76, 0.46);

  vec3 col = mix(crimson, red, smoothstep(0.15, 0.42, heat));
  col = mix(col, orange, smoothstep(0.42, 0.66, heat));
  col = mix(col, amber, smoothstep(0.7, 0.88, heat));
  col = mix(col, hot, smoothstep(0.9, 1.04, heat) * 0.7);

  // drifting sunspot clusters
  float spots = fbm(p * 3.4 + vec3(0.0, t * 0.6, 4.0));
  col *= 1.0 - smoothstep(0.62, 0.74, spots) * 0.62;

  // bright filament seams flaring along the convection edges
  float seam = 1.0 - abs(n2 * 2.0 - 1.0);
  col += amber * pow(seam, 9.0) * 0.32;

  // global flare pulse lights the whole surface briefly
  col += orange * uPulse * 0.22;

  // terminator — light direction gently follows the pointer
  vec3 L = normalize(vec3(0.42 + uMouse.x * 0.5, 0.26 + uMouse.y * 0.5, 0.74));
  float ndl = dot(normalize(vNormal), L);
  float lit = smoothstep(-0.12, 0.7, ndl);
  lit = lit * lit * (3.0 - 2.0 * lit);

  // molten ember rim exactly at the day/night boundary
  float rim = smoothstep(-0.22, 0.0, ndl) * (1.0 - smoothstep(0.0, 0.32, ndl));

  // a deep shadowed night side with only a faint ember undertone
  vec3 night = vec3(0.035, 0.006, 0.004);
  col = mix(night, col, lit);
  col += vec3(0.95, 0.24, 0.04) * rim * 0.8;

  // limb glow mostly on the lit side so the shadow stays dark
  float fres = pow(1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0), 2.4);
  col += fres * vec3(0.95, 0.32, 0.07) * (0.12 + 0.7 * lit);

  col *= 1.06;
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

// Living corona: slowly turning streamers, looping prominences that lick off
// the limb, and a shockwave ring that rolls out with each flare pulse.
// The disc edge sits at r ≈ 0.41 on this plane (1.35 / 3.3).
const flareFragment = /* glsl */ `
uniform float uTime;
uniform float uPulse;
uniform float uAge;
varying vec2 vUv;
${glslNoise}
void main(){
  vec2 pc = vUv - 0.5;
  float r = length(pc) * 2.0;
  if (r > 1.0) discard;
  float ang = atan(pc.y, pc.x);
  float edge = 0.41;

  // two counter-rotating streamer layers
  float a1 = ang + uTime * 0.025;
  float a2 = ang - uTime * 0.018;
  float w1 = fbm(vec3(a1 * 2.4, uTime * 0.16, 0.0)) * 2.8;
  float w2 = fbm(vec3(a2 * 3.6, uTime * 0.11, 5.0)) * 2.2;
  float rays = pow(0.5 + 0.5 * sin(a1 * 11.0 + w1), 7.0) + 0.6 * pow(0.5 + 0.5 * sin(a2 * 17.0 + w2), 9.0);
  float rayFall = smoothstep(0.66, edge, r) * smoothstep(edge - 0.04, edge + 0.02, r);
  float halo = pow(smoothstep(0.85, 0.0, r), 2.8);

  // prominences: flickering plasma tongues hugging the limb
  float tongue = fbm(vec3(ang * 5.0, uTime * 0.22, r * 6.0));
  float reach = edge + 0.03 + 0.14 * smoothstep(0.55, 0.85, tongue);
  float prom = smoothstep(reach, edge + 0.01, r) * smoothstep(edge - 0.01, edge + 0.015, r);
  prom *= smoothstep(0.45, 0.8, tongue);

  // flare shockwave
  float ringR = edge + uAge * 0.34;
  float ring = exp(-pow((r - ringR) * 38.0, 2.0)) * exp(-uAge * 1.5);

  float intensity = halo * (0.5 + uPulse * 0.25) + rays * rayFall * (0.3 + uPulse * 0.3) + prom * 0.85 + ring * 0.5;

  vec3 core = vec3(1.0, 0.6, 0.26);
  vec3 outer = vec3(0.86, 0.16, 0.03);
  vec3 col = mix(outer, core, smoothstep(0.75, edge, r));
  col = mix(col, vec3(1.0, 0.42, 0.1), prom);
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
  vec3 col = mix(vec3(0.26, 0.03, 0.01), vec3(0.92, 0.3, 0.08), halo);
  gl_FragColor = vec4(col, halo * n * 0.26);
}
`

export function Sun() {
  const surfaceUniforms = useMemo(
    () => ({ uTime: { value: 0 }, uPulse: { value: 0 }, uMouse: { value: new THREE.Vector2(0, 0) } }),
    [],
  )
  const flareUniforms = useMemo(() => ({ uTime: { value: 0 }, uPulse: { value: 0 }, uAge: { value: 99 } }), [])
  const hazeUniforms = useMemo(() => ({ uTime: { value: 0 } }), [])
  const surfRef = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    const d = Math.min(delta, 1 / 30)
    surfaceUniforms.uTime.value += delta
    flareUniforms.uTime.value += delta
    hazeUniforms.uTime.value += delta

    // a solar flare erupts every FLARE_EVERY seconds, then decays
    const age = (flareUniforms.uTime.value + 2.5) % FLARE_EVERY
    const pulse = Math.exp(-age * 1.6) * Math.min(age * 8, 1)
    surfaceUniforms.uPulse.value = pulse
    flareUniforms.uPulse.value = pulse
    flareUniforms.uAge.value = age
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
