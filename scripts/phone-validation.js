/**
 * Phone Number Validation Module
 * Validates phone numbers based on country code
 */

// Country code to phone number length mapping
const COUNTRY_PHONE_RULES = {
    '+1': { length: 10, name: 'US/Canada', pattern: /^\d{10}$/ },
    '+91': { length: 10, name: 'India', pattern: /^\d{10}$/ },
    '+44': { length: 10, name: 'UK', pattern: /^\d{10}$/ },
    '+61': { length: 9, name: 'Australia', pattern: /^\d{9}$/ },
    '+81': { length: 10, name: 'Japan', pattern: /^\d{10}$/ },
    '+86': { length: 11, name: 'China', pattern: /^\d{11}$/ },
    '+49': { length: 11, name: 'Germany', pattern: /^\d{11}$/ },
    '+33': { length: 9, name: 'France', pattern: /^\d{9}$/ },
    '+39': { length: 10, name: 'Italy', pattern: /^\d{10}$/ },
    '+34': { length: 9, name: 'Spain', pattern: /^\d{9}$/ },
    '+7': { length: 10, name: 'Russia', pattern: /^\d{10}$/ },
    '+82': { length: 10, name: 'South Korea', pattern: /^\d{10}$/ },
    '+52': { length: 10, name: 'Mexico', pattern: /^\d{10}$/ },
    '+55': { length: 11, name: 'Brazil', pattern: /^\d{11}$/ },
    '+27': { length: 9, name: 'South Africa', pattern: /^\d{9}$/ },
    '+31': { length: 9, name: 'Netherlands', pattern: /^\d{9}$/ },
    '+46': { length: 9, name: 'Sweden', pattern: /^\d{9}$/ },
    '+47': { length: 8, name: 'Norway', pattern: /^\d{8}$/ },
    '+971': { length: 9, name: 'UAE', pattern: /^\d{9}$/ },
    '+65': { length: 8, name: 'Singapore', pattern: /^\d{8}$/ },
    '+60': { length: 9, name: 'Malaysia', pattern: /^\d{9}$/ },
    '+62': { length: 9, name: 'Indonesia', pattern: /^\d{9,11}$/ },
    '+63': { length: 10, name: 'Philippines', pattern: /^\d{10}$/ },
    '+66': { length: 9, name: 'Thailand', pattern: /^\d{9}$/ },
    '+84': { length: 9, name: 'Vietnam', pattern: /^\d{9,10}$/ },
};

/**
 * Get phone validation rules for a country code
 * @param {string} countryCode - Country code (e.g., '+91')
 * @returns {Object|null} Validation rules or null if not found
 */
export function getPhoneValidationRules(countryCode) {
    return COUNTRY_PHONE_RULES[countryCode] || null;
}

/**
 * Validate phone number based on country code
 * @param {string} phoneNumber - Phone number without country code
 * @param {string} countryCode - Country code (e.g., '+91')
 * @returns {Object} { valid: boolean, message: string }
 */
export function validatePhoneNumber(phoneNumber, countryCode) {
    // Remove any spaces or special characters
    const cleanedPhone = phoneNumber.replace(/\D/g, '');
    
    if (!cleanedPhone) {
        return { valid: false, message: 'Phone number is required' };
    }
    
    const rules = getPhoneValidationRules(countryCode);
    
    if (!rules) {
        // Default validation for unknown country codes
        if (cleanedPhone.length < 7 || cleanedPhone.length > 15) {
            return { 
                valid: false, 
                message: 'Phone number must be between 7 and 15 digits' 
            };
        }
        return { valid: true, message: '' };
    }
    
    // Check length
    if (rules.pattern.test(cleanedPhone)) {
        return { valid: true, message: '' };
    } else {
        return { 
            valid: false, 
            message: `Phone number for ${rules.name} must be exactly ${rules.length} digits (without country code)` 
        };
    }
}

/**
 * Get placeholder text based on country code
 * @param {string} countryCode - Country code (e.g., '+91')
 * @returns {string} Placeholder text
 */
export function getPhonePlaceholder(countryCode) {
    const rules = getPhoneValidationRules(countryCode);
    if (rules) {
        return `Enter ${rules.length} digit ${rules.name} number`;
    }
    return 'Enter phone number (7-15 digits)';
}

/**
 * Get help text based on country code
 * @param {string} countryCode - Country code (e.g., '+91')
 * @returns {string} Help text
 */
export function getPhoneHelpText(countryCode) {
    const rules = getPhoneValidationRules(countryCode);
    if (rules) {
        return `Phone number for ${rules.name} must be exactly ${rules.length} digits (without country code)`;
    }
    return 'Enter phone number without country code (numbers only, 7-15 digits)';
}

/**
 * Update phone input based on country code selection
 * @param {HTMLElement} phoneInput - Phone input element
 * @param {HTMLElement} countryCodeSelect - Country code select element
 * @param {HTMLElement} helpTextElement - Help text element (optional)
 */
export function updatePhoneInputForCountry(phoneInput, countryCodeSelect, helpTextElement = null) {
    const countryCode = countryCodeSelect.value;
    const rules = getPhoneValidationRules(countryCode);
    
    if (rules) {
        phoneInput.placeholder = getPhonePlaceholder(countryCode);
        phoneInput.maxLength = rules.length;
        phoneInput.pattern = rules.pattern.source;
        phoneInput.title = getPhoneHelpText(countryCode);
        
        if (helpTextElement) {
            helpTextElement.textContent = getPhoneHelpText(countryCode);
        }
    } else {
        phoneInput.placeholder = 'Enter phone number';
        phoneInput.maxLength = 15;
        phoneInput.pattern = '[0-9]{7,15}';
        phoneInput.title = 'Enter phone number (numbers only, 7-15 digits)';
        
        if (helpTextElement) {
            helpTextElement.textContent = 'Enter phone number without country code (numbers only, 7-15 digits)';
        }
    }
}

// Also make functions globally available for non-module scripts
if (typeof window !== 'undefined') {
    window.getPhoneValidationRules = getPhoneValidationRules;
    window.validatePhoneNumber = validatePhoneNumber;
    window.getPhonePlaceholder = getPhonePlaceholder;
    window.getPhoneHelpText = getPhoneHelpText;
    window.updatePhoneInputForCountry = updatePhoneInputForCountry;
}

