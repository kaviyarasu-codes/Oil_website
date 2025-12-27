<?php
// setup_database.php
// Run this file ONCE to create the database table.

$db_host = 'localhost';
$db_user = 'u964291147_sundaramoils';
$db_pass = 'Oils@2025';
$db_name = 'u964291147_sundaramoils';

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
