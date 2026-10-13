(function () {
  const C = window.BIRTHDAY;
  const $ = (id) => document.getElementById(id);

  // Fill in text from config.js
  document.title = `Happy Birthday ${C.name}`;
  $("name").textContent = C.name;
  $("turns").textContent = `${C.pronoun} turns`;
  $("tagline").textContent = C.tagline;
  $("songTitle").textContent = C.song.title;
  $("songArtist").textContent = C.song.artist;
  $("signature").textContent = C.signature;
  $("from").textContent = C.from;
  $("lyric").textContent = `♪ ${C.lyrics[0]?.text || "…"} ♪`;
  $("wishHint").textContent = C.wish.hint;
  $("wishMsg").textContent = C.wish.message;

  // Age counts up from 0
  const ageEl = $("age");
  const ageStart = performance.now() + 500;
  const countUp = (now) => {
    const p = Math.min(Math.max((now - ageStart) / 2200, 0), 1);
    ageEl.textContent = Math.round(C.age * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(countUp);
  };
  requestAnimationFrame(countUp);

  // Player
  const audio = $("audio");
  const fmt = (s) => (isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "0:00");
  const hasSong = Boolean(C.song.file);
  if (hasSong) audio.src = C.song.file;

  const setPlaying = (on) => {
    $("iconPlay").hidden = on;
    $("iconPause").hidden = !on;
    $("eq").classList.toggle("on", on);
  };

  $("playBtn").addEventListener("click", () => {
    if (!hasSong) { $("notice").hidden = false; return; }
    audio.paused ? audio.play().catch(() => ($("notice").hidden = false)) : audio.pause();
  });
  audio.addEventListener("play", () => setPlaying(true));
  audio.addEventListener("pause", () => setPlaying(false));
  audio.addEventListener("loadedmetadata", () => ($("dur").textContent = fmt(audio.duration)));
  audio.addEventListener("error", () => ($("notice").hidden = false));

  // Autoplay: browsers often block sound until the first tap, so retry then
  if (hasSong && C.song.autoplay) {
    const events = ["pointerdown", "keydown", "touchstart"];
    const unlock = (e) => {
      events.forEach((ev) => document.removeEventListener(ev, unlock));
      // The play button handles its own tap; starting here would make it pause right away
      if ($("playBtn").contains(e.target) || !audio.paused) return;
      audio.play().catch(() => {});
    };
    audio.play().catch(() => events.forEach((ev) => document.addEventListener(ev, unlock)));
  }

  $("bar").addEventListener("click", (e) => {
    if (!audio.duration) return;
    const r = e.currentTarget.getBoundingClientRect();
    audio.currentTime = ((e.clientX - r.left) / r.width) * audio.duration;
  });

  // Synced lyrics
  let current = -1;
  audio.addEventListener("timeupdate", () => {
    const t = audio.currentTime;
    $("cur").textContent = fmt(t);
    $("fill").style.width = `${(t / audio.duration) * 100 || 0}%`;

    let idx = 0;
    C.lyrics.forEach((l, i) => { if (t >= l.time) idx = i; });
    if (idx !== current) {
      current = idx;
      const el = $("lyric");
      el.classList.add("fade");
      setTimeout(() => {
        el.textContent = `♪ ${C.lyrics[idx].text} ♪`;
        el.classList.remove("fade");
      }, 300);
    }
  });

  // Wish heart
  $("heart").addEventListener("click", (e) => {
    const open = e.currentTarget.classList.toggle("open");
    e.currentTarget.setAttribute("aria-expanded", open);
  });

const profileBtn = $("profileBtn");
const profileVideo = $("profileVideo");

if (profileBtn && profileVideo) {
  profileBtn.addEventListener("click", () => {
    profileVideo.play().then(() => {
      profileBtn.classList.add("playing");
    }).catch(() => {});
  });
}
})();