
var app_paypal = {

   initPaymentUI: function() {
    var clientIDs = {    	
      "PayPalEnvironmentProduction": $(".client_id_live").val() ,
      "PayPalEnvironmentSandbox": $(".client_id_sandbox").val()
    };
    PayPalMobile.init(clientIDs, app_paypal.onPayPalMobileInit);
  },
  
  configuration: function() {
    // for more options see `paypal-mobile-js-helper.js`
    var config = new PayPalConfiguration({
      merchantName: null,
      merchantPrivacyPolicyURL: null,
      merchantUserAgreementURL: null
    });
    return config;
  },
  
  onSuccesfulPayment: function(payment) {
    //alert("payment success: " + JSON.stringify(payment, null, 4));
    paypalSuccessfullPayment(  JSON.stringify(payment, null, 4) );
  },
  
  onAuthorizationCallback: function(authorization) {
    alert("authorization: " + JSON.stringify(authorization, null, 4));
  },
  
  createPayment: function() {
    // for simplicity use predefined amount
    // @params = subtotal, shipping, tax
    // amount, currency, shortDescription, intent, details
    var paymentDetails = new PayPalPaymentDetails( getStorage("total_w_tax") , "0.00", "0.00");
    var payment = new PayPalPayment( getStorage("total_w_tax") , getStorage("currency_code") , 
    getStorage("paymet_desc") , "Sale", paymentDetails);
    return payment;
  },
   
  onPrepareRender: function() {
  	
  	PayPalMobile.renderSinglePaymentUI(app_paypal.createPayment(), app_paypal.onSuccesfulPayment,
        app_paypal.onUserCanceled);
  },
  
  onPayPalMobileInit: function() {
    // must be called
    // use PayPalEnvironmentNoNetwork mode to get look and feel of the flow
    // PayPalEnvironmentNoNetwork
    // PayPalEnvironmentSandbox
    // PayPalEnvironmentProduction
    
    var MyPaypalEnvironment='';
    
    switch ( $(".paypal_mode").val() )
    {    	
     	case "live":
     	MyPaypalEnvironment="PayPalEnvironmentProduction";
     	break;
     	
     	case "nonetwork":
     	MyPaypalEnvironment="PayPalEnvironmentNoNetwork";
     	break;
     	
     	default:
     	MyPaypalEnvironment="PayPalEnvironmentSandbox";
     	break;
    }
            
    PayPalMobile.prepareToRender( MyPaypalEnvironment , app_paypal.configuration(),
      app_paypal.onPrepareRender);
  },
  
  onUserCanceled: function(result) {
    onsenAlert(result);
  }
	
};

