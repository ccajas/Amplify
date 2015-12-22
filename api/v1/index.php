<?php

require('crudHelper.php');

/*
A minimal CRUD framework with routing
*/

class Router
{
    /*
    The following function will strip the script name from URL
    */

    private function getCurrentUri()
    {
        $basepath = implode('/', array_slice(explode('/', $_SERVER['SCRIPT_NAME']), 0, -1)) . '/';
        $uri = substr($_SERVER['REQUEST_URI'], strlen($basepath));

        if (strstr($uri, '?')) $uri = substr($uri, 0, strpos($uri, '?'));
        $uri = '/' . trim($uri, '/');
        return $uri;
    }

    /*
    Convert route into array segments
    */

    private function getRouteSegments($base_url)
    {
        $route = [];
        $route = explode('/', $base_url);

        return array_filter($route, function($s)
        {
            return (!empty(trim($s)));
        });
    }

    /*
    $routes will contain all the routes. $routes[0] will correspond to first route. 
    For e.g. in above example $routes[0] is search, $routes[1] is book and $routes[2] is fitzgerald
    */

    public function run()
    {
        $base_url = $this->getCurrentUri();
        $segments = array_values($this->getRouteSegments($base_url));

        // Perform CRUD operations

        if (!empty($segments))
        {
            $data_objects['route'] = $segments;
            $data_objects['request'] = '';

            $action = $segments[0];

            // General web server data

            if ($action == 'webserver')
            {
                $request = [
                    'software' => $_SERVER["SERVER_SOFTWARE"],
                    'extensions' => array_intersect(['mysql', 'mysqli'], get_loaded_extensions()),
                    'phpversion' => PHP_VERSION,
                    'status' => 'ok'
                ];

                $data_objects['request'] = $request;
                $this->echoResponse(200, $data_objects);
                return;
            }

            // Get source of database

            $db_table_segment = ($action == 'show') ? 2 : 1;
            $db_table = $segments[$db_table_segment];
            $from_db = explode('.', $db_table)[0];

            // Connect to database

            $db = new CRUD_Helper($from_db);

            // Check for connection errors

            if ($db->response()['status'] == 'error')
            {
                $data_objects['request'] = $db->response();
                $this->echoResponse(404, $data_objects);
                return;
            }

            // Custom query [ /query/ ]

            if ($action == 'query')
            {
                $query = json_decode(file_get_contents("php://input"), true);
                $data_objects['request'] = $db->query($query);
            }

            // Get database or table names [ /show/:?from ]

            if ($action == 'show')
            {
                $show_data = $segments[1];
                $show_from = (!empty($segments[2])) ? $segments[2] : '';

                $data_objects['request'] = (empty($show_from)) ?
                    $db->show($show_data) : $db->show($show_data, $show_from);
            }

            // Retrieve data row [ /get/:table/:id ]

            if ($action == 'get')
            {
                $match = $segments[2];
                $col = (is_numeric($match) ? 'id' : 'slug');
                $data_objects['request'] = $db->select($db_table, "*", [$col => $match], "ORDER BY id");
            }

            // Retrieve data list [ /select/:table/:?orderByColumn ]

            if ($action == 'select')
            {
                $order_by = (!empty($segments[2])) ? $segments[2] : '';
                $data_objects['request'] = $db->select($db_table, "*", [], $order_by);
            }

            // Insert data [ /insert/:table/ ]           

            if ($action == 'insert')
            {
                $cols = json_decode(file_get_contents("php://input"), true);
                $data_objects['request'] = $db->insert($db_table, $cols);
            }

            // Update data [ /update/:table/:id/ ]           

            if ($action == 'update')
            {
                $cols = json_decode(file_get_contents("php://input"), true);
                $data_objects['request'] = $db->update($db_table, $cols, ['id' => $cols['id']]);
            }

            // Delete data [ /delete/:table/:id/ ]

            if ($action == 'delete')
            {
                
            }
        }

        $status = $data_objects['request']['status'] == 'error' ? 404 : 200;
        $this->echoResponse($status, $data_objects);
    }

    /*
    Spit out JSON
    */
    private function echoResponse($status_code, $response, $encode = true) 
    {
        $output = '';
        header(' ', true, $status_code);
        header('Content-type: application/json');

        if ($encode)
            $output = json_encode($response, JSON_NUMERIC_CHECK);
        else
            $output = $response;

        echo preg_replace("/(\r\n|\n|\r)/", "<br />", $output);
    }
}

$router = new Router();
$router->run();
