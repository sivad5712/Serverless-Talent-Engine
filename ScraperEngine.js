// === SETTINGS (CHANGE THESE TWO LINES) ===
const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID_HERE";
const MY_NAME = "Your Name Here"; 

const QUERY_DAILY = "in:inbox is:starred newer_than:2d";
const QUERY_BACKFILL = "in:inbox is:starred"; 

// --- HELPER FUNCTIONS ---
function formatPhoneNumber(phone) {
  const cleaned = ('' + phone).replace(/\D/g, '');
  const match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/);
  if (match) return [match[2], '-', match[3], '-', match[4]].join('');
  return phone;
}

function extractContacts(text) {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const phoneRegex = /(?:\+?1[-. ]?)?\(?([2-9][0-8][0-9])\)?[-. ]?([2-9][0-9]{2})[-. ]?([0-9]{4})/g;
  let emails = [...new Set(text.match(emailRegex) || [])];
  let rawPhones = [...new Set(text.match(phoneRegex) || [])];
  return { emails: emails.join(", "), phones: rawPhones.map(p => formatPhoneNumber(p)).join(", ") };
}

function extractName(fromHeader) {
  let namePart = fromHeader.replace(/"/g, "").split("<")[0].trim();
  let emailPart = (fromHeader.match(/<([^>]+)>/) || [null, ""])[1].trim();
  if (namePart.includes(MY_NAME) || emailPart === Session.getActiveUser().getEmail()) return "";
  return namePart || emailPart;
}

// --- THE SMART ENGINE ---
function processEmails(query, headerLabel) {
  const threads = GmailApp.search(query);
  if (threads.length === 0) return;

  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheets()[0];
  const existingEmails = sheet.getRange("C:C").getValues().flat().map(e => e.toString().toLowerCase().trim());

  let rowsToAppend = [];
  const timeZone = Session.getScriptTimeZone();
  const todayStr = Utilities.formatDate(new Date(), timeZone, "MMMM dd, yyyy");
  const exportTime = "'" + Utilities.formatDate(new Date(), timeZone, "yyyy-MM-dd HH:mm:ss");

  for (let i = 0; i < threads.length; i++) {
    const messages = threads[i].getMessages();
    let recruiterMsg = null;
    for (let j = messages.length - 1; j >= 0; j--) {
      let from = messages[j].getFrom();
      if (!from.includes(MY_NAME) && !from.includes(Session.getActiveUser().getEmail())) {
        recruiterMsg = messages[j];
        break;
      }
    }
    if (!recruiterMsg) continue; 
    
    const from = recruiterMsg.getFrom();
    const recruiterName = extractName(from);
    if (!recruiterName) continue;
    
    const contacts = extractContacts(from + "\n" + recruiterMsg.getPlainBody());
    
    if (contacts.emails !== "") {
      const firstEmail = contacts.emails.split(",")[0].toLowerCase().trim();
      if (existingEmails.includes(firstEmail)) continue; 
    }

    if (contacts.emails !== "" || contacts.phones !== "") {
       rowsToAppend.push([exportTime, recruiterName, contacts.emails, contacts.phones, recruiterMsg.getSubject(), `=HYPERLINK("https://mail.google.com/mail/u/0/#all/${recruiterMsg.getId()}", "Open Email")`]);
    }
  }

  if (rowsToAppend.length === 0) return;

  // PREPARE THE TOP SPACE
  const totalNewRows = rowsToAppend.length + 3;
  
  sheet.getRange(2, 1, 1, 6).breakApart();
  sheet.insertRowsBefore(2, totalNewRows);
  
  // CLEAN THE NEW AREA
  const newRange = sheet.getRange(2, 1, totalNewRows, 6);
  newRange.clearFormat().setBackground(null).setFontColor("#000000").setFontSize(10).setFontWeight("normal");

  // SET THE NEWEST HEADER 
  const headerText = "--- " + headerLabel + todayStr.toUpperCase() + " ---";
  const headerRange = sheet.getRange(2, 1, 1, 6);
  headerRange.setValue(headerText).merge()
             .setFontWeight("bold").setFontSize(11)
             .setFontColor("#000000").setBackground(null) 
             .setHorizontalAlignment("left"); 
  
  // SET THE RECRUITER DATA
  const dataRange = sheet.getRange(3, 1, rowsToAppend.length, 6);
  dataRange.setValues(rowsToAppend);
}

// 5 PM DAILY AUTOMATION
function runDailyScraper() {
  processEmails(QUERY_DAILY, "NEW RECRUITERS FOUND ON: ");
}

// ONE-TIME HISTORY PULL
function runOneTimeBackfill() {
  processEmails(QUERY_BACKFILL, "FULL HISTORY BACKFILL COMPLETED: ");
}
