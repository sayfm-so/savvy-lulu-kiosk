import { Canvas, useFrame } from '@react-three/fiber'
import { RoundedBox, Environment, Lightformer, ContactShadows, Float } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { FaceState } from './face-state'

// Mr Savvy — hand-modelled to match the user's robot photo: a smooth matte
// charcoal head whose FACE is an OPEN glowing frame (wide rounded-rect brow
// tapering to an open rounded-U jaw, hollow/see-through), with a white eye-bar
// and a small sensor bump up top; a charcoal neck with a perforated speaker
// grille; chrome shoulders with hook lock-pins. Real 3D, lit + animated.

const SHELL = '#1d2127'
const FRAME = '#262b32'
const LED = '#dbeeff'
const WHITE = '#f0f7ff'
const DARK = '#06090c'
const NECK = '#191d22'
const SILVER = '#b3bcc7'
const PIN = '#eef3f8'

// wide rounded-rect brow tapering to a rounded-U jaw
function shieldShape(hw: number, top: number, chin: number): THREE.Shape {
  const s = new THREE.Shape()
  const tc = hw * 0.5
  const sh = top - hw * 0.5
  s.moveTo(-tc, top)
  s.lineTo(tc, top)
  s.quadraticCurveTo(hw, top, hw, sh)
  s.bezierCurveTo(hw, sh - 0.62, hw * 0.82, -chin + 0.5, hw * 0.4, -chin + 0.16)
  s.quadraticCurveTo(0, -chin, -hw * 0.4, -chin + 0.16)
  s.bezierCurveTo(-hw * 0.82, -chin + 0.5, -hw, sh - 0.62, -hw, sh)
  s.quadraticCurveTo(-hw, top, -tc, top)
  return s
}

function setEmissive(o: THREE.Object3D | null, v: number) {
  if (o) (((o as THREE.Mesh).material) as THREE.MeshStandardMaterial).emissiveIntensity = v
}

function Head({ state }: { state: FaceState }) {
  const root = useRef<THREE.Group>(null)
  const led = useRef<THREE.Mesh>(null)
  const bar = useRef<THREE.Mesh>(null)

  const frameGeo = useMemo(() => {
    const outer = shieldShape(0.9, 1.0, 1.12)
    const inner = shieldShape(0.66, 0.8, 0.92)
    outer.holes.push(new THREE.Path(inner.getPoints(140)))
    return new THREE.ExtrudeGeometry(outer, {
      depth: 0.22, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.06,
      bevelSegments: 5, curveSegments: 72,
    })
  }, [])
  const ledGeo = useMemo(() => {
    const pts = shieldShape(0.66, 0.8, 0.92).getPoints(160)
      .map((p) => new THREE.Vector3(p.x, p.y, 0))
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 280, 0.026, 12, true)
  }, [])

  useFrame((st) => {
    const t = st.clock.elapsedTime
    if (root.current) {
      const targetY = state === 'idle' ? Math.sin(t * 0.45) * 0.2 : 0
      root.current.rotation.y += (targetY - root.current.rotation.y) * 0.04
      root.current.rotation.x = Math.sin(t * 0.7) * 0.022
    }
    setEmissive(led.current, 1.8 + Math.sin(t * 1.6) * 0.2)
    const lvl = state === 'listening'
      ? 2.6 + Math.sin(t * 6) * 0.9
      : state === 'talking'
        ? 2.9 + Math.abs(Math.sin(t * 15)) * 1.0
        : 2.2 + Math.sin(t * 1.5) * 0.22
    setEmissive(bar.current, lvl)
    if (bar.current) bar.current.scale.y = state === 'talking' ? 0.7 + Math.abs(Math.sin(t * 15)) * 0.5 : 1
  })

  return (
    <group ref={root} position={[0, -0.05, 0]}>
      {/* smooth charcoal head shell (dome forms forehead/top/back; lower face stays open) */}
      <mesh position={[0, 0.78, -0.18]} scale={[0.98, 1.0, 0.92]}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial color={SHELL} roughness={0.5} metalness={0.4} envMapIntensity={0.9} />
      </mesh>

      {/* face assembly */}
      <group position={[0, 0.55, 0]}>
        {/* dark backing behind ONLY the upper face (eye bar + sensor) */}
        <mesh position={[0, 0.42, 0.16]} scale={[0.6, 0.34, 0.12]}>
          <sphereGeometry args={[1, 40, 40]} />
          <meshStandardMaterial color={DARK} roughness={0.4} metalness={0.4} />
        </mesh>

        {/* dark face frame (the open shield border) */}
        <mesh geometry={frameGeo} position={[0, 0, 0.16]}>
          <meshStandardMaterial color={FRAME} roughness={0.5} metalness={0.35} envMapIntensity={0.9} />
        </mesh>
        {/* glowing white-blue LED on the inner edge */}
        <mesh ref={led} geometry={ledGeo} position={[0, 0, 0.42]}>
          <meshStandardMaterial color={LED} emissive={LED} emissiveIntensity={1.8} toneMapped={false} />
        </mesh>

        {/* white eye-bar (upper) */}
        <mesh ref={bar} position={[0, 0.42, 0.44]} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.05, 0.5, 8, 24]} />
          <meshStandardMaterial color={WHITE} emissive={WHITE} emissiveIntensity={2.2} toneMapped={false} />
        </mesh>
        {/* sensor bump below the bar */}
        <mesh position={[0, 0.16, 0.4]}>
          <sphereGeometry args={[0.1, 24, 24]} />
          <meshStandardMaterial color={DARK} roughness={0.2} metalness={0.6} />
        </mesh>
      </group>

      {/* charcoal neck */}
      <mesh position={[0, -0.95, -0.02]}>
        <cylinderGeometry args={[0.42, 0.56, 0.85, 48]} />
        <meshStandardMaterial color={NECK} roughness={0.45} metalness={0.5} envMapIntensity={0.8} />
      </mesh>
      {/* speaker grille (arc of holes on the front of the neck) */}
      {Array.from({ length: 9 }).map((_, i) => {
        const a = (i - 4) * 0.17
        return (
          <mesh key={i} position={[Math.sin(a) * 0.46, -0.95, Math.cos(a) * 0.46]}>
            <sphereGeometry args={[0.022, 10, 10]} />
            <meshStandardMaterial color="#04070a" roughness={0.3} metalness={0.5} />
          </mesh>
        )
      })}

      {/* chrome shoulders */}
      <RoundedBox args={[3.0, 0.85, 1.3]} radius={0.36} smoothness={6} position={[0, -1.95, 0]}>
        <meshStandardMaterial color={SILVER} metalness={0.92} roughness={0.3} envMapIntensity={1.5} />
      </RoundedBox>
      {/* hook lock-pins (small upright silver loops) */}
      {[-1.0, 1.0].map((x) => (
        <mesh key={x} position={[x, -1.48, 0.34]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.1, 0.028, 12, 32, Math.PI]} />
          <meshStandardMaterial color={PIN} metalness={0.95} roughness={0.18} envMapIntensity={1.6} />
        </mesh>
      ))}
    </group>
  )
}

export default function RobotHead3D({ state }: { state: FaceState }) {
  return (
    <Canvas
      className="face-canvas"
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true }}
      camera={{ position: [0, 0.2, 5.2], fov: 33 }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 4]} intensity={1.3} />
      <directionalLight position={[-3, 1.5, -4]} intensity={0.95} color="#bcd6ff" />
      <pointLight position={[0, 0.6, 5]} intensity={0.55} color="#acd4ff" />

      <Float speed={1.4} rotationIntensity={0.35} floatIntensity={0.6}>
        <Head state={state} />
      </Float>

      <ContactShadows position={[0, -2.45, 0]} opacity={0.55} scale={8} blur={2.8} far={4} color="#03060d" />

      <Environment resolution={128}>
        <Lightformer intensity={1.7} position={[0, 3, 4]} scale={[7, 7, 1]} color="#dce9ff" />
        <Lightformer intensity={1.0} position={[-4, 1, 3]} scale={[3, 3, 1]} color="#ffffff" />
        <Lightformer intensity={0.8} position={[4, -1, 2]} scale={[3, 3, 1]} color="#9fc4ff" />
      </Environment>

      <EffectComposer>
        <Bloom luminanceThreshold={0.68} luminanceSmoothing={0.25} intensity={0.95} mipmapBlur />
      </EffectComposer>
    </Canvas>
  )
}
