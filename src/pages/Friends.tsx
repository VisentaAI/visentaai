import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, UserPlus, Users, Check, X, User } from "lucide-react";

const Friends = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    }
  });

  // Search for users
  const { data: searchResults } = useQuery({
    queryKey: ['userSearch', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim() || !session) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, email')
        .neq('id', session.user.id)
        .ilike('full_name', `%${searchQuery}%`)
        .limit(10);
      
      if (error) throw error;
      return data;
    },
    enabled: searchQuery.length > 0 && !!session
  });

  // Get friends list
  const { data: friends, refetch: refetchFriends } = useQuery({
    queryKey: ['friends'],
    queryFn: async () => {
      if (!session) return [];
      
      const { data, error } = await supabase
        .from('friendships')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('status', 'accepted');
      
      if (error) throw error;
      
      // Fetch profiles separately
      const friendIds = data.map(f => f.friend_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, email')
        .in('id', friendIds);
      
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      // Filter out friendships where the profile no longer exists (deleted accounts)
      return data
        .map(friendship => ({
          ...friendship,
          profile: profileMap.get(friendship.friend_id)
        }))
        .filter(friendship => friendship.profile !== undefined);
    },
    enabled: !!session
  });

  // Get friend requests received
  const { data: requests, refetch: refetchRequests } = useQuery({
    queryKey: ['friendRequests'],
    queryFn: async () => {
      if (!session) return [];
      
      const { data, error } = await supabase
        .from('friendships')
        .select('*')
        .eq('friend_id', session.user.id)
        .eq('status', 'pending');
      
      if (error) throw error;
      
      // Fetch profiles separately
      const userIds = data.map(f => f.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, email')
        .in('id', userIds);
      
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      // Filter out requests where the profile no longer exists (deleted accounts)
      return data
        .map(request => ({
          ...request,
          profile: profileMap.get(request.user_id)
        }))
        .filter(request => request.profile !== undefined);
    },
    enabled: !!session
  });

  // Get sent requests
  const { data: sentRequests, refetch: refetchSent } = useQuery({
    queryKey: ['sentRequests'],
    queryFn: async () => {
      if (!session) return [];
      
      const { data, error } = await supabase
        .from('friendships')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('status', 'pending');
      
      if (error) throw error;
      
      // Fetch profiles separately
      const friendIds = data.map(f => f.friend_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, email')
        .in('id', friendIds);
      
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      // Filter out sent requests where the profile no longer exists (deleted accounts)
      return data
        .map(request => ({
          ...request,
          profile: profileMap.get(request.friend_id)
        }))
        .filter(request => request.profile !== undefined);
    },
    enabled: !!session
  });

  const sendFriendRequest = async (friendId: string) => {
    if (!session) return;

    // Check if friendship already exists
    const { data: existing } = await supabase
      .from('friendships')
      .select('id, status')
      .or(`and(user_id.eq.${session.user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${session.user.id})`)
      .maybeSingle();

    if (existing) {
      toast({
        title: "Cannot send request",
        description: existing.status === 'pending' ? "Request already sent" : "Already friends",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase
      .from('friendships')
      .insert({
        user_id: session.user.id,
        friend_id: friendId,
        status: 'pending'
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send friend request",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Friend request sent"
    });

    refetchSent();
  };

  const acceptRequest = async (requestId: string) => {
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', requestId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to accept request",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Friend request accepted"
    });

    refetchRequests();
    refetchFriends();
  };

  const rejectRequest = async (requestId: string) => {
    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', requestId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to reject request",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Friend request rejected"
    });

    refetchRequests();
  };

  const removeFriend = async (friendshipId: string) => {
    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to remove friend",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Friend removed"
    });

    refetchFriends();
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8 mt-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please log in to manage friends</h1>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 mt-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8">Friends</h1>

          <Tabs defaultValue="friends" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="friends">
                <Users className="h-4 w-4 mr-2" />
                Friends ({friends?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="requests">
                <UserPlus className="h-4 w-4 mr-2" />
                Requests ({requests?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="search">
                <Search className="h-4 w-4 mr-2" />
                Find Friends
              </TabsTrigger>
            </TabsList>

            <TabsContent value="friends" className="space-y-4">
              {friends && friends.length > 0 ? (
                friends.map((friendship) => (
                  <Card key={friendship.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={friendship.profile?.avatar_url || ''} />
                          <AvatarFallback>
                            {friendship.profile?.full_name?.[0] || <User className="h-4 w-4" />}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{friendship.profile?.full_name || 'Anonymous'}</p>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeFriend(friendship.id)}
                      >
                        Remove
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No friends yet. Search for users to add!</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="requests" className="space-y-4">
              {requests && requests.length > 0 ? (
                requests.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={request.profile?.avatar_url || ''} />
                          <AvatarFallback>
                            {request.profile?.full_name?.[0] || <User className="h-4 w-4" />}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{request.profile?.full_name || 'Anonymous'}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => acceptRequest(request.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => rejectRequest(request.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <UserPlus className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No pending friend requests</p>
                  </CardContent>
                </Card>
              )}

              {sentRequests && sentRequests.length > 0 && (
                <>
                  <h3 className="text-lg font-semibold mt-6">Sent Requests</h3>
                  {sentRequests.map((request) => (
                    <Card key={request.id}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarImage src={request.profile?.avatar_url || ''} />
                            <AvatarFallback>
                              {request.profile?.full_name?.[0] || <User className="h-4 w-4" />}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{request.profile?.full_name || 'Anonymous'}</p>
                          </div>
                        </div>
                        <Badge variant="secondary">Pending</Badge>
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}
            </TabsContent>

            <TabsContent value="search" className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {searchResults && searchResults.length > 0 ? (
                searchResults.map((user) => (
                  <Card key={user.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={user.avatar_url || ''} />
                          <AvatarFallback>
                            {user.full_name?.[0] || <User className="h-4 w-4" />}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.full_name || 'Anonymous'}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => sendFriendRequest(user.id)}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Friend
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : searchQuery.length > 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">No users found</p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Start typing to search for friends</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Friends;