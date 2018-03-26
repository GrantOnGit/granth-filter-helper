// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by filter-helper.js.
import { name as packageName } from "meteor/granth:filter-helper";

// Write your tests here!
// Here is an example.
Tinytest.add('filter-helper - example', function (test) {
  test.equal(packageName, "filter-helper");
});
