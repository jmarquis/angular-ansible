angular.module("ansible", [])

	.provider("Ansible", function () {

		var socket,
			initialized = false,
			queue = [],
			ansibles = {},
			defaults = {
				actionMethods: {
					"get": { actions: "ansible:get" },
					"query": { actions: "ansible:query", isArray: true },
					"save": { actions: "ansible:save" },
					"delete": { actions: "ansible:delete" }
				}
			},
			noop = function () {};

		var emit = function (name, data, callback) {
			if (socket && socket.connected) {
				socket.emit(name, data, callback);
			} else {
				queue.push({ name: name, data: data, callback: callback });
			}
		};

		var processQueue = function () {
			if (socket && socket.connected) {
				while (queue.length > 0) {
					var message = queue.shift();
					socket.emit(message.name, message.data, message.callback);
				}
			}
		};

		var parseUrlString = function (urlString) {

			var routeTemplate = urlString.split("/");
			var regex = "^";
			var paramNames = [];

			angular.forEach(routeTemplate, function (segment, index) {
				if (segment === "") noop();
				else if (segment.charAt(0) !== ":") regex += "/" + segment;
				else {
					var required = segment.charAt(segment.length - 1) !== "?";
					regex += required ? "(/[^/]+)" : "(/[^/]+)?";
					paramNames.push({
						name: segment.substring(1, required ? segment.length : segment.length - 1),
						required: required
					});
				}
			});

			regex += "$";

			console.log(regex);

			return {
				match: function (route) {
					console.log("");
				},
				fill: function (params) {

				}
			};
			var paramNames = urlString.match(/\:[^/]+/g);
			angular.forEach(paramNames, function (name, index) {
				paramNames[index] = name.substring(1);
			});
		};

		this.init = function (_socket_) {

			if (!initialized) {
				socket = _socket_;

				socket.on("connect", processQueue);

				socket.on("ansible:update", function (message) {
					console.log("Incoming update: ", message);
					if (ansibles[message.channel]) {
						ansibles[message.channel].setData(message.data);
					}
				});

				initialized = true;
			}

		};

		this.$get = function ($rootScope) {

			if (initialized) {

				var Ansible = function (urlString, defaultParams, customActions) {

					var Type = function (params) {

						angular.extend(this, params);

						return this;

					};

					Type.route = parseUrlString(urlString);
					Type.defaultParams = angular.copy(defaultParams);

					angular.forEach(angular.extend({}, defaults.actionMethods, customActions), function (actionMethod, method) {
						Type.prototype["$" + method] = function (params, callback) {

						};
					});

					return Type;

				};





				var Ansible = function (channel) {

					var _ = this;
					this.channel = channel;
					this.data = null;
					this.dataInitialized = false;

					// request to join channel, which will also trigger a data update
					console.log("Subscribing: " + this.channel);
					emit("ansible:subscribe", this.channel);

					$rootScope.$watch(function () {
						return _.data;
					}, function () {
						_.save();
					}, typeof _.data === "object");

					ansibles[channel] = this;
					return this;

				};

				Ansible.prototype.get = function () {
					// request the remote model data
					emit("ansible:get", this.channel);
				};

				Ansible.prototype.save = function () {
					if (this.dataInitialized) {
						// send the local model data
						console.log("saving", this);
						emit("ansible:update", {
							channel: this.channel,
							data: this.data
						});
					}
				};

				Ansible.prototype.getData = function () {
					return this.data;
				};

				Ansible.prototype.setData = function (data) {
					var _ = this;
					setTimeout(function () { _.dataInitialized = true; }, 1);
					this.data = angular.copy(data);
					$rootScope.$digest();
				};

				return Ansible;

			} else throw "Ansible has not been initialized.";

		};

	})

	.factory("ansible", function (Ansible) {

		return function (url, defaultParams, customActions) {
			return new Ansible(url);
		};

	});

