/*!
* Tim (lite)
*   github.com/premasagar/tim
*//*
    A tiny, secure JavaScript micro-templating script.
*/
var tim=function(){var e=/{{\s*([a-z0-9_][\\.a-z0-9_]*)\s*}}/gi;return function(f,g){return f.replace(e,function(h,i){for(var c=i.split("."),d=c.length,b=g,a=0;a<d;a++){b=b[c[a]];if(b===void 0)throw"tim: '"+c[a]+"' not found in "+h;if(a===d-1)return b}})}}();


/**
 * TwitterSpy
 *
 * Soyez prévenu quand un utilisateur de twitter est actif sur son compte
 *
 * utilisation: crééez une instance de l'espion en lui passant le nom du compte à surveiller et lancez la surveillance :
 * var spy = new TwitterSpy('leimina').startChecking();
 *
 * @param {string} username [description]
 */
var TwitterSpy = function(username) {
	if (!username || !window.localStorage)
		return false;
	this.username = username;
	this.watchedData = {
		"name": "nouveau nom : {{data}}",
		"screen_name": "nouveau pseudo : {{data}}",
		"description": "nouvelle description : {{data}}",
		"friends_count": "{{data}} amis",
		"favourites_count": "{{data}} favoris",
		"statuses_count": "{{data}} tweets",
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
	if (JSON.stringify(this.pastData) === "{}") {
		localStorage.setItem(this.localStorageKey, "{}");
	}
	this.checking = false;

	this.baseClassName = "twitter-spytivity";
	var tpl =
		'<div class="{{class}}" data-twitter-username="{{username}}" data-active="{{active}}">' +
		'<div class="{{class}}-header">' +
		'<h2 class="{{class}}-title">@{{username}}</h2>' +
		'<button class="{{class}}-status-switch" data-status-off="Activer la surveillance" data-status-on="Arrêter la surveillance"></button>' +
		'</div>' +
		'<div class="{{class}}-changes"></div>' +
		'<button class="{{class}}-delete" title="Supprimer ce compte">×</button>' +
		'</div>';
	this.$el = $( tim(tpl, { "class": this.baseClassName, "username": this.username, "active": this.checking }) );
	this._toggleStatusLabels( this.checking );
	var lastChanges = localStorage.getItem(this.localStorageKey + '_lastChanges');
	if (lastChanges !== null) {
		this.$el.find('.' + this.baseClassName + '-changes').html(lastChanges);
	}
	$('#content').append(this.$el);

	var that = this;
	this.$el.find('.' + this.baseClassName + '-status-switch').on('click', function(e) {
		e.preventDefault();
		that.toggleStatus();
	});
	this.$el.find('.' + this.baseClassName + '-delete').on('click', function(e) {
		that.autoDestroy();
	});

	return this;
};
TwitterSpy.prototype.check = function() {
	var that = this;
	var now = new Date();
	$.ajax({
		url: "https://api.twitter.com/1/users/show.json?screen_name=" + this.username + "&include_entities=true&callback=?",
		success: function(data) {
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
					notif.push( tim( that.watchedData[changedProp], { data: changed[changedProp] }) );
				}
				notif = notif.join(' ');
				//on alerte via notif webkit on une alerte normale
				if (window.webkitNotifications && window.webkitNotifications.checkPermission() === 0)
					window.webkitNotifications.createNotification('', notifTitle, notif).show();
				else
					alert(notifTitle + "\n" + notif);

				var changeTpl =
					'<div class="{{class}}-change">' +
					'<span class="{{class}}-change-title">{{title}}</span>' +
					'<span class="{{class}}-change-content">{{content}}</span>' +
					'</div>';
				var change = $( tim(changeTpl, { "class": that.baseClassName, "title": notifTitle, "content": notif }) );
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
		}
	});

	return this;
};
TwitterSpy.prototype.startChecking = function(interval) {
	interval = interval || 60;
	var that = this;
	this.check();
	this.checking = setInterval(function() {
		that.check();
	}, 1000*interval);

	this._toggleStatusLabels(true);

	return this;
};
TwitterSpy.prototype.stopChecking = function() {
	if (this.checking !== false) {
		clearInterval(this.checking);
		this.checking = false;
	}

	this._toggleStatusLabels(false);

	return this;
};
TwitterSpy.prototype.toggleStatus = function() {
	if (this.checking)
		return this.stopChecking();
	return this.startChecking();
};
TwitterSpy.prototype.autoDestroy = function() {
	this.stopChecking();
	localStorage.removeItem( this.localStorageKey );
	localStorage.removeItem( this.localStorageKey + '_lastChanges' );
	this.$el.remove();

	return this;
};
TwitterSpy.prototype._toggleStatusLabels = function(switchTo) {
	var statusButton = this.$el.find('.' + this.baseClassName + '-status-switch');
	if (switchTo) {
		statusButton.html( statusButton.attr('data-status-on') );
	} else {
		statusButton.html( statusButton.attr('data-status-off') );
	}
	this.$el.attr('data-active', switchTo);
};

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

if (window.localStorage) {
	for (var key in window.localStorage) {
		if (key.indexOf('twitterspy_') === 0 && !/twitterspy_.*_lastChanges/.test(key)) {
			new TwitterSpy( key.substring('twitterspy_'.length) ).startChecking();
		}
	}
}

$('.add-twitter-spy').on('submit', function(e) {
	new TwitterSpy( $(this).find('input[name=username]').val() ).startChecking();
	e.preventDefault();
});