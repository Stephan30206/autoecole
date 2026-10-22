import { useEffect, useMemo, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import './App.css'

type Role = 'admin' | 'eleve'
type View = 'overview' | 'eleves' | 'seances' | 'moniteurs' | 'vehicules' | 'examens' | 'settings'
type Student = { id: number; nom: string; prenom: string; telephone?: string; dateInscription?: string }
type Instructor = { id: number; nom: string; prenom: string; telephone?: string; actif?: boolean }
type Vehicle = { id: number; marque: string; modele: string; immatriculation: string; etat: string }
type Lesson = { id: number; dateSeance: string; heureDebut: string; duree: number; statut: string; eleveId: number; eleveNom: string; moniteurNom: string; vehicule: string }
type Exam = { id: number; typeExamen: string; dateExamen: string; lieu: string }
type Result = { id: number; typeExamen: string; dateExamen: string; lieu: string; note?: number; resultat: string }
type Data = { students: Student[]; instructors: Instructor[]; vehicles: Vehicle[]; lessons: Lesson[]; exams: Exam[]; results: Result[] }

const emptyData: Data = { students: [], instructors: [], vehicles: [], lessons: [], exams: [], results: [] }

const iconPaths: Record<string, string> = {
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
  users: 'M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m16 0v-2a4 4 0 0 0-3-3.87M14 3.13a4 4 0 0 1 0 7.75M14 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  calendar: 'M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z',
  car: 'm5 17-1 3m15-3 1 3M5 17h14l2-7H3l2 7Zm1 0v2m12-2v2M5 10l2-5h10l2 5M7 13h.01M17 13h.01',
  book: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z',
  chart: 'M3 3v18h18M18 17V9m-5 8V5m-5 12v-4',
  search: 'm21 21-4.34-4.34M19 10.5a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0Z',
  bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 12h4',
  plus: 'M12 5v14m-7-7h14',
  arrow: 'M5 12h14m-7-7 7 7-7 7',
  clock: 'M12 8v4l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  check: 'm5 12 4 4L19 6',
  menu: 'M4 6h16M4 12h16M4 18h16',
  close: 'M18 6 6 18M6 6l12 12',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14 5-5-5-5m5 5H9',
  steering: 'M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0M3.6 9h16.8M12 12l-4 7m4-7 4 7m-4-7V3',
  more: 'M12 5h.01M12 12h.01M12 19h.01',
  filter: 'M4 7h16M7 12h10m-7 5h4',
  trophy: 'M8 21h8m-4-4v4m5-18H7v7a5 5 0 0 0 10 0V3ZM7 6H4v2a4 4 0 0 0 4 4m9-6h3v2a4 4 0 0 1-4 4',
  settings: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-6v2m0 16v2m10-10h-2M4 12H2m17.07-7.07-1.42 1.42M6.35 17.65l-1.42 1.42m14.14 0-1.42-1.42M6.35 6.35 4.93 4.93',
}
function Icon({ name, size = 20 }: { name: string; size?: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={iconPaths[name] || iconPaths.grid} /></svg> }
const initials = (first = '', last = '') => `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
const fullName = (first = '', last = '') => `${first} ${last}`.trim()
const prettyDate = (date: string, options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }) => new Intl.DateTimeFormat('fr-FR', options).format(new Date(`${date}T12:00:00`))
const dateInput = () => new Date().toISOString().slice(0, 10)
const weekRange = (mondayFirst: boolean) => {
  const start = new Date()
  start.setDate(start.getDate() - (mondayFirst ? (start.getDay() + 6) % 7 : start.getDay()))
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 7)
  return { startOfWeek: start, endOfWeek: end }
}

function App() {
  const [role, setRole] = useState<Role | null>(null)
  const [account, setAccount] = useState<{ nom?: string; prenom?: string; email?: string } | null>(null)
  const [view, setView] = useState<View>('overview')
  const [data, setData] = useState(emptyData)
  const [connected, setConnected] = useState(false)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<string | null>(null)
  const [toast, setToast] = useState('')
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') === 'dark' ? 'dark' : 'light')
  const [settings, setSettings] = useState<{ notifications: boolean; weekStartsMonday: boolean }>(() => JSON.parse(localStorage.getItem('autoecole-settings') || '{"notifications":true,"weekStartsMonday":true}'))
  const [weekOnly, setWeekOnly] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [studentId, setStudentId] = useState(1)
  const [form, setForm] = useState<Record<string, string>>({})
  const student = data.students.find((item) => item.id === studentId) || { id: studentId, nom: account?.nom || '', prenom: account?.prenom || '' }

  useEffect(() => {
    const token = localStorage.getItem('auth-token')
    if (!token) return
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } }).then((response) => {
      if (!response.ok) throw new Error('Session expirée')
      return response.json()
    }).then((profile) => {
      setAccount(profile)
      setStudentId(profile.eleveId || 0)
      setRole(profile.role === 'ADMIN' ? 'admin' : 'eleve')
    }).catch(() => localStorage.removeItem('auth-token'))
  }, [])

  useEffect(() => {
    if (!role) return
    const endpoints: [keyof Data, string][] = role === 'admin' ? [['students', '/api/eleves'], ['instructors', '/api/moniteurs'], ['vehicles', '/api/vehicules'], ['exams', '/api/examens']] : [['exams', '/api/examens']]
    Promise.all(endpoints.map(async ([key, path]) => {
      const token = localStorage.getItem('auth-token')
      const response = await fetch(path, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      if (!response.ok) throw new Error('API indisponible')
      return [key, await response.json()] as const
    })).then((entries) => {
      setData((current) => ({ ...current, ...Object.fromEntries(entries) }))
      setConnected(true)
    }).catch(() => {
      setConnected(false)
      setToast('API indisponible : vérifiez la connexion au serveur.')
    })
  }, [role])

  useEffect(() => {
    if (!role) return
    const filter = role === 'admin' ? '' : `?eleveId=${studentId}`
    const token = localStorage.getItem('auth-token')
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}
    fetch(`/api/seances${filter}`, { headers }).then((response) => response.ok ? response.json() : null).then((lessons) => { if (lessons) setData((current) => ({ ...current, lessons })) }).catch(() => undefined)
    fetch(`/api/resultats${filter}`, { headers }).then((response) => response.ok ? response.json() : null).then((results) => { if (results) setData((current) => ({ ...current, results })) }).catch(() => undefined)
  }, [role, studentId])

  useEffect(() => {
    localStorage.setItem('theme', theme)
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    localStorage.setItem('autoecole-settings', JSON.stringify(settings))
  }, [settings])

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(''), 3200)
    return () => window.clearTimeout(timeout)
  }, [toast])

  const upcoming = useMemo(() => [...data.lessons].filter((lesson) => lesson.statut !== 'ANNULEE').sort((a, b) => `${a.dateSeance}${a.heureDebut}`.localeCompare(`${b.dateSeance}${b.heureDebut}`)), [data.lessons])
  const filteredStudents = data.students.filter((item) => fullName(item.prenom, item.nom).toLowerCase().includes(search.toLowerCase()) || (item.telephone || '').includes(search))

  const apiPost = async (path: string, payload: unknown) => {
    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(payload) })
      if (!response.ok) throw new Error(`Échec de l’enregistrement (HTTP ${response.status}).`)
      return await response.json()
    } catch (error) {
      setToast(error instanceof Error ? error.message : 'Échec de l’enregistrement. Réessayez.')
      return null
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (modal === 'student') {
      const payload = { nom: form.nom, prenom: form.prenom, telephone: form.telephone, dateInscription: dateInput() }
      const saved = await apiPost('/api/eleves', payload)
      if (!saved) return
      const item = saved
      setData((current) => ({ ...current, students: [item, ...current.students] }))
      setToast('Élève ajouté au dossier')
    } else if (modal === 'lesson') {
      const payload = { dateSeance: form.dateSeance, heureDebut: form.heureDebut, duree: Number(form.duree), idEleve: Number(form.idEleve), idMoniteur: Number(form.idMoniteur), idVehicule: Number(form.idVehicule) }
      const saved = await apiPost('/api/seances', payload)
      if (!saved) return
      const item = saved
      setData((current) => ({ ...current, lessons: [item, ...current.lessons] }))
      setToast('Séance enregistrée')
    } else if (modal === 'instructor') {
      const payload = { nom: form.nom, prenom: form.prenom, telephone: form.telephone }
      const saved = await apiPost('/api/moniteurs', payload)
      if (!saved) return
      const item = saved
      setData((current) => ({ ...current, instructors: [item, ...current.instructors] }))
      setToast('Moniteur ajouté au dossier')
    } else if (modal === 'vehicle') {
      const payload = { marque: form.marque, modele: form.modele, immatriculation: form.immatriculation, etat: form.etat || 'BON' }
      const saved = await apiPost('/api/vehicules', payload)
      if (!saved) return
      const item = saved
      setData((current) => ({ ...current, vehicles: [item, ...current.vehicles] }))
      setToast('Véhicule ajouté au parc')
    } else if (modal === 'exam') {
      const payload = { typeExamen: form.typeExamen, dateExamen: form.dateExamen, lieu: form.lieu }
      const saved = await apiPost('/api/examens', payload)
      if (!saved) return
      const item = saved
      setData((current) => ({ ...current, exams: [item, ...current.exams] }))
      setToast('Examen ajouté au calendrier')
    } else if (modal === 'register') {
      const saved = await apiPost('/api/auth/register', { nom: form.nom, prenom: form.prenom, telephone: form.telephone, email: form.email, password: form.password })
      if (!saved) return
      setToast('Inscription reçue. Consultez votre e-mail pour confirmer votre adresse.')
    }
    setModal(null)
    setForm({})
  }

  const pageTitle: Record<View, string> = { overview: role === 'admin' ? 'Vue d’ensemble' : 'Mon espace', eleves: 'Élèves', seances: 'Séances', moniteurs: 'Moniteurs', vehicules: 'Véhicules', examens: 'Examens', settings: 'Paramètres' }
  const navItems: { id: View; label: string; icon: string }[] = [
    { id: 'overview', label: 'Vue d’ensemble', icon: 'grid' },
    ...(role === 'admin' ? [{ id: 'eleves' as View, label: 'Élèves', icon: 'users' }] : []),
    { id: 'seances', label: role === 'admin' ? 'Séances' : 'Mes séances', icon: 'calendar' },
    ...(role === 'admin' ? [{ id: 'moniteurs' as View, label: 'Moniteurs', icon: 'steering' }, { id: 'vehicules' as View, label: 'Véhicules', icon: 'car' }, { id: 'examens' as View, label: 'Examens', icon: 'book' }] : [{ id: 'examens' as View, label: 'Mes examens', icon: 'book' }]),
  ]

  const openModal = (name: string) => { setForm(name === 'lesson' ? { dateSeance: dateInput(), heureDebut: '09:00', duree: '60', idEleve: String(data.students[0]?.id || 1), idMoniteur: String(data.instructors.find((item) => item.actif !== false)?.id || 1), idVehicule: String(data.vehicles[0]?.id || 1) } : name === 'exam' ? { typeExamen: 'CODE', dateExamen: dateInput() } : name === 'vehicle' ? { etat: 'BON' } : {}); setModal(name) }
  const { startOfWeek, endOfWeek } = useMemo(() => weekRange(settings.weekStartsMonday), [settings.weekStartsMonday])
  const filteredLessons = (role === 'admin' ? upcoming : upcoming.filter((lesson) => lesson.eleveId === studentId)).filter((lesson) => !weekOnly || (new Date(`${lesson.dateSeance}T12:00:00`) >= startOfWeek && new Date(`${lesson.dateSeance}T12:00:00`) < endOfWeek))

  if (!role) return <><AuthScreen onLogin={(selectedRole, id, profile) => { setRole(selectedRole); setStudentId(id); setAccount(profile); setView('overview') }} onRegister={() => openModal('register')} />{modal === 'register' && <Modal title="Créer mon compte" onClose={() => setModal(null)}><form className="form-grid" onSubmit={handleSubmit}><Field label="Prénom" value={form.prenom} onChange={(value) => setForm({ ...form, prenom: value })} required /><Field label="Nom" value={form.nom} onChange={(value) => setForm({ ...form, nom: value })} required /><Field label="Téléphone" value={form.telephone} onChange={(value) => setForm({ ...form, telephone: value })} required /><Field label="Adresse e-mail" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} required /><Field label="Mot de passe" type="password" value={form.password} onChange={(value) => setForm({ ...form, password: value })} required minLength={10} /><p className="form-note full-span">Un lien de confirmation sera envoyé à cette adresse avant l’activation du compte.</p><div className="form-actions full-span"><button type="button" className="button button-outline" onClick={() => setModal(null)}>Annuler</button><button className="button button-primary" type="submit">Créer mon profil</button></div></form></Modal>}</>

  return <div className="app-shell">
    <aside className={`sidebar ${mobileMenu ? 'sidebar-open' : ''}`}>
      <div className="brand"><span className="brand-mark"><Icon name="steering" size={22} /></span><span>Conduite<span className="brand-dot">.</span><small>ÉCOLE DE CONDUITE</small></span><button className="mobile-close icon-button" onClick={() => setMobileMenu(false)} aria-label="Fermer le menu"><Icon name="close" /></button></div>
      <div className="workspace-label">ESPACE DE TRAVAIL</div>
      <div className="school-switch"><span className="school-emblem">A</span><span><strong>Auto-école Atlas</strong><small>Antananarivo</small></span><span className="switch-chevron">⌄</span></div>
      <div className="nav-section-label">MENU PRINCIPAL</div>
      <nav className="side-nav" aria-label="Navigation principale">{navItems.map((item) => <button key={item.id} className={`nav-item ${view === item.id ? 'active' : ''}`} onClick={() => { setView(item.id); setMobileMenu(false) }}><Icon name={item.icon} /><span>{item.label}</span>{item.id === 'seances' && <span className="nav-count">{role === 'admin' ? upcoming.length : filteredLessons.length}</span>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="nav-section-label">PRÉFÉRENCES</div><button className={`nav-item ${view === 'settings' ? 'active' : ''}`} onClick={() => { setView('settings'); setMobileMenu(false) }}><Icon name="settings" /><span>Paramètres</span></button></div>
      <div className="profile-card"><div className="avatar avatar-blue">{role === 'admin' ? 'SA' : initials(student?.prenom, student?.nom)}</div><div className="profile-copy"><strong>{role === 'admin' ? account?.email || 'Administrateur' : fullName(student?.prenom, student?.nom)}</strong><small>{role === 'admin' ? 'Administrateur' : 'Élève'}</small></div><button className="icon-button logout-button" onClick={() => { const token = localStorage.getItem('auth-token'); if (token) void fetch('/api/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).catch(() => undefined); localStorage.removeItem('auth-token'); setRole(null); setAccount(null); setView('overview') }} aria-label="Se déconnecter"><Icon name="logout" size={18} /></button></div>
    </aside>

    <main className="main-area">
      <header className="topbar"><button className="mobile-menu icon-button" onClick={() => setMobileMenu(true)} aria-label="Ouvrir le menu"><Icon name="menu" /></button><div className="breadcrumb">Espace de travail <span>/</span> <strong>{pageTitle[view]}</strong></div><div className="topbar-actions"><div className={`connection-status ${connected ? 'is-connected' : ''}`}><span />{connected ? 'API connectée' : 'API indisponible'}</div><button className="icon-button notification-button" onClick={() => setToast(settings.notifications ? 'Les notifications de l’application sont activées.' : 'Les notifications de l’application sont désactivées.')} aria-label="Notifications"><Icon name="bell" size={19} /><i /></button><div className="topbar-divider" /><div className="top-user"><span className="avatar avatar-small">{role === 'admin' ? 'SA' : initials(student?.prenom, student?.nom)}</span><span className="top-user-name">{role === 'admin' ? account?.prenom || 'Admin' : student?.prenom}</span></div></div></header>
      <div className="page-content">
        {view === 'overview' && <Overview role={role} student={student} data={data} lessons={filteredLessons} onNavigate={setView} onSchedule={() => openModal('lesson')} />}
        {view === 'settings' && <SettingsPage theme={theme} onThemeChange={setTheme} settings={settings} onSettingsChange={setSettings} />}
        {view === 'eleves' && <><PageHeading eyebrow="GESTION PÉDAGOGIQUE" title="Tous les élèves" description="Suivez les inscriptions et accompagnez chaque élève dans sa progression." action={<button className="button button-primary" onClick={() => openModal('student')}><Icon name="plus" size={17} /> Nouvel élève</button>} /><div className="stats-grid compact-stats"><StatCard label="Élèves inscrits" value={data.students.length} note="sur l’année en cours" icon="users" tone="blue" /><StatCard label="Nouvelles inscriptions" value={data.students.filter((student) => student.dateInscription?.startsWith(dateInput().slice(0, 7))).length} note="ce mois-ci" icon="chart" tone="green" /><StatCard label="En formation" value={data.students.length} note="dossiers élèves" icon="steering" tone="orange" /></div><div className="panel table-panel"><div className="panel-heading"><div><h2>Liste des élèves</h2><p>Retrouvez et gérez les dossiers des élèves.</p></div><div className="table-tools"><label className="search-box"><Icon name="search" size={17} /><input placeholder="Rechercher un élève…" value={search} onChange={(event) => setSearch(event.target.value)} /></label><button className="button button-outline" onClick={() => setSearch('')}><Icon name="close" size={16} /> Effacer</button></div></div><StudentTable students={filteredStudents} onSelect={(id) => { setStudentId(id); setRole('eleve'); setView('overview') }} /></div></>}
        {view === 'seances' && <><PageHeading eyebrow="PLANNING & SUIVI" title={role === 'admin' ? 'Séances de conduite' : 'Mes séances'} description={role === 'admin' ? 'Organisez le planning et consultez les leçons programmées.' : 'Retrouvez votre planning, votre moniteur et votre véhicule.'} action={role === 'admin' ? <button className="button button-primary" onClick={() => openModal('lesson')}><Icon name="plus" size={17} /> Planifier une séance</button> : undefined} /><div className="panel table-panel"><div className="panel-heading"><div><h2>Planning des séances</h2><p>{filteredLessons.length} séance{filteredLessons.length > 1 ? 's' : ''} affichée{filteredLessons.length > 1 ? 's' : ''}</p></div><button className="button button-outline" aria-pressed={weekOnly} onClick={() => setWeekOnly((value) => !value)}><Icon name="calendar" size={16} /> {weekOnly ? 'Toutes les séances' : 'Cette semaine'}</button></div><LessonTable lessons={filteredLessons} admin={role === 'admin'} /></div></>}
        {view === 'moniteurs' && <><PageHeading eyebrow="ÉQUIPE PÉDAGOGIQUE" title="Nos moniteurs" description="Gérez votre équipe et les disponibilités de vos moniteurs." action={<button className="button button-primary" onClick={() => openModal('instructor')}><Icon name="plus" size={17} /> Ajouter un moniteur</button>} /><div className="people-grid">{data.instructors.map((item, index) => <div className="person-card" key={item.id}><div className={`person-avatar person-tone-${index % 4}`}>{initials(item.prenom, item.nom)}</div><span className={`status-pill ${item.actif === false ? 'status-muted' : 'status-green'}`}><i />{item.actif === false ? 'Inactif' : 'Actif'}</span><h3>{fullName(item.prenom, item.nom)}</h3><p>Moniteur de conduite</p><div className="person-meta"><span><Icon name="calendar" size={15} /> {data.lessons.filter((lesson) => lesson.moniteurNom.includes(item.prenom)).length} séances planifiées</span><span><Icon name="users" size={15} /> Enseignement général</span></div><button className="text-action" onClick={() => setToast(`${fullName(item.prenom, item.nom)} · ${item.telephone || 'Téléphone non renseigné'} · ${data.lessons.filter((lesson) => lesson.moniteurNom.includes(item.prenom)).length} séance(s) planifiée(s)`)}>Voir le profil <Icon name="arrow" size={15} /></button></div>)}</div></>}
        {view === 'vehicules' && <><PageHeading eyebrow="FLOTTE AUTOMOBILE" title="Parc de véhicules" description="Gardez un œil sur vos véhicules et leur disponibilité." action={<button className="button button-primary" onClick={() => openModal('vehicle')}><Icon name="plus" size={17} /> Ajouter un véhicule</button>} /><div className="stats-grid compact-stats"><StatCard label="Véhicules au total" value={data.vehicles.length} note="dans votre flotte" icon="car" tone="blue" /><StatCard label="Disponibles" value={data.vehicles.filter((item) => item.etat === 'BON').length} note="prêts à rouler" icon="check" tone="green" /><StatCard label="En entretien" value={data.vehicles.filter((item) => item.etat !== 'BON').length} note="à vérifier" icon="settings" tone="orange" /></div><div className="vehicle-grid">{data.vehicles.map((vehicle, index) => <div className="vehicle-card" key={vehicle.id}><div className={`vehicle-art vehicle-art-${index % 3}`}><Icon name="car" size={64} /><span className={`status-pill ${vehicle.etat === 'BON' ? 'status-green' : 'status-orange'}`}><i />{vehicle.etat === 'BON' ? 'Disponible' : 'Entretien'}</span><span className="plate-number">{vehicle.immatriculation}</span></div><div className="vehicle-info"><div><h3>{vehicle.marque} {vehicle.modele}</h3><p>Boîte manuelle · Catégorie B</p></div><button className="icon-button" aria-label={`Détails de ${vehicle.marque} ${vehicle.modele}`} onClick={() => setToast(`${vehicle.marque} ${vehicle.modele} · ${vehicle.immatriculation} · ${vehicle.etat === 'BON' ? 'Disponible' : 'Entretien'}`)}><Icon name="more" /></button></div><div className="vehicle-foot"><span><Icon name="steering" size={15} /> Utilisé pour la conduite</span><span>{data.lessons.filter((lesson) => lesson.vehicule.includes(vehicle.marque)).length} leçons</span></div></div>)}</div></>}
        {view === 'examens' && <><PageHeading eyebrow="RÉUSSITE & CERTIFICATION" title={role === 'admin' ? 'Examens' : 'Mes examens'} description={role === 'admin' ? 'Planifiez les prochaines sessions et suivez les résultats.' : 'Consultez vos prochains examens et vos résultats.'} action={role === 'admin' ? <button className="button button-primary" onClick={() => openModal('exam')}><Icon name="plus" size={17} /> Programmer un examen</button> : undefined} /><div className="exam-layout"><div className="panel exam-list-panel"><div className="panel-heading"><div><h2>Prochains examens</h2><p>Les dates à ne pas manquer</p></div><span className="panel-count">{data.exams.length} prévus</span></div>{data.exams.map((exam) => <div className="exam-row" key={exam.id}><div className="exam-date"><strong>{prettyDate(exam.dateExamen, { day: '2-digit' })}</strong><span>{prettyDate(exam.dateExamen, { month: 'short' })}</span></div><div className="exam-copy"><strong>Examen de {exam.typeExamen.toLowerCase()}</strong><span><Icon name="book" size={14} /> {exam.lieu}</span></div><span className="status-pill status-blue"><i />À venir</span></div>)}</div><div className="panel results-panel"><div className="panel-heading"><div><h2>{role === 'admin' ? 'Derniers résultats' : 'Mes résultats'}</h2><p>Vos progrès, étape par étape</p></div><span className="trophy-icon"><Icon name="trophy" size={19} /></span></div>{(role === 'admin' ? data.results.slice(0, 3) : data.results).map((result) => <div className="result-row" key={result.id}><div className={`result-symbol ${result.resultat === 'ADMIS' ? 'result-pass' : 'result-fail'}`}><Icon name={result.resultat === 'ADMIS' ? 'check' : 'close'} size={17} /></div><div className="exam-copy"><strong>{result.typeExamen} · {result.resultat === 'ADMIS' ? 'Admis' : 'Ajourné'}</strong><span>{prettyDate(result.dateExamen, { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>{result.note != null && <strong className="result-score">{result.note}<small>/40</small></strong>}</div>)}</div></div></>}
      </div>
    </main>
    {modal && <Modal title={modal === 'student' ? 'Ajouter un élève' : modal === 'lesson' ? 'Planifier une séance' : modal === 'instructor' ? 'Ajouter un moniteur' : modal === 'vehicle' ? 'Ajouter un véhicule' : modal === 'exam' ? 'Programmer un examen' : 'Créer mon compte'} onClose={() => setModal(null)}><form className="form-grid" onSubmit={handleSubmit}>
      {modal === 'register' ? <><Field label="Prénom" value={form.prenom} onChange={(value) => setForm({ ...form, prenom: value })} required /><Field label="Nom" value={form.nom} onChange={(value) => setForm({ ...form, nom: value })} required /><Field label="Téléphone" value={form.telephone} onChange={(value) => setForm({ ...form, telephone: value })} required /><Field label="Adresse e-mail" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} required /><Field label="Mot de passe" type="password" value={form.password} onChange={(value) => setForm({ ...form, password: value })} required minLength={10} /><p className="form-note full-span">Un lien de confirmation sera envoyé à cette adresse avant l’activation du compte.</p></> : null}
      {(modal === 'student' || modal === 'instructor') && <><Field label="Prénom" value={form.prenom} onChange={(value) => setForm({ ...form, prenom: value })} required /><Field label="Nom" value={form.nom} onChange={(value) => setForm({ ...form, nom: value })} required /><Field label="Téléphone" value={form.telephone} onChange={(value) => setForm({ ...form, telephone: value })} required /></>}
      {modal === 'lesson' && <><SelectField label="Élève" value={form.idEleve} onChange={(value) => setForm({ ...form, idEleve: value })} options={data.students.map((item) => [String(item.id), fullName(item.prenom, item.nom)])} /><SelectField label="Moniteur" value={form.idMoniteur} onChange={(value) => setForm({ ...form, idMoniteur: value })} options={data.instructors.filter((item) => item.actif !== false).map((item) => [String(item.id), fullName(item.prenom, item.nom)])} /><SelectField label="Véhicule" value={form.idVehicule} onChange={(value) => setForm({ ...form, idVehicule: value })} options={data.vehicles.map((item) => [String(item.id), `${item.marque} ${item.modele}`])} /><Field label="Date" type="date" value={form.dateSeance} onChange={(value) => setForm({ ...form, dateSeance: value })} required /><Field label="Heure de début" type="time" value={form.heureDebut} onChange={(value) => setForm({ ...form, heureDebut: value })} required /><Field label="Durée (minutes)" type="number" value={form.duree} onChange={(value) => setForm({ ...form, duree: value })} required min="15" /></>}
      {modal === 'vehicle' && <><Field label="Marque" value={form.marque} onChange={(value) => setForm({ ...form, marque: value })} required /><Field label="Modèle" value={form.modele} onChange={(value) => setForm({ ...form, modele: value })} required /><Field label="Immatriculation" value={form.immatriculation} onChange={(value) => setForm({ ...form, immatriculation: value })} required /><SelectField label="État" value={form.etat} onChange={(value) => setForm({ ...form, etat: value })} options={ [['BON', 'Disponible'], ['ENTRETIEN', 'En entretien']] } /></>}
      {modal === 'exam' && <><SelectField label="Type d’examen" value={form.typeExamen} onChange={(value) => setForm({ ...form, typeExamen: value })} options={ [['CODE', 'Code de la route'], ['CONDUITE', 'Conduite']] } /><Field label="Date" type="date" value={form.dateExamen} onChange={(value) => setForm({ ...form, dateExamen: value })} required /><Field label="Lieu" value={form.lieu} onChange={(value) => setForm({ ...form, lieu: value })} required /></>}
      <div className="form-actions full-span"><button type="button" className="button button-outline" onClick={() => setModal(null)}>Annuler</button><button className="button button-primary" type="submit">{modal === 'lesson' ? 'Planifier la séance' : modal === 'exam' ? 'Programmer l’examen' : modal === 'register' ? 'Créer mon profil' : 'Enregistrer'}</button></div>
    </form></Modal>}
    {toast && <div className="toast-message"><span><Icon name="check" size={16} /></span>{toast}</div>}
  </div>
}

function AuthScreen({ onLogin, onRegister }: { onLogin: (role: Role, id: number, profile: { nom?: string; prenom?: string; email?: string }) => void; onRegister: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authNotice, setAuthNotice] = useState('')
  return <div className="auth-page"><div className="auth-left"><div className="auth-brand"><span className="brand-mark"><Icon name="steering" size={22} /></span><span>Conduite<span className="brand-dot">.</span></span></div><div className="auth-content"><span className="auth-kicker"><span /> LA ROUTE DE VOTRE RÉUSSITE</span><h1>Apprenez à conduire.<br /><span>En toute confiance.</span></h1><p>Votre parcours de conduite, accompagné à chaque étape. Planifiez vos leçons, suivez vos progrès et prenez la route sereinement.</p><div className="auth-feature"><span><Icon name="calendar" size={18} /></span><div><strong>Tout votre parcours au même endroit</strong><small>Séances, moniteurs et résultats réunis.</small></div></div><div className="auth-feature"><span><Icon name="steering" size={18} /></span><div><strong>Une équipe à vos côtés</strong><small>Un suivi personnalisé, à votre rythme.</small></div></div></div><div className="auth-footer">© 2025 Auto-école Atlas <span>·</span> Antananarivo</div></div><div className="auth-right"><div className="auth-card"><div className="auth-mobile-brand"><span className="brand-mark"><Icon name="steering" size={20} /></span> Conduite<span className="brand-dot">.</span></div><span className="auth-overline">RAVI DE VOUS REVOIR</span><h2>Bon retour parmi nous</h2><p className="auth-subtitle">Connectez-vous pour accéder à votre espace.</p><form onSubmit={async (event) => { event.preventDefault(); setAuthNotice(''); try { const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) }); const result = await response.json(); if (!response.ok) throw new Error(result.message || 'Connexion impossible. Vérifiez vos identifiants et la validation de votre e-mail.'); localStorage.setItem('auth-token', result.token); onLogin(result.role === 'ADMIN' ? 'admin' : 'eleve', result.eleveId || 0, result) } catch (error) { setAuthNotice(error instanceof Error ? error.message : 'Le serveur d’authentification est indisponible.') } }}><label className="field-label">Adresse e-mail</label><input className="auth-input" type="email" placeholder="nom@exemple.com" value={email} onChange={(event) => setEmail(event.target.value)} required /><div className="password-label"><label className="field-label">Mot de passe</label><button type="button" onClick={() => setAuthNotice('La récupération de mot de passe sera disponible après activation de l’authentification.')}>Mot de passe oublié ?</button></div><input className="auth-input" type="password" placeholder="••••••••" value={password} onChange={(event) => setPassword(event.target.value)} required /><button className="button button-primary auth-submit" type="submit">Se connecter <Icon name="arrow" size={17} /></button></form>{authNotice && <p className="auth-notice" role="status">{authNotice}</p>}<div className="auth-separator"><span /> ou <span /></div><div className="demo-logins"><p>Explorer la démonstration</p><button className="demo-button" onClick={() => setAuthNotice('Les comptes de démonstration sont désactivés. Utilisez un compte confirmé par e-mail.')}><span className="demo-avatar demo-admin">SA</span><span><strong>Espace administrateur</strong><small>Gestion complète de l’auto-école</small></span><Icon name="arrow" size={16} /></button><button className="demo-button" onClick={() => setAuthNotice('Les comptes de démonstration sont désactivés. Utilisez un compte confirmé par e-mail.')}><span className="demo-avatar">MR</span><span><strong>Espace élève</strong><small>Planning et résultats personnels</small></span><Icon name="arrow" size={16} /></button></div><div className="auth-register">Vous n’avez pas encore de compte ? <button onClick={onRegister}>S’inscrire</button></div><p className="demo-disclaimer">La connexion nécessite un compte confirmé par e-mail et le service d’authentification du serveur.</p></div></div></div>
}

function Overview({ role, student, data, lessons, onNavigate, onSchedule }: { role: Role; student: Student; data: Data; lessons: Lesson[]; onNavigate: (view: View) => void; onSchedule: () => void }) {
  const completedLessons = data.lessons.filter((lesson) => lesson.eleveId === student.id && lesson.statut === 'TERMINEE')
  const upcomingExams = data.exams.filter((exam) => exam.dateExamen >= dateInput()).sort((a, b) => a.dateExamen.localeCompare(b.dateExamen))
  const monthKey = dateInput().slice(0, 7)
  const recentLessons = [...data.lessons].sort((a, b) => `${b.dateSeance}${b.heureDebut}`.localeCompare(`${a.dateSeance}${a.heureDebut}`)).slice(0, 4)
  return <><div className="welcome-row"><div><span className="eyebrow">TABLEAU DE BORD · AUTO-ÉCOLE ATLAS</span><h1>{role === 'admin' ? 'Bonjour' : `Bonjour ${student.prenom}`}<span className="greeting-dot">.</span></h1><p>{role === 'admin' ? 'Voici les informations enregistrées dans votre auto-école.' : 'Voici votre planning et vos résultats enregistrés.'}</p></div>{role === 'admin' && <button className="button button-primary" onClick={onSchedule}><Icon name="plus" size={17} /> Planifier une séance</button>}</div>
    {role === 'admin' ? <><div className="stats-grid"><StatCard label="Élèves inscrits" value={data.students.length} note="dossiers enregistrés" icon="users" tone="blue" /><StatCard label="Séances programmées" value={lessons.length} note="dans le planning" icon="calendar" tone="green" /><StatCard label="Moniteurs actifs" value={data.instructors.filter((item) => item.actif !== false).length} note="dans l’équipe" icon="steering" tone="purple" /><StatCard label="Véhicules disponibles" value={data.vehicles.filter((item) => item.etat === 'BON').length} note="dans le parc" icon="car" tone="orange" /></div><div className="dashboard-grid"><div className="panel schedule-panel"><div className="panel-heading"><div><h2>Planning des séances</h2><p>Les prochaines leçons de conduite</p></div><button className="link-button" onClick={() => onNavigate('seances')}>Tout voir <Icon name="arrow" size={15} /></button></div><div className="schedule-list">{lessons.slice(0, 4).map((lesson) => <div className="schedule-item" key={lesson.id}><div className="schedule-date"><strong>{prettyDate(lesson.dateSeance, { day: '2-digit' })}</strong><span>{prettyDate(lesson.dateSeance, { month: 'short' })}</span></div><div className="schedule-time"><strong>{lesson.heureDebut}</strong><span>{lesson.duree} min</span></div><div className="schedule-person"><div className="mini-avatar">{initials(lesson.eleveNom.split(' ')[0], lesson.eleveNom.split(' ').slice(1).join(' '))}</div><div><strong>{lesson.eleveNom}</strong><span>{lesson.moniteurNom}</span></div></div><div className="schedule-car"><Icon name="car" size={16} /><span>{lesson.vehicule}</span></div><Status status={lesson.statut} /></div>)}{lessons.length === 0 && <div className="empty-state">Aucune séance enregistrée.</div>}</div></div><div className="panel activity-panel"><div className="panel-heading"><div><h2>Activité récente</h2><p>Dernières séances enregistrées</p></div></div><div className="activity-list">{recentLessons.map((lesson) => <Activity key={lesson.id} icon="calendar" tone="blue" title="Séance" text={`${lesson.eleveNom} · ${prettyDate(lesson.dateSeance)} à ${lesson.heureDebut}`} time={lesson.statut === 'TERMINEE' ? 'Terminée' : 'Au planning'} />)}{recentLessons.length === 0 && <div className="empty-state">Aucune activité enregistrée.</div>}</div><button className="activity-footer" onClick={() => onNavigate('seances')}>Voir les séances <Icon name="arrow" size={15} /></button></div></div><div className="dashboard-bottom"><div className="panel students-panel"><div className="panel-heading"><div><h2>Élèves récemment inscrits</h2><p>Dossiers enregistrés</p></div><button className="link-button" onClick={() => onNavigate('eleves')}>Voir les élèves <Icon name="arrow" size={15} /></button></div><StudentTable students={data.students.slice(0, 4)} onSelect={() => onNavigate('eleves')} compact /></div><div className="panel progress-panel"><div className="panel-heading"><div><h2>Activité du mois</h2><p>Séances enregistrées ce mois-ci</p></div><span className="target-icon"><Icon name="chart" size={17} /></span></div><div className="target-number"><strong>{data.lessons.filter((lesson) => lesson.dateSeance.startsWith(monthKey)).length}</strong><span>séances</span></div><p className="progress-caption">Données issues du planning de l’école.</p></div></div></> : <><div className="student-hero"><div className="student-hero-copy"><span className="auth-kicker"><span /> VOTRE PARCOURS</span><h2>Votre progression<br />en un coup d’œil.</h2><p>Consultez les leçons et les examens enregistrés pour votre compte.</p><button className="button button-light" onClick={() => onNavigate('seances')}>Voir mon planning <Icon name="arrow" size={16} /></button></div><div className="student-hero-mark"><Icon name="steering" size={120} /></div><div className="student-hero-count"><span>SÉANCES TERMINÉES</span><strong>{completedLessons.length}</strong><small>Leçons terminées enregistrées</small></div></div><div className="stats-grid student-stats"><StatCard label="Heures de conduite" value={`${Math.round(completedLessons.reduce((total, lesson) => total + lesson.duree, 0) / 60)} h`} note="heures terminées" icon="clock" tone="blue" /><StatCard label="Séances effectuées" value={completedLessons.length} note={`${lessons.filter((lesson) => lesson.statut !== 'TERMINEE').length} à venir`} icon="calendar" tone="green" /><StatCard label="Prochain examen" value={upcomingExams[0] ? prettyDate(upcomingExams[0].dateExamen) : '—'} note={upcomingExams[0]?.typeExamen || 'Aucun examen prévu'} icon="book" tone="orange" /></div><div className="student-panels"><div className="panel"><div className="panel-heading"><div><h2>Mes prochaines séances</h2><p>Votre planning de conduite</p></div><button className="link-button" onClick={() => onNavigate('seances')}>Tout voir <Icon name="arrow" size={15} /></button></div><div className="schedule-list student-schedule">{lessons.slice(0, 3).map((lesson) => <div className="schedule-item" key={lesson.id}><div className="schedule-date"><strong>{prettyDate(lesson.dateSeance, { day: '2-digit' })}</strong><span>{prettyDate(lesson.dateSeance, { month: 'short' })}</span></div><div className="schedule-time"><strong>{lesson.heureDebut}</strong><span>{lesson.duree} min</span></div><div className="schedule-person"><div className="mini-avatar">{initials(...lesson.moniteurNom.split(' ').slice(0, 2))}</div><div><strong>{lesson.moniteurNom}</strong><span>Moniteur · {lesson.vehicule}</span></div></div><Status status={lesson.statut} /></div>)}{lessons.length === 0 && <div className="empty-state">Aucune séance enregistrée.</div>}</div></div><div className="panel progress-panel"><div className="panel-heading"><div><h2>Dernier examen</h2><p>Résultat enregistré</p></div><span className="trophy-icon"><Icon name="trophy" size={19} /></span></div>{data.results[0] ? <><div className="exam-result-highlight"><div className={`result-symbol ${data.results[0].resultat === 'ADMIS' ? 'result-pass' : 'result-fail'}`}><Icon name={data.results[0].resultat === 'ADMIS' ? 'check' : 'close'} /></div><div><strong>{data.results[0].resultat === 'ADMIS' ? 'Admis' : 'Résultat'}</strong><span>{data.results[0].typeExamen} · {prettyDate(data.results[0].dateExamen)}</span></div></div><div className="score-line"><span>Note obtenue</span><strong>{data.results[0].note ?? '—'}<small> / 40</small></strong></div></> : <div className="empty-state">Aucun résultat enregistré.</div>}<button className="activity-footer" onClick={() => onNavigate('examens')}>Voir mes résultats <Icon name="arrow" size={15} /></button></div></div></>}</>
}
function SettingsPage({ theme, onThemeChange, settings, onSettingsChange }: { theme: string; onThemeChange: (theme: string) => void; settings: { notifications: boolean; weekStartsMonday: boolean }; onSettingsChange: (settings: { notifications: boolean; weekStartsMonday: boolean }) => void }) {
  return <><PageHeading eyebrow="PRÉFÉRENCES" title="Paramètres" description="Personnalisez l’affichage et les préférences de cet appareil." /><div className="settings-grid"><section className="panel settings-card"><div className="panel-heading"><div><h2>Apparence</h2><p>Choisissez le thème de l’application.</p></div><span className="target-icon"><Icon name="settings" /></span></div><div className="settings-options"><button className={`theme-choice ${theme === 'light' ? 'selected' : ''}`} onClick={() => onThemeChange('light')}><span className="theme-preview theme-preview-light" /><span><strong>Mode clair</strong><small>Fond lumineux</small></span><span className="theme-radio" /></button><button className={`theme-choice ${theme === 'dark' ? 'selected' : ''}`} onClick={() => onThemeChange('dark')}><span className="theme-preview theme-preview-dark" /><span><strong>Mode sombre</strong><small>Confort en faible luminosité</small></span><span className="theme-radio" /></button></div></section><section className="panel settings-card"><div className="panel-heading"><div><h2>Préférences</h2><p>Ces choix sont enregistrés dans ce navigateur.</p></div></div><label className="settings-toggle"><span><strong>Notifications</strong><small>Afficher les confirmations et alertes locales.</small></span><input type="checkbox" checked={settings.notifications} onChange={(event) => onSettingsChange({ ...settings, notifications: event.target.checked })} /></label><label className="settings-toggle"><span><strong>Commencer la semaine le lundi</strong><small>Utiliser la semaine lundi–dimanche dans le planning.</small></span><input type="checkbox" checked={settings.weekStartsMonday} onChange={(event) => onSettingsChange({ ...settings, weekStartsMonday: event.target.checked })} /></label></section><section className="panel settings-card settings-account"><div className="panel-heading"><div><h2>Compte et sécurité</h2><p>L’inscription vérifiée par e-mail doit être activée côté serveur.</p></div></div><div className="settings-note">Les paramètres de compte et de sécurité ne sont pas disponibles tant que le service d’authentification n’est pas configuré.</div></section></div></>
}

function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) { return <div className="page-heading"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action}</div> }
function StatCard({ label, value, note, icon, tone }: { label: string; value: string | number; note: ReactNode; icon: string; tone: string }) { return <div className="stat-card"><div className={`stat-icon icon-${tone}`}><Icon name={icon} size={19} /></div><span className="stat-label">{label}</span><strong className="stat-value">{value}</strong><span className="stat-note">{note}</span><span className="stat-decoration" /></div> }
function Activity({ icon, tone, title, text, time }: { icon: string; tone: string; title: string; text: string; time: string }) { return <div className="activity-item"><span className={`activity-icon icon-${tone}`}><Icon name={icon} size={16} /></span><div className="activity-copy"><strong>{title}</strong><span>{text}</span><small>{time}</small></div></div> }
function Status({ status }: { status: string }) { const isDone = status === 'TERMINEE'; return <span className={`status-pill ${isDone ? 'status-green' : status === 'ANNULEE' ? 'status-muted' : 'status-blue'}`}><i />{isDone ? 'Terminée' : status === 'ANNULEE' ? 'Annulée' : 'Planifiée'}</span> }
function StudentTable({ students, onSelect, compact = false }: { students: Student[]; onSelect: (id: number) => void; compact?: boolean }) { return <div className="table-scroll"><table className="data-table"><thead><tr><th>ÉLÈVE</th><th>TÉLÉPHONE</th><th>INSCRIPTION</th><th>STATUT</th><th /></tr></thead><tbody>{students.map((item, index) => <tr key={item.id} onClick={() => onSelect(item.id)} className="clickable-row"><td><div className="table-person"><span className={`table-avatar table-tone-${index % 4}`}>{initials(item.prenom, item.nom)}</span><span><strong>{fullName(item.prenom, item.nom)}</strong><small>{`EL-${String(item.id).padStart(3, '0')}`}</small></span></div></td><td>{item.telephone || '—'}</td><td>{item.dateInscription ? prettyDate(item.dateInscription, { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td><td><span className="status-pill status-green"><i />{compact ? 'En formation' : 'Actif'}</span></td><td><button className="icon-button row-more" aria-label={`Ouvrir le dossier de ${fullName(item.prenom, item.nom)}`} onClick={(event) => { event.stopPropagation(); onSelect(item.id) }}><Icon name="more" size={18} /></button></td></tr>)}</tbody></table>{students.length === 0 && <div className="empty-state">Aucun élève ne correspond à votre recherche.</div>}</div> }
function LessonTable({ lessons, admin }: { lessons: Lesson[]; admin: boolean }) { return <div className="table-scroll"><table className="data-table"><thead><tr><th>DATE & HEURE</th>{admin && <th>ÉLÈVE</th>}<th>MONITEUR</th><th>VÉHICULE</th><th>DURÉE</th><th>STATUT</th></tr></thead><tbody>{lessons.map((lesson) => <tr key={lesson.id}><td><strong>{prettyDate(lesson.dateSeance, { day: 'numeric', month: 'short' })}</strong><small className="table-subline">{lesson.heureDebut}</small></td>{admin && <td>{lesson.eleveNom}</td>}<td>{lesson.moniteurNom}</td><td>{lesson.vehicule}</td><td>{lesson.duree} min</td><td><Status status={lesson.statut} /></td></tr>)}</tbody></table>{lessons.length === 0 && <div className="empty-state">Aucune séance programmée pour le moment.</div>}</div> }
function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) { return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><div className="modal-card"><div className="modal-heading"><h2>{title}</h2><button className="icon-button" onClick={onClose} aria-label="Fermer"><Icon name="close" /></button></div>{children}</div></div> }
function Field({ label, value, onChange, type = 'text', required = false, min, minLength }: { label: string; value?: string; onChange: (value: string) => void; type?: string; required?: boolean; min?: string; minLength?: number }) { return <label className="form-field"><span>{label}</span><input type={type} value={value || ''} onChange={(event) => onChange(event.target.value)} required={required} min={min} minLength={minLength} /></label> }
function SelectField({ label, value, onChange, options }: { label: string; value?: string; onChange: (value: string) => void; options: string[][] }) { return <label className="form-field"><span>{label}</span><select value={value || ''} onChange={(event) => onChange(event.target.value)} required>{options.map(([option, title]) => <option value={option} key={option}>{title}</option>)}</select></label> }

export default App
