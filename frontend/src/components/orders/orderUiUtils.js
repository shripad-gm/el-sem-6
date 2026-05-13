export const ORDER_STATUS_LABEL = {
  pending: 'Pending',
  in_progress: 'In Progress',
  delayed: 'Delayed',
  completed: 'Completed',
  shipped: 'Shipped',
};

export const PRIORITY_LABEL = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export const ORDER_STATUS_BADGE = {
  pending: 'border-white/25 text-white/70 bg-white/5',
  in_progress: 'border-brand-primary/40 text-brand-primary bg-brand-primary/10 shadow-[0_0_12px_rgba(0,242,255,0.12)]',
  delayed: 'border-status-warning/45 text-status-warning bg-status-warning/10',
  completed: 'border-status-running/40 text-status-running bg-status-running/10',
  shipped: 'border-brand-secondary/40 text-brand-secondary bg-brand-secondary/10',
};

export const PRIORITY_BADGE = {
  low: 'border-white/20 text-white/55 bg-white/[0.04]',
  medium: 'border-status-idle/35 text-status-idle bg-status-idle/10',
  high: 'border-status-warning/40 text-status-warning bg-status-warning/10',
  critical: 'border-status-error/45 text-status-error bg-status-error/10',
};
