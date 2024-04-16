import { normalize, join, sep } from 'node:path';
import Composer from 'stream-composer';
import through2 from 'through2';
import lodashTemplate from 'lodash.template';
import concat from 'gulp-concat';
import header from 'gulp-header';
import footer from 'gulp-footer';
import jsesc from 'jsesc';
import { Transform } from 'streamx';

/**
 * "constants"
 */

const TEMPLATE_HEADER = 'angular.module(\'<%= module %>\'<%= standalone %>).run([\'$templateCache\', function($templateCache) {';
const TEMPLATE_BODY = '$templateCache.put(\'<%= url %>\',\'<%= contents %>\');';
const TEMPLATE_FOOTER = '}]);';

const DEFAULT_FILENAME = 'templates.js';
const DEFAULT_MODULE = 'templates';
const MODULE_TEMPLATES = {

  requirejs: {
    header: 'define([\'angular\'], function(angular) { \'use strict\'; return ',
    footer: '});'
  },

  browserify: {
    header: '\'use strict\'; module.exports = '
  },

  es6: {
    header: 'import angular from \'angular\'; export default '
  },

  iife: {
    header: '(function(){\'use strict\';',
    footer: '})();'
  }

};

/**
 * Add files to templateCache.
 */

function templateCacheFiles (root, base, templateBody, transformUrl, escapeOptions) {
  return function templateCacheFile (file, callback) {
    if (file.processedByTemplateCache) {
      callback();
      return;
    }

    if (file.stat && file.stat.isDirectory()) {
      callback();
      return;
    }

    const template = templateBody || TEMPLATE_BODY;
    let url;

    file.path = normalize(file.path);

    /**
     * Rewrite url
     */

    if (typeof base === 'function') {
      url = join(root, base(file));
    } else {
      url = join(root, file.path.replace(base || file.base, ''));
    }

    if (root === '.' || root.indexOf('./') === 0) {
      url = './' + url;
    }

    if (typeof transformUrl === 'function') {
      url = transformUrl(url);
    }

    /**
     * Normalize url (win only)
     */

    if (process.platform === 'win32') {
      url = url.replace(/\\/g, '/');
    }

    /**
     * Create buffer
     */

    file.contents = Buffer.from(lodashTemplate(template)({
      url,
      contents: jsesc(file.contents.toString('utf8'), escapeOptions),
      file
    }));

    file.processedByTemplateCache = true;

    this.push(file);
    callback();
  };
}

/**
 * templateCache a stream of files.
 */

function templateCacheStream (root, base, templateBody, transformUrl, escapeOptions) {
  /**
   * Set relative base
   */

  if (typeof base !== 'function' && base && base.substr(-1) !== sep) {
    base += sep;
  }

  /**
   * templateCache files
   */

  return new Transform({
    transform: templateCacheFiles(root, base, templateBody, transformUrl, escapeOptions)
  });
}

/**
 * Wrap templateCache with module system template.
 */

function wrapInModule (moduleSystem) {
  const moduleTemplate = MODULE_TEMPLATES[moduleSystem];

  if (!moduleTemplate) {
    return through2.obj();
  }

  return Composer.pipeline(
    header(moduleTemplate.header || ''),
    footer(moduleTemplate.footer || '')
  );
}

/**
 * Concatenates and registers AngularJS templates in the $templateCache.
 *
 * @param {string} [filename='templates.js']
 * @param {object} [options]
 */

function templateCache (filename, options) {
  /**
   * Prepare options
   */

  if (typeof filename === 'string') {
    options = options || {};
  } else {
    options = filename || {};
    filename = options.filename || DEFAULT_FILENAME;
  }

  /**
   * Normalize moduleSystem option
   */

  if (options.moduleSystem) {
    options.moduleSystem = options.moduleSystem.toLowerCase();
  }

  /**
   * Prepare header / footer
   */

  const templateHeader = 'templateHeader' in options ? options.templateHeader : TEMPLATE_HEADER;
  const templateFooter = 'templateFooter' in options ? options.templateFooter : TEMPLATE_FOOTER;

  /**
   * Build templateCache
   */

  return Composer.pipeline(
    templateCacheStream(options.root || '', options.base, options.templateBody, options.transformUrl, options.escapeOptions || {}),
    concat(filename),
    header(templateHeader, {
      module: options.module || DEFAULT_MODULE,
      standalone: options.standalone ? ', []' : ''
    }),
    footer(templateFooter, {
      module: options.module || DEFAULT_MODULE
    }),
    wrapInModule(options.moduleSystem)
  );
}

/**
 * Expose templateCache
 */

export default templateCache;
