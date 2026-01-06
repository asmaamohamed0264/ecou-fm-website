// Stream URL configuration
// AzuraCast public stream endpoint - try different formats
const STREAM_BASE = 'http://radio-fm-azuracast-5cca97-38-242-235-54.traefik.me';
// AzuraCast public streams can be accessed via:
// 1. /public/station_name (auto-detects format)
// 2. /public/station_name.mp3 (MP3 stream)
// 3. /radio/station_name (direct radio endpoint)
const STREAM_URLS = [
    `${STREAM_BASE}/public/ecou_fm`, // Default public endpoint
    `${STREAM_BASE}/public/ecou_fm.mp3`, // MP3 format
    `${STREAM_BASE}/radio/ecou_fm`, // Direct radio endpoint
    `${STREAM_BASE}/public/ecou_fm/stream` // Stream endpoint
];
let currentStreamIndex = 0;
const STREAM_URL = STREAM_URLS[0];

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
    
    audioPlayer.src = STREAM_URL;
    audioPlayer.volume = volumeSlider.value / 100;
    audioPlayer.crossOrigin = 'anonymous'; // Allow CORS
    
    // Set up event listeners
    audioPlayer.addEventListener('play', handlePlay);
    audioPlayer.addEventListener('pause', handlePause);
    audioPlayer.addEventListener('ended', handleEnded);
    audioPlayer.addEventListener('error', handleError);
    audioPlayer.addEventListener('loadstart', handleLoadStart);
    audioPlayer.addEventListener('canplay', handleCanPlay);
    audioPlayer.addEventListener('waiting', handleWaiting);
    audioPlayer.addEventListener('playing', handlePlaying);
    
    // Button click handler
    playPauseBtn.addEventListener('click', togglePlayPause);
    console.log('Play/Pause button event listener attached');
    
    // Volume slider handler
    volumeSlider.addEventListener('input', handleVolumeChange);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyPress);
    
    // Update volume display
    updateVolumeDisplay();
    
    console.log('Audio player setup complete');
}

// Toggle play/pause
function togglePlayPause() {
    console.log('Play/Pause button clicked');
    
    if (hasError) {
        // Retry on error
        console.log('Retrying after error...');
        hasError = false;
        if (playerCard) playerCard.classList.remove('error');
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
    console.log('Attempting to play audio from:', audioPlayer.src);
    isLoading = true;
    updateLoadingState();
    
    // Try to load the stream first
    audioPlayer.load();
    
    const playPromise = audioPlayer.play();
    
    if (playPromise !== undefined) {
        playPromise
            .then(() => {
                console.log('Audio playback started successfully');
                isPlaying = true;
                isLoading = false;
                updatePlayState();
            })
            .catch(error => {
                console.error('Error playing audio:', error);
                handleError(error);
            });
    }
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
    
    // Try next stream URL if available
    currentStreamIndex++;
    if (currentStreamIndex < STREAM_URLS.length) {
        console.log(`Trying stream URL ${currentStreamIndex + 1}/${STREAM_URLS.length}:`, STREAM_URLS[currentStreamIndex]);
        audioPlayer.src = STREAM_URLS[currentStreamIndex];
        audioPlayer.load();
        // Try to play again after a short delay
        setTimeout(() => {
            audioPlayer.play().catch(err => {
                console.error('Failed to play with new URL:', err);
                if (currentStreamIndex >= STREAM_URLS.length - 1) {
                    showError();
                }
            });
        }, 500);
        return;
    }
    
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

