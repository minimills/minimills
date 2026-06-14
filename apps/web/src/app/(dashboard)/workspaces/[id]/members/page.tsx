'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, Mail, MoreHorizontal, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { getInitials, formatDate } from '@/lib/utils';
import type { WorkspaceMember } from '@minimills/shared';

export default function WorkspaceMembersPage({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MEMBER');

  const { data: members = [] } = useQuery<WorkspaceMember[]>({
    queryKey: ['workspace-members', params.id],
    queryFn: () => api.get(`/workspaces/${params.id}/members`),
  });

  const invite = useMutation({
    mutationFn: () => api.post(`/workspaces/${params.id}/members/invite`, { email: inviteEmail, role: inviteRole }),
    onSuccess: () => { toast({ title: 'Invitation sent!' }); setInviteOpen(false); setInviteEmail(''); },
    onError: (err: any) => toast({ title: 'Failed', description: err.message, variant: 'destructive' }),
  });

  const removeMember = useMutation({
    mutationFn: (userId: string) => api.delete(`/workspaces/${params.id}/members/${userId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workspace-members', params.id] }),
  });

  const roleColors: Record<string, string> = {
    OWNER: 'bg-purple-100 text-purple-700',
    ADMIN: 'bg-blue-100 text-blue-700',
    MEMBER: 'bg-green-100 text-green-700',
    OBSERVER: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Members</h1>
          <p className="text-muted-foreground">{members.length} members</p>
        </div>
        <Button onClick={() => setInviteOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />Invite member
        </Button>
      </div>

      <div className="space-y-2">
        {members.map((member) => (
          <div key={member.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50">
            <Avatar className="h-10 w-10">
              <AvatarImage src={member.user.avatarUrl ?? undefined} />
              <AvatarFallback>{getInitials(member.user.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium">{member.user.name}</p>
              <p className="text-sm text-muted-foreground">{member.user.email}</p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[member.role] || roleColors.MEMBER}`}>
              {member.role}
            </span>
            <p className="text-xs text-muted-foreground">Joined {formatDate(member.joinedAt)}</p>
            {member.role !== 'OWNER' && (
              <Button variant="ghost" size="sm" className="text-destructive" onClick={() => removeMember.mutate(member.userId)}>
                Remove
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Invite dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Invite member</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  type="email"
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin — can manage board and members</SelectItem>
                  <SelectItem value="MEMBER">Member — can create and edit cards</SelectItem>
                  <SelectItem value="OBSERVER">Observer — read-only access</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3">
              <Button className="flex-1" onClick={() => invite.mutate()} disabled={!inviteEmail || invite.isPending}>
                {invite.isPending ? 'Sending...' : 'Send invitation'}
              </Button>
              <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
