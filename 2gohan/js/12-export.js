/* ============================================================
   6. JSON EXPORT & RESTORE + GITHUB PUBLISHING & LIVE ADMIN SAVES
   ============================================================ */

/* --- TOP BAR HUD LOADER HELPERS --- */
window.showHudLoader = function(message) {
    let loader = document.getElementById('hud-loading-spinner');
    let textEl = document.getElementById('hud-loading-text');
    if (loader) loader.style.display = 'inline-flex';
    if (textEl && message) textEl.textContent = message;
};

window.hideHudLoader = function() {
    let loader = document.getElementById('hud-loading-spinner');
    if (loader) loader.style.display = 'none';
};

// JSON Export Function
window.exportProjectAsJson = function() {
    try {
        let inputData = {};
        savedInputs.forEach(id => { 
            const el = document.getElementById(id); 
            if (el) inputData[id] = el.value; 
        });

        document.querySelectorAll('#sidebar-sections-area input').forEach(input => input.setAttribute('value', input.value));
        document.querySelectorAll('#sidebar-sections-area textarea').forEach(ta => {
            ta.textContent = ta.value;
            ta.setAttribute('value', ta.value);
        });

        const saHTMLBlocks = Array.from(document.querySelectorAll(".sa-block")).map(b => b.outerHTML);
        const activeHTMLBlocks = Array.from(document.querySelectorAll(".active-block")).map(b => b.outerHTML);

        const formsData = [];
        document.querySelectorAll("#forms-container .dokkan-card").forEach((formEl) => {
            const img = formEl.querySelector('.form-image');
            const nameSpan = formEl.querySelector('.form-name-display');
            
            formsData.push({
                imageSrc: img?.src || "",
                imageExportName: img?.getAttribute('data-export-name') || "",
                name: nameSpan?.innerText || "",
                link: formEl.querySelector(".form-link")?.getAttribute("href") || ""
            });
        });

        const projectData = {
            currentType: currentType, 
            currentClass: currentClass,
            currentRarity: currentRarity,
            currentAwakeningMode: currentAwakeningMode,
            counters: { sIdx: sIdx, lIdx: lIdx }, 
            inputs: inputData,
            activeBlocksHTML: activeHTMLBlocks, 
            saBlocksHTML: saHTMLBlocks,         
            containers: {
                passiveCard: document.getElementById("card-passive-container").innerHTML,
                passiveSidebar: document.getElementById("sidebar-sections-area").innerHTML,
                links: document.getElementById("card-link-container").innerHTML,
                categories: document.getElementById("card-category-container").innerHTML,
                forms: document.getElementById("forms-container").innerHTML
            },
            formsData: formsData,
            passiveName: document.getElementById('input-passive-name-sidebar')?.value || "",
            cardArtImage: document.getElementById("myOverlayImage")?.src || "",
            cardArtVideo: document.getElementById("myOverlayVideo")?.querySelector('source')?.src || ""
        };

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(projectData, null, 2));
        const downloadNode = document.createElement('a');
        downloadNode.setAttribute("href", dataStr);
        downloadNode.setAttribute("download", "dokkan_project_" + (document.getElementById("nameInput").value || "unit") + ".json");
        document.body.appendChild(downloadNode); 
        downloadNode.click(); 
        downloadNode.remove();

        console.log("JSON export completed successfully");
    } catch (e) {
        console.error("JSON export failed:", e);
        alert("Failed to export JSON. Please check the console.");
    }
};

// JSON Import Function
window.importProjectFromJson = function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async function(e) {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const projectData = JSON.parse(text);
            
            currentType = projectData.currentType || "agl";
            currentClass = projectData.currentClass || "super";
            currentRarity = projectData.currentRarity || "LR";
            currentAwakeningMode = projectData.currentAwakeningMode || "none";

            window.updateRarityStats(currentRarity);

            if(projectData.counters) { 
                sIdx = projectData.counters.sIdx; 
                lIdx = projectData.counters.lIdx; 
            }

            if (projectData.containers) {
                document.getElementById("card-passive-container").innerHTML = projectData.containers.passiveCard || "";
                document.getElementById("sidebar-sections-area").innerHTML = projectData.containers.passiveSidebar || "";
                document.getElementById("card-link-container").innerHTML = projectData.containers.links || "";
                document.getElementById("card-category-container").innerHTML = projectData.containers.categories || "";
                
                document.querySelectorAll('#sidebar-sections-area [id^="side-sec-"]').forEach(sec => {
                    const id = sec.id.replace('side-sec-', '');
                    const hInput = sec.querySelector('input[type="text"]');
                    const ta = sec.querySelector('textarea');
                    if (hInput) {
                        const val = hInput.getAttribute('value') || hInput.value;
                        hInput.value = val;
                        window.updateHeader(id, val);
                    }
                    if (ta) {
                        const val = ta.textContent || ta.getAttribute('value') || ta.value;
                        ta.value = val;
                        window.updateSection(id, val);
                    }
                });

                const formsContainer = document.getElementById("forms-container");
                if (formsContainer) {
                    formsContainer.innerHTML = "";
                    if (projectData.formsData && projectData.formsData.length > 0) {
                        projectData.formsData.forEach(fData => {
                            window.addFormBlock(fData.name, fData.imageSrc, fData.imageExportName);
                            if (fData.link && selectedForm) {
                                const anchor = selectedForm.querySelector(".form-link");
                                if (anchor) anchor.href = fData.link;
                            }
                        });
                    } else if (projectData.containers && projectData.containers.forms) {
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = projectData.containers.forms;
                        const oldCards = tempDiv.querySelectorAll('.dokkan-card');
                        
                        oldCards.forEach(oldCard => {
                            const oldName = oldCard.querySelector('.form-name')?.innerText.trim() || "Old Form";
                            const oldImg = oldCard.querySelector('.form-image')?.src || "";
                            const oldExport = oldCard.querySelector('.form-image')?.getAttribute('data-export-name') || "";
                            const oldLink = oldCard.querySelector('.form-link')?.getAttribute('href') || "";
                            
                            window.addFormBlock(oldName, oldImg, oldExport);
                            if (oldLink !== "" && oldLink !== "javascript:void(0)" && selectedForm) {
                                const anchor = selectedForm.querySelector(".form-link");
                                if (anchor) anchor.href = oldLink;
                            }
                        });
                    }
                }
            }

            document.querySelectorAll(".active-block, .sa-block").forEach(el => el.remove());
            
            if (projectData.activeBlocksHTML) {
                const actSpot = document.getElementById("active-skill-insert-spot");
                if (actSpot) projectData.activeBlocksHTML.forEach(html => actSpot.insertAdjacentHTML('beforebegin', html));
            }
            
            if (projectData.saBlocksHTML) {
                const saSpot = document.getElementById("sa-insert-spot");
                if (saSpot) projectData.saBlocksHTML.forEach(html => saSpot.insertAdjacentHTML('beforebegin', html));
            }

            if (projectData.inputs) {
                savedInputs.forEach(id => {
                    const el = document.getElementById(id);
                    if (el && projectData.inputs[id] !== undefined) {
                        el.value = projectData.inputs[id];
                    }
                });
            }

            if (projectData.passiveName) {
                const passiveInput = document.getElementById('input-passive-name-sidebar');
                if (passiveInput) passiveInput.value = projectData.passiveName;
                const passiveDisplay = document.querySelector('.passive-name-display');
                if (passiveDisplay) passiveDisplay.innerText = projectData.passiveName;
            }

            if (projectData.cardArtImage) {
                const artImg = document.getElementById("myOverlayImage");
                if (artImg) artImg.src = projectData.cardArtImage;
            }
            if (projectData.cardArtVideo) {
                const vidSource = document.getElementById("myOverlayVideo")?.querySelector('source');
                if (vidSource) vidSource.src = projectData.cardArtVideo;
            }

            window.applyCardTheme(currentType); 
            window.applyAwakening(currentAwakeningMode);
            window.updateIdentity(); 
            window.calcFromMin('hp'); 
            window.calcFromMin('atk'); 
            window.calcFromMin('def');
            window.refreshSADropdown();
            window.refreshActiveDropdown(); 
            window.refreshFormList();
            
            if (typeof window.updateCardDisplay === 'function') {
                window.updateCardDisplay();
            } else if (window.syncToAbsLayout) {
                window.syncToAbsLayout();
            }

            console.log("JSON import completed successfully");
            alert("Project imported successfully!");
        } catch (e) {
            console.error("JSON import failed:", e);
            alert("Failed to import JSON. Please check the file format and console.");
        }
    };
    
    input.click();
};

// HELPER: PROCESS ALL IMAGE TAGS & DATA-THUMB-SRC ATTRIBUTES INTO GITHUB UPLOAD QUEUE
async function processCloneImagesForUpload(clone, basePath, filesToUpload, fileMap) {
    const cloneImgs = clone.querySelectorAll('img');
    for (let idx = 0; idx < cloneImgs.length; idx++) {
        const img = cloneImgs[idx];
        const exportName = img.getAttribute('data-export-name');
        const src = img.getAttribute('src') || '';

        if (src.startsWith('blob:') || src.startsWith('data:')) {
            const blob = await dataUrlToBlob(src);
            if (blob) {
                const ext = blob.type.includes('png') ? 'png' : (blob.type.includes('webp') ? 'webp' : 'jpg');
                const cleanFileName = exportName ? exportName.replace(/^images\//, '') : `img_export_${idx + 1}_${Date.now().toString(36)}.${ext}`;
                const relPath = `images/${cleanFileName}`;
                const fullPath = `${basePath}/${relPath}`;

                if (!fileMap.has(fullPath)) {
                    filesToUpload.push({ path: fullPath, blob });
                    fileMap.set(fullPath, true);
                }
                img.setAttribute('src', relPath);
            } else if (exportName) {
                img.setAttribute('src', exportName);
            }
        } else if (exportName) {
            img.setAttribute('src', exportName);
        }
    }

    const cloneForms = clone.querySelectorAll('[data-thumb-src]');
    for (let idx = 0; idx < cloneForms.length; idx++) {
        const formEl = cloneForms[idx];
        const thumbSrc = formEl.getAttribute('data-thumb-src') || '';

        if (thumbSrc.startsWith('blob:') || thumbSrc.startsWith('data:')) {
            const blob = await dataUrlToBlob(thumbSrc);
            if (blob) {
                const ext = blob.type.includes('png') ? 'png' : 'jpg';
                const relPath = `images/Form_Thumb_${idx + 1}_${Date.now().toString(36)}.${ext}`;
                const fullPath = `${basePath}/${relPath}`;

                if (!fileMap.has(fullPath)) {
                    filesToUpload.push({ path: fullPath, blob });
                    fileMap.set(fullPath, true);
                }
                formEl.setAttribute('data-thumb-src', relPath);
            }
        }
    }
}

// UPLOAD TO GITHUB (FULL CARD PUBLISHER WITH EXACT ASSET PRESERVATION)
window.uploadToGitHub = async function() {
    const siteName = prompt("Enter a folder name for your website (e.g., 'vegeta-card'):\n\n(No spaces, only letters, numbers, and hyphens)", "");
    if (!siteName || siteName.trim() === "") {
        alert("Folder name is required!");
        return;
    }

    const cleanSiteName = siteName.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/^-+|-+$/g, '');
    if (cleanSiteName === "") {
        alert("Invalid folder name. Use only letters, numbers, and hyphens.");
        return;
    }

    const hubIdRaw = prompt("Enter the character form letter for the Hub (e.g., 'a' for base, 'b' for transformation, 'c', 'd', 'e'):\n\n(Defaults to 'a' if left blank)", "a");
    if (hubIdRaw === null) {
        alert("Upload cancelled.");
        return;
    }
    const cleanHubId = hubIdRaw.trim().toLowerCase() || "a";

    const githubToken = prompt("Enter your GitHub Personal Access Token:\n\n(Need help? See: https://github.com/settings/tokens)", "");
    if (!githubToken || !githubToken.trim()) {
        alert("GitHub token is required!");
        return;
    }

    const uploadBtn = event?.target;
    if (uploadBtn) uploadBtn.innerText = "⏳ Uploading to GitHub...";
    window.showHudLoader('Uploading Card...');

    try {
        const owner = "abscustom";
        const repo = "abscustom.github.io";
        const basePath = cleanSiteName;

        const userResponse = await fetch('https://api.github.com/user', {
            headers: { 'Authorization': `token ${githubToken.trim()}`, 'Accept': 'application/vnd.github.v3+json' }
        });

        if (!userResponse.ok) throw new Error("Invalid GitHub token or authentication failed");

        // BAKE INPUT VALUES DIRECTLY INTO DOM ATTRIBUTES
        savedInputs.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                if (el.tagName.toLowerCase() === 'textarea') {
                    el.textContent = el.value;
                }
                el.setAttribute('value', el.value);
            }
        });

        window.updateIdentity();
        window.applyCardTheme(currentType);
        window.applyAwakening(currentAwakeningMode);
        window.calcFromMin('hp');
        window.calcFromMin('atk');
        window.calcFromMin('def');
        if (window.syncToAbsLayout) window.syncToAbsLayout();

        let clone = document.documentElement.cloneNode(true);

        const cloneQuickSave = clone.querySelector('#admin-quick-save-btn');
        if (cloneQuickSave) {
            cloneQuickSave.innerText = "💾 Save Quick Edit";
            cloneQuickSave.style.display = "none";
        }

        const cloneExportJson = clone.querySelector('#admin-export-json-btn');
        if (cloneExportJson) {
            cloneExportJson.style.display = "none";
        }

        const charTitleRaw = document.getElementById("descInput")?.value || document.getElementById("char-description")?.textContent || "";
        const charName = document.getElementById("nameInput")?.value || document.getElementById("char-name")?.textContent || "";
        const leaderSkill = document.getElementById("leaderInput")?.value || document.getElementById("leader-skill")?.textContent || "";
        const cleanTitle = charTitleRaw.replace(/[\[\]]/g, '').trim();
        const fullDisplayName = cleanTitle ? `[${cleanTitle}] ${charName}` : charName;

        if (clone.querySelector('title')) clone.querySelector('title').innerText = fullDisplayName;

        let pubScript = clone.querySelector('#pub-site-marker');
        if (!pubScript) {
            pubScript = document.createElement('script');
            pubScript.id = 'pub-site-marker';
            clone.querySelector('head').appendChild(pubScript);
        }
        pubScript.textContent = `
            window.IS_PUBLISHED = true; 
            window.PUBLISHED_SITE_FOLDER = "${cleanSiteName}";
            window.currentType = "${currentType}";
            window.currentClass = "${currentClass}";
            window.currentRarity = "${currentRarity}";
            window.currentAwakeningMode = "${currentAwakeningMode}";
            window.currentCardThemeStyle = "${window.currentCardThemeStyle || 'dokkaninfo'}";
        `;

        const cloneBody = clone.querySelector('body');
        if (cloneBody) {
            cloneBody.classList.add('is-published');
            cloneBody.classList.remove('admin-mode-active');
        }

        const hubMeta = clone.querySelector('meta[name="hub-id"]');
        if (hubMeta) {
            hubMeta.setAttribute('content', cleanHubId);
        } else {
            const newMeta = document.createElement('meta');
            newMeta.name = "hub-id";
            newMeta.content = cleanHubId;
            clone.querySelector('head').appendChild(newMeta);
        }

        const nameSelectors = ['meta[itemprop="name"]', 'meta[property="og:title"]', 'meta[name="twitter:title"]', 'meta[name="apple-mobile-web-app-title"]'];
        nameSelectors.forEach(sel => { const el = clone.querySelector(sel); if (el) el.setAttribute('content', fullDisplayName); });

        const descSelectors = ['meta[name="description"]', 'meta[itemprop="description"]', 'meta[property="og:description"]', 'meta[property="twitter:description"]'];
        descSelectors.forEach(sel => { const el = clone.querySelector(sel); if (el) el.setAttribute('content', leaderSkill); });

        if (window.uploadedArtFile) {
            const fileName = window.uploadedArtType === 'video' ? "card_art.mp4" : "card_art.png";
            if (window.uploadedArtType === 'video') {
                const videoSource = clone.querySelector('#myOverlayVideo source');
                const videoTag = clone.querySelector('#myOverlayVideo');
                if (videoSource) videoSource.setAttribute('src', fileName);
                if (videoTag) videoTag.setAttribute('src', fileName);
            } else {
                const imageTag = clone.querySelector('#myOverlayImage');
                if (imageTag) imageTag.setAttribute('src', fileName);
            }
        }

        const frameImg = clone.querySelector('.card-frame');
        if (frameImg) frameImg.src = `images/frame_${currentType}.png`;

        const rarityIcon = clone.querySelector('#main-rarity-icon');
        if (rarityIcon) rarityIcon.src = `images/rarity_${currentRarity}.png`;

        const typeIcon = clone.querySelector('.typing-icon');
        if (typeIcon) typeIcon.src = `images/${currentClass}_type_${currentType}.png`;

        const dbLayoutClone = clone.querySelector('#layout-abs-style');
        if (dbLayoutClone) {
            const themeColors = { 
                agl: { main: '#1d4ed8', border: '#3b82f6', header: '#1e40af', boxBg: '#0f172a', text: '#38bdf8', glow: 'rgba(56, 189, 248, 0.6)' }, 
                teq: { main: '#15803d', border: '#22c55e', header: '#166534', boxBg: '#052e16', text: '#4ade80', glow: 'rgba(74, 222, 128, 0.6)' }, 
                int: { main: '#7e22ce', border: '#a855f7', header: '#6b21a8', boxBg: '#2e1065', text: '#c084fc', glow: 'rgba(192, 132, 252, 0.6)' }, 
                str: { main: '#b91c1c', border: '#ef4444', header: '#991b1b', boxBg: '#450a0a', text: '#f87171', glow: 'rgba(248, 113, 113, 0.6)' }, 
                phy: { main: '#ca8a04', border: '#eab308', header: '#a16207', boxBg: '#342103', text: '#fde047', glow: 'rgba(234, 179, 8, 0.65)' }, 
                none: { main: '#3f3f46', border: '#71717a', header: '#27272a', boxBg: '#18181b', text: '#38bdf8', glow: 'rgba(56, 189, 248, 0.6)' } 
            };
            const colors = themeColors[currentType] || themeColors.none;
            dbLayoutClone.style.setProperty('--theme-main', colors.main);
            dbLayoutClone.style.setProperty('--theme-border', colors.border);
            dbLayoutClone.style.setProperty('--theme-header', colors.header);
            dbLayoutClone.style.setProperty('--theme-box-bg', colors.boxBg);
            dbLayoutClone.style.setProperty('--theme-text', colors.text);
            dbLayoutClone.style.setProperty('--theme-glow', colors.glow);
        }

        const toRemove = [
            '#uploadGithubBtn', 
            '#icon-picker-modal', 
            '#main-autosave-indicator', 
            '#editor', 
            '#toggleBtn', 
            '#topbar-theme-switcher', 
            '.scouter-menu-btn'
        ];
        toRemove.forEach(sel => { clone.querySelectorAll(sel).forEach(el => el.remove()); });

        clone.querySelectorAll('[contenteditable="true"]').forEach(el => el.removeAttribute('contenteditable'));

        const filesToUpload = [];
        const fileMap = new Map();

        // Ensure pages workflow configuration exists
        const pagesWorkflowPath = ".github/workflows/pages.yml";
        const pagesWorkflowContent = `name: Deploy GitHub Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: '.'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
`;

        filesToUpload.push({
            path: pagesWorkflowPath,
            blob: new Blob([pagesWorkflowContent], { type: 'text/plain' })
        });
        fileMap.set(pagesWorkflowPath, true);

        // 1. COLLECT SCRAPED BLOBS FROM MEMORY
        Object.entries(window.scrapedAssets || {}).forEach(([fileName, blob]) => {
            const path = `${basePath}/images/${fileName}`;
            if (!fileMap.has(path)) {
                filesToUpload.push({ path, blob });
                fileMap.set(path, true);
            }
        });

        // 2. BULLETPROOF IMAGE EXTRACTOR FOR FORM CUTINS, THUMBNAILS, AND USER UPLOADS
        await processCloneImagesForUpload(clone, basePath, filesToUpload, fileMap);

        // 3. SCAN ALL REFERENCED RELATIVE ASSETS (INCLUDING JS & MP4 NOW!)
        const assetPaths = new Set();

        clone.querySelectorAll('img').forEach(img => {
            const src = img.getAttribute('src');
            if (src && !src.startsWith('http') && !src.startsWith('data:') && !src.startsWith('blob:')) {
                assetPaths.add(src);
            }
        });

        clone.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
            const href = link.getAttribute('href');
            if (href && !href.startsWith('http') && !href.startsWith('data:')) assetPaths.add(href);
        });

        clone.querySelectorAll('script').forEach(script => {
            const src = script.getAttribute('src');
            if (src && !src.startsWith('http') && !src.startsWith('data:')) {
                assetPaths.add(src);
            }
        });

        clone.querySelectorAll('source').forEach(source => {
            const src = source.getAttribute('src');
            if (src && !src.startsWith('http') && !src.startsWith('data:') && !src.startsWith('blob:')) {
                assetPaths.add(src);
            }
        });

        const baseFrameworkAssets = [
            `images/frame_${currentType}.png`,
            `images/type_${currentType}.png`,
            `images/rarity_${currentRarity}.png`,
            `images/rarity_ssr.png`,
            `images/rarity_TUR.png`,
            `images/rarity_LR.png`,
            `images/rarity_none.png`,
            `images/rarity_ssr_abs.png`,
            `images/rarity_TUR_abs.png`,
            `images/rarity_lr_abs.png`,
            `images/eza_abs.png`,
            `images/superza_abs.png`,
            `images/z-awaken.png`,
            `images/dokkan-awaken.png`,
            `images/eza_img.png`,
            `images/supereza_img.png`,
            `images/${currentClass}_type_${currentType}.png`,
            `images/lr_spin_dial.png`,
            `images/lightningfx.webm`,
            `images/abs.custom.png`,
            `images/abs.style.png`,
            `images/dokkan-info-logo.png`,
            `images/st_0001.png`,
            `images/st_0002.png`,
            `images/st_0011.png`,
            `images/st_0012.png`,
            `images/st_0100.png`,
            `images/st_0102.png`,
            `images/st_1009.png`,
            `images/passive_skill_dialog_arrow01.png`,
            `images/passive_skill_dialog_arrow02.png`,
            `images/passive_skill_dialog_arrow03.png`,
            `images/passive_skill_dialog_icon_01.png`,
            `images/passive_skill_dialog_icon_02.png`,
            `css/abs-style-layout.css`,
            `css/editor-ui.css`,
            `style.css`
        ];
        baseFrameworkAssets.forEach(p => assetPaths.add(p));

        // 4. FETCH AND ADD RELATIVE ASSET BLOBS
        const fetchPromises = Array.from(assetPaths).map(async (path) => {
            try {
                let cleanPath = path.replace(/^\.\//, '').replace(/^\//, '');
                const response = await fetch(cleanPath);
                if (response.ok) {
                    const blob = await response.blob();
                    const fullPath = `${basePath}/${cleanPath}`;
                    if (!fileMap.has(fullPath)) {
                        filesToUpload.push({ path: fullPath, blob });
                        fileMap.set(fullPath, true);
                    }
                }
            } catch (e) {}
        });

        await Promise.all(fetchPromises);

        if (window.uploadedArtFile) {
            const fileName = window.uploadedArtType === 'video' ? "card_art.mp4" : "card_art.png";
            const path = `${basePath}/${fileName}`;
            if (!fileMap.has(path)) {
                filesToUpload.push({ path: fullPath, blob: window.uploadedArtFile });
                fileMap.set(path, true);
            }
        }

        let htmlContent = "<!DOCTYPE html>\n" + clone.outerHTML;
        filesToUpload.push({
            path: `${basePath}/index.html`,
            blob: new Blob([htmlContent], { type: 'text/html' })
        });

        // 5. UPLOAD ALL FILES IN A SINGLE ATOMIC COMMIT (PAGES BUILD IN 15 SECONDS)
        await uploadBatchToGitHub(
            githubToken.trim(), 
            owner, 
            repo, 
            filesToUpload, 
            `Add/Update: ${fullDisplayName}`
        );

        const websiteUrl = `https://abscustom.github.io/${cleanSiteName}/`;
        alert(
            `✅ Card Uploaded Successfully!\n\n` +
            `Website: ${websiteUrl}\n\n` +
            `Tip for Live Edits:\nOn your published page, press Ctrl+Shift+A to unlock Admin Mode anytime!`
        );

    } catch (error) {
        console.error("Upload Error:", error);
        alert(`Failed: ${error.message}`);
    } finally {
        if (uploadBtn) uploadBtn.innerText = "Upload Card";
        window.hideHudLoader();
    }
};

// LIVE ADMIN QUICK EDIT SAVE FUNCTION (CALLABLE DIRECTLY ON PUBLISHED CARDS)
window.saveQuickEditToGitHub = async function() {
    const pass = prompt("🔒 Enter Admin Password to save Quick Edit:");
    if (pass !== "spiderman") {
        alert("❌ Incorrect password!");
        return;
    }

    const token = prompt("Enter your GitHub Personal Access Token to save quick edits live:");
    if (!token || !token.trim()) {
        alert("Quick Edit save cancelled (GitHub token required).");
        return;
    }

    const saveBtn = document.getElementById('admin-quick-save-btn');
    if (saveBtn) saveBtn.innerText = "⏳ Saving...";
    window.showHudLoader('Saving Quick Edit...');

    try {
        const owner = "abscustom";
        const repo = "abscustom.github.io";
        const folderName = window.PUBLISHED_SITE_FOLDER || window.location.pathname.split('/')[1] || "card";

        // BAKE ALL LIVE EDITS DIRECTLY INTO DOM INPUT ATTRIBUTES BEFORE CLONING
        savedInputs.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                if (el.tagName.toLowerCase() === 'textarea') {
                    el.textContent = el.value;
                }
                el.setAttribute('value', el.value);
            }
        });

        window.updateIdentity();
        window.calcFromMin('hp');
        window.calcFromMin('atk');
        window.calcFromMin('def');
        if (window.syncToAbsLayout) window.syncToAbsLayout();

        let clone = document.documentElement.cloneNode(true);

        const cloneQuickSave = clone.querySelector('#admin-quick-save-btn');
        if (cloneQuickSave) {
            cloneQuickSave.innerText = "💾 Save Quick Edit";
            cloneQuickSave.style.display = "none";
        }

        const cloneExportJson = clone.querySelector('#admin-export-json-btn');
        if (cloneExportJson) {
            cloneExportJson.style.display = "none";
        }

        const filesToUpload = [];
        const fileMap = new Map();

        await processCloneImagesForUpload(clone, folderName, filesToUpload, fileMap);

        let pubScript = clone.querySelector('#pub-site-marker');
        if (!pubScript) {
            pubScript = document.createElement('script');
            pubScript.id = 'pub-site-marker';
            clone.querySelector('head').appendChild(pubScript);
        }
        pubScript.textContent = `
            window.IS_PUBLISHED = true; 
            window.PUBLISHED_SITE_FOLDER = "${folderName}";
            window.currentType = "${currentType}";
            window.currentClass = "${currentClass}";
            window.currentRarity = "${currentRarity}";
            window.currentAwakeningMode = "${currentAwakeningMode}";
            window.currentCardThemeStyle = "${window.currentCardThemeStyle || 'dokkaninfo'}";
        `;

        const cloneBody = clone.querySelector('body');
        if (cloneBody) {
            cloneBody.classList.add('is-published');
            cloneBody.classList.remove('admin-mode-active');
        }

        const toRemove = [
            '#uploadGithubBtn', 
            '#icon-picker-modal', 
            '#main-autosave-indicator', 
            '#editor', 
            '#toggleBtn', 
            '#topbar-theme-switcher', 
            '.scouter-menu-btn'
        ];
        toRemove.forEach(sel => { clone.querySelectorAll(sel).forEach(el => el.remove()); });

        // Ensure JS scripts and MP4 backgrounds are gathered on quick saves as well
        const assetPaths = new Set();
        clone.querySelectorAll('script').forEach(script => {
            const src = script.getAttribute('src');
            if (src && !src.startsWith('http') && !src.startsWith('data:')) {
                assetPaths.add(src);
            }
        });
        clone.querySelectorAll('source').forEach(source => {
            const src = source.getAttribute('src');
            if (src && !src.startsWith('http') && !src.startsWith('data:') && !src.startsWith('blob:')) {
                assetPaths.add(src);
            }
        });

        const fetchPromises = Array.from(assetPaths).map(async (path) => {
            try {
                let cleanPath = path.replace(/^\.\//, '').replace(/^\//, '');
                const response = await fetch(cleanPath);
                if (response.ok) {
                    const blob = await response.blob();
                    const fullPath = `${folderName}/${cleanPath}`;
                    if (!fileMap.has(fullPath)) {
                        filesToUpload.push({ path: fullPath, blob });
                        fileMap.set(fullPath, true);
                    }
                }
            } catch (e) {}
        });

        await Promise.all(fetchPromises);

        const htmlContent = "<!DOCTYPE html>\n" + clone.outerHTML;
        filesToUpload.push({
            path: `${folderName}/index.html`,
            blob: new Blob([htmlContent], { type: 'text/html' })
        });

        await uploadBatchToGitHub(
            token.trim(),
            owner,
            repo,
            filesToUpload,
            `Live Quick Edit Update`
        );

        alert("✅ Quick edit saved live to GitHub Pages!");
    } catch (e) {
        console.error("Quick Edit Save Failed:", e);
        alert("Failed to save quick edit: " + e.message);
    } finally {
        if (saveBtn) saveBtn.innerText = "💾 Save Quick Edit";
        window.hideHudLoader();
    }
};