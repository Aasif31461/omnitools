export const getCurrencySymbol = () => {
    try {
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (timeZone === 'Asia/Kolkata' || timeZone === 'Asia/Calcutta') {
            return '₹';
        }
        return '$';
    } catch (e) {
        return '$';
    }
};

export const loadScript = (src) => {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
};
