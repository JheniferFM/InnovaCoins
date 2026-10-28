const MATHEUS_PHOTO = "WhatsApp Image 2026-10-02 at 16.59.48.jpeg";
const LEGACY_STORAGE_KEY = "innovaCoinsDatabase_v2";
const COINS = [
  { label: "Cumprimento de prazos de entrega de atividades", points: 10 },
  { label: "Colaboração nas atividades em grupo", points: 10 },
  { label: "Apoio e mentoria a colegas em dificuldades", points: 10 },
  { label: "Criatividade e inovação na resolução de problemas", points: 10 },
  { label: "Presença na aula (registrada via chamada)", points: 5 },
  { label: "Participação ativa nas aulas", points: 5 },
  { label: "Respeito aos colegas, professores e equipe escolar", points: 5 },
  { label: "Organização e cuidado com os materiais escolares", points: 5 },
  { label: "Capacidade de autoaprendizagem", points: 5 },
  { label: "Proatividade", points: 5 },
  { label: "Entrega de atividades com qualidade", points: 5 },
  { label: "Desenvolvimento de soft skills", points: 5 },
  { label: "Falta de respeito aos colegas e professores", points: -10 },
  { label: "Não participar de atividades em grupo", points: -10 },
  { label: "Desrespeito às regras e políticas da escola", points: -10 },
  { label: "Atrasos na chegada às aulas", points: -5 },
  { label: "Falta de participação ativa nas aulas", points: -5 },
  { label: "Desorganização e descuido com os materiais escolares", points: -5 },
  { label: "Uso inadequado de dispositivos eletrônicos durante a aula", points: -5 },
  { label: "Interrupções frequentes durante as explicações", points: -5 },
  { label: "Conversas paralelas durante a aula", points: -5 },
  { label: "Uso inadequado de linguagem", points: -5 },
  { label: "Não entrega das atividades ou desafios", points: -5 }
];
const CALENDAR_COLORS = [
  { id: "yellow", label: "Amarelo" },
  { id: "blue", label: "Azul" },
  { id: "green", label: "Verde" },
  { id: "purple", label: "Roxo" },
  { id: "pink", label: "Rosa" }
];
const DEFAULT_PROFILES = [
  { id: "admin", name: "Administrador" },
  { id: "matheus", name: "Matheus" },
  { id: "jheni", name: "Jheni" },
  { id: "lucas", name: "Lucas" },
  { id: "direcao", name: "Direção/Secretaria" }
];

let database = { classes: [], professors: [], awards: [], attendance: {}, monthlyCalendars: {} };
let selectedClassId = "overview";
let selectedProfessorId = null;
let selectedProfessorDay = "all";
let attendanceClassId = "";
let attendanceProfessorId = "all";
let attendanceDate = new Date().toISOString().slice(0, 10);
let directionAbsenceDate = localDateString();
let lastObservedLocalDate = directionAbsenceDate;
let selectedCalendarMonth = localDateString().slice(0, 7);
let selectedCalendarOwner = "";
let editingCalendarDate = null;
let awardSlide = 0;
let activeStudentId = null;
let editingClassId = null;
let editingStudentId = null;
let editingProfessorId = null;
let editingProfessorPhotoOnly = false;
let selectedActor = "";
let profiles = DEFAULT_PROFILES;
let activeProfile = null;
let currentAuthUser = null;
let sharedRevision = null;
let sharedReadError = null;
let sharedDatabaseInitialized = false;
let sharedReadInFlight = false;
let sharedSyncRunning = false;
let sharedSyncPending = false;
let appHasRendered = false;
let supabaseRealtimeChannel = null;

function uid(prefix) { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }
function localDateString(date = new Date()) { const offset = date.getTimezoneOffset(); return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10); }
function normalizeDatabase(data) {
  const classesData = (data.classes || []).map(turma => ({ ...turma, professores: (turma.professores || []).map(name => name === "Jhenifer" ? "Jheni" : name), students: (turma.students || turma.alunos || []).map(aluno => typeof aluno === "string" ? { id: uid("student"), name: aluno, points: 0, history: [] } : aluno) }));
  const names = [...(data.professors || []).map(professor => professor.name), ...classesData.flatMap(turma => turma.professores || []), "Matheus", "Jheni", "Lucas"];
  const uniqueNames = [...new Set(names.filter(Boolean))];
  return { ...data, classes: classesData, awards: Array.isArray(data.awards) ? data.awards : [], attendance: data.attendance || {}, monthlyCalendars: data.monthlyCalendars || {}, professors: uniqueNames.map(name => { const professor = (data.professors || []).find(item => item.name === name) || { id: uid("professor"), name }; return name === "Jheni" && !professor.photo ? { ...professor, photo: "unnamed (1).jpg" } : professor; }) };
}
function migrateDatabase(data) { return normalizeDatabase(data); }
function saveDatabase() { queueSharedSync(); }
function clearLegacyDatabaseCache() {
  try {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch (error) {
    console.warn("Não foi possível remover o cache local antigo", error);
  }
}
function clearLegacyProfileSession() {
  try {
    sessionStorage.removeItem("innovaCoinsActiveProfile");
  } catch (error) {
    console.warn("Não foi possível remover a sessão de perfil antiga", error);
  }
}
function classes() { return database.classes; }
function students(turma) { return turma?.students || []; }
function pointsTotal(turma) { return students(turma).reduce((sum, aluno) => sum + (aluno.points || 0), 0); }
function teamAverage(turma) { return students(turma).length ? pointsTotal(turma) / students(turma).length : 0; }
function formatAverage(value) { return `${value.toFixed(1)} IC`; }
function shortDay(day = "") { return ({ "Segunda-feira": "Seg", "Terça-feira": "Ter", "Quarta-feira": "Qua", "Quinta-feira": "Qui", "Sexta-feira": "Sex", "Sábado": "Sáb", "Domingo": "Dom" }[day] || day); }
function escapeHtml(value = "") { return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char])); }
function initials(name) { return name.split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase(); }
function professorAvatarHtml(professor, size = "small") { return professor.photo ? `<img class="professor-avatar professor-avatar-${size}" src="${escapeHtml(professor.photo)}" alt="Foto de ${escapeHtml(professor.name)}">` : `<span class="professor-avatar professor-avatar-${size}">${escapeHtml(initials(professor.name))}</span>`; }
function findClass(id) { return classes().find(turma => turma.id === id); }
function findStudent(id) { for (const turma of classes()) { const aluno = students(turma).find(item => item.id === id); if (aluno) return { aluno, turma }; } return null; }
function updateProfileOptions() {
  document.getElementById("profile-select").innerHTML = DEFAULT_PROFILES
    .map(profile => `<option value="${escapeHtml(profile.id)}">${escapeHtml(profile.name)}</option>`)
    .join("");
}
async function loadSharedData(force = false) {
  if (sharedReadInFlight || (sharedSyncRunning && !force)) return false;
  if (!currentAuthUser || !window.innovaSupabaseClient) return false;
  sharedReadInFlight = true;
  sharedReadError = null;
  try {
    const { data: result, error } = await window.innovaSupabaseClient
      .from("innova_state")
      .select("payload, updated_at")
      .eq("id", "main")
      .maybeSingle();
    if (error) throw error;
    if (!result) {
      throw new Error("A tabela innova_state ainda não foi inicializada. Execute o SQL indicado no README.");
    }
    if (!Array.isArray(result.payload?.profiles) || typeof result.updated_at !== "string") {
      throw new Error("Os dados compartilhados do Supabase estão em formato inválido.");
    }
    if ((sharedSyncPending || sharedSyncRunning) && !force) return false;

    sharedRevision = result.updated_at;
    profiles = result.payload.profiles;
    if (activeProfile) {
      activeProfile = profiles.find(profile => profile.id === activeProfile.id) || activeProfile;
      selectedActor = activeProfile.name;
    }

    if (result.payload.database) {
      if (!Array.isArray(result.payload.database.classes)) throw new Error("O banco compartilhado não contém uma lista válida de turmas.");
      clearLegacyDatabaseCache();
      const updatedDatabase = migrateDatabase(result.payload.database);
      const serializedDatabase = JSON.stringify(updatedDatabase);
      sharedDatabaseInitialized = true;
      if (JSON.stringify(database) !== serializedDatabase) {
        database = updatedDatabase;
        if (appHasRendered) {
          render();
          if (activeStudentId) openDrawer(activeStudentId);
        }
      }
    } else {
      sharedDatabaseInitialized = false;
    }
    sharedReadError = null;
    return true;
  } catch (error) {
    sharedReadError = error;
    console.error("Não foi possível ler os dados compartilhados", error);
    showToast(error.message || "Não foi possível sincronizar. Verifique a configuração da Vercel.", true);
    return false;
  } finally {
    sharedReadInFlight = false;
  }
}
function queueSharedSync() {
  if (!currentAuthUser || !activeProfile || !window.innovaSupabaseClient) return;
  sharedSyncPending = true;
  if (!sharedSyncRunning) void flushSharedSync();
}
async function flushSharedSync() {
  if (sharedSyncRunning || !window.innovaSupabaseClient) return;
  sharedSyncRunning = true;
  try {
    while (sharedSyncPending) {
      sharedSyncPending = false;
      const snapshot = JSON.parse(JSON.stringify(database));
      const { data: nextRevision, error } = await window.innovaSupabaseClient.rpc("save_innova_state", {
        p_payload: { database: snapshot, profiles },
        p_expected_updated_at: sharedRevision
      });
      if (error) throw error;
      if (!nextRevision) {
        await loadSharedData(true);
        showToast("Outro computador salvou uma alteração. Os dados foram atualizados; refaça sua última alteração.", true);
        sharedSyncPending = false;
        break;
      }

      sharedRevision = nextRevision;
      sharedDatabaseInitialized = true;
      clearLegacyDatabaseCache();
      if (JSON.stringify(database) !== JSON.stringify(snapshot)) sharedSyncPending = true;
    }
  } catch (error) {
    console.error("Não foi possível salvar os dados compartilhados", error);
    showToast(error.message || "Alteração salva apenas neste computador; falha ao sincronizar.", true);
  } finally {
    sharedSyncRunning = false;
  }
}
function showLoginScreen(message = "") {
  document.getElementById("auth-screen").classList.remove("hidden");
  document.getElementById("login-message").textContent = message;
}
function setActiveProfile(profile) {
  activeProfile = profile;
  selectedActor = profile.name;
  selectedCalendarOwner = profile.id === "direcao" ? "staff:direcao" : calendarProfessorNames().includes(profile.name) ? profile.name : "";
}
function restoreLegacyDatabase() {
  try {
    const saved = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY));
    if (!saved || !Array.isArray(saved.classes)) return false;
    database = migrateDatabase(saved);
    return true;
  } catch (error) {
    console.warn("Não foi possível restaurar o cache local antigo", error);
    return false;
  }
}
async function openStaffSession(session, profileId) {
  if (!session?.user) throw new Error("A sessão de autenticação não é válida.");
  if (!DEFAULT_PROFILES.some(profile => profile.id === profileId)) {
    throw new Error("O perfil selecionado não é válido.");
  }
  currentAuthUser = session.user;
  const { data: assignment, error: assignmentError } = await window.innovaSupabaseClient
    .from("innova_staff_profiles")
    .select("profile_id")
    .eq("user_id", session.user.id)
    .eq("profile_id", profileId)
    .maybeSingle();
  if (assignmentError) throw assignmentError;
  if (!assignment) throw new Error("Esta conta não está associada a este perfil. Peça ao administrador para habilitar o acesso.");

  if (!await loadSharedData()) {
    if (sharedReadError?.code === "PGRST205") {
      throw new Error("PIN reconhecido, mas o Supabase não encontrou a tabela innova_state. Execute o setup.sql completo no projeto Supabase configurado no site.");
    }
    throw new Error("Não foi possível carregar os dados protegidos. Verifique a configuração do Supabase.");
  }
  if (!sharedDatabaseInitialized) restoreLegacyDatabase();
  const profile = profiles.find(item => item.id === profileId);
  if (!profile) throw new Error("O perfil associado à conta não existe no estado compartilhado.");
  setActiveProfile(profile);
  document.getElementById("auth-screen").classList.add("hidden");
  appHasRendered = true;
  render();
  if (!sharedDatabaseInitialized) queueSharedSync();
  if (!supabaseRealtimeChannel) {
    supabaseRealtimeChannel = window.innovaSupabaseClient
      .channel("innova-state")
      .on("postgres_changes", { event: "*", schema: "public", table: "innova_state", filter: "id=eq.main" }, () => {
        void loadSharedData();
      })
      .subscribe(status => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.error("Não foi possível conectar às atualizações em tempo real do Supabase", status);
        }
      });
  }
}
async function enterWithPin() {
  const profileId = document.getElementById("profile-select").value;
  const pin = document.getElementById("profile-pin").value;
  const button = document.getElementById("login-submit");
  button.disabled = true;
  try {
    const response = await fetch("/api/pin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId, pin })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Perfil ou PIN incorreto.");
    const { data, error } = await window.innovaSupabaseClient.auth.setSession({
      access_token: result.access_token,
      refresh_token: result.refresh_token
    });
    if (error) throw error;
    await openStaffSession(data.session, profileId);
    document.getElementById("login-message").textContent = "";
  } catch (error) {
    currentAuthUser = null;
    activeProfile = null;
    selectedActor = "";
    const { error: signOutError } = await window.innovaSupabaseClient.auth.signOut();
    if (signOutError) console.error("Não foi possível encerrar a sessão após uma falha de acesso", signOutError);
    console.error("Não foi possível autenticar o funcionário", error);
    showLoginScreen(error.message || "Perfil ou PIN incorreto.");
  } finally {
    button.disabled = false;
    document.getElementById("profile-pin").value = "";
  }
}
async function changeProfile() {
  const { error } = await window.innovaSupabaseClient.auth.signOut();
  if (error) {
    console.error("Não foi possível encerrar a sessão", error);
    showToast("Não foi possível sair. Tente novamente.", true);
    return;
  }
  lockStaffSession();
}
function lockStaffSession() {
  clearLegacyProfileSession();
  currentAuthUser = null;
  activeProfile = null;
  selectedActor = "";
  selectedCalendarOwner = "";
  sharedRevision = null;
  sharedDatabaseInitialized = false;
  sharedSyncPending = false;
  database = { classes: [], professors: [], awards: [], attendance: {}, monthlyCalendars: {} };
  appHasRendered = false;
  document.getElementById("content").innerHTML = "";
  document.getElementById("sidebar-professores").innerHTML = "";
  document.getElementById("header-total").textContent = "";
  closeDrawer();
  if (supabaseRealtimeChannel) {
    void window.innovaSupabaseClient.removeChannel(supabaseRealtimeChannel);
    supabaseRealtimeChannel = null;
  }
  showLoginScreen();
}

function applyTurmaThemes() {
  document.querySelectorAll(".turma-card, .podio-card").forEach(card => {
    const classLabel = card.classList.contains("podio-card") ? card.querySelectorAll("p")[1]?.textContent || "" : card.querySelector("p")?.textContent || "";
    card.classList.add(`turma-theme-${turmaThemeByName(classLabel)}`);
  });
}
function turmaThemeByName(name = "") {
  const normalizedName = String(name).toLowerCase();
  return ["curiosity", "discovery", "pioneer", "challenger"].find(category => normalizedName.includes(category)) || "other";
}
function scheduleMinutes(value = "") {
  const match = String(value).trim().match(/^(\d{1,2})(?::(\d{2}))?\s*h?$/i);
  return match ? Number(match[1]) * 60 + Number(match[2] || 0) : null;
}
function scheduleTimeLabel(minutes) {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return minute ? `${hour}:${String(minute).padStart(2, "0")}` : `${hour}h`;
}
function scheduleIntervalLabel(startMinutes, endMinutes) {
  return `${scheduleTimeLabel(startMinutes)} às ${scheduleTimeLabel(endMinutes)}`;
}
function scheduleCellHtml(day, minutes, professorName) {
  if (minutes === 12 * 60) return `<span class="schedule-lunch">Almoço</span>`;
  const scheduledClasses = classes().filter(turma => turma.dia === day && scheduleMinutes(turma.horario) === minutes && (turma.professores || []).includes(professorName));
  if (day === "Sábado" && !scheduledClasses.length && !(minutes === 8 * 60 && professorName === "Lucas")) return "";
  if (!scheduledClasses.length) return `<span class="schedule-planning">Planejamento pedagógico</span>`;
  return scheduledClasses.map(turma => `<article class="schedule-class turma-theme-${turmaThemeByName(turma.nome)}"><strong>${escapeHtml(turma.nome)}</strong><span>${students(turma).length} alunos</span></article>`).join("");
}
function scheduleHtml() {
  const schedulesByDay = [
    { day: "Terça-feira", slots: [[9, 10], [11, 12], [12, 13], [13, 14], [14, 16], [16, 18]] },
    { day: "Quarta-feira", slots: [[9, 10], [11, 12], [12, 13], [13, 14], [14, 16], [16, 18]] },
    { day: "Quinta-feira", slots: [[9, 10], [11, 12], [12, 13], [13, 14], [14, 16], [16, 18]] },
    { day: "Sexta-feira", slots: [[9, 10], [11, 12], [12, 13], [13, 14], [14, 16], [16, 18]] },
    { day: "Sábado", slots: [[8, 10], [10, 12], [12, 13], [13, 15], [15, 17]] }
  ];
  const preferredProfessors = ["Jheni", "Matheus", "Lucas"];
  const assignedProfessors = new Set(classes().flatMap(turma => turma.professores || []));
  const extraProfessors = [...assignedProfessors].filter(name => !preferredProfessors.includes(name)).sort((a, b) => a.localeCompare(b, "pt-BR"));
  const professorNames = [...preferredProfessors, ...extraProfessors];
  const dayRows = schedulesByDay.map(({ day, slots }) => {
    const intervalRows = slots.map(([startHour, endHour]) => {
      const startMinutes = startHour * 60;
      const endMinutes = endHour * 60;
      return `<tr><th class="schedule-time" scope="row">${scheduleIntervalLabel(startMinutes, endMinutes)}</th>${professorNames.map(name => `<td>${scheduleCellHtml(day, startMinutes, name)}</td>`).join("")}</tr>`;
    }).join("");
    return `<tr class="schedule-day-heading"><th colspan="${professorNames.length + 1}" scope="rowgroup">${day}</th></tr>${intervalRows}`;
  }).join("");
  return `<section class="schedule-page"><div class="secao-head"><div><p class="page-kicker">Visão semanal</p><h1>Grade horária dos professores</h1><p>Terça a sábado · horários e turmas lado a lado</p></div></div><div class="schedule-table-wrap" role="region" aria-label="Grade horária semanal com rolagem horizontal" tabindex="0"><table class="schedule-table"><thead><tr><th scope="col">Horário</th>${professorNames.map(name => `<th scope="col">${escapeHtml(name)}</th>`).join("")}</tr></thead><tbody>${dayRows}</tbody></table></div></section>`;
}
function calendarColor(colorId) { return CALENDAR_COLORS.find(color => color.id === colorId) || CALENDAR_COLORS[0]; }
function calendarMonthLabel(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}
function calendarProfessorNames() {
  const preferredOrder = ["Jheni", "Matheus", "Lucas"];
  const availableProfessors = new Set([...(database.professors || []).map(professor => professor.name), ...classes().flatMap(turma => turma.professores || [])]);
  const preferred = preferredOrder.filter(name => availableProfessors.has(name));
  const additional = [...availableProfessors].filter(name => !preferredOrder.includes(name)).sort((first, second) => first.localeCompare(second, "pt-BR"));
  return [...preferred, ...additional];
}
function calendarMarksForOwner(monthKey, ownerId) {
  const monthData = database.monthlyCalendars?.[monthKey] || {};
  const legacyMarks = ownerId.startsWith("staff:") ? {} : Object.fromEntries(Object.entries(monthData).filter(([key, mark]) => /^\d{4}-\d{2}-\d{2}$/.test(key) && mark && typeof mark === "object"));
  return { ...legacyMarks, ...(monthData[ownerId] || {}) };
}
function calendarOwners() {
  const professors = calendarProfessorNames().map(name => ({ id: name, label: name }));
  if (activeProfile?.id !== "direcao") return professors;
  return [
    { id: "staff:secretaria", label: "Secretaria" },
    { id: "staff:direcao", label: "Direção" },
    ...professors
  ];
}
function calendarHtml() {
  const [year, month] = selectedCalendarMonth.split("-").map(Number);
  const owners = calendarOwners();
  if (!owners.some(owner => owner.id === selectedCalendarOwner)) {
    selectedCalendarOwner = owners.some(owner => owner.id === (activeProfile?.id === "direcao" ? "staff:direcao" : activeProfile?.name))
      ? activeProfile.id === "direcao" ? "staff:direcao" : activeProfile.name
      : owners[0]?.id || "Jheni";
  }
  const selectedOwner = owners.find(owner => owner.id === selectedCalendarOwner);
  const ownerLabel = selectedOwner?.label || selectedCalendarOwner;
  const monthIndex = month - 1;
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOffset = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
  const cellCount = Math.ceil((firstDayOffset + daysInMonth) / 7) * 7;
  const today = localDateString();
  const monthMarks = calendarMarksForOwner(selectedCalendarMonth, selectedCalendarOwner);
  const weekdayLabels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  const calendarCells = Array.from({ length: cellCount }, (_, index) => {
    const day = index - firstDayOffset + 1;
    if (day < 1 || day > daysInMonth) return `<div class="calendar-day calendar-day-empty" aria-hidden="true"></div>`;
    const date = `${selectedCalendarMonth}-${String(day).padStart(2, "0")}`;
    const mark = monthMarks[date];
    const color = calendarColor(mark?.color);
    const description = mark ? String(mark.legend || color.label).trim() : "";
    const accessibleLabel = mark ? `${day}, ${description}` : String(day);
    return `<button class="calendar-day ${mark ? `is-marked color-${color.id}` : ""} ${date === today ? "is-today" : ""}" type="button" data-calendar-day="${date}" aria-label="${escapeHtml(accessibleLabel)}" title="${escapeHtml(description)}"><span class="calendar-day-number">${day}</span>${mark ? `<span class="calendar-day-caption">${escapeHtml(description)}</span>` : ""}</button>`;
  }).join("");
  const legendEntries = Object.entries(monthMarks).sort(([firstDate], [secondDate]) => firstDate.localeCompare(secondDate));
  const legendList = legendEntries.map(([date, mark]) => {
    const color = calendarColor(mark.color);
    const day = Number(date.slice(-2));
    const legend = String(mark.legend || color.label).trim();
    return `<li><span class="calendar-legend-swatch color-${color.id}" aria-hidden="true"></span><time datetime="${date}">${day}</time><span>${escapeHtml(legend)}</span></li>`;
  }).join("");
  const [yearValue, monthValue] = selectedCalendarMonth.split("-");
  const previousMonthDate = new Date(Number(yearValue), Number(monthValue) - 2, 1);
  const nextMonthDate = new Date(Number(yearValue), Number(monthValue), 1);
  const previousMonth = `${previousMonthDate.getFullYear()}-${String(previousMonthDate.getMonth() + 1).padStart(2, "0")}`;
  const nextMonth = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, "0")}`;
  return `<section class="calendar-page"><div class="secao-head calendar-screen-head"><div><p class="page-kicker">Organização financeira</p><h1>Calendário mensal</h1><p>Calendário de ${escapeHtml(ownerLabel)}</p></div><div class="calendar-toolbar"><label class="calendar-teacher-picker"><span>Responsável</span><select data-calendar-owner aria-label="Calendário do responsável">${owners.map(owner => `<option value="${escapeHtml(owner.id)}" ${owner.id === selectedCalendarOwner ? "selected" : ""}>${escapeHtml(owner.label)}</option>`).join("")}</select></label><button class="btn btn-ghost" type="button" data-action="calendar-previous" aria-label="Mês anterior">←</button><input type="month" data-calendar-month value="${selectedCalendarMonth}" aria-label="Selecionar mês"><button class="btn btn-ghost" type="button" data-action="calendar-next" aria-label="Próximo mês">→</button><button class="btn btn-primary" type="button" data-action="calendar-print">Exportar PDF</button></div></div><div class="calendar-layout"><section class="calendar-sheet" aria-label="Calendário de ${escapeHtml(ownerLabel)} em ${escapeHtml(calendarMonthLabel(selectedCalendarMonth))}"><header class="calendar-print-heading"><span>INNOVA COINS · FINANCEIRO · ${escapeHtml(ownerLabel.toUpperCase())}</span><h2>${escapeHtml(calendarMonthLabel(selectedCalendarMonth))}</h2></header><div class="calendar-weekdays">${weekdayLabels.map(label => `<span>${label}</span>`).join("")}</div><div class="monthly-calendar-grid">${calendarCells}</div></section><aside class="calendar-legend"><div class="calendar-legend-heading"><span>${escapeHtml(ownerLabel.toUpperCase())}</span><h2>Legendas do mês</h2></div><ul>${legendList || `<li class="calendar-empty-legend">Nenhuma data marcada neste mês.</li>`}</ul></aside></div></section>`;
}
function shiftCalendarMonth(offset) {
  const [year, month] = selectedCalendarMonth.split("-").map(Number);
  const shiftedDate = new Date(year, month - 1 + offset, 1);
  selectedCalendarMonth = `${shiftedDate.getFullYear()}-${String(shiftedDate.getMonth() + 1).padStart(2, "0")}`;
  render();
}
function openCalendarDay(date) {
  editingCalendarDate = date;
  const [year, month, day] = date.split("-").map(Number);
  const dateLabel = new Date(year, month - 1, day).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  const mark = calendarMarksForOwner(selectedCalendarMonth, selectedCalendarOwner)[date];
  const selectedColor = calendarColor(mark?.color).id;
  document.getElementById("calendar-day-title").textContent = dateLabel;
  document.getElementById("calendar-day-legend").value = mark?.legend || "";
  document.getElementById("calendar-color-options").innerHTML = CALENDAR_COLORS.map(color => `<label class="calendar-color-option"><input type="radio" name="calendar-color" value="${color.id}" ${color.id === selectedColor ? "checked" : ""}><span class="calendar-color-swatch color-${color.id}" aria-hidden="true"></span><span>${color.label}</span></label>`).join("");
  document.getElementById("calendar-clear-day").hidden = !mark;
  document.getElementById("modal-calendar-overlay").style.display = "flex";
}
function saveCalendarDay() {
  if (!editingCalendarDate) return;
  const selectedColor = document.querySelector('input[name="calendar-color"]:checked');
  if (!selectedColor) return showToast("Escolha uma cor para o dia", true);
  database.monthlyCalendars = database.monthlyCalendars || {};
  database.monthlyCalendars[selectedCalendarMonth] = database.monthlyCalendars[selectedCalendarMonth] || {};
  database.monthlyCalendars[selectedCalendarMonth][selectedCalendarOwner] = database.monthlyCalendars[selectedCalendarMonth][selectedCalendarOwner] || {};
  database.monthlyCalendars[selectedCalendarMonth][selectedCalendarOwner][editingCalendarDate] = { color: selectedColor.value, legend: document.getElementById("calendar-day-legend").value.trim() };
  saveDatabase(); closeModal("modal-calendar"); render(); showToast("Dia salvo no calendário");
}
function clearCalendarDay() {
  if (!editingCalendarDate) return;
  const monthData = database.monthlyCalendars?.[selectedCalendarMonth];
  if (monthData) {
    if (monthData[selectedCalendarOwner]) {
      delete monthData[selectedCalendarOwner][editingCalendarDate];
      if (!Object.keys(monthData[selectedCalendarOwner]).length) delete monthData[selectedCalendarOwner];
    }
    if (!selectedCalendarOwner.startsWith("staff:") && /^\d{4}-\d{2}-\d{2}$/.test(editingCalendarDate)) delete monthData[editingCalendarDate];
    if (!Object.keys(monthData).length) delete database.monthlyCalendars[selectedCalendarMonth];
  }
  saveDatabase(); closeModal("modal-calendar"); render(); showToast("Marcação removida");
}

function render() {
  renderSidebar();
  const total = classes().reduce((sum, turma) => sum + pointsTotal(turma), 0);
  document.getElementById("header-total").innerHTML = `<strong>${total}</strong> coins distribuídos ao todo`;
  document.getElementById("content").innerHTML = selectedProfessorId ? professorHtml(selectedProfessorId) : selectedClassId === "overview" ? overviewHtml() : selectedClassId === "best-students" ? bestStudentsHtml() : selectedClassId === "history" ? historyHtml() : selectedClassId === "awards" ? awardsHtml() : selectedClassId === "attendance" ? attendanceHtml() : selectedClassId === "attendance-history" ? attendanceHistoryHtml() : selectedClassId === "schedule" ? scheduleHtml() : selectedClassId === "monthly-calendar" ? calendarHtml() : selectedClassId === "direction-absences" && activeProfile?.id === "direcao" ? directionAbsencesHtml() : classHtml(findClass(selectedClassId));
  applyTurmaThemes();
  bindContentEvents();
  if (selectedClassId === "overview" && !selectedProfessorId) addAmbientConfetti();
  if (selectedClassId === "requests") loadRequests();
}
function renderSidebar() {
  document.querySelector(".nav-overview").classList.toggle("active", selectedClassId === "overview" && !selectedProfessorId);
  document.querySelector(".nav-best-students").classList.toggle("active", selectedClassId === "best-students" && !selectedProfessorId);
  document.querySelector(".nav-awards").classList.toggle("active", selectedClassId === "awards" && !selectedProfessorId);
  document.querySelector(".nav-attendance").classList.toggle("active", selectedClassId === "attendance" && !selectedProfessorId);
  document.querySelector(".nav-attendance-history").classList.toggle("active", selectedClassId === "attendance-history" && !selectedProfessorId);
  document.querySelector(".nav-schedule").classList.toggle("active", selectedClassId === "schedule" && !selectedProfessorId);
  document.querySelector(".nav-monthly-calendar").classList.toggle("active", selectedClassId === "monthly-calendar" && !selectedProfessorId);
  const directionAbsencesNav = document.querySelector(".nav-direction-absences");
  directionAbsencesNav.hidden = activeProfile?.id !== "direcao";
  directionAbsencesNav.classList.toggle("active", selectedClassId === "direction-absences" && !selectedProfessorId);
  document.getElementById("admin-tools").hidden = activeProfile?.id !== "admin";
  const professorTarget = document.getElementById("sidebar-professores");
  professorTarget.innerHTML = (database.professors || []).map(professor => `<button class="nav-item ${professor.id === selectedProfessorId ? "active" : ""}" data-professor="${professor.id}"><span class="nav-item-label">${professorAvatarHtml(professor)} ${escapeHtml(professor.name)}</span><span class="nav-item-meta">${classes().filter(turma => (turma.professores || []).includes(professor.name)).length} turmas</span></button>`).join("") || `<p class="sidebar-vazio">Nenhum professor</p>`;
}
function overviewHtml() {
  const ranking = [...classes()].sort((a, b) => teamAverage(b) - teamAverage(a));
  return `<section class="overview-page"><div class="secao-head"><div><h1>🏆 Pódio das turmas</h1><p>Ranking pela média de IC por aluno. O nome de guerra aparece no pódio.</p></div><button class="btn btn-primary" data-action="new-class">+ Criar turma</button></div><div class="podio-overview-layout"><div class="podio-grid"><div class="podium-confetti" aria-hidden="true">${confettiHtml()}</div>${ranking.slice(0, 3).map((turma, index) => `<article class="podio-card"><div class="podio-medal">${index + 1}</div><h3>${escapeHtml(turma.guerra || turma.nome)}</h3><p class="podio-day">${shortDay(turma.dia)}${turma.horario ? ` · ${escapeHtml(turma.horario)}` : ""}</p><p>${escapeHtml(turma.nome)}</p><strong><span class="podio-coin">IC</span>${formatAverage(teamAverage(turma))}</strong></article>`).join("") || `<p class="vazio">Crie a primeira turma para começar.</p>`}</div>${awardsCarouselHtml()}</div>${overviewDashboardsHtml()}</section>`;
}
function overviewDashboardsHtml() {
  const allStudents = classes().flatMap(turma => students(turma).map(aluno => ({ aluno, turma })));
  const totalPoints = classes().reduce((sum, turma) => sum + pointsTotal(turma), 0);
  const totalStudents = allStudents.length;
  const overallAverage = totalStudents ? totalPoints / totalStudents : 0;
  const topClass = [...classes()].sort((a, b) => teamAverage(b) - teamAverage(a))[0];
  const topStudent = [...allStudents].sort((a, b) => b.aluno.points - a.aluno.points)[0];
  const maxAverage = Math.max(...classes().map(teamAverage), 1);
  return `<section class="overview-dashboards"><div class="dashboard-grid"><article class="dashboard-card dashboard-gold"><span class="dashboard-label">Coins distribuídos</span><strong>${totalPoints} IC</strong><small>Saldo de todas as turmas</small></article><article class="dashboard-card dashboard-blue"><span class="dashboard-label">Alunos cadastrados</span><strong>${totalStudents}</strong><small>Em ${classes().length} turmas</small></article><article class="dashboard-card dashboard-teal"><span class="dashboard-label">Média geral</span><strong>${formatAverage(overallAverage)}</strong><small>IC por aluno</small></article><article class="dashboard-card dashboard-pink"><span class="dashboard-label">Registros feitos</span><strong>${allStudents.reduce((sum, entry) => sum + (entry.aluno.history || []).length, 0)}</strong><small>Alterações salvas</small></article></div><div class="dashboard-panels"><article class="dashboard-panel"><div class="dashboard-panel-head"><h2>🏆 Turma líder</h2><span>${topClass ? formatAverage(teamAverage(topClass)) : "0.0 IC"}</span></div><p>${topClass ? escapeHtml(topClass.guerra || topClass.nome) : "Nenhuma turma"}</p><small>${topClass ? `${students(topClass).length} alunos · ${escapeHtml(topClass.dia || "Dia não definido")}` : "Cadastre uma turma para começar"}</small></article><article class="dashboard-panel"><div class="dashboard-panel-head"><h2>🌟 Aluno destaque</h2><span>${topStudent ? `${topStudent.aluno.points} IC` : "0 IC"}</span></div><p>${topStudent ? escapeHtml(topStudent.aluno.name) : "Nenhum aluno"}</p><small>${topStudent ? escapeHtml(topStudent.turma.guerra || topStudent.turma.nome) : "Cadastre um aluno para começar"}</small></article><article class="dashboard-panel dashboard-bars"><div class="dashboard-panel-head"><h2>📊 Médias por turma</h2><span>IC/aluno</span></div>${[...classes()].sort((a, b) => teamAverage(b) - teamAverage(a)).slice(0, 6).map(turma => `<div class="dashboard-bar-row"><span>${escapeHtml(turma.guerra || turma.nome)}</span><div><i style="width:${Math.max(3, teamAverage(turma) / maxAverage * 100)}%"></i></div><strong>${formatAverage(teamAverage(turma))}</strong></div>`).join("") || `<small>Nenhuma turma cadastrada</small>`}</article></div></section>`;
}
function confettiHtml() {
  const colors = ["#FFC93C", "#FF5C8A", "#4FD1FF", "#33E1B0", "#B98CFF"];
  return Array.from({ length: 32 }, (_, index) => {
    const drift = Math.round((Math.random() - .5) * 460);
    const delay = (Math.random() * .8).toFixed(2);
    const width = Math.round(4 + Math.random() * 5);
    const height = Math.round(7 + Math.random() * 8);
    return `<span style="--confetti-drift:${drift}px;--confetti-delay:${delay}s;--confetti-width:${width}px;--confetti-height:${height}px;--confetti-color:${colors[index % colors.length]}"></span>`;
  }).join("");
}
function addAmbientConfetti() {
  const overview = document.querySelector(".podio-grid");
  if (!overview || overview.querySelector(".ambient-confetti")) return;
  const colors = ["#FFC93C", "#FF5C8A", "#4FD1FF", "#33E1B0", "#B98CFF"];
  const layer = document.createElement("div");
  layer.className = "ambient-confetti";
  layer.setAttribute("aria-hidden", "true");
  layer.innerHTML = Array.from({ length: 220 }, (_, index) => `<span style="--ambient-left:${Math.random() * 100}%;--ambient-delay:${Math.random() * 10}s;--ambient-duration:${7 + Math.random() * 8}s;--ambient-color:${colors[index % colors.length]};--ambient-size:${2 + Math.random() * 4}px"></span>`).join("");
  overview.prepend(layer);
}
function awardsCarouselHtml() {
  const awards = database.awards || [];
  if (!awards.length) return `<aside class="awards-carousel empty-awards"><div class="awards-carousel-head"><h2>🏅 Prêmios</h2></div><p>Adicione fotos dos prêmios que as turmas já conquistaram.</p></aside>`;
  const current = awards[awardSlide % awards.length];
  return `<aside class="awards-carousel"><div class="awards-carousel-head"><h2>🏅 Prêmios</h2></div><div class="award-slide"><img src="${current.image}" alt="${escapeHtml(current.caption || "Prêmio Innova Coins")}"><div class="award-caption">${escapeHtml(current.caption || "Prêmio Innova Coins")}</div></div><div class="award-controls"><button class="btn btn-ghost btn-small" data-action="award-prev">←</button><span>${awardSlide % awards.length + 1} / ${awards.length}</span><button class="btn btn-ghost btn-small" data-action="award-next">→</button></div></aside>`;
}
function awardsHtml() {
  const awards = database.awards || [];
  return `<section class="awards-page"><div class="secao-head"><div><p class="page-kicker">Galeria</p><h1>🏅 Prêmios conquistados</h1><p>Fotos das conquistas que aparecem ao lado do pódio.</p></div></div><div class="awards-manager-grid">${awards.map((award, index) => `<article class="award-manager-card"><img src="${award.image}" alt="${escapeHtml(award.caption || "Prêmio")}"><div><strong>${escapeHtml(award.caption || "Prêmio Innova Coins")}</strong><button class="btn btn-danger btn-small" data-action="delete-award" data-award="${index}">🗑️ Remover</button></div></article>`).join("") || `<p class="vazio">Nenhuma foto cadastrada.</p>`}</div></section>`;
}
function attendanceHtml() {
  const professors = database.professors || [];
  const selectedProfessor = professors.find(professor => professor.id === attendanceProfessorId);
  const filteredClasses = selectedProfessor ? classes().filter(turma => (turma.professores || []).includes(selectedProfessor.name)) : classes();
  const turma = filteredClasses.find(item => item.id === attendanceClassId) || filteredClasses[0];
  if (!turma) return `<section class="attendance-page"><h1>📅 Chamada</h1><p class="vazio">Crie uma turma para iniciar a chamada.</p></section>`;
  attendanceClassId = turma.id;
  database.attendance = database.attendance || {};
  database.attendance[turma.id] = database.attendance[turma.id] || {};
  const record = database.attendance[turma.id][attendanceDate] || { present: {}, rewarded: {} };
  record.present = record.present || {};
  record.rewarded = record.rewarded || {};
  const presentCount = students(turma).filter(aluno => record.present[aluno.id] !== false).length;
  return `<section class="attendance-page"><div class="secao-head"><div><p class="page-kicker">Registro de presença</p><h1>📅 Chamada</h1><p>${presentCount} de ${students(turma).length} presentes</p></div><div class="secao-actions"><button class="btn ${record.launchedAt ? "btn-secondary" : "btn-primary"}" data-action="launch-attendance" ${record.launchedAt ? "disabled" : ""}>${record.launchedAt ? "✓ Chamada lançada" : "Lançar chamada"}</button><button class="btn btn-secondary" data-action="attendance-history">🗓️ Ver registros anteriores</button></div></div><div class="attendance-controls"><div class="form-group"><label for="attendance-professor">Professor</label><select id="attendance-professor" data-attendance-professor><option value="all">Todos os professores</option>${professors.map(professor => `<option value="${professor.id}" ${professor.id === attendanceProfessorId ? "selected" : ""}>${escapeHtml(professor.name)}</option>`).join("")}</select></div><div class="form-group"><label for="attendance-class">Turma</label><select id="attendance-class" data-attendance-class>${filteredClasses.map(item => `<option value="${item.id}" ${item.id === turma.id ? "selected" : ""}>${escapeHtml(item.nome)} · ${escapeHtml(item.dia || "")}</option>`).join("")}</select></div><div class="form-group"><label for="attendance-date">Data</label><input type="date" id="attendance-date" data-attendance-date value="${attendanceDate}"></div></div><div class="attendance-list">${students(turma).map(aluno => { const isPresent = record.present[aluno.id] !== false; const rewarded = record.rewarded[aluno.id]; return `<label class="attendance-row ${isPresent ? "is-present" : "is-absent"}"><input type="checkbox" data-attendance-student="${aluno.id}" ${isPresent ? "checked" : ""}><span>${escapeHtml(aluno.name)}</span><small>${rewarded ? "+5 IC registrado" : isPresent ? "Presença gera +5 IC" : "Falta · 0 IC"}</small></label>`; }).join("")}</div></section>`;
}
function attendanceHistoryHtml() {
  const professors = database.professors || [];
  const selectedProfessor = professors.find(professor => professor.id === attendanceProfessorId);
  const records = classes().flatMap(turma => Object.entries(database.attendance?.[turma.id] || {}).map(([date, record]) => ({ turma, date, record }))).filter(item => !selectedProfessor || (item.turma.professores || []).includes(selectedProfessor.name)).sort((a, b) => b.date.localeCompare(a.date));
  return `<section class="attendance-page"><div class="secao-head"><div><p class="page-kicker">Consulta pública</p><h1>🗓️ Registros de chamadas</h1><p>Todos os perfis podem consultar as presenças e faltas já registradas.</p></div><button class="btn btn-primary" data-action="attendance">+ Nova chamada</button></div><div class="professor-filter"><label for="attendance-history-professor">Filtrar por professor</label><select id="attendance-history-professor" data-attendance-professor><option value="all">Todos os professores</option>${professors.map(professor => `<option value="${professor.id}" ${professor.id === attendanceProfessorId ? "selected" : ""}>${escapeHtml(professor.name)}</option>`).join("")}</select></div><div class="attendance-history-list">${records.map(({ turma, date, record }) => { const present = students(turma).filter(aluno => record.present?.[aluno.id] !== false).length; const absent = students(turma).length - present; return `<article class="attendance-history-card"><div><strong>${escapeHtml(turma.guerra || turma.nome)}</strong><p>${escapeHtml(turma.nome)} · ${escapeHtml(turma.dia || "")} · ${(turma.professores || []).map(escapeHtml).join(", ") || "Sem professor"}</p></div><div class="attendance-history-meta"><strong>${new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR")}</strong><span>${present} presentes · ${absent} faltas</span></div></article>`; }).join("") || `<p class="vazio">Nenhum registro de chamada encontrado.</p>`}</div></section>`;
}
function directionAbsencesHtml() {
  const date = new Date(`${directionAbsenceDate}T12:00:00`);
  const weekday = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"][date.getDay()];
  const dayLabel = date.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const scheduledClasses = classes().filter(turma => turma.dia === weekday);
  const classesWithRecords = classes().filter(turma => database.attendance?.[turma.id]?.[directionAbsenceDate]);
  const dailyClasses = [...new Map([...scheduledClasses, ...classesWithRecords].map(turma => [turma.id, turma])).values()].sort((a, b) => (a.horario || "").localeCompare(b.horario || "") || a.nome.localeCompare(b.nome));
  const absences = dailyClasses.flatMap(turma => {
    const record = database.attendance?.[turma.id]?.[directionAbsenceDate];
    return students(turma).filter(aluno => record?.present?.[aluno.id] === false).map(aluno => ({ aluno, turma }));
  });
  const launchedCalls = dailyClasses.filter(turma => database.attendance?.[turma.id]?.[directionAbsenceDate]?.launchedAt).length;
  return `<section class="direction-absences-page"><div class="secao-head"><div><p class="page-kicker">Painel da Direção/Secretaria</p><h1>Faltas do dia</h1><p class="direction-date-label">${escapeHtml(dayLabel)}</p></div><div class="direction-date-controls"><button class="btn btn-ghost" data-action="direction-prev" aria-label="Dia anterior">←</button><input type="date" aria-label="Selecionar dia" data-direction-date value="${escapeHtml(directionAbsenceDate)}"><button class="btn btn-ghost" data-action="direction-next" aria-label="Próximo dia">→</button><button class="btn btn-secondary" data-action="direction-today">Hoje</button></div></div><div class="direction-summary"><article><span>Faltas registradas</span><strong>${absences.length}</strong></article><article><span>Chamadas lançadas</span><strong>${launchedCalls} <small>de ${scheduledClasses.length}</small></strong></article><article><span>Turmas previstas</span><strong>${scheduledClasses.length}</strong></article></div><div class="direction-classes">${dailyClasses.map(turma => {
    const record = database.attendance?.[turma.id]?.[directionAbsenceDate];
    const absentStudents = students(turma).filter(aluno => record?.present?.[aluno.id] === false);
    const status = record?.launchedAt ? "Chamada lançada" : record ? "Chamada em andamento" : "Chamada não registrada";
    return `<article class="direction-class-row ${record?.launchedAt ? "is-launched" : record ? "is-pending" : "is-missing"}"><div class="direction-class-head"><div><h2>${escapeHtml(turma.nome)}</h2><p>${escapeHtml(turma.horario || "Horário não definido")} · ${(turma.professores || []).map(escapeHtml).join(", ") || "Sem professor"}</p></div><span class="direction-call-status">${escapeHtml(status)}</span></div>${absentStudents.length ? `<div class="direction-absent-list">${absentStudents.map(aluno => `<div><span class="direction-absent-mark" aria-hidden="true">!</span><strong>${escapeHtml(aluno.name)}</strong><small>Falta</small></div>`).join("")}</div>` : `<p class="direction-no-absences">${record ? "Nenhuma falta registrada nesta turma." : "Aguardando o registro da chamada."}</p>`}</article>`;
  }).join("") || `<div class="direction-empty"><strong>Nenhuma turma prevista para este dia.</strong><span>Escolha outra data no calendário para consultar os registros.</span></div>`}</div></section>`;
}
function saveAttendanceStatus(studentId, present) {
  const turma = findClass(attendanceClassId); if (!turma) return;
  database.attendance = database.attendance || {};
  database.attendance[turma.id] = database.attendance[turma.id] || {};
  const record = database.attendance[turma.id][attendanceDate] || { present: {}, rewarded: {} };
  record.present = record.present || {};
  record.rewarded = record.rewarded || {};
  record.present[studentId] = present;
  if (present && !record.rewarded[studentId]) {
    const found = findStudent(studentId);
    const actor = activeProfile?.name || selectedActor;
    if (found && actor) {
      found.aluno.points += 5;
      found.aluno.history = found.aluno.history || [];
      found.aluno.history.push({ points: 5, label: "Presença na aula (registrada via chamada)", date: new Date().toISOString(), actor });
      record.rewarded[studentId] = true;
    }
  }
  database.attendance[turma.id][attendanceDate] = record;
  saveDatabase(); render();
}
function launchAttendance() {
  const turma = findClass(attendanceClassId);
  const actor = activeProfile?.name || selectedActor;
  if (!turma || !actor) return showToast("Entre com um perfil antes de lançar a chamada", true);
  database.attendance = database.attendance || {};
  database.attendance[turma.id] = database.attendance[turma.id] || {};
  const record = database.attendance[turma.id][attendanceDate] || { present: {}, rewarded: {} };
  record.present = record.present || {};
  record.rewarded = record.rewarded || {};
  record.launchedAt = new Date().toISOString();
  record.launchedBy = actor;
  database.attendance[turma.id][attendanceDate] = record;
  saveDatabase(); render(); showToast("Chamada lançada");
}
function bestStudentsHtml() {
  const ranking = classes().flatMap(turma => students(turma).map(aluno => ({ aluno, turma }))).sort((a, b) => b.aluno.points - a.aluno.points);
  return `<section class="best-students-page"><div class="secao-head"><div><h1>🌟 Melhores alunos</h1><p>Ranking geral por saldo individual de Innova Coins.</p></div></div><div class="best-students-list">${ranking.map((entry, index) => `<article class="best-student-row"><span class="best-student-rank">#${index + 1}</span><span class="avatar">${initials(entry.aluno.name)}</span><div class="best-student-info"><strong>${escapeHtml(entry.aluno.name)}</strong><span>${escapeHtml(entry.turma.guerra || entry.turma.nome)} · ${(entry.turma.professores || []).map(escapeHtml).join(", ") || "Sem professor"}</span></div><strong class="best-student-points">${entry.aluno.points} IC</strong></article>`).join("") || `<p class="vazio">Ainda não há alunos cadastrados.</p>`}</div></section>`;
}
function historyHtml() {
  const records = classes().flatMap(turma => students(turma).flatMap(aluno => (aluno.history || []).map(item => ({ ...item, aluno: aluno.name, turma: turma.guerra || turma.nome, professores: (turma.professores || []).join(", ") })))).sort((a, b) => new Date(b.date) - new Date(a.date));
  return `<section class="history-page"><div class="secao-head"><div><p class="page-kicker">Página reservada</p><h1>Histórico completo</h1><p>Registro interno de todas as alterações de Innova Coins.</p></div></div><div class="history-table-wrap"><table class="history-table"><thead><tr><th>Data e hora</th><th>Aluno</th><th>Turma</th><th>Professor(es)</th><th>Alterado por</th><th>Alteração</th><th>Motivo</th></tr></thead><tbody>${records.map(item => `<tr><td>${new Date(item.date).toLocaleString("pt-BR")}</td><td><strong>${escapeHtml(item.aluno)}</strong></td><td>${escapeHtml(item.turma)}</td><td>${escapeHtml(item.professores || "—")}</td><td>${escapeHtml(item.actor || "Registro anterior")}</td><td class="${item.points >= 0 ? "history-positive" : "history-negative"}">${item.points >= 0 ? "+" : ""}${item.points} IC</td><td>${escapeHtml(item.label)}</td></tr>`).join("") || `<tr><td colspan="7" class="vazio">Nenhum registro de pontuação ainda.</td></tr>`}</tbody></table></div></section>`;
}
function classHtml(turma) {
  if (!turma) return overviewHtml();
  const ordered = [...students(turma)].sort((a, b) => b.points - a.points);
  return `<section class="turma-page"><div class="secao-head"><div><h1>${escapeHtml(turma.nome)}</h1><p>${escapeHtml(turma.dia || "Dia não definido")} · ${escapeHtml(turma.horario || "Horário não definido")}</p><p>🎯 Nome de guerra: <strong>${escapeHtml(turma.guerra || "não definido")}</strong></p><p>Professores: ${(turma.professores || []).map(escapeHtml).join(", ") || "nenhum informado"}</p></div><div class="secao-actions"><button class="btn btn-secondary" data-action="edit-class">✏️ Editar turma</button><button class="btn btn-danger" data-action="delete-class">🗑️ Apagar</button></div></div><div class="stats-row"><div class="stat-card"><p class="stat-label">Coins da turma</p><p class="stat-value">${pointsTotal(turma)} ⭐</p></div><div class="stat-card"><p class="stat-label">Alunos</p><p class="stat-value">${ordered.length}</p></div></div><div class="secao-sub"><div class="secao-sub-head"><h2>Alunos e ranking</h2><button class="btn btn-primary btn-small" data-action="new-student">+ Adicionar aluno</button></div><div class="alunos-grid">${ordered.map((aluno, index) => `<article class="aluno-card"><div class="aluno-rank">#${index + 1}</div><div class="aluno-head"><span class="avatar">${initials(aluno.name)}</span><div><p class="aluno-nome">${escapeHtml(aluno.name)}</p><strong class="aluno-coins">${aluno.points} ⭐</strong></div></div><div class="aluno-actions"><button class="btn btn-secondary btn-small" data-student="${aluno.id}">Registrar coins</button><button class="btn btn-ghost btn-small" data-action="edit-student" data-student="${aluno.id}">✏️</button><button class="btn btn-ghost btn-small" data-action="edit-balance" data-student="${aluno.id}">💰 Ajustar</button><button class="btn btn-danger btn-small" data-action="delete-student" data-student="${aluno.id}">🗑️</button></div></article>`).join("") || `<p class="vazio">Nenhum aluno cadastrado.</p>`}</div></div></section>`;
}
function professorHtml(professorId) {
  const professor = (database.professors || []).find(item => item.id === professorId);
  if (!professor) return overviewHtml();
  const allAssignedClasses = classes().filter(turma => (turma.professores || []).includes(professor.name));
  const days = [...new Set(allAssignedClasses.map(turma => turma.dia).filter(Boolean))];
  const assignedClasses = selectedProfessorDay === "all" ? allAssignedClasses : allAssignedClasses.filter(turma => turma.dia === selectedProfessorDay);
  return `<section class="professor-page"><div class="secao-head"><div class="professor-heading">${professorAvatarHtml(professor, "large")}<div><p class="page-kicker">Área do professor</p><h1>${escapeHtml(professor.name)}</h1><p>${assignedClasses.length} de ${allAssignedClasses.length} turma(s) exibida(s)</p></div></div><div class="secao-actions"><button class="btn btn-secondary" data-action="edit-professor-photo">📷 Trocar foto</button><button class="btn btn-secondary" data-action="edit-professor">✏️ Editar</button><button class="btn btn-danger" data-action="delete-professor">🗑️ Apagar</button></div></div><div class="professor-filter"><label for="professor-day-filter">Filtrar por dia</label><select id="professor-day-filter" data-professor-day><option value="all">Todos os dias</option>${days.map(day => `<option value="${escapeHtml(day)}" ${selectedProfessorDay === day ? "selected" : ""}>${escapeHtml(day)}</option>`).join("")}</select></div><div class="professor-classes">${assignedClasses.map(turma => `<article class="turma-card"><div><h3>${escapeHtml(turma.guerra || turma.nome)}</h3><p>${escapeHtml(turma.nome)} · ${escapeHtml(turma.dia || "Dia não definido")} · ${escapeHtml(turma.horario || "Horário não definido")}</p><p>${students(turma).length} alunos · ${pointsTotal(turma)} ⭐</p></div><button class="btn btn-secondary" data-turma="${turma.id}">Abrir turma</button></article>`).join("") || `<p class="vazio">Nenhuma turma encontrada para este dia.</p>`}</div></section>`;
}
function bindContentEvents() {
  document.querySelectorAll("[data-turma]").forEach(button => button.addEventListener("click", () => { selectedClassId = button.dataset.turma; selectedProfessorId = null; render(); }));
  document.querySelectorAll("[data-professor]").forEach(button => button.addEventListener("click", () => { selectedProfessorId = button.dataset.professor; selectedProfessorDay = "all"; selectedClassId = "overview"; render(); }));
  document.querySelectorAll("[data-professor-day]").forEach(select => select.addEventListener("change", event => { selectedProfessorDay = event.target.value; render(); }));
  document.querySelectorAll("[data-attendance-professor]").forEach(select => select.addEventListener("change", event => { attendanceProfessorId = event.target.value; attendanceClassId = ""; render(); }));
  document.querySelectorAll("[data-attendance-class]").forEach(select => select.addEventListener("change", event => { attendanceClassId = event.target.value; render(); }));
  document.querySelectorAll("[data-attendance-date]").forEach(input => input.addEventListener("change", event => { attendanceDate = event.target.value; render(); }));
  document.querySelectorAll("[data-direction-date]").forEach(input => input.addEventListener("change", event => { if (event.target.value) { directionAbsenceDate = event.target.value; render(); } }));
  document.querySelectorAll("[data-calendar-month]").forEach(input => input.addEventListener("change", event => { if (/^\d{4}-\d{2}$/.test(event.target.value)) { selectedCalendarMonth = event.target.value; render(); } }));
  document.querySelectorAll("[data-calendar-owner]").forEach(select => select.addEventListener("change", event => { selectedCalendarOwner = event.target.value; render(); }));
  document.querySelectorAll("[data-calendar-day]").forEach(button => button.addEventListener("click", () => openCalendarDay(button.dataset.calendarDay)));
  document.querySelectorAll("[data-attendance-student]").forEach(input => input.addEventListener("change", event => saveAttendanceStatus(event.target.dataset.attendanceStudent, event.target.checked)));
  document.querySelectorAll("button[data-student]:not([data-action])").forEach(button => button.addEventListener("click", () => openDrawer(button.dataset.student)));
  document.querySelectorAll("[data-action]").forEach(button => button.addEventListener("click", () => {
    const action = button.dataset.action;
    if (action === "new-class") openClassModal();
    if (action === "edit-class") openClassModal(selectedClassId);
    if (action === "delete-class") deleteClass(selectedClassId);
    if (action === "new-student") openStudentModal();
    if (action === "edit-student") openStudentModal(button.dataset.student);
    if (action === "edit-balance") openBalanceModal(button.dataset.student);
    if (action === "delete-student") deleteStudent(button.dataset.student);
    if (action === "new-award") openAwardModal();
    if (action === "award-prev") { awardSlide = Math.max(0, awardSlide - 1); render(); }
    if (action === "award-next") { awardSlide += 1; render(); }
    if (action === "delete-award") deleteAward(Number(button.dataset.award));
    if (action === "edit-professor") openProfessorModal(selectedProfessorId);
    if (action === "edit-professor-photo") openProfessorModal(selectedProfessorId, true);
    if (action === "delete-professor") deleteProfessor(selectedProfessorId);
    if (action === "attendance") { selectedClassId = "attendance"; selectedProfessorId = null; render(); }
    if (action === "launch-attendance") launchAttendance();
    if (action === "attendance-history") { selectedClassId = "attendance-history"; selectedProfessorId = null; render(); }
    if (action === "direction-prev" || action === "direction-next" || action === "direction-today") {
      if (action === "direction-today") directionAbsenceDate = localDateString();
      else { const selectedDate = new Date(`${directionAbsenceDate}T12:00:00`); selectedDate.setDate(selectedDate.getDate() + (action === "direction-next" ? 1 : -1)); directionAbsenceDate = localDateString(selectedDate); }
      render();
    }
    if (action === "calendar-previous") shiftCalendarMonth(-1);
    if (action === "calendar-next") shiftCalendarMonth(1);
    if (action === "calendar-print") window.print();
  }));
}

function openClassModal(id = null) {
  editingClassId = id;
  const turma = id ? findClass(id) : null;
  document.getElementById("modal-turma-title").textContent = turma ? "Editar turma" : "Nova turma";
  document.getElementById("turma-nome").value = turma?.nome || "";
  document.getElementById("turma-guerra").value = turma?.guerra || "";
  document.getElementById("turma-dia").value = turma?.dia || "";
  document.getElementById("turma-horario").value = turma?.horario || "";
  document.getElementById("turma-professores").value = (turma?.professores || []).join(", ");
  document.getElementById("modal-turma-overlay").style.display = "flex";
}
function saveClass() {
  const nome = document.getElementById("turma-nome").value.trim();
  if (!nome) return showToast("Informe o nome da turma", true);
  const data = { nome, guerra: document.getElementById("turma-guerra").value.trim(), dia: document.getElementById("turma-dia").value, horario: document.getElementById("turma-horario").value, professores: document.getElementById("turma-professores").value.split(",").map(item => item.trim()).filter(Boolean) };
  registerProfessorNames(data.professores);
  if (editingClassId) Object.assign(findClass(editingClassId), data); else { const turma = { id: uid("class"), ...data, students: [] }; database.classes.push(turma); selectedClassId = turma.id; }
  saveDatabase(); closeModal("modal-turma"); render(); showToast("Turma salva");
}
function deleteClass(id) { const turma = findClass(id); if (!turma || !confirm(`Apagar a turma "${turma.nome}" e seus alunos?`)) return; database.classes = classes().filter(item => item.id !== id); selectedClassId = "overview"; saveDatabase(); render(); showToast("Turma apagada"); }
function openStudentModal(id = null) {
  editingStudentId = id;
  const found = id ? findStudent(id) : null;
  document.getElementById("modal-aluno-title").textContent = found ? "Editar aluno" : "Novo aluno";
  document.getElementById("aluno-nome").value = found?.aluno.name || "";
  document.getElementById("modal-aluno-overlay").style.display = "flex";
}
function saveStudent() {
  const name = document.getElementById("aluno-nome").value.trim();
  if (!name) return showToast("Informe o nome do aluno", true);
  if (editingStudentId) findStudent(editingStudentId).aluno.name = name; else findClass(selectedClassId).students.push({ id: uid("student"), name, points: 0, history: [] });
  saveDatabase(); closeModal("modal-aluno"); render(); showToast("Aluno salvo");
}
function openBalanceModal(id) {
  const found = findStudent(id); if (!found) return;
  activeStudentId = id;
  document.getElementById("saldo-aluno-label").textContent = `${found.aluno.name} · saldo atual: ${found.aluno.points} IC`;
  document.getElementById("saldo-novo").value = found.aluno.points;
  document.getElementById("saldo-motivo").value = "";
  document.getElementById("modal-saldo-overlay").style.display = "flex";
}
function saveBalance() {
  const found = findStudent(activeStudentId);
  const newTotal = Number(document.getElementById("saldo-novo").value);
  const reason = document.getElementById("saldo-motivo").value.trim();
  const actor = activeProfile?.name || selectedActor;
  if (!found || !Number.isFinite(newTotal) || !reason || !actor) return showToast("Informe o novo saldo e o motivo", true);
  const difference = newTotal - found.aluno.points;
  if (difference === 0) return showToast("O saldo não mudou", true);
  found.aluno.points = newTotal;
  found.aluno.history = found.aluno.history || [];
  found.aluno.history.push({ points: difference, label: `Ajuste de saldo: ${reason}`, date: new Date().toISOString(), actor });
  saveDatabase(); closeModal("modal-saldo"); render(); showToast("Saldo ajustado e registrado");
}
function deleteStudent(id) { const found = findStudent(id); if (!found || !confirm(`Apagar o aluno "${found.aluno.name}"?`)) return; found.turma.students = students(found.turma).filter(aluno => aluno.id !== id); saveDatabase(); render(); showToast("Aluno apagado"); }
function openAwardModal() { document.getElementById("award-photo").value = ""; document.getElementById("award-caption").value = ""; document.getElementById("modal-award-overlay").style.display = "flex"; }
async function saveAward() {
  const file = document.getElementById("award-photo").files[0];
  if (!file) return showToast("Selecione uma foto", true);
  if (file.size > 5 * 1024 * 1024) return showToast("A foto deve ter no máximo 5 MB", true);
  try {
    const image = await compressImage(file);
    database.awards = database.awards || [];
    database.awards.push({ id: uid("award"), image, caption: document.getElementById("award-caption").value.trim(), createdAt: new Date().toISOString() });
    saveDatabase(); closeModal("modal-award"); awardSlide = database.awards.length - 1; render(); showToast("Prêmio adicionado");
  } catch (error) { showToast("Não foi possível salvar a foto", true); }
}
function deleteAward(index) { if (!confirm("Remover esta foto do prêmio?")) return; database.awards.splice(index, 1); awardSlide = 0; saveDatabase(); render(); showToast("Prêmio removido"); }
function registerProfessorNames(names) {
  database.professors = database.professors || [];
  names.forEach(name => { if (!database.professors.some(professor => professor.name.toLowerCase() === name.toLowerCase())) database.professors.push({ id: uid("professor"), name }); });
}
function openProfessorModal(id = null, photoOnly = false) {
  editingProfessorId = id;
  editingProfessorPhotoOnly = photoOnly;
  const professor = (database.professors || []).find(item => item.id === id);
  document.getElementById("modal-professor-title").textContent = photoOnly ? "Trocar foto do professor" : professor ? "Editar professor" : "Novo professor";
  document.getElementById("professor-nome").value = professor?.name || "";
  document.getElementById("professor-nome").disabled = photoOnly;
  document.getElementById("professor-foto").value = "";
  document.getElementById("btn-salvar-professor").textContent = photoOnly ? "Salvar foto" : "Salvar professor";
  document.getElementById("modal-professor-overlay").style.display = "flex";
}
async function saveProfessor() {
  const name = document.getElementById("professor-nome").value.trim();
  if (!name || (editingProfessorPhotoOnly && !editingProfessorId)) return showToast("Informe o nome do professor", true);
  const duplicate = (database.professors || []).some(professor => professor.id !== editingProfessorId && professor.name.toLowerCase() === name.toLowerCase());
  if (duplicate) return showToast("Esse professor já está cadastrado", true);
  const file = document.getElementById("professor-foto").files[0];
  if (file && file.size > 5 * 1024 * 1024) return showToast("A foto deve ter no máximo 5 MB", true);
  let photo;
  if (file) {
    try {
      photo = await compressImage(file);
    } catch (error) {
      return showToast("Não foi possível ler a foto selecionada", true);
    }
  }
  if (editingProfessorPhotoOnly && !photo) return showToast("Selecione uma foto", true);
  if (editingProfessorId) {
    const professor = database.professors.find(item => item.id === editingProfessorId);
    const previousName = professor.name;
    if (!editingProfessorPhotoOnly) professor.name = name;
    if (photo) professor.photo = photo;
    if (!editingProfessorPhotoOnly) classes().forEach(turma => { turma.professores = (turma.professores || []).map(item => item === previousName ? name : item); });
  } else {
    database.professors.push({ id: uid("professor"), name, ...(photo ? { photo } : {}) });
  }
  saveDatabase(); closeModal("modal-professor"); render(); showToast(editingProfessorPhotoOnly ? "Foto atualizada" : "Professor salvo");
}
function deleteProfessor(id) {
  const professor = (database.professors || []).find(item => item.id === id);
  if (!professor || !confirm(`Apagar o professor "${professor.name}"? As turmas não serão apagadas.`)) return;
  database.professors = database.professors.filter(item => item.id !== id);
  classes().forEach(turma => { turma.professores = (turma.professores || []).filter(name => name !== professor.name); });
  selectedProfessorId = null; saveDatabase(); render(); showToast("Professor apagado");
}

function openDrawer(studentId) {
  activeStudentId = studentId;
  const found = findStudent(studentId); if (!found) return;
  document.getElementById("drawer-avatar").textContent = initials(found.aluno.name);
  document.getElementById("drawer-name").textContent = found.aluno.name;
  document.getElementById("drawer-total").textContent = found.aluno.points;
  document.getElementById("points-actor-label").textContent = activeProfile?.name || selectedActor || "—";
  document.getElementById("benefit-chips").innerHTML = COINS.filter(item => item.points > 0).map(coinButton).join("");
  document.getElementById("penalty-chips").innerHTML = COINS.filter(item => item.points < 0).map(coinButton).join("");
  document.getElementById("drawer-overlay").classList.add("open");
}
function coinButton(item) { return `<button class="chip ${item.points > 0 ? "chip-benefit" : "chip-penalty"}" data-points="${item.points}" data-label="${escapeHtml(item.label)}">${item.points > 0 ? "+" : ""}${item.points} · ${escapeHtml(item.label)}</button>`; }
function registerPoints(points, label) { const found = findStudent(activeStudentId); const actor = activeProfile?.name || selectedActor; if (!found || !actor) return showToast("Entre com um perfil antes de registrar", true); found.aluno.points += Number(points); found.aluno.history = found.aluno.history || []; found.aluno.history.push({ points: Number(points), label, date: new Date().toISOString(), actor }); saveDatabase(); openDrawer(activeStudentId); render(); showToast(`${points > 0 ? "+" : ""}${points} coins registrados`); }
function closeDrawer() { document.getElementById("drawer-overlay").classList.remove("open"); activeStudentId = null; }
function closeModal(name) { document.getElementById(`${name}-overlay`).style.display = "none"; }
function showToast(message, error = false) { const toast = document.getElementById("toast"); toast.textContent = message; toast.className = `toast show ${error ? "toast-error" : ""}`; setTimeout(() => toast.classList.remove("show"), 2500); }
function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const maxDimension = 900;
        const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.78));
      };
      image.onerror = reject;
      image.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
document.addEventListener("DOMContentLoaded", async () => {
  clearLegacyProfileSession();
  updateProfileOptions();
  document.getElementById("login-submit").addEventListener("click", enterWithPin);
  document.getElementById("profile-pin").addEventListener("keydown", event => { if (event.key === "Enter") enterWithPin(); });
  document.getElementById("change-profile-btn").addEventListener("click", changeProfile);
  document.getElementById("new-turma-btn").addEventListener("click", () => openClassModal());
  document.getElementById("new-professor-btn").addEventListener("click", () => openProfessorModal());
  document.querySelector(".nav-overview").addEventListener("click", () => { selectedClassId = "overview"; selectedProfessorId = null; render(); });
  document.querySelector(".nav-attendance").addEventListener("click", () => { selectedClassId = "attendance"; selectedProfessorId = null; render(); });
  document.querySelector(".nav-attendance-history").addEventListener("click", () => { selectedClassId = "attendance-history"; selectedProfessorId = null; render(); });
  document.querySelector(".nav-schedule").addEventListener("click", () => { selectedClassId = "schedule"; selectedProfessorId = null; render(); });
  document.querySelector(".nav-monthly-calendar").addEventListener("click", () => { selectedClassId = "monthly-calendar"; selectedProfessorId = null; render(); });
  document.querySelector(".nav-direction-absences").addEventListener("click", () => { if (activeProfile?.id === "direcao") { directionAbsenceDate = localDateString(); selectedClassId = "direction-absences"; selectedProfessorId = null; render(); } });
  document.getElementById("btn-salvar-turma").addEventListener("click", saveClass);
  document.getElementById("btn-salvar-aluno").addEventListener("click", saveStudent);
  document.getElementById("btn-salvar-saldo").addEventListener("click", saveBalance);
  document.getElementById("btn-salvar-professor").addEventListener("click", saveProfessor);
  document.getElementById("btn-salvar-award").addEventListener("click", saveAward);
  document.getElementById("calendar-save-day").addEventListener("click", saveCalendarDay);
  document.getElementById("calendar-clear-day").addEventListener("click", clearCalendarDay);
  document.querySelectorAll("[data-close]").forEach(button => button.addEventListener("click", () => closeModal(button.dataset.close)));
  document.getElementById("drawer-close").addEventListener("click", closeDrawer);
  document.getElementById("drawer-overlay").addEventListener("click", event => { if (event.target.id === "drawer-overlay") closeDrawer(); });
  document.addEventListener("click", event => { const chip = event.target.closest("[data-points]"); if (chip) registerPoints(chip.dataset.points, chip.dataset.label); });
  if (window.location.hash === "#historico") selectedClassId = "history";
  window.innovaSupabaseClient.auth.onAuthStateChange(event => {
    if (event === "SIGNED_OUT") lockStaffSession();
  });
  try {
    const { data, error } = await window.innovaSupabaseClient.auth.getSession();
    if (error) throw error;
    if (data.session) await openStaffSession(data.session);
  } catch (error) {
    currentAuthUser = null;
    activeProfile = null;
    await window.innovaSupabaseClient.auth.signOut();
    console.error("Não foi possível restaurar a sessão autorizada", error);
    showLoginScreen(error.message || "Não foi possível validar sua conta.");
  }
  setInterval(() => {
    if (currentAuthUser && !sharedSyncRunning && !sharedSyncPending) void loadSharedData();
  }, 30000);
  setInterval(() => {
    const today = localDateString();
    if (today !== lastObservedLocalDate) {
      const wasShowingToday = directionAbsenceDate === lastObservedLocalDate;
      lastObservedLocalDate = today;
      if (wasShowingToday) {
        directionAbsenceDate = today;
        if (selectedClassId === "direction-absences") render();
      }
    }
    if (selectedClassId === "overview" && (database.awards || []).length > 1) {
      awardSlide = (awardSlide + 1) % database.awards.length;
      const carousel = document.querySelector(".awards-carousel");
      const current = database.awards[awardSlide];
      if (carousel && current) {
        const image = carousel.querySelector(".award-slide img");
        const caption = carousel.querySelector(".award-caption");
        const counter = carousel.querySelector(".award-controls span");
        if (image) {
          image.src = current.image;
          image.alt = current.caption || "Prêmio Innova Coins";
        }
        if (caption) caption.textContent = current.caption || "Prêmio Innova Coins";
        if (counter) counter.textContent = `${awardSlide + 1} / ${database.awards.length}`;
      }
    }
  }, 5000);
});
window.addEventListener("hashchange", () => {
  if (!activeProfile) return;
  selectedProfessorId = null;
  selectedClassId = window.location.hash === "#historico" ? "history" : "overview";
  render();
});
