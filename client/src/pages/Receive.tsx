import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Copy, QrCode } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Receive() {
  const walletQuery = trpc.wallet.get.useQuery();

  const copyAddress = () => {
    if (walletQuery.data?.address) {
      navigator.clipboard.writeText(walletQuery.data.address);
      toast.success("Address copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5">
      <header className="bg-card/80 backdrop-blur-sm border-b">
        <div className="container py-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Receive USDT</h1>
        </div>
      </header>

      <main className="container py-6 max-w-lg">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Receive USDT</CardTitle>
            <CardDescription>
              Share your Tron address to receive USDT (TRC20)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {walletQuery.isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading wallet...</p>
              </div>
            ) : walletQuery.data ? (
              <>
                {/* QR Code Placeholder */}
                <div className="flex justify-center">
                  <div className="w-64 h-64 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center border-4 border-white shadow-xl">
                    <div className="text-center">
                      <QrCode className="h-16 w-16 mx-auto mb-4 text-primary" />
                      <p className="text-sm text-muted-foreground">QR Code</p>
                      <p className="text-xs text-muted-foreground">(Coming Soon)</p>
                    </div>
                  </div>
                </div>

                {/* Address Display */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Your Tron Address</p>
                  <div className="relative">
                    <div className="p-4 bg-muted/50 rounded-lg border-2 border-dashed">
                      <p className="font-mono text-sm break-all text-center">
                        {walletQuery.data.address}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute -top-2 -right-2 bg-card shadow-md"
                      onClick={copyAddress}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Copy Button */}
                <Button
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  size="lg"
                  onClick={copyAddress}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Address
                </Button>

                {/* Instructions */}
                <div className="space-y-3 text-sm">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="font-semibold mb-2 text-blue-900 dark:text-blue-100">
                      📋 How to receive USDT:
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-blue-800 dark:text-blue-200">
                      <li>Copy your Tron address above</li>
                      <li>Share it with the sender</li>
                      <li>Wait for the transaction to confirm</li>
                      <li>Your balance will update automatically</li>
                    </ol>
                  </div>

                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <p className="font-semibold mb-2 text-yellow-900 dark:text-yellow-100">
                      ⚠️ Important:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-yellow-800 dark:text-yellow-200">
                      <li>Only send USDT (TRC20) to this address</li>
                      <li>Sending other tokens may result in loss</li>
                      <li>Network: Tron (TRC20)</li>
                    </ul>
                  </div>
                </div>

                {/* Current Balance */}
                <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
                  <p className="text-2xl font-bold">
                    {walletQuery.data.balance} USDT
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No wallet found</p>
                <Link href="/">
                  <Button className="mt-4">Go to Home</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

