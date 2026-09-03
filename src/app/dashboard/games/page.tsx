"use client";

import { useState, useEffect } from "react";
import styles from "../cbt/cbt.module.css"; 

const GAMES = [
  {
    id: "emotion-match",
    title: "Emotion Match",
    desc: "A memory game to help recognize different emotions.",
    icon: "🎭",
  },
  {
    id: "focus-game",
    title: "Focus Challenge",
    desc: "Train your attention by catching the moving target.",
    icon: "🎯",
  }
];

// --- Emotion Match Game Component ---
const EmotionMatch = ({ onComplete, onBack }: { onComplete: (score: number) => void, onBack: () => void }) => {
  const emojis = ["😊", "😢", "😡", "😨"];
  // create 4 pairs, shuffle them
  const [cards, setCards] = useState<{id: number, emoji: string, flipped: boolean, matched: boolean}[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const deck = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, idx) => ({ id: idx, emoji, flipped: false, matched: false }));
    setCards(deck);
  }, []);

  const handleCardClick = (id: number) => {
    if (flippedIds.length === 2) return; // wait for flip back
    
    const clickedCard = cards.find(c => c.id === id);
    if (!clickedCard || clickedCard.flipped || clickedCard.matched) return;

    const newCards = cards.map(c => c.id === id ? { ...c, flipped: true } : c);
    setCards(newCards);
    
    const newFlippedIds = [...flippedIds, id];
    setFlippedIds(newFlippedIds);

    if (newFlippedIds.length === 2) {
      const card1 = newCards.find(c => c.id === newFlippedIds[0]);
      const card2 = newCards.find(c => c.id === newFlippedIds[1]);

      if (card1?.emoji === card2?.emoji) {
        // match
        setTimeout(() => {
          setCards(prev => prev.map(c => newFlippedIds.includes(c.id) ? { ...c, matched: true } : c));
          setFlippedIds([]);
          setScore(s => s + 20);
        }, 500);
      } else {
        // no match
        setTimeout(() => {
          setCards(prev => prev.map(c => newFlippedIds.includes(c.id) ? { ...c, flipped: false } : c));
          setFlippedIds([]);
          setScore(s => Math.max(0, s - 5)); // penalize slightly
        }, 1000);
      }
    }
  };

  const isWin = cards.length > 0 && cards.every(c => c.matched);

  return (
    <div className={styles.activityScreen} style={{ textAlign: "center" }}>
      <h2>Emotion Match</h2>
      <p>Find the matching emotional faces.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', margin: '40px auto', maxWidth: '400px' }}>
         {cards.map(card => (
           <div 
             key={card.id} 
             onClick={() => handleCardClick(card.id)} 
             style={{ 
               height: '80px', 
               background: card.flipped || card.matched ? 'var(--surface)' : 'var(--primary-light)',
               border: card.flipped || card.matched ? '2px solid var(--primary-light)' : 'none',
               borderRadius: '8px', 
               cursor: 'pointer', 
               display: 'flex', 
               alignItems: 'center', 
               justifyContent: 'center', 
               fontSize: '36px',
               transition: 'all 0.3s'
             }}
           >
             {card.flipped || card.matched ? card.emoji : "❓"}
           </div>
         ))}
      </div>

      <p style={{ fontSize: '20px', fontWeight: 'bold' }}>Score: {score}</p>
      
      {isWin && <p style={{ color: 'var(--accent)', fontWeight: 'bold', margin: '15px 0' }}>🎉 You found all matches! 🎉</p>}

      <button className="btn btn-primary" onClick={() => onComplete(score)} disabled={!isWin}>
        Finish Game
      </button>
    </div>
  );
};

// --- Focus Challenge Game Component ---
const FocusChallenge = ({ onComplete, onBack }: { onComplete: (score: number) => void, onBack: () => void }) => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15); // 15 seconds game
  const [pos, setPos] = useState({ top: 50, left: 50 });
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let mover: NodeJS.Timeout;

    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);

      mover = setInterval(() => {
        setPos({
          top: Math.floor(Math.random() * 80) + 10,
          left: Math.floor(Math.random() * 80) + 10
        });
      }, 800);
    }

    if (timeLeft === 0) {
      setIsPlaying(false);
    }

    return () => {
      clearInterval(timer);
      clearInterval(mover);
    };
  }, [isPlaying, timeLeft]);

  const handleStart = () => {
    setScore(0);
    setTimeLeft(15);
    setIsPlaying(true);
  };

  const handleHit = () => {
    if (isPlaying) {
      setScore(s => s + 10);
      // Move immediately on hit
      setPos({
        top: Math.floor(Math.random() * 80) + 10,
        left: Math.floor(Math.random() * 80) + 10
      });
    }
  };

  return (
    <div className={styles.activityScreen} style={{ textAlign: "center" }}>
      <h2>Focus Challenge</h2>
      <p>Click the target as fast as you can before time runs out!</p>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '400px', margin: '0 auto 10px auto', fontWeight: 'bold' }}>
        <span>Time Left: {timeLeft}s</span>
        <span>Score: {score}</span>
      </div>

      <div style={{ position: 'relative', height: '300px', maxWidth: '500px', margin: '0 auto 30px auto', background: 'var(--surface)', border: '2px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
        {!isPlaying && timeLeft === 15 && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.8)', zIndex: 10 }}>
            <button className="btn btn-accent" onClick={handleStart}>Start Game</button>
          </div>
        )}

        {!isPlaying && timeLeft === 0 && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.9)', zIndex: 10 }}>
            <h3 style={{ color: 'var(--primary)', marginBottom: '10px' }}>Time's Up!</h3>
            <p>Final Score: {score}</p>
            <button className="btn btn-secondary" onClick={handleStart} style={{ marginTop: '10px' }}>Play Again</button>
          </div>
        )}

        <div 
          onClick={handleHit} 
          style={{ 
            position: 'absolute', 
            top: `${pos.top}%`, 
            left: `${pos.left}%`, 
            width: '50px', 
            height: '50px', 
            background: 'var(--accent)', 
            borderRadius: '50%', 
            cursor: isPlaying ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '20px',
            transform: 'translate(-50%, -50%)',
            transition: 'top 0.2s, left 0.2s',
            boxShadow: '0 4px 10px rgba(0, 180, 169, 0.4)'
          }}
        >
          🎯
        </div>
      </div>

      <button className="btn btn-primary" onClick={() => onComplete(score)} disabled={isPlaying}>
        Save Score & Finish
      </button>
    </div>
  );
};


export default function GamesPage() {
  const [activeGame, setActiveGame] = useState<string | null>(null);

  const completeGame = async (gameId: string, finalScore: number) => {
    try {
      await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, score: finalScore, duration: 120, completed: true }),
      });
      alert(`Game finished! You scored ${finalScore} points.`);
      setActiveGame(null);
    } catch (error) {
      console.error(error);
    }
  };

  if (activeGame) {
    return (
      <div className={styles.container}>
        <button className={`btn btn-secondary ${styles.backBtn}`} onClick={() => setActiveGame(null)}>
          ← Back to Games
        </button>
        {activeGame === "emotion-match" && <EmotionMatch onComplete={(score) => completeGame("emotion-match", score)} onBack={() => setActiveGame(null)} />}
        {activeGame === "focus-game" && <FocusChallenge onComplete={(score) => completeGame("focus-game", score)} onBack={() => setActiveGame(null)} />}
      </div>
    );
  }

  // List View
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Wellness Games</h1>
        <p>Interactive mini-games to build emotional awareness and focus.</p>
      </div>

      <div className={styles.grid}>
        {GAMES.map((game) => (
          <div key={game.id} className={styles.activityCard}>
            <div className={styles.icon}>{game.icon}</div>
            <h2 className={styles.title}>{game.title}</h2>
            <p className={styles.desc}>{game.desc}</p>
            <button className="btn btn-accent" onClick={() => setActiveGame(game.id)}>
              Play Game
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
