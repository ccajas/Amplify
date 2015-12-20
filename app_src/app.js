
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
    	return { data: dummyData};
  	},

  	loadData: function()
  	{
  	    $.ajax({
			url: this.props.url,
			dataType: 'json',
			cache: false,
			success: function(newData) {
				this.setState({data: newData.request});
			}.bind(this),

			error: function(xhr, status, err) {
				console.error("this.props.url:", status, err.toString());
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

   	_update: function(val)
  	{
  		this.state.data.push(val);
    	this.setState({ data: this.state.data });
	},

	_error: function()
	{

	},

	render: function() 
	{
		var module = '';
		var error = '';

		if (this.props.module === 'articleList')
			module = <ArticleList articlesTitle="Latest Articles" data={this.state.data} data={articles} 
				_update={this._update}/>;

		if (this.props.module === 'singleArticle')
			module = <Article data={articles} />;

		if (this.props.module === 'home')
			module = <Home webserver={this.state.data}/>;

		if (this.props.module === 'dataview')
			module = <DataView datatype={this.props.datatype} data={this.state.data}/>;

		// Append error function for sidenav use
		this.props.sidenav.props._displayError = this._error;

		return (
			<div className="row-fluid">
				<section className="col-sm-2">
					{this.props.sidenav}
				</section>
				<section className="col-sm-10">
					<div>{this.props.module}<br/></div>
				</section>
			</div>
		);
	}
});

/** Home module **/

var Home = React.createClass(
{
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
  		console.log('load sidebar');

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
				this.props._displayError(xhr.responseJSON.message);
				console.error("this.props.url:", status, err.toString());
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
	    var datalist = this.state.data.map(function(item) 
	    {
	    	var itemEntry = (self.props.dbname) ? item.Table : item.Database;

	    	// Return appropriate link based on item type
	      	return ((self.props.dbname) ?
	      		<li><a href={'#/db/'+ self.props.dbname +'/table/'+ itemEntry}>{itemEntry}</a></li> : 
				<li><a href={'#/db/'+ itemEntry}>{itemEntry}</a></li>
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
				<h4 class="sub">...{this.props.datatype} found</h4>
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
	    		var sidenav = <SideNav url={api('show/databases/mysql')} dbname=''/>

	    		self.setState({ 
	    			app: <App url={api('webserver')} module='home' sidenav={sidenav}/> 
	    		});
		    },
		    '/db/:dbname': function(dbname)
		    {
		    	console.log("show tables from "+ dbname);
		    	var sidenav = <SideNav url={api('show/tables/'+ dbname)} dbname={dbname}/>
		    	var module  = <DataView datatype='Tables'/>;

	    		self.setState({ 
	    			app: <App url={api('list/articles')} module={module} sidenav={sidenav}/> 
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
		console.log(this.state);
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
