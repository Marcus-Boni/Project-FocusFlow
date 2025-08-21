"use client";

import { useState, useEffect } from "react";
import { useUserStore } from "@/stores/useUserStore";
import { supabase, StudySession, StudyArea } from "@/lib/supabase";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  format,
  subDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
} from "date-fns";
import { Calendar, Clock, TrendingUp, Target, BarChart3 } from "lucide-react";

interface TooltipPayload {
  color: string;
  name: string;
  value: number;
  dataKey: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
  type?: "bar" | "pie";
}

interface LabelProps {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  value?: number;
  name?: string;
}

interface ExtendedStudySession extends StudySession {
  study_area: StudyArea;
}

interface DayData {
  date: string;
  focus_time: number;
  break_time: number;
  sessions: number;
}

interface AreaData {
  name: string;
  time: number;
  sessions: number;
  color: string;
}

export default function AnalyticsPage() {
  const { user } = useUserStore();
  const [sessions, setSessions] = useState<ExtendedStudySession[]>([]);
  const [studyAreas, setStudyAreas] = useState<StudyArea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "quarter">(
    "week"
  );

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Get date range
        const now = new Date();
        let startDate: Date;

        switch (timeRange) {
          case "week":
            startDate = subDays(now, 7);
            break;
          case "month":
            startDate = subDays(now, 30);
            break;
          case "quarter":
            startDate = subDays(now, 90);
            break;
        }

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
          .gte("created_at", startDate.toISOString())
          .order("created_at", { ascending: true });

        if (sessionsError) throw sessionsError;

        // Fetch study areas
        const { data: areasData, error: areasError } = await supabase
          .from("study_areas")
          .select("*")
          .eq("user_id", user.id);

        if (areasError) throw areasError;

        setSessions(sessionsData || []);
        setStudyAreas(areasData || []);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, timeRange]);

  // Process data for charts
  const getWeeklyData = (): DayData[] => {
    const now = new Date();
    const startDate =
      timeRange === "week"
        ? startOfWeek(now)
        : subDays(now, timeRange === "month" ? 30 : 90);
    const endDate = timeRange === "week" ? endOfWeek(now) : now;
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return days.map((day) => {
      const dayStart = new Date(
        day.getFullYear(),
        day.getMonth(),
        day.getDate()
      );
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const daySessions = sessions.filter((session) => {
        const sessionDate = new Date(session.created_at);
        return sessionDate >= dayStart && sessionDate < dayEnd;
      });

      const focusTime = daySessions
        .filter((s) => s.session_type === "focus")
        .reduce((sum, s) => sum + s.duration, 0);

      const breakTime = daySessions
        .filter((s) => s.session_type === "break")
        .reduce((sum, s) => sum + s.duration, 0);

      return {
        date: format(day, timeRange === "week" ? "EEE" : "MM/dd"),
        focus_time: focusTime,
        break_time: breakTime,
        sessions: daySessions.length,
      };
    });
  };

  const getStudyAreaData = (): AreaData[] => {
    const areaStats = studyAreas
      .map((area) => {
        const areaSessions = sessions.filter(
          (s) => s.study_area_id === area.id
        );
        const totalTime = areaSessions.reduce((sum, s) => sum + s.duration, 0);

        return {
          name: area.name,
          time: totalTime,
          sessions: areaSessions.length,
          color: area.color,
        };
      })
      .filter((area) => area.time > 0)
      .sort((a, b) => b.time - a.time);

    return areaStats;
  };

  const getTotalStats = () => {
    const totalSessions = sessions.length;
    const totalTime = sessions.reduce((sum, s) => sum + s.duration, 0);
    const focusTime = sessions
      .filter((s) => s.session_type === "focus")
      .reduce((sum, s) => sum + s.duration, 0);
    const averageSession =
      totalSessions > 0 ? Math.round(totalTime / totalSessions) : 0;
    const studyDays = new Set(
      sessions.map((s) => format(new Date(s.created_at), "yyyy-MM-dd"))
    ).size;

    return {
      totalSessions,
      totalTime,
      focusTime,
      averageSession,
      studyDays,
    };
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // Custom Tooltip Component for Charts
  const CustomTooltip = ({
    active,
    payload,
    label,
    type = "bar",
  }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg shadow-lg p-3 min-w-[200px]">
          <p className="font-medium text-popover-foreground mb-2">{label}</p>
          <div className="space-y-1">
            {payload.map((entry, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {entry.name === "focus_time"
                      ? "Focus Time"
                      : entry.name === "break_time"
                      ? "Break Time"
                      : entry.name || entry.dataKey}
                  </span>
                </div>
                <span className="text-sm font-medium text-popover-foreground">
                  {type === "pie"
                    ? formatTime(entry.value)
                    : entry.dataKey?.includes("time")
                    ? formatTime(entry.value)
                    : entry.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Label for Pie Chart
  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    value,
    name,
  }: LabelProps) => {
    // Check if all required props are defined
    if (
      !cx ||
      !cy ||
      midAngle === undefined ||
      !innerRadius ||
      !outerRadius ||
      !value ||
      !name
    ) {
      return null;
    }

    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos((-midAngle * Math.PI) / 180);
    const y = cy + radius * Math.sin((-midAngle * Math.PI) / 180);

    // Only show label if the value is significant enough
    if (value < 30) return null; // Don't show labels for sessions less than 30 minutes

    return (
      <text
        x={x}
        y={y}
        fill="hsl(var(--popover-foreground))"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {name}
      </text>
    );
  };

  const weeklyData = getWeeklyData();
  const areaData = getStudyAreaData();
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-muted rounded animate-pulse"></div>
          <div className="h-80 bg-muted rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Analytics & Insights</h1>
          <p className="text-muted-foreground mt-1">
            Understand your learning patterns and optimize your study habits
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex bg-muted rounded-lg p-1">
          {(["week", "month", "quarter"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                timeRange === range
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {range === "week"
                ? "Week"
                : range === "month"
                ? "Month"
                : "3 Months"}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                {formatTime(stats.focusTime)}
              </p>
            </div>
            <Target className="w-8 h-8 text-primary" />
          </div>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Sessions
              </p>
              <p className="text-2xl font-bold">{stats.totalSessions}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-primary" />
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
            <TrendingUp className="w-8 h-8 text-primary" />
          </div>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Study Days
              </p>
              <p className="text-2xl font-bold">{stats.studyDays}</p>
            </div>
            <Calendar className="w-8 h-8 text-primary" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Activity Chart */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Daily Activity</h2>
          {weeklyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid stroke="var(--muted-foreground)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                />
                <Tooltip
                  content={<CustomTooltip type="bar" />}
                  cursor={{ fill: "var(--muted)", opacity: 0.5 }}
                />
                <Legend
                  wrapperStyle={{
                    paddingTop: "20px",
                    color: "var(--foreground)",
                  }}
                />
                <Bar
                  dataKey="focus_time"
                  fill="var(--primary)"
                  name="Focus Time"
                  radius={[2, 2, 0, 0]}
                />
                <Bar
                  dataKey="break_time"
                  fill="var(--muted-foreground)"
                  name="Break Time"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No data available for this time range
            </div>
          )}
        </div>

        {/* Study Areas Distribution */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">
            Study Areas Distribution
          </h2>
          {areaData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={areaData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="time"
                  labelLine={false}
                  label={renderCustomLabel}
                >
                  {areaData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke="hsl(var(--background))"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip type="pie" />} />
                <Legend
                  wrapperStyle={{
                    paddingTop: "20px",
                    color: "hsl(var(--foreground))",
                  }}
                  formatter={(value, entry) => (
                    <span style={{ color: entry.color }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No study areas data available
            </div>
          )}
        </div>
      </div>

      {/* Study Areas Table */}
      <div className="bg-card rounded-lg border">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Study Areas Performance</h2>
        </div>
        <div className="p-4">
          {areaData.length > 0 ? (
            <div className="space-y-3">
              {areaData.map((area, index) => (
                <div
                  key={area.name}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-sm font-medium">
                      {index + 1}
                    </div>
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: area.color }}
                    />
                    <span className="font-medium">{area.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatTime(area.time)}</p>
                    <p className="text-sm text-muted-foreground">
                      {area.sessions} sessions
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No study data available. Start studying to see analytics!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
