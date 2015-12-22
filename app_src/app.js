

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
			module = <Home url={this.state.url} webserver={this.state.data} _error={this._error}/>;

		if (this.props.module === 'dataview')
			module = <DataView datatype={this.props.datatype} url={this.state.url}
				dbname={this.props.dbname} tablename={this.props.tablename} _error={this._error}/>;

		if (this.props.module === 'sql')
			module = <Sql dbname={this.props.dbname} queryUrl={this.props.queryUrl} _error={this._error}/>;

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

/** Home module **/

var Home = React.createClass(
{
	getInitialState: function() 
	{
		return { webserver: [], url: this.props.url };
	},

	loadData: function()
	{
		$.ajax({
			url: this.props.url,
			dataType: 'json',
			cache: false,
			success: function(newData) {
				this.setState({ 
					url: this.props.url,
					webserver: newData.request
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

	render: function()
	{
		var extensions = $.makeArray(this.state.webserver.extensions);

		return ( 
			<div className="col-sm-12">
				<h3>Amplify Info</h3>
				<h4>Web Server</h4>
				<ul>
					<li><h5>Software</h5> {this.state.webserver.software}</li>
					<li><h5>PHP version</h5> {this.state.webserver.phpversion}</li>
					<li><h5>Extensions</h5> {extensions.join(', ')}</li>
				</ul>
			</div>
		);
	}
});

/** Contenteditable component **/

var ContentEditable = React.createClass(
{
    render: function()
    {
        return (
        	<div className={this.props.className} onInput={this.handleChange} 
        	contentEditable="true" dangerouslySetInnerHTML={{__html: this.props.html}}>
        	</div>
        );
    },

    shouldComponentUpdate: function(nextProps)
    {
        return nextProps.html !== this.getDOMNode().innerHTML;
    },

    handleChange: function()
    {
        var html = this.getDOMNode().innerHTML;
        if (this.props.onChange && html !== this.lastHtml) 
        {
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

var Sql = React.createClass(
{
	getInitialState: function() 
	{
    	return {query: '', url: this.props.queryUrl };
  	},

	handleUpdate: function() 
	{
		this.setState({ query: this.sqlInput.lastHtml });
	},

	submitQuery: function(e)
	{
		console.log('Submitted query')
		console.log(e.target.value)
		//this.setState({ url: this. });
	},

	render: function()
	{
		return (
			<div>
				<form name="QueryForm">
					<fieldset>
						<legend>Run SQL query</legend>
						<button className="btn">Buttons</button>
						<br/>
						<ContentEditable className="console" html="Enter your query here" _handleUpdate={this.handleUpdate} 
							ref={(ref) => this.sqlInput = ref} />
						<br/>
						<button className="btn" id="query_clear">Clear</button>
						<button className="btn btn-primary" id="query_btn" 
							onClick={this.submitQuery}>Submit Query</button>
					</fieldset>
				</form>

				{
					(() => {
						if (this.state.query)
							return (
								<section className="col-sm-10">
									<DataView datatype='Query result' url={this.state.url} 
										dbname={this.props.dbname} tablename={this.props.tablename} 
										post='true' postdata={this.state.query} _error={this.props._error}/>
								</section>
							)
					})
				()}
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
			method: (this.props.post) ? 'POST' : 'GET',
			data: { query: this.props.postdata },
			cache: (this.props.post) ? true : false,
			success: function(data) 
			{
				this.setState({ 
					data: data.request.rows, 
					postdata: this.props.postdata,
					willReceiveProps: false,
					url: this.props.url,
					dbname: this.props.dbname,
					tablename: this.props.tablename
				});
			}.bind(this),

			error: function(xhr, status, err) 
			{
				if (!this.props.postdata)
					this.props._error(xhr.responseJSON.request.message);
			}.bind(this)
		});

		// Scroll to top
		//window.scrollTo(0, 0);

		// Or smooth scroll
		$("html, body").animate({ scrollTop: 0 }, 300);
	},

	componentDidMount: function() 
	{
		this.loadData();
	},

	componentDidUpdate: function() 
	{
		if (this.state.url != this.props.url ||
			this.state.postdata != this.props.postdata)
		{
			this.loadData();
		}	
	},

	componentWillReceiveProps: function(nextProps) 
	{
		this.setState({ willReceiveProps: true })
	},

	render: function()
	{
		if (this.state.data && !this.state.willReceiveProps)
		{
			console.log("rendering DataView...");

			var length = this.state.data.length;
			var divStyle = { padding: '10px 15px'};

			console.log("loading rows...");

			var rows = $.makeArray(this.state.data)
				.map(function(row, i) 
			{
				if (i + 1 == length)
				{
					console.log("Bing!");
				}

				return (
					<tr key={i}>
					{
						Object.keys(row).map(function(key) 
						{
							if(row[key] && row[key].length > 80)
								row[key] = row[key].substring(0, 75) + "...";

							return <td className="trim-info" key={key}>{row[key]}</td>;
						})
					}
					</tr>
				);		
			});

			
			var colNames = $.makeArray(this.state.data)
				.map(function(row, i) 
			{
				if (i == 0)
				{
					return (
						<tr key='heading'>
						{
							Object.keys(row).map(function(key) {
								return <th key={key}><b><em>{key}</em></b></th>;
							})
						}
						</tr>
					);
				}		
			});

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
								{colNames}
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
});

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
			'/db/:dbname/:action': function(dbname, action)
			{
				console.log("show tables from "+ dbname);	    	

				self.setState({ 
					app: <App 
						module={action} 
						url={api('show/tables/'+ dbname)} 
						datatype='Table'
						queryUrl={api('query/'+ dbname)}
						sidenavUrl={api('show/tables/'+ dbname)} 
						dbname={dbname} /> 
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
			'/db/:dbname/:action/:tablename': function(dbname, action, tablename)
			{
				console.log("select from "+ dbname +'.'+ tablename);	 
				var module = (action == 'select') ? 'dataview' : module;	

				self.setState({ 
					app: <App 
						module='dataview' 
						url={api('select/'+ dbname +'.'+ tablename)} 
						datatype='Row'
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
