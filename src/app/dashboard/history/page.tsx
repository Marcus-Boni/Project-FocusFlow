"use client";

import { useState, useEffect, useCallback } from "react";
import { useUserStore } from "@/stores/useUserStore";
import { supabase, StudySession, StudyArea } from "@/lib/supabase";
import { Calendar, Clock, BookOpen, Filter, Search } from "lucide-react";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
} from "date-fns";
import { toastUtils } from "@/lib/hooks/useToast";

interface ExtendedStudySession extends StudySession {
  study_area: StudyArea;
}

interface FilterOptions {
  period: "all" | "today" | "week" | "month" | "custom";
  studyAreaId: string | "all";
  startDate?: Date;
  endDate?: Date;
}

export default function StudyHistoryPage() {
  const { user } = useUserStore();
  const [sessions, setSessions] = useState<ExtendedStudySession[]>([]);
  const [studyAreas, setStudyAreas] = useState<StudyArea[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<
    ExtendedStudySession[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({
    period: "all",
    studyAreaId: "all",
  });
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch study sessions with study areas
      const { data: sessionsData, error: sessionsError } = await supabase
        .from("study_sessions")
        .select(
          `
            *,
            study_area:study_areas(*)
          `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (sessionsError) throw sessionsError;

      // Fetch study areas for filter
      const { data: areasData, error: areasError } = await supabase
        .from("study_areas")
        .select("*")
        .eq("user_id", user.id)
        .order("name");

      if (areasError) throw areasError;

      setSessions(sessionsData || []);
      setStudyAreas(areasData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toastUtils.data.error();
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData, user]);

  // Apply filters
  useEffect(() => {
    let filtered = [...sessions];

    // Filter by period
    if (filters.period !== "all") {
      const now = new Date();
      let startDate: Date;
      let endDate: Date = now;

      switch (filters.period) {
        case "today":
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          break;
        case "week":
          startDate = startOfWeek(now);
          endDate = endOfWeek(now);
          break;
        case "month":
          startDate = startOfMonth(now);
          endDate = endOfMonth(now);
          break;
        case "custom":
          if (filters.startDate && filters.endDate) {
            startDate = filters.startDate;
            endDate = filters.endDate;
          } else {
            startDate = subDays(now, 30);
          }
          break;
        default:
          startDate = new Date(0);
      }

      filtered = filtered.filter((session) => {
        const sessionDate = new Date(session.created_at);
        return sessionDate >= startDate && sessionDate <= endDate;
      });
    }

    // Filter by study area
    if (filters.studyAreaId !== "all") {
      filtered = filtered.filter(
        (session) => session.study_area_id === filters.studyAreaId
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (session) =>
          session.study_area.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (session.notes &&
            session.notes.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredSessions(filtered);
  }, [sessions, filters, searchTerm]);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getTotalStats = () => {
    const totalSessions = filteredSessions.length;
    const totalTime = filteredSessions.reduce(
      (sum, session) => sum + session.duration,
      0
    );
    const focusSessions = filteredSessions.filter(
      (s) => s.session_type === "focus"
    );
    const totalFocusTime = focusSessions.reduce(
      (sum, session) => sum + session.duration,
      0
    );

    return {
      totalSessions,
      totalTime,
      totalFocusTime,
      averageSession:
        totalSessions > 0 ? Math.round(totalTime / totalSessions) : 0,
    };
  };

  const stats = getTotalStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
        <div className="h-96 bg-muted rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Study History</h1>
        <p className="text-muted-foreground mt-1">
          Track your learning journey and analyze your progress
        </p>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg border p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Period Filter */}
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Period</label>
            <div className="relative">
              <select
                value={filters.period}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    period: e.target.value as FilterOptions["period"],
                  }))
                }
                className="w-full px-3 py-2 pr-10 border rounded-md bg-background text-foreground appearance-none transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-transparent"
                aria-label="Period"
              >
                <option value="all" className="text-muted-foreground">
                  All Time
                </option>
                <option value="today" className="text-muted-foreground">
                  Today
                </option>
                <option value="week" className="text-muted-foreground">
                  This Week
                </option>
                <option value="month" className="text-muted-foreground">
                  This Month
                </option>
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 text-muted-foreground"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </div>
          </div>

          {/* Study Area Filter */}
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Study Area</label>

            <div className="relative">
              <select
                value={filters.studyAreaId}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    studyAreaId: e.target.value,
                  }))
                }
                aria-label="Study area"
                className="w-full px-3 py-2 pr-10 border rounded-md bg-background text-foreground appearance-none transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-transparent"
              >
                <option value="all" className="text-muted-foreground">
                  All Areas
                </option>
                {studyAreas.map((area) => (
                  <option
                    key={area.id}
                    value={area.id}
                    className="text-foreground"
                  >
                    {area.name}
                  </option>
                ))}
              </select>

              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 text-muted-foreground"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </div>
          </div>

          {/* Search */}
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search sessions..."
                className="w-full pl-10 pr-3 py-2 border rounded-md bg-background"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Sessions
              </p>
              <p className="text-2xl font-bold">{stats.totalSessions}</p>
            </div>
            <Calendar className="w-8 h-8 text-primary" />
          </div>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Time
              </p>
              <p className="text-2xl font-bold">
                {formatTime(stats.totalTime)}
              </p>
            </div>
            <Clock className="w-8 h-8 text-primary" />
          </div>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Focus Time
              </p>
              <p className="text-2xl font-bold">
                {formatTime(stats.totalFocusTime)}
              </p>
            </div>
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Avg Session
              </p>
              <p className="text-2xl font-bold">
                {formatTime(stats.averageSession)}
              </p>
            </div>
            <Filter className="w-8 h-8 text-primary" />
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="bg-card rounded-lg border">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Session History</h2>
        </div>

        <div className="p-4">
          {filteredSessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No study sessions found for the selected filters.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: session.study_area.color }}
                    />
                    <div>
                      <p className="font-medium">{session.study_area.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(
                          new Date(session.created_at),
                          "MMM dd, yyyy • HH:mm"
                        )}
                      </p>
                      {session.notes && (
                        <p className="text-sm text-muted-foreground mt-1 max-w-md truncate">
                          {session.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-medium">
                      {formatTime(session.duration)}
                    </p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {session.session_type} • Cycle {session.pomodoro_cycle}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
