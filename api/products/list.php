<?php
require_once __DIR__ . '/../config/database.php';

$pdo = getDB();

$category = $_GET['category'] ?? '';
$search   = $_GET['search'] ?? '';
$maxPrice = $_GET['maxPrice'] ?? '';
$sortBy   = $_GET['sortBy'] ?? 'default';
$popular  = $_GET['popular'] ?? '';

$sql = "SELECT p.*, c.name AS category_name, c.slug AS category_slug
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE 1=1";
$params = [];

if ($category && $category !== 'all') {
    $sql .= " AND c.slug = ?";
    $params[] = $category;
}

if ($search) {
    $sql .= " AND (p.name LIKE ? OR p.description LIKE ?)";
    $params[] = "%$search%";
    $params[] = "%$search%";
}

if ($maxPrice) {
    $sql .= " AND p.price <= ?";
    $params[] = (float)$maxPrice;
}

if ($popular === '1') {
    $sql .= " AND p.popular = 1";
}

switch ($sortBy) {
    case 'price-asc':  $sql .= " ORDER BY p.price ASC";  break;
    case 'price-desc': $sql .= " ORDER BY p.price DESC"; break;
    case 'name-asc':   $sql .= " ORDER BY p.name ASC";   break;
    default:           $sql .= " ORDER BY p.id ASC";      break;
}

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$products = $stmt->fetchAll();

jsonResponse($products);
