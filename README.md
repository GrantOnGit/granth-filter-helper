## FilterHelper ##

- Simple subscription pipeline
- Reactive filters
- Pagination
- Sorting

### FilterHelper Template Packages ###

These optional template packages can be added to provide ready made Blaze templates that integrate seamlesly with FilterHelper. Each package provides the following elements:

- Table (checkable / sortable)
- Pagination
- Filter - Dropdown
- Filter - Date
- Filter - Text Search
- Filter - Checkbox
- Filter - Switch / Toggle
- Filter - Radios

#### granth:filter-helper-bootstrap4

Bootstrap 4 formatted. You must include Bootstrap 4 yourself. You can use [package name] for this.

#### granth:filter-helper-semantic (coming soon)

Semantic ui formatted. You must include Semantic UI yourself. You can use [package name] for this.

### Server Utils ###

The following server utils compliment FilterHelper and can assist in creating super-DRY collections. Take a look at the following article for a walk through: [Article Link]

#### granth:publish-with-count ####

Use Meteor.publishWithCount instead of Meteor.publish. This automatically creates the server method required for FilterHelper pagination.

#### granth:paged-query ####

Easily create pageable queries.