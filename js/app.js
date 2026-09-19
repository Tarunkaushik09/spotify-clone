"use strict";

console.log("Spotify Clone Started");

// ======================================
// Live Album Search
// Part 8A
// ======================================

const searchInput = document.querySelector(".search-box input");

function searchAlbums() {
  const keyword = searchInput.value.trim().toLowerCase();

  const albumCards = document.querySelectorAll(".album-card");

  albumCards.forEach((card) => {
    const title = card.querySelector("h3").textContent.toLowerCase();

    const artist = card.querySelector("p").textContent.toLowerCase();

    if (title.includes(keyword) || artist.includes(keyword)) {
      card.style.display = "";
    } else {
      card.style.display = "none";
    }
  });
}

// ======================================
// Song Search Engine
// Part 8B
// ======================================

function searchSongs() {
  const keyword = searchInput.value.trim().toLowerCase();

  const songItems = document.querySelectorAll(".song-item");

  songItems.forEach((song) => {
    const songName = song.querySelector(".song-name").textContent.toLowerCase();

    const artistName = song
      .querySelector(".song-artist")
      .textContent.toLowerCase();

    if (songName.includes(keyword) || artistName.includes(keyword)) {
      song.style.display = "flex";
    } else {
      song.style.display = "none";
    }
  });
}

// ======================================
// Combined Search
// ======================================

let searchTimer;

if (searchInput) {
  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      searchAlbums();
      searchSongs();
    }, 200);
  });
}

// ======================================
// Recent Helper
// Part 11A
// ======================================

function getRecentlyPlayed() {
  return JSON.parse(localStorage.getItem("spotify-recent")) || [];
}

// ======================================
// Recently Played UI
// Part 11B
// ======================================

const recentContainer = document.getElementById("recentAlbums");

function renderRecentlyPlayed() {
  if (!recentContainer) return;

  const recentSongs = getRecentlyPlayed();

  recentContainer.innerHTML = "";

  if (recentSongs.length === 0) {
    return;
  }

  recentSongs.forEach((song, index) => {
    recentContainer.innerHTML += `

            <div class="album-card recent-card"

                 data-index="${index}">

                <div class="album-image">

                    <img src="${song.image}"

                         alt="${song.title}">

                </div>

                <h3>${song.title}</h3>

                <p>${song.artist}</p>

            </div>

        `;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderRecentlyPlayed();
});

// ======================================
// Queue Helper
// Part 12A
// ======================================

function getQueue() {
  return playQueue;
}

// ======================================
// PART 19A
// Custom Playlist
// ======================================

const createPlaylistBtn = document.getElementById("createPlaylistBtn");
const customPlaylists = document.getElementById("customPlaylists");

let playlists = JSON.parse(localStorage.getItem("spotify-playlists")) || [];

function renderPlaylists() {
  if (!customPlaylists) return;

  customPlaylists.innerHTML = "";

  playlists.forEach((playlist, index) => {
    customPlaylists.innerHTML += `

        <div class="custom-playlist" data-index="${index}">

            📀 ${playlist.name}

        </div>

        `;
  });
}

renderPlaylists();

createPlaylistBtn?.addEventListener("click", () => {
  const name = prompt("Playlist Name");

  if (!name) return;

  playlists.push({
    name: name,

    songs: [],
  });

  localStorage.setItem(
    "spotify-playlists",

    JSON.stringify(playlists),
  );

  renderPlaylists();

  if (typeof showToast === "function") {
    showToast("📀 Playlist Created", "success");
  }
});

document.querySelectorAll("img").forEach((img) => {
  img.draggable = false;
});

// ======================================
// Part 23C
// Mobile Sidebar
// ======================================

const menuToggle = document.getElementById("menuToggle");
const closeSidebar = document.getElementById("closeSidebar");
const sidebar = document.querySelector(".sidebar");

const overlay = document.getElementById("sidebarOverlay");

function openMenu() {
  sidebar.classList.add("active");
  overlay.classList.add("active");
}

function closeMenu() {
  sidebar.classList.remove("active");
  overlay.classList.remove("active");
}

menuToggle?.addEventListener("click", openMenu);
closeSidebar?.addEventListener("click", closeMenu);
overlay?.addEventListener("click", closeMenu);

// Close sidebar after menu click

document.querySelectorAll(".menu-item").forEach((item) => {
  item.addEventListener("click", () => {
    if (window.innerWidth <= 768) {
      closeMenu();
    }
  });
});

// Reset on Desktop

window.addEventListener("resize", () => {
  if (window.innerWidth > 768) {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
  }
});
