import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useStore } from '../store/useStore';

export const useTelemetry = () => {
  const updateTelemetryFromSocket = useStore((state) => state.updateTelemetryFromSocket);
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io('http://localhost:5000');

    socketRef.current.on('telemetry_update', (data) => {
      updateTelemetryFromSocket(data);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [updateTelemetryFromSocket]);
};
