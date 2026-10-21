<?php
// submit_contact.php

// Set headers for JSON response
header('Content-Type: application/json');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
    exit;
}

// 1. Collect and Sanitise Input Data
$name = isset($_POST['name']) ? strip_tags(trim($_POST['name'])) : '';
$email = isset($_POST['email']) ? filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL) : '';
$phone = isset($_POST['phone']) ? strip_tags(trim($_POST['phone'])) : '';
$subject = isset($_POST['subject']) ? strip_tags(trim($_POST['subject'])) : '';
$inquiry = isset($_POST['inquiry']) ? strip_tags(trim($_POST['inquiry'])) : '';
$message = isset($_POST['message']) ? strip_tags(trim($_POST['message'])) : '';

// Basic Validation
if (empty($name) || empty($email) || empty($message) || empty($phone)) {
    echo json_encode(['status' => 'error', 'message' => 'Please fill in all required fields.']);
    exit;
}

// 2. Save Data to MySQL Database
// Credentials live in config.php (not in Git). Copy config.example.php to config.php on the server.
require __DIR__ . '/config.php';
$db_host = DB_HOST;
$db_user = DB_USER;
$db_pass = DB_PASS;
$db_name = DB_NAME;

$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    // If DB connection fails, we log it and proceed to send email if possible
    error_log("Connection failed: " . $conn->connect_error);
    // Optionally return error, or fallback to file save.
    // For now, we will try to save to file as backup.
    $contactData = [
        'timestamp' => date('Y-m-d H:i:s'),
        'name' => $name,
        'email' => $email,
        'phone' => $phone,
        'subject' => $subject,
        'inquiry' => $inquiry,
        'message' => $message
    ];
    $file = 'contacts_backup.json';
    $current_data = file_exists($file) ? json_decode(file_get_contents($file), true) : [];
    if (!is_array($current_data)) $current_data = [];
    $current_data[] = $contactData;
    file_put_contents($file, json_encode($current_data, JSON_PRETTY_PRINT));
} else {
    // Prepare and bind
    $stmt = $conn->prepare("INSERT INTO contacts (name, email, phone, subject, inquiry, message, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())");
    if ($stmt) {
        $stmt->bind_param("ssssss", $name, $email, $phone, $subject, $inquiry, $message);
        $stmt->execute();
        $stmt->close();
    } else {
        error_log("Error preparing statement: " . $conn->error);
    }
    $conn->close();
}


// 3. Send Email Reply to User (Ack)
$to = $email;
$email_subject = "Thank you for contacting Sri Lakshmi Narayana Oil Mill";
$email_message = "Dear $name,\n\n";
$email_message .= "Thank you for reaching out to us. We have received your message regarding '$subject'.\n";
$email_message .= "We will contact you soon.\n\n";
$email_message .= "Best Regards,\nSri Lakshmi Narayana Oil Mill Team\nwww.sundaramoils.com";

$headers = "From: info@sundaramoils.com\r\n";
$headers .= "Reply-To: info@sundaramoils.com\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

// Attempt to send user email
@mail($to, $email_subject, $email_message, $headers);


// 4. Send Notification to Admin
$admin_to = "sc.manishankar@gmail.com, info@sundaramoils.com";
$admin_subject = "New Contact Inquiry: $subject";
$admin_message = "New contact form submission:\n\n";
$admin_message .= "Name: $name\n";
$admin_message .= "Email: $email\n";
$admin_message .= "Phone: $phone\n"; // Added Phone
$admin_message .= "Subject: $subject\n";
$admin_message .= "Inquiry Type: $inquiry\n";
$admin_message .= "Message:\n$message\n";

$admin_headers = "From: no-reply@sundaramoils.com\r\n"; // Or info@
$admin_headers .= "Reply-To: $email\r\n"; // Reply directly to the user
$admin_headers .= "X-Mailer: PHP/" . phpversion();

@mail($admin_to, $admin_subject, $admin_message, $admin_headers);


// 5. Send WhatsApp Reply using UltraMsg API
// NOTE: You must get an Instance ID and Token from https://ultramsg.com/ or a similar provider.
$ultramsg_instance_id = "YOUR_INSTANCE_ID_HERE"; // e.g., instance12345
$ultramsg_token = "YOUR_TOKEN_HERE";           // e.g., abc123def456

if ($ultramsg_instance_id !== "YOUR_INSTANCE_ID_HERE" && $phone) {
    $whatsapp_api_url = "https://api.ultramsg.com/" . $ultramsg_instance_id . "/messages/chat";
    $whatsapp_message = "Dear $name, Thank you for contacting Sri Lakshmi Narayana Oil Mill. We will contact you soon.";
    
    $params = array(
        'token' => $ultramsg_token,
        'to' => $phone, 
        'body' => $whatsapp_message
    );

    $curl = curl_init();
    curl_setopt_array($curl, array(
      CURLOPT_URL => $whatsapp_api_url,
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_ENCODING => "",
      CURLOPT_MAXREDIRS => 10,
      CURLOPT_TIMEOUT => 30,
      CURLOPT_SSL_VERIFYHOST => 0,
      CURLOPT_SSL_VERIFYPEER => 0,
      CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
      CURLOPT_CUSTOMREQUEST => "POST",
      CURLOPT_POSTFIELDS => http_build_query($params),
      CURLOPT_HTTPHEADER => array(
        "content-type: application/x-www-form-urlencoded"
      ),
    ));
    
    $response = curl_exec($curl);
    $err = curl_error($curl);
    curl_close($curl);
}

echo json_encode(['status' => 'success', 'message' => 'Thank you! We will contact you soon.']);
?>
