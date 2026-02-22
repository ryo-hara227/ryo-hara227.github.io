// app.js (REVISED)
(() => {
  "use strict";

  /**
   * ここを編集すれば、文章・ヒント・パスワードはすぐ差し替え可能です。
   */
  const CONFIG = {
    storageKey: "wonderland_progress_v1",

    // すぐ変えられるように：許容パスワードを配列で持つ
    // 例）["314"] → ["271"] に差し替えるだけでOK
    allowedPasswords: ["314"],

    prologue: {
      // アクロスティック英文（36語）：各単語の頭文字で
      // TODAY IS HER BIRTHDAY WHAT IS THE DATE TODAY
      acrostic: [
        "Tattered Oaken Doorway Awaits You;",
        "In Silence, Hushed Echoes Remember.",
        "Beneath Ivory Ribbons, Time Hides Delicate Apple-yellow Yesterdays.",
        "Whispers Hatter Asks Today: Is Simple Trace Hidden Entry?",
        "Date Alone Tells Everything Tonight; Only Decide Again, Yes."
      ].join("\n"),

      // ヒントは露骨にしすぎない（必要なら後で文言差し替え）
      hint1: "ここはありえないワンダーランド。古の知識も現代の叡智も活用しなければ先には進めないでしょう。",
      hint2: "右下の式は、姿を変えることがある。大文字が小文字になったとき、見え方も変わる。\n最後は「÷」の道具。鍵は三つ、余計な飾りは持ち込めない。"
    },

    uiText: {
      wrong: "……違うようだ。もう一度。",
      invalid: "数字3ケタで入力してください。"
    },

    effects: {
      fadeMs: 550
    }
  };

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
  const resetBtn = $("#resetBtn");

  // Fade overlay
  const overlay = document.createElement("div");
  overlay.className = "fade-overlay";
  document.body.appendChild(overlay);

  const defaultProgress = {
    prologueUnlocked: false,
    hint1Opened: false,
    hint2Opened: false,
    game: { chapter: "prologue" }
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

  function resetProgress() {
    localStorage.removeItem(CONFIG.storageKey);
    location.reload();
  }

  let progress = loadProgress();

  // Render texts
  acrosticText.textContent = CONFIG.prologue.acrostic;
  hintText1.textContent = CONFIG.prologue.hint1;
  hintText2.textContent = CONFIG.prologue.hint2;

  // Restore hint open states
  if (progress.hint1Opened) hint1.open = true;
  if (progress.hint2Opened) hint2.open = true;

  // Reveal diagram annotations only after hint2 is opened (your spec)
  diagramHints.hidden = !progress.hint2Opened;

  hint1.addEventListener("toggle", () => {
    progress.hint1Opened = hint1.open;
    saveProgress(progress);
  });

  hint2.addEventListener("toggle", () => {
    progress.hint2Opened = hint2.open;
    diagramHints.hidden = !hint2.open;
    saveProgress(progress);
  });

  // Input: only digits; 3 chars max
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

  // Skip if already unlocked
  if (progress.prologueUnlocked) {
    setScreen("soon");
  } else {
    setScreen("entrance");
  }

  async function playDoorSound() {
    try {
      doorAudio.currentTime = 0;
      await doorAudio.play();
    } catch {
      // ignore
    }
  }

  function fadeTransitionToSoon() {
    overlay.classList.add("is-on");
    window.setTimeout(() => {
      setScreen("soon");
      overlay.classList.remove("is-on");
    }, CONFIG.effects.fadeMs);
  }

  unlockBtn.addEventListener("click", async () => {
    const v = (pwInput.value || "").trim();

    if (!/^\d{3}$/.test(v)) {
      pwMsg.textContent = CONFIG.uiText.invalid;
      return;
    }

    if (!CONFIG.allowedPasswords.includes(v)) {
      pwMsg.textContent = CONFIG.uiText.wrong;
      return;
    }

    // Correct: no "door opened" message (per your request)
    pwMsg.textContent = "";

    progress.prologueUnlocked = true;
    progress.game.chapter = "soon";
    saveProgress(progress);

    await playDoorSound();
    fadeTransitionToSoon();
  });

  resetBtn.addEventListener("click", () => {
    const ok = confirm("進捗をリセットしますか？（テスト用）");
    if (ok) resetProgress();
  });
})();
