<?php 
	$action = "index";
	$disallowedPaths = array("header", "footer");
	$tempAction = "";
	
	if (!isset($_GET['action']) || empty($_GET['action'])) 
		$tempAction = "play";
	else
		$tempAction = $_GET['action'];
		
	$tempAction = basename($tempAction);
	
	if (!in_array($tempAction, $disallowedPaths) &&
		file_exists("php/$tempAction.htm"))
	{
		$action = $tempAction;
	}
	else {
		$action = "quotes";
	}
	
	
	include("php/header.htm");
	include("php/$action.htm");
	include("php/footer.htm");
?>