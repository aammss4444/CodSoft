const fs = require('fs');
const path = require('path');
const p = path.join('d:', 'Projects', 'MAISIP', 'frontend', 'app', 'institute-registration', 'page.js');
let content = fs.readFileSync(p, 'utf8');

// Move FileDropzone outside
const dropzoneComp = `
const FileDropzone = ({ id, label, required, uploadedFile, onUpload }) => (
  <div className={styles.inputGroup}>
    <label className={styles.inputLabel}>{label} {required && <span style={{color: 'red'}}>*</span>}</label>
    <div 
      className={styles.fileUploadWrapper}
      onClick={() => document.getElementById(id).click()}
      style={{
        cursor: 'pointer',
        borderColor: uploadedFile ? '#10B981' : '',
        backgroundColor: uploadedFile ? 'rgba(16, 185, 129, 0.05)' : ''
      }}
    >
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: uploadedFile ? '#10B981' : '#9CA3AF', marginBottom: '12px'}}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line>
      </svg>
      <p style={{margin: '0 0 8px 0', fontWeight: '600', color: uploadedFile ? '#065F46' : '#374151'}}>
        {uploadedFile ? uploadedFile.name : 'Click to upload or drag and drop'}
      </p>
      {!uploadedFile && <p style={{margin: '0', fontSize: '0.85rem', color: '#6B7280'}}>PDF, JPG or PNG (MAX. 5MB)</p>}
      <input 
        type="file" 
        id={id} 
        style={{display: 'none'}} 
        onChange={(e) => onUpload(id, e.target.files[0])}
      />
    </div>
  </div>
);
`;

// Remove the old one
content = content.replace(/\s*\/\/\s*Reusable File Dropzone Component\s*const FileDropzone = \({ id, label, required }\) => \([\s\S]*?\);\s*/g, '\n');

// Add new one after imports
content = content.replace(/(import .*\n)+/, match => match + '\n' + dropzoneComp + '\n');

// Replace all usages
content = content.replace(/<FileDropzone([^>]+)\/>/g, (match, props) => {
  const idMatch = props.match(/id="([^"]+)"/);
  const id = idMatch ? idMatch[1] : '';
  return `<FileDropzone${props} uploadedFile={uploadedFiles['${id}']} onUpload={handleFileUpload} />`;
});

fs.writeFileSync(p, content);
console.log('Refactored FileDropzone in institute-registration/page.js');
