import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { snapPositionOnFloor } from '../constants/factoryFloor';
import { apiClient } from '../api/client';

export const useStore = create((set, get) => ({
  machines: [],
  connections: [],
  selectedMachineId: null,
  selectedConnectionId: null,
  hoveredMachineId: null,
  draggingMachineId: null,
  connectionDraft: null,
  connectionDraftEnd: [0, 0.6, 0],
  connectionHoverTargetId: null,
  orbitBlocked: false,
  cameraFocus: null,
  isSidebarOpen: true,
  isDetailsOpen: false,

  fetchInitialData: async () => {
    try {
      const [machinesRes, connectionsRes] = await Promise.all([
        apiClient.get('/machines'),
        apiClient.get('/connections')
      ]);

      const machines = machinesRes.data.map(m => ({
        ...m,
        position: [m.positionX, 0, m.positionZ],
        telemetry: {
          rpm: 0, temp: 0, efficiency: 0, stitchCount: 0, queue: 0, throughput: 0
        },
        logs: []
      }));

      const connections = connectionsRes.data.map(c => ({
        ...c,
        source: c.sourceMachineId,
        target: c.targetMachineId
      }));

      set({ machines, connections });
    } catch (err) {
      console.error("Failed to fetch initial data", err);
    }
  },

  setOrbitBlocked: (blocked) => set({ orbitBlocked: blocked }),
  setHoveredMachine: (id) => set({ hoveredMachineId: id }),
  setCameraFocus: (position) => set({ cameraFocus: position }),

  addMachine: async (type, position = null) => {
    const raw = position || [(Math.random() - 0.5) * 10, 0, (Math.random() - 0.5) * 10];
    const [x, , z] = snapPositionOnFloor(raw[0], raw[2]);
    const finalPosition = [x, 0, z];
    const tempId = uuidv4();
    
    // Optimistic update
    const newMachine = {
      id: tempId,
      code: `M-${Math.floor(Math.random()*1000)}`,
      type: type.id,
      name: `${type.name} #${get().machines.filter((m) => m.type === type.id).length + 1}`,
      line: 'Default',
      position: finalPosition,
      status: 'IDLE',
      telemetry: { rpm: 0, temp: 0, efficiency: 0, stitchCount: 0, queue: 0, throughput: 0 },
      logs: [{ time: new Date().toLocaleTimeString(), message: 'System initialized', type: 'INFO' }],
    };

    set((state) => ({
      machines: [...state.machines, newMachine],
      selectedMachineId: tempId,
      selectedConnectionId: null,
      isDetailsOpen: true,
      cameraFocus: [...finalPosition],
    }));

    try {
      const res = await apiClient.post('/machines', {
        code: newMachine.code,
        name: newMachine.name,
        type: newMachine.type,
        line: newMachine.line,
        positionX: x,
        positionZ: z,
        status: newMachine.status
      });
      // Update ID with backend ID
      set(state => ({
        machines: state.machines.map(m => m.id === tempId ? { ...m, id: res.data.id } : m),
        selectedMachineId: state.selectedMachineId === tempId ? res.data.id : state.selectedMachineId
      }));
    } catch (err) {
      console.error(err);
      // Revert on failure
      set(state => ({ machines: state.machines.filter(m => m.id !== tempId) }));
    }
  },

  removeMachine: async (id) => {
    const mToRemove = get().machines.find(m => m.id === id);
    if (!mToRemove) return;
    
    // Optimistic
    set((state) => {
      const connections = state.connections.filter((c) => c.source !== id && c.target !== id);
      const removedConn = state.selectedConnectionId && !connections.some((c) => c.id === state.selectedConnectionId);
      return {
        machines: state.machines.filter((m) => m.id !== id),
        connections,
        selectedMachineId: state.selectedMachineId === id ? null : state.selectedMachineId,
        selectedConnectionId: removedConn ? null : state.selectedConnectionId,
        isDetailsOpen: state.selectedMachineId === id || removedConn ? false : state.isDetailsOpen,
        draggingMachineId: state.draggingMachineId === id ? null : state.draggingMachineId,
        connectionDraft: state.connectionDraft?.sourceId === id ? null : state.connectionDraft,
        orbitBlocked: state.connectionDraft?.sourceId === id ? false : state.orbitBlocked,
      };
    });

    try {
      await apiClient.delete(`/machines/${id}`);
    } catch (err) {
      console.error(err);
      // Ideally rollback, but skipping for brevity
    }
  },

  updateMachinePosition: async (id, position) => {
    set((state) => ({
      machines: state.machines.map((m) => (m.id === id ? { ...m, position } : m)),
    }));
    try {
      await apiClient.put(`/machines/${id}`, { positionX: position[0], positionZ: position[2] });
    } catch (err) {
      console.error(err);
    }
  },

  beginMachineDrag: (id) =>
    set({
      draggingMachineId: id,
      orbitBlocked: true,
      selectedMachineId: id,
      isDetailsOpen: true,
      selectedConnectionId: null,
    }),

  endMachineDrag: () =>
    set({
      draggingMachineId: null,
      orbitBlocked: false,
    }),

  startConnectionDraft: (sourceId) =>
    set({
      connectionDraft: { sourceId },
      orbitBlocked: true,
      selectedMachineId: sourceId,
      isDetailsOpen: true,
      selectedConnectionId: null,
    }),

  setConnectionDraftEnd: (point) => set({ connectionDraftEnd: point }),

  setConnectionHoverTarget: (id) => set({ connectionHoverTargetId: id }),

  cancelConnectionDraft: () =>
    set({
      connectionDraft: null,
      connectionHoverTargetId: null,
      orbitBlocked: false,
    }),

  completeConnectionDraft: (targetId) => {
    const draft = get().connectionDraft;
    if (!draft || draft.sourceId === targetId) {
      set({ connectionDraft: null, connectionHoverTargetId: null, orbitBlocked: false });
      return false;
    }
    get().addConnection(draft.sourceId, targetId);
    set({
      connectionDraft: null,
      connectionHoverTargetId: null,
      orbitBlocked: false,
    });
    return true;
  },

  selectMachine: (id) =>
    set((state) => {
      const focus = id ? state.machines.find((x) => x.id === id)?.position : null;
      return {
        selectedMachineId: id,
        isDetailsOpen: !!id,
        selectedConnectionId: null,
        cameraFocus: focus ? [...focus] : null,
      };
    }),

  selectConnection: (id) =>
    set((state) => {
      const c = state.connections.find((x) => x.id === id);
      let cameraFocus = null;
      if (c) {
        const a = state.machines.find((m) => m.id === c.source);
        const b = state.machines.find((m) => m.id === c.target);
        if (a && b) {
          cameraFocus = [
            (a.position[0] + b.position[0]) / 2,
            0,
            (a.position[2] + b.position[2]) / 2,
          ];
        }
      }
      return {
        selectedConnectionId: id,
        selectedMachineId: null,
        isDetailsOpen: !!id,
        cameraFocus,
      };
    }),

  clearCanvasSelection: () =>
    set({
      selectedMachineId: null,
      selectedConnectionId: null,
      isDetailsOpen: false,
      cameraFocus: null,
    }),

  updateMachineStatus: async (id, status) => {
    set((state) => ({
      machines: state.machines.map((m) => (m.id === id ? { ...m, status } : m)),
    }));
    try {
      await apiClient.put(`/machines/${id}`, { status });
    } catch (err) {
      console.error(err);
    }
  },

  addConnection: async (source, target) => {
    const state = get();
    if (source === target) return;
    if (state.connections.some((c) => c.source === source && c.target === target)) return;
    
    const tempId = uuidv4();
    const conn = { id: tempId, source, target, createdAt: Date.now() };
    
    set((s) => ({
      connections: [...s.connections, conn],
      selectedConnectionId: conn.id,
      selectedMachineId: null,
      isDetailsOpen: true,
    }));

    try {
      const res = await apiClient.post('/connections', { sourceMachineId: source, targetMachineId: target });
      set(s => ({
        connections: s.connections.map(c => c.id === tempId ? { ...c, id: res.data.id } : c),
        selectedConnectionId: s.selectedConnectionId === tempId ? res.data.id : s.selectedConnectionId
      }));
    } catch (err) {
      console.error(err);
      set(s => ({ connections: s.connections.filter(c => c.id !== tempId) }));
    }
  },

  removeConnection: async (id) => {
    set((state) => ({
      connections: state.connections.filter((c) => c.id !== id),
      selectedConnectionId: state.selectedConnectionId === id ? null : state.selectedConnectionId,
      isDetailsOpen: state.selectedConnectionId === id ? false : state.isDetailsOpen,
    }));
    try {
      await apiClient.delete(`/connections/${id}`);
    } catch(err) {
      console.error(err);
    }
  },

  rerouteConnection: async (connectionId, newTargetId) => {
    const c = get().connections.find((x) => x.id === connectionId);
    if (!c || c.source === newTargetId) return;
    
    get().removeConnection(connectionId);
    get().addConnection(c.source, newTargetId);
  },

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setDetailsOpen: (isOpen) => set({ isDetailsOpen: isOpen }),

  // Now driven by Socket.io
  updateTelemetryFromSocket: (telemetryDataArray) =>
    set((state) => {
      const updatesMap = {};
      telemetryDataArray.forEach(t => updatesMap[t.machineId] = t);

      return {
        machines: state.machines.map((m) => {
          const tUpdate = updatesMap[m.id];
          if (!tUpdate) return m;

          return {
            ...m,
            status: tUpdate.status || m.status,
            logs: tUpdate.newLogs && tUpdate.newLogs.length > 0 
              ? [...tUpdate.newLogs, ...m.logs].slice(0, 100) // Keep last 100 logs
              : m.logs,
            telemetry: {
              ...m.telemetry,
              rpm: tUpdate.telemetry.rpm,
              temp: tUpdate.telemetry.temp,
              efficiency: tUpdate.telemetry.efficiency,
              stitchCount: tUpdate.telemetry.stitchCount,
              queue: tUpdate.telemetry.queue,
              throughput: tUpdate.telemetry.throughput,
              power: tUpdate.telemetry.power,
              health: tUpdate.telemetry.health
            }
          };
        }),
      };
    }),
}));
