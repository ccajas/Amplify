

/** Main app module area **/

var App = React.createClass({
	displayName: 'App',

	getInitialState: function () {
		return { data: [], url: this.props.url, errors: [] };
	},

	componentDidUpdate: function () {
		if (this.state.url != this.props.url) this.setState({ url: this.props.url });
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

		if (this.props.module === 'home') module = React.createElement(Home, { url: this.state.url, webserver: this.state.data, _error: this._error });

		if (this.props.module === 'dataview') module = React.createElement(DataView, { datatype: this.props.datatype, url: this.state.url,
			dbname: this.props.dbname, tablename: this.props.tablename, _error: this._error });

		if (this.props.module === 'sql') module = React.createElement(Sql, { dbname: this.props.dbname, queryUrl: this.props.queryUrl, _error: this._error });

		return React.createElement(
			'div',
			{ className: 'row-fluid' },
			React.createElement(
				'section',
				{ className: 'col-sm-2' },
				React.createElement(SideNav, { url: this.props.sidenavUrl, dbname: this.props.dbname,
					tablename: this.props.tablename, _error: this._error })
			),
			(() => {
				if (this.state.errors.length) return React.createElement(
					'section',
					{ className: 'col-sm-10' },
					React.createElement(
						'div',
						{ className: 'col-sm-12' },
						React.createElement('br', null),
						React.createElement(
							'h4',
							null,
							'The following errors have been found:'
						),
						React.createElement('br', null),
						React.createElement(
							'p',
							{ className: 'alert alert-danger' },
							this.state.errors
						)
					)
				);else return React.createElement(
					'section',
					{ className: 'col-sm-10' },
					module
				);
			})()
		);
	}
});

/** Header component **/

var Header = React.createClass({
	displayName: 'Header',

	render: function () {
		return React.createElement(
			'header',
			{ className: 'container-fluid' },
			React.createElement(
				'div',
				{ className: 'row-fluid' },
				React.createElement(
					'h3',
					{ className: 'col-sm-12' },
					React.createElement(
						'a',
						{ href: '#' },
						'Amplify'
					),
					React.createElement(
						'a',
						{ href: '#' },
						React.createElement(
							'span',
							null,
							'lite'
						)
					)
				)
			)
		);
	}
});

/** Home module **/

var Home = React.createClass({
	displayName: 'Home',

	getInitialState: function () {
		return { webserver: [], url: this.props.url };
	},

	loadData: function () {
		$.ajax({
			url: this.props.url,
			dataType: 'json',
			cache: false,
			success: (function (newData) {
				this.setState({
					url: this.props.url,
					webserver: newData.request
				});
			}).bind(this),

			error: (function (xhr, status, err) {
				this.props._error(xhr.responseJSON.request.message);
			}).bind(this)
		});
	},

	componentDidMount: function () {
		this.loadData();
	},

	render: function () {
		var extensions = $.makeArray(this.state.webserver.extensions);

		return React.createElement(
			'div',
			{ className: 'col-sm-12' },
			React.createElement(
				'h3',
				null,
				'Amplify Info'
			),
			React.createElement(
				'h4',
				null,
				'Web Server'
			),
			React.createElement(
				'ul',
				null,
				React.createElement(
					'li',
					null,
					React.createElement(
						'h5',
						null,
						'Software'
					),
					' ',
					this.state.webserver.software
				),
				React.createElement(
					'li',
					null,
					React.createElement(
						'h5',
						null,
						'PHP version'
					),
					' ',
					this.state.webserver.phpversion
				),
				React.createElement(
					'li',
					null,
					React.createElement(
						'h5',
						null,
						'Extensions'
					),
					' ',
					extensions.join(', ')
				)
			)
		);
	}
});

/** Contenteditable component **/

var ContentEditable = React.createClass({
	displayName: 'ContentEditable',

	render: function () {
		return React.createElement('div', { className: this.props.className, onInput: this.handleChange,
			contentEditable: 'true', dangerouslySetInnerHTML: { __html: this.props.html } });
	},

	shouldComponentUpdate: function (nextProps) {
		return nextProps.html !== this.getDOMNode().innerHTML;
	},

	handleChange: function () {
		var html = this.getDOMNode().innerHTML;
		if (this.props.onChange && html !== this.lastHtml) {
			this.props.onChange({
				target: {
					value: html
				}
			});
		}

		this.lastHtml = html;
		this.props._handleUpdate();
	}
});

/** SQL Module **/

var Sql = React.createClass({
	displayName: 'Sql',

	getInitialState: function () {
		return { query: '', url: this.props.queryUrl };
	},

	handleUpdate: function () {
		this.setState({ query: this.sqlInput.lastHtml });
	},

	submitQuery: function (e) {
		console.log('Submitted query');
		console.log(e.target.value);
		//this.setState({ url: this. });
	},

	render: function () {
		return React.createElement(
			'div',
			null,
			React.createElement(
				'form',
				{ name: 'QueryForm' },
				React.createElement(
					'fieldset',
					null,
					React.createElement(
						'legend',
						null,
						'Run SQL query'
					),
					React.createElement(
						'button',
						{ className: 'btn' },
						'Buttons'
					),
					React.createElement('br', null),
					React.createElement(ContentEditable, { className: 'console', html: 'Enter your query here', _handleUpdate: this.handleUpdate,
						ref: ref => this.sqlInput = ref }),
					React.createElement('br', null),
					React.createElement(
						'button',
						{ className: 'btn', id: 'query_clear' },
						'Clear'
					),
					React.createElement(
						'button',
						{ className: 'btn btn-primary', id: 'query_btn',
							onClick: this.submitQuery },
						'Submit Query'
					)
				)
			),
			(() => {
				if (this.state.query) return React.createElement(
					'section',
					{ className: 'col-sm-10' },
					React.createElement(DataView, { datatype: 'Query result', url: this.state.url,
						dbname: this.props.dbname, tablename: this.props.tablename,
						post: 'true', postdata: this.state.query, _error: this.props._error })
				);
			})()
		);
	}
});

/** DataView Module **/

var DataView = React.createClass({
	displayName: 'DataView',

	getInitialState: function () {
		return { data: [], url: '', dbname: '', tablename: '' };
	},

	loadData: function () {
		$.ajax({
			url: this.props.url,
			dataType: 'json',
			method: this.props.post ? 'POST' : 'GET',
			data: { query: this.props.postdata },
			cache: this.props.post ? true : false,
			success: (function (data) {
				// Map rows with unique identifires
				data.request.rows.forEach(function (row, i) {
					Object.defineProperty(row, '$id', {
						value: i,
						writable: false,
						configurable: false,
						enumerable: false
					});
				});

				this.setState({
					data: data.request.rows,
					fulldata: [],
					postdata: this.props.postdata,
					willReceiveProps: false,
					url: this.props.url,
					dbname: this.props.dbname,
					tablename: this.props.tablename
				});
			}).bind(this),

			error: (function (xhr, status, err) {
				if (!this.props.postdata) this.props._error(xhr.responseJSON.request.message);
			}).bind(this)
		});

		// Scroll to top
		//window.scrollTo(0, 0);

		// Or smooth scroll
		$("html, body").animate({ scrollTop: 0 }, 300);
	},

	componentDidMount: function () {
		this.loadData();
	},

	componentDidUpdate: function () {
		if (this.state.url != this.props.url || this.state.postdata != this.props.postdata) {
			this.loadData();
		}
	},

	componentWillReceiveProps: function (nextProps) {
		this.setState({ willReceiveProps: true });
	},

	_sortBy: function (sortby, e) {
		// Set the new sort order based on the current one
		var sort = this.state.currentsort ? this.state.currentsort.split(',') : ',';
		var newsort;

		if (sort[0] == sortby) newsort = sortby + ',' + (sort[1] == 'asc' ? 'desc' : 'asc');else newsort = sortby + ',asc';

		// Sort the items
		var sorted = $.makeArray(this.state.data).sort(function (a, b) {
			val_a = typeof a[sortby] === 'string' ? a[sortby].toLowerCase() : a[sortby];
			val_b = typeof b[sortby] === 'string' ? b[sortby].toLowerCase() : b[sortby];

			if (sort[1] == 'asc') return val_a > val_b ? -1 : val_a < val_b ? 1 : 0;else return val_a > val_b ? 1 : val_a < val_b ? -1 : 0;
		});

		console.log("sorting is done");

		this.setState({ data: sorted, currentsort: newsort });
	},

	_filter: function (e) {
		var search = e.target.value.toLowerCase();
		if (!search) return;

		// If copy doesn't exist, search in original
		var searchdata = this.state.fulldata ? this.state.fulldata : this.state.data;

		// Create a new, filtered array
		var filtered = [];

		for (var i = 0; i < $.makeArray(searchdata).length; i++) {
			var obj = searchdata[i];
			var objMatch = false;

			Object.keys(obj).map(function (key) {
				if (typeof obj[key] === 'string' && !objMatch && obj[key].toLowerCase().includes(search)) {
					filtered.push(obj);
					objMatch = true;
				}
			});
		}

		// Keep original array as temporary
		if (!this.state.fulldata.length) this.setState({ fulldata: this.state.data });

		this.setState({ data: filtered });
	},

	render: function () {
		if (this.state.data && !this.state.willReceiveProps) {
			var rowsLength = this.state.data.length;
			var divStyle = { padding: '10px 15px' };

			console.log("rendering DataView...");
			console.log("loading rows...");

			var colNames = $.makeArray(this.state.data[0]).map(function (row) {
				return React.createElement(
					'tr',
					{ key: 'heading' },
					React.createElement(
						'th',
						null,
						'Edit'
					),
					Object.keys(row).map(function (key) {
						return React.createElement(
							'th',
							{ onClick: this._sortBy.bind(this, key), key: key },
							React.createElement(
								'b',
								null,
								React.createElement(
									'em',
									null,
									key
								)
							)
						);
					}, this)
				);
			}, this);

			return React.createElement(
				'div',
				{ className: 'col-sm-12' },
				React.createElement(
					'h3',
					null,
					this.props.tablename ? 'Table: ' : 'Database: ',
					React.createElement(
						'em',
						null,
						this.props.tablename ? this.props.tablename : this.props.dbname
					)
				),
				React.createElement(
					'h4',
					{ className: 'sub' },
					rowsLength,
					' ',
					this.props.datatype,
					rowsLength == 1 ? '' : 's'
				),
				React.createElement(
					'div',
					{ className: 'row' },
					React.createElement(
						'h3',
						{ className: 'col-sm-12' },
						this.props.datatype,
						's'
					),
					React.createElement(
						'div',
						{ className: 'col-sm-8 pull-left optiontabs' },
						React.createElement(
							'h4',
							{ className: 'sub' },
							'With Selected:  ',
							React.createElement(
								'button',
								{ className: 'btn' },
								'Edit'
							),
							' ',
							React.createElement(
								'button',
								{ className: 'btn' },
								'Analyze'
							),
							' ',
							React.createElement(
								'button',
								{ className: 'btn' },
								'Check'
							),
							' ',
							React.createElement(
								'button',
								{ className: 'btn' },
								'Optimize'
							)
						)
					),
					React.createElement(
						'div',
						{ className: 'col-sm-4 pull-right', style: divStyle },
						React.createElement('input', { onChange: this._filter, placeholder: 'Search in...' })
					)
				),
				React.createElement(
					'div',
					{ className: 'datalist tableview' },
					React.createElement(
						'table',
						{ className: 'col-sm-12' },
						React.createElement(
							'thead',
							null,
							colNames
						),
						React.createElement(DataRows, { data: this.state.data })
					)
				)
			);
		} else {
			return React.createElement(
				'div',
				{ className: 'col-sm-12' },
				React.createElement(
					'h4',
					null,
					'Loading...'
				)
			);
		}
	}
});

/** DataRows component **/

var DataRows = React.createClass({
	displayName: 'DataRows',

	render: function () {
		var rows = $.makeArray(this.props.data).map(function (row, i) {
			if (i + 1 == length) console.log("Bing!");

			return React.createElement(
				'tr',
				{ key: row.$id },
				React.createElement(
					'td',
					null,
					React.createElement(
						'div',
						{ className: 'checkbox' },
						React.createElement('input', { type: 'checkbox', id: 'checkbox_' + row.$id }),
						React.createElement('label', { htmlFor: 'checkbox_' + row.$id })
					)
				),
				Object.keys(row).map(function (key) {
					if (row[key] && row[key].length > 80) row[key] = row[key].substring(0, 75) + "...";

					return React.createElement(
						'td',
						{ className: 'trim-info', key: key },
						row[key]
					);
				})
			);
		});

		return React.createElement(
			'tbody',
			null,
			rows
		);
	}
});

var Amplify = React.createClass({
	displayName: 'Amplify',

	getInitialState: function () {
		console.log('Setup amplify');
		return { app: React.createElement('div', null) };
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
						module: 'home',
						url: api('webserver'),
						sidenavUrl: api('show/databases/mysql'),
						dbname: '' })
				});
			},
			'/db/:dbname/:action': function (dbname, action) {
				console.log("show tables from " + dbname);

				self.setState({
					app: React.createElement(App, {
						module: action,
						url: api('show/tables/' + dbname),
						datatype: 'Table',
						queryUrl: api('query/' + dbname),
						sidenavUrl: api('show/tables/' + dbname),
						dbname: dbname })
				});
			},
			'/db/:dbname': function (dbname) {
				console.log("show tables from " + dbname);

				self.setState({
					app: React.createElement(App, {
						module: 'dataview',
						url: api('show/tables/' + dbname),
						datatype: 'Table',
						sidenavUrl: api('show/tables/' + dbname),
						dbname: dbname })
				});
			},
			'/db/:dbname/table/:tablename': function (dbname, tablename) {
				console.log("show columns from " + dbname);

				self.setState({
					app: React.createElement(App, {
						module: 'dataview',
						url: api('show/columns/' + dbname + '.' + tablename),
						datatype: 'Column',
						sidenavUrl: api('show/tables/' + dbname),
						dbname: dbname,
						tablename: tablename })
				});
			},
			'/db/:dbname/:action/:tablename': function (dbname, action, tablename) {
				console.log("select from " + dbname + '.' + tablename);
				var module = action == 'select' ? 'dataview' : module;

				self.setState({
					app: React.createElement(App, {
						module: 'dataview',
						url: api('select/' + dbname + '.' + tablename),
						datatype: 'Row',
						sidenavUrl: api('show/tables/' + dbname),
						dbname: dbname,
						tablename: tablename })
				});
			},
			'/article/:id': function (id) {
				console.log("single article");
				console.log(id);
				var mod = React.createElement(
					'div',
					{ className: 'col-sm-12' },
					'Single Page View for article ',
					id
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
			'div',
			{ id: 'container' },
			React.createElement(Header, null),
			React.createElement(
				'div',
				{ className: 'container-fluid', id: 'main' },
				this.state.app
			),
			React.createElement('br', null)
		);
	}
});

ReactDOM.render(React.createElement(Amplify, { api_src: 'api/v1/' }), document.getElementById('container'));