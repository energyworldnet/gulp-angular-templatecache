import path from 'node:path';
import Vinyl from 'vinyl';
import { describe, expect, test } from 'vitest';
import templateCache from '../index.js';

const { join, normalize } = path;

describe('gulp-angular-templatecache', function () {
  test('should not process the same file twice', () => new Promise(function (resolve) {
    const stream = templateCache('templates.js');

    stream.on('data', function (file) {
      expect(normalize(file.path)).toBe(normalize(join(__dirname, 'templates.js')));
      expect(file.relative).toBe('templates.js');
      expect(file.contents.toString('utf8')).toBe('angular.module(\'templates\').run([\'$templateCache\', function($templateCache) {$templateCache.put(\'/template-a.html\',\'<h1 id="template-a">I\\\'m template A!</h1>\');}]);');
      resolve();
    });

    const file = new Vinyl({
      base: __dirname,
      path: join(__dirname, 'template-a.html'),
      contents: Buffer.from('<h1 id="template-a">I\'m template A!</h1>')
    });

    stream.write(file);
    stream.write(file);

    stream.end();
  }));

  test('should build valid $templateCache from multiple source-files', () => new Promise(function (resolve) {
    const stream = templateCache('templates.js');

    stream.on('data', function (file) {
      expect(normalize(file.path)).toBe(normalize(join(__dirname, 'templates.js')));
      expect(file.relative).toBe('templates.js');
      expect(file.contents.toString('utf8')).toBe('angular.module(\'templates\').run([\'$templateCache\', function($templateCache) {$templateCache.put(\'/template-a.html\',\'<h1 id="template-a">I\\\'m template A!</h1>\');\n$templateCache.put(\'/template-b.html\',\'<h1 id="template-b">I\\\'m template B!</h1>\');}]);');
      resolve();
    });

    stream.write(new Vinyl({
      base: __dirname,
      path: join(__dirname, 'template-a.html'),
      contents: Buffer.from('<h1 id="template-a">I\'m template A!</h1>')
    }));

    stream.write(new Vinyl({
      base: __dirname,
      path: join(__dirname, 'template-b.html'),
      contents: Buffer.from('<h1 id="template-b">I\'m template B!</h1>')
    }));

    stream.end();
  }));

  test('should allow options as first parameter if no filename is specified', () => new Promise(function (resolve) {
    const stream = templateCache({
      standalone: true,
      root: '/views'
    });

    stream.on('data', function (file) {
      expect(normalize(file.path)).toBe(normalize(join(__dirname, 'templates.js')));
      expect(file.relative).toBe('templates.js');
      expect(file.contents.toString('utf8')).toBe('angular.module(\'templates\', []).run([\'$templateCache\', function($templateCache) {$templateCache.put(\'/views/template-a.html\',\'<h1 id="template-a">I\\\'m template A!</h1>\');}]);');
      resolve();
    });

    stream.write(new Vinyl({
      base: __dirname,
      path: join(__dirname, 'template-a.html'),
      contents: Buffer.from('<h1 id="template-a">I\'m template A!</h1>')
    }));

    stream.end();
  }));

  test('should ignore directories', () => new Promise(function (resolve) {
    const stream = templateCache();

    stream.on('data', function (file) {
      expect(normalize(file.path)).toBe(normalize(join(__dirname, 'templates.js')));
      expect(file.relative).toBe('templates.js');
      expect(file.contents.toString('utf8')).toBe('angular.module(\'templates\').run([\'$templateCache\', function($templateCache) {$templateCache.put(\'/directory/template-a.html\',\'<h1 id="template-a">I\\\'m template A!</h1>\');}]);');
      resolve();
    });

    stream.write(new Vinyl({
      base: __dirname,
      path: join(__dirname, 'directory'),
      contents: null,
      stat: {
        isDirectory: () => true
      }
    }));

    stream.write(new Vinyl({
      base: __dirname,
      path: join(__dirname, 'directory', 'template-a.html'),
      contents: Buffer.from('<h1 id="template-a">I\'m template A!</h1>')
    }));

    stream.end();
  }));

  describe('options.root', function () {
    test('should set root', () => new Promise(function (resolve) {
      const stream = templateCache('templates.js', {
        root: '/views'
      });

      stream.on('data', function (file) {
        expect(normalize(file.path)).toBe(normalize(join(__dirname, 'templates.js')));
        expect(file.relative).toBe('templates.js');
        expect(file.contents.toString('utf8')).toBe('angular.module(\'templates\').run([\'$templateCache\', function($templateCache) {$templateCache.put(\'/views/template-a.html\',\'<h1 id="template-a">I\\\'m template A!</h1>\');}]);');
        resolve();
      });

      stream.write(new Vinyl({
        base: __dirname,
        path: join(__dirname, 'template-a.html'),
        contents: Buffer.from('<h1 id="template-a">I\'m template A!</h1>')
      }));

      stream.end();
    }));

    test('should preserve the "./" if there is one in front of the root', () => new Promise(function (resolve) {
      const stream = templateCache('templates.js', {
        root: './'
      });

      stream.on('data', function (file) {
        expect(normalize(file.path)).toBe(normalize(join(__dirname, 'templates.js')));
        expect(file.relative).toBe('templates.js');
        expect(file.contents.toString('utf8')).toBe('angular.module(\'templates\').run([\'$templateCache\', function($templateCache) {$templateCache.put(\'./template-a.html\',\'<h1 id="template-a">I\\\'m template A!</h1>\');}]);');
        resolve();
      });

      stream.write(new Vinyl({
        base: __dirname,
        path: join(__dirname, 'template-a.html'),
        contents: Buffer.from('<h1 id="template-a">I\'m template A!</h1>')
      }));

      stream.end();
    }));

    test('should preserve the "." if there is one in front of the root', () => new Promise(function (resolve) {
      const stream = templateCache('templates.js', {
        root: '.'
      });

      stream.on('data', function (file) {
        expect(normalize(file.path)).toBe(normalize(join(__dirname, 'templates.js')));
        expect(file.relative).toBe('templates.js');
        expect(file.contents.toString('utf8')).toBe('angular.module(\'templates\').run([\'$templateCache\', function($templateCache) {$templateCache.put(\'./template-a.html\',\'<h1 id="template-a">I\\\'m template A!</h1>\');}]);');
        resolve();
      });

      stream.write(new Vinyl({
        base: __dirname,
        path: join(__dirname, 'template-a.html'),
        contents: Buffer.from('<h1 id="template-a">I\'m template A!</h1>')
      }));

      stream.end();
    }));

    test('should preserve the root as is, if the root folder name start with a "." character', () => new Promise(function (resolve) {
      const stream = templateCache('templates.js', {
        root: '.root/'
      });

      stream.on('data', function (file) {
        expect(normalize(file.path)).toBe(normalize(join(__dirname, 'templates.js')));
        expect(file.relative).toBe('templates.js');
        expect(file.contents.toString('utf8')).toBe('angular.module(\'templates\').run([\'$templateCache\', function($templateCache) {$templateCache.put(\'.root/template-a.html\',\'<h1 id="template-a">I\\\'m template A!</h1>\');}]);');
        resolve();
      });

      stream.write(new Vinyl({
        base: __dirname,
        path: join(__dirname, 'template-a.html'),
        contents: Buffer.from('<h1 id="template-a">I\'m template A!</h1>')
      }));

      stream.end();
    }));
  });

  describe('options.transformUrl', function () {
    test('should change the URL to the output of the function', () => new Promise(function (resolve) {
      const stream = templateCache('templates.js', {
        transformUrl: function (url) {
          return url.replace(/template/, 'tpl');
        }
      });

      stream.on('data', function (file) {
        expect(normalize(file.path)).toBe(normalize(join(__dirname, 'templates.js')));
        expect(file.relative).toBe('templates.js');
        expect(file.contents.toString('utf8')).toBe('angular.module(\'templates\').run([\'$templateCache\', function($templateCache) {$templateCache.put(\'/tpl-a.html\',\'<h1 id="template-a">I\\\'m template A!</h1>\');}]);');
        resolve();
      });

      stream.write(new Vinyl({
        base: __dirname,
        path: join(__dirname, 'template-a.html'),
        contents: Buffer.from('<h1 id="template-a">I\'m template A!</h1>')
      }));

      stream.end();
    }));

    test('should set the final url, after any root option has been applied', () => new Promise(function (resolve) {
      const stream = templateCache('templates.js', {
        root: './views',
        transformUrl: function (url) {
          return '/completely/transformed/final';
        }
      });

      stream.on('data', function (file) {
        expect(normalize(file.path)).toBe(normalize(join(__dirname, 'templates.js')));
        expect(file.relative).toBe('templates.js');
        expect(file.contents.toString('utf8')).toBe('angular.module(\'templates\').run([\'$templateCache\', function($templateCache) {$templateCache.put(\'/completely/transformed/final\',\'<h1 id="template-a">I\\\'m template A!</h1>\');}]);');
        resolve();
      });

      stream.write(new Vinyl({
        base: __dirname,
        path: join(__dirname, 'template-a.html'),
        contents: Buffer.from('<h1 id="template-a">I\'m template A!</h1>')
      }));

      stream.end();
    }));
  });

  describe('options.standalone', function () {
    test('should create standalone Angular module', () => new Promise(function (resolve) {
      const stream = templateCache('templates.js', {
        standalone: true
      });

      stream.on('data', function (file) {
        expect(normalize(file.path)).toBe(normalize(join(__dirname, 'templates.js')));
        expect(file.relative).toBe('templates.js');
        expect(file.contents.toString('utf8')).toBe('angular.module(\'templates\', []).run([\'$templateCache\', function($templateCache) {$templateCache.put(\'/template-a.html\',\'<h1 id="template-a">I\\\'m template A!</h1>\');}]);');
        resolve();
      });

      stream.write(new Vinyl({
        base: __dirname,
        path: join(__dirname, 'template-a.html'),
        contents: Buffer.from('<h1 id="template-a">I\'m template A!</h1>')
      }));

      stream.end();
    }));
  });

  describe('options.filename', function () {
    test('should default to templates.js if not specified', () => new Promise(function (resolve) {
      const stream = templateCache();

      stream.on('data', function (file) {
        expect(normalize(file.path)).toBe(normalize(join(__dirname, 'templates.js')));
        expect(file.relative).toBe('templates.js');
        resolve();
      });

      stream.write(new Vinyl({
        base: __dirname,
        path: join(__dirname, 'template-a.html'),
        contents: Buffer.from('<h1 id="template-a">I\'m template A!</h1>')
      }));

      stream.end();
    }));

    test('should set filename', () => new Promise(function (resolve) {
      const stream = templateCache({
        standalone: true,
        root: '/views',
        filename: 'foobar.js'
      });

      stream.on('data', function (file) {
        expect(normalize(file.path)).toBe(normalize(join(__dirname, 'foobar.js')));
        expect(file.relative).toBe('foobar.js');
        expect(file.contents.toString('utf8')).toBe('angular.module(\'templates\', []).run([\'$templateCache\', function($templateCache) {$templateCache.put(\'/views/template-a.html\',\'<h1 id="template-a">I\\\'m template A!</h1>\');}]);');
        resolve();
      });

      stream.write(new Vinyl({
        base: __dirname,
        path: join(__dirname, 'template-a.html'),
        contents: Buffer.from('<h1 id="template-a">I\'m template A!</h1>')
      }));

      stream.end();
    }));
  });

  describe('options.base', function () {
    test('should set base url', () => new Promise(function (resolve) {
      const stream = templateCache({
        standalone: true,
        root: '/views',
        base: path.resolve(__dirname, '..')
      });

      stream.on('data', function (file) {
        expect(normalize(file.path)).toBe(normalize(join(__dirname, 'templates.js')));
        expect(file.relative).toBe('templates.js');
        expect(file.contents.toString('utf8')).toBe('angular.module(\'templates\', []).run([\'$templateCache\', function($templateCache) {$templateCache.put(\'/views/test/template-a.html\',\'<h1 id="template-a">I\\\'m template A!</h1>\');}]);');
        resolve();
      });

      stream.write(new Vinyl({
        base: __dirname,
        path: join(__dirname, 'template-a.html'),
        contents: Buffer.from('<h1 id="template-a">I\'m template A!</h1>')
      }));

      stream.end();
    }));

    test('should allow functions', () => new Promise(function (resolve) {
      const stream = templateCache({
        standalone: true,
        root: '/templates',
        base: function (file) {
          return '/all/' + file.relative;
        }
      });

      stream.on('data', function (file) {
        expect(normalize(file.path)).toBe(normalize(join(__dirname, 'templates.js')));
        expect(file.relative).toBe('templates.js');
        expect(file.contents.toString('utf8')).toBe('angular.module(\'templates\', []).run([\'$templateCache\', function($templateCache) {$templateCache.put(\'/templates/all/template-a.html\',\'<h1 id="template-a">I\\\'m template A!</h1>\');}]);');
        resolve();
      });

      stream.write(new Vinyl({
        base: __dirname,
        path: join(__dirname, 'template-a.html'),
        contents: Buffer.from('<h1 id="template-a">I\'m template A!</h1>')
      }));

      stream.end();
    }));
  });

  describe('options.moduleSystem', function () {
    test('should support Browserify-style exports', () => new Promise(function (resolve) {
      const stream = templateCache('templates.js', {
        moduleSystem: 'Browserify',
        standalone: true
      });

      stream.on('data', function (file) {
        expect(file.path).toBe(normalize(join(__dirname, 'templates.js')));
        expect(file.relative).toBe('templates.js');
        expect(file.contents.toString('utf8')).toBe('\'use strict\'; module.exports = angular.module(\'templates\', []).run([\'$templateCache\', function($templateCache) {$templateCache.put(\'/template-a.html\',\'<h1 id="template-a">I\\\'m template A!</h1>\');}]);');
        resolve();
      });

      stream.write(new Vinyl({
        base: __dirname,
        path: join(__dirname, 'template-a.html'),
        contents: Buffer.from('<h1 id="template-a">I\'m template A!</h1>')
      }));

      stream.end();
    }));

    test('should support RequireJS-style exports', () => new Promise(function (resolve) {
      const stream = templateCache('templates.js', {
        moduleSystem: 'RequireJS'
      });

      stream.on('data', function (file) {
        expect(normalize(file.path)).toBe(normalize(join(__dirname, 'templates.js')));
        expect(file.relative).toBe('templates.js');
        expect(file.contents.toString('utf8')).toBe('define([\'angular\'], function(angular) { \'use strict\'; return angular.module(\'templates\').run([\'$templateCache\', function($templateCache) {$templateCache.put(\'/template-a.html\',\'<h1 id="template-a">I\\\'m template A!</h1>\');}]);});');
        resolve();
      });

      stream.write(new Vinyl({
        base: __dirname,
        path: join(__dirname, 'template-a.html'),
        contents: Buffer.from('<h1 id="template-a">I\'m template A!</h1>')
      }));

      stream.end();
    }));

    test('should support ES6-style exports', () => new Promise(function (resolve) {
      const stream = templateCache('templates.js', {
        moduleSystem: 'ES6'
      });

      stream.on('data', function (file) {
        expect(normalize(file.path)).toBe(normalize(join(__dirname, 'templates.js')));
        expect(file.relative).toBe('templates.js');
        expect(file.contents.toString('utf8')).toBe('import angular from \'angular\'; export default angular.module(\'templates\').run([\'$templateCache\', function($templateCache) {$templateCache.put(\'/template-a.html\',\'<h1 id="template-a">I\\\'m template A!</h1>\');}]);');
        resolve();
      });

      stream.write(new Vinyl({
        base: __dirname,
        path: join(__dirname, 'template-a.html'),
        contents: Buffer.from('<h1 id="template-a">I\'m template A!</h1>')
      }));

      stream.end();
    }));

    test('should support IIFE-style exports', () => new Promise(function (resolve) {
      const stream = templateCache('templates.js', {
        moduleSystem: 'IIFE'
      });

      stream.on('data', function (file) {
        expect(normalize(file.path)).toBe(normalize(join(__dirname, 'templates.js')));
        expect(file.relative).toBe('templates.js');
        expect(file.contents.toString('utf8')).toBe('(function(){\'use strict\';angular.module(\'templates\').run([\'$templateCache\', function($templateCache) {$templateCache.put(\'/template-a.html\',\'<h1 id="template-a">I\\\'m template A!</h1>\');}]);})();');
        resolve();
      });

      stream.write(new Vinyl({
        base: __dirname,
        path: join(__dirname, 'template-a.html'),
        contents: Buffer.from('<h1 id="template-a">I\'m template A!</h1>')
      }));

      stream.end();
    }));
  });

  describe('options.templateHeader & options.templateFooter', function () {
    test('should override TEMPLATE_HEADER & TEMPLATE_FOOTER', () => new Promise(function (resolve) {
      const stream = templateCache('templates.js', {
        templateHeader: 'var template = "',
        templateFooter: '";'
      });

      stream.on('data', function (file) {
        expect(file.path).toBe(normalize(join(__dirname, 'templates.js')));
        expect(file.relative).toBe('templates.js');
        expect(file.contents.toString('utf8')).toBe('var template = "$templateCache.put(\'/template-a.html\',\'yoo\');";');
        resolve();
      });

      stream.write(new Vinyl({
        base: __dirname,
        path: join(__dirname, 'template-a.html'),
        contents: Buffer.from('yoo')
      }));

      stream.end();
    }));

    test('should accept empty strings as header and footer', () => new Promise(function (resolve) {
      const stream = templateCache('templates.js', {
        templateHeader: '',
        templateFooter: ''
      });

      stream.on('data', function (file) {
        expect(file.path).toBe(normalize(join(__dirname, 'templates.js')));
        expect(file.relative).toBe('templates.js');
        expect(file.contents.toString('utf8')).toBe('$templateCache.put(\'/template-a.html\',\'yoo\');');
        resolve();
      });

      stream.write(new Vinyl({
        base: __dirname,
        path: join(__dirname, 'template-a.html'),
        contents: Buffer.from('yoo')
      }));

      stream.end();
    }));
  });

  describe('options.templateBody', function () {
    test('should override TEMPLATE_BODY', () => new Promise(function (resolve) {
      const stream = templateCache('templates.js', {
        templateBody: '$templateCache.put(\'<%= url %>\',\'<%= contents %>\');'
      });

      stream.on('data', function (file) {
        expect(file.path).toBe(normalize(join(__dirname, 'templates.js')));
        expect(file.relative).toBe('templates.js');
        expect(file.contents.toString('utf8')).toBe('angular.module(\'templates\').run([\'$templateCache\', function($templateCache) {$templateCache.put(\'/template-a.html\',\'yoo\');}]);');
        resolve();
      });

      stream.write(new Vinyl({
        base: __dirname,
        path: join(__dirname, 'template-a.html'),
        contents: Buffer.from('yoo')
      }));

      stream.end();
    }));
  });
});
