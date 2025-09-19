    
  (() => {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {

    /////////////////////////////////////////////////////////////////////////
    // 1. SOULIGNER PAJ AKTIF NAN MENU
    /////////////////////////////////////////////////////////////////////////
    const highlightCurrentMenuLink = () => {
      const links = document.querySelectorAll('.menu-s a');
      const currentPage = window.location.pathname.split('/').pop();
      links.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
          link.classList.add('active');
        }
      });
    };

    /////////////////////////////////////////////////////////////////////////
    // 2. MENU RESPONSIVE
    /////////////////////////////////////////////////////////////////////////
    const initResponsiveMenu = () => {
      const menuToggle = document.getElementById('menu-toggle');
      const navLinks = document.getElementById('nav-links');
      if(!menuToggle||!navLinks) return;

      menuToggle.addEventListener('click',()=>navLinks.classList.toggle('open'));
      document.addEventListener('click',e=>{ if(!navLinks.contains(e.target)&&!menuToggle.contains(e.target)) navLinks.classList.remove('open');});
      navLinks.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>navLinks.classList.remove('open')));
    };

    ///////////////////////////////////////////////////////////////////////////
    // MODULE 3 : FORMULAIRE DE RÉSERVATION - VALIDATION & SOUMISSION
    ///////////////////////////////////////////////////////////////////////////

      const initReservationForm = () => {
      const form = document.getElementById('reservationForm');
      const selectType = document.getElementById('type_reservation');
      const chambreOptions = document.getElementById('chambreOptions');
      const chambresList = document.getElementById('chambresList');
      const addChambreBtn = document.getElementById('addChambreBtn');
      const inputArrivee = document.getElementById('arrivee');
      const inputDepart = document.getElementById('depart');
      const paymentRadios = document.querySelectorAll('input[name="payment"]');
      const paymentInfo = document.getElementById('paymentInfo');
      const sumNuitsEl = document.getElementById('sumNuits');
      const sumTotalEl = document.getElementById('sumNuitTotal');
      const sumCurrencyEl = document.getElementById('sumCurrency');
      const hiddenAmount = document.getElementById('amount');
      const hiddenCurrency = document.getElementById('currency');
      const summaryNuitsEl   = document.getElementById('summaryNuits');
      const summaryEventsEl  = document.getElementById('summaryEvents');
      const summaryAutreEl   = document.getElementById('summaryAutre');
      const sumGrandTotalEl  = document.getElementById('sumGrandTotal');
      const addServiceBtn = document.getElementById("addServiceBtn");
      const servicesList = document.getElementById("servicesList");
      const serviceOptionsDiv = document.getElementById("serviceOptions");
      const cardElementContainer = document.getElementById("cardElementContainer");

      if (!form || !selectType || !chambreOptions || !chambresList) return;

      // -------------------------------
      // SECTION 1 : CHAMBRES
      // -------------------------------
      chambreOptions.style.display = 'none';
      selectType.addEventListener('change', () => {
        chambreOptions.style.display = (selectType.value === 'chambre') ? 'block' : 'none';
        chambresList.innerHTML = '';
      });

      function createChambreRow() {
        const row = document.createElement('div'); row.className = 'chambre-row';

        const select = document.createElement('select');
        select.name = 'type_chambre[]'; select.required = true;

        const options = [
          { value: '', text: '-- Sélectionnez --', disabled: true, selected: true, hidden: true },
          { value: 'Standard', text: 'Standard' },
          { value: 'Luxe', text: 'Luxe' },
          { value: 'Suite', text: 'Suite' }
        ];
        options.forEach(opt => {
          const option = document.createElement('option');
          option.value = opt.value; option.textContent = opt.text;
          if(opt.disabled) option.disabled = true;
          if(opt.selected) option.selected = true;
          if(opt.hidden) option.hidden = true;
          select.appendChild(option);
        });

        const inputQty = document.createElement('input');
        inputQty.type = 'number'; inputQty.name = 'quantite_chambre[]';
        inputQty.min = 1; inputQty.value = 1; inputQty.required = true;

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button'; removeBtn.className = 'removeChambreBtn';
        removeBtn.textContent = '❌'; removeBtn.title = 'Retirer cette chambre';
        removeBtn.addEventListener('click', () => {
          row.remove();
          updateSummary(); // <- ajoute sa pou rafrechi total la
        });

        row.append(select, inputQty, removeBtn);
        return row;
      }

      addChambreBtn.addEventListener('click', () => {
        chambresList.appendChild(createChambreRow());
        setTimeout(recomputeTotal, 0);
      });

      // -------------------------------
      // SECTION 2 : VALIDATION VISUELLE
      // -------------------------------
      const inputs = form.querySelectorAll('input, select, textarea');
      inputs.forEach(input => {
        input.addEventListener('input', () => {
          input.style.borderColor = input.checkValidity() ? '#28a745' : '#dc3545';
        });
      });


      // -------------------------------
      // SECTION 3 : Services Options
      // -------------------------------

      selectType.addEventListener("change", () => {
        serviceOptionsDiv.style.display = (selectType.value === "service") ? 'block' : 'none';
        servicesList.innerHTML = '';
      });

      function createServiceRow() {
        const row = document.createElement("div"); 
        row.className = "service-row";

        const select = document.createElement("select"); 
        select.name = "type_service[]"; 
        select.required = true;

        const options = [
          { value: "", text: "-- Sélectionnez un service --", disabled: true, selected: true, hidden: true },
          { value: "spa", text: "Spa & Bien-être" },
          { value: "restaurant", text: "Restaurant privé" },
          { value: "chauffeur", text: "Chauffeur privé" }
        ];
        options.forEach(opt => {
          const option = document.createElement("option");
          option.value = opt.value; option.textContent = opt.text;
          if(opt.disabled) option.disabled = true;
          if(opt.selected) option.selected = true;
          if(opt.hidden) option.hidden = true;
          select.appendChild(option);
        });

        const inputQty = document.createElement("input"); 
        inputQty.type = "number";
        inputQty.name = "quantite_service[]"; 
        inputQty.min = 1; inputQty.value = 1; 
        inputQty.required = true;

        const removeBtn = document.createElement("button");
        removeBtn.type = "button"; 
        removeBtn.className = "removeServiceBtn";
        removeBtn.textContent = "❌"; 
        removeBtn.title = "Retirer ce service";
        removeBtn.addEventListener("click", () => { 
          row.remove();
          updateSummary(); // refresh total
        });

        row.append(select, inputQty, removeBtn);
        return row;
      }

      addServiceBtn.addEventListener("click", () => {
        servicesList.appendChild(createServiceRow());
        setTimeout(updateSummary, 0);
      });

      // -------------------------------
      // SECTION 4 : ÉVÉNEMENTS
      // -------------------------------
      const EVENTS_OPTIONS = [
        { value: "", text: "-- Sélectionnez un type d'événement --", disabled: true, selected: true, hidden: true },
        { value: "mariage", text: "Mariage - Cérémonie et réception complète" },
        { value: "reunion", text: "Réunion d'affaires - Salle équipée et services inclus" },
        { value: "anniversaire", text: "Anniversaire - Ambiance festive, décor inclus" },
        { value: "cocktail", text: "Cocktail - Service boissons et amuse-bouches" },
        { value: "autre", text: "Autre service - Décrivez votre besoin spécifique" },
      ];

      const addEventBtn = document.getElementById("addEventBtn");
      const eventsList = document.getElementById("eventsList");
      const eventOptionsDiv = document.getElementById("eventOptions");

      selectType.addEventListener("change", () => {
        eventOptionsDiv.style.display = (selectType.value === "evenement") ? 'block' : 'none';
        eventsList.innerHTML = '';
      });

      function createEventRow() {
        const row = document.createElement("div"); row.className = "event-row";

        const select = document.createElement("select"); select.name = "type_evenement[]"; select.required = true;
        EVENTS_OPTIONS.forEach(opt => {
          const option = document.createElement("option");
          option.value = opt.value; option.textContent = opt.text;
          if(opt.disabled) option.disabled = true;
          if(opt.selected) option.selected = true;
          if(opt.hidden) option.hidden = true;
          select.appendChild(option);
        });

        const inputQty = document.createElement("input"); inputQty.type = "number";
        inputQty.name = "quantite_evenement[]"; inputQty.min = 1; inputQty.value = 1; inputQty.required = true;

        const removeBtn = document.createElement("button");
        removeBtn.type = "button"; removeBtn.className = "removeEventBtn";
        removeBtn.textContent = "❌"; removeBtn.title = "Retirer cet événement";
        removeBtn.addEventListener("click", () => {
          row.remove();
          updateSummary(); // <- ajoute sa tou
        });


        row.append(select, inputQty, removeBtn);
        return row;
      }

      addEventBtn.addEventListener("click", () => eventsList.appendChild(createEventRow()));

      // -------------------------------
      // SECTION 5 : AUTRE SERVICE
      // -------------------------------
      const autreDiv = document.getElementById('autreServiceDiv');
      const removeAutreServiceBtn = document.getElementById('removeAutreServiceBtn');
      selectType.addEventListener('change', () => autreDiv.style.display = (selectType.value === 'autre') ? 'block' : 'none');
      removeAutreServiceBtn.addEventListener('click', () => document.getElementById('autreService').value = '');

      // -------------------------------
      // SECTION 6 : TARIFS & CALCUL
      // -------------------------------
      const CURRENCY = 'USD';
      const RATES = { 'Standard': 80, 'Luxe': 120, 'Suite': 180 };
      const SERVICE_RATES = { spa: 100, restaurant: 80, chauffeur: 150 };

      hiddenCurrency.value = CURRENCY; 
      sumCurrencyEl.textContent = CURRENCY;

      function getServicePrice(type) {
        return SERVICE_RATES[type] || 0; // <- itilize nouvo konst
      }

      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '';

      const parseISO = str => isNaN(new Date(str)) ? null : new Date(str);
      const diffNights = (d1,d2) => Math.max(0, Math.round((d2-d1)/(24*60*60*1000)));
      const formatMoney = x => Number(x).toFixed(2);

      const getNuits = () => {
        const a = parseISO(inputArrivee.value);
        const d = parseISO(inputDepart.value);
        return (!a || !d) ? 0 : diffNights(a,d);
      };

      const getRoomsTotal = () => {
        let total = 0;
        chambresList.querySelectorAll('.chambre-row').forEach(row => {
          const type = row.querySelector('select')?.value || '';
          const qty = parseInt(row.querySelector('input[type="number"]')?.value || '0',10);
          total += (RATES[type]||0) * Math.max(0, qty);
        });
        return total;
      };

      const recomputeTotal = () => {
        const nuits = getNuits();
        const perNight = getRoomsTotal();
        const grandTotal = nuits * perNight;
        sumNuitsEl.textContent = nuits;
        sumTotalEl.textContent = formatMoney(grandTotal);
        hiddenAmount.value = formatMoney(grandTotal);
      };

// -------------------------------
// SECTION 6b : RÉSUMÉ DYNAMIQUE & TOTAL GLOBAL
// -------------------------------

function getEventPrice(type) {
  const prices = { mariage: 500, reunion: 300, anniversaire: 200, cocktail: 150, autre: 100 };
  return prices[type] || 0;
}

function getAutrePrice(value) {
  return 120; // ou personnaliser selon texte
}

function updateSummary() {
  // Guard: si pa gen type chwazi, kache & netwaye rezime epi sòti
  if (!selectType || !selectType.value) {
    [summaryNuitsEl, summaryEventsEl, document.getElementById('summaryServices'), summaryAutreEl].forEach(el => {
      if (el) el.style.display = 'none';
    });
    ['summaryNuitDetails','summaryEventDetails','summaryServiceDetails','summaryAutreDetails'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = '';
    });
    if (sumGrandTotalEl) sumGrandTotalEl.textContent = '0.00';
    if (hiddenAmount) hiddenAmount.value = '0';
    return;
  }

  const type = selectType.value;

  // --- Nuits ---
  let totalNuit = 0;
  if(type==='chambre') {
    const nuits = getNuits();
    totalNuit = nuits * getRoomsTotal();
    if(totalNuit>0){
      summaryNuitsEl.style.display='block';
      document.getElementById('sumNuits').textContent = getNuits();
      document.getElementById('sumNuitTotal').textContent = totalNuit.toFixed(2);
      // --- Détails Nuits ---
      const summaryNuitDetails = document.getElementById("summaryNuitDetails");
      summaryNuitDetails.innerHTML = "";
      chambresList.querySelectorAll(".chambre-row").forEach(row => {
        const type = row.querySelector("select").value;
        const qty = parseInt(row.querySelector("input[type='number']").value) || 0;
        const prixUnit = RATES[type] || 0;
        if (qty > 0) {
          summaryNuitDetails.innerHTML += `
            <div class="summary-detail-row">
              <span>${type} × ${qty}</span>
              <strong>${(prixUnit * qty * getNuits()).toFixed(2)} ${CURRENCY}</strong>
            </div>`;
        }
      });
    } else summaryNuitsEl.style.display='none';
  } else summaryNuitsEl.style.display='none';

  // --- Événements ---
  let totalEvents = 0;
  const eventRows = document.querySelectorAll('#eventsList .event-row');
  if(type==='evenement' && eventRows.length>0){
    summaryEventsEl.style.display='block';
    eventRows.forEach(row=>{
      const t = row.querySelector('select')?.value||'';
      const qty = parseInt(row.querySelector('input[type="number"]')?.value||'0',10);
      totalEvents += getEventPrice(t)*qty;
    });
    document.getElementById('sumEvents').textContent = eventRows.length;
    document.getElementById('sumEventsTotal').textContent = totalEvents.toFixed(2);
    // --- Détails Événements ---
    const summaryEventDetails = document.getElementById("summaryEventDetails");
    summaryEventDetails.innerHTML = "";
    eventRows.forEach(row => {
      const t = row.querySelector("select").value;
      const qty = parseInt(row.querySelector("input[type='number']").value) || 0;
      const prixUnit = getEventPrice(t);
      if (qty > 0) {
        summaryEventDetails.innerHTML += `
          <div class="summary-detail-row">
            <span>${t} × ${qty}</span>
            <strong>${(prixUnit * qty).toFixed(2)} ${CURRENCY}</strong>
          </div>`;
      }
    });
  } else summaryEventsEl.style.display='none';

  // --- Services spéciaux ---
  let totalServices = 0;
  const serviceRows = document.querySelectorAll('#servicesList .service-row');
  if(type==='service' && serviceRows.length>0){
    document.getElementById('summaryServices').style.display='block';
    serviceRows.forEach(row=>{
      const t = row.querySelector('select')?.value||'';
      const qty = parseInt(row.querySelector('input[type="number"]')?.value||'0',10);
      totalServices += getServicePrice(t)*qty;
    });
    document.getElementById('sumServices').textContent = serviceRows.length;
    document.getElementById('sumServicesTotal').textContent = totalServices.toFixed(2);
    // --- Détails Services ---
    const summaryServiceDetails = document.getElementById("summaryServiceDetails");
    summaryServiceDetails.innerHTML = "";
    serviceRows.forEach(row => {
      const t = row.querySelector("select").value;
      const qty = parseInt(row.querySelector("input[type='number']").value) || 0;
      const prixUnit = getServicePrice(t);
      if (qty > 0) {
        summaryServiceDetails.innerHTML += `
          <div class="summary-detail-row">
            <span>${t} × ${qty}</span>
            <strong>${(prixUnit * qty).toFixed(2)} ${CURRENCY}</strong>
          </div>`;
      }
    });
  } else document.getElementById('summaryServices').style.display='none';

  // --- Autre service ---
  let totalAutre = 0;
  const autreVal = document.getElementById('autreService')?.value||'';
  if(type==='autre' && autreVal.trim()!==''){
    summaryAutreEl.style.display='block';
    totalAutre = getAutrePrice(autreVal);
    document.getElementById('sumAutre').textContent = 1;
    document.getElementById('sumAutreTotal').textContent = totalAutre.toFixed(2);
  // --- Détails Autre ---
  const summaryAutreDetails = document.getElementById("summaryAutreDetails");
  summaryAutreDetails.innerHTML = `
    <div class="summary-detail-row">
      <span>${autreVal}</span>
      <strong>${getAutrePrice(autreVal).toFixed(2)} ${CURRENCY}</strong>
    </div>`;
  } else summaryAutreEl.style.display='none';

  // --- Montant total ---
  const grandTotal = totalNuit + totalEvents + totalServices + totalAutre;
    sumGrandTotalEl.textContent = grandTotal.toFixed(2);
    hiddenAmount.value = grandTotal.toFixed(2);
  }


// --- Mise à jour dynamique ---
form.addEventListener('input', updateSummary);
addChambreBtn?.addEventListener('click', () => setTimeout(updateSummary, 0));
addEventBtn?.addEventListener('click', () => setTimeout(updateSummary, 0));
removeAutreServiceBtn?.addEventListener('click', () => setTimeout(updateSummary, 0));

// --- Initialiser ---
updateSummary();

      [inputArrivee,inputDepart].forEach(el => el.addEventListener('change', recomputeTotal));
      chambresList.addEventListener('input', recomputeTotal);
      recomputeTotal();

// -------------------------------
// SECTION 7 : INFO PAIEMENT
// -------------------------------
const descriptions = {
  paypal: `
    <p><strong>PayPal :</strong> Rapide et sécurisé. Vous serez redirigé vers PayPal pour confirmer.</p>
    <label>Email PayPal</label>
    <input type="email" name="paypalEmail" placeholder="exemple@paypal.com" required />
  `,
  visa: `
    <p><strong>Visa :</strong> Entrez vos informations de carte Visa.</p>
    <label>Numéro de carte</label>
    <input type="text" name="visaCard" placeholder="1234 5678 9012 3456" required />
    <label>Date d'expiration</label>
    <input type="text" name="visaExpiry" placeholder="MM/AA" required />
    <label>CVV</label>
    <input type="password" name="visaCVV" placeholder="***" required />
  `,
  mastercard: `
    <p><strong>MasterCard :</strong> Entrez vos informations de carte MasterCard.</p>
    <label>Numéro de carte</label>
    <input type="text" name="mcCard" placeholder="1234 5678 9012 3456" required />
    <label>Date d'expiration</label>
    <input type="text" name="mcExpiry" placeholder="MM/AA" required />
    <label>CVV</label>
    <input type="password" name="mcCVV" placeholder="***" required />
  `,
  moncash: `
    <p><strong>MonCash :</strong> Paiement mobile rapide et pratique.</p>
    <label>Numéro de téléphone MonCash</label>
    <input type="tel" name="moncashPhone" placeholder="+509 1234-5678" required />
  `,
  natcash: `
    <p><strong>NatCash :</strong> Paiement mobile national sécurisé.</p>
    <label>Numéro de téléphone NatCash</label>
    <input type="tel" name="natcashPhone" placeholder="+509 9876-5432" required />
  `
};

paymentRadios.forEach(radio => {
  radio.addEventListener("change", () => {
    const method = radio.value;
    paymentInfo.innerHTML = descriptions[method] || "";

    // Si se kat kredi, montre Stripe container an
    if (method === "visa" || method === "mastercard") {
      cardElementContainer.style.display = "block";
    } else {
      cardElementContainer.style.display = "none";
    }
  });
});

// Si gen radio deja checked sou chajman paj -> montre UI korespondan
const initiallyChecked = document.querySelector('input[name="payment"]:checked');
if (initiallyChecked) initiallyChecked.dispatchEvent(new Event('change', { bubbles: true }));


// -------------------------------
// SECTION 7b : STRIPE INIT
// -------------------------------
const stripe = Stripe("pk_test_votre_cle_publique"); // <- ranplase ak cle ou
const elements = stripe.elements();
const card = elements.create("card");
card.mount("#card-element");

card.on("change", function(event) {
  const displayError = document.getElementById("card-errors");
  displayError.textContent = event.error ? event.error.message : "";
});


      // -------------------------------
      // SECTION 8 : SOUMISSION
      // -------------------------------
      form.addEventListener('submit', async e => {
        e.preventDefault();

        if(selectType.value==='chambre' && chambresList.children.length===0){
          alert('Veuillez ajouter au moins une chambre.'); return;
        }
        const acceptPolicy = document.getElementById("acceptPolicy");
        if(!acceptPolicy.checked){ alert("Vous devez accepter la politique."); return; }

        const a=parseISO(inputArrivee.value);
        const d=parseISO(inputDepart.value);
        if(!a || !d || d<a){ alert("Vérifiez vos dates."); return; }

        const paymentSelected = form.querySelector('input[name="payment"]:checked');
        if(!paymentSelected){ alert("Sélectionnez un mode de paiement."); return; }

        recomputeTotal();
        const amount = parseFloat(hiddenAmount.value||'0');
        if(amount<=0){ alert("Montant invalide."); return; }

        // Construction payload
        const formData = new FormData(form);
        const data = {};
        formData.forEach((value,key)=>{
          if(key.endsWith('[]')){
            const baseKey = key.slice(0,-2);
            if(!data[baseKey]) data[baseKey]=[];
            data[baseKey].push(value);
          } else data[key]=value;
        });
        data.payment = paymentSelected.value;
        data.amount = amount;
        data.currency = CURRENCY;

        try {
          const res = await fetch('/api/reservation',{
            method:'POST',
            headers:{'Content-Type':'application/json', ...(csrfToken&&{'X-CSRF-Token':csrfToken})},
            body: JSON.stringify(data)
          });

          // --- sekirite sou JSON ---
          if (!res.ok) {
            const text = await res.text();
            throw new Error(`Erreur serveur ${res.status}: ${text}`);
          }
          const payload = await res.json();
          const { reservationId, approvalUrl } = payload || {};

          switch(paymentSelected.value){
            case 'paypal': window.location.href = approvalUrl || `/checkout?amount=${encodeURIComponent(amount)}&currency=${encodeURIComponent(CURRENCY)}`; break;
            case 'visa':
            case 'mastercard':
              const { paymentMethod, error } = await stripe.createPaymentMethod({
                type: "card",
                card: card,
              });
              if (error) {
                document.getElementById("card-errors").textContent = error.message;
                return;
              }
              data.paymentMethodId = paymentMethod.id; // ajoute nan payload la
              alert("✅ Réservation confirmée. Paiement carte en cours.");
              break;
            case 'moncash': alert("✅ Réservation confirmée. Instructions MonCash envoyées."); break;
            case 'natcash': alert("✅ Réservation confirmée. Instructions NatCash envoyées."); break;
          }

          form.reset(); updateSummary(); chambresList.innerHTML=''; chambreOptions.style.display='none';
          sumNuitsEl.textContent='0'; sumTotalEl.textContent='0.00'; hiddenAmount.value='0';
          inputs.forEach(input=>input.style.borderColor='');

        } catch(err){
          console.error(err);
          alert('❌ Erreur lors de la réservation. Réessayez plus tard.');
        }
      });
    };





    // ---------------------------------------------------------------------
    // INITIALIZATION
    // ---------------------------------------------------------------------
    highlightCurrentMenuLink();
    initResponsiveMenu();
    initReservationForm();
    initPaymentMethods();

  }); // end DOMContentLoaded
})();