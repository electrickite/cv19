Ohio COVID-19 Stats
===================

Simple PWA/PHP application that displays historical COVID-19 case data scraped
from the Ohio Department of Health.

Requirements
------------
  * PHP >= 7.2
  * SQLite3
  * PHP PDO SQLite driver
  * PHP cURL

Install
-------
Copy `config.php.example` to `config.php` and supply the path for your sqlite
database. Then configure your web server to serve the `public` directory.

Scraping
--------
A simple scraper is included that fetches statistics from the ODH website. Run
`php scrape.php` at least once before loading the front end app. This script can
be run periodically to fetch and store the latest data.
