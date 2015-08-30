<?php 
	$action = "index";
	$disallowedPaths = array("header", "footer");
	
	if (!empty($_GET['action'])) {
		$tempAction = $_GET['action'];
		$tempAction = basename($tempAction);
		
		if (!in_array($tempAction, $disallowedPaths) &&
			file_exists("php/$tempAction.htm"))
		{
			$action = $tempAction;
		}
		else {
			$action = "error404";
		}
	}
	
	
	include("php/header.htm");
	include("php/$action.htm");
	include("php/footer.htm");
?>