// Weight Tracking Manager
class WeightManager {
    constructor() {
        this.storageKey = 'fitness_weight_logs';
        this.initializeStorage();
        this.setupEventListeners();
    }

    initializeStorage() {
        if (!localStorage.getItem(this.storageKey)) {
            localStorage.setItem(this.storageKey, JSON.stringify([]));
        }
    }

    setupEventListeners() {
        const weightForm = document.getElementById('weight-form');
        if (weightForm) {
            weightForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.logWeight();
            });
        }
    }

    logWeight() {
        const weightInput = document.getElementById('weight-input');
        const weight = parseFloat(weightInput.value);
        const unit = document.getElementById('weight-unit-input').value;
        const date = new Date().toISOString().split('T')[0];

        if (isNaN(weight) || weight <= 0) {
            alert('Please enter a valid weight.');
            return;
        }

        const weightLogs = this.getWeightLogs();
        const entry = { date, weight, unit };
        
        // Check if there's already an entry for today
        const todayEntryIndex = weightLogs.findIndex(log => log.date === date);
        if (todayEntryIndex !== -1) {
            weightLogs[todayEntryIndex] = entry;
        } else {
            weightLogs.push(entry);
        }

        localStorage.setItem(this.storageKey, JSON.stringify(weightLogs));
        weightInput.value = '';
        
        // Update UI
        this.updateWeightDisplay();
        chartManager.updateWeightChart();
    }

    getWeightLogs() {
        return JSON.parse(localStorage.getItem(this.storageKey)) || [];
    }

    getLatestWeight() {
        const logs = this.getWeightLogs();
        return logs.length > 0 ? logs[logs.length - 1] : null;
    }

    convertWeight(weight, fromUnit, toUnit) {
        if (fromUnit === toUnit) return weight;
        return fromUnit === 'lbs' ? weight / 2.20462 : weight * 2.20462;
    }

    updateWeightDisplay() {
        const latestWeight = this.getLatestWeight();
        const weightDisplay = document.getElementById('latest-weight');
        if (weightDisplay && latestWeight) {
            weightDisplay.textContent = `${latestWeight.weight.toFixed(1)} ${latestWeight.unit}`;
        }
    }

    getWeightDataForChart(timeRange = '30d') {
        const logs = this.getWeightLogs();
        const settings = storage.getSettings();
        const targetUnit = settings.units;
        
        // Convert all weights to the target unit
        const convertedLogs = logs.map(log => ({
            date: log.date,
            weight: this.convertWeight(log.weight, log.unit, targetUnit)
        }));

        // Filter based on time range
        const now = new Date();
        const daysToShow = parseInt(timeRange);
        const startDate = new Date(now);
        startDate.setDate(startDate.getDate() - daysToShow);

        return convertedLogs.filter(log => new Date(log.date) >= startDate);
    }
}

// Initialize weight manager
window.weightManager = new WeightManager();
