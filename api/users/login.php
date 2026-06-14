<?php
require_once __DIR__ . '/../config/database.php';

$data = getJsonInput();

$email    = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

if (!$email || !$password) {
    jsonResponse(['error' => 'Введите email и пароль'], 400);
}

$pdo = getDB();
$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password'])) {
    jsonResponse(['error' => 'Неверный email или пароль'], 401);
}

jsonResponse([
    'id'    => (int)$user['id'],
    'name'  => $user['name'],
    'email' => $user['email'],
    'phone' => $user['phone'],
    'role'  => $user['role'],
    'companyName' => $user['company_name'],
    'inn'   => $user['inn'],
    'token' => (string)$user['id'],
]);
