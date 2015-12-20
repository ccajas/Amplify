"use strict";

var dummyData = [{ id: 1, title: "First", author: "Pete Hunt", text: "Placeholder text", extra: "..." }, { id: 2, title: "Another", author: "Jordan Walke", text: "Placeholder text", extra: "..." }];

var nav = function nav(url, fn) {
	var base = ''; //"/amplite_r";
	if (fn != null) {
		routie(base + url, fn);
		return;
	}
	return function () {
		console.log(base + url);
		routie(base + url);
	};
};

var Header = React.createClass({
	displayName: "Header",

	render: function render() {
		return React.createElement(
			"header",
			{ className: "container-fluid" },
			React.createElement(
				"div",
				{ className: "row-fluid" },
				React.createElement(
					"h3",
					{ className: "col-sm-12" },
					React.createElement(
						"a",
						{ href: "#" },
						"Amplify"
					),
					React.createElement(
						"a",
						{ href: "#" },
						React.createElement(
							"span",
							null,
							"lite"
						)
					)
				)
			)
		);
	}
});

/** Main app module area **/

var App = React.createClass({
	displayName: "App",

	getInitialState: function getInitialState() {
		return { data: dummyData };
	},

	loadData: function loadData() {
		$.ajax({
			url: this.props.url,
			dataType: 'json',
			cache: false,
			success: (function (newData) {
				this.setState({ data: newData.request });
			}).bind(this),

			error: (function (xhr, status, err) {
				console.error("this.props.url:", status, err.toString());
			}).bind(this)
		});
	},

	componentDidMount: function componentDidMount() {
		this.loadData();
	},

	componentWillUnmount: function componentWillUnmount() {
		//this.intervals.map(clearInterval);
	},

	_update: function _update(val) {
		this.state.data.push(val);
		this.setState({ data: this.state.data });
	},

	_error: function _error() {},

	render: function render() {
		var module = '';
		var error = '';

		if (this.props.module === 'articleList') module = React.createElement(ArticleList, { articlesTitle: "Latest Articles", data: this.state.data, data: articles,
			_update: this._update });

		if (this.props.module === 'singleArticle') module = React.createElement(Article, { data: articles });

		if (this.props.module === 'home') module = React.createElement(Home, { webserver: this.state.data });

		if (this.props.module === 'dataview') module = React.createElement(DataView, { datatype: this.props.datatype, data: this.state.data });

		// Append error function for sidenav use
		this.props.sidenav.props._displayError = this._error;

		return React.createElement(
			"div",
			{ className: "row-fluid" },
			React.createElement(
				"section",
				{ className: "col-sm-2" },
				this.props.sidenav
			),
			React.createElement(
				"section",
				{ className: "col-sm-10" },
				React.createElement(
					"div",
					null,
					this.props.module,
					React.createElement("br", null)
				)
			)
		);
	}
});

/** Home module **/

var Home = React.createClass({
	displayName: "Home",

	render: function render() {
		var extensions = $.makeArray(this.props.webserver.extensions);

		return React.createElement(
			"div",
			{ className: "col-sm-12" },
			React.createElement(
				"h3",
				null,
				"Amplify Info"
			),
			React.createElement(
				"h4",
				null,
				"Web Server"
			),
			React.createElement(
				"ul",
				null,
				React.createElement(
					"li",
					null,
					React.createElement(
						"h5",
						null,
						"Software"
					),
					" ",
					this.props.webserver.software
				),
				React.createElement(
					"li",
					null,
					React.createElement(
						"h5",
						null,
						"PHP version"
					),
					" ",
					this.props.webserver.phpversion
				),
				React.createElement(
					"li",
					null,
					React.createElement(
						"h5",
						null,
						"Extensions"
					),
					" ",
					extensions.join(', ')
				)
			)
		);
	}
});

/** Side navbar **/

var SideNav = React.createClass({
	displayName: "SideNav",

	getInitialState: function getInitialState() {
		return { data: [], dbname: '' };
	},

	loadData: function loadData() {
		console.log('load sidebar');

		$.ajax({
			url: this.props.url,
			dataType: 'json',
			cache: false,
			success: (function (data) {
				this.setState({
					data: data.request.rows, dbname: this.props.dbname });
			}).bind(this),

			error: (function (xhr, status, err) {
				this.props._displayError(xhr.responseJSON.message);
				console.error("this.props.url:", status, err.toString());
			}).bind(this)
		});
	},

	componentDidMount: function componentDidMount() {
		this.loadData();
	},

	componentDidUpdate: function componentDidUpdate() {
		if (this.state.dbname != this.props.dbname) this.loadData();
	},

	render: function render() {
		var self = this;
		var navheading = self.props.dbname ? self.props.dbname : 'Databases';

		// Get list of tables/databases
		var datalist = this.state.data.map(function (item) {
			var itemEntry = self.props.dbname ? item.Table : item.Database;

			// Return appropriate link based on item type
			return self.props.dbname ? React.createElement(
				"li",
				null,
				React.createElement(
					"a",
					{ href: '#/db/' + self.props.dbname + '/table/' + itemEntry },
					itemEntry
				)
			) : React.createElement(
				"li",
				null,
				React.createElement(
					"a",
					{ href: '#/db/' + itemEntry },
					itemEntry
				)
			);
		});

		return React.createElement(
			"div",
			{ className: "sidenav" },
			React.createElement(
				"h4",
				null,
				"Sidebar nav"
			),
			React.createElement(
				"ul",
				{ className: "nav" },
				React.createElement(SideNavTools, { dbname: self.props.dbname }),
				React.createElement(SideNavDatalist, { heading: navheading, data: this.state.data, data: datalist })
			)
		);
	}
});

var SideNavTools = React.createClass({
	displayName: "SideNavTools",

	render: function render() {
		return React.createElement(
			"li",
			{ className: "tools" },
			React.createElement(
				"div",
				null,
				"Tools"
			),
			React.createElement(
				"ul",
				{ className: "subnav" },
				React.createElement(
					"li",
					null,
					React.createElement(
						"a",
						{ href: '#/db/' + this.props.dbname + '/sql' },
						"SQL command"
					)
				),
				React.createElement(
					"li",
					null,
					React.createElement(
						"a",
						{ href: '#/db/' + this.props.dbname + '/import' },
						"Import"
					)
				),
				React.createElement(
					"li",
					null,
					React.createElement(
						"a",
						{ href: '#/db/' + this.props.dbname + '/export' },
						"Export"
					)
				)
			)
		);
	}
});

var SideNavDatalist = React.createClass({
	displayName: "SideNavDatalist",

	render: function render() {
		return React.createElement(
			"li",
			null,
			React.createElement(
				"div",
				null,
				this.props.heading
			),
			React.createElement(
				"ul",
				{ className: "subnav" },
				React.createElement(
					"li",
					{ className: "show-from" },
					"stuff"
				),
				this.props.data
			)
		);
	}
});

/** DataView Module **/

var DataView = React.createClass({
	displayName: "DataView",

	render: function render() {
		return React.createElement(
			"div",
			{ className: "col-sm-12" },
			React.createElement(
				"h3",
				null,
				"Data View"
			),
			React.createElement(
				"h3",
				null,
				this.props.datatype,
				": ",
				React.createElement(
					"em",
					null,
					this.props.structureName
				)
			),
			React.createElement(
				"h4",
				{ "class": "sub" },
				"...",
				this.props.datatype,
				" found"
			)
		);
	}
});

var Amplify = React.createClass({
	displayName: "Amplify",

	getInitialState: function getInitialState() {
		console.log('Setup amplify');
		return { app: React.createElement("div", null) };
	},

	componentDidMount: function componentDidMount() {
		var self = this;
		var api = function api(path) {
			return self.props.api_src + path;
		};

		routie({
			// load the main module in the home page		
			'': function _() {
				console.log("home");
				var sidenav = React.createElement(SideNav, { url: api('show/databases/mysql'), dbname: "" });

				self.setState({
					app: React.createElement(App, { url: api('webserver'), module: "home", sidenav: sidenav })
				});
			},
			'/db/:dbname': function dbDbname(dbname) {
				console.log("show tables from " + dbname);
				var sidenav = React.createElement(SideNav, { url: api('show/tables/' + dbname), dbname: dbname });
				var module = React.createElement(DataView, { datatype: "Tables" });

				self.setState({
					app: React.createElement(App, { url: api('list/articles'), module: module, sidenav: sidenav })
				});
			},
			'/article/:id': function articleId(id) {
				console.log("single article");
				console.log(id);
				var mod = React.createElement(
					"div",
					{ className: "col-sm-12" },
					React.createElement(
						"h3",
						{ onClick: nav('/') },
						"Single Page View for article ",
						id
					)
				);
				self.setState({ module: mod });
			},
			'*': function _() {
				// default: go to landing page
				routie('');
			}
		});
	},

	render: function render() {
		console.log(this.state);
		return React.createElement(
			"div",
			null,
			React.createElement(Header, null),
			React.createElement(
				"div",
				{ className: "container-fluid", id: "container" },
				this.state.app
			),
			React.createElement("br", null)
		);
	}
});

ReactDOM.render(React.createElement(Amplify, { api_src: "api/v1/" }), document.getElementById('main'));