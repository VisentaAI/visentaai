import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, BookOpen, User } from "lucide-react";

const Lessons = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const { toast } = useToast();

  const { data: lessons, refetch } = useQuery({
    queryKey: ['lessons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Fetch author profiles separately
      const authorIds = [...new Set(data.map(l => l.author_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', authorIds);
      
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      return data.map(lesson => ({
        ...lesson,
        author_profile: profileMap.get(lesson.author_id)
      }));
    }
  });

  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please log in to create a lesson",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase
      .from('lessons')
      .insert({
        title,
        description,
        content,
        category,
        author_id: session.user.id
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create lesson",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Lesson created successfully"
    });

    setTitle("");
    setDescription("");
    setContent("");
    setCategory("general");
    setIsDialogOpen(false);
    refetch();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 mt-16">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Lessons</h1>
            <p className="text-muted-foreground">Learn from our community</p>
          </div>
          {session && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Lesson
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Lesson</DialogTitle>
                  <DialogDescription>
                    Share your knowledge with the community
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      placeholder="Enter lesson title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="programming">Programming</SelectItem>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="science">Science</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Brief description of the lesson"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      required
                      placeholder="Write your lesson content here"
                      rows={10}
                    />
                  </div>
                  <Button type="submit" className="w-full">Create Lesson</Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons?.map((lesson) => (
            <Card key={lesson.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-primary capitalize">
                    {lesson.category}
                  </span>
                </div>
                <CardTitle className="line-clamp-2">{lesson.title}</CardTitle>
                {lesson.description && (
                  <CardDescription className="line-clamp-2">
                    {lesson.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {lesson.content}
                </p>
              </CardContent>
              <CardFooter className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {lesson.author_profile?.avatar_url ? (
                    <img
                      src={lesson.author_profile.avatar_url}
                      alt={lesson.author_profile.full_name || 'Author'}
                      className="h-6 w-6 rounded-full"
                    />
                  ) : (
                    <User className="h-6 w-6 rounded-full bg-muted p-1" />
                  )}
                  <span className="text-sm text-muted-foreground">
                    {lesson.author_profile?.full_name || 'Anonymous'}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(lesson.created_at).toLocaleDateString()}
                </span>
              </CardFooter>
            </Card>
          ))}
        </div>

        {!lessons || lessons.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No lessons yet</h3>
            <p className="text-muted-foreground">
              {session ? "Be the first to create a lesson!" : "Log in to create lessons"}
            </p>
          </div>
        ) : null}
      </main>
      <Footer />
    </div>
  );
};

export default Lessons;