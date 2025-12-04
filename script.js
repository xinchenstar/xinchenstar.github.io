document.addEventListener("DOMContentLoaded", () => {
  setupYear();
  setupSmoothScroll();
  loadResources();
  loadBlog();
  setupMusicPlayer();
  setupBlogDetail();

});

/** 页脚年份 */
function setupYear() {
  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
}

/** 导航平滑滚动 + 激活态 */
function setupSmoothScroll() {
  const links = document.querySelectorAll('.nav-link[href^="#"]');

  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const id = link.getAttribute("href").slice(1);
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // 滚动时高亮
  const sections = ["about", "resources", "blog"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;
    let activeId = null;

    sections.forEach((sec) => {
      const rect = sec.getBoundingClientRect();
      const offsetTop = rect.top + window.scrollY;
      if (scrollY >= offsetTop - 120) {
        activeId = sec.id;
      }
    });

    links.forEach((link) => {
      const id = link.getAttribute("href").slice(1);
      link.classList.toggle("active", id === activeId);
    });
  });
}

/** 加载资源列表：data/resources.json */
function loadResources() {
  const container = document.getElementById("resource-list");
  if (!container) return;

  fetch("data/resources.json")
    .then((res) => {
      if (!res.ok) throw new Error("resources.json not found");
      return res.json();
    })
    .then((data) => {
      renderResources(data, container);
    })
    .catch(() => {
      // fallback 示例
      const sample = [
        {
          name: "示例：课程讲义 PDF",
          description: "用于展示的测试资源文件，可在 data/resources.json 中删除或替换。",
          type: "PDF",
          size: "1.2MB",
          url: "#",
        },
      ];
      renderResources(sample, container);
    });
}

function renderResources(list, container) {
  if (!Array.isArray(list) || list.length === 0) {
    container.innerHTML =
      '<p class="section-hint">暂无资源，可在 <code>data/resources.json</code> 中添加。</p>';
    return;
  }

  container.innerHTML = "";
  list.forEach((item) => {
    const card = document.createElement("article");
    card.className = "resource-card";

    const title = document.createElement("h3");
    title.className = "resource-title";
    title.textContent = item.name || "未命名资源";

    const meta = document.createElement("div");
    meta.className = "resource-meta";

    if (item.type) {
      const tag = document.createElement("span");
      tag.className = "resource-tag";
      tag.textContent = item.type;
      meta.appendChild(tag);
    }

    if (item.size) {
      const size = document.createElement("span");
      size.textContent = item.size;
      meta.appendChild(size);
    }

    const desc = document.createElement("p");
    desc.className = "resource-desc";
    desc.textContent =
      item.description || "暂无描述，可在 JSON 中补充相关说明。";

    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(desc);

    if (item.url) {
      const link = document.createElement("a");
      link.className = "resource-link";
      link.href = item.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "DOWNLOAD →";
      card.appendChild(link);
    }

    container.appendChild(card);
  });
}

/** 加载 Blog 列表：data/blog.json */
function loadBlog() {
  const container = document.getElementById("blog-list");
  if (!container) return;

  fetch("data/blog.json")
    .then((res) => {
      if (!res.ok) throw new Error("blog.json not found");
      return res.json();
    })
    .then((data) => {
      renderBlog(data, container);
    })
.catch(() => {
  const sample = [
    {
      id: "sample-post",
      title: "示例：第一篇博客",
      date: "2025-01-01",
      summary:
        "这是一个示例 Blog 条目。你可以通过编辑 data/blog.json 来管理文章列表。",
      file: "posts/sample.html"
    }
  ];
  renderBlog(sample, container);
});


function renderBlog(list, container) {
  if (!Array.isArray(list) || list.length === 0) {
    container.innerHTML =
      '<p class="section-hint">暂无博文，可在 <code>data/blog.json</code> 中添加。</p>';
    return;
  }

  container.innerHTML = "";
  list.forEach((item) => {
    const wrapper = document.createElement("article");
    wrapper.className = "blog-item";

    const header = document.createElement("div");
    header.className = "blog-header";

    const title = document.createElement("h3");
    title.className = "blog-title";
    title.textContent = item.title || "未命名文章";

    const date = document.createElement("span");
    date.className = "blog-date";
    date.textContent = item.date || "";

    header.appendChild(title);
    header.appendChild(date);

    const summary = document.createElement("p");
    summary.className = "blog-summary";
    summary.textContent =
      item.summary || "暂无摘要，可在 JSON 中补充文章简介。";

    wrapper.appendChild(header);
    wrapper.appendChild(summary);

    // 关键：跳转到 blog.html?id=xxx
    if (item.id) {
      const link = document.createElement("a");
      link.className = "blog-link";
      link.href = `blog.html?id=${encodeURIComponent(item.id)}`;
      link.textContent = "OPEN →";
      wrapper.appendChild(link);
    }

    container.appendChild(wrapper);
  });
}


/** 悬浮音乐播放器 */
function setupMusicPlayer() {
  const audio = document.getElementById("audio-player");
  const playBtn = document.getElementById("play-btn");
  const nextBtn = document.getElementById("next-btn");
  const prevBtn = document.getElementById("prev-btn");
  const playlistEl = document.getElementById("playlist");
  const currentTrackEl = document.getElementById("current-track");
  const currentTimeEl = document.getElementById("current-time");
  const durationEl = document.getElementById("duration");
  const progressBar = document.getElementById("progress-bar");
  const progressFill = document.getElementById("progress-fill");
  const musicToggle = document.getElementById("music-toggle");
  const musicPlayer = document.getElementById("music-player");

  if (!audio) return;

  let playlist = [];
  let currentIndex = 0;
  let isPlaying = false;

  function formatTime(seconds) {
    if (!isFinite(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  }

  function setTrack(index) {
    if (!playlist.length) return;
    currentIndex = (index + playlist.length) % playlist.length;
    const track = playlist[currentIndex];
    audio.src = track.file;
    audio.load();
    currentTrackEl.textContent = track.title || track.file;
    updateActivePlaylistItem();
    if (isPlaying) {
      audio
        .play()
        .catch(() => {
          // 浏览器阻止自动播放时，保持按钮状态即可
        });
    }
  }

  function playPause() {
    if (!playlist.length) return;
    if (audio.paused) {
      audio
        .play()
        .then(() => {
          isPlaying = true;
          playBtn.textContent = "⏸";
        })
        .catch(() => {
          // 自动播放失败时不改变按钮文字
        });
    } else {
      audio.pause();
      isPlaying = false;
      playBtn.textContent = "▶";
    }
  }

  function nextTrack() {
    if (!playlist.length) return;
    setTrack(currentIndex + 1);
  }

  function prevTrack() {
    if (!playlist.length) return;
    setTrack(currentIndex - 1);
  }

  function updateActivePlaylistItem() {
    const items = playlistEl.querySelectorAll(".playlist-item");
    items.forEach((item, idx) => {
      item.classList.toggle("active", idx === currentIndex);
    });
  }

  function renderPlaylist() {
    playlistEl.innerHTML = "";
    playlist.forEach((track, idx) => {
      const li = document.createElement("li");
      li.className = "playlist-item";
      li.dataset.index = String(idx);

      const titleSpan = document.createElement("span");
      titleSpan.className = "playlist-title";
      titleSpan.textContent = track.title || track.file;

      const indexSpan = document.createElement("span");
      indexSpan.className = "playlist-index";
      indexSpan.textContent = String(idx + 1).padStart(2, "0");

      li.appendChild(titleSpan);
      li.appendChild(indexSpan);
      playlistEl.appendChild(li);
    });
  }

  function loadPlaylist() {
    // 约定：music/playlist.json 存放播放列表，file 为相对路径（例如 "music/song1.mp3"）
    fetch("music/playlist.json")
      .then((res) => {
        if (!res.ok) throw new Error("playlist.json not found");
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data) || data.length === 0) {
          throw new Error("empty playlist");
        }
        playlist = data;
        renderPlaylist();
        setTrack(0);
      })
      .catch(() => {
        // fallback 示例：请替换成你自己目录下真实存在的 mp3 文件
        playlist = [
          { title: "Sample Track 1", file: "music/sample1.mp3" },
          { title: "Sample Track 2", file: "music/sample2.mp3" },
        ];
        renderPlaylist();
        setTrack(0);
      });
  }

  // 时间 & 进度条
  audio.addEventListener("timeupdate", () => {
    currentTimeEl.textContent = formatTime(audio.currentTime);
    durationEl.textContent = formatTime(audio.duration);
    if (audio.duration > 0) {
      const percent = (audio.currentTime / audio.duration) * 100;
      progressFill.style.width = `${percent}%`;
    } else {
      progressFill.style.width = "0%";
    }
  });

  audio.addEventListener("ended", () => {
    nextTrack();
  });

  // 点击进度条跳转
  if (progressBar) {
    progressBar.addEventListener("click", (e) => {
      const rect = progressBar.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;
      if (audio.duration) {
        audio.currentTime = ratio * audio.duration;
      }
    });
  }

  // 播放控制
  playBtn.addEventListener("click", playPause);
  nextBtn.addEventListener("click", nextTrack);
  prevBtn.addEventListener("click", prevTrack);

  // 播放列表点击切歌
  playlistEl.addEventListener("click", (e) => {
    const target = e.target.closest(".playlist-item");
    if (!target) return;
    const idx = Number(target.dataset.index || 0);
    isPlaying = true;
    playBtn.textContent = "⏸";
    setTrack(idx);
  });

  // 折叠 / 展开
  musicToggle.addEventListener("click", () => {
    const collapsed = musicPlayer.classList.toggle("collapsed");
    musicToggle.textContent = collapsed ? "▴" : "▾";
  });

  // 初始化
  loadPlaylist();
}



