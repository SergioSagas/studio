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
  vandalism: { label: 'Vandalism', color: 'hsl(var(--chart-1))' },
  theft: { label: 'Theft', color: 'hsl(var(--chart-2))' },
  robbery: { label: 'Robbery', color: 'hsl(var(--chart-3))' },
  suspicious_activity: { label: 'Suspicious Activity', color: 'hsl(var(--chart-4))' },
  other: { label: 'Other', color: 'hsl(var(--chart-5))' },
} satisfies ChartConfig;


export function CrimePatternsChart({ patterns }: { patterns: DetectCrimePatternsOutput['patterns'] }) {
    
    const transformedData: ChartData[] = patterns.reduce((acc: ChartData[], pattern) => {
        let zoneData = acc.find(d => d.zone === pattern.zone);
        if (!zoneData) {
            zoneData = { zone: pattern.zone };
            acc.push(zoneData);
        }
        pattern.incidentTypes.forEach(type => {
            const key = type.toLowerCase().replace(" ", "_");
            const chartKey = Object.keys(chartConfig).includes(key) ? key : 'other';
            if (!zoneData[chartKey]) {
                zoneData[chartKey] = 0;
            }
            (zoneData[chartKey] as number) += pattern.frequency;
        });

        return acc;
    }, []);
    

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crime Patterns by Zone</CardTitle>
        <CardDescription>
          Frequency of different incident types across various zones.
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
