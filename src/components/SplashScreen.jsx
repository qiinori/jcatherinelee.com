import { useEffect } from 'react';

const SplashScreen = () => {
    useEffect(() => {
        // The splash screen is rendered in index.html for instant display.
        // This component handles cleanup once React mounts.
        const el = document.getElementById('splash-screen');
        if (el && el.style.display === 'none') {
            el.remove();
        }
    }, []);

    return null;
};

export default SplashScreen;
