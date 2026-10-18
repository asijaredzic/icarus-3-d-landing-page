"use client"

// Procedural stand-in for the Helios Mk-III CO2 racer while the scanned GLB of
// the real car is produced (see /app/car/page.tsx asset note). Built from
// primitives so it needs no network assets and weighs nothing.
import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import type { Group, Mesh } from "three"

function Wheel({ x, z }: { x: number; z: number }) {
  const tyre = useRef<Mesh>(null)
  useFrame((_, dt) => {
    if (tyre.current) tyre.current.rotation.x += dt * 0.6
  })
  return (
    <group position={[x, 0.09, z]} rotation={[0, 0, Math.PI / 2]}>
      <mesh ref={tyre} castShadow>
        <cylinderGeometry args={[0.09, 0.09, 0.055, 24]} />
        <meshStandardMaterial color="#12141c" roughness={0.9} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.052, 0.052, 0.058, 16]} />
        <meshStandardMaterial color="#b9c2d8" metalness={0.85} roughness={0.28} />
      </mesh>
    </group>
  )
}

export function CarModel(props: { rotation?: [number, number, number] }) {
  const group = useRef<Group>(null)
  const bodyMat = useMemo(
    () => ({ color: "#d8dde8", metalness: 0.35, roughness: 0.35 }),
    [],
  )
  const accentMat = useMemo(() => ({ color: "#ff9d3c", roughness: 0.4 }), [])

  useFrame((state) => {
    if (group.current) {
      group.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.012
    }
  })

  return (
    <group ref={group} {...props}>
      {/* main hull — tapered nose */}
      <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.34, 0.14, 1.15]} />
        <meshStandardMaterial {...bodyMat} />
      </mesh>
      <mesh position={[0, 0.16, 0.68]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <coneGeometry args={[0.17, 0.34, 4]} />
        <meshStandardMaterial {...bodyMat} />
      </mesh>
      {/* cockpit canopy */}
      <mesh position={[0, 0.27, -0.05]} castShadow>
        <sphereGeometry args={[0.12, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#1a2440" metalness={0.6} roughness={0.15} />
      </mesh>
      {/* ember stripe */}
      <mesh position={[0, 0.235, 0]}>
        <boxGeometry args={[0.07, 0.005, 1.1]} />
        <meshStandardMaterial {...accentMat} />
      </mesh>
      {/* side pods */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.22, 0.13, -0.1]} castShadow>
          <boxGeometry args={[0.07, 0.1, 0.6]} />
          <meshStandardMaterial {...bodyMat} />
        </mesh>
      ))}
      {/* CO2 canister cartridge */}
      <mesh position={[0, 0.2, -0.45]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.22, 16]} />
        <meshStandardMaterial color="#b9c2d8" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* rear wing */}
      <mesh position={[0, 0.34, -0.62]} castShadow>
        <boxGeometry args={[0.46, 0.02, 0.12]} />
        <meshStandardMaterial {...accentMat} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.18, 0.26, -0.62]}>
          <boxGeometry args={[0.02, 0.16, 0.06]} />
          <meshStandardMaterial {...bodyMat} />
        </mesh>
      ))}
      {/* front wing */}
      <mesh position={[0, 0.06, 0.82]} castShadow>
        <boxGeometry args={[0.5, 0.015, 0.14]} />
        <meshStandardMaterial {...bodyMat} />
      </mesh>
      {/* wheels */}
      <Wheel x={-0.21} z={0.33} />
      <Wheel x={0.21} z={0.33} />
      <Wheel x={-0.23} z={-0.4} />
      <Wheel x={0.23} z={-0.4} />
    </group>
  )
}
