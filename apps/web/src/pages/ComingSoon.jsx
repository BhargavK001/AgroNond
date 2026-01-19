import { Link } from 'react-router-dom';
import Button from '../components/Button';

export default function ComingSoon() {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          Coming Soon
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          The Dashboard for this role is currently under development.
        </p>
        <div className="mt-6">
          <Link to="/">
            <Button>Go Back Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
