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
		file_exists("php/$tempAction.php"))
	{
		$action = $tempAction;
	}
	else {
		$action = "quotes";
	}
	
	
	include("php/header.php");
	include("php/$action.php");
	include("php/footer.php");
?>