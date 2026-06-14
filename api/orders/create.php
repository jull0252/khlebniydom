<?php
require_once __DIR__ . '/../config/database.php';

$data = getJsonInput();

$customerName  = trim($data['customerName'] ?? '');
$customerPhone = trim($data['customerPhone'] ?? '');
$customerEmail = trim($data['customerEmail'] ?? '');
$address       = trim($data['address'] ?? '');
$deliveryMethod = $data['deliveryMethod'] ?? 'delivery';
$paymentMethod = $data['paymentMethod'] ?? 'card';
$comment       = trim($data['comment'] ?? '');
$subtotal      = (float)($data['subtotal'] ?? 0);
$deliveryCost  = (float)($data['deliveryCost'] ?? 0);
$total         = (float)($data['total'] ?? 0);
$items         = $data['items'] ?? [];

if (!$customerName || !$customerPhone || !$customerEmail || empty($items)) {
    jsonResponse(['error' => 'Заполните обязательные поля'], 400);
}

// Получить user_id из токена (опционально)
$user = getAuthUser();
$userId = $user ? (int)$user['id'] : null;

$pdo = getDB();
$pdo->beginTransaction();

try {
    $stmt = $pdo->prepare("
        INSERT INTO orders (user_id, customer_name, customer_phone, customer_email,
                            address, delivery_method, payment_method, comment,
                            subtotal, delivery_cost, total, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')
    ");
    $stmt->execute([$userId, $customerName, $customerPhone, $customerEmail,
                    $address, $deliveryMethod, $paymentMethod, $comment,
                    $subtotal, $deliveryCost, $total]);
    $orderId = (int)$pdo->lastInsertId();

    $stmtItem = $pdo->prepare("
        INSERT INTO order_items (order_id, product_id, product_name, price, quantity, icon)
        VALUES (?, ?, ?, ?, ?, ?)
    ");

    foreach ($items as $item) {
        $stmtItem->execute([
            $orderId,
            $item['id'] ?? null,
            $item['name'] ?? '',
            (float)($item['price'] ?? 0),
            (int)($item['quantity'] ?? 1),
            $item['icon'] ?? '',
        ]);
    }

    $pdo->commit();
    jsonResponse(['id' => $orderId, 'message' => 'Заказ оформлен'], 201);
} catch (Exception $e) {
    $pdo->rollBack();
    jsonResponse(['error' => 'Ошибка при создании заказа: ' . $e->getMessage()], 500);
}
