<?php

require ('config.php');

class CRUD_Helper 
{
	private $db;
	private $err;

	private $db_username;
	private $db_password;
	private $db_host;
	private $db_name;

	/* PDO seems to have difficulty translating domain names
	Use 127.0.0.1 whenever possible instead of setting PDO::ATTR_PERSISTENT to true */

	private $response = [];

	public function __construct($db_name) 
	{
		$cfg = new Config();

		$this->db_username = $cfg->username;
		$this->db_password = $cfg->password;
		$this->db_host = $cfg->host;

		$this->response["status"] = "ok";
		$this->db_name = $db_name;

		$dsn = 'mysql:host='. $this->db_host .';port='. $cfg->port .';dbname='. $this->db_name .';charset=utf8';

		$pdo_loaded = extension_loaded('pdo_mysql');

		if (!$pdo_loaded)
		{
			$this->response["status"] = "error";
			$this->response["message"] = 'PDO extension not loaded';
		}

		try 
		{
			$this->db = new PDO($dsn, $this->db_username, $this->db_password, [
				PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION 
			]);
		} 
		catch (PDOException $e) 
		{
			$this->response["status"] = "error";
			$this->response["message"] = 'Connection failed: ' . $e->getMessage();
		}

		register_shutdown_function([&$this, 'shutdown']);
	}

	/** Directly use custom query **/

	public function query($query)
	{
		try
		{
			$statement = $this->db->query(strip_tags($query));
			$rows = $statement->fetchAll(PDO::FETCH_ASSOC);
			$fields = $statement->fetchAll(PDO::FETCH_COLUMN);

			if(count($rows)<=0)
			{
				$this->response["status"] = "warning";
				$this->response["message"] = "No data found.";
			}
			else
			{
				$this->response["status"] = "success";
				$this->response["message"] = "Data selected from database";
			}

			$this->response["rows"] = $rows;
			$this->response["fields"] = $fields;
		}
		catch(PDOException $e)
		{
			$this->response["status"] = "error";
			$this->response["message"] = 'Query Failed: ' .$e->getMessage();
			$this->response["rows"] = null;
		}

		$this->response["query"] = $query;

		return $this->response;
	}

	/** Show all databases for server, or tables for database **/

	public function show($data, $from = '')
	{
		$query = '';

		if (strtolower($data) == 'databases' || strtolower($data) == 'columns')
		{
			$from = ($from && strtolower ($data) != 'databases') ? " from ". $from : '';
			$query = "show ". $data . $from;			
		}

		if (strtolower ($data) == 'tables')
		{
			$query = "
				select 
					table_name as 'Table', engine as 'Engine', table_collation as 'Collation', 
					table_rows as 'Rows', table_comment as 'Comment', Data_length as 'Data Length', 
					Index_length as 'Index Length', Data_free as 'Data Free'
				from 
					information_schema.tables 
				where 
					table_schema = '".$from."' 
				group by 
					table_name";

				//$query = "show table status ". $from;
		}

		return $this->query($query);
	}

	/** Insert new entry **/

	public function insert($table, $rowdata)
	{
		try
		{
			$cols = '';
			$vals = '';
			$wh = '';

			end($rowdata);
			$last = key($rowdata);
			$date_types = ['datetime','date','time','timestamp'];

			foreach ($rowdata as $key => $val) 
			{
				$cols .= $key;

				// Check for datetime values

				if (in_array($val['type'], $date_types))
					$vals .= $val['value'];
				else
				{
					$vals .= ':'. $key;
					$a[":".$key] = $val['value'];
				}

				// Append multiple values
				if ($key != $last)
				{
					$cols .= ', '; 
					$vals .= ', ';
				}
			}

			$query = "insert into `". $table ."` (". $cols .") values (". $vals .")";

			$statement = $this->db->prepare($query);
			$statement->execute($a);

			$this->response["status"] = "success";
			$this->response["message"] = 'Data inserted';
		}
		catch(PDOException $e)
		{
			$this->response["status"] = "error";
			$this->response["message"] = 'Insert Failed: ' .$e->getMessage();
			$this->response["rows"] = null;
		}

		return $this->response;
	}

	/** Select from table **/
	
	public function select($table, $columns, $where, $order)
	{
		try
		{
			$a = array();
			$wh = '';
			foreach ($where as $key => $value) 
			{
				$wh .= " and " .$key. " like :".$key;
				$a[":".$key] = $value;
			}

			if (!empty($order)) $order = 'order by '+ $order;
			
			$table = explode('.', $table)[1];
			$query = "select ".$columns." from `".$table."` where 1=1 ". $wh." ".$order;

			$statement = $this->db->prepare($query);
			$statement->execute($a);
			$rows = $statement->fetchAll(PDO::FETCH_ASSOC);

			if(count($rows)<=0)
			{
				$this->response["status"] = "warning";
				$this->response["message"] = "No data found.";
			}
			else
			{
				$this->response["status"] = "success";
				$this->response["message"] = "Data selected from database";
			}

			$this->response["rows"] = $rows;
		}
		catch(PDOException $e)
		{
			$this->response["status"] = "error";
			$this->response["message"] = 'Select Failed: ' .$e->getMessage();
			$this->response["rows"] = null;
		}
		return $this->response;
	}   

	public function update($table, $columns, $where)
	{   
		try
		{
			$cols = '';
			$wh = '';

			end($columns);
			$last = key($columns);

			foreach ($columns as $key => $value) 
			{
				if ($key != 'id')
				{
					$cols .= "$key = :". $key;
					if ($key != $last) $cols .= ', ';
					$a[":".$key] = $value;
				}
			}

			foreach ($where as $key => $value) 
			{
				$wh .= " and $key = :". $key;
				$a[":".$key] = $value;
			}

			$query = "update `".$table."` set ".$cols ." where 1=1 ". $wh;

			$statement = $this->db->prepare($query);
			$statement->execute($a);

			$this->response["status"] = "success";
			$this->response["message"] = 'Data updated';
		}
		catch(PDOException $e)
		{
			$this->response["status"] = "error";
			$this->response["message"] = 'Update Failed: ' .$e->getMessage();
			$this->response["rows"] = null;
		}

		return $this->response;
	}

	public function response()
	{
		return $this->response;
	}

	public function shutdown()
	{
		$this->db = null;
	}
}
