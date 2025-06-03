import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Create Supabase client
    const supabase = createClient(cookies());

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "No se encontró el usuario autenticado" },
        { status: 401 }
      );
    }

    // PASO 1: Crear el negocio
    console.log("Paso 1: Creando negocio...");
    const { data: business, error: businessError } = await supabase
      .from("provider_business")
      .insert({
        business_name: data.business_name,
        business_logo_url: data.business_logo_url,
        business_legal_name: data.business_legal_name,
        tax_situation_url: data.tax_situation_url || null,
        main_phone_number: data.main_phone_number || null,
        contact_phone_number: data.contact_phone_number || null,
        main_email: data.main_email || null,
        business_sector: data.business_sector,
        description: data.description || null,
        bank_account_number: data.bank_account_number || null,
        bank_name: data.bank_name || null,
        street: data.street,
        external_number: data.external_number,
        internal_number: data.internal_number || null,
        neighborhood: data.neighborhood,
        postal_code: data.postal_code,
        city: data.city,
        state: data.state,
        country: data.country || "México",
        delivery_zones: data.delivery_zones || null,
        website_url: data.website_url || null,
        social_media: data.social_media || null,
        reference: data.reference,
        is_verified: false,
        commission_percentage: 0.058,
      })
      .select()
      .single();

    if (businessError) {
      console.error("Error creating business:", businessError);
      return NextResponse.json(
        { error: `Error creando negocio: ${businessError.message}` },
        { status: 500 }
      );
    }

    console.log(`✓ Negocio creado exitosamente: ${business.id}`);

    // PASO 2: Crear relación usuario-negocio
    console.log("Paso 2: Creando relación usuario-negocio...");
    const { error: relationError } = await supabase
      .from("provider_business_users")
      .insert({
        business_id: business.id,
        user_id: user.id,
        role: "admin",
      });

    if (relationError) {
      console.error(
        "Error creating business-user relationship:",
        relationError
      );
      await supabase.from("provider_business").delete().eq("id", business.id);
      return NextResponse.json(
        {
          error: `Error creando relación usuario-negocio: ${relationError.message}`,
        },
        { status: 500 }
      );
    }

    console.log(`✓ Relación usuario-negocio creada exitosamente`);

    // PASO 3: Procesar zonas de entrega en background con chunks pequeños
    if (
      data.delivery_zones &&
      Array.isArray(data.delivery_zones) &&
      data.delivery_zones.length > 0
    ) {
      console.log(
        `Paso 3: Iniciando procesamiento en chunks de ${data.delivery_zones.length} zonas de entrega...`
      );
      processDeliveryZonesInChunks(business.id, data.delivery_zones);
    }

    // Responder inmediatamente con el negocio creado
    return NextResponse.json({
      ...business,
      zones_processing: data.delivery_zones?.length > 0 ? "processing" : "none",
      zones_count: data.delivery_zones?.length || 0,
      message:
        "Negocio creado exitosamente. Las zonas de entrega se están procesando en segundo plano.",
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// Función para dividir array en chunks
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

// Función optimizada para procesar zonas en chunks pequeños
function processDeliveryZonesInChunks(
  businessId: string,
  deliveryZones: any[]
) {
  // Ejecutar después de la respuesta
  setTimeout(async () => {
    try {
      const supabase = createClient(cookies());

      // Validar que el negocio existe
      const { data: business, error: businessError } = await supabase
        .from("provider_business")
        .select("id, business_name")
        .eq("id", businessId)
        .maybeSingle();

      if (businessError || !business) {
        console.error(`El negocio ${businessId} no existe o fue eliminado`);
        return;
      }

      console.log(
        `Procesando ${deliveryZones.length} zonas para ${business.business_name} en chunks`
      );

      // Normalizar y filtrar zonas válidas
      const normalizedZones = deliveryZones
        .filter((zone) => zone.city && zone.state)
        .map((zone) => ({
          city: zone.city.trim(),
          state: zone.state.trim(),
          country: zone.country || "México",
          zone_hash: `${zone.city.trim()}, ${zone.state.trim()}`,
        }));

      if (normalizedZones.length === 0) {
        console.log("No hay zonas válidas para procesar");
        return;
      }

      console.log(`Preparadas ${normalizedZones.length} zonas normalizadas`);

      // Dividir en chunks de máximo 50 zonas para evitar URLs largas
      const CHUNK_SIZE = 50;
      const zoneChunks = chunkArray(normalizedZones, CHUNK_SIZE);

      console.log(
        `Dividido en ${zoneChunks.length} chunks de máximo ${CHUNK_SIZE} zonas`
      );

      let totalProcessed = 0;
      let totalRelationsCreated = 0;

      // Procesar cada chunk secuencialmente
      for (let i = 0; i < zoneChunks.length; i++) {
        const chunk = zoneChunks[i];
        console.log(
          `Procesando chunk ${i + 1}/${zoneChunks.length} (${chunk.length} zonas)`
        );

        try {
          // Insertar zonas del chunk actual
          const { data: insertedZones, error: insertError } = await supabase
            .from("delivery_zones")
            .upsert(chunk, {
              onConflict: "zone_hash",
              ignoreDuplicates: true,
            })
            .select("id, zone_hash");

          if (insertError) {
            console.error(`Error insertando chunk ${i + 1}:`, insertError);
            continue; // Continuar con el siguiente chunk
          }

          console.log(
            `✓ Chunk ${i + 1}: ${insertedZones?.length || 0} zonas procesadas`
          );

          // Obtener zonas por hash en chunks pequeños para evitar URLs largas
          const chunkHashes = chunk.map((zone) => zone.zone_hash);
          const hashChunks = chunkArray(chunkHashes, 25); // Chunks aún más pequeños para las consultas

          const allZonesForChunk: any[] = [];

          // Obtener zonas en sub-chunks
          for (const hashChunk of hashChunks) {
            const { data: zones, error: fetchError } = await supabase
              .from("delivery_zones")
              .select("id, zone_hash")
              .in("zone_hash", hashChunk);

            if (fetchError) {
              console.error("Error obteniendo zonas:", fetchError);
              continue;
            }

            if (zones) {
              allZonesForChunk.push(...zones);
            }
          }

          if (allZonesForChunk.length === 0) {
            console.log(`No se encontraron zonas para el chunk ${i + 1}`);
            continue;
          }

          // Crear relaciones para este chunk
          const zoneRelations = allZonesForChunk.map((zone) => ({
            provider_business_id: businessId,
            delivery_zone_id: zone.id,
          }));

          const { error: relationsError } = await supabase
            .from("provider_delivery_zones")
            .upsert(zoneRelations, {
              onConflict: "provider_business_id,delivery_zone_id",
              ignoreDuplicates: true,
            });

          if (relationsError) {
            console.error(
              `Error creando relaciones chunk ${i + 1}:`,
              relationsError
            );
            continue;
          }

          totalProcessed += chunk.length;
          totalRelationsCreated += zoneRelations.length;

          console.log(
            `✓ Chunk ${i + 1} completado: ${zoneRelations.length} relaciones creadas`
          );

          // Pequeña pausa entre chunks para no sobrecargar la base de datos
          if (i < zoneChunks.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        } catch (chunkError) {
          console.error(`Error procesando chunk ${i + 1}:`, chunkError);
          continue; // Continuar con el siguiente chunk
        }
      }

      console.log(
        `✓ Procesamiento completado: ${totalProcessed} zonas procesadas, ${totalRelationsCreated} relaciones creadas`
      );
    } catch (error) {
      console.error(
        `Error en procesamiento por chunks para negocio ${businessId}:`,
        error
      );
    }
  }, 1000);
}
