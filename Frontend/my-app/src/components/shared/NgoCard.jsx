import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { VerifiedBadge } from './VerifiedBadge';

export function NgoCard({ ngo }) {
  const { ngoId, name, registrationNumber, verified, wallet } = ngo;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl">{name}</CardTitle>
          <VerifiedBadge verified={verified} />
        </div>
        <CardDescription className="text-xs font-mono truncate">
          {wallet}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Registration: {registrationNumber}
        </p>
      </CardContent>
      <CardFooter>
        <Link to={`/ngos/${ngoId}`} className="w-full">
          <Button variant="default" className="w-full">
            View Campaigns
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
