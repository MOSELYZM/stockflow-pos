import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Crown,
  Check,
  Clock,
  AlertTriangle,
  CreditCard,
  Smartphone,
  Calendar,
  History,
  Lock,
  Unlock,
  Zap,
  Users,
  BarChart3,
  Download,
  Copy,
  Key,
} from "lucide-react";
import {
  getSubscription,
  processPayment,
  getDaysRemaining,
  getSubscriptionStatusText,
  getFeatureAccess,
  redeemCode,
  type SubscriptionTier,
  type Subscription,
} from "@/lib/store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MONTHLY_FEE = 200;

const plans = [
  {
    tier: "trial" as SubscriptionTier,
    name: "Free Trial",
    price: 0,
    duration: "7 days",
    description: "Try all features risk-free",
    features: [
      { name: "Point of Sale", icon: Zap, available: true },
      { name: "Inventory Management", icon: Unlock, available: true },
      { name: "Basic Reports", icon: BarChart3, available: true },
      { name: "Customer Management", icon: Users, available: true },
      { name: "Staff Management", icon: Users, available: false },
      { name: "Advanced Analytics", icon: BarChart3, available: false },
      { name: "Data Export", icon: Download, available: false },
    ],
    popular: false,
  },
  {
    tier: "basic" as SubscriptionTier,
    name: "Basic Plan",
    price: MONTHLY_FEE,
    duration: "per month",
    description: "Perfect for small businesses",
    features: [
      { name: "Point of Sale", icon: Zap, available: true },
      { name: "Inventory Management", icon: Unlock, available: true },
      { name: "Full Reports", icon: BarChart3, available: true },
      { name: "Customer Management", icon: Users, available: true },
      { name: "Staff Management (5)", icon: Users, available: true },
      { name: "Advanced Analytics", icon: BarChart3, available: false },
      { name: "Data Export", icon: Download, available: false },
    ],
    popular: true,
  },
  {
    tier: "premium" as SubscriptionTier,
    name: "Premium Plan",
    price: MONTHLY_FEE,
    duration: "per month",
    description: "Complete business solution",
    features: [
      { name: "Point of Sale", icon: Zap, available: true },
      { name: "Inventory Management", icon: Unlock, available: true },
      { name: "Full Reports", icon: BarChart3, available: true },
      { name: "Customer Management", icon: Users, available: true },
      { name: "Unlimited Staff", icon: Users, available: true },
      { name: "Advanced Analytics", icon: BarChart3, available: true },
      { name: "Data Export", icon: Download, available: true },
    ],
    popular: false,
  },
];

export function SubscriptionModal({ open, onOpenChange }: SubscriptionModalProps) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier>("basic");
  const [months, setMonths] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<"MTN" | "AIRTEL" | "ZAMTEL">("MTN");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [activationCode, setActivationCode] = useState("");
  const [showRedeemForm, setShowRedeemForm] = useState(false);
  const [redeemCodeInput, setRedeemCodeInput] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);

  useEffect(() => {
    if (open) {
      const sub = getSubscription();
      setSubscription(sub);
      if (sub.tier !== "trial") {
        setSelectedPlan(sub.tier);
      }
    }
  }, [open]);

  const handleSubscribe = () => {
    if (selectedPlan === "trial") return;
    setShowPaymentForm(true);
  };

  const processPaymentSubmit = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    toast.loading("Processing payment request...", { id: "payment" });

    setTimeout(() => {
      try {
        const result = processPayment(selectedPlan, months, paymentMethod, phoneNumber);

        toast.success("Payment successful! Your activation code is below.", { id: "payment" });

        setActivationCode(result.activationCode);
        setShowPaymentForm(false);
        setPhoneNumber("");
      } catch (error) {
        toast.error("Payment failed. Please try again.", { id: "payment" });
      } finally {
        setIsProcessing(false);
      }
    }, 2000);
  };

  const copyCodeToClipboard = () => {
    navigator.clipboard.writeText(activationCode);
    toast.success("Activation code copied to clipboard!");
  };

  const handleRedeemCode = () => {
    if (!redeemCodeInput || redeemCodeInput.length < 12) {
      toast.error("Please enter a valid activation code");
      return;
    }

    setIsRedeeming(true);
    const result = redeemCode(redeemCodeInput);

    if (result.success) {
      toast.success(result.message);
      setRedeemCodeInput("");
      setShowRedeemForm(false);
      const updatedSub = getSubscription();
      setSubscription(updatedSub);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      toast.error(result.message);
    }

    setIsRedeeming(false);
  };

  const daysRemaining = subscription ? getDaysRemaining() : 0;
  const statusText = subscription ? getSubscriptionStatusText() : { text: "", color: "", urgent: false };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Crown className="h-6 w-6 text-warning" />
            Subscription Management
          </DialogTitle>
          <DialogDescription>
            Choose a plan that fits your business needs
          </DialogDescription>
        </DialogHeader>

        {/* Current Status */}
        {subscription && (
          <Card className={`${subscription.status === "expired" ? "border-destructive" : daysRemaining <= 2 ? "border-warning" : "border-success"}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${subscription.status === "expired" ? "bg-destructive/10" : daysRemaining <= 2 ? "bg-warning/10" : "bg-success/10"}`}>
                    {subscription.status === "expired" ? (
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                    ) : (
                      <Clock className={`h-5 w-5 ${daysRemaining <= 2 ? "text-warning" : "text-success"}`} />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{subscription.tier === "trial" ? "Free Trial" : subscription.tier === "basic" ? "Basic Plan" : "Premium Plan"}</p>
                    <p className={`text-sm ${statusText.color}`}>{statusText.text}</p>
                  </div>
                </div>
                <Badge variant={subscription.status === "active" ? "default" : "destructive"}>
                  {subscription.status === "active" ? "Active" : "Expired"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Activation Code Display */}
        {activationCode && !showPaymentForm && !showRedeemForm && (
          <Card className="border-success bg-success/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-success">
                <Key className="h-5 w-5" />
                Your Activation Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-background p-4 rounded-lg border-2 border-success/30">
                <p className="text-3xl font-mono font-bold text-center tracking-wider">{activationCode}</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={copyCodeToClipboard} className="flex-1 gap-2">
                  <Copy className="h-4 w-4" />
                  Copy Code
                </Button>
                <Button onClick={() => setActivationCode("")} variant="outline">
                  Close
                </Button>
              </div>
              <div className="bg-muted p-3 rounded-md text-sm">
                <p className="font-medium text-foreground mb-1">Important:</p>
                <ul className="text-muted-foreground list-disc list-inside space-y-0.5">
                  <li>This code can only be used once</li>
                  <li>It will only work on this device</li>
                  <li>Save it in a safe place</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Code Redemption Form */}
        {showRedeemForm && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Redeem Activation Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Enter your activation code</Label>
                <Input
                  placeholder="XXXX-XXXX-XXXX"
                  value={redeemCodeInput}
                  onChange={(e) => setRedeemCodeInput(e.target.value.toUpperCase())}
                  className="font-mono uppercase"
                  maxLength={14}
                />
                <p className="text-xs text-muted-foreground">
                  Format: XXXX-XXXX-XXXX
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleRedeemCode} className="flex-1" disabled={isRedeeming}>
                  {isRedeeming ? "Redeeming..." : "Redeem Code"}
                </Button>
                <Button onClick={() => setShowRedeemForm(false)} variant="outline">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!showPaymentForm && !showRedeemForm && !activationCode ? (
          <>
            {/* Plans */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <Card
                  key={plan.tier}
                  className={`relative cursor-pointer transition-all hover:shadow-lg ${
                    selectedPlan === plan.tier ? "ring-2 ring-primary" : ""
                  } ${plan.popular ? "border-warning" : ""}`}
                  onClick={() => plan.tier !== "trial" && setSelectedPlan(plan.tier)}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge variant="gradient" className="shine">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">K{plan.price}</span>
                      <span className="text-muted-foreground">{plan.duration}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.features.map((feature) => (
                        <li key={feature.name} className="flex items-center gap-2 text-sm">
                          {feature.available ? (
                            <Check className="h-4 w-4 text-success" />
                          ) : (
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className={feature.available ? "" : "text-muted-foreground"}>
                            {feature.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                    {plan.tier !== "trial" && (
                      <Button
                        className="w-full mt-4"
                        variant={selectedPlan === plan.tier ? "default" : "outline"}
                        onClick={() => setSelectedPlan(plan.tier)}
                      >
                        {selectedPlan === plan.tier ? "Selected" : "Select Plan"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Subscribe Button */}
            {subscription?.tier === "trial" && (
              <div className="flex flex-col gap-3">
                <Button onClick={() => setShowRedeemForm(true)} variant="outline" className="w-full gap-2">
                  <Key className="h-4 w-4" />
                  Redeem Activation Code
                </Button>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Continue Trial
                  </Button>
                  <Button onClick={handleSubscribe} size="lg">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Subscribe Now - K{MONTHLY_FEE}/month
                  </Button>
                </div>
              </div>
            )}

            {subscription && subscription.tier !== "trial" && subscription.status === "active" && (
              <div className="flex justify-end">
                <Button onClick={handleSubscribe}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Extend Subscription
                </Button>
              </div>
            )}

            {subscription?.status === "expired" && (
              <div className="flex justify-end">
                <Button onClick={handleSubscribe} variant="destructive" size="lg">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Renew Subscription
                </Button>
              </div>
            )}
          </>
        ) : (
          /* Payment Form */
          <div className="space-y-6">
            <Button variant="ghost" onClick={() => setShowPaymentForm(false)} className="mb-4">
              ← Back to Plans
            </Button>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Mobile Money Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <p className="font-medium">Order Summary</p>
                  <div className="flex justify-between mt-2">
                    <span className="text-muted-foreground">
                      {selectedPlan === "basic" ? "Basic Plan" : "Premium Plan"} × {months} month{months > 1 ? "s" : ""}
                    </span>
                    <span className="font-bold">K{MONTHLY_FEE * months}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MTN">MTN Mobile Money</SelectItem>
                      <SelectItem value="AIRTEL">Airtel Money</SelectItem>
                      <SelectItem value="ZAMTEL">Zamtel Kwacha</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Number of Months</Label>
                  <Select value={months.toString()} onValueChange={(v) => setMonths(Number(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Month - K{MONTHLY_FEE}</SelectItem>
                      <SelectItem value="3">3 Months - K{MONTHLY_FEE * 3} (Save K0)</SelectItem>
                      <SelectItem value="6">6 Months - K{MONTHLY_FEE * 6} (Save K0)</SelectItem>
                      <SelectItem value="12">12 Months - K{MONTHLY_FEE * 12} (Save K0)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Mobile Number</Label>
                  <Input
                    placeholder="e.g. 0967123456"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    You will receive a payment prompt on this number
                  </p>
                </div>

                <Separator />

                <div className="bg-primary/5 border border-primary/20 rounded-md p-3 text-sm">
                  <p className="font-medium text-foreground mb-1">How to pay:</p>
                  <ol className="text-muted-foreground list-decimal list-inside space-y-0.5">
                    <li>Enter your mobile money number above</li>
                    <li>Click "Pay Now" to initiate payment</li>
                    <li>Check your phone for payment prompt</li>
                    <li>Enter your PIN to authorize</li>
                    <li>Wait for confirmation</li>
                  </ol>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={processPaymentSubmit}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay K{MONTHLY_FEE * months}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
