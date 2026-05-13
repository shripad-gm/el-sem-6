import { Suspense, useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  PerspectiveCamera,
  Environment,
  ContactShadows,
  Stars,
} from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';
import { Machine } from './Machine';
import { Floor } from './Floor';
import { WorkflowLines } from './WorkflowLines';
import { useConnectionPointerBridge } from '../../hooks/useConnectionPointerBridge';
import { FLOOR_HALF_EXTENT } from '../../constants/factoryFloor';

function FactoryPointerBridge() {
  useConnectionPointerBridge();
  return null;
}

function SmartOrbitControls(props) {
  const ref = useRef();
  const cameraFocus = useStore((s) => s.cameraFocus);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    const c = ref.current;
    if (!c || !cameraFocus) return;
    tmp.set(cameraFocus[0], 0.55, cameraFocus[2]);
    c.target.lerp(tmp, 1 - Math.exp(-2.8 * delta));
    c.update();
  });

  return <OrbitControls ref={ref} {...props} />;
}

function FactoryMinimap() {
  const machines = useStore((s) => s.machines);
  const connections = useStore((s) => s.connections);
  const selectedMachineId = useStore((s) => s.selectedMachineId);
  const scale = 4.2 / FLOOR_HALF_EXTENT;

  return (
    <div className="absolute bottom-6 left-6 z-30 pointer-events-none select-none">
      <div className="w-40 h-40 rounded-xl border border-white/15 bg-black/50 backdrop-blur-md overflow-hidden relative shadow-[0_0_24px_rgba(0,242,255,0.08)]">
        <div className="absolute top-2 left-2 text-[8px] font-bold uppercase tracking-widest text-white/35">
          Floor Map
        </div>
        <svg viewBox="-1 -1 2 2" className="w-full h-full opacity-90">
          <defs>
            <pattern id="miniGrid" width="0.15" height="0.15" patternUnits="userSpaceOnUse">
              <path d="M 0.15 0 L 0 0 0 0.15" fill="none" stroke="rgba(0,242,255,0.12)" strokeWidth="0.01" />
            </pattern>
          </defs>
          <rect x="-1" y="-1" width="2" height="2" fill="url(#miniGrid)" />
          {connections.map((c) => {
            const a = machines.find((m) => m.id === c.source);
            const b = machines.find((m) => m.id === c.target);
            if (!a || !b) return null;
            return (
              <line
                key={c.id}
                x1={a.position[0] * scale}
                y1={-a.position[2] * scale}
                x2={b.position[0] * scale}
                y2={-b.position[2] * scale}
                stroke="rgba(0,242,255,0.35)"
                strokeWidth="0.03"
              />
            );
          })}
          {machines.map((m) => (
            <circle
              key={m.id}
              cx={m.position[0] * scale}
              cy={-m.position[2] * scale}
              r={selectedMachineId === m.id ? 0.07 : 0.05}
              fill={selectedMachineId === m.id ? '#00f2ff' : 'rgba(255,255,255,0.5)'}
              stroke="rgba(0,0,0,0.4)"
              strokeWidth="0.015"
            />
          ))}
        </svg>
      </div>
    </div>
  );
}

export const FactoryCanvas = () => {
  const machines = useStore((state) => state.machines);
  const selectedMachineId = useStore((state) => state.selectedMachineId);
  const orbitBlocked = useStore((state) => state.orbitBlocked);
  const connectionDraft = useStore((state) => state.connectionDraft);
  const cancelConnectionDraft = useStore((state) => state.cancelConnectionDraft);
  const clearCanvasSelection = useStore((state) => state.clearCanvasSelection);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (connectionDraft) cancelConnectionDraft();
        else clearCanvasSelection();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [connectionDraft, cancelConnectionDraft, clearCanvasSelection]);

  return (
    <div className="w-full h-full bg-industrial-bg relative">
      <div className="absolute inset-0 factory-grid pointer-events-none opacity-20" />

      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: false }}>
        <color attach="background" args={['#050508']} />
        <fog attach="fog" args={['#0a0a10', 18, 52]} />

        <PerspectiveCamera makeDefault position={[14, 13, 14]} fov={38} />
        <SmartOrbitControls
          makeDefault
          maxPolarAngle={Math.PI / 2.08}
          minDistance={6}
          maxDistance={48}
          enableDamping
          dampingFactor={0.06}
          enabled={!orbitBlocked}
        />

        <Suspense fallback={null}>
          <Environment preset="city" />
          <Stars radius={80} depth={40} count={900} factor={3} saturation={0} fade speed={0.4} />

          <ambientLight intensity={0.18} />
          <spotLight
            position={[12, 16, 8]}
            angle={0.22}
            penumbra={0.9}
            intensity={2.2}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <spotLight position={[-12, 10, -6]} angle={0.35} penumbra={1} intensity={0.8} color="#6b21a8" />
          <pointLight position={[-8, 4, -10]} intensity={0.6} color="#00f2ff" />

          <FactoryPointerBridge />

          <group>
            {machines.map((m) => (
              <Machine key={m.id} {...m} isSelected={selectedMachineId === m.id} />
            ))}
          </group>

          <WorkflowLines />
          <Floor />

          <ContactShadows
            position={[0, -0.49, 0]}
            opacity={0.45}
            scale={42}
            blur={2.2}
            far={1.2}
            resolution={512}
            color="#000000"
          />
        </Suspense>
      </Canvas>

      <FactoryMinimap />

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-wrap justify-center gap-2 pointer-events-none max-w-[90vw]">
        {[
          { key: 'LMB', action: 'Orbit' },
          { key: 'Drag body', action: 'Move machine' },
          { key: 'Cyan port', action: 'Draw workflow' },
          { key: 'Esc', action: 'Clear / cancel wire' },
        ].map((tip, i) => (
          <div
            key={i}
            className="flex items-center gap-2 bg-black/45 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full"
          >
            <span className="text-[10px] font-bold text-brand-primary font-mono">{tip.key}</span>
            <span className="text-[10px] text-white/45 uppercase tracking-widest">{tip.action}</span>
          </div>
        ))}
      </div>

      {machines.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="w-32 h-32 rounded-full border border-brand-primary/20 flex items-center justify-center animate-pulse">
            <div className="w-24 h-24 rounded-full border border-brand-primary/40 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border border-brand-primary/60" />
            </div>
          </div>
          <h3 className="text-white/20 text-sm font-bold uppercase tracking-[0.3em] mt-8">Empty Factory Floor</h3>
          <p className="text-white/10 text-[10px] mt-2 uppercase tracking-widest text-center px-8">
            Spawn assets from the sidebar, drag them on the floor, wire outputs → inputs
          </p>
        </div>
      )}
    </div>
  );
};
