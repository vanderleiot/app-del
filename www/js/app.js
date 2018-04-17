/**
Karenderia Order Taking App
Version 1.0.6
*/

/**
Default variable declarations 
*/
var ajax_url= krms_config.ApiUrl ;
var dialog_title_default= krms_config.DialogDefaultTitle;
var search_address;
var ajax_request;
var networkState;

var translator;
var dictionary;

var map;
var map_marker;

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {    
	    					
	navigator.splashscreen.hide();
				
	if ( !empty(krms_config.pushNotificationSenderid)) {
					
	    var push = PushNotification.init({
	        "android": {
	            "senderID": krms_config.pushNotificationSenderid
	        },
	        "ios": {"alert": "true", "badge": "true", "sound": "true"}, 
	        "windows": {} 
	    });
	    
	    push.on('registration', function(data) {         

	    	setStorage("merchant_device_id", data.registrationId );
	    	     
	        var params="registrationId="+ data.registrationId;
	            params+="&device_platform="+device.platform;
		        params+="&token="+getStorage("merchant_token");
		        callAjax("registerMobile",params);	 
	    });
	    
	    push.on('notification', function(data) {	    	
	                
	        if ( data.additionalData.foreground ){
	        	//alert("when the app is active");
	        	playNotification();
	        	
	        	//alert(data.additionalData.additionalData.push_type);
	        	
	        	switch (data.additionalData.additionalData.push_type)
	        	{
	        		case "order":	        		
	        		//showNotification( data.title,data.message, data.additionalData.additionalData.order_id );	 
	        		/*setHome();
	        		OrderRefresh();*/
	        		
	        		setStorage("notification_push_type", "order");
	        		
	        		var options = {     	  		  
				  	   closeMenu:true,
				       animation: 'slide',		
				       callback: function() { 				       	  
				       }		         
				    };	   	   	          
				    menu.setMainPage('home.html',options);
	        		
	        		break;
	        		
	        		case "booking":	        		
	        		//showNotificationBooking( data.title,data.message, data.additionalData.additionalData.booking_id );	
	        			        		
	        		setStorage("notification_push_type", "booking");
	        			        		
	        		var options = {     	  		  
				  	   closeMenu:true,
				       animation: 'slide',				         
				       callback: function() { 					       	  
				       }		         
				    };	   	   	          
				    menu.setMainPage('home.html',options);
	        		
	        		break;
	        		
	        		default:
	        		showNotificationBadge(1);
	        		showNotificationCampaign( data.title,data.message  );
	        		break;
	        	}
	        } else {
	        	//alert("when the app is not active");
	        	switch (data.additionalData.additionalData.push_type)
	        	{
	        		case "order":	        		
	        		/*showNotification( data.title,data.message, data.additionalData.additionalData.order_id );	 
	        		setHome();
	        		OrderRefresh();*/
	        		
	        		setStorage("notification_push_type", "order");	        	
	        		
	        		var options = {     	  		  
				  	   closeMenu:true,
				       animation: 'slide'				       
				    };	   	   	          
				    menu.setMainPage('home.html',options);
	        		
	        		break;
	        		
	        		case "booking":
	        		//showNotificationBooking( data.title,data.message, data.additionalData.additionalData.booking_id );	
	        		
	        		setStorage("notification_push_type", "booking");	        		
	        		
	        		var options = {     	  		  
				  	   closeMenu:true,
				       animation: 'slide'				       
				    };	   	   	          
				    menu.setMainPage('home.html',options);
	        		
	        		break;
	        		
	        		default:
	        		showNotificationBadge(1);
	        		showNotificationCampaign( data.title,data.message  );
	        		break;
	        	}
	        }	        
	        push.finish(function () {
	            //alert('finish successfully called');
	        });
	    });
	
	    push.on('error', function(e) {
	        //onsenAlert("push error");
	    });    
    
	}
}

jQuery.fn.exists = function(){return this.length>0;}
jQuery.fn.found = function(){return this.length>0;}


document.addEventListener("offline", noNetConnection, false);

function noNetConnection()
{
	hideAllModal();	
    ajax_request.abort();
	toastMsg( getTrans("Internet connection lost","net_connection_lost") );	
}


function dump(data)
{
	console.debug(data);
}

function setStorage(key,value)
{
	localStorage.setItem(key,value);
}

function getStorage(key)
{
	return localStorage.getItem(key);
}

function removeStorage(key)
{
	localStorage.removeItem(key);
}

function explode(sep,string)
{
	var res=string.split(sep);
	return res;
}

function urlencode(data)
{
	return encodeURIComponent(data);
}

function empty(data)
{
	if (typeof data === "undefined" || data==null || data=="" ) { 
		return true;
	}
	return false;
}

$( document ).on( "keyup", ".numeric_only", function() {
  this.value = this.value.replace(/[^0-9\.]/g,'');
});	 

/*onsen ready*/
ons.bootstrap();  
ons.ready(function() {
			
	dump("ready");
	refreshConnection();	
	if (!empty(getStorage("merchant_token"))){
		dump('has token');
	    dump( getStorage("merchant_token") );	    
	    showHomePage();
	    
	    if (isDebug()){
	    	setStorage("merchant_device_id","device_999");
	    	/* var params="registrationId="+ "device_999"
             params+="&device_platform="+"android";
	         params+="&token="+getStorage("merchant_token");
	         callAjax("registerMobile",params);	 */	  	    		    	
	    }
	    
	} else {
		dump('no token');
		$("#page-login").show();
	}
		    
	setTimeout('getLanguageSettings()', 1100);	
			   			
}); /*end ready*/


function refreshConnection()
{	
	if ( !hasConnection() ){			
	} else {		
	}	
}

function hasConnection()
{
	/*myconn*/
	if(isDebug()){
		return true;
	}
	networkState = navigator.network.connection.type;		
	if ( networkState=="Connection.NONE" || networkState=="none"){	
		return false;
	}	
	return true;
}

function createElement(elementId,elementvalue)
{
   var content = document.getElementById(elementId);
   content.innerHTML=elementvalue;
   ons.compile(content);
}

/*PAGE INIT*/
document.addEventListener("pageinit", function(e) {
	dump("pageinit");	
	dump("pagname => "+e.target.id);	
	
	switch (e.target.id)
	{
		case "page-acceptOrderForm":
		initMobileScroller();
		translatePage();
		break;
		
		case "page-declineOrderForm":		
		case "page-displayOrder":
		case "page-forgotpass":
		case "page-lostPassword":
		case "page-orderHistory":
		case "page-changesStatus":
		case "page-location-map":
		case "page-showNotification":
		case "page-SearchPopUp":
		case "page-searchResults":
		case "page-map":
		case "page-assignDriver":
		translatePage();
		break;
		
		case "page-orderstoday":
		$(".tab-action").val('GetTodaysOrder');
		$(".display-div").val('new-orders');
		$(".tab-active-page").html( getTrans('New Orders','new_order') );
							
		if ( !empty( getStorage("notification_push_type")  )){
			if (  getStorage("notification_push_type")=="order" ){				
				
		         $(".tab-action").val('GetTodaysOrder');
                 $(".display-div").val('new-orders');
                 $(".tab-active-page").html( getTrans('New Orders','new_order') );
                 tabbar.setActiveTab(0);		       	 
		       	 removeStorage("notification_push_type");
		       	 
		       	 showNotificationBadge(1);
				
			} else if ( getStorage("notification_push_type")=="booking" ){
				
				   $("#display-div").val('booking-pending');
				   $(".tab-active-page").html( getTrans("Booking","booking") );	 
				   tabbar.setActiveTab(3);				   
				   removeStorage("notification_push_type");
				   
				   showNotificationBadge(1);
				   
			} else {
				GetTodaysOrder();
			}
		} else {
			GetTodaysOrder();
		}
		
				
		translatePage();				
		break;
		
		case "page-pendingorders":
		$(".tab-action").val('GetPendingOrders');
		$(".display-div").val('pending-orders');
		$(".tab-active-page").html( getTrans('Pending Orders','pending_orders') );
		getPendingOrders();
		break;
		
		case "page-allorders":
		$(".tab-action").val('GetAllOrders');
		$(".display-div").val('allorders-orders');
		$(".tab-active-page").html( getTrans('All Orders','all_orders') );
		getGetAllOrders();
		break;		
		
		
		case "page-languageoptions":  
	    callAjax('getLanguageSelection','');
	    break;
		
	   case "page-settings":  	   
	   
	    $(".device_id_val").html( getStorage("merchant_device_id") );
	    if (isDebug()){
	    	$(".software_version_text").html( "1.0" );
	    } else {
	    	$(".software_version_text").html( BuildInfo.version );
	    }
	    
	    callAjax("getSettings",
	     "device_id="+getStorage("merchant_device_id")
	    ); 
	    translatePage();
	    break; 
	    
	   case "page-profile": 
	      var info=getMerchantInfoStorage();	      	 
	      var params='';
		  params+="&token="+getStorage("merchant_token");
		  params+="&user_type="+info.user_type;
		  params+="&mtid="+info.merchant_id;		  
	     callAjax('getProfile',params);
	     translatePage();     
	    break; 
	    
	   case "page-slidemenu": 
	   menu.on('preopen', function() {
          console.log("Menu page is going to open");       
          translatePage();       
       });
	   break; 
	   
	   case "page-tablePending":	     
	      var info=getMerchantInfoStorage();	      	 
	      var params='';
		  params+="&token="+getStorage("merchant_token");
		  params+="&user_type="+info.user_type;
		  params+="&mtid="+info.merchant_id;		  
	      callAjax('PendingBooking',params);
	      translatePage(); 	   	
	      
	      $("#tab-action").val('pendingBooking');
	      $("#display-div").val('table-pending');
	      $(".page_label_book").html( getTrans("Pending Booking","pending_booking") );      	     
	   break; 
	   
	   case "page-tableAll":	
	      var info=getMerchantInfoStorage();	      	 
	      var params='';
		  params+="&token="+getStorage("merchant_token");
		  params+="&user_type="+info.user_type;
		  params+="&mtid="+info.merchant_id;		  
	      callAjax('AllBooking',params);     
	      translatePage(); 	
	      
	      $("#tab-action").val('AllBooking');
	      $("#display-div").val('table-all');
	      $(".page_label_book").html( getTrans("All Booking","all_booking") );	      
	   break; 
	   	   
	   case "page-bookingtab":	   
	      $(".tab-active-page").html( getTrans("Booking","booking") );	 
	      $("#display-div").val('booking-pending');
	      
	      var info=getMerchantInfoStorage();	      	 
	      var params='';
		  params+="&token="+getStorage("merchant_token");
		  params+="&user_type="+info.user_type;
		  params+="&mtid="+info.merchant_id;		  
	      callAjax('PendingBookingTab',params);
	      translatePage(); 	   	
	           
	   break; 
	   	   
	}
	
}, false);


function onsenAlert(message,dialog_title)
{
	if (typeof dialog_title === "undefined" || dialog_title==null || dialog_title=="" ) { 
		dialog_title=dialog_title_default;
	}
	ons.notification.alert({
      message: message,
      title:dialog_title
    });
}

function hideAllModal()
{
	setTimeout('kloader.hide()', 1);	
}

/*mycallajax*/
function callAjax(action,params)
{	
	if ( !hasConnection() ){
		if ( action!="registerMobile"){
		    //onsenAlert(  getTrans("CONNECTION LOST",'connection_lost') );
		    notyAlert(  getTrans("CONNECTION LOST",'connection_lost'),'error' );
		}		
		return;
	}
	
	params+="&lang_id="+getStorage("mt_default_lang");
	if(!empty(krms_config.APIHasKey)){
		params+="&api_key="+krms_config.APIHasKey;
	}
	
	dump("Action=>"+action);
	dump(ajax_url+"/"+action+"?"+params);
	
	ajax_request = $.ajax({
	 url: ajax_url+"/"+action, 
	 data: params,
	 type: 'post',                  
	 async: false,
	 dataType: 'jsonp',
	 timeout: 5000,	 	
	 crossDomain: true,
	 beforeSend: function() {
		if(ajax_request != null) {			 	
		   /*abort ajax*/
		   hideAllModal();	
           ajax_request.abort();
		} else {    
			/*show modal*/			   
			switch(action)
			{
				case "none":
				   break;				
				default:
				   kloader.show();
				   break;
			}
		}
	},
	complete: function(data) {					
		ajax_request=null;   	     				
		hideAllModal();		
		view_order_page_bol = undefined;
		view_booking_page_bol = undefined;
	},
	success: function (data) {	  
		dump(data);
		if (data.code==1){
			
			dump('actions=>' + action);
			
			switch (action)
			{
				case "registerMobile":
				case "none":
				break;
				
				case "login":
				   dump(data.details.token);
				   setStorage("merchant_token",data.details.token);
				   setStorage("merchant_info",JSON.stringify(data.details.info));
				   showHomePage();
				break;				
				
				case "GetTodaysOrder":
				   displayOrders(data.details,'new-orders');
				break;

				case "GetPendingOrders":				   
				   displayOrders(data.details,'pending-orders');
				break;
				
				case "GetAllOrders":
				   displayOrders(data.details,'allorders-orders');
				break;
				
				case "OrderdDetails":
				displayOrderDetails(data.details);
				break;
				
				case "DeclineOrders":
				case "AcceptOrdes":
				case "ChangeOrderStatus":
					var options = {
				      animation: 'none',
				      onTransitionEnd: function() { 			      	 			      	 
				      } 
				    };				    
					notyAlert(data.msg,'error');
					kNavigator.resetToPage('slidemenu.html',options);
				break;
				
				case "StatusList":
				statusList(data.details);
				break;
				
				case "getLanguageSelection":
				displayLanguageSelection(data.details);
				break;
				
				
				case "getSettings":      			       
			       if ( data.details.enabled_push==1){		
			       	   enabled_push.setChecked(true);
			       } else {			       	  
			       	   enabled_push.setChecked(false);
			       }		
			       
			       dump(data.details.food_option_not_available);
			       switch (data.details.food_option_not_available)
			       {
			       	   case 1:
			       	   case "1":
			       	   food_option_not_available.setChecked(true);
			       	   food_option_not_available_disabled.setChecked(false);
			       	   break;
			       	   
			       	   case 2:
			       	   case "2":
			       	   food_option_not_available.setChecked(false);
			       	   food_option_not_available_disabled.setChecked(true);
			       	   break;
			       	   
			       	   default:
			       	   food_option_not_available.setChecked(false);
			       	   food_option_not_available_disabled.setChecked(false);
			       	   break;
			       }
			       
			       if (data.details.merchant_close_store=="yes"){
			       	   merchant_close_store.setChecked(true);
			       } else {
			       	   merchant_close_store.setChecked(false);
			       }
			       
			       if (data.details.merchant_show_time=="yes"){
			       	   merchant_show_time.setChecked(true);
			       } else {
			       	   merchant_show_time.setChecked(false);
			       }
			       
			       if (data.details.merchant_disabled_ordering=="yes"){
			       	   merchant_disabled_ordering.setChecked(true);
			       } else {
			       	   merchant_disabled_ordering.setChecked(false);
			       }
			       
			       if (data.details.merchant_enabled_voucher=="yes"){
			       	   merchant_enabled_voucher.setChecked(true);
			       } else {
			       	   merchant_enabled_voucher.setChecked(false);
			       }
			       
			       if (data.details.merchant_required_delivery_time=="yes"){
			       	   merchant_required_delivery_time.setChecked(true);
			       } else {
			       	   merchant_required_delivery_time.setChecked(false);
			       }
			       
			       if (data.details.merchant_enabled_tip=="2"){
			       	   merchant_enabled_tip.setChecked(true);
			       } else {
			       	   merchant_enabled_tip.setChecked(false);
			       }
			       
			       if (data.details.merchant_table_booking=="yes"){
			       	   merchant_table_booking.setChecked(true);
			       } else {
			       	   merchant_table_booking.setChecked(false);
			       }
			       
			       if (data.details.accept_booking_sameday=="2"){
			       	   accept_booking_sameday.setChecked(true);
			       } else {
			       	   accept_booking_sameday.setChecked(false);
			       }
			       	       
			     break;
			       
			    case "geoDecodeAddress":			    
				  var locations={
					"name":data.address ,
					"lat":data.details.lat,
					"lng":data.details.long
					};
				   initMap(locations);
			    break;
			    
			    case "ForgotPassword":
			    dialogForgotPass.hide();		
			    			    
			    var options = {
			      animation: 'none',
			      onTransitionEnd: function() { 
			      	 $(".changepass-msg").html( data.msg );		
			      	 $(".email_address").val( data.details.email_address );		
			      	 $(".user_type").val( data.details.user_type );		
			      } 
			    };
			    kNavigator.pushPage("lostPassword.html", options);			    	    
			    break;
			    
			    case "OrderHistory":
			    $(".order-history-title").html( getTrans('Order history #','order_history')  + data.details.order_id);
			    displayHistory(data.details.data);
			    break;
			    
			    case "ChangePasswordWithCode":
			    onsenAlert(data.msg);
			    kNavigator.popPage({cancelIfRunning: true});
			    break;
			    
			    case "getProfile":
			    $(".username").val(data.details.username);
			    break; 
			    
			    case "getLanguageSettings":			      			      
			      setStorage("mt_translation",JSON.stringify(data.details.translation));
			      
			      var device_set_lang=getStorage("mt_default_lang");
			      dump("device_set_lang=>"+device_set_lang);
			      
			      if (empty(device_set_lang)){
			       	   dump('proceed');
				       if(!empty(data.details.settings.default_lang)){			       	  
				          setStorage("mt_default_lang",data.details.settings.default_lang);
				       } else {
				       	  setStorage("mt_default_lang","");
				       }			
			       }			       
			       translatePage();	  			      
			    break;
			    
			    
			    case "getNotification":		
			    displayNotification(data.details);	       
			    break;
			    
			    case "searchOrder":
			    //$(".search_results_found").html( data.msg);
			    displayOrders(data.details,'search-resuls');
			    break;
			    
			    case "PendingBooking":
			       displayBooking(data.details,'table-pending');		
			    break;
			    
			    case "AllBooking":
			       displayBooking(data.details,'table-all');		
			    break;
			    
			    case "GetBookingDetails":
			    $("#booking-view-title").html( getTrans("Booking Details #",'booking_details') + data.details.booking_id );
			    displayBookingDetails(data.details.data);
			    translatePage();	  	
			    break;
			    
			    case "bookingChangeStats":
			        var options = {
				      animation: 'none',
				      onTransitionEnd: function() { 			      	 			      	 
				      } 
				    };				    
					notyAlert(data.msg,'error');
					kNavigator.resetToPage('bookingHome.html',options);					
			    break;
			    
			    case "loadTeamList":
			       $(".driver_selected").html( getTrans('Assigned Driver','assigned_driver') ); 
			       $(".driver_id").val('');
			       displayTeamList(data.details);
			    break;
			    
			    case "driverList":
			       displayDriverList(data.details);
			    break;
			    
			    case "assignTask":
			       toastMsg(data.msg);
                   kNavigator.popPage({cancelIfRunning: true});                    
			    break;
			    
			    case "PendingBookingTab":
			       displayBooking(data.details,'newbooking-list');		
			    break;
			    
			    case "saveSettings":
			      toastMsg(data.msg);
			    break;
			    
				default:
				   dump('default');
				   onsenAlert(data.msg);
				break;
			}
			
		} else if(data.code==3){
			
			removeStorage("merchant_token");
            removeStorage("merchant_info");
			onsenAlert(data.msg);
			kNavigator.popPage();
			
		} else {
			// failed response
			switch (action)
			{
				case "registerMobile":
				case "none":
				case "getLanguageSettings":
				break;
											
				case "GetPendingOrders":
				case "GetAllOrders":
				case "getNotification":		
				case "searchOrder":
				case "PendingBooking":
				case "AllBooking":
				case "PendingBookingTab":
				notyAlert(data.msg,"error");
				break;
				
				case "GetTodaysOrder":
				notyAlert(data.msg,"error");
				$("#new-orders").html('');
				break;
				
				case "OrderdDetails":
				onsenAlert(data.msg);
				kNavigator.popPage({cancelIfRunning: true});
				break;
								
				case "OrderHistory":
				//onsenAlert(data.msg);
				notyAlert(data.msg,"error");
			    $(".order-history-title").html( getTrans('Order history #','order_history') + data.details);			    
			    break;
			    
			    case "GetBookingDetails":
			    $("#booking-view-title").html( getTrans("Booking Details #",'booking_details') );
			    notyAlert(data.msg,"error");
			    break;
			    
			    case "getSettings":
			    onsenAlert(data.msg);
			    break;
			    
			    case "loadTeamList":			       
			      $(".team_selected").html( getTrans('Select Team','select_team') ); 
			      onsenAlert(data.msg);
			      createElement("team-list",'');
			      teamListDialog.hide();
			    break;
			    
			    case "driverList":			      
			       $(".driver_selected").html( getTrans('Assigned Driver','assigned_driver') ); 
			       onsenAlert(data.msg);
			       createElement("driver-list",'');
			       driverListDialog.hide();
			    break;
				
				default:
				onsenAlert(data.msg);
				break;
			}			
		}
	},
	error: function (request,error) {	        
		hideAllModal();
		view_order_page_bol = undefined;
		dump("MY CALL ERROR=>" + action);
		switch (action)
		{
			case "getLanguageSettings":
			case "registerMobile":
			case "getLanguageSettings":			
			break;
			
			case "GetTodaysOrder":
			notyAlert( getTrans("Network error has occurred please try again!",'network_error')  ,"error");
			break;
			
			default:
			//onsenAlert( getTrans("Network error has occurred please try again!",'network_error') );
			notyAlert( getTrans("Network error has occurred please try again!",'network_error')  ,"error");
		    break;
		}
	}
   });       		
	
} /*end callajax*/

function getTrans(words,words_key)
{
	return words;
}

function login()
{
	$.validate({ 	
	    form : '#frm-login',    
	    borderColorOnError:"#FF0000",
	    onError : function() {      
	    },	   
	    onSuccess : function() {     	   	      
	      var params = $( "#frm-login").serialize();
	      params+="&merchant_device_id="+getStorage("merchant_device_id");
	      callAjax("login",params);	       
	      return false;
	    }  
	});	
}

function showForgotPass()
{
	$(".email_address").val('');
	if (typeof dialogForgotPass === "undefined" || dialogForgotPass==null || dialogForgotPass=="" ) { 	    
		ons.createDialog('forgotPassword.html').then(function(dialog) {
	        dialog.show();	        
	        $(".email_address").attr("placeholder",  getTrans('Email Address','email_address') );
	    });	
	} else {
		dialogForgotPass.show();		
	}
}

function showHomePage()
{
   var options = {
      animation: 'none',
      onTransitionEnd: function() {   
      	  //tabbar.setActiveTab(3);
      } 
   };
   kNavigator.pushPage("slidemenu.html", options);				
}

function setHome()
{	
    var options = {     	  		  
  	   closeMenu:true,
       animation: 'slide',
       //callback:GetTodaysOrder
    };	   	   	          
    menu.setMainPage('home.html',options);
}

function logout()
{
   removeStorage("merchant_token");
   removeStorage("merchant_info");
   var pages = kNavigator.getPages();     
   dump(pages);
   dump(pages.length);
   
   if ( pages.length<=1){   	  
      kNavigator.resetToPage('pageLogin.html', {     	  		  
  	   closeMenu:true,
       animation: 'none',       
       onTransitionEnd: function() { 
       	  $("#page-login").show();
       }
      });
   } else {
   	  kNavigator.popPage();
   }   
   //kNavigator.resetToPage('slidemenu.html',options);
}

function load(done)
{	
	dump('pull');
	
	if ( !hasConnection() ){
		notyAlert(  getTrans("CONNECTION LOST",'connection_lost'),'error' );
		done();
		return;
	}
				
	//var action="GetTodaysOrder";
	var action= $(".tab-action").val();	
	var div_id= $(".display-div").val();
	
	var info=getMerchantInfoStorage();	
	var params="token="+getStorage("merchant_token");
	params+="&user_type="+info.user_type;
	params+="&mtid="+info.merchant_id;	
	params+="&lang_id="+getStorage("mt_default_lang");
		
    if(!empty(krms_config.APIHasKey)){
		params+="&api_key="+krms_config.APIHasKey;
	}
	
	dump(ajax_url+"/"+action+"/?"+params);	
	
    ajax_request = $.ajax({
	 url: ajax_url+"/"+action, 
	 data: params,
	 type: 'post',                  
	 async: false,
	 dataType: 'jsonp',
	 timeout: 5000,
	 crossDomain: true,
	 beforeSend: function() {
		if(ajax_request != null) {			 	
		   /*abort ajax*/
		   hideAllModal();	
           ajax_request.abort();
		} 
	},
	complete: function(data) {					
		ajax_request=null;  		
	},
	success: function (data) {	  
		dump(data);
		done();
		if (data.code==1){					
			displayOrders(data.details,div_id);			
		} else if(data.code==3){
									
		} else {
			// failed response
			notyAlert(data.msg,"error");
			$("#new-orders").html('');
		}
	},
	error: function (request,error) {	        
				
	}
   });       				
}

function GetTodaysOrder()
{	
	var info=getMerchantInfoStorage();	
	var params="token="+getStorage("merchant_token");
	params+="&user_type="+info.user_type;
	params+="&mtid="+info.merchant_id;
	callAjax("GetTodaysOrder",params);
}

function getPendingOrders()
{	
	var info=getMerchantInfoStorage();	
	var params="token="+getStorage("merchant_token");
	params+="&user_type="+info.user_type;
	params+="&mtid="+info.merchant_id;
	callAjax("GetPendingOrders",params);
}

function getGetAllOrders()
{	
	var info=getMerchantInfoStorage();	
	var params="token="+getStorage("merchant_token");
	params+="&user_type="+info.user_type;
	params+="&mtid="+info.merchant_id;
	callAjax("GetAllOrders",params);
}

function getMerchantInfoStorage()
{
	var info =  JSON.parse( getStorage("merchant_info") );	
	return info;
}

function displayOrders(data,div_id)
{
	var icon_trans_type=''; var icons=''; var icons2='';
	var htm='';
	$.each( data, function( key, val ) {        		  		  
		//dump(val);
		htm+='<ons-list-item modifier="tappable" onclick="viewOrder('+val.order_id+');">';
		htm+='<ons-row class="row-with-pad">';
				
		icon_trans_type = getTransactionTypeIcons( val.trans_type_raw );
		
		var new_tag='';
		if (val.viewed==1){
			new_tag='<div class="new-tag rounded">'+ getTrans('new','new') +'</div>';
		}
		
		htm+='<ons-col width="25%" class="center" >';
		   htm+='<div class="delivery-icon">' + new_tag;
			htm+='<ons-icon icon="'+icon_trans_type+'" class="icon rounded"></ons-icon>';
		   htm+='</div>';
		htm+='</ons-col>';
		
		/*icons='fa-exclamation-triangle';
		icons2='';*/
		var icon=getOrderIcons(val.status_raw);
		var icons=icon.icons;
		var icons2=icon.classname;
								
		htm+='<ons-col >';
		   htm+='<p class="margin2 small-font-dim small-font-dim-smaller concat-text bold">'+val.customer_name+'</p>';
		   htm+='<p class="margin2 small-font-dim small-font-dim-smaller">'+ getTrans("Order No",'order_no') +'. <b>'+val.order_id+'</b></p>';
		   htm+='<p class="margin2 small-font-dim small-font-dim-smaller">'+val.delivery_date+'</p>';
		   htm+='<p class="status margin2 '+ val.status_raw +' ">';
		   //htm+='<ons-icon icon="'+icons+'" class="icon '+icons2+'"></ons-icon>';
		   htm+=val.status;
		   htm+='</p>';
		 htm+='</ons-col>';

		
		 htm+='<ons-col width="25%" class="text-right" >';
		   htm+='<price>'+val.total_w_tax_prety+'</price>';
		   htm+='<p class="small-font-dim orange-text">';
		   if (!empty(val.delivery_time)){
		     htm+='<ons-icon icon="ion-android-alarm-clock" class="icon"></ons-icon>';		   
		     htm+=' '+val.delivery_time;
		   }
		   if (!empty(val.delivery_asap)){
		     htm+='<ons-icon icon="ion-android-alarm-clock" class="icon"></ons-icon>';		   
		     htm+=' '+val.delivery_asap;
		   }
		   htm+='</p>';
		 htm+='</ons-col>';
		 
		htm+='</ons-row>';
		htm+='</ons-list-item>';
	});	
	//createElement('new-orders',htm);
	
	createElement(div_id,htm);
		
}

function getOrderIcons(status_raw)
{
	icons='fa-exclamation-triangle';
	icons2='';
	switch (status_raw)
	{
		case "decline":
	    icons='ion-close-circled';
	    icons2='icon-red';
		break;
		
		case "accepted":
		icons='ion-checkmark-round';
		icons2='icon-green';
		break;
		
		case "delivered":
		icons='ion-ios-checkmark';
		icons2='icon-green';
		break;
		
		case "pending":
		icons='fa-exclamation-triangle';
		icons2='icon-orange';
		break;
		
		default:
		icons='';
		icons2='';
		break;
		
	}
	return {
		'icons':icons,
		'classname':icons2
	};
}

function getTransactionTypeIcons(trans_type_raw)
{
	var icon_trans_type='';
	if ( trans_type_raw=="delivery"){
		icon_trans_type='ion-android-car';
	} else {
		icon_trans_type='ion-android-restaurant';
	}
	return icon_trans_type;
}

function notyAlert(msg,alert_type)
{
	
	if (!isDebug()){
		toastMsg( msg );
		return ;
	}
		
	// type = warning or success
	var n = noty({
		 text: msg,
		 type        : alert_type ,		 
		 theme       : 'relax',
		 layout      : 'bottomCenter',		 
		 timeout:3000,
		 killer: true, 
		 animation: {
	        open: 'animated fadeInUp', // Animate.css class names
	        close: 'animated fadeOut', // Animate.css class names	        
	    }
	});
}

var view_order_page_bol;

function viewOrder(order_id)
{	
	dump("view_order_page_bol->"+view_order_page_bol);
	if (empty(view_order_page_bol)){
		dump('view_order_page_bol');
		view_order_page_bol=true;
	} else {
		return;
	}
	
	dump(order_id);
	var options = {
      animation: 'slide',
      onTransitionEnd: function() { 
      	
      	 $("#order-details-page-title").html( getTrans("Getting order details..",'getting_order_details') );
      	
      	 var info=getMerchantInfoStorage();	
		 var params="token="+getStorage("merchant_token");
	 	 params+="&user_type="+info.user_type;
	 	 params+="&mtid="+info.merchant_id;	 	 
	 	 params+="&order_id="+order_id;	 	 
	 	 params+="&backend=true";	
	 	 $(".order_id").val(order_id);	 	 
		 callAjax("OrderdDetails",params);
      } 
   };
   kNavigator.pushPage("displayOrder.html", options);   
}

function acceptOrder()
{
	var order_id=$(".order_id").val();
	var trans_type=$(".trans_type").val();
	dump("order_id->"+order_id);
	dump("trans_type->"+trans_type);
	
	var options = {
      animation: 'none',
      onTransitionEnd: function() { 
      	   $(".order_id").val(order_id);
      	   if ( trans_type=="delivery"){
      	   	   $(".delivery-notes").html( getTrans("We'll send a confirmation including delivery time to your customer",'send_confirm_msg') );        
      	   	   $(".delivery_time").attr("placeholder", getTrans("Delivery Time",'delivery_time') );
      	   } else {
      	   	   $(".delivery-notes").html( getTrans("We'll send a confirmation including pickup time to your customer",'send_cinfirm_pickup'));        
      	   	   $(".delivery_time").attr("placeholder",getTrans("Pickup Time",'pickup_time') );
      	   }      	   
      	   
      	   if(!empty(getStorage("delivery_time") && getStorage("delivery_time")!="false" )){      	      
      	      $(".delivery_time").val( getStorage("delivery_time") );
      	   }
      	   
      } 
   };
   kNavigator.pushPage("acceptOrderForm.html", options);				
}

function displayOrderDetails(data)
{
	
	var icon = getTransactionTypeIcons( data.trans_type_raw );
	var header='<ons-icon icon="'+icon+'"></ons-icon> ';
	header+=data.transaction_date;	
	createElement("order-details-page-title",header);
	
	/*client and orderinfo*/
	var icons=getOrderIcons(data.status_raw);
		
	
	$(".trans_type").val( data.trans_type_raw ) ;
		
	if (data.trans_type_raw=="delivery"){
		setStorage("delivery_time",data.delivery_time);
	} else {
		setStorage("delivery_time",'');
	}
	
	var html='';
	var html='<ons-list-header class="header">';
        html+='<ons-row>';
        html+='<ons-col><p class="status margin2 '+data.status_raw+' ">'+data.status+'</p></ons-col>';
        html+='<ons-col class="text-right">'+getTrans("Order No",'order_no')+' : '+data.order_id+'</ons-col>';
        html+='</ons-row>';
     html+='</ons-list-header>';
     
     html+='<ons-list-item>';
       html+='<ons-icon icon="ion-person"></ons-icon> '+data.client_info.full_name;
     html+='</ons-list-item>';
     
     if ( !empty(data.client_info.contact_phone)){
     html+='<ons-list-item>';
     html+='<ons-row>';
     html+='<ons-col>';
     html+='<ons-icon icon="ion-ios-telephone"></ons-icon> <a href="tel:'+data.client_info.contact_phone+'">'+ data.client_info.contact_phone+"</a>";
     html+='</ons-col>';
     
     /*html+='<ons-col class="text-right">';
     html+='<ons-button modifier="quiet" onclick="YourPrintFunctinns()" class="view-location">';
     html+= getTrans("Print",'print') + '</ons-button>';
     html+='</ons-col>';*/
     
     html+='</ons-row>';
     html+='</ons-list-item>';
     }
     
     //if ( !empty(data.client_info.address)){
     dump(data.trans_type_raw);
     if (data.trans_type_raw=="delivery"){
	     var address = "'"+data.client_info.address+"'";    
	     var lat_lng = "'"+data.client_info.delivery_lat+"'," + "'"+data.client_info.delivery_lng+"'," + "'"+data.client_info.address+"'";    
	     html+='<ons-list-item>';
	     html+='<ons-row>';
	        html+='<ons-col size="21px"><ons-icon icon="ion-ios-location"></ons-icon></ons-col>';        
	        html+='<ons-col class="fixed-col">'+data.client_info.address+'</ons-col>';
	        html+='<ons-col class="text-right">';
	          html+='<ons-button modifier="quiet" onclick="viewLocationNew('+lat_lng+')" class="view-location">';
	          html+= getTrans("View Location",'view_location') + '</ons-button>';
	        html+='</ons-col>';
	       html+='</ons-row>';  
	     html+='</ons-list-item>';
     }
          
     html+=TPLorderRow( getTrans("TRN Type",'trn_type') ,  data.trans_type);
     html+=TPLorderRow( getTrans("Payment Type",'payment_type') ,  data.payment_type);
     
     if( data.payment_type=="PYR" || data.payment_type=="pyr"){
     	html+=TPLorderRow( getTrans("Card#",'card_number') ,  data.payment_provider_name);
     }
     if( data.payment_type=="OCR" || data.payment_type=="ocr"){
     	html+=TPLorderRow( getTrans("Card#",'card_number') , data.credit_card_number );
     }
     
     if ( data.trans_type_raw=="delivery"){
        html+=TPLorderRow( getTrans("Delivery Date",'delivery_date') ,  data.delivery_date);     
     } else {
     	html+=TPLorderRow( getTrans("Pickup Date",'pickup_date') ,  data.delivery_date);     
     }
     
     if (!empty(data.delivery_time)){
     	 if ( data.trans_type_raw=="delivery"){
            html+=TPLorderRow( getTrans("Delivery Time",'delivery_time') ,  data.delivery_time);
     	 } else {
     	 	html+=TPLorderRow( getTrans("Pickup Time",'pickup_time') ,  data.delivery_time);
     	 }
     }
     if (!empty(data.delivery_asap)){
         html+=TPLorderRow( getTrans("Delivery Asap",'delivery_asap') ,  data.delivery_asap);
     }
     
     if ( data.trans_type_raw=="delivery"){
        html+=TPLorderRow( getTrans("Delivery Instruction",'delivery_instructions') ,  data.delivery_instruction);     
        html+=TPLorderRow( getTrans("Location Name",'location_name') ,  data.client_info.location_name);     
     }
     
     if (!empty(data.total.order_change)){
         html+=TPLorderRow( getTrans("Change",'change') ,  data.total.order_change );
     }
     	
     createElement("order-details",html);
          
     /*display the order items*/
     var html='';
     /*html+='<ons-list-header class="header">';
        html+='<ons-row>';
        html+='<ons-col>'+ getTrans("Total",'total') +'</ons-col>';
        html+='<ons-col class="text-right">'+data.total.total+'</ons-col>';
        html+='</ons-row>';
     html+='</ons-list-header>';*/
     
     html+='<ons-list-header class="header">';
        html+='<ons-row>';
        html+='<ons-col>'+ getTrans("Order Details",'order_details') +'</ons-col>';        
        html+='</ons-row>';
     html+='</ons-list-header>';
     
     if (!empty(data.item)){
     	$.each( data.item , function( key, val ) {  
     		  //dump(val);
     		  var price=val.normal_price;
     		  if (val.discounted_price>0){
     		  	  price=val.discounted_price
     		  }
     		  
     		  //var final_price=parseInt(val.qty)*parseFloat(price)
     		  var final_price = val.total_price; 
     		  /*if (isNaN(final_price)){
     		  	 final_price=0;
     		  }*/
     		       		  
     		  description = val.qty+"x "+ price+ " " + val.item_name ;
     		  if (!empty(val.size_words)){
     		  	 description+=" ("+val.size_words+")";
     		  }
     		  
     		  if (!empty(val.cooking_ref)){
     		  	 description+='<br/>'+val.cooking_ref
     		  }
     		  
     		  if (!empty(val.order_notes)){
     		  	 description+='<br/>'+val.order_notes
     		  }
     		       		  
     		  //final_price=displayPrice(data.currency_position, data.total.curr , final_price);
     		  html+=TPLorderRow( description ,  final_price , 'fixed-col bold' );     
     		  
     		  /*ingredients*/
     		  if (!empty(val.ingredients)){
     		  	  if ( val.ingredients.length>0){
	     		  	  html+='<ons-list-header>'+ getTrans("Ingredients",'ingredients') +'</ons-list-header>';
	     		  	  $.each( val.ingredients , function( key1, ingredients ) {       		  	  	  
	     		  	  	  html+=TPLorderRow( ingredients ,  '' );     
	     		  	  });	
     		  	  }
     		  }
     		  
     		  /*sub item*/
     		  var addon='';
     		  if (!empty(val.sub_item_new)){     		  	  
 		  	  	  $.each( val.sub_item_new , function( key2, sub_item ) {  
 		  	  	  	  html+='<ons-list-header>'+key2+'</ons-list-header>';  
 		  	  	  	  if ( sub_item.length>0){
 		  	  	  	  	  $.each( sub_item , function( key3, sub_items ) {  
 		  	  	  	  	  	  t_desc=sub_items.addon_qty+"x "+sub_items.addon_price+" "+sub_items.addon_name;
 		  	  	  	  	  	  html+=TPLorderRow( t_desc ,  sub_items.total , 'fixed-col' );     
 		  	  	  	  	  });
 		  	  	  	  }
 		  	  	  });     		  	  
     		  }
     		  
     	});	
     }
     
     html+='<ons-list-header class="header">';
        html+='<ons-row>';
        html+='<ons-col></ons-col>';        
        html+='</ons-row>';
     html+='</ons-list-header>';
     
     if ( !empty(data.total)){
     	
     	if (!empty(data.total.discounted_amount)){
     		html+=TPLorderRow( getTrans("Discount",'discount') +" "+ data.total.discount_percentage , "("+data.total.discounted_amount1 +")");
     		
     		if (!empty(data.total.points_discount)){
     			if (data.total.points_discount>0){
     				html+=TPLorderRow( getTrans("Points Discount",'point_discount'),"("+data.total.points_discount1 +")");
     			}
     		}
     		
     		html+=TPLorderRow( getTrans("Sub Total",'sub_total') ,  data.total.subtotal );
     		
     	} else {
     		
     		if (!empty(data.total.points_discount)){
     			if (data.total.points_discount>0){
     				html+=TPLorderRow( getTrans("Points Discount",'point_discount'),"("+data.total.points_discount1 +")");
     			}
     		}
     		
     		html+=TPLorderRow( getTrans("Sub Total",'sub_total') ,  data.total.subtotal );
     	}
     	                  
        if (!empty(data.total.voucher_amount)){
         	if (data.total.voucher_amount>0){
         		
         		if ( data.total.voucher_type=="percentage"){
         		   html+=TPLorderRow( getTrans("Less Voucher",'less_voucher') + " " + data.total.voucher_percentage , "("+data.total.voucher_amount1 +")");
         		} else {
         		   html+=TPLorderRow( getTrans("Less Voucher",'less_voucher') , "("+data.total.voucher_amount1 +")");
         		}
         		
         		html+=TPLorderRow( getTrans("Sub Total (after less voucher)",'sub_total_after_voucher') ,  data.total.subtotal2 ,'fixed-col');
         	}
         }
         
         if (!empty(data.total.delivery_charges)){
             html+=TPLorderRow( getTrans("Delivery Fee",'delivery_fee') ,  data.total.delivery_charges );
         }
         
         if (!empty(data.total.merchant_packaging_charge)){
             html+=TPLorderRow( getTrans("Packaging",'packaging') ,  data.total.merchant_packaging_charge );
         }
                  
         if (!empty(data.total.taxable_total)){
             html+=TPLorderRow( getTrans("Tax",'tax') +" " +  data.total.tax_amt ,  data.total.taxable_total );
         }
                  
         if (!empty(data.total.cart_tip_value)){
             html+=TPLorderRow( getTrans("Tips",'tips')  ,  data.total.cart_tip_value );
         }         
     }
     
     html+='<ons-list-header class="header">';
        html+='<ons-row>';
        html+='<ons-col>'+ getTrans("Total",'total') +'</ons-col>';
        html+='<ons-col class="text-right">'+data.total.total+'</ons-col>';
        html+='</ons-row>';
     html+='</ons-list-header>';

     
     // button d2
     if ( data.status_raw=="pending"){
     	$(".actions-1").show();
     	$(".actions-2").hide();
     	$(".actions-3").hide();
     	$(".actions-4").hide();
     } else {
     	if ( data.driver_app==1){
     		
     	   $(".task_id").val( data.task_id );
     	   
     	   setStorage("icon_location", data.icon_location);
     	   setStorage("icon_driver", data.icon_driver);
     	   setStorage("driver_profilepic", data.driver_profilepic);
     	   setStorage("time_left", data.time_left);
     	  
     	   switch ( data.task_status)
     	   {
     	   	  case "unassigned":
			  case "assigned":			
			  case "declined": 
				  if (data.driver_id>0){
		     	   	  $(".assign_driver_label").html( getTrans("Re-assigned Driver",'re_assigned_driver') );
		     	   	  $("#assign_driver_label").val( getTrans("Re-assigned Driver",'re_assigned_driver') );
		     	   } else {
		     	   	  $(".assign_driver_label").html( getTrans("Assigned Driver",'assigned_driver') );
		     	   	  $("#assign_driver_label").val( getTrans("Assigned Driver",'assigned_driver') );
		     	   }     	   
		     	   
		     	   $(".actions-3").show();
     	           $(".actions-2").hide();
     	           $(".actions-1").hide();     	   
     	           $(".actions-4").hide();
			  break;
			  
			  case "acknowledged": 
			  case "started":
			  case "inprogress":
			  
			     $(".assign_driver_label").html( getTrans("Track Order",'track_order') );
		     	 $("#assign_driver_label").val( getTrans("Track Order",'track_order') );
		     	 
		     	 $(".actions-4").show();
		     	 $(".actions-3").hide();
     	         $(".actions-2").hide();
     	         $(".actions-1").hide();     	
     	              	         
     	         if ( !empty(data.task_info) ){
     	         	$(".task_lat").val( data.task_info.task_lat);
     	         	$(".task_lng").val( data.task_info.task_lng);
     	         	$(".task_address").val( data.task_info.delivery_address);
     	         }
     	         if ( !empty(data.driver_info) ){
     	         	$(".driver_lat").val( data.driver_info.location_lat);
     	         	$(".driver_lng").val( data.driver_info.location_lng);
     	         	
     	         	var driver_name='';
     	         	if (!empty(data.driver_info.first_name)){
     	         		driver_name=data.driver_info.first_name + " ";
     	         		
     	         	}
     	         	if (!empty(data.driver_info.last_name)){
     	         		driver_name+=data.driver_info.last_name;
     	         		
     	         	}
     	         	$(".driver_name").val( driver_name );
     	         	$(".driver_phone").val( data.driver_info.phone);
     	         	$(".driver_location").val( data.driver_info.formatted_address);
     	         }     	            
			  break;			  
			  
			  default:
			    $(".actions-1").hide();
     	        $(".actions-2").show();
     	        $(".actions-3").hide();
     	        $(".actions-4").hide();
			  break;
     	   }	
     	   
     	} else {
     	   $(".actions-2").show();
     	   $(".actions-1").hide();
     	   $(".actions-3").hide();
     	   $(".actions-4").hide();
     	}     	
     }
          
     createElement("order-details-item",html);     
}

function TPLorderRow(label , value, label_class)
{
	 var html='';	
	 html+='<ons-list-item>';
       html+='<ons-row>';
        html+='<ons-col class="'+label_class+'">'+label+'</ons-col>';
        html+='<ons-col class="text-right">'+value+'</ons-col>';
       html+='</ons-row>';
     html+='</ons-list-item>';
     return html
}

function displayPrice(currency_position, currency ,price)
{
	if ( currency_position=="right"){
		return price+" "+currency;
	} else {
		return currency+" "+price;
	}
}

function orderConfirm()
{
	$.validate({ 	
	    form : '#frm-acceptorder',    
	    borderColorOnError:"#FF0000",
	    onError : function() {      
	    },	   
	    onSuccess : function() {     	   	      
	      var params = $( "#frm-acceptorder").serialize();	      
	      
	      var info=getMerchantInfoStorage();	
	      params+="&token="+getStorage("merchant_token");
		  params+="&user_type="+info.user_type;
		  params+="&mtid="+info.merchant_id;	 	 
	 	 
	      callAjax("AcceptOrdes",params);	       
	      return false;
	    }  
	});	
}

function declineOrder()
{
	var order_id=$(".order_id").val();
	var trans_type=$(".trans_type").val();
	dump("order_id->"+order_id);
	dump("trans_type->"+trans_type);
	
	var options = {
      animation: 'none',
      onTransitionEnd: function() {
      	  $(".order_id").val( order_id );
      } 
   };
   kNavigator.pushPage("declineOrderForm.html", options);				
}

function declineConfirm()
{
	
	var params = $( "#frm-decline").serialize();	      	      
    var info=getMerchantInfoStorage();	
    params+="&token="+getStorage("merchant_token");
    params+="&user_type="+info.user_type;
    params+="&mtid="+info.merchant_id;	 	 
	 
    callAjax("DeclineOrders",params);	       
}

function changeOrderStatus()
{
	var order_id=$(".order_id").val();
	var trans_type=$(".trans_type").val();
	dump("order_id->"+order_id);
	dump("trans_type->"+trans_type);
	
	var options = {
      animation: 'none',
      onTransitionEnd: function() {
      	  $(".order_id").val( order_id );
      	  var info=getMerchantInfoStorage();	      	  
		  var params="&token="+getStorage("merchant_token");
		  params+="&user_type="+info.user_type;
		  params+="&mtid="+info.merchant_id;	 	 			 
		  params+="&order_id="+order_id;
		 callAjax("StatusList",params);	       
      } 
   };
   kNavigator.pushPage("changesStatus.html", options);				
		
}

function statusList(data)
{
	var htm='';
	htm+='<ons-list-header class="list-header">'+ getTrans('Select Status','select_status') +'</ons-list-header>';	
	htm+='<ons-list>';	
	$.each( data.status_list, function( key, val ) {    

		ischecked='';
		if ( key==data.status){
			ischecked='checked="checked"';
		}
		 
		htm+='<ons-list-item modifier="tappable">';
		 htm+='<label class="radio-button checkbox--list-item">';
			htm+='<input type="radio" name="status" class="status" value="'+key+'" '+ischecked+' >';
			htm+='<div class="radio-button__checkmark checkbox--list-item__checkmark"></div>';
			htm+=' '+val;
		  htm+='</label>'; 
		htm+='</ons-list-item>';
	});	
	htm+='</ons-list>';	
	
	createElement('status-list',htm);	
}

function changeStatus()
{
	$.validate({ 	
	    form : '#frm-changestatus',    
	    borderColorOnError:"#FF0000",
	    onError : function() {      
	    },	   
	    onSuccess : function() {     	   	      
	      var params = $( "#frm-changestatus").serialize();	      
	      
	      var info=getMerchantInfoStorage();	
	      params+="&token="+getStorage("merchant_token");
		  params+="&user_type="+info.user_type;
		  params+="&mtid="+info.merchant_id;
		  	 	 
	      callAjax("ChangeOrderStatus",params);	       
	      return false;
	    }  
	});	
}

function showLanguageList()
{
	if (typeof languageOptions === "undefined" || languageOptions==null || languageOptions=="" ) { 	    
		ons.createDialog('languageOptions.html').then(function(dialog) {
	        dialog.show();
	        translatePage();
	    });	
	} else {
		languageOptions.show();		
	}	
}


function displayLanguageSelection(data)
{
	var selected = getStorage("mt_default_lang");
	dump("selected=>"+selected);	
	var htm='';
	htm+='<ons-list>';
	htm+='<ons-list-header class="list-header trn" data-trn-key="language">'+ getTrans("Language",'language') +'</ons-list-header>';
	$.each( data, function( key, val ) {        		  		  
		dump(val.lang_id);
		ischecked='';
		if ( val.lang_id==selected){
			ischecked='checked="checked"';
		}
		htm+='<ons-list-item modifier="tappable" onclick="setLanguage('+"'"+val.lang_id+"'"+');">';
		 htm+='<label class="radio-button checkbox--list-item">';
			htm+='<input type="radio" name="country_code" class="country_code" value="'+val.lang_id+'" '+ischecked+' >';
			htm+='<div class="radio-button__checkmark checkbox--list-item__checkmark"></div>';
			htm+=' '+val.language_code;
		  htm+='</label>'; 
		htm+='</ons-list-item>';
	});		
	htm+='</ons-list>';	
	createElement('language-options-list',htm);	
	translatePage();
}

function setLanguage(lang_id)
{
	dump(lang_id);
	dump( getStorage("translation") );
	if (typeof getStorage("mt_translation") === "undefined" || getStorage("mt_translation")==null || getStorage("mt_translation")=="" ) { 	
	   languageOptions.hide();   
       ons.notification.confirm({
		  message: 'Language file has not been loaded, would you like to reload?',		  
		  title: dialog_title_default ,
		  buttonLabels: ['Yes', 'No'],
		  animation: 'none',
		  primaryButtonIndex: 1,
		  cancelable: true,
		  callback: function(index) {
		     if ( index==0 || index=="0"){
		     	getLanguageSettings();		     	
		     } 
		  }
		});
		return;
	}	
		
	if ( getStorage("mt_translation").length<=5 ){	
		onsenAlert("Translation file is not yet ready.");	
		return;
	}
	
	if ( !empty(lang_id) ){	   
	   setStorage("mt_default_lang",lang_id);
	   if ( !empty(translator)){
	       translator.lang(lang_id);
	   } else {
	   	   translator = $('body').translate({lang: lang_id, t: dictionary});
	   }	   
	}
}

function saveSettings()
{
	var params = $( "#frm-settings").serialize();	 
	
	var info=getMerchantInfoStorage();	
	params+="&token="+getStorage("merchant_token");
	params+="&user_type="+info.user_type;
	params+="&mtid="+info.merchant_id;
	params+="&merchant_device_id="+getStorage("merchant_device_id");
		  
	callAjax("saveSettings",params);	    
}

function viewLocation(address)
{
	dump(address);
	var options = {
      animation: 'none',
      onTransitionEnd: function() {       
      	  $("#location-address").html(address);	 
      	  var params="address="+address;
      	  callAjax("geoDecodeAddress",params);
      } 
   };
   kNavigator.pushPage("map.html", options);				
}

function initMap(data)
{
	dump(data);	
	if ( !empty(data)){
		var map = new GoogleMap();	
	    map.initialize('location-map', data.lat, data.lng , 15);
	} else {
		$("#location-map").hide();
		notyAlert("location not available",'error' );
	}
}

function forgotPassword()
{
	$.validate({ 	
	    form : '#frm-forgotpass',    
	    borderColorOnError:"#FF0000",
	    onError : function() {      
	    },	   
	    onSuccess : function() {     	   	      
	      var params = $( "#frm-forgotpass").serialize();	      
	      callAjax("ForgotPassword",params);	       
	      return false;
	    }  
	});	
}

function changePassWord()
{
    $.validate({ 	
	    form : '#frm-changepassword',    
	    borderColorOnError:"#FF0000",
	    onError : function() {      
	    },	   
	    onSuccess : function() {     	   	      
	      var params = $( "#frm-changepassword").serialize();	      
	      callAjax("ChangePasswordWithCode",params);	       
	      return false;
	    }  
	});	
}

function viewHistory()
{
   var order_id=$("#order_id").val();
    dump(order_id);
        
    
	var options = {
      animation: 'none',
      onTransitionEnd: function() {    
      	 $(".order-history-title").html('Getting history...');
      	 var info=getMerchantInfoStorage();	
      	 var params='';
			 params+="&token="+getStorage("merchant_token");
			 params+="&user_type="+info.user_type;
			 params+="&mtid="+info.merchant_id;
			 params+="&order_id="+order_id;      	 
	     callAjax("OrderHistory",params);	             	   	     	
      } 
   };
   kNavigator.pushPage("orderHistory.html", options);				
}

function displayHistory(data)
{
	var htm='<ons-list-header class="header">';
	htm+='<ons-row>';
	  htm+='<ons-col class="fixed-col">'+ getTrans("Date/Time",'date_time')  +'</ons-col>';
	  htm+='<ons-col class="fixed-col">'+ getTrans("Status",'status') +'</ons-col>';
	  htm+='<ons-col class="fixed-col">'+ getTrans("Remarks",'remarks') +'</ons-col>';
	htm+='</ons-row>';
	htm+='</ons-list-header>';
	
	$.each( data, function( key, val ) {
		
		htm+='<ons-list-item>';
		   htm+='<ons-row>';
			htm+='<ons-col class="fixed-col">'+val.date_created+'</ons-col>';
			htm+='<ons-col class="fixed-col"><span class="status margin2 '+val.status_raw+' " >'+val.status+'</span></ons-col>';
			htm+='<ons-col class="fixed-col">'+val.remarks+'</ons-col>';
		  htm+='</ons-row>';
		htm+='</ons-list-item>';
		
	});
		
	createElement('order-history',htm);
}

function saveProfile()
{
	$.validate({ 	
	    form : '#frm-profile',    
	    borderColorOnError:"#FF0000",
	    onError : function() {      
	    },	   
	    onSuccess : function() {     	   	      
	      var params = $( "#frm-profile").serialize();		      
	      var info=getMerchantInfoStorage();	      	 
		  params+="&token="+getStorage("merchant_token");
		  params+="&user_type="+info.user_type;
		  params+="&mtid="+info.merchant_id;		  
	      callAjax("saveProfile",params);	       
	      return false;
	    }  
	});	
}

function getLanguageSettings()
{
	if ( !hasConnection() ){
		return;
	}	
	//callAjax("getLanguageSettings",'');	
	var action = 'getLanguageSettings';	
	var params='';
	
	dump("Action=>"+action);
	dump(ajax_url+"/"+action+"?"+params);
	
	 var ajax_request2 = $.ajax({
	 url: ajax_url+"/"+action, 
	 data: params,
	 type: 'post',                  
	 async: false,
	 dataType: 'jsonp',
	 timeout: 6000,
	 crossDomain: true,
	 beforeSend: function() {
		if(ajax_request2 != null) {			 	
		   /*abort ajax*/
		   hideAllModal();	
           ajax_request2.abort();
		} else {    
			/*show modal*/			   
			switch(action)
			{
				case "none":
				   break;				
				default:
				   kloader.show();
				   break;
			}
		}
	},
	complete: function(data) {					
		ajax_request2=null;   	     				
		hideAllModal();				
	},
	success: function (data) {	  
	     if (data.code==1){
	     	  dump('getLanguageSettings OK');	     	 
	     	  setStorage("mt_translation",JSON.stringify(data.details.translation));			      
		      var device_set_lang=getStorage("mt_default_lang");
		      dump("device_set_lang=>"+device_set_lang);
		      
		      if (empty(device_set_lang)){
		       	   dump('proceed');
			       if(!empty(data.details.settings.default_lang)){			       	  
			          setStorage("mt_default_lang",data.details.settings.default_lang);
			       } else {
			       	  setStorage("mt_default_lang","");
			       }			
		       }			       
		       translatePage();	 	     	 
	     }
    },
	error: function (request,error) {	        
		hideAllModal();				
	}
   });       			
}

function translatePage()
{
	dump("TranslatePage Functions");				
	if (typeof getStorage("mt_translation") === "undefined" || getStorage("mt_translation")==null || getStorage("mt_translation")=="" ) { 	   
		return;		
	} else {
		dictionary =  JSON.parse( getStorage("mt_translation") );
	}
	if (!empty(dictionary)){
		dump(dictionary);		
		var default_lang=getStorage("mt_default_lang");
		dump(default_lang);
		if (default_lang!="undefined" && default_lang!=""){
			dump("INIT TRANSLATE");
			translator = $('body').translate({lang: default_lang, t: dictionary});
			translateValidationForm();
	        translateForms();
		} 
	}				
}

function getTrans(words,words_key)
{
	var temp_dictionary='';
	/*dump(words);
	dump(words_key);	*/
	if (getStorage("mt_translation")!="undefined"){
	   temp_dictionary =  JSON.parse( getStorage("mt_translation") );
	}
	if (!empty(temp_dictionary)){
		//dump(temp_dictionary);		
		var default_lang=getStorage("mt_default_lang");
		//dump(default_lang);
		if (default_lang!="undefined" && default_lang!=""){
			//dump("OK");
			if ( array_key_exists(words_key,temp_dictionary) ){
				//dump('found=>' + words_key +"=>"+ temp_dictionary[words_key][default_lang]);				
				if(!empty(temp_dictionary[words_key][default_lang])){
				   return temp_dictionary[words_key][default_lang];
				}
			}
		}
	}	
	return words;
}

function array_key_exists(key, search) {  
  if (!search || (search.constructor !== Array && search.constructor !== Object)) {
    return false;
  }
  return key in search;
}

function translateValidationForm()
{
	$.each( $(".has_validation") , function() { 
		var validation_type = $(this).data("validation");
		
		switch (validation_type)
		{
			case "number":			
			$(this).attr("data-validation-error-msg",getTrans("The input value was not a correct number",'validation_numeric') );
			break;
			
			case "required":
			$(this).attr("data-validation-error-msg",getTrans("this field is mandatory!",'validaton_mandatory') );
			break;
			
			case "email":
			$(this).attr("data-validation-error-msg",getTrans("You have not given a correct e-mail address!",'validation_email') );
			break;
		}
		
	});
}

function translateForms()
{	
	var t='';
	$.each( $(".text-input") , function() { 
		var placeholder = $(this).attr("placeholder");			
		t = getTrans(placeholder, $(this).data("trn-key") );
	    $(this).attr("placeholder",t);
	});	
}

function showNotification(title, message, order_id)
{				
	if ( !isLogin() ){		
		return;
	}
	if (typeof pushDialog === "undefined" || pushDialog==null || pushDialog=="" ) { 	    
		ons.createDialog('pushNotification.html').then(function(dialog) {
			$(".push-title").html(title);
	        $(".push-message").html(message);
	        dialog.show();
	        $("#order_id").val( order_id );
	    });	
	} else {
		$(".push-title").html(title);
	    $(".push-message").html(message);
	    $("#order_id").val( order_id );
		pushDialog.show();
	}	
}

function showNotificationCampaign(title,message)
{			
	if ( !isLogin() ){
		return;
	}
	if (typeof pushcampaignDialog === "undefined" || pushcampaignDialog==null || pushcampaignDialog=="" ) { 	    
		ons.createDialog('pushNotificationCampaign.html').then(function(dialog) {
			$("#page-notificationcampaign .push-title").html(title);
	        $("#page-notificationcampaign .push-message").html(message);
	        dialog.show();
	    });	
	} else {
		$("#page-notificationcampaign .push-title").html(title);
	    $("#page-notificationcampaign .push-message").html(message);
		pushcampaignDialog.show();
	}	
}

function setHome2()
{	
	pushDialog.hide();
    var options = {     	  		  
  	   closeMenu:true,
       animation: 'slide'       
    };	   	   	   
    menu.setMainPage('home.html',options);
}

function isLogin()
{
	if (!empty(getStorage("merchant_token"))){
		return true;
	}
	return false;
}

function showNotificationPage()
{
   var options = {
      animation: 'none',
      onTransitionEnd: function() {    
      	
      	  clearBadge(); 
      	  
      	  var params='';  
      	  var info=getMerchantInfoStorage();	      	 
		  params+="&token="+getStorage("merchant_token");
		  params+="&user_type="+info.user_type;
		  params+="&mtid="+info.merchant_id;		  
	      callAjax("getNotification",params);	       
	      return false;	 	      	 
      } 
   };
   kNavigator.pushPage("showNotification.html", options);				
}

function displayNotification(data)
{
	var htm='';
	$.each( data, function( key, val ) {        	
		  
		  /*if ( val.push_type=="order"){
		  	  var action='onclick="viewOrder('+val.order_id+')" ';
		  } else {
		  	
		  	  var str = nl2br(val.push_message);              
		  	  var campaign="'"+val.push_title+"',"+"'"+ str +"'" ;
		  	  var action='onclick="showNotificationCampaign('+campaign+')" ';
		  }*/
		  		  		 
		  htm+='<ons-list-item modifier="tappable" class="notification-action" data-text="'+val.push_message+'" data-type="'+val.push_type+'" data-orderid="'+val.order_id+'" data-bookingid="'+val.booking_id+'" data-title="'+val.push_title+'" >';
            htm+='<ons-row>';
              htm+='<ons-col width="90px" class="fixed-col" >';
              htm+=val.date_created
              htm+='</ons-col>';
              htm+='<ons-col class="fixed-col" >';
              htm+=val.push_title
              htm+='</ons-col>';
            htm+='</ons-row>';
         htm+='</ons-list-item>';
	});	
	createElement('notification',htm);
}

function pullNotification(done)
{	
	dump('pull');
	
	if ( !hasConnection() ){
		notyAlert(  getTrans("CONNECTION LOST",'connection_lost'),'error' );
		done();
		return;
	}
				
	var action= 'getNotification';
	var div_id= 'notification';
	
	var info=getMerchantInfoStorage();	
	var params="token="+getStorage("merchant_token");
	params+="&user_type="+info.user_type;
	params+="&mtid="+info.merchant_id;
	params+="&lang_id="+getStorage("mt_default_lang");

	if(!empty(krms_config.APIHasKey)){
		params+="&api_key="+krms_config.APIHasKey;
	}
	
	dump(ajax_url+"/"+action+"/?"+params);	    
	
    ajax_request = $.ajax({
	 url: ajax_url+"/"+action, 
	 data: params,
	 type: 'post',                  
	 async: false,
	 dataType: 'jsonp',
	 timeout: 5000,
	 crossDomain: true,
	 beforeSend: function() {
		if(ajax_request != null) {			 	
		   /*abort ajax*/
		   hideAllModal();	
           ajax_request.abort();
		} 
	},
	complete: function(data) {					
		ajax_request=null;  		
	},
	success: function (data) {	  
		dump(data);
		done();
		if (data.code==1){					
			displayNotification(data.details);	
		} else if(data.code==3){
			notyAlert(data.msg,"error");					
		} else {
			// failed response
			notyAlert(data.msg,"error");
		}
	},
	error: function (request,error) {	        
				
	}
   });       				
}

function showSearchPopUp()
{
	if (typeof SearchPopUpDialog === "undefined" || SearchPopUpDialog==null || SearchPopUpDialog=="" ) { 
		ons.createDialog('SearchPopUp.html').then(function(dialog) {			
	        dialog.show();
	    });	
	} else {		
		$(".order_id_customername").val('');
		SearchPopUpDialog.show();
	}	
}

function searchOrder()
{
	$.validate({ 	
	    form : '#frm-search',    
	    borderColorOnError:"#FF0000",
	    onError : function() {      
	    },	   
	    onSuccess : function() {     	   	      	      
	      SearchPopUpDialog.hide();	      
	      var options = {
           animation: 'none',
		      onTransitionEnd: function() {    
		      	  var params = $( "#frm-search").serialize();
			      var info=getMerchantInfoStorage();	      	 	      
				  params+="&token="+getStorage("merchant_token");
				  params+="&user_type="+info.user_type;
				  params+="&mtid="+info.merchant_id;		  
			      callAjax("searchOrder",params);
		      } 
		   };
		   kNavigator.pushPage("searchResults.html", options);				
	      
	      return false;
	    }  
	});	
}

function deviceBackButton()
{
	ons.notification.confirm({
	  message: getTrans('Do you want to logout?','do_you_want_to_logout') ,	  
	  title: dialog_title_default ,
	  buttonLabels: [ getTrans('Yes','yes') ,  getTrans('No','no') ],
	  animation: 'default', // or 'none'
	  primaryButtonIndex: 1,
	  cancelable: true,
	  callback: function(index) {
	  	   //alert(index);
	  	   // -1: Cancel
           // 0-: Button index from the left           
	  	   if (index==0){
	  	   	   removeStorage("merchant_token");
               removeStorage("merchant_info");
               kNavigator.popPage();
	  	   }
	  }
	});
}

function loadTable(done)
{	
	dump('pull');
	
	if ( !hasConnection() ){
		notyAlert(  getTrans("CONNECTION LOST",'connection_lost'),'error' );
		done();
		return;
	}
					
	var action= $(".tab-action").val();	
	var div_id= $(".display-div").val();
	
	var info=getMerchantInfoStorage();	
	var params="token="+getStorage("merchant_token");
	params+="&user_type="+info.user_type;
	params+="&mtid="+info.merchant_id;	
	params+="&lang_id="+getStorage("mt_default_lang");
		
    if(!empty(krms_config.APIHasKey)){
		params+="&api_key="+krms_config.APIHasKey;
	}
	
	dump(ajax_url+"/"+action+"/?"+params); 	
	
    ajax_request = $.ajax({
	 url: ajax_url+"/"+action, 
	 data: params,
	 type: 'post',                  
	 async: false,
	 dataType: 'jsonp',
	 timeout: 5000,
	 crossDomain: true,
	 beforeSend: function() {
		if(ajax_request != null) {			 	
		   /*abort ajax*/
		   hideAllModal();	
           ajax_request.abort();
		} 
	},
	complete: function(data) {					
		ajax_request=null;  		
	},
	success: function (data) {	  
		dump(data);
		done();
		if (data.code==1){					
			displayBooking(data.details,div_id);			
		} else if(data.code==3){
									
		} else {
			// failed response
			notyAlert(data.msg,"error");
		}
	},
	error: function (request,error) {	        
				
	}
   });       				
}

function displayBooking(data,div_id)
{
	var html='';
	$.each( data, function( key, val ) {        

		var icon=getBookingIcons(val.status_raw);
		 
		html+='<ons-list-item modifier="tappable" onclick="viewBooking('+val.booking_id+')">';
          html+='<ons-row>';
                       
             html+='<ons-col width="50%"   class="fixed-col" >';
             html+='<b>Booking #</b>' + val.booking_id +'<br/>';
             html+=val.date_of_booking
             html+='<p class="status margin2 '+val.status_raw+' ">';
	             //html+='<ons-icon class="icon '+icon.classname+'" icon="'+icon.icons+'"></ons-icon>';
	             html+=' '+val.status;
	             if ( val.viewed==1){
	                html+= '&nbsp;<span class="new-tags">'+ getTrans('new','new') +'</span>'
	             }
	             html+='</p>';
             html+='</ons-col>';      
             
             html+='<ons-col width="38%" class="fixed-col " >';
             html+=val.booking_name;
             html+='</ons-col >';               
                  
             html+='<ons-col class="fixed-col text-right" > ';
             html+= '<b>'+val.number_guest+'</b> ';
             html+='<ons-icon icon="'+ getBookingGuestIcon(val.number_guest) +'"></ons-icon>';
             html+='</ons-col> ';
             
          html+='</ons-row>';
       html+='</ons-list-item>';
	});	
	
	createElement(div_id,html);
}

function getBookingIcons(status_raw)
{
    icons='fa-exclamation-triangle';
	icons2='';
	switch (status_raw)
	{
		case "denied":
	    icons='ion-close-circled';
	    icons2='icon-red';
		break;
		
		case "approved":
		icons='ion-checkmark-round';
		icons2='icon-green';
		break;
						
		case "pending":
		icons='fa-exclamation-triangle';
		icons2='icon-orange';
		break;
		
		default:
		icons='fa-exclamation-triangle';
		icons2='icon-orange';
		break;
		
	}
	return {
		'icons':icons,
		'classname':icons2
	};
}

function getBookingGuestIcon(number_guest)
{
	icon='ion-android-contact';
	if ( number_guest>1){
		icon='ion-android-contacts';
	} 
	return icon;
}

var view_booking_page_bol;

function viewBooking(booking_id)
{	
	
	dump("view_booking_page_bol->"+view_booking_page_bol);
	if (empty(view_booking_page_bol)){
		dump('view_booking_page_bol');
		view_booking_page_bol=true;
	} else {
		return;
	}
	
    var options = {
      animation: 'slide',
      onTransitionEnd: function() {                     	  
      	  $("#booking-view-title").html( getTrans("Getting booking details","getting_booking") +"..." );
      	  var info=getMerchantInfoStorage();	
		  var params="token="+getStorage("merchant_token");
		  params+="&user_type="+info.user_type;
		  params+="&mtid="+info.merchant_id;
		  params+='&booking_id='+booking_id
		  callAjax("GetBookingDetails",params);
      } 
    };
    kNavigator.pushPage("bookingView.html", options);					
}

function displayBookingDetails(data)
{
	if ( data.status_raw=="pending"){
		$(".booking-action").show();
	} else {
		$(".booking-action").hide();
	}
	
	dump(data);
	var html='';
	
	$("#booking_id").val( data.booking_id);
	$("#booking_status").val( data.status_raw);
	
	var icon=getBookingIcons(data.status_raw);
	
	var html='<ons-list-header class="header">';
        html+='<ons-row>';        
        //html+='<ons-icon class="icon '+icon.classname+'" icon="'+icon.icons+'"></ons-icon>';
        //html+='&nbsp;&nbsp;'+data.status
        html+='<span class="status margin2 '+data.status_raw+' ">'+data.status+'</span>';
        html+='</ons-row>';
     html+='</ons-list-header>';
     
      if ( !empty(data.booking_name)){
	     html+='<ons-list-item>';
	       html+='<ons-icon icon="ion-person"></ons-icon> '+ data.booking_name;
	     html+='</ons-list-item>';
      }
     
       if ( !empty(data.email)){
	     html+='<ons-list-item>';
	       html+='<ons-icon icon="ion-ios-email"></ons-icon> '+ data.email;
	     html+='</ons-list-item>';
       }

     if ( !empty(data.mobile)){
	     html+='<ons-list-item>';
	     //html+='<ons-icon icon="ion-ios-telephone"></ons-icon> '+data.mobile;
	     html+='<ons-icon icon="ion-ios-telephone"></ons-icon> <a href="tel:'+data.mobile+'">'+ data.mobile+"</a>";
	     html+='</ons-list-item>';
     }
     
     if ( !empty(data.booking_notes)){
	     html+='<ons-list-item>';
	     html+='<ons-icon icon="ion-ios-chatbubble-outline"></ons-icon> '+data.booking_notes;
	     html+='</ons-list-item>';
     }
     
     if ( !empty(data.transaction_date)){
	     html+='<ons-list-item>';
	     html+='<ons-icon icon="ion-calendar"></ons-icon> '+data.transaction_date;
	     html+='</ons-list-item>';
     }
     
     html+='<ons-list-header class="header">';
        html+='<ons-row>';
        html+= getTrans( 'Details','details' ) ;        
        html+='</ons-row>';
     html+='</ons-list-header>';
     
     html+=TPLorderRow( getTrans("Number Of Guests",'number_of_guest') , data.number_guest);
     html+=TPLorderRow( getTrans("Date Of Booking",'date_of_booking') , data.date_booking);
     html+=TPLorderRow( getTrans("Time",'time') , data.booking_time);
                
	 createElement('booking-details',html);
}

function bookingApproved()
{	
	var booking_id= $("#booking_id").val();	
	 var options = {
      animation: 'none',
      onTransitionEnd: function() {        
      	  $(".booking-form-title").html( getTrans("Booking #", 'booking_nos') +" "+ booking_id);    	 
      	  $(".booking-btn").html( getTrans("Accept & Confirm", 'accept_n_confirm') );      	  
      	  $(".booking-notes").html( getTrans( "will send a booking confirmation to your customer",'booking_confirm_msg') );
      	  
      	  $(".booking_id").val( booking_id );
      	  $(".status").val( 'approved' );
      } 
    };
    kNavigator.pushPage("bookingForm.html", options);		
}

function bookingDenied()
{	
	var booking_id=$("#booking_id").val();	
	var options = {
      animation: 'none',
      onTransitionEnd: function() {               
      	  $(".booking-form-title").html( getTrans("Booking #", 'booking_nos') +" "+ booking_id);    	 
      	  $(".booking-btn").html( getTrans("Decline Booking", 'decline_booking') );      	  
      	  $(".booking-notes").html( getTrans( "will send an email to your customer",'booking_denied_msg') );
      	  $(".booking_id").val( booking_id );
      	  $(".status").val( 'denied' );
      } 
    };
    kNavigator.pushPage("bookingForm.html", options);		
}

function bookingChangeStats()
{
	$.validate({ 	
	    form : '#frm-booking',    
	    borderColorOnError:"#FF0000",
	    onError : function() {      
	    },	   
	    onSuccess : function() {     	   	      
	      var params = $( "#frm-booking").serialize();	      
	      
	      var info=getMerchantInfoStorage();	
	      params+="&token="+getStorage("merchant_token");
		  params+="&user_type="+info.user_type;
		  params+="&mtid="+info.merchant_id;	 	 
	 	 
	      callAjax("bookingChangeStats",params);	       
	      return false;
	    }  
	});	
}

function setHomeBooking()
{	
	dump('setHomeBooking');
    var options = {     	  		  
  	   closeMenu:true,
       animation: 'none',       
    };	   	   	    
    
    var pages = kNavigator.getPages();     
    if ( pages.length<=1){
    	kNavigator.resetToPage("slidemenu.html", options);	
    } else {
    	menu.setMainPage('home.html',options);
    }      
}

jQuery(document).ready(function() {	
	dump('jquery ready');	
	$( document ).on( "click", ".notification-action", function() {
		 var push_type= $(this).data("type");
		 dump( push_type );
		 if ( push_type=="order"){
		 	 viewOrder( $(this).data("orderid") );
		 } else if ( push_type =="booking" ) {
		    viewBooking( $(this).data("bookingid")  );
		 } else {
		 	showNotificationCampaign( $(this).data("title") ,  $(this).data("text"));
		 }		 
	});
});

function viewOrders()
{
	pushDialog.hide();
	var order_id= $("#order_id").val();	
	viewOrder(order_id);
}

function showNotificationBooking(title, message, booking_id)
{				
	if ( !isLogin() ){		
		return;
	}
	if (typeof pushDialogBooking === "undefined" || pushDialogBooking==null || pushDialogBooking=="" ) { 	    
		ons.createDialog('pushNotificationBooking.html').then(function(dialog) {
			$(".push-title").html(title);
	        $(".push-message").html(message);
	        dialog.show();
	        $("#booking_id").val( booking_id );
	    });	
	} else {
		$(".push-title").html(title);
	    $(".push-message").html(message);
	    $("#booking_id").val( booking_id );
		pushDialogBooking.show();
	}	
}

function viewBookings(booking_id)
{
	pushDialogBooking.hide();
	var booking_id= $("#booking_id").val();	
	viewBooking(booking_id);
}

function initMobileScroller()
{
	if ( $('.mobiscroll_time').exists()){		
		$('.mobiscroll_time').mobiscroll().time({
			theme: 'android-holo-light', 
			mode: "scroller",
			display: "modal",
			dateFormat : "yy-mm-dd",
			/*timeFormat:"HH:ii",
			timeWheels:"HHii"*/
		});
	}
}

function isDebug()
{	
	//return true;	
	return false;
}

function toastMsg( message )
{		
	if (isDebug()){
		onsenAlert( message );
		return ;
	}
		   
    window.plugins.toast.showWithOptions(
      {
        message: message ,
        duration: "long",
        position: "bottom",
        addPixelsY: -40 
      },
      function(args) {
      	
      },
      function(error) {
      	onsenAlert( message );
      }
    );
}

/*MEDIA SOUNDS STARTS HERE*/

var my_media;

function playNotification()
{	 
	 var sound_url= "file:///android_asset/www/audio/fb-alert.mp3";
	 dump(sound_url);
	 if(!empty(sound_url)){
        playAudio(sound_url);
	 }
}

function playAudio(url) {    
    my_media = new Media(url,
        // success callback
        function () {
            dump("playAudio():Audio Success");
            my_media.stop();
            my_media.release();
        },
        // error callback
        function (err) {
            dump("playAudio():Audio Error: " + err);
        }
    );    
    my_media.play();
}

function stopNotification()
{
	my_media.stop();
    my_media.release();
}
/*MEDIA SOUNDS ENDS HERE*/

function assignDriver()
{	
	var options = {
      animation: 'none',
      onTransitionEnd: function() {       
      	  $(".assign-driver-title").html( getTrans('Assigned Driver','assigned_driver') + 
      	  " - " + getTrans('Order No','order_no') +":"+ $(".order_id").val() );
      	  
      	  $(".task_id").val( $(".task_id").val() );
      } 
    };
    kNavigator.pushPage("assignDriver.html", options);	
}

function showTeamList()
{
	if (typeof teamListDialog === "undefined" || teamListDialog==null || teamListDialog=="" ) {
		ons.createDialog('teamList.html').then(function(dialog) {					   	
		   var info=getMerchantInfoStorage();		
	       params="mtid="+info.merchant_id;    
	       callAjax("loadTeamList",params);       
	       teamListDialog.show();	
	       translatePage();
	    });	
	} else {				
		var info=getMerchantInfoStorage();		
	    params="mtid="+info.merchant_id;    
	    callAjax("loadTeamList",params);       
	    teamListDialog.show();
	}	
}

function showDriverList()
{
	if ( $(".team_id").val()==""){
		toastMsg( getTrans('Please select a team','select_team')  );
		return;
	}
	if (typeof driverListDialog === "undefined" || driverListDialog==null || driverListDialog=="" ) {
		ons.createDialog('driverList.html').then(function(dialog) {			
			
		   var info=getMerchantInfoStorage();	
		   params="mtid="+info.merchant_id;    
		   params+="&team_id="+$(".team_id").val();
	       callAjax("driverList",params);       
	       
		   driverListDialog.show();
		   translatePage();
	    });	
	} else {		
		var info=getMerchantInfoStorage();	
	    params="mtid="+info.merchant_id;    
	    params+="&team_id="+$(".team_id").val();
        callAjax("driverList",params);       
	       
		driverListDialog.show();
	}	
}

function displayTeamList(data)
{
	dump(data);
	var html='';
	if ( data.length>=1){   	  
		$.each( data, function( key, val ) {    
			 dump(val);
			 //onclick="setLanguage('+"'"+val.lang_id+"'"+');"
			 html+='<ons-list-item modifier="tappable" onclick="setTeam('+val.team_id+', '+"'"+val.team_name+"'"+' );" >';
             html+=val.team_name;
             html+='</ons-list-item>';
		});	
		createElement("team-list",html);
	}
}

function setTeam(team_id, team_name)
{
	$(".team_id").val( team_id );
	$(".team_selected").html( team_name );
	teamListDialog.hide();
}

function displayDriverList(data)
{
	dump(data);
	var html='';
	if ( data.length>=1){   	  
		$.each( data, function( key, val ) {    
			 dump(val);			 
			 driver_name=val.first_name +" "+ val.last_name;
			 html+='<ons-list-item modifier="tappable" onclick="setDriver('+val.driver_id+', '+"'"+driver_name+"'"+' );" >';
             html+=driver_name;
             html+='</ons-list-item>';
		});	
		createElement("driver-list",html);
	}
}

function setDriver(driver_id, driver_name)
{
	$(".driver_id").val( driver_id );
	$(".driver_selected").html( driver_name );
	driverListDialog.hide();
}

function assignTask()
{	
	$.validate({ 	
	    form : '#frm-assigntask',    
	    borderColorOnError:"#FF0000",
	    onError : function() {      
	    },	   
	    onSuccess : function() {     	   	      
	      var info=getMerchantInfoStorage();	
	      var params = $( "#frm-assigntask").serialize();	   	      
	      params+="&mtid="+info.merchant_id;       
	      params+="&order_id="+$(".order_id").val();
	      callAjax("assignTask",params);	       
	      return false;
	    }  
	});	
}

function viewLocationNew(lat, lng, address)
{
	dump(lat); dump(lng); dump(address);
	setStorage("map_lat", lat );
	setStorage("map_lng", lng );
	setStorage("map_address", address );
	setStorage("map_actions",'view_location');
	
	var options = {
      animation: 'none',
      onTransitionEnd: function() {
      	  $(".map_title").html( getTrans("Location",'location') );
      	  InitMap();
      } 
   };
   kNavigator.pushPage("map.html", options);
}

function TrackOrder()
{
	dump('TrackOrder');
		
	setStorage("map_lat", $(".task_lat").val() );
	setStorage("map_lng", $(".task_lng").val() );
	setStorage("map_address", $(".task_address").val() );
	
	setStorage("driver_lat", $(".driver_lat").val() );
	setStorage("driver_lng", $(".driver_lng").val() );
	setStorage("driver_name", $(".driver_name").val() );
	setStorage("driver_phone", $(".driver_phone").val() );
	setStorage("driver_location", $(".driver_location").val() );
	
	setStorage("map_actions",'track_order');
	
	var options = {
      animation: 'none',
      onTransitionEnd: function() {
      	  $(".map_title").html( getTrans("Track Order",'track_order') );
      	  InitMap();
      } 
   };
   kNavigator.pushPage("map.html", options);
}

function InitMap()
{	
	if (empty(getStorage("map_lat"))){
		toastMsg( getTrans("Invalid coordinates",'invalid_coordinates') );
		return;
	}
	
	kloader.show();		
	var map_actions =  getStorage("map_actions");
	
	//alert(map_actions);
	
	
	var div = document.getElementById("map_canvas_div");
	$('#map_canvas_div').css('height', $(window).height() - $('#map_canvas_div').offset().top);
	
	setTimeout(function(){ 
				 
	     /*alert(getStorage("map_lat"));
	     alert(getStorage("map_lng"));*/
	     
	     if (!isDebug()){
	        var location = new plugin.google.maps.LatLng( getStorage("map_lat") , getStorage("map_lng") ); 
	     }
	     
	     switch ( map_actions )
	     {
	     	case "view_location":
	     	  dump("view_location");
	     	  
	     	  $(".map-bottom-wrapper").hide();
	     	  
	     	  if (!isDebug()){
		     	  map = plugin.google.maps.Map.getMap(div, {     
			         'camera': {
			         'latLng': location,
			         'zoom': 17
			        }
			      });
			      			      
			      map.setBackgroundColor('white');
			      map.clear();	
	        	  map.off();
	        	  map.setCenter(location);
	        	  map.setZoom(17);
	        	     
			      map.addEventListener(plugin.google.maps.event.MAP_READY, function(map) {
			      	 
	        	     map.addMarker({
	        	     	 'position': location ,
						  'title': getStorage("map_address") ,
						 'snippet': getTrans( "Delivery ddress" ,'delivery_address'),
						  }, function(marker) {						  	
						     marker.showInfoWindow();
						     marker.setAnimation(plugin.google.maps.Animation.BOUNCE);
	        	         }
	        	     );
	        	     
			     });
	     	  }
	     	
	     	break;
	     		     	
	     	case "track_order":
	     	   
	     	   $(".map-bottom-wrapper").show();
	     	
	     	   /*alert( getStorage("driver_lat") );
	     	   alert( getStorage("driver_lng") );*/
	     	   
	     	   $(".driver_avatar").attr("src", getStorage("driver_profilepic") );
	     	   $("._driver_name").html( getStorage("driver_name") );
	     	   $(".call_driver").attr("href","tel:"+ getStorage("driver_phone") );
	     	   
	     	   if(!empty(getStorage("time_left"))){
	     	      $(".time_left").html( getStorage("time_left") );
	     	   } 
	     	   
	     	   if (!isDebug()){
	     	   	  
	     	   	  var driver_location = new plugin.google.maps.LatLng( getStorage("driver_lat") , getStorage("driver_lng") ); 
	     	   	  map = plugin.google.maps.Map.getMap(div, {     
			         'camera': {
			         'latLng': location,
			         'zoom': 17
			        }
			      });			      
			      map.setBackgroundColor('white');
			      
			      map.clear();	
        	      map.off();
        	      map.setCenter(location);
        	      map.setZoom(17);	
			      
			      map.addEventListener(plugin.google.maps.event.MAP_READY, function(map) {			      	  
	        	      
	        	       var data = [      
						 { 
					        'title': getStorage("driver_location") ,
					        'position': driver_location ,
					        'snippet': getTrans( "Driver Location" ,'driver_location'),
					        'icon': {
						       'url': getStorage("icon_driver")
						    }
					      },{ 
					        'title': getStorage("map_address") ,   
					        'position': location ,
					        'snippet': getTrans( "Delivery Address" ,'delivery_address'),
					        'icon': {
						       'url': getStorage("icon_location")
						    }
					      }  
					   ];
					   
					   addMarkers(data, function(markers) {       	    	
					    	map.addPolyline({
							points: [
							  driver_location,
							  location
							],
							'color' : '#AA00FF',
							'width': 10,
							'geodesic': true
							}, function(polyline) {
							   
								 map.animateCamera({
								 	  'target': driver_location ,
								 	  'zoom': 17,
								 	  'tilt': 30
								 }); 
								
							});   							   					    	
					    });
	        	       		      	
			      });			      
	     	   }
	     	break;
	     	
	     	default:
	     	 toastMsg(  getTrans("Undefined map action",'undefined_map_action') );
	     	break;
	     }
	     	     
		 hideAllModal();		
	}, 500); 
	
}

function addMarkers(data, callback) {
  var markers = [];
  function onMarkerAdded(marker) {
    markers.push(marker);
    if (markers.length === data.length) {
      callback(markers);
    }
  }
  data.forEach(function(markerOptions) {
    map.addMarker(markerOptions, onMarkerAdded);
  });
}

function setButtonTask()
{
	dump('setButtonTask');	
	var task_id=$(".task_id").val();
	if (task_id>0){
	    $(".assign_driver_label").html( $("#assign_driver_label").val() );
	}
}

function setButtonTask2()
{	
	kNavigator.popPage({cancelIfRunning: true});
	setButtonTask();
}

function loadBooking(done)
{
	dump('pull');
	
	if ( !hasConnection() ){
		notyAlert(  getTrans("CONNECTION LOST",'connection_lost'),'error' );
		done();
		return;
	}
					
	var action= "PendingBookingTab";
	var div_id= 'newbooking-list';
	
	var info=getMerchantInfoStorage();	
	var params="token="+getStorage("merchant_token");
	params+="&user_type="+info.user_type;
	params+="&mtid="+info.merchant_id;	
	params+="&lang_id="+getStorage("mt_default_lang");
		
    if(!empty(krms_config.APIHasKey)){
		params+="&api_key="+krms_config.APIHasKey;
	}
	
	dump(ajax_url+"/"+action+"/?"+params); 	
	
    ajax_request = $.ajax({
	 url: ajax_url+"/"+action, 
	 data: params,
	 type: 'post',                  
	 async: false,
	 dataType: 'jsonp',
	 timeout: 5000,
	 crossDomain: true,
	 beforeSend: function() {
		if(ajax_request != null) {			 	
		   /*abort ajax*/
		   hideAllModal();	
           ajax_request.abort();
		} 
	},
	complete: function(data) {					
		ajax_request=null;  		
	},
	success: function (data) {	  
		dump(data);
		done();
		if (data.code==1){					
			displayBooking(data.details,div_id);			
		} else if(data.code==3){
									
		} else {
			// failed response
			$("#newbooking-list").html('');
			notyAlert(data.msg,"error");
		}
	},
	error: function (request,error) {	        
				
	}
   });       				
}

function OrderRefresh()
{
	dump('OrderRefresh()');
	var tab_action = $("#display-div").val();
	dump(tab_action);
	switch (tab_action)
	{
		case "new-orders":
		GetTodaysOrder();
		break;
		
		case "pending-orders":
		getPendingOrders();
		break;
		
		case "allorders-orders":
		getGetAllOrders();
		break;
		
		case "booking-pending":		
          var info=getMerchantInfoStorage();	      	 
	      var params='';
		  params+="&token="+getStorage("merchant_token");
		  params+="&user_type="+info.user_type;
		  params+="&mtid="+info.merchant_id;		  
	      callAjax('PendingBookingTab',params);
	      translatePage(); 	   	
		break;
	}
}

function foodOptions(action)
{
	switch(action){
		case 1:
		if ( food_option_not_available.isChecked()){
		   food_option_not_available_disabled.setChecked(false);
		}	
		break;
		
		case 2:
		if ( food_option_not_available_disabled.isChecked()){
		   food_option_not_available.setChecked(false);	
		}
		break;
	}
}

function showNotificationBadge(counter)
{	
	var badge_count=0;
	
	if (empty(getStorage("badge_count"))){
		setStorage("badge_count",0);
		badge_count=0;
	}
	
	if (isNaN(getStorage("badge_count"))){			
		setStorage("badge_count",1);
		badge_count=1;
	} else {
		badge_count=parseInt(getStorage("badge_count")) + parseInt(counter);	
		setStorage("badge_count", badge_count );
	}
		
	
	if ( badge_count>0 ){			   
		$(".notification-count").css({ "display":"inline-block","position":"absolute","margin-left":"-8px" });
		$(".notification-count").text(badge_count);
	} else {
		$(".notification-count").hide();
	}
}

function clearBadge()
{
	removeStorage("badge_count");
	$(".notification-count").hide();
}