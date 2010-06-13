<?php

require_once('rss_fetch.inc');

$url = "http://www.wfp.org/news/hunger-in-the-news/feed";

$rss = fetch_rss($url);

$jsn = "";

foreach ($rss->items as $item) {
	
	$href = str_replace("\"", "'", $item['link']);
	$desc = str_replace("\"", "'", $item['description']);
	$title = str_replace("\"", "'", $item['title']);
	$pubdate = str_replace("\"", "'", $item['date_timestamp']);

	if ($jsn != "") $jsn .= ",";

	$jsn .= "{name:\"" . $title . "\",";
	$jsn .= "text:\"" . trim($desc) . "\",";
	$jsn .= "published:\"" . $pubdate . "\",";		
	$jsn .= "url:\"" . $href . "\"}";

}

$jsn = "{data:[" . $jsn . "]}";

returnJson($jsn);


function returnJson($json) {
	header("Content-Type: application/json");
	echo $json;
}

?>
