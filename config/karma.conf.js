// Karma configuration
// Generated on Thu Aug 01 2013 15:44:35 GMT-0400 (EDT)


// base path, that will be used to resolve files and exclude
basePath = '../';


// list of files / patterns to load in the browser
files = [
  JASMINE,
  JASMINE_ADAPTER,
  "public/vendor/angular.min.js",
  "test/lib/angular/angular-mocks.js",
  "public/js/*.js",
  "test/unit/spies.js",
  "test/unit/specs/*.js"
];

// enable / disable watching file and executing tests whenever any file changes
autoWatch = true;


// Start these browsers, currently available:
// - Chrome
// - ChromeCanary
// - Firefox
// - Opera
// - Safari (only Mac)
// - PhantomJS
// - IE (only Windows)
browsers = ['Chrome'];
