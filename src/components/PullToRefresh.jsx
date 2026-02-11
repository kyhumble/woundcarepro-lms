import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { RefreshCw } from "lucide-react";

export default function PullToRefresh({ onRefresh, children }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pullDistance = useMotionValue(0);
  const containerRef = useRef(null);
  const startY = useRef(0);
  const THRESHOLD = 80;

  const handleTouchStart = (e) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e) => {
    if (isRefreshing || !startY.current || window.scrollY > 0) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - startY.current;

    if (distance > 0) {
      pullDistance.set(Math.min(distance, THRESHOLD * 1.5));
      if (distance > 10) {
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance.get() >= THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      pullDistance.set(THRESHOLD);
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        pullDistance.set(0);
      }
    } else {
      pullDistance.set(0);
    }
    startY.current = 0;
  };

  const opacity = useTransform(pullDistance, [0, THRESHOLD], [0, 1]);
  const rotation = useTransform(pullDistance, [0, THRESHOLD], [0, 360]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isRefreshing]);

  return (
    <div ref={containerRef} className="relative">
      <motion.div
        className="absolute top-0 left-0 right-0 flex justify-center items-center pt-4 pb-2"
        style={{ opacity, y: useTransform(pullDistance, [0, THRESHOLD], [-50, 0]) }}
      >
        <motion.div
          style={{ rotate: isRefreshing ? undefined : rotation }}
          animate={isRefreshing ? { rotate: 360 } : {}}
          transition={isRefreshing ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
          className="w-6 h-6 text-teal-600"
        >
          <RefreshCw className="w-full h-full" />
        </motion.div>
      </motion.div>
      
      <motion.div style={{ y: pullDistance }}>
        {children}
      </motion.div>
    </div>
  );
}