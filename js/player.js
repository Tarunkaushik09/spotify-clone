"use strict";

// Spotify Player Engine
const playBtn = document.getElementById("playBtn");
const playerCover = document.getElementById("playerCover");
const playerTitle = document.getElementById("playerTitle");
const playerArtist = document.getElementById("playerArtist");
const equalizer = document.getElementById("equalizer");
const toast = document.getElementById("toast");

let currentSong = null;
let isPlaying = false;

// Song Select
document.addEventListener("click", (event) => {
  const songItem = event.target.closest(".song-item");
  if (!songItem) return;

  const albumCard = document.querySelector(".album-card.active");
  if (!albumCard) return;

  const albumIndex = Number(albumCard.dataset.index);
  const songIndex = Number(songItem.dataset.song);
  const album = albumsData[albumIndex];

  if (!album) return;
  const selectedSong = album.songs[songIndex];

  // Same song clicked
  if (currentSong && currentSong.src === selectedSong.src) {
    if (audio.paused) {
      resumeSong();
    } else {
      pauseSong();
    }
    return;
  }
  // New song selected
  currentSong = selectedSong;
  currentAlbumIndex = albumIndex;
  currentSongIndex = songIndex;

  playSong(album, currentSong);
  updateSongSelection();
});

// Update Player
function updatePlayer(album, song) {
  playerCover.src = album.image;
  playerTitle.textContent = song.title;
  playerArtist.textContent = song.artist;
  isPlaying = true;
  playBtn.innerHTML = `<i class="fa-solid fa-pause"></i>`;
}

// Play Pause
playBtn.addEventListener("click", () => {
  if (!currentSong) return;

  if (audio.paused) {
    resumeSong();
  } else {
    pauseSong();
  }
});

// Audio Engine
const audio = new Audio();

function playSong(album, song) {
  // Stop previous song
  audio.pause();
  audio.currentTime = 0;

  if (!song.src) {
    console.warn("Song source missing.");
    return;
  }

  audio.src = song.src;
  audio.play().catch(() => {});

  equalizer?.classList.add("active");
  isPlaying = true;

  updatePlayer(album, song);
  addToRecentlyPlayed(album, song);

  // Update Album Card Icon
  document.querySelectorAll(".album-play i").forEach((icon) => {
    icon.className = "fa-solid fa-play";
  });

  const activeAlbum = document.querySelector(".album-card.active");

  if (activeAlbum) {
    activeAlbum.querySelector(".album-play i").className = "fa-solid fa-pause";
  }
}

function pauseSong() {
  audio.pause();
  isPlaying = false;
  equalizer?.classList.remove("active");
  const cover = document.querySelector(".player-left img");

  if (cover) {
    cover.classList.remove("playing");
  }

  playBtn.innerHTML = `<i class="fa-solid fa-play"></i>`;

  const activeAlbum = document.querySelector(".album-card.active");

  if (activeAlbum) {
    activeAlbum.querySelector(".album-play i").className = "fa-solid fa-play";
  }
}

function resumeSong() {
  audio.play();
  isPlaying = true;
  equalizer?.classList.add("active");

  const cover = document.querySelector(".player-left img");
  if (cover) {
    cover.classList.add("playing");
  }

  playBtn.innerHTML = `<i class="fa-solid fa-pause"></i>`;

  const activeAlbum = document.querySelector(".album-card.active");

  if (activeAlbum) {
    activeAlbum.querySelector(".album-play i").className = "fa-solid fa-pause";
  }
}

// Progress Engine
const progressBar = document.getElementById("progressBar");
const progressFill = document.getElementById("progressFill");
const currentTime = document.getElementById("currentTime");
const duration = document.getElementById("duration");

// Time Format
function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";

  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
}

// Metadata Loaded
audio.addEventListener("loadedmetadata", () => {
  duration.textContent = formatTime(audio.duration);
});

// Progress Update
audio.addEventListener("timeupdate", () => {
  if (!audio.duration) return;

  const percent = (audio.currentTime / audio.duration) * 100;
  progressFill.style.width = percent + "%";
  currentTime.textContent = formatTime(audio.currentTime);
  duration.textContent = formatTime(audio.duration);
});

// Seek Engine
if (progressBar) {
  progressBar.addEventListener("click", (event) => {
    if (!audio.duration) return;

    const rect = progressBar.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percent = clickX / rect.width;

    audio.currentTime = percent * audio.duration;
  });
}

// Drag Progress Engine
let isSeeking = false;

function seekAudio(clientX) {
  if (!audio.duration) return;
  const rect = progressBar.getBoundingClientRect();

  let position = clientX - rect.left;
  position = Math.max(0, Math.min(position, rect.width));

  const percent = position / rect.width;
  progressFill.style.width = `${percent * 100}%`;
  audio.currentTime = percent * audio.duration;
}

// Mouse
progressBar.addEventListener("mousedown", (event) => {
  isSeeking = true;
  seekAudio(event.clientX);
});

document.addEventListener("mousemove", (event) => {
  if (!isSeeking) return;
  seekAudio(event.clientX);
});

document.addEventListener("mouseup", () => {
  isSeeking = false;
});

// Touch
progressBar.addEventListener(
  "touchstart",
  (event) => {
    isSeeking = true;
    seekAudio(event.touches[0].clientX);
  },
  { passive: true },
);

document.addEventListener(
  "touchmove",
  (event) => {
    if (!isSeeking) return;
    seekAudio(event.touches[0].clientX);
  },
  { passive: true },
);

document.addEventListener("touchend", () => {
  isSeeking = false;
});

// Previous / Next Engine
let currentAlbumIndex = -1;
let currentSongIndex = -1;

// Update Current Index
document.addEventListener("click", (event) => {
  const songItem = event.target.closest(".song-item");

  if (!songItem) return;
  const albumCard = document.querySelector(".album-card.active");

  if (!albumCard) return;
  currentAlbumIndex = Number(albumCard.dataset.index);
  currentSongIndex = Number(songItem.dataset.song);
});

// Next Song
const nextBtn = document.getElementById("nextBtn");

if (nextBtn) {
  nextBtn.addEventListener("click", () => {
    if (currentAlbumIndex === -1) return;
    const album = albumsData[currentAlbumIndex];

    if (!album || !album.songs.length) return;
    currentSongIndex++;

    if (currentSongIndex >= album.songs.length) {
      currentSongIndex = 0;
    }
    const song = album.songs[currentSongIndex];

    playSong(album, song);
    updateSongSelection();
  });
}

// Previous Song
const prevBtn = document.getElementById("prevBtn");

if (prevBtn) {
  prevBtn.addEventListener("click", () => {
    if (currentAlbumIndex === -1) return;
    const album = albumsData[currentAlbumIndex];

    if (!album || !album.songs.length) return;
    currentSongIndex--;

    if (currentSongIndex < 0) {
      currentSongIndex = album.songs.length - 1;
    }

    const song = album.songs[currentSongIndex];
    playSong(album, song);
    updateSongSelection();
  });
}

// Active Song Highlight
function updateSongSelection() {
  document.querySelectorAll(".song-item").forEach((item) => {
    item.classList.remove("active");
  });

  const activeSong = document.querySelector(
    `.song-item[data-song="${currentSongIndex}"]`,
  );

  if (activeSong) {
    activeSong.classList.add("active");
  }
}

// Volume Engine
const volumeSlider = document.getElementById("volumeSlider");
const volumeBtn = document.getElementById("volumeBtn");

// Default Volume
audio.volume = 1;

// Slider Control
if (volumeSlider) {
  volumeSlider.addEventListener("input", () => {
    audio.volume = volumeSlider.value / 100;

    if (audio.volume === 0) {
      volumeBtn.innerHTML = `<i class="fa-solid fa-volume-xmark"></i>`;
    } else if (audio.volume < 0.5) {
      volumeBtn.innerHTML = `<i class="fa-solid fa-volume-low"></i>`;
    } else {
      volumeBtn.innerHTML = `<i class="fa-solid fa-volume-high"></i>`;
    }
  });
}

// Mute / Unmute Engine
let previousVolume = audio.volume;

// Mute / Unmute
if (volumeBtn) {
  volumeBtn.addEventListener("click", () => {
    if (audio.volume > 0) {
      previousVolume = audio.volume;
      audio.volume = 0;

      if (volumeSlider) {
        volumeSlider.value = 0;
      }

      volumeBtn.innerHTML = `<i class="fa-solid fa-volume-xmark"></i>`;
    } else {
      audio.volume = previousVolume || 1;

      if (volumeSlider) {
        volumeSlider.value = audio.volume * 100;
      }

      if (audio.volume < 0.5) {
        volumeBtn.innerHTML = `<i class="fa-solid fa-volume-low"></i>`;
      } else {
        volumeBtn.innerHTML = `<i class="fa-solid fa-volume-high"></i>`;
      }
    }
  });
}

// Shuffle Engine
let isShuffle = false;
const shuffleBtn = document.getElementById("shuffleBtn");

// Shuffle Toggle
if (shuffleBtn) {
  shuffleBtn.addEventListener("click", () => {
    isShuffle = !isShuffle;
    showToast(isShuffle ? "🔀 Shuffle Enabled" : "➡️ Shuffle Disabled", "info");
    shuffleBtn.classList.toggle("active", isShuffle);
  });
}

// Get Next Song
function getNextSongIndex(album) {
  if (!album || !album.songs.length) {
    return -1;
  }

  // Shuffle Mode
  if (isShuffle) {
    if (album.songs.length === 1) {
      return 0;
    }

    let randomIndex;

    do {
      randomIndex = Math.floor(Math.random() * album.songs.length);
    } while (randomIndex === currentSongIndex);
    return randomIndex;
  }

  // Normal Mode
  let nextIndex = currentSongIndex + 1;

  if (nextIndex >= album.songs.length) {
    nextIndex = 0;
  }

  return nextIndex;
}

// Play Next Helper
function playNextSong() {
  if (currentAlbumIndex === -1) return;

  const album = albumsData[currentAlbumIndex];
  currentSongIndex = getNextSongIndex(album);

  if (currentSongIndex === -1) return;

  playSong(album, album.songs[currentSongIndex]);
  updateSongSelection();
}

// Repeat Engine
let repeatMode = 0;

/*
0 = Off
1 = Repeat All
2 = Repeat One
*/

const repeatBtn = document.getElementById("repeatBtn");

// Repeat Toggle
if (repeatBtn) {
  repeatBtn.addEventListener("click", () => {
    repeatMode++;

    if (repeatMode > 2) {
      repeatMode = 0;
    }

    updateRepeatButton();
    const repeatText = ["Repeat Off", "Repeat All", "Repeat One"];

    showToast(`🔁 ${repeatText[repeatMode]}`, "warning");
  });
}

// Update Button
function updateRepeatButton() {
  repeatBtn.classList.remove("repeat-all", "repeat-one");

  switch (repeatMode) {
    case 0:
      repeatBtn.innerHTML = `<i class="fa-solid fa-repeat"></i>`;
      break;

    case 1:
      repeatBtn.classList.add("repeat-all");
      repeatBtn.innerHTML = `<i class="fa-solid fa-repeat"></i>`;
      break;

    case 2:
      repeatBtn.classList.add("repeat-one");
      repeatBtn.innerHTML = `<i class="fa-solid fa-repeat"></i>`;
      break;
  }
}

updateRepeatButton();

// Repeat Playback
function handleSongEnd() {
  // Queue Priority
  const nextQueueSong = getNextQueueSong();

  if (nextQueueSong) {
    playSong(nextQueueSong.album, nextQueueSong.song);

    renderQueue();
    return;
  }
  if (currentAlbumIndex === -1) {
    return;
  }

  const album = albumsData[currentAlbumIndex];
  if (!album) return;

  // Repeat One
  if (repeatMode === 2) {
    playSong(album, album.songs[currentSongIndex]);

    return;
  }

  // Shuffle
  if (isShuffle) {
    currentSongIndex = getNextSongIndex(album);
  } else {
    currentSongIndex++;
  }

  // Repeat Off
  if (repeatMode === 0 && currentSongIndex >= album.songs.length) {
    playBtn.innerHTML = `<i class="fa-solid fa-play"></i>`;
    isPlaying = false;
    return;
  }

  // Repeat All
  if (currentSongIndex >= album.songs.length) {
    currentSongIndex = 0;
  }

  playSong(album, album.songs[currentSongIndex]);
  updateSongSelection();
}

// Unified Song End Event
audio.addEventListener("ended", () => {
  equalizer?.classList.remove("active");
  progressFill.style.width = "0%";
  currentTime.textContent = "0:00";
  const cover = document.querySelector(".player-left img");

  if (cover) {
    cover.classList.remove("playing");
  }

  playBtn.innerHTML = `<i class="fa-solid fa-play"></i>`;
  isPlaying = false;
  handleSongEnd();
});

// Toast Helper
let toastTimer;

function showToast(message, type = "success") {
  if (!toast) return;
  clearTimeout(toastTimer);

  toast.className = "";
  toast.id = "toast";
  toast.classList.add(type);
  toast.classList.add("show");
  toast.textContent = message;
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
    toast.classList.remove(type);
  }, 2000);
}

// Favorites Engine
const favoriteSongs = new Set();

document.addEventListener("click", (event) => {
  const likeButton = event.target.closest(".like-btn");

  if (!likeButton) return;
  event.stopPropagation();

  const songItem = likeButton.closest(".song-item");
  if (!songItem) return;

  const songName = songItem.querySelector(".song-name").textContent.trim();
  const artistName = songItem.querySelector(".song-artist").textContent.trim();
  const songKey = `${songName}-${artistName}`;
  const icon = likeButton.querySelector("i");

  if (favoriteSongs.has(songKey)) {
    favoriteSongs.delete(songKey);
    showToast("💔 Removed from Favorites", "error");
    icon.className = "fa-regular fa-heart";
    likeButton.classList.remove("liked");
  } else {
    favoriteSongs.add(songKey);
    showToast("❤️ Added to Favorites", "success");
    icon.className = "fa-solid fa-heart";
    likeButton.classList.add("liked");
  }

  saveFavorites();
  console.log([...favoriteSongs]);
});

// Favorites Storage Engine
// Load Favorites
(function loadFavorites() {
  const saved = localStorage.getItem("spotify-favorites");

  if (!saved) return;

  try {
    const songs = JSON.parse(saved);

    songs.forEach((song) => {
      favoriteSongs.add(song);
    });
  } catch (error) {
    console.error("Favorites Load Error", error);
  }
})();

// Save Favorites
function saveFavorites() {
  localStorage.setItem(
    "spotify-favorites",

    JSON.stringify([...favoriteSongs]),
  );
}

// Restore Heart Icons
function restoreFavoriteIcons() {
  document.querySelectorAll(".song-item").forEach((song) => {
    const title = song.querySelector(".song-name").textContent.trim();
    const artist = song.querySelector(".song-artist").textContent.trim();
    const key = `${title}-${artist}`;
    const button = song.querySelector(".like-btn");
    const icon = button.querySelector("i");

    if (favoriteSongs.has(key)) {
      button.classList.add("liked");

      icon.className = "fa-solid fa-heart";
    } else {
      button.classList.remove("liked");

      icon.className = "fa-regular fa-heart";
    }
  });
}

// Recently Played Engine

const RECENT_LIMIT = 10;
let recentlyPlayed = JSON.parse(localStorage.getItem("spotify-recent")) || [];

// Save Recent Songs
function addToRecentlyPlayed(album, song) {
  const item = {
    title: song.title,
    artist: song.artist,
    image: album.image,
    src: song.src,
  };

  recentlyPlayed = recentlyPlayed.filter((data) => {
    return !(data.title === item.title && data.artist === item.artist);
  });

  recentlyPlayed.unshift(item);

  if (recentlyPlayed.length > RECENT_LIMIT) {
    recentlyPlayed.pop();
  }

  localStorage.setItem("spotify-recent", JSON.stringify(recentlyPlayed));
}

if (typeof renderRecentlyPlayed === "function") {
  renderRecentlyPlayed();
}

// Queue Engine
let playQueue = [];

// Add Song To Queue
function addToQueue(album, song) {
  playQueue.push({
    album,
    song,
  });
  console.log("Queue :", playQueue);
}

// Get Next Queue Song
function getNextQueueSong() {
  if (playQueue.length === 0) {
    return null;
  }

  return playQueue.shift();
}

// Add To Queue
document.addEventListener("click", (event) => {
  const queueButton = event.target.closest(".queue-btn");

  if (!queueButton) return;
  event.stopPropagation();

  const songItem = queueButton.closest(".song-item");
  if (!songItem) return;
  if (currentAlbumIndex === -1) return;

  const songIndex = Number(songItem.dataset.song);
  const album = albumsData[currentAlbumIndex];
  const song = album.songs[songIndex];

  addToQueue(album, song);
  showToast("📋 Added to Queue", "info");
  renderQueue();
  console.log("Queued :", song.title);
});

// Queue UI
const queuePanel = document.getElementById("queuePanel");
const queueToggle = document.getElementById("queueToggle");
const closeQueue = document.getElementById("closeQueue");
const queueList = document.getElementById("queueList");

if (queueToggle) {
  queueToggle.addEventListener("click", () => {
    queuePanel.classList.add("active");

    renderQueue();
  });
}

if (closeQueue) {
  closeQueue.addEventListener("click", () => {
    queuePanel.classList.remove("active");
  });
}

function renderQueue() {
  if (!queueList) return;
  queueList.innerHTML = "";

  if (playQueue.length === 0) {
    queueList.innerHTML = `
            <p style="color:#888;text-align:center">
              <div class="empty-state">
                <i class="fa-solid fa-music"></i>
                <h3>Queue Empty</h3>
                <p>Add songs to your queue.</p>
              </div>
            </p>
        `;
    return;
  }

  playQueue.forEach((item, index) => {
    queueList.innerHTML += `
        <div class="queue-song" data-index="${index}">
            <div class="queue-info">
                <span class="queue-title">
                    ${item.song.title}
                </span>

                <span class="queue-artist">
                    ${item.song.artist}
                </span>
            </div>

            <button
                class="remove-queue"
                data-index="${index}">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
        `;
  });

  const queueCount = document.getElementById("queueCount");

  if (queueCount) {
    queueCount.textContent = playQueue.length;
  }
}

// Remove Queue Song
document.addEventListener("click", (event) => {
  const remove = event.target.closest(".remove-queue");

  if (!remove) return;
  const index = Number(remove.dataset.index);
  playQueue.splice(index, 1);
  renderQueue();
});

// Queue Playback
function playQueuedSong(index) {
  if (index < 0 || index >= playQueue.length) {
    return;
  }

  const item = playQueue.splice(index, 1)[0];
  renderQueue();
  playSong(item.album, item.song);
}

// Queue Song Click
document.addEventListener("click", (event) => {
  const queueSong = event.target.closest(".queue-song");

  if (!queueSong) return;
  // Remove button click ignore
  if (event.target.closest(".remove-queue")) return;
  const index = Number(queueSong.dataset.index);
  playQueuedSong(index);
});

// Keyboard Shortcuts
document.addEventListener("keydown", (e) => {
  // Input/Search me typing ho rahi ho to shortcut disable
  if (
    document.activeElement.tagName === "INPUT" ||
    document.activeElement.tagName === "TEXTAREA"
  ) {
    return;
  }

  switch (e.code) {
    // Play / Pause
    case "Space":
      e.preventDefault();

      if (typeof playBtn !== "undefined") {
        playBtn.click();
      }
      break;

    // Previous Song
    case "ArrowLeft":
      if (typeof prevBtn !== "undefined") {
        prevBtn.click();
      }
      break;

    // Next Song
    case "ArrowRight":
      if (typeof nextBtn !== "undefined") {
        nextBtn.click();
      }
      break;

    // Mute
    case "KeyM":
      audio.muted = !audio.muted;
      const volumeBtn = document.getElementById("volumeBtn");

      if (volumeBtn) {
        volumeBtn.innerHTML = audio.muted
          ? `<i class="fa-solid fa-volume-xmark"></i>`
          : `<i class="fa-solid fa-volume-high"></i>`;
      }
      break;

    // Volume Up
    case "ArrowUp":
      e.preventDefault();
      audio.volume = Math.min(1, audio.volume + 0.1);

      if (typeof volumeSlider !== "undefined") {
        volumeSlider.value = audio.volume * 100;
      }
      break;

    // Volume Down
    case "ArrowDown":
      e.preventDefault();
      audio.volume = Math.max(0, audio.volume - 0.1);

      if (typeof volumeSlider !== "undefined") {
        volumeSlider.value = audio.volume * 100;
      }
      break;
  }
});

// Automatic Playlist Duration
function loadSongDurations() {
  const items = document.querySelectorAll(".song-item");

  items.forEach((item) => {
    const index = Number(item.dataset.song);
    if (currentAlbumIndex === -1) return;

    const album = albumsData[currentAlbumIndex];
    if (!album) return;

    const song = album.songs[index];
    if (!song || !song.src) return;
    const tempAudio = new Audio();
    tempAudio.src = song.src;
    tempAudio.addEventListener("loadedmetadata", () => {
      const duration = formatTime(tempAudio.duration);
      item.querySelector(".song-time").textContent = duration;
    });
  });
}

// Button Click Animation
document.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  button.classList.remove("click-effect");
  void button.offsetWidth;
  button.classList.add("click-effect");
});
