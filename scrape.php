<?php
$url = 'https://coronavirus.ohio.gov/wps/portal/gov/covid-19/';
$container = '<div class="odh-ads__item-title">';

include dirname(__FILE__) . '/config.php';
date_default_timezone_set('America/New_York');

if (!function_exists('curl_init')) {
    die('cURL is not installed. Please install and try again.');
}
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$html = curl_exec($ch);

if (curl_errno($ch)) {
    $error = curl_error($ch);
    curl_close($ch);
    die($error);
}
curl_close($ch);

$counts = [];
$start = 0;

for ($i = 0; $i < 4; $i++) {
    $container_length = strlen($container);
    $start = strpos($html, $container, $start);
    $end = strpos($html, '</div>', $start);
    $length = $end - $start - $container_length;
    $text = trim(substr($html, $start + $container_length, $length));
    $text = preg_replace("/[^0-9]/", "", $text);
    $counts[$i] = intval($text);
    $start += 1;
}

$db = new PDO($dsn);

$db->exec("CREATE TABLE IF NOT EXISTS stats (
           id INTEGER PRIMARY KEY,
           date TEXT,
           cases INTEGER,
           deaths INTEGER)");

$db->exec("CREATE UNIQUE INDEX IF NOT EXISTS
           date_idx ON stats (date)");

$stmt = $db->prepare("UPDATE stats SET cases=?, deaths=? WHERE date=?");
$stmt->execute([$counts[0], $counts[3], date('Y-m-d')]);
$stmt = null;

$stmt = $db->prepare("INSERT OR IGNORE INTO stats
                      (date, cases, deaths) VALUES (?, ?, ?)");
$stmt->execute([date('Y-m-d'), $counts[0], $counts[3]]);
$stmt = null;
