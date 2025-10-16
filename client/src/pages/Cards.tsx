import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, CreditCard, Plus } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Cards() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [cardType, setCardType] = useState<"virtual" | "physical">("virtual");
  const [spendingLimit, setSpendingLimit] = useState("");

  const cardsQuery = trpc.cards.list.useQuery();
  const createCardMutation = trpc.cards.create.useMutation({
    onSuccess: () => {
      toast.success("Card created successfully!");
      setIsCreateDialogOpen(false);
      cardsQuery.refetch();
    },
    onError: (error) => {
      toast.error("Failed to create card", {
        description: error.message,
      });
    },
  });

  const handleCreateCard = () => {
    createCardMutation.mutate({
      type: cardType,
      spendingLimit: spendingLimit || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5">
      <header className="bg-card/80 backdrop-blur-sm border-b">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">My Cards</h1>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-to-r from-primary to-accent">
                <Plus className="h-4 w-4 mr-1" />
                New Card
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Card</DialogTitle>
                <DialogDescription>
                  Issue a new virtual or physical card
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Card Type</Label>
                  <Select value={cardType} onValueChange={(v) => setCardType(v as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="virtual">Virtual Card</SelectItem>
                      <SelectItem value="physical">Physical Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Monthly Spending Limit (Optional)</Label>
                  <Input
                    type="number"
                    placeholder="1000"
                    value={spendingLimit}
                    onChange={(e) => setSpendingLimit(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty for no limit
                  </p>
                </div>

                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800 text-xs">
                  ⚠️ This feature requires Stripe Issuing API configuration
                </div>

                <Button
                  className="w-full"
                  onClick={handleCreateCard}
                  disabled={createCardMutation.isPending}
                >
                  {createCardMutation.isPending ? "Creating..." : "Create Card"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="container py-6 max-w-4xl">
        {cardsQuery.isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading cards...</p>
          </div>
        ) : cardsQuery.data && cardsQuery.data.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {cardsQuery.data.map((card) => (
              <Card key={card.id} className="overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-slate-800 via-slate-900 to-black text-white p-6 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs opacity-70 uppercase tracking-wider">
                        {card.brand || "Card"}
                      </p>
                      <p className="text-lg font-bold mt-1">Daur Finance</p>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-semibold ${
                      card.status === 'active' 
                        ? 'bg-green-500' 
                        : card.status === 'inactive'
                        ? 'bg-yellow-500'
                        : 'bg-gray-500'
                    }`}>
                      {card.status}
                    </div>
                  </div>

                  <div>
                    <p className="text-2xl font-mono tracking-wider mb-3">
                      •••• •••• •••• {card.last4}
                    </p>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-xs opacity-70">Cardholder</p>
                        <p className="text-sm font-semibold">{card.cardholderName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs opacity-70">Expires</p>
                        <p className="text-sm font-semibold">
                          {card.expiryMonth?.toString().padStart(2, '0')}/{card.expiryYear?.toString().slice(-2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <CardContent className="pt-4">
                  <div className="space-y-3">
                    {card.spendingLimit && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Monthly Limit</span>
                        <span className="font-semibold">${card.spendingLimit}</span>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" size="sm">
                        View Details
                      </Button>
                      {card.status === 'active' && (
                        <Button variant="outline" className="flex-1" size="sm">
                          Freeze
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="max-w-lg mx-auto">
            <CardHeader>
              <CardTitle>No Cards Yet</CardTitle>
              <CardDescription>
                Create your first virtual or physical card to start spending
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-12 w-12 text-primary" />
              </div>
              <p className="text-muted-foreground mb-6">
                Issue cards instantly and manage them from your phone
              </p>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-primary to-accent">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Card
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Card</DialogTitle>
                    <DialogDescription>
                      Issue a new virtual or physical card
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Card Type</Label>
                      <Select value={cardType} onValueChange={(v) => setCardType(v as any)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="virtual">Virtual Card</SelectItem>
                          <SelectItem value="physical">Physical Card</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Monthly Spending Limit (Optional)</Label>
                      <Input
                        type="number"
                        placeholder="1000"
                        value={spendingLimit}
                        onChange={(e) => setSpendingLimit(e.target.value)}
                      />
                    </div>

                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800 text-xs">
                      ⚠️ This feature requires Stripe Issuing API configuration
                    </div>

                    <Button
                      className="w-full"
                      onClick={handleCreateCard}
                      disabled={createCardMutation.isPending}
                    >
                      {createCardMutation.isPending ? "Creating..." : "Create Card"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card className="mt-6 max-w-lg mx-auto">
          <CardHeader>
            <CardTitle className="text-lg">About Daur Cards</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                ✓
              </div>
              <div>
                <p className="font-semibold">Instant Issuance</p>
                <p className="text-muted-foreground">Get virtual cards instantly</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                ✓
              </div>
              <div>
                <p className="font-semibold">Spending Controls</p>
                <p className="text-muted-foreground">Set limits and freeze anytime</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                ✓
              </div>
              <div>
                <p className="font-semibold">Global Acceptance</p>
                <p className="text-muted-foreground">Use anywhere Visa/Mastercard is accepted</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

