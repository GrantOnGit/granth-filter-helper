## FilterHelper ##

- Simple subscription pipeline
- Reactive filters
- Pagination
- Sorting

### FilterHelper Template Packages ###

These optional template packages can be added to provide ready made Blaze templates that integrate seamlesly with FilterHelper. Each package provides the following elements:

- Table (checkable / sortable)
- Pagination
- Filter - Dropdown (coming soon)
- Filter - Date (coming soon)
- Filter - Text Search (coming soon)
- Filter - Checkbox (coming soon)
- Filter - Switch / Toggle (coming soon)
- Filter - Radios (coming soon)

#### granth:filter-helper-bootstrap4

Bootstrap 4 formatted. You must include Bootstrap 4 yourself. You can use [package name] for this.

#### granth:filter-helper-semantic (coming soon)

Semantic ui formatted. You must include Semantic UI yourself. You can use [package name] for this.

### Server Utils ###

The following server utils compliment FilterHelper and can assist in creating super-DRY collections. Take a look at the following article for a walk through: [Article Link]

#### granth:publish-with-count (coming soon) ####

Use Meteor.publishWithCount instead of Meteor.publish. This automatically creates the server method required for FilterHelper pagination.

#### granth:paged-query (coming soon) ####

Easily create pageable queries.