import { Meteor } from 'meteor/meteor';
import { isArray } from "util";
import { Tracker } from 'meteor/tracker';
import { _ } from 'meteor/underscore';
import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Mongo } from 'meteor/mongo';
import { TableHelper } from './table-helper';

export class FilterHelper {

    // #region Initialization

    constructor(template, collection, subscription, tag = null) {
        console.log("Init FilterController");
        console.log("Using Subscription", subscription);

        // Manual Reactivity
        this.r = new ReactiveVar(0);

        this.tag = tag;
        this.result = [];
        this.template = template;
        this.q = null;
        this.update = new ReactiveVar(null);
        this.subscription = subscription;
        this.collection = collection;
        this.addFilters([]);
        
        // Pagination
        this.sort = new ReactiveVar({});
        this.count = new ReactiveVar(0);
        this.perPage = new ReactiveVar(100);
        this.page = new ReactiveVar(1);

        // Tables
        //this.tables = {};
        // this.reactive = new ReactiveDict();
        // this.reactive.set("tables", {});

        this.tables = {};
    }

    destroy() {
        this.template.filterHelpers = null;
        this.template = null;
        this.filters = null;
        this.subscription = null;
        this.collection = null;
    }

    init(query, mapper = null) {
        this.initialQuery = query;
        this.mapper = mapper;

        this.template.autorun(() => {
            console.log("Autorun");
            const update = this.update.get();
            this.combined = this.buildFilterObject(this.initialQuery(), this.filters);
            
            const final = Object.assign({
                pagination: {
                    limit: this.perPage.get(),
                },
                sort: this.sort.get(),
            }, this.combined);
            
            this.template.subscribe(this.subscription, final);

            // Counts / Pagination
            
            //if (Meteor.server.method_handlers[this.subscription + ".count"]) {
                console.log("Count endpoint exists"); 
                Meteor.call(this.subscription + '.count', (err, res) => {
                    console.log("Count received")
                    this.count.set(res);
                });
            //}

            const perPage = this.perPage.get();
            const page = this.page.get();
        });

        return this;
    }

    addFilters(filters) {
        if(!isArray(this.filters)) {
            this.filters = [];
        }

        // Should probably add some validation
        if(isArray(filters)) {
            this.filters = this.filters.concat(filters);
        }
    }

    // #endregion

    // #region Internal Methods

    // Take the original query and filters and merge them into a new query
    buildFilterObject(query, filters) {
        var obj = Object.assign({}, query);

        filters.forEach( (filter) => {
            if(isArray(filter.values) && filter.values.length > 0) {

                if(filter.values[0] == "") {
                    delete obj[filter.key];
                }
                else {
                    obj[filter.key] = filter.values[0];
                }
            }
        });

        return obj;
    }

    getFilterByKey(key) {
        const filter = this.filters.find( (filter) => filter.key == key);

        if(typeof filter !== "undefined") {
            return filter;
        }
    }

    // #endregion

    // #region Form Element Methods

    registerClearMethod(key, method) {
        const filter = this.getFilterByKey(key);

        if(typeof filter !== "undefined" && typeof method === "function") {
            filter.resetMethod = method;
        }
    }

    filterChanged(key, values) {
        // Update values
        //console.log("filterChanged", key, values.split(","));
        const vals = values.split(",");
        const filter = this.getFilterByKey(key);

        filter.values = vals;
        this.update.set(!this.update.get());
    }

    getUniqueValues(key) {
        const filter = this.filters.find( (filter) => filter.key == key);

        if(typeof filter !== "undefined" && isArray(filter.distinct)) {
            return filter.distinct;
        }
        
        return [];
    }

    calculatePagination() {

    }

    highlight(text, key, color="#21ba45") {
        if(typeof text === "undefined") {
            return "";
        }

        const filter = this.getFilterByKey(key);

        if(!isArray(filter.values) || filter.values.length == 0) {
            return text;
        }

        let value = filter.values[0];
        let result = text;

        let terms = value.trim().split(" ").map(function(item) {
            return item.trim();
        });

        terms.forEach( (term) => {
            const regex = new RegExp(term, "gi");
            const matches = text.match(regex);

            if(matches !== null) {
                result = result.replace(matches[0], "<strong style='color: " + color + "'>" + matches[0] + "</strong>");
            }
        });

        return Spacebars.SafeString(result);
    }

    // #endregion

    // #region Actions

    // Resets all filters to the initial state.
    resetFilters() {
        this.filters.forEach( (filter) => {
            if(typeof filter.resetMethod !== "undefined") {
                // Temp kludge
                filter.values = [""];
                filter.resetMethod();
            }
        });

        this.update.set(!this.update.get());
    }

    setValue(key, value, flush = false) {
        //console.log("Setting Value", key, value);

        const filter = this.getFilterByKey(key);

        if(typeof filter !== "undefined") {
            filter.values = [""];
        }

        if(flush) {
            this.update.set(!this.update.get());         
        }
    }

    // Returns the filtered collection.
    filtered() {
        const query = (this.mapper === null) ? this.combined : this.mapper(this.combined);
        const options = {
            limit: this.perPage.get(),
            skip: 0,
            sort: this.sort.get(),
        };

        console.log("Using Query", query, options);
        return this.collection.find(query, options);
    }

    setSorting(options) {
        const sort = {};
        Object.keys(options).forEach((key) => {
            if(options[key] !== 0) {
                sort[key] = options[key];
            }
        });

        this.sort.set(sort);
    }
    
    setPagination(options = null) {
        if(options !== null) {
            if(typeof options.perPage === "number") {
                this.perPage.set(options.perPage)
            }
        }

        return this;
    }

    pagination() {
        return {
            count: this.count.get(),
            page: 1,
            pages: 5,
            hasNext: true,
            hasPrev: true,
            perPage: function (limit = null) {
                if(limit === null) {
                    return this.perPage.get();
                }
                else {
                    this.perPage.set(limit);
                    return this.pagination();
                }
            }.bind(this),
            page: function (page = null) {
                if(limit === null) {
                    return this.page.get();
                }
                else {
                    this.page.set(page);
                    return this.pagination();
                }
            }.bind(this),
        }
    }

    addTable(fields = null, modify = null, tag = "default") {
        const table = new TableHelper(fields, modify);
        table.init(function() {
            return this.filtered().fetch();
        }.bind(this));

        table.on("sort", (sortArray, key) => {
            this.setSorting(sortArray);
        });

        this.tables[tag] = table;

        return this;
    }

    getTable(tag = "default") {
        return this.tables[tag];
    }

    // #endregion

}