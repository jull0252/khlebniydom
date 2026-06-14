<?php
require_once __DIR__ . '/../config/database.php';
requireAdmin();

$data = getJsonInput();
$id     = (int)($data['id'] ?? 0);
$status = $data['status'] ?? '';

$allowed = ['new', 'processing', 'delivered', 'cancelled'];
if (!$id || !in_array($status, $allowed)) {
    jsonResponse(['error' => 'Некорректные данные'], 400);
}

$pdo = getDB();
$stmt = $pdo->prepare("UPDATE orders SET status = ? WHERE id = ?");
$stmt->execute([$status, $id]);

jsonResponse(['message' => 'Статус заказа обновлён']);
