"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { api, type Artist } from "@/lib/api";

export default function ArtistSearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setArtists([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await api.searchArtists(query);
        setArtists(result.artists || []);
      } catch (err) {
        setError("Failed to search artists. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleStartGame = useCallback(
    async (artist: Artist) => {
      setSelectedArtist(artist);
      try {
        const session = await api.createGameSession("artist", artist.id);
        // Store session data in sessionStorage
        sessionStorage.setItem("currentGameSession", JSON.stringify(session));
        // Navigate to game with session data
        router.push(
          `/game?sessionId=${session.sessionId}&mode=artist&artistName=${encodeURIComponent(artist.name)}`
        );
      } catch (err) {
        setError("Failed to start game. Please try again.");
        console.error(err);
        setSelectedArtist(null);
      }
    },
    [router]
  );

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
            <h1 className="text-4xl font-bold">Artist Mode</h1>
            <p className="text-muted-foreground mt-2">
              Search for your favorite artist and test your knowledge
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for an artist..."
              className="w-full px-4 py-3 pl-12 bg-card border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500">
            {error}
          </div>
        )}

        {/* Results */}
        {artists.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Found {artists.length} artist{artists.length !== 1 ? "s" : ""}
            </p>
            <div className="grid gap-4">
              {artists.map((artist) => (
                <button
                  key={artist.id}
                  onClick={() => handleStartGame(artist)}
                  disabled={selectedArtist?.id === artist.id}
                  className="group p-4 bg-card border rounded-lg hover:border-primary transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-4">
                    {/* Artist Image */}
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {artist.images && artist.images.length > 0 ? (
                        <Image
                          src={artist.images[0].url}
                          alt={artist.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg
                            className="w-8 h-8 text-muted-foreground"
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
                      )}
                    </div>

                    {/* Artist Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors truncate">
                        {artist.name}
                      </h3>
                      {artist.genres && artist.genres.length > 0 && (
                        <p className="text-sm text-muted-foreground truncate">
                          {artist.genres.slice(0, 3).join(", ")}
                        </p>
                      )}
                    </div>

                    {/* Arrow */}
                    <svg
                      className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && query.trim() && artists.length === 0 && (
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <p className="text-muted-foreground">No artists found</p>
          </div>
        )}

        {/* Initial State */}
        {!query.trim() && (
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
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
            <p className="text-muted-foreground">Start typing to search for artists</p>
          </div>
        )}
      </div>
    </main>
  );
}
