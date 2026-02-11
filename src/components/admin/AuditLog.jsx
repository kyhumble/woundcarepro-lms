import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import moment from "moment";

export default function AuditLog() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const { data: logs = [] } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: () => base44.entities.AuditLog.list("-created_date", 200),
  });

  const filtered = logs.filter(log => {
    const matchSearch = log.user_email?.toLowerCase().includes(search.toLowerCase()) ||
      log.action_type?.toLowerCase().includes(search.toLowerCase());
    const matchAction = actionFilter === "all" || log.action_type === actionFilter;
    return matchSearch && matchAction;
  });

  const actionColors = {
    module_created: "bg-green-100 text-green-700",
    module_updated: "bg-blue-100 text-blue-700",
    module_deleted: "bg-red-100 text-red-700",
    lesson_created: "bg-green-100 text-green-700",
    lesson_updated: "bg-blue-100 text-blue-700",
    lesson_deleted: "bg-red-100 text-red-700",
    resource_created: "bg-green-100 text-green-700",
    resource_updated: "bg-blue-100 text-blue-700",
    resource_deleted: "bg-red-100 text-red-700",
    quiz_completed: "bg-purple-100 text-purple-700",
    certificate_issued: "bg-amber-100 text-amber-700",
    user_login: "bg-slate-100 text-slate-700",
    announcement_created: "bg-teal-100 text-teal-700"
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Audit Log</h2>
        <p className="text-sm text-slate-500 mt-1">Track all platform activities and changes</p>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by user or action..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-48 bg-white">
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="module_created">Module Created</SelectItem>
            <SelectItem value="module_updated">Module Updated</SelectItem>
            <SelectItem value="module_deleted">Module Deleted</SelectItem>
            <SelectItem value="lesson_created">Lesson Created</SelectItem>
            <SelectItem value="quiz_completed">Quiz Completed</SelectItem>
            <SelectItem value="certificate_issued">Certificate Issued</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Timestamp</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Action</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Entity</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.slice(0, 50).map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {moment(log.created_date).format("MMM D, YYYY h:mm A")}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {log.user_email}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={actionColors[log.action_type] || "bg-slate-100 text-slate-700"}>
                      {log.action_type?.replace(/_/g, " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {log.entity_type || "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {log.details ? JSON.stringify(log.details).slice(0, 50) + "..." : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-slate-400">
            <p className="text-sm">No audit logs found</p>
          </div>
        )}
      </div>
    </div>
  );
}