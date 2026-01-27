import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
    return (
        <Toaster
            position="top-center"
            toastOptions={{
                className: '',
                style: {
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    color: 'var(--text-primary)',
                    background: 'var(--bg-surface)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.1)',
                    fontSize: '14px',
                    fontWeight: '500',
                    fontFamily: "var(--font-outfit), sans-serif"
                },
                success: {
                    iconTheme: {
                        primary: 'var(--color-brand-green)',
                        secondary: 'var(--bg-surface)',
                    },
                },
                error: {
                    iconTheme: {
                        primary: 'var(--color-brand-red)',
                        secondary: 'var(--bg-surface)',
                    },
                },
                loading: {
                    iconTheme: {
                        primary: 'var(--color-brand-blue)',
                        secondary: 'var(--bg-surface)',
                    }
                }
            }}
        />
    );
}
