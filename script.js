// Stream URL configuration
// AzuraCast direct MP3 stream URL (found in AzuraCast player audio tag)
const STREAM_URL = 'http://radio-fm-azuracast-5cca97-38-242-235-54.traefik.me:8000/radio.mp3';

// DOM Elements
const audioPlayer = document.getElementById('audioPlayer');
const playPauseBtn = document.getElementById('playPauseBtn');
const volumeSlider = document.getElementById('volumeSlider');
const volumeValue = document.getElementById('volumeValue');
const statusIndicator = document.getElementById('statusIndicator');
const statusText = document.getElementById('statusText');
const playerCard = document.querySelector('.player-card');

// State
let isPlaying = false;
let isLoading = false;
let hasError = false;

// Initialize audio player
function initAudioPlayer() {
    console.log('Setting up audio player with stream:', STREAM_URL);
    console.log('Current page protocol:', window.location.protocol);
    console.log('Stream URL protocol:', new URL(STREAM_URL).protocol);
    
    // Check for mixed content issue (HTTPS page trying to load HTTP stream)
    if (window.location.protocol === 'https:' && STREAM_URL.startsWith('http:')) {
        console.warn('⚠️ Mixed Content Warning: HTTPS page trying to load HTTP stream');
        console.warn('This may be blocked by browser security policies');
    }
    
    audioPlayer.src = STREAM_URL;
    audioPlayer.volume = volumeSlider.value / 100;
    audioPlayer.crossOrigin = 'anonymous'; // Allow CORS
    audioPlayer.preload = 'none'; // Don't preload, wait for user interaction
    
    // Set up event listeners with detailed logging
    audioPlayer.addEventListener('loadstart', () => {
        console.log('📡 loadstart: Stream loading started');
        handleLoadStart();
    });
    
    audioPlayer.addEventListener('progress', () => {
        console.log('📊 progress: Buffering...', audioPlayer.buffered.length > 0 ? audioPlayer.buffered.end(0) : 0);
    });
    
    audioPlayer.addEventListener('canplay', () => {
        console.log('✅ canplay: Stream ready to play');
        handleCanPlay();
    });
    
    audioPlayer.addEventListener('canplaythrough', () => {
        console.log('✅ canplaythrough: Stream can play through without buffering');
    });
    
    audioPlayer.addEventListener('waiting', () => {
        console.log('⏳ waiting: Waiting for data...');
        handleWaiting();
    });
    
    audioPlayer.addEventListener('playing', () => {
        console.log('▶️ playing: Stream is now playing');
        handlePlaying();
    });
    
    audioPlayer.addEventListener('play', () => {
        console.log('▶️ play event fired');
        handlePlay();
    });
    
    audioPlayer.addEventListener('pause', () => {
        console.log('⏸️ pause event fired');
        handlePause();
    });
    
    audioPlayer.addEventListener('ended', () => {
        console.log('⏹️ ended: Stream ended');
        handleEnded();
    });
    
    audioPlayer.addEventListener('error', (e) => {
        console.error('❌ error event fired:', e);
        console.error('Audio error code:', audioPlayer.error?.code);
        console.error('Audio error message:', audioPlayer.error?.message);
        handleError(e);
    });
    
    audioPlayer.addEventListener('stalled', () => {
        console.warn('⚠️ stalled: Stream stalled');
    });
    
    audioPlayer.addEventListener('suspend', () => {
        console.warn('⚠️ suspend: Stream suspended');
    });
    
    // Button click handler
    playPauseBtn.addEventListener('click', togglePlayPause);
    console.log('✅ Play/Pause button event listener attached');
    
    // Volume slider handler
    volumeSlider.addEventListener('input', handleVolumeChange);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyPress);
    
    // Update volume display
    updateVolumeDisplay();
    
    console.log('✅ Audio player setup complete');
    console.log('Audio element:', audioPlayer);
    console.log('Audio src:', audioPlayer.src);
}

// Toggle play/pause
function togglePlayPause() {
    console.log('Play/Pause button clicked');
    
    if (hasError) {
        // Retry on error
        console.log('Retrying after error...');
        hasError = false;
        if (playerCard) {
            playerCard.classList.remove('error');
            const errorMsg = document.querySelector('.error-message');
            if (errorMsg) errorMsg.remove();
        }
        audioPlayer.src = STREAM_URL;
        audioPlayer.load();
    }
    
    if (isPlaying) {
        pauseAudio();
    } else {
        playAudio();
    }
}

// Play audio
function playAudio() {
    console.log('🎵 Attempting to play audio...');
    console.log('Current src:', audioPlayer.src);
    console.log('Network state:', audioPlayer.networkState);
    console.log('Ready state:', audioPlayer.readyState);
    console.log('Current time:', audioPlayer.currentTime);
    console.log('Duration:', audioPlayer.duration);
    
    isLoading = true;
    updateLoadingState();
    
    // Set src again to ensure it's correct
    if (audioPlayer.src !== STREAM_URL) {
        console.log('Updating src to:', STREAM_URL);
        audioPlayer.src = STREAM_URL;
    }
    
    // Try to load the stream first
    console.log('Loading stream...');
    audioPlayer.load();
    
    // Wait a bit for loadstart event
    setTimeout(() => {
        console.log('Attempting play()...');
        const playPromise = audioPlayer.play();
        
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    console.log('✅ Audio playback started successfully');
                    isPlaying = true;
                    isLoading = false;
                    updatePlayState();
                })
                .catch(error => {
                    console.error('❌ Error playing audio:', error);
                    console.error('Error name:', error.name);
                    console.error('Error message:', error.message);
                    handleError(error);
                });
        } else {
            console.warn('⚠️ play() returned undefined');
        }
    }, 100);
}

// Pause audio
function pauseAudio() {
    audioPlayer.pause();
    isPlaying = false;
    updatePauseState();
}

// Handle play event
function handlePlay() {
    isPlaying = true;
    isLoading = false;
    updatePlayState();
}

// Handle pause event
function handlePause() {
    isPlaying = false;
    updatePauseState();
}

// Handle ended event
function handleEnded() {
    isPlaying = false;
    updatePauseState();
}

// Handle error
function handleError(error) {
    console.error('Audio error:', error);
    console.error('Error details:', {
        code: audioPlayer.error?.code,
        message: audioPlayer.error?.message,
        networkState: audioPlayer.networkState,
        readyState: audioPlayer.readyState,
        currentSrc: audioPlayer.src
    });
    
    showError();
}

function showError() {
    isPlaying = false;
    isLoading = false;
    hasError = true;
    
    if (playerCard) playerCard.classList.add('error');
    if (statusIndicator) statusIndicator.classList.remove('playing');
    if (statusText) statusText.textContent = 'Eroare de conexiune';
    
    // Show error message if not already present
    if (!document.querySelector('.error-message')) {
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        errorMsg.textContent = 'Nu s-a putut conecta la stream. Verifică că stream-ul este activ în AzuraCast.';
        if (playerCard) playerCard.appendChild(errorMsg);
    }
    
    // Update button state
    const playIcon = playPauseBtn?.querySelector('.play-icon');
    const pauseIcon = playPauseBtn?.querySelector('.pause-icon');
    if (playIcon) playIcon.style.display = 'block';
    if (pauseIcon) pauseIcon.style.display = 'none';
}

// Handle load start
function handleLoadStart() {
    isLoading = true;
    updateLoadingState();
}

// Handle can play
function handleCanPlay() {
    isLoading = false;
    if (isPlaying) {
        updatePlayState();
    }
}

// Handle waiting (buffering)
function handleWaiting() {
    isLoading = true;
    statusText.textContent = 'Se încarcă...';
}

// Handle playing (buffering complete)
function handlePlaying() {
    isLoading = false;
    if (isPlaying) {
        updatePlayState();
    }
}

// Update play state UI
function updatePlayState() {
    statusIndicator.classList.add('playing');
    statusText.textContent = 'Live';
    
    const playIcon = playPauseBtn.querySelector('.play-icon');
    const pauseIcon = playPauseBtn.querySelector('.pause-icon');
    if (playIcon) playIcon.style.display = 'none';
    if (pauseIcon) pauseIcon.style.display = 'block';
    
    // Remove error message if present
    const errorMsg = document.querySelector('.error-message');
    if (errorMsg) {
        errorMsg.remove();
    }
}

// Update pause state UI
function updatePauseState() {
    statusIndicator.classList.remove('playing');
    statusText.textContent = 'Pauză';
    
    const playIcon = playPauseBtn.querySelector('.play-icon');
    const pauseIcon = playPauseBtn.querySelector('.pause-icon');
    if (playIcon) playIcon.style.display = 'block';
    if (pauseIcon) pauseIcon.style.display = 'none';
}

// Update loading state UI
function updateLoadingState() {
    if (isLoading) {
        playerCard.classList.add('loading');
        statusText.textContent = 'Se conectează...';
    } else {
        playerCard.classList.remove('loading');
    }
}

// Handle volume change
function handleVolumeChange(e) {
    const volume = e.target.value / 100;
    audioPlayer.volume = volume;
    updateVolumeDisplay();
}

// Update volume display
function updateVolumeDisplay() {
    volumeValue.textContent = `${volumeSlider.value}%`;
}

// Handle keyboard shortcuts
function handleKeyPress(e) {
    // Spacebar to play/pause
    if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        togglePlayPause();
    }
    
    // Arrow up/down for volume
    if (e.code === 'ArrowUp' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        const newVolume = Math.min(100, parseInt(volumeSlider.value) + 5);
        volumeSlider.value = newVolume;
        handleVolumeChange({ target: volumeSlider });
    }
    
    if (e.code === 'ArrowDown' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        const newVolume = Math.max(0, parseInt(volumeSlider.value) - 5);
        volumeSlider.value = newVolume;
        handleVolumeChange({ target: volumeSlider });
    }
}

// Initialize when DOM is ready
function initializeApp() {
    console.log('Initializing Ecou FM player...');
    
    // Check if all required elements exist
    if (!audioPlayer) {
        console.error('Audio player element not found!');
        return;
    }
    if (!playPauseBtn) {
        console.error('Play/Pause button not found!');
        return;
    }
    if (!volumeSlider) {
        console.error('Volume slider not found!');
        return;
    }
    
    console.log('All elements found, initializing player...');
    initAudioPlayer();
    console.log('Player initialized successfully');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Handle page visibility change (pause when tab is hidden to save resources)
document.addEventListener('visibilitychange', () => {
    if (document.hidden && isPlaying) {
        // Optionally pause when tab is hidden
        // pauseAudio();
    }
});

// Handle online/offline events
window.addEventListener('online', () => {
    if (hasError) {
        // Retry connection when back online
        hasError = false;
        playerCard.classList.remove('error');
        const errorMsg = document.querySelector('.error-message');
        if (errorMsg) {
            errorMsg.remove();
        }
        if (!isPlaying) {
            audioPlayer.src = STREAM_URL;
            audioPlayer.load();
        }
    }
});

window.addEventListener('offline', () => {
    if (isPlaying) {
        handleError(new Error('No internet connection'));
    }
});

