import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const { email, role, inviterName } = await req.json();

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    const appUrl = Deno.env.get('APP_URL') || 'https://your-app.base44.com';
    const roleLabel = role === 'admin' ? 'Administrator' : 'Student';

    const emailBody = `
      <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #0D9488, #14B8A6); padding: 40px 30px; border-radius: 12px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-family: 'DM Serif Display', serif;">
            🎓 Healing Compass Academy
          </h1>
          <p style="color: #D1FAE5; margin: 10px 0 0 0; font-size: 14px;">
            In partnership with Total Wound Care
          </p>
        </div>
        
        <div style="background: white; padding: 40px 30px; border: 1px solid #E2E8F0; border-radius: 12px; margin-top: 20px;">
          <h2 style="color: #1E293B; margin-top: 0; font-size: 24px;">You've Been Invited!</h2>
          
          <p style="color: #475569; line-height: 1.6; font-size: 16px;">
            ${inviterName || 'An administrator'} has invited you to join <strong>Healing Compass Academy</strong> as a <strong>${roleLabel}</strong>.
          </p>
          
          <p style="color: #475569; line-height: 1.6; font-size: 16px;">
            Our comprehensive wound care certification platform offers:
          </p>
          
          <ul style="color: #475569; line-height: 1.8; font-size: 15px;">
            <li>Structured learning modules aligned with WOCN, ASCN, and CWS standards</li>
            <li>Interactive case studies and skills assessments</li>
            <li>Mock certification exams and practice quizzes</li>
            <li>CE credits and professional certificates</li>
          </ul>
          
          <div style="text-align: center; margin: 35px 0;">
            <a href="${appUrl}" 
               style="background: linear-gradient(135deg, #0D9488, #14B8A6); color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3);">
              Get Started →
            </a>
          </div>
          
          <div style="background: #F8FAFC; padding: 20px; border-radius: 8px; margin-top: 30px; border-left: 4px solid #14B8A6;">
            <p style="margin: 0; color: #475569; font-size: 14px;">
              <strong>Your login email:</strong> ${email}
            </p>
            <p style="margin: 10px 0 0 0; color: #64748B; font-size: 13px;">
              Click the button above to create your password and access the platform.
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #94A3B8; font-size: 12px;">
          <p style="margin: 0;">© ${new Date().getFullYear()} Healing Compass Academy | Total Wound Care</p>
          <p style="margin: 10px 0 0 0;">Advancing wound care education and certification excellence</p>
        </div>
      </div>
    `;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: email,
      subject: `Welcome to Healing Compass Academy - ${roleLabel} Access`,
      body: emailBody
    });

    return Response.json({ 
      success: true, 
      message: 'Invitation email sent successfully' 
    });

  } catch (error) {
    console.error('Error sending invitation:', error);
    return Response.json({ 
      error: error.message || 'Failed to send invitation email' 
    }, { status: 500 });
  }
});