let data = [];

function loadCSV() {
    Papa.parse('flange_data.csv', {
        download: true,
        header: true,
        delimiter: ';',
        complete: function(results) {
            if (results.errors.length > 0) {
                console.error('PapaParse errors:', results.errors);
            }
            data = results.data;
            console.log('Parsed CSV data:', data);
            populateDNOptions();
        },
        error: function(error) {
            console.error('PapaParse failed:', error);
        }
    });
}

function populateDNOptions() {
    const dnSelect = document.getElementById('dn-select');
    const dnValues = [...new Set(data.map(row => row.DN))].sort((a, b) => parseInt(a) - parseInt(b));
    dnSelect.innerHTML = '<option value="">-- Valitse DN --</option>';
    dnValues.forEach(dn => {
        const option = document.createElement('option');
        option.value = dn;
        option.textContent = dn;
        dnSelect.appendChild(option);
    });
}

function updatePNOptions() {
    const dnSelect = document.getElementById('dn-select').value;
    const pn1Select = document.getElementById('pn1-select');
    const pn2Select = document.getElementById('pn2-select');
    pn1Select.innerHTML = '<option value="">-- Valitse PN --</option>';
    pn2Select.innerHTML = '<option value="">-- Valitse PN --</option>';

    if (dnSelect) {
        const pnValues = data.filter(row => row.DN === dnSelect).map(row => row.PN).sort();
        pnValues.forEach(pn => {
            const option1 = document.createElement('option');
            option1.value = pn;
            option1.textContent = pn;
            pn1Select.appendChild(option1);
            const option2 = document.createElement('option');
            option2.value = pn;
            option2.textContent = pn;
            pn2Select.appendChild(option2);
        });
    }
    checkCompatibility();
}

function checkCompatibility() {
    const dnSelect = document.getElementById('dn-select').value;
    const pn1Select = document.getElementById('pn1-select').value;
    const pn2Select = document.getElementById('pn2-select').value;
    const compatibilityResult = document.getElementById('compatibility-result');
    const flangeTableBody = document.getElementById('flange-table-body');

    flangeTableBody.innerHTML = '';
    compatibilityResult.textContent = 'Yhteensopivuus: -';

    if (!dnSelect || !pn1Select || !pn2Select) {
        return;
    }

    const flange1 = data.find(row => row.DN === dnSelect && row.PN === pn1Select);
    const flange2 = data.find(row => row.DN === dnSelect && row.PN === pn2Select);

    if (!flange1 || !flange2) {
        compatibilityResult.textContent = 'Yhteensopivuus: Tietoja ei löydy';
        return;
    }

    // Näytä laippojen tiedot taulukossa
    const row1 = document.createElement('tr');
    row1.innerHTML = `
        <td>Laippa 1</td>
        <td>${flange1.DN}</td>
        <td>${flange1.PN}</td>
        <td>${flange1.Flange_Diameter}</td>
        <td>${flange1.PCD}</td>
        <td>${flange1.Holes}</td>
        <td>${flange1.Hole_Diameter}</td>
    `;
    const row2 = document.createElement('tr');
    row2.innerHTML = `
        <td>Laippa 2</td>
        <td>${flange2.DN}</td>
        <td>${flange2.PN}</td>
        <td>${flange2.Flange_Diameter}</td>
        <td>${flange2.PCD}</td>
        <td>${flange2.Holes}</td>
        <td>${flange2.Hole_Diameter}</td>
    `;
    flangeTableBody.appendChild(row1);
    flangeTableBody.appendChild(row2);

    // Tarkista yhteensopivuus
    let compatibilityIssues = [];
    if (flange1.PCD !== flange2.PCD) {
        compatibilityIssues.push(`PCD eroaa (${flange1.PCD} mm vs. ${flange2.PCD} mm)`);
    }
    if (flange1.Holes !== flange2.Holes) {
        compatibilityIssues.push(`Reikien määrä eroaa (${flange1.Holes} vs. ${flange2.Holes})`);
    }
    if (flange1.Hole_Diameter !== flange2.Hole_Diameter) {
        compatibilityIssues.push(`Pultinreiän halkaisija eroaa (${flange1.Hole_Diameter} mm vs. ${flange2.Hole_Diameter} mm)`);
    }
    if (flange1.Flange_Diameter !== flange2.Flange_Diameter) {
        compatibilityIssues.push(`Laipan halkaisija eroaa (${flange1.Flange_Diameter} mm vs. ${flange2.Flange_Diameter} mm)`);
    }

    if (compatibilityIssues.length === 0) {
        compatibilityResult.textContent = `Yhteensopivuus: Laipat (${flange1.DN} ${flange1.PN} ja ${flange2.DN} ${flange2.PN}) ovat yhteensopivia`;
    } else {
        compatibilityResult.textContent = `Yhteensopivuus: Laipat eivät ole yhteensopivia, koska: ${compatibilityIssues.join(', ')}`;
    }
}

window.onload = loadCSV;
