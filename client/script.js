document.getElementById('dataForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const start = document.getElementById('start').value;
    const end = document.getElementById('end').value;
    const fields = document.getElementById('fields').value;

    // Fetch data from the API
    const response = await fetch(`http://localhost:3000/api/stocks/multiple?start=${start}&end=${end}&fields=${fields}`);
    
    // Check if the response is OK
    if (!response.ok) {
        console.error('Network response was not ok:', response.statusText);
        return;
    }

    const data = await response.json();

    // Prepare data for the price chart
    const labels = data.map(item => item.Date);
    const priceDatasets = fields.split(',').map((field, index) => ({
        label: field.trim(),
        data: data.map(item => item[field.trim()]),
        borderColor: `hsl(${index * 90}, 70%, 50%)`,
        fill: false
    }));

    // Render price chart
    const priceCtx = document.getElementById('priceChart').getContext('2d');

    // Destroy existing chart instance if it exists
    if (window.priceChart && typeof window.priceChart.destroy === 'function') {
        console.log('Destroying existing price chart');
        window.priceChart.destroy();
    }

    // Create a new price chart
    window.priceChart = new Chart(priceCtx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: priceDatasets
        },
        options: {
            responsive: true,
            scales: {
                x: { title: { display: true, text: 'Date' } },
                y: { title: { display: true, text: 'Price' } }
            }
        }
    });

    // Prepare data for the volume chart
    const volumeData = data.map(item => item.Volume);
    const volumeCtx = document.getElementById('volumeChart').getContext('2d');

    // Destroy existing volume chart instance if it exists
    if (window.volumeChart && typeof window.volumeChart.destroy === 'function') {
        console.log('Destroying existing volume chart');
        window.volumeChart.destroy();
    }

    // Create a new volume chart
    window.volumeChart = new Chart(volumeCtx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Volume',
                data: volumeData,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: { title: { display: true, text: 'Date' } },
                y: { title: { display: true, text: 'Volume' }, beginAtZero: true }
            }
        }
    });

    // Calculate and display statistics for the specified fields
    const statistics = calculateStatistics(data, fields.split(','));
    displayStatistics(statistics);
});

// Function to calculate statistics
function calculateStatistics(data, fields) {
    const stats = {};

    fields.forEach(field => {
        const values = data.map(item => parseFloat(item[field.trim()])).filter(value => !isNaN(value));
        const dates = data.map(item => item.Date);

        const maxIndex = values.indexOf(Math.max(...values));
        const minIndex = values.indexOf(Math.min(...values));

        const max = Math.max(...values);
        const min = Math.min(...values);
        const avg = values.reduce((sum, value) => sum + value, 0) / values.length;
        const stdDev = Math.sqrt(values.map(x => Math.pow(x - avg, 2)).reduce((a, b) => a + b) / values.length);

        stats[field.trim()] = {
            max: { value: max, date: dates[maxIndex] },
            min: { value: min, date: dates[minIndex] },
            avg,
            stdDev,
        };
    });

    return stats;
}

// Function to display statistics
function displayStatistics(statistics) {
    document.getElementById('maxValue').innerText = ''; // Clear previous values
    document.getElementById('minValue').innerText = ''; // Clear previous values
    document.getElementById('avgValue').innerText = ''; // Clear previous values
    document.getElementById('stdDevValue').innerText = ''; // Clear previous values

    Object.keys(statistics).forEach(field => {
        const stat = statistics[field];
        document.getElementById('maxValue').innerText += `${field} Max: ${stat.max.value} on ${stat.max.date}\n`;
        document.getElementById('minValue').innerText += `${field} Min: ${stat.min.value} on ${stat.min.date}\n`;
        document.getElementById('avgValue').innerText += `${field} Avg: ${stat.avg}\n`;
        document.getElementById('stdDevValue').innerText += `${field} Std Dev: ${stat.stdDev}\n`;
    });
}

