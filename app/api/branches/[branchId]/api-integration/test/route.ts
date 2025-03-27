import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { decrypt } from "@/utils/encryption";

export async function POST(
  request: Request,
  { params }: { params: { branchId: string } }
) {
  try {
    const data = await request.json();

    // Si estamos probando con datos del formulario, usamos directamente
    // Si no, obtenemos la configuración de la base de datos y desencriptamos
    let testData = data;

    if (!data.api_key || data.use_stored) {
      const supabase = createClient(cookies());
      const { data: integration, error } = await supabase
        .from("api_integrations")
        .select("*")
        .eq("provider_branch_id", params.branchId)
        .single();

      if (error) {
        return NextResponse.json(
          { error: "No se encontró configuración de API" },
          { status: 404 }
        );
      }

      testData = {
        provider: integration.provider,
        api_url: integration.api_url,
        api_key: decrypt(integration.api_key),
        api_secret: integration.api_secret
          ? decrypt(integration.api_secret)
          : null,
        additional_params: integration.additional_params,
      };
    }

    // Test the connection based on the provider
    let testResult;

    switch (testData.provider) {
      case "wondersign":
        testResult = await testWondersignConnection(testData);
        break;
      case "shopify":
        testResult = await testShopifyConnection(testData);
        break;
      case "woocommerce":
        testResult = await testWooCommerceConnection(testData);
        break;
      case "magento":
        testResult = await testMagentoConnection(testData);
        break;
      case "custom":
        testResult = await testCustomConnection(testData);
        break;
      default:
        return NextResponse.json(
          { error: "Proveedor no soportado" },
          { status: 400 }
        );
    }

    if (!testResult.success) {
      return NextResponse.json({ error: testResult.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Conexión exitosa" });
  } catch (error) {
    console.error("Error testing API connection:", error);
    return NextResponse.json(
      { error: "Error al probar la conexión con la API" },
      { status: 500 }
    );
  }
}

async function testWondersignConnection(data: any) {
  try {
    // Make a request to the Wondersign API to test the connection
    const response = await fetch(`${data.api_url}/auth/test`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${data.api_key}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: `Error de conexión: ${
          errorData.message || response.statusText
        }`,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: `Error al conectar con Wondersign: ${
        error instanceof Error ? error.message : "Error desconocido"
      }`,
    };
  }
}

async function testShopifyConnection(data: any) {
  try {
    // Make a request to the Shopify API to test the connection
    const response = await fetch(`${data.api_url}/products/count.json`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": data.api_key,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: `Error de conexión: ${
          errorData.message || response.statusText
        }`,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: `Error al conectar con Shopify: ${
        error instanceof Error ? error.message : "Error desconocido"
      }`,
    };
  }
}

async function testWooCommerceConnection(data: any) {
  try {
    // For WooCommerce, we need to use OAuth1.0a
    // This is a simplified test - in production you'd need proper OAuth implementation
    const response = await fetch(
      `${data.api_url}/wp-json/wc/v3/products/count`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(
            `${data.api_key}:${data.api_secret}`
          ).toString("base64")}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: `Error de conexión: ${
          errorData.message || response.statusText
        }`,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: `Error al conectar con WooCommerce: ${
        error instanceof Error ? error.message : "Error desconocido"
      }`,
    };
  }
}

async function testMagentoConnection(data: any) {
  try {
    // First get a token from Magento
    const tokenResponse = await fetch(
      `${data.api_url}/rest/V1/integration/admin/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: data.api_key,
          password: data.api_secret,
        }),
      }
    );

    if (!tokenResponse.ok) {
      return {
        success: false,
        message: `Error de autenticación con Magento: ${tokenResponse.statusText}`,
      };
    }

    const token = await tokenResponse.text();

    // Test the connection with the token
    const testResponse = await fetch(`${data.api_url}/rest/V1/products/count`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.replace(/"/g, "")}`,
      },
    });

    if (!testResponse.ok) {
      return {
        success: false,
        message: `Error de conexión con Magento: ${testResponse.statusText}`,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: `Error al conectar con Magento: ${
        error instanceof Error ? error.message : "Error desconocido"
      }`,
    };
  }
}

async function testCustomConnection(data: any) {
  try {
    // For custom APIs, we'll make a simple GET request to the provided URL
    // The actual implementation would depend on the specific API
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add authentication if provided
    if (data.api_key) {
      headers["Authorization"] = `Bearer ${data.api_key}`;
    }

    const response = await fetch(data.api_url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      return {
        success: false,
        message: `Error de conexión: ${response.statusText}`,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: `Error al conectar con la API personalizada: ${
        error instanceof Error ? error.message : "Error desconocido"
      }`,
    };
  }
}
