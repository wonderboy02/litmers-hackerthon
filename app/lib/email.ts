import nodemailer from 'nodemailer'

/**
 * Gmail SMTP Transporter
 */
const createGmailTransporter = () => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    throw new Error('Gmail credentials not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD in .env.local')
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })
}

/**
 * 비밀번호 재설정 이메일 발송
 */
export async function sendPasswordResetEmail(
  to: string,
  resetToken: string,
  userName: string,
) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`
  const transporter = createGmailTransporter()

  try {
    const info = await transporter.sendMail({
      from: `"Unlooped" <${process.env.GMAIL_USER}>`,
      to: to,
      subject: '비밀번호 재설정 요청',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
              <h1 style="color: #1a202c; margin: 0 0 20px 0; font-size: 24px;">비밀번호 재설정</h1>
              <p style="margin: 0 0 15px 0;">안녕하세요, ${userName}님</p>
              <p style="margin: 0 0 15px 0;">비밀번호 재설정 요청을 받았습니다. 아래 버튼을 클릭하여 비밀번호를 재설정해주세요.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}"
                   style="background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                  비밀번호 재설정하기
                </a>
              </div>
              <p style="margin: 0 0 15px 0; font-size: 14px; color: #6b7280;">
                이 링크는 <strong>1시간 동안</strong> 유효합니다.
              </p>
              <p style="margin: 0 0 15px 0; font-size: 14px; color: #6b7280;">
                버튼이 작동하지 않으면 아래 링크를 복사하여 브라우저에 붙여넣으세요:<br>
                <a href="${resetUrl}" style="color: #3b82f6; word-break: break-all;">${resetUrl}</a>
              </p>
            </div>
            <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 20px 0 0 0;">
              이 이메일을 요청하지 않으셨다면 무시하셔도 됩니다.
            </p>
          </body>
        </html>
      `,
    })

    console.log('✅ [GMAIL] Password reset email sent:')
    console.log(`   To: ${to}`)
    console.log(`   Message ID: ${info.messageId}`)

    return { success: true, data: { id: info.messageId } }
  } catch (error) {
    console.error('❌ [GMAIL] Failed to send password reset email:', error)
    throw new Error('이메일 발송에 실패했습니다.')
  }
}

/**
 * 팀 초대 이메일 발송
 */
export async function sendTeamInvitationEmail(
  to: string,
  teamName: string,
  inviterName: string,
  inviteToken: string,
) {
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invites/${inviteToken}`
  const transporter = createGmailTransporter()

  try {
    const info = await transporter.sendMail({
      from: `"Unlooped" <${process.env.GMAIL_USER}>`,
      to: to,
      subject: `${teamName} 팀에 초대되었습니다`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
              <h1 style="color: #1a202c; margin: 0 0 20px 0; font-size: 24px;">팀 초대</h1>
              <p style="margin: 0 0 15px 0;">
                <strong>${inviterName}</strong>님이 <strong>${teamName}</strong> 팀에 초대했습니다.
              </p>
              <p style="margin: 0 0 15px 0;">
                아래 버튼을 클릭하여 초대를 수락하고 팀에 합류하세요.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${inviteUrl}"
                   style="background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                  초대 수락하기
                </a>
              </div>
              <p style="margin: 0 0 15px 0; font-size: 14px; color: #6b7280;">
                이 초대는 <strong>7일 동안</strong> 유효합니다.
              </p>
              <p style="margin: 0 0 15px 0; font-size: 14px; color: #6b7280;">
                버튼이 작동하지 않으면 아래 링크를 복사하여 브라우저에 붙여넣으세요:<br>
                <a href="${inviteUrl}" style="color: #3b82f6; word-break: break-all;">${inviteUrl}</a>
              </p>
            </div>
            <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 20px 0 0 0;">
              이 초대를 원하지 않으시면 무시하셔도 됩니다.
            </p>
          </body>
        </html>
      `,
    })

    console.log('✅ [GMAIL] Team invitation email sent:')
    console.log(`   To: ${to}`)
    console.log(`   Message ID: ${info.messageId}`)

    return { success: true, data: { id: info.messageId } }
  } catch (error) {
    console.error('❌ [GMAIL] Failed to send team invitation email:', error)
    throw new Error('이메일 발송에 실패했습니다.')
  }
}
