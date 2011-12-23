// Android stuff

// @todo migrate menu setup in here?

var origOnDeviceReady = onDeviceReady;
onDeviceReady = function() {
    document.addEventListener("backbutton", onBackButton, false);
    document.addEventListener("searchbutton", onSearchButton, false);

	if (navigator.userAgent.match(/; Android [34]/)) {
    	// The iframe doesn't stretch to fit its native size on Android 3 or 4.
    	// Ideally we'd instead fit it within the size of the screen and allow
    	// scrolling within it, but that seems to have bugs for now:
		// <http://code.google.com/p/android/issues/detail?id=20184>
    	//
    	// As a temporary hack to get things working on Honeycomb / Ice Cream Sandwich,
    	// we'll force the size of the frame after load and let the whole document scroll.
		//
		// @fixme When expanding sections, the document gets taller and may start scrolling
		// inside as well or something and the scrolling-iframe-link-bug above will hit.
		//
		// @fixme Doesn't update until after page load is complete.
		//
		// @fixme Doesn't always update appropriately; sometimes leaves extra whitespace.
		
		var pingFrameSize = function() {
	    	var $iframe = $('#main'),
	    		doc = $iframe[0].contentDocument,
	    		frameHeight = doc.body.scrollHeight;
	    	$iframe.attr('height', frameHeight);
		}
		document.getElementById('main').addEventListener('load', pingFrameSize, true);
	}
	
	origOnDeviceReady();
};

function onBackButton() {
	goBack();
}

function onSearchButton() {
	// Hack to ensure the webview has focus first...
	window.plugins.Focus.setFocus();
    $('#searchParam').focus();
    //hmmm...doesn't seem to set the cursor in the input field - maybe a browser bug???
    //plugins.SoftKeyBoard.show();
    // also manually scroll to top
	//document.body.scrollTop = 0;
}

function selectText() {
    PhoneGap.exec(null, null, 'SelectTextPlugin', 'selectText', []);
}

function sharePage() {
	// @fixme consolidate these with addBookmarkPrompt etc
	// @fixme if we don't have a page loaded, this menu item should be disabled...
	var title = currentPageTitle(),
		url = currentPageUrl().replace(/\.m\.wikipedia/, '.wikipedia');
	window.plugins.share.show(
		{
			subject: title,
			text: url
		}
	);
}

//@Override
function lightweightNotification(text) {
	// Using PhoneGap-Toast plugin for Android's lightweight "Toast" style notifications.
	// https://github.com/m00sey/PhoneGap-Toast
	// http://developer.android.com/guide/topics/ui/notifiers/toasts.html
	window.plugins.ToastPlugin.show_short(text);
}

var origToggleForward = toggleForward;

//@Override
toggleForward = function() {
	origToggleForward();
    console.log('Forward command disabled '+$('#forwardCmd').attr('disabled')); 

    // Update menu state & locale
	$('#appMenu command').each(function() {
		var $command = $(this),
			id = $command.attr('id'),
			msg = 'menu-' + id.replace(/Cmd$/, ''),
			label = mw.message(msg).plain();
		$command.attr('label', label);
	});

    window.plugins.SimpleMenu.loadMenu($('#appMenu')[0], 
                                       function(success) {console.log(success);},
                                       function(error) {console.log(error);});
};

//@Override
function hasNetworkConnection() 
{
    return navigator.network.connection.type == Connection.NONE ? false : true;
}

//@Override
function enableCaching() {
	$(document).bind('offline', function() {
		console.log('OFFLINE');
		window.plugins.CacheMode.setCacheMode('LOAD_CACHE_ELSE_NETWORK');
	});
	$(document).bind('online', function() {
		console.log('ONLINE');
		window.plugins.CacheMode.setCacheMode('LOAD_DEFAULT');
	});
}
