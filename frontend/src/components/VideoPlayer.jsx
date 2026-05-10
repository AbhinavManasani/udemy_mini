import { useRef, useCallback } from 'react';
import ReactPlayer from 'react-player';

export default function VideoPlayer({ url, onProgress, onEnded, initialPosition = 0 }) {
  const playerRef = useRef(null);
  const seekedRef = useRef(false);

  const handleReady = useCallback(() => {
    if (!seekedRef.current && initialPosition > 0 && playerRef.current) {
      playerRef.current.seekTo(initialPosition, 'seconds');
      seekedRef.current = true;
    }
  }, [initialPosition]);

  const handleProgress = useCallback((state) => {
    if (onProgress) onProgress(Math.floor(state.playedSeconds));
  }, [onProgress]);

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
      <ReactPlayer
        ref={playerRef}
        url={url || 'https://www.w3schools.com/html/mov_bbb.mp4'}
        width="100%"
        height="100%"
        controls
        playing={false}
        onReady={handleReady}
        onProgress={handleProgress}
        onEnded={onEnded}
        progressInterval={5000}
        config={{ file: { attributes: { controlsList: 'nodownload' } } }}
      />
    </div>
  );
}
