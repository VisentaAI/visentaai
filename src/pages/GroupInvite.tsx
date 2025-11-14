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
  group_id: string;
  email: string | null;
  status: string;
  expires_at: string;
  groups: {
    name: string;
    description: string | null;
    logo_url: string | null;
  };
}

export default function GroupInvite() {
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
        .from('group_invitations')
        .select('*, groups(name, description, logo_url)')
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
      navigate(`/auth?redirect=/group-invite?token=${token}`);
      return;
    }

    setAccepting(true);
    try {
      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', invitation.group_id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingMember) {
        toast({
          title: "Already a Member",
          description: "You are already a member of this group",
          variant: "destructive"
        });
        navigate(`/group/${invitation.group_id}`);
        return;
      }

      // Add user to group
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: invitation.group_id,
          user_id: user.id,
          role: 'member'
        });

      if (memberError) throw memberError;

      // Update invitation status
      const { error: inviteError } = await supabase
        .from('group_invitations')
        .update({
          status: 'accepted',
          accepted_by: user.id,
          accepted_at: new Date().toISOString()
        })
        .eq('id', invitation.id);

      if (inviteError) throw inviteError;

      setSuccess(true);
      toast({
        title: "Success",
        description: "You have joined the group!"
      });

      setTimeout(() => {
        navigate(`/group/${invitation.group_id}`);
      }, 2000);
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to accept invitation",
        variant: "destructive"
      });
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background" style={{ background: 'var(--gradient-hero)' }}>
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <XCircle className="h-16 w-16 text-destructive" />
            </div>
            <CardTitle className="text-center text-2xl">Undangan Tidak Valid</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">{error}</p>
            <Button onClick={() => navigate('/')} className="w-full">
              Kembali ke Beranda
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background" style={{ background: 'var(--gradient-hero)' }}>
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-center text-2xl">Berhasil Bergabung!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              Anda akan diarahkan ke grup...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background" style={{ background: 'var(--gradient-hero)' }}>
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Undangan Grup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {invitation && (
            <>
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={invitation.groups.logo_url || ''} />
                  <AvatarFallback>
                    {invitation.groups.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="text-xl font-semibold">{invitation.groups.name}</h3>
                  {invitation.groups.description && (
                    <p className="text-muted-foreground mt-2">
                      {invitation.groups.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>Anda diundang untuk bergabung dengan grup ini</span>
              </div>

              <Button 
                onClick={acceptInvitation} 
                className="w-full"
                disabled={accepting}
                size="lg"
              >
                {accepting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Bergabung...
                  </>
                ) : (
                  'Terima Undangan'
                )}
              </Button>

              <Button 
                variant="outline"
                onClick={() => navigate('/')} 
                className="w-full"
                disabled={accepting}
              >
                Tolak
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
