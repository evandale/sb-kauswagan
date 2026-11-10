# Sangguniang Bayan of Kauswagan – Digital Bulletin Board

Static site (no build step). Open `index.html`, or upload the folder to any web host.
Note: browsers may block the Google Sheets request on `file://`; use a host or `python3 -m http.server`.
On Vercel, `vercel.json` enables extension-free URLs. Category links use paths such as `/pages/ordinances`, and the homepage uses `/`.

**Images:** put `municipal-seal.png` and `sb-logo.png` in `assets/images/`. Until then, text placeholders show.
**Settings:** everything editable is in `assets/js/config.js`. Categories/aliases are in `assets/js/data.js`.
To use an image banner behind the hero text, place an image at `assets/images/hero-banner.png` or set `heroImageUrl` in `assets/js/config.js` to another site-relative path or HTTPS URL. If the image cannot be loaded, the hero keeps its solid-color background.

## Private Documents sheet and Apps Script feed
The public website must not read the spreadsheet directly. Keep the spreadsheet shared only with approved staff and use the read-only endpoint in `apps-script/Code.gs` to return a limited public feed. The endpoint returns only published records and approved display fields; it omits request/approval controls and folder links, and only returns a file URL when Availability is `Public`. Because the endpoint serves the published feed publicly, only put information intended for the website in those returned fields.

To deploy the endpoint:
1. Create a standalone project at [Google Apps Script](https://script.google.com/) and paste in `apps-script/Code.gs`.
2. In **Project Settings → Script Properties**, add `SPREADSHEET_ID` with the private spreadsheet ID. Optionally add `SHEET_NAME` with `Documents`. Keep the script project restricted to approved staff.
3. Deploy as a **Web app**, choose **Execute as me**, and allow access to **Anyone** so the public website can load the published feed. This does not make the sheet itself public; the endpoint exposes only its allowlisted published fields. Do not add approval or decline actions to this public endpoint.
4. Copy the deployed `/exec` URL into `appsScriptUrl` in `assets/js/config.js`. The website uses JSONP to read the endpoint without making the sheet public.
5. After verifying the website loads the feed, change the spreadsheet’s General access to **Restricted** and keep only approved staff on its share list.

If your organization does not allow an Apps Script web app accessible to **Anyone**, this public website cannot fetch the feed anonymously through this setup.

## Updating the Documents sheet
In the `Documents` tab, add a column with the exact header `Availability` (for example, after `Google Drive File URL`). For each published row:
- Set `Public` to show the document's view and download links. Make sure `Google Drive File URL` contains the document URL and that its sharing settings allow the intended audience to access it.
- Set `Upon Request` to show the `Request Document` link to the Google Form.
- Leave the cell blank to use `Upon Request` by default. Any value other than `Public` also falls back to `Upon Request`.

The Google Form responder URL is configured as `requestDocumentUrl` in `assets/js/config.js`.

## Notable changes
- Each category has its own page; header, nav and footer are generated once by `navigation.js`. Active page is marked with `aria-current="page"`.
- Bug fix: the SB logo never loaded because only `http(s)` URLs were accepted. Local relative paths now work, and missing images fall back to text.
- Shared cache: all pages read one saved copy (`cacheFreshMs`, 5 min), so navigating does not re-request the Sheet each time. "Try again" always refetches.
- Homepage category tiles and section titles link to the category pages; "View All / Show Less" remains on the homepage.
- Records with no date no longer show an empty "Date:" line; Featured badge also shown on news cards.
- Unchanged: column mapping, Published status, category aliases, timeout, and fallback samples.
