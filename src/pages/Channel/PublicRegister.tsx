import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import channelService, { PublicRegistrationInfo } from "@/services/channelService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Radio, Phone, UserCheck, Loader2, XCircle, CheckCircle2 } from "lucide-react";

type Step = "loading" | "error" | "form" | "success";

const PublicRegister = () => {
  const { token } = useParams<{ token: string }>();

  const [step, setStep] = useState<Step>("loading");
  const [info, setInfo] = useState<PublicRegistrationInfo | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Form state
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [consent, setConsent] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!token) {
      setErrorMsg("Invalid registration link.");
      setStep("error");
      return;
    }
    channelService
      .getPublicInfo(token)
      .then((data) => {
        if (!data.public_registration_enabled) {
          setErrorMsg("Registration is currently closed for this class.");
          setStep("error");
        } else {
          setInfo(data);
          setStep("form");
        }
      })
      .catch((e) => {
        const msg = e?.response?.data?.message || e?.response?.data?.error?.message;
        setErrorMsg(msg || "Could not load registration info. The link may be invalid or expired.");
        setStep("error");
      });
  }, [token]);

  const handleSubmit = async () => {
    setFormError("");
    if (!fullName.trim()) { setFormError("Please enter your full name."); return; }
    if (!phoneNumber.trim()) { setFormError("Please enter your phone number."); return; }
    if (!consent) { setFormError("You must consent to receive SMS messages."); return; }

    setSubmitting(true);
    try {
      await channelService.publicRegister(token!, {
        full_name: fullName.trim(),
        phone_number: phoneNumber.trim(),
        consent_granted: consent,
      });
      setStep("success");
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.response?.data?.phone_number?.[0] || e?.response?.data?.full_name?.[0] || "Registration failed. Please try again.";
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm space-y-6">
        {/* Brand */}
        <div className="flex items-center gap-2 justify-center mb-2">
          <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Radio className="h-5 w-5 text-primary" />
          </div>
          <span className="text-xl font-bold text-foreground tracking-tight">Kibegi</span>
        </div>

        {/* Loading */}
        {step === "loading" && (
          <div className="flex flex-col items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-3 text-sm text-muted-foreground">Loading registration info…</p>
          </div>
        )}

        {/* Error */}
        {step === "error" && (
          <div className="flex flex-col items-center py-10 text-center space-y-3">
            <XCircle className="h-12 w-12 text-destructive" />
            <p className="text-lg font-semibold text-foreground">Unable to register</p>
            <p className="text-sm text-muted-foreground max-w-xs">{errorMsg}</p>
          </div>
        )}

        {/* Form */}
        {step === "form" && info && (
          <div className="space-y-5">
            {/* Class info */}
            <div className="text-center space-y-1">
              <h1 className="text-xl font-bold text-foreground">{info.class_name}</h1>
              <p className="text-[13px] text-muted-foreground">{info.class_code}</p>
            </div>

            <div className="px-4 py-3.5 rounded-2xl bg-muted/40 border border-border space-y-1">
              <p className="text-[13px] font-semibold text-foreground">
                {info.registration_hint || "Register your name and phone number to receive class updates."}
              </p>
              {info.contacts_registered > 0 && (
                <p className="text-[11px] text-muted-foreground">
                  {info.contacts_registered} student{info.contacts_registered !== 1 ? "s" : ""} already registered
                </p>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide px-1 block mb-1.5">
                  Full Name
                </label>
                <Input
                  placeholder="e.g. John Mwangi"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="rounded-xl h-11"
                />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide px-1 block mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="+255712345678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    type="tel"
                    className="rounded-xl h-11 pl-9"
                  />
                </div>
              </div>

              {/* Consent checkbox */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-border cursor-pointer hover:bg-muted/40 transition-colors">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-primary"
                />
                <span className="text-[13px] text-muted-foreground leading-relaxed">
                  I consent to receive SMS updates from this class. Message and data rates may apply.
                </span>
              </label>
            </div>

            {formError && (
              <p className="text-[13px] text-destructive bg-destructive/10 rounded-xl px-3 py-2.5">
                {formError}
              </p>
            )}

            <Button
              className="w-full h-11 rounded-xl text-[15px] font-semibold"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <UserCheck className="h-4 w-4 mr-2" />
              )}
              Register
            </Button>
          </div>
        )}

        {/* Success */}
        {step === "success" && (
          <div className="flex flex-col items-center py-10 text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-emerald-500/15 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
            <div className="space-y-1">
              <p className="text-xl font-bold text-foreground">You're registered!</p>
              <p className="text-sm text-muted-foreground">
                {info?.class_name && `You'll receive SMS updates from ${info.class_name}.`}
              </p>
            </div>
            <p className="text-[12px] text-muted-foreground max-w-xs">
              You can close this page. No account needed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicRegister;
