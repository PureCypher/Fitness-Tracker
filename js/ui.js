class UIManager {
    constructor() {
        this.views = ['dashboard', 'weightlifting', 'cardio', 'meals', 'goals', 'charts', 'settings'];
        this.currentView = 'dashboard';
        this.setupEventListeners();
        this.loadSettings();
    }

    setupEventListeners() {
        // Workout type selector
        document.querySelectorAll('.workout-type-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.dataset.type;
                this.switchWorkoutType(type);
            });
        });

        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.dataset.view;
                this.switchView(view);
                // Update trophy display when switching to goals view
                if (view === 'goals') {
                    this.updateTrophyDisplay();
                }
            });
        });

        // Dark mode toggle
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        darkModeToggle.addEventListener('change', () => {
            this.toggleDarkMode(darkModeToggle.checked);
        });

        // Weight unit toggle
        const weightUnitSelect = document.getElementById('weight-unit');
        weightUnitSelect.addEventListener('change', () => {
            const settings = storage.getSettings();
            settings.units = weightUnitSelect.value;
            storage.saveSettings(settings);
            this.updateWeightUnitDisplays(settings.units);
            // Dispatch event for weight unit change
            document.dispatchEvent(new Event('weightUnitChanged'));
        });

        // Data management
        document.getElementById('export-data').addEventListener('click', this.handleExport.bind(this));
        document.getElementById('import-data').addEventListener('click', () => {
            document.getElementById('import-input').click();
        });
        document.getElementById('import-input').addEventListener('change', this.handleImport.bind(this));
        document.getElementById('clear-data').addEventListener('click', this.handleClearData.bind(this));
    }

    switchWorkoutType(type) {
        // Update button states
        document.querySelectorAll('.workout-type-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === type);
        });

        // Show/hide appropriate form
        const singleForm = document.getElementById('weightlifting-form');
        const circuitForm = document.getElementById('circuit-form');

        if (type === 'single') {
            singleForm.classList.remove('hidden');
            singleForm.classList.add('active');
            circuitForm.classList.add('hidden');
            circuitForm.classList.remove('active');
        } else {
            singleForm.classList.add('hidden');
            singleForm.classList.remove('active');
            circuitForm.classList.remove('hidden');
            circuitForm.classList.add('active');
            
            // Initialize circuit form
            if (circuitForm.querySelector('#circuit-exercise-list').children.length === 0) {
                circuitManager.addExerciseToCircuit();
            }
            
            // Set current date/time
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            circuitForm.querySelector('#circuit-datetime').value = `${year}-${month}-${day}T${hours}:${minutes}`;
        }
    }

    loadSettings() {
        const settings = storage.getSettings();
        
        // Load dark mode setting
        document.getElementById('dark-mode-toggle').checked = settings.darkMode;
        if (settings.darkMode) {
            this.toggleDarkMode(true);
        }

        // Load weight unit setting
        document.getElementById('weight-unit').value = settings.units;
        this.updateWeightUnitDisplays(settings.units);
    }

    updateWeightUnitDisplays(unit) {
        // Update goal unit labels for weightlifting goals
        const goalUnitLabel = document.getElementById('goal-unit-label');
        if (goalUnitLabel && goalUnitLabel.textContent === 'lbs') {
            goalUnitLabel.textContent = unit;
        }

        // Update existing weight displays in logs
        document.querySelectorAll('.weight-display').forEach(element => {
            const weightLbs = parseFloat(element.dataset.weightLbs);
            if (!isNaN(weightLbs)) {
                element.textContent = WeightConverter.formatWeight(weightLbs, unit);
            }
        });

        // Update dashboard display
        this.updateDashboard();

        // Refresh weightlifting log to update all weight displays
        if (window.weightlifting && typeof weightlifting.refreshLog === 'function') {
            weightlifting.refreshLog();
        }
    }

    switchView(viewName) {
        if (!this.views.includes(viewName)) return;

        // Update navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === viewName);
        });

        // Update view visibility
        document.querySelectorAll('.view').forEach(view => {
            view.classList.toggle('active', view.id === viewName);
        });

        // Initialize meal tracker when switching to meals view
        if (viewName === 'meals') {
            mealTracker.initialize();
        }

        this.currentView = viewName;
    }

    toggleDarkMode(enabled) {
        document.documentElement.setAttribute('data-theme', enabled ? 'dark' : 'light');
        const settings = storage.getSettings();
        settings.darkMode = enabled;
        storage.saveSettings(settings);
    }

    handleExport() {
        const data = storage.exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = InputValidator.createSafeElement('a', {
            href: url,
            download: `fitness-tracker-export-${new Date().toISOString().split('T')[0]}.json`
        });
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    handleImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const success = storage.importData(e.target.result);
            if (success) {
                alert('Data imported successfully!');
                window.location.reload();
            } else {
                alert('Import failed. Please check the file format.');
            }
        };
        reader.readAsText(file);
        event.target.value = ''; // Reset file input
    }

    handleClearData() {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            storage.clearAllData();
            window.location.reload();
        }
    }

    updateDashboard() {
        const summary = storage.getTodaySummary();
        const settings = storage.getSettings();
        
        // Update weightlifting summary
        const weightlifting = summary.weightlifting || { totalSets: 0, plannedReps: 0, actualReps: 0, totalWeight: 0 };

        document.getElementById('total-sets').textContent = weightlifting.totalSets;
        document.getElementById('planned-reps').textContent = weightlifting.plannedReps;
        document.getElementById('actual-reps').textContent = weightlifting.actualReps;
        
        // Get the first entry's unit (if any) to determine the stored unit
        const entries = storage.getWeightlifting().filter(entry => {
            const entryDate = new Date(entry.date).toISOString().split('T')[0];
            return entryDate === new Date().toISOString().split('T')[0];
        });
        const storedUnit = entries.length > 0 && entries[0].sets.length > 0 ? entries[0].sets[0].unit : 'kg';
        
        // Format and display weight with unit
        const weightValue = weightlifting.totalWeight;
        const convertedWeight = storedUnit !== settings.units ? 
            (settings.units === 'kg' ? WeightConverter.lbsToKg(weightValue) : WeightConverter.kgToLbs(weightValue)) :
            weightValue;
        document.getElementById('total-weight').textContent = `${convertedWeight.toFixed(1)} ${settings.units}`;
        
        // Update cardio summary
        document.getElementById('total-duration').textContent = summary.cardio.totalDuration;
        document.getElementById('total-sessions').textContent = summary.cardio.totalSessions;

        // Update meals summary
        if (summary.meals) {
            document.getElementById('total-daily-calories').textContent = summary.meals.totalCalories;
            document.getElementById('total-meals').textContent = summary.meals.totalMeals;
        }

        // Update active goals
        this.updateActiveGoals();
    }

    updateActiveGoals() {
        const goals = storage.getGoals();
        const activeGoalsContainer = document.getElementById('active-goals');
        if (!activeGoalsContainer) return;

        // Update all goals progress first
        storage.updateAllGoalsProgress();

        activeGoalsContainer.innerHTML = '';
        
        // Create sections for each duration type
        ['weekly', 'monthly', 'yearly'].forEach(duration => {
            const durationGoals = goals[duration].filter(goal => !goal.completed);
            if (durationGoals.length > 0) {
                const sectionTitle = InputValidator.createSafeElement('h2', {}, 
                    `${duration.charAt(0).toUpperCase() + duration.slice(1)} Goals`
                );
                activeGoalsContainer.appendChild(sectionTitle);

                durationGoals.forEach(goal => {
                    const goalElement = this.createGoalElement(duration, goal);
                    activeGoalsContainer.appendChild(goalElement);
                });
            }
        });

        // Update trophy display whenever goals are updated
        this.updateTrophyDisplay();
    }

    createGoalElement(duration, goal) {
        const progressPercent = Math.min(100, Math.max(0, (goal.progress / goal.target) * 100));
        
        const div = InputValidator.createSafeElement('div', { class: 'goal-card' });
        
        // Create header
        const header = InputValidator.createSafeElement('div', { class: 'goal-header' });
        header.appendChild(InputValidator.createSafeElement('h3', {}, 
            `${goal.type === 'weightlifting' ? '🏋️‍♂️' : '🏃‍♂️'} ${duration.charAt(0).toUpperCase() + duration.slice(1)} Goal`
        ));
        
        const deleteBtn = InputValidator.createSafeElement('button', { 
            class: 'delete-goal',
            'data-goal-id': goal.id.toString(),
            'data-duration': duration
        }, '×');
        
        deleteBtn.addEventListener('click', (e) => {
            const goalId = parseInt(e.target.dataset.goalId);
            const goalDuration = e.target.dataset.duration;
            if (confirm('Are you sure you want to delete this goal?')) {
                storage.deleteGoal(goalDuration, goalId);
                this.updateActiveGoals();
                this.updateTrophyDisplay();
            }
        });
        
        header.appendChild(deleteBtn);
        div.appendChild(header);

        // Add goal target
        div.appendChild(InputValidator.createSafeElement('p', {}, 
            `${goal.target} ${goal.unit} in ${duration}`
        ));

        // Create progress bar
        const progressBar = InputValidator.createSafeElement('div', { class: 'progress-bar' });
        const progress = InputValidator.createSafeElement('div', { 
            class: 'progress',
            style: `width: ${progressPercent}%`
        });
        progressBar.appendChild(progress);
        div.appendChild(progressBar);

        // Add progress text
        div.appendChild(InputValidator.createSafeElement('p', { class: 'progress-text' }, 
            `${goal.progress} / ${goal.target} ${goal.unit} (${Math.round(progressPercent)}%)`
        ));

        return div;
    }

    setupGoalForm() {
        const form = document.getElementById('new-goal-form');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            
            const duration = InputValidator.sanitizeText(formData.get('goal-duration'));
            const type = InputValidator.sanitizeText(formData.get('goal-type'));
            const target = InputValidator.validateNumber(formData.get('goal-target'), 1);

            if (!target) {
                this.showNotification('Please enter a valid target value', 'error');
                return;
            }

            const settings = storage.getSettings();
            const goal = {
                type: type,
                target: target,
                unit: type === 'weightlifting' ? settings.units : 'minutes'
            };

            storage.addGoal(duration, goal);
            this.updateActiveGoals();
            this.updateTrophyDisplay();
            form.reset();
            this.showNotification('New goal added successfully!');
        });

        // Update unit label based on selected type
        const typeSelect = form.querySelector('[name="goal-type"]');
        const unitLabel = document.getElementById('goal-unit-label');
        
        typeSelect.addEventListener('change', () => {
            const type = typeSelect.value;
            const settings = storage.getSettings();
            unitLabel.textContent = type === 'weightlifting' ? settings.units : 'minutes';
        });
    }

    updateTrophyDisplay() {
        const trophies = storage.getTrophies();
        const container = document.getElementById('trophy-case');
        if (!container) return;

        container.innerHTML = '';
        trophies.sort((a, b) => new Date(b.awardedAt) - new Date(a.awardedAt));

        if (trophies.length === 0) {
            container.appendChild(InputValidator.createSafeElement('p', 
                { class: 'no-trophies' }, 
                'Complete goals to earn trophies!'
            ));
            return;
        }

        trophies.forEach(trophy => {
            const trophyElement = InputValidator.createSafeElement('div', { class: 'trophy' });
            const trophyColor = this.getTrophyColor(trophy.duration);
            
            const iconDiv = InputValidator.createSafeElement('div', 
                { class: `trophy-icon ${trophyColor}` }, 
                '🏆'
            );
            
            const detailsDiv = InputValidator.createSafeElement('div', { class: 'trophy-details' });
            detailsDiv.appendChild(InputValidator.createSafeElement('h4', {}, trophy.description));
            detailsDiv.appendChild(InputValidator.createSafeElement('p', {}, 
                `Awarded on ${new Date(trophy.awardedAt).toLocaleDateString()}`
            ));
            
            trophyElement.appendChild(iconDiv);
            trophyElement.appendChild(detailsDiv);
            
            container.appendChild(trophyElement);
        });
    }

    getTrophyColor(duration) {
        switch (duration) {
            case 'yearly': return 'gold';
            case 'monthly': return 'silver';
            case 'weekly': return 'bronze';
            default: return '';
        }
    }

    showNotification(message, type = 'success') {
        const notification = InputValidator.createSafeElement('div', 
            { class: `notification ${type}` }, 
            InputValidator.sanitizeText(message)
        );
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    formatDate(isoString) {
        const date = new Date(isoString);
        return InputValidator.sanitizeText(
            date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
        );
    }
}

// Create a global instance
const ui = new UIManager();
