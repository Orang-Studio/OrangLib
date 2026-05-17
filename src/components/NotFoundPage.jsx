import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './NotFoundPage.css';

const BinaryBackground = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    const fontSize = 14;
    let columns = Math.floor(canvas.width / fontSize);
    let rows = Math.floor(canvas.height / fontSize);
    const grid = [];
    const colors = [];

    for (let y = 0; y < rows; y++) {
      grid[y] = [];
      colors[y] = [];
      for (let x = 0; x < columns; x++) {
        grid[y][x] = Math.random() > 0.5 ? '1' : '0';
        const hue = 20 + Math.random() * 20;
        const saturation = 80 + Math.random() * 20;
        const lightness = 40 + Math.random() * 20;
        colors[y][x] = { hue, saturation, lightness };
      }
    }

    const draw = () => {
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < columns; x++) {
          const { hue, saturation, lightness } = colors[y][x];
          const opacity = 0.05 + Math.random() * 0.08;
          ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity})`;
          ctx.fillText(grid[y][x], x * fontSize, (y + 1) * fontSize);
        }
      }
    };

    const changeRandomCell = () => {
      const x = Math.floor(Math.random() * columns);
      const y = Math.floor(Math.random() * rows);
      grid[y][x] = grid[y][x] === '1' ? '0' : '1';
    };

    draw();

    const drawInterval = setInterval(draw, 500);
    const changeInterval = setInterval(changeRandomCell, 2000);
    return () => {
      clearInterval(drawInterval);
      clearInterval(changeInterval);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return <canvas ref={canvasRef} className="binary-background-404" />;
};

const GRID_SIZE = 20;
const CELL_SIZE = 15;
const INITIAL_SPEED = 150;

const SnakeGame = () => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('snakeHighScore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const snakeRef = useRef([{ x: 10, y: 10 }]);
  const directionRef = useRef({ x: 1, y: 0 });
  const nextDirectionRef = useRef({ x: 1, y: 0 });
  const foodRef = useRef({ x: 15, y: 10 });
  const gameLoopRef = useRef(null);

  const generateFood = useCallback(() => {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
    } while (snakeRef.current.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    foodRef.current = newFood;
  }, []);

  const resetGame = useCallback(() => {
    snakeRef.current = [{ x: 10, y: 10 }];
    directionRef.current = { x: 1, y: 0 };
    nextDirectionRef.current = { x: 1, y: 0 };
    setScore(0);
    generateFood();
  }, [generateFood]);

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, GRID_SIZE * CELL_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(GRID_SIZE * CELL_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }

    snakeRef.current.forEach((segment, index) => {
      if (index === 0) {
        ctx.fillStyle = '#00ff00';
      } else {
        const brightness = Math.max(0.4, 1 - (index * 0.03));
        ctx.fillStyle = `rgba(0, 255, 0, ${brightness})`;
      }
      ctx.fillRect(
        segment.x * CELL_SIZE + 1,
        segment.y * CELL_SIZE + 1,
        CELL_SIZE - 2,
        CELL_SIZE - 2
      );
    });

    ctx.fillStyle = '#ff6600';
    ctx.beginPath();
    ctx.arc(
      foodRef.current.x * CELL_SIZE + CELL_SIZE / 2,
      foodRef.current.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }, []);

  const gameLoop = useCallback(() => {
    directionRef.current = nextDirectionRef.current;

    const head = snakeRef.current[0];
    const newHead = {
      x: head.x + directionRef.current.x,
      y: head.y + directionRef.current.y
    };

    if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
      setGameState('gameover');
      return;
    }

    if (snakeRef.current.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
      setGameState('gameover');
      return;
    }

    snakeRef.current.unshift(newHead);

    if (newHead.x === foodRef.current.x && newHead.y === foodRef.current.y) {
      setScore(prev => {
        const newScore = prev + 10;
        if (newScore > highScore) {
          setHighScore(newScore);
          localStorage.setItem('snakeHighScore', newScore.toString());
        }
        return newScore;
      });
      generateFood();
    } else {
      snakeRef.current.pop();
    }

    drawGame();
  }, [drawGame, generateFood, highScore]);

  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = setInterval(gameLoop, INITIAL_SPEED);
    } else {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameState, gameLoop]);

  useEffect(() => {
    drawGame();
  }, [drawGame]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState === 'idle' || gameState === 'gameover') {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          resetGame();
          setGameState('playing');
        }
        return;
      }

      if (gameState === 'playing') {
        switch (e.key) {
          case 'ArrowUp':
          case 'w':
          case 'W':
            e.preventDefault();
            if (directionRef.current.y !== 1) {
              nextDirectionRef.current = { x: 0, y: -1 };
            }
            break;
          case 'ArrowDown':
          case 's':
          case 'S':
            e.preventDefault();
            if (directionRef.current.y !== -1) {
              nextDirectionRef.current = { x: 0, y: 1 };
            }
            break;
          case 'ArrowLeft':
          case 'a':
          case 'A':
            e.preventDefault();
            if (directionRef.current.x !== 1) {
              nextDirectionRef.current = { x: -1, y: 0 };
            }
            break;
          case 'ArrowRight':
          case 'd':
          case 'D':
            e.preventDefault();
            if (directionRef.current.x !== -1) {
              nextDirectionRef.current = { x: 1, y: 0 };
            }
            break;
          case 'p':
          case 'P':
          case 'Escape':
            e.preventDefault();
            setGameState('paused');
            break;
        }
      } else if (gameState === 'paused') {
        if (e.key === 'p' || e.key === 'P' || e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setGameState('playing');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, resetGame]);

  return (
    <div className="terminal-window">
      <div className="terminal-header">
        <div className="terminal-buttons">
          <span className="terminal-btn close"></span>
          <span className="terminal-btn minimize"></span>
          <span className="terminal-btn maximize"></span>
        </div>
        <div className="terminal-title">snake — 80×24</div>
        <div className="terminal-spacer"></div>
      </div>
      <div className="terminal-body">
        <div className="terminal-prompt">
          <span className="prompt-user">user@oranglib</span>
          <span className="prompt-separator">:</span>
          <span className="prompt-path">~</span>
          <span className="prompt-symbol">$</span>
          <span className="prompt-command"> ./snake</span>
        </div>
        <div className="game-container">
          <div className="game-stats">
            <span className="stat">Score: {score}</span>
            <span className="stat">High Score: {highScore}</span>
          </div>
          <canvas
            ref={canvasRef}
            width={GRID_SIZE * CELL_SIZE}
            height={GRID_SIZE * CELL_SIZE}
            className="game-canvas"
          />
          {gameState === 'idle' && (
            <div className="game-overlay">
              <div className="overlay-text">
                <span className="blink">█</span> Press ENTER or SPACE to start
              </div>
              <div className="overlay-controls">
                Use WASD or Arrow keys to move
              </div>
            </div>
          )}
          {gameState === 'paused' && (
            <div className="game-overlay">
              <div className="overlay-text">
                <span className="pause-text">PAUSED</span>
              </div>
              <div className="overlay-controls">
                Press P, ESC, ENTER or SPACE to continue
              </div>
            </div>
          )}
          {gameState === 'gameover' && (
            <div className="game-overlay gameover">
              <div className="overlay-text">
                <span className="gameover-text">GAME OVER</span>
              </div>
              <div className="final-score">Final Score: {score}</div>
              <div className="overlay-controls">
                Press ENTER or SPACE to restart
              </div>
            </div>
          )}
        </div>
        <div className="terminal-prompt bottom-prompt">
          <span className="prompt-user">user@oranglib</span>
          <span className="prompt-separator">:</span>
          <span className="prompt-path">~</span>
          <span className="prompt-symbol">$</span>
          <span className="cursor blink">█</span>
        </div>
      </div>
    </div>
  );
};

const NotFoundPage = () => {
  return (
    <div className="not-found-page">
      <BinaryBackground />
      <div className="not-found-content">
        <div className="error-header">
          <h1 className="error-code">404</h1>
          <p className="error-description">
            The page you're looking for doesn't exist. But hey, why not play some snake while you're here?
          </p>
        </div>
        
        <SnakeGame />
        
        <div className="not-found-actions">
          <Link to="/" className="back-home-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            Back to Home
          </Link>
          <Link to="/browse" className="browse-btn">
            Browse Modpacks
          </Link>
        </div>
      </div>
    </div>
  );
};
export default NotFoundPage;