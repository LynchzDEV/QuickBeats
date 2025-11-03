"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { api, type GameSession, type AnswerResponse } from "@/lib/api";

type GameState = "loading" | "playing" | "answered" | "ended";

function GameContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [sessionId] = useState(searchParams.get("sessionId") || "");
  const [artistName] = useState(searchParams.get("artistName") || "");
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [gameState, setGameState] = useState<GameState>("loading");
  const [timeLeft, setTimeLeft] = useState(5);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerResult, setAnswerResult] = useState<AnswerResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial session data
  useEffect(() => {
    if (!sessionId) {
      router.push("/artist");
      return;
    }

    // Retrieve session from sessionStorage
    const sessionData = sessionStorage.getItem("currentGameSession");
    if (sessionData) {
      try {
        const session: GameSession = JSON.parse(sessionData);
        setGameSession(session);
        setGameState("playing");
      } catch (err) {
        setError("Failed to load game session");
        console.error(err);
      }
    } else {
      setError("No game session found");
      router.push("/artist");
    }
  }, [sessionId, router]);

  // Timer countdown
  useEffect(() => {
    if (gameState !== "playing") return;

    if (timeLeft <= 0) {
      // Auto-submit if time runs out
      if (audioRef.current) {
        audioRef.current.pause();
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  // Play audio when game starts
  useEffect(() => {
    if (gameState === "playing" && gameSession?.round.previewUrl) {
      const audio = new Audio(gameSession.round.previewUrl);
      audioRef.current = audio;

      audio.currentTime = gameSession.round.previewStartTime / 1000;
      audio.play().catch((err) => console.error("Failed to play audio:", err));

      // Stop after 5 seconds
      setTimeout(() => {
        audio.pause();
      }, 5000);

      return () => {
        audio.pause();
      };
    }
  }, [gameState, gameSession]);

  const handleAnswerSelect = async (choiceId: string) => {
    if (gameState !== "playing" || !gameSession) return;

    setSelectedAnswer(choiceId);
    setGameState("answered");

    // Pause audio
    if (audioRef.current) {
      audioRef.current.pause();
    }

    try {
      const result = await api.submitAnswer(sessionId, gameSession.round.roundId, choiceId);
      setAnswerResult(result);
    } catch (err) {
      setError("Failed to submit answer");
      console.error(err);
    }
  };

  const handleContinue = () => {
    if (!answerResult) return;

    // Navigate to end screen
    router.push(
      `/end?sessionId=${sessionId}&score=${answerResult.score}&rounds=${answerResult.roundsPlayed}&artistName=${encodeURIComponent(artistName)}`
    );
  };

  // Loading state
  if (gameState === "loading" || !gameSession) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading game...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">{artistName}</h1>
          <p className="text-muted-foreground">Round {gameSession.roundsPlayed + 1}</p>
        </div>

        {/* Album Art */}
        {gameSession.round.albumArt && (
          <div className="relative w-64 h-64 mx-auto rounded-lg overflow-hidden shadow-2xl">
            <Image
              src={gameSession.round.albumArt}
              alt="Album Art"
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Timer */}
        {gameState === "playing" && (
          <div className="text-center space-y-2">
            <div className="text-6xl font-bold text-primary">{timeLeft}</div>
            <p className="text-muted-foreground">Listen carefully...</p>
          </div>
        )}

        {/* Answer Choices */}
        <div className="space-y-4">
          {gameSession.round.choices.map((choice) => {
            const isSelected = selectedAnswer === choice.id;
            const isCorrect = answerResult?.correctAnswerId === choice.id;
            const showFeedback = gameState === "answered";

            let buttonClass = "w-full p-4 border rounded-lg text-left transition-all ";

            if (!showFeedback) {
              buttonClass += "hover:border-primary hover:bg-primary/5 cursor-pointer";
            } else if (isCorrect) {
              buttonClass += "border-green-500 bg-green-500/10";
            } else if (isSelected && !isCorrect) {
              buttonClass += "border-red-500 bg-red-500/10";
            } else {
              buttonClass += "opacity-50";
            }

            return (
              <button
                key={choice.id}
                onClick={() => handleAnswerSelect(choice.id)}
                disabled={gameState !== "playing"}
                className={buttonClass}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{choice.trackName}</p>
                    <p className="text-sm text-muted-foreground">{choice.artistName}</p>
                  </div>
                  {showFeedback && isCorrect && (
                    <svg
                      className="w-6 h-6 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                  {showFeedback && isSelected && !isCorrect && (
                    <svg
                      className="w-6 h-6 text-red-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {gameState === "answered" && answerResult && (
          <div className="text-center space-y-4">
            <div
              className={`text-2xl font-bold ${answerResult.correct ? "text-green-500" : "text-red-500"}`}
            >
              {answerResult.correct ? "Correct!" : "Wrong!"}
            </div>
            <div className="text-muted-foreground">
              Score: {answerResult.score} / {answerResult.roundsPlayed}
            </div>
            <button
              onClick={handleContinue}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Continue
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-center">
            {error}
          </div>
        )}
      </div>
    </main>
  );
}

export default function GamePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </main>
      }
    >
      <GameContent />
    </Suspense>
  );
}
