/**
 * Utility functions for input validation and sanitization
 */
// Weight conversion utilities
const WeightConverter = {
    /**
     * Converts weight from pounds to kilograms
     * @param {number} lbs - Weight in pounds
     * @returns {number} Weight in kilograms
     */
    lbsToKg(lbs) {
        return lbs / 2.20462;
    },

    /**
     * Converts weight from kilograms to pounds
     * @param {number} kg - Weight in kilograms
     * @returns {number} Weight in pounds
     */
    kgToLbs(kg) {
        return kg * 2.20462;
    },

    /**
     * Formats weight with the specified unit
     * @param {number} weight - Weight value
     * @param {string} unit - Unit to display ('lbs' or 'kg')
     * @returns {string} Formatted weight with unit
     */
    formatWeight(weight, unit) {
        const value = unit === 'kg' ? this.lbsToKg(weight) : weight;
        return `${value.toFixed(1)} ${unit}`;
    }
};

class InputValidator {
    /**
     * Sanitizes text input to prevent XSS attacks
     * @param {string} input - The input string to sanitize
     * @returns {string} Sanitized string with HTML entities escaped
     */
    static sanitizeText(input) {
        if (typeof input !== 'string') return '';
        return input.replace(/[<>&"'`]/g, char => {
            const entities = {
                '<': '&lt;',
                '>': '&gt;',
                '&': '&amp;',
                '"': '&quot;',
                "'": '&#39;',
                '`': '&#96;'
            };
            return entities[char];
        });
    }

    /**
     * Validates and sanitizes a URL
     * @param {string} url - The URL to validate
     * @returns {string|null} Sanitized URL or null if invalid
     */
    static validateUrl(url) {
        if (!url) return '';
        try {
            const urlObj = new URL(url);
            return urlObj.protocol === 'http:' || urlObj.protocol === 'https:' 
                ? this.sanitizeText(url) 
                : null;
        } catch {
            return null;
        }
    }

    /**
     * Validates numeric input within specified range
     * @param {string|number} input - The input to validate
     * @param {number} min - Minimum allowed value
     * @param {number} max - Maximum allowed value
     * @returns {number|null} Validated number or null if invalid
     */
    static validateNumber(input, min = 0, max = Number.MAX_SAFE_INTEGER) {
        const num = parseFloat(input);
        return !isNaN(num) && num >= min && num <= max ? num : null;
    }

    /**
     * Creates a safe HTML element with sanitized content
     * @param {string} tag - HTML tag name
     * @param {Object} attributes - Element attributes
     * @param {string} content - Element content
     * @returns {HTMLElement} Safe HTML element
     */
    static createSafeElement(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);
        
        // Safely set attributes
        Object.entries(attributes).forEach(([key, value]) => {
            if (key.startsWith('on')) return; // Skip event handlers
            element.setAttribute(key, this.sanitizeText(value));
        });
        
        // Set content safely
        if (content) {
            element.textContent = content;
        }
        
        return element;
    }
}
