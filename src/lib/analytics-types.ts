// Este archivo define los tipos para las entidades de analítica
// para ser usados en el cliente.

import type { Timestamp } from 'firebase/firestore';

export type Interaction = {
    id: string;
    userId: string;
    pageUrl: string;
    x: number;
    y: number;
    elementId: string;
    timestamp: Timestamp;
};

export type ButtonStats = {
    id: string;
    clicks: number;
    lastClicked: Timestamp;
};

export type UserStats = {
    id: string;
    total_clicks: number;
    lastActive: Timestamp;
    email: string;
};

export type GlobalConfig = {
    id: string;
    total_clicks_plataforma: number;
};
