# gulp-angular-templatecache

[![Build Status](https://dev.azure.com/energyworldnet/proddev/_apis/build/status%2FJavaScript%2Fgulp-angular-templatecache?repoName=energyworldnet%2Fgulp-angular-templatecache&branchName=ewn)](https://dev.azure.com/energyworldnet/proddev/_build/latest?definitionId=37&repoName=energyworldnet%2Fgulp-angular-templatecache&branchName=ewn)

Concatenates and registers AngularJS templates in the `$templateCache`.

## Install

Install with [npm](https://npmjs.org/package/gulp-angular-templatecache)

```
npm install @ewn/gulp-angular-templatecache --save-dev
```

## Example

### gulpfile.js

> Concatenate the contents of all .html-files in the templates directory and save to _public/templates.js_ (default filename).

```js
import gulp from 'gulp';
import templateCache from 'gulp-angular-templatecache';

const { dest, src } = gulp;

export default function () {
  return src('templates/**/*.html')
    .pipe(templateCache())
    .pipe(dest('public'));
}
```

### Result (public/templates.js)

> Sample output (prettified).

```js
angular.module("templates").run([$templateCache,
  function($templateCache) {
    $templateCache.put("template1.html",
      // template1.html content (escaped)
    );
    $templateCache.put("template2.html",
      // template2.html content (escaped)
    );
    // etc.
  }
]);

```

Include this file in your app and AngularJS will use the $templateCache when available.

**Note:** this plugin will **not** create a new AngularJS module by default, but use a module called `templates`. If you would like to create a new module, set [options.standalone](https://github.com/energyworldnet/gulp-angular-templatecache#standalone---boolean-standalonefalse) to `true`.

**Note:** if you use Visual Studio on Windows, you might encounter this error message: `ASPNETCOMPILER : error ASPRUNTIME: The specified path, file name, or both are too long. The fully qualified file name must be less than 260 characters, and the directory name must be less than 248 characters.`

This is most likely due to long path names, and can be fixed by adding `lodash.bind` as a dev dependecy in your package.json. Anyway, if you encounter this error, please drop a note in #62, and we might merge #63.

## API

gulp-angular-templatecache([filename](https://github.com/energyworldnet/gulp-angular-templatecache#filename---string-filenametemplatesjs), [options](https://github.com/energyworldnet/gulp-angular-templatecache#options))

----

### filename - {string} [filename='templates.js']

> Name to use when concatenating.

### options

#### root - {string}

> Prefix for template URLs.

#### module - {string} [module='templates']

> Name of AngularJS module.

#### standalone - {boolean} [standalone=false]

> Create a new AngularJS module, instead of using an existing.

#### base {string | function} [base=file.base]

> Override file base path.

#### moduleSystem {string}

> Wrap the templateCache in a module system. Currently supported systems: `RequireJS`, `Browserify`, `ES6` and `IIFE` (Immediately-Invoked Function Expression).

#### transformUrl {function}

> Transform the generated URL before it's put into `$templateCache`.

```js
transformUrl: function(url) {
  return url.replace(/\.tpl\.html$/, '.html')
}
```

#### templateHeader {string} [templateHeader=see below]

> Override template header.

```js
var TEMPLATE_HEADER = 'angular.module("<%= module %>"<%= standalone %>).run(["$templateCache", function($templateCache) {';
```

#### templateBody {string} [templateBody=see below]

> Override template body.

```js
var TEMPLATE_BODY = '$templateCache.put("<%= url %>","<%= contents %>");';
```

#### templateFooter {string} [templateFooter=see below]

> Override template footer.

```js
var TEMPLATE_FOOTER = '}]);';
```

#### escapeOptions - {object}

> Options for jsesc module. See [jsesc API](https://www.npmjs.com/package/jsesc#api)
