import { useEffect, useMemo, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import './App.css'

type Role = 'admin' | 'eleve'
type View = 'overview' | 'eleves' | 'seances' | 'moniteurs' | 'vehicules' | 'examens'
type Student = { id: number; nom: string; prenom: string; telephone?: string; dateInscription?: string }
type Instructor = { id: number; nom: string; prenom: string; telephone?: string; actif?: boolean }
type Vehicle = { id: number; marque: string; modele: string; immatriculation: string; etat: string }
type Lesson = { id: number; dateSeance: string; heureDebut: string; duree: number; statut: string; eleveId: number; eleveNom: string; moniteurNom: string; vehicule: string }
type Exam = { id: number; typeExamen: string; dateExamen: string; lieu: string }
type Result = { id: number; typeExamen: string; dateExamen: string; lieu: string; note?: number; resultat: string }
type Data = { students: Student[]; instructors: Instructor[]; vehicles: Vehicle[]; lessons: Lesson[]; exams: Exam[]; results: Result[] }

const dateOffset = (days: number) => { const date = new Date(); date.setDate(date.getDate() + days); return date.toISOString().slice(0, 10) }

const seed: Data = {
  students: [
    { id: 1, nom: 'Rakoto', prenom: 'Miora', telephone: '034 12 345 67', dateInscription: dateOffset(-34) },
    { id: 2, nom: 'Andria', prenom: 'Lina', telephone: '032 45 678 90', dateInscription: dateOffset(-28) },
    { id: 3, nom: 'Rabe', prenom: 'Hery', telephone: '033 78 901 23', dateInscription: dateOffset(-20) },
    { id: 4, nom: 'Razafy', prenom: 'Tojo', telephone: '034 56 789 01', dateInscription: dateOffset(-12) },
    { id: 5, nom: 'Randria', prenom: 'Fara', telephone: '038 90 123 45', dateInscription: dateOffset(-8) },
  ],
  instructors: [
    { id: 1, nom: 'Rakotoarisoa', prenom: 'Jean', telephone: '034 11 223 34', actif: true },
    { id: 2, nom: 'Ranaivo', prenom: 'Marc', telephone: '032 44 556 67', actif: true },
    { id: 3, nom: 'Andriam', prenom: 'Nadia', telephone: '033 77 889 90', actif: true },
    { id: 4, nom: 'Raveloson', prenom: 'Lova', telephone: '034 00 112 23', actif: false },
  ],
  vehicles: [
    { id: 1, marque: 'Toyota', modele: 'Yaris', immatriculation: '1234 TAA', etat: 'BON' },
    { id: 2, marque: 'Renault', modele: 'Clio', immatriculation: '5678 TAB', etat: 'BON' },
    { id: 3, marque: 'Peugeot', modele: '208', immatriculation: '9012 TAC', etat: 'ENTRETIEN' },
  ],
  lessons: [
    { id: 1, dateSeance: dateOffset(-1), heureDebut: '08:00', duree: 60, statut: 'TERMINEE', eleveId: 1, eleveNom: 'Miora Rakoto', moniteurNom: 'Jean Rakotoarisoa', vehicule: 'Toyota Yaris' },
    { id: 2, dateSeance: dateOffset(-1), heureDebut: '09:30', duree: 90, statut: 'TERMINEE', eleveId: 2, eleveNom: 'Lina Andria', moniteurNom: 'Marc Ranaivo', vehicule: 'Renault Clio' },
    { id: 3, dateSeance: dateOffset(1), heureDebut: '10:00', duree: 60, statut: 'PROGRAMMEE', eleveId: 1, eleveNom: 'Miora Rakoto', moniteurNom: 'Jean Rakotoarisoa', vehicule: 'Toyota Yaris' },
    { id: 4, dateSeance: dateOffset(1), heureDebut: '14:00', duree: 60, statut: 'PROGRAMMEE', eleveId: 3, eleveNom: 'Hery Rabe', moniteurNom: 'Nadia Andriam', vehicule: 'Renault Clio' },
    { id: 5, dateSeance: dateOffset(2), heureDebut: '08:30', duree: 90, statut: 'PROGRAMMEE', eleveId: 4, eleveNom: 'Tojo Razafy', moniteurNom: 'Marc Ranaivo', vehicule: 'Peugeot 208' },
  ],
  exams: [
    { id: 1, typeExamen: 'CODE', dateExamen: dateOffset(6), lieu: 'Centre d’examen Antananarivo' },
    { id: 2, typeExamen: 'CONDUITE', dateExamen: dateOffset(11), lieu: 'Ivato' },
    { id: 3, typeExamen: 'CODE', dateExamen: dateOffset(18), lieu: 'Centre d’examen Antananarivo' },
  ],
  results: [
    { id: 1, typeExamen: 'CODE', dateExamen: dateOffset(-5), lieu: 'Antananarivo', note: 36, resultat: 'ADMIS' },
    { id: 2, typeExamen: 'CONDUITE', dateExamen: dateOffset(-14), lieu: 'Ivato', note: 24, resultat: 'AJOURNE' },
  ],
}

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

function App() {
  const [role, setRole] = useState<Role | null>(null)
  const [view, setView] = useState<View>('overview')
  const [data, setData] = useState(seed)
  const [connected, setConnected] = useState(false)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<string | null>(null)
  const [toast, setToast] = useState('')
  const [mobileMenu, setMobileMenu] = useState(false)
  const [studentId, setStudentId] = useState(1)
  const [form, setForm] = useState<Record<string, string>>({})
  const student = data.students.find((item) => item.id === studentId) || data.students[0]

  useEffect(() => {
    const endpoints: [keyof Data, string][] = [['students', '/api/eleves'], ['instructors', '/api/moniteurs'], ['vehicles', '/api/vehicules'], ['exams', '/api/examens']]
    Promise.all(endpoints.map(async ([key, path]) => {
      const response = await fetch(path)
      if (!response.ok) throw new Error('API indisponible')
      return [key, await response.json()] as const
    })).then((entries) => {
      setData((current) => ({ ...current, ...Object.fromEntries(entries) }))
      setConnected(true)
    }).catch(() => setConnected(false))
  }, [])

  useEffect(() => {
    if (!role) return
    const filter = role === 'admin' ? '' : `?eleveId=${studentId}`
    fetch(`/api/seances${filter}`).then((response) => response.ok ? response.json() : null).then((lessons) => { if (lessons) setData((current) => ({ ...current, lessons })) }).catch(() => undefined)
    fetch(`/api/resultats${filter}`).then((response) => response.ok ? response.json() : null).then((results) => { if (results) setData((current) => ({ ...current, results })) }).catch(() => undefined)
  }, [role, studentId])

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(''), 3200)
    return () => window.clearTimeout(timeout)
  }, [toast])

  const upcoming = useMemo(() => [...data.lessons].filter((lesson) => lesson.statut !== 'ANNULEE').sort((a, b) => `${a.dateSeance}${a.heureDebut}`.localeCompare(`${b.dateSeance}${b.heureDebut}`)), [data.lessons])
  const filteredStudents = data.students.filter((item) => fullName(item.prenom, item.nom).toLowerCase().includes(search.toLowerCase()) || (item.telephone || '').includes(search))

  const apiPost = async (path: string, payload: unknown) => {
    try {
      const response = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!response.ok) throw new Error('Échec de la requête')
      return await response.json()
    } catch { return null }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (modal === 'student') {
      const payload = { nom: form.nom, prenom: form.prenom, telephone: form.telephone, dateInscription: dateInput() }
      const saved = await apiPost('/api/eleves', payload)
      const item = saved || { ...payload, id: Math.max(0, ...data.students.map((entry) => entry.id)) + 1 }
      setData((current) => ({ ...current, students: [item, ...current.students] }))
      setToast(saved ? 'Élève ajouté au dossier' : 'Élève ajouté en mode démonstration')
    } else if (modal === 'lesson') {
      const studentItem = data.students.find((item) => item.id === Number(form.idEleve))
      const instructor = data.instructors.find((item) => item.id === Number(form.idMoniteur))
      const vehicle = data.vehicles.find((item) => item.id === Number(form.idVehicule))
      const payload = { dateSeance: form.dateSeance, heureDebut: form.heureDebut, duree: Number(form.duree), idEleve: Number(form.idEleve), idMoniteur: Number(form.idMoniteur), idVehicule: Number(form.idVehicule) }
      const saved = await apiPost('/api/seances', payload)
      const item = saved || { ...payload, id: Math.max(0, ...data.lessons.map((entry) => entry.id)) + 1, statut: 'PROGRAMMEE', eleveId: Number(form.idEleve), eleveNom: fullName(studentItem?.prenom, studentItem?.nom), moniteurNom: fullName(instructor?.prenom, instructor?.nom), vehicule: `${vehicle?.marque || ''} ${vehicle?.modele || ''}`.trim() }
      setData((current) => ({ ...current, lessons: [item, ...current.lessons] }))
      setToast(saved ? 'Séance enregistrée' : 'Séance ajoutée en mode démonstration')
    } else if (modal === 'instructor') {
      const payload = { nom: form.nom, prenom: form.prenom, telephone: form.telephone }
      const saved = await apiPost('/api/moniteurs', payload)
      const item = saved || { ...payload, actif: true, id: Math.max(0, ...data.instructors.map((entry) => entry.id)) + 1 }
      setData((current) => ({ ...current, instructors: [item, ...current.instructors] }))
      setToast(saved ? 'Moniteur ajouté au dossier' : 'Moniteur ajouté en mode démonstration')
    } else if (modal === 'vehicle') {
      const payload = { marque: form.marque, modele: form.modele, immatriculation: form.immatriculation, etat: form.etat || 'BON' }
      const saved = await apiPost('/api/vehicules', payload)
      const item = saved || { ...payload, id: Math.max(0, ...data.vehicles.map((entry) => entry.id)) + 1 }
      setData((current) => ({ ...current, vehicles: [item, ...current.vehicles] }))
      setToast(saved ? 'Véhicule ajouté au parc' : 'Véhicule ajouté en mode démonstration')
    } else if (modal === 'exam') {
      const payload = { typeExamen: form.typeExamen, dateExamen: form.dateExamen, lieu: form.lieu }
      const saved = await apiPost('/api/examens', payload)
      const item = saved || { ...payload, id: Math.max(0, ...data.exams.map((entry) => entry.id)) + 1 }
      setData((current) => ({ ...current, exams: [item, ...current.exams] }))
      setToast(saved ? 'Examen ajouté au calendrier' : 'Examen ajouté en mode démonstration')
    } else {
      const payload = { nom: form.nom, prenom: form.prenom, telephone: form.telephone, dateInscription: dateInput() }
      const saved = await apiPost('/api/eleves', payload)
      const item = saved || { ...payload, id: Math.max(0, ...data.students.map((entry) => entry.id)) + 1 }
      setData((current) => ({ ...current, students: [item, ...current.students] }))
      setStudentId(item.id)
      setRole('eleve')
      setToast(saved ? 'Profil élève créé' : 'Profil créé en mode démonstration')
    }
    setModal(null)
    setForm({})
  }

  const pageTitle: Record<View, string> = { overview: role === 'admin' ? 'Vue d’ensemble' : 'Mon espace', eleves: 'Élèves', seances: 'Séances', moniteurs: 'Moniteurs', vehicules: 'Véhicules', examens: 'Examens' }
  const navItems: { id: View; label: string; icon: string }[] = [
    { id: 'overview', label: 'Vue d’ensemble', icon: 'grid' },
    ...(role === 'admin' ? [{ id: 'eleves' as View, label: 'Élèves', icon: 'users' }] : []),
    { id: 'seances', label: role === 'admin' ? 'Séances' : 'Mes séances', icon: 'calendar' },
    ...(role === 'admin' ? [{ id: 'moniteurs' as View, label: 'Moniteurs', icon: 'steering' }, { id: 'vehicules' as View, label: 'Véhicules', icon: 'car' }, { id: 'examens' as View, label: 'Examens', icon: 'book' }] : [{ id: 'examens' as View, label: 'Mes examens', icon: 'book' }]),
  ]

  const openModal = (name: string) => { setForm(name === 'lesson' ? { dateSeance: dateInput(), heureDebut: '09:00', duree: '60', idEleve: String(data.students[0]?.id || 1), idMoniteur: String(data.instructors.find((item) => item.actif !== false)?.id || 1), idVehicule: String(data.vehicles[0]?.id || 1) } : name === 'exam' ? { typeExamen: 'CODE', dateExamen: dateInput() } : name === 'vehicle' ? { etat: 'BON' } : {}); setModal(name) }
  const filteredLessons = role === 'admin' ? upcoming : upcoming.filter((lesson) => lesson.eleveId === studentId)

  if (!role) return <AuthScreen onLogin={(selectedRole, id) => { setRole(selectedRole); setStudentId(id); setView('overview') }} onRegister={() => openModal('register')} />

  return <div className="app-shell">
    <aside className={`sidebar ${mobileMenu ? 'sidebar-open' : ''}`}>
      <div className="brand"><span className="brand-mark"><Icon name="steering" size={22} /></span><span>Conduite<span className="brand-dot">.</span><small>ÉCOLE DE CONDUITE</small></span><button className="mobile-close icon-button" onClick={() => setMobileMenu(false)} aria-label="Fermer le menu"><Icon name="close" /></button></div>
      <div className="workspace-label">ESPACE DE TRAVAIL</div>
      <div className="school-switch"><span className="school-emblem">A</span><span><strong>Auto-école Atlas</strong><small>Antananarivo</small></span><span className="switch-chevron">⌄</span></div>
      <div className="nav-section-label">MENU PRINCIPAL</div>
      <nav className="side-nav" aria-label="Navigation principale">{navItems.map((item) => <button key={item.id} className={`nav-item ${view === item.id ? 'active' : ''}`} onClick={() => { setView(item.id); setMobileMenu(false) }}><Icon name={item.icon} /><span>{item.label}</span>{item.id === 'seances' && <span className="nav-count">{role === 'admin' ? upcoming.length : filteredLessons.length}</span>}</button>)}</nav>
      {role === 'admin' && <div className="sidebar-bottom"><div className="nav-section-label">PRÉFÉRENCES</div><button className="nav-item" onClick={() => setToast('Les paramètres sont en préparation')}><Icon name="settings" /><span>Paramètres</span></button><div className="help-card"><div className="help-icon"><Icon name="book" size={17} /></div><strong>Besoin d’aide ?</strong><p>Consultez le guide de prise en main.</p><button onClick={() => setToast('Le guide sera bientôt disponible')}>Ouvrir le guide <Icon name="arrow" size={15} /></button></div></div>}
      <div className="profile-card"><div className="avatar avatar-blue">{role === 'admin' ? 'SA' : initials(student?.prenom, student?.nom)}</div><div className="profile-copy"><strong>{role === 'admin' ? 'Stéphan Admin' : fullName(student?.prenom, student?.nom)}</strong><small>{role === 'admin' ? 'Administrateur' : 'Élève'}</small></div><button className="icon-button logout-button" onClick={() => { setRole(null); setView('overview') }} aria-label="Se déconnecter"><Icon name="logout" size={18} /></button></div>
    </aside>

    <main className="main-area">
      <header className="topbar"><button className="mobile-menu icon-button" onClick={() => setMobileMenu(true)} aria-label="Ouvrir le menu"><Icon name="menu" /></button><div className="breadcrumb">Espace de travail <span>/</span> <strong>{pageTitle[view]}</strong></div><div className="topbar-actions"><div className={`connection-status ${connected ? 'is-connected' : ''}`}><span />{connected ? 'Connecté' : 'Mode démonstration'}</div><button className="icon-button notification-button" onClick={() => setToast('Vous êtes à jour')} aria-label="Notifications"><Icon name="bell" size={19} /><i /></button><div className="topbar-divider" /><div className="top-user"><span className="avatar avatar-small">{role === 'admin' ? 'SA' : initials(student?.prenom, student?.nom)}</span><span className="top-user-name">{role === 'admin' ? 'Stéphan' : student?.prenom}</span></div></div></header>
      <div className="page-content">
        {view === 'overview' && <Overview role={role} student={student} data={data} connected={connected} lessons={filteredLessons} onNavigate={setView} onSchedule={() => openModal('lesson')} />}
        {view === 'eleves' && <><PageHeading eyebrow="GESTION PÉDAGOGIQUE" title="Tous les élèves" description="Suivez les inscriptions et accompagnez chaque élève dans sa progression." action={<button className="button button-primary" onClick={() => openModal('student')}><Icon name="plus" size={17} /> Nouvel élève</button>} /><div className="stats-grid compact-stats"><StatCard label="Élèves inscrits" value={data.students.length} note="sur l’année en cours" icon="users" tone="blue" /><StatCard label="Nouvelles inscriptions" value="12" note="ce mois-ci" icon="chart" tone="green" /><StatCard label="En formation" value={Math.max(1, data.students.length - 2)} note="élèves actifs" icon="steering" tone="orange" /></div><div className="panel table-panel"><div className="panel-heading"><div><h2>Liste des élèves</h2><p>Retrouvez et gérez les dossiers des élèves.</p></div><div className="table-tools"><label className="search-box"><Icon name="search" size={17} /><input placeholder="Rechercher un élève…" value={search} onChange={(event) => setSearch(event.target.value)} /></label><button className="button button-outline" onClick={() => setToast('Filtres appliqués')}><Icon name="filter" size={16} /> Filtrer</button></div></div><StudentTable students={filteredStudents} onSelect={(id) => { setStudentId(id); setRole('eleve'); setView('overview') }} /></div></>}
        {view === 'seances' && <><PageHeading eyebrow="PLANNING & SUIVI" title={role === 'admin' ? 'Séances de conduite' : 'Mes séances'} description={role === 'admin' ? 'Organisez le planning et consultez les leçons programmées.' : 'Retrouvez votre planning, votre moniteur et votre véhicule.'} action={role === 'admin' ? <button className="button button-primary" onClick={() => openModal('lesson')}><Icon name="plus" size={17} /> Planifier une séance</button> : undefined} /><div className="panel table-panel"><div className="panel-heading"><div><h2>Planning des séances</h2><p>{filteredLessons.length} séance{filteredLessons.length > 1 ? 's' : ''} affichée{filteredLessons.length > 1 ? 's' : ''}</p></div><button className="button button-outline" onClick={() => setToast('Vue calendrier bientôt disponible')}><Icon name="calendar" size={16} /> Cette semaine</button></div><LessonTable lessons={filteredLessons} admin={role === 'admin'} /></div></>}
        {view === 'moniteurs' && <><PageHeading eyebrow="ÉQUIPE PÉDAGOGIQUE" title="Nos moniteurs" description="Gérez votre équipe et les disponibilités de vos moniteurs." action={<button className="button button-primary" onClick={() => openModal('instructor')}><Icon name="plus" size={17} /> Ajouter un moniteur</button>} /><div className="people-grid">{data.instructors.map((item, index) => <div className="person-card" key={item.id}><div className={`person-avatar person-tone-${index % 4}`}>{initials(item.prenom, item.nom)}</div><span className={`status-pill ${item.actif === false ? 'status-muted' : 'status-green'}`}><i />{item.actif === false ? 'Inactif' : 'Actif'}</span><h3>{fullName(item.prenom, item.nom)}</h3><p>Moniteur de conduite</p><div className="person-meta"><span><Icon name="calendar" size={15} /> {data.lessons.filter((lesson) => lesson.moniteurNom.includes(item.prenom)).length} séances planifiées</span><span><Icon name="users" size={15} /> Enseignement général</span></div><button className="text-action" onClick={() => setToast(`Profil de ${item.prenom} ${item.nom}`)}>Voir le profil <Icon name="arrow" size={15} /></button></div>)}</div></>}
        {view === 'vehicules' && <><PageHeading eyebrow="FLOTTE AUTOMOBILE" title="Parc de véhicules" description="Gardez un œil sur vos véhicules et leur disponibilité." action={<button className="button button-primary" onClick={() => openModal('vehicle')}><Icon name="plus" size={17} /> Ajouter un véhicule</button>} /><div className="stats-grid compact-stats"><StatCard label="Véhicules au total" value={data.vehicles.length} note="dans votre flotte" icon="car" tone="blue" /><StatCard label="Disponibles" value={data.vehicles.filter((item) => item.etat === 'BON').length} note="prêts à rouler" icon="check" tone="green" /><StatCard label="En entretien" value={data.vehicles.filter((item) => item.etat !== 'BON').length} note="à vérifier" icon="settings" tone="orange" /></div><div className="vehicle-grid">{data.vehicles.map((vehicle, index) => <div className="vehicle-card" key={vehicle.id}><div className={`vehicle-art vehicle-art-${index % 3}`}><Icon name="car" size={64} /><span className={`status-pill ${vehicle.etat === 'BON' ? 'status-green' : 'status-orange'}`}><i />{vehicle.etat === 'BON' ? 'Disponible' : 'Entretien'}</span><span className="plate-number">{vehicle.immatriculation}</span></div><div className="vehicle-info"><div><h3>{vehicle.marque} {vehicle.modele}</h3><p>Boîte manuelle · Catégorie B</p></div><button className="icon-button" aria-label="Options"><Icon name="more" /></button></div><div className="vehicle-foot"><span><Icon name="steering" size={15} /> Utilisé pour la conduite</span><span>{data.lessons.filter((lesson) => lesson.vehicule.includes(vehicle.marque)).length} leçons</span></div></div>)}</div></>}
        {view === 'examens' && <><PageHeading eyebrow="RÉUSSITE & CERTIFICATION" title={role === 'admin' ? 'Examens' : 'Mes examens'} description={role === 'admin' ? 'Planifiez les prochaines sessions et suivez les résultats.' : 'Consultez vos prochains examens et vos résultats.'} action={role === 'admin' ? <button className="button button-primary" onClick={() => openModal('exam')}><Icon name="plus" size={17} /> Programmer un examen</button> : undefined} /><div className="exam-layout"><div className="panel exam-list-panel"><div className="panel-heading"><div><h2>Prochains examens</h2><p>Les dates à ne pas manquer</p></div><span className="panel-count">{data.exams.length} prévus</span></div>{data.exams.map((exam) => <div className="exam-row" key={exam.id}><div className="exam-date"><strong>{prettyDate(exam.dateExamen, { day: '2-digit' })}</strong><span>{prettyDate(exam.dateExamen, { month: 'short' })}</span></div><div className="exam-copy"><strong>Examen de {exam.typeExamen.toLowerCase()}</strong><span><Icon name="book" size={14} /> {exam.lieu}</span></div><span className="status-pill status-blue"><i />À venir</span></div>)}</div><div className="panel results-panel"><div className="panel-heading"><div><h2>{role === 'admin' ? 'Derniers résultats' : 'Mes résultats'}</h2><p>Vos progrès, étape par étape</p></div><span className="trophy-icon"><Icon name="trophy" size={19} /></span></div>{(role === 'admin' ? data.results.slice(0, 3) : data.results).map((result) => <div className="result-row" key={result.id}><div className={`result-symbol ${result.resultat === 'ADMIS' ? 'result-pass' : 'result-fail'}`}><Icon name={result.resultat === 'ADMIS' ? 'check' : 'close'} size={17} /></div><div className="exam-copy"><strong>{result.typeExamen} · {result.resultat === 'ADMIS' ? 'Admis' : 'Ajourné'}</strong><span>{prettyDate(result.dateExamen, { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>{result.note != null && <strong className="result-score">{result.note}<small>/40</small></strong>}</div>)}</div></div></>}
      </div>
    </main>
    {modal && <Modal title={modal === 'student' ? 'Ajouter un élève' : modal === 'lesson' ? 'Planifier une séance' : modal === 'instructor' ? 'Ajouter un moniteur' : modal === 'vehicle' ? 'Ajouter un véhicule' : modal === 'exam' ? 'Programmer un examen' : 'Créer mon compte'} onClose={() => setModal(null)}><form className="form-grid" onSubmit={handleSubmit}>
      {modal === 'register' ? <><Field label="Prénom" value={form.prenom} onChange={(value) => setForm({ ...form, prenom: value })} required /><Field label="Nom" value={form.nom} onChange={(value) => setForm({ ...form, nom: value })} required /><Field label="Téléphone" value={form.telephone} onChange={(value) => setForm({ ...form, telephone: value })} required /><p className="form-note full-span">Cette inscription de démonstration crée un profil élève. La gestion sécurisée des mots de passe n’est pas encore configurée.</p></> : null}
      {(modal === 'student' || modal === 'instructor') && <><Field label="Prénom" value={form.prenom} onChange={(value) => setForm({ ...form, prenom: value })} required /><Field label="Nom" value={form.nom} onChange={(value) => setForm({ ...form, nom: value })} required /><Field label="Téléphone" value={form.telephone} onChange={(value) => setForm({ ...form, telephone: value })} required /></>}
      {modal === 'lesson' && <><SelectField label="Élève" value={form.idEleve} onChange={(value) => setForm({ ...form, idEleve: value })} options={data.students.map((item) => [String(item.id), fullName(item.prenom, item.nom)])} /><SelectField label="Moniteur" value={form.idMoniteur} onChange={(value) => setForm({ ...form, idMoniteur: value })} options={data.instructors.filter((item) => item.actif !== false).map((item) => [String(item.id), fullName(item.prenom, item.nom)])} /><SelectField label="Véhicule" value={form.idVehicule} onChange={(value) => setForm({ ...form, idVehicule: value })} options={data.vehicles.map((item) => [String(item.id), `${item.marque} ${item.modele}`])} /><Field label="Date" type="date" value={form.dateSeance} onChange={(value) => setForm({ ...form, dateSeance: value })} required /><Field label="Heure de début" type="time" value={form.heureDebut} onChange={(value) => setForm({ ...form, heureDebut: value })} required /><Field label="Durée (minutes)" type="number" value={form.duree} onChange={(value) => setForm({ ...form, duree: value })} required min="15" /></>}
      {modal === 'vehicle' && <><Field label="Marque" value={form.marque} onChange={(value) => setForm({ ...form, marque: value })} required /><Field label="Modèle" value={form.modele} onChange={(value) => setForm({ ...form, modele: value })} required /><Field label="Immatriculation" value={form.immatriculation} onChange={(value) => setForm({ ...form, immatriculation: value })} required /><SelectField label="État" value={form.etat} onChange={(value) => setForm({ ...form, etat: value })} options={ [['BON', 'Disponible'], ['ENTRETIEN', 'En entretien']] } /></>}
      {modal === 'exam' && <><SelectField label="Type d’examen" value={form.typeExamen} onChange={(value) => setForm({ ...form, typeExamen: value })} options={ [['CODE', 'Code de la route'], ['CONDUITE', 'Conduite']] } /><Field label="Date" type="date" value={form.dateExamen} onChange={(value) => setForm({ ...form, dateExamen: value })} required /><Field label="Lieu" value={form.lieu} onChange={(value) => setForm({ ...form, lieu: value })} required /></>}
      <div className="form-actions full-span"><button type="button" className="button button-outline" onClick={() => setModal(null)}>Annuler</button><button className="button button-primary" type="submit">{modal === 'lesson' ? 'Planifier la séance' : modal === 'exam' ? 'Programmer l’examen' : modal === 'register' ? 'Créer mon profil' : 'Enregistrer'}</button></div>
    </form></Modal>}
    {toast && <div className="toast-message"><span><Icon name="check" size={16} /></span>{toast}</div>}
  </div>
}

function AuthScreen({ onLogin, onRegister }: { onLogin: (role: Role, id: number) => void; onRegister: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authNotice, setAuthNotice] = useState('')
  return <div className="auth-page"><div className="auth-left"><div className="auth-brand"><span className="brand-mark"><Icon name="steering" size={22} /></span><span>Conduite<span className="brand-dot">.</span></span></div><div className="auth-content"><span className="auth-kicker"><span /> LA ROUTE DE VOTRE RÉUSSITE</span><h1>Apprenez à conduire.<br /><span>En toute confiance.</span></h1><p>Votre parcours de conduite, accompagné à chaque étape. Planifiez vos leçons, suivez vos progrès et prenez la route sereinement.</p><div className="auth-feature"><span><Icon name="calendar" size={18} /></span><div><strong>Tout votre parcours au même endroit</strong><small>Séances, moniteurs et résultats réunis.</small></div></div><div className="auth-feature"><span><Icon name="steering" size={18} /></span><div><strong>Une équipe à vos côtés</strong><small>Un suivi personnalisé, à votre rythme.</small></div></div></div><div className="auth-footer">© 2025 Auto-école Atlas <span>·</span> Antananarivo</div></div><div className="auth-right"><div className="auth-card"><div className="auth-mobile-brand"><span className="brand-mark"><Icon name="steering" size={20} /></span> Conduite<span className="brand-dot">.</span></div><span className="auth-overline">RAVI DE VOUS REVOIR</span><h2>Bon retour parmi nous</h2><p className="auth-subtitle">Connectez-vous pour accéder à votre espace.</p><form onSubmit={(event) => { event.preventDefault(); setAuthNotice(`Connexion réelle indisponible. Utilisez un accès de démonstration${email ? ` pour ${email}` : ''}.`) }}><label className="field-label">Adresse e-mail</label><input className="auth-input" type="email" placeholder="nom@exemple.com" value={email} onChange={(event) => setEmail(event.target.value)} required /><div className="password-label"><label className="field-label">Mot de passe</label><button type="button" onClick={() => setAuthNotice('La récupération de mot de passe sera disponible après activation de l’authentification.')}>Mot de passe oublié ?</button></div><input className="auth-input" type="password" placeholder="••••••••" value={password} onChange={(event) => setPassword(event.target.value)} required /><button className="button button-primary auth-submit" type="submit">Se connecter <Icon name="arrow" size={17} /></button></form>{authNotice && <p className="auth-notice" role="status">{authNotice}</p>}<div className="auth-separator"><span /> ou <span /></div><div className="demo-logins"><p>Explorer la démonstration</p><button className="demo-button" onClick={() => onLogin('admin', 1)}><span className="demo-avatar demo-admin">SA</span><span><strong>Espace administrateur</strong><small>Gestion complète de l’auto-école</small></span><Icon name="arrow" size={16} /></button><button className="demo-button" onClick={() => onLogin('eleve', 1)}><span className="demo-avatar">MR</span><span><strong>Espace élève</strong><small>Planning et résultats personnels</small></span><Icon name="arrow" size={16} /></button></div><div className="auth-register">Vous n’avez pas encore de compte ? <button onClick={onRegister}>S’inscrire</button></div><p className="demo-disclaimer">Mode démonstration : l’authentification réelle sera disponible après configuration du backend.</p></div></div></div>
}

function Overview({ role, student, data, connected, lessons, onNavigate, onSchedule }: { role: Role; student: Student; data: Data; connected: boolean; lessons: Lesson[]; onNavigate: (view: View) => void; onSchedule: () => void }) {
  return <><div className="welcome-row"><div><span className="eyebrow">TABLEAU DE BORD · AUTO-ÉCOLE ATLAS</span><h1>{role === 'admin' ? 'Bonjour Stéphan' : `Bonjour ${student.prenom}`}<span className="greeting-dot">.</span></h1><p>{role === 'admin' ? 'Voici ce qui se passe dans votre auto-école aujourd’hui.' : 'Prêt à faire un pas de plus vers votre permis ? Voici votre progression.'}</p></div>{role === 'admin' && <button className="button button-primary" onClick={onSchedule}><Icon name="plus" size={17} /> Planifier une séance</button>}</div>
    {role === 'admin' ? <><div className="stats-grid"><StatCard label="Élèves inscrits" value={connected ? data.students.length : 150} note={<><b className="positive">+8,2%</b> ce mois-ci</>} icon="users" tone="blue" /><StatCard label="Séances cette semaine" value="36" note={<><b className="positive">+12%</b> vs. semaine passée</>} icon="calendar" tone="green" /><StatCard label="Moniteurs actifs" value={connected ? data.instructors.filter((item) => item.actif !== false).length : 8} note="sur 8 au total" icon="steering" tone="purple" /><StatCard label="Véhicules disponibles" value={connected ? data.vehicles.filter((item) => item.etat === 'BON').length : 12} note="sur 12 véhicules" icon="car" tone="orange" /></div><div className="dashboard-grid"><div className="panel schedule-panel"><div className="panel-heading"><div><h2>Planning des séances</h2><p>Les prochaines leçons de conduite</p></div><button className="link-button" onClick={() => onNavigate('seances')}>Tout voir <Icon name="arrow" size={15} /></button></div><div className="schedule-list">{lessons.slice(0, 4).map((lesson) => <div className="schedule-item" key={lesson.id}><div className="schedule-date"><strong>{prettyDate(lesson.dateSeance, { day: '2-digit' })}</strong><span>{prettyDate(lesson.dateSeance, { month: 'short' })}</span></div><div className="schedule-time"><strong>{lesson.heureDebut}</strong><span>{lesson.duree} min</span></div><div className="schedule-person"><div className="mini-avatar">{initials(lesson.eleveNom.split(' ')[0], lesson.eleveNom.split(' ').slice(1).join(' '))}</div><div><strong>{lesson.eleveNom}</strong><span>{lesson.moniteurNom}</span></div></div><div className="schedule-car"><Icon name="car" size={16} /><span>{lesson.vehicule}</span></div><Status status={lesson.statut} /></div>)}</div></div><div className="panel activity-panel"><div className="panel-heading"><div><h2>Activité récente</h2><p>Les dernières actualités</p></div><button className="icon-button" aria-label="Plus"><Icon name="more" /></button></div><div className="activity-list"><Activity icon="users" tone="blue" title="Nouvelle inscription" text="Fara Randria a rejoint l’auto-école" time="Il y a 18 min" /><Activity icon="check" tone="green" title="Examen réussi" text="Miora Rakoto a obtenu son code" time="Il y a 2 h" /><Activity icon="calendar" tone="orange" title="Séance planifiée" text="Une nouvelle leçon a été ajoutée" time="Il y a 4 h" /><Activity icon="car" tone="purple" title="Véhicule disponible" text="La Toyota Yaris est prête à rouler" time="Hier" /></div><button className="activity-footer" onClick={() => onNavigate('examens')}>Voir toute l’activité <Icon name="arrow" size={15} /></button></div></div><div className="dashboard-bottom"><div className="panel students-panel"><div className="panel-heading"><div><h2>Élèves récemment inscrits</h2><p>Les nouveaux dossiers de l’école</p></div><button className="link-button" onClick={() => onNavigate('eleves')}>Voir les élèves <Icon name="arrow" size={15} /></button></div><StudentTable students={data.students.slice(0, 4)} onSelect={() => onNavigate('eleves')} compact /></div><div className="panel progress-panel"><div className="panel-heading"><div><h2>Objectif mensuel</h2><p>Votre activité en un coup d’œil</p></div><span className="target-icon"><Icon name="chart" size={17} /></span></div><div className="target-number"><strong>128</strong><span>/ 150 séances</span></div><div className="progress-track"><span /></div><p className="progress-caption">Encore <strong>22 séances</strong> pour atteindre l’objectif.</p><div className="progress-note"><span><Icon name="check" size={15} /></span>Vous êtes sur la bonne voie ce mois-ci.</div></div></div></> : <><div className="student-hero"><div className="student-hero-copy"><span className="auth-kicker"><span /> VOTRE PARCOURS, À VOTRE RYTHME</span><h2>Chaque leçon vous rapproche<br />de la liberté.</h2><p>Continuez comme ça, votre prochain objectif est à portée de main.</p><button className="button button-light" onClick={() => onNavigate('seances')}>Voir mon planning <Icon name="arrow" size={16} /></button></div><div className="student-hero-mark"><Icon name="steering" size={120} /></div><div className="student-hero-count"><span>PROGRESSION GLOBALE</span><strong>68<small>%</small></strong><div className="progress-track"><span /></div><small>Vous êtes sur la bonne voie</small></div></div><div className="stats-grid student-stats"><StatCard label="Heures de conduite" value="18 h" note="sur 25 h recommandées" icon="clock" tone="blue" /><StatCard label="Séances effectuées" value={data.lessons.filter((item) => item.eleveId === student.id && item.statut === 'TERMINEE').length + 11} note="3 séances à venir" icon="calendar" tone="green" /><StatCard label="Prochain examen" value="24 mars" note="Code de la route" icon="book" tone="orange" /></div><div className="student-panels"><div className="panel"><div className="panel-heading"><div><h2>Mes prochaines séances</h2><p>Votre planning de conduite</p></div><button className="link-button" onClick={() => onNavigate('seances')}>Tout voir <Icon name="arrow" size={15} /></button></div><div className="schedule-list student-schedule">{lessons.slice(0, 3).map((lesson) => <div className="schedule-item" key={lesson.id}><div className="schedule-date"><strong>{prettyDate(lesson.dateSeance, { day: '2-digit' })}</strong><span>{prettyDate(lesson.dateSeance, { month: 'short' })}</span></div><div className="schedule-time"><strong>{lesson.heureDebut}</strong><span>{lesson.duree} min</span></div><div className="schedule-person"><div className="mini-avatar">{initials(...lesson.moniteurNom.split(' ').slice(0, 2))}</div><div><strong>{lesson.moniteurNom}</strong><span>Moniteur · {lesson.vehicule}</span></div></div><Status status={lesson.statut} /></div>)}</div></div><div className="panel progress-panel"><div className="panel-heading"><div><h2>Dernier examen</h2><p>Votre dernière évaluation</p></div><span className="trophy-icon"><Icon name="trophy" size={19} /></span></div><div className="exam-result-highlight"><div className="result-symbol result-pass"><Icon name="check" /></div><div><strong>{data.results[0]?.resultat === 'ADMIS' ? 'Code obtenu !' : 'Continuez vos efforts'}</strong><span>{data.results[0] ? `${data.results[0].typeExamen} · ${prettyDate(data.results[0].dateExamen)}` : 'Pas encore de résultat'}</span></div></div><div className="score-line"><span>Note obtenue</span><strong>{data.results[0]?.note || 36}<small> / 40</small></strong></div><button className="activity-footer" onClick={() => onNavigate('examens')}>Voir tous mes résultats <Icon name="arrow" size={15} /></button></div></div></>}
  </>
}

function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) { return <div className="page-heading"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action}</div> }
function StatCard({ label, value, note, icon, tone }: { label: string; value: string | number; note: ReactNode; icon: string; tone: string }) { return <div className="stat-card"><div className={`stat-icon icon-${tone}`}><Icon name={icon} size={19} /></div><span className="stat-label">{label}</span><strong className="stat-value">{value}</strong><span className="stat-note">{note}</span><span className="stat-decoration" /></div> }
function Activity({ icon, tone, title, text, time }: { icon: string; tone: string; title: string; text: string; time: string }) { return <div className="activity-item"><span className={`activity-icon icon-${tone}`}><Icon name={icon} size={16} /></span><div className="activity-copy"><strong>{title}</strong><span>{text}</span><small>{time}</small></div></div> }
function Status({ status }: { status: string }) { const isDone = status === 'TERMINEE'; return <span className={`status-pill ${isDone ? 'status-green' : status === 'ANNULEE' ? 'status-muted' : 'status-blue'}`}><i />{isDone ? 'Terminée' : status === 'ANNULEE' ? 'Annulée' : 'Planifiée'}</span> }
function StudentTable({ students, onSelect, compact = false }: { students: Student[]; onSelect: (id: number) => void; compact?: boolean }) { return <div className="table-scroll"><table className="data-table"><thead><tr><th>ÉLÈVE</th><th>TÉLÉPHONE</th><th>INSCRIPTION</th><th>STATUT</th><th /></tr></thead><tbody>{students.map((item, index) => <tr key={item.id} onClick={() => onSelect(item.id)} className="clickable-row"><td><div className="table-person"><span className={`table-avatar table-tone-${index % 4}`}>{initials(item.prenom, item.nom)}</span><span><strong>{fullName(item.prenom, item.nom)}</strong><small>{`EL-${String(item.id).padStart(3, '0')}`}</small></span></div></td><td>{item.telephone || '—'}</td><td>{item.dateInscription ? prettyDate(item.dateInscription, { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td><td><span className="status-pill status-green"><i />{compact ? 'En formation' : 'Actif'}</span></td><td><button className="icon-button row-more" aria-label="Options"><Icon name="more" size={18} /></button></td></tr>)}</tbody></table>{students.length === 0 && <div className="empty-state">Aucun élève ne correspond à votre recherche.</div>}</div> }
function LessonTable({ lessons, admin }: { lessons: Lesson[]; admin: boolean }) { return <div className="table-scroll"><table className="data-table"><thead><tr><th>DATE & HEURE</th>{admin && <th>ÉLÈVE</th>}<th>MONITEUR</th><th>VÉHICULE</th><th>DURÉE</th><th>STATUT</th></tr></thead><tbody>{lessons.map((lesson) => <tr key={lesson.id}><td><strong>{prettyDate(lesson.dateSeance, { day: 'numeric', month: 'short' })}</strong><small className="table-subline">{lesson.heureDebut}</small></td>{admin && <td>{lesson.eleveNom}</td>}<td>{lesson.moniteurNom}</td><td>{lesson.vehicule}</td><td>{lesson.duree} min</td><td><Status status={lesson.statut} /></td></tr>)}</tbody></table>{lessons.length === 0 && <div className="empty-state">Aucune séance programmée pour le moment.</div>}</div> }
function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) { return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><div className="modal-card"><div className="modal-heading"><h2>{title}</h2><button className="icon-button" onClick={onClose} aria-label="Fermer"><Icon name="close" /></button></div>{children}</div></div> }
function Field({ label, value, onChange, type = 'text', required = false, min }: { label: string; value?: string; onChange: (value: string) => void; type?: string; required?: boolean; min?: string }) { return <label className="form-field"><span>{label}</span><input type={type} value={value || ''} onChange={(event) => onChange(event.target.value)} required={required} min={min} /></label> }
function SelectField({ label, value, onChange, options }: { label: string; value?: string; onChange: (value: string) => void; options: string[][] }) { return <label className="form-field"><span>{label}</span><select value={value || ''} onChange={(event) => onChange(event.target.value)} required>{options.map(([option, title]) => <option value={option} key={option}>{title}</option>)}</select></label> }

export default App
