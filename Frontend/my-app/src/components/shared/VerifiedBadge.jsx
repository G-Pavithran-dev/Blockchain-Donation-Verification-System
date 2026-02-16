import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';

export function VerifiedBadge({ verified = true, className = '' }) {
  if (!verified) {
    return (
      <Badge variant="outline" className={`${className}`}>
        Pending
      </Badge>
    );
  }

  return (
    <Badge variant="default" className={`bg-green-600 hover:bg-green-700 ${className}`}>
      <CheckCircle2 className="mr-1 h-3 w-3" />
      Verified
    </Badge>
  );
}
