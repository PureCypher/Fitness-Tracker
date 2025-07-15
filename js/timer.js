class RestTimer {
    constructor() {
        this.currentTimer = null;
        this.isRunning = false;
        this.isPaused = false;
        this.timeRemaining = 0;
        this.totalTime = 0;
        this.setupEventListeners();
        this.setupNotifications();
    }

    setupEventListeners() {
        // Preset timer buttons
        document.querySelectorAll('.timer-preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const seconds = parseInt(e.target.dataset.seconds);
                this.startTimer(seconds);
            });
        });

        // Custom timer
        document.getElementById('start-custom-timer')?.addEventListener('click', () => {
            this.startCustomTimer();
        });

        // Timer controls
        document.getElementById('timer-play-pause')?.addEventListener('click', () => {
            this.toggleTimer();
        });

        document.getElementById('timer-stop')?.addEventListener('click', () => {
            this.stopTimer();
        });

        document.getElementById('timer-reset')?.addEventListener('click', () => {
            this.resetTimer();
        });

        // Add timer notifications to workout completion
        document.addEventListener('weightliftingUpdated', () => {
            this.suggestRestTime();
        });
    }

    setupNotifications() {
        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    startTimer(seconds) {
        this.stopTimer(); // Stop any existing timer
        this.totalTime = seconds;
        this.timeRemaining = seconds;
        this.isRunning = true;
        this.isPaused = false;
        
        this.updateDisplay();
        this.updateControls();
        this.startCircleAnimation();
        
        this.currentTimer = setInterval(() => {
            this.tick();
        }, 1000);

        ui.showNotification(`Rest timer started: ${this.formatTime(seconds)}`);
    }

    startCustomTimer() {
        const minutes = parseInt(document.getElementById('custom-minutes')?.value) || 0;
        const seconds = parseInt(document.getElementById('custom-seconds')?.value) || 0;
        const totalSeconds = (minutes * 60) + seconds;
        
        if (totalSeconds > 0) {
            this.startTimer(totalSeconds);
        } else {
            ui.showNotification('Please enter a valid time');
        }
    }

    tick() {
        if (this.isRunning && !this.isPaused) {
            this.timeRemaining--;
            this.updateDisplay();
            this.updateCircleProgress();
            
            // Warning notifications
            if (this.timeRemaining === 10) {
                this.showNotification('10 seconds remaining', 'warning');
                this.playSound('warning');
            }
            
            if (this.timeRemaining <= 0) {
                this.timerComplete();
            }
        }
    }

    timerComplete() {
        this.stopTimer();
        this.showNotification('Rest time complete! Ready for next set?', 'success');
        this.playSound('complete');
        this.flashScreen();
        
        // Reset display
        setTimeout(() => {
            this.resetDisplay();
        }, 3000);
    }

    toggleTimer() {
        if (!this.isRunning) return;
        
        this.isPaused = !this.isPaused;
        this.updateControls();
        
        if (this.isPaused) {
            ui.showNotification('Timer paused');
        } else {
            ui.showNotification('Timer resumed');
        }
    }

    stopTimer() {
        if (this.currentTimer) {
            clearInterval(this.currentTimer);
            this.currentTimer = null;
        }
        this.isRunning = false;
        this.isPaused = false;
        this.updateControls();
        this.stopCircleAnimation();
    }

    resetTimer() {
        this.stopTimer();
        this.timeRemaining = this.totalTime;
        this.updateDisplay();
        this.resetCircleProgress();
    }

    updateDisplay() {
        const timerText = document.getElementById('timer-text');
        if (timerText) {
            if (this.timeRemaining <= 0) {
                timerText.textContent = 'Complete!';
                timerText.style.color = 'var(--success-color)';
            } else {
                timerText.textContent = this.formatTime(this.timeRemaining);
                timerText.style.color = this.timeRemaining <= 10 ? 'var(--danger-color)' : 'var(--text-color)';
            }
        }
    }

    updateControls() {
        const playPauseBtn = document.getElementById('timer-play-pause');
        const stopBtn = document.getElementById('timer-stop');
        const resetBtn = document.getElementById('timer-reset');
        
        if (playPauseBtn) {
            playPauseBtn.disabled = !this.isRunning;
            playPauseBtn.textContent = this.isPaused ? '▶️' : '⏸️';
        }
        
        if (stopBtn) {
            stopBtn.disabled = !this.isRunning;
        }
        
        if (resetBtn) {
            resetBtn.disabled = !this.isRunning && this.timeRemaining === this.totalTime;
        }
    }

    startCircleAnimation() {
        const circle = document.getElementById('timer-circle');
        if (circle) {
            circle.classList.add('active');
        }
    }

    stopCircleAnimation() {
        const circle = document.getElementById('timer-circle');
        if (circle) {
            circle.classList.remove('active');
        }
    }

    updateCircleProgress() {
        const circle = document.getElementById('timer-circle');
        if (circle && this.totalTime > 0) {
            const progress = (this.totalTime - this.timeRemaining) / this.totalTime;
            const circumference = 2 * Math.PI * 92; // Adjusted for border
            const strokeDasharray = circumference;
            const strokeDashoffset = circumference * (1 - progress);
            
            // Create or update progress circle
            let progressCircle = circle.querySelector('.progress-circle');
            if (!progressCircle) {
                progressCircle = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                progressCircle.classList.add('progress-circle');
                progressCircle.style.position = 'absolute';
                progressCircle.style.top = '0';
                progressCircle.style.left = '0';
                progressCircle.style.width = '100%';
                progressCircle.style.height = '100%';
                progressCircle.style.transform = 'rotate(-90deg)';
                
                const progressPath = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                progressPath.setAttribute('cx', '100');
                progressPath.setAttribute('cy', '100');
                progressPath.setAttribute('r', '92');
                progressPath.setAttribute('fill', 'none');
                progressPath.setAttribute('stroke', 'var(--primary-color)');
                progressPath.setAttribute('stroke-width', '8');
                progressPath.setAttribute('stroke-linecap', 'round');
                progressPath.style.transition = 'stroke-dashoffset 1s ease';
                
                progressCircle.appendChild(progressPath);
                circle.appendChild(progressCircle);
            }
            
            const progressPath = progressCircle.querySelector('circle');
            progressPath.style.strokeDasharray = strokeDasharray;
            progressPath.style.strokeDashoffset = strokeDashoffset;
        }
    }

    resetCircleProgress() {
        const circle = document.getElementById('timer-circle');
        const progressCircle = circle?.querySelector('.progress-circle');
        if (progressCircle) {
            circle.removeChild(progressCircle);
        }
    }

    resetDisplay() {
        const timerText = document.getElementById('timer-text');
        if (timerText) {
            timerText.textContent = 'Ready';
            timerText.style.color = 'var(--text-color)';
        }
        this.resetCircleProgress();
        this.updateControls();
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    showNotification(message, type = 'info') {
        // Browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Fitness Tracker - Rest Timer', {
                body: message,
                icon: '/favicon.png',
                badge: '/favicon.png'
            });
        }
        
        // In-app notification
        ui.showNotification(message);
    }

    playSound(type) {
        // Create audio context for timer sounds
        if ('AudioContext' in window || 'webkitAudioContext' in window) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const audioContext = new AudioContext();
            
            let frequency = 440; // A4 note
            if (type === 'warning') frequency = 880; // A5 note
            if (type === 'complete') frequency = 523; // C5 note
            
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        }
    }

    flashScreen() {
        const flashOverlay = InputValidator.createSafeElement('div', {
            style: `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: var(--success-color);
                opacity: 0.3;
                z-index: 9999;
                pointer-events: none;
                animation: flash 0.5s ease-out;
            `
        });
        
        // Add flash animation
        const style = InputValidator.createSafeElement('style');
        style.textContent = `
            @keyframes flash {
                0% { opacity: 0; }
                50% { opacity: 0.5; }
                100% { opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(flashOverlay);
        
        setTimeout(() => {
            if (document.body.contains(flashOverlay)) {
                document.body.removeChild(flashOverlay);
            }
            if (document.head.contains(style)) {
                document.head.removeChild(style);
            }
        }, 500);
    }

    suggestRestTime() {
        // Get the last logged exercise training type and suggest appropriate rest time
        const entries = storage.getWeightlifting();
        if (entries.length === 0) return;
        
        const lastEntry = entries[entries.length - 1];
        const trainingType = lastEntry.trainingType || 'straight';
        
        const restRecommendations = {
            'straight': 120, // 2 minutes
            'pyramid': 180, // 3 minutes  
            'reverse-pyramid': 180,
            'drop-set': 90, // 1.5 minutes
            'double-drop': 120,
            'triple-drop': 150,
            'superset': 90,
            'triset': 120,
            'giant-set': 180,
            'cluster': 300, // 5 minutes
            'rest-pause': 180,
            'mechanical-drop': 90,
            'tempo': 90,
            'negative': 180,
            'partial-reps': 60,
            'isometric': 120,
            'pre-exhaust': 60,
            'post-exhaust': 90,
            'strip-set': 90,
            'wave-loading': 240,
            'density': 60,
            'contrast': 180,
            'accommodating': 180,
            'pause-reps': 150,
            'speed-work': 240
        };
        
        const suggestedTime = restRecommendations[trainingType] || 120;
        
        // Show suggestion notification
        setTimeout(() => {
            const suggestion = InputValidator.createSafeElement('div', {
                class: 'rest-suggestion',
                style: `
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: var(--surface-color);
                    border: 2px solid var(--primary-color);
                    border-radius: 12px;
                    padding: 1rem;
                    box-shadow: var(--shadow-lg);
                    z-index: 1000;
                    max-width: 300px;
                `
            });
            
            suggestion.innerHTML = `
                <h4 style="margin: 0 0 0.5rem 0; color: var(--primary-color);">⏱️ Rest Suggestion</h4>
                <p style="margin: 0 0 1rem 0; font-size: 0.9rem;">
                    For ${trainingType} training, rest for ${this.formatTime(suggestedTime)}
                </p>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="start-suggested-timer secondary-btn" style="flex: 1;">
                        Start Timer
                    </button>
                    <button class="dismiss-suggestion secondary-btn" style="background: var(--text-secondary);">
                        ✕
                    </button>
                </div>
            `;
            
            document.body.appendChild(suggestion);
            
            suggestion.querySelector('.start-suggested-timer').addEventListener('click', () => {
                this.startTimer(suggestedTime);
                document.body.removeChild(suggestion);
            });
            
            suggestion.querySelector('.dismiss-suggestion').addEventListener('click', () => {
                document.body.removeChild(suggestion);
            });
            
            // Auto-dismiss after 10 seconds
            setTimeout(() => {
                if (document.body.contains(suggestion)) {
                    document.body.removeChild(suggestion);
                }
            }, 10000);
            
        }, 2000); // Show 2 seconds after exercise log
    }
}

// Initialize rest timer
window.restTimer = new RestTimer();