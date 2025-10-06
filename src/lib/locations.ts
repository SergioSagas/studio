import { cityData } from './city-layout';

// Esta lista de ubicaciones se genera dinámicamente a partir de los datos del mapa de la ciudad,
// asegurando consistencia en toda la aplicación.
export const locations: string[] = Object.keys(cityData.Mapa_Base_Nuevo_Chimbote.ubicaciones);
