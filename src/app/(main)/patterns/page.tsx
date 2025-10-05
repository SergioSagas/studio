import { PageHeader } from '@/components/page-header';
import { CrimePatternsChart } from '@/components/crime-patterns-chart';
import { fetchCrimePatternsAction } from '@/app/actions';
import { incidentReports } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default async function PatternsPage() {
  const patternsData = await fetchCrimePatternsAction(incidentReports);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Crime Pattern Analysis"
        description="AI-powered insights into incident trends and hotspots."
      />

      {patternsData && patternsData.patterns.length > 0 ? (
        <CrimePatternsChart patterns={patternsData.patterns} />
      ) : (
        <Card className="flex min-h-[300px] flex-col items-center justify-center text-center">
            <CardHeader>
                <CardTitle>No Pattern Data</CardTitle>
                <CardDescription>
                    Could not detect significant patterns from the current report data.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-full bg-muted p-4">
                    <AlertTriangle className="size-12 text-muted-foreground" />
                </div>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
