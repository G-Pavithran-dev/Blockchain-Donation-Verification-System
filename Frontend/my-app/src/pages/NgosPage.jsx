import { useState, useEffect } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { NgoCard } from '@/components/shared/NgoCard';
import { Loading } from '@/components/shared/Loading';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import { getNgoList } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export function NgosPage() {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' or 'verified'

  useEffect(() => {
    loadNgos();
  }, []);

  async function loadNgos() {
    try {
      setLoading(true);
      setError(null);
      const data = await getNgoList();
      setNgos(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const filteredNgos = filter === 'verified' 
    ? ngos.filter(ngo => ngo.verified) 
    : ngos;

  return (
    <PageContainer>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold">Verified NGOs</h1>
            <p className="text-muted-foreground mt-2">
              Browse through our verified non-profit organizations
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={filter === 'all' ? 'default' : 'outline'} 
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button 
              variant={filter === 'verified' ? 'default' : 'outline'} 
              onClick={() => setFilter('verified')}
            >
              Verified Only
            </Button>
          </div>
        </div>

        {/* Content */}
        {loading && <Loading count={6} type="card" />}
        
        {error && (
          <ErrorMessage 
            message={error} 
            retry={loadNgos}
          />
        )}

        {!loading && !error && filteredNgos.length === 0 && (
          <EmptyState
            title="No NGOs found"
            description={filter === 'verified' 
              ? "No verified NGOs are available yet." 
              : "No NGOs have registered yet. Be the first!"}
            action={
              <Link to="/dashboard">
                <Button>Register Your NGO</Button>
              </Link>
            }
          />
        )}

        {!loading && !error && filteredNgos.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredNgos.map((ngo) => (
              <NgoCard key={ngo.ngoId} ngo={ngo} />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
