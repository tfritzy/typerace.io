export const LoadingDots = () => {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <style>
                {`
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}
            </style>
            <div 
                id="loading-spinner"
                style={{
                    width: '32px',
                    height: '32px',
                    border: '3px solid rgba(255, 255, 255, 0.1)',
                    borderTopColor: 'rgba(255, 255, 255, 0.6)',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                }} 
            />
        </div>
    );
};
