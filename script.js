const STORAGE_KEY = "innovaCoinsDatabase_v2";
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
const DEFAULT_PROFILES = [
  { id: "admin", name: "Administrador", pin: "804272" },
  { id: "matheus", name: "Matheus", pin: "391658" },
  { id: "jheni", name: "Jheni", pin: "726904" },
  { id: "lucas", name: "Lucas", pin: "158437" },
  { id: "direcao", name: "Direção", pin: "943812" }
];

const DEFAULT_CLASSES = [
  { id: "terca-discovery-14h", nome: "Discovery 14h", guerra: "", dia: "Terça-feira", horario: "14h", professores: ["Matheus"], alunos: ["Bernardo Sousa Martins", "Bianca da Silva Farias", "Carlos Roberto do Nascimento", "Danilo Levi Carvalho Alves e Silva", "Davi Gomes Passos", "Guilherme de Lima Lyra", "Heitor de Siqueira Mattioli", "Luis Augusto Moura Silva", "Nicolas Barros de França", "Sophia Moura da Silva"] },
  { id: "quarta-curiosity4-14h", nome: "Curiosity 4", guerra: "", dia: "Quarta-feira", horario: "14h", professores: ["Matheus"], alunos: ["Aurora Naves Felix", "Davi Augusto Rocha de Holanda", "Hugo Naves Felix", "Calebe Sales Luz"] },
  { id: "sexta-discovery2-9h", nome: "Discovery 2", guerra: "", dia: "Sexta-feira", horario: "9h", professores: ["Jhenifer", "Matheus"], alunos: ["Arthur Tozetti", "Davi Rodrigues de Souza", "Gabriel Souza Salgado", "George Gabriel da Cunha", "Josué Abreu Pereira", "Kalel Pinheiro Lemes de Oliveira", "Luciano Macêdo de Carvalho", "Mariana Nunes dos Santo", "Miguel Monteiro Barbosa de Souza", "Rafael Durães de Faria", "Samuel Araújo dos Passos", "Túlio dos Santos Nobre"] },
  { id: "sexta-discovery4-14h", nome: "Discovery 4", guerra: "", dia: "Sexta-feira", horario: "14h", professores: ["Matheus", "Jhenifer"], alunos: ["Cecília Azevedo Silva de Carvalho", "Luigi Viana de Almeida", "Letícia Ozeias Medeiros", "Ryan Martins Braz"] },
  { id: "sabado-curiosity4-08h", nome: "Curiosity 4", guerra: "", dia: "Sábado", horario: "8h", professores: ["Matheus"], alunos: ["Bento Moreira Prates Menezes", "Bento Guidugli Debuz Vieira", "Caique Curvello Marinho", "Calebe Sales Luz", "Eliza Barros Rodrigues", "Gabriel Garcia dos Santos", "Maria Clara Pereira Ferreira Benvindo", "Miguel Leão Gomes", "Miguel Alves Costa", "Sofia Albuquerque Aerre"] },
  { id: "sabado-discovery2-10h", nome: "Discovery 2", guerra: "", dia: "Sábado", horario: "10h", professores: ["Matheus"], alunos: ["Heitor Reis Lima", "Heitor Souza de Jesus", "João Pedro Santana", "João Vieira dos Santos Neto", "Jonas Souza de Jesus", "Miguel Nascimento", "Pedro Lucas Monteiro de Sousa", "Pedro Tavares Silva Barroso"] },
  { id: "sabado-discovery-13h", nome: "Discovery", guerra: "", dia: "Sábado", horario: "13h", professores: ["Matheus"], alunos: ["Gabriel Merten Pereira", "Theo Richard Almeida Jordão"] }
];

const JHENI_ROSTER = [
  { nome: "Challenger", dia: "Terça-feira", horario: "16h", alunos: ["Francisco Wellyton da Silva", "Victor Vieira de Queiroga", "Lucas"] },
  { nome: "Discovery", dia: "Quarta-feira", horario: "14h", alunos: ["Ísis Figueiredo Rodrigues", "João Luís Azeredo Dias", "Josebe Moura Rocha", "Sara Ferreira Barros", "Santiago Nina Pedrouzo Perez"] },
  { nome: "Discovery", dia: "Quarta-feira", horario: "16h", alunos: ["Henrique Rodrigues de Souza", "Miguel Morais Alexandre", "Miguel Gonçalves Bizinoto", "Pedro Avelar Ribeiro"] },
  { nome: "Discovery I", dia: "Sexta-feira", horario: "9h", alunos: ["George Gabriel da Cunha", "João", "Kalel Pinheiro Lemes de Oliveira", "Luciano Macêdo de Carvalho", "Miguel Monteiro Barbosa de Souza", "Samuel Araújo dos Passos", "Túlio dos Santos Nobre"] },
  { nome: "Pioneer", dia: "Sexta-feira", horario: "14h", alunos: ["Sofia da Silva Reis", "Mateus Silva Coelho Vargas"] },
  { nome: "Discovery", dia: "Sábado", horario: "8h", alunos: ["Isaac Cassiano de Oliveira", "Katarina Lucena Bahia", "Miguel Henrique de Oliveira Arruda"] },
  { nome: "Pioneer", dia: "Sábado", horario: "10h", alunos: ["Bryan Victor De Caldeira Lima", "Cecília", "Julia Santos Oliveira"] },
  { nome: "Curiosity", dia: "Sábado", horario: "13h", alunos: ["Athos Raphael Barreto De Oliveira", "Kaleo Luíz Camurça Fragoso e Barros", "Rebeca Rocha Rosário"] },
  { nome: "Pioneer", dia: "Sábado", horario: "13h", alunos: ["Arthur Baruc Santos"] }
];

const LUCAS_ROSTER = [
  { nome: "Pioneer 2 L5", dia: "Quinta-feira", horario: "09h", alunos: ["Heitor Pereira da Silva", "Santhiago Reis Mota dos Santos"] },
  { nome: "Pioneer 3 L5", dia: "Sábado", horario: "13h", alunos: ["Davi José Moura da Silva", "Enzo de Campos Oliveira", "Gabryela Da Silva Ferraz", "Guilherme Marinho Cabral", "Miguel Davi de Almeida Varela", "Sandoval de Queiroz Miguel"] },
  { nome: "Pioneer 4 L2", dia: "Quarta-feira", horario: "14h", alunos: ["Ana Carolina de Oliveira Sena", "Arthur Aguiar Cruz", "Artur Rocha de Oliveira", "Eduardo Pedrouzo Perez Neto", "Enzo Eduardo Cardoso de Oliveira", "Gabriel Moraes dos Santos", "Henrique de Souza Leite", "Marya Alice Nogueira Santiago", "Ryan Pereira de Castro"] },
  { nome: "Pioneer 4 L2", dia: "Sexta-feira", horario: "09h", alunos: ["Benjamin Moro Redeschi Buss", "Kauan Gabriel Macedo Silva", "Laila Figueiredo Rodrigues Parreira", "Santhiago Reis Mota dos Santos"] },
  { nome: "Pioneer 4 L5", dia: "Sexta-feira", horario: "14h", alunos: ["Anna Júlia Bolzani Soares", "Arthur Melo Carvalho", "Benjamin Moro Redeschi Buss", "Davi Félix Ferreira Xavier", "Davi Miguel de Castro Crispim", "Gabriel Asafe da Silva Neves", "Lucas Ozeias Medeiros", "Pedro Euclides Simões Noronha", "Pedro Mendes de Souza"] },
  { nome: "Challenger", dia: "Quinta-feira", horario: "14h", alunos: ["Henrique Eduardo", "Lara Pessoa Martins de Almeida", "Lucas dos Anjos", "Maria Luiza"] },
  { nome: "Challenger 2 L2", dia: "Sábado", horario: "10h", alunos: ["Ana Carolina Santos Oliveira", "Anna Luiza de Aguiar", "Antônio Hamilton Zancan Mourão", "Heitor Lima Oliveira", "Luís Felipe Figueiredo Olivé", "Mateus Caeiro Lima", "Pietro Gonçalves Gomes", "Rafael Caeiro Lima"] },
  { nome: "Challenger 3 L2", dia: "Sexta-feira", horario: "16h", alunos: ["João Benicio Alves Matias", "Samuel Ribeiro Siqueira"] },
  { nome: "Challenger 4 L5", dia: "Quinta-feira", horario: "16h", alunos: ["Guilherme Ambrozino Alves C. Carneiro", "João Henrique Morais Gonçalves", "Lucas Emanuel Marinho de Oliveira", "Luiz Eduardo Godefroy Castro", "Rafaella Martins de Souza"] },
  { nome: "Challenger 4 L2", dia: "Sábado", horario: "15h", alunos: ["Ayla Monteiro Barbosa de Souza", "Emanuel Barreto de Souza", "Miguel Camelo Ferreira", "Miguel Oliveira de Lima", "Samara Cristine Golçalves de Lima"] }
];

let database = loadDatabase();
let selectedClassId = "overview";
let selectedProfessorId = null;
let selectedProfessorDay = "all";
let attendanceClassId = "";
let attendanceProfessorId = "all";
let attendanceDate = new Date().toISOString().slice(0, 10);
let awardSlide = 0;
let activeStudentId = null;
let editingClassId = null;
let editingStudentId = null;
let editingProfessorId = null;
let editingProfessorPhotoOnly = false;
let selectedActor = "";
let profiles = DEFAULT_PROFILES;
let activeProfile = null;

function uid(prefix) { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }
function loadDatabase() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved.classes)) {
      const migrated = applyLucasRoster(applyJheniRoster(normalizeDatabase(saved)));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    }
  } catch (error) { console.warn("Banco local indisponível", error); }
  const initial = applyLucasRoster(applyJheniRoster(normalizeDatabase({ classes: DEFAULT_CLASSES.map(item => ({ id: item.id, nome: item.nome, guerra: item.guerra, dia: item.dia, horario: item.horario, professores: item.professores, students: item.alunos.map(name => ({ id: uid("student"), name, points: 0, history: [] })) })) })));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
}
function normalizeDatabase(data) {
  const classesData = (data.classes || []).map(turma => ({ ...turma, professores: (turma.professores || []).map(name => name === "Jhenifer" ? "Jheni" : name), students: (turma.students || turma.alunos || []).map(aluno => typeof aluno === "string" ? { id: uid("student"), name: aluno, points: 0, history: [] } : aluno) }));
  const names = [...(data.professors || []).map(professor => professor.name), ...classesData.flatMap(turma => turma.professores || []), "Matheus", "Jheni", "Lucas"];
  const uniqueNames = [...new Set(names.filter(Boolean))];
  return { ...data, classes: classesData, awards: Array.isArray(data.awards) ? data.awards : [], attendance: data.attendance || {}, professors: uniqueNames.map(name => { const professor = (data.professors || []).find(item => item.name === name) || { id: uid("professor"), name }; return name === "Jheni" && !professor.photo ? { ...professor, photo: "unnamed (1).jpg" } : professor; }) };
}
function applyJheniRoster(data) {
  if (data.migrations?.jheniRoster20260924c) return data;
  const existingClasses = data.classes.map(turma => ({ ...turma, professores: (turma.professores || []).filter(name => name !== "Jheni") })).filter(turma => turma.professores.length > 0);
  const newClasses = JHENI_ROSTER.map(item => ({ id: uid("class"), nome: item.nome, guerra: "", dia: item.dia, horario: item.horario, professores: ["Jheni"], students: item.alunos.map(name => ({ id: uid("student"), name, points: 0, history: [] })) }));
  return { ...data, classes: [...existingClasses, ...newClasses], migrations: { ...(data.migrations || {}), jheniRoster20260924c: true } };
}
function applyLucasRoster(data) {
  if (data.migrations?.lucasRoster20261001a) return data;
  const newClasses = LUCAS_ROSTER.map(item => ({ id: uid("class"), nome: item.nome, guerra: "", dia: item.dia, horario: item.horario, professores: ["Lucas"], students: item.alunos.map(name => ({ id: uid("student"), name, points: 0, history: [] })) }));
  return { ...data, classes: [...data.classes, ...newClasses], migrations: { ...(data.migrations || {}), lucasRoster20261001a: true } };
}
function saveDatabase() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(database));
  if (window.firestoreDb) syncFirestore(database);
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
async function loadProfiles() {
  if (!window.firestoreDb) return DEFAULT_PROFILES;
  try {
    const snapshot = await window.firestoreDb.collection("profiles").get();
    if (!snapshot.empty) return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    for (const profile of DEFAULT_PROFILES) await window.firestoreDb.collection("profiles").doc(profile.id).set(profile);
  } catch (error) { console.warn("Perfis locais em uso", error); }
  return DEFAULT_PROFILES;
}
function showPinScreen() { document.getElementById("pin-screen").classList.remove("hidden"); }
function enterWithPin() {
  const profile = profiles.find(item => item.id === document.getElementById("profile-select").value);
  const pin = document.getElementById("profile-pin").value;
  if (!profile || pin !== profile.pin) { document.getElementById("pin-message").textContent = "Perfil ou PIN incorreto."; return; }
  activeProfile = profile;
  selectedActor = profile.name;
  sessionStorage.setItem("innovaCoinsActiveProfile", JSON.stringify(profile));
  document.getElementById("pin-message").textContent = "";
  document.getElementById("pin-screen").classList.add("hidden");
  render();
}
function changeProfile() { activeProfile = null; selectedActor = ""; sessionStorage.removeItem("innovaCoinsActiveProfile"); document.getElementById("profile-pin").value = ""; showPinScreen(); }

function render() {
  renderSidebar();
  const total = classes().reduce((sum, turma) => sum + pointsTotal(turma), 0);
  document.getElementById("header-total").innerHTML = `<strong>${total}</strong> coins distribuídos ao todo`;
  document.getElementById("content").innerHTML = selectedProfessorId ? professorHtml(selectedProfessorId) : selectedClassId === "overview" ? overviewHtml() : selectedClassId === "best-students" ? bestStudentsHtml() : selectedClassId === "history" ? historyHtml() : selectedClassId === "awards" ? awardsHtml() : selectedClassId === "attendance" ? attendanceHtml() : selectedClassId === "attendance-history" ? attendanceHistoryHtml() : classHtml(findClass(selectedClassId));
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
  if (!awards.length) return `<aside class="awards-carousel empty-awards"><div class="awards-carousel-head"><h2>🏅 Prêmios</h2><button class="btn btn-small btn-secondary" data-action="new-award">+ Foto</button></div><p>Adicione fotos dos prêmios que as turmas já conquistaram.</p></aside>`;
  const current = awards[awardSlide % awards.length];
  return `<aside class="awards-carousel"><div class="awards-carousel-head"><h2>🏅 Prêmios</h2><button class="btn btn-small btn-secondary" data-action="new-award">+ Foto</button></div><div class="award-slide"><img src="${current.image}" alt="${escapeHtml(current.caption || "Prêmio Innova Coins")}"><div class="award-caption">${escapeHtml(current.caption || "Prêmio Innova Coins")}</div></div><div class="award-controls"><button class="btn btn-ghost btn-small" data-action="award-prev">←</button><span>${awardSlide % awards.length + 1} / ${awards.length}</span><button class="btn btn-ghost btn-small" data-action="award-next">→</button></div></aside>`;
}
function awardsHtml() {
  const awards = database.awards || [];
  return `<section class="awards-page"><div class="secao-head"><div><p class="page-kicker">Galeria</p><h1>🏅 Prêmios conquistados</h1><p>Fotos das conquistas que aparecem ao lado do pódio.</p></div><button class="btn btn-primary" data-action="new-award">+ Adicionar foto</button></div><div class="awards-manager-grid">${awards.map((award, index) => `<article class="award-manager-card"><img src="${award.image}" alt="${escapeHtml(award.caption || "Prêmio")}"><div><strong>${escapeHtml(award.caption || "Prêmio Innova Coins")}</strong><button class="btn btn-danger btn-small" data-action="delete-award" data-award="${index}">🗑️ Remover</button></div></article>`).join("") || `<p class="vazio">Nenhuma foto cadastrada.</p>`}</div></section>`;
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
async function syncFirestore(data) { try { await window.firestoreDb.collection("innova").doc("database").set(data); } catch (error) { console.warn("Sincronização Firebase indisponível", error); } }
async function loadFirestore() {
  try {
    const snapshot = await window.firestoreDb.collection("innova").doc("database").get();
    if (snapshot.exists && Array.isArray(snapshot.data().classes)) {
      database = applyLucasRoster(applyJheniRoster(normalizeDatabase(snapshot.data())));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(database));
    }
  } catch (error) { console.warn("Leitura do Firebase indisponível", error); }
}

document.addEventListener("DOMContentLoaded", async () => {
  profiles = await loadProfiles();
  document.getElementById("profile-select").innerHTML = profiles.map(profile => `<option value="${profile.id}">${escapeHtml(profile.name)}</option>`).join("");
  document.getElementById("pin-submit").addEventListener("click", enterWithPin);
  document.getElementById("profile-pin").addEventListener("keydown", event => { if (event.key === "Enter") enterWithPin(); });
  document.getElementById("change-profile-btn").addEventListener("click", changeProfile);
  document.getElementById("new-turma-btn").addEventListener("click", () => openClassModal());
  document.getElementById("new-professor-btn").addEventListener("click", () => openProfessorModal());
  document.querySelector(".nav-overview").addEventListener("click", () => { selectedClassId = "overview"; selectedProfessorId = null; render(); });
  document.querySelector(".nav-attendance").addEventListener("click", () => { selectedClassId = "attendance"; selectedProfessorId = null; render(); });
  document.querySelector(".nav-attendance-history").addEventListener("click", () => { selectedClassId = "attendance-history"; selectedProfessorId = null; render(); });
  document.getElementById("btn-salvar-turma").addEventListener("click", saveClass);
  document.getElementById("btn-salvar-aluno").addEventListener("click", saveStudent);
  document.getElementById("btn-salvar-saldo").addEventListener("click", saveBalance);
  document.getElementById("btn-salvar-professor").addEventListener("click", saveProfessor);
  document.getElementById("btn-salvar-award").addEventListener("click", saveAward);
  document.querySelectorAll("[data-close]").forEach(button => button.addEventListener("click", () => closeModal(button.dataset.close)));
  document.getElementById("drawer-close").addEventListener("click", closeDrawer);
  document.getElementById("drawer-overlay").addEventListener("click", event => { if (event.target.id === "drawer-overlay") closeDrawer(); });
  document.addEventListener("click", event => { const chip = event.target.closest("[data-points]"); if (chip) registerPoints(chip.dataset.points, chip.dataset.label); });
  if (window.firestoreDb) await loadFirestore();
  if (window.location.hash === "#historico") selectedClassId = "history";
  const savedProfile = sessionStorage.getItem("innovaCoinsActiveProfile");
  if (savedProfile) { activeProfile = JSON.parse(savedProfile); selectedActor = activeProfile.name; document.getElementById("pin-screen").classList.add("hidden"); }
  render();
  setInterval(() => {
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
  selectedProfessorId = null;
  selectedClassId = window.location.hash === "#historico" ? "history" : "overview";
  render();
});
