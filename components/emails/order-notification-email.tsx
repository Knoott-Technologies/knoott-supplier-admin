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
import * as React from "react";

interface OrderNotificationEmailProps {
  firstName?: string;
  weddingName?: string;
  productName?: string;
  variantName?: string;
  brandName?: string;
  amount?: string;
  orderId?: string;
  status?: string;
  statusMessage?: string;
  additionalInfo?: string;
  logoUrl?: string;
  address?: string;
  shippedBy?: string;
  cancelReason?: string;
}

export const OrderNotificationEmail = ({
  firstName = "",
  weddingName = "",
  productName = "",
  variantName = "",
  brandName = "",
  amount = "",
  orderId = "",
  status = "pending",
  statusMessage = "",
  additionalInfo = "",
  address = "",
  shippedBy = "",
  cancelReason = "",
  logoUrl = "https://knoott-main-git-main-intello-ai.vercel.app/logo.png",
}: OrderNotificationEmailProps) => {
  // Determinar el título del correo según el estado
  let emailTitle = "Actualización de orden";
  let previewText = `Actualización de orden - ${orderId}`;

  switch (status) {
    case "new":
      emailTitle = "¡Nueva orden recibida!";
      previewText = `Nueva orden recibida - ${orderId}`;
      break;
    case "requires_confirmation":
      emailTitle = "Orden pendiente de confirmación";
      previewText = `Orden pendiente de confirmación - ${orderId}`;
      break;
    case "pending":
      emailTitle = "Orden confirmada";
      previewText = `Orden confirmada - ${orderId}`;
      break;
    case "paid":
      emailTitle = "Pago recibido";
      previewText = `Pago recibido para orden - ${orderId}`;
      break;
    case "shipped":
      emailTitle = "Orden enviada";
      previewText = `Orden enviada - ${orderId}`;
      break;
    case "delivered":
      emailTitle = "Orden entregada";
      previewText = `Orden entregada - ${orderId}`;
      break;
    case "canceled":
      emailTitle = "Orden cancelada";
      previewText = `Orden cancelada - ${orderId}`;
      break;
  }

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
              alt="Knoott"
              style={{
                display: "block",
                outline: "none",
                border: "none",
                textDecoration: "none",
              }}
            />
          </Section>

          {/* Título principal */}
          <Heading style={h1}>{emailTitle}</Heading>

          {/* Mensaje principal */}
          <Text style={mainText}>
            Hola <strong>{firstName}</strong>,
          </Text>

          <Text style={secondaryText}>
            {statusMessage ||
              `Te informamos sobre una actualización en tu orden para la boda ${weddingName}.`}
          </Text>

          <Section style={infoBox}>
            <Text style={{ ...mainText, margin: "0", marginBottom: "8px" }}>
              <strong>Detalles de la orden:</strong>
            </Text>
            <Text style={{ ...secondaryText, margin: "5px 0" }}>
              Orden #: <strong>{orderId}</strong>
            </Text>
            <Text style={{ ...secondaryText, margin: "5px 0" }}>
              Producto: <strong>{productName}</strong>
              {brandName ? ` de ${brandName}` : ""}
            </Text>
            <Text style={{ ...secondaryText, margin: "5px 0" }}>
              Monto: <strong>{amount} MXN</strong>
            </Text>
            {address && (
              <Text style={{ ...secondaryText, margin: "5px 0" }}>
                Dirección de envío: <strong>{address}</strong>
              </Text>
            )}
            {status === "shipped" && shippedBy && (
              <Text style={{ ...secondaryText, margin: "5px 0" }}>
                Enviado por: <strong>{shippedBy}</strong>
              </Text>
            )}
            {status === "canceled" && cancelReason && (
              <Text style={{ ...secondaryText, margin: "5px 0" }}>
                Motivo de cancelación: <strong>{cancelReason}</strong>
              </Text>
            )}
          </Section>

          {additionalInfo && (
            <Text style={secondaryText}>{additionalInfo}</Text>
          )}

          <Text style={secondaryText}>
            Si tienes alguna pregunta sobre esta orden, por favor contacta al
            administrador de la boda.
          </Text>

          {/* Footer con logo y redes sociales */}
          <Section style={footerSection}>
            <table
              width="100%"
              border={0}
              cellPadding="0"
              cellSpacing="0"
              role="presentation"
            >
              <tbody>
                <tr>
                  <td style={{ width: "66%" }}>
                    <Img
                      src={logoUrl}
                      height="36"
                      alt="Knoott"
                      style={{
                        display: "block",
                        outline: "none",
                        border: "none",
                        textDecoration: "none",
                      }}
                    />
                  </td>
                  <td>
                    <table
                      width="100%"
                      border={0}
                      cellPadding="0"
                      cellSpacing="0"
                      role="presentation"
                    >
                      <tbody>
                        <tr>
                          <td style={{ textAlign: "right" }}>
                            <Link
                              href="https://www.instagram.com/knoottmx/"
                              style={{
                                textDecoration: "none",
                                display: "inline-block",
                                marginLeft: "10px",
                              }}
                            >
                              <Img
                                src="https://knoott-main-git-main-intello-ai.vercel.app/instagram.png"
                                width="32"
                                height="32"
                                alt="Instagram"
                                style={{ border: "none" }}
                              />
                            </Link>
                            <Link
                              href="https://mx.pinterest.com/knoottgiftlist/"
                              style={{
                                textDecoration: "none",
                                display: "inline-block",
                                marginLeft: "10px",
                              }}
                            >
                              <Img
                                src="https://knoott-main-git-main-intello-ai.vercel.app/pinterest.png"
                                width="32"
                                height="32"
                                alt="Pinterest"
                                style={{ border: "none" }}
                              />
                            </Link>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

          {/* Copyright information */}
          <Text style={copyright}>
            ©{new Date().getFullYear()} Knoott Technologies, S.A.P.I.
            <br />
            Blvd. Centenario 586, Ejido La Unión, 27420, Torreón, Coah., México.
            <br />
            <br />
            Todos los derechos reservados.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default OrderNotificationEmail;

// Estilos actualizados basados en la plantilla proporcionada
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
  fontFamily: "'Playfair Display', serif",
  color: "#1d1c1d",
  fontSize: "36px",
  fontWeight: "700",
  margin: "30px 0",
  padding: "0",
  lineHeight: "42px",
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

const infoBox = {
  backgroundColor: "#f7f7f7",
  borderRadius: "0px",
  padding: "16px",
  marginBottom: "24px",
  marginTop: "24px",
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
