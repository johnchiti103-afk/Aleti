  import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';

interface DraggablePanelProps {
  children: React.ReactNode;
  initialHeight?: number;
  maxHeight?: number;
  minHeight?: number;
  className?: string;
  onHeightChange?: (height: number) => void;
}

export const DraggablePanel: React.FC<DraggablePanelProps> = ({
  children,
  initialHeight = 400,
  maxHeight = 600,
  minHeight = 200,
  className = '',
  onHeightChange
}) => {
  const [height, setHeight] = useState(initialHeight);
  const panelRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);
  
  const backgroundOpacity = useTransform(y, [-200, 0], [0.3, 0.1]);

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const newHeight = height - info.delta.y;
    const clampedHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));
    setHeight(clampedHeight);
    onHeightChange?.(clampedHeight);
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const velocity = info.velocity.y;
    let targetHeight = height;

    if (Math.abs(velocity) > 500) {
      if (velocity > 0) {
        targetHeight = minHeight;
      } else {
        targetHeight = maxHeight;
      }
    } else {
      const midPoint = (minHeight + maxHeight) / 2;
      targetHeight = height > midPoint ? maxHeight : minHeight;
    }

    setHeight(targetHeight);
    onHeightChange?.(targetHeight);
  };

  return (
    <>
      <motion.div
        className="fixed inset-0 bg-black pointer-events-none z-10"
        style={{ opacity: backgroundOpacity }}
      />
      <motion.div
        ref={panelRef}
        className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-20 ${className}`}
        style={{ height }}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
      >
        <motion.div
          className="w-full h-6 flex justify-center items-center cursor-grab active:cursor-grabbing"
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.1}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          whileTap={{ scale: 1.1 }}
        >
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </motion.div>
        <div className="px-4 pb-4 overflow-hidden" style={{ height: height - 24 }}>
          {children}
        </div>
      </motion.div>
    </>
  );
};
