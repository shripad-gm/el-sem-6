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
  Search,
  Maximize,
  Scan,
  PenTool,
  Tag,
  Zap,
  CircleDot
} from 'lucide-react';

export const MACHINE_TYPES = {
  // 1. Fabric Inspection Section
  FABRIC_INSPECTION: {
    id: 'fabric_inspection',
    name: 'Fabric Inspection Machine',
    icon: Search,
    tag: 'INSPECT',
    color: '#8b5cf6',
  },
  // 2. Fabric Spreading Section
  FABRIC_SPREADING: {
    id: 'fabric_spreading',
    name: 'Fabric Spreading Machine',
    icon: Maximize,
    tag: 'SPREAD',
    color: '#3b82f6',
  },
  // 3. Cutting Section
  STRAIGHT_KNIFE: {
    id: 'straight_knife',
    name: 'Straight Knife Cutting Machine',
    icon: Scissors,
    tag: 'CUT',
    color: '#22d3ee',
  },
  ROUND_KNIFE: {
    id: 'round_knife',
    name: 'Round Knife Cutting Machine',
    icon: Slice,
    tag: 'CUT',
    color: '#0ea5e9',
  },
  CNC_CUTTER: {
    id: 'cnc_cutter',
    name: 'CNC Fabric Cutter',
    icon: Cpu,
    tag: 'CUT',
    color: '#0284c7',
  },
  // 4. Bundling Section
  BUNDLING_STATION: {
    id: 'bundling_station',
    name: 'Bundling Station',
    icon: Layers,
    tag: 'BUNDLE',
    color: '#f59e0b',
  },
  // 5. Stitching Section
  LOCKSTITCH: {
    id: 'lockstitch',
    name: 'Lockstitch Machine',
    icon: Settings,
    tag: 'STITCH',
    color: '#00f2ff'
  },
  OVERLOCK: {
    id: 'overlock',
    name: 'Overlock Machine (Serger)',
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
    icon: CircleDot,
    tag: 'DETAIL',
    color: '#ffd700'
  },
  BUTTON_STITCH: {
    id: 'button_stitch',
    name: 'Button Stitch Machine',
    icon: CircleDot,
    tag: 'DETAIL',
    color: '#eab308'
  },
  BARTACK: {
    id: 'bartack',
    name: 'Bartack Machine',
    icon: Settings,
    tag: 'REINFORCE',
    color: '#00ff88'
  },
  ZIG_ZAG: {
    id: 'zig_zag',
    name: 'Zig-Zag Machine',
    icon: Zap,
    tag: 'STITCH',
    color: '#10b981'
  },
  EMBROIDERY: {
    id: 'embroidery',
    name: 'Embroidery Machine',
    icon: PenTool,
    tag: 'DESIGN',
    color: '#ec4899'
  },
  // 6. Quality Check Section
  QC_TABLE: {
    id: 'qc_table',
    name: 'QC Inspection Table',
    icon: CheckCircle,
    tag: 'QC',
    color: '#00d4ff'
  },
  DEFECT_SCANNER: {
    id: 'defect_scanner',
    name: 'Defect Scanner',
    icon: Scan,
    tag: 'QC',
    color: '#06b6d4'
  },
  // 7. Ironing / Finishing Section
  STEAM_IRON: {
    id: 'steam_iron',
    name: 'Steam Ironing Machine',
    icon: Thermometer,
    tag: 'FINISH',
    color: '#ff8c00'
  },
  TUNNEL_FINISHER: {
    id: 'tunnel_finisher',
    name: 'Tunnel Finisher',
    icon: Wind,
    tag: 'FINISH',
    color: '#f97316'
  },
  // 8. Packing Section
  FOLDING_MACHINE: {
    id: 'folding_machine',
    name: 'Folding Machine',
    icon: Layers,
    tag: 'PACK',
    color: '#cbd5e1'
  },
  TAGGING_MACHINE: {
    id: 'tagging_machine',
    name: 'Tagging Machine',
    icon: Tag,
    tag: 'PACK',
    color: '#94a3b8'
  },
  PACKING_MACHINE: {
    id: 'packing_machine',
    name: 'Packing Machine',
    icon: Package,
    tag: 'LOGISTICS',
    color: '#ffffff'
  }
};
