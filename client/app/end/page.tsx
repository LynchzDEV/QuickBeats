"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { leaderboardApi } from "@/lib/leaderboard";

function EndScreenContent() {
  const searchParams = useSearchParams();

  const sessionId = searchParams.get("sessionId") || "";
  const score = parseInt(searchParams.get("score") || "0");
  const rounds = parseInt(searchParams.get("rounds") || "0");
  const artistName = searchParams.get("artistName") || "";

  const [playerName, setPlayerName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [rank, setRank] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const percentage = rounds > 0 ? Math.round((score / rounds) * 100) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!playerName.trim()) {
      setError("Please enter your name");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const result = await leaderboardApi.submitScore(sessionId, playerName.trim());
      setSubmitted(true);
      setRank(result.rank);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit score");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Game Over!</h1>
          <p className="text-muted-foreground">{artistName}</p>
        </div>

        {/* Score Display */}
        <div className="bg-card border rounded-xl p-8 space-y-6">
          <div className="text-center space-y-4">
            <div className="text-6xl font-bold text-primary">{score}</div>
            <p className="text-muted-foreground">out of {rounds} rounds</p>
            <div className="text-2xl font-semibold">{percentage}% Accuracy</div>
          </div>

          {/* Performance Message */}
          <div className="text-center">
            {percentage === 100 && <p className="text-xl text-green-500">Perfect Score! 🎉</p>}
            {percentage >= 80 && percentage < 100 && (
              <p className="text-xl text-green-500">Amazing! 🔥</p>
            )}
            {percentage >= 60 && percentage < 80 && (
              <p className="text-xl text-primary">Great job! 👏</p>
            )}
            {percentage >= 40 && percentage < 60 && (
              <p className="text-xl text-muted-foreground">Not bad! 👍</p>
            )}
            {percentage < 40 && (
              <p className="text-xl text-muted-foreground">Keep practicing! 💪</p>
            )}
          </div>
        </div>

        {/* Leaderboard Submission */}
        {!submitted ? (
          <div className="bg-card border rounded-xl p-8 space-y-4">
            <h2 className="text-2xl font-semibold text-center">Submit to Leaderboard</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  maxLength={50}
                  className="w-full px-4 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={submitting}
                />
              </div>
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting..." : "Submit Score"}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-card border rounded-xl p-8 space-y-4 text-center">
            <svg
              className="w-16 h-16 mx-auto text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="text-2xl font-semibold text-green-500">Score Submitted!</h2>
            {rank && <p className="text-muted-foreground">You ranked #{rank} on the leaderboard</p>}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <Link
            href="/artist"
            className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold text-center hover:bg-primary/90 transition-colors"
          >
            Play Again
          </Link>
          <Link
            href="/leaderboard"
            className="flex-1 px-6 py-3 border rounded-lg font-semibold text-center hover:border-primary hover:bg-primary/5 transition-colors"
          >
            View Leaderboard
          </Link>
        </div>

        <div className="text-center">
          <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function EndPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </main>
      }
    >
      <EndScreenContent />
    </Suspense>
  );
}
