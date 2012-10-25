# Lumbar Module Loader

[![Build Status](https://secure.travis-ci.org/walmartlabs/lumbar-loader.png?branch=master)](http://travis-ci.org/walmartlabs/lumbar-loader)

## What is it?
The Module Loader is responsible for dynamically loading all module resources.

While not required to use [lumbar](https://github.com/walmartlabs/lumbar), multiple client-side library
have been developed to facilitate loading both javascript and css assets for a given module. Each has
their own advantages and performance ramifications. The ideal method depends very much on the environment
that is in use.

Regardless of the library used, both support the same features and may be augmented with additional
mixins to provide additional functionality.

 * Provides optional blocking behavior to prevent FOUCing
 * Conditional loading based on device pixel density
 * Support for inlined module css (See the **inline-styles** plugin)


## How does it work?
The Module Loader can be initiated manually or automatically using a
feature mixin (discussed later).

For manual initiation:

    Loader.loader.loadModule('base', function() {
      Application.init();
    });


## Installing a Module Loader

For the most part, the module loader is just standard javascript that
is included in the module scripts section.  The only exception is
*topLevelName* which is discussed later.

You must include the core module loader script and the module loader
impl script.  The following example assumes that you have copied the
module loader scripts to your own application lib directory.

    {
      "modules": {
        "base": {
          "scripts": [
            ...
            "lib/lumbar-loader.js",
            "lib/lumbar-loader-{implementation}.js",
            {"module-map": true}
          ]
        }
      }
    }

## Module Loader Implementations

### Standard Loader

Script: *lib/lumbar-loader-standard.js*

The standard loader provides generic module loading utilizing tag
injection and normal browser caching.

This is ideal for development environments as well as environments
whose mobile users are a lesser percentage of the user base.

Dependencies: `{"src": "lib/script.js", "global": true}`


### Local Storage Loader

Script: *lib/lumbar-loader-localstorage.js*

The local storage loader provides an additional caching layer on top
of the core browser caching techniques. Under some environments,
particularly mobile, this may prove useful as the normal browser
caching routines may be limited due to device restrictions.

This technique does have some drawbacks in that it limits resource
usage to resources available on the local domain only (or exposed via
CORS in supporting environments) and it creates a bit of pain when
attempting to debug as resources must be manually evicted from the
**localStorage** cache to test changes.

Dependencies: `{"src": "lib/local-cache.js", "global": true}`


#### Loader Module

For larger applications is is recommended that a separate loader module is used to
minimize the content size that is not cacheable. This can be done using the
`topLevelName` attribute on the given module.

This will set the Loader as a global variable with the name provided
as *topLevelName*.

*lumbar.json*:

    {
      "modules": {
        "loader": {
          "topLevelName": "Loader",
          "scripts": [
            ...
            "lib/lumbar-loader.js",
            "lib/lumbar-loader-{implementation}.js",
            {"module-map": true},
            "js/load.js"
          ]
        },
        "base": {
          ...
        }
      }
    }

*js/load.js*:

    Loader.loader.loadModule('base', function() {
      Application.init();
    });

Where the base module implements the `Application` module and exports an initializer
named `init`.

## Feature Mixins

### Backbone Route Loader

The backbone loader mixin, *lumbar-loader-backbone.js* adds the ability to automatically load a
module when any of it's associated route is routed in backbone.

This plugin must be loading after both the core loader logic and backbone itself have been loaded
although it is not required that it is declared in the same module as either. If not defined after
the **module-map** and all other dependencies then it must be explicitly initialized using the
`initBackboneLoader`. This call should occur prior to any modules that implement those routes
being loaded.

If the loader module is a module other than the one that the mixin is loaded in then a reference to
the loader module must be passed into the `initBackboneLoader` call. For example if loading the
application module explicitly:

    Loader.loader.loadModule('base', function() {
      Application.initBackboneLoader(Loader);
    });


### Module Load Events Mixin

The load events mixin, *lumbar-loader-events.js*, adds backbone events to the load process. If
loaded after backbone this mixin will automatically initialize itself, otherwise `loader.initEvents`
must be explicitly called after backbone has been loaded.

This mixin adds the following backbone events to the loader object:

 * `load:start` : Emitted at the start of a module load. The module name is passed as the first parameter.
 * `load:end` : Emitted after all resources have been loaded for a given module. The module name is passed as the first parameter.


### Module Load Performance Mixin

## Testing

The loader can be tested using phantom js via `npm test`. This assumes that `phantomjs` is available on
the current path and that `npm start` server is running in the background.

Real browser testing can be done by running `npm start` and hitting `http://localhost:8083/index-standard.html`
and `http://localhost:8083/index-local.html` directly in the browser.

## Supported Browsers

The core loader functionality is supported on iOS 4+, Android 2+, Chrome, Firefox, Safari 4+, IE 8+.
Feature mixins such as the performance logger may require polyfills, or may operate with reduced
feature sets on some supported browsers.

Note that prior versions of IE, back to IE6, can be supported by reworking the duplicate prevention
routines in `checkLoaderResources` to utilizes methods other than `querySelector`.

