import { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { QuadraticBezierLine } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';

const OUT = [0.15, 0.52, 0.82];
const IN = [-0.15, 0.52, -0.82];

function worldPort(pos, offset) {
  return new THREE.Vector3(pos[0] + offset[0], pos[1] + offset[1], pos[2] + offset[2]);
}

export function ConnectionDraftLine() {
  const connectionDraft = useStore((s) => s.connectionDraft);
  const draftEnd = useStore((s) => s.connectionDraftEnd);
  const machines = useStore((s) => s.machines);
  const lineRef = useRef();

  const geom = useMemo(() => {
    if (!connectionDraft) return null;
    const src = machines.find((m) => m.id === connectionDraft.sourceId);
    if (!src) return null;
    const start = worldPort(src.position, OUT);
    const end = new THREE.Vector3(draftEnd[0], draftEnd[1], draftEnd[2]);
    const mid = start.clone().lerp(end, 0.5).add(new THREE.Vector3(0, 1.1, 0));
    return { start, end, mid };
  }, [connectionDraft, draftEnd, machines]);

  useFrame(() => {
    const mat = lineRef.current?.material;
    if (mat && 'dashOffset' in mat) {
      mat.dashOffset -= 0.04;
    }
  });

  if (!geom) return null;
  const { start, end, mid } = geom;

  return (
    <group>
      <QuadraticBezierLine
        ref={lineRef}
        start={start}
        end={end}
        mid={mid}
        color="#a855f7"
        lineWidth={2.5}
        dashed
        dashScale={24}
        dashSize={0.45}
        dashOffset={0}
        transparent
        opacity={0.85}
      />
      <QuadraticBezierLine start={start} end={end} mid={mid} color="#00f2ff" lineWidth={8} transparent opacity={0.12} />
    </group>
  );
}

export const WorkflowLines = () => {
  const connections = useStore((s) => s.connections);
  const machines = useStore((s) => s.machines);
  const selectedConnectionId = useStore((s) => s.selectedConnectionId);
  const selectConnection = useStore((s) => s.selectConnection);
  const draggingMachineId = useStore((s) => s.draggingMachineId);

  return (
    <group>
      {connections.map((conn) => {
        const source = machines.find((m) => m.id === conn.source);
        const target = machines.find((m) => m.id === conn.target);
        if (!source || !target) return null;
        return (
          <WorkflowConnection
            key={conn.id}
            source={source}
            target={target}
            isSelected={selectedConnectionId === conn.id}
            isDimmed={!!draggingMachineId}
            onSelect={() => selectConnection(conn.id)}
          />
        );
      })}
      <ConnectionDraftLine />
    </group>
  );
};

function WorkflowConnection({ source, target, isSelected, isDimmed, onSelect }) {
  const lineRef = useRef();
  const hitMat = useRef();
  const tubeRef = useRef();
  const phases = useMemo(() => Array.from({ length: 10 }, (_, i) => i / 10), []);

  const { start, end, mid, curve } = useMemo(() => {
    const s = worldPort(source.position, OUT);
    const e = worldPort(target.position, IN);
    const m = s.clone().lerp(e, 0.5).add(new THREE.Vector3(0, 1.25, 0));
    const c = new THREE.CatmullRomCurve3([s, m, e], false, 'catmullrom', 0.35);
    return { start: s, end: e, mid: m, curve: c };
  }, [source.position, target.position]);

  const tubeGeom = useMemo(() => {
    const g = new THREE.TubeGeometry(curve, 40, isSelected ? 0.32 : 0.22, 6, false);
    return g;
  }, [curve, isSelected]);

  useEffect(() => () => tubeGeom.dispose(), [tubeGeom]);

  const overload = source.telemetry?.queue >= 8;
  const broken = target.status === 'ERROR' || source.status === 'ERROR';
  const warn = target.status === 'WARNING' || source.status === 'WARNING';

  const flowSpeed =
    0.35 +
    Math.min(0.85, ((source.telemetry?.throughput ?? 40) / 120) * 0.9) * (source.status === 'RUNNING' ? 1 : 0.15);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const mat = lineRef.current?.material;
    if (mat && 'dashOffset' in mat) {
      mat.dashOffset -= 0.018 * flowSpeed * (overload ? 1.4 : 1);
    }
    if (hitMat.current) {
      const flicker = broken ? 0.35 + Math.sin(t * 14) * 0.35 : 0.92;
      hitMat.current.opacity = (isSelected ? 0.14 : 0.04) * flicker;
    }

    phases.forEach((phase, i) => {
      const u = (phase + t * flowSpeed * 0.12) % 1;
      const p = curve.getPointAt(u);
      const mesh = tubeRef.current?.children?.[i];
      if (mesh) {
        mesh.position.copy(p);
        const s = 0.045 + (overload ? 0.02 : 0) + (isSelected ? 0.015 : 0);
        mesh.scale.setScalar(s);
      }
    });
  });

  const hueMain = broken ? '#ff3355' : overload ? '#ff9500' : warn ? '#ffcc00' : '#00f2ff';
  const hueGlow = broken ? '#ff0000' : overload ? '#ff8800' : '#00f2ff';

  return (
    <group>
      <mesh
        geometry={tubeGeom}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        <meshBasicMaterial ref={hitMat} color={hueMain} transparent opacity={0.04} depthWrite={false} />
      </mesh>

      <QuadraticBezierLine
        ref={lineRef}
        start={start}
        end={end}
        mid={mid}
        color={hueMain}
        lineWidth={isSelected ? 3 : 2}
        dashed
        dashScale={22}
        dashSize={0.42}
        dashOffset={0}
        transparent
        opacity={(isDimmed ? 0.35 : 0.72) * (isSelected ? 1 : 0.85)}
      />
      <QuadraticBezierLine
        start={start}
        end={end}
        mid={mid}
        color={hueGlow}
        lineWidth={isSelected ? 10 : 7}
        transparent
        opacity={(isDimmed ? 0.06 : 0.14) * (isSelected ? 1.2 : 1)}
      />

      <group ref={tubeRef}>
        {Array.from({ length: 10 }).map((_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[1, 6, 6]} />
            <meshStandardMaterial
              color={hueMain}
              emissive={hueMain}
              emissiveIntensity={2.2}
              transparent
              opacity={0.85}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}
