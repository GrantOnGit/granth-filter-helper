import { FilterHelper } from './filter-helper';
import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze';
// Write your package code here!

// Variables exported by this module can be imported by other packages and
// applications. See filter-helper-tests.js for an example of importing.
export const name = 'filter-helper';

Blaze.TemplateInstance.prototype.parent = function (levels) {
    var view = this.view;
    if (typeof levels === "undefined") {
        levels = 1;
    }
    while (view) {
        if (view.name.substring(0, 9) === "Template." && !(levels--)) {
            return view.templateInstance();
        }
        view = view.parentView;
    }
};

class FilterHelpersController {
    constructor() {
        this.helpers = new Map();

        console.log("Created FilterHelpersController");
        return this.init.bind(this);
    }

    init() {
        const template = Template.instance();

        if(typeof template.filterHelpers === "undefined") {
            template.filterHelpers = this;
        }

        return this;
    }

    create( collection, subscription, tag = null ) {
        console.log("FilterHelpers.Create", tag);
        const template = Template.instance();
        const helper = new FilterHelper( template, collection, subscription, tag);

        if(this.helpers.has(template)) {
            this.helpers.get(template).push(helper);
        }
        else {
            this.helpers.set(template, [helper]);
        }

        return helper;
    }

    get( tag = null ) {
        const template = Template.instance();
        var result = null;
        var workingTemplate = template;
        var count = 1; // Safety

        while(workingTemplate !== null && count < 1000 ) {

            if(this.helpers.has(workingTemplate)) {
                const helpers = this.helpers.get(workingTemplate);
                const found = helpers.find( helper => helper.tag === tag );

                if(found) {
                    result = found;
                    break;
                }
            }
            
            workingTemplate = workingTemplate.parent();
            count++;
        }

        // console.log("FilterHelpers.Get", tag, result);
        return result;
    }

    destroy( tag = null ) {
        const template = Template.instance();
        var result = null;
        var workingTemplate = template;
        var count = 1; // Safety

        while(workingTemplate !== null && count < 1000 ) {
            if(this.helpers.has(workingTemplate)) {
                const helpers = this.helpers.get(workingTemplate);
                const found = helpers.find( helper => helper.tag === tag );

                if(found) {
                    helpers.pop(found);

                    if(helpers.length === 0) {
                        console.log("Deleting entry");
                        this.helpers.delete(workingTemplate);
                    }

                    break;
                }
            }
            
            workingTemplate = workingTemplate.parent();
            count++;
        }
    }
}

export const FilterHelpers = new FilterHelpersController();

