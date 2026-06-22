// ==================== CALMÉA - APPLICATION ====================

const tracks = [
    { id: 1, title: "Douce pluie nocturne", category: "sommeil", emoji: "🌧️", duration: "3:24", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
    { id: 2, title: "Vagues apaisantes", category: "sommeil", emoji: "🌊", duration: "4:12", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
    { id: 3, title: "Méditation intérieure", category: "meditation", emoji: "🧘", duration: "5:30", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
    { id: 4, title: "Respiration consciente", category: "meditation", emoji: "🫁", duration: "4:45", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
    { id: 5, title: "Focus profond", category: "focus", emoji: "🎯", duration: "3:50", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3" },
    { id: 6, title: "Concentration alpha", category: "focus", emoji: "🧠", duration: "4:05", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3" },
    { id: 7, title: "Évasion anti-stress", category: "stress", emoji: "💆", duration: "5:15", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3" },
    { id: 8, title: "Sérénité absolue", category: "stress", emoji: "🕊️", duration: "4:30", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" }
];

let currentTrackIndex = -1;
let isPlaying = false;
let audio = null;
let sleepTimer = null;
let currentCategory = 'all';

function createParticles() {
    const container = document.getElementById('particles');
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        const size = Math.random() * 3 + 1;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 8 + 's';
        particle.style.animationDuration = Math.random() * 6 + 6 + 's';
        container.appendChild(particle);
    }
}

function setGreeting() {
    const hour = new Date().getHours();
    const g = document.getElementById('greetingMessage');
    if (hour >= 5 && hour < 12) g.textContent = 'Bonjour ☀️';
    else if (hour >= 12 && hour < 18) g.textContent = 'Bon après-midi 🌿';
    else if (hour >= 18 && hour < 22) g.textContent = 'Bonsoir 🌅';
    else g.textContent = 'Bonne nuit 🌙';
}

function renderTracks(filterCategory = 'all') {
    const container = document.getElementById('tracksContainer');
    container.innerHTML = '';
    const filteredTracks = filterCategory === 'all' ? tracks : tracks.filter(t => t.category === filterCategory);
    if (filteredTracks.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--gris-medium)"><p style="font-size:2rem">🎶</p><p style="margin-top:12px">Aucune piste dans cette catégorie</p></div>';
        return;
    }
    filteredTracks.forEach(track => {
        const realIndex = tracks.findIndex(t => t.id === track.id);
        const isPlayingThis = realIndex === currentTrackIndex && isPlaying;
        const card = document.createElement('div');
        card.className = 'track-card' + (isPlayingThis ? ' playing' : '');
        card.innerHTML = `
            <span class="track-emoji">${track.emoji}</span>
            <div class="track-info">
                <div class="track-title">${track.title}</div>
                <div class="track-category">${track.category}</div>
            </div>
            <span class="track-duration">${track.duration}</span>
            <div class="track-playing-indicator"><span class="bar"></span><span class="bar"></span><span class="bar"></span></div>
        `;
        card.addEventListener('click', () => playTrack(realIndex));
        container.appendChild(card);
    });
}

function playTrack(index) {
    if (index < 0 || index >= tracks.length) return;
    currentTrackIndex = index;
    const track = tracks[index];
    if (audio) { audio.pause(); audio = null; }
    audio = new Audio(track.src);
    audio.volume = document.getElementById('volumeSlider').value;
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', () => nextTrack());
    audio.play().then(() => {
        isPlaying = true;
        document.getElementById('playBtn').querySelector('span').textContent = '⏸️';
        document.getElementById('currentTrack').textContent = track.title;
        document.getElementById('currentCategory').textContent = track.category;
        document.getElementById('playerEmoji').textContent = track.emoji;
        renderTracks(currentCategory);
        updateProgress();
    }).catch(err => console.error('Erreur lecture:', err));
}

function togglePlay() {
    if (currentTrackIndex === -1) { playTrack(0); return; }
    if (!audio) { playTrack(currentTrackIndex); return; }
    if (isPlaying) { audio.pause(); document.getElementById('playBtn').querySelector('span').textContent = '▶️'; }
    else { audio.play(); document.getElementById('playBtn').querySelector('span').textContent = '⏸️'; }
    isPlaying = !isPlaying;
    renderTracks(currentCategory);
}

function nextTrack() {
    let next = currentTrackIndex + 1;
    if (next >= tracks.length) next = 0;
    playTrack(next);
}

function prevTrack() {
    let prev = currentTrackIndex - 1;
    if (prev < 0) prev = tracks.length - 1;
    playTrack(prev);
}

function updateProgress() {
    if (!audio || !audio.duration) {
        document.getElementById('progressFill').style.width = '0%';
        document.getElementById('timerDisplay').textContent = '00:00';
        return;
    }
    document.getElementById('progressFill').style.width = (audio.currentTime / audio.duration) * 100 + '%';
    const m = Math.floor(audio.currentTime / 60);
    const s = Math.floor(audio.currentTime % 60);
    document.getElementById('timerDisplay').textContent = m.toString().padStart(2,'0') + ':' + s.toString().padStart(2,'0');
}

function setSleepTimer(minutes) {
    if (sleepTimer) clearTimeout(sleepTimer);
    const timerActive = document.getElementById('timerActive');
    const timerLabel = document.getElementById('timerLabel');
    if (minutes > 0) {
        sleepTimer = setTimeout(() => {
            if (audio && isPlaying) { audio.pause(); isPlaying = false; renderTracks(currentCategory); document.getElementById('playBtn').querySelector('span').textContent = '▶️'; }
            timerActive.style.display = 'none';
            timerLabel.textContent = 'Minuteur';
        }, minutes * 60000);
        timerActive.style.display = 'inline';
        timerActive.textContent = '⏱️ ' + minutes + ' min';
        timerLabel.textContent = minutes + ' min';
    } else {
        timerActive.style.display = 'none';
        timerLabel.textContent = 'Minuteur';
    }
    document.getElementById('timerOptions').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('playBtn').addEventListener('click', togglePlay);
    document.getElementById('nextBtn').addEventListener('click', nextTrack);
    document.getElementById('prevBtn').addEventListener('click', prevTrack);
    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            currentCategory = e.currentTarget.dataset.category;
            renderTracks(currentCategory);
        });
    });
    document.getElementById('volumeSlider').addEventListener('input', (e) => { if (audio) audio.volume = e.target.value; });
    document.getElementById('progressBar').addEventListener('click', (e) => {
        if (!audio || !audio.duration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
        updateProgress();
    });
    document.getElementById('timerBtn').addEventListener('click', (e) => {
        e.stopPropagation();
        const opts = document.getElementById('timerOptions');
        opts.style.display = opts.style.display === 'none' ? 'flex' : 'none';
    });
    document.querySelectorAll('.timer-option').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            setSleepTimer(parseInt(btn.dataset.minutes));
        });
    });
    document.addEventListener('click', () => { document.getElementById('timerOptions').style.display = 'none'; });
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
        if (e.code === 'ArrowRight') { e.preventDefault(); nextTrack(); }
        if (e.code === 'ArrowLeft') { e.preventDefault(); prevTrack(); }
    });
    createParticles();
    setGreeting();
    renderTracks();
    console.log('🌙 Calméa - Respire. Écoute. Vis.');
});
