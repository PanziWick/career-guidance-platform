const XLSX = require('xlsx');
const path = require('path');
const https = require('https');
const http = require('http');

const DATASET_PATH = path.resolve(__dirname, '../../dataset/GuidanceDataset.xlsx');

console.log('Loading workbook...');
const workbook = XLSX.readFile(DATASET_PATH);

if (!workbook.SheetNames.includes('Learning Resources')) {
  console.log('Sheet "Learning Resources" does not exist!');
  process.exit(1);
}

const resources = XLSX.utils.sheet_to_json(workbook.Sheets['Learning Resources']);

function checkUrl(url) {
  return new Promise((resolve) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, (res) => {
      // Check for valid status codes.
      if (res.statusCode >= 400) {
        resolve({ url, status: res.statusCode, valid: false });
      } else {
        resolve({ url, status: res.statusCode, valid: true });
      }
    }).on('error', (err) => {
      resolve({ url, error: err.message, valid: false });
    });
    
    // Set a timeout
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ url, error: 'Timeout', valid: false });
    });
  });
}

async function verifyAll() {
  console.log(`Checking ${resources.length} URLs...`);
  let invalidCount = 0;
  
  for (const resource of resources) {
    if (!resource.URL) continue;
    
    // Add User-Agent header to prevent 403 Forbidden errors from certain providers
    try {
      const response = await fetch(resource.URL, { 
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      if (!response.ok && response.status !== 403) { // Ignore 403 as it is often bot protection
         console.log(`[INVALID] ${resource.ResourceID}: ${resource.URL} (Status: ${response.status})`);
         invalidCount++;
      } else {
         console.log(`[OK] ${resource.ResourceID}: ${resource.URL} (Status: ${response.status})`);
      }
    } catch(err) {
      console.log(`[ERROR] ${resource.ResourceID}: ${resource.URL} (${err.message})`);
      invalidCount++;
    }
  }
  
  console.log(`\nVerification complete. Found ${invalidCount} potentially invalid URLs.`);
}

verifyAll();
