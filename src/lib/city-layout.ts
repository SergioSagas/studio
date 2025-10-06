// Este archivo define una representación detallada de la conectividad de la ciudad.
// La IA utilizará esta información para entender cómo se relacionan las ubicaciones,
// sus tipos, y las distancias para generar recomendaciones de rutas más lógicas.

export const cityData = {
  "Mapa_Base_Nuevo_Chimbote": {
    "ubicaciones": {
      "Buenos Aires": { "tipo": "Urbanización / zona central" },
      "Los Héroes": { "tipo": "Urbanización" },
      "Las Casuarinas": { "tipo": "Urbanización" },
      "Nicolás Garatea": { "tipo": "Urbanización" },
      "El Pacífico": { "tipo": "Urbanización costera" },
      "La Caleta": { "tipo": "Urbanización costera / zona de playa" },
      "Santa Rosa": { "tipo": "Urbanización" },
      "Villa María": { "tipo": "Zona urbana / humedales adjuntos" },
      "Centro Urbano": { "tipo": "Núcleo de servicios municipales" },
      "Óvalo La Familia": { "tipo": "Rotonda / intersección importante" },
      "Av. Pacífico": { "tipo": "Avenida principal" },
      "Av. Anchoveta": { "tipo": "Avenida secundaria / conexión costera" },
      "Av. José Pardo": { "tipo": "Avenida principal / eje de conexión con Chimbote" },
      "Parque Industrial 27 de Octubre": { "tipo": "Zona industrial" },
      "Mercado Buenos Aires": { "tipo": "Centro comercial / mercado" },
      "Hospital Regional Eleazar Guzmán Barrón": { "tipo": "Infraestructura de salud" },
      "Playa Atahualpa": { "tipo": "Playa / costa" },
      "Playa Los Pescadores": { "tipo": "Playa / costa" },
      "Playa El Dorado": { "tipo": "Playa / costa" }
    },
    "conexiones": {
      "Centro Urbano": [
        { "lugar": "Buenos Aires", "dist": 1.0 },
        { "lugar": "Óvalo La Familia", "dist": 0.6 },
        { "lugar": "Av. Pacífico", "dist": 0.8 },
        { "lugar": "Nicolás Garatea", "dist": 2.5 }
      ],
      "Buenos Aires": [
        { "lugar": "Centro Urbano", "dist": 1.0 },
        { "lugar": "Los Héroes", "dist": 1.5 },
        { "lugar": "Av. Pacífico", "dist": 0.7 },
        { "lugar": "Playa Atahualpa", "dist": 2.2 }
      ],
      "Los Héroes": [
        { "lugar": "Buenos Aires", "dist": 1.5 },
        { "lugar": "Las Casuarinas", "dist": 1.3 },
        { "lugar": "El Pacífico", "dist": 2.0 }
      ],
      "Las Casuarinas": [
        { "lugar": "Los Héroes", "dist": 1.3 },
        { "lugar": "El Pacífico", "dist": 1.7 },
        { "lugar": "Villa María", "dist": 2.3 }
      ],
      "Nicolás Garatea": [
        { "lugar": "Centro Urbano", "dist": 2.5 },
        { "lugar": "Villa María", "dist": 1.8 },
        { "lugar": "Parque Industrial 27 de Octubre", "dist": 3.0 }
      ],
      "El Pacífico": [
        { "lugar": "Las Casuarinas", "dist": 1.7 },
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
        { "lugar": "Las Casuarinas", "dist": 2.3 },
        { "lugar": "Santa Rosa", "dist": 2.0 },
        { "lugar": "Nicolás Garatea", "dist": 1.8 },
        { "lugar": "Centro Urbano", "dist": 3.2 }
      ],
      "Parque Industrial 27 de Octubre": [
        { "lugar": "Nicolás Garatea", "dist": 3.0 },
        { "lugar": "Mercado Buenos Aires", "dist": 2.5 }
      ],
      "Mercado Buenos Aires": [
        { "lugar": "Buenos Aires", "dist": 1.2 },
        { "lugar": "Centro Urbano", "dist": 1.0 },
        { "lugar": "Parque Industrial 27 de Octubre", "dist": 2.5 }
      ],
      "Óvalo La Familia": [
        { "lugar": "Centro Urbano", "dist": 0.6 },
        { "lugar": "Av. Pacífico", "dist": 1.0 },
        { "lugar": "Av. José Pardo", "dist": 0.8 }
      ],
      "Av. Pacífico": [
        { "lugar": "Centro Urbano", "dist": 0.8 },
        { "lugar": "Buenos Aires", "dist": 0.7 },
        { "lugar": "Óvalo La Familia", "dist": 1.0 }
      ],
      "Av. Anchoveta": [
        { "lugar": "El Pacífico", "dist": 1.2 },
        { "lugar": "Hospital Regional Eleazar Guzmán Barrón", "dist": 1.5 }
      ],
      "Av. José Pardo": [
        { "lugar": "Óvalo La Familia", "dist": 0.8 },
        { "lugar": "Santa Rosa", "dist": 1.1 }
      ],
      "Hospital Regional Eleazar Guzmán Barrón": [
        { "lugar": "Av. Anchoveta", "dist": 1.5 },
        { "lugar": "Villa María", "dist": 2.1 }
      ],
      "Playa Atahualpa": [
        { "lugar": "Buenos Aires", "dist": 2.2 },
        { "lugar": "Playa Los Pescadores", "dist": 1.5 }
      ],
      "Playa Los Pescadores": [
        { "lugar": "Playa Atahualpa", "dist": 1.5 },
        { "lugar": "Playa El Dorado", "dist": 2.0 }
      ],
      "Playa El Dorado": [
        { "lugar": "Playa Los Pescadores", "dist": 2.0 },
        { "lugar": "La Caleta", "dist": 2.0 }
      ]
    }
  }
};
