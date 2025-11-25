export const LoadingDots = () => {
    return (
        <div style={{
            width: '100%',
            padding: '0 1rem'
        }}>
            <style>
                {`
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}
            </style>
            <div style={{
                width: '100%',
                maxWidth: '1000px',
                marginLeft: 'auto',
                marginRight: 'auto',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: '4rem'
            }}>
                <div className="logo">
                    <span className="logo-text">Type</span>
                    <span className="logo-accent">Race</span>
                    <span className="logo-io">.io</span>
                </div>
                <div style={{
                    width: '32px',
                    height: '32px',
                    border: '3px solid rgba(255, 255, 255, 0.1)',
                    borderTopColor: 'rgba(255, 255, 255, 0.6)',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                }} />
            </div>
        </div>
    );
};
