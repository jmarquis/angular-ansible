angular.module("ansible", [])

	.provider("Ansible", function () {

		var socket,
			initialized = false,
			queue = [];

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

					socket.on("ansible:update", function (data) {
						console.log(data);
					});

					initialized = true;
				}

			},

			$get: function ($q) {

				if (initialized) {

					var Ansible = function (room, callback) {

						this.room = room;
						this.data = null;

						// request to join room, which will also trigger a data update
						console.log("joining room: " + this.room);
						emit("ansible:joinroom", this.room);

						return this;

					};

					Ansible.prototype.get = function () {
						// request the remote model data
					};

					Ansible.prototype.save = function () {
						// send the local model data
					};

					return Ansible;

				}

				else throw "Ansible has not been initialized.";

			}

		}

	});

