async function uploadFileToGitHub(token, owner, repo, path, blob, message) {
    try {
// Check file size (GitHub limit is 100MB per file)
const fileSizeMB = blob.size / (1024 * 1024);
if (fileSizeMB > 100) {
    throw new Error(`File ${path} is too large (${fileSizeMB.toFixed(2)}MB). GitHub limit is 100MB.`);
}

console.log(`Uploading ${path} (${fileSizeMB.toFixed(2)}MB)...`);

// First, get the existing file to obtain its SHA (if it exists)
let existingSha = null;
try {
    const getResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });
    
    if (getResponse.ok) {
        const fileData = await getResponse.json();
        existingSha = fileData.sha;
        console.log(`  Found existing file with SHA: ${existingSha.substring(0, 7)}...`);
    }
} catch (e) {
    console.log(`  File doesn't exist yet, will create new`);
}

const arrayBuffer = await blob.arrayBuffer();
const uint8Array = new Uint8Array(arrayBuffer);
let base64 = '';
const chunkSize = 0x8000; // 32KB chunks
for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.subarray(i, i + chunkSize);
    base64 += String.fromCharCode.apply(null, chunk);
}
base64 = btoa(base64);

const requestBody = {
    message: message,
    content: base64,
    branch: 'main'
};

// Include SHA if file exists to avoid conflicts
if (existingSha) {
    requestBody.sha = existingSha;
}

const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
});

if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    // If we get a 409 conflict, try once more by getting the latest SHA
    if (response.status === 409) {
        console.log(`  Conflict detected, retrying with latest SHA...`);
        try {
            const retryResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (retryResponse.ok) {
                const retryFileData = await retryResponse.json();
                requestBody.sha = retryFileData.sha;
                
                const retryUpload = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `token ${token}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestBody)
                });
                
                if (retryUpload.ok) {
                    console.log(`  SUCCESS: ${path} (after retry)`);
                    return true;
                } else {
                    const retryError = await retryUpload.json().catch(() => ({}));
                    throw new Error(`GitHub API error on retry: ${retryUpload.status} - ${retryError.message || retryUpload.statusText}`);
                }
            }
        } catch (retryE) {
            throw new Error(`GitHub API error: ${response.status} - ${errorData.message || response.statusText}`);
        }
    }
    
    throw new Error(`GitHub API error: ${response.status} - ${errorData.message || response.statusText}`);
}

console.log(`  SUCCESS: ${path}`);
return true;
    } catch (e) {
console.error(`  FAILED: ${path} - ${e.message}`);
throw e;
    }
}

async function dataUrlToBlob(dataUrl) {
    if (!dataUrl || !dataUrl.startsWith('data:')) return null;
    try {
const res = await fetch(dataUrl);
return res.blob();
    } catch (e) {
return null;
    }
}
