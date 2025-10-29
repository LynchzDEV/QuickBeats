import type { Track, Choice, GameRound } from "../types/game";
import { SpotifyClient } from "./spotify";

/**
 * Pick a random track from an array that has a preview URL
 */
export function selectTrackWithPreview(tracks: Track[]): Track | null {
  const tracksWithPreview = tracks.filter((t) => t.previewUrl && t.previewUrl.length > 0);

  if (tracksWithPreview.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * tracksWithPreview.length);
  return tracksWithPreview[randomIndex];
}

/**
 * Generate random start time for a 5-second preview clip
 */
export function generateRandomPreviewTime(durationMs: number): number {
  // Spotify previews are typically 30 seconds (30000ms)
  const previewDuration = 30000;
  const clipDuration = 5000; // 5 seconds

  // Calculate max start time (ensure we have at least 5 seconds left)
  const maxStartTime = Math.max(0, Math.min(durationMs, previewDuration) - clipDuration);

  // Return random start time
  return Math.floor(Math.random() * maxStartTime);
}

/**
 * Generate distractor choices (wrong answers)
 */
export async function generateDistractors(
  correctTrack: Track,
  artistId: string,
  count: number = 2
): Promise<Choice[]> {
  try {
    // Get client credentials token
    const accessToken = await SpotifyClient.getClientCredentialsToken();
    const client = new SpotifyClient(accessToken);

    // Get more tracks from the same artist
    const response = await client.getArtistTopTracks(artistId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allTracks = response.tracks || [];

    // Filter out the correct track and tracks without names
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const potentialDistractors = allTracks.filter(
      (track: any) => track.id !== correctTrack.id && track.name && track.name.length > 0
    );

    // Shuffle and take required count
    const shuffled = potentialDistractors.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);

    // Convert to Choice format
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return selected.map((track: any) => ({
      id: track.id,
      trackName: track.name,
      artistName: track.artists?.[0]?.name || "Unknown Artist",
    }));
  } catch (error) {
    console.error("Error generating distractors:", error);
    // Return generic distractors as fallback
    return Array.from({ length: count }, (_, i) => ({
      id: `distractor-${i}`,
      trackName: `Track ${i + 1}`,
      artistName: correctTrack.artists[0]?.name || "Unknown Artist",
    }));
  }
}

/**
 * Create a signed round with correct answer and distractors
 */
export async function createGameRound(
  correctTrack: Track,
  artistId: string,
  secret: string
): Promise<GameRound> {
  const roundId = crypto.randomUUID();

  // Generate distractors
  const distractors = await generateDistractors(correctTrack, artistId, 2);

  // Create correct choice
  const correctChoice: Choice = {
    id: correctTrack.id,
    trackName: correctTrack.name,
    artistName: correctTrack.artists[0]?.name || "Unknown Artist",
  };

  // Combine and shuffle choices
  const allChoices = [correctChoice, ...distractors];
  const shuffledChoices = allChoices.sort(() => Math.random() - 0.5);

  // Generate random preview start time
  const previewStartTime = generateRandomPreviewTime(correctTrack.durationMs);

  // Create signature (hash of roundId + correct answer)
  const signatureData = `${roundId}:${correctTrack.id}:${secret}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(signatureData);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const signature = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  // Get album art (prefer medium size)
  const albumArt =
    correctTrack.album.images.find((img) => img.height && img.height >= 300 && img.height <= 600)
      ?.url || correctTrack.album.images[0]?.url;

  return {
    roundId,
    previewUrl: correctTrack.previewUrl,
    previewStartTime,
    previewDuration: 5000, // 5 seconds
    choices: shuffledChoices,
    albumArt,
    signature,
  };
}

/**
 * Verify round signature
 */
export async function verifyRoundSignature(
  roundId: string,
  correctAnswerId: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const signatureData = `${roundId}:${correctAnswerId}:${secret}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(signatureData);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const expectedSignature = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  return signature === expectedSignature;
}

/**
 * Convert Spotify API track to our Track type
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapSpotifyTrack(spotifyTrack: any): Track {
  return {
    id: spotifyTrack.id,
    name: spotifyTrack.name,
    previewUrl: spotifyTrack.preview_url || "",
    durationMs: spotifyTrack.duration_ms || 0,
    artists:
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      spotifyTrack.artists?.map((artist: any) => ({
        id: artist.id,
        name: artist.name,
      })) || [],
    album: {
      id: spotifyTrack.album?.id || "",
      name: spotifyTrack.album?.name || "",
      images: spotifyTrack.album?.images || [],
    },
  };
}
