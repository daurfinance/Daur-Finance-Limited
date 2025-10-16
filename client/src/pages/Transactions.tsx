import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, ExternalLink, Filter } from "lucide-react";
import { Link } from "wouter";

export default function Transactions() {
  const transactionsQuery = trpc.transactions.list.useQuery({ limit: 100 });

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'card_refund':
        return '↓';
      case 'withdrawal':
      case 'transfer':
      case 'card_payment':
        return '↑';
      default:
        return '•';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'card_refund':
        return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
      case 'withdrawal':
      case 'transfer':
      case 'card_payment':
        return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 dark:text-green-400';
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'failed':
      case 'canceled':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5">
      <header className="bg-card/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">Transaction History</h1>
          </div>
          
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-1" />
            Filter
          </Button>
        </div>
      </header>

      <main className="container py-6 max-w-4xl">
        {transactionsQuery.isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading transactions...</p>
          </div>
        ) : transactionsQuery.data && transactionsQuery.data.length > 0 ? (
          <div className="space-y-4">
            {transactionsQuery.data.map((tx) => (
              <Card key={tx.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 text-xl font-bold ${getTransactionColor(tx.type)}`}>
                      {getTransactionIcon(tx.type)}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <p className="font-semibold capitalize">
                            {tx.type.replace('_', ' ')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : 'N/A'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold text-lg ${
                            tx.type === 'deposit' || tx.type === 'card_refund' 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {tx.type === 'deposit' || tx.type === 'card_refund' ? '+' : '-'}
                            {tx.amount} {tx.currency}
                          </p>
                          <p className={`text-xs font-medium capitalize ${tx.status ? getStatusColor(tx.status) : ''}`}>
                            {tx.status || 'unknown'}
                          </p>
                        </div>
                      </div>

                      {/* Additional Info */}
                      {tx.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {tx.description}
                        </p>
                      )}

                      {/* Addresses */}
                      <div className="space-y-1 text-xs">
                        {tx.fromAddress && (
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">From:</span>
                            <code className="bg-muted px-2 py-0.5 rounded font-mono">
                              {tx.fromAddress.substring(0, 10)}...{tx.fromAddress.substring(tx.fromAddress.length - 8)}
                            </code>
                          </div>
                        )}
                        {tx.toAddress && (
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">To:</span>
                            <code className="bg-muted px-2 py-0.5 rounded font-mono">
                              {tx.toAddress.substring(0, 10)}...{tx.toAddress.substring(tx.toAddress.length - 8)}
                            </code>
                          </div>
                        )}
                      </div>

                      {/* Transaction Hash */}
                      {tx.txHash && (
                        <div className="mt-2 flex items-center gap-2">
                          <a
                            href={`https://tronscan.org/#/transaction/${tx.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                          >
                            View on Tronscan
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="max-w-lg mx-auto">
            <CardContent className="text-center py-12">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📊</span>
              </div>
              <p className="text-lg font-semibold mb-2">No Transactions Yet</p>
              <p className="text-muted-foreground mb-6">
                Your transaction history will appear here
              </p>
              <Link href="/">
                <Button>Go to Home</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

