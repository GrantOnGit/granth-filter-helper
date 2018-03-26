import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';

export class TableHelper {

	constructor(fields = null, modify = null) {
		this.events = {};
		this.fields = {};
		//this.data = new ReactiveVar([]);
		this.data = [];
		this.parse(fields, modify);
	}

	init = function(data) {
		Tracker.autorun(() => {
			console.log("Table Autorun");

			if(typeof data === "function") {
				this.data = data();
			}
			else {
				this.data = data;
			}
		});

		return this;
	}.bind(this);

	parse = function(fields, modify) {
		if(fields === null) {
            return this;
        }

        // Test if simplschema
        if(typeof fields.schema === "function") {
            fields = Object.assign({}, fields.schema());
        }

        var sorting = {};

        if(modify) {
            if(modify.include) {
                const newFields = {};

                modify.include.forEach((key) => {
                    if(key in fields) {
                        newFields[key] = fields[key];
                    }
                });

                fields = newFields;
            }

            if(modify.exclude) {
                modify.exclude.forEach((key) => {
                    delete fields[key];
                });
            }

            if(modify.sort) {
                sorting = Object.assign({}, fields);

                if(modify.sort === true) {
                    Object.keys(fields).forEach((key) => {
                        sorting[key] = 0;
                    });
                }
                else if(modify.sort.include) {
                    Object.keys(fields).forEach((key) => {
                        sorting[key] = modify.sort.include[key];
                    });
                }
                else if(modify.sort.exclude) {
                    Object.keys(fields).forEach((key) => {
                        sorting[key] = 0;
                    });
                    Object.keys(modify.sort.exclude).forEach((key) => {
                        delete sorting[key];
                    });
                }
            }
        }

        const includedKeys = Object.keys(fields).filter((key) => {
            const field = fields[key];
            return !(field.hidden && field.hidden == true);
        });

        const fieldArray = includedKeys.map((key) => {
            return {
                key: key,
                label: (fields[key].label) ? fields[key].label : ""
            }  
        });

        this.fields = fieldArray;
        this.sorting = sorting;

        return this;
	}.bind(this);


	fields = function() {
		const tables = this.reactive.get("tables");

		return this.fields;
	}.bind(this);

	values = function() {
		return this.data.map((item) => {
			const obj = [];

			this.fields.forEach((field) => {
				if(field.key in item) {
					if(item[field.key] !== false) {
						obj.push(item[field.key]);
					}
					else {
						obj.push("false");
					}

				}
				else {
					obj.push("");
				}
			});

			return obj;
		});
	}.bind(this);

	getSort = function(key, direction = null) {
		if(typeof direction !== "string") {
			direction = null;
		}

		const sorting = this.sorting;

		if(direction === null) {
			return (key in sorting);
		}

		const val = sorting[key];
		//console.log("getSort", direction, val);
		switch (direction) {
			case "asc":
			case 1:
				return (val === 1); 
				break;
			case "desc":
			case -1:
				return (val === -1);
				break;
			case "none":
			case 0:
				return (val === 0);
				break;
		}
	}.bind(this);

	setSort = function(key, direction) {
		if(!(key in this.sorting)) {
			console.log("FilterHelper | setSort - Key <" + key + "> does not exist.");
		}

		switch (direction) {
			case "asc":
			case 1: 
				this.sorting[key] = 1;
				break;
			case "desc":
			case -1: 
				this.sorting[key] = -1;
				break;
			case "none":
			case 0: 
				this.sorting[key] = 0;
				break;
		}
	}.bind(this);

	cycleSort = function(key) {
		var val = this.sorting[key];

		if(val < 1) {
			val++;
		}
		else {
			val = -1;
		}

		this.sorting[key] = val;
		//this.setSortinSg(this.sorting);
		this.trigger("sort", this.sorting, key);
	}.bind(this);

	on = function(event, method) {
		if(!Array.isArray(this.events[event])) {
			this.events[event] = [];
		}

		if(typeof method === "function") {
			this.events[event].push(method);
		}
	}.bind(this);

	trigger = function(event, ...args) {
		if(!(event in this.events)) {
			return;
		}

		this.events[event].forEach((evt) => {
			evt(...args);
		});
	}.bind(this);

}