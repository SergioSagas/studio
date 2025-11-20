'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig
} from '@/components/ui/chart';
import type { DetectCrimePatternsOutput } from '@/ai/flows/detect-crime-patterns.flow';

type ChartData = {
    zone: string;
} & { [key: string]: number | string };

const chartConfig = {
  vandalism: { label: 'Vandalismo', color: 'hsl(var(--chart-1))' },
  theft: { label: 'Robo', color: 'hsl(var(--chart-2))' },
  robbery: { label: 'Asalto', color: 'hsl(var(--chart-3))' },
  suspicious_activity: { label: 'Actividad Sospechosa', color: 'hsl(var(--chart-4))' },
  animal_attack: { label: 'Ataque de Animal', color: 'hsl(var(--chart-5))' },
  other: { label: 'Otro', color: 'hsl(var(--chart-2))' },
} satisfies ChartConfig;

const incidentTypeToChartKey = (incidentType: string): string => {
    const key = incidentType.toLowerCase().replace(/[\s\W]+/g, '_');
    const mapping: { [key: string]: string } = {
        'robo': 'theft',
        'asalto': 'robbery',
        'vandalismo': 'vandalism',
        'actividad_sospechosa': 'suspicious_activity',
        'ataque_de_animal': 'animal_attack',
        'animal_attack': 'animal_attack',
        'accidente': 'other',
        'sin_clasificar': 'other',
    };
    // Direct match in mapping
    if (mapping[key]) return mapping[key];
    // Check if any defined chart key is a substring of the incident type key
    for (const chartKey in chartConfig) {
        if (key.includes(chartKey)) {
            return chartKey;
        }
    }
    return 'other';
};


export function CrimePatternsChart({ patterns }: { patterns: DetectCrimePatternsOutput['patterns'] }) {
    
    // This transformation aggregates counts for each incident type within a zone.
    const transformedData: ChartData[] = patterns.reduce((acc: ChartData[], pattern) => {
        let zoneData = acc.find(d => d.zone === pattern.zone);
        if (!zoneData) {
            zoneData = { zone: pattern.zone };
            acc.push(zoneData);
        }
        
        // The AI now sends one object per incident type, so we just map it.
        pattern.incidentTypes.forEach(type => {
            const chartKey = incidentTypeToChartKey(type);
            if (!zoneData[chartKey]) {
                zoneData[chartKey] = 0;
            }
            (zoneData[chartKey] as number) += pattern.count;
        });

        return acc;
    }, []);
    

  return (
    <Card>
      <CardHeader>
        <CardTitle>Desglose de Incidentes por Zona</CardTitle>
        <CardDescription>
          Frecuencia de diferentes tipos de incidentes en varias zonas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <BarChart data={transformedData} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="zone"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value}
            />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            {Object.entries(chartConfig).map(([key, config]) => (
                <Bar key={key} dataKey={key} fill={config.color} stackId="a" radius={4} />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
