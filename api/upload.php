<?php
require_once __DIR__ . '/config/database.php';
requireAdmin();

$file = $_FILES['image'] ?? null;

if (!$file || $file['error'] !== UPLOAD_ERR_OK) {
    jsonResponse(['error' => 'Ошибка загрузки файла'], 400);
}

$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

$allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
if (!in_array($mime, $allowed)) {
    jsonResponse(['error' => 'Допустимы только JPEG, PNG, GIF, WebP'], 400);
}

$maxSize = 5 * 1024 * 1024;
if ($file['size'] > $maxSize) {
    jsonResponse(['error' => 'Файл не должен превышать 5 МБ'], 400);
}

$ext = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = uniqid('img_', true) . '.' . $ext;
$dest = __DIR__ . '/uploads/' . $filename;

if (!move_uploaded_file($file['tmp_name'], $dest)) {
    jsonResponse(['error' => 'Не удалось сохранить файл'], 500);
}

$baseUrl = rtrim((isset($_SERVER['HTTPS']) ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['SCRIPT_NAME']), '/');
$url = $baseUrl . '/uploads/' . $filename;

jsonResponse(['url' => $url, 'filename' => $filename]);
