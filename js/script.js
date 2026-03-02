// js/script.js
// Validação do formulário, mensagens de erro em DOM e menu hambúrguer

document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');

  // Toggle do menu hamburger (mobile)
  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!expanded));
      mainNav.classList.toggle('open');
    });
  }

  // Close mobile menu when clicking a link
  const navLinks = Array.from(document.querySelectorAll('.nav-list a'));
  navLinks.forEach(a => a.addEventListener('click', () => {
    if (mainNav.classList.contains('open')) {
      mainNav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded','false');
    }
  }));

  // Form validation
  const form = document.getElementById('contactForm');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const messageInput = document.getElementById('message');
  const errName = document.getElementById('err-name');
  const errEmail = document.getElementById('err-email');
  const errMessage = document.getElementById('err-message');
  const formResult = document.getElementById('formResult');

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function clearErrors() {
    errName.textContent = '';
    errEmail.textContent = '';
    errMessage.textContent = '';
    formResult.textContent = '';
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      clearErrors();
      let valid = true;

      if (!nameInput.value.trim()) {
        errName.textContent = 'Por favor, informe seu nome.';
        valid = false;
      }

      if (!validateEmail(emailInput.value.trim())) {
        errEmail.textContent = 'Por favor, informe um e-mail válido.';
        valid = false;
      }

      if (messageInput.value.trim().length < 10) {
        errMessage.textContent = 'A mensagem deve ter ao menos 10 caracteres.';
        valid = false;
      }

      if (!valid) {
        formResult.textContent = 'Corrija os campos em vermelho.';
        return;
      }

      // Simular envio: aqui você integraria com backend
      formResult.textContent = 'Mensagem enviada com sucesso! Obrigado.';
      form.reset();
    });
  }

  // Nav indicator (hover) — cria um elemento que se move sob os links
  const navList = document.querySelector('.nav-list');
  if (navList) {
    const indicator = document.createElement('span');
    indicator.className = 'nav-indicator';
    navList.appendChild(indicator);

    const links = Array.from(navList.querySelectorAll('a'));

    function moveIndicatorTo(el) {
      const rect = el.getBoundingClientRect();
      const parentRect = navList.getBoundingClientRect();
      const left = rect.left - parentRect.left;
      indicator.style.width = `${rect.width}px`;
      indicator.style.transform = `translateX(${left}px)`;
      indicator.style.opacity = '1';
    }

    links.forEach((a) => {
      a.addEventListener('mouseenter', () => {
        // only show when nav is visible
        if (getComputedStyle(navList).display !== 'none') moveIndicatorTo(a);
      });
      a.addEventListener('focus', () => { if (getComputedStyle(navList).display !== 'none') moveIndicatorTo(a); });
    });

    navList.addEventListener('mouseleave', () => {
      indicator.style.opacity = '0';
    });

    window.addEventListener('resize', () => {
      // hide indicator when layout changes or nav collapsed
      indicator.style.opacity = '0';
    });
  }

  // Logo carousel functionality
  const carousel = document.getElementById('logoCarousel');
  if (carousel) {
    const track = carousel.querySelector('.carousel-track');
    const slides = Array.from(track.children);
    const prevBtn = carousel.querySelector('.carousel-btn.prev');
    const nextBtn = carousel.querySelector('.carousel-btn.next');
    let currentIndex = 0;
    let intervalId;

    // ensure each slide is exactly as wide as the viewport portion we display
    function updateSizes() {
      const w = Math.round(carousel.getBoundingClientRect().width);
      slides.forEach(slide => {
        slide.style.minWidth = w + 'px';
      });
    }

    window.addEventListener('resize', updateSizes);

    function moveTo(index) {
      if (index < 0) index = slides.length - 1;
      if (index >= slides.length) index = 0;
      const containerWidth = Math.round(carousel.getBoundingClientRect().width);
      const offset = index * containerWidth;
      track.style.transform = `translateX(-${offset}px)`;
      currentIndex = index;
      updateCarouselBg(index);
    }

    function next() { moveTo(currentIndex + 1); }
    function prev() { moveTo(currentIndex - 1); }

    // try to derive a background color from the logo image
    function sampleBackgroundColor(img) {
      if (!img.naturalWidth || !img.naturalHeight) return 'transparent';
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);
      const coords = [
        [5,5],
        [canvas.width-5,5],
        [5,canvas.height-5],
        [canvas.width-5,canvas.height-5]
      ];
      let r=0,g=0,b=0,count=0;
      coords.forEach(([x,y])=>{
        try {
          const d = ctx.getImageData(x,y,1,1).data;
          r += d[0]; g += d[1]; b += d[2]; count++;
        } catch(e) {}
      });
      if (!count) return 'transparent';
      return `rgb(${Math.round(r/count)},${Math.round(g/count)},${Math.round(b/count)})`;
    }

    function updateCarouselBg(idx) {
      const img = slides[idx].querySelector('img');
      if (!img) return;
      const color = sampleBackgroundColor(img);
      carousel.style.backgroundColor = color;
    }

    nextBtn.addEventListener('click', () => { next(); resetAuto(); });
    prevBtn.addEventListener('click', () => { prev(); resetAuto(); });

    function autoStart() {
      intervalId = setInterval(next, 10000);
    }
    function resetAuto() {
      clearInterval(intervalId);
      autoStart();
    }

    carousel.addEventListener('mouseenter', () => clearInterval(intervalId));
    carousel.addEventListener('mouseleave', () => autoStart());

    // initialize dimensions and start
    updateSizes();
    moveTo(0);
    autoStart();
  }

  // Preload card images to reduce flicker between image load and animation
  (function preloadCardImages(){
    try{
      const cardsForPreload = Array.from(document.querySelectorAll('.card'));
      cardsForPreload.forEach(card => {
        let bg = card.getAttribute('style') || '';
        // try to read the custom property from inline style first
        const m = bg.match(/--card-bg:\s*url\((?:'|")?(.*?)(?:'|")?\)/i);
        let url = m ? m[1] : null;
        if (!url) {
          // fallback to computed style
          const val = getComputedStyle(card).getPropertyValue('--card-bg').trim();
          const m2 = val.match(/url\((?:'|")?(.*?)(?:'|")?\)/i);
          url = m2 ? m2[1] : null;
        }
        if (url) {
          const img = new Image();
          img.src = url;
        }
      });
    }catch(e){ /* ignore */ }
  })();

  // Change header style on scroll and show back-to-top button
  const header = document.getElementById('siteHeader');
  const backTop = document.getElementById('backTop');
  function onScroll() {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    if (window.scrollY > 400) {
      backTop.classList.add('show');
    } else {
      backTop.classList.remove('show');
    }
  }
  window.addEventListener('scroll', onScroll, {passive:true});

  if (backTop) {
    backTop.addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}));
  }

  // Keyboard accessibility: ESC closes modal and mobile menu
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      // close modal
      if (modal && modal.getAttribute('aria-hidden') === 'false') closeModal();
      // close nav
      if (mainNav && mainNav.classList.contains('open')) {
        mainNav.classList.remove('open');
        menuToggle.setAttribute('aria-expanded','false');
      }
    }
  });

  // Modal: detalhes dos sistemas
  const details = {
    'AROS': {visual:'Interface leve inspirada no AmigaOS.', year:'Anos 1990s (variações modernas)', features:'Compatibilidade com APIs Amiga, foco em leveza e nostalgia.'},
    'TempleOS': {visual:'Estética retro 640x480, 16 cores.', year:'2013-2018', features:'Sistema experimental por Terry A. Davis, linguagem HolyC, projeto único.'},
    'Arch Linux': {visual:'Minimalista, terminal-first.', year:'2002 (lançamento)', features:'Rolling release, pacman, foco em usuários avançados.'},
    'Debian': {visual:'Estável e clássico.', year:'1993 (lançamento)', features:'Sistema universal, foco em estabilidade e comunidade.'},
    'elementary': {visual:'Design limpo, inspirado em macOS.', year:'2011 (elementary OS inicial)', features:'Foco em UX, apps próprias e estética polida.'},
    'Fedora': {visual:'Inovador e moderno.', year:'2003 (origem)', features:'Tecnologias upstream e foco em desenvolvedores.'},
    'Kali': {visual:'Ferramentas de segurança e terminal.', year:'2006 (BackTrack → Kali)', features:'Distribuição para pentesting e forense.'},
    'Linux Mint': {visual:'Familiar ao usuário médio.', year:'2006', features:'Facilidade de uso, Cinnamon e Xfce.'},
    'Pop!_OS': {visual:'Interface limpa criada pela System76.', year:'2017', features:'Foco em produtividade e suporte a GPUs e hardware.'},
    'Puppy': {visual:'Muito leve, minimalista.', year:'2003', features:'Funciona em RAM, ideal para hardware antigo.'},
    'ReactOS': {visual:'Esforço reimplementação do Windows NT.', year:'2006 (início)', features:'Compatibilidade com binários Windows e design NT.'},
    'Ubuntu': {visual:'Amigável e polido.', year:'2004', features:'Comunidade ampla, facilidade para iniciantes.'},
    'Windows 10': {visual:'Moderno, tiles e tema claro/escuro.', year:'2015', features:'Integração com serviços Microsoft e compatibilidade ampla.'},
    'Windows 7': {visual:'Clássico e limpo.', year:'2009', features:'Interface simples e estável, barra de tarefas icônica.'},
    'Windows 98': {visual:'Retro, ícones pixelados.', year:'1998', features:'Marco na era PC, suporte a hardware antigo.'},
    'Windows Vista': {visual:'Efeitos visuais Aero.', year:'2007', features:'Novos modelos de segurança e visual moderno na época.'},
    'Windows XP': {visual:'Interface calorosa e colorida.', year:'2001', features:'Longa adoção e estabilidade percebida.'}
  };

  const modal = document.getElementById('systemModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalVisual = document.getElementById('modalVisual');
  const modalYear = document.getElementById('modalYear');
  const modalFeatures = document.getElementById('modalFeatures');
  const modalClose = document.getElementById('modalClose');

  function openModal(key, imgSrc, imgAlt) {
    const d = details[key] || {visual:'',year:'',features:''};
    modalTitle.textContent = key;
    modalVisual.textContent = d.visual;
    modalYear.textContent = `Ano / Período: ${d.year}`;
    modalFeatures.textContent = d.features;
    // set modal image if available
    const modalImg = document.getElementById('modalImg');
    if (modalImg && imgSrc) {
      modalImg.src = imgSrc;
      modalImg.alt = imgAlt || `${key} — miniatura`;
      modalImg.style.display = '';
    } else if (modalImg) {
      modalImg.style.display = 'none';
    }
    modal.setAttribute('aria-hidden','false');
    // move focus to modal for accessibility
    modal.querySelector('.modal-content')?.focus();
  }

  function closeModal() {
    modal.setAttribute('aria-hidden','true');
  }

  if (modalClose) modalClose.addEventListener('click', closeModal);
  // back button removed; closing handled by modalClose or outside click.
  if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  // Attach click handlers to cards
  const cards = Array.from(document.querySelectorAll('.card'));
  // Ensure the card background-image is set inline (so it's available
  // immediately) and attach click handlers.
  cards.forEach(card => {
    // read --card-bg from inline style or computed style
    let bg = card.getAttribute('style') || '';
    let url = null;
    const m = bg.match(/--card-bg:\s*url\((?:'|")?(.*?)(?:'|")?\)/i);
    if (m) url = m[1];
    if (!url) {
      const val = getComputedStyle(card).getPropertyValue('--card-bg').trim();
      const m2 = val.match(/url\((?:'|")?(.*?)(?:'|")?\)/i);
      if (m2) url = m2[1];
    }

    if (url) {
      // set as inline background-image so CSS overlay works reliably
      card.style.backgroundImage = `url("${url}")`;
    }

    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      const key = (card.dataset.system || card.querySelector('h3')?.textContent || '').trim();
      const imgEl = card.querySelector('img');
      const imgSrc = imgEl ? imgEl.getAttribute('src') : '';
      const imgAlt = imgEl ? imgEl.getAttribute('alt') : '';
      openModal(key, imgSrc, imgAlt);
    });
  });
});
