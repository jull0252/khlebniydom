<?php
require_once __DIR__ . '/../config/database.php';
requireAdmin();

$data = getJsonInput();

$name        = trim($data['name'] ?? '');
$price       = (float)($data['price'] ?? 0);
$weight      = (float)($data['weight'] ?? 0.5);
$description = trim($data['description'] ?? '');
$categorySlug = $data['category'] ?? 'hleb';
$image       = trim($data['image'] ?? '');
$icon        = trim($data['icon'] ?? '');
$popular     = !empty($data['popular']) ? 1 : 0;

if (!$name || $price <= 0) {
    jsonResponse(['error' => 'Заполните название и цену'], 400);
}

$pdo = getDB();

// Получить ID категории по slug
$stmt = $pdo->prepare("SELECT id FROM categories WHERE slug = ?");
$stmt->execute([$categorySlug]);
$cat = $stmt->fetch();
$categoryId = $cat ? (int)$cat['id'] : null;

$stmt = $pdo->prepare("
    INSERT INTO products (name, description, price, weight, category_id, image, icon, popular)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
");
$stmt->execute([$name, $description, $price, $weight, $categoryId, $image, $icon, $popular]);

jsonResponse(['id' => (int)$pdo->lastInsertId(), 'message' => 'Товар добавлен'], 201);
