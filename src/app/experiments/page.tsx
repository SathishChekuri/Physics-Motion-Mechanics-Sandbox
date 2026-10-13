import { ExperimentList } from '@/components/experiments/ExperimentList';

export const metadata = {
  title: 'Experiment History & Repository | Physics Mechanics Sandbox',
  description: 'Search, filter, edit, compare, and export saved projectile experiments',
};

export default function ExperimentsPage() {
  return <ExperimentList />;
}
