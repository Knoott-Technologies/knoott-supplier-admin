import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { Font } from "@react-email/font";

interface BusinessInvitationEmailProps {
  userName?: string;
  invitedByName?: string;
  businessName?: string;
  inviteLink?: string;
  role?: string;
  logoUrl?: string;
}

export const BusinessInvitationEmail = ({
  userName = "",
  invitedByName = "",
  businessName = "",
  inviteLink = "",
  role = "Colaborador",
  logoUrl = "https://knoott.com/logo.png",
}: BusinessInvitationEmailProps) => {
  const previewText = `${invitedByName} te ha invitado a colaborar en ${businessName}`;

  return (
    <Html dir="ltr" lang="es">
      <Head>
        <Font
          fontFamily="Playfair Display"
          fallbackFontFamily="serif"
          webFont={{
            url: "https://fonts.gstatic.com/s/playfairdisplay/v30/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDXbtXK-F2qO0g.woff",
            format: "woff",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
        <Font
          fontFamily="Inter"
          fallbackFontFamily={"Arial"}
          webFont={{
            url: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
        <meta content="text/html; charset=UTF-8" httpEquiv="Content-Type" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="x-apple-disable-message-reformatting" />
      </Head>
      <Preview>{previewText}</Preview>
      <Body style={main}>
        {/* Preheader oculto */}
        <div style={{ display: "none", maxHeight: 0, overflow: "hidden" }}>
          {previewText}
          &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
        </div>

        <Container style={container}>
          {/* Cabecera con logo */}
          <Section style={{ marginTop: "32px" }}>
            <Img
              src={logoUrl}
              height="36"
              alt="Logo"
              style={{
                display: "block",
                outline: "none",
                border: "none",
                textDecoration: "none",
              }}
            />
          </Section>

          {/* Título principal */}
          <Heading style={h1}>Invitación para colaborar</Heading>

          {/* Mensaje principal */}
          <Text style={mainText}>
            <strong>{invitedByName}</strong> te ha invitado a colaborar en{" "}
            <strong>{businessName}</strong> como <strong>{role}</strong>.
          </Text>

          <Text style={secondaryText}>
            Hola {userName}, como colaborador podrás:
          </Text>

          <Text style={{ ...secondaryText, marginLeft: "20px" }}>
            • Gestionar información del negocio
            <br />• Recibir notificaciones importantes
            <br />• Coordinar actividades según tu rol
          </Text>

          {/* Invitation button */}
          <Section style={{ marginBottom: "30px", textAlign: "center" }}>
            <Link
              href={inviteLink}
              style={{
                backgroundColor: "#000000",
                color: "#ffffff",
                fontSize: "16px",
                fontWeight: "600",
                textDecoration: "none",
                textAlign: "center" as const,
                padding: "14px 24px",
                border: "1px solid #000000",
                display: "inline-block",
              }}
            >
              Aceptar invitación
            </Link>
          </Section>

          <Text style={secondaryText}>
            Si no esperabas esta invitación, puedes ignorar este mensaje.
          </Text>

          <Text
            style={{
              ...secondaryText,
              margin: "30px 0",
              color: "#777777",
              borderTop: "1px solid #eeeeee",
              paddingTop: "20px",
            }}
          >
            Si tienes problemas con el botón, copia y pega este enlace en tu
            navegador:
            <br />
            <Link
              href={inviteLink}
              style={{
                color: "#000000",
                textDecoration: "underline",
                wordBreak: "break-all",
                fontSize: "13px",
              }}
            >
              {inviteLink}
            </Link>
          </Text>

          {/* Footer con logo */}
          <Section style={footerSection}>
            <Img
              src={logoUrl}
              height="36"
              alt="Logo"
              style={{
                display: "block",
                outline: "none",
                border: "none",
                textDecoration: "none",
              }}
            />
          </Section>

          {/* Copyright information */}
          <Text style={copyright}>
            ©{new Date().getFullYear()} Tu Negocio
            <br />
            Todos los derechos reservados.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default BusinessInvitationEmail;

// Estilos
const main = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  fontFamily:
    "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
};

const container = {
  maxWidth: "37.5em",
  margin: "0 auto",
  padding: "0px 20px",
};

const h1 = {
  color: "#1d1c1d",
  fontSize: "32px",
  fontWeight: "700",
  margin: "30px 0",
  padding: "0",
  lineHeight: "38px",
};

const mainText = {
  fontSize: "16px",
  lineHeight: "24px",
  margin: "16px 0",
  marginBottom: "20px",
};

const secondaryText = {
  fontSize: "14px",
  lineHeight: "22px",
  margin: "16px 0",
  color: "#555555",
};

const footerSection = {
  marginTop: "40px",
  marginBottom: "32px",
  paddingLeft: "8px",
  paddingRight: "8px",
  borderTop: "1px solid #eeeeee",
  paddingTop: "20px",
};

const copyright = {
  fontSize: "12px",
  lineHeight: "15px",
  margin: "16px 0",
  color: "#b7b7b7",
  marginBottom: "50px",
};
