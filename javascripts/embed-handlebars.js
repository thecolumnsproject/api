// Setup necessary handlebars templates and helpers
// Handlebars.registerPartial('row', Columns.EmbeddableTemplates['templates/embed-table/row.hbs']);
Handlebars.registerHelper('partial', function(name, ctx, hash) {
    console.log(name);
    console.log(Handlebars.partials);
    var ps = Handlebars.partials;
    if(typeof ps[name] !== 'function')
        ps[name] = Handlebars.compile(ps[name]);
    return ps[name](ctx, hash);
});
Handlebars.registerPartial('group', Columns.EmbeddableTemplates['views/embed-table/row-group.hbs']);
Handlebars.registerPartial('column', Columns.EmbeddableTemplates['views/embed-table/row-value.hbs']);
Handlebars.registerPartial('footer', Columns.EmbeddableTemplates['views/embed-table/footer.hbs']);
Handlebars.registerPartial('layout', Columns.EmbeddableTemplates['views/embed-table/layout.hbs']);
Handlebars.registerPartial('style', Columns.EmbeddableTemplates['views/embed-table/style.hbs']);

Handlebars.registerHelper('ifIsGroup', function(type, options) {
	return type == 'group' ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('ifIsSingle', function(type, options) {
	return type == 'single' ? options.fn(this) : options.inverse(this);
});

module.exports = Handlebars;