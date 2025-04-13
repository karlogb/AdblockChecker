(function() {
    // Function to detect if the browser is likely a bot or headless
    function isBot() {
        return navigator.webdriver || window.outerWidth === 0 || navigator.hardwareConcurrency === 0;
    }

    // Function to detect the browser type
    async function getBrowser() {
        var userAgent = navigator.userAgent;

        if (userAgent.indexOf("Edg") > -1) {
            return "Edge";
        } else if (userAgent.indexOf("Firefox") > -1) {
            return "Firefox";
        } else if (userAgent.indexOf("OPR") > -1 || userAgent.indexOf("Opera") > -1) {
            return "Opera";
        } else if (userAgent.indexOf("Vivaldi") > -1) {
            return "Vivaldi";
        } else if (userAgent.indexOf("Brave") > -1 || (navigator.brave && await navigator.brave.isBrave())) {
            return "Brave";
        } else if (userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") === -1) {
            return "Safari";
        } else if (userAgent.indexOf("Chrome") > -1) {
            return "Chrome";
        } else if (userAgent.indexOf("Trident") > -1 || userAgent.indexOf("MSIE") > -1) {
            return "Internet Explorer";
        } else {
            return "Other";
        }
    }

    function getEventNameFromRequestURL() {
        const params = new URLSearchParams(document.currentScript.src.split('?')[1]);
        const eventName = params.get('event_name');
        return eventName || 'unknown_event';
    }

    function checkScriptBlocked(url, callback) {
        var script = document.createElement('script');
        script.src = url;
        script.onload = function() {
            callback(0); // Not blocked
        };
        script.onerror = function() {
            // Script failed to load, blocked or unavailable
            callback(1); // Blocked
        };
        document.head.appendChild(script);
    }

    // Utility function to get the value of a cookie by name
    function getCookie(name) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length === 2) return parts.pop().split(";").shift();
        return "";
    }

    function checkCollectRequestBlocked(callback) {
        var xhr = new XMLHttpRequest();
        var collectURL = '';  // Mimic a real GA4 collect URL

        xhr.open("POST", collectURL, true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

        xhr.onload = function() {
            if (xhr.status === 200 || xhr.status === 204) {
                callback(0); // Not blocked
            } else {
                callback(1); // Blocked
            }
        };

        xhr.onerror = function() {
            callback(1); // Blocked
        };

        xhr.send(null);  // Send the request
    }

    // Function to check if Google Analytics scripts are blocked (robust version)
    function checkGoogleAnalyticsBlocked(callback) {
        checkScriptBlocked('https://www.google-analytics.com/analytics.js', function(analyticsJsBlocked) {
            checkScriptBlocked('https://www.googletagmanager.com/gtag/js?id=G-111111111', function(gtagJsBlocked) {
                var allScriptsBlocked = (analyticsJsBlocked === 1 || gtagJsBlocked === 1) ? 1 : 0;

                var xhr = new XMLHttpRequest();
                var collectURL = 'https://www.google-analytics.com/collect?v=1&t=pageview&tid=G-111111111';
                xhr.open("POST", collectURL, true);
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                xhr.onload = function() {
                    if (xhr.status === 200 || xhr.status === 204) {
                        callback(allScriptsBlocked === 1 ? 1 : 0);
                    } else {
                        callback(1);
                    }
                };
                xhr.onerror = function() {
                    callback(1);
                };
                xhr.send(null);
            });
        });
    }

    // Function to check if Facebook tracking scripts are blocked (robust version)
    function checkFacebookBlocked(callback) {
        checkScriptBlocked('https://connect.facebook.net/en_US/fbevents.js', function(fbJsBlocked) {
            var xhr = new XMLHttpRequest();
            var fbCollectURL = 'https://www.facebook.com/tr?id=1234567890&ev=PageView&noscript=1'; // Example FB event URL
            xhr.open("POST", fbCollectURL, true);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhr.onload = function() {
                if (xhr.status === 200 || xhr.status === 204) {
                    callback(fbJsBlocked === 1 ? 1 : 0);
                } else {
                    callback(1);  // Blocked
                }
            };
            xhr.onerror = function() {
                callback(1);  // Blocked
            };
            xhr.send(null);
        });
    }

    // Function to check if Google Ads scripts are blocked (robust version)
    function checkGoogleAdsBlocked(callback) {
    
        // Check if the adsbygoogle.js script is blocked
        checkScriptBlocked('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', function(adsJsBlocked) {
    
            // If the script is blocked, we assume ads are blocked
            callback(adsJsBlocked);
        });
    }

    // Variables to store check results
    var adBlockDetected = 0;
    var facebookRequestBlocked = null;
    var googleAnalyticsRequestBlocked = null;
    var googleAdsRequestBlocked = null;
    var bingAdsRequestBlocked = null;
    var gtmRequestBlocked = null;
    var collectRequestBlocked = null;

    // Log or use browser information to adjust behavior
    getBrowser().then(browser => {

        var isBotDetected = isBot() ? 1 : 0;

        var event_name = getEventNameFromRequestURL();

        function sendResult() {
            if (facebookRequestBlocked !== null && googleAnalyticsRequestBlocked !== null && googleAdsRequestBlocked !== null && bingAdsRequestBlocked !== null && gtmRequestBlocked !== null && collectRequestBlocked !== null) {
                var data = {
                    adBlockDetected: adBlockDetected,
                    facebookRequestBlocked: facebookRequestBlocked,
                    googleAnalyticsRequestBlocked: googleAnalyticsRequestBlocked,
                    googleAdsRequestBlocked: googleAdsRequestBlocked,
                    bingAdsRequestBlocked: bingAdsRequestBlocked,
                    gtmRequestBlocked: gtmRequestBlocked,
                    collectRequestBlocked: collectRequestBlocked,
                    browser: browser,
                    gacookie: getCookie('_ga'),
                    hostname: window.location.hostname,
                    pageURL: window.location.href,
                    event_name: event_name,
                    isBotDetected: isBotDetected
                };

                var xhr = new XMLHttpRequest();
                xhr.open("POST", "", true);
                xhr.setRequestHeader("Content-Type", "application/json");
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4 && xhr.status === 200) {
                    } else if (xhr.readyState === 4) {
                        console.error("Failed to send data to the server.");
                    }
                };
                xhr.onerror = function () {
                    console.error("An error occurred while sending data to the server.");
                };
                xhr.send(JSON.stringify(data));
            }
        }

        function checkGTMBlocked(callback) {
            checkScriptBlocked('https://www.googletagmanager.com/gtm.js?id=GTM-TFV22TW', function(gtmJsBlocked) {
                var xhr = new XMLHttpRequest();
                var gtmCollectURL = 'https://www.googletagmanager.com/gtm.js?id=GTM-TFV22TW'; // Example GTM request
        
                xhr.open("GET", gtmCollectURL, true);
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                
                xhr.onload = function() {
                    if (xhr.status === 200 || xhr.status === 204) {
                        callback(gtmJsBlocked === 1 ? 1 : 0);
                    } else {
                        callback(1); // Blocked
                    }
                };
        
                xhr.onerror = function() {
                    callback(1); // Blocked
                };
        
                xhr.send(null);  // Send the request
            });
        }

        var bait = document.createElement('div');
        bait.innerHTML = '&nbsp;';
        bait.className = 'pub_300x250 pub_728x90 text-ad textAd text_ad text_ads text-ads text-ad-links';
        bait.style.width = '1px';
        bait.style.height = '1px';
        bait.style.position = 'absolute';
        bait.style.left = '-10000px';
        bait.style.top = '-10000px';

        document.body.appendChild(bait);

        setTimeout(function() {
            if (bait.offsetHeight === 0 || bait.offsetWidth === 0 || window.getComputedStyle(bait).display === 'none') {
                adBlockDetected = 1;
            }

            document.body.removeChild(bait);

            checkGTMBlocked(function(blocked) {
                gtmRequestBlocked = blocked;
                checkFacebookBlocked(function(fbBlocked) {
                    facebookRequestBlocked = fbBlocked;
                    checkGoogleAnalyticsBlocked(function(gaBlocked) {
                        googleAnalyticsRequestBlocked = gaBlocked;
                        checkGoogleAdsBlocked(function(adsBlocked) {
                            googleAdsRequestBlocked = adsBlocked;
                            checkScriptBlocked('https://bat.bing.com/bat.js', function(bingBlocked) {
                                bingAdsRequestBlocked = bingBlocked;
                                checkCollectRequestBlocked(function(collectBlocked) {
                                    collectRequestBlocked = collectBlocked;
                                    sendResult();
                                });
                            });
                        });
                    });
                });
            });
        }, 200);
    });
})();
