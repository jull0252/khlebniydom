<?php
require_once __DIR__ . '/../config/database.php';
$user = requireAuth();
$pdo = getDB();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    jsonResponse($user);
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = getJsonInput();
    $fields = [];
    $params = [];

    foreach (['name','phone','company_name','inn'] as $col) {
        $field = $col === 'company_name' ? 'companyName' : $col;
        if (isset($data[$field])) {
            $fields[] = "$col = ?";
            $params[] = trim($data[$field]);
        }
    }

    if (empty($fields)) {
        jsonResponse(['error' => 'Нет данных для обновления'], 400);
    }

    $params[] = $user['id'];
    $stmt = $pdo->prepare("UPDATE users SET " . implode(', ', $fields) . " WHERE id = ?");
    $stmt->execute($params);

    // Вернуть обновлённые данные
    $stmt = $pdo->prepare("SELECT id, name, email, phone, role, company_name, inn FROM users WHERE id = ?");
    $stmt->execute([$user['id']]);
    jsonResponse($stmt->fetch());
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT' && ($data['oldPassword'] ?? '')) {
    $data = getJsonInput();
    $stmt = $pdo->prepare("SELECT password FROM users WHERE id = ?");
    $stmt->execute([$user['id']]);
    $row = $stmt->fetch();

    if (!password_verify($data['oldPassword'], $row['password'])) {
        jsonResponse(['error' => 'Неверный текущий пароль'], 403);
    }

    if (strlen($data['newPassword'] ?? '') < 6) {
        jsonResponse(['error' => 'Новый пароль должен быть не менее 6 символов'], 400);
    }

    $hash = password_hash($data['newPassword'], PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
    $stmt->execute([$hash, $user['id']]);
    jsonResponse(['message' => 'Пароль изменён']);
}
