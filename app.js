const items = [
  { name: "霜华流光袍", type: "时装", slot: "外观", rarity: "典藏", power: 0, tags: ["月白", "仙气", "染色"], accent: "#dfbd72", glow: "rgba(223,189,114,.34)", note: "适合清冷系截图，肩袖有流光纹样，夜景下最出片。" },
  { name: "春山烟雨伞", type: "时装", slot: "背饰", rarity: "典藏", power: 0, tags: ["背饰", "江南", "拍照"], accent: "#e0a2a0", glow: "rgba(224,162,160,.3)", note: "柔和色系背饰，和浅色长袍搭配很好看。" },
  { name: "星河入梦冠", type: "时装", slot: "头饰", rarity: "珍稀", power: 0, tags: ["头饰", "星光", "搭配"], accent: "#8fb9ff", glow: "rgba(143,185,255,.32)", note: "适合和冷色系衣服组合，截图时能补足头部细节。" },
  { name: "天琊灵印", type: "法宝", slot: "法宝", rarity: "绝品", power: 14220, tags: ["爆发", "灵力", "副本"], accent: "#9b8cff", glow: "rgba(155,140,255,.34)", note: "爆发窗口表现稳定，适合副本与限时挑战。" },
  { name: "玄火赤纹佩", type: "饰品", slot: "腰佩", rarity: "上品", power: 4860, tags: ["火相", "攻击", "日常"], accent: "#ef8a54", glow: "rgba(239,138,84,.3)", note: "日常任务常用饰品，属性均衡，方便记录过渡期搭配。" },
  { name: "墨羽踏云", type: "坐骑", slot: "坐骑", rarity: "珍稀", power: 1680, tags: ["飞行", "黑金", "收藏"], accent: "#d86e58", glow: "rgba(216,110,88,.28)", note: "黑金色调的移动外观，适合夜间地图和城市场景。" }
];

const typeOrder = ["时装", "挂件", "坐骑"];
const rarityOrder = ["全部", "典藏", "绝品", "珍稀", "上品"];
const rarityScore = { "典藏": 5, "绝品": 4, "珍稀": 3, "上品": 2 };

let activeType = "时装";
let activeRarity = "全部";
let likes = 0;
let selectedMomentPhotos = [];
let moments = [];
let favoritePhotos = [];
let activeMomentView = "feed";
let favoriteWallIndex = 0;
let addingFromFavoriteWall = false;
let activeCoverIndex = 0;
window._hasEntered = false;
const momentPhotos = new Map();
const coverImages = [
  { src: "assets/rhein-cover-archive.png", alt: "莱茵档案封面", theme: "ice" },
  { src: "assets/rhein-cover-8k.jpg?v=8k", alt: "莱茵角色封面", theme: "red" },
  { src: "assets/rhein-cover-chronos.png", alt: "莱茵时之观测者封面", theme: "pink" }
];
const themeAssets = {
  ice: {
    character: "assets/rhein-ice-archive-hero.png",
    logo: "assets/rhein-logo-ice-transparent.png",
    label: "白发冰晶档案主题"
  },
  red: {
    character: "assets/rhein-red-character.png",
    logo: "assets/rhein-logo-red-transparent.png",
    label: "红发碎光主题"
  },
  pink: {
    character: "assets/rhein-chronos-character.png",
    logo: "assets/rhein-logo-pink-custom.png",
    label: "粉白时之观测者主题"
  }
};
const likesStorageKey = "rhein-like-count";
const maxMomentPhotoBytes = 8 * 1024 * 1024;
const maxMomentPhotoEdge = 1800;
let activeTheme = coverImages[activeCoverIndex].theme;
const defaultCharacterImage = () => themeAssets[activeTheme]?.character || themeAssets.ice.character;
const defaultLogoImage = () => themeAssets[activeTheme]?.logo || themeAssets.ice.logo;

const grid = document.querySelector("#itemGrid");
const emptyState = document.querySelector("#emptyState");
const searchInput = document.querySelector("#searchInput");
const sortSelect = document.querySelector("#sortSelect");
const typeFilters = document.querySelector("#typeFilters");
const rarityFilters = null;
const dialog = document.querySelector("#detailDialog");
const dialogBody = document.querySelector("#dialogBody");
const photoDialog = document.querySelector("#photoDialog");
const photoDialogImage = document.querySelector("#photoDialogImage");
const closePhotoDialog = document.querySelector("#closePhotoDialog");
const likeWidget = document.querySelector(".like-widget");
const likeButton = document.querySelector("#likeButton");
const likeCount = document.querySelector("#likeCount");
const enterButton = document.querySelector("#enterButton");
const coverReturn = document.querySelector("#coverReturn");
const coverImage = document.querySelector("#coverImage");
const coverPrev = document.querySelector("#coverPrev");
const coverNext = document.querySelector("#coverNext");
const musicToggle = document.querySelector("#musicToggle");
const coverMusic = document.querySelector("#coverMusic");
const momentForm = document.querySelector("#momentForm");
const momentPhoto = document.querySelector("#momentPhoto");
const momentPhotoPicker = momentPhoto.closest(".photo-picker");
const momentText = document.querySelector("#momentText");
const composerPreview = document.querySelector("#composerPreview");
const momentsFeed = document.querySelector("#momentsFeed");
const favoriteWall = document.querySelector("#favoriteWall");
const momentsCount = document.querySelector("#momentsCount");
const momentModeTabs = document.querySelectorAll(".moment-mode-tab");
const statTabs = document.querySelectorAll(".stat-tab");
const archiveNav = document.querySelector(".archive-nav nav");
ensureArchiveSectionLinks();
appendThemeNavLinks();
const themeNavLinks = document.querySelectorAll(".archive-nav a[data-theme-target]");
const archiveLinks = document.querySelectorAll(".archive-nav a[data-section]");
const hero = document.querySelector(".hero");
const fashionGallery = document.querySelector("#fashionGallery");
const characterImage = document.querySelector("#characterImage");
const heroLogoArt = document.querySelector(".hero-logo-art");
const outfitImages = Array.from({ length: 54 }, (_, index) => `assets/fashion/outfits/outfit-${String(index + 1).padStart(2, "0")}.png`);
const wornImages = Array.from({ length: 54 }, (_, index) => `assets/fashion/worn/outfit-${String(index + 1).padStart(2, "0")}.png`);
const accessoryImages = Array.from({ length: 39 }, (_, index) => `assets/fashion/accessories/accessory-${String(index + 1).padStart(2, "0")}.png`);
const mountImages = Array.from({ length: 39 }, (_, index) => `assets/fashion/mounts/mount-${String(index + 1).padStart(2, "0")}.png`);
const outfitNames = {
  4: "火霓·金辉驰梦",
  13: "潜龙·芥知湖光",
  23: "火霓·漠上寒烟",
  41: "云若·寒山晴昼",
  44: "琳琅·璞玉自真",
  45: "嘉时春颂",
  46: "潜龙·雨夜偕行",
  47: "潜龙雨夜独行",
  1: "火宽·琼翎宝织",
  2: "沧溟·霜砚留白",
  3: "云若·流萤织梦",
  5: "天曦·丹纱隐墨",
  6: "琳琅·玉堂春锦",
  7: "琳琅霜栖红襟",
  8: "云若·梦影游仙",
  9: "浮梦·冰魄星谣",
  10: "沧溟·黯香乱红",
  11: "沧溟·净世琉璃",
  12: "琳琅:金错墨章",
  14: "凌霜·梵业遏云",
  15: "火霓·拈指生香",
  16: "火霓·天鹿引虹",
  17: "沧溟·玉露秋光",
  18: "云若·情丝百结",
  19: "千山行云",
  20: "琳琅·瑞景天香",
  21: "浮梦·冰华绮霰",
  22: "初心·澜影流光",
  24: "浮梦·醉卧山河",
  25: "琳琅·桃枝香坠",
  26: "潜龙·幽川镇魔",
  27: "潜龙·幽川探灵",
  28: "沧溟·暮雨江天",
  29: "琳琅·潇湘烟渚",
  30: "沧淇·藤萝卧月",
  31: "潜龙·罗锦折梅",
  32: "潜龙·罗锦绣春",
  33: "琳琅·炊金馔玉",
  34: "天曦·金阀浮云",
  35: "天曦·金阙素霓",
  36: "天曦·天心织巧",
  37: "云若·繁漪疏雨",
  38: "沧溟·秋暝翳云",
  39: "沧溟·秋辞吟云",
  40: "潜龙:朔风啸漠",
  42: "潜龙·朔风枭野",
  43: "浮梦·空宵梦觉",
  48: "天曦·太微玄览",
  49: "天曦·太微玄元",
  50: "沧淇·汀洲碧影",
  51: "沧溟·墨竹凌锋",
  52: "琳琅·镜里朱颜",
  53: "云若·夕照紫绮"
};
const accessoryNames = {
  1: "冷香词卷",
  2: "沧溟·繁枝细蕊",
  3: "炽岩双面",
  4: "火霓·惊弦",
  5: "巫毒娃娃",
  6: "花灯笼",
  7: "万象星晷",
  8: "琳琅·流年载意",
  9: "天曦·豆萝芳华",
  10: "幽冥引",
  11: "日出锦绣",
  12: "玉泉竹声",
  13: "荷塘霁月",
  14: "千华绽蕊",
  15: "赤翎灼星",
  16: "灵泽宝扇",
  17: "望冰轮",
  18: "慧锋劫火",
  19: "观照局",
  20: "碧泉",
  21: "绿鞘铁刀",
  22: "霜绽香清",
  23: "灼灼韵绝",
  24: "香风揽仙",
  25: "山海惊涛",
  26: "宝相法鼓",
  27: "草木生",
  28: "蜻蛉翼",
  29: "妙慧金轮",
  30: "沧溟鹤栖",
  31: "乌寒逐邪",
  32: "云间寄羽",
  33: "璧华金翠",
  34: "金绡流光",
  35: "绯霞留影",
  36: "溯光浮影",
  37: "太极痕鳞",
  38: "三头六臂",
  39: "赤金鎏焰"
};
const mountNames = {
  1: "曲池荷",
  2: "狂刃纵酒",
  3: "魅影宴月",
  4: "拂鳞沙梦",
  5: "霜寒鹤翼",
  6: "明莲浮金",
  7: "鱼戏天地",
  8: "青花玉碟",
  9: "彼岸",
  10: "魅影",
  11: "松华",
  12: "碧竹",
  13: "碎影棱",
  14: "寒渊影",
  15: "炽霜锋",
  16: "清锋载玉",
  17: "渊夜长缚",
  18: "无相莲锋",
  19: "望天狼",
  20: "赤鳞竹篁",
  21: "负玄鳞",
  22: "斩幽",
  23: "无常刃",
  24: "念奴娇",
  25: "墨云翻",
  26: "老剑条",
  27: "香炙鲽鱼",
  28: "蓝姬竹篁",
  29: "万仞松涛",
  30: "彼岸劫灰",
  31: "绯月瑶",
  32: "夷央·天剑焚海",
  33: "玄穹御风",
  34: "似空游",
  35: "苍风流",
  36: "玉明驹",
  37: "火云驹",
  38: "赤骏"
};
const goldGalleryItems = {
  outfit: new Set([4, 10, 17, 49, 50]),
  accessory: new Set([4, 5, 6, 7, 8, 9, 12, 13, 15, 16, 17, 18, 25, 27, 29, 30, 32, 33, 34, 36, 37, 38, 39]),
  mount: new Set([19, 26, 31, 33, 39])
};
const favoriteOrder = [10, 11, 6, 5, 1, 3, 4, 23, 41, 47, 54, 13, 14, 18, 36];

function ensureArchiveSectionLinks() {
  if (!archiveNav) return;
  if (!archiveNav.querySelector('[data-section="moments"]')) {
    const petsLink = archiveNav.querySelector('[data-section="pets"]');
    const momentsLink = document.createElement("a");
    momentsLink.href = "#momentsSection";
    momentsLink.dataset.section = "moments";
    momentsLink.innerHTML = "<b>05</b><span>MOMENTS<br />朋友圈</span>";
    archiveNav.insertBefore(momentsLink, petsLink || null);
  }
}

function appendThemeNavLinks() {
  if (!archiveNav || archiveNav.querySelector(".theme-nav-group")) return;
  const group = document.createElement("div");
  group.className = "theme-nav-group";
  group.setAttribute("aria-label", "主题切换");
  group.innerHTML = `
    <span class="theme-nav-title">THEME</span>
    <a href="#appShell" data-theme-target="pink"><b>P</b><span>PINK<br />粉</span></a>
    <a href="#appShell" data-theme-target="ice"><b>I</b><span>ICE<br />冰</span></a>
    <a href="#appShell" data-theme-target="red"><b>R</b><span>CRIMSON<br />绯</span></a>
  `;
  archiveNav.appendChild(group);
}

const appShell = document.querySelector("#appShell");
const contentSections = {
  collection: document.querySelector("#collectionSection"),
  moments: document.querySelector("#momentsSection"),
  pets: document.querySelector("#petsSection")
};

coverMusic.volume = 0.35;
applyTheme(activeTheme, { syncCover: true });
updateThemeNavActive();
bootstrap();
tryStartCoverMusic();
document.addEventListener("pointerdown", tryStartCoverMusic, { once: true });

function renderFilters(container, values, activeValue, onSelect) {
  container.innerHTML = "";
  values.forEach((value) => {
    const button = document.createElement("button");
    button.className = `filter-button${value === activeValue ? " active" : ""}`;
    button.type = "button";
    button.textContent = value;
    button.addEventListener("click", () => onSelect(value));
    container.appendChild(button);
  });
}

function getFilteredItems() {
  const query = searchInput.value.trim().toLowerCase();
  return items
    .filter((item) => matchesType(item, activeType))
    .filter((item) => activeRarity === "全部" || item.rarity === activeRarity)
    .filter((item) => [item.name, item.type, item.slot, item.rarity, ...item.tags].join(" ").toLowerCase().includes(query))
    .sort((a, b) => {
      if (sortSelect.value === "name") return a.name.localeCompare(b.name, "zh-CN");
      if (sortSelect.value === "rarity") return rarityScore[b.rarity] - rarityScore[a.rarity];
      if (sortSelect.value === "favorite") {
        return getItemFavoriteRank(a) - getItemFavoriteRank(b) || rarityScore[b.rarity] - rarityScore[a.rarity] || b.power - a.power || a.name.localeCompare(b.name, "zh-CN");
      }
      return b.power - a.power;
    });
}

function getItemFavoriteRank(item) {
  const explicitIndex = [item.favoriteIndex, item.outfitIndex, item.galleryIndex, item.assetIndex]
    .map((value) => Number(value))
    .find((value) => Number.isInteger(value) && value > 0);
  if (explicitIndex) return getFavoriteRank(explicitIndex);

  const matchedOutfit = Object.entries(outfitNames).find(([, name]) => name === item.name);
  if (matchedOutfit) return getFavoriteRank(Number(matchedOutfit[0]));

  return Number.POSITIVE_INFINITY;
}

function getFavoriteRank(index) {
  const rank = favoriteOrder.indexOf(index);
  return rank === -1 ? Number.POSITIVE_INFINITY : rank;
}

function matchesType(item, type) {
  if (type === "\u65f6\u88c5") return item.type === "\u65f6\u88c5";
  if (type === "\u5750\u9a91") return item.type === "\u5750\u9a91";
  if (type === "\u6302\u4ef6") {
    return ["\u9970\u54c1", "\u6cd5\u5b9d"].includes(item.type) || ["\u80cc\u9970", "\u5934\u9970", "\u8170\u4f69"].includes(item.slot);
  }
  return true;
}

function createCard(item) {
  const button = document.createElement("button");
  button.className = "item-card";
  button.type = "button";
  button.style.setProperty("--accent", item.accent);
  button.style.setProperty("--glow", item.glow);
  button.innerHTML = `
    <div class="item-visual"><div class="sigil" aria-hidden="true"></div></div>
    <div class="item-meta">
      <div class="tags"><span class="tag">${item.type}</span><span class="tag">${item.rarity}</span><span class="tag">${item.slot}</span></div>
      <h3>${item.name}</h3>
      <div class="tags">${item.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
      <div class="power"><span>鎴樺姏</span><strong>${item.power ? item.power.toLocaleString("zh-CN") : "澶栬"}</strong></div>
    </div>`;
  button.addEventListener("click", () => showDetail(item));
  return button;
}

function renderItems() {
  const filtered = getFilteredItems();
  grid.innerHTML = "";
  filtered.forEach((item) => grid.appendChild(createCard(item)));
  emptyState.style.display = filtered.length || getFilteredGalleryItems().length ? "none" : "block";
}

function renderFashionGallery() {
  fashionGallery.innerHTML = "";
  const filteredGalleryItems = getFilteredGalleryItems();
  filteredGalleryItems.forEach((galleryItem) => {
    const { index: galleryIndex, src, name, kind } = galleryItem;
    const button = document.createElement("button");
    button.type = "button";
    button.title = name;
    button.setAttribute("aria-label", name);
    if (isGoldGalleryItem(kind, galleryIndex)) button.classList.add("gold-outfit");
    if (kind === "accessory") button.classList.add("accessory-card");
    const image = document.createElement("img");
    image.src = src;
    image.alt = name;
    image.addEventListener("error", () => {
      button.classList.add("missing-asset");
      image.alt = `${name}资源缺失`;
      image.removeAttribute("src");
    }, { once: true });
    button.appendChild(image);
    button.addEventListener("click", () => {
      fashionGallery.querySelectorAll("button").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      if (kind === "outfit") tryApplyWornOutfit(wornImages[galleryIndex - 1], button);
    });
    button.addEventListener("dblclick", () => {
      photoDialogImage.src = src;
      photoDialog.showModal();
    });
    fashionGallery.appendChild(button);
  });
  fashionGallery.hidden = filteredGalleryItems.length === 0;
}

function getFilteredGalleryItems() {
  if (activeType === "时装") {
    return getFilteredOutfits().map((index) => ({
      kind: "outfit",
      index,
      src: outfitImages[index - 1],
      name: getOutfitName(index)
    }));
  }
  if (activeType === "挂件") {
    return getFilteredAccessories().map((index) => ({
      kind: "accessory",
      index,
      src: accessoryImages[index - 1],
      name: getAccessoryName(index)
    }));
  }
  if (activeType === "坐骑") {
    return getFilteredMounts().map((index) => ({
      kind: "mount",
      index,
      src: mountImages[index - 1],
      name: getMountName(index)
    }));
  }
  return [];
}

function getSortedOutfits() {
  const indexes = Array.from({ length: 54 }, (_, index) => index + 1);
  if (sortSelect.value === "favorite") {
    const score = new Map(favoriteOrder.map((id, index) => [id, index]));
    return indexes.sort((a, b) => (score.get(a) ?? 999) - (score.get(b) ?? 999) || a - b);
  }
  return sortGalleryByGrade("outfit", indexes);
}

function getFilteredOutfits() {
  const query = normalizeSearchText(searchInput.value);
  return getSortedOutfits().filter((outfitIndex) => {
    if (activeType !== "时装") return false;
    if (!query) return true;
    const confirmedName = outfitNames[outfitIndex];
    const idText = normalizeSearchText([
      String(outfitIndex),
      String(outfitIndex).padStart(2, "0"),
      `outfit-${String(outfitIndex).padStart(2, "0")}`
    ].join(" "));
    const haystack = normalizeSearchText(confirmedName || "");
    if (/^\d+$/.test(query) || query.startsWith("outfit")) return idText.includes(query);
    if (!confirmedName) return false;
    return haystack.includes(query);
  });
}

function getFilteredAccessories() {
  const query = normalizeSearchText(searchInput.value);
  return sortGalleryByGrade("accessory", Array.from({ length: accessoryImages.length }, (_, index) => index + 1)).filter((accessoryIndex) => {
    if (!query) return true;
    const name = accessoryNames[accessoryIndex];
    const idText = normalizeSearchText([
      String(accessoryIndex),
      String(accessoryIndex).padStart(2, "0"),
      `accessory-${String(accessoryIndex).padStart(2, "0")}`
    ].join(" "));
    const haystack = normalizeSearchText(name || "");
    if (/^\d+$/.test(query) || query.startsWith("accessory")) return idText.includes(query);
    if (!name) return false;
    return haystack.includes(query);
  });
}

function getFilteredMounts() {
  const query = normalizeSearchText(searchInput.value);
  return sortGalleryByGrade("mount", Array.from({ length: mountImages.length }, (_, index) => index + 1)).filter((mountIndex) => {
    if (!query) return true;
    const name = mountNames[mountIndex];
    const idText = normalizeSearchText([
      String(mountIndex),
      String(mountIndex).padStart(2, "0"),
      `mount-${String(mountIndex).padStart(2, "0")}`
    ].join(" "));
    const haystack = normalizeSearchText(name || "");
    if (/^\d+$/.test(query) || query.startsWith("mount")) return idText.includes(query);
    if (!name) return false;
    return haystack.includes(query);
  });
}

function getOutfitName(outfitIndex) {
  return outfitNames[outfitIndex] || `时装 ${String(outfitIndex).padStart(2, "0")}`;
}

function getAccessoryName(accessoryIndex) {
  return accessoryNames[accessoryIndex] || `挂件 ${String(accessoryIndex).padStart(2, "0")}`;
}

function getMountName(mountIndex) {
  return mountNames[mountIndex] || `坐骑 ${String(mountIndex).padStart(2, "0")}`;
}

function normalizeSearchText(value) {
  return String(value || "").trim().toLowerCase().replace(/[·:：\s_-]/g, "");
}

function sortGalleryByGrade(kind, indexes) {
  if (sortSelect.value !== "rarity") return indexes;
  return [...indexes].sort((a, b) => Number(isGoldGalleryItem(kind, b)) - Number(isGoldGalleryItem(kind, a)) || a - b);
}

function isGoldGalleryItem(kind, index) {
  return Boolean(goldGalleryItems[kind]?.has(index));
}

function tryApplyWornOutfit(src, button) {
  const probe = new Image();
  probe.addEventListener("load", () => {
    characterImage.src = src;
    characterImage.classList.remove("outfit-preview");
  });
  probe.addEventListener("error", () => {
    button.classList.add("missing-worn");
    characterImage.src = defaultCharacterImage();
    characterImage.classList.remove("outfit-preview");
  });
  probe.src = src;
}

function renderStats() {
  const fashionCount = document.querySelector("#fashionCount");
  if (fashionCount) fashionCount.textContent = "54";
  if (momentsCount) momentsCount.textContent = moments.length.toLocaleString("zh-CN");
}

function loadLikes() {
  try {
    const stored = Number(localStorage.getItem(likesStorageKey));
    likes = Number.isFinite(stored) && stored > 0 ? Math.floor(stored) : 0;
  } catch {
    likes = 0;
  }
}

function saveLikes() {
  try {
    localStorage.setItem(likesStorageKey, String(likes));
  } catch {
    // Likes still update on the page even when browser storage is unavailable.
  }
  saveAppSettingToDB(likesStorageKey, likes).catch(() => {});
}

function renderLikes() {
  likeCount.textContent = likes.toLocaleString("zh-CN");
  likeButton.classList.toggle("liked", likes > 0);
  likeButton.querySelector(".heart-icon").textContent = likes > 0 ? "\u2665" : "\u2661";
}

function showDetail(item) {
  dialogBody.style.setProperty("--accent", item.accent);
  dialogBody.style.setProperty("--glow", item.glow);
  dialogBody.innerHTML = `
    <div class="dialog-visual"><div class="sigil" aria-hidden="true"></div></div>
    <div class="dialog-copy">
      <p class="eyebrow">${item.type} / ${item.rarity}</p>
      <h3>${item.name}</h3>
      <p>${item.note}</p>
      <div class="attributes">
        <div><span>閮ㄤ綅</span><strong>${item.slot}</strong></div>
        <div><span>鎴樺姏</span><strong>${item.power ? item.power.toLocaleString("zh-CN") : "澶栬鏀惰棌"}</strong></div>
        <div><span>鍝佽川</span><strong>${item.rarity}</strong></div>
        <div><span>鏍囩</span><strong>${item.tags.join(" 路 ")}</strong></div>
      </div>
    </div>`;
  dialog.showModal();
}

function rerenderFilters() {
  renderFilters(typeFilters, typeOrder, activeType, (value) => {
    activeType = value;
    rerenderFilters();
    renderItems();
    renderFashionGallery();
  });
}

document.querySelector("#closeDialog").addEventListener("click", () => dialog.close());
closePhotoDialog.addEventListener("click", () => photoDialog.close());
photoDialog.addEventListener("click", (event) => {
  if (event.target === photoDialog) photoDialog.close();
});
searchInput.addEventListener("input", renderItems);
searchInput.addEventListener("input", renderFashionGallery);
sortSelect.addEventListener("change", () => {
  renderItems();
  renderFashionGallery();
});

statTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    activateSection(tab.dataset.section);
  });
});

themeNavLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    switchThemePage(link.dataset.themeTarget);
    updateThemeNavActive();
    appShell.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

archiveLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    activateSection(link.dataset.section);
    contentSections[link.dataset.section]?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

hero.addEventListener("pointermove", (event) => {
  const rect = hero.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width - 0.5;
  const y = (event.clientY - rect.top) / rect.height - 0.5;
  hero.style.setProperty("--mx", x.toFixed(3));
  hero.style.setProperty("--my", y.toFixed(3));
});

hero.addEventListener("pointerleave", () => {
  hero.style.setProperty("--mx", "0");
  hero.style.setProperty("--my", "0");
});

function activateSection(target) {
  statTabs.forEach((item) => item.classList.toggle("active", item.dataset.section === target));
  archiveNav?.querySelectorAll("a:not([data-theme-target])").forEach((item) => {
    item.classList.toggle("active", item.dataset.section === target);
  });
  Object.entries(contentSections).forEach(([name, section]) => {
    section.classList.toggle("active", name === target);
  });
}

function switchThemePage(theme) {
  const coverIndex = coverImages.findIndex((cover) => cover.theme === theme);
  if (coverIndex >= 0) activeCoverIndex = coverIndex;
  applyTheme(theme, { syncCover: true });
}

function updateThemeNavActive() {
  document.querySelectorAll(".archive-nav a[data-theme-target]").forEach((link) => {
    link.classList.toggle("active", link.dataset.themeTarget === activeTheme);
  });
}

function activateMomentView(view) {
  activeMomentView = view === "favorites" ? "favorites" : "feed";
  momentModeTabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.momentView === activeMomentView);
  });
  const isFavorites = activeMomentView === "favorites";
  momentPhotoPicker.hidden = isFavorites;
  momentForm.hidden = isFavorites;
  momentsFeed.hidden = isFavorites;
  favoriteWall.hidden = !isFavorites;
  if (isFavorites) renderFavoriteWall();
}

momentModeTabs.forEach((tab) => {
  tab.addEventListener("click", () => activateMomentView(tab.dataset.momentView || "feed"));
});

momentPhoto.addEventListener("change", () => {
  const selectedFiles = Array.from(momentPhoto.files || []).slice(0, 9);
  const files = selectedFiles.filter((file) => file.type.startsWith("image/") && file.size <= maxMomentPhotoBytes);
  if (selectedFiles.length && files.length !== selectedFiles.length) {
    showComposerMessage(`已跳过非图片或超过 ${Math.round(maxMomentPhotoBytes / 1024 / 1024)}MB 的文件。`);
  }
  if (!files.length) {
    addingFromFavoriteWall = false;
    momentPhoto.value = "";
    return;
  }
  Promise.all(files.map(compressImage))
    .then(async (imageDataList) => {
      if (addingFromFavoriteWall) {
        await publishFavoritePhotos(imageDataList);
        addingFromFavoriteWall = false;
        momentPhoto.value = "";
        favoriteWallIndex = 0;
        renderFavoriteWall();
        return;
      }
      selectedMomentPhotos = imageDataList;
      renderComposerPreview();
    })
    .catch(() => {
      addingFromFavoriteWall = false;
      selectedMomentPhotos = [];
      showComposerMessage("鐓х墖璇诲彇澶辫触");
    });
});

momentForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const text = momentText.value.trim();
  if (!text && !selectedMomentPhotos.length) return;

  try {
    await publishMoment(text, selectedMomentPhotos);
    resetComposer();
    renderMoments();
    renderStats();
  } catch {
    showComposerMessage("保存失败，图片可能太大，请换小一点的图片再试。");
  }
});

enterButton.addEventListener("click", () => {
  const currentCover = coverImages[activeCoverIndex];
  const currentTheme = currentCover ? currentCover.theme : "ice";
  applyTheme(currentTheme);
  stopCoverMusic();
  coverMusic.removeAttribute("autoplay");
  window._hasEntered = true;
  document.body.classList.add("entered");
  window.setTimeout(() => document.body.classList.remove("has-cover"), 760);
});

coverReturn.addEventListener("click", () => {
  window._hasEntered = false;
  window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  document.body.classList.add("has-cover");
  document.body.classList.remove("entered");
  coverMusic.autoplay = true;
  coverMusic.muted = false;
  tryStartCoverMusic();
});

coverPrev.addEventListener("click", () => changeCover(-1));
coverNext.addEventListener("click", () => changeCover(1));
coverImage.addEventListener("animationend", () => coverImage.classList.remove("switching"));

musicToggle.addEventListener("click", async () => {
  if (coverMusic.paused) {
    await tryStartCoverMusic();
    return;
  }
  stopCoverMusic();
});

function handleLikeClick() {
  likes += 1;
  saveLikes();
  renderLikes();
  burstHearts(likeButton);
}

likeWidget.addEventListener("click", handleLikeClick);

async function tryStartCoverMusic() {
  if (window._hasEntered || !document.body.classList.contains("has-cover") || !coverMusic.paused) return;
  try {
    await coverMusic.play();
    musicToggle.classList.add("playing");
    musicToggle.setAttribute("aria-label", "鍏抽棴鑳屾櫙闊充箰");
  } catch {
    musicToggle.classList.remove("playing");
    musicToggle.setAttribute("aria-label", "鐐瑰嚮鎾斁鑳屾櫙闊充箰");
  }
}

function stopCoverMusic() {
  coverMusic.autoplay = false;
  coverMusic.muted = true;
  coverMusic.pause();
  coverMusic.currentTime = 0;
  coverMusic.removeAttribute("autoplay");
  musicToggle.classList.remove("playing");
  musicToggle.setAttribute("aria-label", "鎾斁鑳屾櫙闊充箰");
}

function burstHearts(anchor) {
  const rect = anchor.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  for (let index = 0; index < 7; index += 1) {
    const heart = document.createElement("span");
    heart.className = "floating-heart";
    heart.textContent = "\u2665";
    heart.style.left = `${centerX}px`;
    heart.style.top = `${centerY}px`;
    heart.style.setProperty("--drift", `${(Math.random() * 90 - 45).toFixed(0)}px`);
    heart.style.setProperty("--spin", `${(Math.random() * 70 - 35).toFixed(0)}deg`);
    heart.style.animationDelay = `${index * 32}ms`;
    document.body.appendChild(heart);
    heart.addEventListener("animationend", () => heart.remove(), { once: true });
  }
}

function compressImage(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Only image files can be uploaded."));
      return;
    }
    if (file.size > maxMomentPhotoBytes) {
      reject(new Error("Image file is too large."));
      return;
    }
    const reader = new FileReader();
    reader.addEventListener("error", reject);
    reader.addEventListener("load", () => {
      const img = new Image();
      img.addEventListener("error", reject);
      img.addEventListener("load", () => {
        const maxSize = maxMomentPhotoEdge;
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      });
      img.src = String(reader.result);
    });
    reader.readAsDataURL(file);
  });
}

function createMomentId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `moment-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function resetComposer() {
  selectedMomentPhotos = [];
  momentText.value = "";
  momentPhoto.value = "";
  composerPreview.innerHTML = "<span>照片预览</span>";
}

function showComposerMessage(message) {
  composerPreview.innerHTML = `<span>${escapeHTML(message)}</span>`;
  window.setTimeout(() => {
    if (!selectedMomentPhotos.length) composerPreview.innerHTML = "<span>照片预览</span>";
  }, 1800);
}

function renderComposerPreview() {
  if (!selectedMomentPhotos.length) {
    composerPreview.innerHTML = "<span>照片预览</span>";
    return;
  }
  composerPreview.innerHTML = `
    <div class="composer-photo-grid" data-count="${selectedMomentPhotos.length}">
      ${selectedMomentPhotos.map((photo, index) => `
        <img src="${photo}" alt="照片预览 ${index + 1}" />
      `).join("")}
    </div>`;
}

async function publishMoment(text, photos) {
  const photoList = normalizePhotoList(photos).slice(0, 9);
  const nextMoment = {
    id: createMomentId(),
    text,
    photo: photoList[0] || "",
    photos: photoList,
    hasPhoto: photoList.length > 0,
    createdAt: new Date().toISOString(),
    comments: []
  };

  await saveMomentToDB(nextMoment);
  moments = [nextMoment, ...moments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (nextMoment.photos.length) momentPhotos.set(nextMoment.id, nextMoment.photos);
  return nextMoment;
}

async function publishFavoritePhotos(photos) {
  const nextFavorites = normalizePhotoList(photos).slice(0, 9).map((photo) => ({
    id: createMomentId(),
    photo,
    createdAt: new Date().toISOString()
  }));

  for (const favorite of nextFavorites) {
    await saveFavoritePhotoToDB(favorite);
  }
  favoritePhotos = [...nextFavorites, ...favoritePhotos].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return nextFavorites;
}

function renderMoments() {
  momentsFeed.innerHTML = "";
  if (!moments.length) {
    momentsFeed.innerHTML = `<div class="empty-moments">还没有动态，上传一张照片或写一句话开始记录。</div>`;
    return;
  }

  moments.forEach((moment) => {
    const card = document.createElement("article");
    card.className = "moment-card";
    card.innerHTML = `
      <div class="moment-avatar"><img src="assets/moments-avatar.png" alt="莱茵头像" /></div>
      <div>
        <div class="moment-top">
          <div><p class="moment-name">莱茵</p><span class="moment-time">${formatMomentTime(moment.createdAt)}</span></div>
          <button class="delete-moment" type="button" data-id="${moment.id}" aria-label="删除这条动态">删除</button>
        </div>
        ${moment.text ? `<p class="moment-text">${escapeHTML(moment.text)}</p>` : ""}
        ${getMomentPhotoMarkup(moment)}
        <div class="comments">
          ${renderComments(moment.comments)}
          <form class="comment-form" data-id="${moment.id}">
            <input type="text" name="comment" placeholder="写留言..." autocomplete="off" />
            <button type="submit">留言</button>
          </form>
        </div>
      </div>`;
    momentsFeed.appendChild(card);
  });

  momentsFeed.querySelectorAll(".comment-form").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = form.elements.comment;
      const text = input.value.trim();
      if (!text) return;
      const moment = moments.find((entry) => entry.id === form.dataset.id);
      if (!moment) return;
      moment.comments.push({ author: "访客", text, createdAt: new Date().toISOString() });
      updateMomentInDB(moment).then(() => renderMoments()).catch(() => {
        input.placeholder = "留言保存失败";
      });
    });
  });

  momentsFeed.querySelectorAll(".delete-moment").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.id;
      deleteMomentFromDB(id).then(() => {
        moments = moments.filter((entry) => entry.id !== id);
        momentPhotos.delete(id);
        renderMoments();
        renderStats();
      });
    });
  });

  momentsFeed.querySelectorAll(".moment-photo").forEach((image) => {
    image.addEventListener("click", () => {
      photoDialogImage.src = image.src;
      photoDialog.showModal();
    });
  });
}

function renderFavoriteWall() {
  const photoMoments = favoritePhotos;
  favoriteWall.innerHTML = "";
  if (!photoMoments.length) {
    favoriteWallIndex = 0;
    favoriteWall.innerHTML = `
      <div class="empty-favorite-wall">
        <p>还没有收藏照片，先添加一张照片。</p>
        <button class="wall-add-photo" type="button">+ 添加照片</button>
      </div>`;
    bindFavoriteWallAddButton();
    return;
  }

  favoriteWallIndex = wrapIndex(favoriteWallIndex, photoMoments.length);
  const featured = photoMoments[favoriteWallIndex];
  const thumbnailCount = Math.min(8, Math.max(photoMoments.length, 1));
  const wallItems = Array.from({ length: thumbnailCount }, (_, offset) => {
    const itemIndex = wrapIndex(favoriteWallIndex + offset, photoMoments.length);
    return { ...photoMoments[itemIndex], itemIndex };
  });
  favoriteWall.innerHTML = `
    <div class="favorite-wall-stage">
      <article class="favorite-feature" data-photo="${escapeHTML(featured.photo)}">
        <img src="${featured.photo}" alt="收藏照片" />
        <div><span>Favorite Wall</span><strong>${formatMomentTime(featured.createdAt)}</strong></div>
      </article>
      <div class="favorite-wall-panel">
        <div class="favorite-wall-toolbar" aria-label="照片墙操作">
          <button class="wall-add-photo" type="button">+ 添加照片</button>
          <div class="wall-carousel-controls">
            <button class="wall-nav wall-nav-prev" type="button" aria-label="上一张照片"><span aria-hidden="true">&lt;</span></button>
            <span>${favoriteWallIndex + 1} / ${photoMoments.length}</span>
            <button class="wall-nav wall-nav-next" type="button" aria-label="下一张照片"><span aria-hidden="true">&gt;</span></button>
          </div>
        </div>
        <div class="favorite-photo-grid">
          ${wallItems.map((moment, index) => `
            <button class="favorite-photo-card ${index === 0 ? "active" : ""}" type="button" style="--delay: ${index * -1.6}s" data-index="${moment.itemIndex}" data-photo="${escapeHTML(moment.photo)}">
            <img src="${moment.photo}" alt="收藏照片 ${index + 1}" />
          </button>
        `).join("")}
        </div>
      </div>
    </div>`;

  favoriteWall.querySelector(".favorite-feature")?.addEventListener("click", (event) => {
    const photo = event.currentTarget.dataset.photo;
    if (!photo) return;
    photoDialogImage.src = photo;
    photoDialog.showModal();
  });

  favoriteWall.querySelectorAll(".favorite-photo-card").forEach((button) => {
    button.addEventListener("click", () => {
      favoriteWallIndex = Number(button.dataset.index) || 0;
      renderFavoriteWall();
    });
  });

  favoriteWall.querySelector(".wall-nav-prev")?.addEventListener("click", () => {
    favoriteWallIndex = wrapIndex(favoriteWallIndex - 1, photoMoments.length);
    renderFavoriteWall();
  });

  favoriteWall.querySelector(".wall-nav-next")?.addEventListener("click", () => {
    favoriteWallIndex = wrapIndex(favoriteWallIndex + 1, photoMoments.length);
    renderFavoriteWall();
  });

  bindFavoriteWallAddButton();
}

function bindFavoriteWallAddButton() {
  favoriteWall.querySelector(".wall-add-photo")?.addEventListener("click", () => {
    addingFromFavoriteWall = true;
    momentPhoto.click();
  });
}

function wrapIndex(index, length) {
  if (!length) return 0;
  return (index + length) % length;
}

function changeCover(step) {
  activeCoverIndex = (activeCoverIndex + step + coverImages.length) % coverImages.length;
  const nextCover = coverImages[activeCoverIndex];
  activeTheme = nextCover.theme;
  document.body.dataset.theme = activeTheme;
  document.body.dataset.coverTheme = activeTheme;
  coverImage.classList.remove("switching");
  void coverImage.offsetWidth;
  setSafeImage(coverImage, nextCover.src, nextCover.alt, coverImages[0].src);
  coverImage.classList.add("switching");
  updateThemeNavActive();
}

function setSafeImage(image, src, alt = "", fallbackSrc = "") {
  if (!image) return;
  image.classList.remove("missing-asset");
  image.onerror = () => {
    image.classList.add("missing-asset");
    if (fallbackSrc && image.getAttribute("src") !== fallbackSrc) {
      image.onerror = null;
      image.src = fallbackSrc;
    }
  };
  image.src = src;
  image.alt = alt;
}

function applyTheme(theme, options = {}) {
  activeTheme = themeAssets[theme] ? theme : "ice";
  const assets = themeAssets[activeTheme];
  document.body.classList.add("theme-fading");
  document.body.dataset.theme = activeTheme;
  document.body.dataset.coverTheme = activeTheme;
  setSafeImage(characterImage, assets.character, assets.label, themeAssets.ice.character);
  setSafeImage(heroLogoArt, assets.logo, "", themeAssets.ice.logo);
  characterImage.classList.remove("outfit-preview");
  if (options.syncCover) {
    const cover = coverImages[activeCoverIndex];
    setSafeImage(coverImage, cover.src, cover.alt, coverImages[0].src);
  }
  updateThemeNavActive();
  window.setTimeout(() => document.body.classList.remove("theme-fading"), 640);
}

function renderComments(comments) {
  if (!comments.length) return `<div class="comment">还没有留言。</div>`;
  return comments.map((comment) => `<div class="comment"><strong>${escapeHTML(comment.author)}：</strong>${escapeHTML(comment.text)}</div>`).join("");
}

function getMomentPhotoMarkup(moment) {
  const photos = getMomentPhotos(moment);
  if (photos.length) {
    return `
      <div class="moment-photo-grid" data-count="${photos.length}">
        ${photos.map((photo, index) => `
          <img class="moment-photo" src="${photo}" alt="朋友圈照片 ${index + 1}" />
        `).join("")}
      </div>`;
  }
  if (moment.hasPhoto) return `<div class="comment">照片正在从本地数据库读取。</div>`;
  return "";
}

function getMomentPhotos(moment) {
  const cached = momentPhotos.get(moment.id);
  const cachedPhotos = normalizePhotoList(cached);
  if (cachedPhotos.length) return cachedPhotos;
  return normalizePhotoList(moment.photos || moment.photo);
}

function normalizePhotoList(value) {
  if (Array.isArray(value)) return value.filter((photo) => typeof photo === "string" && photo);
  if (typeof value === "string" && value) return [value];
  return [];
}

async function bootstrap() {
  loadLikes();
  renderLikes();
  renderStats();
  rerenderFilters();
  renderItems();
  renderFashionGallery();
  const storedLikes = await loadAppSettingFromDB(likesStorageKey);
  if (Number.isFinite(Number(storedLikes)) && Number(storedLikes) > 0) {
    likes = Math.floor(Number(storedLikes));
    renderLikes();
  } else if (likes > 0) {
    saveLikes();
  }
  try {
    moments = (await loadMomentsFromDB()).map(normalizeMoment).filter(Boolean);
  } catch {
    moments = [];
  }
  try {
    favoritePhotos = (await loadFavoritePhotosFromDB()).map(normalizeFavoritePhoto).filter(Boolean);
  } catch {
    favoritePhotos = [];
  }
  moments.forEach((moment) => {
    const photos = getMomentPhotos(moment);
    if (photos.length) momentPhotos.set(moment.id, photos);
  });
  renderStats();
  renderMoments();
  if (activeMomentView === "favorites") renderFavoriteWall();
}

function normalizeMoment(moment) {
  if (!moment || typeof moment !== "object") return null;
  const photos = normalizePhotoList(moment.photos || moment.photo).slice(0, 9);
  return {
    id: moment.id || createMomentId(),
    text: typeof moment.text === "string" ? moment.text : "",
    photo: photos[0] || "",
    photos,
    hasPhoto: Boolean(moment.hasPhoto || photos.length),
    createdAt: moment.createdAt || new Date().toISOString(),
    comments: Array.isArray(moment.comments) ? moment.comments : []
  };
}

function normalizeFavoritePhoto(item) {
  if (!item || typeof item !== "object" || typeof item.photo !== "string" || !item.photo) return null;
  return {
    id: item.id || createMomentId(),
    photo: item.photo,
    createdAt: item.createdAt || new Date().toISOString()
  };
}

function openMomentsDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("rhein-moments-db", 2);
    request.addEventListener("upgradeneeded", () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("moments")) {
        db.createObjectStore("moments", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("favorites")) {
        db.createObjectStore("favorites", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings", { keyPath: "key" });
      }
    });
    request.addEventListener("success", () => resolve(request.result));
    request.addEventListener("error", () => reject(request.error));
  });
}

async function loadMomentsFromDB() {
  try {
    const db = await openMomentsDB();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction("moments", "readonly");
      const store = tx.objectStore("moments");
      const request = store.getAll();
      request.addEventListener("success", () => {
        const result = request.result || [];
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        resolve(result);
      });
      request.addEventListener("error", () => reject(request.error));
    });
  } catch {
    return [];
  }
}

async function loadFavoritePhotosFromDB() {
  try {
    const db = await openMomentsDB();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction("favorites", "readonly");
      const store = tx.objectStore("favorites");
      const request = store.getAll();
      request.addEventListener("success", () => {
        const result = request.result || [];
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        resolve(result);
      });
      request.addEventListener("error", () => reject(request.error));
    });
  } catch {
    return [];
  }
}

async function loadAppSettingFromDB(key) {
  try {
    const db = await openMomentsDB();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction("settings", "readonly");
      const request = tx.objectStore("settings").get(key);
      request.addEventListener("success", () => resolve(request.result?.value));
      request.addEventListener("error", () => reject(request.error));
    });
  } catch {
    return null;
  }
}

async function saveMomentToDB(moment) {
  const db = await openMomentsDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("moments", "readwrite");
    tx.objectStore("moments").put(moment);
    tx.addEventListener("complete", resolve);
    tx.addEventListener("error", () => reject(tx.error));
  });
}

async function saveFavoritePhotoToDB(favorite) {
  const db = await openMomentsDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("favorites", "readwrite");
    tx.objectStore("favorites").put(favorite);
    tx.addEventListener("complete", resolve);
    tx.addEventListener("error", () => reject(tx.error));
  });
}

async function saveAppSettingToDB(key, value) {
  const db = await openMomentsDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("settings", "readwrite");
    tx.objectStore("settings").put({ key, value });
    tx.addEventListener("complete", resolve);
    tx.addEventListener("error", () => reject(tx.error));
  });
}

function updateMomentInDB(moment) {
  return saveMomentToDB(moment);
}

async function deleteMomentFromDB(id) {
  const db = await openMomentsDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("moments", "readwrite");
    tx.objectStore("moments").delete(id);
    tx.addEventListener("complete", resolve);
    tx.addEventListener("error", () => reject(tx.error));
  });
}

function formatMomentTime(value) {
  return new Intl.DateTimeFormat("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function escapeHTML(value) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
}
