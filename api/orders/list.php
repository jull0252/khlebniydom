<?php
require_once __DIR__ . '/../config/database.php';

$pdo = getDB();

$user = getAuthUser();

if ($user && $user['role'] === 'admin') {
    // Админ видит все заказы
    $stmt = $pdo->query("
        SELECT o.*, GROUP_CONCAT(
            JSON_OBJECT('id', oi.product_id, 'name', oi.product_name, 'price', oi.price, 'quantity', oi.quantity, 'icon', oi.icon)
        ) AS items_json
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        GROUP BY o.id
        ORDER BY o.created_at DESC
    ");
    $orders = $stmt->fetchAll();
} elseif ($user) {
    // Обычный пользователь — только свои заказы
    $stmt = $pdo->prepare("
        SELECT o.*, GROUP_CONCAT(
            JSON_OBJECT('id', oi.product_id, 'name', oi.product_name, 'price', oi.price, 'quantity', oi.quantity, 'icon', oi.icon)
        ) AS items_json
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.user_id = ? OR o.customer_email = ?
        GROUP BY o.id
        ORDER BY o.created_at DESC
    ");
    $stmt->execute([$user['id'], $user['email']]);
    $orders = $stmt->fetchAll();
} else {
    jsonResponse([]);
}

// Парсим items_json
foreach ($orders as &$order) {
    $items = [];
    if ($order['items_json']) {
        $parts = explode('},{', trim($order['items_json'], '{}'));
        foreach ($parts as $part) {
            $part = '{' . $part . '}';
            $decoded = json_decode($part, true);
            if ($decoded) $items[] = $decoded;
        }
    }
    $order['items'] = $items;
    unset($order['items_json']);
}

jsonResponse($orders);
