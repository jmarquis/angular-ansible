`angular-shell` is a minimal setup for building Angular-powered front-end webapps. It includes everything that could be considered essential for every full-fledged Angular app. The goal is to provide a starting point for a developer to immediately start building on — not something that needs to be carefully pruned before actual development can begin.

**Why another starting point for Angular?** Because every existing one (Yeoman, angular-seed, etc) is **highly opinionated** and includes lots of extra non-essential stuff and/or excessive boilerplate code.

Don't get me wrong, `angular-shell` is opinionated too.

But it's my opinion.

---

# angular-shell *is*:

* a simple directory structure
* a very granular Gulpfile
* essential npm dependencies
	* [bower](http://bower.io)
	* [gulp](http://gulpjs.com) (with essential plugins)
	* [karma](http://karma-runner.github.io/0.12/index.html) (with essential plugins)
	* [express](http://expressjs.com)
* essential bower dependencies
	* [html5shiv](https://github.com/aFarkas/html5shiv)
	* [normalize.css](http://necolas.github.io/normalize.css)

# angular-shell is *not*:

* a bunch of boilerplate code or snippets
* a framework on top of Angular
* a "scaffolding" tool

---

# To do

* clean up Gulpfile for gulp 4.0
* add [Protractor](https://github.com/angular/protractor) setup for E2E testing
