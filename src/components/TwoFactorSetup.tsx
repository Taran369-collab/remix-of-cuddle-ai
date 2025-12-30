import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Shield, ShieldCheck, ShieldOff, Loader2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { useTwoFactor } from "@/hooks/useTwoFactor";

export const TwoFactorSetup = () => {
  const {
    isEnabled,
    isLoading,
    enrollmentData,
    startEnrollment,
    verifyEnrollment,
    cancelEnrollment,
    disable2FA,
  } = useTwoFactor();

  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [showEnrollment, setShowEnrollment] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  const handleStartEnrollment = async () => {
    const result = await startEnrollment();
    if (result.success) {
      setShowEnrollment(true);
    } else {
      toast.error(result.error || "Failed to start 2FA setup");
    }
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }

    setIsVerifying(true);
    const result = await verifyEnrollment(verificationCode);
    setIsVerifying(false);

    if (result.success) {
      toast.success("Two-factor authentication enabled!");
      setShowEnrollment(false);
      setVerificationCode("");
    } else {
      toast.error(result.error || "Invalid verification code");
    }
  };

  const handleCancel = async () => {
    await cancelEnrollment();
    setShowEnrollment(false);
    setVerificationCode("");
  };

  const handleDisable = async () => {
    setIsDisabling(true);
    const result = await disable2FA();
    setIsDisabling(false);

    if (result.success) {
      toast.success("Two-factor authentication disabled");
    } else {
      toast.error(result.error || "Failed to disable 2FA");
    }
  };

  const copySecret = () => {
    if (enrollmentData?.secret) {
      navigator.clipboard.writeText(enrollmentData.secret);
      setCopiedSecret(true);
      toast.success("Secret copied to clipboard");
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 border border-border rounded-xl">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (showEnrollment && enrollmentData) {
    return (
      <div className="p-6 border border-border rounded-xl space-y-6">
        <div className="flex items-start gap-3">
          <Shield className="text-rose mt-0.5" size={20} />
          <div>
            <h4 className="font-semibold text-foreground mb-1">Set Up Two-Factor Authentication</h4>
            <p className="text-sm text-muted-foreground">
              Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <div className="bg-white p-4 rounded-xl">
            <img
              src={enrollmentData.qrCode}
              alt="2FA QR Code"
              className="w-48 h-48"
            />
          </div>

          <div className="w-full space-y-2">
            <Label className="text-muted-foreground text-xs">
              Can't scan? Enter this code manually:
            </Label>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 bg-muted/50 rounded-lg text-xs font-mono break-all">
                {enrollmentData.secret}
              </code>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={copySecret}
              >
                {copiedSecret ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="verificationCode" className="text-foreground">
            Enter 6-digit code from your app
          </Label>
          <Input
            id="verificationCode"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="000000"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
            className="text-center text-lg tracking-widest bg-background/50 border-rose-light/30 focus:border-rose"
          />
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            variant="romantic"
            className="flex-1"
            onClick={handleVerify}
            disabled={isVerifying || verificationCode.length !== 6}
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <ShieldCheck className="mr-2 h-4 w-4" />
                Enable 2FA
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 border border-border rounded-xl">
      <div className="flex items-start gap-3 mb-4">
        {isEnabled ? (
          <ShieldCheck className="text-green-500 mt-0.5" size={20} />
        ) : (
          <Shield className="text-muted-foreground mt-0.5" size={20} />
        )}
        <div className="flex-1">
          <h4 className="font-semibold text-foreground mb-1">
            Two-Factor Authentication
          </h4>
          <p className="text-sm text-muted-foreground">
            {isEnabled
              ? "Your account is protected with two-factor authentication."
              : "Add an extra layer of security to your account using an authenticator app."}
          </p>
        </div>
      </div>

      {isEnabled ? (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full">
              <ShieldOff className="mr-2 h-4 w-4" />
              Disable Two-Factor Authentication
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Disable Two-Factor Authentication?</AlertDialogTitle>
              <AlertDialogDescription>
                This will make your account less secure. You can always re-enable it later.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button
                variant="destructive"
                onClick={handleDisable}
                disabled={isDisabling}
              >
                {isDisabling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Disabling...
                  </>
                ) : (
                  "Disable 2FA"
                )}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        <Button
          variant="romantic"
          className="w-full"
          onClick={handleStartEnrollment}
        >
          <Shield className="mr-2 h-4 w-4" />
          Enable Two-Factor Authentication
        </Button>
      )}
    </div>
  );
};

export default TwoFactorSetup;
