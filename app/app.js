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

var App = React.createClass({
	displayName: "App",

	getInitialState: function getInitialState() {
		return { data: dummyData };
	},

	loadArticles: function loadArticles() {
		$.ajax({
			url: this.props.url,
			dataType: 'json',
			cache: false,
			success: (function (newData) {
				this.setState({ data: newData.data });
			}).bind(this),

			error: (function (xhr, status, err) {
				console.error("this.props.url: ", status, err.toString());
			}).bind(this)
		});
	},

	componentDidMount: function componentDidMount() {
		//this.loadArticles();
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

		var articles = this.state.data.map(function (a) {
			return React.createElement(
				Article,
				{ articleTitle: a.title, author: a.author, key: a.id, id: a.id },
				a.text,
				a.extra
			);
		});

		if (this.props.module === 'articleList') module = React.createElement(ArticleList, { articlesTitle: "Latest Articles", data: this.state.data, data: articles,
			_update: this._update });

		if (this.props.module === 'singleArticle') module = React.createElement(Article, { data: articles });

		// Append error function
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
					module,
					React.createElement("br", null)
				)
			)
		);
	}
});

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
		var heading = self.props.dbname ? self.props.dbname : 'Databases';

		// Get list of tables/databases
		var datalist = this.state.data.map(function (item) {
			var itemEntry = self.props.dbname ? item.Table : item.Database;

			return React.createElement(
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
				React.createElement(
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
								{ href: '#/db/' + self.props.dbname + '/sql' },
								"SQL command"
							)
						),
						React.createElement(
							"li",
							null,
							"Import"
						),
						React.createElement(
							"li",
							null,
							"Export"
						)
					)
				),
				React.createElement(SideNavDatalist, { heading: heading, data: this.state.data, data: datalist })
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

var ArticleList = React.createClass({
	displayName: "ArticleList",

	getInitialState: function getInitialState() {
		return { data: this.props.data };
	},

	propTypes: {
		data: React.PropTypes.array.isRequired
	},

	render: function render() {
		return React.createElement(
			"div",
			{ className: "articleList col-sm-12" },
			React.createElement(
				"h2",
				null,
				this.props.articlesTitle
			),
			React.createElement(
				"ul",
				null,
				this.props.data
			),
			React.createElement(ArticleForm, { _update: this.props._update })
		);
	}
});

var Article = React.createClass({
	displayName: "Article",

	render: function render() {
		var idName = "article_" + this.props.id;
		return React.createElement(
			"li",
			{ id: idName },
			React.createElement(
				"h4",
				{ className: "title" },
				React.createElement(
					"a",
					{ onClick: nav('/article/' + this.props.id) },
					React.createElement(
						"b",
						null,
						this.props.articleTitle
					)
				)
			),
			React.createElement(
				"h5",
				{ className: "articleAuthor" },
				React.createElement(
					"em",
					null,
					"By ",
					this.props.author
				)
			),
			React.createElement(
				"p",
				null,
				this.props.children[0]
			)
		);
	}
});

var ArticleForm = React.createClass({
	displayName: "ArticleForm",

	getInitialState: function getInitialState() {
		return { author: '', text: '' };
	},

	handleAuthorChange: function handleAuthorChange(e) {
		this.setState({ author: e.target.value });
	},

	handleTextChange: function handleTextChange(e) {
		this.setState({ text: e.target.value });
	},

	handleSubmit: function handleSubmit(e) {
		e.preventDefault();

		var author = this.state.author.trim();
		var text = this.state.text.trim();

		if (!text || !author) return;

		// Send request
		var obj = {
			id: dummyData.length + 1,
			title: 'New',
			author: this.state.author,
			text: this.state.text,
			extra: '...'
		};

		console.log('article submitted!');

		// Empty the form fields
		this.setState({ author: '', text: '' });
		this.props._update(obj);
	},

	render: function render() {
		return React.createElement(
			"form",
			{ className: "articleForm", onSubmit: this.handleSubmit },
			React.createElement(
				"h3",
				null,
				"Submit an article..."
			),
			React.createElement(
				"a",
				{ onClick: nav('/test') },
				"Hello!"
			),
			React.createElement(
				"div",
				null,
				React.createElement("input", { type: "text", placeholder: "Your name",
					onChange: this.handleAuthorChange, value: this.state.author })
			),
			React.createElement(
				"div",
				null,
				React.createElement("textarea", { placeholder: "Say something...", value: this.state.text,
					onChange: this.handleTextChange })
			),
			React.createElement(
				"div",
				null,
				React.createElement("input", { type: "submit", value: "Post" })
			)
		);
	}
});

var Amplify = React.createClass({
	displayName: "Amplify",

	getInitialState: function getInitialState() {
		console.log('Setup amplify');
		return { module: React.createElement("div", null) };
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
					module: React.createElement(App, { url: api('list/articles'), module: "articleList", sidenav: sidenav })
				});
			},
			'/db/:dbname': function dbDbname(dbname) {
				console.log("show tables from " + dbname);
				var sidenav = React.createElement(SideNav, { url: api('show/tables/' + dbname), dbname: dbname });
				self.setState({
					module: React.createElement(App, { url: api('list/articles'), module: "articleList", sidenav: sidenav })
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
				this.state.module
			),
			React.createElement("br", null)
		);
	}
});

ReactDOM.render(React.createElement(Amplify, { api_src: "api/v1/" }), document.getElementById('main'));