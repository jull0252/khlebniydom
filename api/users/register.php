<?php
require_once __DIR__ . '/../config/database.php';

$data = getJsonInput();

$name     = trim($data['name'] ?? '');
$email    = trim($data['email'] ?? '');
$phone    = trim($data['phone'] ?? '');
$password = $data['password'] ?? '';
$role     = $data['role'] ?? 'b2c';
$company  = trim($data['companyName'] ?? '');
$inn      = trim($data['inn'] ?? '');

if (!$name || !$email || !$password) {
    jsonResponse(['error' => 'Заполните обязательные поля'], 400);
}
if (strlen($password) < 6) {
    jsonResponse(['error' => 'Пароль должен быть не менее 6 символов'], 400);
}

$pdo = getDB();

// Проверка дубликата email
$stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute([$email]);
if ($stmt->fetch()) {
    jsonResponse(['error' => 'Email уже зарегистрирован'], 409);
}

$hash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $pdo->prepare("
    INSERT INTO users (name, email, phone, password, role, company_name, inn)
    VALUES (?, ?, ?, ?, ?, ?, ?)
");
$stmt->execute([$name, $email, $phone, $hash, $role, $company, $inn]);
$userId = (int)$pdo->lastInsertId();

jsonResponse([
    'id'    => $userId,
    'name'  => $name,
    'email' => $email,
    'phone' => $phone,
    'role'  => $role,
    'companyName' => $company,
    'inn'   => $inn,
    'token' => (string)$userId,
], 201);
