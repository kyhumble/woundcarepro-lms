import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";

export default function StudentPortfolio() {
  const [selectedUser, setSelectedUser] = useState("");

  const { data: users = [] } = useQuery({
    queryKey: ["all-users"],
    queryFn: () => base44.entities.User.list("-created_date", 200),
  });

  const { data: progress = [] } = useQuery({
    queryKey: ["user-progress", selectedUser],
    queryFn: () => base44.entities.UserProgress.filter({ user_email: selectedUser }),
    enabled: !!selectedUser,
  });

  const { data: quizAttempts = [] } = useQuery({
    queryKey: ["user-quizzes", selectedUser],
    queryFn: () => base44.entities.QuizAttempt.filter({ user_email: selectedUser }),
    enabled: !!selectedUser,
  });

  const { data: mockExamAttempts = [] } = useQuery({
    queryKey: ["user-mock-exams", selectedUser],
    queryFn: () => base44.entities.MockExamAttempt.filter({ user_email: selectedUser }),
    enabled: !!selectedUser,
  });

  const { data: certificates = [] } = useQuery({
    queryKey: ["user-certificates", selectedUser],
    queryFn: () => base44.entities.Certificate.filter({ user_email: selectedUser }),
    enabled: !!selectedUser,
  });

  const { data: gamification } = useQuery({
    queryKey: ["user-gamification", selectedUser],
    queryFn: async () => {
      const data = await base44.entities.UserGamification.filter({ user_email: selectedUser });
      return data[0];
    },
    enabled: !!selectedUser,
  });

  const handleDownload = () => {
    if (!selectedUser) {
      toast.error("Please select a student");
      return;
    }

    const user = users.find(u => u.email === selectedUser);
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text("Learning Portfolio", 20, 20);
    doc.setFontSize(12);
    doc.text(`Student: ${user?.full_name || selectedUser}`, 20, 30);
    doc.text(`Email: ${selectedUser}`, 20, 37);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 44);

    // Progress Summary
    doc.setFontSize(16);
    doc.text("Progress Summary", 20, 60);
    doc.setFontSize(10);
    doc.text(`Lessons Completed: ${progress.filter(p => p.progress_type === "lesson_complete").length}`, 20, 70);
    doc.text(`Quizzes Passed: ${quizAttempts.filter(q => q.passed).length}`, 20, 77);
    doc.text(`Mock Exams Taken: ${mockExamAttempts.length}`, 20, 84);
    doc.text(`Total Points: ${gamification?.total_points || 0}`, 20, 91);
    doc.text(`Current Streak: ${gamification?.current_streak || 0} days`, 20, 98);

    // Quiz Performance
    if (quizAttempts.length > 0) {
      doc.setFontSize(16);
      doc.text("Quiz Performance", 20, 115);
      doc.setFontSize(9);
      let y = 125;
      quizAttempts.slice(0, 10).forEach((attempt, i) => {
        doc.text(`${i + 1}. Score: ${attempt.score}% - ${attempt.passed ? "PASSED" : "FAILED"}`, 25, y);
        y += 7;
      });
    }

    // Certificates
    if (certificates.length > 0) {
      doc.addPage();
      doc.setFontSize(16);
      doc.text("Certificates Earned", 20, 20);
      doc.setFontSize(10);
      let y = 30;
      certificates.forEach((cert, i) => {
        doc.text(`${i + 1}. ${cert.title}`, 25, y);
        doc.setFontSize(9);
        doc.text(`   Certificate #: ${cert.certificate_number}`, 25, y + 5);
        doc.text(`   Issued: ${new Date(cert.issue_date).toLocaleDateString()}`, 25, y + 10);
        if (cert.contact_hours) {
          doc.text(`   Contact Hours: ${cert.contact_hours}`, 25, y + 15);
        }
        doc.setFontSize(10);
        y += 25;
      });
    }

    doc.save(`${user?.full_name || selectedUser}_portfolio.pdf`);
    toast.success("Portfolio downloaded!");
  };

  const selectedUserData = users.find(u => u.email === selectedUser);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Student Portfolio Download</h2>
        <p className="text-sm text-slate-500 mt-1">Generate and download complete learning portfolios</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex gap-4 items-end mb-6">
          <div className="flex-1">
            <label className="text-sm font-medium text-slate-700 mb-2 block">Select Student</label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Choose a student..." />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.email}>
                    {user.full_name || user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleDownload}
            disabled={!selectedUser}
            className="bg-teal-600 hover:bg-teal-700 gap-2"
          >
            <Download className="w-4 h-4" /> Download Portfolio
          </Button>
        </div>

        {selectedUser && selectedUserData && (
          <div className="border-t border-slate-200 pt-6">
            <h3 className="font-semibold text-slate-800 mb-4">Portfolio Preview</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs text-slate-500">Lessons Completed</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {progress.filter(p => p.progress_type === "lesson_complete").length}
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs text-slate-500">Quizzes Passed</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {quizAttempts.filter(q => q.passed).length}
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs text-slate-500">Certificates</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {certificates.length}
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs text-slate-500">Total Points</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {gamification?.total_points || 0}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}