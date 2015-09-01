this["Columns"] = this["Columns"] || {};
this["Columns"]["EmbeddableTemplates"] = this["Columns"]["EmbeddableTemplates"] || {};

this["Columns"]["EmbeddableTemplates"]["views/embed-table/analytics.hbs"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<!-- Google Analytics -->\n<script>\n  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){\n  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),\n  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)\n  })(window,document,'script','//www.google-analytics.com/analytics.js','gaColumnz');\n\n  gaColumnz('create', 'UA-58560399-2', 'auto');\n  gaColumnz('send', 'pageview');\n\n</script>\n<!-- End Google Analytics -->";
},"useData":true});

this["Columns"]["EmbeddableTemplates"]["views/embed-table/body.hbs"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "	<div class=\"columns-table-container\">\n		<div class=\"columns-table-wrapper\">\n			<div class=\"columns-table\">\n			</div>\n		</div>\n	</div>";
},"useData":true});

this["Columns"]["EmbeddableTemplates"]["views/embed-table/error.hbs"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div class=\"columns-table-error\">\n	<i class=\"icon-columns columns-table-error-icon\"></i>\n	<span class=\"columns-table-error-text\">\n		<span class=\"columns-table-error-text-header\">Shoot, we can't load the table right now.<br />\n		<span class=\"columns-table-error-text-body\">Tap to try again.</span>\n	</span>\n</div>";
},"useData":true});

this["Columns"]["EmbeddableTemplates"]["views/embed-table/footer.hbs"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var helper;

  return "			<i class=\"columns-table-footer-icon columns-verified-source-icon icon-circle-check-open\"></i>\n			"
    + this.escapeExpression(((helper = (helper = helpers.source || (depth0 != null ? depth0.source : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"source","hash":{},"data":data}) : helper)))
    + "\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper;

  return "<div class=\"columns-table-footer\">\n	<span class=\"columns-table-source\">\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.source : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "	</span>\n	<span class=\"columns-table-items-count\">"
    + this.escapeExpression(((helper = (helper = helpers.item_count || (depth0 != null ? depth0.item_count : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"item_count","hash":{},"data":data}) : helper)))
    + " Items</span>\n	<i class=\"columns-table-footer-icon columns-logo icon-columns\"></i>\n	<span class=\"columns-table-expand-button\">Expand</span>\n</div>";
},"useData":true});

this["Columns"]["EmbeddableTemplates"]["views/embed-table/header.hbs"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var helper;

  return this.escapeExpression(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"title","hash":{},"data":data}) : helper)));
},"3":function(depth0,helpers,partials,data) {
    return "Untitled";
},"5":function(depth0,helpers,partials,data) {
    var helper;

  return "<span class=\"columns-table-subtitle\">by "
    + this.escapeExpression(((helper = (helper = helpers.sort_by_column || (depth0 != null ? depth0.sort_by_column : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"sort_by_column","hash":{},"data":data}) : helper)))
    + "</span>";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<div class=\"columns-table-header\">\n	<div class=\"columns-table-header-name\">\n		<span class=\"columns-table-title\">"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.title : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.program(3, data, 0),"data":data})) != null ? stack1 : "")
    + "</span>\n		"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.sort_by_column : depth0),{"name":"if","hash":{},"fn":this.program(5, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\n	</div>\n	<div class=\"columns-table-header-controls\">\n		<button class=\"columns-table-header-button columns-table-close-button\">Close</button>\n	</div>\n</div>";
},"useData":true});

this["Columns"]["EmbeddableTemplates"]["views/embed-table/layout.hbs"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "data-"
    + alias3(((helper = (helper = helpers.property || (depth0 != null ? depth0.property : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"property","hash":{},"data":data}) : helper)))
    + "='"
    + alias3(((helper = (helper = helpers.value || (depth0 != null ? depth0.value : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"value","hash":{},"data":data}) : helper)))
    + "' layout-"
    + alias3(((helper = (helper = helpers.property || (depth0 != null ? depth0.property : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"property","hash":{},"data":data}) : helper)))
    + "='"
    + alias3(((helper = (helper = helpers.value || (depth0 != null ? depth0.value : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"value","hash":{},"data":data}) : helper)))
    + "'\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.layout : depth0),{"name":"each","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "");
},"useData":true});

this["Columns"]["EmbeddableTemplates"]["views/embed-table/loading.hbs"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper;

  return "<div class=\"columns-table-loading\">\n	<img src=\""
    + this.escapeExpression(((helper = (helper = helpers.img_path || (depth0 != null ? depth0.img_path : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"img_path","hash":{},"data":data}) : helper)))
    + "loading-gray.gif\" class='columns-table-loading-img'>\n	<span class=\"columns-table-loading-text\">Loading data...</span>\n</div>";
},"useData":true});

this["Columns"]["EmbeddableTemplates"]["views/embed-table/row-group.hbs"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<div class='row-group'\n"
    + ((stack1 = this.invokePartial(partials.layout,depth0,{"name":"layout","data":data,"indent":"\t ","helpers":helpers,"partials":partials})) != null ? stack1 : "")
    + "	 "
    + ((stack1 = this.invokePartial(partials.style,depth0,{"name":"style","data":data,"helpers":helpers,"partials":partials})) != null ? stack1 : "")
    + ">\n</div>";
},"usePartial":true,"useData":true});

this["Columns"]["EmbeddableTemplates"]["views/embed-table/row-layout.hbs"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div class=\"columns-table-row\">\n</div>";
},"useData":true});

this["Columns"]["EmbeddableTemplates"]["views/embed-table/row-value.hbs"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper;

  return "<span class=\"row-value\" "
    + ((stack1 = this.invokePartial(partials.style,depth0,{"name":"style","data":data,"helpers":helpers,"partials":partials})) != null ? stack1 : "")
    + ">\n	"
    + this.escapeExpression(((helper = (helper = helpers.data || (depth0 != null ? depth0.data : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"data","hash":{},"data":data}) : helper)))
    + "\n</span>";
},"usePartial":true,"useData":true});

this["Columns"]["EmbeddableTemplates"]["views/embed-table/row.hbs"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = this.invokePartial(partials.row_layout,depth0,{"name":"row_layout","data":data,"helpers":helpers,"partials":partials})) != null ? stack1 : "");
},"usePartial":true,"useData":true});

this["Columns"]["EmbeddableTemplates"]["views/embed-table/rows.hbs"] = Handlebars.template({"1":function(depth0,helpers,partials,data,blockParams,depths) {
    var stack1;

  return "	"
    + ((stack1 = (helpers.partial || (depth0 && depth0.partial) || helpers.helperMissing).call(depth0,(depths[1] != null ? depths[1].row_layout : depths[1]),depth0,{"name":"partial","hash":{},"data":data})) != null ? stack1 : "")
    + "\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data,blockParams,depths) {
    var stack1;

  return ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.rows : depth0),{"name":"each","hash":{},"fn":this.program(1, data, 0, blockParams, depths),"inverse":this.noop,"data":data})) != null ? stack1 : "");
},"useData":true,"useDepths":true});

this["Columns"]["EmbeddableTemplates"]["views/embed-table/skeleton.hbs"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div class=\"columns-table-widget cleanslate\"></div>";
},"useData":true});

this["Columns"]["EmbeddableTemplates"]["views/embed-table/style.hbs"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return alias3(((helper = (helper = helpers.property || (depth0 != null ? depth0.property : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"property","hash":{},"data":data}) : helper)))
    + ":"
    + alias3(((helper = (helper = helpers.value || (depth0 != null ? depth0.value : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"value","hash":{},"data":data}) : helper)))
    + ";";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "style='"
    + ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.style : depth0),{"name":"each","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "'";
},"useData":true});