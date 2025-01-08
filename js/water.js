// Water tracking module

// Initialize water tracking
function initWaterTracking() {
    loadUserSettings();
    loadDailyIntake();
    setupEventListeners();
}

// Update water goal based on user settings
function updateWaterGoal() {
    const weight = parseFloat(document.getElementById('user-weight').value);
    const weightUnit = document.getElementById('user-weight-unit').value;
    const age = parseInt(document.getElementById('user-age').value);
    const activityLevel = document.getElementById('activity-level').value;
    const climate = document.getElementById('climate').value;

    if (isNaN(weight) || isNaN(age) || weight <= 0 || age <= 0) {
        alert('Please enter valid weight and age values.');
        return;
    }

    // Update water settings
    storage.updateWaterSettings({ weight, weightUnit, age, activityLevel, climate });

    // Calculate and update display
    updateWaterDisplay();
    document.dispatchEvent(new Event('waterUpdated'));
}

// Log water intake
function logWaterIntake() {
    const amount = parseFloat(document.getElementById('water-amount').value);
    const unit = document.getElementById('water-unit').value;

    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount.');
        return;
    }

    // Add water intake using storage manager
    storage.addWaterIntake(amount, unit);

    // Clear input
    document.getElementById('water-amount').value = '';

    // Update displays
    updateWaterDisplay();
    calendar.refresh(); // Refresh calendar to show updated water intake
    document.dispatchEvent(new Event('waterUpdated'));
}

// Update water tracking display
function updateWaterDisplay() {
    const settings = storage.getWaterSettings();
    const dailyIntake = storage.getWaterIntake();
    const recommendedGoal = settings.recommendedGoal || 2000; // Default to 2000ml if not set

    // Update goal display
    document.getElementById('water-goal').textContent = recommendedGoal;
    
    // Update intake display
    document.getElementById('water-intake').textContent = Math.round(dailyIntake);

    // Update progress bar
    const progress = Math.min((dailyIntake / recommendedGoal) * 100, 100);
    document.getElementById('water-progress').style.width = `${progress}%`;
}

// Load saved user settings
function loadUserSettings() {
    const settings = storage.getWaterSettings();
    if (settings) {
        document.getElementById('user-weight').value = settings.weight || '';
        document.getElementById('user-weight-unit').value = settings.weightUnit || 'kg';
        document.getElementById('user-age').value = settings.age || '';
        document.getElementById('activity-level').value = settings.activityLevel || 'low';
        document.getElementById('climate').value = settings.climate || 'normal';
    }
}

// Load daily intake
function loadDailyIntake() {
    // Reset daily intake if it's a new day
    const lastUpdate = localStorage.getItem('lastWaterUpdate');
    const today = new Date().toDateString();
    
    if (lastUpdate !== today) {
        storage.resetDailyWaterIntake();
        localStorage.setItem('lastWaterUpdate', today);
    }

    updateWaterDisplay();
}

// Setup event listeners
function setupEventListeners() {
    // Water intake form submission
    const waterAmount = document.getElementById('water-amount');
    waterAmount.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            logWaterIntake();
        }
    });

    // Settings change listeners
    const userWeight = document.getElementById('user-weight');
    const userWeightUnit = document.getElementById('user-weight-unit');
    const userAge = document.getElementById('user-age');
    const activityLevel = document.getElementById('activity-level');
    const climate = document.getElementById('climate');

    // Add change listeners to all settings inputs
    if (userWeight) {
        userWeight.addEventListener('input', () => {
            if (userWeight.value && userAge.value) {
                updateWaterGoal();
            }
        });
    }
    if (userWeightUnit) {
        userWeightUnit.addEventListener('change', updateWaterGoal);
    }
    if (userAge) {
        userAge.addEventListener('input', () => {
            if (userWeight.value && userAge.value) {
                updateWaterGoal();
            }
        });
    }
    if (activityLevel) {
        activityLevel.addEventListener('change', updateWaterGoal);
    }
    if (climate) {
        climate.addEventListener('change', updateWaterGoal);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initWaterTracking);
