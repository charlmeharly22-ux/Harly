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
    // 4. MENU RESPONSIVE
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
    // 5. FAQ ACCORDION
    /////////////////////////////////////////////////////////////////////////
    const initFaqAccordion = () => {
      document.querySelectorAll('.faq-question').forEach(btn=>{
        btn.addEventListener('click', ()=>{
          const parent = btn.parentElement;
          document.querySelectorAll('.faq-item').forEach(item=>{ if(item!==parent)item.classList.remove('active'); });
          parent.classList.toggle('active');
        });
      });
    };

    /////////////////////////////////////////////////////////////////////
    // 6. GALERIE & HERO CAROUSEL SCRIPT
    /////////////////////////////////////////////////////////////////////
    const initHeroAndGallery = () => {
      /* ---------- HERO CAROUSEL ELEMENTS ---------- */
      const heroBg = document.getElementById('hero-bg');
      const heroSubtitle = document.getElementById('hero-subtitle');
      const heroTitle = document.getElementById('hero-title');
      const heroDesc = document.getElementById('hero-desc');
      const leftHero = document.getElementById('left-hero');
      const cards = document.querySelectorAll('.carousel-card');
      const pageIndicator = document.getElementById('page-indicator');

      let current = 0;               
      let autoSlideInterval = null;  

      function setHeroFrom(card, userClick = false) {
        cards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');

        leftHero.classList.add('hidden');
        setTimeout(() => {
          heroBg.style.backgroundImage = `url('${card.dataset.img}')`;
          heroSubtitle.innerHTML = card.dataset.subtitle;
          heroTitle.innerHTML = card.dataset.title;
          heroDesc.innerHTML = card.dataset.desc;
          leftHero.classList.remove('hidden');
        }, 400);

        current = Array.from(cards).indexOf(card);
        updateDots();

        if(userClick){
          card.scrollIntoView({behavior:'smooth', inline:'center', block:'nearest'});
          resetAutoSlide();
        }
      }

      function createDots() {
        pageIndicator.innerHTML = '';
        cards.forEach((_, i) => {
          let btn = document.createElement('button');
          btn.type = 'button';
          btn.dataset.index = i;
          btn.setAttribute('aria-label', 'Go to slide ' + (i+1));
          btn.addEventListener('click', ()=>setHeroFrom(cards[i], true));
          pageIndicator.appendChild(btn);
        });
      }

      function updateDots(){
        const dots = pageIndicator.querySelectorAll('button');
        dots.forEach(dot => dot.classList.remove('active'));
        if(dots[current]) dots[current].classList.add('active');
      }

      function autoSlide(){
        clearInterval(autoSlideInterval);
        autoSlideInterval = setInterval(()=>{
          let next = (current+1) % cards.length;
          setHeroFrom(cards[next]);
        }, 5500);
      }

      function resetAutoSlide(){
        clearInterval(autoSlideInterval);
        autoSlide();
      }

      /* ---------- INIT HERO CAROUSEL ---------- */
      createDots();
      if(cards.length) setHeroFrom(cards[0]);
      autoSlide();

      document.querySelector('.prev-btn').addEventListener('click', () => {
        let prev = (current - 1 + cards.length) % cards.length;
        setHeroFrom(cards[prev], true);
      });
      document.querySelector('.next-btn').addEventListener('click', () => {
        let next = (current + 1) % cards.length;
        setHeroFrom(cards[next], true);
      });

      /* ------------------ GALLERY ELEMENTS ------------------ */
      const itemsPerPage = 6;
      let currentPage = 1;
      let currentFilter = 'all';
      let currentLightboxIndex = 0;
      let filteredData = [];

      const galleryEl = document.getElementById('gallery');
      const paginationEl = document.getElementById('pagination');
      const lightboxOverlay = document.getElementById('lightboxOverlay');
      const lightboxContent = document.getElementById('lightboxContent');
      const lightboxCaption = document.getElementById('lightboxCaption');
      const lightboxClose = document.getElementById('lightboxClose');
      const lightboxPrev = document.getElementById('lightboxPrev');
      const lightboxNext = document.getElementById('lightboxNext');

      /* ------------------ BUILD galleryData FROM HTML ------------------ */
      let galleryData = [];
      document.querySelectorAll("#gallery .gallery-item").forEach((el) => {
        const category = el.dataset.category;
        const caption = el.querySelector("p") ? el.querySelector("p").innerText : "";
        const img = el.querySelector("img");
        const video = el.querySelector("video");

        if (img) galleryData.push({ type: "img", src: img.src, caption, genre: category });
        else if (video) galleryData.push({ type: "video", src: video.src, caption, genre: category });
      });

      /* ------------------ GALLERY FUNCTIONS ------------------ */
      function displayGallery() {
        galleryEl.innerHTML = '';
        filteredData = galleryData.filter(item => currentFilter === 'all' || item.genre === currentFilter);

        const start = (currentPage - 1) * itemsPerPage;
        const paginatedItems = filteredData.slice(start, start + itemsPerPage);

        paginatedItems.forEach((item, index) => {
          const div = document.createElement('div');
          div.className = 'gallery-item';
          div.dataset.index = start + index;
          div.style.animationDelay = `${index * 0.1}s`;

          if (item.type === 'img') div.innerHTML = `<img src="${item.src}" alt="${item.caption}"><p>${item.caption}</p>`;
          else div.innerHTML = `<video src="${item.src}" controls></video><p>${item.caption}</p>`;

          div.addEventListener('click', () => openLightbox(div.dataset.index));
          galleryEl.appendChild(div);

          requestAnimationFrame(()=>{ setTimeout(()=>div.classList.add('show'), index*100); });
        });

        displayPagination();
      }

      /* ------------------ PAGINATION ------------------ */
      function displayPagination() {
        paginationEl.innerHTML = '';
        const totalPages = Math.ceil(filteredData.length / itemsPerPage);

        // toujou verifye si gen plis pase 1 paj
        if (totalPages > 1) {
          const prevBtn = document.createElement('button');
          prevBtn.textContent = 'Précédent';
          prevBtn.disabled = currentPage === 1;
          prevBtn.addEventListener('click', () => { 
            currentPage--; 
            displayGallery(); 
          });
          paginationEl.appendChild(prevBtn);

          for (let i = 1; i <= totalPages; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.textContent = i;
            if (i === currentPage) pageBtn.classList.add('active');
            pageBtn.addEventListener('click', () => { 
              currentPage = i; 
              displayGallery(); 
            });
            paginationEl.appendChild(pageBtn);
          }

          const nextBtn = document.createElement('button');
          nextBtn.textContent = 'Suivant';
          nextBtn.disabled = currentPage === totalPages;
          nextBtn.addEventListener('click', () => { 
            currentPage++; 
            displayGallery(); 
          });
          paginationEl.appendChild(nextBtn);
        } else if (totalPages === 1) {
          // Si se sèlman 1 paj, mete yon bouton aktif pou fè sa "pro"
          const singlePageBtn = document.createElement('button');
          singlePageBtn.textContent = "1";
          singlePageBtn.classList.add('active');
          paginationEl.appendChild(singlePageBtn);
        }
      }

      /* ------------------ LIGHTBOX ------------------ */
      function openLightbox(index) {
        currentLightboxIndex = parseInt(index);
        showLightbox();
        lightboxOverlay.style.display = 'flex';
      }
      function closeLightbox() { lightboxOverlay.style.display = 'none'; }
      function showLightbox() {
        const item = filteredData[currentLightboxIndex];
        lightboxContent.innerHTML = item.type === 'img'
          ? `<img src="${item.src}" alt="${item.caption}">`
          : `<video src="${item.src}" controls autoplay style="width:90vw; max-height:90vh;"></video>`;
        lightboxCaption.textContent = item.caption;
      }

      lightboxClose.addEventListener('click', closeLightbox);
      lightboxPrev.addEventListener('click', () => {
        currentLightboxIndex = (currentLightboxIndex - 1 + filteredData.length) % filteredData.length;
        showLightbox();
      });
      lightboxNext.addEventListener('click', () => {
        currentLightboxIndex = (currentLightboxIndex + 1) % filteredData.length;
        showLightbox();
      });
      lightboxOverlay.addEventListener('click', e => { if(e.target===lightboxOverlay) closeLightbox(); });

      /* ------------------ TOUCH SWIPE ------------------ */
      let touchStartX=0,touchEndX=0;
      lightboxOverlay.addEventListener('touchstart', e=>touchStartX=e.changedTouches[0].screenX,false);
      lightboxOverlay.addEventListener('touchend', e=>{ 
        touchEndX=e.changedTouches[0].screenX;
        if(touchEndX<touchStartX-50) currentLightboxIndex=(currentLightboxIndex+1)%filteredData.length;
        if(touchEndX>touchStartX+50) currentLightboxIndex=(currentLightboxIndex-1+filteredData.length)%filteredData.length;
        showLightbox();
      }, false);

      // Expose filterGallery for gallery only
      window.filterGalleryGallery = function(category) {
        currentFilter = category || "all";
        currentPage = 1;
        displayGallery();
      };

      /* ------------------ INITIAL DISPLAY ------------------ */
      displayGallery();
    };

    /////////////////////////////////////////////////////////////////////
    // 7. FILTER BUTTONS & ANIMATIONS
    /////////////////////////////////////////////////////////////////////
    const initAnimationsAndFilters = () => {

      function initAnimations() {
        const allItems = document.querySelectorAll(".chambre-card, .gallery-item, .media-card");
        allItems.forEach((item, i) => {
          setTimeout(() => item.classList.add("show"), i * 300);
        });
      }
      window.addEventListener("DOMContentLoaded", initAnimations);
    };

    window.filterGallery = function(category, event) {
      if (event) {
        const buttons = event.target.parentElement.querySelectorAll("button");
        const isActive = event.target.classList.contains("active");

        buttons.forEach((btn) => btn.classList.remove("active"));

        if (isActive) {
          category = 'all';
          event.target.parentElement.querySelector('button[data-category="all"]').classList.add("active");
        } else {
          event.target.classList.add("active");
        }
      }

      // Filtre lòt seksyon ki pa galeri
      function applyFilter(containerSelector, itemSelector) {
        const container = document.querySelector(containerSelector);
        if (!container) return;
        const items = container.querySelectorAll(itemSelector);
        let delay = 0;
        items.forEach((item) => {
          const match = category === "all" || item.dataset.category === category;
          if (match) {
            item.style.display = "block";
            item.classList.remove("show");
            requestAnimationFrame(() => setTimeout(()=>item.classList.add("show"), delay));
            delay += 200;
          } else {
            item.style.display = "none";
            item.classList.remove("show");
          }
        });
      }

      // Galeri (nou rele fonksyon anndan initHeroAndGallery)
      if (typeof window.filterGalleryGallery === 'function') {
        window.filterGalleryGallery(category);
      }

      // Lòt seksyon
      applyFilter(".chambres-container", ".chambre-card");
      applyFilter(".menu2", ".media-card");
    };


    /////////////////////////////////////////////////////////////////////////
    // 8. FORM CONTACT - MESSAGE SUCCESS
    /////////////////////////////////////////////////////////////////////////
    const initContactForm = () => {
      const contactForm = document.querySelector('.contact-form');
      const successMessage = document.getElementById('success-message');
      if(!contactForm||!successMessage) return;
      contactForm.addEventListener('submit', e=>{ e.preventDefault(); successMessage.style.display='block'; contactForm.reset(); });
    };


    // ---------------------------------------------------------------------
    // INITIALIZATION
    // ---------------------------------------------------------------------
    highlightCurrentMenuLink();
    initSlider();
    initResponsiveMenu();
    initFaqAccordion();
    initContactForm();
    initHeroAndGallery(); 
    initAnimationsAndFilters();

  }); // end DOMContentLoaded
})();
