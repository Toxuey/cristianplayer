import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Sidebar (solo en desktop)
function Sidebar({ songs, onSelect, currentIndex }) {
  return (
    <div className="hidden md:flex md:flex-col w-64 bg-gray-950 p-4 border-r border-gray-800">
      <h1 className="text-2xl font-bold mb-6">🎶 Cristian Player</h1>
      <ul className="space-y-2">
        {songs.map((song, i) => (
          <li
            key={i}
            onClick={() => onSelect(i)}
            className={`cursor-pointer p-2 rounded hover:bg-gray-800 ${
              i === currentIndex ? "bg-gray-700" : ""
            }`}
          >
            {song.replace(".mp3", "")}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Lista de canciones (solo en móvil)
function SongListMobile({ songs, onSelect }) {
  return (
    <div className="flex flex-col h-full p-4">
      <h1 className="text-xl font-bold mb-4">🎶 Cristian Player</h1>
      <ul className="space-y-2 flex-1 overflow-y-auto">
        {songs.map((song, i) => (
          <li
            key={i}
            onClick={() => onSelect(i)}
            className="cursor-pointer p-2 rounded bg-gray-800 hover:bg-gray-700"
          >
            {song.replace(".mp3", "")}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Pantalla "Now Playing"
function NowPlaying({ currentSong, onBack }) {
  if (!currentSong) {
    return <p className="text-gray-500">Selecciona una canción 🎧</p>;
  }
  return (
    <div className="flex flex-col items-center justify-center text-center p-6">
      {onBack && (
        <button
          onClick={onBack}
          className="md:hidden mb-4 px-4 py-2 bg-gray-800 rounded"
        >
          ⬅️ Volver
        </button>
      )}
      <h2 className="text-2xl md:text-3xl font-bold mb-2">
        {currentSong.replace(".mp3", "")}
      </h2>
      <p className="text-gray-400">Reproduciendo ahora</p>
    </div>
  );
}

// Formatea segundos → mm:ss
function formatTime(time) {
  if (isNaN(time)) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}

// Barra de progreso
function ProgressBar({ progress, duration, onSeek }) {
  return (
    <div className="flex items-center w-full max-w-2xl space-x-2 px-4 mb-2">
      <span className="text-xs text-gray-400">{formatTime(progress)}</span>
      <input
        type="range"
        min="0"
        max={duration || 0}
        value={progress}
        onChange={(e) => onSeek(Number(e.target.value))}
        className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
      />
      <span className="text-xs text-gray-400">{formatTime(duration)}</span>
    </div>
  );
}

// Control de volumen
function VolumeControl({ volume, onChange }) {
  return (
    <div className="flex items-center space-x-2 w-full max-w-xs px-4">
      <span>🔊</span>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
      />
    </div>
  );
}

// Controles con animaciones
function Controls({
  isPlaying,
  onPlayPause,
  onNext,
  onPrev,
  progress,
  duration,
  onSeek,
  volume,
  onVolumeChange,
}) {
  return (
    <div className="bg-gray-950 p-4 border-t border-gray-800 flex flex-col items-center space-y-4">
      <ProgressBar progress={progress} duration={duration} onSeek={onSeek} />

      <div className="flex items-center justify-center space-x-8">
        <motion.button
          whileTap={{ scale: 0.85 }}
          whileHover={{ scale: 1.2 }}
          onClick={onPrev}
          className="md:hover:text-green-400 active:text-green-400 focus:outline-none"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "50px" }}
          >
            skip_previous
          </span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.85 }}
          whileHover={{ scale: 1.2 }}
          onClick={onPlayPause}
          className="md:hover:text-green-400 active:text-green-400 focus:outline-none"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "70px" }}
          >
            {isPlaying ? "pause_circle" : "play_circle"}
          </span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.85 }}
          whileHover={{ scale: 1.2 }}
          onClick={onNext}
          className="md:hover:text-green-400 active:text-green-400 focus:outline-none"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "50px" }}
          >
            skip_next
          </span>
        </motion.button>
      </div>

      <VolumeControl volume={volume} onChange={onVolumeChange} />
    </div>
  );
}

// Layout principal
export default function App() {
  const [songs] = useState([
    "Alan Walker - Faded.mp3",
    "LP - Lost On You.mp3",
    "Vance Joy - Riptide.mp3",
  ]);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [showNowPlaying, setShowNowPlaying] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  const audioRef = useRef(null);

  const handleSelect = (index) => {
    setCurrentIndex(index);
    setShowNowPlaying(true);
    setIsPlaying(true);
    audioRef.current.src = songs[index]; // en prod será el endpoint real
    audioRef.current.play();
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const playNext = () => {
    if (songs.length === 0) return;
    const nextIndex = (currentIndex + 1) % songs.length;
    handleSelect(nextIndex);
  };

  const playPrev = () => {
    if (songs.length === 0) return;
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    handleSelect(prevIndex);
  };

  const handleSeek = (value) => {
    audioRef.current.currentTime = value;
    setProgress(value);
  };

  const handleVolumeChange = (value) => {
    audioRef.current.volume = value;
    setVolume(value);
  };

  return (
    <div className="h-dvh w-screen bg-gradient-to-b from-gray-900 to-black text-white flex">
      <Sidebar
        songs={songs}
        onSelect={handleSelect}
        currentIndex={currentIndex}
      />

      <div className="flex-1 flex flex-col h-dvh">
        {/* Zona superior: lista o Now Playing */}
        <div className="flex-1 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {/* SOLO en móvil */}
            <div className="w-full h-full md:hidden">
              {!showNowPlaying ? (
                <motion.div
                  key="list"
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute w-full h-full overflow-y-auto"
                >
                  <SongListMobile songs={songs} onSelect={handleSelect} />
                </motion.div>
              ) : (
                <motion.div
                  key="nowplaying"
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute w-full h-full flex items-center justify-center"
                >
                  <NowPlaying
                    currentSong={songs[currentIndex]}
                    onBack={() => setShowNowPlaying(false)}
                  />
                </motion.div>
              )}
            </div>

            {/* SOLO en desktop */}
            <div className="hidden md:flex w-full h-full items-center justify-center">
              <NowPlaying currentSong={songs[currentIndex]} />
            </div>
          </AnimatePresence>
        </div>

        {/* Zona fija inferior: controles */}
        <div className="shrink-0">
          <Controls
            isPlaying={isPlaying}
            onPlayPause={togglePlay}
            onNext={playNext}
            onPrev={playPrev}
            progress={progress}
            duration={duration}
            onSeek={handleSeek}
            volume={volume}
            onVolumeChange={handleVolumeChange}
          />
        </div>

        <audio
          ref={audioRef}
          onTimeUpdate={() => setProgress(audioRef.current.currentTime)}
          onLoadedMetadata={() => setDuration(audioRef.current.duration)}
          onEnded={playNext}
          className="hidden"
        />
      </div>
    </div>
  );
}
