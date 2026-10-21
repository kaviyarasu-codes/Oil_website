<?php
// setup_database.php
// Run this file ONCE to create the database table.

// Credentials live in config.php (not in Git). Copy config.example.php to config.php on the server.
require __DIR__ . '/config.php';
$db_host = DB_HOST;
$db_user = DB_USER;
$db_pass = DB_PASS;
$db_name = DB_NAME;

// Create connection
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// SQL to create table
$sql = "CREATE TABLE IF NOT EXISTS contacts (
    id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    subject VARCHAR(255),
    inquiry VARCHAR(50),
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)";

if ($conn->query($sql) === TRUE) {
    echo "Table 'contacts' created successfully (or already exists).";
} else {
    echo "Error creating table: " . $conn->error;
}

$conn->close();
?>
