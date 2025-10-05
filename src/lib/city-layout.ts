// Este archivo define una representación simple de la conectividad de la ciudad.
// La IA utilizará esta información para entender cómo se relacionan las ubicaciones
// y generar recomendaciones de rutas más lógicas.

// Formato: { "Ubicación": ["Vecino 1", "Vecino 2", ...] }
// Un "vecino" es un lugar al que se puede llegar directamente desde la ubicación clave.

export const cityLayout = {
  "Plaza Mayor de Nuevo Chimbote": ["Municipalidad Distrital de Nuevo Chimbote", "Catedral Nuestra Señora del Carmen y San Pedro Apóstol", "Av. Pacífico"],
  "Municipalidad Distrital de Nuevo Chimbote": ["Plaza Mayor de Nuevo Chimbote", "Av. Pacífico"],
  "Catedral Nuestra Señora del Carmen y San Pedro Apóstol": ["Plaza Mayor de Nuevo Chimbote"],
  "Óvalo de la Familia": ["Av. Pacífico", "Av. Anchoveta", "Urbanización Bellamar"],
  "Playa Atahualpa": ["Malecón Grau"],
  "Malecón Grau": ["Playa Atahualpa", "Urbanización La Caleta"],
  "Urbanización Bellamar": ["Óvalo de la Familia", "Av. Pacífico"],
  "Urbanización Los Héroes": ["Av. Pacífico", "Hospital Regional Eleazar Guzmán Barrón"],
  "Hospital Regional Eleazar Guzmán Barrón": ["Urbanización Los Héroes", "Vía de Evitamiento"],
  "Universidad Nacional del Santa (UNS)": ["Av. Anchoveta", "Urbanización Villa María"],
  "Mercado Buenos Aires": ["Comisaría Buenos Aires", "Av. José Pardo"],
  "Av. Pacífico": ["Plaza Mayor de Nuevo Chimbote", "Óvalo de la Familia", "Urbanización Bellamar", "Urbanización Los Héroes", "Urbanización El Pacífico"],
  "Av. Anchoveta": ["Óvalo de la Familia", "Universidad Nacional del Santa (UNS)", "Vía de Evitamiento"],
  "Av. José Pardo": ["Mercado Buenos Aires", "Urbanización La Caleta"],
  "Vía de Evitamiento": ["Hospital Regional Eleazar Guzmán Barrón", "Av. Anchoveta"]
};
