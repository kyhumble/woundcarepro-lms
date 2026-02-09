import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  MessageSquare, Send, Pin, Heart, User, Plus, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import moment from "moment";

export default function Discussions() {
  const [user, setUser] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: discussions = [] } = useQuery({
    queryKey: ["discussions"],
    queryFn: () => base44.entities.Discussion.filter({ parent_id: "" }, "-created_date", 50),
  });

  const { data: allDiscussions = [] } = useQuery({
    queryKey: ["all-discussions"],
    queryFn: () => base44.entities.Discussion.list("-created_date", 200),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Discussion.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discussions"] });
      queryClient.invalidateQueries({ queryKey: ["all-discussions"] });
      setShowNew(false);
      setNewTitle("");
      setNewContent("");
      setReplyContent("");
      setReplyTo(null);
    },
  });

  const handlePost = () => {
    createMutation.mutate({
      user_email: user.email,
      user_name: user.full_name,
      title: newTitle,
      content: newContent,
    });
  };

  const handleReply = (parentId) => {
    createMutation.mutate({
      user_email: user.email,
      user_name: user.full_name,
      content: replyContent,
      parent_id: parentId,
    });
  };

  const getReplies = (parentId) => {
    return allDiscussions.filter(d => d.parent_id === parentId);
  };

  // Get top-level posts (those without parent_id)
  const topLevelPosts = allDiscussions.filter(d => !d.parent_id);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Discussions</h1>
          <p className="text-sm text-slate-500">Connect with fellow learners and share insights</p>
        </div>
        <Button onClick={() => setShowNew(true)} className="bg-teal-600 hover:bg-teal-700 gap-2">
          <Plus className="w-4 h-4" /> New Topic
        </Button>
      </div>

      {/* New Topic Dialog */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Start a New Discussion</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <Input
              placeholder="Topic title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="rounded-xl"
            />
            <Textarea
              placeholder="Share your thoughts, questions, or insights..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="rounded-xl min-h-[120px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button onClick={handlePost} disabled={!newTitle || !newContent} className="bg-teal-600 hover:bg-teal-700 gap-2">
              <Send className="w-4 h-4" /> Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Discussion List */}
      <div className="space-y-4">
        {topLevelPosts.map((disc, i) => {
          const replies = getReplies(disc.id);
          const initials = disc.user_name ? disc.user_name.split(" ").map(n => n[0]).join("") : "U";

          return (
            <motion.div
              key={disc.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <Avatar className="w-9 h-9 flex-shrink-0">
                    <AvatarFallback className="bg-slate-200 text-slate-600 text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-slate-800">{disc.user_name || "Anonymous"}</span>
                      <span className="text-[10px] text-slate-400">{moment(disc.created_date).fromNow()}</span>
                      {disc.is_pinned && <Pin className="w-3 h-3 text-amber-500" />}
                    </div>
                    {disc.title && <h3 className="font-semibold text-slate-800 mb-1">{disc.title}</h3>}
                    <p className="text-sm text-slate-600 leading-relaxed">{disc.content}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <button
                        onClick={() => setReplyTo(replyTo === disc.id ? null : disc.id)}
                        className="text-xs text-slate-400 hover:text-teal-600 flex items-center gap-1 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        {replies.length} {replies.length === 1 ? "reply" : "replies"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Replies */}
                {replies.length > 0 && (
                  <div className="ml-12 mt-4 space-y-3 border-l-2 border-slate-100 pl-4">
                    {replies.map(reply => (
                      <div key={reply.id} className="flex items-start gap-2">
                        <Avatar className="w-6 h-6 flex-shrink-0">
                          <AvatarFallback className="bg-slate-100 text-slate-500 text-[9px]">
                            {reply.user_name ? reply.user_name.split(" ").map(n => n[0]).join("") : "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-slate-700">{reply.user_name}</span>
                            <span className="text-[10px] text-slate-400">{moment(reply.created_date).fromNow()}</span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">{reply.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Input */}
                {replyTo === disc.id && (
                  <div className="ml-12 mt-3 flex gap-2">
                    <Input
                      placeholder="Write a reply..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      className="rounded-xl text-sm"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleReply(disc.id)}
                      disabled={!replyContent}
                      className="bg-teal-600 hover:bg-teal-700"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {topLevelPosts.length === 0 && (
          <div className="text-center py-16">
            <MessageSquare className="w-16 h-16 mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400">No discussions yet. Start the conversation!</p>
          </div>
        )}
      </div>
    </div>
  );
}