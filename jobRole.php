<?php
$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
header("Access-Control-Allow-Origin: " . ($origin ?: '*'));
header("Vary: Origin");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json;charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

require_once __DIR__ . '/authMiddleware.php';
require_once __DIR__ . '/jobRoleController.php';

$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$script_name_parts = explode('/', $_SERVER['SCRIPT_NAME']);
$script_name = end($script_name_parts);
$path_parts = array_values(array_filter(explode('/', $request_uri)));
$base_path_index = array_search($script_name, $path_parts);
$resource_code = ($base_path_index !== false && isset($path_parts[$base_path_index + 1])) ? $path_parts[$base_path_index + 1] : null;

$method = $_SERVER['REQUEST_METHOD'];
$response = null;

try {
    $input = json_decode(file_get_contents("php://input"), true) ?? [];

    if ($method === 'GET') {
        if ($resource_code) {
            $response = getJobRoleByCode($resource_code);
        } else {
            $response = getAllJobRoles(); // Controller handles ?status filter
        }
    } elseif ($method === 'POST') {
        if (!$resource_code) {
            $decoded_token_data = authenticate();
            $response = createJobRole($input);
        }
    } elseif ($method === 'PUT') {
        if ($resource_code) {
            $decoded_token_data = authenticate();
            $response = updateJobRole($resource_code, $input);
        }
    } elseif ($method === 'DELETE') {
        if ($resource_code) {
            $decoded_token_data = authenticate();
            $response = deleteJobRole($resource_code);
        }
    }
} catch (Throwable $e) {
    http_response_code(500);
    $response = ['error' => 'An internal error occurred', 'details' => $e->getMessage()];
}

if ($response) {
    echo json_encode($response);
} else if (!headers_sent()) {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
}
?>