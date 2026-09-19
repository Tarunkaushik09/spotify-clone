"use strict";

// ======================================
// Albums Module
// ======================================

const playlistLoader = document.getElementById("playlistLoader");
const trendingAlbums = document.getElementById("trendingAlbums");
const emptyPlaylist = document.getElementById("emptyPlaylist");

let albumsData = [
  arijitData,
  atifData,
  kkData,
  nehaData,
  englishData
];

// ======================================
// Render Albums
// ======================================

function renderAlbums(container, albums) {
  if (!container) return;

  container.innerHTML = "";

  albums.forEach((album, index) => {
    container.innerHTML += `

        <div class="album-card"

             data-index="${index}">

            <div class="album-image">

                <img

                    src="${album.image}"

                    alt="${album.title}"

                    loading="lazy"

                >

                <button class="album-play">

                    <i class="fa-solid fa-play"></i>

                </button>

            </div>

            <h3>${album.title}</h3>

            <p>${album.songs ? album.songs.length : 0} Songs</p>

        </div>

        `;
  });

  // Smooth Image Fade
  document.querySelectorAll(".album-image img").forEach((img) => {
    if (img.complete) {
      img.classList.add("loaded");
    } else {
      img.addEventListener("load", () => {
        img.classList.add("loaded");
      });
    }
  });

  // Image Fallback
  document.querySelectorAll(".album-image img").forEach((img) => {
    img.onerror = () => {
      img.onerror = null;
      img.src = "assets/images/cover.jpg";
    };
  });
}

// ======================================
// Start
// ======================================

document.addEventListener("DOMContentLoaded", () => {
    renderAlbums(trendingAlbums, albumsData);
});

// ======================================
// Playlist Loader
// ======================================

const playlistSongs = document.getElementById("playlistSongs");

// Album Click
document.addEventListener("click", (event) => {
  const card = event.target.closest(".album-card");

  if (!card) return;

  document.querySelectorAll(".album-card").forEach((item) => {
    item.classList.remove("active");
  });

  card.classList.add("active");

  const album = albumsData[Number(card.dataset.index)];

  if (album) {
    loadSongs(album);
  }
});

// Load Songs
function loadSongs(album) {
  emptyPlaylist.style.display = "none";
  if (!playlistSongs) return;

  playlistSongs.innerHTML = "";
  playlistLoader.style.display = "grid";
  playlistSongs.style.display = "none";

  if (!album.songs || !album.songs.length) {
    playlistLoader.style.display = "none";

    playlistSongs.innerHTML = `
    <div class="empty-state">
      <i class="fa-solid fa-music"></i>
      <h3>No Songs Found</h3>
    </div>
  `;

    playlistSongs.style.display = "block";
    return;
  }

  album.songs.forEach((song, index) => {
    playlistSongs.innerHTML += `
  <div class="song-item" data-song="${index}">
      <div class="song-left">
        <span class="song-number">${index + 1}</span>
        <div>
            <div class="song-name">
                ${song.title}
            </div>
            <div class="song-artist">
                ${song.artist}

            </div>

        </div>

    </div>

    <div class="song-right">

        <button class="queue-btn">

            <i class="fa-solid fa-list"></i>

        </button>

        <button class="like-btn">

            <i class="fa-regular fa-heart"></i>

        </button>

        <span class="song-time">

            --:--

        </span>

    </div>

</div>

`;
  });

  if (typeof restoreFavoriteIcons === "function") {
    restoreFavoriteIcons();
  }

  setTimeout(() => {
    playlistLoader.style.display = "none";
    playlistSongs.style.display = "block";
  }, 400);

  currentAlbumIndex = document.querySelector(".album-card.active")
    ? Number(document.querySelector(".album-card.active").dataset.index)
    : -1;

  if (typeof loadSongDurations === "function") {
    loadSongDurations();

    const firstSong = playlistSongs.querySelector(".song-item");

    if (firstSong) {
      firstSong.click();
    }
  }
}