class SettingsManager {
    constructor() {
        this.settingsKey = 'fitness_settings_v2';
        this.defaultSettings = {
            // Appearance
            theme: 'auto',
            accentColor: 'green',
            animationSpeed: 'normal',
            
            // Units & Display
            weightUnit: 'lbs',
            dateFormat: 'us',
            timeFormat: '12',
            
            // User Profile
            experienceLevel: 'beginner',
            primaryGoal: 'general',
            
            // Training Preferences
            defaultTrainingType: 'straight',
            defaultSets: 3,
            defaultReps: 10,
            autoSuggestRest: true,
            showExerciseDescriptions: true,
            
            // Progress Tracking
            achievementNotifications: true,
            progressRecommendations: true,
            progressCalculation: 'comprehensive',
            
            // Water Intake
            userWeight: null,
            userWeightUnit: 'lbs',
            userAge: null,
            activityLevel: 'moderate',
            climate: 'normal',
            
            // Timer Preferences
            restTimeStrength: 300, // 5 minutes
            restTimeHypertrophy: 90, // 1.5 minutes
            restTimeEndurance: 60, // 1 minute
            autoStartTimer: false,
            timerSounds: true,
            warningTime: 10,
            
            // Notifications
            browserNotifications: false,
            achievementAlerts: true,
            timerNotifications: true,
            workoutReminders: false,
            notificationDuration: 3000,
            notificationPosition: 'top-right',
            
            // Advanced
            debugMode: false,
            syncFrequency: 'realtime'
        };
        
        this.initializeSettings();
        this.setupEventListeners();
        this.applySettings();
        this.updateAboutInfo();
    }

    initializeSettings() {
        const existingSettings = localStorage.getItem(this.settingsKey);
        if (!existingSettings) {
            localStorage.setItem(this.settingsKey, JSON.stringify(this.defaultSettings));
        } else {
            // Merge with defaults to handle new settings
            const settings = JSON.parse(existingSettings);
            const mergedSettings = { ...this.defaultSettings, ...settings };
            localStorage.setItem(this.settingsKey, JSON.stringify(mergedSettings));
        }
    }

    getSettings() {
        return JSON.parse(localStorage.getItem(this.settingsKey));
    }

    updateSetting(key, value) {
        const settings = this.getSettings();
        settings[key] = value;
        localStorage.setItem(this.settingsKey, JSON.stringify(settings));
        this.applySettings();
    }

    setupEventListeners() {
        // Settings tab navigation
        document.querySelectorAll('.settings-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Theme and appearance settings
        this.setupListener('theme-select', 'theme');
        this.setupListener('accent-color', 'accentColor');
        this.setupListener('animation-speed', 'animationSpeed');
        
        // Units and display
        this.setupListener('weight-unit', 'weightUnit');
        this.setupListener('date-format', 'dateFormat');
        this.setupListener('time-format', 'timeFormat');
        
        // User profile
        this.setupListener('experience-level', 'experienceLevel');
        this.setupListener('primary-goal', 'primaryGoal');
        
        // Training preferences
        this.setupListener('default-training-type', 'defaultTrainingType');
        this.setupListener('default-sets', 'defaultSets');
        this.setupListener('default-reps', 'defaultReps');
        this.setupToggleListener('auto-suggest-rest', 'autoSuggestRest');
        this.setupToggleListener('show-exercise-descriptions', 'showExerciseDescriptions');
        
        // Progress tracking
        this.setupToggleListener('achievement-notifications', 'achievementNotifications');
        this.setupToggleListener('progress-recommendations', 'progressRecommendations');
        this.setupListener('progress-calculation', 'progressCalculation');
        
        // Water intake
        this.setupListener('user-weight', 'userWeight');
        this.setupListener('user-weight-unit', 'userWeightUnit');
        this.setupListener('user-age', 'userAge');
        this.setupListener('activity-level', 'activityLevel');
        this.setupListener('climate', 'climate');
        
        // Timer preferences
        this.setupListener('rest-strength', 'restTimeStrength');
        this.setupListener('rest-hypertrophy', 'restTimeHypertrophy');
        this.setupListener('rest-endurance', 'restTimeEndurance');
        this.setupToggleListener('auto-start-timer', 'autoStartTimer');
        this.setupToggleListener('timer-sounds', 'timerSounds');
        this.setupListener('warning-time', 'warningTime');
        
        // Notifications
        this.setupToggleListener('browser-notifications', 'browserNotifications');
        this.setupToggleListener('achievement-alerts', 'achievementAlerts');
        this.setupToggleListener('timer-notifications', 'timerNotifications');
        this.setupToggleListener('workout-reminders', 'workoutReminders');
        this.setupListener('notification-duration', 'notificationDuration');
        this.setupListener('notification-position', 'notificationPosition');
        
        // Advanced settings
        this.setupToggleListener('debug-mode', 'debugMode');
        this.setupListener('sync-frequency', 'syncFrequency');

        // Data management buttons
        this.setupDataManagementListeners();
        
        // Developer options
        this.setupDeveloperListeners();

        // Update data stats when settings are shown
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-view="settings"]')) {
                setTimeout(() => this.updateDataStats(), 100);
            }
        });
    }

    setupListener(elementId, settingKey) {
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener('change', (e) => {
                let value = e.target.value;
                // Convert numeric strings to numbers
                if (element.type === 'number') {
                    value = parseFloat(value) || null;
                }
                this.updateSetting(settingKey, value);
            });
        }
    }

    setupToggleListener(elementId, settingKey) {
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener('change', (e) => {
                this.updateSetting(settingKey, e.target.checked);
            });
        }
    }

    setupDataManagementListeners() {
        // Export buttons
        document.getElementById('export-all-data')?.addEventListener('click', () => {
            this.exportAllData();
        });

        document.getElementById('export-workouts')?.addEventListener('click', () => {
            this.exportWorkouts();
        });


        document.getElementById('export-progress')?.addEventListener('click', () => {
            this.exportProgress();
        });

        // Import button
        document.getElementById('import-data')?.addEventListener('click', () => {
            document.getElementById('import-input')?.click();
        });

        document.getElementById('import-input')?.addEventListener('change', (e) => {
            this.importData(e.target.files[0]);
        });

        // Reset buttons
        document.getElementById('clear-workouts')?.addEventListener('click', () => {
            this.clearWorkouts();
        });

        document.getElementById('clear-achievements')?.addEventListener('click', () => {
            this.clearAchievements();
        });

        document.getElementById('clear-all-data')?.addEventListener('click', () => {
            this.clearAllData();
        });
    }

    setupDeveloperListeners() {
        document.getElementById('force-cache-refresh')?.addEventListener('click', () => {
            this.forceCacheRefresh();
        });

        document.getElementById('reset-app-state')?.addEventListener('click', () => {
            this.resetAppState();
        });

        document.getElementById('download-logs')?.addEventListener('click', () => {
            this.downloadLogs();
        });
    }

    switchTab(tabName) {
        // Update active tab button
        document.querySelectorAll('.settings-tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Show selected tab content
        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.getElementById(`${tabName}-settings`).classList.add('active');

        // Update data stats when data tab is shown
        if (tabName === 'data') {
            this.updateDataStats();
        }
    }

    applySettings() {
        const settings = this.getSettings();
        
        // Apply theme
        this.applyTheme(settings.theme);
        
        // Apply accent color
        this.applyAccentColor(settings.accentColor);
        
        // Apply animation speed
        this.applyAnimationSpeed(settings.animationSpeed);
        
        // Update form values
        this.updateFormValues(settings);
        
        // Apply browser notifications setting
        if (settings.browserNotifications) {
            this.requestNotificationPermission();
        }
    }

    applyTheme(theme) {
        const root = document.documentElement;
        
        if (theme === 'auto') {
            // Use system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        } else {
            root.setAttribute('data-theme', theme);
        }
    }

    applyAccentColor(color) {
        document.documentElement.setAttribute('data-accent', color);
    }

    applyAnimationSpeed(speed) {
        document.documentElement.setAttribute('data-animation', speed);
    }

    updateFormValues(settings) {
        Object.keys(settings).forEach(key => {
            const element = document.querySelector(`[id="${this.camelToKebab(key)}"]`);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = settings[key];
                } else {
                    element.value = settings[key] || '';
                }
            }
        });
    }

    camelToKebab(str) {
        return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
    }

    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                if (permission !== 'granted') {
                    this.updateSetting('browserNotifications', false);
                    document.getElementById('browser-notifications').checked = false;
                }
            });
        }
    }

    updateDataStats() {
        // Calculate total workouts
        const weightliftingEntries = JSON.parse(localStorage.getItem('fitness_weightlifting') || '[]');
        const cardioEntries = JSON.parse(localStorage.getItem('fitness_cardio') || '[]');
        const totalWorkouts = weightliftingEntries.length + cardioEntries.length;
        
        // Calculate storage used
        let totalSize = 0;
        for (let key in localStorage) {
            if (key.startsWith('fitness_')) {
                totalSize += localStorage[key].length;
            }
        }
        const sizeKB = Math.round(totalSize / 1024);
        
        // Get last backup date
        const lastBackup = localStorage.getItem('fitness_last_backup') || 'Never';
        
        // Update display
        document.getElementById('total-workouts').textContent = totalWorkouts;
        document.getElementById('storage-used').textContent = `${sizeKB} KB`;
        document.getElementById('last-backup').textContent = lastBackup === 'Never' ? 'Never' : new Date(lastBackup).toLocaleDateString();
    }

    exportAllData() {
        const allData = {};
        for (let key in localStorage) {
            if (key.startsWith('fitness_')) {
                allData[key] = JSON.parse(localStorage[key]);
            }
        }
        
        this.downloadJSON(allData, 'fitness-tracker-backup');
        localStorage.setItem('fitness_last_backup', new Date().toISOString());
        this.updateDataStats();
        ui.showNotification('All data exported successfully!');
    }

    exportWorkouts() {
        const workoutData = {
            fitness_weightlifting: JSON.parse(localStorage.getItem('fitness_weightlifting') || '[]'),
            fitness_cardio: JSON.parse(localStorage.getItem('fitness_cardio') || '[]')
        };
        
        this.downloadJSON(workoutData, 'fitness-workouts');
        ui.showNotification('Workout data exported successfully!');
    }


    exportProgress() {
        const progressData = {
            fitness_achievements: JSON.parse(localStorage.getItem('fitness_achievements') || '{}'),
            fitness_settings_v2: JSON.parse(localStorage.getItem('fitness_settings_v2') || '{}')
        };
        
        this.downloadJSON(progressData, 'fitness-progress');
        ui.showNotification('Progress data exported successfully!');
    }

    downloadJSON(data, filename) {
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `${filename}-${new Date().toISOString().split('T')[0]}.json`;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    importData(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                
                // Confirm import
                const confirmed = confirm(
                    'This will overwrite your existing data. Are you sure you want to continue? ' +
                    'Make sure you have a backup first!'
                );
                
                if (confirmed) {
                    // Import data
                    Object.keys(importedData).forEach(key => {
                        if (key.startsWith('fitness_')) {
                            localStorage.setItem(key, JSON.stringify(importedData[key]));
                        }
                    });
                    
                    ui.showNotification('Data imported successfully! Refreshing page...');
                    setTimeout(() => window.location.reload(), 2000);
                }
            } catch (error) {
                ui.showNotification('Error importing data. Please check the file format.');
            }
        };
        reader.readAsText(file);
    }

    clearWorkouts() {
        if (confirm('Are you sure you want to clear all workout history? This cannot be undone!')) {
            localStorage.removeItem('fitness_weightlifting');
            localStorage.removeItem('fitness_cardio');
            ui.showNotification('Workout history cleared');
            this.updateDataStats();
        }
    }

    clearAchievements() {
        if (confirm('Are you sure you want to reset all achievements? This cannot be undone!')) {
            localStorage.removeItem('fitness_achievements');
            ui.showNotification('Achievements reset');
            this.updateDataStats();
        }
    }

    clearAllData() {
        if (confirm('⚠️ WARNING: This will delete ALL your fitness data permanently! Are you absolutely sure?')) {
            const doubleConfirm = confirm('This is your last chance. All workouts, progress, and settings will be lost forever. Continue?');
            if (doubleConfirm) {
                // Clear all fitness-related data
                Object.keys(localStorage).forEach(key => {
                    if (key.startsWith('fitness_')) {
                        localStorage.removeItem(key);
                    }
                });
                
                ui.showNotification('All data cleared. Refreshing page...');
                setTimeout(() => window.location.reload(), 2000);
            }
        }
    }

    forceCacheRefresh() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(registrations => {
                registrations.forEach(registration => {
                    registration.update();
                });
            });
        }
        
        // Clear browser cache
        if ('caches' in window) {
            caches.keys().then(names => {
                names.forEach(name => {
                    caches.delete(name);
                });
            });
        }
        
        ui.showNotification('Cache refreshed! Reload the page to see changes.');
    }

    resetAppState() {
        if (confirm('Reset app state? This will clear temporary data but keep your workouts.')) {
            // Clear temporary settings but keep workout data
            localStorage.removeItem('fitness_settings_v2');
            sessionStorage.clear();
            
            ui.showNotification('App state reset. Refreshing page...');
            setTimeout(() => window.location.reload(), 1500);
        }
    }

    downloadLogs() {
        const logs = {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            localStorage: { ...localStorage },
            sessionStorage: { ...sessionStorage },
            settings: this.getSettings(),
            performance: {
                memory: performance.memory ? {
                    usedJSHeapSize: performance.memory.usedJSHeapSize,
                    totalJSHeapSize: performance.memory.totalJSHeapSize,
                    jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
                } : 'Not available'
            }
        };
        
        this.downloadJSON(logs, 'fitness-debug-logs');
        ui.showNotification('Debug logs downloaded');
    }

    updateAboutInfo() {
        // Update last updated date
        document.getElementById('last-updated').textContent = new Date().toLocaleDateString();
        
        // Update browser info
        const browserInfo = this.getBrowserInfo();
        document.getElementById('browser-info').textContent = browserInfo;
    }

    getBrowserInfo() {
        const userAgent = navigator.userAgent;
        let browserName = 'Unknown';
        
        if (userAgent.includes('Chrome')) browserName = 'Chrome';
        else if (userAgent.includes('Firefox')) browserName = 'Firefox';
        else if (userAgent.includes('Safari')) browserName = 'Safari';
        else if (userAgent.includes('Edge')) browserName = 'Edge';
        
        return `${browserName} on ${navigator.platform}`;
    }
}

// Initialize settings manager
window.settingsManager = new SettingsManager();