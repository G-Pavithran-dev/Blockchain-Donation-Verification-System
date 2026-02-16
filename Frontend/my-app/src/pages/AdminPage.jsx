import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Link } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { VerifiedBadge } from '@/components/shared/VerifiedBadge';
import { Loading } from '@/components/shared/Loading';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import { getNgoList } from '@/lib/api';
import { isAdmin } from '@/lib/role';
import { loadContractConfig, createWalletClientInstance, writeContract } from '@/lib/contracts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, Shield } from 'lucide-react';

export function AdminPage() {
  const { address, isConnected } = useAccount();
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTransferAdmin, setShowTransferAdmin] = useState(false);

  useEffect(() => {
    if (isConnected && address) {
      checkAdminAndLoadNgos();
    } else {
      setLoading(false);
    }
  }, [address, isConnected]);

  async function checkAdminAndLoadNgos() {
    try {
      setLoading(true);
      setError(null);

      const adminStatus = await isAdmin(address);
      setIsAdminUser(adminStatus);

      if (!adminStatus) {
        setLoading(false);
        return;
      }

      const data = await getNgoList();
      setNgos(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!isConnected) {
    return (
      <PageContainer>
        <EmptyState
          title="Wallet not connected"
          description="Please connect your wallet to access the admin panel."
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

  if (!isAdminUser) {
    return (
      <PageContainer>
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have admin privileges to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <ErrorMessage message={error} retry={checkAdminAndLoadNgos} />
      </PageContainer>
    );
  }

  const pendingNgos = ngos.filter(ngo => !ngo.verified);
  const verifiedNgos = ngos.filter(ngo => ngo.verified);

  return (
    <PageContainer>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Admin Panel</h1>
          </div>
          <p className="text-muted-foreground">
            Manage NGO verifications and system administration
          </p>
        </div>

        {/* Transfer Admin Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Transfer Admin Rights</CardTitle>
                <CardDescription>
                  Transfer admin privileges to another address
                </CardDescription>
              </div>
              <Button 
                variant="outline"
                onClick={() => setShowTransferAdmin(!showTransferAdmin)}
              >
                {showTransferAdmin ? 'Cancel' : 'Transfer Admin'}
              </Button>
            </div>
          </CardHeader>
          {showTransferAdmin && (
            <CardContent>
              <TransferAdminForm onSuccess={() => setShowTransferAdmin(false)} />
            </CardContent>
          )}
        </Card>

        {/* Pending NGOs */}
        <div>
          <h2 className="text-2xl font-bold mb-4">
            Pending Verifications
            {pendingNgos.length > 0 && (
              <Badge variant="outline" className="ml-2">
                {pendingNgos.length}
              </Badge>
            )}
          </h2>
          {pendingNgos.length === 0 ? (
            <EmptyState
              title="No pending verifications"
              description="All NGOs have been processed."
            />
          ) : (
            <div className="space-y-4">
              {pendingNgos.map((ngo) => (
                <NgoVerificationCard 
                  key={ngo.ngoId} 
                  ngo={ngo}
                  onUpdate={checkAdminAndLoadNgos}
                />
              ))}
            </div>
          )}
        </div>

        {/* Verified NGOs */}
        <div>
          <h2 className="text-2xl font-bold mb-4">
            Verified NGOs
            {verifiedNgos.length > 0 && (
              <Badge variant="default" className="ml-2">
                {verifiedNgos.length}
              </Badge>
            )}
          </h2>
          {verifiedNgos.length === 0 ? (
            <EmptyState
              title="No verified NGOs yet"
              description="Verify pending NGO registrations to get started."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {verifiedNgos.map((ngo) => (
                <Card key={ngo.ngoId}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{ngo.name}</CardTitle>
                        <CardDescription className="text-xs font-mono truncate mt-1">
                          {ngo.wallet}
                        </CardDescription>
                      </div>
                      <VerifiedBadge verified={true} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-muted-foreground">Registration:</span> {ngo.registrationNumber}</p>
                      {ngo.panNumber && (
                        <p><span className="text-muted-foreground">PAN:</span> {ngo.panNumber}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

function NgoVerificationCard({ ngo, onUpdate }) {
  const [processing, setProcessing] = useState(false);

  async function handleVerify() {
    try {
      setProcessing(true);
      toast.info('Loading contract configuration...');

      const config = await loadContractConfig();
      const walletClient = createWalletClientInstance();

      if (!walletClient) {
        throw new Error('Wallet client not available');
      }

      toast.info('Please confirm the transaction in your wallet...');

      const hash = await writeContract(
        walletClient,
        config.addresses.VerificationLedger,
        config.abis.VerificationLedger,
        'verifyNGO',
        [BigInt(ngo.ngoId)]
      );

      toast.success(`NGO verified! Transaction: ${hash.slice(0, 10)}...`);
      
      setTimeout(() => {
        onUpdate?.();
      }, 2000);
    } catch (err) {
      console.error('Verify error:', err);
      toast.error(err.message || 'Failed to verify NGO');
    } finally {
      setProcessing(false);
    }
  }

  async function handleReject() {
    try {
      setProcessing(true);
      toast.info('Loading contract configuration...');

      const config = await loadContractConfig();
      const walletClient = createWalletClientInstance();

      if (!walletClient) {
        throw new Error('Wallet client not available');
      }

      toast.info('Please confirm the transaction in your wallet...');

      const hash = await writeContract(
        walletClient,
        config.addresses.VerificationLedger,
        config.abis.VerificationLedger,
        'rejectNGO',
        [BigInt(ngo.ngoId)]
      );

      toast.success(`NGO rejected! Transaction: ${hash.slice(0, 10)}...`);
      
      setTimeout(() => {
        onUpdate?.();
      }, 2000);
    } catch (err) {
      console.error('Reject error:', err);
      toast.error(err.message || 'Failed to reject NGO');
    } finally {
      setProcessing(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle>{ngo.name}</CardTitle>
            <CardDescription className="mt-1">
              <div className="space-y-1">
                <p>Registration: {ngo.registrationNumber}</p>
                {ngo.panNumber && <p>PAN: {ngo.panNumber}</p>}
                <p className="text-xs font-mono truncate">{ngo.wallet}</p>
              </div>
            </CardDescription>
          </div>
          <VerifiedBadge verified={false} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Button
            onClick={handleVerify}
            disabled={processing}
            className="flex-1"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Verify
          </Button>
          <Button
            onClick={handleReject}
            disabled={processing}
            variant="destructive"
            className="flex-1"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function TransferAdminForm({ onSuccess }) {
  const [newAdminAddress, setNewAdminAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!newAdminAddress.trim()) {
      toast.error('Please enter a valid address');
      return;
    }

    if (!newAdminAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      toast.error('Invalid Ethereum address format');
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
        config.addresses.VerificationLedger,
        config.abis.VerificationLedger,
        'transferAdmin',
        [newAdminAddress]
      );

      toast.success(`Admin transferred! Transaction: ${hash.slice(0, 10)}...`);
      
      setNewAdminAddress('');
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (err) {
      console.error('Transfer admin error:', err);
      toast.error(err.message || 'Failed to transfer admin');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="newAdmin">New Admin Address</Label>
        <Input
          id="newAdmin"
          value={newAdminAddress}
          onChange={(e) => setNewAdminAddress(e.target.value)}
          placeholder="0x..."
          required
          disabled={submitting}
        />
        <p className="text-xs text-muted-foreground">
          Enter the Ethereum address of the new admin
        </p>
      </div>

      <div className="rounded-lg bg-destructive/10 border border-destructive p-4 text-sm">
        <p className="text-destructive font-semibold">⚠️ Warning</p>
        <p className="text-muted-foreground mt-1">
          Transferring admin rights will revoke your admin privileges permanently.
          Make sure you trust the new admin address.
        </p>
      </div>

      <Button type="submit" disabled={submitting} variant="destructive" className="w-full">
        {submitting ? 'Transferring...' : 'Transfer Admin Rights'}
      </Button>
    </form>
  );
}
