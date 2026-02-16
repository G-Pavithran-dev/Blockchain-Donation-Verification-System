import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { loadContractConfig, createWalletClientInstance, writeContract } from '@/lib/contracts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export function RegisterNgoPage() {
  const { address, isConnected } = useAccount();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!name.trim() || !registrationNumber.trim() || !panNumber.trim()) {
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

      toast.info('Please confirm the transaction in your wallet...');

      const hash = await writeContract(
        walletClient,
        config.addresses.VerificationLedger,
        config.abis.VerificationLedger,
        'registerNGO',
        [name, registrationNumber, panNumber]
      );

      toast.success(`NGO registered! Transaction: ${hash.slice(0, 10)}...`);
      toast.info('Please wait for admin verification');

      // Reset form
      setName('');
      setRegistrationNumber('');
      setPanNumber('');

      // Navigate to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (err) {
      console.error('Registration error:', err);
      toast.error(err.message || 'Failed to register NGO');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold">Register Your NGO</h1>
          <p className="text-muted-foreground mt-2">
            Join CivicTrust as a verified non-profit organization
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>NGO Registration Form</CardTitle>
            <CardDescription>
              Fill in your organization details. Your registration will be reviewed by an admin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Organization Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your NGO name"
                  required
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="registrationNumber">Registration Number</Label>
                <Input
                  id="registrationNumber"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  placeholder="Enter government registration number"
                  required
                  disabled={submitting}
                />
                <p className="text-xs text-muted-foreground">
                  Your official NGO/Trust registration number
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="panNumber">PAN Number</Label>
                <Input
                  id="panNumber"
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value)}
                  placeholder="Enter PAN number"
                  required
                  disabled={submitting}
                />
                <p className="text-xs text-muted-foreground">
                  Permanent Account Number for your organization
                </p>
              </div>

              {isConnected && (
                <div className="rounded-lg bg-muted p-4 text-sm">
                  <p className="font-semibold mb-1">Connected Wallet</p>
                  <p className="text-xs font-mono text-muted-foreground">
                    {address}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    This wallet address will be linked to your NGO registration
                  </p>
                </div>
              )}

              <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4 text-sm">
                <p className="text-blue-900 dark:text-blue-100">
                  📝 After submission, your registration will be reviewed by an admin.
                  Once verified, you'll be able to create campaigns and receive donations.
                </p>
              </div>

              <Button 
                type="submit" 
                disabled={submitting || !isConnected}
                className="w-full"
                size="lg"
              >
                {submitting ? 'Registering...' : 'Register NGO'}
              </Button>

              {!isConnected && (
                <p className="text-sm text-center text-destructive">
                  Please connect your wallet to register your NGO
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
