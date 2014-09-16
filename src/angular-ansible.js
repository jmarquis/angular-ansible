angular.module("ansible", [])

	.provider("Ansible", function () {

		var socket,
			initialized = false,
			queue = [],
			ansibles = {};

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

		return {

			init: function (_socket_) {

				if (!initialized) {
					socket = _socket_;

					socket.on("connect", processQueue);

					socket.on("ansible:update", function (message) {
						if (ansibles[message.channel]) {
							ansibles[message.channel].setData(message.data);
						}
					});

					initialized = true;
				}

			},

			$get: function ($rootScope) {

				if (initialized) {

					var Ansible = function (channel, callback) {

						var _ = this;
						this.channel = channel;
						this.data = null;

						// request to join channel, which will also trigger a data update
						console.log("Subscribing: " + this.channel);
						emit("ansible:subscribe", this.channel);

						$rootScope.$watch(function () {
							return _.data;
						}, _.save);

						ansibles[channel] = this;
						return this;

					};

					Ansible.prototype.get = function () {
						// request the remote model data
						emit("ansible:get", this.channel);
					};

					Ansible.prototype.save = function () {
						// send the local model data
						console.log("saving", { channel: this.channel, data: this.data });
						emit("ansible:update", {
							channel: this.channel,
							data: this.data
						});
					};

					Ansible.prototype.getData = function () {
						return this.data;
					};

					Ansible.prototype.setData = function (data) {
						this.data = data;
						$rootScope.$digest();
					}

					return Ansible;

				} else throw "Ansible has not been initialized.";

			}

		}

	});

