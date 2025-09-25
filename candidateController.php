    <?php
require_once __DIR__ . '../../dbConn.php';

// --- GET --- //
function getCandidateByPublicToken($token) {
    global $conn;
    $updateSql = "UPDATE candidates SET FirstOpenedAt = COALESCE(FirstOpenedAt, NOW()), LastActivityAt = NOW() WHERE PublicToken = ? AND FirstOpenedAt IS NULL";
    $updateStmt = $conn->prepare($updateSql);
    if ($updateStmt) {
        $updateStmt->bind_param("s", $token);
        $updateStmt->execute();
        $updateStmt->close();
    }

    $sql = "SELECT FullName, ByName, Role FROM candidates WHERE PublicToken = ?";
    $stmt = $conn->prepare($sql);
    if (!$stmt) { http_response_code(500); return ["error" => "Failed to prepare statement: " . $conn->error]; }

    $stmt->bind_param("s", $token);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        return $result->fetch_assoc();
    } else {
        http_response_code(404);
        return ["error" => "Candidate not found"];
    }
}

function getAllCandidates() {
    global $conn;
    // Auth is handled in the router before calling this
    $sql = "SELECT ID, PublicToken, FullName, ByName, Email, Role, Status, Stage, CreatedDateTime FROM candidates ORDER BY CreatedDateTime DESC";
    $res = $conn->query($sql);
    if (!$res) { return ["error" => "Error fetching candidates: " . $conn->error]; }

    $rows = [];
    while ($row = $res->fetch_assoc()) $rows[] = $row;
    return $rows;
}

// --- CREATE --- //
function registerCandidate($input) {
    global $conn;
    // Auth is handled in the router
    $staffId = $GLOBALS['decoded_token']->staff_id;

    $publicToken = bin2hex(random_bytes(16));
    $full_name = $input['full_name'];
    $email = $input['email'];
    $role = $input['role'];
    $by_name = $input['by_name'] ?? null;

    $sql = "INSERT INTO candidates (PublicToken, FullName, ByName, Email, Role, CreatedByStaffID) VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    if (!$stmt) { http_response_code(500); return ["error" => "Failed to prepare statement: " . $conn->error]; }

    $stmt->bind_param("sssssi", $publicToken, $full_name, $by_name, $email, $role, $staffId);

    if ($stmt->execute()) {
        $newId = $stmt->insert_id;
        $sel = $conn->prepare("SELECT * FROM candidates WHERE ID = ?");
        $sel->bind_param("i", $newId);
        $sel->execute();
        $row = $sel->get_result()->fetch_assoc();
        http_response_code(201);
        return $row;
    } else {
        if ($conn->errno === 1062) { http_response_code(409); return ["error" => "Duplicate entry."]; }
        http_response_code(500);
        return ["error" => "Error creating candidate: " . $conn->error];
    }
}

// --- UPDATE STATUS --- //
function inviteCandidate($token) {
    global $conn;
    $sql = "UPDATE candidates SET Status = 'invited', InviteSentAt = NOW(), ExpiresAt = NOW() + INTERVAL 2 DAY, LastActivityAt = NOW() WHERE PublicToken = ? AND Status = 'registered'";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $token);
    $stmt->execute();
    return ["success" => $stmt->affected_rows > 0];
}

function updateCandidateStatus($token, $new_status) {
    global $conn;
    $sql = '';
    $params = [];

    switch ($new_status) {
        case 'completed':
            $sql = "UPDATE candidates SET Status = 'completed', CompletedAt = NOW(), LastActivityAt = NOW() WHERE PublicToken = ? AND Status = 'invited'";
            break;
        case 'withdrawn':
            $sql = "UPDATE candidates SET Status = 'withdrawn', WithdrawnAt = NOW(), LastActivityAt = NOW() WHERE PublicToken = ?";
            break;
        case 'passed':
        case 'rejected':
            // Auth for this specific action should be checked in the router
            $sql = "UPDATE candidates SET Status = ?, DecisionAt = NOW(), LastActivityAt = NOW() WHERE PublicToken = ? AND Status = 'completed'";
            $params = [$new_status];
            break;
        default: return ['error' => 'Invalid status'];
    }

    array_push($params, $token);
    $stmt = $conn->prepare($sql);
    $stmt->bind_param(str_repeat('s', count($params)), ...$params);
    $stmt->execute();
    return ["success" => $stmt->affected_rows > 0, "status" => $new_status];
}

// --- BATCH JOB --- //
function expireCandidates() {
    global $conn;
    $sql = "UPDATE candidates SET Status = 'expired', LastActivityAt = NOW() WHERE ExpiresAt < NOW() AND Status = 'invited'";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    return ["success" => true, "expired_count" => $stmt->affected_rows];
}

// --- RECORDS --- //
function getCandidateRecords($token) {
    global $conn;
    $c_sql = "SELECT ID FROM candidates WHERE PublicToken = ?";
    $c_stmt = $conn->prepare($c_sql);
    if (!$c_stmt) { http_response_code(500); return ["error" => "Failed to prepare statement: " . $conn->error]; }
    $c_stmt->bind_param("s", $token);
    $c_stmt->execute();
    $c_result = $c_stmt->get_result();
    if ($c_result->num_rows === 0) { http_response_code(404); return ["error" => "Candidate not found"]; }
    $candidate_id = $c_result->fetch_assoc()['ID'];

    $r_sql = "SELECT * FROM candidate_records WHERE candidate_id = ? ORDER BY created_at DESC";
    $r_stmt = $conn->prepare($r_sql);
    if (!$r_stmt) { http_response_code(500); return ["error" => "Failed to prepare statement: " . $conn->error]; }
    $r_stmt->bind_param("i", $candidate_id);
    $r_stmt->execute();
    $result = $r_stmt->get_result();
    $records = [];
    while ($row = $result->fetch_assoc()) {
        $records[] = $row;
    }
    return $records;
}

function createCandidateRecord($token, $input) {
    global $conn;
    $c_sql = "SELECT ID FROM candidates WHERE PublicToken = ?";
    $c_stmt = $conn->prepare($c_sql);
    if (!$c_stmt) { http_response_code(500); return ["error" => "Failed to prepare statement: " . $conn->error]; }
    $c_stmt->bind_param("s", $token);
    $c_stmt->execute();
    $c_result = $c_stmt->get_result();
    if ($c_result->num_rows === 0) { http_response_code(404); return ["error" => "Candidate not found"]; }
    $candidate_id = $c_result->fetch_assoc()['ID'];

    $input['candidate_id'] = $candidate_id;

    $columns = [];
    $placeholders = [];
    $values = [];
    $types = '';

    $schema = [
        'candidate_id' => 'i', 'language_pref' => 's', 'ra_full_name' => 's', 'ra_candidate_email' => 's', 'ra_candidate_phone' => 's',
        'ra_highest_education' => 's', 'ra_current_role' => 's', 'ra_years_experience' => 'd', 'ra_professional_summary' => 's',
        'ra_related_links' => 's', 'ra_certs_relate' => 's', 'ra_skill_match' => 's', 'ra_experience_match' => 's', 'ra_concern_areas' => 's',
        'ra_strengths' => 's', 'ra_rolefit_score' => 'd', 'ra_rolefit_reason' => 's', 'int_started_at' => 's', 'int_ended_at' => 's',
        'int_average_score' => 'd', 'int_spoken_score' => 'd', 'int_spoken_reason' => 's', 'int_behavior_score' => 'd', 'int_behavior_reason' => 's',
        'int_communication_score' => 'd', 'int_communication_reason' => 's', 'int_knockouts' => 's', 'int_summary' => 's', 'int_full_transcript' => 's',
        'ra_input_tokens' => 'i', 'ra_output_tokens' => 'i', 'int_input_tokens' => 'i', 'int_output_tokens' => 'i', 'int_audio_sec' => 'i',
        'total_cost_usd' => 'd', 'ra_json_payload' => 's', 'int_scores_json' => 's'
    ];

    foreach ($schema as $key => $type) {
        if (isset($input[$key])) {
            $columns[] = "`$key`";
            $placeholders[] = '?';
            $values[] = is_array($input[$key]) ? json_encode($input[$key]) : $input[$key];
            $types .= $type;
        }
    }

    if (empty($columns)) { http_response_code(400); return ['error' => 'No data provided to create record.']; }

    $sql = sprintf("INSERT INTO candidate_records (%s) VALUES (%s)", implode(', ', $columns), implode(', ', $placeholders));
    $stmt = $conn->prepare($sql);
    if (!$stmt) { http_response_code(500); return ["error" => "Failed to prepare statement: " . $conn->error]; }

    $stmt->bind_param($types, ...$values);

    if ($stmt->execute()) {
        $newId = $stmt->insert_id;
        $sel = $conn->prepare("SELECT * FROM candidate_records WHERE id = ?");
        $sel->bind_param("i", $newId);
        $sel->execute();
        $row = $sel->get_result()->fetch_assoc();
        http_response_code(201);
        return $row;
    } else {
        http_response_code(500);
        return ["error" => "Error creating candidate record: " . $conn->error];
    }
}
?>