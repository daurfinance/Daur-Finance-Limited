import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Send as SendIcon } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

export default function Send() {
  const [, setLocation] = useLocation();
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");

  const walletQuery = trpc.wallet.getBalance.useQuery();
  const sendMutation = trpc.wallet.send.useMutation({
    onSuccess: (data) => {
      toast.success("Transaction sent successfully!", {
        description: `TX: ${data.txHash?.substring(0, 10)}...`,
      });
      setToAddress("");
      setAmount("");
      setTimeout(() => setLocation("/"), 1500);
    },
    onError: (error) => {
      toast.error("Transaction failed", {
        description: error.message,
      });
    },
  });

  const handleSend = () => {
    if (!toAddress || !amount) {
      toast.error("Please fill in all fields");
      return;
    }

    if (parseFloat(amount) <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }

    if (walletQuery.data && parseFloat(amount) > parseFloat(walletQuery.data.usdt)) {
      toast.error("Insufficient balance");
      return;
    }

    sendMutation.mutate({ toAddress, amount });
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
          <h1 className="text-xl font-bold">Send USDT</h1>
        </div>
      </header>

      <main className="container py-6 max-w-lg">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Send USDT</CardTitle>
            <CardDescription>
              Transfer USDT to any Tron address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Balance Display */}
            <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
              <p className="text-2xl font-bold">
                {walletQuery.isLoading ? "..." : `${walletQuery.data?.usdt || "0"} USDT`}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Network Fee: ~14 TRX ({walletQuery.data?.trx || "0"} TRX available)
              </p>
            </div>

            {/* Recipient Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Recipient Address</Label>
              <Input
                id="address"
                placeholder="T... (Tron address)"
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                className="font-mono text-sm"
              />
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USDT)</Label>
              <div className="relative">
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pr-20"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8"
                  onClick={() => {
                    if (walletQuery.data?.usdt) {
                      setAmount(walletQuery.data.usdt);
                    }
                  }}
                >
                  Max
                </Button>
              </div>
            </div>

            {/* Transaction Summary */}
            {amount && parseFloat(amount) > 0 && (
              <div className="p-4 bg-muted/50 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-semibold">{amount} USDT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Network Fee</span>
                  <span className="font-semibold">~14 TRX</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-semibold">You will send</span>
                  <span className="font-bold text-primary">{amount} USDT</span>
                </div>
              </div>
            )}

            {/* Send Button */}
            <Button
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
              size="lg"
              onClick={handleSend}
              disabled={sendMutation.isPending || !toAddress || !amount}
            >
              {sendMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <SendIcon className="h-4 w-4 mr-2" />
                  Send USDT
                </>
              )}
            </Button>

            {/* Warning */}
            <div className="text-xs text-muted-foreground bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded border border-yellow-200 dark:border-yellow-800">
              ⚠️ Please double-check the recipient address. Transactions on the blockchain cannot be reversed.
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

