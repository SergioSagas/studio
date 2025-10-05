import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-citizen-reports.flow.ts';
import '@/ai/flows/recommend-safe-routes.flow.ts';
import '@/ai/flows/detect-crime-patterns.flow.ts';
import '@/ai/flows/issue-real-time-alerts.flow.ts';