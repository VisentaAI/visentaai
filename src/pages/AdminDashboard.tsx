import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, MessageSquare, Activity, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface AdminStats {
  total_users: number;
  total_conversations: number;
  total_messages: number;
  conversations_today: number;
  messages_today: number;
  active_users_today: number;
}

interface RecentActivity {
  id: string;
  user_email: string;
  title: string;
  category: string;
  message_count: number;
  updated_at: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please log in to access this page");
        navigate("/auth");
        return;
      }

      // Check if user has admin role
      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();

      if (error || !roles) {
        toast.error("Access denied. Admin privileges required.");
        navigate("/");
        return;
      }

      setIsAdmin(true);
      await fetchDashboardData();
    } catch (error) {
      console.error("Admin check error:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch statistics
      const { data: statsData, error: statsError } = await supabase.rpc("get_admin_stats");
      
      if (statsError) throw statsError;
      setStats(statsData as unknown as AdminStats);

      // Fetch recent activity
      const { data: activityData, error: activityError } = await supabase
        .from("chat_conversations")
        .select(`
          id,
          title,
          category,
          updated_at,
          user_id,
          profiles!inner(email)
        `)
        .order("updated_at", { ascending: false })
        .limit(10);

      if (activityError) throw activityError;

      // Count messages for each conversation
      const conversationIds = activityData?.map(c => c.id) || [];
      const { data: messageCounts } = await supabase
        .from("chat_messages")
        .select("conversation_id")
        .in("conversation_id", conversationIds);

      const countMap = messageCounts?.reduce((acc, msg) => {
        acc[msg.conversation_id] = (acc[msg.conversation_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const formattedActivity = activityData?.map(conv => ({
        id: conv.id,
        user_email: (conv.profiles as any)?.email || "Unknown",
        title: conv.title,
        category: conv.category,
        message_count: countMap[conv.id] || 0,
        updated_at: conv.updated_at
      })) || [];

      setRecentActivity(formattedActivity);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Monitor user activity and system health</p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Back to Home
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_users || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.active_users_today || 0} active today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_conversations || 0}</div>
              <p className="text-xs text-muted-foreground">
                +{stats?.conversations_today || 0} today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_messages || 0}</div>
              <p className="text-xs text-muted-foreground">
                +{stats?.messages_today || 0} today
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest conversations across all users</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Messages</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentActivity.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium">{activity.user_email}</TableCell>
                    <TableCell>{activity.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{activity.category}</Badge>
                    </TableCell>
                    <TableCell>{activity.message_count}</TableCell>
                    <TableCell>
                      {new Date(activity.updated_at).toLocaleDateString()} {new Date(activity.updated_at).toLocaleTimeString()}
                    </TableCell>
                  </TableRow>
                ))}
                {recentActivity.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No recent activity
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
