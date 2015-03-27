var pushNotification;
var gcmNumber = "646224033141";

function onDeviceReady() {
    $("#app-status-ul").append('<li>EVENT -> RECIEVED: <ul><li>deviceready</li></ul> </li>');

    document.addEventListener("backbutton", function(e)
    {
        $("#app-status-ul").append('<li>backbutton event received</li>');

        if( $("#home").length > 0)
        {
            // call this to get a new token each time. don't call it to reuse existing token.
            //pushNotification.unregister(successHandler, errorHandler);
            e.preventDefault();
            navigator.app.exitApp();
        }
        else
        {
            navigator.app.backHistory();
        }
    }, false);

    try 
    { 
        pushNotification = window.plugins.pushNotification;
        
        $("#app-status-ul").append('<li>registering ' + device.platform + '</li>');
        
        if (device.platform == 'android' || 
            device.platform == 'Android' ||
            device.platform == 'amazon-fireos' ) {
                pushNotification.register(successHandler, errorHandler,
                    {
                        "senderID":gcmNumber,
                        "ecb":"onNotificationGCM"}
                );
        } else {
            pushNotification.register(tokenHandler, errorHandler,
                {
                    "badge":"true",
                    "sound":"true",
                    "alert":"true",
                    "ecb":"onNotificationAPN"
                }
            );
        }
    }
    catch(err) 
    { 
        txt="There was an error on this page.\n\n"; 
        txt+="Error description: " + err.message + "\n\n"; 
        alert(txt); 
    } 
}

// handle APNS notifications for iOS
function onNotificationAPN(e) {
    if (e.alert) {
         $("#app-status-ul").append('<li>push-notification: ' + e.alert + '</li>');
         // showing an alert also requires the org.apache.cordova.dialogs plugin
         navigator.notification.alert(e.alert);
    }                    
    if (e.sound) {
        // playing a sound also requires the org.apache.cordova.media plugin
        var snd = new Media(e.sound);
        snd.play();
    }             
    if (e.badge) {
        pushNotification.setApplicationIconBadgeNumber(successHandler, e.badge);
    }
}

// handle GCM notifications for Android
function onNotificationGCM(e) {
    $("#app-status-ul").append('<li>EVENT -> RECEIVED:<ul><li>' + e.event + '</li></ul></li>');

    switch( e.event )
    {
        case 'registered':
        if ( e.regid.length > 0 )
        {
            $("#app-status-ul").append('<li>REGISTERED -> REGID:<ul><li>' + e.regid + "</li></ul></li>");
            // Your GCM push server needs to know the regID before it can push to this device
            // here is where you might want to send it the regID for later use.
            console.log("regID = " + e.regid);
        }
        break;

        case 'message':
            // if this flag is set, this notification happened while we were in the foreground.
            // you might want to play a sound to get the user's attention, throw up a dialog, etc.
            if (e.foreground)
            {
                $("#app-status-ul").append('<li>--INLINE NOTIFICATION--' + '</li>');

                    // on Android soundname is outside the payload. 
                        // On Amazon FireOS all custom attributes are contained within payload
                        var soundfile = e.soundname || e.payload.sound;
                        // if the notification contains a soundname, play it.
                        // playing a sound also requires the org.apache.cordova.media plugin                
                        var my_media = new Media("/android_asset/www/"+ soundfile);

                        my_media.play();                        
            }
            else
            {	// otherwise we were launched because the user touched a notification in the notification tray.
                if (e.coldstart)
                    $("#app-status-ul").append('<li>--COLDSTART NOTIFICATION--' + '</li>');
                else
                $("#app-status-ul").append('<li>--BACKGROUND NOTIFICATION--' + '</li>');
            }

            $("#app-status-ul").append('<li>MESSAGE -> MSG: <ul><li>' + 
                                       e.payload.message + '</li></ul></li>');
            //android only
            $("#app-status-ul").append('<li>MESSAGE -> MSGCNT: <ul><li>' + 
                                       e.payload.msgcnt + '</li></ul></li>');
            //amazon-fireos only
            $("#app-status-ul").append('<li>FIREOS -> TIMESTAMP: <ul><li>' + 
                                       e.payload.timeStamp + '</ul></li></li>');
        break;

        case 'error':
            $("#app-status-ul").append('<li>ERROR -> MSG:<ul><li>' + e.msg + '</li></ul></li>');
        break;

        default:
            $("#app-status-ul").append('<li>EVENT -> UNKOWN:<ul><li>'+
                                       e.event+'</li></ul></li>');
        break;
    }
}

function tokenHandler (result) {
    $("#app-status-ul").append('<li>token: '+ result +'</li>');
    // Your iOS push server needs to know the token before it can push to this device
    // here is where you might want to send it the token for later use.
}

function successHandler (result) {
    $("#app-status-ul").append('<li>success:'+ result +'</li>');
    $("#app-status-ul").append('<li>please wait for event callback</li>');    
}

function errorHandler (error) {
    $("#app-status-ul").append('<li>error:'+ error +'</li>');
}

document.addEventListener('deviceready', onDeviceReady, true);

