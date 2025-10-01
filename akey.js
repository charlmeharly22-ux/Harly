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
    // 2. SLIDER OTOMATIK
    /////////////////////////////////////////////////////////////////////////
    const initSlider = () => {
      const slides = document.querySelectorAll('#slider .slide');
      if (!slides.length) return;

      let current = 0;
      let slideInterval = setInterval(nextSlide, 5000);

      function nextSlide() {
        slides[current].classList.remove('active');
        current = (current + 1) % slides.length;
        slides[current].classList.add('active');
      }

      function prevSlide() {
        slides[current].classList.remove('active');
        current = (current - 1 + slides.length) % slides.length;
        slides[current].classList.add('active');
      }

      const nextBtn = document.querySelector('.next');
      const prevBtn = document.querySelector('.prev');

      if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetInterval(); });
      if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetInterval(); });

      function resetInterval() {
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 5000);
      }
    };

    /////////////////////////////////////////////////////////////////////////
    // 3. MENU RESPONSIVE
    /////////////////////////////////////////////////////////////////////////
    const initResponsiveMenu = () => {
      const menuToggle = document.getElementById('menu-toggle');
      const navLinks = document.getElementById('nav-links');
      if(!menuToggle||!navLinks) return;

      menuToggle.addEventListener('click',()=>navLinks.classList.toggle('open'));
      document.addEventListener('click',e=>{ if(!navLinks.contains(e.target)&&!menuToggle.contains(e.target)) navLinks.classList.remove('open');});
      navLinks.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>navLinks.classList.remove('open')));
    };
    
    
    /////////////////////////////////////////////////////////////////////////
    // 4. FORM commentaire 
    /////////////////////////////////////////////////////////////////////////    

    (function(){
    const starGroup = document.getElementById('starGroup');
    const ratingValue = document.getElementById('ratingValue');
    const messageEl = document.getElementById('message');
    const nameEl = document.getElementById('name');
    const form = document.getElementById('reviewForm');
    const clearBtn = document.getElementById('clearBtn');
    const commentsList = document.getElementById('commentsList');

    let current = 0;
    const STORAGE_KEY = 'widget_reviews_v1';

    const blacklist = [
        "mauvais","médiocre","horrible","déçu","pas bien","nul","problème","insatisfait","déception",
        "je n'ai pas aimé","terrible","mal","raté","nulissime","insuffisant","détesté","mécontent","affreux",
        "désagréable","lamentable","triste","catastrophique","je suis déçu","je n'aime pas","je regrette",
        "service mauvais","nourriture mauvaise","chambre sale","pas satisfait",
        "move","pèdi lajan","pa bon","trè move","pa satisfè","pè","mal","fache","dezapwente","rat","traka",
        "deprime","pèdi espwa","tristès","pèfòmans pa bon","dezapwente anpil","manje pa bon","chanm sal",
        "pa gen sèvis","sèvis move","pwoblèm ak sèvis","pa rekòmande","m pa renmenl","pa gen tele",
        "li pa klimatize","pa gen klimatize",
        "bad","terrible","awful","horrible","poor","worst","disappointed","not good","dirty room",
        "unclean","no service","problem","issue","waste of money","angry","sad","frustrated",
        "useless","failed","not satisfied","don’t like","hate","uncomfortable","regret","unhappy",
        "depressed","hopeless","stress","poor performance","bad service","not recommended",
        "no tv","no ac","no air conditioning"
    ];

    function containsBlacklistedWords(text){
        const lower = text.toLowerCase();
        return blacklist.some(word => lower.includes(word.toLowerCase()));
    }

    for(let i=1;i<=5;i++){
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'star-btn';
        btn.setAttribute('role','radio');
        btn.setAttribute('aria-checked','false');
        btn.setAttribute('aria-label', i + ' étoile' + (i>1?'s':''));
        btn.dataset.value = i;
        btn.tabIndex = -1;
        btn.innerHTML = `
        <svg class="star-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.788 1.402 8.175L12 18.896l-7.336 3.877 1.402-8.175L.132 9.21l8.2-1.192z"/>
        </svg>
        <span class="sr-only">${i}</span>
        `;
        btn.addEventListener('click', ()=>{ setRating(Number(btn.dataset.value)); });
        btn.addEventListener('pointerenter', ()=>{ highlightStars(i); });
        btn.addEventListener('pointerleave', ()=>{ highlightStars(current); });
        starGroup.appendChild(btn);
    }

    starGroup.addEventListener('keydown', (e)=>{
        if(['ArrowLeft','ArrowDown'].includes(e.key)){ e.preventDefault(); setRating(Math.max(0,current-1)); }
        else if(['ArrowRight','ArrowUp'].includes(e.key)){ e.preventDefault(); setRating(Math.min(5,current+1)); }
        else if(/^[1-5]$/.test(e.key)){ setRating(Number(e.key)); }
        else if(e.key === 'Home'){ setRating(0); }
        else if(e.key === 'End'){ setRating(5); }
    });

    function setRating(n){
        current = n;
        const btns = starGroup.querySelectorAll('button');
        btns.forEach((b, idx)=>{
        const svg = b.querySelector('svg');
        if(idx < n){ svg.style.fill = '#ffbf00'; svg.classList.add('star-on'); b.setAttribute('aria-checked','true'); }
        else { svg.style.fill = '#e6e6e6'; svg.classList.remove('star-on'); b.setAttribute('aria-checked','false'); }
        });
        ratingValue.textContent = (n===0)? '0.0' : n.toFixed(1);
    }

    function highlightStars(n){
        const btns = starGroup.querySelectorAll('button');
        btns.forEach((b, idx)=>{ b.querySelector('svg').style.transform = (idx < n) ? 'scale(1.06)' : 'scale(1)'; });
    }

    function loadReviews(){ try{ const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : []; } catch(e){ return []; } }
    function saveReviews(arr){ localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); }

    function renderStars(n){
        const wrap = document.createElement('div');
        wrap.className = 'stars-small';
        for(let i=1;i<=5;i++){
        const svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
        svg.setAttribute("viewBox","0 0 24 24");
        const path = document.createElementNS("http://www.w3.org/2000/svg","path");
        path.setAttribute("d","M12 .587l3.668 7.431 8.2 1.192-5.934 5.788 1.402 8.175L12 18.896l-7.336 3.877 1.402-8.175L.132 9.21l8.2-1.192z");
        if(i<=n) path.setAttribute("class","on");
        svg.appendChild(path);
        wrap.appendChild(svg);
        }
        return wrap;
    }

    function renderComments(){
        const list = loadReviews();
        commentsList.innerHTML = '';
        if(!list.length){ commentsList.innerHTML = '<div class="empty">Aucun commentaire pour l\'instant — soyez le premier !</div>'; return; }
        list.slice().reverse().forEach((c)=>{
        const card = document.createElement('div'); card.className = 'comment-card';
        const left = document.createElement('div'); left.style.flex = '1';
        const meta = document.createElement('div'); meta.className = 'comment-meta';
        const name = c.name ? escapeHtml(c.name) : 'Anon';
        const date = new Date(c.createdAt).toLocaleString();
        meta.innerHTML = `<strong>${name}</strong> • ${date}`;
        const starsEl = renderStars(c.rating||0);
        meta.appendChild(starsEl);
        const body = document.createElement('div'); body.className = 'comment-body'; body.textContent = c.message;
        left.appendChild(meta); left.appendChild(body);
        card.appendChild(left);
        commentsList.appendChild(card);
        });
    }

    form.addEventListener('submit', (e)=>{
        e.preventDefault();
        const msg = messageEl.value.trim();
        if(!msg){ return; }

        if(current === 0){
            alert("Veuillez sélectionner une note avant de continuer.");
            return;
        }

        if(containsBlacklistedWords(msg)){ return; }

        const payload = { name: nameEl.value.trim() || null, message: msg, rating: current || null, createdAt: new Date().toISOString() };
        const arr = loadReviews(); arr.push(payload); saveReviews(arr);
        form.reset(); setRating(0); renderComments();
    });

    clearBtn.addEventListener('click', ()=>{
        form.reset();
        setRating(0);
    });

    function escapeHtml(s){ return s.replace(/[&<>"']/g, function(m){return ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;','\'':'&#39;'}[m]);}); }

    (function seed(){
        const arr = loadReviews();
        if(arr.length===0){
        const sample = [
            {name:'Marie', message:'Très bon service, produit conforme.', rating:5, createdAt: new Date(Date.now()-1000*60*60*24*3).toISOString()},
            {name:'Jean', message:'Livraison un peu lente mais satisfait.', rating:4, createdAt: new Date(Date.now()-1000*60*60*24*1).toISOString()},
        ];
        saveReviews(sample);
        }
    })();

    setRating(0); renderComments();
    })();

    // ---------------------------------------------------------------------
    // INITIALIZATION
    // ---------------------------------------------------------------------
    highlightCurrentMenuLink();
    initSlider();
    initResponsiveMenu();

  }); // end DOMContentLoaded
})();    
