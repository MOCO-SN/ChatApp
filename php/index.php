<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Timestamp, X-Signature");
header("Content-Type: application/json");

// Handle CORS preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ==========================================
// SECURITY: HMAC Handshake Verification
// ==========================================
define('API_SECRET', 'super_secure_shared_secret_key_2026'); // Must match the frontend

function verifyHandshake($body) {
    // Fallback for getting headers in various PHP environments
    $headers = getallheaders();
    $signature = $headers['X-Signature'] ?? $_SERVER['HTTP_X_SIGNATURE'] ?? '';
    $timestamp = $headers['X-Timestamp'] ?? $_SERVER['HTTP_X_TIMESTAMP'] ?? 0;

    // 1. Prevent Replay Attacks (Reject requests older than 5 minutes)
    $current_time = time();
    if (abs($current_time - $timestamp) > 300) {
        http_response_code(401);
        echo json_encode(["error" => "Handshake failed: Request expired"]);
        exit();
    }

    // 2. Recreate the signature (Timestamp + Body)
    $expectedSignature = hash_hmac('sha256', $timestamp . $body, API_SECRET);

    // 3. Verify the signature matches securely
    if (!hash_equals($expectedSignature, $signature)) {
        http_response_code(401);
        echo json_encode(["error" => "Handshake failed: Invalid signature"]);
        exit();
    }
}

// Get the requested endpoint path
$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Get JSON POST body
$json = file_get_contents('php://input');

// Run the security handshake BEFORE processing any routes
verifyHandshake($json);

$data = json_decode($json, true);

// ==========================================
// ROUTE: POST /api/upload-cloudinary
// ==========================================
if (strpos($request_uri, '/upload-cloudinary') !== false && $method === 'POST') {
    $base64Image = $data['image'] ?? '';
    
    if (empty($base64Image)) {
        http_response_code(400);
        echo json_encode(["error" => "No image data provided"]);
        exit();
    }

    // Cloudinary Signed Upload Configuration
    $cloudName = 'dpgyfh39j';
    $apiKey = '575655281787119'; 
    $apiSecret = '5BsOz5jgXyT-527oV2q8As6RfQg'; // MUST BE UPDATED
    $uploadPreset = 'chatme';
    
    $url = "https://api.cloudinary.com/v1_1/{$cloudName}/auto/upload";
    
    // Generate Cloudinary signature
    // Cloudinary requires parameters to be alphabetically sorted when generating the signature
    $timestamp = time();
    $signatureString = "timestamp={$timestamp}&upload_preset={$uploadPreset}{$apiSecret}";
    $signature = sha1($signatureString);
    
    $postFields = [
        'file' => $base64Image,
        'upload_preset' => $uploadPreset,
        'api_key' => $apiKey,
        'timestamp' => $timestamp,
        'signature' => $signature
    ];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postFields));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    curl_close($ch);

    echo $response;
    exit();
}

// ==========================================
// ROUTE: POST /api/send-demo-email
// ==========================================

// ==========================================
// ROUTE: POST /api/firebase-config
// ==========================================
if (strpos($request_uri, '/firebase-config') !== false && $method === 'POST') {
    echo json_encode([
        "apiKey" => "AIzaSyC57OazOqcOQWP4aIjUmhV3pmJl2aUyINE",
        "authDomain" => "chatnova-gs-ab31a.firebaseapp.com",
        "projectId" => "chatnova-gs-ab31a",
        "storageBucket" => "chatnova-gs-ab31a.appspot.com",
        "messagingSenderId" => "91924224066",
        "appId" => "1:91924224066:web:e21cddf4ebd1ab3eebb5db",
    ]);
    exit();
}

// ==========================================
// Fallback for unknown routes
// ==========================================
http_response_code(404);
echo json_encode(["error" => "API Endpoint not found"]);
exit();
?>
