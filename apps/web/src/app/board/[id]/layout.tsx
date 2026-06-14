'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { BoardHeader } from '@/components/board/board-header';

export default function BoardLayout({ children, params }: { children: React.ReactNode; params: { id: string } }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login');
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <BoardHeader boardId={params.id} />
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
