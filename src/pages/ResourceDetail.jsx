import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { motion } from "framer-motion";
import { ArrowLeft, Download, ExternalLink, FileText, Video, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ResourceDetail() {
  const params = new URLSearchParams(window.location.search);
  const resourceId = params.get("id");

  const { data: resource } = useQuery({
    queryKey: ["resource", resourceId],
    queryFn: async () => {
      const resources = await base44.entities.Resource.filter({ id: resourceId });
      return resources[0];
    },
    enabled: !!resourceId,
  });

  const { data: relatedModule } = useQuery({
    queryKey: ["module", resource?.module_id],
    queryFn: async () => {
      if (!resource?.module_id) return null;
      const modules = await base44.entities.Module.filter({ id: resource.module_id });
      return modules[0];
    },
    enabled: !!resource?.module_id,
  });

  if (!resource) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-slate-400">Loading resource...</div>
      </div>
    );
  }

  const typeIcons = {
    pdf: FileText,
    video: Video,
    article: BookOpen,
    guideline: FileText,
    quick_reference: BookOpen,
    external_link: ExternalLink,
  };

  const Icon = typeIcons[resource.resource_type] || FileText;
  const resourceLink = resource.file_url || resource.url;

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        to={createPageUrl("ResourceLibrary")}
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-teal-600 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Library
      </Link>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden"
      >
        {/* Header */}
        <div className="p-8 border-b border-slate-100">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
              <Icon className="w-7 h-7 text-teal-600" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge className="capitalize">{resource.resource_type.replace("_", " ")}</Badge>
                {resource.difficulty && (
                  <Badge variant="outline" className="capitalize">{resource.difficulty}</Badge>
                )}
              </div>
              <h1 className="text-2xl font-bold text-slate-800">{resource.title}</h1>
              {resource.description && (
                <p className="text-slate-600 mt-2">{resource.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Module Association */}
          {relatedModule && (
            <div className="mb-6 p-4 bg-teal-50 rounded-xl">
              <p className="text-xs font-semibold text-teal-700 mb-1">RELATED MODULE</p>
              <Link
                to={createPageUrl(`ModuleDetail?id=${relatedModule.id}`)}
                className="text-sm font-medium text-teal-700 hover:text-teal-800"
              >
                Module {relatedModule.module_number}: {relatedModule.title}
              </Link>
            </div>
          )}

          {/* Tags */}
          {resource.topic_tags?.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-semibold text-slate-600 mb-2">TOPICS</p>
              <div className="flex flex-wrap gap-2">
                {resource.topic_tags.map((tag, i) => (
                  <Badge key={i} variant="outline">{tag}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Resource Preview/Embed */}
          {resource.resource_type === "video" && resource.url && (
            <div className="mb-6">
              <div className="aspect-video bg-slate-100 rounded-xl overflow-hidden">
                <iframe
                  src={resource.url}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {resource.resource_type === "pdf" && resource.file_url && (
            <div className="mb-6">
              <div className="h-96 bg-slate-100 rounded-xl overflow-hidden">
                <iframe
                  src={resource.file_url}
                  className="w-full h-full"
                  title="PDF Preview"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {resourceLink && (
              <a href={resourceLink} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button className="w-full bg-teal-600 hover:bg-teal-700 gap-2">
                  {resource.file_url ? <Download className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
                  {resource.file_url ? "Download Resource" : "Open Resource"}
                </Button>
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}