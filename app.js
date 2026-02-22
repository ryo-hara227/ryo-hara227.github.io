// app.js
(() => {
  "use strict";

  /**
   * ここを編集すれば、文章・ヒント・パスワードはすぐ差し替え可能です。
   * HTMLを触らずに変更できるようにしています。
   */
  const CONFIG = {
    storageKey: "wonderland_progress_v1",
    // すぐ変えられるように：許容パスワードを配列で
    allowedPasswords: ["314"],

    prologue: {
      // アクロスティック英文（36語）。各単語の頭文字で
      // TODAY IS HER BIRTHDAY WHAT IS THE DATE TODAY
      acrostic: [
        "Tattered Oaken Doorway Awaits You;",
        "In Silence, Hushed Echoes Remember.",
        "Beneath Ivory Ribbons, Time Hides Delicate Apple-yellow Yesterdays.",
        "Whispers Hatter Asks Today: Is Simple Trace Hidden Entry?",
        "Date Alone Tells Everything Tonight; Only Decide Again, Yes."
      ].join("\n"),

      hint1: "ここはありえないワンダーランドです。古の知識も現代の叡智も活用しなければ先には進めないでしょう。",
      hint2: "「MM/DD」を「mm/d」に直してみよう。月は“重ねて”、日は“一桁だけ”。\n出てきた分数は「÷」の道具で。鍵は最初の3つ。"
    },

    uiText: {
      wrong: "……違うようだ。もう一度。",
      correct: "カチリ、と音がした。扉が開く。",
      invalid: "数字3ケタで入力してください。"
    },

    // 演出
    effects: {
      fadeMs: 550
    }
  };

  // Elements
  const $ = (sel) => document.querySelector(sel);

  const entrance = $("#screen-entrance");
  const soon = $("#screen-soon");

  const acrosticText = $("#acrosticText");
  const hintText1 = $("#hintText1");
  const hintText2 = $("#hintText2");

  const hint1 = $("#hint1");
  const hint2 = $("#hint2");
  const diagramHints = $("#diagramHints");

  const pwInput = $("#pwInput");
  const unlockBtn = $("#unlockBtn");
  const pwMsg = $("#pwMsg");
  const doorAudio = $("#doorAudio");

  // Fade overlay (for door opening)
  const overlay = document.createElement("div");
  overlay.className = "fade-overlay";
  document.body.appendChild(overlay);

  // Progress
  const defaultProgress = {
    prologueUnlocked: false,
    hint1Opened: false,
    hint2Opened: false,
    // 将来、本編を足したとき用に拡張しやすい
    game: {
      chapter: "prologue",
      // bigQ: 0, smallQ: 0, etc...
    }
  };

  function loadProgress() {
    try {
      const raw = localStorage.getItem(CONFIG.storageKey);
      if (!raw) return structuredClone(defaultProgress);
      const obj = JSON.parse(raw);
      return { ...structuredClone(defaultProgress), ...obj };
    } catch {
      return structuredClone(defaultProgress);
    }
  }

  function saveProgress(p) {
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(p));
  }

  let progress = loadProgress();

  // Render initial texts
  acrosticText.textContent = CONFIG.prologue.acrostic;
  hintText1.textContent = CONFIG.prologue.hint1;
  hintText2.textContent = CONFIG.prologue.hint2;

  // Restore hint open states
  if (progress.hint1Opened) hint1.open = true;
  if (progress.hint2Opened) hint2.open = true;

  // Reveal diagram annotations only after hint is opened (per your spec)
  // We show annotations when hint2 is opened (stronger), but you can change to hint1 if you want.
  if (progress.hint2Opened) diagramHints.hidden = false;

  hint1.addEventListener("toggle", () => {
    progress.hint1Opened = hint1.open;
    saveProgress(progress);
  });

  hint2.addEventListener("toggle", () => {
    progress.hint2Opened = hint2.open;
    // When hint2 opens, reveal diagram notes
    diagramHints.hidden = !hint2.open;
    saveProgress(progress);
  });

  // Input: allow only digits; 3 chars max
  pwInput.addEventListener("input", () => {
    pwInput.value = pwInput.value.replace(/[^\d]/g, "").slice(0, 3);
    pwMsg.textContent = "";
  });

  pwInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") unlockBtn.click();
  });

  function setScreen(which) {
    entrance.classList.toggle("is-active", which === "entrance");
    soon.classList.toggle("is-active", which === "soon");
  }

  // If already unlocked, skip to coming soon
  if (progress.prologueUnlocked) {
    setScreen("soon");
  } else {
    setScreen("entrance");
  }

  async function playDoorSound() {
    try {
      // Some browsers require user gesture; this is called from click handler, so OK.
      doorAudio.currentTime = 0;
      await doorAudio.play();
    } catch {
      // ignore (no audio available / blocked)
    }
  }

  function fadeTransitionToSoon() {
    overlay.classList.add("is-on");
    window.setTimeout(() => {
      setScreen("soon");
      // fade back a bit (optional)
      overlay.classList.remove("is-on");
    }, CONFIG.effects.fadeMs);
  }

  unlockBtn.addEventListener("click", async () => {
    const v = (pwInput.value || "").trim();

    if (!/^\d{3}$/.test(v)) {
      pwMsg.textContent = CONFIG.uiText.invalid;
      return;
    }

    const ok = CONFIG.allowedPasswords.includes(v);

    if (!ok) {
      pwMsg.textContent = CONFIG.uiText.wrong;
      return;
    }

    // correct
    pwMsg.textContent = CONFIG.uiText.correct;
    progress.prologueUnlocked = true;
    progress.game.chapter = "soon";
    saveProgress(progress);

    await playDoorSound();
    fadeTransitionToSoon();
  });

  // Expose a tiny dev helper (optional): reset progress from console
  // window.__WL_RESET = () => { localStorage.removeItem(CONFIG.storageKey); location.reload(); };
})();
