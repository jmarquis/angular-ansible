var pkg = require("./package.json"),
	gulp = require("gulp"),
	rimraf = require("gulp-rimraf"),
	concat = require("gulp-concat"),
	header = require("gulp-header"),
	moment = require("moment"),
	ngAnnotate = require("gulp-ng-annotate");
	uglify = require("gulp-uglify"),
	express = require("express"),
	karma = require("karma").server,
	scripts = require("./scripts.json");


var tdd = false;


gulp.task("clean", function () {

	return gulp.src([
		"./build/",
		"./dist/",
		"./temp-scripts/"
	], { read: false })
		.pipe(rimraf());

});

////////////////////////////////////////////////////////////////////////////////////////////////////

gulp.task("lib-scripts", function () {

	if (scripts.libs.length) {
		return gulp.src(scripts.libs)
			.pipe(concat("libs.js"))
			.pipe(gulp.dest("./temp-scripts/"));
	}

});

gulp.task("app-scripts", function () {

	return gulp.src(scripts.app)
		.pipe(ngAnnotate())
		.pipe(concat("app.js"))
		.pipe(gulp.dest("./temp-scripts/"));

});

gulp.task("build", ["lib-scripts", "app-scripts"], function () {

	gulp.src([
		"./temp-scripts/libs.js",
		"./temp-scripts/app.js"
	])
		.pipe(concat(pkg.name + ".js"))
		.pipe(header([
			"/**",
			" * ${pkg.name} v${pkg.version}",
			" * " + moment().format("MMDDYYYY hh:mm:ss A X"),
			" */",
			"", "",
		].join("\n"), {pkg: pkg}))
		.pipe(gulp.dest("./build/"));

});

////////////////////////////////////////////////////////////////////////////////////////////////////

gulp.task("test", function (done) {

	karma.start({
		configFile: __dirname + "/test/unit/karma.conf.js",
		singleRun: true,
		autoWatch: false
	}, done);

});

////////////////////////////////////////////////////////////////////////////////////////////////////

gulp.task("package", function () {

	return gulp.src("./build/" + pkg.name + ".js")
		.pipe(uglify())
		.pipe(gulp.dest("./dist/"));

});

////////////////////////////////////////////////////////////////////////////////////////////////////

gulp.task("run", function () {

	var app = express();
	app.use(express.static(__dirname + "/build"));
	app.listen(29017);
	console.log("Server running on localhost:29017");

});

gulp.task("watch", ["build"], function () {

	gulp.watch(scripts.app, ["scripts"]);
	gulp.watch(styles, ["styles"]);
	gulp.watch("./src/**/*.html", ["index", "views"]);
	gulp.on("stop", function () {
		setTimeout(function () {

			if (tdd) karma.start({
				configFile: __dirname + "/test/unit/karma.conf.js",
				singleRun: true,
				autoWatch: false
			}, function () {});

		}, 100);
	});

});

gulp.task("tdd", function () {

	tdd = true;

});

////////////////////////////////////////////////////////////////////////////////////////////////////

gulp.task("default", ["build"]);
