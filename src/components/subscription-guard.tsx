import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Lock, Crown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SubscriptionModal } from "./subscription-modal";
import {
  getSubscription,
  getFeatureAccess,
  isSubscriptionActive,
  type Subscription,
} from "@/lib/store";

interface SubscriptionGuardProps {
  children: React.ReactNode;
  feature?: keyof ReturnType<typeof getFeatureAccess>;
  fallback?: React.ReactNode;
}

export function SubscriptionGuard({ children, feature, fallback }: SubscriptionGuardProps) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const sub = getSubscription();
    setSubscription(sub);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Check if subscription is active
  if (!isSubscriptionActive()) {
    if (fallback) return <>{fallback}</>;

    return (
      <div className="flex items-center justify-center min-h-[400px] p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Subscription Required</CardTitle>
            <CardDescription>
              Your subscription has expired. Please renew to continue using this feature.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-1">Monthly Subscription</p>
              <p className="text-3xl font-bold">K200</p>
              <p className="text-xs text-muted-foreground">per month</p>
            </div>
            <Button className="w-full" size="lg" onClick={() => setShowModal(true)}>
              <Crown className="h-4 w-4 mr-2" />
              Renew Subscription
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
        <SubscriptionModal open={showModal} onOpenChange={setShowModal} />
      </div>
    );
  }

  // Check specific feature access
  if (feature) {
    const features = getFeatureAccess();
    if (!features[feature]) {
      if (fallback) return <>{fallback}</>;

      return (
        <div className="flex items-center justify-center min-h-[400px] p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center mb-4">
                <Crown className="h-6 w-6 text-warning" />
              </div>
              <CardTitle>Upgrade Required</CardTitle>
              <CardDescription>
                This feature is not available on your current plan. Upgrade to Premium to unlock all features.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">Premium Plan includes:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Advanced Analytics</li>
                  <li>• Data Export</li>
                  <li>• Unlimited Staff</li>
                  <li>• Priority Support</li>
                </ul>
              </div>
              <Button className="w-full" size="lg" onClick={() => setShowModal(true)}>
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Premium
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
          <SubscriptionModal open={showModal} onOpenChange={setShowModal} />
        </div>
      );
    }
  }

  return <>{children}</>;
}

// Hook to check subscription status
export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [features, setFeatures] = useState<ReturnType<typeof getFeatureAccess> | null>(null);

  useEffect(() => {
    setSubscription(getSubscription());
    setFeatures(getFeatureAccess());
  }, []);

  const refresh = () => {
    setSubscription(getSubscription());
    setFeatures(getFeatureAccess());
  };

  return {
    subscription,
    features,
    isActive: subscription?.status === "active",
    isTrial: subscription?.tier === "trial",
    refresh,
  };
}
