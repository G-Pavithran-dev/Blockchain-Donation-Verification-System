import { Badge } from '@/components/ui/badge';
import { User, Building2, Shield } from 'lucide-react';

export function RoleBadge({ role, ngoName }) {
  if (role === 'admin') {
    return (
      <Badge variant="default" className="bg-purple-600 hover:bg-purple-700">
        <Shield className="mr-1 h-3 w-3" />
        Admin
      </Badge>
    );
  }

  if (role === 'ngo') {
    return (
      <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">
        <Building2 className="mr-1 h-3 w-3" />
        NGO: {ngoName || 'Organization'}
      </Badge>
    );
  }

  return (
    <Badge variant="outline">
      <User className="mr-1 h-3 w-3" />
      Donor
    </Badge>
  );
}
