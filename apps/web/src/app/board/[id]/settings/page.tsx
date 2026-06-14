'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Settings, Trash2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import type { Board, AutomationRule } from '@minimills/shared';

export default function BoardSettingsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: board } = useQuery<Board>({
    queryKey: ['board', params.id],
    queryFn: () => api.get(`/boards/${params.id}`),
  });

  const [name, setName] = useState(board?.name || '');
  const [description, setDescription] = useState(board?.description || '');
  const [visibility, setVisibility] = useState(board?.visibility || 'WORKSPACE');

  const updateBoard = useMutation({
    mutationFn: () => api.patch(`/boards/${params.id}`, { name, description, visibility }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['board', params.id] }); toast({ title: 'Board updated' }); },
  });

  const deleteBoard = useMutation({
    mutationFn: () => api.delete(`/boards/${params.id}`),
    onSuccess: () => { toast({ title: 'Board deleted' }); router.push('/dashboard'); },
  });

  const { data: automationRules = [] } = useQuery<AutomationRule[]>({
    queryKey: ['automation-rules', params.id],
    queryFn: () => api.get(`/automation/boards/${params.id}`),
  });

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-8">
      <h1 className="text-2xl font-bold">Board Settings</h1>

      {/* General */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" />General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Board name</Label>
            <Input value={name || board?.name || ''} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input value={description || board?.description || ''} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
          </div>
          <div className="space-y-2">
            <Label>Visibility</Label>
            <Select value={visibility || board?.visibility} onValueChange={setVisibility}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PRIVATE">Private — only board members</SelectItem>
                <SelectItem value="WORKSPACE">Workspace — all workspace members</SelectItem>
                <SelectItem value="PUBLIC">Public — anyone with link</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => updateBoard.mutate()} disabled={updateBoard.isPending}>Save changes</Button>
        </CardContent>
      </Card>

      {/* Automation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5" />Automation</CardTitle>
          <CardDescription>Set up automated workflows for this board</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {automationRules.length === 0 ? (
            <p className="text-sm text-muted-foreground">No automation rules yet.</p>
          ) : (
            <div className="space-y-2">
              {automationRules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{rule.name}</p>
                    <p className="text-xs text-muted-foreground">{rule.executionCount} executions</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${rule.isEnabled ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {rule.isEnabled ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <AutomationRuleCreator boardId={params.id} />
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Delete this board</p>
              <p className="text-sm text-muted-foreground">This will permanently delete the board and all its cards.</p>
            </div>
            <Button
              variant="destructive"
              onClick={() => { if (confirm('Delete this board? This cannot be undone.')) deleteBoard.mutate(); }}
            >
              <Trash2 className="mr-2 h-4 w-4" />Delete board
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AutomationRuleCreator({ boardId }: { boardId: string }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [triggerType, setTriggerType] = useState('CARD_CREATED');
  const [actionType, setActionType] = useState('ADD_LABEL');
  const [showing, setShowing] = useState(false);

  const create = useMutation({
    mutationFn: () => api.post(`/automation/boards/${boardId}`, {
      name,
      trigger: { type: triggerType, config: {} },
      conditions: [],
      actions: [{ type: actionType, config: {} }],
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['automation-rules', boardId] }); toast({ title: 'Rule created' }); setShowing(false); setName(''); },
  });

  if (!showing) {
    return <Button variant="outline" onClick={() => setShowing(true)}><Zap className="mr-2 h-4 w-4" />Create rule</Button>;
  }

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="space-y-2">
        <Label>Rule name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Move to Done when due date passes" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Trigger</Label>
          <Select value={triggerType} onValueChange={setTriggerType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="CARD_CREATED">Card created</SelectItem>
              <SelectItem value="CARD_MOVED">Card moved</SelectItem>
              <SelectItem value="CARD_ASSIGNED">Card assigned</SelectItem>
              <SelectItem value="CARD_DUE_DATE_APPROACHING">Due date approaching</SelectItem>
              <SelectItem value="CHECKLIST_COMPLETED">Checklist completed</SelectItem>
              <SelectItem value="SCHEDULED">Scheduled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Action</Label>
          <Select value={actionType} onValueChange={setActionType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="MOVE_CARD">Move card to list</SelectItem>
              <SelectItem value="ADD_LABEL">Add label</SelectItem>
              <SelectItem value="REMOVE_LABEL">Remove label</SelectItem>
              <SelectItem value="SET_PRIORITY">Set priority</SelectItem>
              <SelectItem value="ADD_COMMENT">Add comment</SelectItem>
              <SelectItem value="ARCHIVE_CARD">Archive card</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={() => create.mutate()} disabled={!name.trim() || create.isPending}>Create rule</Button>
        <Button variant="outline" onClick={() => setShowing(false)}>Cancel</Button>
      </div>
    </div>
  );
}
