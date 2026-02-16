import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/layout/PageContainer';
import { ArrowRight, Shield, Eye, Zap } from 'lucide-react';

export function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-linear-to-b from-primary/10 to-background py-20">
        <PageContainer>
          <div className="mx-auto max-w-3xl text-center space-y-8">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Transparent giving.
              <br />
              <span className="text-primary">Verified NGOs.</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              CivicTrust ensures every donation is transparent and traceable.
              Connect with verified NGOs and make a difference with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/ngos">
                <Button size="lg" className="w-full sm:w-auto">
                  Browse NGOs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/campaigns">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Browse Campaigns
                </Button>
              </Link>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <PageContainer>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground">
              Three simple steps to make a transparent donation
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="rounded-full bg-primary/10 p-4">
                <Eye className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">1. Browse</h3>
              <p className="text-muted-foreground">
                Explore verified NGOs and their active campaigns. See exactly where your donation will go.
              </p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="rounded-full bg-primary/10 p-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">2. Connect</h3>
              <p className="text-muted-foreground">
                Connect your wallet to register as an NGO or make a donation safely and securely.
              </p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="rounded-full bg-primary/10 p-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">3. Donate</h3>
              <p className="text-muted-foreground">
                Record your donation on the blockchain for complete transparency and traceability.
              </p>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 py-16">
        <PageContainer>
          <div className="mx-auto max-w-2xl text-center space-y-6">
            <h2 className="text-3xl font-bold">Ready to get started?</h2>
            <p className="text-lg text-muted-foreground">
              Connect your wallet to start donating or register your NGO today.
            </p>
            <Link to="/dashboard">
              <Button size="lg">
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </PageContainer>
      </section>
    </div>
  );
}
