import { useEffect, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store/useStore';

/**
 * While a connection is being drawn from an OUTPUT port, track pointer in NDC
 * and raycast optional INPUT port targets (userData.inputPort).
 */
export function useConnectionPointerBridge() {
  const connectionDraft = useStore((s) => s.connectionDraft);
  const { camera, scene, gl } = useThree();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const ndc = useMemo(() => new THREE.Vector2(), []);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const hit = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    if (!connectionDraft) return undefined;

    let armed = false;
    const armTimer = setTimeout(() => {
      armed = true;
    }, 20);

    const collectInputMeshes = () => {
      const out = [];
      scene.traverse((obj) => {
        if (obj.userData?.inputPort && obj.isMesh) out.push(obj);
      });
      return out;
    };

    const onMove = (e) => {
      const rect = gl.domElement.getBoundingClientRect();
      ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(ndc, camera);
      if (raycaster.ray.intersectPlane(plane, hit)) {
        useStore.getState().setConnectionDraftEnd([hit.x, 0.95, hit.z]);
      }
      const picks = raycaster.intersectObjects(collectInputMeshes(), false);
      const id = picks[0]?.object?.userData?.machineId ?? null;
      useStore.getState().setConnectionHoverTarget(id);
    };

    const onUp = () => {
      if (!armed) return;
      const st = useStore.getState();
      const target = st.connectionHoverTargetId;
      if (target && target !== connectionDraft.sourceId) {
        st.completeConnectionDraft(target);
      } else {
        st.cancelConnectionDraft();
      }
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      clearTimeout(armTimer);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [connectionDraft, camera, scene, gl, raycaster, ndc, plane, hit]);
}
