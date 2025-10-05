import { PageHeader } from '@/components/page-header';
import { ReportForm } from '@/components/report-form';

export default function NewReportPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Submit a New Report"
        description="Help improve community safety by reporting incidents anonymously."
      />
      <ReportForm />
    </div>
  );
}
