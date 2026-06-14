<?php
/**
 * Настройки подключения к БД и общие функции
 *
 * Инструкция:
 * 1. Откройте phpMyAdmin (http://localhost/phpmyadmin)
 * 2. Импортируйте файл database/schema.sql
 * 3. При необходимости измените параметры подключения ниже
 */

define('DB_HOST', 'localhost');
define('DB_NAME', 'khlebniy_dom');
define('DB_USER', 'root');
define('DB_PASS', '');          // в XAMPP пароль пустой
define('DB_CHARSET', 'utf8mb4');

// CORS — разрешаем запросы с React-фронтенда
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Ответ на preflight-запрос (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

/**
 * Подключение к MySQL через PDO
 */
function getDB(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=' . DB_CHARSET;
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Ошибка подключения к БД: ' . $e->getMessage()]);
            exit();
        }
    }
    return $pdo;
}

/**
 * Прочитать JSON-тело запроса
 */
function getJsonInput(): array {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    return is_array($data) ? $data : [];
}

/**
 * Отправить JSON-ответ
 */
function jsonResponse(array $data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit();
}

/**
 * Получить авторизованного пользователя по Bearer-токену
 */
function getAuthUser(): ?array {
    $headers = getallheaders();
    $auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    if (!preg_match('/^Bearer\s+(.+)$/', $auth, $m)) {
        return null;
    }
    $token = $m[1];
    $pdo = getDB();
    $stmt = $pdo->prepare("SELECT id, name, email, phone, role, company_name, inn FROM users WHERE id = ?");
    $stmt->execute([(int)$token]);
    return $stmt->fetch() ?: null;
}

/**
 * Требовать авторизацию
 */
function requireAuth(): array {
    $user = getAuthUser();
    if (!$user) {
        jsonResponse(['error' => 'Требуется авторизация'], 401);
    }
    return $user;
}

/**
 * Требовать роль администратора
 */
function requireAdmin(): array {
    $user = requireAuth();
    if ($user['role'] !== 'admin') {
        jsonResponse(['error' => 'Доступ запрещён'], 403);
    }
    return $user;
}
