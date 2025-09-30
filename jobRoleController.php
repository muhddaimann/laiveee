<?php
require_once __DIR__ . '../../dbConn.php';

// --- CREATE --- //
function createJobRole($input) {
    global $conn;
    
    $code = $input['Code'];
    $title = $input['Title'];
    $department = $input['Department'] ?? null;
    $level = $input['Level'] ?? null;
    $status = $input['Status'] ?? 'Draft';
    $description = $input['Description'] ?? null;
    $responsibilities = isset($input['Responsibilities']) && is_array($input['Responsibilities']) ? json_encode($input['Responsibilities']) : ($input['Responsibilities'] ?? null);
    $qualifications = isset($input['Qualifications']) && is_array($input['Qualifications']) ? json_encode($input['Qualifications']) : ($input['Qualifications'] ?? null);
    $benefits = isset($input['Benefits']) && is_array($input['Benefits']) ? json_encode($input['Benefits']) : ($input['Benefits'] ?? null);

    $sql = "INSERT INTO job_roles (Code, Title, Department, Level, Status, Description, Responsibilities, Qualifications, Benefits) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    if (!$stmt) { http_response_code(500); return ["error" => "Failed to prepare statement: " . $conn->error]; }

    $stmt->bind_param("sssssssss", $code, $title, $department, $level, $status, $description, $responsibilities, $qualifications, $benefits);

    if ($stmt->execute()) {
        $newId = $stmt->insert_id;
        $sel = $conn->prepare("SELECT * FROM job_roles WHERE ID = ?");
        $sel->bind_param("i", $newId);
        $sel->execute();
        $row = $sel->get_result()->fetch_assoc();
        http_response_code(201);
        return $row;
    } else {
        if ($conn->errno === 1062) { http_response_code(409); return ["error" => "Duplicate entry for Code."]; }
        http_response_code(500);
        return ["error" => "Error creating job role: " . $conn->error];
    }
}

// --- READ --- //
function getAllJobRoles() {
    global $conn;
    $status = $_GET['status'] ?? null;

    $sql = "SELECT * FROM job_roles";
    $params = [];
    $types = '';

    if ($status) {
        $sql .= " WHERE Status = ?";
        $params[] = $status;
        $types .= 's';
    }
    $sql .= " ORDER BY Department, Title";

    $stmt = $conn->prepare($sql);
    if ($status) {
        $stmt->bind_param($types, ...$params);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    $roles = [];
    while ($row = $result->fetch_assoc()) {
        $roles[] = $row;
    }
    return $roles;
}

function getJobRoleByCode($code) {
    global $conn;
    $sql = "SELECT * FROM job_roles WHERE Code = ?";
    $stmt = $conn->prepare($sql);
    if (!$stmt) { http_response_code(500); return ["error" => "Failed to prepare statement: " . $conn->error]; }

    $stmt->bind_param("s", $code);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        return $result->fetch_assoc();
    } else {
        http_response_code(404);
        return ["error" => "Job role not found"];
    }
}

// --- UPDATE --- //
function updateJobRole($code, $input) {
    global $conn;

    $fields = ['Title', 'Department', 'Level', 'Status', 'Description', 'Responsibilities', 'Qualifications', 'Benefits'];
    $set_clauses = [];
    $params = [];
    $types = '';

    foreach ($fields as $field) {
        if (isset($input[$field])) {
            $set_clauses[] = "`$field` = ?";
            $value = $input[$field];
            if (in_array($field, ['Responsibilities', 'Qualifications', 'Benefits']) && is_array($value)) {
                $params[] = json_encode($value);
            } else {
                $params[] = $value;
            }
            $types .= 's';
        }
    }

    if (empty($set_clauses)) {
        http_response_code(400);
        return ['error' => 'No fields to update'];
    }

    $params[] = $code;
    $types .= 's';

    $sql = "UPDATE job_roles SET " . implode(', ', $set_clauses) . " WHERE Code = ?";
    $stmt = $conn->prepare($sql);
    if (!$stmt) { http_response_code(500); return ["error" => "Failed to prepare statement: " . $conn->error]; }
    
    $stmt->bind_param($types, ...$params);

    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            return getJobRoleByCode($code);
        } else {
            return ['message' => 'No changes made or role not found'];
        }
    } else {
        http_response_code(500);
        return ['error' => 'Error updating job role: ' . $conn->error];
    }
}

// --- DELETE --- //
function deleteJobRole($code) {
    global $conn;
    $sql = "DELETE FROM job_roles WHERE Code = ?";
    $stmt = $conn->prepare($sql);
    if (!$stmt) { http_response_code(500); return ["error" => "Failed to prepare statement: " . $conn->error]; }

    $stmt->bind_param("s", $code);

    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            http_response_code(200);
            return ['success' => true, 'message' => 'Job role deleted successfully.'];
        } else {
            http_response_code(404);
            return ['error' => 'Job role not found'];
        }
    } else {
        http_response_code(500);
        return ['error' => 'Error deleting job role: ' . $conn->error];
    }
}
?>