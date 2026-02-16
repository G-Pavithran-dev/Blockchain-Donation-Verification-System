import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Link } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { RoleBadge } from '@/components/shared/RoleBadge';
import { CampaignCard } from '@/components/shared/CampaignCard';
import { Loading } from '@/components/shared/Loading';
import { EmptyState } from '@/components/shared/EmptyState';
import { getUserRole, getNgoByAddress } from '@/lib/role';
import { getCampaignsByNgo } from '@/lib/api';
import { loadContractConfig, createWalletClientInstance, writeContract } from '@/lib/contracts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Building2, User, Shield } from 'lucide-react';

export function DashboardPage() {
  const { address, isConnected } = useAccount();
  const [role, setRole] = useState(null);
  const [ngo, setNgo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isConnected && address) {
      loadUserRole();
    } else {
      setLoading(false);
    }
  }, [address, isConnected]);

  async function loadUserRole() {
    try {
      setLoading(true);
      const userRole = await getUserRole(address);
      setRole(userRole);

      if (userRole === 'ngo') {
        const ngoData = await getNgoByAddress(address);
        setNgo(ngoData);
      }
    } catch (err) {
      console.error('Error loading role:', err);
    } finally {
      setLoading(false);
    }
  }

  if (!isConnected) {
    return (
      <PageContainer>
        <EmptyState
          title="Wallet not connected"
          description="Please connect your wallet to access the dashboard."
        />
      </PageContainer>
    );
  }

  if (loading) {
    return (
      <PageContainer>
        <Loading count={1} type="card" />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Connected as {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
          </div>
          <RoleBadge role={role} ngoName={ngo?.name} />
        </div>

        {/* Role-specific content */}
        {role === 'admin' && <AdminDashboard address={address} />}
        {role === 'ngo' && <NgoDashboard ngo={ngo} address={address} />}
        {role === 'donor' && <DonorDashboard address={address} />}
      </div>
    </PageContainer>
  );
}

function DonorDashboard({ address }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Donor Dashboard
        </CardTitle>
        <CardDescription>
          Browse campaigns and make a difference
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          Thank you for your interest in supporting verified NGOs. Browse active campaigns
          and record your donations on the blockchain for complete transparency.
        </p>
        <div className="flex gap-4">
          <Link to="/campaigns" className="flex-1">
            <Button className="w-full">Browse Campaigns</Button>
          </Link>
          <Link to="/ngos" className="flex-1">
            <Button variant="outline" className="w-full">Browse NGOs</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function NgoDashboard({ ngo, address }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (ngo?.ngoId) {
      loadCampaigns();
    }
  }, [ngo?.ngoId]);

  async function loadCampaigns() {
    try {
      setLoadingCampaigns(true);
      const data = await getCampaignsByNgo(ngo.ngoId);
      setCampaigns(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading campaigns:', err);
    } finally {
      setLoadingCampaigns(false);
    }
  }

  if (!ngo?.verified) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            NGO Dashboard
          </CardTitle>
          <CardDescription>Your registration is pending verification</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Your NGO registration has been submitted and is awaiting admin verification.
            Once verified, you'll be able to create campaigns and receive donations.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                NGO Dashboard: {ngo.name}
              </CardTitle>
              <CardDescription>Manage your campaigns</CardDescription>
            </div>
            <Button onClick={() => setShowCreateForm(!showCreateForm)}>
              {showCreateForm ? 'Cancel' : 'Create Campaign'}
            </Button>
          </div>
        </CardHeader>
        {showCreateForm && (
          <CardContent>
            <CreateCampaignForm 
              ngoId={ngo.ngoId} 
              onSuccess={() => {
                setShowCreateForm(false);
                loadCampaigns();
              }} 
            />
          </CardContent>
        )}
      </Card>

      <div>
        <h2 className="text-2xl font-bold mb-4">My Campaigns</h2>
        {loadingCampaigns && <Loading count={3} type="card" />}
        {!loadingCampaigns && campaigns.length === 0 && (
          <EmptyState
            title="No campaigns yet"
            description="Create your first campaign to start receiving donations."
            action={
              <Button onClick={() => setShowCreateForm(true)}>
                Create Campaign
              </Button>
            }
          />
        )}
        {!loadingCampaigns && campaigns.length > 0 && (
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
  );
}

function AdminDashboard({ address }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Admin Dashboard
        </CardTitle>
        <CardDescription>
          Manage NGO verifications and system administration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          You have admin privileges. Use the admin panel to verify NGO registrations
          and manage the system.
        </p>
        <Link to="/admin">
          <Button className="w-full sm:w-auto">Go to Admin Panel</Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function CreateCampaignForm({ ngoId, onSuccess }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !endDate) {
      toast.error('Please fill in all fields');
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

      // Convert date to Unix timestamp
      const timestamp = Math.floor(new Date(endDate).getTime() / 1000);

      toast.info('Please confirm the transaction in your wallet...');

      const hash = await writeContract(
        walletClient,
        config.addresses.CampaignLedger,
        config.abis.CampaignLedger,
        'createCampaign',
        [title, description, BigInt(timestamp)]
      );

      toast.success(`Campaign created! Transaction: ${hash.slice(0, 10)}...`);
      
      // Reset form
      setTitle('');
      setDescription('');
      setEndDate('');
      
      // Call success callback
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (err) {
      console.error('Create campaign error:', err);
      toast.error(err.message || 'Failed to create campaign');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Campaign Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter campaign title"
          required
          disabled={submitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your campaign"
          required
          disabled={submitting}
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="endDate">End Date</Label>
        <Input
          id="endDate"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
          disabled={submitting}
          min={new Date().toISOString().split('T')[0]}
        />
      </div>

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? 'Creating...' : 'Create Campaign'}
      </Button>
    </form>
  );
}

function Textarea({ className = '', ...props }) {
  return (
    <textarea
      className={`flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}
