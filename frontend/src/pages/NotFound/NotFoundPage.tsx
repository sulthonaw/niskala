import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { Button } from '../../components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center text-center min-h-[55vh] gap-4 py-12">
      <div className="font-brand text-xs uppercase tracking-[0.2em] text-zinc-400">ROUTE NOT FOUND</div>
      <h1 className="text-5xl font-bold tracking-tight text-white">404</h1>
      <p className="text-sm text-zinc-400 max-w-sm">
        That page does not exist or may have moved.
      </p>
      <Link to="/">
        <Button variant="mint" leftIcon={<ArrowLeftIcon />}>
          Back to Home
        </Button>
      </Link>
    </div>
  );
}
