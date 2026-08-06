/* ============================================================
   PASSIVE MANAGER 2.0
   ============================================================ */
window.toggleSectionCollapse = function(id, btn) {
    const content = document.getElementById("side-content-" + id);
    if (!content) return;
    if (content.style.display === "none") {
        content.style.display = "block";
        btn.innerText = "−"; 
        btn.title = "Collapse Section";
    } else {
        content.style.display = "none";
        btn.innerText = "□"; 
        btn.title = "Expand Section";
    }
};

window.confirmDeleteSection = function(btn, id) {
    if (btn.innerText === '×') {
        btn.innerText = '?'; 
        btn.style.background = '#facc15'; 
        btn.style.color = '#000'; 
        btn.title = "Click again to confirm delete";
        setTimeout(() => {
            if (btn && btn.innerText === '?') {
                btn.innerText = '×';
                btn.style.background = '#ef4444';
                btn.style.color = '#fff';
                btn.title = "Delete";
            }
        }, 3000);
    } else {
        window.removeThisSection(id);
    }
};

window.reindexSections = function() {
    const sidebarArea = document.getElementById("sidebar-sections-area");
    const sections = sidebarArea.querySelectorAll('[id^="side-sec-"]');
    sections.forEach((sec, index) => {
        const label = sec.querySelector('b');
        if (label) label.innerText = `SECTION ${index + 1}`;
    });
};

window.addNewSection = function() {
    sIdx++;
    document.getElementById('card-passive-container').insertAdjacentHTML('beforeend', 
        `<div id="card-sec-${sIdx}"><strong id="card-header-text-${sIdx}" style="display:block; margin-top:0px;">Basic effect(s)</strong><ul id="card-ul-${sIdx}"></ul></div>`);
    
    document.getElementById('sidebar-sections-area').insertAdjacentHTML('beforeend', `
        <div id="side-sec-${sIdx}" style="background:#222; border:1px solid #555; padding:10px; margin-top:10px; border-radius:5px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <b style="font-size: 12px; color: #a1a1aa;">SECTION ${sIdx}</b>
                <div style="display:flex; gap: 4px;">
                    <button onclick="toggleSectionCollapse(${sIdx}, this)" title="Collapse Section" style="background:#3f3f46; color:white; border:none; width:22px; height:22px; font-size:12px; cursor:pointer; border-radius:3px; display:flex; justify-content:center; align-items:center;">−</button>
                    <button onclick="moveSection(${sIdx}, -1)" title="Move Up" style="background:#3f3f46; color:white; border:none; width:22px; height:22px; font-size:12px; cursor:pointer; border-radius:3px; display:flex; justify-content:center; align-items:center;">↑</button>
                    <button onclick="moveSection(${sIdx}, 1)" title="Move Down" style="background:#3f3f46; color:white; border:none; width:22px; height:22px; font-size:12px; cursor:pointer; border-radius:3px; display:flex; justify-content:center; align-items:center;">↓</button>
                    <button onclick="confirmDeleteSection(this, ${sIdx})" title="Delete" style="background:#ef4444; color:white; border:none; width:22px; height:22px; font-size:12px; cursor:pointer; font-weight:bold; border-radius:3px; display:flex; justify-content:center; align-items:center;">×</button>
                </div>
            </div>
            <div id="side-content-${sIdx}">
                <input type="text" oninput="updateHeader(${sIdx}, this.value)" value="Basic effect(s)" class="form-control form-control-sm mb-2 mt-2">
                <textarea id="input-sec-${sIdx}" oninput="updateSection(${sIdx}, this.value)" class="form-control form-control-sm mb-2" rows="7" placeholder="Type effects here... Press Enter for a new line.">- New effect...</textarea>
                <div style="margin-top:5px; display:flex; gap: 6px; width: 100%;">
                    <button onclick="insertShortcut('input-sec-${sIdx}', ':up:')" title="Green Up Arrow" class="btn-icon-tool" style="color:#00ffcc; font-size: 15px; padding: 3px 7px; flex: 1;">↑</button>
                    <button onclick="insertShortcut('input-sec-${sIdx}', ':down:')" title="Self debuff arrow" class="btn-icon-tool" style="color:#ff4444; font-size: 15px; padding: 3px 7px; flex: 1;">↓</button>
                    <button onclick="insertShortcut('input-sec-${sIdx}', ':ydown:')" title="Enemy debuff arrow" class="btn-icon-tool" style="color:#FFFF00; font-size: 15px; padding: 3px 7px; flex: 1;">↓</button>
                    <button onclick="insertShortcut('input-sec-${sIdx}', ':once:')" title="Once only" class="btn-icon-tool" style="font-size: 15px; padding: 3px 7px; flex: 1;">!</button>
                    <button onclick="insertShortcut('input-sec-${sIdx}', ':inf:')" title="Infinite" class="btn-icon-tool" style="font-size: 15px; padding: 3px 7px; flex: 1;">∞</button>
                </div>
            </div>
        </div>`);
        
    window.updateSection(sIdx, "- New effect...");
    window.reindexSections();
};

window.updateHeader = function(id, val) {
    const el = document.getElementById("card-header-text-" + id);
    if(el) el.innerText = val;
    const input = document.querySelector(`#side-sec-${id} input[type="text"]`);
    if (input) input.setAttribute('value', val);
};

window.insertShortcut = function(targetId, code) {
    const ta = document.getElementById(targetId);
    if(!ta) return;
    const startPos = ta.selectionStart;
    const endPos = ta.selectionEnd;
    const text = ta.value;
    ta.value = text.substring(0, startPos) + code + text.substring(endPos);
    ta.selectionStart = ta.selectionEnd = startPos + code.length;
    ta.focus();
    const sectionId = targetId.split('-').pop();
    window.updateSection(sectionId, ta.value);
};

window.updateSection = function(id, val) {
    const ta = document.getElementById(`input-sec-${id}`);
    if (ta) {
        ta.textContent = val;
        ta.setAttribute('value', val);
    }
    const icons = {
        ':up:': '<img src="./images/passive_skill_dialog_arrow01.png" class="dokkan-icon" style="height:18px">',
        ':down:': '<img src="./images/passive_skill_dialog_arrow02.png" class="dokkan-icon" style="height:18px">',
        ':ydown:': '<img src="./images/passive_skill_dialog_arrow03.png" class="dokkan-icon" style="height:18px">',
        ':once:' : '<img src="./images/passive_skill_dialog_icon_01.png" class="dokkan-icon" style="height:18px">',
        ':inf:': '<img src="./images/passive_skill_dialog_icon_02.png" class="dokkan-icon" style="height:18px">'
    };
    let out = val;
    for (const [code, img] of Object.entries(icons)) { out = out.replace(new RegExp(code, 'g'), img); }
    const lines = out.split('\n');
    let html = "";
    lines.forEach(line => {
        let trimmed = line.trim();
        if (trimmed.startsWith('-')) trimmed = trimmed.substring(1).trim();
        if (trimmed !== "") html += `<li>${trimmed}</li>`;
    });
    const ul = document.getElementById("card-ul-" + id);
    if(ul) ul.innerHTML = html;
};

window.removeThisSection = function(id) {
    document.getElementById("card-sec-" + id)?.remove();
    document.getElementById("side-sec-" + id)?.remove();
    window.reindexSections(); 
};