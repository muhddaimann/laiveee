<?php
$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
header("Access-Control-Allow-Origin: " . ($origin ?: '*'));
header("Vary: Origin");
header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json;charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

require_once __DIR__ . '../../middlewares/authMiddleware.php';
require_once __DIR__ . '../../controllers/candidateController.php';

$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$script_name_parts = explode('/', $_SERVER['SCRIPT_NAME']);
$script_name = end($script_name_parts);
$path_parts = array_values(array_filter(explode('/', $request_uri)));
$base_path_index = array_search($script_name, $path_parts);
$resource_parts = ($base_path_index !== false && isset($path_parts[$base_path_index + 1])) ? array_slice($path_parts, $base_path_index + 1) : [];

$token = null;
$action = null;

if (count($resource_parts) > 0) {
    if (strlen($resource_parts[0]) === 32 && ctype_xdigit($resource_parts[0])) {
        $token = $resource_parts[0];
        $action = $resource_parts[1] ?? null;
    } else {
        $action = $resource_parts[0];
    }
}

$method = $_SERVER['REQUEST_METHOD'];
$response = null;
$decoded_token_data = null;

try {
    $input = json_decode(file_get_contents("php://input"), true) ?? [];

    if ($method === 'GET') {
        if ($token && $action === 'record') {
            $decoded_token_data = authenticate();
            $response = getCandidateRecords($token);
        } elseif ($token && !$action) {
            $response = getCandidateByPublicToken($token);
        } elseif (!$token) {
            $decoded_token_data = authenticate();
            $response = getAllCandidates();
        }
    } elseif ($method === 'POST') {
        if ($token && $action === 'record') {
            $decoded_token_data = authenticate();
            $response = createCandidateRecord($token, $input);
        } elseif ($token && $action === 'invite') {
            $decoded_token_data = authenticate();
            $response = inviteCandidate($token);
        } elseif ($action === 'expire') {
            $response = expireCandidates();
        } elseif (!$token && !$action) {
            $decoded_token_data = authenticate();
            $response = registerCandidate($input);
        }
    } elseif ($method === 'PUT') {
        if ($token && $action === 'status') {
            $new_status = $input['status'] ?? null;
            if (!$new_status) {
                http_response_code(400);
                $response = ['error' => 'New status is required.'];
            } else {
                if ($new_status === 'passed' || $new_status === 'rejected') {
                    $decoded_token_data = authenticate();
                }
                $response = updateCandidateStatus($token, $new_status);
            }
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