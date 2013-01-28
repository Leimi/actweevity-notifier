<?php require 'twitter.php'; ?>
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Actweevity Notifier</title>
<link rel="stylesheet" href="css/style.css">
</head>
<body>
	<div id="content">
		<h1>Actweevity Notifier</h1>
		<p>Soyez notifié quand un utilisateur de Twitter est actif sur son compte (protégé ou non).</p>
		<?php if (isset($authed) && $authed === false): ?>
			<form action="twitter.php" method="post">
				<input type="hidden" name="auth" value="1">
				<button class="twitter-button">Se connecter avec Twitter</button>
			</form>
		<?php else: ?>
		<a class="twitter-button twitter-logout"href="twitter.php?logout=1">Se déconnecter</a>
		<button class="notif-on button">Activer les notifications</button>

		<form action="#" class="add-twitter-spy">
			<div>@<input type="text" required pattern="[A-Za-z0-9_]{1,15}" name="username"></div>
			<button class="button">Surveiller ce compte</button>
		</form>
		<?php endif ?>
	</div>

<script>document.write('<script src=js/' +	('__proto__' in {} ? 'zepto' : 'jquery') + '.min.js><\/script>')</script>
<script src="js/script.js"></script>
</body>
</html>
