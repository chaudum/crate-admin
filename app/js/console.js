define(['jquery',
        'underscore',
        'backbone',
        'base',
        'SQL',
        'text!views/console.html',
        'text!views/table.html',
        'text!views/row.html',
        'bootstrap'
    ], function ($, _, Backbone, base, SQL, ConsoleTemplate, TableTemplate, RowTemplate) {

    var Console = {};

    Console.Row = Backbone.Model.extend({
        constructor: function (args) {
            this.attributes = {};
            this.set({values: args});
        }
    });

    Console.RowView = base.CrateView.extend({
        tagName: 'tr',
        template: _.template(RowTemplate),

        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });

    Console.Table = Backbone.Collection.extend({

        model: Console.Row,

        initialize: function (models, options) {
            this.headers = options.headers;
        }

    });

    Console.TableView = base.CrateView.extend({

        template: _.template(TableTemplate),

        render: function () {
            this.$el.html(this.template({headers: this.collection.headers}));
            _.each(this.collection.models, function (row) {
                var v = new Console.RowView({model: row});
                this.$('tbody').append(v.render().$el);
            }, this);
            return this;
        }

    });

    Console.ConsoleView = base.CrateView.extend({

        id: 'page-wrapper',
        template: _.template(ConsoleTemplate),

        events: {
            'submit form': 'execute'
        },

        execute: function (ev) {

            var sq,
                self = this,
                stmt = this.$('#query').val();

            ev.preventDefault();
            ev.stopPropagation();

            sq = new SQL.Query(stmt);
            sq.execute().done(function (res) {
                var table = new Console.Table(res.rows, {headers: res.cols});
                var tableView = new Console.TableView({collection: table});
                self.$('#table-container').html(tableView.render().$el);
            }).error(function (err) {
                var alrt = base.ErrorFactory(err.responseJSON.error.message);
                self.$('#errors').append(alrt);
            });
        },

        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            this.$('.alert').hide();
            return this;
        }
    });

    return Console;
});
