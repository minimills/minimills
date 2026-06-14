'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!token) { setStatus('error'); return; }
    api.post('/auth/verify-email', { token })
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  if (status === 'loading') {
    return (
      <div className="text-center space-y-4">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Verifying your email...</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="text-center space-y-6">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
        <div>
          <h2 className="text-2xl font-bold">Email verified!</h2>
          <p className="text-muted-foreground mt-2">Your email has been successfully verified.</p>
        </div>
        <Link href="/dashboard"><Button className="w-full">Go to dashboard</Button></Link>
      </div>
    );
  }

  return (
    <div className="text-center space-y-6">
      <XCircle className="mx-auto h-16 w-16 text-destructive" />
      <div>
        <h2 className="text-2xl font-bold">Verification failed</h2>
        <p className="text-muted-foreground mt-2">This link is invalid or has expired.</p>
      </div>
      <Link href="/login"><Button variant="outline" className="w-full">Back to sign in</Button></Link>
    </div>
  );
}
