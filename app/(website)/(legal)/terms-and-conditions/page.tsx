import FooterWebsite from "@/components/universal/website/footer";
import { HeaderWebsite } from "@/components/universal/website/header-website";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import React from "react";

const TermsAndConditionsPage = async () => {
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
          CONTRATO DE ADHESIÓN DE COMERCIO ELECTRÓNICO
        </h1>
        <h2 className="text-2xl font-semibold text-center mb-6">
          (TÉRMINOS Y CONDICIONES)
        </h2>

        <div className="space-y-6 text-base">
          <p>
            Los presentes Términos y condiciones (los &quot;TÉRMINOS o
            CONTRATO&quot;) representan el acuerdo de voluntades entre KNOOTT
            TECHNOLOGIES, S.A.P.I. DE C.V., (&quot;KNOOTT&quot;) y cualquier
            usuario o persona (el &quot;CLIENTE O INVITADO&quot;) que utilice el
            sistema de información o plataforma denominada
            https://www.knoott.com (el &quot;SITIO&quot;) ya sea para navegar
            y/o realizar la compra de productos y/o servicios que por ese medio
            se ofertan; el cual se verá relacionado con estos Términos, mismos
            que regirán su acceso y uso del Sitio, así como las transacciones
            que se pudieren llevar a cabo mediante este.
          </p>

          <p>
            El SITIO es propiedad y responsabilidad de KNOOTT TECHNOLOGIES,
            S.A.P.I. DE C.V., quien cuenta con Registro Federal de
            Contribuyentes (RFC) KTE250318FK8, y con domicilio fiscal en
            Boulevard Centenario número 586, en la Colonia Santa Bárbara, en la
            Ciudad de Torreón, Coahuila, C.P.27105.
          </p>

          <p>
            KNOOTT es una sociedad mercantil debidamente constituida conforme a
            las leyes de los Estados Unidos Mexicanos, mediante Escritura
            Pública número 116, libro 3, celebrada ante el Notario Público
            Número 66, de la ciudad de Torreón, Coahuila, e inscrita con Folio
            Mercantil Electrónico N-2025020023 de fecha 24 de marzo de 2025.
          </p>

          <p>
            Al momento de hacer uso del SITIO para realizar la compra de LOS
            PRODUCTOS usted como persona física o moral se adhiere a los puntos
            que establece el presente Contrato de adhesión de Comercio
            Electrónico (en lo sucesivo el &quot;CONTRATO&quot;); por lo que
            KNOOTT y los CLIENTES O INVITADOS en conjunto serán denominados como
            LAS PARTES y se sujetan al tenor de lo siguiente:
          </p>

          <section>
            <h2 className="text-xl font-semibold my-4">I. DEFINICIONES</h2>
            <div className="space-y-4 pl-4">
              <p>
                <strong>A. SELLERS O TERCEROS PROVEEDORES.-</strong> Es la
                persona física o moral que tiene un acuerdo comercial con KNOOTT
                para comercializar sus productos, bienes o servicios en favor
                del CLIENTE O INVITADO utilizando el SITIO.
              </p>
              <p>
                <strong>B. INVITADO.-</strong> Es la persona física o moral que
                accede al SITIO con fines de consulta y/o compra de los
                Productos en favor del CLIENTE O INVITADO
              </p>
              <p>
                <strong>C. CLIENTE.-</strong> Es la persona física o moral que
                accede al SITIO con el propósito de generar una mesa de regalos
                para cualquier evento social.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold my-4">
              II. FUNDAMENTO LEGAL DEL CONTRATO
            </h2>
            <p>
              El presente CONTRATO fue elaborado con base a lo establecido por
              los artículos 1794 al 1859 del Código Civil Federal, artículos del
              89 al 95 del Código de Comercio, artículos 76 bis y 76 bis 1,
              artículos 85, 88 y 90 de la Ley Federal de Protección al
              Consumidor y bajo la recomendación de la Norma Mexicana
              NMX-COE-001-SCFI-2018, esto para garantizar, transparentar,
              informar y orientar correctamente, sobre la navegación, el uso y
              la transacción en el SITIO al CLIENTE O INVITADO.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold my-4">III. OBJETO</h2>
            <p>
              El CONTRATO regula las condiciones de uso del SITIO, así como los
              términos generales para la adquisición de cualquier producto o
              servicio ofrecido a través del SITIO y que el CLIENTE O INVITADO
              deberá observar.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold my-4">
              IV. CONSENTIMIENTO Y ACEPTACIÓN DEL CONTRATO
            </h2>
            <div className="space-y-4">
              <p>
                Para acceder al SITIO y realizar alguna transacción (compra de
                producto o servicio), el CLIENTE O INVITADO confirma que conoce
                el contenido y alcance del CONTRATO motivo por el cual entienden
                que este tiene el carácter de obligatorio y vinculante.
              </p>
              <p>
                Al momento en que el CLIENTE O INVITADO cree su CUENTA en el
                SITIO, se entiende que este mismo acepta los términos y
                condiciones que se describen en el clausulado del presente
                CONTRATO, o en caso de no crearse una cuenta, al momento en que
                éste de click en &quot;Pagar&quot;/ &quot;Contribuir&quot;
                alguno de los PRODUCTOS; por lo que en caso de no estar de
                acuerdo con lo aquí establecido, se deberá abstener de hacer uso
                del SITIO.
              </p>
              <p>
                Sin perjuicio de lo anterior, el CLIENTE O INVITADO contará con
                un lapso de 5 (cinco) días hábiles contados a partir de la firma
                del CONTRATO, para revocar su consentimiento sin responsabilidad
                alguna.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold my-4">
              V. CAPACIDAD PARA EL USO DEL SITIO
            </h2>
            <p>
              El uso del SITIO así como la compra de los PRODUCTOS sólo estarán
              disponibles para aquellas personas que cuenten con capacidad legal
              y de ejercicio para contratar, a través de sí mismo o mediante el
              tutor o representante legal que corresponda. Si usted está
              haciendo uso del SITIO como persona moral (empresa o entidad)
              deberá estar facultado por esta para llevar a cabo las
              transacciones en su nombre.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold my-4">VI. USO DEL PORTAL</h2>
            <div className="space-y-4">
              <p>
                El CLIENTE O INVITADO sólo podrá utilizar el SITIO para la
                adquisición de los PRODUCTOS, por lo que se obliga a abstenerse
                de utilizar el mismo con fines ilícitos o contrarios a lo
                establecido en este CONTRATO, que sean lesivos de derechos o de
                intereses de terceros, o que de cualquier forma puedan dañar,
                ciberatacar, inutilizar y/o hackear con el objeto de sobrecargar
                o deteriorar el SITIO y/o LOS PRODUCTOS.
              </p>
              <p>
                Es responsabilidad del CLIENTE O INVITADO verificar el
                certificado de seguridad HTTPS del dominio www.knoott.com, a
                efecto de confirmar la autenticidad del sitio que visitan.
              </p>
              <p>
                Con el objeto de asegurar las transacciones comerciales y evitar
                suplantaciones de identidad, KNOOTT podrá realizar y/o
                establecer medidas y/o mecanismos de seguridad que estime
                convenientes para verificar el perfil y/o datos del CLIENTE O
                INVITADO a través de procesos de autenticación, tales como:
              </p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>
                  <strong>Correo de Login (o acceso).-</strong> El CLIENTE O
                  INVITADO deberá proporcionar un correo electrónico y datos
                  personales para inicio de sesión en el SITIO.
                </li>
                <li>
                  <strong>Contraseña de Ingreso al SITIO.-</strong> El CLIENTE O
                  INVITADO deberá ingresar al SITIO mediante el uso de una
                  contraseña alfanumérica, dicha contraseña será de uso personal
                  y confidencial. El resguardo y uso de la contraseña será
                  responsabilidad del propio CLIENTE O INVITADO.
                </li>
                <li>
                  <strong>Verificación del Teléfono Asociado.-</strong> El
                  CLIENTE O INVITADO deberá ingresar al SITIO mediante el uso y
                  autenticación de códigos o frases de seguridad generadas en el
                  equipo móvil o teléfono asociado a la cuenta del CLIENTE O
                  INVITADO.
                </li>
                <li>
                  <strong>Documento oficial de identificación (INE).-</strong>{" "}
                  El CLIENTE O INVITADO deberá adjuntar una fotografía del
                  frente y reverso de su identificación oficial expedida por el
                  Instituto Nacional Electoral.
                </li>
                <li>
                  <strong>Fotografía frontal del rostro.-</strong> Se solicitará
                  que el CLIENTE O INVITADO adjunte una fotografía frontal del
                  rostro, con fines de cotejar con la identificación oficial
                  adjunta.
                </li>
              </ol>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold my-4">
              VII. CREACIÓN DE CUENTA
            </h2>
            <div className="space-y-4">
              <p>
                Para realizar compras en el SITIO, el CLIENTE O INVITADO deberá
                de realizar un registro para crear una cuenta (en lo sucesivo la
                &quot;CUENTA&quot;), proporcionando cierta información personal,
                la cual será resguardada de manera segura y confidencial. Dentro
                de la CUENTA el CLIENTE O INVITADO podrá asociar el método de
                pago de su preferencia para realizar sus compras y deberá
                proporcionar su Clave Bancaria Estandarizada (CLABE), o número
                de cuenta, según lo solicite el SITIO.
              </p>
              <p>
                KNOOTT sugiere al CLIENTE O INVITADO que antes de guardar su
                información personal verifiquen que esta sea correcta. Por lo
                anterior es responsabilidad del CLIENTE O INVITADO proporcionar
                datos claros y verídicos, así como de mantenerlos actualizados
                en todo momento. Durante el registro de la CUENTA se deberá de
                generar una contraseña de acceso de acuerdo al siguiente
                procedimiento:
              </p>
              <p>
                <strong>A. Generación de Contraseña.-</strong> Para completar el
                registro de la CUENTA el CLIENTE O INVITADO una vez asentados
                los datos requeridos en los formularios que correspondan, deberá
                de manera libre y confidencial generar una contraseña (en lo
                sucesivo la &quot;CONTRASEÑA&quot;) de acceso que será
                conformada por caracteres alfanuméricos. En este sentido, el
                CLIENTE O INVITADO será el único responsable por todas las
                actividades realizadas en la CUENTA con La CONTRASEÑA
                registrada.
              </p>
              <p>
                Cualquier uso no autorizado de la contraseña o cuenta deberá ser
                notificado por CLIENTE O INVITADO a KNOOTT de manera inmediata,
                ya que este no será responsable directa o indirectamente por
                cualquier pérdida o daño de cualquier tipo, que resulte en el
                uso negligente de la CUENTA por causas imputables al CLIENTE O
                INVITADO.
              </p>
              <p>
                En caso de que el CLIENTE O INVITADO ya cuente con un registro
                de cuenta en el SITIO, será indispensable que siga el proceso de
                autenticación o en su caso de inicio de sesión.
              </p>
              <p>
                En caso de robo o extravío de la CONTRASEÑA el CLIENTE O
                INVITADO podrá realizar su recuperación o reseteo de la
                siguiente manera:
              </p>
              <p>
                <strong>A. Restablecimiento de la Contraseña.-</strong> El
                CLIENTE O INVITADO deberá ingresar el correo electrónico
                establecido para el inicio de sesión en el SITIO, al cual se le
                enviará un código de restablecimiento de contraseña, el cual le
                permitirá establecer una nueva contraseña para su CUENTA.
              </p>
              <p>
                No obstante lo anterior, el CLIENTE O INVITADO tendrá la
                obligación de denunciar dicho robo o extravío ante las
                autoridades competentes, a efecto de acreditar tal circunstancia
                y poner a salvo sus derechos.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold my-4">
              VIII. TRATAMIENTO DE DATOS PERSONALES
            </h2>
            <div className="space-y-4">
              <p>
                El CLIENTE O INVITADO al navegar en el SITIO acepta el contenido
                y tratamiento de datos personales establecido en el Aviso de
                Privacidad de KNOOTT, el cual está disponible para consulta en
                (poner liga de acceso directo al Aviso de Privacidad), el cual
                aplica en todo momento para el uso del SITIO.
              </p>
              <p>
                En cualquier momento usted podrá ejercer su derecho de Acceso,
                Rectificación, Cancelación u Oposición (los &quot;DERECHOS
                ARCO&quot;) y revocar su consentimiento para el tratamiento de
                sus datos personales, presentando una solicitud por medios
                electrónicos a la dirección soporte@knoott.com, en la que se
                mencione lo siguiente:
              </p>
              <p>
                Dicha solicitud deberá contener por lo menos: (a) su nombre
                completo; (b) los documentos que acrediten su identidad y/o
                personalidad o la de su representante legal, (c) indicar si la
                solicitud se presenta personalmente o a través de su
                representante (para lo cual en su caso, deberá presentar poder
                amplio cumplido y suficiente para el ejercicio de la acción),
                (d) su domicilio fiscal, (e) su teléfono personal; (f) indicar
                si acepta que las notificaciones que realice KNOOTT en relación
                con su solicitud surtan efectos a través del correo electrónico
                que nos proporcione; (g) la descripción clara y precisa de los
                datos personales respecto de los que solicita ejercer alguno de
                los derechos ARCO, y (h), su manifestación expresa para revocar
                el consentimiento al tratamiento de sus datos personales;
              </p>
              <p>
                El resto del procedimiento será tramitado conforme a los plazos
                y etapas establecidos en la respectiva ley.
              </p>
              <p>
                Si el titular de los datos desea darse de baja de nuestras
                campañas mercadológicas en las que le enviamos información de
                nuestros PRODUCTOS, o desea optar por limitar el uso,
                transferencia o divulgación de sus datos personales, puede
                enviarnos su solicitud a la dirección de correo electrónico
                soporte@knoott.com.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold my-4">
              IX. PREVENCIÓN DE OPERACIONES CON RECURSOS DE PROCEDENCIA ILÍCITA
            </h2>
            <div className="space-y-4">
              <p>
                Con el fin de prevenir actos u operaciones con recursos de
                procedencia ilícita, el CLIENTE O INVITADO reconoce y acepta
                que, actuará en todo momento en cumplimiento de los preceptos e
                indicaciones establecidos por la Ley Federal para la Prevención
                e Identificación de Operaciones con Recursos de Procedencia
                Ilícita.
              </p>
              <p>
                De igual manera el CLIENTE O INVITADO deberá de cumplir, si así
                corresponde, con todas las obligaciones de identificación y
                reporte de actividades vulnerables previstas en la propia ley.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold my-4">
              X. COMUNICACIÓN ENTRE EL CLIENTE O INVITADO Y KNOOTT
            </h2>
            <p>
              Cuando el CLIENTE O INVITADO utilice el SITIO o envíe un correo
              electrónico o se comuniquen a través de cualquier vía de
              comunicación proporcionada por KNOOTT, en virtud del uso del
              SITIO, reconoce y acepta que se estarán comunicando
              electrónicamente con KNOOTT, por lo que podrán recibir
              comunicaciones electrónicas por nuestra de diversas formas.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold my-4">
              XI. DERECHOS DE PROPIEDAD INTELECTUAL
            </h2>
            <div className="space-y-4">
              <p>
                Todas las marcas registradas, logotipos, diseños, imágenes
                comerciales, imágenes, diseños, código, programación, sistemas,
                ilustraciones y avisos comerciales son propiedad intelectual de
                KNOOTT, sus proveedores o afiliados, y están debidamente
                protegidos en su favor, respectivamente, de conformidad con la
                legislación aplicable en materia de derechos de autor y/o de
                propiedad industrial.
              </p>
              <p>
                Por lo cual se prohíbe expresamente al CLIENTE O INVITADO
                utilizar, modificar, alterar o suprimir, ya sea en forma total o
                parcial, los avisos, marcas, nombres comerciales, señas,
                anuncios, logotipos o en general cualquier indicación que se
                refiera a la propiedad de información contenida en el SITIO.
              </p>
              <p>
                El CLIENTE O INVITADO no deberá infringir o violar ninguna
                medida tecnológica del mecanismo de seguridad que KNOOTT
                utilice, active o pueda utilizar o activar en el SITIO.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold my-4">
              XII. RECLAMACIONES SOBRE PROPIEDAD INTELECTUAL
            </h2>
            <p>
              KNOOTT reconoce y acepta los derechos de propiedad intelectual a
              favor de terceros, motivo por el cual en caso de que un tercero
              ajeno a KNOOTT, a su CLIENTE O INVITADO o bien a los SELLERS,
              considere que han sido violados sus derechos de propiedad
              intelectual, puede hacer del conocimiento de KNOOTT dicha
              violación mediante la notificación al correo electrónico de
              soporte@knoott.com para su atención y solución.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold my-4">XIII. MEDIOS DE PAGO</h2>
            <div className="space-y-4">
              <p>
                En la CUENTA se deberá de asociar una forma o medio de pago, a
                elección de CLIENTE O INVITADO para realizar las transacciones
                relativas a las compras o recepciones, en su caso, de los
                PRODUCTOS, por lo que este tiene la obligación de verificar que
                los datos registrados en los métodos de pago de la CUENTA sean
                los correctos, por tal razón dichos datos serán de su
                responsabilidad.
              </p>
              <p>
                Dentro de los medios de pago que podrán registrar, se encuentran
                los siguientes:
              </p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>
                  Tarjetas de crédito y/o débito pertenecientes a cualquier
                  institución bancaria mexicana o extranjera y autorizadas por
                  Visa, MasterCard o American Express.
                </li>
                <li>Apple Pay</li>
                <li>Google Pay</li>
              </ol>
              <p>
                <strong>A. Fallas con el Medio de Pago.-</strong> En caso de que
                existan fallas para procesar la compra de los PRODUCTOS en el
                SITIO, se notificará al CLIENTE O INVITADO de forma inmediata el
                impedimento para procesar su pago, a través de una notificación
                en su cuenta y/o vía correo electrónico registrado; y será este
                mismo quien tendrá siempre la obligación de contactar con el
                banco emisor de su tarjeta o tarjetas sobre dicha imposibilidad.
              </p>
            </div>
          </section>

          {/* Continue with the rest of the sections */}
          <section>
            <h2 className="text-xl font-semibold my-4">
              XIV. PRECIO DE LOS PRODUCTOS
            </h2>
            <div className="space-y-4">
              <p>
                Una vez que el CLIENTE O INVITADO seleccione los PRODUCTOS en el
                SITIO se podrá visualizar el monto total a pagar, la forma de
                pago de su elección y en su caso las promociones aplicables, por
                lo que el SITIO direccionará al CLIENTE O INVITADO al enlace,
                donde se deberán de ingresar los datos y medio de pago para
                poder procesar la compra.
              </p>
              <p>
                Todos los precios en el SITIO se encuentran en moneda nacional
                (pesos mexicanos) e incluyen los impuestos correspondientes, se
                recomienda al CLIENTE O INVITADO revisar el resumen de su
                transacción antes de finalizar la compra, para verificar la
                cantidad o precio a pagar y demás costos y/o cargos de los
                PRODUCTOS.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold my-4">XV. FACTURACIÓN</h2>
            <div className="space-y-4">
              <p>
                El CLIENTE O INVITADO que requiera la emisión de factura por su
                compra realizada deberá solicitar la misma en el SITIO al
                momento en que realice la compra mediante la dirección de correo
                electrónico soporte@knoott.com, para lo cual KNOOTT contará con
                los días naturales restantes del mes en curso para su emisión.
              </p>
              <p>
                En caso de que el CLIENTE O INVITADO no haga la solicitud de su
                factura al momento de la compra del PRODUCTO, solamente contará
                con los días naturales restantes del mes en curso para realizar
                su solicitud vía correo electrónico.
              </p>
              <p>
                Para la solicitud de la factura el CLIENTE O INVITADO deberá
                ingresar o enviar la siguiente información:
              </p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>
                  Nombre o razón/denominación social a la que se facturará.
                </li>
                <li>Ticket de compra (Código de Facturación).</li>
                <li>Constancia de Situación Fiscal.</li>
                <li>Correo electrónico.</li>
              </ol>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold my-4">
              XVI. CARACTERÍSTICAS DE LOS PRODUCTOS
            </h2>
            <div className="space-y-4">
              <p>
                Antes de realizar la compra de los PRODUCTOS en el SITIO, el
                CLIENTE O INVITADO deberá consultar el apartado de
                características y descripción para conocer con mayor detalle,
                las especificaciones y cualidades de los mismos. En caso de
                existir alguna duda en las características de los PRODUCTOS el
                CLIENTE O INVITADO podrá requerir mayor información a través de
                los distintos medios de contacto de servicio a usuarios de
                KNOOTT.
              </p>
              <p>
                Esto aplica de igual manera para los PRODUCTOS vendidos por los
                SELLERS, en donde las características e información técnica que
                se visualicen en el SITIO, serán una transcripción de lo que
                SELLER proporcione a KNOOTT.
              </p>
            </div>
          </section>

          {/* Continue with remaining sections */}
          <section>
            <h2 className="text-xl font-semibold my-4">
              XVII. PRECIOS Y PROMOCIONES EN EL PORTAL
            </h2>
            <div className="space-y-4">
              <p>
                Los precios y promociones de los PRODUCTOS que aparecen en el
                SITIO son temporales y exclusivos para ventas en el SITIO. Por
                lo que KNOOTT se reserva el derecho para poder modificarlos de
                acuerdo con sus objetivos sin necesidad de dar aviso previo al
                CLIENTE O INVITADO.
              </p>
              <p>
                Para toda promoción que se visualice en el portal, KNOOTT podrá
                establecer los propios términos y condiciones que le apliquen,
                sin perjuicio de lo que aquí se establece para el caso. Mismos
                que el CLIENTE O INVITADO deberá consultar previo a la compra de
                los PRODUCTOS.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold my-4">
              XVIII. VENTAS REALIZADAS POR SELLERS
            </h2>
            <div className="space-y-4">
              <p>
                KNOOTT permitirá que los SELLERS utilicen el SITIO para la
                promoción y venta de sus propios productos, sin embargo KNOOTT
                no será responsable ante cualquier daño o vicio oculto que los
                mismos puedan tener, por lo que el CLIENTE O INVITADO deberá
                contactar para dichos cambios o devoluciones al propio SELLER.
              </p>
              <p>
                En su carácter de intermediario, KNOOTT brindará las facilidades
                de compra y pago al CLIENTE O INVITADO en sus compras realizadas
                en el SITIO, sobre productos o servicios ofrecidos por SELLERS.
                Para efectos de la comunicación e intermediación de las compras,
                así como para apoyar la pronta solución en reclamaciones por
                inconformidades sobre los PRODUCTOS o la solicitud de garantías,
                KNOOTT pone a disposición del CLIENTE O INVITADO el proceso
                establecido en la siguiente cláusula.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold my-4">XIX. GARANTÍAS</h2>
            <div className="space-y-4">
              <p>
                Todos los PRODUCTOS comercializados en el SITIO cuentan con una
                garantía que cubre debidamente las fallas o defectos en los
                Productos. Dichas garantías cumplen con lo dispuesto en las
                Leyes Mexicanas o en su caso se apegan a cualquier otro
                reglamento o Norma Oficial Mexicana que apliquen de acuerdo a la
                naturaleza de cada producto que se trate.
              </p>
              <p>
                Para que la garantía proceda, el producto deberá presentar
                fallas o daños en la calidad, la marca o especificaciones bajo
                las cuales se haya ofrecido o pagado.
              </p>
              <p>
                Todo PRODUCTO ofrecido a través del SITIO, ya sea que los provea
                KNOOTT o los SELLERS, otorgará 90 días para que el CLIENTE O
                INVITADO pueda ejercerla sobre los productos o servicios, de
                acuerdo al párrafo que antecede.
              </p>
              <p>
                Las garantías se ejerceran, dependiendo del producto, de acuerdo
                a lo siguiente:
              </p>
              <p>
                <strong>A. Garantía sobre el producto de los SELLERS.-</strong>{" "}
                Los PRODUCTOS cuentan con una garantía emitida por los
                fabricantes, distribuidores, SELLERS o importadores, misma que
                cumple con la Ley Federal de Protección al Consumidor y las
                Normas Oficiales Mexicanas.
              </p>
              <p>
                La garantía se entregará con el producto y en ella se
                establecerán las condiciones, procedimientos, mecanismos,
                vigencia y medios de contacto para hacerlas efectivas. Es
                responsabilidad directa de los fabricantes, distribuidores,
                SELLERS o importadores, que sus productos cuenten con éstas.
              </p>
              <p>
                No obstante lo anterior, KNOOTT procederá a poner en contacto al
                CLIENTE con el SELLER, para llevar a cabo el proceso que
                enseguida se establece. Y a partir de este momento KNOOTT no
                tendrá mayor participación ni responsabilidad.
              </p>
              <p>
                <strong>B. Garantía sobre productos KNOOTT.-</strong> KNOOTT
                busca la satisfacción del CLIENTE O INVITADO, por lo cual, todo
                producto que sea ofrecido en el SITIO directamente por KNOOTT, y
                no coincida con las características publicadas en el SITIO,
                marca, especificaciones o contenga algún defecto de origen, el
                CLIENTE O INVITADO podrá solicitar el cambio, devolución y/o
                solicitar el reembolso del importe pagado de conformidad con lo
                establecido en la siguiente cláusula.
              </p>
              <p>
                En este sentido, el proceso deberá realizarse a través del
                propio portal, siempre y cuando los PRODUCTOS no hayan sido
                utilizados, alterados o personalizados.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold my-4">
              XX. CAMBIOS, DEVOLUCIONES Y CANCELACIONES SOBRE PRODUCTOS KNOOTT
            </h2>
            <div className="space-y-4">
              <p>En caso de que el CLIENTE reciban un producto que:</p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>
                  No corresponda en cuanto a la características, marca,
                  especificaciones y demás elementos sustanciales bajo los
                  cuales se haya ofrecido en el SITIO.
                </li>
                <li>
                  Cuente con algún defecto de origen imputable a KNOOTT o a los
                  SELLERS.
                </li>
              </ol>
              <p>
                Entiéndase como defecto de origen todo aquel que impida que el
                producto sea utilizado de forma normal y sin complicaciones,
                para lo cual fue creado
              </p>
              <p>
                Podrán solicitar el cambio, la devolución y/o cancelación a
                KNOOTT, tratándose de productos ofrecidos por estos, para que se
                realice el proceso correspondiente. La procedencia de la
                devolución, cambio y/o cancelación sobre los PRODUCTOS
                adquiridos estará sujeta a una revisión previa de KNOOTT.
              </p>
              <p>
                En caso de que si proceda el cambio, devolución y/o cancelación
                en razón de cualquiera de las opciones anteriormente
                mencionadas, se estará a lo siguiente:
              </p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>
                  <strong>Devolución de mercancía.-</strong> Al agendar una
                  recolección o presentar el artículo en bodega de KNOOTT, el
                  CLIENTE deberá mostrar el artículo adquirido y exhibir la
                  confirmación de compra enviada por correo electrónico.
                </li>
                <li>
                  <strong>Revisión de los productos.-</strong> KNOOTT una vez
                  que reciba el PRODUCTO deberá revisarlo para determinar
                  efectivamente la causa que generó el cambio o devolución de la
                  compra, y confirmar el daño o falla que el CLIENTE manifieste,
                  para lo cual contará con 10 días hábiles, debiendo informar
                  sobre el estatus del mismo al CLIENTE al término del plazo.
                </li>
                <li>
                  <strong>Estado y condiciones.-</strong> Los PRODUCTOS deberán
                  encontrarse en buenas condiciones, sin daños ocasionados por
                  su uso y/o instalación, para poder llevar a cabo el cambio o
                  devolución, quedando fuera de posibilidad cualquier cambio o
                  devolución en los siguientes casos, de manera enunciativa más
                  no limitativa:
                  <ol className="list-[lower-alpha] pl-6 space-y-1 mt-2">
                    <li>
                      Si los PRODUCTOS fueron manipulados por terceros no
                      autorizados;
                    </li>
                    <li>
                      Por uso inadecuado o distinto al especificado en el manual
                      e instrucciones;
                    </li>
                    <li>
                      Por daños ocasionados en la instalación o configuración
                      inadecuada de los PRODUCTOS;
                    </li>
                    <li>
                      Por daños ocasionados por la conexión o configuración
                      inadecuada en el dispositivo electrónico en el que se
                      descargue o instale el PRODUCTO;
                    </li>
                    <li>
                      Cuando se hayan ocasionado o presentado descargas
                      eléctricas en los PRODUCTOS;
                    </li>
                    <li>
                      Cuando se hayan utilizado, instalado o implementado partes
                      no manufacturadas/autorizadas por el fabricante en los
                      PRODUCTOS.
                    </li>
                  </ol>
                </li>
              </ol>
              <p>
                En todos los casos donde se haga efectiva la devolución en
                términos de los incisos 1 y 2 de la presente cláusula, el
                CLIENTE podrá optar por seleccionar algún otro producto, o la
                devolución del importe pagado.
              </p>
              <p>
                En caso de optar por otro producto, este no podrá ser de mayor
                valor al adquirido y objeto de cambio, y tratándose del caso en
                que el nuevo producto sea de menor valor, se notificará y
                devolverá al CLIENTE la diferencia a su favor, por medio del
                método de pago utilizado para la compra o el establecido en su
                CUENTA.
              </p>
            </div>
          </section>

          {/* Continue with remaining sections */}
          <section>
            <h2 className="text-xl font-semibold my-4">
              XXI. DISPONIBILIDAD DE LOS PRODUCTOS
            </h2>
            <div className="space-y-4">
              <p>
                La disponibilidad e inventario que aparecen en el SITIO son
                temporales y exclusivos y podrán ser modificados a discreción de
                KNOOTT, y serán visibles al momento de realizar la compra y
                antes de concluir la misma, adicionalmente una vez concretada la
                compra, el CLIENTE O INVITADO podrá consultar la fecha de
                entrega en su correo electrónico o directamente en el SITIO.
              </p>
              <p>
                En caso de que los PRODUCTOS tengan la leyenda y/o aviso de
                compra &quot;Bajo Pedido&quot;, el CLIENTE se sujetará a las
                siguientes condiciones que se describen a continuación:
              </p>
              <p>
                <strong>
                  A. Condiciones y Disponibilidad de Productos Bajo Pedido.-
                </strong>{" "}
                La modalidad de compra de productos &quot;Bajo Pedido&quot;, es
                un servicio que KNOOTT brinda al CLIENTE O INVITADO, en la
                compra de aquellos PRODUCTOS que forman parte de su catálogo
                extendido, mismos que son identificados de manera visible con
                una etiqueta o señalizados con carteles en el SITIO para su
                fácil identificación.
              </p>
              <p>
                Dichos productos refieren a aquellas mercancías que requieren de
                un proceso de elaboración mayor a 30 días hábiles. En ese
                sentido el CLIENTE O INVITADO deberá estar de acuerdo con las
                presentes condiciones antes de realizar su compra.
              </p>
              <p>
                El tiempo de entrega de los PRODUCTOS bajo pedido, le será
                informado al CLIENTE O INVITADO dentro de los 7 (siete) días
                hábiles posteriores a la compra, a través del SITIO o por medio
                del correo electrónico establecido en su CUENTA o el registrado
                al finalizar la compra.
              </p>
              <p>
                La fecha de entrega de los PRODUCTOS &quot;Bajo pedido&quot; en
                ningún caso podrá exceder de 90 (noventa) días hábiles
                posteriores a partir de la compra.
              </p>
              <p>
                Asimismo, el CLIENTE O INVITADO podrá solicitar en cualquier
                momento el estatus de su pedido, a través de nuestros canales de
                contacto:
              </p>
              <ol className="list-[upper-alpha] pl-6 space-y-1">
                <li>Teléfono:</li>
                <li>WhatsApp:</li>
                <li>Correo electrónico: soporte@knoott.com</li>
                <li>El Portal: www.knoott.com</li>
              </ol>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold my-4">
              XXII. ENTREGA DE LOS PRODUCTOS
            </h2>
            <div className="space-y-4">
              <p>
                Para todo lo relativo al tiempo y forma de entrega de los
                PRODUCTOS se estará a lo siguiente:
              </p>
              <p>
                <strong>A. Tiempo de Entrega.-</strong> El tiempo de entrega de
                los PRODUCTOS se determinará en razón de la naturaleza de estos,
                así como de su forma de pago, por lo cual se informará al
                CLIENTE al momento de realizar la compra, o en su caso, 4
                (cuatro) días hábiles posteriores a la compra del mismo, a
                través del SITIO o por medio del correo electrónico establecido
                en su CUENTA.
              </p>
              <p>
                Por lo anterior, el CLIENTE reconoce y acepta que antes de
                realizar la compra de los PRODUCTOS, se cerciorará previamente
                de la fecha de entrega que el SITIO le proporcione, en el
                entendido de que si realiza la compra del producto es en razón
                de que está de acuerdo con el tiempo de entrega informado; y
                para cuando se le notifique vía correo electrónico, contará con
                1 (un) día hábil para realizar la cancelación en caso de
                inconformidad con el tiempo.
              </p>
              <p>
                <strong>B. Seguimiento al Envío.-</strong> Al momento de
                realizar la compra se generará un número de orden de envío o
                guía de envío, mismo que será enviada al CLIENTE mediante el
                correo electrónico establecido en su CUENTA, quien podrá darle
                seguimiento a su envío a través del SITIO o en la pagina web del
                tercero contratado.
              </p>
              <p>
                Al efectuar la entrega de los PRODUCTOS, tanto KNOOTT como los
                SELLERS se sujetarán a lo siguiente:
              </p>
              <p>
                <strong>C. Formas de Entrega</strong>
              </p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>
                  <strong>Mensajería y/o paquetería.-</strong> Los PRODUCTOS
                  serán enviados mediante mensajería interna o mediante
                  cualquier tercero contratado para efectuar el servicio,
                  debiéndose entregar al domicilio indicado en la CUENTA del
                  CLIENTE.
                  <p className="mt-2">
                    En caso de que el producto adquirido genere algún costo de
                    envío, dicho monto será informado durante el proceso de
                    compra y previo a la conclusión de la misma. Lo anterior lo
                    podrá verificar el CLIENTE en el resumen de la transacción
                    correspondiente.
                  </p>
                </li>
                <li>
                  <strong>Productos electrónicamente descargables.-</strong>{" "}
                  Esta clase de productos serán descargables por medio de la
                  liga o enlace que se envíe al correo electrónico establecido
                  por el CLIENTE.
                </li>
              </ol>
              <p>
                La responsabilidad de los PRODUCTOS correrá por cuenta de los
                SELLERS y KNOOTT, cada uno respectivamente de sus PRODUCTOS,
                hasta el momento en que se entreguen al CLIENTE. Una vez
                confirmada la fecha de entrega se realizarán un máximo de 3
                intentos de entrega en el domicilio señalado por el CLIENTE.
              </p>
              <p>
                Para la entrega de todo producto el procedimiento será el
                siguiente:
              </p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>
                  Los PRODUCTOS deberán ser entregados emplayados y
                  empaquetados, y deberán contener los datos del destinatario,
                  entre ellos su nombre y su dirección de entrega.
                </li>
                <li>
                  Los PRODUCTOS serán entregados en el domicilio que el CLIENTE
                  haya establecido para la entrega de los mismos. Por ello es
                  importante que al momento de la compra el CLIENTE proporcione
                  o confirme el domicilio correcto donde recibirá su producto.
                </li>
                <li>
                  La entrega se realizará con la persona que se encuentre en el
                  domicilio, independientemente de si los recibe el CLIENTE o
                  no.
                </li>
                <li>
                  Al momento de la entrega/recepción de los PRODUCTOS el
                  personal encargado de la entrega podrá solicitar el nombre de
                  la persona con la que se entiende esta, así como una
                  identificación para corroborar.
                </li>
                <li>
                  El personal encargado de la entrega podrá tomar fotografías
                  del producto al momento de la entrega, con la finalidad de
                  confirmar las condiciones de éste.
                </li>
                <li>
                  Al momento de la entrega, la persona con quien se entiende
                  esta o la que se encuentre en el domicilio en ese momento,
                  deberá firmar acuse de recibo, el cual podrá ser en boleta
                  física o de manera digital, a través del dispositivo
                  electrónico con que cuenta el personal encargado de la
                  entrega.
                </li>
                <li>
                  El CLIENTE en todo momento podrá solicitar el desemplaye o
                  desempaque del PRODUCTO, a efecto de comprobar las condiciones
                  de entrega. Cuando la persona que reciba la mercancía
                  manifieste alguna inconformidad, deberá solicitar al personal
                  encargado de la entrega que asiente la misma en su boleta y/o
                  dispositivo electrónico.
                  <p className="mt-2">
                    En caso de que el receptor de la mercancía no manifieste
                    inconformidad alguna, la entrega se entenderá como
                    plenamente satisfecha.
                  </p>
                </li>
              </ol>
              <p>
                En caso de que los KNOOTT o el SELLER excedan del tiempo de
                entrega establecido, deberán notificar al CLIENTE sobre el mismo
                y expresar las causas que justifiquen dicho retraso.
              </p>
              <p>
                Las causas justificables para el retraso en la entrega de los
                productos serán las siguientes:
              </p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>
                  Accidente vial en el que se vea involucrada la unidad de
                  transporte que contenga la mercancía.
                </li>
                <li>
                  Recepción de producto dañado de fábrica o con defectos físicos
                  que impidan su entrega en condiciones adecuadas.
                </li>
                <li>
                  La ocurrencia de caso fortuito o fuerza mayor, en los términos
                  previstos por el Código Civil Federal.
                </li>
                <li>
                  El transcurso de días inhábiles, entendiéndose por tales
                  aquellos en los que, por disposición legal o por causas
                  operativas justificadas, no sea posible realizar la entrega de
                  los productos.
                </li>
                <li>
                  Retrasos aduanales o retención de mercancía por autoridades,
                  en caso de envíos internacionales o sujetos a revisión.
                </li>
                <li>
                  Fallas operativas del transportista externo, si el servicio se
                  subcontrata y el proveedor sufre una interrupción operativa no
                  previsible.
                </li>
                <li>
                  Bloqueos de vías, manifestaciones o cierre de rutas, que
                  impidan el tránsito normal de vehículos de transporte.
                </li>
                <li>
                  Errores imputables al cliente, como datos de envío
                  incorrectos, destinatario ausente o negativa de recepción.
                </li>
                <li>
                  Fallas técnicas o mecánicas imprevistas en los vehículos de
                  reparto, siempre que se justifiquen y se atiendan con
                  prontitud.
                </li>
                <li>
                  Medidas gubernamentales extraordinarias, como restricciones de
                  movilidad, toques de queda o cierres sanitarios.
                </li>
                <li>
                  Paros laborales o huelgas legales del personal de la empresa o
                  de terceros que intervengan en la cadena logística.
                </li>
              </ol>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold my-4">
              XXIII. ENTREGA DE PRODUCTOS DESCARGABLES ELECTRÓNICAMENTE
            </h2>
            <div className="space-y-4">
              <p>
                Los PRODUCTOS que sean comprados y/o adquiridos por el CLIENTE
                en formato digital, serán enviados por KNOOTT o el SELLER al
                correo electrónico que se haya establecido en la CUENTA,
                contando con un plazo de 5 (cinco) para proporcionar el medio de
                descarga del mismo.
              </p>
              <p>
                Es única y exclusiva responsabilidad del CLIENTE proporcionar
                los datos correctos para la recepción del PRODUCTO electrónico,
                por lo cual el CLIENTE deberá de verificar los mismos antes de
                concluir la compra. KNOOTT no se hace responsable de la descarga
                realizada por terceros ajenos y/o autorizados por el CLIENTE.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold my-4">
              XXIV. RETIROS MONETARIOS SOBRE LA CUENTA
            </h2>
            <div className="space-y-4">
              <p>
                Dentro de las opciones que el CLIENTE tiene para disponer de los
                bienes que los INVITADOS le hayan hecho llegar por medio del
                SITIO, existe la opción de realizar retiro de dinero (pesos
                mexicanos) a discreción delCLIENTE, pero única y exclusivamente
                sobre los montos que ya se hayan reflejado en su CUENTA.
              </p>
              <p>
                Toda transacción efectuada para retirar dinero del SITIO,
                conllevará el cobro de una comisión que KNOOTT establecerá
                dentro del SITIO a su propia discreción. Pudiendo variar entre
                productos y servicios.
              </p>
              <p>
                La solicitud de retiro de dinero se llevará a cabo siempre a
                través del SITIO, en donde una vez que el CLIENTE seleccione la
                cantidad a disponer, KNOOTT se obliga a autorizar/realizar dicha
                transacción a la cuenta bancaria que se haya establecido y en un
                plazo máximo de 5 días hábiles, contados a partir de que se
                confirme la solicitud de retiro.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold my-4">
              XXV. CARGOS POR SERVICIOS
            </h2>
            <p>
              Toda transacción realizada por medio del SITIO, ya sea por el
              CLIENTE O INVITADO, al momento de comprar cualquier producto,
              contribuir a alguna mesa de regalo, o efectuar un retiro de
              dinero, será objeto de un cargo por servicio, mismo que
              establecerá KNOOTT en el SITIO. Reservandose el derecho de poder
              modificarlo a su propia discreción y sin notificación previa al
              CLIENTE O INVITADO.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold my-4">
              XXVI. COMPRAS CON OBSEQUIO Y VARIOS PRODUCTOS
            </h2>
            <p>
              En caso de haber adquirido más de un artículo dentro de una misma
              operación, es probable que los artículos sean entregados por
              separado en distintos momentos, para lo cual se contactará al
              CLIENTE O INVITADO mediante los canales de comunicación
              proporcionados al momento de la compra con la finalidad de
              informar sobre las entregas de los mismos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold my-4">
              XXVII. MECANISMOS DE ACLARACIÓN Y RECLAMACIONES
            </h2>
            <div className="space-y-4">
              <p>
                KNOOTT pone a disposición los siguientes medios de contacto para
                que el CLIENTE O INVITADO pueda presentar cualquier duda,
                aclaración o reclamación, en razón de los posibles conflictos
                que pudieran derivar de la compra de los Productos y del uso del
                SITIO. Por lo cual los CLIENTES O INVITADOS podrán contactarse
                con KNOOTT a través de las formas de contacto que se mencionan a
                continuación:
              </p>
              <ol className="list-decimal pl-6 space-y-1">
                <li>Teléfono:</li>
                <li>WhatsApp:</li>
                <li>Correo electrónico: soporte@knoott.com</li>
                <li>El Portal: www.knoott.com</li>
              </ol>
              <p>
                En un horario de atención de 9:00 a.m. a 7:00 p.m. de Lunes a
                Domingo.
              </p>
              <p>
                KNOOTT deberá dar respuesta por escrito al CLIENTE O INVITADO
                dentro un plazo máximo de 72 horas hábiles posteriores al
                ingreso de la solicitud efectuada. La respuesta correspondiente
                deberá ser emitida al correo electrónico que el CLIENTE O
                INVITADO proporcionó para tal efecto.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold my-4">
              XXVIII. INDEMNIZACIÓN POR MAL USO DEL PORTAL
            </h2>
            <p>
              Si cualquiera de las PARTES realiza un mal uso del SITIO y causa
              daño o perjuicio de la otra, la parte afectada deberá ser
              indemnizada y sacada en paz y salvo de toda responsabilidad.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold my-4">
              XXIX. CASO FORTUITO Y FUERZA MAYOR
            </h2>
            <div className="space-y-4">
              <p>
                Las PARTES no serán responsables en un evento por caso fortuito
                o fuerza mayor, que afecte a los sistemas y/o procesos del SITIO
                ni estarán obligados a pagar una indemnización por cualquier
                tipo de falla, pérdida o daño derivado por la falta de
                disponibilidad de los PRODUCTOS por causa de un evento de caso
                fortuito o fuerza mayor.
              </p>
              <p>
                Asimismo, en caso de una declaratoria de caso fortuito o fuerza
                mayor emitida por alguna autoridad competente u órgano de
                gobierno con motivo de la propagación de una enfermedad,
                epidemia o pandemia, KNOOTT no será responsable por la falta o
                retraso en la entrega de los PRODUCTOS en virtud de la
                afectación de la movilidad, economía o labores, ya sea en México
                y/o en el extranjero.
              </p>
              <p>
                Por lo anterior KNOOTT y los CLIENTES O INVITADOS podrán
                suspender temporalmente en algunos casos, la aplicación de los
                términos y condiciones establecidos en el CONTRATO con motivo
                del caso fortuito o fuerza mayor que se trate. No obstante lo
                anterior KNOOTT hará sus mejores esfuerzos para avisar en su
                oportunidad y a la brevedad posible, dicho suceso por cualquier
                medio, ya sea de forma física y/o electrónica la manera en la
                que estará reanudando operaciones para cumplir con el objeto del
                CONTRATO, asimismo los CLIENTES O INVITADOS deberán de comunicar
                en su oportunidad a KNOOTT a través de los canales de
                comunicación establecidos, cualquier circunstancia derivada del
                caso fortuito o fuerza mayor, que les impida dar cumplimiento al
                CONTRATO.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold my-4">
              XXX. JURISDICCIÓN Y COMPETENCIA
            </h2>
            <p>
              La Procuraduría Federal del Consumidor es competente en la vía
              administrativa para resolver cualquier controversia que se suscite
              sobre la interpretación o cumplimiento del presente CONTRATO. Sin
              perjuicio de lo anterior, las partes se someten a la jurisdicción
              y competencia de los tribunales de la Ciudad de Torreón, Coahuila,
              razón por la cual los CLIENTES O INVITADOS y KNOOTT renuncian en
              este acto a cualquier fuero que pudiera corresponderles en razón
              de sus domicilios presentes y/o futuros o por cualquier otra
              causa.
            </p>
          </section>
        </div>
      </div>
      <FooterWebsite />
    </main>
  );
};

export default TermsAndConditionsPage;
