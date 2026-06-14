<?php
/**
 * Маршрутизатор API
 *
 * Используется, если включен mod_rewrite (.htaccess).
 * Если не работает — обращайтесь к файлам напрямую:
 *   api/users/login.php
 *   api/products/list.php
 *   и т.д.
 */

$route = $_GET['route'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

$routes = [
    'users/login'         => 'users/login.php',
    'users/register'      => 'users/register.php',
    'users/profile'       => 'users/profile.php',
    'products/list'       => 'products/list.php',
    'products/add'        => 'products/add.php',
    'products/update'     => 'products/update.php',
    'products/delete'     => 'products/delete.php',
    'orders/create'       => 'orders/create.php',
    'orders/list'         => 'orders/list.php',
    'orders/update-status'=> 'orders/update_status.php',
    'b2b/request'         => 'b2b/request.php',
];

if (isset($routes[$route])) {
    require __DIR__ . '/' . $routes[$route];
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Endpoint not found', 'route' => $route]);
}
