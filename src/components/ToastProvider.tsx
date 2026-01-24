import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
    return (
        <Toaster
            position="top-center"
            toastOptions={{
                className: 'brutal-border',
                style: {
                    border: '2px solid #000',
                    borderRadius: '0px',
                    padding: '16px',
                    color: '#000',
                    background: '#fff',
                    boxShadow: '4px 4px 0px #000',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    fontFamily: "'Inter', sans-serif"
                },
                success: {
                    iconTheme: {
                        primary: '#000',
                        secondary: '#fff',
                    },
                },
                error: {
                    iconTheme: {
                        primary: '#ef4444',
                        secondary: '#fff',
                    },
                },
            }}
        />
    );
}
