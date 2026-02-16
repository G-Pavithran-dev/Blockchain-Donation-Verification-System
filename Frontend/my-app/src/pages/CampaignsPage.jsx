import { useState, useEffect } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { CampaignCard } from '@/components/shared/CampaignCard';
import { Loading } from '@/components/shared/Loading';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import { getCampaignsCount, getCampaignById, getNgoById } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCampaigns();
  }, []);

  async function loadCampaigns() {
    try {
      setLoading(true);
      setError(null);
      
      // Get total count
      const countData = await getCampaignsCount();
      const count = countData.count || 0;
      
      if (count === 0) {
        setCampaigns([]);
        return;
      }

      // Fetch all campaigns
      const campaignPromises = [];
      for (let i = 1; i <= count; i++) {
        campaignPromises.push(
          getCampaignById(i).catch(() => null)
        );
      }
      
      const campaignsData = await Promise.all(campaignPromises);
      const validCampaigns = campaignsData.filter(c => c !== null);

      // Fetch NGO names for each campaign
      const campaignsWithNgo = await Promise.all(
        validCampaigns.map(async (campaign) => {
          try {
            const ngo = await getNgoById(campaign.ngoId);
            return { ...campaign, ngoName: ngo.name };
          } catch {
            return { ...campaign, ngoName: 'Unknown NGO' };
          }
        })
      );

      // Filter only active campaigns
      const activeCampaigns = campaignsWithNgo.filter(c => 
        c.active && new Date(Number(c.endDate) * 1000) > new Date()
      );

      setCampaigns(activeCampaigns);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageContainer>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold">Active Campaigns</h1>
          <p className="text-muted-foreground mt-2">
            Support verified campaigns and make a difference
          </p>
        </div>

        {/* Content */}
        {loading && <Loading count={6} type="card" />}
        
        {error && (
          <ErrorMessage 
            message={error} 
            retry={loadCampaigns}
          />
        )}

        {!loading && !error && campaigns.length === 0 && (
          <EmptyState
            title="No active campaigns"
            description="There are no active campaigns at the moment. Check back soon!"
            action={
              <Link to="/ngos">
                <Button>Browse NGOs</Button>
              </Link>
            }
          />
        )}

        {!loading && !error && campaigns.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((campaign) => (
              <CampaignCard 
                key={campaign.campaignId} 
                campaign={campaign}
                ngoName={campaign.ngoName}
              />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
