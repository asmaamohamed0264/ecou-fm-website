// Stream URL configuration
const STREAM_URL = 'http://radio-fm-azuracast-5cca97-38-242-235-54.traefik.me/public/ecou_fm';

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
    audioPlayer.src = STREAM_URL;
    audioPlayer.volume = volumeSlider.value / 100;
    
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
    
    // Volume slider handler
    volumeSlider.addEventListener('input', handleVolumeChange);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyPress);
    
    // Update volume display
    updateVolumeDisplay();
}

// Toggle play/pause
function togglePlayPause() {
    if (hasError) {
        // Retry on error
        hasError = false;
        playerCard.classList.remove('error');
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
    isLoading = true;
    updateLoadingState();
    
    const playPromise = audioPlayer.play();
    
    if (playPromise !== undefined) {
        playPromise
            .then(() => {
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
    isPlaying = false;
    isLoading = false;
    hasError = true;
    
    playerCard.classList.add('error');
    statusIndicator.classList.remove('playing');
    statusText.textContent = 'Eroare de conexiune';
    
    // Show error message if not already present
    if (!document.querySelector('.error-message')) {
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        errorMsg.textContent = 'Nu s-a putut conecta la stream. Te rugăm să încerci din nou.';
        playerCard.appendChild(errorMsg);
    }
    
    // Update button state
    const playIcon = playPauseBtn.querySelector('.play-icon');
    const pauseIcon = playPauseBtn.querySelector('.pause-icon');
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
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAudioPlayer);
} else {
    initAudioPlayer();
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

