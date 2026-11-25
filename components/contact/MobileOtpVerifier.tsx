"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { sendMobileOtp, validatePhoneNumber, verifyMobileOtp } from "@/lib/vfe/otp";
import { FieldError } from "@/components/contact/fields";

type MobileOtpVerifierProps = {
  countryCode: string;
  phoneNumber: string;
  type: string;
  isVerified: boolean;
  onVerificationChange: (verified: boolean) => void;
  onVerificationIdChange?: (verificationId: string) => void;
  error?: string;
  disabled?: boolean;
};

export default function MobileOtpVerifier({
  countryCode,
  phoneNumber,
  type,
  isVerified,
  onVerificationChange,
  onVerificationIdChange,
  error,
  disabled = false,
}: MobileOtpVerifierProps) {
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [verificationId, setVerificationId] = useState("");
  const previousMobile = useRef("");

  const fullMobileNumber = useMemo(() => {
    const code = countryCode.trim();
    const phone = phoneNumber.trim();
    if (!code || !phone) return "";
    return `${code}${phone}`;
  }, [countryCode, phoneNumber]);

  const canSend =
    !disabled && Boolean(fullMobileNumber) && validatePhoneNumber(phoneNumber.trim().replace(/\s/g, ""));

  const resetOtp = useCallback(
    (notify: boolean) => {
      setShowOtp(false);
      setOtpError("");
      setCountdown(0);
      setVerificationId("");
      onVerificationIdChange?.("");
      if (notify && isVerified) onVerificationChange(false);
    },
    [isVerified, onVerificationChange, onVerificationIdChange],
  );

  useEffect(() => {
    if (previousMobile.current !== fullMobileNumber) {
      const hadPrevious = Boolean(previousMobile.current);
      previousMobile.current = fullMobileNumber;
      resetOtp(hadPrevious);
    }
  }, [fullMobileNumber, resetOtp]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = window.setTimeout(() => setCountdown((current) => current - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [countdown]);

  if (!fullMobileNumber) {
    return <FieldError message={error} />;
  }

  const handleSend = async () => {
    if (!canSend) {
      const message = "Please enter a valid mobile number before requesting OTP.";
      setOtpError(message);
      toast.error(message);
      return;
    }

    setIsSending(true);
    setOtpError("");
    const response = await sendMobileOtp(fullMobileNumber, countryCode, type);
    setIsSending(false);

    if (!response.success || !response.verificationId) {
      const message = response.error || "Failed to send OTP. Please try again.";
      setOtpError(message);
      toast.error(message);
      return;
    }

    setVerificationId(response.verificationId);
    onVerificationIdChange?.(response.verificationId);
    setShowOtp(true);
    setCountdown(60);
    toast.success("OTP sent to your mobile number.");
  };

  const handleVerify = async (code: string) => {
    if (!/^\d{6}$/.test(code)) {
      const message = "Invalid OTP. Please enter the 6-digit code.";
      setOtpError(message);
      toast.error(message);
      return;
    }

    setIsVerifying(true);
    setOtpError("");
    const response = await verifyMobileOtp(fullMobileNumber, countryCode, code, verificationId);
    setIsVerifying(false);

    if (!response.success) {
      const message = response.error || "Failed to verify OTP. Please try again.";
      setOtpError(message);
      toast.error(message);
      return;
    }

    onVerificationChange(true);
    setShowOtp(false);
    toast.success("Mobile number verified.");
  };

  return (
    <div className="text-left">
      {isVerified ? (
        <p className="form-field text-[#3d6b45]">Mobile number verified</p>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="form-field text-[#8B7E2A]">Verify mobile number with OTP*</p>
          {!showOtp ? (
            <button
              type="button"
              onClick={handleSend}
              disabled={!canSend || isSending}
              className="form-field cursor-pointer rounded-md bg-[#A4911B] px-4 py-2 text-[#FFFAEF] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSending ? "Sending..." : "Send OTP"}
            </button>
          ) : null}
        </div>
      )}

      {showOtp ? (
        <OtpBoxes
          phone={fullMobileNumber}
          isVerifying={isVerifying}
          error={otpError}
          countdown={countdown}
          onResend={handleSend}
          onVerify={handleVerify}
          onChange={() => setOtpError("")}
        />
      ) : null}

      {!showOtp ? <FieldError message={error || otpError} /> : <FieldError message={error} />}
    </div>
  );
}

function OtpBoxes({
  phone,
  isVerifying,
  error,
  countdown,
  onResend,
  onVerify,
  onChange,
}: {
  phone: string;
  isVerifying: boolean;
  error: string;
  countdown: number;
  onResend: () => void;
  onVerify: (value: string) => void;
  onChange: () => void;
}) {
  const length = 6;
  const [digits, setDigits] = useState<string[]>(() => Array(length).fill(""));
  const [active, setActive] = useState(0);
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    refs.current[active]?.focus();
  }, [active]);

  const write = (next: string[], focus: number, complete: boolean) => {
    setDigits(next);
    setActive(focus);
    onChange();
    if (complete) onVerify(next.join(""));
  };

  return (
    <div className="mt-4 flex flex-col items-center gap-4">
      <p className="form-note w-full text-left text-[#8B7E2A]">
        Enter the 6-digit OTP sent to <strong className="text-[#762323]">{phone}</strong>
      </p>
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(element) => {
              refs.current[index] = element;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            disabled={isVerifying}
            aria-label={`OTP digit ${index + 1}`}
            onFocus={() => setActive(index)}
            onPaste={(event) => {
              event.preventDefault();
              const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
              if (!pasted) return;
              const next = Array(length).fill("");
              pasted.split("").forEach((character, pastedIndex) => {
                next[pastedIndex] = character;
              });
              write(next, Math.min(pasted.length, length - 1), pasted.length === length);
            }}
            onKeyDown={(event) => {
              if (event.key === "Backspace") {
                event.preventDefault();
                const next = [...digits];
                if (next[index]) {
                  next[index] = "";
                  write(next, index, false);
                } else if (index > 0) {
                  next[index - 1] = "";
                  write(next, index - 1, false);
                }
              } else if (event.key === "ArrowLeft" && index > 0) {
                setActive(index - 1);
              } else if (event.key === "ArrowRight" && index < length - 1) {
                setActive(index + 1);
              }
            }}
            onChange={(event) => {
              const value = event.target.value.replace(/\D/g, "").slice(-1);
              if (!value) return;
              const next = [...digits];
              next[index] = value;
              write(next, index < length - 1 ? index + 1 : index, next.every(Boolean));
            }}
            className={`form-field h-14 w-12 rounded-lg border-2 bg-[#FFFDF7] text-center text-[#762323] outline-none transition disabled:opacity-60 ${
              error ? "border-[#9b2c2c] bg-[#fff6f4]" : "border-[#762323] focus:scale-105 focus:shadow-[0_0_0_3px_rgba(118,35,35,0.12)]"
            }`}
          />
        ))}
      </div>
      {error ? <p className="type-detail text-center text-[#9b2c2c]">{error}</p> : null}
      <button
        type="button"
        onClick={() => onVerify(digits.join(""))}
        disabled={isVerifying || digits.join("").length !== length}
        className="form-field min-w-[120px] cursor-pointer rounded-md bg-[#A4911B] px-6 py-3 text-[#FFFAEF] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isVerifying ? "Verifying..." : "Verify OTP"}
      </button>
      <div>
        {countdown > 0 ? (
          <span className="form-note text-[#8B7E2A]">Resend OTP in {countdown} sec</span>
        ) : (
          <button type="button" onClick={onResend} className="form-note cursor-pointer text-[#762323] underline">
            Resend OTP
          </button>
        )}
      </div>
    </div>
  );
}
