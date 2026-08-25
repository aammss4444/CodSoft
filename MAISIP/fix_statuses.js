const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        filelist = walkSync(filePath, filelist);
      }
    } else {
      if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
        filelist.push(filePath);
      }
    }
  });
  return filelist;
};

const files = walkSync(path.join(__dirname, 'frontend/app'));

let changedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Institute / Athlete Profile/Dashboard identity checks
  content = content.replace(/institute\.verification_status\s*([!=]=+)\s*'Verified'/g, 'institute.identity_status $1 \'verified\'');
  content = content.replace(/athlete\.verification_status\s*([!=]=+)\s*'Verified'/g, 'athlete.identity_status $1 \'verified\'');
  content = content.replace(/athlete\.verification_status\s*([!=]=+)\s*'Pending'/g, 'athlete.identity_status $1 \'pending\'');
  content = content.replace(/profileData\?\.verification_status\s*([!=]=+)\s*'Verified'/g, 'profileData?.identity_status $1 \'verified\'');
  content = content.replace(/institute\.verification_status\s*\?\s*institute\.verification_status/g, 'institute.identity_status ? institute.identity_status');
  content = content.replace(/athlete\.verification_status\s*\?\s*athlete\.verification_status/g, 'athlete.identity_status ? athlete.identity_status');

  // Achievement verification status checks
  // === 'Verified' -> === 'verified'
  content = content.replace(/\.verification_status\s*([!=]=+)\s*'Verified'/g, '.verification_status $1 \'verified\'');
  // === 'Draft' -> === 'draft'
  content = content.replace(/\.verification_status\s*([!=]=+)\s*'Draft'/g, '.verification_status $1 \'draft\'');
  // === 'Pending' -> === 'submitted' OR 'under_review' (Usually just 'submitted' is enough for pending checks in UI)
  content = content.replace(/\.verification_status\s*([!=]=+)\s*'Pending'/g, '.verification_status $1 \'submitted\'');
  content = content.replace(/\.verification_status\s*([!=]=+)\s*'Submitted'/g, '.verification_status $1 \'submitted\'');
  content = content.replace(/\.verification_status\s*([!=]=+)\s*'Under Review'/g, '.verification_status $1 \'under_review\'');
  content = content.replace(/\.verification_status\s*([!=]=+)\s*'Pending Verification'/g, '.verification_status $1 \'submitted\'');

  // Specific ledger.athlete checks
  content = content.replace(/ledgerData\.athlete\.verification_status\s*([!=]=+)\s*'Verified'/g, 'ledgerData.athlete.identity_status $1 \'verified\'');
  content = content.replace(/ledgerData\.athlete\.verification_status\s*\|\|/g, 'ledgerData.athlete.identity_status ||');

  // Any remaining includes checks
  content = content.replace(/\.includes\(ach\.verification_status\)/g, '.includes(ach.verification_status)'); // Just in case, wait, this needs to check the array.
  content = content.replace(/\['Verified', 'Verified & Locked', 'Approved', 'Digitally Signed'\]\.includes\(ach\.verification_status\)/g, "['verified'].includes(ach.verification_status)");

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    changedFiles++;
    console.log(`Updated: ${file}`);
  }
});

console.log(`\nComplete. Changed ${changedFiles} files.`);
