<?php
$page_title = $page_title ?? 'Root3D Consulting | Mississippi Medical Cannabis Licensing, Compliance & Cultivation';
$page_description = $page_description ?? 'Root3D Consulting guides Mississippi cannabis operators through licensing, compliance, cultivation education, fertigation strategy, nutrient and genetics sourcing, and inspection readiness.';
$page_canonical = $page_canonical ?? 'https://www.r3dconsulting.com/';
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="<?php echo $page_description; ?>">
  <meta name="theme-color" content="#1b4332">
  <meta property="og:type" content="website">
  <meta property="og:title" content="<?php echo $page_title; ?>">
  <meta property="og:description" content="<?php echo $page_description; ?>">
  <meta property="og:image" content="assets/logo.png">
  <meta property="og:url" content="<?php echo $page_canonical; ?>">
  <meta property="og:site_name" content="Root3D Consulting">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="<?php echo $page_title; ?>">
  <meta name="twitter:description" content="<?php echo $page_description; ?>">
  <meta name="twitter:image" content="assets/logo.png">
  <link rel="canonical" href="<?php echo $page_canonical; ?>">
  <link rel="icon" type="image/svg+xml" href="assets/favicon.svg">
  <link rel="alternate icon" type="image/png" href="assets/logo.png">
  <link rel="preload" href="styles.css" as="style">
  <link rel="stylesheet" href="styles.css">
  <script src="main.js" defer></script>
  <title><?php echo $page_title; ?></title>
</head>
<body id="page-top">
  <a class="skip-link" href="#main">Skip to main content</a>

  <header class="site-header">
    <div class="container nav-wrapper">
      <a class="brand" href="/">
        <img src="assets/logo.png" alt="Root3D Consulting logo" class="brand-mark">
        <span class="brand-name">Root3D Consulting</span>
      </a>
      <button class="nav-toggle" aria-label="Toggle navigation" aria-expanded="false" aria-controls="primary-nav">
        <span class="nav-line" aria-hidden="true"></span>
        <span class="nav-line" aria-hidden="true"></span>
        <span class="nav-line" aria-hidden="true"></span>
      </button>
      <nav id="primary-nav" class="nav" aria-label="Primary">
        <ul>
          <li><a href="/" <?php echo (basename($_SERVER['PHP_SELF']) == 'index.php') ? 'class="active"' : ''; ?>>Home</a></li>
          <li><a href="/expertise" <?php echo (basename($_SERVER['PHP_SELF']) == 'expertise.php') ? 'class="active"' : ''; ?>>Expertise</a></li>
          <li><a href="/solutions" <?php echo (basename($_SERVER['PHP_SELF']) == 'solutions.php') ? 'class="active"' : ''; ?>>Solutions</a></li>
          <li><a href="/tiers" <?php echo (basename($_SERVER['PHP_SELF']) == 'tiers.php') ? 'class="active"' : ''; ?>>Tiers</a></li>
          <li><a href="/about" <?php echo (basename($_SERVER['PHP_SELF']) == 'about.php') ? 'class="active"' : ''; ?>>About</a></li>
          <li><a href="/contact" <?php echo (basename($_SERVER['PHP_SELF']) == 'contact.php') ? 'class="active"' : ''; ?>>Contact</a></li>
        </ul>
      </nav>
    </div>
  </header>

  <main id="main">