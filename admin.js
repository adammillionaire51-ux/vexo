import { auth, db } from "./firebase.js";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { parseVideoUrl } from "./video-utils.js";

const translations = {
  ar: {
    adminLabel: "ADMIN STUDIO", backToSite: "العودة إلى الموقع ↗", adminEyebrow: "مساحة آمنة لإدارة أعمالك",
    adminTitle: "لوحة الإدارة", adminDescription: "أضف أعمالك إلى المعرض باستخدام روابط YouTube أو Instagram Reels أو TikTok.",
    loginTitle: "تسجيل الدخول", loginDescription: "سجّل الدخول ببريد المدير وكلمة المرور المسجّلين في Firebase Authentication.",
    emailLabel: "البريد الإلكتروني", passwordLabel: "كلمة المرور", loginButton: "دخول آمن", noPublicSignup: "لا يوجد إنشاء حسابات عامة.",
    signedInAs: "مسجّل الدخول:", logoutButton: "تسجيل الخروج", addProjectTitle: "إضافة عمل جديد",
    formDescription: "أدخل بيانات العمل والرابط المباشر للفيديو.", projectTitleLabel: "عنوان العمل",
    projectDescriptionLabel: "وصف مختصر (اختياري)", categoryLabel: "التصنيف",
    categoryCommercial: "إعلان تجاري", categorySocial: "محتوى اجتماعي", categoryDocumentary: "وثائقي",
    categoryMotion: "موشن جرافيك", categoryMusic: "فيديو موسيقي", categoryOther: "متنوع",
    videoUrlLabel: "رابط الفيديو", videoUrlHint: "روابط YouTube وInstagram Reels وTikTok فقط.",
    thumbnailLabel: "رابط صورة الغلاف (اختياري)",
    thumbnailHint: "للمقاطع الخاصة أو التي لا تسمح بالتضمين، أضف رابط صورة الغلاف هنا.", featuredLabel: "تمييز هذا العمل",
    saveProject: "حفظ العمل", updateProject: "حفظ التعديلات", cancelEdit: "إلغاء التعديل",
    manageProjectsTitle: "الأعمال المنشورة", managedCount: "عمل في المعرض",
    securityNotice: "تُخزَّن روابط الفيديو والبيانات في Firestore. تُعرض الفيديوهات من منصاتها الأصلية دون رفع ملفات الفيديو إلى موقعك.",
    adminFooter: "لوحة إدارة محمية بـ Firebase Authentication", loadingProjects: "جارٍ تحميل الأعمال...",
    noProjects: "لا توجد أعمال بعد. أضف أول فيديو من النموذج.", edit: "تعديل", delete: "حذف",
    projectSaved: "تم حفظ العمل بنجاح.", projectUpdated: "تم تحديث العمل.", projectDeleted: "تم حذف العمل.",
    invalidVideo: "أدخل رابط فيديو صالحاً من YouTube أو Instagram Reels أو TikTok.",
    invalidThumbnail: "أدخل رابط صورة صحيحاً يبدأ بـ https:// أو http://.",
    requiredTitle: "يرجى إدخال عنوان العمل.", confirmDelete: "هل أنت متأكد من حذف هذا العمل؟",
    authInvalid: "البريد الإلكتروني أو كلمة المرور غير صحيحين.", authDisabled: "هذا الحساب معطّل. تواصل مع مالك Firebase.",
    authUnconfigured: "تأكّد من تفعيل Email/Password في Firebase Authentication وإنشاء حساب المدير.",
    networkError: "تعذّر الاتصال. تحقّق من الإنترنت وحاول مجدداً.", genericAuthError: "تعذّر تسجيل الدخول. تحقّق من بيانات الحساب وإعداد Firebase.",
    permissionError: "ليس لديك صلاحية لهذا الإجراء. تحقّق من قواعد Firestore وبريد المدير المسموح.",
    loadError: "تعذّر تحميل الأعمال. تحقّق من إعداد Firestore.", saveError: "تعذّر حفظ العمل.",
    deleteError: "تعذّر حذف العمل.", logoutError: "تعذّر تسجيل الخروج.",
  },
  en: {
    adminLabel: "ADMIN STUDIO", backToSite: "Back to site ↗", adminEyebrow: "A secure space to manage your work",
    adminTitle: "Admin studio", adminDescription: "Add projects using YouTube, Instagram Reels, or TikTok links.",
    loginTitle: "Sign in", loginDescription: "Sign in with the admin email and password registered in Firebase Authentication.",
    emailLabel: "Email address", passwordLabel: "Password", loginButton: "Secure sign in", noPublicSignup: "Public account creation is disabled.",
    signedInAs: "Signed in as:", logoutButton: "Sign out", addProjectTitle: "Add a project",
    formDescription: "Enter the project details and a direct video link.", projectTitleLabel: "Project title",
    projectDescriptionLabel: "Short description (optional)", categoryLabel: "Category",
    categoryCommercial: "Commercial", categorySocial: "Social content", categoryDocumentary: "Documentary",
    categoryMotion: "Motion graphics", categoryMusic: "Music video", categoryOther: "Other",
    videoUrlLabel: "Video URL", videoUrlHint: "YouTube, Instagram Reels, and TikTok links only.",
    thumbnailLabel: "Cover image URL (optional)",
    thumbnailHint: "For private or non-embeddable Instagram videos, add a cover image URL here.", featuredLabel: "Feature this project",
    saveProject: "Save project", updateProject: "Save changes", cancelEdit: "Cancel editing",
    manageProjectsTitle: "Published projects", managedCount: "projects in gallery",
    securityNotice: "Video links and project details are stored in Firestore. Videos play on their original platforms; video files are not uploaded to this site.",
    adminFooter: "Admin panel protected by Firebase Authentication", loadingProjects: "Loading projects...",
    noProjects: "No projects yet. Add your first video using the form.", edit: "Edit", delete: "Delete",
    projectSaved: "Project saved.", projectUpdated: "Project updated.", projectDeleted: "Project deleted.",
    invalidVideo: "Enter a valid YouTube, Instagram Reels, or TikTok video link.",
    invalidThumbnail: "Enter a valid image URL starting with https:// or http://.",
    requiredTitle: "Please enter a project title.", confirmDelete: "Are you sure you want to delete this project?",
    authInvalid: "The email or password is incorrect.", authDisabled: "This account is disabled. Contact the Firebase owner.",
    authUnconfigured: "Enable Email/Password in Firebase Authentication and create the admin account.",
    networkError: "Connection failed. Check your internet connection and try again.",
    genericAuthError: "Could not sign in. Check your account and Firebase configuration.",
    permissionError: "You don't have permission to do this. Check Firestore rules and the permitted admin email.",
    loadError: "Could not load projects. Check your Firestore configuration.", saveError: "Could not save the project.",
    deleteError: "Could not delete the project.", logoutError: "Could not sign out.",
  },
  fr: {
    adminLabel: "STUDIO ADMIN", backToSite: "Retour au site ↗", adminEyebrow: "Un espace sécurisé pour gérer vos projets",
    adminTitle: "Espace d'administration", adminDescription: "Ajoutez vos projets avec des liens YouTube, Instagram Reels ou TikTok.",
    loginTitle: "Connexion", loginDescription: "Connectez-vous avec l'adresse e-mail et le mot de passe admin enregistrés dans Firebase Authentication.",
    emailLabel: "Adresse e-mail", passwordLabel: "Mot de passe", loginButton: "Connexion sécurisée", noPublicSignup: "La création de comptes publics est désactivée.",
    signedInAs: "Connecté en tant que :", logoutButton: "Déconnexion", addProjectTitle: "Ajouter un projet",
    formDescription: "Saisissez les informations du projet et le lien direct de la vidéo.", projectTitleLabel: "Titre du projet",
    projectDescriptionLabel: "Brève description (facultatif)", categoryLabel: "Catégorie",
    categoryCommercial: "Publicité", categorySocial: "Réseaux sociaux", categoryDocumentary: "Documentaire",
    categoryMotion: "Motion design", categoryMusic: "Clip musical", categoryOther: "Autre",
    videoUrlLabel: "Lien vidéo", videoUrlHint: "Liens YouTube, Instagram Reels et TikTok uniquement.",
    thumbnailLabel: "Lien de l'image de couverture (facultatif)",
    thumbnailHint: "Pour les vidéos privées ou non intégrables, ajoutez ici l'URL de l'image de couverture.", featuredLabel: "Mettre ce projet en avant",
    saveProject: "Enregistrer", updateProject: "Enregistrer les modifications", cancelEdit: "Annuler la modification",
    manageProjectsTitle: "Projets publiés", managedCount: "projets dans la galerie",
    securityNotice: "Les liens vidéo et les informations sont stockés dans Firestore. Les vidéos sont lues sur leur plateforme d'origine, sans téléversement sur ce site.",
    adminFooter: "Administration protégée par Firebase Authentication", loadingProjects: "Chargement des projets...",
    noProjects: "Aucun projet pour le moment. Ajoutez votre première vidéo.", edit: "Modifier", delete: "Supprimer",
    projectSaved: "Projet enregistré.", projectUpdated: "Projet mis à jour.", projectDeleted: "Projet supprimé.",
    invalidVideo: "Saisissez un lien vidéo YouTube, Instagram Reels ou TikTok valide.",
    invalidThumbnail: "Saisissez une URL d'image valide commençant par https:// ou http://.",
    requiredTitle: "Veuillez saisir un titre de projet.", confirmDelete: "Voulez-vous vraiment supprimer ce projet ?",
    authInvalid: "L'adresse e-mail ou le mot de passe est incorrect.", authDisabled: "Ce compte est désactivé. Contactez le propriétaire Firebase.",
    authUnconfigured: "Activez Email/Password dans Firebase Authentication et créez le compte administrateur.",
    networkError: "Connexion impossible. Vérifiez votre connexion et réessayez.",
    genericAuthError: "Connexion impossible. Vérifiez le compte et la configuration Firebase.",
    permissionError: "Vous n'avez pas l'autorisation. Vérifiez les règles Firestore et l'e-mail admin autorisé.",
    loadError: "Impossible de charger les projets. Vérifiez Firestore.", saveError: "Impossible d'enregistrer le projet.",
    deleteError: "Impossible de supprimer le projet.", logoutError: "Impossible de se déconnecter.",
  },
};

const $ = (selector, root = document) => root.querySelector(selector);
let language = localStorage.getItem("vexo-language") || "ar";
if (!translations[language]) language = "ar";
let projects = [];
let editingId = null;
let toastTimer;

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
    element.textContent = t(element.dataset.i18n);
  });
  document.querySelectorAll("[data-language]").forEach((button) => {
    button.classList.toggle("active", button.dataset.language === language);
    button.setAttribute("aria-pressed", String(button.dataset.language === language));
  });
  renderProjects();
  updateFormMode();
}

function showError(element, message) {
  element.textContent = message;
  element.classList.add("visible");
}

function clearError(element) {
  element.textContent = "";
  element.classList.remove("visible");
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 2800);
}

function authErrorMessage(error) {
  if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password" || error.code === "auth/user-not-found") return t("authInvalid");
  if (error.code === "auth/user-disabled") return t("authDisabled");
  if (error.code === "auth/operation-not-allowed") return t("authUnconfigured");
  if (error.code === "auth/network-request-failed") return t("networkError");
  return t("genericAuthError");
}

function setBusy(button, busy, label) {
  button.disabled = busy;
  button.textContent = busy ? (language === "ar" ? "جارٍ التنفيذ..." : language === "fr" ? "En cours..." : "Working...") : label;
}

function updateFormMode() {
  $("#form-title").textContent = editingId ? t("updateProject") : t("addProjectTitle");
  $("#save-button").textContent = editingId ? t("updateProject") : t("saveProject");
  $("#cancel-edit").hidden = !editingId;
}

function resetProjectForm() {
  $("#project-form").reset();
  editingId = null;
  updateFormMode();
  clearError($("#project-error"));
}

function renderProjects() {
  const container = $("#managed-projects");
  if (!container) return;
  $("#managed-count").textContent = String(projects.length);
  if (projects.length === 0) {
    container.innerHTML = `<div class="admin-empty">${t("noProjects")}</div>`;
    return;
  }
  container.replaceChildren();
  projects.forEach((project) => {
    const video = parseVideoUrl(project.videoUrl || "");
    const item = document.createElement("article");
    item.className = "managed-project";
    const thumb = document.createElement("div");
    thumb.className = "managed-thumb";
    thumb.textContent = video?.platform?.toUpperCase() || "VIDEO";
    const details = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = project.title || "";
    const subtitle = document.createElement("p");
    subtitle.textContent = project.category || "";
    const actions = document.createElement("div");
    actions.className = "managed-actions";
    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "admin-button secondary small";
    edit.textContent = t("edit");
    edit.addEventListener("click", () => editProject(project));
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "admin-button danger small";
    remove.textContent = t("delete");
    remove.addEventListener("click", () => removeProject(project));
    actions.append(edit, remove);
    details.append(title, subtitle, actions);
    item.append(thumb, details);
    container.append(item);
  });
}

async function loadProjects() {
  $("#managed-projects").innerHTML = `<div class="admin-empty">${t("loadingProjects")}</div>`;
  try {
    const snapshot = await getDocs(query(collection(db, "projects"), orderBy("createdAt", "desc")));
    projects = snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }));
    renderProjects();
  } catch (error) {
    console.error("Could not load admin projects:", error);
    showError($("#project-error"), error.code === "permission-denied" ? t("permissionError") : t("loadError"));
    $("#managed-projects").replaceChildren();
  }
}

function editProject(project) {
  editingId = project.id;
  const form = $("#project-form");
  form.elements.title.value = project.title || "";
  form.elements.description.value = project.description || "";
  form.elements.category.value = project.category || "other";
  form.elements.videoUrl.value = project.videoUrl || "";
  form.elements.thumbnailUrl.value = project.thumbnailUrl || "";
  form.elements.featured.checked = Boolean(project.featured);
  clearError($("#project-error"));
  updateFormMode();
  form.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function removeProject(project) {
  if (!window.confirm(t("confirmDelete"))) return;
  try {
    await deleteDoc(doc(db, "projects", project.id));
    projects = projects.filter((item) => item.id !== project.id);
    renderProjects();
    if (editingId === project.id) resetProjectForm();
    showToast(t("projectDeleted"));
  } catch (error) {
    console.error("Could not delete project:", error);
    showError($("#project-error"), error.code === "permission-denied" ? t("permissionError") : t("deleteError"));
  }
}

async function saveProject(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const title = form.elements.title.value.trim();
  const videoUrl = form.elements.videoUrl.value.trim();
  const thumbnailUrl = form.elements.thumbnailUrl.value.trim();
  const errorBox = $("#project-error");
  clearError(errorBox);
  if (!title) {
    showError(errorBox, t("requiredTitle"));
    return;
  }
  if (!parseVideoUrl(videoUrl)) {
    showError(errorBox, t("invalidVideo"));
    return;
  }
  if (thumbnailUrl) {
    try {
      const imageUrl = new URL(thumbnailUrl);
      if (!["https:", "http:"].includes(imageUrl.protocol)) throw new Error("Unsupported protocol");
    } catch {
      showError(errorBox, t("invalidThumbnail"));
      return;
    }
  }

  const data = {
    title,
    description: form.elements.description.value.trim(),
    category: form.elements.category.value,
    videoUrl,
    thumbnailUrl,
    featured: form.elements.featured.checked,
    updatedAt: serverTimestamp(),
  };
  const button = $("#save-button");
  const label = editingId ? t("updateProject") : t("saveProject");
  setBusy(button, true, label);
  try {
    if (editingId) {
      await updateDoc(doc(db, "projects", editingId), data);
      showToast(t("projectUpdated"));
    } else {
      await addDoc(collection(db, "projects"), { ...data, createdAt: serverTimestamp() });
      showToast(t("projectSaved"));
    }
    resetProjectForm();
    await loadProjects();
  } catch (error) {
    console.error("Could not save project:", error);
    showError(errorBox, error.code === "permission-denied" ? t("permissionError") : t("saveError"));
  } finally {
    setBusy(button, false, editingId ? t("updateProject") : t("saveProject"));
    updateFormMode();
  }
}

document.querySelectorAll("[data-language]").forEach((button) => {
  button.addEventListener("click", () => applyLanguage(button.dataset.language));
});

$("#login-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const button = $("#login-button");
  const errorBox = $("#login-error");
  clearError(errorBox);
  setBusy(button, true, t("loginButton"));
  try {
    await signInWithEmailAndPassword(auth, form.elements.email.value.trim(), form.elements.password.value);
  } catch (error) {
    console.error("Firebase admin sign-in failed:", error);
    showError(errorBox, authErrorMessage(error));
  } finally {
    setBusy(button, false, t("loginButton"));
  }
});

$("#logout-button").addEventListener("click", async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Firebase admin sign-out failed:", error);
    showError($("#project-error"), t("logoutError"));
  }
});
$("#project-form").addEventListener("submit", saveProject);
$("#cancel-edit").addEventListener("click", resetProjectForm);

onAuthStateChanged(auth, (user) => {
  $("#login-card").hidden = Boolean(user);
  $("#dashboard").hidden = !user;
  if (user) {
    $("#signed-user-email").textContent = user.email || "";
    loadProjects();
  } else {
    projects = [];
    renderProjects();
    resetProjectForm();
  }
});

applyLanguage(language);
