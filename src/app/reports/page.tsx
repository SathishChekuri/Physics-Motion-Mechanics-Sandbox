import React, { Suspense } from 'react';
import { ExperimentReportView } from '@/components/reports/ExperimentReportView';

export const metadata = {
  title: 'Reports & Export | Physics Mechanics Sandbox',
  description: 'Publication-quality printable physics reports and CSV export data',
};

export default function ReportsPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-400">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent mx-auto mb-3" />
          <p className="text-xs">Preparing laboratory report...</p>
        </div>
      }
    >
      <ExperimentReportView />
    </Suspense>
  );
}
