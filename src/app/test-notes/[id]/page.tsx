"use client";

import { use } from 'react';
import NotesPageClient from '@/components/notes/NotesPageClient';

interface TestNotesPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function TestNotesPage({ params }: TestNotesPageProps) {
  // Unwrap params using React.use()
  const { id } = use(params);
  
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          Notes for Study Area (Test Mode)
        </h1>
        <p className="text-muted-foreground mt-2">
          Testing the notes system with mock data
        </p>
      </div>
      
      <NotesPageClient studyAreaId={id} />
    </div>
  );
}
