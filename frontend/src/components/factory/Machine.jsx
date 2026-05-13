import { useRef, useState, useCallback, useMemo, useEffect, useLayoutEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';
import { MACHINE_TYPES } from '../../data/machineTypes';
import { snapPositionOnFloor } from '../../constants/factoryFloor';

const _plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const _hit = new THREE.Vector3();
const _ndc = new THREE.Vector2();

const DRAG_THRESHOLD_PX = 5;

export const Machine = ({ id, type, name, position, status, isSelected }) => {
  const rootRef = useRef();
  const wheelRef = useRef();
  const selectMachine = useStore((s) => s.selectMachine);
  const beginMachineDrag = useStore((s) => s.beginMachineDrag);
  const endMachineDrag = useStore((s) => s.endMachineDrag);
  const updateMachinePosition = useStore((s) => s.updateMachinePosition);
  const setHoveredMachine = useStore((s) => s.setHoveredMachine);
  const startConnectionDraft = useStore((s) => s.startConnectionDraft);
  const connectionDraft = useStore((s) => s.connectionDraft);
  const connectionHoverTargetId = useStore((s) => s.connectionHoverTargetId);
  const draggingMachineId = useStore((s) => s.draggingMachineId);
  const machines = useStore((s) => s.machines);

  const [hovered, setHovered] = useState(false);
  const dragPointerId = useRef(null);
  const dragStartScreen = useRef(null);
  const isDraggingLocal = useRef(false);
  const dragHandlers = useRef({ move: () => {}, up: () => {} });
  const idRef = useRef(id);
  const statusLightMat = useRef(null);

  const { camera, gl, raycaster } = useThree();

  const machineInfo = Object.values(MACHINE_TYPES).find((t) => t.id === type);
  const accent = machineInfo?.color ?? '#00f2ff';

  const isDragging = draggingMachineId === id;
  const showPorts = isSelected || connectionDraft?.sourceId === id;
  const isHoverTarget = connectionHoverTargetId === id && connectionDraft && connectionDraft.sourceId !== id;

  const otherDragging = draggingMachineId && draggingMachineId !== id ? draggingMachineId : null;
  const dragOtherPos = useMemo(() => {
    if (!otherDragging) return null;
    const m = machines.find((x) => x.id === otherDragging);
    return m ? m.position : null;
  }, [otherDragging, machines]);

  const proximityPulse = useMemo(() => {
    if (!dragOtherPos || isDragging) return 0;
    const dx = position[0] - dragOtherPos[0];
    const dz = position[2] - dragOtherPos[2];
    const d = Math.sqrt(dx * dx + dz * dz);
    if (d < 2.8) return 1 - d / 2.8;
    return 0;
  }, [dragOtherPos, position, isDragging]);

  const statusColors = {
    RUNNING: '#00ff88',
    IDLE: '#ffd700',
    WARNING: '#ff8c00',
    ERROR: '#ff4444',
    MAINTENANCE: '#00d4ff',
  };
  const statusColor = statusColors[status] || '#ffffff';

  const projectToFloor = useCallback(
    (clientX, clientY) => {
      const rect = gl.domElement.getBoundingClientRect();
      _ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      _ndc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(_ndc, camera);
      if (!raycaster.ray.intersectPlane(_plane, _hit)) return null;
      const [nx, , nz] = snapPositionOnFloor(_hit.x, _hit.z);
      return [nx, 0, nz];
    },
    [camera, gl, raycaster]
  );

  const stableMove = useCallback((e) => dragHandlers.current.move(e), []);
  const stableUp = useCallback((e) => dragHandlers.current.up(e), []);

  const endDragListeners = useCallback(() => {
    window.removeEventListener('pointermove', stableMove);
    window.removeEventListener('pointerup', stableUp);
    window.removeEventListener('pointercancel', stableUp);
    dragPointerId.current = null;
    dragStartScreen.current = null;
    isDraggingLocal.current = false;
    endMachineDrag();
  }, [endMachineDrag, stableMove, stableUp]);

  useLayoutEffect(() => {
    idRef.current = id;
  }, [id]);

  useLayoutEffect(() => {
    dragHandlers.current.move = (e) => {
      if (dragPointerId.current !== e.pointerId) return;
      if (dragStartScreen.current) {
        const dx = e.clientX - dragStartScreen.current[0];
        const dy = e.clientY - dragStartScreen.current[1];
        if (!isDraggingLocal.current && Math.hypot(dx, dy) > DRAG_THRESHOLD_PX) {
          isDraggingLocal.current = true;
          beginMachineDrag(idRef.current);
        }
      }
      if (!isDraggingLocal.current) return;
      const next = projectToFloor(e.clientX, e.clientY);
      if (next) updateMachinePosition(idRef.current, next);
    };
    dragHandlers.current.up = (e) => {
      if (dragPointerId.current !== e.pointerId) return;
      endDragListeners();
    };
  }, [beginMachineDrag, projectToFloor, updateMachinePosition, endDragListeners]);

  const onBodyPointerDown = useCallback(
    (e) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      selectMachine(id);
      dragPointerId.current = e.pointerId;
      dragStartScreen.current = [e.clientX, e.clientY];
      window.addEventListener('pointermove', stableMove);
      window.addEventListener('pointerup', stableUp);
      window.addEventListener('pointercancel', stableUp);
    },
    [id, selectMachine, stableMove, stableUp]
  );

  const onOutputPointerDown = useCallback(
    (e) => {
      e.stopPropagation();
      startConnectionDraft(id);
    },
    [id, startConnectionDraft]
  );

  useEffect(() => () => endDragListeners(), [endDragListeners]);

  useFrame((state, delta) => {
    if (wheelRef.current && status === 'RUNNING' && !isDragging) {
      wheelRef.current.rotation.x += delta * 5;
    }
    if (rootRef.current) {
      const bob = isSelected && !isDragging ? Math.sin(state.clock.elapsedTime * 2) * 0.06 : 0;
      const ty = (isDragging ? 0.28 : 0) + bob;
      rootRef.current.position.y = THREE.MathUtils.lerp(
        rootRef.current.position.y,
        ty,
        1 - Math.exp(-12 * delta)
      );
    }
    const t = state.clock.elapsedTime;
    const base =
      status === 'ERROR' || status === 'WARNING'
        ? 1.5 + Math.sin(t * 10) * 1.2
        : status === 'RUNNING'
          ? 1.2
          : 0.6;
    const extra = isDragging ? 2.2 : isSelected ? 0.8 : hovered ? 0.4 : 0;
    if (statusLightMat.current) {
      statusLightMat.current.emissiveIntensity = base + extra;
    }
  });

  return (
    <group position={[position[0], 0, position[2]]}>
      <group
        ref={rootRef}
        onPointerOver={() => {
          setHovered(true);
          setHoveredMachine(id);
        }}
        onPointerOut={() => {
          setHovered(false);
          setHoveredMachine(null);
        }}
      >
        <mesh position={[0, -0.4, 0]} castShadow receiveShadow onPointerDown={onBodyPointerDown}>
          <boxGeometry args={[1.5, 0.2, 1.2]} />
          <meshStandardMaterial
            color="#222"
            metalness={0.8}
            roughness={0.2}
            emissive={accent}
            emissiveIntensity={proximityPulse * 0.18}
          />
        </mesh>

        <mesh position={[0, 0, 0]} castShadow onPointerDown={onBodyPointerDown}>
          <boxGeometry args={[1, 0.8, 0.8]} />
          <meshStandardMaterial
            color={isSelected ? '#333' : '#1a1a1a'}
            metalness={0.9}
            roughness={0.1}
            emissive={accent}
            emissiveIntensity={isDragging ? 0.28 : isSelected ? 0.12 : 0.02}
          />
        </mesh>

        <mesh position={[0.2, 0.6, 0]} castShadow onPointerDown={onBodyPointerDown}>
          <boxGeometry args={[1.2, 0.4, 0.4]} />
          <meshStandardMaterial color="#111" metalness={1} roughness={0.1} />
        </mesh>

        <mesh ref={wheelRef} position={[0.6, 0.6, 0.25]} rotation={[0, 0, 0]} onPointerDown={onBodyPointerDown}>
          <cylinderGeometry args={[0.25, 0.25, 0.1, 16]} />
          <meshStandardMaterial color="#444" metalness={1} />
        </mesh>

        <mesh position={[-0.4, 0.6, 0.25]} onPointerDown={onBodyPointerDown}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial
            ref={statusLightMat}
            emissive={statusColor}
            emissiveIntensity={1.2}
            color={statusColor}
          />
        </mesh>

        <pointLight position={[-0.4, 0.6, 0.25]} distance={2.8} intensity={isDragging ? 4.5 : 2} color={statusColor} />

        {(isSelected || isDragging) && (
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[1.75, 1.45, 1.45]} />
            <meshBasicMaterial color={accent} transparent opacity={isDragging ? 0.26 : 0.11} wireframe />
          </mesh>
        )}

        {showPorts && (
          <>
            <mesh
              position={[0.15, 0.52, 0.82]}
              userData={{ outputPort: true, machineId: id }}
              onPointerDown={onOutputPointerDown}
              onPointerOver={(e) => {
                e.stopPropagation();
                document.body.style.cursor = 'crosshair';
              }}
              onPointerOut={() => {
                document.body.style.cursor = 'auto';
              }}
            >
              <sphereGeometry args={[0.14, 16, 16]} />
              <meshStandardMaterial
                color="#00f2ff"
                emissive="#00f2ff"
                emissiveIntensity={connectionDraft?.sourceId === id ? 2.2 : 1}
                metalness={0.2}
                roughness={0.2}
              />
            </mesh>
            <mesh
              position={[-0.15, 0.52, -0.82]}
              userData={{ inputPort: true, machineId: id }}
              onPointerOver={(e) => {
                e.stopPropagation();
                document.body.style.cursor = 'cell';
              }}
              onPointerOut={() => {
                document.body.style.cursor = 'auto';
              }}
            >
              <sphereGeometry args={[0.14, 16, 16]} />
              <meshStandardMaterial
                color={isHoverTarget ? '#00ffaa' : '#7000ff'}
                emissive={isHoverTarget ? '#00ffaa' : '#7000ff'}
                emissiveIntensity={isHoverTarget ? 2.4 : 1}
                transparent
                opacity={0.95}
              />
            </mesh>
          </>
        )}

        {hovered && !isDragging && (
          <Html distanceFactor={10} position={[0, 1.5, 0]} style={{ pointerEvents: 'none' }}>
            <div className="bg-black/80 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-lg whitespace-nowrap">
              <p className="text-[10px] font-bold text-white uppercase tracking-widest">{name}</p>
              <p className="text-[8px] text-white/40 font-mono mt-0.5">
                {status} | {type}
              </p>
            </div>
          </Html>
        )}

        <Text
          position={[0, -0.7, 0.8]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {name.split(' #')[1] ? `#${name.split(' #')[1]}` : name}
        </Text>
      </group>
    </group>
  );
};
