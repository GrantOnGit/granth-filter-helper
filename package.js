Package.describe({
  name: 'granth:filter-helper',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'Simple controller for filtering, paginating, creating tables, creating csvs from a collection.',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/GrantOnGit/meteor-filter-helper.git',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.6.1');
  api.use('ecmascript@0.9.0');
  api.use('granth:table-helper', "client", {weak: true});
  api.mainModule('filter-helpers.js');
});

// Package.onTest(function(api) {
//   api.use('ecmascript@0.9.0');
//   api.use('tinytest');
//   api.use('granth:filter-helper');
//   api.mainModule('filter-helper-tests.js');
// });
