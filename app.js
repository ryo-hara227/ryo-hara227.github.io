(() => {
  "use strict";

  const CONFIG = {
    storageKey: "wonderland_progress_v1",

    // すぐ変えられるように：許容パスワード配列
    allowedPasswords: ["227"],

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
    game: { chapter: "prologue" }
  };

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function loadProgress() {
    try {
      const raw = localStorage.getItem(CONFIG.storageKey);
      if (!raw) return deepClone(defaultProgress);
      const obj = JSON.parse(raw);
      return { ...deepClone(defaultProgress), ...obj };
    } catch {
      return deepClone(defaultProgress);
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

  function setScreen(which) {
    entrance.classList.toggle("is-active", which === "entrance");
    soon.classList.toggle("is-active", which === "soon");
  }

  // 既に解錠済みならcoming soonへ
  if (progress.prologueUnlocked) {
    setScreen("soon");
  } else {
    setScreen("entrance");
  }

  // 入力制限（数字3ケタ）
  pwInput.addEventListener("input", () => {
    pwInput.value = pwInput.value.replace(/[^\d]/g, "").slice(0, 3);
    pwMsg.textContent = "";
  });

  pwInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") unlockBtn.click();
  });

  async function playDoorSound() {
    try {
      doorAudio.currentTime = 0;
      await doorAudio.play();
    } catch {
      // 音声ファイル未配置 / 再生ブロック時は無視
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

    // 正解時はメッセージを出さない（音＋フェードのみ）
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
