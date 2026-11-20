import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  orderBy,
  query,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { getVideoThumbnail, parseVideoUrl } from "./video-utils.js";

const translations = {
  ar: {
    navWork: "الأعمال", navAbout: "نبذة", navContact: "تواصل", startProject: "ابدأ مشروعك",
    heroEyebrow: "استوديو مونتاج وإبداع بصري", heroTitle: "كل لقطة<br>لها <span>حكاية.</span>",
    heroDescription: "نحوّل فكرتك إلى صورة تتحرك، وصوت يُحسّ، وقصة تبقى في الذاكرة.",
    exploreWork: "اكتشف أعمالي", moreAbout: "تعرّف عليّ", heroFootnote: "فكرة · مونتاج · أثر",
    artCaption: "صورة. بإحساس مختلف.", floatingNote: "كل إطار محسوب", qualityNote: "تفاصيل تستحق المشاهدة",
    scroll: "مرّر للاستكشاف", selectedWork: "مختارات من أعمالي", workTitle: "مشاريع <span>تتحدث.</span>",
    workDescription: "من الفكرة الأولى إلى آخر فريم — أعمال صُنعت بعناية لتصل إلى جمهورك.",
    loading: "جارٍ تحميل الأعمال...", aboutEyebrow: "خلف كل لقطة، فكرة",
    aboutTitle: "أصنع محتوى<br>يستحق <span>التوقّف.</span>",
    aboutDescription: "أنا محرر فيديو أؤمن بأن المونتاج ليس مجرد ترتيب لقطات، بل فنّ يمنح كل قصة إيقاعها وصوتها الخاص. من فيديوهات السوشيال ميديا إلى المحتوى الإعلاني، أعمل على أن يصل شعورك كما أردته تماماً.",
    skillEditing: "مونتاج إبداعي", skillSocial: "محتوى قصير", skillColor: "معالجة لونية", skillSound: "تصميم صوتي",
    contactEyebrow: "الخطوة الأولى تبدأ هنا", contactTitle: "لديك قصة؟<br><span>لنعرضها للعالم.</span>",
    contactButton: "احكِ لي عن مشروعك", whatsappButton: "تواصل معي عبر واتساب", footerNote: "إطارات تصنع فرقاً.",
    emptyTitle: "مساحة قصتك تبدأ هنا", emptyDescription: "ستظهر هنا الأعمال الجديدة عند توفرها.",
    workCount: "عمل", openVideo: "شاهد العمل", featured: "مميز",
    categoryCommercial: "إعلان تجاري", categorySocial: "محتوى اجتماعي", categoryDocumentary: "وثائقي",
    categoryMotion: "موشن جرافيك", categoryMusic: "فيديو موسيقي", categoryOther: "متنوع",
    platformYouTube: "يوتيوب", platformInstagram: "إنستغرام", platformTikTok: "تيك توك",
    instagramPreview: "معاينة فيديو إنستغرام",
    videoUnavailable: "تعذّر عرض هذا الفيديو هنا. جرّب فتحه مباشرة على المنصة.",
  },
  en: {
    navWork: "Work", navAbout: "About", navContact: "Contact", startProject: "Start a project",
    heroEyebrow: "Video editing & visual studio", heroTitle: "Every frame<br>has a <span>story.</span>",
    heroDescription: "We turn your idea into moving images, a feeling in sound, and a story that stays with you.",
    exploreWork: "Explore my work", moreAbout: "Meet the editor", heroFootnote: "Idea · Edit · Impact",
    artCaption: "A frame. A different feeling.", floatingNote: "Every frame, intentional", qualityNote: "Details worth watching",
    scroll: "Scroll to explore", selectedWork: "A selection of my work", workTitle: "Projects that <span>speak.</span>",
    workDescription: "From the first idea to the final frame — carefully crafted work made to connect with your audience.",
    loading: "Loading projects...", aboutEyebrow: "Behind every frame, an idea",
    aboutTitle: "I create work<br>worth <span>pausing for.</span>",
    aboutDescription: "I'm a video editor who believes editing is more than arranging shots — it's the art of giving every story its own rhythm and voice. From social videos to branded films, I work to make your vision feel exactly as you imagined it.",
    skillEditing: "Creative editing", skillSocial: "Short-form content", skillColor: "Color grading", skillSound: "Sound design",
    contactEyebrow: "Your next story starts here", contactTitle: "Have a story?<br><span>Let's show the world.</span>",
    contactButton: "Tell me about your project", whatsappButton: "Contact me on WhatsApp", footerNote: "Frames that make a difference.",
    emptyTitle: "Your story starts here", emptyDescription: "New projects will appear here as they become available.",
    workCount: "projects", openVideo: "Watch project", featured: "Featured",
    categoryCommercial: "Commercial", categorySocial: "Social content", categoryDocumentary: "Documentary",
    categoryMotion: "Motion graphics", categoryMusic: "Music video", categoryOther: "Other",
    platformYouTube: "YouTube", platformInstagram: "Instagram", platformTikTok: "TikTok",
    instagramPreview: "Instagram video preview",
    videoUnavailable: "This video could not be embedded. Try opening it directly on the platform.",
  },
  fr: {
    navWork: "Projets", navAbout: "À propos", navContact: "Contact", startProject: "Démarrer un projet",
    heroEyebrow: "Studio de montage & création visuelle", heroTitle: "Chaque plan<br>a son <span>histoire.</span>",
    heroDescription: "Nous transformons votre idée en images en mouvement, en émotion sonore et en une histoire qui reste.",
    exploreWork: "Découvrir mes projets", moreAbout: "Rencontrer le monteur", heroFootnote: "Idée · Montage · Impact",
    artCaption: "Une image. Une autre émotion.", floatingNote: "Chaque image est pensée", qualityNote: "Des détails à savourer",
    scroll: "Défiler pour découvrir", selectedWork: "Une sélection de mes projets", workTitle: "Des projets qui <span>parlent.</span>",
    workDescription: "De la première idée à la dernière image — des créations soignées pour toucher votre public.",
    loading: "Chargement des projets...", aboutEyebrow: "Derrière chaque image, une idée",
    aboutTitle: "Je crée des vidéos<br>qui méritent une <span>pause.</span>",
    aboutDescription: "Monteur vidéo, je crois que le montage ne consiste pas seulement à assembler des plans : c'est l'art de donner à chaque histoire son propre rythme et sa propre voix. Des réseaux sociaux aux films de marque, je donne vie à votre vision.",
    skillEditing: "Montage créatif", skillSocial: "Format court", skillColor: "Étalonnage", skillSound: "Design sonore",
    contactEyebrow: "Votre prochaine histoire commence ici", contactTitle: "Une histoire à raconter ?<br><span>Montrons-la au monde.</span>",
    contactButton: "Parlons de votre projet", whatsappButton: "Me contacter sur WhatsApp", footerNote: "Des images qui font la différence.",
    emptyTitle: "Votre histoire commence ici", emptyDescription: "Les nouveaux projets apparaîtront ici dès qu'ils seront disponibles.",
    workCount: "projets", openVideo: "Voir le projet", featured: "À la une",
    categoryCommercial: "Publicité", categorySocial: "Réseaux sociaux", categoryDocumentary: "Documentaire",
    categoryMotion: "Motion design", categoryMusic: "Clip musical", categoryOther: "Autre",
    platformYouTube: "YouTube", platformInstagram: "Instagram", platformTikTok: "TikTok",
    instagramPreview: "Aperçu de la vidéo Instagram",
    videoUnavailable: "Cette vidéo ne peut pas être intégrée. Essayez de l'ouvrir directement sur la plateforme.",
  },
};

const categoryKeys = {
  commercial: "categoryCommercial",
  social: "categorySocial",
  documentary: "categoryDocumentary",
  motion: "categoryMotion",
  music: "categoryMusic",
  other: "categoryOther",
};

let language = localStorage.getItem("vexo-language") || "ar";
if (!translations[language]) language = "ar";
let projects = [];
let toastTimer;

const $ = (selector, root = document) => root.querySelector(selector);
const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[char]));

function t(key) {
  return translations[language][key] || translations.en[key] || key;
}

function applyLanguage(nextLanguage) {
  language = translations[nextLanguage] ? nextLanguage : "ar";
  localStorage.setItem("vexo-language", language);
  document.documentElement.lang = language;
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  document.body.dir = language === "ar" ? "rtl" : "ltr";
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const value = t(element.dataset.i18n);
    if (value.includes("<br>") || value.includes("<span>")) element.innerHTML = value;
    else element.textContent = value;
  });
  document.querySelectorAll("[data-language]").forEach((button) => {
    button.classList.toggle("active", button.dataset.language === language);
    button.setAttribute("aria-pressed", String(button.dataset.language === language));
  });
  document.title = language === "ar"
    ? "VEXO — مونتاج يصنع الفرق"
    : language === "fr" ? "VEXO — Le montage fait la différence" : "VEXO — Editing that makes a difference";
  renderProjects();
}

function platformLabel(platform) {
  const key = { youtube: "platformYouTube", instagram: "platformInstagram", tiktok: "platformTikTok" }[platform];
  return key ? t(key) : "VEXO";
}

function revealElements() {
  const elements = document.querySelectorAll(".reveal:not(.is-visible)");
  if (!("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  elements.forEach((element) => observer.observe(element));
}

function renderProjects() {
  const grid = $("#projects-grid");
  if (!grid) return;
  const count = $("#project-count");
  if (count) count.textContent = `${String(projects.length).padStart(2, "0")} ${t("workCount")}`;
  if (projects.length === 0) {
    grid.innerHTML = `<div class="empty-state"><strong>${escapeHtml(t("emptyTitle"))}</strong><span>${escapeHtml(t("emptyDescription"))}</span></div>`;
    return;
  }
  grid.innerHTML = projects.map((project, index) => {
    const video = parseVideoUrl(project.videoUrl || "");
    if (!video) return "";
    const platformClass = `poster-${video.platform}`;
    const category = t(categoryKeys[project.category] || "categoryOther");
    const image = project.thumbnailUrl || video.thumbnail;
    const poster = image
      ? `<img src="${escapeHtml(image)}" alt="" loading="lazy" onerror="this.remove()">`
      : video.platform === "instagram"
        ? `<iframe class="poster-instagram-embed" src="${escapeHtml(video.embed)}" title="${escapeHtml(t("instagramPreview"))}: ${escapeHtml(project.title)}" loading="lazy" scrolling="no" tabindex="-1" aria-hidden="true" referrerpolicy="strict-origin-when-cross-origin"></iframe>`
        : `<span class="poster-word">VEXO / ${escapeHtml(platformLabel(video.platform).toUpperCase())}</span>`;
    const direction = language === "ar" ? "↙" : "↗";
    return `<article class="project-card reveal" tabindex="0" role="button" aria-label="${escapeHtml(t("openVideo"))}: ${escapeHtml(project.title)}" data-project-index="${index}">
      <div class="project-poster ${platformClass}" data-video-url="${escapeHtml(project.videoUrl || "")}">${poster}<span class="project-platform">${escapeHtml(platformLabel(video.platform))}</span>${project.featured ? `<span class="featured-badge">${escapeHtml(t("featured"))}</span>` : ""}<span class="poster-play">▶</span><span class="poster-index">${String(index + 1).padStart(2, "0")}</span></div>
      <div class="project-info"><div><h3>${escapeHtml(project.title)}</h3><p>${escapeHtml(category)}</p>${project.description ? `<p class="project-description">${escapeHtml(project.description)}</p>` : ""}</div><span class="project-arrow">${direction}</span></div>
    </article>`;
  }).join("");
  grid.querySelectorAll(".project-card").forEach((card) => {
    const project = projects[Number(card.dataset.projectIndex)];
    const video = parseVideoUrl(project?.videoUrl || "");
    const poster = $(".project-poster", card);
    if (poster && video && !project?.thumbnailUrl && !video.thumbnail) {
      getVideoThumbnail(video.sourceUrl).then((thumbnail) => {
        if (!thumbnail || !poster.isConnected) return;
        const image = document.createElement("img");
        image.src = thumbnail;
        image.alt = "";
        image.loading = "lazy";
        image.onerror = () => image.remove();
        poster.querySelector(".poster-word")?.remove();
        poster.prepend(image);
      });
    }
    const open = () => openProject(Number(card.dataset.projectIndex));
    card.addEventListener("click", open);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    });
  });
  revealElements();
}

function openProject(index) {
  const project = projects[index];
  const video = project && parseVideoUrl(project.videoUrl || "");
  const dialog = $("#video-dialog");
  if (!project || !video || !dialog) return;
  const frame = $(".video-dialog-frame", dialog);
  frame.classList.toggle("vertical", video.platform !== "youtube");
  const iframe = document.createElement("iframe");
  iframe.src = video.embed;
  iframe.title = project.title;
  iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
  iframe.allowFullscreen = true;
  iframe.referrerPolicy = "strict-origin-when-cross-origin";
  frame.replaceChildren(iframe);
  $(".video-dialog-caption", dialog).textContent = project.title;
  dialog.showModal();
}

function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 2800);
}

async function loadProjects() {
  try {
    const snapshot = await getDocs(query(collection(db, "projects"), orderBy("createdAt", "desc")));
    projects = snapshot.docs.map((documentSnapshot) => ({ id: documentSnapshot.id, ...documentSnapshot.data() }));
    renderProjects();
  } catch (error) {
    console.error("Could not load VEXO projects:", error);
    const grid = $("#projects-grid");
    if (grid) {
      const message = error.code === "permission-denied"
        ? (language === "ar" ? "تعذّر الوصول إلى الأعمال. تحقّق من قواعد Firestore." : language === "fr" ? "Accès refusé. Vérifiez les règles Firestore." : "Access denied. Check your Firestore rules.")
        : (language === "ar" ? "تعذّر تحميل الأعمال. تأكّد من إعداد Firebase والاتصال بالإنترنت." : language === "fr" ? "Impossible de charger les projets. Vérifiez Firebase et votre connexion." : "Could not load projects. Check Firebase setup and your connection.");
      grid.innerHTML = `<div class="error-state">${escapeHtml(message)}</div>`;
    }
  }
}

document.querySelectorAll("[data-language]").forEach((button) => {
  button.addEventListener("click", () => applyLanguage(button.dataset.language));
});

const menuToggle = $(".menu-toggle");
menuToggle?.addEventListener("click", () => {
  const isOpen = $(".main-nav").classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});
document.querySelectorAll(".main-nav a").forEach((link) => {
  link.addEventListener("click", () => {
    $(".main-nav").classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

const videoDialog = $("#video-dialog");
$(".dialog-close")?.addEventListener("click", () => videoDialog.close());
videoDialog?.addEventListener("click", (event) => {
  if (event.target === videoDialog) videoDialog.close();
});
videoDialog?.addEventListener("close", () => $(".video-dialog-frame", videoDialog).replaceChildren());
$("#year").textContent = new Date().getFullYear();
document.documentElement.classList.add("app-ready");
applyLanguage(language);
revealElements();
loadProjects();
