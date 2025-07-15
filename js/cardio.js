class CardioManager {
    static LIMITS = {
        DURATION_MAX: 1440, // 24 hours in minutes
        HEART_RATE_MAX: 300,
        NOTES_MAX: 1000,
        DISTANCE_MAX: 1000
    };

    constructor() {
        this.currentMode = 'quick';
        this.setupEventListeners();
        this.initializeForms();
        this.refreshLog();
        this.updateStats();
    }

    setupEventListeners() {
        // Cardio type selector buttons
        document.querySelectorAll('.cardio-type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchCardioMode(e.target.dataset.type);
            });
        });

        // Form submissions
        document.getElementById('cardio-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleQuickSubmit(e);
        });

        document.getElementById('detailed-cardio-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleDetailedSubmit(e);
        });

        document.getElementById('intervals-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleIntervalsSubmit(e);
        });

        // Filter listeners
        document.getElementById('cardio-filter-type')?.addEventListener('change', () => {
            this.refreshLog();
        });

        document.getElementById('cardio-filter-period')?.addEventListener('change', () => {
            this.refreshLog();
        });

        // Auto-calculate calories based on activity and duration
        document.getElementById('cardio-type')?.addEventListener('change', () => {
            this.autoCalculateCalories();
        });

        document.getElementById('duration')?.addEventListener('input', () => {
            this.autoCalculateCalories();
        });

        document.getElementById('intensity')?.addEventListener('change', () => {
            this.autoCalculateCalories();
        });
    }

    initializeForms() {
        // Add datetime fields to all forms
        this.addDateTimeToForm('cardio-form');
        this.addDateTimeToForm('detailed-cardio-form');
        this.addDateTimeToForm('intervals-form');
    }

    addDateTimeToForm(formId) {
        const form = document.getElementById(formId);
        if (!form) return;

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const defaultDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;

        const dateGroup = InputValidator.createSafeElement('div', { class: 'form-group' });
        const label = InputValidator.createSafeElement('label', { for: `${formId}-datetime` }, 'Date/Time:');
        const input = InputValidator.createSafeElement('input', {
            type: 'datetime-local',
            id: `${formId}-datetime`,
            name: 'datetime',
            value: defaultDateTime
        });

        dateGroup.appendChild(label);
        dateGroup.appendChild(input);
        
        // Insert before the submit button
        const submitBtn = form.querySelector('button[type="submit"]');
        form.insertBefore(dateGroup, submitBtn);
    }

    switchCardioMode(mode) {
        // Update active button
        document.querySelectorAll('.cardio-type-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-type="${mode}"]`).classList.add('active');

        // Hide all forms
        document.querySelectorAll('#cardio .input-form').forEach(form => {
            form.classList.add('hidden');
            form.classList.remove('active');
        });

        // Show selected form
        let targetForm;
        switch (mode) {
            case 'quick':
                targetForm = document.getElementById('cardio-form');
                break;
            case 'detailed':
                targetForm = document.getElementById('detailed-cardio-form');
                break;
            case 'intervals':
                targetForm = document.getElementById('intervals-form');
                break;
        }

        if (targetForm) {
            targetForm.classList.remove('hidden');
            targetForm.classList.add('active');
        }

        this.currentMode = mode;
    }

    autoCalculateCalories() {
        const type = document.getElementById('cardio-type')?.value;
        const duration = parseFloat(document.getElementById('duration')?.value) || 0;
        const intensity = document.getElementById('intensity')?.value;
        const caloriesInput = document.getElementById('calories-burned');

        if (!type || !duration || !caloriesInput) return;

        // Calorie estimation based on activity type and intensity (per minute for average person)
        const calorieRates = {
            running: { low: 8, moderate: 11, high: 15, maximum: 20 },
            walking: { low: 3, moderate: 4, high: 6, maximum: 8 },
            cycling: { low: 6, moderate: 9, high: 12, maximum: 16 },
            swimming: { low: 8, moderate: 11, high: 14, maximum: 18 },
            rowing: { low: 7, moderate: 10, high: 13, maximum: 17 },
            elliptical: { low: 6, moderate: 9, high: 12, maximum: 15 },
            stairmaster: { low: 7, moderate: 10, high: 14, maximum: 18 },
            'jumping-rope': { low: 9, moderate: 12, high: 15, maximum: 20 },
            dancing: { low: 4, moderate: 6, high: 8, maximum: 10 },
            hiking: { low: 5, moderate: 7, high: 9, maximum: 12 },
            other: { low: 5, moderate: 7, high: 10, maximum: 13 }
        };

        const rate = calorieRates[type]?.[intensity] || 7;
        const estimatedCalories = Math.round(duration * rate);
        
        if (!caloriesInput.value) {
            caloriesInput.placeholder = `~${estimatedCalories} kcal`;
        }
    }

    handleQuickSubmit(e) {
        try {
            const formData = new FormData(e.target);
            const entry = this.validateQuickData(formData);
            this.saveCardioEntry(entry);
            this.resetForm('cardio-form');
            window.ui.showNotification('Cardio session logged successfully!');
        } catch (error) {
            window.ui.showNotification(error.message, 'error');
        }
    }

    handleDetailedSubmit(e) {
        try {
            const formData = new FormData(e.target);
            const entry = this.validateDetailedData(formData);
            this.saveCardioEntry(entry);
            this.resetForm('detailed-cardio-form');
            window.ui.showNotification('Detailed cardio session logged successfully!');
        } catch (error) {
            window.ui.showNotification(error.message, 'error');
        }
    }

    handleIntervalsSubmit(e) {
        try {
            const formData = new FormData(e.target);
            const entry = this.validateIntervalsData(formData);
            this.saveCardioEntry(entry);
            this.resetForm('intervals-form');
            window.ui.showNotification('Interval training session logged successfully!');
        } catch (error) {
            window.ui.showNotification(error.message, 'error');
        }
    }

    validateQuickData(formData) {
        const type = formData.get('cardio-type') || document.getElementById('cardio-type').value;
        const duration = parseFloat(document.getElementById('duration').value);
        const durationUnit = document.getElementById('duration-unit').value;
        const intensity = document.getElementById('intensity').value;
        const calories = parseFloat(document.getElementById('calories-burned').value) || null;
        const notes = document.getElementById('cardio-notes').value.trim();
        const datetime = document.getElementById('cardio-form-datetime').value;

        if (!type) throw new Error('Please select an activity type');
        if (!duration || duration <= 0) throw new Error('Please enter a valid duration');
        if (duration > CardioManager.LIMITS.DURATION_MAX) throw new Error('Duration is too long');
        if (notes.length > CardioManager.LIMITS.NOTES_MAX) throw new Error('Notes are too long');

        // Convert duration to minutes
        const durationInMinutes = durationUnit === 'hours' ? duration * 60 : duration;

        return {
            id: Date.now(),
            type: 'quick',
            activity: type,
            duration: durationInMinutes,
            intensity: intensity,
            calories: calories,
            notes: notes,
            date: new Date(datetime).toISOString()
        };
    }

    validateDetailedData(formData) {
        const type = document.getElementById('detailed-cardio-type').value;
        const duration = parseFloat(document.getElementById('detailed-duration').value);
        const durationUnit = document.getElementById('detailed-duration-unit').value;
        const distance = parseFloat(document.getElementById('distance').value) || null;
        const distanceUnit = document.getElementById('distance-unit').value;
        const avgHr = parseFloat(document.getElementById('avg-heart-rate').value) || null;
        const maxHr = parseFloat(document.getElementById('max-heart-rate').value) || null;
        const calories = parseFloat(document.getElementById('detailed-calories').value) || null;
        const notes = document.getElementById('detailed-notes').value.trim();
        const datetime = document.getElementById('detailed-cardio-form-datetime').value;

        if (!type) throw new Error('Please select an activity type');
        if (!duration || duration <= 0) throw new Error('Please enter a valid duration');
        if (avgHr && (avgHr <= 0 || avgHr > CardioManager.LIMITS.HEART_RATE_MAX)) {
            throw new Error('Please enter a valid average heart rate');
        }
        if (maxHr && (maxHr <= 0 || maxHr > CardioManager.LIMITS.HEART_RATE_MAX)) {
            throw new Error('Please enter a valid maximum heart rate');
        }

        const durationInMinutes = durationUnit === 'hours' ? duration * 60 : duration;

        return {
            id: Date.now(),
            type: 'detailed',
            activity: type,
            duration: durationInMinutes,
            distance: distance,
            distanceUnit: distanceUnit,
            avgHeartRate: avgHr,
            maxHeartRate: maxHr,
            calories: calories,
            notes: notes,
            date: new Date(datetime).toISOString()
        };
    }

    validateIntervalsData(formData) {
        const type = document.getElementById('interval-type').value;
        const intervalsCount = parseInt(document.getElementById('intervals-count').value);
        const workDuration = parseFloat(document.getElementById('work-duration').value);
        const workUnit = document.getElementById('work-unit').value;
        const restDuration = parseFloat(document.getElementById('rest-duration').value);
        const restUnit = document.getElementById('rest-unit').value;
        const notes = document.getElementById('interval-notes').value.trim();
        const datetime = document.getElementById('intervals-form-datetime').value;

        if (!type) throw new Error('Please select an activity type');
        if (!intervalsCount || intervalsCount <= 0) throw new Error('Please enter valid number of intervals');
        if (!workDuration || workDuration <= 0) throw new Error('Please enter valid work duration');
        if (!restDuration || restDuration <= 0) throw new Error('Please enter valid rest duration');

        // Convert to minutes for consistency
        const workMinutes = workUnit === 'seconds' ? workDuration / 60 : workDuration;
        const restMinutes = restUnit === 'seconds' ? restDuration / 60 : restDuration;
        const totalDuration = (workMinutes + restMinutes) * intervalsCount;

        return {
            id: Date.now(),
            type: 'intervals',
            activity: type,
            intervalsCount: intervalsCount,
            workDuration: workDuration,
            workUnit: workUnit,
            restDuration: restDuration,
            restUnit: restUnit,
            duration: totalDuration,
            notes: notes,
            date: new Date(datetime).toISOString()
        };
    }

    saveCardioEntry(entry) {
        const entries = window.storage.getCardio();
        entries.push(entry);
        window.storage.saveCardio(entries);
        
        this.refreshLog();
        this.updateStats();
        window.ui.updateDashboard();
        
        // Trigger events for other components
        document.dispatchEvent(new Event('cardioUpdated'));
    }

    resetForm(formId) {
        const form = document.getElementById(formId);
        if (!form) return;

        form.reset();
        
        // Reset datetime to current time
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const defaultDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
        
        const datetimeInput = form.querySelector('input[type="datetime-local"]');
        if (datetimeInput) {
            datetimeInput.value = defaultDateTime;
        }

        // Clear auto-calculated calories placeholder
        const caloriesInput = document.getElementById('calories-burned');
        if (caloriesInput) {
            caloriesInput.placeholder = 'Auto-calculated';
        }
    }

    refreshLog() {
        const entries = this.getFilteredEntries();
        const logContainer = document.getElementById('cardio-log');
        
        if (!logContainer) return;

        if (entries.length === 0) {
            logContainer.innerHTML = '<p class="empty-state">No cardio sessions logged yet. Start by adding your first session!</p>';
            return;
        }

        // Group entries by date
        const groupedEntries = this.groupEntriesByDate(entries);
        
        logContainer.innerHTML = '';
        
        Object.entries(groupedEntries).forEach(([date, dateEntries]) => {
            const dateGroup = InputValidator.createSafeElement('div', { class: 'log-date-group' });
            dateGroup.appendChild(InputValidator.createSafeElement('h3', {}, 
                new Date(date).toLocaleDateString()
            ));
            
            const entriesContainer = InputValidator.createSafeElement('div', { class: 'log-entries' });
            
            dateEntries.forEach(entry => {
                const entryEl = this.createLogEntry(entry);
                entriesContainer.appendChild(entryEl);
            });
            
            dateGroup.appendChild(entriesContainer);
            logContainer.appendChild(dateGroup);
        });
    }

    getFilteredEntries() {
        const entries = window.storage.getCardio();
        const typeFilter = document.getElementById('cardio-filter-type')?.value || 'all';
        const periodFilter = document.getElementById('cardio-filter-period')?.value || 'all';

        let filtered = entries;

        // Filter by type
        if (typeFilter !== 'all') {
            filtered = filtered.filter(entry => entry.activity === typeFilter);
        }

        // Filter by period
        if (periodFilter !== 'all') {
            const now = new Date();
            let startDate;

            switch (periodFilter) {
                case 'week':
                    startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
                    break;
                case 'month':
                    startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
                    break;
                case 'year':
                    startDate = new Date(now.getTime() - (365 * 24 * 60 * 60 * 1000));
                    break;
            }

            if (startDate) {
                filtered = filtered.filter(entry => new Date(entry.date) >= startDate);
            }
        }

        // Sort by date, newest first
        return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    groupEntriesByDate(entries) {
        return entries.reduce((groups, entry) => {
            const date = entry.date.split('T')[0];
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(entry);
            return groups;
        }, {});
    }

    createLogEntry(entry) {
        const entryEl = InputValidator.createSafeElement('div', { 
            class: 'log-entry cardio-entry',
            'data-id': entry.id.toString()
        });

        const activityEmojis = {
            running: '🏃',
            walking: '🚶',
            cycling: '🚴',
            swimming: '🏊',
            rowing: '🚣',
            elliptical: '⚡',
            stairmaster: '📈',
            'jumping-rope': '🪢',
            dancing: '💃',
            hiking: '🥾',
            hiit: '🔥',
            sprints: '⚡',
            other: '🔄'
        };

        const emoji = activityEmojis[entry.activity] || '🔄';
        const activityName = this.capitalizeFirst(entry.activity.replace('-', ' '));

        let content = `
            <div class="log-entry-header">
                <h4>${emoji} ${activityName}</h4>
                <button class="delete-btn" data-id="${entry.id}">×</button>
            </div>
            <div class="cardio-details">
                <span><strong>Duration:</strong> ${this.formatDuration(entry.duration)}</span>
        `;

        if (entry.type === 'detailed') {
            if (entry.distance) {
                content += `<span><strong>Distance:</strong> ${entry.distance} ${entry.distanceUnit}</span>`;
            }
            if (entry.avgHeartRate) {
                content += `<span><strong>Avg HR:</strong> ${entry.avgHeartRate} bpm</span>`;
            }
            if (entry.maxHeartRate) {
                content += `<span><strong>Max HR:</strong> ${entry.maxHeartRate} bpm</span>`;
            }
        }

        if (entry.type === 'intervals') {
            content += `<span><strong>Intervals:</strong> ${entry.intervalsCount}x (${entry.workDuration}${entry.workUnit.charAt(0)} work / ${entry.restDuration}${entry.restUnit.charAt(0)} rest)</span>`;
        }

        if (entry.intensity) {
            const intensityEmojis = { low: '😌', moderate: '😊', high: '😤', maximum: '🔥' };
            content += `<span><strong>Intensity:</strong> ${intensityEmojis[entry.intensity]} ${this.capitalizeFirst(entry.intensity)}</span>`;
        }

        if (entry.calories) {
            content += `<span><strong>Calories:</strong> ${entry.calories} kcal</span>`;
        }

        content += `</div>`;

        if (entry.notes) {
            content += `<div class="log-entry-notes">${InputValidator.sanitizeText(entry.notes)}</div>`;
        }

        content += `<div class="log-entry-time">${new Date(entry.date).toLocaleTimeString()}</div>`;

        entryEl.innerHTML = content;

        // Add delete functionality
        entryEl.querySelector('.delete-btn').addEventListener('click', () => {
            this.deleteEntry(entry.id);
        });

        return entryEl;
    }

    deleteEntry(id) {
        if (confirm('Are you sure you want to delete this cardio session?')) {
            const entries = window.storage.getCardio();
            const filteredEntries = entries.filter(entry => entry.id !== id);
            window.storage.saveCardio(filteredEntries);
            
            this.refreshLog();
            this.updateStats();
            window.ui.updateDashboard();
            window.ui.showNotification('Cardio session deleted');
            
            document.dispatchEvent(new Event('cardioUpdated'));
        }
    }

    updateStats() {
        const entries = window.storage.getCardio();
        const now = new Date();
        const weekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        const monthAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

        // This week stats
        const weekEntries = entries.filter(entry => new Date(entry.date) >= weekAgo);
        const weekTotalTime = weekEntries.reduce((sum, entry) => sum + entry.duration, 0);

        // This month stats
        const monthEntries = entries.filter(entry => new Date(entry.date) >= monthAgo);
        const monthSessions = monthEntries.length;

        // Average session duration
        const avgDuration = entries.length > 0 ? 
            entries.reduce((sum, entry) => sum + entry.duration, 0) / entries.length : 0;

        // Longest session
        const longestSession = entries.length > 0 ? 
            Math.max(...entries.map(entry => entry.duration)) : 0;

        // Update DOM
        document.getElementById('week-cardio-time').textContent = this.formatDuration(weekTotalTime);
        document.getElementById('month-cardio-sessions').textContent = monthSessions;
        document.getElementById('avg-session-duration').textContent = this.formatDuration(avgDuration);
        document.getElementById('longest-session').textContent = this.formatDuration(longestSession);
    }

    formatDuration(minutes) {
        if (minutes < 60) {
            return `${Math.round(minutes)} min`;
        } else {
            const hours = Math.floor(minutes / 60);
            const mins = Math.round(minutes % 60);
            return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
        }
    }

    capitalizeFirst(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
}

// Create a global instance
window.cardio = new CardioManager();