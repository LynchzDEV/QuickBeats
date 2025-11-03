"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

interface AuthSession {
  authenticated: boolean;
  expiresAt?: number;
}

type PersonalMode = "top-tracks" | "saved-tracks" | "playlist";
type TimeRange = "short_term" | "medium_term" | "long_term";

export default function PersonalModePage() {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMode, setSelectedMode] = useState<PersonalMode | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>("medium_term");
  const [playlistId, setPlaylistId] = useState("");
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("http://localhost:3001/auth/session", {
        credentials: "include",
      });
      const data: AuthSession = await response.json();
      setSession(data);
    } catch (err) {
      console.error("Auth check failed:", err);
      setSession({ authenticated: false });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    // Redirect to Spotify OAuth
    window.location.href = "http://localhost:3001/auth/spotify/start";
  };

  const handleStartGame = async () => {
    if (!selectedMode) return;

    setStarting(true);
    setError(null);

    try {
      let source = "";
      if (selectedMode === "top-tracks") {
        source = timeRange;
      } else if (selectedMode === "playlist") {
        if (!playlistId.trim()) {
          setError("Please enter a playlist ID");
          setStarting(false);
          return;
        }
      }

      const gameSession = await api.createGameSession(
        selectedMode,
        undefined,
        selectedMode === "playlist" ? playlistId.trim() : source
      );

      // Store session data
      sessionStorage.setItem("currentGameSession", JSON.stringify(gameSession));

      // Navigate to game
      router.push(
        `/game?sessionId=${gameSession.sessionId}&mode=${selectedMode}&artistName=${selectedMode === "playlist" ? "Your Playlist" : selectedMode === "top-tracks" ? "Your Top Tracks" : "Your Saved Tracks"}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start game");
      console.error(err);
    } finally {
      setStarting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </main>
    );
  }

  // Not authenticated
  if (!session?.authenticated) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-2xl mx-auto space-y-8">
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
              <h1 className="text-4xl font-bold">Personal Mode</h1>
              <p className="text-muted-foreground mt-2">
                Connect your Spotify account to play with your personal library
              </p>
            </div>
          </div>

          {/* Login Card */}
          <div className="bg-card border rounded-xl p-12 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-2">Login with Spotify</h2>
              <p className="text-muted-foreground">
                We&apos;ll access your top tracks, saved songs, and playlists to create a
                personalized game
              </p>
            </div>
            <button
              onClick={handleLogin}
              className="px-8 py-4 bg-[#1DB954] text-white rounded-full font-semibold hover:bg-[#1ed760] transition-colors inline-flex items-center gap-3"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
              Connect with Spotify
            </button>
            <p className="text-sm text-muted-foreground">
              We only request the necessary permissions to play the game
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Authenticated - show mode selector
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
            <h1 className="text-4xl font-bold">Personal Mode</h1>
            <p className="text-muted-foreground mt-2">
              Choose a source to create your personalized game
            </p>
          </div>
        </div>

        {/* Mode Selection */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Top Tracks */}
          <button
            onClick={() => setSelectedMode("top-tracks")}
            className={`p-6 bg-card border rounded-xl text-left transition-all ${
              selectedMode === "top-tracks"
                ? "border-primary bg-primary/5"
                : "hover:border-primary/50"
            }`}
          >
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
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Top Tracks</h3>
                <p className="text-sm text-muted-foreground mt-1">Your most played songs</p>
              </div>
            </div>
          </button>

          {/* Saved Tracks */}
          <button
            onClick={() => setSelectedMode("saved-tracks")}
            className={`p-6 bg-card border rounded-xl text-left transition-all ${
              selectedMode === "saved-tracks"
                ? "border-primary bg-primary/5"
                : "hover:border-primary/50"
            }`}
          >
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
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Saved Tracks</h3>
                <p className="text-sm text-muted-foreground mt-1">Your liked songs library</p>
              </div>
            </div>
          </button>

          {/* Playlist */}
          <button
            onClick={() => setSelectedMode("playlist")}
            className={`p-6 bg-card border rounded-xl text-left transition-all ${
              selectedMode === "playlist"
                ? "border-primary bg-primary/5"
                : "hover:border-primary/50"
            }`}
          >
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
                <h3 className="font-semibold text-lg">Playlist</h3>
                <p className="text-sm text-muted-foreground mt-1">Choose a specific playlist</p>
              </div>
            </div>
          </button>
        </div>

        {/* Options */}
        {selectedMode && (
          <div className="bg-card border rounded-xl p-6 space-y-6">
            {selectedMode === "top-tracks" && (
              <div className="space-y-3">
                <label className="block text-sm font-medium">Time Range</label>
                <div className="flex gap-3">
                  {[
                    { value: "short_term", label: "Last 4 Weeks" },
                    { value: "medium_term", label: "Last 6 Months" },
                    { value: "long_term", label: "All Time" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setTimeRange(option.value as TimeRange)}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                        timeRange === option.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedMode === "playlist" && (
              <div className="space-y-3">
                <label className="block text-sm font-medium">Playlist ID</label>
                <input
                  type="text"
                  value={playlistId}
                  onChange={(e) => setPlaylistId(e.target.value)}
                  placeholder="37i9dQZF1DXcBWIGoYBM5M"
                  className="w-full px-4 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-sm text-muted-foreground">
                  Find this in your playlist&apos;s Spotify URL or share link
                </p>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleStartGame}
              disabled={starting}
              className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {starting ? "Starting..." : "Start Game"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
