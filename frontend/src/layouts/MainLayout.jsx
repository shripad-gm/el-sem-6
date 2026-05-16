import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { MesSidebar } from '../components/layout/MesSidebar';
import { useStore } from '../store/useStore';
import { useStaffStore } from '../store/useStaffStore';
import { useOrderStore } from '../store/useOrderStore';
import { useShipmentStore } from '../store/useShipmentStore';
import { Toaster } from 'react-hot-toast';

export default function MainLayout() {
  const fetchInitialData = useStore(state => state.fetchInitialData);
  const fetchWorkers = useStaffStore(state => state.fetchWorkers);
  const fetchOrders = useOrderStore(state => state.fetchOrders);
  const fetchShipments = useShipmentStore(state => state.fetchShipments);

  useEffect(() => {
    fetchInitialData();
    fetchWorkers();
    fetchOrders();
    fetchShipments();
  }, [fetchInitialData, fetchWorkers, fetchOrders, fetchShipments]);

  return (
    <div className="h-screen w-screen flex flex-col bg-industrial-bg overflow-hidden text-white selection:bg-brand-primary selection:text-black">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-brand-primary/5 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-brand-secondary/5 to-transparent" />
        <div className="absolute inset-0 opacity-10">
          <div className="h-px w-full bg-brand-primary/20 absolute top-1/4 animate-[scan_8s_linear_infinite]" />
          <div className="h-px w-full bg-brand-primary/20 absolute top-3/4 animate-[scan_12s_linear_infinite]" />
        </div>
      </div>

      <Navbar />

      <div className="flex flex-1 min-h-0 relative">
        <MesSidebar />
        <div className="flex-1 min-w-0 min-h-0 flex flex-col relative overflow-hidden">
          <Outlet />
        </div>
      </div>

      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--color-industrial-panel)',
            color: '#fff',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
          },
          success: {
            iconTheme: {
              primary: 'var(--color-status-running)',
              secondary: '#000',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--color-status-error)',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}
