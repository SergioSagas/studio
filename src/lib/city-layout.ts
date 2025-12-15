// Este archivo define una representación detallada de la conectividad de la ciudad.
// La IA utilizará esta información para entender cómo se relacionan las ubicaciones,
// sus tipos, y las distancias para generar recomendaciones de rutas más lógicas.

type Location = {
  tipo: string;
  coordenadas?: { lat: number; lng: number; };
};

type Locations = {
  [key: string]: Location;
};


export const cityData: { Mapa_Base_Nuevo_Chimbote: { ubicaciones: Locations, conexiones: any } } = {
  "Mapa_Base_Nuevo_Chimbote": {
    "ubicaciones": {
      "Plaza Mayor de Nuevo Chimbote": { "tipo": "Plaza / centro urbano", "coordenadas": { "lat": -9.122095, "lng": -78.531126 } },
      "Municipalidad Distrital de Nuevo Chimbote": { "tipo": "Entidad municipal / centro administrativo" },
      "Catedral Nuestra Señora del Carmen y San Pedro Apóstol": { "tipo": "Iglesia / monumento" },
      "Óvalo de la Familia": { "tipo": "Rotonda / intersección vial", "coordenadas": { "lat": -9.128450, "lng": -78.516868 } },
      "Buenos Aires": { "tipo": "Urbanización / zona central" },
      "Playa Atahualpa": { "tipo": "Playa / costa" },
      "Malecón Grau": { "tipo": "Malecón / paseo costero" },
      "I.E. Inmaculada de la Merced": { "tipo": "Institución educativa" },
      "Bellamar": { "tipo": "Urbanización" },
      "Los Héroes": { "tipo": "Urbanización" },
      "Casuarinas": { "tipo": "Urbanización" },
      "Nicolás Garatea": { "tipo": "Urbanización" },
      "El Pacífico": { "tipo": "Urbanización costera / zona residencial" },
      "La Caleta": { "tipo": "Zona costera / caleta" },
      "Santa Rosa": { "tipo": "Urbanización" },
      "Villa María": { "tipo": "Zona urbana / humedales adyacentes" },
      "3 de Octubre": { "tipo": "Asentamiento humano (AA.HH.)" },
      "Villa Hermosa": { "tipo": "Asentamiento humano (AA.HH.)" },
      "Teresa de Calcuta": { "tipo": "Asentamiento humano (AA.HH.)" },
      "Los Constructores": { "tipo": "Asentamiento humano (AA.HH.)" },
      "Los Jardines": { "tipo": "Asentamiento humano (AA.HH.)" },
      "El Acuario": { "tipo": "Asentamiento humano / zona costera" },
      "15 de Abril": { "tipo": "Asentamiento humano (AA.HH.)" },
      "Las Delicias": { "tipo": "Asentamiento humano (AA.HH.)" },
      "Parque Industrial 27 de Octubre": { "tipo": "Zona industrial" },
      "Parque Industrial El Satélite": { "tipo": "Zona industrial" },
      "Mercado Buenos Aires": { "tipo": "Mercado / centro comercial" },
      "Universidad Nacional del Santa (UNS)": { "tipo": "Universidad / educación superior" },
      "Universidad San Pedro": { "tipo": "Universidad / educación superior" },
      "Instituto Superior Tecnológico Carlos Salazar Romero": { "tipo": "Instituto superior / educación técnica" },
      "CETPRO Nuevo Chimbote": { "tipo": "Centro de educación técnica / formación profesional" },
      "Hospital Regional Eleazar Guzmán Barrón": { "tipo": "Hospital / salud" },
      "Centro de Salud Buenos Aires": { "tipo": "Centro de salud" },
      "Centro de Salud Villa María": { "tipo": "Centro de salud" },
      "Clínicas Particulares (varias)": { "tipo": "Clínicas privadas / salud" },
      "Playa El Dorado": { "tipo": "Playa / costa" },
      "Playa Los Pescadores": { "tipo": "Playa / costa" },
      "Parque 21 de Abril": { "tipo": "Parque / espacio recreativo" },
      "Complejo Deportivo Casuarinas": { "tipo": "Complejo deportivo" },
      "Vía de Evitamiento": { "tipo": "Carretera / vía principal" },
      "Av. Pacífico": { "tipo": "Avenida principal / eje vial" },
      "Av. Anchoveta": { "tipo": "Avenida secundaria / conexión costera" },
      "Av. José Pardo": { "tipo": "Avenida principal / eje urbano" },
      "Comisaría Buenos Aires": { "tipo": "Comisaría / seguridad pública" },
      "Comisaría Villa María": { "tipo": "Comisaría / seguridad pública" },
      "SEDACHIMBOTE (Planta de Agua)": { "tipo": "Planta de agua / servicio público" },
      "SERENAZGO Nuevo Chimbote": { "tipo": "Servicio de serenazgo / seguridad pública" },
      "Estadio Centenario": { "tipo": "Estadio / instalaciones deportivas" },
      "Las Loberas del Ferrol": { "tipo": "Zona costera / punto natural" },
      "Isla Blanca": { "tipo": "Isla / punto costero" },
      "Playa Caleta Colorada": { "tipo": "Playa / costa" },
      "La Poza": { "tipo": "Zona costera / poza" },
      "Caleta Colorada": { "tipo": "Caleta / playa costera" },
      "Besique": { "tipo": "Playa / costa" },
      "Las Conchuelas": { "tipo": "Zona costera / pequeñas caletas" }
    },
    "conexiones": {
      "Plaza Mayor de Nuevo Chimbote": [
        { "lugar": "Municipalidad Distrital de Nuevo Chimbote", "dist": 0.2 },
        { "lugar": "Catedral Nuestra Señora del Carmen y San Pedro Apóstol", "dist": 0.1 },
        { "lugar": "Óvalo de la Familia", "dist": 0.7 }
      ],
      "Municipalidad Distrital de Nuevo Chimbote": [
        { "lugar": "Plaza Mayor de Nuevo Chimbote", "dist": 0.2 },
        { "lugar": "Óvalo de la Familia", "dist": 0.6 },
        { "lugar": "Buenos Aires", "dist": 1.0 }
      ],
      "Catedral Nuestra Señora del Carmen y San Pedro Apóstol": [
        { "lugar": "Plaza Mayor de Nuevo Chimbote", "dist": 0.1 },
        { "lugar": "Óvalo de la Familia", "dist": 0.6 }
      ],
      "Óvalo de la Familia": [
        { "lugar": "Plaza Mayor de Nuevo Chimbote", "dist": 0.7 },
        { "lugar": "Municipalidad Distrital de Nuevo Chimbote", "dist": 0.6 },
        { "lugar": "Av. José Pardo", "dist": 0.8 },
        { "lugar": "Buenos Aires", "dist": 1.2 }
      ],
      "Buenos Aires": [
        { "lugar": "Municipalidad Distrital de Nuevo Chimbote", "dist": 1.0 },
        { "lugar": "Óvalo de la Familia", "dist": 1.2 },
        { "lugar": "Bellamar", "dist": 1.5 },
        { "lugar": "Playa Atahualpa", "dist": 2.2 },
        { "lugar": "Malecón Grau", "dist": 2.0 },
        { "lugar": "I.E. Inmaculada de la Merced", "dist": 0.8 }
      ],
      "Playa Atahualpa": [
        { "lugar": "Buenos Aires", "dist": 2.2 },
        { "lugar": "Malecón Grau", "dist": 0.5 },
        { "lugar": "Playa Los Pescadores", "dist": 1.5 }
      ],
      "Malecón Grau": [
        { "lugar": "Buenos Aires", "dist": 2.0 },
        { "lugar": "Playa Atahualpa", "dist": 0.5 },
        { "lugar": "I.E. Inmaculada de la Merced", "dist": 1.8 }
      ],
      "I.E. Inmaculada de la Merced": [
        { "lugar": "Buenos Aires", "dist": 0.8 },
        { "lugar": "Malecón Grau", "dist": 1.8 },
        { "lugar": "Bellamar", "dist": 1.5 }
      ],
      "Bellamar": [
        { "lugar": "Buenos Aires", "dist": 1.5 },
        { "lugar": "I.E. Inmaculada de la Merced", "dist": 1.5 },
        { "lugar": "Los Héroes", "dist": 1.2 }
      ],
      "Los Héroes": [
        { "lugar": "Bellamar", "dist": 1.2 },
        { "lugar": "Casuarinas", "dist": 1.3 },
        { "lugar": "El Pacífico", "dist": 2.0 }
      ],
      "Casuarinas": [
        { "lugar": "Los Héroes", "dist": 1.3 },
        { "lugar": "El Pacífico", "dist": 1.7 },
        { "lugar": "Villa María", "dist": 2.2 }
      ],
      "Nicolás Garatea": [
        { "lugar": "Villa María", "dist": 1.8 },
        { "lugar": "Buenos Aires", "dist": 2.5 }
      ],
      "El Pacífico": [
        { "lugar": "Casuarinas", "dist": 1.7 },
        { "lugar": "La Caleta", "dist": 1.8 },
        { "lugar": "Av. Anchoveta", "dist": 1.2 }
      ],
      "La Caleta": [
        { "lugar": "El Pacífico", "dist": 1.8 },
        { "lugar": "Santa Rosa", "dist": 1.4 },
        { "lugar": "Playa El Dorado", "dist": 2.0 }
      ],
      "Santa Rosa": [
        { "lugar": "La Caleta", "dist": 1.4 },
        { "lugar": "Villa María", "dist": 2.0 },
        { "lugar": "Av. José Pardo", "dist": 1.1 }
      ],
      "Villa María": [
        { "lugar": "Casuarinas", "dist": 2.2 },
        { "lugar": "Santa Rosa", "dist": 2.0 },
        { "lugar": "Nicolás Garatea", "dist": 1.8 },
        { "lugar": "Centro de Salud Villa María", "dist": 1.5 }
      ],
      "3 de Octubre": [
        { "lugar": "Villa María", "dist": 2.5 },
        { "lugar": "Buenos Aires", "dist": 3.0 }
      ],
      "Villa Hermosa": [
        { "lugar": "3 de Octubre", "dist": 0.8 },
        { "lugar": "Villa María", "dist": 2.2 }
      ],
      "Teresa de Calcuta": [
        { "lugar": "Villa Hermosa", "dist": 1.0 },
        { "lugar": "3 de Octubre", "dist": 1.5 }
      ],
      "Los Constructores": [
        { "lugar": "Villa Hermosa", "dist": 1.2 },
        { "lugar": "Villa María", "dist": 2.8 }
      ],
      "Los Jardines": [
        { "lugar": "Los Constructores", "dist": 0.7 },
        { "lugar": "Villa María", "dist": 2.5 }
      ],
      "El Acuario": [
        { "lugar": "Los Jardines", "dist": 1.3 },
        { "lugar": "Playa Los Pescadores", "dist": 2.0 }
      ],
      "15 de Abril": [
        { "lugar": "Los Jardines", "dist": 1.1 },
        { "lugar": "Villa Hermosa", "dist": 1.5 }
      ],
      "Las Delicias": [
        { "lugar": "15 de Abril", "dist": 0.9 },
        { "lugar": "Villa María", "dist": 3.0 }
      ],
      "Parque Industrial 27 de Octubre": [
        { "lugar": "Nicolás Garatea", "dist": 3.0 },
        { "lugar": "Mercado Buenos Aires", "dist": 2.5 }
      ],
      "Parque Industrial El Satélite": [
        { "lugar": "Parque Industrial 27 de Octubre", "dist": 1.8 },
        { "lugar": "El Pacífico", "dist": 2.0 }
      ],
      "Mercado Buenos Aires": [
        { "lugar": "Buenos Aires", "dist": 1.2 },
        { "lugar": "Plaza Mayor de Nuevo Chimbote", "dist": 1.0 },
        { "lugar": "Parque Industrial 27 de Octubre", "dist": 2.5 }
      ],
      "Universidad Nacional del Santa (UNS)": [
        { "lugar": "Buenos Aires", "dist": 1.8 },
        { "lugar": "Municipalidad Distrital de Nuevo Chimbote", "dist": 2.2 }
      ],
      "Universidad San Pedro": [
        { "lugar": "Universidad Nacional del Santa (UNS)", "dist": 1.0 },
        { "lugar": "Buenos Aires", "dist": 2.0 }
      ],
      "Instituto Superior Tecnológico Carlos Salazar Romero": [
        { "lugar": "Buenos Aires", "dist": 1.5 },
        { "lugar": "Universidad Nacional del Santa (UNS)", "dist": 0.8 }
      ],
      "CETPRO Nuevo Chimbote": [
        { "lugar": "Buenos Aires", "dist": 1.7 },
        { "lugar": "Instituto Superior Tecnológico Carlos Salazar Romero", "dist": 0.9 }
      ],
      "Hospital Regional Eleazar Guzmán Barrón": [
        { "lugar": "Villa María", "dist": 2.1 },
        { "lugar": "Av. Anchoveta", "dist": 1.5 }
      ],
      "Centro de Salud Buenos Aires": [
        { "lugar": "Buenos Aires", "dist": 0.8 },
        { "lugar": "Municipalidad Distrital de Nuevo Chimbote", "dist": 1.5 }
      ],
      "Centro de Salud Villa María": [
        { "lugar": "Villa María", "dist": 1.0 },
        { "lugar": "Hospital Regional Eleazar Guzmán Barrón", "dist": 1.2 }
      ],
      "Clínicas Particulares (varias)": [
        { "lugar": "Municipalidad Distrital de Nuevo Chimbote", "dist": 1.8 },
        { "lugar": "Buenos Aires", "dist": 1.5 }
      ],
      "Playa El Dorado": [
        { "lugar": "La Caleta", "dist": 2.0 },
        { "lugar": "Playa Los Pescadores", "dist": 1.5 }
      ],
      "Playa Los Pescadores": [
        { "lugar": "Playa Atahualpa", "dist": 1.5 },
        { "lugar": "Playa El Dorado", "dist": 1.5 },
        { "lugar": "El Acuario", "dist": 2.0 }
      ],
      "Parque 21 de Abril": [
        { "lugar": "Buenos Aires", "dist": 1.8 },
        { "lugar": "Municipalidad Distrital de Nuevo Chimbote", "dist": 2.0 }
      ],
      "Complejo Deportivo Casuarinas": [
        { "lugar": "Casuarinas", "dist": 0.7 },
        { "lugar": "Bellamar", "dist": 1.3 }
      ],
      "Vía de Evitamiento": [
        { "lugar": "Av. Anchoveta", "dist": 1.5 },
        { "lugar": "Av. José Pardo", "dist": 2.0 }
      ],
      "Av. Pacífico": [
        { "lugar": "Óvalo de la Familia", "dist": 1.0 },
        { "lugar": "Buenos Aires", "dist": 0.8 },
        { "lugar": "Universidad Nacional del Santa (UNS)", "dist": 1.8 }
      ],
      "Av. Anchoveta": [
        { "lugar": "El Pacífico", "dist": 1.2 },
        { "lugar": "Hospital Regional Eleazar Guzmán Barrón", "dist": 1.5 },
        { "lugar": "Vía de Evitamiento", "dist": 1.5 }
      ],
      "Av. José Pardo": [
        { "lugar": "Óvalo de la Familia", "dist": 0.8 },
        { "lugar": "Santa Rosa", "dist": 1.1 },
        { "lugar": "Vía de Evitamiento", "dist": 2.0 }
      ],
      "Comisaría Buenos Aires": [
        { "lugar": "Buenos Aires", "dist": 0.7 },
        { "lugar": "Municipalidad Distrital de Nuevo Chimbote", "dist": 1.2 }
      ],
      "Comisaría Villa María": [
        { "lugar": "Villa María", "dist": 1.0 },
        { "lugar": "Hospital Regional Eleazar Guzmán Barrón", "dist": 2.0 }
      ],
      "SEDACHIMBOTE (Planta de Agua)": [
        { "lugar": "Municipalidad Distrital de Nuevo Chimbote", "dist": 1.5 },
        { "lugar": "Buenos Aires", "dist": 1.8 }
      ],
      "SERENAZGO Nuevo Chimbote": [
        { "lugar": "Municipalidad Distrital de Nuevo Chimbote", "dist": 0.5 },
        { "lugar": "Óvalo de la Familia", "dist": 1.0 }
      ],
      "Estadio Centenario": [
        { "lugar": "Buenos Aires", "dist": 1.4 },
        { "lugar": "Parque 21 de Abril", "dist": 0.8 }
      ],
      "Las Loberas del Ferrol": [
        { "lugar": "Playa Atahualpa", "dist": 3.0 },
        { "lugar": "Playa Caleta Colorada", "dist": 2.5 }
      ],
      "Isla Blanca": [
        { "lugar": "Las Loberas del Ferrol", "dist": 1.5 },
        { "lugar": "Playa Caleta Colorada", "dist": 2.0 }
      ],
      "Playa Caleta Colorada": [
        { "lugar": "Las Loberas del Ferrol", "dist": 2.5 },
        { "lugar": "Isla Blanca", "dist": 2.0 },
        { "lugar": "Playa El Dorado", "dist": 2.5 }
      ],
      "La Poza": [
        { "lugar": "Playa El Dorado", "dist": 2.2 },
        { "lugar": "Caleta Colorada", "dist": 2.0 }
      ],
      "Caleta Colorada": [
        { "lugar": "Playa Caleta Colorada", "dist": 2.0 },
        { "lugar": "La Poza", "dist": 2.0 }
      ],
      "Besique": [
        { "lugar": "Playa Caleta Colorada", "dist": 3.0 },
        { "lugar": "Las Conchuelas", "dist": 2.5 }
      ],
      "Las Conchuelas": [
        { "lugar": "Besique", "dist": 2.5 },
        { "lugar": "Isla Blanca", "dist": 3.0 }
      ]
    }
  }
}
