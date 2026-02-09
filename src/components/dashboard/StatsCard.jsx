import React from "react";
import { motion } from "framer-motion";

export default function StatsCard({ title, value, subtitle, icon: Icon, color = "teal", index = 0 }) {
  const colors = {
    teal: { bg: "bg-teal-50", icon: "bg-teal-500", text: "text-teal-600" },
    navy: { bg: "bg-slate-50", icon: "bg-slate-800", text: "text-slate-600" },
    gold: { bg: "bg-amber-50", icon: "bg-amber-500", text: "text-amber-600" },
    rose: { bg: "bg-rose-50", icon: "bg-rose-500", text: "text-rose-600" },
  };
  const c = colors[color] || colors.teal;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="bg-white rounded-2xl border border-slate-200/60 p-6 hover:shadow-lg hover:shadow-slate-200/50 transition-smooth"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {value}
          </p>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl ${c.icon} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </motion.div>
  );
}