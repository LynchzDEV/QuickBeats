"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { leaderboardApi, type LeaderboardEntry } from "@/lib/leaderboard";

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modeFilter, setModeFilter] = useState<string>("all");

  useEffect(() => {
    fetchLeaderboard();
  }, [modeFilter]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await leaderboardApi.getTopScores(
        50,
        modeFilter === "all" ? undefined : modeFilter
      );
      setEntries(result.entries);
    } catch (err) {
      setError("Failed to load leaderboard");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else if (days < 7) {
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return null;
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Home
          </Link>
          <div>
            <h1 className="text-4xl font-bold">Leaderboard</h1>
            <p className="text-muted-foreground mt-2">Top players across all game modes</p>
          </div>
        </div>

        {/* Mode Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {["all", "artist", "top-tracks", "saved-tracks", "playlist"].map((mode) => (
            <button
              key={mode}
              onClick={() => setModeFilter(mode)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                modeFilter === mode
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border hover:border-primary"
              }`}
            >
              {mode === "all"
                ? "All Modes"
                : mode
                    .split("-")
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ")}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground mt-4">Loading leaderboard...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-center">
            {error}
          </div>
        )}

        {/* Leaderboard Entries */}
        {!loading && !error && (
          <>
            {entries.length > 0 ? (
              <div className="bg-card border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50 border-b">
                      <tr>
                        <th className="px-6 py-4 text-left font-semibold">Rank</th>
                        <th className="px-6 py-4 text-left font-semibold">Player</th>
                        <th className="px-6 py-4 text-left font-semibold">Score</th>
                        <th className="px-6 py-4 text-left font-semibold">Mode</th>
                        <th className="px-6 py-4 text-left font-semibold">When</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((entry, index) => {
                        const rank = index + 1;
                        const medal = getMedalEmoji(rank);

                        return (
                          <tr
                            key={`${entry.name}-${entry.timestamp}`}
                            className="border-b last:border-b-0 hover:bg-muted/30 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                {medal && <span className="text-2xl">{medal}</span>}
                                <span
                                  className={`font-semibold ${rank <= 3 ? "text-primary" : ""}`}
                                >
                                  #{rank}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 font-medium">{entry.name}</td>
                            <td className="px-6 py-4">
                              <span className="font-semibold text-primary">{entry.score}</span>
                            </td>
                            <td className="px-6 py-4 text-muted-foreground">
                              {entry.mode
                                .split("-")
                                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                                .join(" ")}
                            </td>
                            <td className="px-6 py-4 text-muted-foreground text-sm">
                              {formatDate(entry.timestamp)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 mx-auto text-muted-foreground mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <p className="text-muted-foreground">No entries yet. Be the first to play!</p>
              </div>
            )}
          </>
        )}

        {/* Call to Action */}
        {!loading && !error && entries.length > 0 && (
          <div className="text-center">
            <Link
              href="/artist"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Play Now
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
