import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ArrowLeft, Plus, X, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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

const Status = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [statusGroups, setStatusGroups] = useState<StatusGroup[]>([]);
  const [myStatuses, setMyStatuses] = useState<Status[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<StatusGroup | null>(null);
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [statusContent, setStatusContent] = useState("");
  const [statusFile, setStatusFile] = useState<File | null>(null);

  useEffect(() => {
    checkAuth();
    loadStatuses();

    const channel = supabase
      .channel("status-changes")
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

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
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

    // Fetch profiles separately
    const userIds = [...new Set(statuses.map(s => s.user_id))];
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, badge_type")
      .in("id", userIds);

    const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
    
    const statusesWithProfiles = statuses.map(status => ({
      ...status,
      profiles: profilesMap.get(status.user_id) || { full_name: null, avatar_url: null }
    }));

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

  const handleUploadStatus = async () => {
    if (!user || (!statusContent && !statusFile)) {
      toast.error("Please add content or media");
      return;
    }

    setUploading(true);

    try {
      let mediaUrl = null;
      let mediaType = null;

      if (statusFile) {
        const fileExt = statusFile.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("statuses")
          .upload(fileName, statusFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("statuses")
          .getPublicUrl(fileName);

        mediaUrl = publicUrl;
        mediaType = statusFile.type.startsWith("image/") ? "image" : "video";
      }

      const { error } = await supabase.from("user_statuses").insert({
        user_id: user.id,
        content: statusContent || null,
        media_url: mediaUrl,
        media_type: mediaType,
      });

      if (error) throw error;

      toast.success("Status uploaded!");
      setShowUploadDialog(false);
      setStatusContent("");
      setStatusFile(null);
      loadStatuses();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleViewStatus = async (group: StatusGroup, index: number) => {
    setSelectedGroup(group);
    setCurrentStatusIndex(index);

    const status = group.statuses[index];
    await supabase.from("status_views").insert({
      status_id: status.id,
      viewer_id: user.id,
    }).select().single();
  };

  const handleDeleteStatus = async (statusId: string) => {
    const { error } = await supabase
      .from("user_statuses")
      .delete()
      .eq("id", statusId);

    if (error) {
      toast.error("Failed to delete status");
    } else {
      toast.success("Status deleted");
      loadStatuses();
    }
  };

  const nextStatus = () => {
    if (!selectedGroup) return;
    if (currentStatusIndex < selectedGroup.statuses.length - 1) {
      const newIndex = currentStatusIndex + 1;
      setCurrentStatusIndex(newIndex);
      handleViewStatus(selectedGroup, newIndex);
    } else {
      setSelectedGroup(null);
    }
  };

  const prevStatus = () => {
    if (currentStatusIndex > 0) {
      setCurrentStatusIndex(currentStatusIndex - 1);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Status</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">My Status</h2>
          </div>
          
          <Card className="p-4 flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-16 w-16 cursor-pointer" onClick={() => myStatuses.length > 0 && handleViewStatus({ user_id: user?.id, full_name: "My Status", avatar_url: null, statuses: myStatuses, hasUnviewed: false }, 0)}>
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user?.email?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full"
                onClick={() => setShowUploadDialog(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1">
              <p className="font-medium">My Status</p>
              <p className="text-sm text-muted-foreground">
                {myStatuses.length > 0 
                  ? `${myStatuses.length} update${myStatuses.length > 1 ? 's' : ''}`
                  : "Tap to add status update"}
              </p>
            </div>
          </Card>
        </div>

        {statusGroups.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Recent Updates</h2>
            <div className="space-y-3">
              {statusGroups.map((group) => (
                <Card
                  key={group.user_id}
                  className="p-4 flex items-center gap-4 cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => handleViewStatus(group, 0)}
                >
                  <div className="relative">
                    <Avatar className={`h-16 w-16 ${group.hasUnviewed ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                      <AvatarImage src={group.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {group.full_name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{group.full_name || "Unknown User"}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(group.statuses[0].created_at).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Add Status</h2>
            <Textarea
              placeholder="What's on your mind?"
              value={statusContent}
              onChange={(e) => setStatusContent(e.target.value)}
              rows={3}
            />
            <Input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => setStatusFile(e.target.files?.[0] || null)}
            />
            <div className="flex gap-2">
              <Button
                onClick={handleUploadStatus}
                disabled={uploading}
                className="flex-1"
              >
                {uploading ? "Uploading..." : "Upload"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowUploadDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
                {selectedGroup.user_id === user?.id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={() => handleDeleteStatus(selectedGroup.statuses[currentStatusIndex].id)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
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

export default Status;
