
function GoogleMap()
{				
	this.initialize = function( div_id, lat,lng , zoomValue){				
	    var map = showMap(div_id, lat,lng,zoomValue);
	    addMarkersToMap(map , lat , lng);
	}
	 
    var showMap = function(div_id, lat,lng,zoomValue){
    	dump( "=>"+zoomValue );
		var mapOptions = {
		zoom: zoomValue,
		center: new google.maps.LatLng(lat, lng),
		mapTypeId: google.maps.MapTypeId.ROADMAP
		}
		 
		var map = new google.maps.Map(document.getElementById(div_id), mapOptions);
		 
		return map;
	}

	var addMarkersToMap = function(map,lat,lng){			
		var latitudeAndLongitudeOne = new google.maps.LatLng(lat,lng);
		var markerOne = new google.maps.Marker({
            position: latitudeAndLongitudeOne,
            map: map
        });                        
	}
		
}