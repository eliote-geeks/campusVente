<?php
session_start();
require_once __DIR__ . '/Monetbil.php';
require_once __DIR__ . '/conf/config.php'; // connexion à $mysqli

// Vérifier que la requête est bien POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: register.php');
    exit;
}

// Champs obligatoires
$requiredFields = ['name', 'email', 'phone', 'pays', 'ville', 'address', 'profession', 'username', 'password'];
foreach ($requiredFields as $field) {
    if (empty($_POST[$field])) {
        die("Le champ $field est requis.");
    }
}

// Stocker les données du formulaire
$_SESSION['user_data'] = [
    'name'         => trim($_POST['name']),
    'email'        => trim($_POST['email']),
    'phone'        => trim($_POST['phone']),
    'pays'         => trim($_POST['pays']),
    'ville'        => trim($_POST['ville']),
    'address'      => trim($_POST['address']),
    'profession'   => trim($_POST['profession']),
    'username'     => trim($_POST['username']),
    'password'     => password_hash($_POST['password'], PASSWORD_DEFAULT),
    'parrain_id'   => isset($_POST['parrain_id']) && $_POST['parrain_id'] !== '' ? trim($_POST['parrain_id']) : null,
    'parrain_link' => isset($_POST['parrain_link']) ? trim($_POST['parrain_link']) : null,
    'photo_name'   => 'dist/img/avatar.jpg' // par défaut
];

// Gestion de la photo si elle est présente
if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
    $uniqueName = uniqid() . '_' . basename($_FILES['photo']['name']);
    $_SESSION['user_data']['photo_name'] = $uniqueName;
    $_SESSION['user_data']['photo_temp_path'] = $_FILES['photo']['tmp_name'];
}

// Générer item_ref unique
$item_ref = uniqid('item_', true);
$_SESSION['item_ref'] = $item_ref;

// Enregistrer les données dans inscriptions_temp
$data_serialized = json_encode($_SESSION['user_data']);
$stmt = $mysqli->prepare("INSERT INTO inscriptions_temp (email, data, item_ref) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $_SESSION['user_data']['email'], $data_serialized, $item_ref);
$stmt->execute();
$stmt->close();

// Configuration Monetbil
Monetbil::setServiceKey('9SiC3m3h0CD4PuVHqYIrW7Z7j4iW2lPs');
Monetbil::setAmount('100');
Monetbil::setCurrency('XAF');
Monetbil::setPhone($_SESSION['user_data']['phone']);
Monetbil::setItem_ref($item_ref); // important !
Monetbil::setUser($_SESSION['user_data']['email']);
Monetbil::setLocale('fr');
Monetbil::setCountry('CM');
Monetbil::setReturn_url('https://nkapdey.net/client/confirmation.php');
Monetbil::setNotify_url('https://nkapdey.net/client/callback_monetbil.php');

// Générer l’URL de paiement
$base_url = Monetbil::WIDGET_URL . Monetbil::getWidgetVersion() . '/' . Monetbil::getServiceKey();
$params = [
    'amount'      => Monetbil::getAmount(),
    'phone'       => Monetbil::getPhone(),
    'currency'    => Monetbil::getCurrency(),
    'item_ref'    => Monetbil::getItem_ref(),
    'user'        => Monetbil::getUser(),
    'locale'      => Monetbil::getLocale(),
    'country'     => Monetbil::getCountry(),
    'return_url'  => Monetbil::getReturn_url(),
    'notify_url'  => Monetbil::getNotify_url()
];

$payment_url = $base_url . '?' . http_build_query($params);

// Rediriger vers Monetbil
header("Location: $payment_url");
exit;
