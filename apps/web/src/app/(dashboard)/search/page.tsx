'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { formatRelative, priorityConfig } from '@/lib/utils';
import type { Card as CardType, Board } from '@minimills/shared';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const [query, setQuery] = useState(q);

  const { data, isLoading } = useQuery({
    queryKey: ['search', q],
    queryFn: () => api.get(`/search?q=${encodeURIComponent(q)}`),
    enabled: q.length >= 2,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-4">Search</h1>
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search cards, boards, workspaces..."
              className="pl-10 h-12 text-base"
              autoFocus
            />
          </div>
        </form>
      </div>

      {isLoading && <div className="text-center py-8 text-muted-foreground">Searching...</div>}

      {data?.cards?.length > 0 && (
        <div>
          <h2 className="font-semibold text-lg mb-3">Cards ({data.cards.length})</h2>
          <div className="space-y-2">
            {data.cards.map((card: any) => {
              const pc = priorityConfig(card.priority);
              return (
                <Link key={card.id} href={`/board/${card.list.board.id}?card=${card.id}`}>
                  <Card className="p-4 hover:bg-muted/50 cursor-pointer flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium">{card.title}</p>
                      <p className="text-sm text-muted-foreground">{card.list.board.name} › {card.list.name}</p>
                    </div>
                    <Badge variant="outline" className={pc.color}>{pc.label}</Badge>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {data?.boards?.length > 0 && (
        <div>
          <h2 className="font-semibold text-lg mb-3">Boards ({data.boards.length})</h2>
          <div className="grid grid-cols-2 gap-4">
            {data.boards.map((board: any) => (
              <Link key={board.id} href={`/board/${board.id}`}>
                <Card className="p-4 hover:bg-muted/50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded" style={{ background: board.backgroundColor || '#0052cc' }} />
                    <div>
                      <p className="font-medium">{board.name}</p>
                      <p className="text-sm text-muted-foreground">{board.workspace?.name}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {q && !isLoading && !data?.total && (
        <div className="text-center py-12 text-muted-foreground">
          <Search className="mx-auto h-12 w-12 mb-4 opacity-30" />
          <p>No results for "{q}"</p>
        </div>
      )}
    </div>
  );
}
