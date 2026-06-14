'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

const schema = z.object({ email: z.string().email('Invalid email') });

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: { email: string }) => {
    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: data.email });
      setSent(true);
    } catch {
      setSent(true); // Always show success to prevent email enumeration
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center space-y-6">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
        <div>
          <h2 className="text-2xl font-bold">Check your email</h2>
          <p className="text-muted-foreground mt-2">
            If that email is registered, we've sent a password reset link.
          </p>
        </div>
        <Link href="/login">
          <Button variant="outline" className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to sign in
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Reset password</h2>
        <p className="text-muted-foreground mt-2">Enter your email and we'll send you a reset link</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Send reset link
        </Button>
      </form>

      <Link href="/login">
        <Button variant="ghost" className="w-full">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to sign in
        </Button>
      </Link>
    </div>
  );
}
