function doGet(e) {
  var callback = e && e.parameter && e.parameter.callback;
  if (!callback || !/^[A-Za-z_$][0-9A-Za-z_$]*$/.test(callback)) {
    return ContentService.createTextOutput("Invalid callback")
      .setMimeType(ContentService.MimeType.TEXT);
  }

  try {
    return jsonp_(callback, { records: getPublishedRecords_() });
  } catch (error) {
    console.error("Public document feed failed: " + error.message);
    return jsonp_(callback, { error: "Unable to load published documents." });
  }
}

function getPublishedRecords_() {
  var properties = PropertiesService.getScriptProperties();
  var spreadsheetId = properties.getProperty("SPREADSHEET_ID");
  var sheetName = properties.getProperty("SHEET_NAME") || "Documents";
  if (!spreadsheetId) throw new Error("Missing SPREADSHEET_ID script property.");

  var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);
  if (!sheet) throw new Error("Configured sheet was not found.");

  var values = sheet.getDataRange().getDisplayValues();
  if (values.length < 2) return [];

  var columns = {};
  values[0].forEach(function (header, index) {
    var key = normalizeHeader_(header);
    if (key && columns[key] == null) columns[key] = index;
  });
  ["category", "title", "status"].forEach(function (required) {
    if (columns[required] == null) throw new Error("A required column is missing.");
  });

  return values.slice(1).filter(function (row) {
    return cell_(row, columns.status).toLowerCase() === "published";
  }).map(function (row) {
    var availability = cell_(row, columns.availability).toLowerCase() === "public" ? "Public" : "Upon Request";
    return {
      "Category": cell_(row, columns.category),
      "Document Number": cell_(row, columns.documentnumber) || cell_(row, columns.number),
      "Title": cell_(row, columns.title),
      "Description": cell_(row, columns.description),
      "Date Published": cell_(row, columns.datepublished) || cell_(row, columns.date),
      "Year": cell_(row, columns.year),
      "Google Drive File URL": availability === "Public" ? cell_(row, columns.googledrivefileurl) || cell_(row, columns.fileurl) : "",
      "Image URL": cell_(row, columns.imageurl),
      "Availability": availability,
      "Status": "Published",
      "Featured": cell_(row, columns.featured)
    };
  }).filter(function (record) {
    return record["Category"] && record["Title"];
  });
}

function normalizeHeader_(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function cell_(row, column) {
  return column == null ? "" : String(row[column] || "").trim();
}

function jsonp_(callback, payload) {
  return ContentService.createTextOutput(callback + "(" + JSON.stringify(payload) + ");")
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}
