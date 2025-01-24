class CircuitManager {
    static LIMITS = {
        EXERCISE_NAME_MAX: 100,
        NOTES_MAX: 1000,
        WEIGHT_MAX: 2000,
        REPS_MAX: 100,
        EXERCISES_MAX: 999 // Virtually unlimited
    };

    constructor() {
        this.form = document.getElementById('circuit-form');
        this.exerciseList = document.getElementById('circuit-exercise-list');
        this.logContainer = document.getElementById('weightlifting-log');
        this.setupEventListeners();
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

        document.getElementById('add-circuit-exercise').addEventListener('click', () => {
            this.addExerciseToCircuit();
        });

        // Listen for set updates
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('update-set-btn')) {
                this.handleSetUpdate(e.target);
            }
        });
    }

    addExerciseToCircuit() {
        const exerciseCount = this.exerciseList.children.length;
        if (exerciseCount >= CircuitManager.LIMITS.EXERCISES_MAX) {
            alert(`Maximum ${CircuitManager.LIMITS.EXERCISES_MAX} exercises allowed in a circuit`);
            return;
        }

        const exerciseEntry = InputValidator.createSafeElement('div', { class: 'exercise-entry' });
        
        exerciseEntry.innerHTML = `
            <div class="form-row">
                <div class="form-group">
                    <label>Exercise:</label>
                    <select class="circuit-exercise" required>
                        <option value="">Select Exercise</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Sets:</label>
                    <input type="number" 
                        class="circuit-sets" 
                        min="1" 
                        pattern="[0-9]*"
                        inputmode="numeric"
                        required>
                </div>
                <div class="form-group">
                    <label>Reps per Set:</label>
                    <input type="number" 
                        class="circuit-reps" 
                        min="1" 
                        max="${CircuitManager.LIMITS.REPS_MAX}" 
                        pattern="[0-9]*"
                        inputmode="numeric"
                        required>
                </div>
                <div class="form-group">
                    <label>Weight (${storage.getSettings().units}):</label>
                    <input type="number" 
                        class="circuit-weight" 
                        min="0" 
                        max="${CircuitManager.LIMITS.WEIGHT_MAX}" 
                        step="0.5"
                        pattern="[0-9]*"
                        inputmode="decimal"
                        required>
                </div>
                <button type="button" class="remove-exercise" onclick="circuitManager.removeExercise(this)">Remove</button>
            </div>
        `;

        // Populate exercise options
        const exerciseSelect = exerciseEntry.querySelector('.circuit-exercise');
        Object.keys(WORKOUTS).forEach(category => {
            Object.keys(WORKOUTS[category]).forEach(subcategory => {
                Object.keys(WORKOUTS[category][subcategory]).forEach(exercise => {
                    const option = InputValidator.createSafeElement('option', { value: exercise }, exercise);
                    exerciseSelect.appendChild(option);
                });
            });
        });

        this.exerciseList.appendChild(exerciseEntry);
    }

    removeExercise(button) {
        button.closest('.exercise-entry').remove();
    }

    validateFormData() {
        const exercises = [];
        const exerciseEntries = this.exerciseList.querySelectorAll('.exercise-entry');

        if (exerciseEntries.length === 0) {
            throw new Error('Add at least one exercise to the circuit');
        }

        exerciseEntries.forEach(entry => {
            const exerciseName = InputValidator.sanitizeText(entry.querySelector('.circuit-exercise').value);
            if (!exerciseName || exerciseName.length > CircuitManager.LIMITS.EXERCISE_NAME_MAX) {
                throw new Error('Invalid exercise name');
            }

            const sets = InputValidator.validateNumber(
                entry.querySelector('.circuit-sets').value,
                1,
                CircuitManager.LIMITS.SETS_MAX
            );

            const reps = InputValidator.validateNumber(
                entry.querySelector('.circuit-reps').value,
                1,
                CircuitManager.LIMITS.REPS_MAX
            );

            const weight = InputValidator.validateNumber(
                entry.querySelector('.circuit-weight').value,
                0,
                CircuitManager.LIMITS.WEIGHT_MAX
            );

            if (!sets || !reps || weight === null) {
                throw new Error('Invalid exercise data');
            }

            exercises.push({
                exerciseName,
                sets,
                reps,
                weight,
                unit: storage.getSettings().units
            });
        });

        const notes = InputValidator.sanitizeText(this.form.querySelector('#circuit-notes').value.trim());
        if (notes.length > CircuitManager.LIMITS.NOTES_MAX) {
            throw new Error('Notes too long');
        }

        return {
            exercises,
            notes,
            date: new Date(this.form.querySelector('#circuit-datetime').value).toISOString()
        };
    }

    handleSubmit() {
        const circuitData = this.validateFormData();
        
        // Add each exercise to storage
        circuitData.exercises.forEach(exercise => {
            const entry = {
                exercise: exercise.exerciseName,
                sets: Array(exercise.sets).fill({
                    weight: exercise.weight,
                    unit: exercise.unit,
                    plannedReps: exercise.reps,
                    actualReps: exercise.reps // Assuming completed as planned
                }),
                notes: circuitData.notes,
                date: circuitData.date
            };
            storage.addWeightliftingEntry(entry);
        });

        this.form.reset();
        this.exerciseList.innerHTML = '';
        this.addExerciseToCircuit(); // Add one empty exercise entry
        document.querySelector('#weightlifting-log').scrollIntoView({ behavior: 'smooth' });
        ui.showNotification('Circuit workout logged successfully!');
        ui.updateDashboard();
        document.dispatchEvent(new Event('weightliftingUpdated'));
    }

    handleSetUpdate(button) {
        const setElement = button.closest('.set-summary');
        const setId = setElement.dataset.setId;

        const newReps = InputValidator.validateNumber(
            setElement.querySelector('.edit-reps').value,
            0,
            CircuitManager.LIMITS.REPS_MAX
        );

        const newWeight = InputValidator.validateNumber(
            setElement.querySelector('.edit-weight').value,
            0,
            CircuitManager.LIMITS.WEIGHT_MAX
        );

        if (newReps === null || newWeight === null) {
            alert('Please enter valid numbers for reps and weight');
            return;
        }

        // Update in storage
        const entries = storage.getWeightlifting();
        let updated = false;

        // Find and update the specific set using its unique ID
        entries.forEach(entry => {
            entry.sets.forEach(set => {
                if (set.id === setId) {
                    set.actualReps = newReps;
                    set.weight = newWeight;
                    updated = true;
                }
            });
        });

        if (updated) {
            storage.saveWeightlifting(entries);
            // Update UI
            weightlifting.refreshLog();
            ui.updateDashboard();
            document.dispatchEvent(new Event('weightliftingUpdated'));
            ui.showNotification('Set updated successfully!');
        }
    }

    makeSetEditable(setElement) {
        const actualText = setElement.querySelector('.actual').textContent;
        const plannedText = setElement.querySelector('.planned').textContent;
        const setId = setElement.dataset.setId;
        
        const reps = actualText.match(/\d+/)[0];
        const weight = plannedText.match(/\d+(\.\d+)?/)[0];
        const unit = storage.getSettings().units;
        
        setElement.innerHTML = `
            <span class="set-number">${setElement.querySelector('.set-number').textContent}</span>
            <div class="edit-set-form" data-set-id="${setId}">
                <div class="edit-field">
                    <label>Reps:</label>
                    <input type="number" 
                        class="edit-reps" 
                        value="${reps}" 
                        min="0" 
                        max="${CircuitManager.LIMITS.REPS_MAX}"
                        pattern="[0-9]*"
                        inputmode="numeric">
                </div>
                <div class="edit-field">
                    <label>Weight (${unit}):</label>
                    <input type="number" 
                        class="edit-weight" 
                        value="${weight}" 
                        min="0" 
                        max="${CircuitManager.LIMITS.WEIGHT_MAX}" 
                        step="0.5"
                        pattern="[0-9]*"
                        inputmode="decimal">
                </div>
                <button class="update-set-btn">Update</button>
                <button class="cancel-edit-btn">Cancel</button>
            </div>
        `;

        // Add cancel button handler
        setElement.querySelector('.cancel-edit-btn').addEventListener('click', () => {
            const completion = ((parseInt(reps) / parseInt(plannedText.match(/\d+/)[0])) * 100).toFixed(1);
            setElement.innerHTML = `
                <span class="set-number">${setElement.querySelector('.set-number').textContent}</span>
                <span class="planned">${plannedText}</span>
                <span class="actual">Completed: ${reps} reps (${completion}%)</span>
                <button class="edit-set-btn">Edit</button>
            `;
            
            // Reattach edit button handler
            setElement.querySelector('.edit-set-btn').addEventListener('click', () => {
                if (!setElement.querySelector('.edit-set-form')) {
                    this.makeSetEditable(setElement);
                }
            });
        });
    }

    ensureStyles() {
        if (!document.getElementById('circuit-edit-styles')) {
            const styles = InputValidator.createSafeElement('style', { id: 'circuit-edit-styles' });
            styles.textContent = `
                .set-summary {
                    position: relative;
                    padding: 0.5rem;
                    background: var(--background-secondary);
                    border-radius: 4px;
                    margin-bottom: 0.5rem;
                }
                .edit-set-form {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 1rem;
                    align-items: center;
                    margin-top: 0.5rem;
                }
                .edit-field {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }
                .edit-field label {
                    font-size: 0.9rem;
                    color: var(--text-secondary);
                }
                .edit-set-form input {
                    width: 100px;
                    padding: 0.5rem;
                    border: 1px solid var(--border-color);
                    border-radius: 4px;
                    background: var(--background-primary);
                    color: var(--text-primary);
                }
                .edit-set-form input:focus {
                    outline: none;
                    border-color: var(--primary-color);
                }
                .update-set-btn, .cancel-edit-btn {
                    padding: 0.5rem 1rem;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: 500;
                }
                .update-set-btn {
                    background: var(--primary-color);
                    color: white;
                }
                .update-set-btn:hover {
                    background: var(--primary-color-dark);
                }
                .cancel-edit-btn {
                    background: var(--background-primary);
                    color: var(--text-primary);
                    border: 1px solid var(--border-color);
                }
                .cancel-edit-btn:hover {
                    background: var(--background-secondary);
                }
                .edit-set-btn {
                    padding: 0.25rem 0.5rem;
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    margin-left: 0.5rem;
                }
                .edit-set-btn:hover {
                    background: var(--primary-color-dark);
                }
            `;
            document.head.appendChild(styles);
        }
    }
}

// Create a global instance
const circuitManager = new CircuitManager();
