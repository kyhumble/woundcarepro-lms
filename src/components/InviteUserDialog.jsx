import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, Mail, Copy, Check, Send } from "lucide-react";
import { toast } from "sonner";

export default function InviteUserDialog({ currentUser }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);

  const isAdmin = currentUser?.role === "admin";

  const handleInvite = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const result = await base44.users.inviteUser(email, role);
      
      // Check if invite link is returned
      if (result?.invite_url) {
        setInviteLink(result.invite_url);
      }
      
      setInviteSent(true);
      toast.success(`Invitation sent to ${email}`);
    } catch (error) {
      toast.error(error.message || "Failed to send invitation");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success("Invite link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEmail("");
    setRole("user");
    setInviteSent(false);
    setInviteLink("");
    setCopied(false);
  };

  const handleSendAnother = () => {
    setEmail("");
    setRole("user");
    setInviteSent(false);
    setInviteLink("");
    setCopied(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button className="bg-teal-600 hover:bg-teal-700 gap-2">
          <UserPlus className="w-4 h-4" />
          Invite User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {!inviteSent ? (
          <form onSubmit={handleInvite}>
            <DialogHeader>
              <DialogTitle>Invite a User</DialogTitle>
              <DialogDescription>
                Send an invitation to join Healing Compass Academy
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Student</SelectItem>
                    {isAdmin && <SelectItem value="admin">Admin</SelectItem>}
                  </SelectContent>
                </Select>
                {!isAdmin && (
                  <p className="text-xs text-slate-500">
                    Only admins can invite other admins
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="gap-2">
                {loading ? "Sending..." : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Invitation
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-teal-600">
                <Check className="w-5 h-5" />
                Invitation Sent!
              </DialogTitle>
              <DialogDescription>
                An invitation email has been sent to <span className="font-medium text-slate-700">{email}</span>
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              {inviteLink && (
                <div className="space-y-2">
                  <Label>Invite Link</Label>
                  <div className="flex gap-2">
                    <Input
                      value={inviteLink}
                      readOnly
                      className="font-mono text-xs"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={handleCopyLink}
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500">
                    You can also share this link directly with the invitee
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
              >
                Close
              </Button>
              <Button
                type="button"
                onClick={handleSendAnother}
                className="gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Send Another
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}