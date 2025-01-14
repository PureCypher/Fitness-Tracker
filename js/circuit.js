class CircuitManager {
    static LIMITS = {
        EXERCISE_NAME_MAX: 100,
        NOTES_MAX: 1000,
        WEIGHT_MAX: 2000,
        REPS_MAX: 100,
        EXERCISES_MAX: 10
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
                    <input type="number" class="circuit-sets" min="1" max="${CircuitManager.LIMITS.SETS_MAX}" required>
                </div>
                <div class="form-group">
                    <label>Reps per Set:</label>
                    <input type="number" class="circuit-reps" min="1" max="${CircuitManager.LIMITS.REPS_MAX}" required>
                </div>
                <div class="form-group">
                    <label>Weight (${storage.getSettings().units}):</label>
                    <input type="number" class="circuit-weight" min="0" max="${CircuitManager.LIMITS.WEIGHT_MAX}" step="0.5" required>
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
        const entryElement = button.closest('.log-entry');
        const entryId = parseInt(entryElement.dataset.id);
        const setIndex = parseInt(setElement.dataset.setIndex);

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
        const entryIndex = entries.findIndex(entry => entry.id === entryId);
        
        if (entryIndex !== -1) {
            entries[entryIndex].sets[setIndex].actualReps = newReps;
            entries[entryIndex].sets[setIndex].weight = newWeight;
            storage.saveWeightlifting(entries);

            // Update UI
            weightlifting.refreshLog();
            ui.updateDashboard();
            document.dispatchEvent(new Event('weightliftingUpdated'));
            ui.showNotification('Set updated successfully!');
        }
    }

    makeSetEditable(setElement) {
        const reps = setElement.querySelector('.actual').textContent.match(/\d+/)[0];
        const weight = setElement.querySelector('.planned').textContent.match(/\d+(\.\d+)?/)[0];
        
        setElement.innerHTML = `
            <span class="set-number">${setElement.querySelector('.set-number').textContent}</span>
            <div class="edit-set-form">
                <input type="number" class="edit-reps" value="${reps}" min="0" max="${CircuitManager.LIMITS.REPS_MAX}">
                <input type="number" class="edit-weight" value="${weight}" min="0" max="${CircuitManager.LIMITS.WEIGHT_MAX}" step="0.5">
                <button class="update-set-btn">Update</button>
            </div>
        `;
    }

    ensureStyles() {
        if (!document.getElementById('circuit-edit-styles')) {
            const styles = InputValidator.createSafeElement('style', { id: 'circuit-edit-styles' });
            styles.textContent = `
                .set-summary {
                    position: relative;
                }
                .edit-set-form {
                    display: flex;
                    gap: 0.5rem;
                    align-items: center;
                    margin-top: 0.5rem;
                }
                .edit-set-form input {
                    width: 80px;
                    padding: 0.25rem;
                }
                .update-set-btn {
                    padding: 0.25rem 0.5rem;
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
}

// Create a global instance
const circuitManager = new CircuitManager();
