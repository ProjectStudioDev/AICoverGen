const STORAGE_KEY = 'impactfonds-dashboard-state-v1';

const deepClone = (obj) => JSON.parse(JSON.stringify(obj));
const nowIso = () => new Date().toISOString();

const seededState = {
  session: {
    activeMedewerkerId: 'm1'
  },
  medewerkers: [
    { id: 'm1', naam: 'Sanne de Groot', rol: 'Verificatiemedewerker', team: 'Verificaties', actiefDossiers: 2 },
    { id: 'm2', naam: 'Rachid El Idrissi', rol: 'Klantregisseur', team: 'Portaalbeheer', actiefDossiers: 1 },
    { id: 'm3', naam: 'Maaike van Dijk', rol: 'Teamlead Operatie', team: 'Operatie', actiefDossiers: 0 },
    { id: 'm4', naam: 'Tom Schuurman', rol: 'Veiligheidscoördinator', team: 'Communicatie & Veiligheid', actiefDossiers: 1 },
    { id: 'm5', naam: 'Eva Hofland', rol: 'CRM Specialist', team: 'CRM', actiefDossiers: 0 }
  ],
  klantaccounts: [
    { id: 'k1', naam: 'Stichting Nieuw Begin', type: 'Stichting', contactpersoon: 'L. Mensink', gemeenteId: 'g1', financieelRisico: 'Midden', risicoscore: 58 },
    { id: 'k2', naam: 'Buurtkracht Zuid', type: 'Vereniging', contactpersoon: 'S. Al-Rahman', gemeenteId: 'g2', financieelRisico: 'Hoog', risicoscore: 82 },
    { id: 'k3', naam: 'JongTalent Delft', type: 'Stichting', contactpersoon: 'K. Vermeer', gemeenteId: 'g3', financieelRisico: 'Laag', risicoscore: 33 },
    { id: 'k4', naam: 'Samen Sterk Utrecht', type: 'Coöperatie', contactpersoon: 'M. de Jong', gemeenteId: 'g4', financieelRisico: 'Midden', risicoscore: 61 }
  ],
  gemeenten: [
    { id: 'g1', naam: 'Rotterdam', regio: 'Zuid-Holland' },
    { id: 'g2', naam: 'Amsterdam', regio: 'Noord-Holland' },
    { id: 'g3', naam: 'Delft', regio: 'Zuid-Holland' },
    { id: 'g4', naam: 'Utrecht', regio: 'Utrecht' }
  ],
  portalen: [
    { id: 'p1', naam: 'ImpactPortaal Basis', status: 'Actief', uptime: '99.92%' },
    { id: 'p2', naam: 'Gemeente Ketenkoppeling', status: 'Onderhoud', uptime: '98.70%' },
    { id: 'p3', naam: 'Inzage Dashboard Partner', status: 'Actief', uptime: '99.61%' }
  ],
  aanmeldingen: [
    { id: 'a1', klantId: 'k1', product: 'ImpactFonds Groei', bedrag: 42000, status: 'Nieuw', datum: '2026-04-08' },
    { id: 'a2', klantId: 'k2', product: 'ImpactFonds Start', bedrag: 28000, status: 'In behandeling', datum: '2026-04-05' },
    { id: 'a3', klantId: 'k3', product: 'ImpactFonds Plus', bedrag: 51000, status: 'Wacht op verificatie', datum: '2026-04-11' },
    { id: 'a4', klantId: 'k4', product: 'ImpactFonds Start', bedrag: 18000, status: 'Nieuw', datum: '2026-04-13' }
  ],
  verificaties: [
    {
      id: 'v1', aanmeldingId: 'a1', klantId: 'k1', status: 'Open', geclaimdDoor: null,
      score: 72, hardeBlokkades: [], ontbrekendeGegevens: ['Bankafschrift Q1'], deadlineDatum: '2026-04-24'
    },
    {
      id: 'v2', aanmeldingId: 'a2', klantId: 'k2', status: 'Actief', geclaimdDoor: 'm1',
      score: 49, hardeBlokkades: ['Sanctie-hit op UBO controle'], ontbrekendeGegevens: ['UBO-verklaring'], deadlineDatum: '2026-04-21'
    },
    {
      id: 'v3', aanmeldingId: 'a3', klantId: 'k3', status: 'Wacht op klant', geclaimdDoor: 'm4',
      score: 85, hardeBlokkades: [], ontbrekendeGegevens: ['Recent huurcontract'], deadlineDatum: '2026-04-22'
    },
    {
      id: 'v4', aanmeldingId: 'a4', klantId: 'k4', status: 'Open', geclaimdDoor: null,
      score: 65, hardeBlokkades: [], ontbrekendeGegevens: [], deadlineDatum: '2026-04-25'
    }
  ],
  communicatie: [
    { id: 'c1', klantId: 'k2', kanaal: 'E-mail', onderwerp: 'Aanvullende stukken nodig', datum: '2026-04-14T09:00:00Z', gelinktAanVerificatie: 'v2' },
    { id: 'c2', klantId: 'k3', kanaal: 'Chat', onderwerp: 'Vraag over huurcontract', datum: '2026-04-15T12:30:00Z', gelinktAanVerificatie: 'v3' }
  ],
  ticketsChats: [
    { id: 't1', klantId: 'k1', type: 'Ticket', onderwerp: 'Inlog MFA reset', prioriteit: 'Midden', status: 'Open' },
    { id: 't2', klantId: 'k2', type: 'Chat', onderwerp: 'Vragen over scoremodel', prioriteit: 'Hoog', status: 'Actief' }
  ],
  klantdossiers: [
    { id: 'd1', klantId: 'k1', notities: ['Jaarrekening ontvangen op 12 april'], interneSignalen: ['Groei in bezoekers +18%'] },
    { id: 'd2', klantId: 'k2', notities: ['Harde blokkade op UBO-check'], interneSignalen: ['Hoog financieel risico'] },
    { id: 'd3', klantId: 'k3', notities: ['Aanvullend huurcontract opgevraagd'], interneSignalen: ['Stabiele omzet'] },
    { id: 'd4', klantId: 'k4', notities: ['Nieuwe aanmelding in intake'], interneSignalen: ['Meerjarige subsidie loopt af Q3'] }
  ],
  abonnementenBetalingen: [
    { id: 'ab1', klantId: 'k1', abonnement: 'Premium Begeleiding', betaalstatus: 'Op tijd', openstaand: 0 },
    { id: 'ab2', klantId: 'k2', abonnement: 'Basis', betaalstatus: 'Achterstallig', openstaand: 1450 },
    { id: 'ab3', klantId: 'k3', abonnement: 'Premium Begeleiding', betaalstatus: 'Op tijd', openstaand: 0 },
    { id: 'ab4', klantId: 'k4', abonnement: 'Basis', betaalstatus: 'Op tijd', openstaand: 220 }
  ],
  bezoekers: [
    { id: 'b1', portaalId: 'p1', datum: '2026-04-15', aantal: 812 },
    { id: 'b2', portaalId: 'p2', datum: '2026-04-15', aantal: 177 },
    { id: 'b3', portaalId: 'p3', datum: '2026-04-15', aantal: 431 }
  ],
  gameData: [
    { id: 'gd1', klantId: 'k1', engagementScore: 78, module: 'Impact Challenge' },
    { id: 'gd2', klantId: 'k2', engagementScore: 41, module: 'Compliance Quest' },
    { id: 'gd3', klantId: 'k3', engagementScore: 67, module: 'Budgetsimulatie' }
  ],
  logs: [
    { id: 'l1', actor: 'm1', actie: 'Dossier v2 geclaimd', datum: '2026-04-14T08:31:00Z' },
    { id: 'l2', actor: 'systeem', actie: '5-werkdagen reminder gepland voor v3', datum: '2026-04-15T07:00:00Z' }
  ],
  hulpvragen: [
    { id: 'h1', van: 'm2', aanTeam: 'Operatie', type: 'Escalatie', onderwerp: 'Dubbele accountkoppeling k2', status: 'Open', datum: '2026-04-16' },
    { id: 'h2', van: 'm1', aanTeam: 'CRM', type: 'Dossierondersteuning', onderwerp: 'Controle historisch betalingsgedrag k1', status: 'In behandeling', datum: '2026-04-15' }
  ],
  planning: [
    { id: 'pl1', medewerkerId: 'm1', taak: 'Verificatiecheck v2', datum: '2026-04-18', blok: '09:00-11:00' },
    { id: 'pl2', medewerkerId: 'm3', taak: 'Operations stand-up', datum: '2026-04-18', blok: '11:30-12:00' },
    { id: 'pl3', medewerkerId: 'm4', taak: 'Veiligheid audit p2', datum: '2026-04-19', blok: '14:00-16:00' }
  ],
  vergaderingen: [
    { id: 'vg1', onderwerp: 'Risico-overleg hoogrisico dossiers', datum: '2026-04-18', deelnemers: ['m3', 'm4', 'm5'] },
    { id: 'vg2', onderwerp: 'Klantregie weekstart', datum: '2026-04-19', deelnemers: ['m2', 'm5'] }
  ],
  signalen: [
    { id: 's1', klantId: 'k2', type: 'Fraudewaarschuwing', niveau: 'Kritiek', bron: 'Extern register' },
    { id: 's2', klantId: 'k4', type: 'Betaalachterstand', niveau: 'Midden', bron: 'Intern finance' }
  ]
};

class Store {
  constructor() {
    this.state = this.#load();
    this.listeners = [];
  }

  #load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : deepClone(seededState);
    } catch (error) {
      console.warn('Kon state niet laden, seed wordt gebruikt', error);
      return deepClone(seededState);
    }
  }

  #save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
  }

  subscribe(callback) {
    this.listeners.push(callback);
    callback(this.state);
  }

  #notify() {
    this.#save();
    this.listeners.forEach((listener) => listener(this.state));
  }

  getState() {
    return this.state;
  }

  reset() {
    this.state = deepClone(seededState);
    this.#notify();
  }

  setActiveMedewerker(medewerkerId) {
    this.state.session.activeMedewerkerId = medewerkerId;
    this.#notify();
  }

  claimVerificatie(verificatieId) {
    const verificatie = this.state.verificaties.find((v) => v.id === verificatieId);
    const medewerkerId = this.state.session.activeMedewerkerId;
    const medewerker = this.state.medewerkers.find((m) => m.id === medewerkerId);
    if (!verificatie || !medewerker) return { ok: false, bericht: 'Onbekende aanvraag.' };
    if (verificatie.geclaimdDoor && verificatie.geclaimdDoor !== medewerkerId) {
      return { ok: false, bericht: 'Dit dossier is al geclaimd door een collega.' };
    }
    const actieve = this.state.verificaties.filter((v) => v.geclaimdDoor === medewerkerId && ['Actief', 'Wacht op klant'].includes(v.status)).length;
    if (actieve >= 3 && verificatie.geclaimdDoor !== medewerkerId) {
      return { ok: false, bericht: 'Maximaal 3 actieve dossiers per medewerker bereikt.' };
    }

    verificatie.geclaimdDoor = medewerkerId;
    verificatie.status = 'Actief';
    medewerker.actiefDossiers = Math.min(3, actieve + 1);

    const klant = this.state.klantaccounts.find((k) => k.id === verificatie.klantId);
    const onderwerp = `Uw verificatie wordt behandeld door ${medewerker.naam}`;
    this.state.communicatie.unshift({
      id: `c${Date.now()}`,
      klantId: verificatie.klantId,
      kanaal: 'E-mail',
      onderwerp,
      datum: nowIso(),
      gelinktAanVerificatie: verificatie.id
    });

    const dossier = this.state.klantdossiers.find((d) => d.klantId === verificatie.klantId);
    if (dossier) {
      dossier.notities.unshift(`Persoonlijke claimmail verstuurd aan ${klant?.contactpersoon || 'klant'} door ${medewerker.naam}.`);
    }

    this.state.logs.unshift({
      id: `l${Date.now()}`,
      actor: medewerkerId,
      actie: `Dossier ${verificatie.id} geclaimd en e-mail verzonden`,
      datum: nowIso()
    });

    this.#notify();
    return { ok: true, bericht: 'Dossier succesvol geclaimd en klant geïnformeerd.' };
  }

  updateVerificatieStatus(verificatieId, status, extraNotitie = '') {
    const verificatie = this.state.verificaties.find((v) => v.id === verificatieId);
    if (!verificatie) return;

    const aanmelding = this.state.aanmeldingen.find((a) => a.id === verificatie.aanmeldingId);
    const huidigeGebruiker = this.state.session.activeMedewerkerId;

    verificatie.status = status;
    if (aanmelding) {
      const mapping = {
        'Actief': 'In verificatie',
        'Goedgekeurd': 'Goedgekeurd',
        'Afgewezen': 'Afgewezen',
        'Wacht op klant': 'Aanvullende info gevraagd',
        'Stopgezet wegens geen reactie': 'Stopgezet'
      };
      aanmelding.status = mapping[status] || aanmelding.status;
    }

    if (status === 'Stopgezet wegens geen reactie') {
      verificatie.onderbrekingReden = 'Klant reageerde niet binnen 5 werkdagen op aanvullende uitvraag';
    }

    if (extraNotitie) {
      const dossier = this.state.klantdossiers.find((d) => d.klantId === verificatie.klantId);
      dossier?.notities.unshift(extraNotitie);
    }

    this.state.logs.unshift({
      id: `l${Date.now()}`,
      actor: huidigeGebruiker,
      actie: `Status ${verificatie.id} gewijzigd naar ${status}`,
      datum: nowIso()
    });

    this.#notify();
  }

  sendAanvullendeInfo(verificatieId, templateNaam) {
    const verificatie = this.state.verificaties.find((v) => v.id === verificatieId);
    const medewerker = this.state.medewerkers.find((m) => m.id === this.state.session.activeMedewerkerId);
    if (!verificatie || !medewerker) return;

    verificatie.status = 'Wacht op klant';
    const onderwerp = `Aanvullende informatie nodig (${templateNaam})`;
    this.state.communicatie.unshift({
      id: `c${Date.now()}`,
      klantId: verificatie.klantId,
      kanaal: 'E-mail',
      onderwerp,
      datum: nowIso(),
      gelinktAanVerificatie: verificatie.id
    });

    const dossier = this.state.klantdossiers.find((d) => d.klantId === verificatie.klantId);
    dossier?.notities.unshift(`${medewerker.naam} verstuurde template '${templateNaam}' met 5-werkdagenregel.`);

    this.state.logs.unshift({
      id: `l${Date.now()}`,
      actor: medewerker.id,
      actie: `Template ${templateNaam} verzonden voor ${verificatie.id}`,
      datum: nowIso()
    });

    this.#notify();
  }

  markeerHulpvraagAf(hulpvraagId) {
    const item = this.state.hulpvragen.find((h) => h.id === hulpvraagId);
    if (!item) return;
    item.status = 'Afgerond';
    this.state.logs.unshift({ id: `l${Date.now()}`, actor: this.state.session.activeMedewerkerId, actie: `Hulpvraag ${hulpvraagId} afgerond`, datum: nowIso() });
    this.#notify();
  }
}

export const store = new Store();
