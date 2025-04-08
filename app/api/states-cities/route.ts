import { NextResponse } from "next/server";

// Lista de estados de México
const mexicoStates = [
  "Aguascalientes",
  "Baja California",
  "Baja California Sur",
  "Campeche",
  "Chiapas",
  "Chihuahua",
  "Ciudad de México",
  "Coahuila",
  "Colima",
  "Durango",
  "Estado de México",
  "Guanajuato",
  "Guerrero",
  "Hidalgo",
  "Jalisco",
  "Michoacán",
  "Morelos",
  "Nayarit",
  "Nuevo León",
  "Oaxaca",
  "Puebla",
  "Querétaro",
  "Quintana Roo",
  "San Luis Potosí",
  "Sinaloa",
  "Sonora",
  "Tabasco",
  "Tamaulipas",
  "Tlaxcala",
  "Veracruz",
  "Yucatán",
  "Zacatecas",
];

// Mapa de ciudades principales por estado (simplificado para el ejemplo)
const citiesByState: Record<string, string[]> = {
  Aguascalientes: ["Aguascalientes", "Jesús María", "Calvillo"],
  "Baja California": ["Tijuana", "Mexicali", "Ensenada", "Rosarito", "Tecate"],
  "Baja California Sur": ["La Paz", "Los Cabos", "Comondú", "Loreto", "Mulegé"],
  Campeche: ["Campeche", "Ciudad del Carmen", "Champotón", "Escárcega"],
  Chiapas: [
    "Tuxtla Gutiérrez",
    "Tapachula",
    "San Cristóbal de las Casas",
    "Comitán",
  ],
  Chihuahua: ["Ciudad Juárez", "Chihuahua", "Delicias", "Cuauhtémoc", "Parral"],
  "Ciudad de México": [
    "Álvaro Obregón",
    "Azcapotzalco",
    "Benito Juárez",
    "Coyoacán",
    "Cuajimalpa",
    "Cuauhtémoc",
    "Gustavo A. Madero",
    "Iztacalco",
    "Iztapalapa",
    "Magdalena Contreras",
    "Miguel Hidalgo",
    "Milpa Alta",
    "Tláhuac",
    "Tlalpan",
    "Venustiano Carranza",
    "Xochimilco",
  ],
  Coahuila: ["Saltillo", "Torreón", "Monclova", "Piedras Negras", "Acuña"],
  Colima: ["Colima", "Manzanillo", "Tecomán", "Villa de Álvarez"],
  Durango: ["Durango", "Gómez Palacio", "Lerdo", "Santiago Papasquiaro"],
  "Estado de México": [
    "Ecatepec",
    "Nezahualcóyotl",
    "Toluca",
    "Naucalpan",
    "Tlalnepantla",
  ],
  Guanajuato: ["León", "Irapuato", "Celaya", "Salamanca", "Guanajuato"],
  Guerrero: ["Acapulco", "Chilpancingo", "Iguala", "Zihuatanejo", "Taxco"],
  Hidalgo: ["Pachuca", "Tulancingo", "Tula", "Huejutla", "Tepeji"],
  Jalisco: [
    "Guadalajara",
    "Zapopan",
    "Tlaquepaque",
    "Tonalá",
    "Puerto Vallarta",
  ],
  Michoacán: ["Morelia", "Uruapan", "Lázaro Cárdenas", "Zamora", "Apatzingán"],
  Morelos: ["Cuernavaca", "Jiutepec", "Cuautla", "Temixco", "Emiliano Zapata"],
  Nayarit: ["Tepic", "Bahía de Banderas", "Santiago Ixcuintla", "Compostela"],
  "Nuevo León": [
    "Monterrey",
    "Guadalupe",
    "Apodaca",
    "San Nicolás",
    "San Pedro Garza García",
  ],
  Oaxaca: [
    "Oaxaca de Juárez",
    "Tuxtepec",
    "Salina Cruz",
    "Juchitán",
    "Huajuapan",
  ],
  Puebla: [
    "Puebla",
    "Tehuacán",
    "San Martín Texmelucan",
    "Atlixco",
    "Teziutlán",
  ],
  Querétaro: ["Querétaro", "San Juan del Río", "Corregidora", "El Marqués"],
  "Quintana Roo": [
    "Cancún",
    "Chetumal",
    "Playa del Carmen",
    "Cozumel",
    "Tulum",
  ],
  "San Luis Potosí": [
    "San Luis Potosí",
    "Soledad",
    "Ciudad Valles",
    "Matehuala",
  ],
  Sinaloa: ["Culiacán", "Mazatlán", "Los Mochis", "Guasave", "Guamúchil"],
  Sonora: [
    "Hermosillo",
    "Ciudad Obregón",
    "Nogales",
    "San Luis Río Colorado",
    "Navojoa",
  ],
  Tabasco: [
    "Villahermosa",
    "Cárdenas",
    "Comalcalco",
    "Huimanguillo",
    "Macuspana",
  ],
  Tamaulipas: [
    "Reynosa",
    "Matamoros",
    "Nuevo Laredo",
    "Tampico",
    "Ciudad Victoria",
  ],
  Tlaxcala: ["Tlaxcala", "Apizaco", "Huamantla", "Chiautempan", "Zacatelco"],
  Veracruz: ["Veracruz", "Xalapa", "Coatzacoalcos", "Córdoba", "Poza Rica"],
  Yucatán: ["Mérida", "Valladolid", "Tizimín", "Progreso", "Umán"],
  Zacatecas: ["Zacatecas", "Fresnillo", "Guadalupe", "Jerez", "Río Grande"],
};

// Sectores o giros de negocio comunes
const businessSectors = [
  "Alimentos y Bebidas",
  "Moda y Ropa",
  "Electrónica y Tecnología",
  "Hogar y Decoración",
  "Salud y Belleza",
  "Deportes y Fitness",
  "Juguetes y Juegos",
  "Libros y Papelería",
  "Mascotas",
  "Joyería y Accesorios",
  "Artesanías",
  "Servicios Profesionales",
  "Educación y Formación",
  "Entretenimiento",
  "Turismo y Viajes",
  "Automotriz",
  "Construcción y Ferretería",
  "Agricultura",
  "Otro",
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const state = searchParams.get("state");

  if (type === "states") {
    return NextResponse.json({ states: mexicoStates });
  }

  if (type === "cities" && state) {
    const cities = citiesByState[state] || [];
    return NextResponse.json({ cities });
  }

  if (type === "sectors") {
    return NextResponse.json({ sectors: businessSectors });
  }

  return NextResponse.json({ error: "Parámetro inválido" }, { status: 400 });
}
