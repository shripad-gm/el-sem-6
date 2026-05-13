import { twMerge } from 'tailwind-merge';

export const GlassPanel = ({ children, className, id }) => {
  return (
    <div 
      id={id}
      className={twMerge(
        "glass-panel rounded-xl overflow-hidden flex flex-col transition-all duration-300",
        className
      )}
    >
      {children}
    </div>
  );
};
