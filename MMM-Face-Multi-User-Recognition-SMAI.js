/* global Module */

/* Magic Mirror
 * Module: MMM-Face-Multi-User-Recognition-SMAI
 *
 * By James Macdonald
 * MIT Licensed.
 */

const MORNING   = -1;
const AFTERNOON = 0;
const EVENING   = 1;
Module.register("MMM-Face-Multi-User-Recognition-SMAI", {
	defaults: {
		updateInterval: 10000,
		retryDelay: 5000,
		width: "200px",
		position: "lower_third",
		useMMMFaceRecoDNN: false,
		interval: 2000,
		morningStartTime: 3,
		morningEndTime: 12,
		afternoonStartTime: 12,
		afternoonEndTime: 17,
	},

	requiresVersion: "2.1.0", // Required version of MagicMirror

	start: function() {
		var self = this;
		var dataRequest = null;
		var dataNotification = null;
		this.userName = "Guest";
		this.userImage = "guest.gif";
		this.timer = null;

		// Are we logged in or not
		this.loggedIn = false;

		//Flag for check if module is loaded
		this.loaded = false;
	},

	// This will be called every update and update the image based on:
	//	.userId
	//	.userName
	getDom: function() {
		var self = this;

		// create element wrapper for show into the module
		var wrapper = document.createElement("div");
		wrapper.innerHTML = this.translate('TITLE');
		wrapper.className = "face-image";

		// Figure out what time of day message we want
		var message = this.translate('WELCOME');
		if ( this.userName !== "Guest")
		{
			if ( this.timeOfDay() == MORNING ) {
				message = this.translate('GOOD_MORNING');
			} else if (this.timeOfDay() == AFTERNOON) {
				message = this.translate('GOOD_AFTERNOON');
			} else {
				message = this.translate('GOOD_EVENING');
			}
		}
		
		// Ceate the image element and show gif by default.
		var imgHolderElement = document.createElement("p");
		imgHolderElement.innerHTML = message + " " + this.capitalizeWords(this.userName);
		imgHolderElement.classList.add(this.config.position);
		imgHolderElement.style.width = this.config.width;
		
		// Asychronoulsy load either GIF or face (as name).
		var img = document.createElement("img");
		var newImg = new Image;
		newImg.src = "modules/MMM-Face-Multi-User-Recognition-SMAI/public/" + this.userImage;
		newImg.onload = function()
		{
			img.src = this.src;
		}
		imgHolderElement.appendChild(img);

		wrapper.appendChild(imgHolderElement);
		return wrapper;

	},
	
	getScripts: function() {
		return [];
	},

	getStyles: function () {
		return [
			"MMM-Face-Multi-User-Recognition-SMAI.css",
		];
	},

	// Load translations files
	getTranslations: function() {
		//FIXME: This can be load a one file javascript definition
		return {
			de: "translations/de.json",
			en: "translations/en.json",
			es: "translations/es.json",
			ko: "translations/ko.json"
		};
	},

	notificationReceived: function(notification, payload, sender) {
		var self = this;

		// Log.log("Got Notificaiton: " + notification + " Payload: " + payload);
		switch (notification)
		{
			case "USERS_LOGIN":
			{
				// Face Rec sends multiple notifications even if user is already logged in and logout timer still active.
				if (this.config.useMMMFaceRecoDNN === true && this.loggedIn == false )
				{
					Log.log("Notificaiton: " + notification + " from Mirror. Logging in " + payload);
					
					// Fetch the users image.
					this.loggedIn = true;
					this.userName = payload;
					this.userImage = payload + ".jpg"; //Assume for now.
					self.updateDom(100);

					// Clear existing timer and reset.
					// This is only required if MMM-Face-Reco-DNN module not updated with new Notification for lougout.
//					if ( this.timer != null ) clearInterval(this.timer);
//					this.timer = setTimeout(()=>{
//						Log.log("Logging out. Reset image.");
//						
//						this.loggedIn = false;
//						this.userName = this.translate('GUEST_NAME');
//						this.userImage = "guest.gif";
//						self.updateDom(100);
//					}, 25000);
				}
				break;
			}
			case "USERS_LOGOUT_MODULES":
			{
				Log.log("Notificaiton: " + notification + " from Mirror. Logging out " + payload);
				
				this.loggedIn = false;
				this.userName = this.translate('GUEST_NAME');
				this.userImage = "guest.gif";
				self.updateDom(100);
				
				break;
			}
		}		
	},

	// Local helper functions
	capitalizeWords: function(str)
	{
	 return str.toString().toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.substring(1)).join(' ');
	},
	
	timeOfDay: function()
	{
		var hour = moment().hour();
		
		if (hour >= this.config.morningStartTime && hour < this.config.morningEndTime) {
			return MORNING;
		} else if (hour >= this.config.afternoonStartTime && hour < this.config.afternoonEndTime ) {
			return AFTERNOON;
		}

		return EVENING;
	}
	
});
