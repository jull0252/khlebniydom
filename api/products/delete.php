<?php
require_once __DIR__ . '/../config/database.php';
requireAdmin();

$id = (int)($_GET['id'] ?? 0);
if (!$id) {
    jsonResponse(['error' => 'Не указан ID товара'], 400);
}

$pdo = getDB();
$stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
$stmt->execute([$id]);

jsonResponse(['message' => 'Товар удалён']);
