"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import Link from "next/link";
import {
  useResendVerificationEmailMutation,
  useVerifyEmailMutation,
} from "@/redux/api/authApi";

const schema = z.object({
  otp: z.string().min(6, "OTP must be 6 digits").max(6, "OTP must be 6 digits"),
});

type FormData = z.infer<typeof schema>;

export default function VerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [email, setEmail] = useState("");
  const [verifyEmail, { isLoading: isVerifying }] = useVerifyEmailMutation();
  const [resendVerificationEmail, { isLoading: isResending }] =
    useResendVerificationEmailMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const otpValue = watch("otp");

  // Get email from URL parameters
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    } else {
      // Redirect to register if no email parameter
      router.push('/register');
    }
  }, [searchParams, router]);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError("");

    try {
      await verifyEmail({ code: data.otp, email: email }).unwrap();
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.data?.message || "Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setCanResend(false);
    setCountdown(60);
    setError("");

    try {
      await resendVerificationEmail({ email }).unwrap();
    } catch (err: any) {
      setError(err?.data?.message || "Failed to resend OTP. Please try again.");
      setCanResend(true);
      setCountdown(0);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 p-4">
      <Card className="w-full max-w-md p-8">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-balance">Verify Your Email</h1>
          <p className="text-muted-foreground mt-2">
            We've sent a 6-digit code to
          </p>
          {email && (
            <p className="text-sm font-medium text-primary mt-1">
              {email}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-center">
              Enter verification code
            </label>
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otpValue || ""}
                onChange={(value) => setValue("otp", value)}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            {errors.otp && (
              <p className="text-sm text-destructive text-center mt-2">
                {errors.otp.message}
              </p>
            )}
          </div>

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !otpValue || otpValue.length !== 6}
          >
            {isLoading ? "Verifying..." : "Verify Email"}
          </Button>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Didn't receive the code?
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResendOTP}
              disabled={!canResend}
              className="text-primary hover:underline p-0 h-auto"
            >
              {canResend ? "Resend code" : `Resend in ${countdown}s`}
            </Button>
          </div>
        </form>

        <p className="text-sm text-muted-foreground text-center mt-6">
          Want to use a different email?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Go back
          </Link>
        </p>
      </Card>
    </div>
  );
}
