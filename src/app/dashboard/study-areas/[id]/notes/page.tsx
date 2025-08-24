"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/useUserStore';
import { supabase, StudyArea } from '@/lib/supabase';
import NotesPageClient from '@/components/notes/NotesPageClient';

interface StudyAreaNotesPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function StudyAreaNotesPage({ params }: StudyAreaNotesPageProps) {
  const { user } = useUserStore();
  const router = useRouter();
  const [studyArea, setStudyArea] = useState<StudyArea | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Unwrap params using React.use()
  const { id } = use(params);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    async function fetchStudyArea() {
      try {
        const { data, error } = await supabase
          .from('study_areas')
          .select('*')
          .eq('id', id)
          .eq('user_id', user!.id)
          .single();

        if (error) {
          console.error('Error fetching study area:', error);
          router.push('/dashboard/study-areas');
          return;
        }

        setStudyArea(data);
      } catch (error) {
        console.error('Error:', error);
        router.push('/dashboard/study-areas');
      } finally {
        setIsLoading(false);
      }
    }

    fetchStudyArea();
  }, [user, id, router]);

  if (!user) {
    return <div>Redirecting to login...</div>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!studyArea) {
    return <div>Study area not found</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          Notes for {studyArea.name}
        </h1>
        <p className="text-muted-foreground mt-2">
          {studyArea.description}
        </p>
      </div>
      
      <NotesPageClient studyAreaId={id} />
    </div>
  );
}
