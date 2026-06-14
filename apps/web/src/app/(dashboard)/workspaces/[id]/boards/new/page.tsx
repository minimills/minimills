'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import type { Board } from '@minimills/shared';

const COLORS = [
  '#0052cc', '#00875A', '#FF5630', '#6554C0', '#0065FF',
  '#FF7452', '#36B37E', '#00B8D9', '#FF991F', '#403294',
];

export default function NewBoardPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [visibility, setVisibility] = useState('WORKSPACE');
  const [color, setColor] = useState(COLORS[0]);

  const createBoard = useMutation({
    mutationFn: (data: object) => api.post<Board>('/boards', data),
    onSuccess: (board) => {
      qc.invalidateQueries({ queryKey: ['workspace-boards', params.id] });
      router.push(`/board/${board.id}`);
    },
    onError: (err: any) => toast({ title: 'Failed to create board', description: err.message, variant: 'destructive' }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createBoard.mutate({ workspaceId: params.id, name, visibility, backgroundColor: color });
  };

  return (
    <div className="max-w-lg mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Create new board</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label>Board name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Product Roadmap" autoFocus />
        </div>

        <div className="space-y-2">
          <Label>Background color</Label>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-10 h-10 rounded-lg border-2 transition-all ${color === c ? 'border-foreground scale-110' : 'border-transparent'}`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Visibility</Label>
          <Select value={visibility} onValueChange={setVisibility}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PRIVATE">Private — only board members</SelectItem>
              <SelectItem value="WORKSPACE">Workspace — all workspace members</SelectItem>
              <SelectItem value="PUBLIC">Public — anyone with the link</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={!name.trim() || createBoard.isPending} className="flex-1">
            {createBoard.isPending ? 'Creating...' : 'Create board'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
