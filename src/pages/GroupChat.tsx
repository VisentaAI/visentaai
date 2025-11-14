import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Send, ArrowLeft, Settings, Users, UserPlus, Mail, Link2, Copy, Trash } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { z } from 'zod';
import { Badge } from '@/components/ui/badge';

interface Group {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
}

interface Member {
  id: string;
  user_id: string;
  role: string;
  profiles: {
    full_name: string;
    avatar_url: string | null;
  };
}

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  profiles: {
    full_name: string;
    avatar_url: string | null;
  };
}

interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

interface Invitation {
  id: string;
  email: string | null;
  token: string;
  status: string;
  expires_at: string;
  created_at: string;
}

const emailSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255)
});

export default function GroupChat() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [groupData, setGroupData] = useState({ name: '', description: '', logo_url: '' });
  const [uploading, setUploading] = useState(false);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (currentUserId && groupId) {
      loadGroupData();
      setupRealtimeSubscription();
    }
  }, [currentUserId, groupId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    setCurrentUserId(user.id);
  };

  const loadGroupData = async () => {
    try {
      // Load group info
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .single();

      if (groupError) throw groupError;
      
      setGroup({
        id: groupData.id,
        name: groupData.name,
        description: groupData.description,
        logo_url: groupData.logo_url
      });

      // Load members
      const { data: membersData, error: membersError } = await supabase
        .from('group_members')
        .select('*, profiles(full_name, avatar_url)')
        .eq('group_id', groupId);

      if (membersError) throw membersError;
      setMembers(membersData || []);

      // Check if current user is admin
      const userMember = membersData?.find(m => m.user_id === currentUserId);
      setIsAdmin(userMember?.role === 'admin');

      // Load messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('group_messages')
        .select('*, profiles(full_name, avatar_url)')
        .eq('group_id', groupId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;
      setMessages(messagesData || []);

      // Load all profiles for adding members
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .neq('id', currentUserId!);
      
      setAllProfiles(profilesData || []);

      // Load group data for settings
      setGroupData({
        name: groupData.name,
        description: groupData.description || '',
        logo_url: groupData.logo_url || ''
      });

      // Load invitations if admin
      if (userMember?.role === 'admin') {
        loadInvitations();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadInvitations = async () => {
    const { data, error } = await supabase
      .from('group_invitations')
      .select('*')
      .eq('group_id', groupId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setInvitations(data);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`group-${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_messages',
          filter: `group_id=eq.${groupId}`
        },
        async (payload) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', payload.new.sender_id)
            .single();

          setMessages(prev => [...prev, {
            ...payload.new,
            profiles: profileData
          } as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUserId || !groupId) return;

    try {
      const { error } = await supabase
        .from('group_messages')
        .insert({
          group_id: groupId,
          sender_id: currentUserId,
          content: newMessage.trim()
        });

      if (error) throw error;
      setNewMessage('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const addMember = async () => {
    if (!selectedUserId) return;

    try {
      const { error } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: selectedUserId,
          role: 'member'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Member added successfully"
      });
      
      setAddMemberOpen(false);
      setSelectedUserId('');
      loadGroupData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const removeMember = async (memberId: string, userId: string) => {
    if (userId === currentUserId) {
      toast({
        title: "Error",
        description: "You cannot remove yourself",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Member removed successfully"
      });
      
      loadGroupData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const updateGroupSettings = async () => {
    try {
      const { error } = await supabase
        .from('groups')
        .update({
          name: groupData.name,
          description: groupData.description,
          logo_url: groupData.logo_url
        })
        .eq('id', groupId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Group settings updated"
      });
      
      setSettingsOpen(false);
      loadGroupData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setGroupData(prev => ({ ...prev, logo_url: publicUrl }));
      
      toast({
        title: "Success",
        description: "Logo uploaded successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const sendEmailInvitation = async () => {
    try {
      const validation = emailSchema.safeParse({ email: inviteEmail });
      if (!validation.success) {
        toast({
          title: "Invalid Email",
          description: validation.error.issues[0].message,
          variant: "destructive"
        });
        return;
      }

      setSendingInvite(true);
      
      const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { error } = await supabase
        .from('group_invitations')
        .insert({
          group_id: groupId,
          invited_by: currentUserId!,
          email: inviteEmail,
          token,
          expires_at: expiresAt.toISOString(),
          status: 'pending'
        });

      if (error) throw error;

      const inviteLink = `${window.location.origin}/group-invite?token=${token}`;
      
      toast({
        title: "Invitation Created",
        description: "Copy the link below and send it to the invitee",
      });

      await navigator.clipboard.writeText(inviteLink);
      
      setInviteEmail('');
      loadInvitations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSendingInvite(false);
    }
  };

  const copyInviteLink = async (token: string) => {
    const inviteLink = `${window.location.origin}/group-invite?token=${token}`;
    await navigator.clipboard.writeText(inviteLink);
    toast({
      title: "Link Copied",
      description: "Invitation link copied to clipboard"
    });
  };

  const deleteInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('group_invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invitation deleted"
      });
      
      loadInvitations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!group) {
    return <div>Group not found</div>;
  }

  const availableProfiles = allProfiles.filter(
    profile => !members.some(member => member.user_id === profile.id)
  );

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/groups')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Avatar className="h-10 w-10">
              <AvatarImage src={group.logo_url || ''} />
              <AvatarFallback>{group.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold">{group.name}</h2>
              <p className="text-sm text-muted-foreground">{members.length} anggota</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <>
                <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon">
                      <UserPlus className="h-5 w-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Tambah Anggota</DialogTitle>
                    </DialogHeader>
                    <Tabs defaultValue="existing" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="existing">Pengguna Terdaftar</TabsTrigger>
                        <TabsTrigger value="invite">Undang via Email</TabsTrigger>
                      </TabsList>
                      <TabsContent value="existing" className="space-y-4">
                        {availableProfiles.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            Semua pengguna sudah menjadi anggota
                          </p>
                        ) : (
                          <>
                            <div>
                              <Label>Pilih Pengguna</Label>
                              <select
                                className="w-full mt-2 p-2 border rounded-md"
                                value={selectedUserId}
                                onChange={(e) => setSelectedUserId(e.target.value)}
                              >
                                <option value="">Pilih pengguna...</option>
                                {availableProfiles.map((profile) => (
                                  <option key={profile.id} value={profile.id}>
                                    {profile.full_name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <Button onClick={addMember} className="w-full" disabled={!selectedUserId}>
                              Tambah Anggota
                            </Button>
                          </>
                        )}
                      </TabsContent>
                      <TabsContent value="invite" className="space-y-4">
                        <div>
                          <Label htmlFor="invite-email">Email</Label>
                          <Input
                            id="invite-email"
                            type="email"
                            placeholder="email@example.com"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                          />
                        </div>
                        <Button 
                          onClick={sendEmailInvitation} 
                          className="w-full"
                          disabled={sendingInvite || !inviteEmail}
                        >
                          {sendingInvite ? 'Mengirim...' : 'Buat Link Undangan'}
                        </Button>
                        
                        {invitations.length > 0 && (
                          <div className="mt-6">
                            <h4 className="text-sm font-medium mb-3">Undangan Aktif</h4>
                            <div className="space-y-2">
                              {invitations.map((inv) => (
                                <div key={inv.id} className="flex items-center justify-between p-3 border rounded-lg">
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">{inv.email || 'Link Undangan'}</p>
                                    <p className="text-xs text-muted-foreground">
                                      Expires: {format(new Date(inv.expires_at), 'PP')}
                                    </p>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => copyInviteLink(inv.token)}
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => deleteInvitation(inv.id)}
                                    >
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
                
                <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Settings className="h-5 w-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Pengaturan Grup</DialogTitle>
                    </DialogHeader>
                    <Tabs defaultValue="info" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="info">Info Grup</TabsTrigger>
                        <TabsTrigger value="members">Anggota</TabsTrigger>
                      </TabsList>
                      <TabsContent value="info" className="space-y-4">
                        <div>
                          <Label htmlFor="group-name">Nama Grup</Label>
                          <Input
                            id="group-name"
                            value={groupData.name}
                            onChange={(e) => setGroupData(prev => ({ ...prev, name: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="group-description">Deskripsi</Label>
                          <Textarea
                            id="group-description"
                            value={groupData.description}
                            onChange={(e) => setGroupData(prev => ({ ...prev, description: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="group-logo">Logo Grup</Label>
                          <Input
                            id="group-logo"
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            disabled={uploading}
                          />
                          {groupData.logo_url && (
                            <Avatar className="mt-2 h-16 w-16">
                              <AvatarImage src={groupData.logo_url} />
                              <AvatarFallback>LOGO</AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                        <Button onClick={updateGroupSettings} className="w-full" disabled={uploading}>
                          Simpan Perubahan
                        </Button>
                      </TabsContent>
                      <TabsContent value="members" className="space-y-4">
                        <ScrollArea className="h-[300px]">
                          <div className="space-y-2">
                            {members.map((member) => (
                              <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                  <Avatar>
                                    <AvatarImage src={member.profiles.avatar_url || ''} />
                                    <AvatarFallback>
                                      {member.profiles.full_name?.[0]?.toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">{member.profiles.full_name}</p>
                                    <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                                      {member.role}
                                    </Badge>
                                  </div>
                                </div>
                                {member.user_id !== currentUserId && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeMember(member.id, member.user_id)}
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-4">
          {messages.map((message) => {
            const isOwnMessage = message.sender_id === currentUserId;
            return (
              <div
                key={message.id}
                className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {!isOwnMessage && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={message.profiles.avatar_url || ''} />
                    <AvatarFallback>
                      {message.profiles.full_name?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                  {!isOwnMessage && (
                    <p className="text-xs text-muted-foreground mb-1">
                      {message.profiles.full_name}
                    </p>
                  )}
                  <div
                    className={`rounded-lg px-4 py-2 max-w-md ${
                      isOwnMessage
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(message.created_at), 'HH:mm')}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t bg-card px-6 py-4">
        <div className="flex items-center gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ketik pesan..."
            className="flex-1"
          />
          <Button onClick={sendMessage} size="icon">
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
