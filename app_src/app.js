
/** Header component **/

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
		return { data: [], url: this.props.url, errors: [] };
	},

	componentDidUpdate: function() 
	{
		if (this.state.url != this.props.url)
			this.setState({ url: this.props.url })
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
		console.log("rendering app view...")
		var module = '';

		if (this.props.module === 'home')
			module = <Home webserver={this.state.data} _error={this._error}/>;

		if (this.props.module === 'dataview')
			module = <DataView datatype={this.props.datatype} url={this.state.url}
				dbname={this.props.dbname} tablename={this.props.tablename} _error={this._error}/>;

		return (
			<div className="row-fluid">
				<section className="col-sm-2">
					<SideNav url={this.props.sidenavUrl} dbname={this.props.dbname}
						tablename={this.props.tablename} _error={this._error}/>
				</section>
				{
					(() => {
						if (this.state.errors.length)
							return (
								<section className="col-sm-10">
									<div className="col-sm-12">
										<br/><h4>The following errors have been found:</h4><br/>
										<p className="alert alert-danger">{this.state.errors}</p>
									</div>
								</section>
							)
						else
							return <section className="col-sm-10">{module}</section>
					})
				()}
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

/** DataView Module **/

var DataView = React.createClass(
{
	getInitialState: function() 
	{
		return { data: [], url: '', dbname: '', tablename: ''};
	},

	loadData: function()
	{
		$.ajax({
			url: this.props.url,
			dataType: 'json',
			cache: false,
			success: function(data) {
				console.log(data);
				this.setState({ 
					data: data.request.rows, 
					url: this.props.url,
					dbname: this.props.dbname,
					tablename: this.props.tablename
				});
			}.bind(this),

			error: function(xhr, status, err) {
				this.props._error(xhr.responseJSON.request.message);
			}.bind(this)
		});

		// Scroll to top
		//window.scrollTo(0, 0);

		// Or smooth scroll
		$("html, body").animate({ scrollTop: 0 }, 400);
	},

	componentDidMount: function() 
	{
		this.loadData();
	},

	componentDidUpdate: function() 
	{
		if (this.state.url != this.props.url)
		{
			console.log("refresh dataview data")
			this.loadData();
		}
	},

	render: function()
	{
		console.log("rendering dataview...");

		var divStyle = { padding: '10px 15px'};

		if (this.state.data)
		{
			var rows = $.makeArray(this.state.data)
				.map(function(row, i) 
			{
				return (
				<tr key={i}>
					{
						Object.keys(row).map(function(key) 
						{
							if(row[key] && row[key].length > 80)
								row[key] = row[key].substring(0, 75)+"...";

							return <td className="trim-info" key={key}>{row[key]}</td>;
						})
					}
				</tr>
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

			return (
				<div className="col-sm-12">
					<h3>{this.props.tablename ? 'Table: ' : 'Database: '} 
						<em>{this.props.tablename ? this.props.tablename : this.props.dbname}</em></h3>
					<h4 className="sub">{rows.length} {this.props.datatype}
					{rows.length == 1 ? '' : 's'}</h4>

					<div className="row">
						<h3 className="col-sm-12">{this.props.datatype}s</h3>

						<div className="col-sm-8 pull-left optiontabs">
							<h4 className="sub">With Selected: &nbsp;
							<button className="btn">Edit</button>&nbsp;
							<button className="btn">Analyze</button>&nbsp;
							<button className="btn">Check</button>&nbsp;
							<button className="btn">Optimize</button>
							</h4>
						</div>
						<div className="col-sm-4 pull-right" style={divStyle}>
							<input placeholder="Search in..."/>
						</div>
					</div>

					<div className="datalist tableview">
						<table className="col-sm-12">
							<thead>
								
							</thead>
							<tbody>
								{rows}
							</tbody>
						</table>
					</div>
				</div>
			)
		}
		else
		{
			return (
				<div className="col-sm-12">
					<h4>Loading...</h4>
				</div>
			)
		}
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
					app: <App 
						module='home' 
						url={api('webserver')} 
						sidenavUrl={api('show/databases/mysql')} 
						dbname='' /> 
				});
			},
			'/db/:dbname': function(dbname)
			{
				console.log("show tables from "+ dbname);	    	

				self.setState({ 
					app: <App 
						module='dataview' 
						url={api('show/tables/'+ dbname)} 
						datatype='Table'
						sidenavUrl={api('show/tables/'+ dbname)} 
						dbname={dbname} /> 
				});	    	
			},
			'/db/:dbname/table/:tablename': function(dbname, tablename)
			{
				console.log("show columns from "+ dbname);	    	

				self.setState({ 
					app: <App 
						module='dataview' 
						url={api('show/columns/'+ dbname +'.'+ tablename)} 
						datatype='Column'
						sidenavUrl={api('show/tables/'+ dbname)} 
						dbname={dbname}
						tablename={tablename} /> 
				});
			},
			'/article/:id': function(id)
			{
				console.log("single article");
				console.log(id);
				var mod = 
					<div className="col-sm-12">Single Page View for article {id}</div>
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
