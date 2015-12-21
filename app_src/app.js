
var dummyData = 
[
	{ id: 1, title: "First", author: "Pete Hunt", text: "Placeholder text", extra: "..." },
	{ id: 2, title: "Another", author: "Jordan Walke", text: "Placeholder text", extra: "..." }
];

var nav = function(url, fn)
{
	var base = '';//"/amplite_r";
	if (fn != null)
	{
		routie(base + url, fn);
		return;
	}
	return function () {
		console.log(base + url);
    	routie(base + url);
 	}	
}

var Header = React.createClass(
{
	render: function()
	{
		return (
			<header className="container-fluid">
				<div className="row-fluid">
					<h3 className="col-sm-12">
						<a href="#">Amplify</a>
						<a href="#"><span>lite</span></a>
					</h3>
				</div>
			</header>
		)
	}
});

/** Main app module area **/

var App = React.createClass(
{
  	getInitialState: function() 
  	{
    	return { data: dummyData, errors: [] };
  	},

  	loadData: function()
  	{
  		console.log("load app data")
  	    $.ajax({
			url: this.props.url,
			dataType: 'json',
			cache: false,
			success: function(newData) {
				console.log("New data loaded")
				this.setState({data: newData.request});
			}.bind(this),

			error: function(xhr, status, err) {
				this._error(xhr.responseJSON.request.message);
			}.bind(this)
		});
  	},

  	componentDidMount: function() 
  	{
		this.loadData();
	},

	componentWillUnmount: function() 
	{
    	//this.intervals.map(clearInterval);
  	},

	_error: function (errorMsg)
	{
		var errors = this.state.errors;

		if (errors.indexOf(errorMsg) < 0)
		{
			errors.push(errorMsg);
			this.setState({ errors: errors });
		}
	},

	render: function() 
	{
		var module = '';

		if (this.props.module === 'home')
			module = <Home webserver={this.state.data} _error={this._error}/>;

		if (this.props.module === 'dataview')
			module = <DataView datatype={this.props.datatype} data={this.state.data} _error={this._error}/>;

		console.log('App render')

		return (
			<div className="row-fluid">
				<section className="col-sm-2">
	    			<SideNav url={this.props.sidenavUrl} dbname={this.props.dbname} _error={this._error}/>
				</section>
				<section className="col-sm-10">
					{
						(() => {
							if (this.state.errors.length)
  							return (
  								<div className="col-sm-12">
									<br/><h4>The following errors have been found:</h4><br/>
									<p className="alert alert-danger">{this.state.errors}</p>
								</div>
							)
						})
					()}
					{module}
				</section>
			</div>
		);
	}
});

/** Home module **/

var Home = React.createClass(
{
	getInitialState: function()
	{
		return { data: '' }
	},

	render: function()
	{
		var extensions = $.makeArray(this.props.webserver.extensions);

		return ( 
			<div className="col-sm-12">
				<h3>Amplify Info</h3>
				<h4>Web Server</h4>
				<ul>
					<li><h5>Software</h5> {this.props.webserver.software}</li>
					<li><h5>PHP version</h5> {this.props.webserver.phpversion}</li>
					<li><h5>Extensions</h5> {extensions.join(', ')}</li>
				</ul>
			</div>
		);
	}
});

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
					data: data.request.rows, dbname: this.props.dbname}
				);
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
					<SideNavTools dbname={self.props.dbname} />
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

/** DataView Module **/

var DataView = React.createClass(
{
	render: function()
	{
		return (
			<div className="col-sm-12">
				<h3>Data View</h3>
				<h3>{this.props.datatype}: <em>{this.props.structureName}</em></h3>
				<h4 className="sub">...{this.props.datatype} found</h4>
			</div>
		)
	}
})

var Amplify = React.createClass(
{
	getInitialState: function ()
	{
		console.log('Setup amplify');
		return { app: <div/> }
	},

	componentDidMount: function ()
	{
		var self = this;
		var api = function(path)
		{
			return self.props.api_src + path;
		}

		routie({
		    // load the main module in the home page		
		    '': function() 
		    {
	    		console.log("home");

	    		self.setState({ 
	    			app: <App module='home' url={api('webserver')} 
	    				sidenavUrl={api('show/databases/mysql')} dbname=''/> 
	    		});
		    },
		    '/db/:dbname': function(dbname)
		    {
		    	console.log("show tables from "+ dbname);	    	

	    		self.setState({ 
	    			app: <App module='dataview' url={api('list/articles')} 
	    				sidenavUrl={api('show/tables/'+ dbname)} dbname={dbname} /> 
	    		});	    	
		    },
		    '/article/:id': function(id)
		    {
	    		console.log("single article");
	    		console.log(id);
	    		var mod = 
	    			<div className="col-sm-12"><h3 onClick={nav('/')}>Single Page View for article {id}</h3></div>
	    		self.setState({ module: mod });		    	
		    },
		    '*': function() {
		        // default: go to landing page
		        routie('');
		    }
		});
	},

	render: function () 
	{
	    return (
	    	<div>
				<Header></Header>
				<div className="container-fluid" id="container">
					{this.state.app}
				</div>
				<br/>
			</div>
		);
	}
});

ReactDOM.render(
	<Amplify api_src='api/v1/' />,
  	document.getElementById('main')
);
