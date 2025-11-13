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

interface Community {
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

export default function PrivateCommunityChat() {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [community, setCommunity] = useState<Community | null>(null);
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
  const [communityData, setCommunityData] = useState({ name: '', description: '', logo_url: '' });
  const [uploading, setUploading] = useState(false);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (currentUserId && communityId) {
      loadCommunityData();
      setupRealtimeSubscription();
    }
  }, [currentUserId, communityId]);

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

  const loadCommunityData = async () => {
    try {
      // Load community details
      const { data: communityData, error: communityError } = await supabase
        .from('private_communities')
        .select('*')
        .eq('id', communityId)
        .single();

      if (communityError) throw communityError;
      setCommunity(communityData);
      setCommunityData({
        name: communityData.name,
        description: communityData.description || '',
        logo_url: communityData.logo_url || ''
      });

      // Load members
      const { data: membersData, error: membersError } = await supabase
        .from('private_community_members')
        .select('*, profiles!user_id(full_name, avatar_url)')
        .eq('community_id', communityId);

      if (membersError) throw membersError;
      setMembers(membersData || []);

      // Check if current user is admin
      const userMember = membersData?.find(m => m.user_id === currentUserId);
      setIsAdmin(userMember?.role === 'admin');

      // Load messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('private_community_messages')
        .select('*, profiles!sender_id(full_name, avatar_url)')
        .eq('community_id', communityId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;
      setMessages(messagesData || []);

      // Load all profiles for adding members
      if (userMember?.role === 'admin') {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .neq('id', currentUserId);
        
        setAllProfiles(profilesData || []);
        
        // Load invitations
        const { data: invitationsData } = await supabase
          .from('private_community_invitations')
          .select('*')
          .eq('community_id', communityId)
          .order('created_at', { ascending: false });
        
        setInvitations(invitationsData || []);
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

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`private-community-${communityId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'private_community_messages',
          filter: `community_id=eq.${communityId}`
        },
        async (payload) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', payload.new.sender_id)
            .single();

          setMessages(prev => [...prev, { ...payload.new, profiles: profile } as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUserId) return;

    try {
      const { error } = await supabase
        .from('private_community_messages')
        .insert({
          community_id: communityId,
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

  const handleAddMember = async () => {
    if (!selectedUserId) return;

    try {
      const { error } = await supabase
        .from('private_community_members')
        .insert({
          community_id: communityId,
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
      loadCommunityData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleRemoveMember = async (memberId: string, userId: string) => {
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
        .from('private_community_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Member removed successfully"
      });

      loadCommunityData();
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
      const filePath = `community-logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setCommunityData({ ...communityData, logo_url: publicUrl });
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

  const handleUpdateCommunity = async () => {
    try {
      const { error } = await supabase
        .from('private_communities')
        .update({
          name: communityData.name,
          description: communityData.description,
          logo_url: communityData.logo_url
        })
        .eq('id', communityId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Community updated successfully"
      });

      setSettingsOpen(false);
      loadCommunityData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const generateInviteLink = async () => {
    try {
      // Generate random token
      const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      // Create invitation that expires in 7 days
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { error } = await supabase
        .from('private_community_invitations')
        .insert({
          community_id: communityId,
          invited_by: currentUserId,
          token,
          expires_at: expiresAt.toISOString()
        });

      if (error) throw error;

      const inviteUrl = `${window.location.origin}/invite?token=${token}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(inviteUrl);
      
      toast({
        title: "Invitation Link Created",
        description: "Link copied to clipboard!"
      });

      loadCommunityData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const sendEmailInvite = async () => {
    if (!inviteEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive"
      });
      return;
    }

    // Validate email
    const validation = emailSchema.safeParse({ email: inviteEmail });
    if (!validation.success) {
      toast({
        title: "Error",
        description: validation.error.issues[0].message,
        variant: "destructive"
      });
      return;
    }

    setSendingInvite(true);
    try {
      // Generate token
      const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { error } = await supabase
        .from('private_community_invitations')
        .insert({
          community_id: communityId,
          invited_by: currentUserId,
          email: validation.data.email,
          token,
          expires_at: expiresAt.toISOString()
        });

      if (error) throw error;

      // TODO: Call edge function to send email when Resend API key is configured
      // For now, just copy the link
      const inviteUrl = `${window.location.origin}/invite?token=${token}`;
      await navigator.clipboard.writeText(inviteUrl);

      toast({
        title: "Invitation Created",
        description: "Invitation link copied! (Email sending requires Resend API key)"
      });

      setInviteEmail('');
      loadCommunityData();
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
    const inviteUrl = `${window.location.origin}/invite?token=${token}`;
    await navigator.clipboard.writeText(inviteUrl);
    toast({
      title: "Copied!",
      description: "Invitation link copied to clipboard"
    });
  };

  const deleteInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('private_community_invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invitation deleted"
      });

      loadCommunityData();
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!community) return null;

  const availableProfiles = allProfiles.filter(
    profile => !members.some(member => member.user_id === profile.id)
  );

  return (
    <div className="h-screen flex flex-col relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/5 -z-10" />
      <div className="absolute inset-0 ai-grid opacity-30 -z-10" />
      
      {/* Header */}
      <div className="glass border-b border-border/50 px-6 py-4 relative z-10">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/private-communities')}
              className="hover:bg-primary/10 transition-all hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Avatar className="w-12 h-12 ring-2 ring-primary/20">
              <AvatarImage src={community.logo_url || ''} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                {community.name[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-semibold text-xl gradient-text">{community.name}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span>{members.length} members</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {isAdmin && (
              <>
                <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon" className="hover:bg-primary/10 transition-all hover:scale-105">
                      <UserPlus className="w-5 h-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Member</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <Label>Select User</Label>
                      <ScrollArea className="h-64 border rounded-md p-2">
                        {availableProfiles.map(profile => (
                          <div
                            key={profile.id}
                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-accent ${
                              selectedUserId === profile.id ? 'bg-accent' : ''
                            }`}
                            onClick={() => setSelectedUserId(profile.id)}
                          >
                            <Avatar>
                              <AvatarImage src={profile.avatar_url || ''} />
                              <AvatarFallback>{profile.full_name[0]}</AvatarFallback>
                            </Avatar>
                            <span>{profile.full_name}</span>
                          </div>
                        ))}
                      </ScrollArea>
                      <Button onClick={handleAddMember} className="w-full" disabled={!selectedUserId}>
                        Add Member
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon" className="hover:bg-primary/10 transition-all hover:scale-105">
                      <Settings className="w-5 h-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                      <DialogTitle>Community Settings</DialogTitle>
                    </DialogHeader>
                    <Tabs defaultValue="details" className="flex-1 flex flex-col overflow-hidden">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="members">Members</TabsTrigger>
                        <TabsTrigger value="invitations">Invitations</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="details" className="space-y-4 overflow-y-auto p-4">
                        <div className="space-y-4">
                          <h3 className="font-semibold">Community Information</h3>
                          <div className="space-y-2">
                            <Label>Community Name</Label>
                            <Input
                              value={communityData.name}
                              onChange={(e) => setCommunityData({ ...communityData, name: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                              value={communityData.description}
                              onChange={(e) => setCommunityData({ ...communityData, description: e.target.value })}
                              rows={3}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Logo</Label>
                            <div className="flex items-center gap-4">
                              {communityData.logo_url && (
                                <Avatar className="w-16 h-16">
                                  <AvatarImage src={communityData.logo_url} />
                                  <AvatarFallback>{communityData.name[0]}</AvatarFallback>
                                </Avatar>
                              )}
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                disabled={uploading}
                              />
                            </div>
                          </div>
                          <Button onClick={handleUpdateCommunity} disabled={uploading} className="w-full">
                            Save Changes
                          </Button>
                        </div>
                      </TabsContent>

                      <TabsContent value="members" className="overflow-y-auto p-4">
                        <div className="space-y-4">
                          <h3 className="font-semibold flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Members ({members.length})
                          </h3>
                          <div className="space-y-2 max-h-96 overflow-y-auto border rounded-md p-2">
                          {members.map(member => (
                            <div key={member.id} className="flex items-center justify-between p-3 hover:bg-accent rounded-lg">
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src={member.profiles.avatar_url || ''} />
                                  <AvatarFallback>{member.profiles.full_name[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{member.profiles.full_name}</p>
                                  <Badge variant={member.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                                    {member.role}
                                  </Badge>
                                </div>
                              </div>
                              {member.user_id !== currentUserId && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveMember(member.id, member.user_id)}
                                >
                                  Remove
                                </Button>
                              )}
                            </div>
                          ))}
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="invitations" className="overflow-y-auto p-4">
                        <div className="space-y-4">
                          <div className="space-y-3">
                            <h3 className="font-semibold flex items-center gap-2">
                              <Link2 className="w-5 h-5" />
                              Create Invitation
                            </h3>
                            <div className="flex gap-2">
                              <Button onClick={generateInviteLink} variant="outline" className="flex-1">
                                <Link2 className="w-4 h-4 mr-2" />
                                Generate Link
                              </Button>
                            </div>
                            
                            <div className="pt-2">
                              <Label>Invite by Email</Label>
                              <div className="flex gap-2 mt-2">
                                <Input
                                  type="email"
                                  placeholder="Enter email address"
                                  value={inviteEmail}
                                  onChange={(e) => setInviteEmail(e.target.value)}
                                  className="flex-1"
                                />
                                <Button onClick={sendEmailInvite} disabled={sendingInvite}>
                                  <Mail className="w-4 h-4 mr-2" />
                                  Send
                                </Button>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Email sending requires Resend API key configuration
                              </p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h3 className="font-semibold">Active Invitations ({invitations.filter(i => i.status === 'pending').length})</h3>
                            <div className="space-y-2 max-h-80 overflow-y-auto border rounded-md p-2">
                              {invitations.filter(i => i.status === 'pending').length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">No active invitations</p>
                              ) : (
                                invitations.filter(i => i.status === 'pending').map(invitation => (
                                  <div key={invitation.id} className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                                    <div className="flex-1 min-w-0">
                                      {invitation.email && (
                                        <p className="font-medium text-sm truncate">{invitation.email}</p>
                                      )}
                                      <p className="text-xs text-muted-foreground">
                                        Expires: {new Date(invitation.expires_at).toLocaleDateString()}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        Created: {new Date(invitation.created_at).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <div className="flex gap-1">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => copyInviteLink(invitation.token)}
                                      >
                                        <Copy className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                                        onClick={() => deleteInvitation(invitation.id)}
                                      >
                                        <Trash className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
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
      <ScrollArea className="flex-1 px-6 py-4 relative" ref={scrollRef}>
        <div className="space-y-4 max-w-4xl mx-auto relative z-10">
          {messages.map((message) => {
            const isOwnMessage = message.sender_id === currentUserId;
            return (
              <div
                key={message.id}
                className={`flex gap-3 animate-fade-in ${isOwnMessage ? 'flex-row-reverse' : ''}`}
              >
                <Avatar className="w-9 h-9 ring-2 ring-primary/10">
                  <AvatarImage src={message.profiles.avatar_url || ''} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {message.profiles.full_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className={`flex flex-col ${isOwnMessage ? 'items-end' : ''}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{message.profiles.full_name}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(message.created_at), 'HH:mm')}
                    </span>
                  </div>
                  <div
                    className={`px-4 py-2.5 rounded-2xl max-w-md transition-all hover:shadow-md ${
                      isOwnMessage
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'glass border border-border/50'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="glass border-t border-border/50 px-6 py-4 relative z-10">
        <form onSubmit={handleSendMessage} className="flex gap-2 max-w-4xl mx-auto">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 glass focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <Button type="submit" size="icon" className="hover:scale-105 transition-all shadow-md">
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}