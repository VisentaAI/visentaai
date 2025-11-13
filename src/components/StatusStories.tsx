import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, X, Eye } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface Status {
  id: string;
  user_id: string;
  content: string | null;
  media_url: string | null;
  media_type: string | null;
  created_at: string;
  expires_at: string;
  view_count: number;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface StatusGroup {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  statuses: Status[];
  hasUnviewed: boolean;
}

interface StatusViewer {
  viewer_id: string;
  viewed_at: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

const StatusStories = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [statusGroups, setStatusGroups] = useState<StatusGroup[]>([]);
  const [myStatuses, setMyStatuses] = useState<Status[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<StatusGroup | null>(null);
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
  const [statusViewers, setStatusViewers] = useState<StatusViewer[]>([]);

  useEffect(() => {
    loadUser();
    loadStatuses();

    const channel = supabase
      .channel("status-stories-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_statuses",
        },
        () => loadStatuses()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadStatuses = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: statuses } = await supabase
      .from("user_statuses")
      .select("*")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });

    if (!statuses) return;

    const userIds = [...new Set(statuses.map(s => s.user_id))];
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", userIds);

    const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
    
    const statusesWithProfiles = statuses
      .map(status => ({
        ...status,
        profiles: profilesMap.get(status.user_id) || null
      }))
      // Filter out statuses from deleted users (where profile is null)
      .filter(status => status.profiles !== null) as Status[];

    const myStatusList = statusesWithProfiles.filter((s) => s.user_id === user.id);
    setMyStatuses(myStatusList);

    const othersStatuses = statusesWithProfiles.filter((s) => s.user_id !== user.id);
      
    const grouped = othersStatuses.reduce((acc: Record<string, Status[]>, status) => {
      if (!acc[status.user_id]) {
        acc[status.user_id] = [];
      }
      acc[status.user_id].push(status);
      return acc;
    }, {});

    const groups: StatusGroup[] = await Promise.all(
      Object.entries(grouped).map(async ([userId, userStatuses]) => {
        const { data: views } = await supabase
          .from("status_views")
          .select("status_id")
          .eq("viewer_id", user.id)
          .in("status_id", userStatuses.map(s => s.id));

        const viewedIds = new Set(views?.map(v => v.status_id) || []);
        const hasUnviewed = userStatuses.some(s => !viewedIds.has(s.id));

        return {
          user_id: userId,
          full_name: userStatuses[0].profiles?.full_name || "Unknown",
          avatar_url: userStatuses[0].profiles?.avatar_url || null,
          statuses: userStatuses,
          hasUnviewed,
        };
      })
    );

    setStatusGroups(groups);
  };

  const loadStatusViewers = async (statusId: string) => {
    const { data: views } = await supabase
      .from("status_views")
      .select("viewer_id, viewed_at")
      .eq("status_id", statusId)
      .order("viewed_at", { ascending: false });

    if (!views || views.length === 0) {
      setStatusViewers([]);
      return;
    }

    const viewerIds = views.map(v => v.viewer_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", viewerIds);

    const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);
    
    const viewersWithProfiles = views.map(view => ({
      viewer_id: view.viewer_id,
      viewed_at: view.viewed_at,
      profiles: profilesMap.get(view.viewer_id) || { full_name: null, avatar_url: null }
    }));

    setStatusViewers(viewersWithProfiles);
  };

  const handleViewStatus = async (group: StatusGroup, index: number) => {
    setSelectedGroup(group);
    setCurrentStatusIndex(index);

    const status = group.statuses[index];
    
    if (group.user_id === user?.id) {
      await loadStatusViewers(status.id);
    } else {
      setStatusViewers([]);
      await supabase.from("status_views").insert({
        status_id: status.id,
        viewer_id: user.id,
      }).select().single();
    }
  };

  const nextStatus = async () => {
    if (!selectedGroup) return;
    if (currentStatusIndex < selectedGroup.statuses.length - 1) {
      const newIndex = currentStatusIndex + 1;
      setCurrentStatusIndex(newIndex);
      await handleViewStatus(selectedGroup, newIndex);
    } else {
      setSelectedGroup(null);
    }
  };

  const prevStatus = () => {
    if (currentStatusIndex > 0) {
      setCurrentStatusIndex(currentStatusIndex - 1);
    }
  };

  if (!user || (statusGroups.length === 0 && myStatuses.length === 0)) {
    return null;
  }

  return (
    <div className="w-full py-6 border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <h2 className="text-lg font-semibold mb-4">Stories</h2>
        <ScrollArea className="w-full">
          <div className="flex gap-4 pb-2">
            <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => navigate("/status")}>
              <div className="relative">
                <Avatar className="h-16 w-16 ring-2 ring-border">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-muted text-muted-foreground">
                    {user?.email?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary flex items-center justify-center border-2 border-card">
                  <Plus className="h-3 w-3 text-primary-foreground" />
                </div>
              </div>
              <span className="text-xs text-muted-foreground max-w-[70px] truncate">Your story</span>
            </div>

            {statusGroups.map((group) => (
              <div
                key={group.user_id}
                className="flex flex-col items-center gap-2 cursor-pointer hover-scale"
                onClick={() => handleViewStatus(group, 0)}
              >
                <Avatar className={`h-16 w-16 ${group.hasUnviewed ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : 'ring-2 ring-muted'}`}>
                  <AvatarImage src={group.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {group.full_name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-foreground max-w-[70px] truncate">{group.full_name || "Unknown"}</span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <Dialog open={!!selectedGroup} onOpenChange={() => setSelectedGroup(null)}>
        <DialogContent className="max-w-lg p-0 bg-black/95 border-0">
          {selectedGroup && (
            <div className="relative h-[600px] flex items-center justify-center">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-20 text-white hover:bg-white/20"
                onClick={() => setSelectedGroup(null)}
              >
                <X className="h-6 w-6" />
              </Button>

              <div className="absolute top-4 left-4 right-4 flex items-center gap-2 z-10">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedGroup.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {selectedGroup.full_name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-white">
                  <p className="font-medium">{selectedGroup.full_name}</p>
                  <p className="text-xs opacity-70">
                    {new Date(selectedGroup.statuses[currentStatusIndex].created_at).toLocaleTimeString()}
                  </p>
                </div>
                {selectedGroup.user_id === user?.id && statusViewers.length > 0 && (
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20 gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="text-sm">{statusViewers.length}</span>
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80 max-h-96 overflow-y-auto">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold mb-3">Viewed by {statusViewers.length} {statusViewers.length === 1 ? 'person' : 'people'}</h4>
                        {statusViewers.map((viewer) => (
                          <div key={viewer.viewer_id} className="flex items-center gap-2 py-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={viewer.profiles.avatar_url || undefined} />
                              <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                                {viewer.profiles.full_name?.[0]?.toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{viewer.profiles.full_name || "Unknown User"}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(viewer.viewed_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                )}
              </div>

              <div className="absolute top-16 left-4 right-4 flex gap-1 z-10">
                {selectedGroup.statuses.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1 flex-1 rounded-full ${
                      idx === currentStatusIndex ? "bg-white" : "bg-white/30"
                    }`}
                  />
                ))}
              </div>

              <div
                className="absolute inset-0 cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  if (x < rect.width / 2) {
                    prevStatus();
                  } else {
                    nextStatus();
                  }
                }}
              >
                {selectedGroup.statuses[currentStatusIndex].media_url ? (
                  selectedGroup.statuses[currentStatusIndex].media_type === "video" ? (
                    <video
                      src={selectedGroup.statuses[currentStatusIndex].media_url!}
                      className="w-full h-full object-contain"
                      autoPlay
                      controls
                    />
                  ) : (
                    <img
                      src={selectedGroup.statuses[currentStatusIndex].media_url!}
                      alt="Status"
                      className="w-full h-full object-contain"
                    />
                  )
                ) : (
                  <div className="flex items-center justify-center h-full p-8">
                    <p className="text-white text-2xl text-center">
                      {selectedGroup.statuses[currentStatusIndex].content}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StatusStories;
