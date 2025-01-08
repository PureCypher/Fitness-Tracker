class CardioManager {
    static LIMITS = {
        DURATION_MAX: 1440, // 24 hours in minutes
        HEART_RATE_MAX: 300,
        NOTES_MAX: 1000
    };

    constructor() {
        this.form = document.getElementById('cardio-form');
        this.logContainer = document.getElementById('cardio-log');
        this.addDateTimeField();
        this.addNotesField();
        this.setupEventListeners();
        this.refreshLog();
    }

    addDateTimeField() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const defaultDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;

        const dateGroup = InputValidator.createSafeElement('div', { class: 'form-group' });
        const label = InputValidator.createSafeElement('label', { for: 'datetime' }, 'Date/Time:');
        const input = InputValidator.createSafeElement('input', {
            type: 'datetime-local',
            id: 'datetime',
            name: 'datetime',
            value: defaultDateTime
        });

        dateGroup.appendChild(label);
        dateGroup.appendChild(input);
        this.form.insertBefore(dateGroup, this.form.querySelector('button'));
    }

    addNotesField() {
        const notesGroup = InputValidator.createSafeElement('div', { class: 'form-group' });
        const label = InputValidator.createSafeElement('label', { for: 'notes' }, 'Notes:');
        const textarea = InputValidator.createSafeElement('textarea', {
            id: 'notes',
            name: 'notes',
            rows: '2',
            maxlength: CardioManager.LIMITS.NOTES_MAX,
            placeholder: 'How did this session feel?'
        });

        notesGroup.appendChild(label);
        notesGroup.appendChild(textarea);
        this.form.insertBefore(notesGroup, this.form.querySelector('button'));
    }

    setupEventListeners() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            try {
                this.handleSubmit();
            } catch (error) {
                alert(error.message);
            }
        });
    }

    validateFormData() {
        const type = InputValidator.sanitizeText(this.form['cardio-type'].value);
        if (!type) {
            throw new Error('Invalid cardio type');
        }

        const duration = InputValidator.validateNumber(
            this.form.duration.value,
            1,
            CardioManager.LIMITS.DURATION_MAX
        );
        if (!duration) {
            throw new Error('Invalid duration');
        }

        const heartRate = this.form['heart-rate'].value ? 
            InputValidator.validateNumber(
                this.form['heart-rate'].value,
                20,
                CardioManager.LIMITS.HEART_RATE_MAX
            ) : null;
        if (this.form['heart-rate'].value && heartRate === null) {
            throw new Error('Invalid heart rate');
        }

        const notes = InputValidator.sanitizeText(this.form.notes.value.trim());
        if (notes.length > CardioManager.LIMITS.NOTES_MAX) {
            throw new Error('Notes too long');
        }

        const dateValue = this.form.datetime.value;
        let date;
        try {
            date = dateValue ? new Date(dateValue) : new Date();
            if (isNaN(date.getTime())) {
                throw new Error('Invalid date');
            }
        } catch (error) {
            date = new Date();
        }

        return {
            type,
            duration,
            heartRate,
            notes,
            date: date.toISOString()
        };
    }

    handleSubmit() {
        const entry = this.validateFormData();
        storage.addCardioEntry(entry);
        this.form.reset();
        
        // Reset date/time to current
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        this.form.datetime.value = `${year}-${month}-${day}T${hours}:${minutes}`;

        this.refreshLog();
        ui.updateDashboard();
        document.dispatchEvent(new Event('cardioUpdated'));
        ui.showNotification('Cardio session logged successfully!');
    }

    refreshLog() {
        const entries = storage.getCardio();
        
        if (entries.length === 0) {
            const emptyState = InputValidator.createSafeElement('p', 
                { class: 'empty-state' },
                'No cardio sessions logged yet. Start by adding your first session!'
            );
            this.logContainer.innerHTML = '';
            this.logContainer.appendChild(emptyState);
            return;
        }

        // Sort entries by date, newest first
        entries.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Group entries by date
        const groupedEntries = entries.reduce((groups, entry) => {
            const date = entry.date.split('T')[0];
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(entry);
            return groups;
        }, {});

        this.logContainer.innerHTML = '';
        
        // Generate HTML for each date group
        Object.entries(groupedEntries).forEach(([date, dateEntries]) => {
            const dateGroup = InputValidator.createSafeElement('div', { class: 'log-date-group' });
            dateGroup.appendChild(InputValidator.createSafeElement('h3', {}, 
                new Date(date).toLocaleDateString()
            ));
            
            const entriesContainer = InputValidator.createSafeElement('div', { class: 'log-entries' });

            dateEntries.forEach(entry => {
                const logEntry = InputValidator.createSafeElement('div', { 
                    class: 'log-entry',
                    'data-id': entry.id.toString()
                });

                // Create header
                const header = InputValidator.createSafeElement('div', { class: 'log-entry-header' });
                header.appendChild(InputValidator.createSafeElement('h4', {}, 
                    this.capitalizeFirstLetter(entry.type)
                ));
                
                const deleteBtn = InputValidator.createSafeElement('button', { class: 'delete-btn' }, '×');
                deleteBtn.addEventListener('click', () => this.deleteEntry(entry.id));
                header.appendChild(deleteBtn);
                
                logEntry.appendChild(header);

                // Create details
                const details = InputValidator.createSafeElement('div', { class: 'log-entry-details' });
                details.appendChild(InputValidator.createSafeElement('span', {}, 
                    `${entry.duration} minutes`
                ));
                if (entry.heartRate) {
                    details.appendChild(InputValidator.createSafeElement('span', {}, 
                        `Heart Rate: ${entry.heartRate} bpm`
                    ));
                }
                logEntry.appendChild(details);

                // Add notes if present
                if (entry.notes) {
                    logEntry.appendChild(InputValidator.createSafeElement('div', 
                        { class: 'log-entry-notes' }, 
                        entry.notes
                    ));
                }

                // Add timestamp
                logEntry.appendChild(InputValidator.createSafeElement('div', 
                    { class: 'log-entry-time' }, 
                    new Date(entry.date).toLocaleTimeString()
                ));

                entriesContainer.appendChild(logEntry);
            });

            dateGroup.appendChild(entriesContainer);
            this.logContainer.appendChild(dateGroup);
        });

        this.ensureStyles();
    }

    ensureStyles() {
        if (!document.getElementById('cardio-styles')) {
            const styles = InputValidator.createSafeElement('style', { id: 'cardio-styles' });
            styles.textContent = `
                .log-date-group {
                    margin-bottom: 1.5rem;
                }
                .log-date-group h3 {
                    color: var(--primary-color);
                    margin-bottom: 0.5rem;
                }
                .log-entries {
                    display: grid;
                    gap: 0.5rem;
                }
                .log-entry {
                    background: var(--background-color);
                    border: 1px solid var(--border-color);
                    border-radius: 4px;
                    padding: 0.75rem;
                }
                .log-entry-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.5rem;
                }
                .log-entry-header h4 {
                    margin: 0;
                    color: var(--text-color);
                }
                .log-entry-details {
                    display: flex;
                    justify-content: space-between;
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                }
                .log-entry-notes {
                    margin-top: 0.5rem;
                    padding: 0.5rem;
                    background: var(--background-secondary);
                    border-radius: 4px;
                    font-style: italic;
                    color: var(--text-secondary);
                }
                .log-entry-time {
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                    margin-top: 0.5rem;
                }
                .delete-btn {
                    background: none;
                    border: none;
                    color: var(--danger-color);
                    font-size: 1.2rem;
                    cursor: pointer;
                    padding: 0 0.5rem;
                }
                .delete-btn:hover {
                    background: none;
                    color: #bd2130;
                }
                .empty-state {
                    text-align: center;
                    color: var(--text-secondary);
                    padding: 2rem;
                }
                textarea {
                    width: 100%;
                    resize: vertical;
                    min-height: 60px;
                }
            `;
            document.head.appendChild(styles);
        }
    }

    deleteEntry(id) {
        if (confirm('Are you sure you want to delete this cardio session?')) {
            storage.deleteCardioEntry(id);
            this.refreshLog();
            ui.updateDashboard();
            document.dispatchEvent(new Event('cardioUpdated'));
            ui.showNotification('Cardio session deleted');
        }
    }

    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
}

// Create a global instance
const cardio = new CardioManager();
