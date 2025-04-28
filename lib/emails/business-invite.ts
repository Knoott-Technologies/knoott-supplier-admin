import { BusinessInvitationEmail } from "@/components/emails/business-invitation-email"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendBusinessInvitationParams {
  userName: string
  userEmail: string
  invitedByName: string
  businessName: string
  invitationToken: string
  origin: string
  role: string
}

export async function sendBusinessInvitationEmail({
  userName,
  userEmail,
  invitedByName,
  businessName,
  invitationToken,
  origin,
  role,
}: SendBusinessInvitationParams) {
  const inviteLink = `${origin}/business/invite/accept?token=${invitationToken}`

  // Map role to Spanish
  const roleInSpanish =
    {
      admin: "Administrador",
      supervisor: "Supervisor",
      staff: "Staff",
    }[role] || "Colaborador"

  try {
    const { data, error } = await resend.emails.send({
      from: "Knoott Partners <app@knoott.com>",
      to: userEmail,
      subject: `${invitedByName} te ha invitado a colaborar en ${businessName}`,
      react: BusinessInvitationEmail({
        userName,
        invitedByName,
        businessName,
        inviteLink,
        role: roleInSpanish,
      }),
    })

    if (error) {
      console.error("Error sending invitation email:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Exception when sending invitation email:", error)
    return { success: false, error }
  }
}
