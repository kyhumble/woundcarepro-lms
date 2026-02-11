import React, { useState } from "react";
import { motion } from "framer-motion";
import { Info, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function InteractiveDiagram({ title, imageUrl, hotspots }) {
  const [activeHotspot, setActiveHotspot] = useState(null);

  return (
    <div className="my-6 p-5 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl border border-teal-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center">
          <Info className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide">Interactive Diagram</p>
          <p className="text-sm font-medium text-slate-800">{title}</p>
        </div>
      </div>

      <div className="relative bg-white rounded-xl overflow-hidden border border-slate-200">
        <img src={imageUrl} alt={title} className="w-full h-auto" />
        
        {/* Hotspots */}
        {hotspots?.map((hotspot, idx) => (
          <motion.button
            key={idx}
            className="absolute w-6 h-6 rounded-full bg-teal-500 border-2 border-white shadow-lg hover:scale-110 transition-transform"
            style={{ 
              left: `${hotspot.x}%`, 
              top: `${hotspot.y}%`,
              transform: "translate(-50%, -50%)"
            }}
            onClick={() => setActiveHotspot(activeHotspot === idx ? null : idx)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-xs font-bold text-white">{idx + 1}</span>
          </motion.button>
        ))}

        {/* Active Hotspot Info */}
        {activeHotspot !== null && hotspots[activeHotspot] && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-xl p-4 border border-teal-200"
          >
            <button
              onClick={() => setActiveHotspot(null)}
              className="absolute top-2 right-2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
            <Badge className="mb-2 bg-teal-100 text-teal-700 text-xs">
              Point {activeHotspot + 1}
            </Badge>
            <p className="text-sm font-semibold text-slate-800 mb-1">
              {hotspots[activeHotspot].label}
            </p>
            <p className="text-xs text-slate-600">
              {hotspots[activeHotspot].description}
            </p>
          </motion.div>
        )}
      </div>

      <p className="text-xs text-slate-500 mt-3 text-center">
        Click numbered points to learn more
      </p>
    </div>
  );
}