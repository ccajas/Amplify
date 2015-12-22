
/** Side navbar **/

var SideNav = React.createClass({
	displayName: 'SideNav',

	getInitialState: function () {
		return { data: [], dbname: '' };
	},

	loadData: function () {
		$.ajax({
			url: this.props.url,
			dataType: 'json',
			cache: false,
			success: (function (data) {
				this.setState({
					data: data.request.rows,
					dbname: this.props.dbname
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

	componentDidUpdate: function () {
		if (this.state.dbname != this.props.dbname) this.loadData();
	},

	render: function () {
		var self = this;
		var navheading = self.props.dbname ? self.props.dbname : 'Databases';

		// Get list of tables/databases
		var datalist = this.state.data.map(function (item, i) {
			var itemEntry = self.props.dbname ? item.Table : item.Database;

			// Return appropriate link based on item type
			return self.props.dbname ? React.createElement(
				'li',
				{ key: i },
				React.createElement(
					'a',
					{ href: '#/db/' + self.props.dbname + '/table/' + itemEntry },
					itemEntry
				)
			) : React.createElement(
				'li',
				{ key: i },
				React.createElement(
					'a',
					{ href: '#/db/' + itemEntry },
					itemEntry
				)
			);
		});

		return React.createElement(
			'div',
			{ className: 'sidenav' },
			React.createElement(
				'h4',
				null,
				'Sidebar nav'
			),
			React.createElement(
				'ul',
				{ className: 'nav' },
				React.createElement(SideNavTools, { dbname: self.props.dbname, tablename: self.props.tablename }),
				React.createElement(SideNavDatalist, { heading: navheading, data: this.state.data, data: datalist })
			)
		);
	}
});

var SideNavTools = React.createClass({
	displayName: 'SideNavTools',

	render: function () {
		var operations;
		console.log("SideNavTools props");
		console.log(this.props);

		// If we are viewing a table, load table operations
		if (this.props.tablename) {
			operations = React.createElement(
				'li',
				null,
				React.createElement(
					'a',
					{ href: '#/db/' + this.props.dbname + '/table/' + this.props.tablename },
					'View Structure'
				)
			);
		}
		// Else, load database operations
		else {
				operations = React.createElement(
					'li',
					null,
					React.createElement(
						'a',
						{ href: '#/insert/' + this.props.dbname },
						'Insert Table'
					)
				);
			}

		return React.createElement(
			'div',
			null,
			React.createElement(
				'li',
				{ className: 'tools' },
				React.createElement(
					'div',
					null,
					'Tools'
				),
				React.createElement(
					'ul',
					{ className: 'subnav' },
					React.createElement(
						'li',
						null,
						React.createElement(
							'a',
							{ href: '#/db/' + this.props.dbname + '/sql' },
							'SQL command'
						)
					),
					React.createElement(
						'li',
						null,
						React.createElement(
							'a',
							{ href: '#/db/' + this.props.dbname + '/import' },
							'Import'
						)
					),
					React.createElement(
						'li',
						null,
						React.createElement(
							'a',
							{ href: '#/db/' + this.props.dbname + '/export' },
							'Export'
						)
					)
				)
			),
			React.createElement(
				'li',
				{ className: 'operations' },
				React.createElement(
					'div',
					null,
					'Operations'
				),
				React.createElement(
					'ul',
					{ className: 'subnav' },
					operations
				)
			)
		);
	}
});

var SideNavDatalist = React.createClass({
	displayName: 'SideNavDatalist',

	render: function () {
		return React.createElement(
			'li',
			null,
			React.createElement(
				'div',
				null,
				this.props.heading
			),
			React.createElement(
				'ul',
				{ className: 'subnav' },
				React.createElement(
					'li',
					{ className: 'show-from' },
					'stuff'
				),
				this.props.data
			)
		);
	}
});