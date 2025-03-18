# Ad Block Detection & Tracking Script

This JavaScript file detects ad-blockers, bot activity, and various tracking script blocks (Google Analytics, Facebook, Google Ads, Bing Ads, and GTM). The script gathers data and sends it to a server for further analysis.

## 🚀 Features

- Detects ad blockers by creating bait elements and checking visibility.
- Identifies if the browser is headless or automated.
- Determines the user's browser type.
- Checks if tracking scripts (Google Analytics, Facebook Pixel, Google Ads, Bing Ads, GTM) are blocked.
- Retrieves tracking cookies.
- Sends detection results to a server for logging.

## 🛠️ How It Works

1. **Ad Block Detection:**
   - Inserts a hidden bait element.
   - Checks if the element is hidden or removed (indicating an ad blocker is active).

2. **Bot Detection:**
   - Checks if `navigator.webdriver` is `true`.
   - Analyzes browser window dimensions and hardware concurrency.

3. **Tracking Script Blocking:**
   - Attempts to load tracking scripts (Google Analytics, Facebook Pixel, etc.).
   - Uses XMLHttpRequests to test script accessibility.
   - Detects blocking by checking script loading failures.

4. **Data Collection & Transmission:**
   - Collects browser, hostname, URL, and tracking status.
   - Sends JSON data to a configured server endpoint.

## 📌 Usage

Include the script on your website:

```html
<script src="adblock.js"></script>
```

### Configuration

Modify the script to set the appropriate tracking script URLs and your server endpoint where detection results should be sent.

## 📜 License
This project is licensed under the MIT License.
