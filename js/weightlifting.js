class WeightliftingManager {
    static LIMITS = {
        EXERCISE_NAME_MAX: 100,
        NOTES_MAX: 1000,
        WEIGHT_MAX: 2000,
        REPS_MAX: 100
    };

    constructor() {
        this.form = document.getElementById('weightlifting-form');
        this.logContainer = document.getElementById('weightlifting-log');
        this.setsContainer = document.getElementById('sets-container');
        this.categorySelect = this.form.querySelector('#exercise-category');
        this.subcategorySelect = this.form.querySelector('#exercise-subcategory');
        this.exerciseSelect = this.form.querySelector('#exercise');
        this.exerciseInfoPanel = this.form.querySelector('#exercise-info-panel');
        this.exerciseNameDisplay = this.form.querySelector('#exercise-name-display');
        this.exerciseCategoryDisplay = this.form.querySelector('#exercise-category-display');
        this.exerciseSubcategoryDisplay = this.form.querySelector('#exercise-subcategory-display');
        this.exerciseDescriptionText = this.form.querySelector('#exercise-description-text');
        this.toggleExerciseInfoBtn = this.form.querySelector('#toggle-exercise-info');
        this.trainingTypeSelect = this.form.querySelector('#training-type');
        this.trainingTypeTooltip = this.form.querySelector('#training-type-tooltip');
        
        this.setupEventListeners();
        this.initializeDateTime();
        this.populateWorkoutCategories();
        
        // Initialize with default 3 sets
        this.form.querySelector('#num-sets').value = 3;
        this.updateSetsInputs();
        this.refreshLog();
    }

    populateWorkoutCategories() {
        this.categorySelect.innerHTML = '<option value="">Select Category</option>';
        Object.keys(WORKOUTS).forEach(category => {
            const option = InputValidator.createSafeElement('option', { value: category }, category);
            this.categorySelect.appendChild(option);
        });
    }

    updateSubcategories(category) {
        this.subcategorySelect.innerHTML = '<option value="">Select Type</option>';
        this.exerciseSelect.innerHTML = '<option value="">Select Exercise</option>';
        
        // Hide exercise info panel when category changes
        if (this.exerciseInfoPanel) {
            this.exerciseInfoPanel.classList.add('hidden');
        }

        if (category && WORKOUTS[category]) {
            Object.keys(WORKOUTS[category]).forEach(subcategory => {
                const option = InputValidator.createSafeElement('option', { value: subcategory }, subcategory);
                this.subcategorySelect.appendChild(option);
            });
        }
    }

    updateExercises(category, subcategory) {
        this.exerciseSelect.innerHTML = '<option value="">Select Exercise</option>';
        
        // Hide exercise info panel when subcategory changes
        if (this.exerciseInfoPanel) {
            this.exerciseInfoPanel.classList.add('hidden');
        }

        if (category && subcategory && WORKOUTS[category]?.[subcategory]) {
            Object.keys(WORKOUTS[category][subcategory]).forEach(exercise => {
                const option = InputValidator.createSafeElement('option', { value: exercise }, exercise);
                this.exerciseSelect.appendChild(option);
            });
        }
    }

    
    updateExerciseInfo(exerciseName) {
        if (!exerciseName) {
            this.exerciseInfoPanel.classList.add('hidden');
            return;
        }
        
        const exerciseInfo = getExerciseInfo(exerciseName);
        if (!exerciseInfo) {
            this.exerciseInfoPanel.classList.add('hidden');
            return;
        }
        
        // Update exercise info display
        if (this.exerciseNameDisplay) this.exerciseNameDisplay.textContent = exerciseInfo.name;
        if (this.exerciseCategoryDisplay) this.exerciseCategoryDisplay.textContent = exerciseInfo.category;
        if (this.exerciseSubcategoryDisplay) this.exerciseSubcategoryDisplay.textContent = exerciseInfo.subcategory;
        if (this.exerciseDescriptionText) this.exerciseDescriptionText.textContent = exerciseInfo.description;
        
        // Update exercise tips
        const tips = generateExerciseTips(exerciseInfo.category, exerciseInfo.subcategory, exerciseInfo.name);
        const tipsList = document.getElementById('exercise-tips-list');
        if (tipsList) {
            tipsList.innerHTML = '';
            tips.forEach(tip => {
                const li = document.createElement('li');
                li.textContent = tip;
                tipsList.appendChild(li);
            });
        }
        
        
        // Show the panel
        this.exerciseInfoPanel.classList.remove('hidden');
        
        // Reset toggle button state
        if (this.toggleExerciseInfoBtn) {
            this.toggleExerciseInfoBtn.classList.remove('collapsed');
            const toggleText = this.toggleExerciseInfoBtn.querySelector('.toggle-text');
            if (toggleText) toggleText.textContent = 'Hide Details';
        }
    }
    
    toggleExerciseInfoPanel() {
        if (!this.exerciseInfoPanel || !this.toggleExerciseInfoBtn) return;
        
        const exerciseContent = this.exerciseInfoPanel.querySelector('.exercise-content');
        const isCollapsed = this.toggleExerciseInfoBtn.classList.contains('collapsed');
        const toggleText = this.toggleExerciseInfoBtn.querySelector('.toggle-text');
        
        if (isCollapsed) {
            // Expand
            if (exerciseContent) exerciseContent.style.display = 'grid';
            this.toggleExerciseInfoBtn.classList.remove('collapsed');
            if (toggleText) toggleText.textContent = 'Hide Details';
        } else {
            // Collapse
            if (exerciseContent) exerciseContent.style.display = 'none';
            this.toggleExerciseInfoBtn.classList.add('collapsed');
            if (toggleText) toggleText.textContent = 'Show Details';
        }
    }

    updateTrainingTypeTooltip(trainingType) {
        const descriptions = {
            'straight': 'Traditional sets with same weight and reps throughout',
            'pyramid': 'Increase weight and decrease reps each set',
            'reverse-pyramid': 'Start heavy with low reps, decrease weight and increase reps',
            'drop-set': 'Perform a set to failure, then immediately reduce weight and continue',
            'double-drop': 'Drop weight twice in same set after reaching failure',
            'triple-drop': 'Drop weight three times in same set after reaching failure',
            'superset': 'Two exercises performed back-to-back without rest',
            'triset': 'Three exercises performed consecutively without rest',
            'giant-set': 'Four or more exercises performed consecutively without rest',
            'cluster': 'Break each set into mini-sets with short rests between',
            'rest-pause': 'Perform set to failure, rest 10-15 seconds, repeat',
            'mechanical-drop': 'Change exercise variation to an easier movement when fatigued',
            'tempo': 'Focus on controlled movement speed (e.g., 3-1-2-1 tempo)',
            'negative': 'Emphasize the eccentric (lowering) portion of the movement',
            'partial-reps': 'Perform reps through partial range of motion',
            'isometric': 'Hold weight in static position for time',
            'pre-exhaust': 'Isolate muscle before compound exercise',
            'post-exhaust': 'Isolate muscle after compound exercise',
            'strip-set': 'Remove weight plates progressively during set',
            'wave-loading': 'Undulating rep ranges within workout (3-5-3)',
            'density': 'Complete more work in same time frame',
            'contrast': 'Alternate heavy and explosive movements',
            'accommodating': 'Variable resistance using bands or chains',
            'pause-reps': 'Pause at bottom/top of movement for 1-3 seconds',
            'speed-work': 'Focus on explosive, fast movement execution'
        };
        
        const description = descriptions[trainingType];
        if (description) {
            this.trainingTypeTooltip.textContent = description;
            this.trainingTypeTooltip.classList.add('active');
        } else {
            this.trainingTypeTooltip.textContent = '';
            this.trainingTypeTooltip.classList.remove('active');
        }
    }

    handleWorkoutTypeChange(typeBtn) {
        // Update active workout type button
        document.querySelectorAll('.workout-type-btn').forEach(btn => btn.classList.remove('active'));
        typeBtn.classList.add('active');
        
        // Hide all forms and sections
        document.querySelectorAll('.input-form').forEach(form => form.classList.add('hidden'));
        
        // Show the selected form/section
        const workoutType = typeBtn.dataset.type;
        switch (workoutType) {
            case 'single':
                this.form.classList.remove('hidden');
                this.form.classList.add('active');
                break;
            case 'circuit':
                document.getElementById('circuit-form')?.classList.remove('hidden');
                break;
            case 'timer':
                document.getElementById('timer-section')?.classList.remove('hidden');
                break;
            case 'progress':
                document.getElementById('progress-section')?.classList.remove('hidden');
                // Update progress display when section is shown
                if (window.progressTracker) {
                    window.progressTracker.updateProgressDisplay();
                }
                break;
        }
    }

    handlePresetClick(presetBtn) {
        // Update active preset button
        document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));
        presetBtn.classList.add('active');
        
        // Reset individual filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        
        // Apply preset filter
        const presetType = presetBtn.dataset.preset;
        this.filterByPreset(presetType);
    }

    filterByPreset(presetType) {
        const presetConfigurations = {
            'all': [],
            'beginner': ['straight', 'pyramid'],
            'intermediate': ['straight', 'pyramid', 'reverse-pyramid', 'superset', 'drop-set', 'tempo'],
            'advanced': ['drop-set', 'double-drop', 'triple-drop', 'superset', 'triset', 'giant-set', 'rest-pause', 'mechanical-drop', 'cluster', 'contrast', 'accommodating'],
            'strength': ['straight', 'pyramid', 'reverse-pyramid', 'cluster', 'wave-loading', 'contrast', 'pause-reps'],
            'hypertrophy': ['straight', 'drop-set', 'double-drop', 'superset', 'triset', 'giant-set', 'rest-pause', 'mechanical-drop', 'tempo', 'pre-exhaust', 'post-exhaust'],
            'endurance': ['straight', 'density', 'circuit', 'metabolic', 'endurance', 'bodyweight', 'hiit'],
            'power': ['straight', 'cluster', 'contrast', 'speed-work', 'power', 'accommodating'],
            'intensity': ['drop-set', 'double-drop', 'triple-drop', 'rest-pause', 'density', 'tabata', 'amrap', 'emom', 'hiit', 'metabolic'],
            'circuits': ['traditional', 'timed', 'emom', 'amrap', 'tabata', 'supersets', 'compound', 'ladder', 'descending', 'ascending', 'hiit', 'strength-circuit', 'metabolic', 'bodyweight', 'functional', 'power', 'endurance', 'hybrid', 'chipper', 'death-by']
        };
        
        const allowedTypes = presetConfigurations[presetType] || [];
        this.filterLogEntriesByPreset(allowedTypes, presetType === 'all');
    }

    filterLogEntriesByPreset(allowedTypes, showAll = false) {
        const allEntries = this.logContainer.querySelectorAll('.log-entry, .circuit-entry');
        
        allEntries.forEach(entry => {
            let shouldShow = showAll;
            
            if (!showAll) {
                if (entry.classList.contains('circuit-entry')) {
                    // For circuit entries, check if any circuit type matches
                    shouldShow = allowedTypes.some(type => 
                        ['traditional', 'timed', 'emom', 'amrap', 'tabata', 'supersets', 'compound', 
                         'ladder', 'descending', 'ascending', 'hiit', 'strength-circuit', 'metabolic', 
                         'bodyweight', 'functional', 'power', 'endurance', 'hybrid', 'chipper', 'death-by'].includes(type)
                    );
                } else {
                    // For single exercises, check training type
                    const trainingTypeSpan = entry.querySelector('.training-type');
                    const entryTrainingType = trainingTypeSpan ? 
                        trainingTypeSpan.textContent.toLowerCase().replace(/\s+/g, '-') : 
                        'straight';
                    shouldShow = allowedTypes.includes(entryTrainingType);
                }
            }
            
            entry.style.display = shouldShow ? 'block' : 'none';
        });
        
        // Show/hide date groups
        const dateGroups = this.logContainer.querySelectorAll('.log-date-group');
        dateGroups.forEach(group => {
            const visibleEntries = group.querySelectorAll('.log-entry:not([style*="display: none"]), .circuit-entry:not([style*="display: none"])');
            group.style.display = visibleEntries.length > 0 ? 'block' : 'none';
        });
    }

    handleFilterClick(filterBtn) {
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        filterBtn.classList.add('active');
        
        // Apply filter
        const filterType = filterBtn.dataset.filter;
        this.filterLogEntries(filterType);
    }

    filterLogEntries(filterType) {
        const allEntries = this.logContainer.querySelectorAll('.log-entry, .circuit-entry');
        
        allEntries.forEach(entry => {
            let shouldShow = true;
            
            if (filterType === 'all') {
                shouldShow = true;
            } else if (filterType === 'circuit') {
                shouldShow = entry.classList.contains('circuit-entry');
            } else {
                // For single exercises, check training type
                if (entry.classList.contains('circuit-entry')) {
                    shouldShow = false;
                } else {
                    const trainingTypeSpan = entry.querySelector('.training-type');
                    const entryTrainingType = trainingTypeSpan ? 
                        trainingTypeSpan.textContent.toLowerCase().replace(/\s+/g, '-') : 
                        'straight';
                    shouldShow = entryTrainingType === filterType || 
                               (filterType === 'straight' && !trainingTypeSpan);
                }
            }
            
            entry.style.display = shouldShow ? 'block' : 'none';
        });
        
        // Show/hide date groups if they have no visible entries
        const dateGroups = this.logContainer.querySelectorAll('.log-date-group');
        dateGroups.forEach(group => {
            const visibleEntries = group.querySelectorAll('.log-entry:not([style*="display: none"]), .circuit-entry:not([style*="display: none"])');
            group.style.display = visibleEntries.length > 0 ? 'block' : 'none';
        });
    }

    initializeDateTime() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        this.form.datetime.value = `${year}-${month}-${day}T${hours}:${minutes}`;
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

        this.form.querySelector('#num-sets').addEventListener('input', () => {
            this.updateSetsInputs();
        });

        this.form.querySelector('#apply-defaults').addEventListener('click', () => {
            this.applyDefaultsToSets();
        });

        // Exercise selection event listeners
        this.categorySelect.addEventListener('change', () => {
            this.updateSubcategories(this.categorySelect.value);
        });

        this.subcategorySelect.addEventListener('change', () => {
            this.updateExercises(this.categorySelect.value, this.subcategorySelect.value);
        });

        this.exerciseSelect.addEventListener('change', () => {
            this.updateExerciseInfo(this.exerciseSelect.value);
        });
        
        // Toggle exercise info panel
        if (this.toggleExerciseInfoBtn) {
            this.toggleExerciseInfoBtn.addEventListener('click', () => {
                this.toggleExerciseInfoPanel();
            });
        }
        
        this.trainingTypeSelect.addEventListener('change', () => {
            this.updateTrainingTypeTooltip(this.trainingTypeSelect.value);
            this.updateSetsInputs(); // Update sets based on training type
        });

        // Filter event listeners
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleFilterClick(e.target);
            });
        });

        // Preset filter event listeners
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handlePresetClick(e.target);
            });
        });

        // Workout type selector event listeners
        document.querySelectorAll('.workout-type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleWorkoutTypeChange(e.target);
            });
        });
    }

    updateSetsInputs() {
        const numSetsInput = this.form.querySelector('#num-sets').value;
        const numSets = parseInt(numSetsInput) || 3; // Default to 3 if invalid input
        
        this.form.querySelector('#num-sets').value = numSets;
        
        // Save current values
        const currentSets = Array.from(this.setsContainer.querySelectorAll('.set-group')).map(setGroup => ({
            weight: setGroup.querySelector('.set-weight').value,
            plannedReps: setGroup.querySelector('.set-planned-reps').value,
            actualReps: setGroup.querySelector('.set-actual-reps').value
        }));

        // Clear container
        this.setsContainer.innerHTML = '';
        
        // Create wrapper
        const wrapper = InputValidator.createSafeElement('div', { class: 'sets-wrapper' });
        
        // Generate inputs for each set
        for (let i = 0; i < numSets; i++) {
            const currentSet = currentSets[i] || {};
            const setGroup = InputValidator.createSafeElement('div', { 
                class: 'set-group',
                'data-set': (i + 1).toString()
            });
            
            setGroup.innerHTML = `
                <h4>Set ${i + 1}</h4>
                <div class="form-row">
                    <div class="form-group">
                        <label for="weight-${i}">Weight (${storage.getSettings().units}):</label>
                        <input type="number" id="weight-${i}" class="set-weight" 
                            min="0" 
                            max="${WeightliftingManager.LIMITS.WEIGHT_MAX}" 
                            step="0.5" 
                            pattern="[0-9]*"
                            inputmode="decimal"
                            required
                            value="${InputValidator.sanitizeText(currentSet.weight || '')}">
                    </div>
                    <div class="form-group">
                        <label for="planned-reps-${i}">Planned Reps:</label>
                        <input type="number" id="planned-reps-${i}" class="set-planned-reps" 
                            min="1" 
                            max="${WeightliftingManager.LIMITS.REPS_MAX}" 
                            pattern="[0-9]*"
                            inputmode="numeric"
                            required
                            value="${InputValidator.sanitizeText(currentSet.plannedReps || '')}">
                    </div>
                    <div class="form-group">
                        <label for="actual-reps-${i}">Actual Reps:</label>
                        <input type="number" id="actual-reps-${i}" class="set-actual-reps" 
                            min="0" 
                            max="${WeightliftingManager.LIMITS.REPS_MAX}" 
                            pattern="[0-9]*"
                            inputmode="numeric"
                            required
                            value="${InputValidator.sanitizeText(currentSet.actualReps || '')}">
                    </div>
                </div>
            `;
            
            wrapper.appendChild(setGroup);
        }
        
        this.setsContainer.appendChild(wrapper);

        this.ensureStyles();
    }

    ensureStyles() {
        if (!document.getElementById('sets-styles')) {
            const styles = InputValidator.createSafeElement('style', { id: 'sets-styles' });
            styles.textContent = `
                .sets-wrapper {
                    max-height: 400px;
                    overflow-y: auto;
                    padding-right: 10px;
                }
                .set-group {
                    background: var(--background-secondary);
                    border-radius: 4px;
                    padding: 1rem;
                    margin: 1rem 0;
                }
                .set-group h4 {
                    margin: 0 0 0.5rem 0;
                    color: var(--primary-color);
                }
                .set-group .form-row {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                    gap: 1rem;
                }
                .set-group input {
                    width: 100%;
                }
                @media (max-width: 600px) {
                    .set-group .form-row {
                        grid-template-columns: 1fr;
                    }
                }
            `;
            document.head.appendChild(styles);
        }

        if (!document.getElementById('set-styles')) {
            const styles = InputValidator.createSafeElement('style', { id: 'set-styles' });
            styles.textContent = `
                .set-group {
                    background: var(--background-secondary);
                    border-radius: 4px;
                    padding: 1rem;
                    margin: 1rem 0;
                }
                .set-group h4 {
                    margin: 0 0 0.5rem 0;
                    color: var(--primary-color);
                }
                .performance-comparison {
                    display: flex;
                    gap: 1rem;
                    margin-top: 0.5rem;
                    font-size: 0.9rem;
                }
                .performance-comparison .planned {
                    color: var(--text-secondary);
                }
                .performance-comparison .actual {
                    color: var(--primary-color);
                }
                .performance-comparison .difference {
                    color: var(--text-secondary);
                    font-style: italic;
                }
            `;
            document.head.appendChild(styles);
        }
    }

    applyDefaultsToSets() {
        const defaultWeight = InputValidator.validateNumber(
            this.form.querySelector('#default-weight').value,
            0,
            WeightliftingManager.LIMITS.WEIGHT_MAX
        );
        const defaultReps = InputValidator.validateNumber(
            this.form.querySelector('#default-reps').value,
            1,
            WeightliftingManager.LIMITS.REPS_MAX
        );

        if (!defaultWeight || !defaultReps) {
            alert('Please enter valid default weight and reps');
            return;
        }

        this.setsContainer.querySelectorAll('.set-group').forEach(setGroup => {
            setGroup.querySelector('.set-weight').value = defaultWeight;
            setGroup.querySelector('.set-planned-reps').value = defaultReps;
        });
    }

    validateFormData() {
        const exercise = InputValidator.sanitizeText(this.form.exercise.value);
        if (!exercise || exercise.length > WeightliftingManager.LIMITS.EXERCISE_NAME_MAX) {
            throw new Error('Invalid exercise name');
        }

        const sets = [];
        this.setsContainer.querySelectorAll('.set-group').forEach(setGroup => {
            let weight = InputValidator.validateNumber(
                setGroup.querySelector('.set-weight').value,
                0,
                WeightliftingManager.LIMITS.WEIGHT_MAX
            );

            // Get the current unit from settings
            const settings = storage.getSettings();
            const unit = settings.units;
            console.log('Current unit:', unit);
            const plannedReps = InputValidator.validateNumber(
                setGroup.querySelector('.set-planned-reps').value,
                1,
                WeightliftingManager.LIMITS.REPS_MAX
            );
            const actualReps = InputValidator.validateNumber(
                setGroup.querySelector('.set-actual-reps').value,
                0,
                WeightliftingManager.LIMITS.REPS_MAX
            );

            if (!weight || !plannedReps || actualReps === null) {
                throw new Error('Invalid set data');
            }

            const set = { 
                weight, 
                unit,
                plannedReps, 
                actualReps 
            };
            console.log('Adding set:', set);
            sets.push(set);
        });

        const notes = InputValidator.sanitizeText(this.form.notes.value.trim());
        if (notes.length > WeightliftingManager.LIMITS.NOTES_MAX) {
            throw new Error('Notes too long');
        }

        const trainingType = this.form.querySelector('#training-type').value;
        
        return {
            exercise,
            sets,
            notes,
            trainingType,
            date: new Date(this.form.datetime.value).toISOString()
        };
    }

    handleSubmit() {
        const entry = this.validateFormData();
        storage.addWeightliftingEntry(entry);
        this.form.reset();
        this.initializeDateTime();
        this.updateSetsInputs();
        this.refreshLog();
        document.dispatchEvent(new Event('weightliftingUpdated'));
        document.dispatchEvent(new Event('workoutLogged'));
        ui.showNotification('Weightlifting exercise logged successfully!');
    }

    refreshLog() {
        const entries = storage.getWeightlifting();
        
        if (entries.length === 0) {
            const emptyState = InputValidator.createSafeElement('p', { class: 'empty-state' }, 
                'No exercises logged yet. Start by adding your first exercise!'
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

            // Group circuit exercises (entries with same date and notes)
            const circuits = new Map();
            dateEntries.forEach(entry => {
                const key = `${entry.date}-${entry.notes}`;
                if (!circuits.has(key)) {
                    circuits.set(key, []);
                }
                circuits.get(key).push(entry);
            });

            // Process each group of entries
            circuits.forEach(circuitEntries => {
                // If this is a circuit (multiple exercises with same timestamp and notes)
                if (circuitEntries.length > 1) {
                    const circuitContainer = InputValidator.createSafeElement('div', { class: 'circuit-entry' });
                    
                    // Add circuit header
                    const circuitHeader = InputValidator.createSafeElement('div', { class: 'circuit-header' });
                    circuitHeader.appendChild(InputValidator.createSafeElement('h4', {}, '🔄 Circuit Workout'));
                    circuitContainer.appendChild(circuitHeader);

                    let totalCircuitWeight = 0;
                    let totalCircuitReps = 0;

                    // Add each exercise in the circuit
                    circuitEntries.forEach(entry => {
                        const exerciseDiv = this.createExerciseEntry(entry, true);
                        circuitContainer.appendChild(exerciseDiv);

                        // Calculate circuit totals
                        const settings = storage.getSettings();
                        entry.sets.forEach(set => {
                            const weightInDisplayUnit = settings.units === set.unit ? 
                                set.weight : 
                                (settings.units === 'kg' ? WeightConverter.lbsToKg(set.weight) : WeightConverter.kgToLbs(set.weight));
                            totalCircuitWeight += weightInDisplayUnit * set.actualReps;
                            totalCircuitReps += set.actualReps;
                        });
                    });

                    // Add circuit summary
                    const circuitSummary = InputValidator.createSafeElement('div', { class: 'circuit-summary' });
                    circuitSummary.appendChild(InputValidator.createSafeElement('span', {}, 
                        `Total Circuit Weight: ${WeightConverter.formatWeight(totalCircuitWeight, storage.getSettings().units)}`
                    ));
                    circuitSummary.appendChild(InputValidator.createSafeElement('span', {}, 
                        `Total Circuit Reps: ${totalCircuitReps}`
                    ));
                    if (circuitEntries[0].notes) {
                        circuitSummary.appendChild(InputValidator.createSafeElement('div', 
                            { class: 'circuit-notes' }, 
                            circuitEntries[0].notes
                        ));
                    }
                    circuitContainer.appendChild(circuitSummary);

                    // Add timestamp
                    circuitContainer.appendChild(InputValidator.createSafeElement('div', 
                        { class: 'log-entry-time' }, 
                        new Date(circuitEntries[0].date).toLocaleTimeString()
                    ));

                    entriesContainer.appendChild(circuitContainer);
                } else {
                    // Single exercise entry
                    const entry = circuitEntries[0];
                    const exerciseDiv = this.createExerciseEntry(entry, false);
                    entriesContainer.appendChild(exerciseDiv);
                }
            });
            dateGroup.appendChild(entriesContainer);
            this.logContainer.appendChild(dateGroup);
        });

        this.ensureCircuitStyles();
    }

    createExerciseEntry(entry, isCircuitExercise) {
        const totalPlannedReps = entry.sets.reduce((sum, set) => sum + set.plannedReps, 0);
        const totalActualReps = entry.sets.reduce((sum, set) => sum + set.actualReps, 0);
        const settings = storage.getSettings();
        const totalWeight = entry.sets.reduce((sum, set) => {
            const weightInDisplayUnit = settings.units === set.unit ? 
                set.weight : 
                (settings.units === 'kg' ? WeightConverter.lbsToKg(set.weight) : WeightConverter.kgToLbs(set.weight));
            return sum + (weightInDisplayUnit * set.actualReps);
        }, 0);

        const logEntry = InputValidator.createSafeElement('div', { 
            class: `log-entry ${isCircuitExercise ? 'circuit-exercise' : ''}`,
            'data-id': entry.id.toString()
        });

        // Create header
        const header = InputValidator.createSafeElement('div', { class: 'log-entry-header' });
        header.appendChild(InputValidator.createSafeElement('h4', {}, entry.exercise));
        
        // Add training type if present
        if (entry.trainingType && entry.trainingType !== 'straight') {
            const trainingTypeSpan = InputValidator.createSafeElement('span', { class: 'training-type' });
            const trainingTypeNames = {
                'pyramid': 'Pyramid',
                'reverse-pyramid': 'Reverse Pyramid',
                'drop-set': 'Drop Set',
                'superset': 'Superset',
                'cluster': 'Cluster Set',
                'rest-pause': 'Rest-Pause',
                'mechanical-drop': 'Mechanical Drop',
                'tempo': 'Tempo Training'
            };
            trainingTypeSpan.textContent = trainingTypeNames[entry.trainingType] || entry.trainingType;
            header.appendChild(trainingTypeSpan);
        }
        
        if (!isCircuitExercise) {
            const deleteBtn = InputValidator.createSafeElement('button', { class: 'delete-btn' }, '×');
            deleteBtn.addEventListener('click', () => this.deleteEntry(entry.id));
            header.appendChild(deleteBtn);
        }
        
        logEntry.appendChild(header);

        // Create sets section
        const setsContainer = InputValidator.createSafeElement('div', { class: 'log-entry-sets' });
        
        entry.sets.forEach((set, index) => {
            const completion = ((set.actualReps / set.plannedReps) * 100).toFixed(1);
            const setDiv = InputValidator.createSafeElement('div', { 
                class: 'set-summary',
                'data-set-id': set.id,
                'data-set-index': index.toString()
            });
            
            setDiv.appendChild(InputValidator.createSafeElement('span', { class: 'set-number' }, 
                `Set ${index + 1}:`
            ));
            setDiv.appendChild(InputValidator.createSafeElement('span', { class: 'planned' }, 
                `Planned: ${set.plannedReps} reps @ ${WeightConverter.formatWeight(set.weight, settings.units, set.unit || 'lbs')}`
            ));
            setDiv.appendChild(InputValidator.createSafeElement('span', { class: 'actual' }, 
                `Completed: ${set.actualReps} reps (${completion}%)`
            ));

            // Add edit button
            const editBtn = InputValidator.createSafeElement('button', { class: 'edit-set-btn' }, 'Edit');
            editBtn.addEventListener('click', () => {
                if (!setDiv.querySelector('.edit-set-form')) {
                    circuitManager.makeSetEditable(setDiv);
                }
            });
            setDiv.appendChild(editBtn);
            
            setsContainer.appendChild(setDiv);
        });
        
        logEntry.appendChild(setsContainer);

        // Create summary section
        const summary = InputValidator.createSafeElement('div', { class: 'log-entry-summary' });
        summary.appendChild(InputValidator.createSafeElement('span', {}, 
            `Total Planned: ${totalPlannedReps} reps`
        ));
        summary.appendChild(InputValidator.createSafeElement('span', {}, 
            `Total Completed: ${totalActualReps} reps`
        ));
        summary.appendChild(InputValidator.createSafeElement('span', {}, 
            `Total Weight: ${WeightConverter.formatWeight(totalWeight, settings.units, entry.sets[0].unit)}`
        ));
        
        logEntry.appendChild(summary);

        // Add notes if present and not in a circuit
        if (entry.notes && !isCircuitExercise) {
            logEntry.appendChild(InputValidator.createSafeElement('div', 
                { class: 'log-entry-notes' }, 
                entry.notes
            ));
        }

        // Add timestamp if not in a circuit
        if (!isCircuitExercise) {
            logEntry.appendChild(InputValidator.createSafeElement('div', 
                { class: 'log-entry-time' }, 
                new Date(entry.date).toLocaleTimeString()
            ));
        }

        return logEntry;
    }

    ensureCircuitStyles() {
        if (!document.getElementById('circuit-styles')) {
            const styles = InputValidator.createSafeElement('style', { id: 'circuit-styles' });
            styles.textContent = `
                .circuit-entry {
                    background: var(--background-secondary);
                    border-radius: 8px;
                    padding: 1rem;
                    margin: 1rem 0;
                    border: 2px solid var(--primary-color);
                }
                .circuit-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 1px solid var(--border-color);
                }
                .circuit-header h4 {
                    margin: 0;
                    color: var(--primary-color);
                }
                .circuit-exercise {
                    margin: 0.5rem 0;
                    padding: 0.5rem;
                    background: var(--background-primary);
                    border-radius: 4px;
                }
                .circuit-summary {
                    margin-top: 1rem;
                    padding-top: 1rem;
                    border-top: 1px solid var(--border-color);
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .circuit-notes {
                    font-style: italic;
                    color: var(--text-secondary);
                    margin-top: 0.5rem;
                }

                /* Edit Set Styles */
                .set-summary {
                    position: relative;
                    padding-right: 60px;
                }
                .edit-set-btn {
                    position: absolute;
                    right: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    padding: 4px 8px;
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 0.9rem;
                }
                .edit-set-btn:hover {
                    background: var(--primary-color-dark);
                }
                .edit-set-form {
                    display: flex;
                    gap: 0.5rem;
                    align-items: center;
                    margin-top: 0.5rem;
                }
                .edit-set-form input {
                    width: 80px;
                    padding: 4px 8px;
                    border: 1px solid var(--border-color);
                    border-radius: 4px;
                }
                .update-set-btn {
                    padding: 4px 8px;
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                .update-set-btn:hover {
                    background: var(--primary-color-dark);
                }
            `;
            document.head.appendChild(styles);
        }
    }

    deleteEntry(id) {
        if (confirm('Are you sure you want to delete this exercise entry?')) {
            storage.deleteWeightliftingEntry(id);
            this.refreshLog();
            ui.updateDashboard();
            document.dispatchEvent(new Event('weightliftingUpdated'));
            ui.showNotification('Exercise entry deleted');
        }
    }
}

// Create a global instance
window.weightlifting = new WeightliftingManager();
