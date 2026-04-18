(() => {
  "use strict";

  const CONFIG = {
    storageKey: "wonderland_progress_v2",

    allowedPasswords: ["314"],

    uiText: {
      wrong: "……違うようだ。もう一度。",
      invalid: "数字3ケタで入力してください。"
    },

    effects: {
      fadeMs: 550
    },

    warningPages: [
      {
        paragraphs: [
          "このたびは、ぱかの輪presents「推しのいない世界からの脱出」を遊んでいただき、ありがとうございます。",
          "このプログラムは「謎解き」という形でアーティスト5周年に花を添えるべく制作したものです。",
          "以下を最後まで目を通していただき、同意いただきましたら次にお進み下さい。",
          "⚠️注意⚠️",
          "期間中は全て同内容にて実施しますので、SNSやブログ等でのネタバレはご遠慮ください。",
          "本プログラムにおいて、出演者様やスタッフの皆様への直接の接触や、会場内のものを触れたり動かしたりする必要のある問題は一切ありません。当日の会場内での迷惑行為は公演の妨げとなるだけでなく、今後の有志活動全てに影響をおよぼすおそれがございますので、おやめください。",
          "いつも通りRIEを守ってのご参加をよろしくお願いいたします。",
          "本プログラムは難易度が高くなっております。",
          "ぜひ、りえりーのファン皆様で協力しながらご参加下さい。",
          "それでは最後までお楽しみください。"
        ],
        sign: "ぱかの輪一同"
      },
      {
        paragraphs: [
          "そうそう、大事なことを言い忘れてました…",
          "これから始まるのはどこにでもいる「ただの誰かの」物語です。しかし、これは「皆様全員にとっての」物語でもあります。1人でも多くの方の力でその誰かのことを助けてあげてください。",
          "では、「次へ」を押して…",
          "いってらっしゃい！"
        ],
        sign: ""
      }
    ],

    prologuePages: [
      [
        "我らが推し、りえりーこと高橋李依の2nd Liveが、数時間後に迫っている。",
        "アーティストデビュー5周年という節目に迎える晴れ舞台。準備は万端だ。",
        "「手紙は書いたし、忘れ物もなし。よし、行くか～」",
        "あなたは最寄り駅へ向かう。",
        "毎日歩くはずの道も、今日だけは少し華やいで見える。"
      ],
      [
        "電車に揺られてしばらくすると、川崎駅に到着した。",
        "「着いた着いた～。早めに出て正解だったかも」",
        "何事もなく着けたことにほっとした、そのとき…"
      ],
      [
        "ふと視界の端に、見覚えのある姿が映る。",
        "黄色いワンピースに、白いヒール。",
        "そこに立っていたのは、あなたのよく知る人物…によく似た女性だった。",
        "「え、もしかして……りえりー？」",
        "背丈も、雰囲気も、驚くほどよく似ている。",
        "けれど、この時間なら本番に向けてリハーサルをしているはず。",
        "こんな場所にいるなんて、ありえない。"
      ],
      [
        "「……まあ、見間違いか。みんな待ってるし、会場に行くか～」",
        "そう自分に言い聞かせ、改札を出て歩き出す。"
      ],
      [
        "けれど会場に向かう足取りは重くなっていった。胸の奥に引っかかる違和感が消えない。",
        "――やっぱり、あの人が気になる。",
        "気づけばあなたは、何かに引き寄せられるように、その女性のあとを追っていた。",
        "「待って！」",
        "夢中で走っていたあなたは、足元の穴に全く気がつかなかった。"
      ],
      [
        "「やばい、落ちる！！」",
        "開いたままのマンホール。気づいたときにはもう遅かった。",
        "あなたの身体は暗闇へと真っ逆さまに落ちていく。見上げると、さっきまでいた地上の光が、どんどん小さく遠ざかっていった。"
      ],
      [
        "しばらくして――大きな音とともに、あなたの意識は闇に沈んだ。"
      ]
    ]
  };

  const $ = (sel) => document.querySelector(sel);

  const screens = {
    entrance: $("#screen-entrance"),
    warning: $("#screen-warning"),
    prologue: $("#screen-prologue"),
    soon: $("#screen-soon")
  };

  const pwInput = $("#pwInput");
  const unlockBtn = $("#unlockBtn");
  const pwMsg = $("#pwMsg");
  const resetBtn = $("#resetBtn");
  const doorAudio = $("#doorAudio");

  const warningContent = $("#warningContent");
  const warningNextBtn = $("#warningNextBtn");

  const prologueContent = $("#prologueContent");
  const prologuePrevBtn = $("#prologuePrevBtn");
  const prologueNextBtn = $("#prologueNextBtn");

  const overlay = document.createElement("div");
  overlay.className = "fade-overlay";
  document.body.appendChild(overlay);

  const defaultProgress = {
    entryUnlocked: false,
    stage: "entrance", // entrance | warning | prologue | soon
    warningPage: 0,
    prologuePage: 0
  };

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function loadProgress() {
    try {
      const raw = localStorage.getItem(CONFIG.storageKey);
      if (!raw) return deepClone(defaultProgress);
      return { ...deepClone(defaultProgress), ...JSON.parse(raw) };
    } catch {
      return deepClone(defaultProgress);
    }
  }

  function saveProgress() {
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(progress));
  }

  function resetProgress() {
    localStorage.removeItem(CONFIG.storageKey);
    location.reload();
  }

  let progress = loadProgress();

  function setScreen(name) {
    Object.entries(screens).forEach(([key, el]) => {
      el.classList.toggle("is-active", key === name);
    });
    progress.stage = name;
    saveProgress();
  }

  function renderParagraphs(container, paragraphs, sign = "") {
    container.innerHTML = "";

    paragraphs.forEach((text) => {
      const p = document.createElement("p");
      p.className = "story-paragraph";
      p.textContent = text;
      container.appendChild(p);
    });

    if (sign) {
      const div = document.createElement("div");
      div.className = "story-sign";
      div.textContent = sign;
      container.appendChild(div);
    }
  }

  function renderWarningPage() {
    const page = CONFIG.warningPages[progress.warningPage];
    renderParagraphs(warningContent, page.paragraphs, page.sign);

    if (progress.warningPage >= CONFIG.warningPages.length - 1) {
      warningNextBtn.textContent = "次へ";
    } else {
      warningNextBtn.textContent = "次へ";
    }
  }

  function renderProloguePage() {
    const page = CONFIG.prologuePages[progress.prologuePage];
    renderParagraphs(prologueContent, page);

    prologuePrevBtn.style.visibility = progress.prologuePage === 0 ? "hidden" : "visible";
    prologueNextBtn.textContent =
      progress.prologuePage >= CONFIG.prologuePages.length - 1 ? "次へ" : "次へ";
  }

  async function playDoorSound() {
    try {
      doorAudio.currentTime = 0;
      await doorAudio.play();
    } catch {
      // ignore
    }
  }

  function fadeTransition(callback) {
    overlay.classList.add("is-on");
    window.setTimeout(() => {
      callback();
      overlay.classList.remove("is-on");
    }, CONFIG.effects.fadeMs);
  }

  function initializeFromProgress() {
    switch (progress.stage) {
      case "warning":
        renderWarningPage();
        setScreen("warning");
        break;
      case "prologue":
        renderProloguePage();
        setScreen("prologue");
        break;
      case "soon":
        setScreen("soon");
        break;
      case "entrance":
      default:
        setScreen("entrance");
        break;
    }
  }

  pwInput.addEventListener("input", () => {
    pwInput.value = pwInput.value.replace(/[^\d]/g, "").slice(0, 3);
    pwMsg.textContent = "";
  });

  pwInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") unlockBtn.click();
  });

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

    pwMsg.textContent = "";
    progress.entryUnlocked = true;
    progress.warningPage = 0;
    progress.stage = "warning";
    saveProgress();

    await playDoorSound();
    fadeTransition(() => {
      renderWarningPage();
      setScreen("warning");
    });
  });

  warningNextBtn.addEventListener("click", () => {
    if (progress.warningPage < CONFIG.warningPages.length - 1) {
      progress.warningPage += 1;
      saveProgress();
      renderWarningPage();
      return;
    }

    progress.prologuePage = 0;
    progress.stage = "prologue";
    saveProgress();
    renderProloguePage();
    setScreen("prologue");
  });

  prologuePrevBtn.addEventListener("click", () => {
    if (progress.prologuePage > 0) {
      progress.prologuePage -= 1;
      saveProgress();
      renderProloguePage();
      return;
    }

    progress.stage = "warning";
    saveProgress();
    renderWarningPage();
    setScreen("warning");
  });

  prologueNextBtn.addEventListener("click", () => {
    if (progress.prologuePage < CONFIG.prologuePages.length - 1) {
      progress.prologuePage += 1;
      saveProgress();
      renderProloguePage();
      return;
    }

    progress.stage = "soon";
    saveProgress();
    setScreen("soon");
  });

  resetBtn.addEventListener("click", () => {
    const ok = confirm("進捗をリセットしますか？（テスト用）");
    if (ok) resetProgress();
  });

  initializeFromProgress();
})();
