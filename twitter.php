<?php

define(WEBSITE_URL, 'http://manu.habite.la/actweevity-notifier/');

require __DIR__ . '/vendor/autoload.php';
include __DIR__. '/php/TwitterApp.php';
include __DIR__. '/php/twitterKeys.php';

try {
	$config = array(
		'consumer_key'      => CONSUMER_KEY,
		'consumer_secret'   => CONSUMER_SECRET
	);

	$app = new TwitterApp(new \Themattharris\TmhOAuth($config), array('callback_url' => WEBSITE_URL));

	if ($app->isAuthed()) {
		if (!empty($_GET['screen_name'])) {
			if (preg_match("/^[A-Za-z0-9_]{1,15}$/", $_GET['screen_name'])) {
				echo $app->getUserInfo($_GET['screen_name']);
			}
		}
	} elseif (isset($_POST['auth'])) {
		$app->auth();
	} else {
		$authed = false;
	}
} catch(Exception $e) {

}