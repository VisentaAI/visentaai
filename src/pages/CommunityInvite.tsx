import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Users, CheckCircle, XCircle } from 'lucide-react';

interface Invitation {
  id: string;
  community_id: string;
  email: string | null;
  status: string;
  expires_at: string;
  private_communities: {
    name: string;
    description: string | null;
    logo_url: string | null;
  };
}

export default function CommunityInvite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const token = searchParams.get('token');
  
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link');
      setLoading(false);
      return;
    }
    loadInvitation();
  }, [token]);

  const loadInvitation = async () => {
    try {
      const { data, error } = await supabase
        .from('private_community_invitations')
        .select('*, private_communities(name, description, logo_url)')
        .eq('token', token)
        .eq('status', 'pending')
        .single();

      if (error) throw error;

      if (!data) {
        setError('Invitation not found or already used');
        setLoading(false);
        return;
      }

      // Check if expired
      if (new Date(data.expires_at) < new Date()) {
        setError('This invitation has expired');
        setLoading(false);
        return;
      }

      setInvitation(data as Invitation);
    } catch (error: any) {
      console.error('Error loading invitation:', error);
      setError('Failed to load invitation');
    } finally {
      setLoading(false);
    }
  };

  const acceptInvitation = async () => {
    if (!invitation || !token) return;

    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to accept this invitation",
        variant: "destructive"
      });
      navigate(`/auth?redirect=/invite?token=${token}`);
      return;
    }

    setAccepting(true);
    try {
      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('private_community_members')
        .select('id')
        .eq('community_id', invitation.community_id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingMember) {
        toast({
          title: "Already a Member",
          description: "You are already a member of this community"
        });
        navigate(`/private-community/${invitation.community_id}`);
        return;
      }

      // Add user to community
      const { error: memberError } = await supabase
        .from('private_community_members')
        .insert({
          community_id: invitation.community_id,
          user_id: user.id,
          role: 'member'
        });

      if (memberError) throw memberError;

      // Update invitation status
      const { error: updateError } = await supabase
        .from('private_community_invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          accepted_by: user.id
        })
        .eq('id', invitation.id);

      if (updateError) throw updateError;

      setSuccess(true);
      toast({
        title: "Success!",
        description: "You've joined the community"
      });

      setTimeout(() => {
        navigate(`/private-community/${invitation.community_id}`);
      }, 2000);
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/5 -z-10" />
        <div className="absolute inset-0 ai-grid opacity-20 -z-10" />
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/5 -z-10" />
        <div className="absolute inset-0 ai-grid opacity-20 -z-10" />
        <Card className="max-w-md w-full glass animate-fade-in">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <XCircle className="w-16 h-16 text-destructive" />
            </div>
            <CardTitle className="text-center text-2xl">Invalid Invitation</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => navigate('/private-communities')}>
              View Communities
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/5 -z-10" />
        <div className="absolute inset-0 ai-grid opacity-20 -z-10" />
        <Card className="max-w-md w-full glass animate-fade-in">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-500 animate-scale-in" />
            </div>
            <CardTitle className="text-center text-2xl">Welcome!</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">
              You've successfully joined {invitation.private_communities.name}
            </p>
            <p className="text-sm text-muted-foreground">Redirecting to community...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/5 -z-10" />
      <div className="absolute inset-0 ai-grid opacity-20 -z-10" />
      <div className="absolute top-20 left-10 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse -z-10" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000 -z-10" />
      
      <Card className="max-w-md w-full glass animate-fade-in">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Avatar className="w-24 h-24 ring-4 ring-primary/20">
              <AvatarImage src={invitation.private_communities.logo_url || ''} />
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {invitation.private_communities.name[0]}
              </AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-center text-2xl gradient-text">
            You're Invited!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold">{invitation.private_communities.name}</h3>
            {invitation.private_communities.description && (
              <p className="text-muted-foreground text-sm">
                {invitation.private_communities.description}
              </p>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>Private Community</span>
          </div>

          <Button 
            onClick={acceptInvitation} 
            disabled={accepting}
            className="w-full shadow-md hover:scale-105 transition-all"
            size="lg"
          >
            {accepting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Joining...
              </>
            ) : (
              'Accept Invitation'
            )}
          </Button>

          <Button 
            variant="outline" 
            onClick={() => navigate('/private-communities')}
            className="w-full"
          >
            View All Communities
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Expires: {new Date(invitation.expires_at).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
