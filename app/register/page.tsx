"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useUserSignUpMutation } from "@/redux/api/authApi";
import { toast } from 'sonner'
import { useRedirectIfAuthenticated } from '@/hooks/useAuth'
import { Spinner } from '@/components/ui/spinner'
import { CheckCircle2, ArrowLeft } from 'lucide-react'

const schema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [signup, { isLoading }] = useUserSignUpMutation();
  
  // Redirect if already authenticated
  const { isAuthenticated } = useRedirectIfAuthenticated('/dashboard')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setError("");
      const signupData = {
        email: data.email,  
        password: data.password,
        name: data.name,
      }

      await signup(signupData).unwrap();
      toast.success('Registration successful! Please verify your email.')
      
      // Redirect to verification page with email parameter
      router.push(`/verification?email=${encodeURIComponent(data.email)}`);
    } catch (err: any) {
      const errorMessage = err?.data?.message || "Registration failed. Please try again."
      setError(errorMessage);
      toast.error(errorMessage)
    }
  };
  
  // Show loading while checking auth status
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
        <Spinner className="w-8 h-8" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 p-4">
      <Link href="/" className="mb-8 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back to home</span>
      </Link>
      
      <Card className="w-full max-w-md p-8">
        <div className="mb-6">
          <Link href="/" className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">Smart Task Manager</span>
          </Link>
          <h1 className="text-3xl font-bold text-balance">Create Account</h1>
          <p className="text-muted-foreground mt-2">Join Smart Task Manager</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
           <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <Input
              {...register("name")}
              type="text"
              placeholder="Your name"
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">
                {errors.name.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input
              {...register("email")}
              type="email"
              placeholder="you@example.com"
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <p className="text-sm text-destructive mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <Input
              {...register("password")}
              type="password"
              placeholder="••••••"
              className={errors.password ? "border-destructive" : ""}
            />
            {errors.password && (
              <p className="text-sm text-destructive mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Confirm Password
            </label>
            <Input
              {...register("confirmPassword")}
              type="password"
              placeholder="••••••"
              className={errors.confirmPassword ? "border-destructive" : ""}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Spinner className="w-4 h-4" />
                Creating Account...
              </span>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground text-center mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
