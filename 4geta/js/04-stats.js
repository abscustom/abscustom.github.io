/* ============================================================
   ULTIMATE DOKKAN STAT CALCULATOR
============================================================ */
const potentialBonuses = {
    agl: { hp: 4600, atk: 5000, def: 5400 },
    teq: { hp: 4600, atk: 5400, def: 5000 },
    int: { hp: 5000, atk: 5000, def: 5000 },
    str: { hp: 5000, atk: 5400, def: 4600 },
    phy: { hp: 5400, atk: 5000, def: 4600 },
    none: { hp: 0, atk: 0, def: 0 }
};

window.calculatedStats = {
    hp: { '0%': 0, '55%': 0, '69%': 0, '79%': 0, '90%': 0, '100%': 0 },
    atk: { '0%': 0, '55%': 0, '69%': 0, '79%': 0, '90%': 0, '100%': 0 },
    def: { '0%': 0, '55%': 0, '69%': 0, '79%': 0, '90%': 0, '100%': 0 }
};

window.currentDbStatPct = window.currentDbStatPct || '100%';

window.setDbStatPercent = function(pct) {
    window.currentDbStatPct = pct;
    document.querySelectorAll('.db-stat-tab').forEach(tab => {
        if (tab.innerText.trim() === pct) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    window.updateDbStatDisplay();
};

window.updateDbStatDisplay = function() {
    const pct = window.currentDbStatPct || '100%';
    const hpVal = window.calculatedStats.hp[pct] || 0;
    const atkVal = window.calculatedStats.atk[pct] || 0;
    const defVal = window.calculatedStats.def[pct] || 0;

    const hpEl = document.getElementById('db-stat-hp-val');
    const atkEl = document.getElementById('db-stat-atk-val');
    const defEl = document.getElementById('db-stat-def-val');

    if (hpEl) hpEl.innerText = hpVal.toLocaleString();
    if (atkEl) atkEl.innerText = atkVal.toLocaleString();
    if (defEl) defEl.innerText = defVal.toLocaleString();
};

window.calcFromMax = function(statType, explicitMin = null) {
    const maxValInput = document.getElementById(`input-${statType}-max`);
    if (!maxValInput) return;

    const baseMax = parseInt(maxValInput.value) || 0;
    const maxLv = parseInt(document.getElementById("max-lv").textContent);
    
    let minVal = explicitMin !== null ? explicitMin : Math.round(baseMax / 3.3);

    let growth = baseMax - minVal;
    let ezaBonus = Math.round(growth * 0.4839);
    let ezaBaseMax = baseMax + ezaBonus;

    const isEZA = (currentAwakeningMode === 'eza' || currentAwakeningMode === 'seza') && maxLv !== 150;
    const effectiveBaseMax = isEZA ? ezaBaseMax : baseMax;

    const freePathBonus = 2000; 
    const rainbowBonus = potentialBonuses[currentType] ? potentialBonuses[currentType][statType] : 5000;
    const dupeBonus = Math.max(0, rainbowBonus - freePathBonus);

    document.getElementById(`stat-${statType}-min`).innerText = minVal.toLocaleString();
    document.getElementById(`stat-${statType}-max`).innerText = baseMax.toLocaleString();
    document.getElementById(`stat-${statType}-55`).innerText = (baseMax + freePathBonus).toLocaleString();
    document.getElementById(`stat-${statType}-100`).innerText = (baseMax + rainbowBonus).toLocaleString();

    document.getElementById(`stat-${statType}-eza-max`).innerText = ezaBaseMax.toLocaleString();
    document.getElementById(`stat-${statType}-eza-100`).innerText = (ezaBaseMax + rainbowBonus).toLocaleString();

    // Store calculated values for interactive DB Stats tabs
    if (!window.calculatedStats) window.calculatedStats = { hp: {}, atk: {}, def: {} };
    window.calculatedStats[statType] = {
        '0%': effectiveBaseMax,
        '55%': effectiveBaseMax + freePathBonus,
        '69%': effectiveBaseMax + freePathBonus + Math.round(dupeBonus * 0.45),
        '79%': effectiveBaseMax + freePathBonus + Math.round(dupeBonus * 0.70),
        '90%': effectiveBaseMax + freePathBonus + Math.round(dupeBonus * 0.85),
        '100%': effectiveBaseMax + rainbowBonus
    };

    window.updateDbStatDisplay();

    const ezaCols = document.querySelectorAll('.eza-stat-col');
    if ((currentAwakeningMode === 'eza' || currentAwakeningMode === 'seza') && maxLv !== 150) {
        ezaCols.forEach(el => el.classList.remove('d-none'));
    } else {
        ezaCols.forEach(el => el.classList.add('d-none'));
    }
};

window.calcFromMin = window.calcFromMax;