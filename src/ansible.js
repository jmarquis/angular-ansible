angular.module("ansible", [])

	.provider("Ansible", function () {

		var io;

		return {

			init: function (_io_) {
				io = _io_;
			},

			$get: function ($q) {

				var Ansible = function (room, callback) {

					this.room = room;
					this.get();
					return this;

				};

				Ansible.prototype.get = function () {
					// request the remote model data
				};

				Ansible.prototype.save = function () {
					// send the local model data
				};

			}

		}

	});

