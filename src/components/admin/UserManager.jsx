import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  UserPlus, Mail, Shield, User, Trash2, Search, CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import moment from "moment";

export default function UserManager() {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("user");
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-all-users"],
    queryFn: () => base44.entities.User.list("-created_date", 200),
  });

  const inviteUserMutation = useMutation({
    mutationFn: async ({ email, role }) => {
      return await base44.users.inviteUser(email, role);
    },
    onSuccess: () => {
      toast.success("User invitation sent successfully!");
      setInviteEmail("");
      setInviteRole("user");
      setDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin-all-users"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to invite user");
    },
  });

  const handleInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail || !inviteEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    inviteUserMutation.mutate({ email: inviteEmail, role: inviteRole });
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const adminCount = users.filter((u) => u.role === "admin").length;
  const studentCount = users.filter((u) => u.role === "user").length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-slate-200/60">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Users</p>
                <p className="text-2xl font-bold text-slate-800">{users.length}</p>
              </div>
              <User className="w-8 h-8 text-teal-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200/60">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Students</p>
                <p className="text-2xl font-bold text-slate-800">{studentCount}</p>
              </div>
              <User className="w-8 h-8 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200/60">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Administrators</p>
                <p className="text-2xl font-bold text-slate-800">{adminCount}</p>
              </div>
              <Shield className="w-8 h-8 text-amber-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invite User Section */}
      <Card className="border-teal-200/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-teal-600" />
            Invite New User
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-teal-600 hover:bg-teal-700">
                <UserPlus className="w-4 h-4 mr-2" />
                Invite User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite New User</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleInvite} className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="student@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">
                    Role
                  </label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Student
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Administrator
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500 mt-1">
                    Students can access learning content. Admins can manage the platform.
                  </p>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-teal-600 hover:bg-teal-700"
                    disabled={inviteUserMutation.isPending}
                  >
                    {inviteUserMutation.isPending ? "Sending..." : "Send Invitation"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card className="border-slate-200/60">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-lg">All Users</CardTitle>
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredUsers.map((user, i) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-md">
                    {user.full_name ? user.full_name[0].toUpperCase() : user.email[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {user.full_name || "No name provided"}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-2">
                      <Mail className="w-3 h-3" />
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-slate-400">Joined</p>
                    <p className="text-xs font-medium text-slate-600">
                      {moment(user.created_date).format("MMM D, YYYY")}
                    </p>
                  </div>
                  <Badge
                    className={
                      user.role === "admin"
                        ? "bg-amber-100 text-amber-800 border-amber-200"
                        : "bg-blue-100 text-blue-800 border-blue-200"
                    }
                  >
                    {user.role === "admin" ? (
                      <>
                        <Shield className="w-3 h-3 mr-1" />
                        Admin
                      </>
                    ) : (
                      <>
                        <User className="w-3 h-3 mr-1" />
                        Student
                      </>
                    )}
                  </Badge>
                </div>
              </motion.div>
            ))}
            {filteredUsers.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <User className="w-12 h-12 mx-auto text-slate-200 mb-3" />
                <p className="text-sm text-slate-400">No users found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}