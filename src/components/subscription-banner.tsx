import { useState, useEffect } from "react";
import { AlertCircle, Clock, Crown, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubscriptionModal } from "./subscription-modal";
import {
  getSubscription,
  getDaysRemaining,
  getSubscriptionStatusText,
  type Subscription,
} from "@/lib/store";

export function SubscriptionBanner() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkSubscription = () => {
      const sub = getSubscription();
      setSubscription(sub);
    };

    checkSubscription();
    // Check every hour for updates
    const interval = setInterval(checkSubscription, 3600000);
    return () => clearInterval(interval);
  }, []);

  if (!subscription) return null;
  if (dismissed && subscription.status === "active" && subscription.tier !== "trial") return null;

  const daysRemaining = getDaysRemaining();
  const statusText = getSubscriptionStatusText();

  // Don't show banner for active subscriptions with more than 7 days
  if (subscription.status === "active" && daysRemaining > 7 && subscription.tier !== "trial") {
    return null;
  }

  // Determine banner style based on urgency
  const getBannerStyles = () => {
    if (subscription.status === "expired") {
      return "bg-destructive/10 border-destructive text-destructive";
    }
    if (daysRemaining <= 2) {
      return "bg-warning/10 border-warning text-warning";
    }
    if (subscription.tier === "trial") {
      return "bg-success/10 border-success text-success";
    }
    return "bg-warning/10 border-warning text-warning";
  };

  const getIcon = () => {
    if (subscription.status === "expired") {
      return <AlertTriangle className="h-5 w-5" />;
    }
    if (daysRemaining <= 2) {
      return <AlertCircle className="h-5 w-5" />;
    }
    if (subscription.tier === "trial") {
      return <Clock className="h-5 w-5" />;
    }
    return <Clock className="h-5 w-5" />;
  };

  const getActionButton = () => {
    if (subscription.status === "expired") {
      return (
        <Button variant="destructive" size="sm" onClick={() => setShowModal(true)}>
          Renew Now
        </Button>
      );
    }
    if (subscription.tier === "trial" && daysRemaining <= 2) {
      return (
        <Button variant="default" size="sm" onClick={() => setShowModal(true)}>
          Subscribe Now - K200/month
        </Button>
      );
    }
    if (subscription.tier === "trial") {
      return (
        <Button variant="outline" size="sm" onClick={() => setShowModal(true)}>
          Upgrade Plan
        </Button>
      );
    }
    return (
      <Button variant="outline" size="sm" onClick={() => setShowModal(true)}>
        Extend Subscription
      </Button>
    );
  };

  return (
    <>
      <div className={`border-b px-4 py-2 ${getBannerStyles()}`}>
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            {getIcon()}
            <div>
              <span className="font-medium">{statusText.text}</span>
              {subscription.tier === "trial" && subscription.status === "active" && (
                <span className="ml-2 text-xs opacity-80">
                  Enjoy full access during your trial
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getActionButton()}
            {subscription.status === "active" && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setDismissed(true)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <SubscriptionModal open={showModal} onOpenChange={setShowModal} />
    </>
  );
}

// Compact version for sidebar or header
export function SubscriptionBadge() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setSubscription(getSubscription());
  }, []);

  if (!subscription) return null;

  const daysRemaining = getDaysRemaining();

  const getBadgeStyles = () => {
    if (subscription.status === "expired") {
      return "bg-destructive/10 text-destructive border-destructive";
    }
    if (daysRemaining <= 2) {
      return "bg-warning/10 text-warning border-warning";
    }
    if (subscription.tier === "trial") {
      return "bg-success/10 text-success border-success";
    }
    return "bg-primary/10 text-primary border-primary";
  };

  const getBadgeText = () => {
    if (subscription.status === "expired") return "Expired";
    if (subscription.tier === "trial") return `${daysRemaining}d trial`;
    return `${daysRemaining}d left`;
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`px-2 py-1 rounded-md border text-xs font-medium hover:opacity-80 transition-opacity ${getBadgeStyles()}`}
      >
        <span className="flex items-center gap-1">
          <Crown className="h-3 w-3" />
          {getBadgeText()}
        </span>
      </button>
      <SubscriptionModal open={showModal} onOpenChange={setShowModal} />
    </>
  );
}
