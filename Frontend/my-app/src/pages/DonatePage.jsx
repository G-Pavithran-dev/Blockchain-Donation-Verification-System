import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { PageContainer } from '@/components/layout/PageContainer';
import { Loading } from '@/components/shared/Loading';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import { getCampaignById, getNgoById } from '@/lib/api';
import { loadContractConfig, createWalletClientInstance, writeContract } from '@/lib/contracts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';

export function DonatePage() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  
  const [campaign, setCampaign] = useState(null);
  const [ngo, setNgo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [amount, setAmount] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCampaignInfo();
  }, [campaignId]);

  async function loadCampaignInfo() {
    try {
      setLoading(true);
      setError(null);
      
      const campaignData = await getCampaignById(campaignId);
      setCampaign(campaignData);
      
      const ngoData = await getNgoById(campaignData.ngoId);
      setNgo(ngoData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDonate(e) {
    e.preventDefault();
    
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!transactionRef.trim()) {
      toast.error('Please enter a transaction reference');
      return;
    }

    try {
      setSubmitting(true);
      toast.info('Loading contract configuration...');
      
      const config = await loadContractConfig();
      const walletClient = createWalletClientInstance();
      
      if (!walletClient) {
        throw new Error('Wallet client not available');
      }

      toast.info('Please confirm the transaction in your wallet...');
      
      const hash = await writeContract(
        walletClient,
        config.addresses.DonationLedger,
        config.abis.DonationLedger,
        'recordDonation',
        [BigInt(campaignId), BigInt(amount), transactionRef]
      );

      toast.success(`Donation recorded! Transaction: ${hash.slice(0, 10)}...`);
      
      // Navigate back to campaign detail
      setTimeout(() => {
        navigate(`/campaigns/${campaignId}`);
      }, 2000);
    } catch (err) {
      console.error('Donation error:', err);
      toast.error(err.message || 'Failed to record donation');
    } finally {
      setSubmitting(false);
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
        <ErrorMessage message={error} retry={loadCampaignInfo} />
      </PageContainer>
    );
  }

  if (!campaign) {
    return (
      <PageContainer>
        <ErrorMessage message="Campaign not found" />
      </PageContainer>
    );
  }

  const isActive = campaign.active && new Date(Number(campaign.endDate) * 1000) > new Date();

  if (!isActive) {
    return (
      <PageContainer>
        <Card>
          <CardHeader>
            <CardTitle>Campaign Ended</CardTitle>
            <CardDescription>
              This campaign is no longer accepting donations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to={`/campaigns/${campaignId}`}>
              <Button>View Campaign Details</Button>
            </Link>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-8 max-w-2xl mx-auto">
        {/* Back Button */}
        <Link to={`/campaigns/${campaignId}`}>
          <Button variant="ghost" size="sm">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Campaign
          </Button>
        </Link>

        {/* Donate Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Record your donation</CardTitle>
            <CardDescription>
              for <span className="font-semibold">{campaign.title}</span>
              {ngo && ` by ${ngo.name}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleDonate} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (in Wei)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="1000000000000000000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  disabled={submitting}
                />
                <p className="text-xs text-muted-foreground">
                  Note: 1 ETH = 1,000,000,000,000,000,000 Wei
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="transactionRef">Transaction Reference</Label>
                <Input
                  id="transactionRef"
                  type="text"
                  placeholder="UPI ID, Bank Reference, or Payment ID"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  required
                  disabled={submitting}
                />
                <p className="text-xs text-muted-foreground">
                  Enter your UPI ID, bank reference, or any payment identifier
                </p>
              </div>

              <div className="rounded-lg bg-muted p-4 text-sm">
                <p className="text-muted-foreground">
                  📝 You will sign a transaction with your wallet to record this donation on-chain.
                  This ensures complete transparency and traceability.
                </p>
              </div>

              <div className="flex gap-4">
                <Link to={`/campaigns/${campaignId}`} className="flex-1">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={submitting || !isConnected}
                >
                  {submitting ? 'Recording...' : 'Record Donation'}
                </Button>
              </div>

              {!isConnected && (
                <p className="text-sm text-center text-destructive">
                  Please connect your wallet to record a donation
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
