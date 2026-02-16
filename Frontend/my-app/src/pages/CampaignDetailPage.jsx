import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { DonationRow } from '@/components/shared/DonationRow';
import { Loading } from '@/components/shared/Loading';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import { getCampaignById, getNgoById, getDonationsByCampaign } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Calendar } from 'lucide-react';

export function CampaignDetailPage() {
  const { campaignId } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [ngo, setNgo] = useState(null);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCampaignDetails();
  }, [campaignId]);

  async function loadCampaignDetails() {
    try {
      setLoading(true);
      setError(null);
      
      const campaignData = await getCampaignById(campaignId);
      setCampaign(campaignData);
      
      const [ngoData, donationsData] = await Promise.all([
        getNgoById(campaignData.ngoId),
        getDonationsByCampaign(campaignId)
      ]);
      
      setNgo(ngoData);
      setDonations(Array.isArray(donationsData) ? donationsData : []);
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
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <ErrorMessage message={error} retry={loadCampaignDetails} />
      </PageContainer>
    );
  }

  if (!campaign) {
    return (
      <PageContainer>
        <EmptyState
          title="Campaign not found"
          description="The campaign you're looking for doesn't exist."
          action={
            <Link to="/campaigns">
              <Button>Back to Campaigns</Button>
            </Link>
          }
        />
      </PageContainer>
    );
  }

  const isActive = campaign.active && new Date(Number(campaign.endDate) * 1000) > new Date();

  return (
    <PageContainer>
      <div className="space-y-8">
        {/* Back Button */}
        <Link to="/campaigns">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Campaigns
          </Button>
        </Link>

        {/* Campaign Hero Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-3xl">{campaign.title}</CardTitle>
                <CardDescription className="mt-2 text-base">
                  <Link to={`/ngos/${ngo?.ngoId}`} className="hover:underline">
                    {ngo?.name || 'Loading...'}
                  </Link>
                </CardDescription>
              </div>
              <Badge variant={isActive ? 'default' : 'outline'}>
                {isActive ? 'Active' : 'Ended'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{campaign.description}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                Ends: {new Date(Number(campaign.endDate) * 1000).toLocaleDateString()}
              </span>
            </div>
            {isActive && (
              <Link to={`/donate/${campaignId}`}>
                <Button size="lg" className="w-full sm:w-auto">
                  Donate to this Campaign
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        {/* Donation Transparency Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Donation Transparency</h2>
          {donations.length === 0 ? (
            <EmptyState
              title="No donations yet"
              description="Be the first to support this campaign!"
            />
          ) : (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="py-3 px-4 text-left text-sm font-semibold">ID</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold">Amount</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold">Donor</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold">Reference</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donations.map((donation) => (
                      <DonationRow key={donation.donationId} donation={donation} />
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
