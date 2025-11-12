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

interface PrivateCommunity {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  created_by: string;
  created_at: string;
  memberCount?: number;
}

export default function PrivateCommunities() {
  const [communities, setCommunities] = useState<PrivateCommunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newCommunity, setNewCommunity] = useState({
    name: '',
    description: '',
    logo_url: ''
  });
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadCommunities();
    setupRealtimeSubscription();
  }, []);

  const loadCommunities = async () => {
    try {
      const { data: communitiesData, error } = await supabase
        .from('private_communities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Load member counts
      const communitiesWithCounts = await Promise.all(
        (communitiesData || []).map(async (community) => {
          const { count } = await supabase
            .from('private_community_members')
            .select('*', { count: 'exact', head: true })
            .eq('community_id', community.id);

          return { ...community, memberCount: count || 0 };
        })
      );

      setCommunities(communitiesWithCounts);
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
      .channel('private-communities-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'private_communities'
        },
        () => loadCommunities()
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
      const filePath = `community-logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setNewCommunity({ ...newCommunity, logo_url: publicUrl });
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

  const handleCreateCommunity = async () => {
    if (!newCommunity.name.trim()) {
      toast({
        title: "Error",
        description: "Community name is required",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create community
      const { data: community, error: createError } = await supabase
        .from('private_communities')
        .insert({
          name: newCommunity.name,
          description: newCommunity.description,
          logo_url: newCommunity.logo_url,
          created_by: user.id
        })
        .select()
        .single();

      if (createError) throw createError;

      // Add creator as admin member
      const { error: memberError } = await supabase
        .from('private_community_members')
        .insert({
          community_id: community.id,
          user_id: user.id,
          role: 'admin'
        });

      if (memberError) throw memberError;

      toast({
        title: "Success",
        description: "Private community created successfully"
      });

      setCreateDialogOpen(false);
      setNewCommunity({ name: '', description: '', logo_url: '' });
      loadCommunities();
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading communities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/5 -z-10" />
      <div className="absolute inset-0 ai-grid opacity-30 -z-10" />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
        <Button
          variant="ghost"
          onClick={() => navigate("/community")}
          className="mb-6 hover:bg-primary/10 transition-all hover:scale-105"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Public Chat
        </Button>
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold gradient-text">
              Private Communities
            </h1>
            <p className="text-muted-foreground mt-2">
              Create and join exclusive chat communities
            </p>
          </div>
          
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2 shadow-md hover:scale-105 transition-all">
                <Plus className="w-5 h-5" />
                Create Community
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create Private Community</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Community Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter community name"
                    value={newCommunity.name}
                    onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your community..."
                    value={newCommunity.description}
                    onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo">Community Logo</Label>
                  <div className="flex items-center gap-4">
                    {newCommunity.logo_url && (
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={newCommunity.logo_url} />
                        <AvatarFallback>{newCommunity.name[0]}</AvatarFallback>
                      </Avatar>
                    )}
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={uploading}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleCreateCommunity}
                  className="w-full"
                  disabled={uploading}
                >
                  Create Community
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {communities.length === 0 ? (
          <Card className="p-12 text-center glass animate-fade-in">
            <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground mb-4 animate-float" />
            <h3 className="text-xl font-semibold mb-2">No Communities Yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first private community to get started
            </p>
            <Button onClick={() => setCreateDialogOpen(true)} className="shadow-md hover:scale-105 transition-all">
              <Plus className="w-4 h-4 mr-2" />
              Create Community
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities.map((community) => (
              <Card
                key={community.id}
                className="p-6 cursor-pointer hover-lift glass border-border/50 animate-fade-in"
                onClick={() => navigate(`/private-community/${community.id}`)}
              >
                <div className="flex items-start gap-4">
                  <Avatar className="w-16 h-16 ring-2 ring-primary/20">
                    <AvatarImage src={community.logo_url || ''} />
                    <AvatarFallback className="text-xl bg-primary/10 text-primary font-bold">
                      {community.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-1 truncate">
                      {community.name}
                    </h3>
                    {community.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {community.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{community.memberCount} members</span>
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
  );
}