import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center text-center min-h-[55vh] gap-4 py-12">
      <div className="font-mono text-xs tracking-widest text-zinc-400">ROUTE NOT FOUND</div>
      <h1 className="text-5xl font-bold tracking-tight text-white">404</h1>
      <p className="text-sm text-zinc-400 max-w-sm">
        The requested telemetry view or regional parameter could not be located.
      </p>
      <Link to="/">
        <Button variant="mint" leftIcon={<ArrowLeftIcon />}>
          Return to Overview
        </Button>
      </Link>
    </div>
  );
}
