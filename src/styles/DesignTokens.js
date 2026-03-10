export const tokens = {
    colors: {
        primary: {
            light: '#FFB26B',
            main: '#FF7B54',
            dark: '#E86A45',
            gradient: 'linear-gradient(135deg, #FF7B54 0%, #FFB26B 100%)',
            glow: 'rgba(255, 123, 84, 0.25)'
        },
        accent: {
            light: '#F8B4B4',
            main: '#EE5D5D',
            dark: '#D44848',
            gradient: 'linear-gradient(135deg, #EE5D5D 0%, #F8B4B4 100%)'
        },
        neutral: {
            bg: '#FDFCFB',
            surface: '#FFFFFF',
            text: '#1A1C1E',
            muted: '#6C727A',
            border: '#E9EBEF'
        },
        glass: {
            bg: 'rgba(255, 255, 255, 0.7)',
            border: 'rgba(255, 255, 255, 0.4)',
            shadow: '0 8px 32px 0 rgba(255, 123, 84, 0.08)'
        }
    },
    shadows: {
        sm: '0 2px 4px rgba(0,0,0,0.05)',
        md: '0 4px 12px rgba(0,0,0,0.08)',
        lg: '0 12px 24px rgba(255, 123, 84, 0.12)',
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.07)'
    },
    animations: {
        transition: { type: 'spring', stiffness: 260, damping: 20 },
        stagger: 0.1,
        duration: 0.4
    }
};
