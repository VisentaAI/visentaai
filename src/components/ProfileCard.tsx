import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Mail, MessageSquare, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProfileCardProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
  bio: string | null;
  is_public: boolean;
}

export function ProfileCard({ userId, open, onOpenChange }: ProfileCardProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (open && userId) {
      loadProfile();
    }
  }, [open, userId]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, email, bio, is_public")
        .eq("id", userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    onOpenChange(false);
    navigate(`/messages?user=${userId}`);
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!profile) {
    return null;
  }

  const isPublic = profile.is_public ?? true;
  const displayName = isPublic ? (profile.full_name || "Anonymous") : "Anonymous";
  const displayAvatar = isPublic ? profile.avatar_url : null;
  const displayEmail = isPublic ? profile.email : null;
  const displayBio = isPublic ? profile.bio : null;
  const avatarFallback = isPublic 
    ? (profile.full_name?.[0]?.toUpperCase() || profile.email?.[0]?.toUpperCase() || "U")
    : "A";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4 py-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={displayAvatar || ""} />
            <AvatarFallback className="text-2xl">{avatarFallback}</AvatarFallback>
          </Avatar>
          
          <div className="text-center space-y-2 w-full">
            <h3 className="text-2xl font-semibold text-foreground flex items-center justify-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              {displayName}
            </h3>
            
            {displayEmail && (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <p className="text-sm">{displayEmail}</p>
              </div>
            )}

            {displayBio && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm text-foreground">{displayBio}</p>
              </div>
            )}

            {!isPublic && (
              <p className="text-sm text-muted-foreground italic">
                This profile is private
              </p>
            )}
          </div>

          <Button onClick={handleSendMessage} className="w-full">
            <MessageSquare className="h-4 w-4 mr-2" />
            Send Message
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
