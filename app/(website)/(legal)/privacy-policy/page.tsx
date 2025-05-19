import FooterWebsite from "@/components/universal/website/footer";
import { HeaderWebsite } from "@/components/universal/website/header-website";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import React from "react";

const PrivacyPolicyPage = async () => {
  const supabase = createClient(cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: userBusiness, error } = await supabase
    .from("provider_business_users")
    .select("*, business:provider_business(*)")
    .eq("user_id", user?.id);

  return (
    <main className="w-full h-fit items-center justify-center flex flex-col gap-y-3">
      <HeaderWebsite userBusinesses={userBusiness} user={user} theme="black" />
      <div className="w-full max-w-4xl px-5 md:px-7 lg:px-0 py-20 lg:py-24 xl:py-36">
        <h1 className="text-3xl font-bold text-center mb-8">
          AVISO DE PRIVACIDAD INTEGRAL
        </h1>
        <h2 className="text-2xl font-semibold text-center mb-6">
          KNOOTT TECHNOLOGIES, S.A.P.I. DE C.V.
        </h2>

        <div className="space-y-6 text-base">
          <p>
            Su información personal es de suma importancia para nosotros, por lo
            que velaremos por preservar la seguridad y privacidad de sus datos
            personales en el ejercicio de nuestras actividades.
          </p>

          <p>
            Al momento de proporcionarnos sus Datos Personales (los
            &quot;Datos&quot;) entendemos que conoce y acepta las condiciones
            establecidas para el tratamiento de sus DATOS de acuerdo al presente
            Aviso de Privacidad (el &quot;Aviso&quot;) en el cual le informamos
            de conformidad con lo dispuesto por la Ley Federal de Protección de
            Datos Personales en Posesión de los Particulares (la
            &quot;Ley&quot;) y su Reglamento (el &quot;Reglamento&quot;), sobre
            cómo y con qué fines tratamos su información personal, por lo que le
            recomendamos de la manera más atenta lea detenidamente el presente
            Aviso.
          </p>

          <p>
            En apego a las disposiciones de la Ley y su Reglamento, hacemos de
            su conocimiento las siguientes consideraciones:
          </p>

          <section>
            <h2 className="text-xl font-semibold my-4">1. RESPONSABLE</h2>
            <div className="space-y-4">
              <p>
                El responsable del tratamiento de sus datos personales es KNOOTT
                TECHNOLOGIES, S.A.P.I. DE C.V., (&quot;Knoott&quot;, o el
                &quot;Responsable&quot;), con domicilio en Avenida Presidente
                Carranza número 68, C.P. 27000, en el municipio de Torreón,
                Coahuila, y a quien usted puede contactar en cualquier momento a
                través del correo electrónico: soporte@knoott.com.
              </p>
              <p>
                El término &quot;Usuario&quot;, &quot;Usuarios&quot;
                &quot;Cliente&quot; y/o &quot;Titular&quot; se utilizará para
                hacer referencia en forma indistinta a toda persona que utilice
                el Sitio Knoott.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold my-4">2. FINALIDADES</h2>
            <div className="space-y-4">
              <p>
                Los Datos que se le solicitan son tratados con el objetivo de
                cumplimentar las siguientes finalidades:
              </p>
              <ol className="list-roman pl-6 space-y-2">
                <li>Para verificar su identidad y datos de contacto;</li>
                <li>
                  Para la individualización de la relación comercial a generarse
                  entre el Titular con el Responsable y puntualizar las
                  condiciones generales aceptadas entre las partes;
                </li>
                <li>El correcto envío de productos;</li>
                <li>
                  Para la correcta prestación de los servicios contratados;
                </li>
                <li>
                  Facilitar pagos, cobros, enviar recibos y/o facturas,
                  proporcionar productos (y enviarle información relacionada),
                  desarrollar nuevas funciones y mejoras a nuestros procesos,
                  prestar atención al cliente, desarrollar funciones de
                  seguridad, verificación de identidad, enviar actualizaciones
                  de productos y mensajes administrativos;
                </li>
                <li>
                  Realizar operaciones internas, lo que incluye, por ejemplo,
                  prevenir el fraude y el abuso de nuestra oferta de valor;
                </li>
                <li>Para utilizarse con fines comerciales y promocionales;</li>
                <li>
                  Para el envío de información comercial y publicitaria,
                  incluidos los envíos por correo electrónico u otro medio de
                  comunicación electrónica similar, impresa u otra que pueda
                  llegar a desarrollarse;
                </li>
                <li>
                  Para contactarlo en relación a cualquier información
                  correspondiente a los productos;
                </li>
                <li>
                  Para fines distintos que resulten compatibles o análogos a los
                  establecidos en dicho aviso, sin que para ello se requiera
                  obtener nuevamente el consentimiento del Titular.
                </li>
              </ol>
              <p>
                De forma adicional, hacemos de su conocimiento que sus DATOS
                podrán ser guardados y utilizados con fines mercadológicos, a
                fin de que podamos enviarle información relacionada con nuestros
                productos, invitarle a eventos que pudiéramos considerar de
                interés para usted, así como para compartirle ofertas y
                promociones de nuestro negocio.
              </p>
              <p>
                Sus DATOS podrán conservarse por el tiempo considerado como
                necesario a razón de cumplimentar con las obligaciones que el
                responsable pueda tener frente disposiciones legales como son
                fiscales, mercantiles o de cualquier otra índole que
                correspondan.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold my-4">3. DATOS OBTENIDOS</h2>
            <div className="space-y-4">
              <p>
                Recabamos sus datos personales a través del sitio web denominado
                &quot;KNOOTT&quot; (en lo sucesivo el &quot;Sitio&quot;), al
                momento en que realiza el pago de algún producto y/o servicio,
                se pone en contacto con el equipo, crea un usuario y contraseña,
                brinda sus propios datos para la obtención de promociones o
                descuentos, transmite información con otros usuarios a través
                del Sitio, entre otras actividades que impliquen el uso del
                Sitio. Los datos que obtenemos por estos medios pueden ser:
                Nombre, edad, domicilio, ubicación geográfica, correo
                electrónico, número de teléfono, datos financieros y/o cualquier
                contenido en el perfil del usuario.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold my-4">
              4. PROTECCIÓN DE DATOS
            </h2>
            <div className="space-y-4">
              <p>
                El Responsable declara que es su objetivo brindar la suficiente
                protección a los Datos Personales de sus clientes por lo que se
                llevarán a cabo medidas de seguridad, administrativas, técnicas
                y físicas para evitar su pérdida, alteración, destrucción, uso,
                acceso o divulgación indebida.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold my-4">5. DERECHOS ARCO</h2>
            <div className="space-y-4">
              <p>
                En cualquier momento usted podrá ejercer los derechos de Acceso,
                Rectificación, Cancelación u Oposición (los &quot;Derechos
                Arco&quot;) y revocar su consentimiento para el tratamiento de
                sus DATOS presentando una solicitud por medios electrónicos a la
                dirección soporte@knoott.com, en la que se cumpla lo siguiente:
              </p>
              <p>Dicha solicitud deberá contener por lo menos:</p>
              <ol className="list-[lower-alpha] pl-6 space-y-2">
                <li>Su nombre completo;</li>
                <li>
                  Los documentos que acrediten su identidad y/o personalidad o
                  la de su representante legal;
                </li>
                <li>
                  Indicar si la solicitud se presenta personalmente o a través
                  de su representante (para lo cual en su caso, deberá presentar
                  poder amplio cumplido y suficiente para el ejercicio de la
                  acción);
                </li>
                <li>Su domicilio;</li>
                <li>Su teléfono;</li>
                <li>
                  Indicar si acepta que las notificaciones que realicemos en
                  relación con su solicitud surtan efectos a través del correo
                  electrónico que nos proporcione;
                </li>
                <li>
                  La descripción clara y precisa de los DATOS respecto de los
                  que solicita ejercer alguno de los derechos ARCO;
                </li>
                <li>
                  En su caso, su manifestación expresa para revocar el
                  consentimiento al tratamiento de sus DATOS;
                </li>
                <li>
                  Cualquier otro elemento que facilite la localización de sus
                  DATOS (fecha en que se nos proporcionaron los Datos, número de
                  identificación del acto celebrado, persona que le haya
                  atendido, áreas involucradas, entre otros).
                </li>
              </ol>
              <p>
                El resto del procedimiento será tramitado conforme a los plazos
                y etapas establecidos en la LEY.
              </p>
              <p>
                Si el titular de los datos desea darse de baja de nuestras
                campañas mercadológicas en las que le enviamos información de
                nuestros productos, o desea optar por limitar el uso,
                transferencia o divulgación de sus DATOS puede enviarnos su
                solicitud a la dirección de correo electrónico
                soporte@knoott.com.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold my-4">6. CONSENTIMIENTO</h2>
            <div className="space-y-4">
              <p>
                Cuando sea aplicable, si no manifiesta su oposición para que sus
                DATOS sean tratados en los términos señalados en el presente
                AVISO, se entenderá que ha otorgado su consentimiento para ello.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold my-4">
              7. COOKIES Y WEB BEACONS
            </h2>
            <div className="space-y-4">
              <p>
                El Sitio se basa en el manejo de Cookies, Web Beacons y/o
                Tecnología Similar, buscando brindarte la mejor experiencia
                durante tu navegación, así como guardar información sobre tu
                acceso para mejorar la seguridad de tu cuenta, definir
                preferencias de contenido y personalizar información con base a
                los intereses de sus Usuarios o seguimiento a tus compras en
                línea.
              </p>
              <p>
                Las Cookies, Web Beacons y Tecnología Similar de el Sitio no
                pueden ser utilizados para recuperar datos de su disco duro,
                pasar virus a tu ordenador o capturar tu dirección de correo
                electrónico. Algunas de las funciones que las Cookies, Web
                Beacons y/o Tecnología Similar realizan también se pueden lograr
                mediante la tecnología alternativa, por tanto, se utiliza el
                término Cookies, web Beacons y/o Tecnología Similar en el
                presente AVISO.
              </p>
              <p>
                <strong>
                  A. Cookies, Web Beacons y/o Tecnología Similar Esenciales
                </strong>
              </p>
              <p>
                Estas Cookies, Web Beacons y/o Tecnología Similar son necesarias
                para el desempeño básico del Sitio; estas habilitan el sistema
                de autenticación y validación de forma segura, así como
                funciones de prevención de fraudes.
              </p>
              <p>
                Ejemplos de funciones esenciales de una cookie, web Beacons y/o
                tecnología similar:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  Identifica si un usuario ha iniciado una sesión segura de
                  manera íntegra.
                </li>
                <li>
                  Habilita la validación de un usuario y el manejo de las
                  funcionalidades del Sitio.
                </li>
                <li>
                  Almacena la autenticación y confirma la seguridad de una
                  sesión para los usuarios.
                </li>
                <li>
                  Habilitar funciones y/o herramientas de prevención de fraude.
                </li>
              </ul>
              <p>
                <strong>
                  B. Cookies, Web Beacons y/o Tecnología Similar de Desempeño
                </strong>
              </p>
              <p>
                Estas Cookies, Web Beacons y/o Tecnología Similar llevan un
                seguimiento de los segmentos más visitados, así como el uso de
                sitio web y sus enlaces. Esto permite a KNOOTT entender el
                contenido en el que los usuarios pueden estar más interesados.
                La información almacenada en estas Cookies, Web Beacons y/o
                Tecnología de desempeño no contiene datos personales y/o datos
                personales sensibles del usuario y es evaluada en términos de
                tráfico del sitio, no de la información contenida en el mismo.
              </p>
              <p>
                Ejemplos de funciones de desempeño de una cookie, web Beacons
                y/o tecnología similar:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  Permite el despliegue de diferentes versiones de un mismo
                  sitio, de esa manera podemos evaluar que diseño brinda la
                  mejor experiencia a nuestros usuarios.
                </li>
                <li>
                  Habilita el análisis de visitas, tales como el uso de
                  navegador, número de visitas, respuesta a campañas de mercadeo
                  y tendencias de adquisición.
                </li>
              </ul>
              <p>
                <strong>
                  C. Cookies, Web Beacons y/o Tecnología Similar de mercadeo
                </strong>
              </p>
              <p>
                Estas Cookies, Web Beacons y/o Tecnología Similar se aseguran de
                que el usuario reciba información relevante sobre beneficios y
                promociones exclusivos de el Sitio.
              </p>
              <p>
                Ejemplos de funciones de mercadeo de una cookie, web Beacons y/o
                tecnología similar:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  Habilita la comunicación de beneficios y/o mercadeo en línea
                  con el usuario de forma relevante.
                </li>
                <li>
                  Mantiene identificado al usuario de manera segura en sus
                  diferentes contenidos, para desplegar información
                  personalizada.
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold my-4">
              8. Configuración de Cookies, Web Beacons y/o Tecnología Similar en
              el sitio web de KNOOTT
            </h2>
            <div className="space-y-4">
              <p>
                Tienes la opción de restringir el uso de Cookies, Web Beacons
                y/o Tecnología Similar en tu navegador y aun así hacer uso del
                Sitio, sin embargo, al iniciar sesión en tu cuenta registrada
                esta podrá presentar problemas ya que una de las medidas de
                autenticación de nuestros Servicios es el uso de Cookies, Web
                Beacons y/o Tecnología Similar.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold my-4">
              9. QUEJAS Y DENUNCIAS
            </h2>
            <div className="space-y-4">
              <p>
                Si el titular de los derechos pudiese llegar a considerar que su
                derecho de Protección de Datos Personales ha sido lesionado en
                algún momento por alguna conducta de nuestro responsable o
                empleados; o llegase a presumir que en el tratamiento de sus
                DATOS existe alguna violación a las disposiciones previstas en
                la LEY, podrá interponer la queja o denuncia correspondiente
                ante el Instituto Nacional de Transparencia, Acceso a la
                Información y Protección de Datos Personales (&quot;INAI&quot;),
                para mayor información visite la página www.inai.org.mx.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold my-4">
              10. ACTUALIZACIÓN DEL AVISO
            </h2>
            <div className="space-y-4">
              <p>
                KNOOTT se reserva el derecho de modificar o complementar este
                AVISO en cualquier momento, mismo que se les dará a conocer a
                través del correo electrónico que los clientes proporcionen para
                tal efecto.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold my-4">11. CONTÁCTENOS</h2>
            <div className="space-y-4">
              <p>
                Si tiene preguntas sobre este Aviso, el manejo de sus Datos o
                información de nuestros productos, por favor contacte a nuestro
                encargado de Protección de Datos Personales al correo
                electrónico: soporte@knoott.com.
              </p>
            </div>
          </section>

          {/* <section className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-semibold text-center mb-6">
              AVISO DE PRIVACIDAD INTEGRAL
              <br />
              KNOOTT TECHNOLOGIES, S.A.P.I. DE C.V.
              <br />
              (Simplificado)
            </h2>
            <div className="space-y-4">
              <p>
                KNOOTT TECHNOLOGIES, S.A.P.I. DE C.V., ("KNOOTT"), con domicilio
                en Avenida presidente Carranza número 68, C.P. 27000, en el
                municipio de Torreón, Coahuila, es el responsable del uso y
                protección de sus datos personales, y al respecto le informamos
                que estos datos son tratados con el objetivo de cumplimentar las
                siguientes finalidades: i) para verificar su identidad y datos
                de contacto; ii) para la individualización de la relación
                comercial a generarse entre el Titular con el Responsable y
                puntualizar las condiciones generales aceptadas entre las
                partes; iii); el correcto envío de productos; iv) para la
                correcta prestación de los servicios contratados; v) facilitar
                pagos, cobros, enviar recibos y/o facturas, proporcionar
                productos (y enviarle información relacionada), desarrollar
                nuevas funciones y mejoras a nuestros procesos, prestar atención
                al cliente, desarrollar funciones de seguridad, verificación de
                identidad, enviar actualizaciones de productos y mensajes
                administrativos; vi) realizar operaciones internas, lo que
                incluye, por ejemplo, prevenir el fraude y el abuso de nuestra
                oferta de valor; vii) para utilizarse con fines comerciales y
                promocionales; viii) para el envío de información comercial y
                publicitaria, incluidos los envíos por correo electrónico u otro
                medio de comunicación electrónica similar, impresa u otra que
                pueda llegar a desarrollarse; ix) para contactarlo en relación a
                cualquier información correspondiente a los productos; x) para
                fines distintos que resulten compatibles o análogos a los
                establecidos en dicho aviso, sin que para ello se requiera
                obtener nuevamente el consentimiento del Titular.
              </p>
              <p>
                Adicionalmente, su información podrá ser utilizada con fines
                mercadológicos (envío de promociones, descuentos o beneficios;
                invitación a eventos o seminarios; envío de información sobre
                nuevos productos), por lo que, en caso de que no desee que sus
                datos personales sean tratados para estos fines adicionales,
                desde este momento usted nos puede comunicar lo anterior,
                presentando una solicitud por medios electrónicos a:
                soporte@knoott.com
              </p>
              <p>
                Para conocer mayor información sobre los términos y condiciones
                en que serán tratados sus datos personales, como los terceros
                con quienes compartimos su información personal y la forma en
                que podrá ejercer sus derechos ARCO, puede consultar el Aviso de
                Privacidad Integral en el sitio web www.knoott.com.
              </p>
            </div>
          </section> */}

          {/* <section className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-semibold text-center mb-6">
              AVISO DE PRIVACIDAD INTEGRAL
              <br />
              KNOOTT TECHNOLOGIES, S.A.P.I. DE C.V.
              <br />
              (Corto)
            </h2>
            <div className="space-y-4">
              <p>
                KNOOTT TECHNOLOGIES, S.A.P.I. DE C.V., ("KNOOTT"), con domicilio
                en Avenida presidente Carranza número 68, C.P. 27000, en el
                municipio de Torreón, Coahuila, es el responsable del uso y
                protección de sus datos personales, y al respecto le informamos
                que estos datos son tratados con el objetivo de cumplimentar las
                siguientes finalidades: i) para verificar su identidad y datos
                de contacto; ii) para la individualización de la relación
                comercial a generarse entre el Titular con el Responsable y
                puntualizar las condiciones generales aceptadas entre las
                partes; iii); el correcto envío de productos; iv) para la
                correcta prestación de los servicios contratados; v) facilitar
                pagos, cobros, enviar recibos y/o facturas, proporcionar
                productos (y enviarle información relacionada), desarrollar
                nuevas funciones y mejoras a nuestros procesos, prestar atención
                al cliente, desarrollar funciones de seguridad, verificación de
                identidad, enviar actualizaciones de productos y mensajes
                administrativos; vi) realizar operaciones internas, lo que
                incluye, por ejemplo, prevenir el fraude y el abuso de nuestra
                oferta de valor; vii) para utilizarse con fines comerciales y
                promocionales; viii) para el envío de información comercial y
                publicitaria, incluidos los envíos por correo electrónico u otro
                medio de comunicación electrónica similar, impresa u otra que
                pueda llegar a desarrollarse; ix) para contactarlo en relación a
                cualquier información correspondiente a los productos; x) para
                fines distintos que resulten compatibles o análogos a los
                establecidos en dicho aviso, sin que para ello se requiera
                obtener nuevamente el consentimiento del Titular.
              </p>
              <p>
                Para mayor información acerca del tratamiento de sus Datos
                Personales, usted puede acceder al Aviso de Privacidad Integral
                en el sitio web www.knoott.com.
              </p>
            </div>
          </section> */}
        </div>
      </div>
      <FooterWebsite />
    </main>
  );
};

export default PrivacyPolicyPage;
