
var nav = function (url, fn) {
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

	render: function () {
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

	getInitialState: function () {
		return { data: [], errors: [] };
	},

	_error: function (errorMsg) {
		var errors = this.state.errors;

		if (errors.indexOf(errorMsg) < 0) {
			errors.push(errorMsg);
			this.setState({ errors: errors });
		}
	},

	render: function () {
		console.log("rendering app view...");
		var module = '';

		if (this.props.module === 'home') module = React.createElement(Home, { webserver: this.state.data, _error: this._error });

		if (this.props.module === 'dataview') module = React.createElement(DataView, { datatype: this.props.datatype, url: this.props.url,
			dbname: this.props.dbname, tablename: this.props.tablename, _error: this._error });

		return React.createElement(
			"div",
			{ className: "row-fluid" },
			React.createElement(
				"section",
				{ className: "col-sm-2" },
				React.createElement(SideNav, { url: this.props.sidenavUrl, dbname: this.props.dbname,
					tablename: this.props.tablename, _error: this._error })
			),
			React.createElement(
				"section",
				{ className: "col-sm-10" },
				(() => {
					if (this.state.errors.length) return React.createElement(
						"div",
						{ className: "col-sm-12" },
						React.createElement("br", null),
						React.createElement(
							"h4",
							null,
							"The following errors have been found:"
						),
						React.createElement("br", null),
						React.createElement(
							"p",
							{ className: "alert alert-danger" },
							this.state.errors
						)
					);
				})(),
				module
			)
		);
	}
});

/** Home module **/

var Home = React.createClass({
	displayName: "Home",

	render: function () {
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

/** DataView Module **/

var DataView = React.createClass({
	displayName: "DataView",

	getInitialState: function () {
		return { data: [], dbname: '', tablename: '' };
	},

	loadData: function () {
		$.ajax({
			url: this.props.url,
			dataType: 'json',
			cache: false,
			success: (function (data) {
				console.log(data);
				this.setState({
					data: data.request.rows,
					dbname: this.props.dbname,
					tablename: this.props.tablename
				});
			}).bind(this),

			error: (function (xhr, status, err) {
				this.props._error(xhr.responseJSON.request.message);
			}).bind(this)
		});

		// Scroll to top
		//window.scrollTo(0, 0);

		// Or smooth scroll
		$("html, body").animate({ scrollTop: 0 }, 400);
	},

	componentDidMount: function () {
		this.loadData();
	},

	componentDidUpdate: function () {
		if (this.state.dbname != this.props.dbname || this.state.tablename != this.props.tablename) {
			console.log("refresh dataview data");
			this.loadData();
		}
	},

	render: function () {
		console.log("rendering dataview...");

		var divStyle = { padding: '10px 15px' };

		if (this.state.data) {
			var rows = $.makeArray(this.state.data).map(function (row, i) {
				return React.createElement(
					"tr",
					{ key: i },
					Object.keys(row).map(function (key) {
						if (row[key] && row[key].length > 80) row[key] = row[key].substring(0, 75) + "...";

						return React.createElement(
							"td",
							{ className: "trim-info", key: key },
							row[key]
						);
					})
				);
			});

			console.log(this.state.data);

			/*
   var colNames = $.makeArray(this.state.data)
   	.map(function(row, i)
   {
   	console.log(this.state.data)
   	return (
          	<tr>
          	{
          		Object.keys(row[0]).map(function(key) {
          			console.log(key);
              		return <th key={key}>{key}</th>;
            		})
          	}
         		</tr>
        	);
   }); */

			return React.createElement(
				"div",
				{ className: "col-sm-12" },
				React.createElement(
					"h3",
					null,
					this.props.tablename ? 'Table: ' : 'Database: ',
					React.createElement(
						"em",
						null,
						this.props.tablename ? this.props.tablename : this.props.dbname
					)
				),
				React.createElement(
					"h4",
					{ className: "sub" },
					rows.length,
					" ",
					this.props.datatype,
					rows.length == 1 ? '' : 's'
				),
				React.createElement(
					"div",
					{ className: "row" },
					React.createElement(
						"h3",
						{ className: "col-sm-12" },
						this.props.datatype,
						"s"
					),
					React.createElement(
						"div",
						{ className: "col-sm-8 pull-left optiontabs" },
						React.createElement(
							"h4",
							{ className: "sub" },
							"With Selected:  ",
							React.createElement(
								"button",
								{ className: "btn" },
								"Edit"
							),
							" ",
							React.createElement(
								"button",
								{ className: "btn" },
								"Analyze"
							),
							" ",
							React.createElement(
								"button",
								{ className: "btn" },
								"Check"
							),
							" ",
							React.createElement(
								"button",
								{ className: "btn" },
								"Optimize"
							)
						)
					),
					React.createElement(
						"div",
						{ className: "col-sm-4 pull-right", style: divStyle },
						React.createElement("input", { placeholder: "Search in..." })
					)
				),
				React.createElement(
					"div",
					{ className: "datalist tableview" },
					React.createElement(
						"table",
						{ className: "col-sm-12" },
						React.createElement("thead", null),
						React.createElement(
							"tbody",
							null,
							rows
						)
					)
				)
			);
		} else {
			return React.createElement(
				"div",
				{ className: "col-sm-12" },
				React.createElement(
					"h4",
					null,
					"Loading..."
				)
			);
		}
	}
});

var Amplify = React.createClass({
	displayName: "Amplify",

	getInitialState: function () {
		console.log('Setup amplify');
		return { app: React.createElement("div", null) };
	},

	componentDidMount: function () {
		var self = this;
		var api = function (path) {
			return self.props.api_src + path;
		};

		routie({
			// load the main module in the home page		
			'': function () {
				console.log("home");

				self.setState({
					app: React.createElement(App, {
						module: "home",
						url: api('webserver'),
						sidenavUrl: api('show/databases/mysql'),
						dbname: "" })
				});
			},
			'/db/:dbname': function (dbname) {
				console.log("show tables from " + dbname);

				self.setState({
					app: React.createElement(App, {
						module: "dataview",
						url: api('show/tables/' + dbname),
						datatype: "Table",
						sidenavUrl: api('show/tables/' + dbname),
						dbname: dbname })
				});
			},
			'/db/:dbname/table/:tablename': function (dbname, tablename) {
				console.log("show columns from " + dbname);

				self.setState({
					app: React.createElement(App, {
						module: "dataview",
						url: api('show/columns/' + dbname + '.' + tablename),
						datatype: "Column",
						sidenavUrl: api('show/tables/' + dbname),
						dbname: dbname,
						tablename: tablename })
				});
			},
			'/article/:id': function (id) {
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
			'*': function () {
				// default: go to landing page
				routie('');
			}
		});
	},

	render: function () {
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