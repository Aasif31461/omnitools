export const getCurrencySymbol = () => {
    try {
        const locale = navigator.language || 'en-US';
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const offset = new Date().getTimezoneOffset(); // Returns minutes from UTC. IST is UTC+5:30, so -330 minutes.

        // Check for India
        // Timezone: Asia/Kolkata or Asia/Calcutta
        // Offset: -330 (5 hours 30 mins ahead of UTC)
        // Locale: en-IN, hi-IN, etc.
        if (
            timeZone === 'Asia/Kolkata' ||
            timeZone === 'Asia/Calcutta' ||
            offset === -330 ||
            locale.includes('IN') ||
            locale.includes('hi')
        ) {
            return '₹';
        }

        // Check for UK
        if (timeZone === 'Europe/London' || locale.includes('GB')) {
            return '£';
        }

        // Check for Japan
        if (timeZone === 'Asia/Tokyo' || locale.includes('JP')) {
            return '¥';
        }

        // Check for Eurozone
        const euroLocales = ['de', 'fr', 'it', 'es', 'nl', 'pt', 'ie', 'be', 'at', 'fi', 'gr'];
        if (euroLocales.some(code => locale.toLowerCase().includes(code))) {
            return '€';
        }

        // Default
        return '$';
    } catch (e) {
        return '$';
    }
};
