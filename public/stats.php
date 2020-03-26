<?php
include realpath(dirname(__FILE__) . '/../config.php');
$ttl = 3600;

date_default_timezone_set('America/New_York');
$db = new PDO($dsn);

$res = $db->query("SELECT * FROM stats ORDER BY date");
$stats = $res->fetchAll(PDO::FETCH_ASSOC);

header('Content-Type: application/json');
header('Expires: ' . gmdate('D, d M Y H:i:s \G\M\T', time() + $ttl));
echo json_encode($stats, JSON_NUMERIC_CHECK);
