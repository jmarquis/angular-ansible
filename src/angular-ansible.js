angular.module("ansible", [])

	.provider("Ansible", function () {

		var socket,
			initialized = false,
			queue = [],
			instances = {};

		var emit = function (name, data, callback) {
			if (socket && socket.connected) {
				console.log("Emitting:", name, data);
				socket.emit(name, data, callback);
			} else {
				queue.push({ name: name, data: data, callback: callback });
			}
		};

		var processQueue = function () {
			if (socket && socket.connected) {
				while (queue.length > 0) {
					var message = queue.shift();
					console.log("Emitting (queued):", message.name, message.data);
					socket.emit(message.name, message.data, message.callback);
				}
			}
		};

		this.init = function (_socket_) {

			if (!initialized) {
				socket = _socket_;

				socket.on("connect", processQueue);

				socket.on("ansible:update", function (message) {
					console.log("Incoming update:", message);
					if (instances[message.channel]) {
						instances[message.channel].setData(message.data);
					}
				});

				initialized = true;
			}

		};

		this.$get = function ($rootScope) {

			if (initialized) {

				var wrapCallback = function (callback) {
					return function () {
						if (callback) {
							callback.apply(undefined, arguments);
							$rootScope.$apply();
						}
					};
				}

				var Ansible = function (url, defaultProperties) {

					var Type = function (properties) {

						var _ = this;
						this.$$live = false;

						angular.extend(this, Type.defaultProperties, properties);

						console.log("Subscribing");
						emit("ansible:subscribe", this.getChannel());
						instances[this.getChannel()] = this;

						$rootScope.$watch(function () {
							return _.getProperties();
						}, function () {
							console.log("UPDATE!", _.$$live, _.getProperties());
							_.$save();
						}, true);

						return this;

					};

					Type.route = new Route(url);
					Type.defaultProperties = angular.copy(defaultProperties);

					Type.get = function (params, callback) {
						var instance = new Type(params);
						instance.$get(params, wrapCallback(callback));
						return instance;
					};

					Type.query = function (params) {
						// TODO
					};

					Type.delete = function (params, callback) {
						emit("ansible:delete", {
							channel: Type.route.fill(angular.extend({}, Type.defaultProperties, params))
						}, wrapCallback(callback));
					};

					Type.prototype.getProperties = function () {
						var properties = {};
						angular.forEach(this, function (propertyValue, propertyName) {
							if (!/(\$|\_)/.test(propertyName.charAt(0)) && typeof propertyValue !== "function") properties[propertyName] = propertyValue;
						});
						return properties;
					};

					Type.prototype.getChannel = function (params) {
						params = params ? params : {};
						return Type.route.fill(angular.extend({}, this.getProperties(), params));
					};

					Type.prototype.setData = function (data) {
						console.log("Setting data:", data);
						var _ = this;
						this.$$live = false;
						angular.extend(this, data);
						$rootScope.$apply();
						setTimeout(function () { _.$$live = true; }, 1);
					};

					Type.prototype.$get = function (params, callback) {
						var channel = this.getChannel(params);
						if (channel) {
							emit("ansible:get", {
								channel: channel
							}, wrapCallback(callback));
						}
					};

					Type.prototype.$save = function (params, callback) {
						if (this.$$live) {
							var channel = this.getChannel(params);
							if (channel) {
								emit("ansible:update", {
									channel: channel,
									data: this.getProperties()
								}, wrapCallback(callback));
							}
						}
					};

					Type.prototype.$delete = function (params, callback) {
						var channel = this.getChannel(params);
						if (channel) {
							emit("ansible:delete", {
								channel: channel
							}, wrapCallback(callback));
							delete this;
						}
					};

					return Type;

				};

				return Ansible;

			} else throw "Ansible has not been initialized.";

		};

	})

	.factory("ansible", function (Ansible) {

		return function (url, defaultProperties) {
			return new Ansible(url, defaultProperties);
		};

	});

