# Sangguniang Bayan of Kauswagan – Digital Bulletin Board

Static site (no build step). Open `index.html`, or upload the folder to any web host.
Note: browsers may block the Google Sheets request on `file://`; use a host or `python3 -m http.server`.
On Vercel, `vercel.json` enables extension-free URLs. Category links use paths such as `/pages/ordinances`, and the homepage uses `/`.

**Images:** put `municipal-seal.png` and `sb-logo.png` in `assets/images/`. Until then, text placeholders show.
**Settings:** everything editable is in `assets/js/config.js`. Categories/aliases are in `assets/js/data.js`.

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
- Unchanged: spreadsheet ID/tab, column mapping, Published filter, category aliases, timeout, fallback samples.
