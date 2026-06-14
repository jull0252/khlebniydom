<?php
require_once __DIR__ . '/../config/database.php';
requireAdmin();

$data = getJsonInput();
$id = (int)($data['id'] ?? $_GET['id'] ?? 0);

if (!$id) {
    jsonResponse(['error' => 'Не указан ID товара'], 400);
}

$pdo = getDB();
$fields = [];
$params = [];

foreach (['name','description','price','weight','image','icon','popular'] as $col) {
    if (isset($data[$col])) {
        $fields[] = "$col = ?";
        $params[] = $data[$col];
    }
}

if (isset($data['category'])) {
    $stmt = $pdo->prepare("SELECT id FROM categories WHERE slug = ?");
    $stmt->execute([$data['category']]);
    $cat = $stmt->fetch();
    if ($cat) {
        $fields[] = "category_id = ?";
        $params[] = (int)$cat['id'];
    }
}

if (empty($fields)) {
    jsonResponse(['error' => 'Нет данных для обновления'], 400);
}

$params[] = $id;
$stmt = $pdo->prepare("UPDATE products SET " . implode(', ', $fields) . " WHERE id = ?");
$stmt->execute($params);

jsonResponse(['message' => 'Товар обновлён']);
