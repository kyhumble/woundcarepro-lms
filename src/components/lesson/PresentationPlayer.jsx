import React, { useState } from "react";
import { Presentation, ExternalLink, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PresentationPlayer({ url, fileName }) {
  const [expanded, setExpanded] = useState(false);

  if (!url) return null;

  // Detect file type
  const isVideo = url.match(/\.(mp4|webm|mov|m4v)(\?|$)/i);
  const isOffice = url.match(/\.(ppt|pptx)(\?|$)/i) || fileName?.match(/\.(ppt|pptx)$/i);
  const isPdf = url.match(/\.pdf(\?|$)/i) || fileName?.match(/\.pdf$/i);

  // For PPTX files, use Microsoft Office Online viewer
  const officeViewerUrl = isOffice
    ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`
    : null;

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900">
      {isVideo ? (
        <div>
          <video
            src={url}
            controls
            className={`w-full ${expanded ? "h-[70vh]" : "h-64 md:h-96"} bg-black object-contain`}
            onDoubleClick={() => setExpanded(!expanded)}
          />
          <div className="flex items-center justify-between px-4 py-2 bg-slate-800">
            <div className="flex items-center gap-2 text-slate-300 text-xs">
              <Presentation className="w-3.5 h-3.5 text-teal-400" />
              <span>{fileName || "Voiceover Presentation"}</span>
            </div>
            <div className="flex gap-2">
              <a href={url} download target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="ghost" className="h-7 text-xs text-slate-300 gap-1">
                  <Download className="w-3 h-3" /> Download
                </Button>
              </a>
            </div>
          </div>
        </div>
      ) : officeViewerUrl ? (
        <div>
          <iframe
            src={officeViewerUrl}
            className={`w-full ${expanded ? "h-[70vh]" : "h-[500px]"} border-0`}
            title={fileName || "Presentation"}
            allowFullScreen
          />
          <div className="flex items-center justify-between px-4 py-2 bg-slate-800">
            <div className="flex items-center gap-2 text-slate-300 text-xs">
              <Presentation className="w-3.5 h-3.5 text-teal-400" />
              <span>{fileName || "Presentation"}</span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" className="h-7 text-xs text-slate-300 gap-1" onClick={() => setExpanded(!expanded)}>
                {expanded ? "Collapse" : "Expand"}
              </Button>
              <a href={url} download target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="ghost" className="h-7 text-xs text-slate-300 gap-1">
                  <Download className="w-3 h-3" /> Download
                </Button>
              </a>
            </div>
          </div>
        </div>
      ) : isPdf ? (
        <div>
          <iframe
            src={url}
            className={`w-full ${expanded ? "h-[80vh]" : "h-[500px]"} border-0`}
            title={fileName || "PDF"}
          />
          <div className="flex items-center justify-between px-4 py-2 bg-slate-800">
            <div className="flex items-center gap-2 text-slate-300 text-xs">
              <Presentation className="w-3.5 h-3.5 text-teal-400" />
              <span>{fileName || "PDF Presentation"}</span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" className="h-7 text-xs text-slate-300 gap-1" onClick={() => setExpanded(!expanded)}>
                {expanded ? "Collapse" : "Expand"}
              </Button>
              <a href={url} download target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="ghost" className="h-7 text-xs text-slate-300 gap-1">
                  <Download className="w-3 h-3" /> Download
                </Button>
              </a>
            </div>
          </div>
        </div>
      ) : (
        // Fallback: link to open file
        <div className="p-8 text-center bg-slate-800">
          <Presentation className="w-10 h-10 mx-auto text-teal-400 mb-3" />
          <p className="text-slate-300 text-sm font-medium mb-1">{fileName || "Presentation File"}</p>
          <p className="text-slate-500 text-xs mb-4">Click below to open or download</p>
          <div className="flex gap-3 justify-center">
            <a href={url} target="_blank" rel="noopener noreferrer">
              <Button className="bg-teal-600 hover:bg-teal-700 gap-2 text-sm">
                <ExternalLink className="w-4 h-4" /> Open File
              </Button>
            </a>
            <a href={url} download>
              <Button variant="outline" className="gap-2 text-sm border-slate-600 text-slate-300">
                <Download className="w-4 h-4" /> Download
              </Button>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}