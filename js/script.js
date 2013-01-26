var TwitterSpy = function(username) {
	if (!username || !window.localStorage)
		return false;
	this.username = username;
	this.watchedData = {
		"name": "nouveau nom : %s",
		"screen_name": "nouveau pseudo : %s",
		"description": "nouvelle description : %s",
		"friends_count": "%s amis",
		"favourites_count": "%s favoris",
		"statuses_count": "%s tweets",
		"profile_background_color": "personnalisation du compte",
		"profile_background_image_url": "personnalisation du compte",
		"profile_background_tile": "personnalisation du compte",
		"profile_image_url": "personnalisation du compte",
		"profile_link_color": "personnalisation du compte",
		"profile_sidebar_border_color": "personnalisation du compte",
		"profile_sidebar_fill_color": "personnalisation du compte",
		"profile_text_color": "personnalisation du compte"
	};
	this.localStorageKey = "twitterspy_" + username;
	this.pastData = JSON.parse(localStorage.getItem(this.localStorageKey)) || {};

	this.checking = false;

	if (!window.webkitNotifications || window.webkitNotifications.checkPermission() === 0)
		$('.notif-on').hide();
	else {
		$('.notif-on').on('click', function(e) {
			window.webkitNotifications.requestPermission(function() {
				if (window.webkitNotifications.checkPermission() === 0)
					$('.notif-on').hide();
			});
		});
	}

	this.baseClassName = "twitter-spytivity";
	this.$el = $(document.createElement('div')).addClass(this.baseClassName).attr('data-twitter-username', this.username);
	this.$el.append('<p class="' + this.baseClassName + '-status"></p>');
	this.$el.append('<div class="' + this.baseClassName + '-changes"><h2>Dernières activités de @' + this.username + '</h2></div>');
	var lastChanges = localStorage.getItem(this.localStorageKey + '_lastChanges');
	if (lastChanges !== null) {
		this.$el.find('.' + this.baseClassName + '-changes').html(lastChanges);
		localStorage.removeItem(this.localStorageKey + '_lastChanges');
	}
	$('#content').append(this.$el);

	return this;
};
TwitterSpy.prototype.check = function() {
	var that = this;
	var now = new Date();
	$.ajax({ url: "https://api.twitter.com/1/users/show.json?screen_name=" + this.username + "&include_entities=true&callback=?" }, function(data) {
		//on regarde quelles données ont changées depuis la dernière fois
		var changed = {};
		for (var prop in that.watchedData) {
			if (data.hasOwnProperty(prop) && data[prop] != that.pastData[prop]) {
				changed[prop] = data[prop];
			}
		}

		if (JSON.stringify(changed) !== "{}" && JSON.stringify(that.pastData) !== "{}") {
			var notifTitle = 'Nouvelle activité le ' + now.getDate() + '/' + now.getMonth()+1 + '/' + now.getFullYear() + ' à ' + now.getHours() + 'h' + now.getMinutes();
			//on construit le message de notification avec les données qui ont changées
			var notif = [];
			for (var changedProp in changed) {
				notif.push( "\n" );
				notif.push( that._parseString( that.watchedData[changedProp], changed[changedProp]) );
			}
			notif = notif.join(' ');
			//on alerte via notif webkit on une alerte normale
			if (window.webkitNotifications && window.webkitNotifications.checkPermission() === 0)
				window.webkitNotifications.createNotification('', notifTitle, notif).show();
			else
				alert(notifTitle + "\n" + notif);

			var change = $(document.createElement('div'))
				.addClass(that.baseClassName + '-change')
				.html(
					'<span class="' + that.baseClassName + '-change-title">' + notifTitle + "</span>" +
					'<span class="' + that.baseClassName + '-change-content">' + notif + "</span>"
				);
			that.$el.find('.' + that.baseClassName + '-changes').append(change);
			localStorage.setItem(that.localStorageKey + '_lastChanges', that.$el.find('.' + that.baseClassName + '-changes').html());
		}

		//on sauvegarde les données en local pour pouvoir comparer avec les nouvelles données au prochain check
		var toSave = {};
		for (var i in that.watchedData) {
			if (data.hasOwnProperty(i)) {
				that.pastData[i] = data[i];
				toSave[i] = data[i];
			}
		}
		localStorage.setItem(that.localStorageKey, JSON.stringify(toSave));
	});

	return this;
};
TwitterSpy.prototype.startChecking = function(interval) {
	var that = this;
	interval = interval || 30;
	this.check();
	this.checking = setInterval(function() {
		that.check();
	}, 1000*interval);

	this.$el.find('.' + this.baseClassName + '-status').html("Je regarde, je regarde... tu seras notifié quand @" + this.username + " fera des trucs sur Twitter.");

	return this;
};
TwitterSpy.prototype.stopChecking = function() {
	if (this.checking !== false) {
		clearInterval(this.checking);
		this.checking = false;
	}

	this.$el.find('.' + this.baseClassName + '-status').html("J'espionne pas.");

	return this;
};
TwitterSpy.prototype._parseString = function(str) {
	var args = [].slice.call(arguments, 1),
		i = 0;

	return str.replace(/%s/g, function() {
		return args[i++];
	});
};

spy = new TwitterSpy('leimina');