

// --- SWITCH HELPER FOR LOGO BUTTONS ---
window.switchCardTheme = function(themeName) {
    const isDbTheme = (themeName === 'dokkandb');
    window.toggleCardTheme(isDbTheme);
};

// --- SAVES YOUR SELECTED THEME (INFO or DB) TO BROWSER MEMORY ---
window.toggleCardTheme = function(isDbTheme) {
    const appEl = document.getElementById('app');
    const layoutInfo = document.getElementById('layout-dokkaninfo');
    const layoutDb = document.getElementById('layout-dokkandb');
    
    // Scouter Logo Buttons
    const btnInfo = document.getElementById('theme-btn-info');
    const btnDb = document.getElementById('theme-btn-db');
    
    window.currentCardThemeStyle = isDbTheme ? 'dokkandb' : 'dokkaninfo';
    localStorage.setItem('dokkan_selected_theme', window.currentCardThemeStyle); // Remember theme choice
    
    if (isDbTheme) {
        if (appEl) appEl.classList.add('theme-dokkandb');
        if (layoutInfo) layoutInfo.style.display = 'none';
        if (layoutDb) layoutDb.style.display = 'block';

        // Update Button Active States
        if (btnInfo) { btnInfo.classList.remove('active'); }
        if (btnDb) { btnDb.classList.add('active'); }

        window.syncToDbLayout();
    } else {
        if (appEl) appEl.classList.remove('theme-dokkandb');
        if (layoutInfo) layoutInfo.style.display = 'block';
        if (layoutDb) layoutDb.style.display = 'none';

        // Update Button Active States
        if (btnInfo) { btnInfo.classList.add('active'); }
        if (btnDb) { btnDb.classList.remove('active'); }
    }
};

// --- MASTER DOKKAN DB SYNC (SINGLE UNIFIED FUNCTION) ---
window.syncToDbLayout = function() {
    // 1. Theme Color Sync & Lightning Overlay
    try {
        const themeColors = { 
            agl: { main: '#1d4ed8', border: '#3b82f6', header: '#1e40af', boxBg: '#0f172a', text: '#38bdf8', glow: 'rgba(56, 189, 248, 0.6)' }, 
            teq: { main: '#15803d', border: '#22c55e', header: '#166534', boxBg: '#052e16', text: '#4ade80', glow: 'rgba(74, 222, 128, 0.6)' }, 
            int: { main: '#7e22ce', border: '#a855f7', header: '#6b21a8', boxBg: '#2e1065', text: '#c084fc', glow: 'rgba(192, 132, 252, 0.6)' }, 
            str: { main: '#b91c1c', border: '#ef4444', header: '#991b1b', boxBg: '#450a0a', text: '#f87171', glow: 'rgba(248, 113, 113, 0.6)' }, 
            phy: { main: '#b45309', border: '#f59e0b', header: '#92400e', boxBg: '#451a03', text: '#fbbf24', glow: 'rgba(251, 191, 36, 0.6)' }, 
            none: { main: '#3f3f46', border: '#71717a', header: '#27272a', boxBg: '#18181b', text: '#38bdf8', glow: 'rgba(56, 189, 248, 0.6)' } 
        };
        const colors = themeColors[currentType] || themeColors.none;
        const dbLayout = document.getElementById('layout-dokkandb');
        if (dbLayout) {
            dbLayout.style.setProperty('--theme-main', colors.main);
            dbLayout.style.setProperty('--theme-border', colors.border);
            dbLayout.style.setProperty('--theme-header', colors.header);
            dbLayout.style.setProperty('--theme-box-bg', colors.boxBg);
            dbLayout.style.setProperty('--theme-text', colors.text);
            dbLayout.style.setProperty('--theme-glow', colors.glow);
        }

        document.querySelectorAll('.lightning-overlay').forEach(lightning => {
            lightning.style.setProperty('--lightning-color', lightningColors[currentType] || 'rgb(0, 150, 255)');
        });
    } catch(e) {}


    // Sync Card Art Header Tag
    try {
        const artHeader = document.getElementById('db-art-header-text');
        if (artHeader) {
            if (window.dbUnitTag === undefined) {
                window.dbUnitTag = "DOKKAN FESTIVAL UNIT";
            }
            
            if (window.dbUnitTag === "") {
                artHeader.innerText = "";
                artHeader.style.display = 'none';
            } else {
                artHeader.innerText = window.dbUnitTag;
                artHeader.style.display = 'flex';
            }
        }
    } catch(e) {}


    // 2. Identity Sync
    try {
        const rawTitle = document.getElementById('descInput')?.value || "Character Title";
        const rawName = document.getElementById('nameInput')?.value || "Character Name";
        document.getElementById('db-char-title').innerText = rawTitle.replace(/[\[\]]/g, '').trim();
        document.getElementById('db-char-name').innerText = rawName;
    } catch(e) {}

    // 3. Leader Skill Sync with Glowing Quotes
    try {
        const leaderText = document.getElementById('leaderInput')?.value || "";
        const dbLeaderEl = document.getElementById('db-leader-skill');
        if (dbLeaderEl) {
            dbLeaderEl.innerHTML = window.formatLeaderSkillQuotes(leaderText);
        }
    } catch(e) {}

    // 4. Composed Icons, EZA Icons & Card Art Sync
    try {
        const isLR = currentRarity === 'LR';
        const isSEZA = currentAwakeningMode === 'seza';
        const thumbImg = isLR ? document.getElementById('img-lr').src : document.getElementById('img-tur').src;
        document.getElementById('db-thumb-img').src = thumbImg;

        const frameImg = document.querySelector('.card-frame');
        if(frameImg) document.getElementById('db-frame-img').src = frameImg.src;

        document.getElementById('db-top-rarity-icon').src = document.getElementById('main-rarity-icon').src;
        const typeIcon = document.querySelector('.typing-icon');
        if(typeIcon) document.getElementById('db-top-type-icon').src = typeIcon.src;

        // SHOW LIGHTNING VIDEO OVERLAY FOR LR OR SEZA CARDS
        const topLightning = document.getElementById('db-lightning');
        if (topLightning) {
            if (isLR || isSEZA) {
                topLightning.style.display = 'block';
                if (isSEZA && !isLR) {
                    topLightning.style.setProperty('--lightning-color', 'rgb(255, 30, 80)');
                } else {
                    topLightning.style.setProperty('--lightning-color', lightningColors[currentType] || 'rgb(0, 150, 255)');
                }
            } else {
                topLightning.style.display = 'none';
            }
        }

        document.getElementById('db-spin-dial').style.display = isLR ? 'block' : 'none';

        // ACTIVATE SEZA LIGHTNING BORDER ON TOP-LEFT MAIN ICON
        const topComposedIcon = document.getElementById('db-composed-icon');
        if (topComposedIcon) {
            if (isSEZA) {
                topComposedIcon.classList.add('seza-glow-card');
            } else {
                topComposedIcon.classList.remove('seza-glow-card');
            }
        }

        // EZA / SEZA TAG SYNC (BOTH TOP-LEFT & TOP-RIGHT ABOVE ART)
        const ezaContainer = document.getElementById('awakening-container');
        const dbEzaImg = document.getElementById('db-awakening-img');
        const dbTopEzaImg = document.getElementById('db-top-awakening-img');
        if(ezaContainer && ezaContainer.style.display !== 'none') {
            const awakeningSrc = document.getElementById('awakening-img').src;
            if(dbEzaImg) { dbEzaImg.src = awakeningSrc; dbEzaImg.style.display = 'block'; }
            if(dbTopEzaImg) { dbTopEzaImg.src = awakeningSrc; dbTopEzaImg.style.display = 'block'; }
        } else {
            if(dbEzaImg) dbEzaImg.style.display = 'none';
            if(dbTopEzaImg) dbTopEzaImg.style.display = 'none';
        }

        document.getElementById('db-rarity-icon').src = document.getElementById('main-rarity-icon').src;
        if(typeIcon) document.getElementById('db-type-icon').src = typeIcon.src;
        document.getElementById('db-art-img').src = document.getElementById('myOverlayImage').src;
    } catch(e) {}

    // 5. Passive Skill Sync
    try {
        const passiveName = document.getElementById('input-passive-name-sidebar')?.value || "Passive Skill";
        document.getElementById('db-passive-name').innerHTML = "<span>Passive Skill - <i>" + passiveName + "</i></span>";
        document.getElementById('db-passive-container').innerHTML = document.getElementById('card-passive-container').innerHTML;
        enforcePassiveHeaderPipe();
    } catch(e) {}

    // 6. Super Attacks & Active Skills Sync
    try {
        window.updateDokkanDBSuperAttacks();
    } catch(e) {
        console.warn("DB SA Sync Error:", e);
    }

    // 7. Authentic In-Game Link Skill Pills Sync
    try {
        const dbLinkCont = document.getElementById('db-link-container');
        if (dbLinkCont) {
            dbLinkCont.innerHTML = "";
            document.querySelectorAll('#card-link-container a').forEach(a => {
                const linkName = a.innerText.trim();
                if (linkName) {
                    dbLinkCont.insertAdjacentHTML('beforeend', `
                    <div class="db-link-badge">
                        <div class="db-link-lv">
                            <span class="lv-text">Lv</span>
                            <span class="num-text">10</span>
                        </div>
                        <div class="db-link-name">${linkName}</div>
                    </div>`);
                }
            });
        }
    } catch(e) {}

    // 8. Categories Sync
    try {
        const dbCatCont = document.getElementById('db-category-container');
        if (dbCatCont) {
            dbCatCont.innerHTML = "";
            document.querySelectorAll('#card-category-container img').forEach(img => {
                dbCatCont.insertAdjacentHTML('beforeend', `<img src="${img.src}">`);
            });
        }
    } catch(e) {}

    // 9. Stats Table Sync
    try {
        if (window.updateDbStatDisplay) window.updateDbStatDisplay();
    } catch(e) {}

  
    // 11. DB AWAKENINGS & TRANSFORMATIONS SYNC
    try {
        const baseDate = document.getElementById('dateInput')?.value || "TBD";
        const ezaDate = document.getElementById('ezaDateInput')?.value || "TBD";
        const sezaDate = document.getElementById('sezaDateInput')?.value || "TBD";
        
        const baseTypeSrc = typeImageUrls[currentType] || "./images/type_none.png";
        const classTypeSrc = typeImageMap[currentClass][currentType] || "./images/type_none.png";
        const frameSrc = document.getElementById('db-frame-img')?.src || "./images/frame_none.png";

        
        // COMPOSED CARD ICON GENERATOR (Includes Lightning Video for LR / SEZA)
        const buildDbCardIcon = (thumbSrc, raritySrc, usePlainType = false, ezaIconSrc = null, isSEZA = false) => {
            const tSrc = usePlainType ? baseTypeSrc : classTypeSrc;
            const isLR = raritySrc.includes('LR');
            const showLightning = isLR || isSEZA;
            const sezaLightningStyle = isSEZA && !isLR ? 'style="--lightning-color: rgb(255, 30, 80);"' : '';
            
            const lrSpinHtml = isLR ? `<img src="./images/lr_spin_dial.png" class="lr-spin-dial">` : '';
            
            const lrLightningHtml = showLightning ? `
                <video class="lightning-overlay" autoplay muted loop playsinline ${sezaLightningStyle}>
                    <source src="./images/lightningfx.webm" type="video/webm">
                </video>` : '';
                
            const ezaHtml = ezaIconSrc ? `<img src="${ezaIconSrc}" class="eza-icon">` : '';

            const sezaGlowClass = isSEZA ? 'seza-glow-card' : '';

            return `
                <div class="db-composed-icon ${sezaGlowClass}">
                    <img class="card-frame" src="${frameSrc}">
                    ${lrSpinHtml}
                    ${lrLightningHtml}
                    <div class="thumb-box">
                        <img class="thumb-img" src="${thumbSrc}">
                    </div>
                    <img class="rarity-icon" src="${raritySrc}">
                    <img class="type-icon" src="${tSrc}">
                    ${ezaHtml}
                </div>
            `;
        };

        const awakenCont = document.getElementById('db-awakenings-container');
        if (awakenCont) {
            let awHTML = '';
            
            const buildStepDivider = (imgSrc, fallbackText) => `
                <div class="db-awaken-divider">
                    <img src="${imgSrc}" onerror="this.outerHTML='<span class=\\'db-awaken-divider-text\\'>${fallbackText}</span>'">
                </div>
            `;

            // 1. SSR Row
            const ssrSrc = document.getElementById('img-ssr')?.src || "./images/SSR_Icon.png";
            awHTML += `
                <div class="db-awaken-row">
                    ${buildDbCardIcon(ssrSrc, './images/rarity_ssr.png', true)}
                    <div class="db-awaken-date" style="font-size: 15px; font-weight: bold; text-align: center; flex: 1;">Release Date:<br><span style="font-weight: normal; font-size: 13.5px;">${baseDate}</span></div>
                </div>
            `;
            
            // 2. Z-AWAKEN -> TUR Row
            if (currentRarity === 'TUR' || currentRarity === 'LR') {
                awHTML += `
                    ${buildStepDivider('./images/z-awaken.png', 'Z-AWAKEN')}
                    <div class="db-awaken-row">
                        ${buildDbCardIcon(document.getElementById('img-tur')?.src, './images/rarity_TUR.png', false)}
                        <div class="db-awaken-date" style="font-size: 15px; font-weight: bold; text-align: center; flex: 1;">Release Date:<br><span style="font-weight: normal; font-size: 13.5px;">${baseDate}</span></div>
                    </div>
                `;
            }

            // 3. DOKKAN AWAKEN -> LR Row
            if (currentRarity === 'LR') {
                awHTML += `
                    ${buildStepDivider('./images/dokkan-awaken.png', 'DOKKAN AWAKEN')}
                    <div class="db-awaken-row">
                        ${buildDbCardIcon(document.getElementById('img-lr')?.src, './images/rarity_LR.png', false)}
                        <div class="db-awaken-date" style="font-size: 15px; font-weight: bold; text-align: center; flex: 1;">Release Date:<br><span style="font-weight: normal; font-size: 13.5px;">${baseDate}</span></div>
                    </div>
                `;
            }

            // 4. EXTREME Z-AWAKEN Row
            if (currentAwakeningMode === 'eza' || currentAwakeningMode === 'seza') {
                const maxThumb = currentRarity === 'LR' ? document.getElementById('img-lr')?.src : document.getElementById('img-tur')?.src;
                const maxRar = currentRarity === 'LR' ? './images/rarity_LR.png' : './images/rarity_TUR.png';
                awHTML += `
                    ${buildStepDivider('./images/1-optimal_awakening_step.png', 'EXTREME Z-AWAKEN')}
                    <div class="db-awaken-row">
                        ${buildDbCardIcon(maxThumb, maxRar, false, './images/eza_img.png')}
                        <div class="db-awaken-date" style="font-size: 15px; font-weight: bold; text-align: center; flex: 1;">EZA Release Date:<br><span style="color: #facc15; font-size: 13.5px;">${ezaDate}</span></div>
                    </div>
                `;
            }

            // 5. SUPER EZA Row
            if (currentAwakeningMode === 'seza') {
                const maxThumb = currentRarity === 'LR' ? document.getElementById('img-lr')?.src : document.getElementById('img-tur')?.src;
                const maxRar = currentRarity === 'LR' ? './images/rarity_LR.png' : './images/rarity_TUR.png';
                awHTML += `
                    ${buildStepDivider('./images/8-optimal_awakening_step.png', 'SUPER EZA')}
                    <div class="db-awaken-row">
                        ${buildDbCardIcon(maxThumb, maxRar, false, './images/supereza_img.png', true)}
                        <div class="db-awaken-date" style="font-size: 15px; font-weight: bold; text-align: center; flex: 1;">SEZA Release Date:<br><span style="color: #facc15; font-size: 13.5px;">${sezaDate}</span></div>
                    </div>
                `;
            }

            awakenCont.innerHTML = awHTML;
        }

      
        // TRANSFORMATIONS BOX SYNC (DB LAYOUT)
        const transBox = document.getElementById('db-transformations-box');
        const transCont = document.getElementById('db-transformations-container');
        const forms = document.querySelectorAll('#forms-container .dokkan-card');
        
        if (transBox && transCont) {
            if (forms.length > 1) {
                transBox.classList.remove('d-none');
                let trHTML = '';
                forms.forEach((f, idx) => {
                    if (idx === 0) return; // Skip 1st form (base form)
                    
                    const fImg = f.getAttribute('data-thumb-src') || f.querySelector('.form-image')?.src || "./images/default.png";
                    const fName = f.querySelector('.form-name-display')?.innerText || "Form";
                    
                    // Add element-colored glowing splitter bar between transformation rows
                    if (trHTML !== '') {
                        trHTML += `<div class="db-transform-divider"></div>`;
                    }

                    trHTML += `
                        <div class="db-transform-row">
                            ${buildDbCardIcon(fImg, currentRarity === 'LR' ? './images/rarity_LR.png' : './images/rarity_TUR.png', false)}
                            <div class="db-transform-name" style="flex: 1; text-align: center; font-size: 15px; font-weight: bold;">${fName}</div>
                        </div>
                    `;
                });
                transCont.innerHTML = trHTML;
            } else {
                transBox.classList.add('d-none');
                transCont.innerHTML = '';
            }
        }
    } catch(e) { console.error("Awakenings/Transformations Sync Error", e); }

};

/* ============================================================
   DOKKAN DB RENDERERS & FORMATTING LOGIC
   ============================================================ */

function getDbStatIconPath(iconPath) {
    if (!iconPath) return './images/st_0001.png';
    if (iconPath.includes('pot_skill_02_on.png')) {
        return './images/st_critical_up.png';
    }
    return iconPath;
}

function getStatsFromBlock(block) {
    const stats = [];
    const statContainer = block.querySelector('.stats-container');
    if (!statContainer) return stats;

    const statRows = statContainer.querySelectorAll('.sa-stat-row, .col, div');
    const elementsToScan = statRows.length > 0 ? statRows : statContainer.children;
    const effectsText = block.querySelector('.sa-display-effects-list')?.innerText || '';

    const clauses = effectsText.split(/,|\;|\band\s+(?=causes|lowers|greatly|massively|seals|stuns|disables|raises)/i);

    const jointAndTurnMatch = effectsText.match(/(ATK|DEF)\b[^\;\,\.]*?\band\b[^\;\,\.]*?\bfor\s+(\d+)\s+turns?/i);
    let jointTurns = null;
    if (jointAndTurnMatch) {
        const num = parseInt(jointAndTurnMatch[2], 10);
        jointTurns = `${num} turn${num > 1 ? 's' : ''}`;
    }

    const assignedTargets = new Set();

    Array.from(elementsToScan).forEach(row => {
        const img = row.tagName === 'IMG' ? row : row.querySelector('img');
        if (!img) return;

        const iconSrc = img.getAttribute('src');
        if (!iconSrc || iconSrc.includes('sp_skill_icon')) return;

        let value = '';
        const textEl = row.querySelector('.display-text, span') || row;
        const rawText = textEl ? textEl.textContent : '';
        const valMatch = rawText.match(/(\d+)\s*%/);
        if (valMatch) {
            value = valMatch[1];
        }

        let target = row.dataset.target;
        if (!target) {
            const isEnemyIcon = 
                iconSrc.includes('st_0011') || 
                iconSrc.includes('st_0012') || 
                iconSrc.includes('st_1009') || 
                iconSrc.includes('st_0100') || 
                iconSrc.includes('st_0102');   

            if (isEnemyIcon || /enemy|debuff|lower|seal|stun|break|disable/i.test(rawText)) {
                target = 'enemy';
            } else if (/ally|allies/i.test(rawText)) {
                target = 'ally';
            } else {
                let isAtk = iconSrc.includes('st_0001');
                let isDef = iconSrc.includes('st_0002');
                let isCrit = iconSrc.includes('st_critical_up') || iconSrc.includes('pot_skill');
                
                let statRegex = isAtk ? /atk/i : (isDef ? /def/i : (isCrit ? /critical|crit/i : /raise|boost/i));
                
                let hasSelf = clauses.some(c => statRegex.test(c) && !/ally|allies|enemy|lower|debuff/i.test(c));
                let hasAlly = clauses.some(c => statRegex.test(c) && /ally|allies|team|party/i.test(c));

                let exactClause = clauses.find(c => statRegex.test(c) && value && c.includes(value + '%'));
                if (!exactClause && value) {
                    if (value === '100') exactClause = clauses.find(c => statRegex.test(c) && /massively/i.test(c));
                    else if (value === '50') exactClause = clauses.find(c => statRegex.test(c) && /greatly/i.test(c));
                }

                let isAllyExact = exactClause && /ally|allies|team|party/i.test(exactClause);

                if (isAllyExact) {
                    if (hasSelf && assignedTargets.has(`${iconSrc}-ally`)) target = 'self';
                    else target = 'ally';
                } else if (exactClause && !isAllyExact) {
                    if (hasAlly && assignedTargets.has(`${iconSrc}-self`)) target = 'ally';
                    else target = 'self';
                } else if (hasAlly && !hasSelf) {
                    target = 'ally';
                } else if (hasAlly && hasSelf) {
                    if (!assignedTargets.has(`${iconSrc}-self`)) target = 'self';
                    else target = 'ally';
                } else {
                    target = 'self';
                }
            }
        }
        
        assignedTargets.add(`${iconSrc}-${target}`);

        let turns = row.dataset.turns;
        if (!turns) {
            let isAtk = iconSrc.includes('st_0001') || /atk/i.test(rawText);
            let isDef = iconSrc.includes('st_0002') || /def/i.test(rawText);
            let isCrit = iconSrc.includes('st_critical_up') || iconSrc.includes('pot_skill') || /critical|crit/i.test(rawText);
            
            let isStunOrSeal = iconSrc.includes('st_0100') || iconSrc.includes('st_0102') || /stun|seal/i.test(rawText);
            let isAttackBreak = iconSrc.includes('st_1009') || /disable|break/i.test(rawText);
            let isLowerStat = iconSrc.includes('st_0011') || iconSrc.includes('st_0012') || /lower/i.test(rawText);
            let isRaiseStat = iconSrc.includes('st_0001') || iconSrc.includes('st_0002') || /raise|boost/i.test(rawText);

            if (isAttackBreak) {
                turns = '1 turn';
            } else if (isStunOrSeal) {
                const specificClause = clauses.find(c => /stun|seal/i.test(c)) || effectsText;
                const stunTurnMatch = specificClause.match(/(?:stun|seal)[^\.\;\,]*?for\s+(\d+)\s+turn/i);
                if (stunTurnMatch) {
                    const num = parseInt(stunTurnMatch[1], 10);
                    turns = `${num} turn${num > 1 ? 's' : ''}`;
                } else {
                    turns = '2 turns';
                }
            } else {
                const targetClauses = clauses.filter(c => {
                    const isAllyClause = /ally|allies|team|party/i.test(c);
                    if (isLowerStat && !/lower|down/i.test(c)) return false;
                    if (isRaiseStat && !/raise|boost/i.test(c)) return false;
                    if (isCrit && !/critical|crit/i.test(c)) return false;
                    return target === 'ally' ? isAllyClause : !isAllyClause;
                });

                let specificClause = null;
                if (isAtk && !isDef) specificClause = targetClauses.find(c => /atk/i.test(c) && !/def/i.test(c)) || targetClauses.find(c => /atk/i.test(c));
                else if (isDef && !isAtk) specificClause = targetClauses.find(c => /def/i.test(c) && !/atk/i.test(c)) || targetClauses.find(c => /def/i.test(c));
                else if (isCrit) specificClause = targetClauses.find(c => /critical|crit/i.test(c));
                
                if (!specificClause) specificClause = targetClauses[0] || effectsText;

                const clauseTurnMatch = specificClause.match(/for\s+(\d+)\s+turn/i);

                if (clauseTurnMatch) {
                    const num = parseInt(clauseTurnMatch[1], 10);
                    turns = `${num} turn${num > 1 ? 's' : ''}`;
                } else if (jointTurns && (isAtk || isDef) && !/ally|allies/i.test(specificClause) && !isLowerStat) {
                    turns = jointTurns;
                } else if (isLowerStat) {
                    turns = '3 turns';
                } else if (/raise|raises|boost/i.test(specificClause)) {
                    turns = '99 turns';
                } else {
                    turns = '1 turn';
                }
            }
        }

        stats.push({
            icon: iconSrc,
            value: value,
            turns: turns,
            target: target
        });
    });

    const uniqueStats = [];
    const seen = new Set();
    stats.forEach(s => {
        const key = `${s.icon}-${s.value}-${s.target}-${s.turns}`;
        if (!seen.has(key)) {
            seen.add(key);
            uniqueStats.push(s);
        }
    });

    return uniqueStats;
}

/* ============================================================
   DOKKAN DB SPECIAL EFFECTS BADGE RENDERER
   ============================================================ */
function renderDbSpecialEffects(stats) {
    if (!stats || stats.length === 0) return '';

    const selfStats = stats.filter(s => s.target === 'self');
    const allyStats = stats.filter(s => s.target === 'ally' || s.target === 'allies');
    const enemyStats = stats.filter(s => s.target === 'enemy');

    const renderGroup = (label, typeClass, statList) => {
        if (statList.length === 0) return '';
        
        const badgesHtml = statList.map(stat => {
            const iconSrc = getDbStatIconPath(stat.icon);
            const valText = stat.value ? `${stat.value}%` : '';
            const durationText = stat.turns || '1 turn';

            return `
                <div class="db-effect-badge">
                    <div class="db-badge-top">
                        <img src="${iconSrc}" alt="stat">
                        ${valText ? `<span>${valText}</span>` : ''}
                    </div>
                    <div class="db-badge-bottom">${durationText}</div>
                </div>
            `;
        }).join('');

        return `
            <div class="db-effect-group ${typeClass}">
                <span class="db-group-label ${typeClass}">${label}</span>
                ${badgesHtml}
            </div>
        `;
    };

    return `
        <div class="db-special-effects-section">
            <div class="db-special-effects-title">SPECIAL EFFECTS</div>
            <div class="db-special-effects-groups">
                ${renderGroup('SELF', 'self', selfStats)}
                ${renderGroup('ALLIES', 'allies', allyStats)}
                ${renderGroup('ENEMY', 'enemy', enemyStats)}
            </div>
        </div>
    `;
}

/* ============================================================
   SIMPLIFIED DAMAGE MULTIPLIER RENDERER (DOKKAN DB MODE)
   ============================================================ */
window.renderDbDamageMultiplier = function(text, typeLabel = '', isActive = false, kiText = '') {
    if (!text) return '';
    const low = text.toLowerCase();
    const lowLabel = typeLabel.toLowerCase().trim();

    // Hide Damage Multipliers completely for EX Super Attacks
    if (/ex\b|ex\s/i.test(lowLabel) || lowLabel.startsWith('ex')) {
        return '';
    }

    // Chart-based Max Multipliers (at Lv 10 TUR, Lv 15 EZA TUR, Lv 20 LR, Lv 25 EZA LR)
    const baseMultipliers = {
        'mega-colossal': { 10: 440, 15: 490, 20: 570, 25: 620 },
        'colossal':      { 10: 345, 15: 370, 20: 425, 25: 450 },
        'ultimate':      { 10: 550, 15: 600, 20: 650, 25: 700 },
        'immense':       { 10: 505, 15: 570, 20: 705, 25: 755 },
        'supreme':       { 10: 430, 15: 530, 20: 630, 25: 680 },
        'destructive':   { 10: 290, 15: 360, 20: 390, 25: 420 },
        'extreme':       { 10: 355, 15: 450, 20: 480, 25: 510 },
        'mass':          { 10: 355, 15: 450, 20: 480, 25: 510 },
        'huge':          { 10: 290, 15: 360, 20: 390, 25: 420 },
        'damage':        { 10: 260, 15: 330, 20: 360, 25: 390 },
        'low':           { 10: 220, 15: 290, 20: 320, 25: 350 }
    };

    let matchedTier = null;

    if (low.includes('mega-colossal')) {
        matchedTier = 'mega-colossal';
    } else if (low.includes('colossal')) {
        matchedTier = 'colossal';
    } else if (low.includes('ultimate')) {
        matchedTier = 'ultimate';
    } else if (low.includes('immense')) {
        matchedTier = 'immense';
    } else if (low.includes('supreme')) {
        matchedTier = 'supreme';
    } else if (low.includes('destructive')) {
        matchedTier = 'destructive';
    } else if (low.includes('extreme')) {
        matchedTier = 'extreme';
    } else if (low.includes('mass')) {
        matchedTier = 'mass';
    } else if (low.includes('huge')) {
        matchedTier = 'huge';
    } else if (low.includes('low')) {
        matchedTier = 'low';
    }

    if (!matchedTier) return '';

    // Determine max Lv based on Rarity and Awakening Mode
    let maxLv = 10;
    const isLR = currentRarity === 'LR';
    const isEZA = currentAwakeningMode === 'eza' || currentAwakeningMode === 'seza';

    if (isLR) {
        maxLv = isEZA ? 25 : 20;
    } else {
        maxLv = isEZA ? 15 : 10;
    }

    const maxVal = (baseMultipliers[matchedTier][maxLv] || baseMultipliers[matchedTier][10] || 430) + '%';
    const cleanKi = kiText ? kiText.replace(/[\(\)]/g, '').trim() : '';

    return `
        <div class="db-damage-multiplier-box">
            <div class="db-multiplier-left">
                <span class="db-multiplier-title">DAMAGE MULTIPLIER</span>
                ${cleanKi ? `<span class="db-multiplier-ki-tag">${cleanKi}</span>` : ''}
            </div>
            <div class="db-multiplier-pills">
                <div class="db-multiplier-pill">
                    <span class="pill-val">${maxVal}</span>
                    <span class="pill-at">at</span>
                    <span class="pill-lv">Lv. ${maxLv}</span>
                </div>
            </div>
        </div>
    `;
};

let dbSaRenderTimer = null;

window.updateDokkanDBSuperAttacks = function() {
    if (dbSaRenderTimer) cancelAnimationFrame(dbSaRenderTimer);

    dbSaRenderTimer = requestAnimationFrame(() => {
        const container = document.getElementById('db-sa-container');
        if (!container) return;

        const blocks = document.querySelectorAll('.sa-block');
        if (blocks.length === 0) {
            container.innerHTML = '';
            window.updateDokkanDBActiveSkills();
            return;
        }

        let htmlBuffer = '';

        blocks.forEach((block) => {
            let typeLabel = block.querySelector('.sa-type-label')?.textContent || 'Super Attack';
            const saName = block.querySelector('.sa-display-name')?.textContent || 'Super Attack';
            const saIcon = block.querySelector('.sa-display-icon')?.getAttribute('src') || './images/sp_skill_icon_01.png';

            const effectCols = block.querySelectorAll('.sa-display-effects-list .col');
            let lines = [];
            effectCols.forEach(c => {
                const txt = c.innerText.trim();
                if (txt && !lines.includes(txt)) lines.push(txt);
            });
            if (lines.length === 0) {
                const raw = block.querySelector('.sa-display-effects-list')?.innerText || '';
                lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
            }
            const effectsFormatted = lines.join('<br>');

            const actRow = block.querySelector('.activation-row');
            const actText = block.querySelector('.activation-text')?.innerText || '';
            const showAct = actRow && !actRow.classList.contains('d-none') && actText.trim();
            const cleanActText = actText.replace(/^Activation Conditions?\s*/i, '').trim();

            let kiText = '';
            const combinedText = (cleanActText + ' ' + effectsFormatted).toLowerCase();
            
            const explicitKiMatch = combinedText.match(/(?:performed\s+with|when\s+ki\s+is|at|with)\s+(\d+)\s*ki/i) ||
                                   combinedText.match(/(\d+)\s*ki\s*(?:or\s+more|or\s+higher|required)?/i);

            if (explicitKiMatch) {
                const kiNum = parseInt(explicitKiMatch[1], 10);
                if (kiNum >= 1 && kiNum <= 24) {
                    kiText = `${kiNum} Ki`;
                }
            }

            if (!kiText) {
                const lowLabel = typeLabel.toLowerCase().trim();
                if (lowLabel.includes('ultra')) {
                    kiText = '18 Ki';
                } else if (lowLabel.includes('super attack')) {
                    kiText = '12 Ki';
                }
            }

            let formattedTypeLabel = typeLabel;
            if (/^ex\b/i.test(typeLabel)) {
                formattedTypeLabel = typeLabel.replace(/^ex\b/i, '<span class="db-ex-prefix">EX</span>');
            }

            const stats = getStatsFromBlock(block);
            const specialEffectsHtml = renderDbSpecialEffects(stats);
            const damageMultiplierHtml = window.renderDbDamageMultiplier(effectsFormatted, typeLabel, false, kiText);

            // SA Lv 20 Bonus Box for LRs (Matches Damage Multiplier Box Layout)
            const isLR = currentRarity === 'LR';
            let bonusBoxHtml = '';
            if (isLR) {
                bonusBoxHtml = `
                    <div class="db-sa-bonus-box">
                        <div class="db-bonus-left">
                            <span class="db-bonus-title">At SA LVL 20: Super Attack +30%</span>
                          
                        </div>
                        <div class="db-multiplier-pills">
                            <div class="db-multiplier-pill">
                                <span class="pill-val">+30%</span>
                                <span class="pill-at">at</span>
                                <span class="pill-lv">Lv. 20</span>
                            </div>
                        </div>
                    </div>
                `;
            }

            htmlBuffer += `
                <div class="db-box mb-3">
                    <div class="db-header">
                        <div class="db-sa-header-title">
                            <img src="${saIcon}" class="db-sa-icon-left" alt="SA Icon">
                            <span>
                                <span class="db-sa-title-text">${formattedTypeLabel} | <em class="db-sa-name-glow">${saName}</em></span>
                            </span>
                        </div>
                    </div>
                    <div class="db-content text-start">
                        ${showAct ? `
                            <div class="db-skill-label text-warning mb-1">Condition:</div>
                            <div class="mb-3">${cleanActText}</div>
                        ` : ''}
                        <div class="db-skill-label text-warning mb-1">Effect:</div>
                        <div>${effectsFormatted}</div>
                        ${specialEffectsHtml}
                        ${damageMultiplierHtml}
                        ${bonusBoxHtml}
                    </div>
                </div>
            `;
        });

        container.innerHTML = htmlBuffer;
        window.updateDokkanDBActiveSkills();
    });
};



window.updateDokkanDBActiveSkills = function() {
    const container = document.getElementById('db-active-container') || document.getElementById('db-sa-container');
    if (!container) return;

    const activeBlocks = document.querySelectorAll('.active-block');
    if (activeBlocks.length === 0) {
        const activeBox = document.getElementById('db-active-container');
        if (activeBox) activeBox.innerHTML = '';
        return;
    }

    let htmlBuffer ='';

    activeBlocks.forEach((block) => {
        const typeLabel = block.querySelector('.active-type-label')?.textContent || 'Active Skill';
        const name = block.querySelector('.active-display-name')?.textContent || 'Active Skill';
        const effect = block.querySelector('.active-display-effect')?.innerText || '';
        const activeIconAttr = block.querySelector('.active-display-icon')?.getAttribute('src') || '';

        const hasNoIcon = !activeIconAttr || activeIconAttr === 'none' || activeIconAttr.includes('none');
        const activeIconHtml = hasNoIcon ? '' : `<img src="${activeIconAttr}" class="db-sa-icon-left" alt="Active Icon">`;

        const condRow = block.querySelector('.active-condition-row');
        const condText = block.querySelector('.active-display-condition')?.innerText || '';
        const showCond = condRow && !condRow.classList.contains('d-none') && condText.trim().length > 0;
        const cleanActText = condText.trim();

        const damageMultiplierHtml = window.renderDbDamageMultiplier(effect, typeLabel, true, '');

        htmlBuffer += `
            <div class="db-box mb-3">
                <div class="db-header">
                    <div class="db-sa-header-title">
                        ${activeIconHtml}
                        <span>
                            <span class="db-sa-title-text">${typeLabel} | <em class="db-sa-name-glow">${name}</em></span>
                        </span>
                    </div>
                </div>
                <div class="db-content text-start">
                    ${showCond ? `
                        <div class="db-skill-label text-warning mb-1">Condition:</div>
                        <div class="mb-3">${cleanActText}</div>
                    ` : ''}
                    <div class="db-skill-label text-warning mb-1">Effect:</div>
                    <div>${effect}</div>
                    ${damageMultiplierHtml}
                </div>
            </div>
        `;
    });

    const activeContainer = document.getElementById('db-active-container');
    if (activeContainer) {
        activeContainer.innerHTML = htmlBuffer;
    } else {
        container.insertAdjacentHTML('beforeend', htmlBuffer);
    }
};


/* ============================================================
   PERMANENT PIPE "|" ENFORCER FOR PASSIVE SKILL HEADER
   ============================================================ */

function enforcePassiveHeaderPipe() {
    const el = document.getElementById('db-passive-name');
    if (!el) return;

    let html = el.innerHTML;
    // Only replace hyphen when preceded specifically by 'Passive Skill '
    if (html.includes('Passive Skill -')) {
        el.innerHTML = html.replace('Passive Skill -', 'Passive Skill |');
    } else if (html.includes('Passive Skill &nbsp;-')) {
        el.innerHTML = html.replace('Passive Skill &nbsp;-', 'Passive Skill &nbsp;|');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const el = document.getElementById('db-passive-name');
    if (el) {
        const observer = new MutationObserver(() => {
            observer.disconnect();
            enforcePassiveHeaderPipe();
            observer.observe(el, { childList: true, characterData: true, subtree: true });
        });

        observer.observe(el, { childList: true, characterData: true, subtree: true });
    }
    enforcePassiveHeaderPipe();
});

document.addEventListener('input', (e) => {
    if (e.target && e.target.id === 'input-passive-name-sidebar') {
        setTimeout(enforcePassiveHeaderPipe, 10);
    }
});

window.addEventListener('load', () => {
    setTimeout(enforcePassiveHeaderPipe, 100);
});

document.addEventListener('change', (e) => {
    if (e.target && e.target.id === 'theme-toggle-checkbox') {
        setTimeout(() => { window.updateDokkanDBSuperAttacks(); }, 50);
    }
});

window.addEventListener('pageshow', () => {
    setTimeout(() => { window.updateDokkanDBSuperAttacks(); }, 100);
});

document.addEventListener('visibilitychange', () => {
    if (!document.hidden) window.updateDokkanDBSuperAttacks();
});

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => { window.updateDokkanDBSuperAttacks(); }, 300);
});

/* ============================================================
   TOP BAR FADE-OUT SCROLL LISTENER
   ============================================================ */
window.addEventListener('scroll', () => {
    const topBar = document.querySelector('.scouter-hud-bar');
    if (topBar) {
        if (window.scrollY > 20) {
            topBar.classList.add('scrolled');
        } else {
            topBar.classList.remove('scrolled');
        }
    }
});