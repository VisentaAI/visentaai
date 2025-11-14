import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Users, MessageSquare, ArrowLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Group {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  created_by: string;
  created_at: string;
  memberCount?: number;
}

export default function Groups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    logo_url: ''
  });
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadGroups();
    setupRealtimeSubscription();
  }, []);

  const loadGroups = async () => {
    try {
      const { data: groupsData, error } = await supabase
        .from('groups')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Load member counts
      const groupsWithCounts = await Promise.all(
        (groupsData || []).map(async (group) => {
          const { count } = await supabase
            .from('group_members')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id);

          return { ...group, memberCount: count || 0 };
        })
      );

      setGroups(groupsWithCounts);
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
      .channel('groups-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'groups'
        },
        () => loadGroups()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

      setNewGroup(prev => ({ ...prev, logo_url: publicUrl }));
      
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

  const createGroup = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (!newGroup.name.trim()) {
        toast({
          title: "Error",
          description: "Group name is required",
          variant: "destructive"
        });
        return;
      }

      // Create group
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .insert({
          name: newGroup.name,
          description: newGroup.description,
          logo_url: newGroup.logo_url,
          created_by: user.id
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Add creator as admin member
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: groupData.id,
          user_id: user.id,
          role: 'admin'
        });

      if (memberError) throw memberError;

      toast({
        title: "Success",
        description: "Group created successfully"
      });

      setCreateDialogOpen(false);
      setNewGroup({ name: '', description: '', logo_url: '' });
      loadGroups();
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

  return (
    <div className="min-h-screen bg-background" style={{ background: 'var(--gradient-hero)' }}>
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali
              </Button>
              <h1 className="text-4xl font-bold gradient-text">Grup Saya</h1>
              <p className="text-muted-foreground mt-2">
                Kelola dan bergabung dengan grup privat
              </p>
            </div>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2">
                  <Plus className="h-5 w-5" />
                  Buat Grup Baru
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Buat Grup Baru</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nama Grup *</Label>
                    <Input
                      id="name"
                      value={newGroup.name}
                      onChange={(e) => setNewGroup(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Masukkan nama grup"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Deskripsi</Label>
                    <Textarea
                      id="description"
                      value={newGroup.description}
                      onChange={(e) => setNewGroup(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Jelaskan tentang grup ini"
                    />
                  </div>
                  <div>
                    <Label htmlFor="logo">Logo Grup</Label>
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={uploading}
                    />
                    {newGroup.logo_url && (
                      <Avatar className="mt-2 h-16 w-16">
                        <AvatarImage src={newGroup.logo_url} />
                        <AvatarFallback>LOGO</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                  <Button onClick={createGroup} className="w-full" disabled={uploading}>
                    {uploading ? 'Mengupload...' : 'Buat Grup'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {groups.length === 0 ? (
            <Card className="p-12 text-center">
              <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Belum ada grup</h3>
              <p className="text-muted-foreground mb-4">
                Buat grup pertama Anda atau tunggu undangan
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Buat Grup Baru
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group) => (
                <Card
                  key={group.id}
                  className="p-6 hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => navigate(`/group/${group.id}`)}
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={group.logo_url || ''} />
                      <AvatarFallback>
                        {group.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-1 truncate group-hover:text-primary transition-colors">
                        {group.name}
                      </h3>
                      {group.description && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {group.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {group.memberCount} anggota
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          Chat
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
