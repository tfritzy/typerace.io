import { useDatabase } from '../contexts/SpacetimeContext';

export function DatabaseConnectionModal() {
    const { status, reconnect } = useDatabase();

    if (status !== 'reconnecting' && status !== 'error') return null;

    return (
        <div
            className="fixed inset-0 bg-black/20 flex items-center justify-center z-2000"
            style={{ animation: 'modalFadeIn 0.2s ease-out' }}
        >
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <div
                className="bg-card border border-border rounded-xl p-8 min-w-[400px] max-w-[500px]"
                style={{ animation: 'modalSlideIn 0.2s ease-out' }}
            >
                <h2 className="text-foreground text-2xl font-bold mb-4 mt-0">
                    Connection Lost
                </h2>
                {status === 'reconnecting' ? (
                    <div className="flex flex-col items-center py-4">
                        <div
                            className="w-8 h-8 border-[3px] border-secondary border-t-muted-foreground rounded-full"
                            style={{ animation: 'spin 0.8s linear infinite' }}
                        />
                        <p className="text-muted-foreground mt-4 mb-0">Reconnecting...</p>
                    </div>
                ) : (
                    <>
                        <p className="text-muted-foreground mb-8">
                            Failed to connect to the server. Please try again.
                        </p>
                        <button
                            onClick={reconnect}
                            className="w-full border-0 rounded-md px-5 py-2.5 text-sm font-semibold text-foreground cursor-pointer bg-primary"
                        >
                            Reconnect
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
