/**
 * In-memory metrics tracking
 * In production, this should be replaced with a time-series database or metrics service
 */

export interface MetricsSummary {
  totalGamesPlayed: number;
  totalScoresSubmitted: number;
  averageScore: number;
  modeBreakdown: Record<string, number>;
  topScore: number;
  totalPlayers: number;
}

class MetricsTracker {
  private gamesPlayed = 0;
  private scoresSubmitted = 0;
  private totalScore = 0;
  private modeCount: Record<string, number> = {};
  private topScore = 0;
  private uniquePlayers = new Set<string>();

  /**
   * Increment games played counter
   */
  recordGameStart(mode: string): void {
    this.gamesPlayed++;
    this.modeCount[mode] = (this.modeCount[mode] || 0) + 1;
  }

  /**
   * Record a score submission
   */
  recordScoreSubmission(score: number, playerName: string): void {
    this.scoresSubmitted++;
    this.totalScore += score;
    this.uniquePlayers.add(playerName.toLowerCase().trim());

    if (score > this.topScore) {
      this.topScore = score;
    }
  }

  /**
   * Get summary of all metrics
   */
  getSummary(): MetricsSummary {
    return {
      totalGamesPlayed: this.gamesPlayed,
      totalScoresSubmitted: this.scoresSubmitted,
      averageScore: this.scoresSubmitted > 0 ? this.totalScore / this.scoresSubmitted : 0,
      modeBreakdown: { ...this.modeCount },
      topScore: this.topScore,
      totalPlayers: this.uniquePlayers.size,
    };
  }

  /**
   * Reset all metrics (useful for testing)
   */
  reset(): void {
    this.gamesPlayed = 0;
    this.scoresSubmitted = 0;
    this.totalScore = 0;
    this.modeCount = {};
    this.topScore = 0;
    this.uniquePlayers.clear();
  }
}

// Export singleton instance
export const metrics = new MetricsTracker();
