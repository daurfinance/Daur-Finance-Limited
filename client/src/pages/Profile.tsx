import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, CheckCircle, Clock, XCircle, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Profile() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const kycQuery = trpc.kyc.getStatus.useQuery();

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const getKYCStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-12 w-12 text-green-500" />;
      case 'pending':
        return <Clock className="h-12 w-12 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="h-12 w-12 text-red-500" />;
      default:
        return <Clock className="h-12 w-12 text-gray-400" />;
    }
  };

  const getKYCStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'pending':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'rejected':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
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
          <h1 className="text-xl font-bold">Profile & Settings</h1>
        </div>
      </header>

      <main className="container py-6 max-w-2xl space-y-6">
        {/* User Info */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl font-bold">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <p className="font-semibold text-lg">{user?.name || 'User'}</p>
                <p className="text-sm text-muted-foreground">{user?.email || 'No email'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground">User ID</p>
                <p className="font-mono text-xs">{user?.id.substring(0, 12)}...</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Login Method</p>
                <p className="text-sm capitalize">{user?.loginMethod || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KYC Status */}
        <Card>
          <CardHeader>
            <CardTitle>Verification Status</CardTitle>
            <CardDescription>
              Complete KYC to unlock all features
            </CardDescription>
          </CardHeader>
          <CardContent>
            {kycQuery.isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : (
              <div className={`p-6 rounded-lg border-2 ${getKYCStatusColor(kycQuery.data?.status || 'pending')}`}>
                <div className="flex items-center gap-4 mb-4">
                  {getKYCStatusIcon(kycQuery.data?.status || 'pending')}
                  <div>
                    <p className="font-semibold text-lg capitalize">
                      {kycQuery.data?.status || 'Not Started'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {kycQuery.data?.status === 'verified' && 'Your account is fully verified'}
                      {kycQuery.data?.status === 'pending' && 'Your documents are under review'}
                      {kycQuery.data?.status === 'rejected' && 'Verification was not successful'}
                      {!kycQuery.data?.status && 'Start verification to access all features'}
                    </p>
                  </div>
                </div>

                {kycQuery.data?.status !== 'verified' && (
                  <Button className="w-full" variant="outline">
                    {kycQuery.data?.status === 'pending' ? 'View Status' : 'Start Verification'}
                  </Button>
                )}
              </div>
            )}

            {/* KYC Benefits */}
            <div className="mt-6 space-y-3">
              <p className="font-semibold text-sm">Benefits of Verification:</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Higher transaction limits</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Issue physical cards</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Access to premium features</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              Security & Privacy
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Notifications
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Language & Region
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Help & Support
            </Button>
          </CardContent>
        </Card>

        {/* Logout */}
        <Card>
          <CardContent className="pt-6">
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </CardContent>
        </Card>

        {/* App Info */}
        <div className="text-center text-sm text-muted-foreground space-y-1 pb-6">
          <p>Daur Finance Limited</p>
          <p>Version 1.0.0</p>
          <p className="text-xs">Powered by Tron & Stripe</p>
        </div>
      </main>
    </div>
  );
}

