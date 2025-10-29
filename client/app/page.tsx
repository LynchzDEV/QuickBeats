"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface MetricsSummary {
  totalGamesPlayed: number;
  totalScoresSubmitted: number;
  averageScore: number;
  modeBreakdown: Record<string, number>;
  topScore: number;
  totalPlayers: number;
}

export default function Home() {
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null);

  useEffect(() => {
    // Fetch metrics from API
    fetch("http://localhost:3001/metrics/summary")
      .then((res) => res.json())
      .then((data) => setMetrics(data))
      .catch((err) => console.error("Failed to fetch metrics:", err));
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent">
            QuickBeats
          </h1>
          <p className="text-xl text-muted-foreground">Test your music knowledge in 5 seconds!</p>
          {metrics && (
            <div className="inline-block px-6 py-2 bg-card rounded-lg border">
              <p className="text-sm text-muted-foreground">Total Quizzes Played</p>
              <p className="text-3xl font-bold text-primary">
                {metrics.totalGamesPlayed.toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* CTA Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Artist Mode Card */}
          <Link href="/artist">
            <div className="group p-8 bg-card rounded-xl border hover:border-primary transition-all cursor-pointer h-full">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    Artist Mode
                  </h2>
                  <p className="text-muted-foreground">
                    Pick your favorite artist and guess their songs from a 5-second clip.
                  </p>
                </div>
                <div className="pt-4">
                  <span className="text-sm font-medium text-primary">Start Playing →</span>
                </div>
              </div>
            </div>
          </Link>

          {/* Personal Mode Card */}
          <Link href="/personal">
            <div className="group p-8 bg-card rounded-xl border hover:border-primary transition-all cursor-pointer h-full">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    Personal Mode
                  </h2>
                  <p className="text-muted-foreground">
                    Connect with Spotify and quiz yourself on your top tracks, saved songs, or
                    playlists.
                  </p>
                </div>
                <div className="pt-4">
                  <span className="text-sm font-medium text-primary">Connect Spotify →</span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Leaderboard Link */}
        <div className="text-center">
          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            View Leaderboard
          </Link>
        </div>
      </div>
    </main>
  );
}
