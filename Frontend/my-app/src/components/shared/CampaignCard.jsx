import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';

export function CampaignCard({ campaign, ngoName }) {
  const { campaignId, title, description, endDate, active } = campaign;
  const isActive = active && new Date(Number(endDate) * 1000) > new Date();

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription className="mt-1">{ngoName}</CardDescription>
          </div>
          <Badge variant={isActive ? 'default' : 'outline'}>
            {isActive ? 'Active' : 'Ended'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {description}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>
            Ends: {new Date(Number(endDate) * 1000).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Link to={`/campaigns/${campaignId}`} className="flex-1">
          <Button variant="outline" className="w-full">
            View Details
          </Button>
        </Link>
        {isActive && (
          <Link to={`/donate/${campaignId}`} className="flex-1">
            <Button variant="default" className="w-full">
              Donate
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
