/**
Karenderia Order Taking App
Version 1.0.3
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
	        	
	        	switch (data.additionalData.additionalData.push_type)
	        	{
	        		case "order":
	        		showNotification( data.title,data.message, data.additionalData.additionalData.order_id );	 
	        		setHome();
	        		break;
	        		
	        		case "booking":
	        		showNotificationBooking( data.title,data.message, data.additionalData.additionalData.booking_id );	
	        		break;
	        		
	        		default:
	        		showNotificationCampaign( data.title,data.message  );
	        		break;
	        	}
	        } else {
	        	switch (data.additionalData.additionalData.push_type)
	        	{
	        		case "order":
	        		showNotification( data.title,data.message, data.additionalData.additionalData.order_id );	 
	        		setHome();
	        		break;
	        		
	        		case "booking":
	        		showNotificationBooking( data.title,data.message, data.additionalData.additionalData.booking_id );	
	        		break;
	        		
	        		default:
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
	//return true;
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
		translatePage();
		break;
		
		case "page-orderstoday":
		$(".tab-action").val('GetTodaysOrder');
		$(".display-div").val('new-orders');
		$(".tab-active-page").html( getTrans('New Orders','new_order') );
		GetTodaysOrder();
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
	 timeout: 6000,
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
								
				case "GetTodaysOrder":
				case "GetPendingOrders":
				case "GetAllOrders":
				case "getNotification":		
				case "searchOrder":
				case "PendingBooking":
				case "AllBooking":
				notyAlert(data.msg,"error");
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
	 timeout: 6000,
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
		   htm+='<p class="status margin2">';
		   htm+='<ons-icon icon="'+icons+'" class="icon '+icons2+'"></ons-icon>';
		   htm+=" "+val.status;
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
		icon_trans_type='fa-truck';
	} else {
		icon_trans_type='ion-ios-briefcase';
	}
	return icon_trans_type;
}

function notyAlert(msg,alert_type)
{
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
	
	var html='';
	var html='<ons-list-header class="header">';
        html+='<ons-row>';
        html+='<ons-col><ons-icon icon="'+icons.icons+'" class="icon '+icons.classname+'"></ons-icon> '+data.status+'</ons-col>';
        html+='<ons-col class="text-right">'+getTrans("Order No",'order_no')+' : '+data.order_id+'</ons-col>';
        html+='</ons-row>';
     html+='</ons-list-header>';
     
     html+='<ons-list-item>';
       html+='<ons-icon icon="ion-person"></ons-icon> '+data.client_info.full_name;
     html+='</ons-list-item>';
     
     if ( !empty(data.client_info.contact_phone)){
     html+='<ons-list-item>';
     html+='<ons-icon icon="ion-ios-telephone"></ons-icon> <a href="tel:'+data.client_info.contact_phone+'">'+ data.client_info.contact_phone+"</a>";
     html+='</ons-list-item>';
     }
     
     if ( !empty(data.client_info.address)){
     var address = "'"+data.client_info.address+"'";    
     html+='<ons-list-item>';
     html+='<ons-row>';
        html+='<ons-col size="21px"><ons-icon icon="ion-ios-location"></ons-icon></ons-col>';        
        html+='<ons-col class="fixed-col">'+data.client_info.address+'</ons-col>';
        html+='<ons-col class="text-right">';
          html+='<ons-button modifier="quiet" onclick="viewLocation('+address+')" class="view-location">';
          html+= getTrans("View Location",'view_location') + '</ons-button>';
        html+='</ons-col>';
       html+='</ons-row>';  
     html+='</ons-list-item>';
     }
          
     html+=TPLorderRow( getTrans("TRN Type",'trn_type') ,  data.trans_type);
     html+=TPLorderRow( getTrans("Payment Type",'payment_type') ,  data.payment_type);
     
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
         		html+=TPLorderRow( getTrans("Less Voucher",'less_voucher') ,  "("+data.total.voucher_amount1 +")");
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

     if ( data.status_raw=="pending"){
     	$(".actions-1").show();
     	$(".actions-2").hide();
     } else {
     	$(".actions-2").show();
     	$(".actions-1").hide();
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
			htm+='<ons-col class="fixed-col">'+val.status+'</ons-col>';
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
				return temp_dictionary[words_key][default_lang];
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
	 timeout: 6000,
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
	 timeout: 6000,
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
             html+='<p class="status">';
	             html+='<ons-icon class="icon '+icon.classname+'" icon="'+icon.icons+'"></ons-icon>';
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
        html+='<ons-icon class="icon '+icon.classname+'" icon="'+icon.icons+'"></ons-icon>';
        html+='&nbsp;&nbsp;'+data.status
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