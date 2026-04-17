import { store } from './store.js';

const app = document.querySelector('#app');
const nav = document.querySelector('#main-nav');
const rolSelect = document.querySelector('#rolSelect');
const resetBtn = document.querySelector('#resetState');
const modal = document.querySelector('#modal');
const drawer = document.querySelector('#drawer');

const sections = [
  'overzicht',
  'aanmeldingen',
  'verificaties',
  'portaalbeheer',
  'communicatie',
  'crm',
  'operatie'
];

let currentSection = 'overzicht';
let cachedState = null;

const euro = (val) => new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

const getMedewerker = (state, id) => state.medewerkers.find((m) => m.id === id);
const getKlant = (state, id) => state.klantaccounts.find((k) => k.id === id);
const getDossier = (state, klantId) => state.klantdossiers.find((d) => d.klantId === klantId);

function initNavigation() {
  nav.innerHTML = sections.map((key) => `<button data-section="${key}" class="nav-btn ${key === currentSection ? 'active' : ''}">${labelForSection(key)}</button>`).join('');
  nav.addEventListener('click', (event) => {
    const btn = event.target.closest('button[data-section]');
    if (!btn) return;
    currentSection = btn.dataset.section;
    initNavigation();
    render(cachedState);
  });
}

function labelForSection(key) {
  return {
    overzicht: 'Overzicht',
    aanmeldingen: 'Aanmeldingen',
    verificaties: 'Verificaties',
    portaalbeheer: 'Portaalbeheer & Klantregie',
    communicatie: 'Communicatie & Veiligheid',
    crm: 'CRM & Klantdossiers',
    operatie: 'Personeel, Planning & Operatie'
  }[key];
}

function seedRoleOptions(state) {
  rolSelect.innerHTML = state.medewerkers.map((m) => `<option value="${m.id}">${m.naam} · ${m.rol}</option>`).join('');
  rolSelect.value = state.session.activeMedewerkerId;
}

function metrics(state) {
  const openVerificaties = state.verificaties.filter((v) => v.status === 'Open').length;
  const hoogRisico = state.klantaccounts.filter((k) => k.financieelRisico === 'Hoog').length;
  const openHulpvragen = state.hulpvragen.filter((h) => h.status !== 'Afgerond').length;
  const ticketsOpen = state.ticketsChats.filter((t) => t.status !== 'Afgerond').length;
  return { openVerificaties, hoogRisico, openHulpvragen, ticketsOpen };
}

function renderOverzicht(state) {
  const m = metrics(state);
  return `
    <section class="grid cols-4">
      <article class="card"><h3>Open verificaties</h3><p class="metric">${m.openVerificaties}</p></article>
      <article class="card"><h3>Hoog financieel risico</h3><p class="metric danger">${m.hoogRisico}</p></article>
      <article class="card"><h3>Open hulpvragen</h3><p class="metric">${m.openHulpvragen}</p></article>
      <article class="card"><h3>Actieve tickets/chats</h3><p class="metric">${m.ticketsOpen}</p></article>
    </section>
    <section class="card">
      <h3>Statusflow aanmeldingen ↔ verificaties ↔ CRM</h3>
      <table><thead><tr><th>Aanmelding</th><th>Klant</th><th>Status</th><th>Risico</th><th>Verificatie</th></tr></thead>
      <tbody>
      ${state.aanmeldingen.map((a) => {
        const klant = getKlant(state, a.klantId);
        const ver = state.verificaties.find((v) => v.aanmeldingId === a.id);
        return `<tr><td>${a.id}</td><td>${klant?.naam}</td><td>${a.status}</td><td>${klant?.financieelRisico} (${klant?.risicoscore})</td><td>${ver?.status || '-'}</td></tr>`;
      }).join('')}
      </tbody></table>
    </section>
  `;
}

function renderAanmeldingen(state) {
  return `<section class="card"><h3>Aanmeldingen</h3>
  <table><thead><tr><th>ID</th><th>Klant</th><th>Product</th><th>Bedrag</th><th>Status</th><th>Actie</th></tr></thead>
  <tbody>
    ${state.aanmeldingen.map((a) => `<tr>
      <td>${a.id}</td><td>${getKlant(state, a.klantId)?.naam}</td><td>${a.product}</td><td>${euro(a.bedrag)}</td><td>${a.status}</td>
      <td><button class="link" data-open-drawer="${a.klantId}">Klantcontext</button></td>
    </tr>`).join('')}
  </tbody></table></section>`;
}

function renderVerificaties(state) {
  const me = state.session.activeMedewerkerId;
  const mijnClaims = state.verificaties.filter((v) => v.geclaimdDoor === me);
  const presets = ['Financiële onderbouwing', 'UBO/KYC bevestiging', 'Contract- en huurbewijs'];

  return `
    <section class="grid cols-2">
      <article class="card">
        <h3>Open verificaties</h3>
        <table><thead><tr><th>Dossier</th><th>Klant</th><th>Score</th><th>Blokkade</th><th>Acties</th></tr></thead><tbody>
        ${state.verificaties.map((v) => `
          <tr>
            <td>${v.id}</td>
            <td>${getKlant(state, v.klantId)?.naam}</td>
            <td>${v.score}/100</td>
            <td>${v.hardeBlokkades.length ? 'Ja' : 'Nee'}</td>
            <td>
              <button ${v.geclaimdDoor && v.geclaimdDoor !== me ? 'disabled' : ''} data-claim="${v.id}">Claim</button>
              <button ${v.geclaimdDoor !== me ? 'disabled' : ''} data-status="${v.id}">Behandel</button>
              <button ${v.geclaimdDoor !== me ? 'disabled' : ''} data-template="${v.id}">Template mail</button>
            </td>
          </tr>
        `).join('')}
        </tbody></table>
        <p class="hint">Regels: eerst claimen, max 3 actieve dossiers, scoremodel + harde blokkades.</p>
      </article>
      <article class="card">
        <h3>Mijn geclaimde aanvragen</h3>
        <ul class="list">
          ${mijnClaims.map((v) => `<li><strong>${v.id}</strong> · ${getKlant(state, v.klantId)?.naam} · ${v.status} · deadline ${v.deadlineDatum}</li>`).join('') || '<li>Geen claims.</li>'}
        </ul>
        <h4>Templates/presets</h4>
        <div class="tags">${presets.map((p) => `<span>${p}</span>`).join('')}</div>
      </article>
    </section>
  `;
}

function renderPortaalbeheer(state) {
  return `
  <section class="grid cols-2">
    <article class="card"><h3>Portaalstatus</h3>
      <table><thead><tr><th>Portaal</th><th>Status</th><th>Uptime</th><th>Bezoekers</th></tr></thead><tbody>
      ${state.portalen.map((p) => {
        const bezoekers = state.bezoekers.find((b) => b.portaalId === p.id);
        return `<tr><td>${p.naam}</td><td>${p.status}</td><td>${p.uptime}</td><td>${bezoekers?.aantal || 0}</td></tr>`;
      }).join('')}
      </tbody></table>
    </article>
    <article class="card"><h3>Klantregie signalen</h3><ul class="list">
      ${state.signalen.map((s) => `<li>${getKlant(state, s.klantId)?.naam} · ${s.type} · <strong>${s.niveau}</strong></li>`).join('')}
    </ul></article>
  </section>`;
}

function renderCommunicatie(state) {
  return `<section class="grid cols-2">
  <article class="card"><h3>Communicatiehistorie</h3><table><thead><tr><th>Datum</th><th>Klant</th><th>Kanaal</th><th>Onderwerp</th></tr></thead><tbody>
  ${state.communicatie.map((c) => `<tr><td>${new Date(c.datum).toLocaleString('nl-NL')}</td><td>${getKlant(state, c.klantId)?.naam}</td><td>${c.kanaal}</td><td>${c.onderwerp}</td></tr>`).join('')}
  </tbody></table></article>
  <article class="card"><h3>Veiligheid en tickets</h3><ul class="list">
  ${state.ticketsChats.map((t) => `<li>${t.type} · ${getKlant(state, t.klantId)?.naam} · ${t.onderwerp} · ${t.prioriteit}</li>`).join('')}
  </ul></article>
  </section>`;
}

function renderCRM(state) {
  return `<section class="card"><h3>CRM & Klantdossiers</h3><table><thead><tr><th>Klant</th><th>Financieel profiel</th><th>Abonnement</th><th>Dossier</th></tr></thead><tbody>
  ${state.klantaccounts.map((k) => {
    const abo = state.abonnementenBetalingen.find((a) => a.klantId === k.id);
    const dossier = getDossier(state, k.id);
    return `<tr>
      <td>${k.naam}</td>
      <td>${k.financieelRisico} (${k.risicoscore})</td>
      <td>${abo?.abonnement} · ${abo?.betaalstatus}</td>
      <td><button class="link" data-open-drawer="${k.id}">Open dossier</button> <button class="link" data-open-context="${k.id}">Financiële context</button></td>
    </tr>`;
  }).join('')}
  </tbody></table></section>`;
}

function renderOperatie(state) {
  return `<section class="grid cols-2">
  <article class="card"><h3>Personeelsoverzicht + hulpvragen</h3>
  <table><thead><tr><th>Medewerker</th><th>Team</th><th>Actieve dossiers</th></tr></thead><tbody>
  ${state.medewerkers.map((m) => `<tr><td>${m.naam}</td><td>${m.team}</td><td>${m.actiefDossiers}</td></tr>`).join('')}</tbody></table>
  <h4>Interne hulpvragen</h4><ul class="list">
  ${state.hulpvragen.map((h) => `<li>${h.onderwerp} · ${h.aanTeam} · ${h.status} ${h.status !== 'Afgerond' ? `<button data-hulp-af="${h.id}">Markeer afgerond</button>` : ''}</li>`).join('')}
  </ul>
  </article>
  <article class="card"><h3>Operationele inbox</h3><ul class="list">${state.hulpvragen.filter((h) => h.status !== 'Afgerond').map((h) => `<li>${h.type} van ${h.van}: ${h.onderwerp}</li>`).join('') || '<li>Leeg.</li>'}</ul>
  <h4>Planning & vergaderingen</h4><ul class="list">${state.planning.map((p) => `<li>${p.datum} ${p.blok} · ${getMedewerker(state, p.medewerkerId)?.naam} · ${p.taak}</li>`).join('')}
  ${state.vergaderingen.map((v) => `<li>${v.datum} · ${v.onderwerp}</li>`).join('')}</ul></article>
  </section>`;
}

function render(state) {
  cachedState = state;
  const views = {
    overzicht: renderOverzicht,
    aanmeldingen: renderAanmeldingen,
    verificaties: renderVerificaties,
    portaalbeheer: renderPortaalbeheer,
    communicatie: renderCommunicatie,
    crm: renderCRM,
    operatie: renderOperatie
  };

  app.innerHTML = views[currentSection](state);
}

function openModal(title, body, actions = []) {
  modal.innerHTML = `<div class="modal-content"><h3>${title}</h3>${body}<div class="modal-actions">${actions.join('')}</div><button class="secondary" data-close-modal>Sluiten</button></div>`;
  modal.classList.add('open');
}

function openDrawer(klantId) {
  const state = store.getState();
  const klant = getKlant(state, klantId);
  const dossier = getDossier(state, klantId);
  const abon = state.abonnementenBetalingen.find((a) => a.klantId === klantId);
  drawer.innerHTML = `<div class="drawer-content"><h3>${klant.naam}</h3>
  <p><strong>Contact:</strong> ${klant.contactpersoon}</p>
  <p><strong>Financieel risico:</strong> ${klant.financieelRisico} (${klant.risicoscore})</p>
  <p><strong>Abonnement:</strong> ${abon?.abonnement} · ${abon?.betaalstatus}</p>
  <h4>Dossiernotities</h4><ul>${dossier?.notities.map((n) => `<li>${n}</li>`).join('') || '<li>Geen notities</li>'}</ul>
  <h4>Interne signalen</h4><ul>${dossier?.interneSignalen.map((s) => `<li>${s}</li>`).join('') || '<li>Geen signalen</li>'}</ul>
  <button data-close-drawer>Sluiten</button></div>`;
  drawer.classList.add('open');
}

document.body.addEventListener('click', (event) => {
  const claimId = event.target.getAttribute('data-claim');
  const statusId = event.target.getAttribute('data-status');
  const templateId = event.target.getAttribute('data-template');
  const klantId = event.target.getAttribute('data-open-drawer') || event.target.getAttribute('data-open-context');
  const closeModal = event.target.hasAttribute('data-close-modal');
  const closeDrawer = event.target.hasAttribute('data-close-drawer');
  const hulpAf = event.target.getAttribute('data-hulp-af');

  if (claimId) {
    const result = store.claimVerificatie(claimId);
    openModal('Claimresultaat', `<p>${result.bericht}</p>`);
  }

  if (statusId) {
    openModal('Status wijzigen', `<p>Kies nieuwe status voor ${statusId}</p>`, [
      `<button data-set-status="${statusId}" data-value="Goedgekeurd">Goedkeuren</button>`,
      `<button data-set-status="${statusId}" data-value="Afgewezen">Afwijzen</button>`,
      `<button data-set-status="${statusId}" data-value="Stopgezet wegens geen reactie">Stopzetten (5 werkdagen)</button>`
    ]);
  }

  if (event.target.hasAttribute('data-set-status')) {
    const id = event.target.getAttribute('data-set-status');
    const value = event.target.getAttribute('data-value');
    store.updateVerificatieStatus(id, value, `Status aangepast naar ${value}.`);
    modal.classList.remove('open');
  }

  if (templateId) {
    openModal('Template voor aanvullende informatie', '<p>Kies een preset voor e-mail met 5-werkdagenregel.</p>', [
      `<button data-send-template="${templateId}" data-template-name="Financiële onderbouwing">Financiële onderbouwing</button>`,
      `<button data-send-template="${templateId}" data-template-name="UBO/KYC bevestiging">UBO/KYC bevestiging</button>`,
      `<button data-send-template="${templateId}" data-template-name="Contract- en huurbewijs">Contract- en huurbewijs</button>`
    ]);
  }

  if (event.target.hasAttribute('data-send-template')) {
    store.sendAanvullendeInfo(event.target.getAttribute('data-send-template'), event.target.getAttribute('data-template-name'));
    modal.classList.remove('open');
  }

  if (klantId) openDrawer(klantId);
  if (closeModal) modal.classList.remove('open');
  if (closeDrawer) drawer.classList.remove('open');
  if (hulpAf) store.markeerHulpvraagAf(hulpAf);
});

rolSelect.addEventListener('change', () => store.setActiveMedewerker(rolSelect.value));
resetBtn.addEventListener('click', () => store.reset());

store.subscribe((state) => {
  seedRoleOptions(state);
  render(state);
});

initNavigation();
