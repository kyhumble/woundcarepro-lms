import jsPDF from "jspdf";

export function exportPortfolioPDF({ user, quizAttempts, skillMasteries, caseSubmissions, certificates, achievements, gamification, progress }) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;

  const addSection = (title) => {
    if (y > 250) { doc.addPage(); y = 20; }
    doc.setFontSize(14);
    doc.setTextColor(13, 148, 136); // teal
    doc.text(title, margin, y);
    doc.setDrawColor(13, 148, 136);
    doc.line(margin, y + 2, pageWidth - margin, y + 2);
    doc.setTextColor(0, 0, 0);
    y += 10;
  };

  const addRow = (label, value) => {
    if (y > 270) { doc.addPage(); y = 20; }
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(label + ":", margin + 2, y);
    doc.setTextColor(30, 41, 59);
    doc.text(String(value), margin + 50, y);
    y += 7;
  };

  // ── Header ──
  doc.setFillColor(13, 148, 136);
  doc.rect(0, 0, pageWidth, 35, "F");
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text("Learning Portfolio", margin, 15);
  doc.setFontSize(10);
  doc.text("Healing Compass Academy – Total Wound Care", margin, 23);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, 30);
  doc.setTextColor(0, 0, 0);
  y = 46;

  // ── Student Info ──
  addSection("Student Information");
  addRow("Name", user?.full_name || "N/A");
  addRow("Email", user?.email || "N/A");
  addRow("Total Points", gamification?.total_points || 0);
  addRow("Day Streak", `${gamification?.current_streak || 0} days`);
  addRow("Study Hours", ((progress?.reduce((s, p) => s + (p.time_spent_minutes || 0), 0) || 0) / 60).toFixed(1) + " hrs");
  y += 5;

  // ── Quiz Performance ──
  addSection(`Quiz Performance (${quizAttempts.filter(a => a.passed).length}/${quizAttempts.length} passed)`);
  if (quizAttempts.length > 0) {
    const avgScore = Math.round(quizAttempts.reduce((s, a) => s + (a.score || 0), 0) / quizAttempts.length);
    addRow("Average Score", `${avgScore}%`);
    y += 3;
    doc.setFontSize(9);
    quizAttempts.slice(0, 15).forEach((attempt, i) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setTextColor(attempt.passed ? 13 : 225, attempt.passed ? 148 : 29, attempt.passed ? 136 : 72);
      doc.text(`${i + 1}. Score: ${attempt.score}% — ${attempt.passed ? "PASSED" : "FAILED"} (${new Date(attempt.completed_at || attempt.created_date).toLocaleDateString()})`, margin + 4, y);
      doc.setTextColor(0, 0, 0);
      y += 6;
    });
    if (quizAttempts.length > 15) {
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`...and ${quizAttempts.length - 15} more attempts`, margin + 4, y);
      y += 6;
    }
  } else {
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text("No quiz attempts recorded.", margin + 4, y);
    y += 7;
  }
  y += 5;

  // ── Skills ──
  addSection(`Acquired Skills (${skillMasteries.length})`);
  if (skillMasteries.length > 0) {
    skillMasteries.forEach((skill) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      doc.text(`• ${skill.skill_name}`, margin + 2, y);
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`${skill.mastery_level || "novice"} · Best: ${skill.best_score || 0}% · ${skill.completion_count || 0}x completed${skill.achievement_unlocked ? " ✓ Verified" : ""}`, margin + 8, y + 5);
      y += 12;
    });
  } else {
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text("No skills recorded.", margin + 4, y);
    y += 7;
  }
  y += 5;

  // ── Case Studies ──
  addSection(`Case Study Submissions (${caseSubmissions.length})`);
  if (caseSubmissions.length > 0) {
    caseSubmissions.forEach((sub, i) => {
      if (y > 270) { doc.addPage(); y = 20; }
      const statusIcon = sub.status === "reviewed" ? "✓" : sub.status === "revision_needed" ? "!" : "○";
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      doc.text(`${statusIcon} Submission #${i + 1} — ${sub.status}${sub.score != null ? ` · Score: ${sub.score}%` : ""}`, margin + 2, y);
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`Submitted: ${new Date(sub.created_date).toLocaleDateString()}`, margin + 8, y + 5);
      y += 12;
    });
  } else {
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text("No case study submissions.", margin + 4, y);
    y += 7;
  }
  y += 5;

  // ── Certificates ──
  if (certificates.length > 0) {
    addSection(`Certificates Earned (${certificates.length})`);
    certificates.forEach((cert) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      doc.text(`★ ${cert.title}`, margin + 2, y);
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`#${cert.certificate_number} · Issued: ${new Date(cert.issue_date).toLocaleDateString()}${cert.contact_hours ? ` · ${cert.contact_hours} CE hrs` : ""}`, margin + 8, y + 5);
      y += 13;
    });
    y += 3;
  }

  // ── Achievements ──
  if (achievements.length > 0) {
    addSection(`Badges & Achievements (${achievements.length})`);
    const badgeNames = achievements.map(a => `${a.badge_icon || "🏅"} ${a.badge_name}`).join("   ");
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    const lines = doc.splitTextToSize(badgeNames, pageWidth - margin * 2);
    doc.text(lines, margin + 2, y);
    y += lines.length * 6 + 5;
  }

  // ── Footer ──
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Healing Compass Academy — Confidential Portfolio Document", margin, 290);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 20, 290);
  }

  const filename = `${(user?.full_name || user?.email || "student").replace(/\s+/g, "_")}_portfolio.pdf`;
  doc.save(filename);
}