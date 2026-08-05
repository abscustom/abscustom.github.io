/* ============================================================
   6. JSON EXPORT & RESTORE + GITHUB PUBLISHING & LIVE ADMIN SAVES
   ============================================================ */

// JSON Export Function
window.exportProjectAsJson = function() {
    try {
        let inputData = {};
        savedInputs.forEach(id => { 
            const el = document.getElementById(id); 
            if (el) inputData[id] = el.value; 
        });

        // Ensure all sidebar passive input/textarea attributes match live values before export
        document.querySelectorAll('#sidebar-sections-area input').forEach(input => input.setAttribute('value', input.value));
        document.querySelectorAll('#sidebar-sections-area textarea').forEach(ta => {
            ta.textContent = ta.value;
            ta.setAttribute('value', ta.value);
        });

        const saHTMLBlocks = Array.from(document.querySelectorAll(".sa-block")).map(b => b.outerHTML);
        const activeHTMLBlocks = Array.from(document.querySelectorAll(".active-block")).map(b => b.outerHTML);

        const formsData = [];
        document.querySelectorAll("#forms-container .dokkan-card").forEach((formEl, idx) => {
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
                
                // Resync DOM input/textarea values and trigger passive updates for imported sections
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
            } else if (window.syncToDbLayout) {
                window.syncToDbLayout();
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

// UPLOAD TO GITHUB (FULL CARD PUBLISHER WITH ADMIN QUICK-EDIT METADATA)
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

    try {
        const owner = "abscustom";
        const repo = "abscustom.github.io";
        const basePath = cleanSiteName;

        const userResponse = await fetch('https://api.github.com/user', {
            headers: { 'Authorization': `token ${githubToken.trim()}`, 'Accept': 'application/vnd.github.v3+json' }
        });

        if (!userResponse.ok) throw new Error("Invalid GitHub token or authentication failed");

        // 1. RE-SYNC ALL UI & LAYOUTS TO DOM BEFORE CLONING
        window.updateIdentity();
        window.applyCardTheme(currentType);
        window.applyAwakening(currentAwakeningMode);
        window.calcFromMin('hp');
        window.calcFromMin('atk');
        window.calcFromMin('def');
        if (window.syncToDbLayout) window.syncToDbLayout();

        let clone = document.documentElement.cloneNode(true);

        const charTitleRaw = document.getElementById("descInput")?.value || "";
        const charName = document.getElementById("nameInput")?.value || "";
        const leaderSkill = document.getElementById("leaderInput")?.value || "";
        const cleanTitle = charTitleRaw.replace(/[\[\]]/g, '').trim();
        const fullDisplayName = cleanTitle ? `[${cleanTitle}] ${charName}` : charName;

        if (clone.querySelector('title')) clone.querySelector('title').innerText = fullDisplayName;

        // INJECT PUBLISHED METADATA & ADMIN ACCESS MARKER
        let pubScript = clone.querySelector('#pub-site-marker');
        if (!pubScript) {
            pubScript = document.createElement('script');
            pubScript.id = 'pub-site-marker';
            clone.querySelector('head').appendChild(pubScript);
        }
        pubScript.textContent = `window.IS_PUBLISHED = true; window.PUBLISHED_SITE_FOLDER = "${cleanSiteName}";`;

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

        // BAKE FRAME, TYPE & RARITY IMAGE SOURCES ON CLONE
        const frameImg = clone.querySelector('.card-frame');
        if (frameImg) frameImg.src = `images/frame_${currentType}.png`;

        const rarityIcon = clone.querySelector('#main-rarity-icon');
        if (rarityIcon) rarityIcon.src = `images/rarity_${currentRarity}.png`;

        const typeIcon = clone.querySelector('.typing-icon');
        if (typeIcon) typeIcon.src = `images/${currentClass}_type_${currentType}.png`;

        // BAKE INLINE CSS VARIABLES ON DOKKAN DB LAYOUT
        const dbLayoutClone = clone.querySelector('#layout-dokkandb');
        if (dbLayoutClone) {
            const themeColors = { 
                agl: { main: '#1d4ed8', border: '#3b82f6', header: '#1e40af', boxBg: '#0f172a', text: '#38bdf8', glow: 'rgba(56, 189, 248, 0.6)' }, 
                teq: { main: '#15803d', border: '#22c55e', header: '#166534', boxBg: '#052e16', text: '#4ade80', glow: 'rgba(74, 222, 128, 0.6)' }, 
                int: { main: '#7e22ce', border: '#a855f7', header: '#6b21a8', boxBg: '#2e1065', text: '#c084fc', glow: 'rgba(192, 132, 252, 0.6)' }, 
                str: { main: '#b91c1c', border: '#ef4444', header: '#991b1b', boxBg: '#450a0a', text: '#f87171', glow: 'rgba(248, 113, 113, 0.6)' }, 
                phy: { main: '#b45309', border: '#f59e0b', header: '#92400e', boxBg: '#451a03', text: '#fbbf24', glow: 'rgba(251, 191, 36, 0.6)' }, 
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

        // REMOVE EDITOR SIDEBAR & HAMBURGER TOGGLE BUTTON FROM PUBLISHED SITE
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

        // COLLECT SCRAPED & FORM ASSETS
        Object.entries(window.scrapedAssets || {}).forEach(([fileName, blob]) => {
            const path = `${basePath}/images/${fileName}`;
            if (!fileMap.has(path)) {
                filesToUpload.push({ path, blob });
                fileMap.set(path, true);
            }
        });

        clone.querySelectorAll('img[data-export-name]').forEach(img => {
            const exportName = img.getAttribute('data-export-name');
            if (exportName) img.setAttribute('src', exportName);
        });

        const dataUrlImages = clone.querySelectorAll('img[src^="data:"]');
        for (let img of dataUrlImages) {
            const dataUrl = img.src;
            const blobFromDataUrl = await dataUrlToBlob(dataUrl);
            if (blobFromDataUrl) {
                const fileName = `auto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.png`;
                const path = `${basePath}/images/${fileName}`;
                if (!fileMap.has(path)) {
                    filesToUpload.push({ path, blob: blobFromDataUrl });
                    fileMap.set(path, true);
                }
                img.setAttribute('src', `images/${fileName}`);
            }
        }

        const assetPaths = new Set();
        clone.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
            const href = link.getAttribute('href');
            if (href && !href.startsWith('http') && !href.startsWith('data:')) assetPaths.add(href);
        });
        clone.querySelectorAll('img').forEach(img => {
            const src = img.getAttribute('src');
            if (src && !src.startsWith('http') && !src.startsWith('data:') && !src.startsWith('blob:')) assetPaths.add(src);
        });
        clone.querySelectorAll('script[src]').forEach(script => {
            const scriptSrc = script.getAttribute('src');
            if (scriptSrc && !scriptSrc.startsWith('http') && !scriptSrc.startsWith('data:') && !scriptSrc.startsWith('blob:')) assetPaths.add(scriptSrc);
        });

        // FORCE INCLUDE ESSENTIAL BASE FRAMEWORK ASSETS
        const baseFrameworkAssets = [
            `images/frame_${currentType}.png`,
            `images/type_${currentType}.png`,
            `images/rarity_${currentRarity}.png`,
            `images/${currentClass}_type_${currentType}.png`,
            `images/lr_spin_dial.png`,
            `images/lightningfx.webm`
        ];
        baseFrameworkAssets.forEach(p => assetPaths.add(p));

        const fetchPromises = Array.from(assetPaths).map(async (path) => {
            try {
                const response = await fetch(path);
                if (response.ok) {
                    const blob = await response.blob();
                    let cleanPath = path.replace(/^\.\//, '').replace(/^\//, ''); 
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
                filesToUpload.push({ path, blob: window.uploadedArtFile });
                fileMap.set(path, true);
            }
        }

        let htmlContent = "<!DOCTYPE html>\n" + clone.outerHTML;

        for (let i = 0; i < filesToUpload.length; i++) {
            const file = filesToUpload[i];
            try {
                await uploadFileToGitHub(githubToken.trim(), owner, repo, file.path, file.blob, `Add: ${file.path.split('/').pop()}`);
            } catch (uploadError) {
                continue;
            }
        }

        await uploadFileToGitHub(
            githubToken.trim(), 
            owner, 
            repo, 
            `${basePath}/index.html`, 
            new Blob([htmlContent], { type: 'text/html' }),
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

    try {
        const owner = "abscustom";
        const repo = "abscustom.github.io";
        const folderName = window.PUBLISHED_SITE_FOLDER || window.location.pathname.split('/')[1] || "card";

        let clone = document.documentElement.cloneNode(true);
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

        const htmlContent = "<!DOCTYPE html>\n" + clone.outerHTML;

        await uploadFileToGitHub(
            token.trim(),
            owner,
            repo,
            `${folderName}/index.html`,
            new Blob([htmlContent], { type: 'text/html' }),
            `Live Quick Edit Update`
        );

        alert("✅ Quick edit saved live to GitHub Pages!");
    } catch (e) {
        console.error("Quick Edit Save Failed:", e);
        alert("Failed to save quick edit: " + e.message);
    } finally {
        if (saveBtn) saveBtn.innerText = "💾 Save Quick Edit";
    }
};