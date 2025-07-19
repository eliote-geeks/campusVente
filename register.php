<?php
session_start();
require_once 'conf/config.php';

$success = '';
$errors = [];

$ret = "SELECT * FROM ib_systemsettings LIMIT 1"; // ajoute LIMIT si plusieurs lignes existent
$stmt = $mysqli->prepare($ret);
$stmt->execute();
$res = $stmt->get_result();
if ($auth = $res->fetch_object()) {

?>
<!doctype html>
<html class="no-js" lang="en">

<head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <title><?php echo $auth->sys_name; ?></title>
    <meta name="description" content="nkapdey">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link rel="shortcut icon" type="image/x-icon" href="assets/img/logo.jpg">
    <!-- Place favicon.ico in the root directory -->

    <!-- CSS here -->
    <link rel="stylesheet" href="assets/css/bootstrap.min.css">
    <link rel="stylesheet" href="assets/css/animate.min.css">
    <link rel="stylesheet" href="assets/css/magnific-popup.css">
    <link rel="stylesheet" href="assets/css/fontawesome-all.min.css">
    <link rel="stylesheet" href="assets/css/tg-flaticon.css">
    <link rel="stylesheet" href="assets/css/swiper-bundle.min.css">
    <link rel="stylesheet" href="assets/css/default.css">
    <link rel="stylesheet" href="assets/css/default-icons.css">
    <link rel="stylesheet" href="assets/css/odometer.css">
    <link rel="stylesheet" href="assets/css/aos.css">
    <link rel="stylesheet" href="assets/css/tg-cursor.css">
    <link rel="stylesheet" href="assets/css/main.css">
    <script src="https://cdn.cinetpay.com/seamless/main.js"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/css/intlTelInput.min.css" />
<script src="https://www.google.com/recaptcha/api.js" async defer></script>



<style>
    .form-group {
      margin-bottom: 15px;
    }

    label {
      font-size: 13px;
      font-weight: 500;
      display: block;
      margin-bottom: 5px;
    }

    input[type="tel"] {
      width: 100%;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid #ccc;
    }

    select {
      width: 100%;
      padding: 10px;
      border-radius: 8px;
      border: 1px solid #ccc;
    }

    .intl-tel-input {
      width: 100%;
    }

  .password-wrapper {
    position: relative;
  }
  .toggle-password {
    position: absolute;
    top: 50%;
    right: 10px;
    transform: translateY(-50%);
    cursor: pointer;
    user-select: none;
    color: #555;
  }
/* Bo te de chat */
.whatsapp-chat {
    display: none;
    width: 250px;
    margin-bottom: 10px;
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    padding: 15px;
}

/* Contenu du chat */
.chat-body p {
    margin: 0 0 10px;
    font-family: Arial, sans-serif;
}
@media (max-width: 768px) {
  .some-class {
    margin-left: 0 !important;
    width: 100% !important;
  }
}
#whatsapp-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 999;
  max-width: 90%; /* Ajoute  a si c est trop grand */
}

.chat-button {
    display: block;
    background-color: #25D366;
    color: white;
    text-align: center;
    padding: 10px;
    text-decoration: none;
    border-radius: 5px;
    font-weight: bold;
    font-family: Arial, sans-serif;
}

/* Affichage au survol */
.nkadey-link:hover .tooltip {
    visibility: visible;
    opacity: 1;
}

/* Animation */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Ajoute ceci dans le <style> */
.whatsapp-wrapper {
    position: fixed;
    bottom: 80px; /* Juste au-dessus du bouton WhatsApp */
    right: 20px;
    z-index: 1000;
}

.whatsapp-chat {
    animation: fadeInUp 0.5s ease-in-out;
    max-width: 260px;
}

/* Petite am lioration du style du message */
.chat-body p {
    font-size: 14px;
    line-height: 1.4;
    color: #333;
}


  </style>
</head>

<body>
<?php 
    
      if (isset($_POST['ok'])) {
        require_once 'autoload.php';
        //$recaptcha = new ReCaptcha("");
        $remoteIp = $_SERVER['REMOTE_ADDR'];

        $recaptcha = new \ReCaptcha\ReCaptcha("6Lc_QTorAAAAAOwtofHY9ZXzo9zII-7HxA1pDVbb");
$gRecaptchaResponse = $_POST['g-recaptcha-response'];
$resp = $recaptcha->setExpectedHostname('localhost')
                  ->verify($gRecaptchaResponse, $remoteIp);

if ($resp->isSuccess()) {
    echo("succes");
} else {
    $errors = $resp->getErrorCodes();
    var_dump($errors);
      }
}
     ?>
    <div class="preloader">
        <div class="preloader-inner">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
        </div>
    </div>
    <!-- preloader-end -->

    <!-- Scroll-top -->
    <button class="scroll__top scroll-to-target" data-target="html">
        <i class="fas fa-chevron-up"></i>
    </button>
    <!-- Scroll-top-end-->

    <!-- main-area -->
    <main class="main-area fix">


        <!-- login-area -->
        <section class="login__area">
            <div class="container-fluid p-0">
                <div class="row gx-0">
                    <div class="col-md-6">
                        <div class="login__left-side" data-background="assets/img/banner/image.jpeg">
                            <a href="index.html"><img src="dist/img/logos.png" alt="" width="40px"></a>
                            
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="col-md-12">
                            <!-- general form elements -->
                            <div class="card card-purple">
                                <div class="card-header">
                                    <h3 class="card-title">Renseigner tous les champs</h3>
                                </div>
<?php if (isset($_GET['error']) && $_GET['error'] === 'exists'): ?>
    <p style="color:red;">Un compte avec cet email, ce numéro ou cet identifiant existe déja.</p>
<?php endif; ?>

                                <!-- form start -->
<?php if (isset($_GET['success']) && $_GET['success'] == 1): ?>
    <div class="alert alert-success" role="alert">
        Inscription reussie ! Veuillez verifier votre email pour activer votre compte.
    </div>
<?php elseif (isset($_GET['error']) && $_GET['error'] == 1): ?>
    <div class="alert alert-danger" role="alert">
        a Une erreur est survenue lors de l'envoi de l'email d'activation.
    </div>
<?php endif; ?> 


     <?php
$parrain_id = isset($_GET['parrain_id']) ? intval($_GET['parrain_id']) : 0;
?>

<!-- <form action="confirmation.php?parrain=<?php echo $parrain_id; ?>" method="POST" enctype="multipart/form-data">
<form method="post" action="init_paiement.php?parrain=<?php echo $parrain_id; ?>" enctype="multipart/form-data">-->
<form action="initier_paiement.php" method="POST">
<?php $_SESSION['csrf_token'] = bin2hex(random_bytes(32)); ?>
<input type="hidden" name="csrf_token" value="<?= $_SESSION['csrf_token'] ?>">
    <input type="hidden" name="parrain_id" value="<?php echo $parrain_id; ?>">
                                    <div class="card-body">

                                         <div class="row">
                 <div class=" col-md-6 form-group">
                  <label for="exampleInputEmail1">Pays</label>
                                              



<select id="country" class="form-control" id="exampleInputEmail1" name="pays">
      <option>--Choisir un pays--</option>
      <option value="cm" selected>Cameroun</option>
      <option value="td">Tchad</option>
      <option value="ga">Gabon</option>
      <option value="cg">Congo</option>
      <option value="gq">Guinee equatoriale</option>
<option value="cf">Centrafrique</option>
    </select>
                                            </div>

        <div class=" col-md-6 form-group">
            <label for="phone">Numéro paiement</label>
  <input type="number" id="phone" name="phone" placeholder="Numéro sans indicatif" required class="form-control" >
                                            </div>
       
                                        </div>
 <div class="row">
              <div class=" col-md-6 form-group">
                        <label for="ville">Ville</label>
              <input type="text" name="ville"  class="form-control" id="ville">
                                            </div>
                     <div class=" col-md-6 form-group">
                   <label for="exampleInputEmail1">Quartier</label>
     <input type="text" name="address"  class="form-control" id="exampleInputEmail1">
                                            </div>
                                                                   
               
                                        </div>

                                     <div class="row">
                         <div class=" col-md-6 form-group">
                     <label for="exampleInputEmail1">Nom et prénom*</label>
                 <input type="text" name="name"  class="form-control" id="exampleInputEmail1" required>
                                            </div>
                                            <div class=" col-md-6 form-group">
                 <label for="exampleInputEmail1">Profession :</label>
             <select name="profession" class="form-control" id="exampleInputEmail1">
 <option value="">-- Sélectionnez votre statut --</option>
  <option value="sans_emploi">Sans emploi</option>
  <option value="eleve_etudiant">Élève / Étudiant</option>
  <option value="salarie_prive">Salarié du secteur privé</option>
  <option value="fonctionnaire">Fonctionnaire</option>
  <option value="entrepreneur">Entrepreneur</option>
  <option value="travailleur_independant">Travailleur indépendant</option></select>
</select>

                                            </div>
                        <div class=" col-md-6 form-group" style="display: none;">
             <label for="exampleInputPassword1">Numero de compte</label>
                                <?php
                                                //PHP function to generate random passenger number
                                                $length = 4;
                                                $_Number =  substr(str_shuffle('0123456789'), 1, $length);
                                                ?>
                 <input type="text" readonly name="client_number" value="NKAP-DEY-<?php echo $_Number; ?>" class="form-control" id="exampleInputPassword1" >
                                        </div>
                                        </div>
  

 <div class="row">
      
                 <div class=" col-md-6 form-group">
                 <label for="exampleInputEmail1">Votre username</label>
             <input type="text" name="username"  class="form-control" id="exampleInputEmail1">
                                            </div>                                              <div class=" col-md-6 form-group">
                 <label for="exampleInputEmail1">Email valide*</label>
             <input type="email" name="email"  class="form-control" id="exampleInputEmail1">
                                            </div>                                        </div>







                                <div class="row">
      
                 <div class=" col-md-6 form-group">
         <label for="password">Mot de passe*</label>
             <input type="password" name="password"  class="form-control" required id="password">
             
              <small id="passwordHelp" style="color: red;"></small>
                                            </div>
                                            <div class=" col-md-6 form-group">
         <label for="password">Retape Mot de passe*</label>
             <input type="password" id="confirmPassword" name="confirmPassword" required class="form-control">
             
  <br>
  <small id="confirmHelp" style="color: red;"></small>
                                            </div>
                                        </div>
                                       
                                        <div class="row">
                             
 <div class=" col-md-6 form-group">
              <label for="exampleInputPassword1">N CNI ou Passport*</label>
             <input type="text" name="national_id"  class="form-control" id="exampleInputEmail1" required>
                                            </div>
                    <div class="col-md-6 form-group">
                <label for="exampleInputFile">Photo de profil</label>
                            <div class="input-group">
                             <div class="custom-file">
                           <input type="file" name="profile_pic" class="custom-file-input" id="exampleInputFile" accept=".jpg, .jpeg, .png, .gif">
                     <label class="custom-file-label" for="exampleInputFile">Choisir le fichier</label>
                                                    </div>
                                                    
                                                </div>
                                            </div>

                                        </div>

                                        <div class="row">
                                          
                                    <div class=" col-md-6 form-group">
                         <label for="exampleInputPassword1">Abonnement</label>
                 <input type="text" name="montant"  class="form-control" id="exampleInputEmail1" value="1000 FCFA via Orange ou MTN" readonly style="text-align: center;" required>
                                            </div>
<div class=" col-md-6 form-group">
                         <div class="g-recaptcha" data-sitekey="6LdUSFMrAAAAAFTZZJi-pYTs7GCM_r7w3FQx_okB"></div>
                                                      </div>




                                                                    </div>

            <button type="submit" class="tg-btn btn-primary btn-lg" style="margin-left: -16px;" id="submitBtn">Suivant <img src="assets/img/icons/right_arrow.svg" alt="" class="injectable" class="login__form"></button>
                                        </div>
                                    </div>
                                    <!-- /.card-body -->
                                    <div class="card-footer" style="margin-left:24px;">
                                        
                                         

                                         
                                    </div>
                                </form>
                            </div>
                    </div>
                </div>
            </div>
        </section>
        <!-- login-area-end -->


    </main>
    <!-- main-area-end -->
    <script>
document.getElementById('confirmPassword').addEventListener('input', function () {
  const pass = document.getElementById('password').value;
  const confirm = this.value;
  const btn = document.getElementById('submitBtn');
  const help = document.getElementById('confirmHelp');

  if (pass === confirm && pass.length > 0) {
    btn.disabled = false;
    help.textContent = '';
  } else {
    btn.disabled = true;
    help.textContent = "Les deux  mots de passe ne correspondent pas.";
  }
});
</script>


<script>
  const passwordInput = document.getElementById("password");
  const confirmInput = document.getElementById("confirmPassword");
  const passwordHelp = document.getElementById("passwordHelp");
  const confirmHelp = document.getElementById("confirmHelp");
  const submitBtn = document.getElementById("submitBtn");

  function isPasswordValid(password) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return regex.test(password);
  }

  function validateForm() {
    const password = passwordInput.value;
    const confirm = confirmInput.value;
    let valid = true;

    if (!isPasswordValid(password)) {
      passwordHelp.textContent = " Mot de passe trop faible (min. 8 caracteres, 1 maj, 1 min, 1 chiffre)";
      passwordInput.style.borderColor = "red";
      valid = false;
    } else {
      passwordHelp.textContent = "";
      passwordInput.style.borderColor = "green";
    }

    if (confirm !== password || confirm === "") {
      confirmHelp.textContent = "Les deux mots de passe ne correspondent pas";
      confirmInput.style.borderColor = "red";
      valid = false;
    } else {
      confirmHelp.textContent = "";
      confirmInput.style.borderColor = "green";
    }

    submitBtn.disabled = !valid;
  }

  passwordInput.addEventListener("input", validateForm);
  confirmInput.addEventListener("input", validateForm);

  function togglePassword(fieldId) {
    const input = document.getElementById(fieldId);
    input.type = input.type === "password" ? "text" : "password";
  }
</script>

<script src="https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/intlTelInput.min.js"></script>
<script>
  const phoneInput = document.querySelector("#phone");
  const countrySelect = document.querySelector("#country");

  const iti = window.intlTelInput(phoneInput, {
    initialCountry: countrySelect.value,
    separateDialCode: true,
    utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js"
  });

  // Mettre Ã  jour le champ numÃ©ro quand le pays est changÃ©
  countrySelect.addEventListener("change", function () {
    iti.setCountry(this.value);
  });
</script>

    <!-- JS here -->
    <script src="assets/js/vendor/jquery-3.6.0.min.js"></script>
    <script src="assets/js/bootstrap.min.js"></script>
    <script src="assets/js/jquery.magnific-popup.min.js"></script>
    <script src="assets/js/jquery.odometer.min.js"></script>
    <script src="assets/js/jquery.appear.js"></script>
    <script src="assets/js/swiper-bundle.min.js"></script>
    <script src="assets/js/jquery.parallaxScroll.min.js"></script>
    <script src="assets/js/jquery.marquee.min.js"></script>
    <script src="assets/js/tg-cursor.min.js"></script>
    <script src="assets/js/ajax-form.js"></script>
    <script src="assets/js/svg-inject.min.js"></script>
    <script src="assets/js/wow.min.js"></script>
    <script src="assets/js/aos.js"></script>
    <script src="assets/js/main.js"></script>
    <script>
        SVGInject(document.querySelectorAll("img.injectable"));
    </script>
</body>
<!-- Bouton WhatsApp flottant -->
    <!-- Bouton WhatsApp circulaire et bo te de chat -->
<div class="whatsapp-wrapper">
    <div id="whatsapp-button" class="whatsapp-button" onclick="toggleChat()">
        <img src="https://img.icons8.com/color/48/000000/whatsapp--v1.png" alt="WhatsApp">
    </div>
    <div id="whatsapp-chat" class="whatsapp-chat">
        <div class="chat-body">
            <p>Bonjour !<br>Besoin d'assistance ? Parlez à un conseiller.</p>
            <a href="https://wa.me/237677401841?text=Bonjour%2C%20je%20souhaite%20avoir%20plus%20d'informations"
               target="_blank" class="chat-button">
                Ouvrir WhatsApp
            </a>
        </div>
    </div>
</div>


<script>
function toggleChat() {
    const chat = document.getElementById("whatsapp-chat");

    // Toggle visible/hidden
    if (chat.style.display === "none" || chat.style.display === "") {
        chat.style.display = "block";
        chat.style.animation = "fadeInUp 0.5s ease-in-out";
        
        // Fermer automatiquement 5s après ouverture
        setTimeout(() => {
            chat.style.display = "none";
        }, 5000);
    } else {
        chat.style.display = "none";
    }
}

// Ouvre automatiquement après 5s, puis ferme après 5s
setTimeout(() => {
    const chatBox = document.getElementById("whatsapp-chat");
    chatBox.style.display = "block";
    chatBox.style.animation = "fadeInUp 0.5s ease-in-out";

    // Fermer automatiquement après 5s
    setTimeout(() => {
        chatBox.style.display = "none";
    }, 5000);
}, 5000);
</script>
</html>
<?php
} ?>
