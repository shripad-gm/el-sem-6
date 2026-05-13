import {
  LayoutDashboard,
  Users,
  Boxes,
  GitBranch,
  Cpu,
  ClipboardList,
  Truck,
  BarChart3,
} from 'lucide-react';

export const MES_NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/staff-management', label: 'Staff Management', icon: Users },
  { to: '/resource-management', label: 'Resource Management', icon: Boxes },
  { to: '/workflow-management', label: 'Workflow Management', icon: GitBranch },
  { to: '/machine-management', label: 'Machine Management', icon: Cpu },
  { to: '/order-management', label: 'Order Management', icon: ClipboardList },
  { to: '/shipment-management', label: 'Shipment Management', icon: Truck },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
];
