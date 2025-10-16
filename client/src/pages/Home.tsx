import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowUpRight, CreditCard, Wallet, TrendingUp, Send, History, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [walletData, setWalletData] = useState<any>(null);
  
  const walletQuery = trpc.wallet.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const cardsQuery = trpc.cards.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const transactionsQuery = trpc.transactions.list.useQuery(
    { limit: 5 },
    { enabled: isAuthenticated }
  );

  const createWalletMutation = trpc.wallet.create.useMutation({
    onSuccess: () => {
      walletQuery.refetch();
    },
  });

  useEffect(() => {
    if (walletQuery.data) {
      setWalletData(walletQuery.data);
    }
  }, [walletQuery.data]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-accent/5">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-accent/5 to-primary/5 p-4">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="space-y-4">
            {APP_LOGO && (
              <img src={APP_LOGO} alt={APP_TITLE} className="h-20 w-20 mx-auto rounded-2xl shadow-lg" />
            )}
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {APP_TITLE}
            </h1>
            <p className="text-lg text-muted-foreground">
              Your Web3 Banking Solution
            </p>
          </div>

          <Card className="border-2 shadow-xl">
            <CardHeader>
              <CardTitle>Welcome to Daur Finance</CardTitle>
              <CardDescription>
                Manage your crypto assets and virtual cards in one place
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex flex-col items-center p-3 bg-accent/10 rounded-lg">
                  <Wallet className="h-6 w-6 text-primary mb-2" />
                  <span className="font-medium">USDT Wallet</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-accent/10 rounded-lg">
                  <CreditCard className="h-6 w-6 text-primary mb-2" />
                  <span className="font-medium">Virtual Cards</span>
                </div>
              </div>
              
              <Button 
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                size="lg"
                onClick={() => window.location.href = getLoginUrl()}
              >
                Get Started
              </Button>
            </CardContent>
          </Card>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>🔒 Secure & Encrypted</p>
            <p>⚡ Powered by Tron & Stripe</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {APP_LOGO && (
              <img src={APP_LOGO} alt={APP_TITLE} className="h-10 w-10 rounded-lg" />
            )}
            <div>
              <h1 className="text-lg font-bold">{APP_TITLE}</h1>
              <p className="text-xs text-muted-foreground">Welcome, {user?.name || 'User'}</p>
            </div>
          </div>
          <Link href="/profile">
            <Button variant="ghost" size="sm">
              <Shield className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="container py-6 space-y-6">
        {/* Balance Card */}
        <Card className="bg-gradient-to-br from-primary to-accent text-primary-foreground border-0 shadow-xl">
          <CardHeader>
            <CardDescription className="text-primary-foreground/80">Total Balance</CardDescription>
            <CardTitle className="text-4xl font-bold">
              {walletData ? `${walletData.balance} USDT` : '---'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!walletData && !walletQuery.isLoading && (
              <Button 
                variant="secondary" 
                onClick={() => createWalletMutation.mutate()}
                disabled={createWalletMutation.isPending}
              >
                {createWalletMutation.isPending ? 'Creating...' : 'Create Wallet'}
              </Button>
            )}
            {walletData && (
              <div className="space-y-2">
                <p className="text-sm text-primary-foreground/80">Wallet Address</p>
                <p className="text-xs font-mono bg-black/20 p-2 rounded break-all">
                  {walletData.address}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/send">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
              <CardContent className="pt-6 text-center space-y-2">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Send className="h-6 w-6 text-primary" />
                </div>
                <p className="font-semibold">Send</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/receive">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-accent">
              <CardContent className="pt-6 text-center space-y-2">
                <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                  <ArrowUpRight className="h-6 w-6 text-accent rotate-180" />
                </div>
                <p className="font-semibold">Receive</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/cards">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
              <CardContent className="pt-6 text-center space-y-2">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <p className="font-semibold">Cards</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/transactions">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-accent">
              <CardContent className="pt-6 text-center space-y-2">
                <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                  <History className="h-6 w-6 text-accent" />
                </div>
                <p className="font-semibold">History</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Transactions</span>
              <Link href="/transactions">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transactionsQuery.isLoading ? (
              <p className="text-center text-muted-foreground py-4">Loading...</p>
            ) : transactionsQuery.data && transactionsQuery.data.length > 0 ? (
              <div className="space-y-3">
                {transactionsQuery.data.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        tx.type === 'deposit' || tx.type === 'card_refund' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {tx.type === 'deposit' || tx.type === 'card_refund' ? '↓' : '↑'}
                      </div>
                      <div>
                        <p className="font-medium capitalize">{tx.type.replace('_', ' ')}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tx.createdAt!).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        tx.type === 'deposit' || tx.type === 'card_refund' 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {tx.type === 'deposit' || tx.type === 'card_refund' ? '+' : '-'}
                        {tx.amount} {tx.currency}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">{tx.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No transactions yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cards Section */}
        {cardsQuery.data && cardsQuery.data.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Your Cards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cardsQuery.data.map((card) => (
                  <div key={card.id} className="p-4 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-xl">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-sm opacity-80">{card.brand}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        card.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                      }`}>
                        {card.status}
                      </span>
                    </div>
                    <p className="text-lg font-mono mb-2">•••• •••• •••• {card.last4}</p>
                    <p className="text-sm">{card.cardholderName}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

