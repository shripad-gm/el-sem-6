import {
  Scissors,
  Cpu,
  Settings,
  Layers,
  Wind,
  Thermometer,
  CheckCircle,
  Package,
  Slice,
} from 'lucide-react';

export const MACHINE_TYPES = {
  CUTTING: {
    id: 'cutting',
    name: 'Cutting Station',
    icon: Slice,
    tag: 'CUT',
    color: '#22d3ee',
  },
  LOCKSTITCH: {
    id: 'lockstitch',
    name: 'Lockstitch Machine',
    icon: Scissors,
    tag: 'STITCH',
    color: '#00f2ff'
  },
  OVERLOCK: {
    id: 'overlock',
    name: 'Overlock Machine',
    icon: Layers,
    tag: 'EDGE',
    color: '#7000ff'
  },
  FLATLOCK: {
    id: 'flatlock',
    name: 'Flatlock Machine',
    icon: Wind,
    tag: 'SEAM',
    color: '#ff00c8'
  },
  BUTTONHOLE: {
    id: 'buttonhole',
    name: 'Buttonhole Machine',
    icon: Cpu,
    tag: 'DETAIL',
    color: '#ffd700'
  },
  BARTACK: {
    id: 'bartack',
    name: 'Bartack Machine',
    icon: Settings,
    tag: 'REINFORCE',
    color: '#00ff88'
  },
  IRONING: {
    id: 'ironing',
    name: 'Ironing Station',
    icon: Thermometer,
    tag: 'FINISH',
    color: '#ff8c00'
  },
  QUALITY_CHECK: {
    id: 'quality_check',
    name: 'Quality Check Station',
    icon: CheckCircle,
    tag: 'QC',
    color: '#00d4ff'
  },
  PACKING: {
    id: 'packing',
    name: 'Packing Station',
    icon: Package,
    tag: 'LOGISTICS',
    color: '#ffffff'
  }
};
