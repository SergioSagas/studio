'use client';
import { useActionState, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { type IncidentReport } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import {
  AlertTriangle,
  CheckCircle,
  ShieldQuestion,
  MapPin,
  Clock,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Loader } from '@/components/ui/loader';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { castVoteAction } from '@/app/actions';

function getRiskBadgeVariant(riskLevel: IncidentReport['riskLevel']) {
  if (riskLevel === 'high') return 'destructive';
  if (riskLevel === 'medium') return 'secondary';
  return 'default';
}

function getRiskIcon(riskLevel: IncidentReport['riskLevel']) {
  if (riskLevel === 'high') return <AlertTriangle className="size-5 text-destructive" />;
  if (riskLevel === 'medium') return <ShieldQuestion className="size-5 text-yellow-500" />;
  return <CheckCircle className="size-5 text-green-500" />;
}

function AlertCard({ report }: { report: IncidentReport }) {
  const { user } = useUser();
  const { toast } = useToast();

  const [voteState, voteAction, isVoting] = useActionState(castVoteAction, { status: 'idle', message: '' });

  useEffect(() => {
    if (voteState.status === 'success' && voteState.message) {
      toast({
        title: 'Voto Registrado',
        description: voteState.message,
      });
    } else if (voteState.status === 'error') {
      toast({
        variant: 'destructive',
        title: 'Error al Votar',
        description: voteState.message,
      });
    }
  }, [voteState, toast]);

  const isOwner = user?.uid === report.userId;
  const confirmations = report.confirmations || [];
  const disputes = report.disputes || [];
  const hasVoted = confirmations.includes(user?.uid ?? '') || disputes.includes(user?.uid ?? '');
  const isFinalStatus = ['confirmed', 'disputed', 'false'].includes(report.status);
  const canVote = user && !isOwner && !hasVoted && !isFinalStatus;

  const riskLevelText = report.riskLevel === 'low' ? 'Bajo' : report.riskLevel === 'medium' ? 'Medio' : 'Alto';
  
  const getStatusText = (status: IncidentReport['status'] | undefined) => {
    switch (status) {
        case 'confirmed': return 'Confirmado';
        case 'disputed': return 'Disputado';
        case 'false': return 'Falso';
        default: return 'Sin verificar';
    }
  }
  const statusText = getStatusText(report.status);


  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{report.incidentType}</CardTitle>
            <CardDescription className="mt-1 flex items-center gap-2">
              <MapPin className="size-3.5" />
              {report.location}
            </CardDescription>
          </div>
           <Badge
            variant={getRiskBadgeVariant(report.riskLevel)}
            className="capitalize"
          >
             <div className="flex items-center gap-2">
                {getRiskIcon(report.riskLevel)}
                <span>{riskLevelText} Riesgo</span>
             </div>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">{report.summary || report.description}</p>
      </CardContent>
      <CardFooter className="flex-col items-start gap-4">
        <div className="text-xs text-muted-foreground flex items-center gap-2">
            <Clock className="size-3.5" />
            <span>{new Date(report.reportTime).toLocaleString()}</span>
        </div>
        {user && (
          <div className="flex w-full items-center justify-between">
            <div className="flex gap-2">
                <form action={voteAction}>
                    <input type="hidden" name="reportId" value={report.id} />
                    <input type="hidden" name="voteType" value="confirm" />
                    <input type="hidden" name="actionUserId" value={user.uid} />
                    <Button type="submit" variant="outline" size="sm" disabled={!canVote || isVoting} aria-label="Confirmar">
                        <ThumbsUp className="size-4 mr-2" />
                        {confirmations.length}
                    </Button>
                </form>
                <form action={voteAction}>
                    <input type="hidden" name="reportId" value={report.id} />
                    <input type="hidden" name="voteType" value="dispute" />
                    <input type="hidden" name="actionUserId" value={user.uid} />
                    <Button type="submit" variant="outline" size="sm" disabled={!canVote || isVoting} aria-label="Disputar">
                        <ThumbsDown className="size-4 mr-2" />
                        {disputes.length}
                    </Button>
                </form>
            </div>
             <Badge variant={report.status === 'confirmed' ? 'default' : report.status === 'disputed' || report.status === 'false' ? 'destructive' : 'secondary'} className="capitalize">
              {statusText}
            </Badge>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

export default function AlertsPage() {
  const firestore = useFirestore();

  const reportsQuery = useMemoFirebase(
    () =>
      firestore
        ? query(collection(firestore, 'incidentReports'), orderBy('reportTime', 'desc'))
        : null,
    [firestore]
  );
  
  const { data: reports, isLoading } = useCollection<IncidentReport>(reportsQuery);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Alertas en Tiempo Real"
        description="Un feed en vivo de incidentes y alertas de seguridad en tu comunidad."
      />
      {isLoading ? (
        <Loader className="h-64" />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {reports?.map((report) => (
            <AlertCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </div>
  );
}
