<?php
require_once __DIR__ . '/../config/database.php';

$data = getJsonInput();

$company     = trim($data['company'] ?? '');
$inn         = trim($data['inn'] ?? '');
$contactName = trim($data['name'] ?? '');
$phone       = trim($data['phone'] ?? '');
$email       = trim($data['email'] ?? '');
$volume      = trim($data['volume'] ?? '');
$comment     = trim($data['comment'] ?? '');

if (!$company || !$contactName || !$phone || !$email) {
    jsonResponse(['error' => 'Заполните обязательные поля'], 400);
}

$pdo = getDB();
$stmt = $pdo->prepare("
    INSERT INTO b2b_requests (company, inn, contact_name, phone, email, volume, comment)
    VALUES (?, ?, ?, ?, ?, ?, ?)
");
$stmt->execute([$company, $inn, $contactName, $phone, $email, $volume, $comment]);

jsonResponse(['message' => 'Заявка отправлена'], 201);
