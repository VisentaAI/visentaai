import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Trash2, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

const LearningMaterials = () => {
  const { t } = useLanguage();
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const { data: lessons = [], refetch } = useQuery({
    queryKey: ['lessons'],
    queryFn: async () => {
      const { data: lessonsData, error } = await supabase
        .from('lessons')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      // Fetch author profiles
      const authorIds = [...new Set(lessonsData?.map(l => l.author_id) || [])];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', authorIds);

      // Merge profiles with lessons
      return lessonsData?.map(lesson => ({
        ...lesson,
        author_profile: profilesData?.find(p => p.id === lesson.author_id)
      })) || [];
    },
  });

  const handleDelete = async (lessonId: string) => {
    setIsDeleting(true);
    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', lessonId);

    if (error) {
      toast.error('Failed to delete lesson');
    } else {
      toast.success('Lesson deleted successfully');
      setSelectedLesson(null);
      refetch();
    }
    setIsDeleting(false);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'general': 'bg-muted text-muted-foreground',
      'programming': 'bg-primary/10 text-primary',
      'design': 'bg-accent/10 text-accent',
      'business': 'bg-secondary/10 text-secondary-foreground',
    };
    return colors[category] || colors['general'];
  };

  return (
    <section id="learning-materials" className="py-20 px-4 md:px-8 max-w-7xl mx-auto relative">
      <div className="absolute inset-0 ai-grid opacity-20" />
      
      <div className="relative text-center mb-16 animate-fade-in">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
          {t('learningMaterials')}
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore curated learning materials created by our community
        </p>
      </div>

      <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {lessons.map((lesson, index) => (
          <div
            key={lesson.id}
            className="glass p-6 rounded-2xl hover-lift cursor-pointer animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => setSelectedLesson(lesson)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(lesson.category)}`}>
                {lesson.category}
              </span>
            </div>
            
            <h3 className="text-xl font-bold mb-3 text-foreground">
              {lesson.title}
            </h3>
            
            <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
              {lesson.description}
            </p>

            <div className="flex items-center gap-2 mt-auto pt-4 border-t border-border/50">
              {lesson.author_profile?.avatar_url && (
                <img 
                  src={lesson.author_profile.avatar_url} 
                  alt={lesson.author_profile.full_name}
                  className="w-6 h-6 rounded-full"
                />
              )}
              <span className="text-xs text-muted-foreground">
                By {lesson.author_profile?.full_name || 'Anonymous'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {lessons.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No learning materials available yet
        </div>
      )}

      <Dialog open={!!selectedLesson} onOpenChange={(open) => !open && setSelectedLesson(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <DialogTitle className="text-2xl mb-2">{selectedLesson?.title}</DialogTitle>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(selectedLesson?.category)}`}>
                    {selectedLesson?.category}
                  </span>
                  <div className="flex items-center gap-2">
                    {selectedLesson?.author_profile?.avatar_url && (
                      <img 
                        src={selectedLesson.author_profile.avatar_url} 
                        alt={selectedLesson.author_profile.full_name}
                        className="w-5 h-5 rounded-full"
                      />
                    )}
                    <span>By {selectedLesson?.author_profile?.full_name || 'Anonymous'}</span>
                  </div>
                </div>
              </div>
              {session?.user?.id === selectedLesson?.author_id && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(selectedLesson.id)}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </DialogHeader>
          
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-6">
              {selectedLesson?.description && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">{selectedLesson.description}</p>
                </div>
              )}
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Content</h3>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap">{selectedLesson?.content}</p>
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default LearningMaterials;
