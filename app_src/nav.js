
/** Side navbar **/

var SideNav = React.createClass(
{
  	getInitialState: function() 
  	{
    	return { data: [], dbname: ''};
  	},

  	loadData: function()
  	{
  	    $.ajax({
			url: this.props.url,
			dataType: 'json',
			cache: false,
			success: function(data) {
				this.setState({ 
					data: data.request.rows, 
					dbname: this.props.dbname
				});
			}.bind(this),

			error: function(xhr, status, err) {
				this.props._error(xhr.responseJSON.request.message);
			}.bind(this)
		});
  	},

  	componentDidMount: function() 
  	{
		this.loadData();
	},

  	componentDidUpdate: function() 
  	{
  		if (this.state.dbname != this.props.dbname)
			this.loadData();
	},

	render: function()
	{
		var self = this;
		var navheading = (self.props.dbname) ? self.props.dbname : 'Databases';

		// Get list of tables/databases
	    var datalist = this.state.data.map(function(item, i) 
	    {
	    	var itemEntry = (self.props.dbname) ? item.Table : item.Database;

	    	// Return appropriate link based on item type
	      	return ((self.props.dbname) ?
	      		<li key={i}><a href={'#/db/'+ self.props.dbname +'/table/'+ itemEntry}>{itemEntry}</a></li> : 
				<li key={i}><a href={'#/db/'+ itemEntry}>{itemEntry}</a></li>
	      	);
	    });

		return (
			<div className="sidenav">
				<h4>Sidebar nav</h4>
				<ul className="nav">
					<SideNavTools dbname={self.props.dbname} tablename={self.props.tablename} />
					<SideNavOperations dbname={self.props.dbname} tablename={self.props.tablename} />
					<SideNavDatalist heading={navheading} data={this.state.data} data={datalist}/>
				</ul>
			</div>
		);
	}
});

var SideNavTools = React.createClass(
{
	render: function()
	{
		var operations;
		console.log("SideNavTools props")
		console.log(this.props)

		return (
			<li className="tools">
				<div>Tools</div>
				<ul className="subnav">
					<li><a href={'#/db/'+ this.props.dbname +'/sql'}>SQL command</a></li>
					<li><a href={'#/db/'+ this.props.dbname +'/import'}>Import</a></li>
					<li><a href={'#/db/'+ this.props.dbname +'/export'}>Export</a></li>
				</ul>
			</li>
		);
	}
})

var SideNavOperations = React.createClass(
{
	render: function()
	{
		var operations;

		// If we are viewing a table, load table operations
		if (this.props.tablename)
		{
			operations =
				<li><a href={'#/db/'+ this.props.dbname +'/table/'+ this.props.tablename}>View Structure</a></li>

		}
		// Else, load database operations
		else
		{
			operations =
				<li><a href={'#/insert/'+ this.props.dbname}>Insert Table</a></li>
		}

		return (
			<li className="operations">
				<div>Operations</div>
				<ul className="subnav">
					{operations}
				</ul>
			</li>
		);
	}
});

var SideNavDatalist = React.createClass(
{
	render: function() 
	{
		return (
			<li>
				<div>{this.props.heading}</div>
				<ul className="subnav">
					<li className="show-from">stuff</li>
					{this.props.data}
				</ul>
			</li>
		);
	}
});