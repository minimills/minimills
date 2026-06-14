'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, Bell, User, Key, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  const updateProfile = useMutation({
    mutationFn: () => api.patch('/users/me', { name, username, bio }),
    onSuccess: (data: any) => { setUser(data); toast({ title: 'Profile updated' }); },
    onError: (err: any) => toast({ title: 'Update failed', description: err.message, variant: 'destructive' }),
  });

  const changePassword = useMutation({
    mutationFn: () => api.post('/users/me/change-password', { currentPassword: currentPw, newPassword: newPw }),
    onSuccess: () => { toast({ title: 'Password changed' }); setCurrentPw(''); setNewPw(''); setConfirmPw(''); },
    onError: (err: any) => toast({ title: 'Failed', description: err.message, variant: 'destructive' }),
  });

  const setup2FA = useMutation({
    mutationFn: () => api.post('/auth/2fa/setup'),
    onSuccess: (data: any) => {
      toast({ title: 'Scan the QR code with your authenticator app', description: `Secret: ${data.secret}` });
    },
  });

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />Profile</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Username</Label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Bio</Label>
            <Input value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself..." />
          </div>
          <Button onClick={() => updateProfile.mutate()} disabled={updateProfile.isPending}>
            {updateProfile.isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Key className="h-5 w-5" />Password</CardTitle>
          <CardDescription>Change your account password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Current password</Label>
            <Input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>New password</Label>
            <Input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Confirm new password</Label>
            <Input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
          </div>
          <Button
            onClick={() => changePassword.mutate()}
            disabled={changePassword.isPending || !currentPw || !newPw || newPw !== confirmPw}
          >
            Change password
          </Button>
        </CardContent>
      </Card>

      {/* 2FA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Smartphone className="h-5 w-5" />Two-Factor Authentication</CardTitle>
          <CardDescription>Add an extra layer of security to your account</CardDescription>
        </CardHeader>
        <CardContent>
          {user?.twoFactorEnabled ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-green-600">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">2FA is enabled</span>
              </div>
              <Button variant="outline" className="text-destructive" onClick={() => {}}>
                Disable 2FA
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">2FA is not enabled on your account.</p>
              <Button onClick={() => setup2FA.mutate()} disabled={setup2FA.isPending}>
                Set up 2FA
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" />Notifications</CardTitle>
          <CardDescription>Control when and how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <NotificationPreferences />
        </CardContent>
      </Card>
    </div>
  );
}

function NotificationPreferences() {
  const { data: userData } = useQuery({ queryKey: ['me'], queryFn: () => api.get('/users/me') });
  const qc = useQueryClient();
  const { toast } = useToast();

  const update = useMutation({
    mutationFn: (data: object) => api.patch('/users/me/notifications', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['me'] }); toast({ title: 'Saved' }); },
  });

  const prefs = [
    { key: 'notifyEmail', label: 'Email notifications', description: 'Receive notifications via email' },
    { key: 'notifyAssigned', label: 'Card assignments', description: 'When someone assigns you to a card' },
    { key: 'notifyMentioned', label: 'Mentions', description: 'When someone mentions you in a comment' },
    { key: 'notifyComments', label: 'Comments', description: 'When someone comments on your cards' },
    { key: 'notifyDueDates', label: 'Due date reminders', description: 'Reminders for upcoming due dates' },
  ];

  return (
    <div className="space-y-4">
      {prefs.map(({ key, label, description }) => (
        <div key={key} className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{label}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <input
            type="checkbox"
            checked={(userData as any)?.[key] ?? true}
            onChange={(e) => update.mutate({ [key]: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300"
          />
        </div>
      ))}
    </div>
  );
}
