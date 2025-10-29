import { env } from "../config/env";

const SPOTIFY_API_BASE = "https://api.spotify.com/v1";
const SPOTIFY_AUTH_BASE = "https://accounts.spotify.com";

export interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  preview_url: string | null;
  duration_ms: number;
  artists: { id: string; name: string }[];
  album: {
    id: string;
    name: string;
    images: { url: string; height: number; width: number }[];
  };
}

export class SpotifyClient {
  private accessToken?: string;
  private tokenExpiry?: number;
  private static appAccessToken?: string;
  private static appTokenExpiry?: number;

  constructor(accessToken?: string) {
    this.accessToken = accessToken;
  }

  /**
   * Get client credentials access token (for public API access)
   */
  static async getClientCredentialsToken(): Promise<string> {
    // Return cached token if still valid
    if (this.appAccessToken && this.appTokenExpiry && Date.now() < this.appTokenExpiry) {
      return this.appAccessToken;
    }

    if (!env.SPOTIFY_CLIENT_ID || !env.SPOTIFY_CLIENT_SECRET) {
      throw new Error("Spotify credentials not configured");
    }

    const response = await fetch(`${SPOTIFY_AUTH_BASE}/api/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${btoa(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`)}`,
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get client credentials: ${error}`);
    }

    const data: SpotifyTokenResponse = await response.json();
    this.appAccessToken = data.access_token;
    this.appTokenExpiry = Date.now() + data.expires_in * 1000 - 60000; // Refresh 1 min early

    return data.access_token;
  }

  /**
   * Generate Spotify authorization URL for OAuth flow
   */
  static getAuthUrl(state: string): string {
    if (!env.SPOTIFY_CLIENT_ID || !env.SPOTIFY_REDIRECT_URI) {
      throw new Error("Spotify credentials not configured");
    }

    const scopes = [
      "user-read-email",
      "user-top-read",
      "user-library-read",
      "playlist-read-private",
    ];

    const params = new URLSearchParams({
      client_id: env.SPOTIFY_CLIENT_ID,
      response_type: "code",
      redirect_uri: env.SPOTIFY_REDIRECT_URI,
      scope: scopes.join(" "),
      state,
    });

    return `${SPOTIFY_AUTH_BASE}/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  static async exchangeCodeForToken(code: string): Promise<SpotifyTokenResponse> {
    if (!env.SPOTIFY_CLIENT_ID || !env.SPOTIFY_CLIENT_SECRET || !env.SPOTIFY_REDIRECT_URI) {
      throw new Error("Spotify credentials not configured");
    }

    const response = await fetch(`${SPOTIFY_AUTH_BASE}/api/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${btoa(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`)}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: env.SPOTIFY_REDIRECT_URI,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to exchange code: ${error}`);
    }

    return response.json();
  }

  /**
   * Refresh an expired access token
   */
  static async refreshAccessToken(refreshToken: string): Promise<SpotifyTokenResponse> {
    if (!env.SPOTIFY_CLIENT_ID || !env.SPOTIFY_CLIENT_SECRET) {
      throw new Error("Spotify credentials not configured");
    }

    const response = await fetch(`${SPOTIFY_AUTH_BASE}/api/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${btoa(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`)}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to refresh token: ${error}`);
    }

    return response.json();
  }

  /**
   * Make an authenticated request to Spotify API
   */
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    if (!this.accessToken) {
      throw new Error("No access token available");
    }

    const response = await fetch(`${SPOTIFY_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        ...options?.headers,
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Spotify API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  /**
   * Search for artists
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async searchArtists(query: string, limit: number = 10): Promise<any> {
    const params = new URLSearchParams({
      q: query,
      type: "artist",
      limit: limit.toString(),
    });

    return this.request(`/search?${params.toString()}`);
  }

  /**
   * Get artist's top tracks
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getArtistTopTracks(artistId: string, market: string = "US"): Promise<any> {
    return this.request(`/artists/${artistId}/top-tracks?market=${market}`);
  }

  /**
   * Get user's top tracks
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getUserTopTracks(limit: number = 50, timeRange: string = "medium_term"): Promise<any> {
    return this.request(`/me/top/tracks?limit=${limit}&time_range=${timeRange}`);
  }

  /**
   * Get user's saved tracks
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getUserSavedTracks(limit: number = 50, offset: number = 0): Promise<any> {
    return this.request(`/me/tracks?limit=${limit}&offset=${offset}`);
  }

  /**
   * Get playlist tracks
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getPlaylistTracks(playlistId: string, limit: number = 50): Promise<any> {
    return this.request(`/playlists/${playlistId}/tracks?limit=${limit}`);
  }

  /**
   * Get user's playlists
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getUserPlaylists(limit: number = 50): Promise<any> {
    return this.request(`/me/playlists?limit=${limit}`);
  }
}
