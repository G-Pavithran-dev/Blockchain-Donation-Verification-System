import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { CampaignCard } from '@/components/shared/CampaignCard';
import { VerifiedBadge } from '@/components/shared/VerifiedBadge';
import { Loading } from '@/components/shared/Loading';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import { getNgoById, getCampaignsByNgo } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';

export function NgoDetailPage() {
  const { ngoId } = useParams();
  const [ngo, setNgo] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadNgoDetails();
  }, [ngoId]);

  async function loadNgoDetails() {
    try {
      setLoading(true);
      setError(null);
      const [ngoData, campaignsData] = await Promise.all([
        getNgoById(ngoId),
        getCampaignsByNgo(ngoId)
      ]);
      setNgo(ngoData);
      setCampaigns(Array.isArray(campaignsData) ? campaignsData : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <PageContainer>
        <Loading count={1} type="card" />
        <div className="mt-8">
          <Loading count={3} type="card" />
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <ErrorMessage message={error} retry={loadNgoDetails} />
      </PageContainer>
    );
  }

  if (!ngo) {
    return (
      <PageContainer>
        <EmptyState
          title="NGO not found"
          description="The NGO you're looking for doesn't exist."
          action={
            <Link to="/ngos">
              <Button>Back to NGOs</Button>
            </Link>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-8">
        {/* Back Button */}
        <Link to="/ngos">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to NGOs
          </Button>
        </Link>

        {/* NGO Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-3xl">{ngo.name}</CardTitle>
                <CardDescription className="mt-2">
                  Registration: {ngo.registrationNumber}
                </CardDescription>
                <CardDescription className="text-xs font-mono mt-1">
                  {ngo.wallet}
                </CardDescription>
              </div>
              <VerifiedBadge verified={ngo.verified} />
            </div>
          </CardHeader>
          <CardContent>
            {ngo.panNumber && (
              <p className="text-sm text-muted-foreground">
                PAN: {ngo.panNumber}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Campaigns Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Campaigns</h2>
          {campaigns.length === 0 ? (
            <EmptyState
              title="No campaigns yet"
              description="This NGO hasn't created any campaigns yet."
            />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {campaigns.map((campaign) => (
                <CampaignCard 
                  key={campaign.campaignId} 
                  campaign={campaign}
                  ngoName={ngo.name}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
