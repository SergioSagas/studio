'use client';
import { useState } from 'react';
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
import { collection, query, orderBy, doc, arrayUnion, writeBatch, getDoc } from 'firebase/firestore';
import { Loader } from '@/components/ui/loader';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { castVoteAction } from '@/app/actions';
import { Loader2 } from 'lucide-react';


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

const VOTE_THRESHOLD = 3;

function AlertCard({ report }: { report: IncidentReport }) {
  const { user } = useUser();
  const { toast } = useToast();
  const [isVoting, setIsVoting] = useState(false);
  const firestore = useFirestore();

  const handleVote = async (voteType: 'confirm' | 'dispute') => {
    if (!user || !firestore) return;
    
    setIsVoting(true);

    try {
      // Client-side optimistic update: just add the vote
      const reportRef = doc(firestore, 'incidentReports', report.id);
      await writeBatch(firestore).update(reportRef, {
        [voteType === 'confirm' ? 'confirmations' : 'disputes']: arrayUnion(user.uid)
      }).commit();
      
      // Server-side action for complex logic
      const actionResult = await castVoteAction({
        reportId: report.id,
        voteType: voteType,
        actionUserId: user.uid,
      });

      if (actionResult.status === 'error') {
        throw new Error(actionResult.message);
      }
      
      toast({
        title: 'Voto Registrado',
        description: 'Tu voto ha sido registrado con éxito.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error al Votar',
        description: error.message || 'No se pudo registrar tu voto.',
      });
    } finally {
      setIsVoting(false);
    }
  };

  const isOwner = user?.uid === report.userId;
  const confirmations = report.confirmations || [];
  const disputes = report.disputes || [];
  const hasVoted = confirmations.includes(user?.uid ?? '') || disputes.includes(user?.uid ?? '');
  const isFinalStatus = !(['unverified', undefined, null].includes(report.status));
  const canVote = user && !isOwner && !hasVoted && !isFinalStatus;

  const riskLevelText = report.riskLevel === 'low' ? 'Bajo' : report.riskLevel === 'medium' ? 'Medio' : 'Alto';
  
  const getStatusText = (status: IncidentReport['status'] | undefined | null) => {
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
              <Button onClick={() => handleVote('confirm')} variant="outline" size="sm" disabled={!canVote || isVoting} aria-label="Confirmar">
                  {isVoting ? <Loader2 className="size-4 mr-2 animate-spin" /> : <ThumbsUp className="size-4 mr-2" />}
                  {confirmations.length}
              </Button>
              <Button onClick={() => handleVote('dispute')} variant="outline" size="sm" disabled={!canVote || isVoting} aria-label="Disputar">
                  {isVoting ? <Loader2 className="size-4 mr-2 animate-spin" /> : <ThumbsDown className="size-4 mr-2" />}
                  {disputes.length}
              </Button>
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
