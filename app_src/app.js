
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

var App = React.createClass(
{
  	getInitialState: function() 
  	{
    	return { data: dummyData};
  	},

  	loadArticles: function()
  	{
  	    $.ajax({
			url: this.props.url,
			dataType: 'json',
			cache: false,
			success: function(newData) {
				this.setState({data: newData.data});
			}.bind(this),

			error: function(xhr, status, err) {
				console.error("this.props.url: ", status, err.toString());
			}.bind(this)
		});
  	},

  	componentDidMount: function() 
  	{
		//this.loadArticles();
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

	    var articles = this.state.data.map(function(a) 
	    {
	      	return (
	        <Article articleTitle={a.title} author={a.author} key={a.id} id={a.id}>
	          	{a.text}{a.extra}
	        </Article>
	      	);
	    });

		if (this.props.module === 'articleList')
			module = <ArticleList articlesTitle="Latest Articles" data={this.state.data} data={articles} 
				_update={this._update}/>;

		if (this.props.module === 'singleArticle')
			module = <Article data={articles} />;

		// Append error function
		this.props.sidenav.props._displayError = this._error;

		return (
			<div className="row-fluid">
				<section className="col-sm-2">
					{this.props.sidenav}
				</section>
				<section className="col-sm-10">
					<div>{module}<br/></div>
				</section>
			</div>
		);
	}
});

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
		var heading = (self.props.dbname) ? self.props.dbname : 'Databases';

		// Get list of tables/databases
	    var datalist = this.state.data.map(function(item) 
	    {
	    	var itemEntry = (self.props.dbname) ? item.Table : item.Database;

	      	return (
				<li><a href={'#/db/'+ itemEntry}>{itemEntry}</a></li>
	      	);
	    });

		return (
			<div className="sidenav">
				<h4>Sidebar nav</h4>
				<ul className="nav">
					<li className="tools">
						<div>Tools</div>
						<ul className="subnav">
							<li><a href={'#/db/'+ self.props.dbname +'/sql'}>SQL command</a></li>
							<li>Import</li>
							<li>Export</li>
						</ul>
					</li>
					<SideNavDatalist heading={heading} data={this.state.data} data={datalist}>
					</SideNavDatalist>
				</ul>
			</div>
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

var ArticleList = React.createClass(
{
  	getInitialState: function() 
  	{
    	return {data: this.props.data};
  	},

  	propTypes: {
    	data: React.PropTypes.array.isRequired
  	},

	render: function() 
	{
		return (
			<div className="articleList col-sm-12">
				<h2>{this.props.articlesTitle}</h2>
				<ul>{this.props.data}</ul>
				<ArticleForm _update={this.props._update}></ArticleForm>
			</div>
		);
	}
});

var Article = React.createClass(
{
	render: function() 
	{
		var idName = "article_"+ this.props.id;
		return (
			<li id={idName}>
				<h4 className="title">
					<a onClick={nav('/article/'+ this.props.id)}><b>{this.props.articleTitle}</b></a>
				</h4>
				<h5 className="articleAuthor">
					<em>By {this.props.author}</em>
				</h5>

				<p>{this.props.children[0]}</p>
			</li>
		);
	}
});

var ArticleForm = React.createClass(
{
	getInitialState: function() 
	{
    	return { author: '', text: ''};
  	},

  	handleAuthorChange: function(e) 
	{
		this.setState({author: e.target.value});
	},

  	handleTextChange: function(e) 
	{
		this.setState({text: e.target.value});
	},

	handleSubmit: function(e) 
	{
		e.preventDefault();

		var author = this.state.author.trim();
		var text = this.state.text.trim();

		if (!text || !author) return;

		// Send request
		var obj =
		{ 
			id: dummyData.length + 1,
			title: 'New',
			author: this.state.author,
			text: this.state.text,
			extra: '...'
		}

		console.log('article submitted!');

		// Empty the form fields
		this.setState({author: '', text: ''});
		this.props._update(obj);
	},

	render: function() 
	{
		return (
		<form className="articleForm" onSubmit={this.handleSubmit}>
			<h3>Submit an article...</h3>
			<a onClick={nav('/test')}>Hello!</a>
			<div><input type="text" placeholder="Your name" 
				onChange={this.handleAuthorChange} value={this.state.author}/></div>
			<div><textarea placeholder="Say something..." value={this.state.text}
				onChange={this.handleTextChange}/></div>
			<div><input type="submit" value="Post" /></div>
		</form>
		);
	}
});

var Amplify = React.createClass(
{
	getInitialState: function ()
	{
		console.log('Setup amplify');
		return { module: <div/> }
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
	    			module:  <App url={api('list/articles')} module='articleList' sidenav={sidenav}/> 
	    		});
		    },
		    '/db/:dbname': function(dbname)
		    {
		    	console.log("show tables from "+ dbname);
		    	var sidenav = <SideNav url={api('show/tables/'+ dbname)} dbname={dbname}/>
	    		self.setState({ 
	    			module:  <App url={api('list/articles')} module='articleList' sidenav={sidenav}/> 
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
					{this.state.module}
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
