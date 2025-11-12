import { useSpacetimeDB } from "spacetimedb/react";
import type { DbConnection } from "../../module_bindings";

export const ProfilePage = () => {
  const conn = useSpacetimeDB<DbConnection>();

  if (!conn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/80">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Profile</h1>
        
        <div className="bg-[var(--color-chat-box-bg)] border border-[var(--color-chat-box-border)] rounded-lg p-6 shadow-[var(--shadow-chat-box)]">
          <h2 className="text-xl font-semibold text-white mb-4">Player Information</h2>
          
          <div className="space-y-3">
            <div className="flex flex-col">
              <span className="text-white/60 text-sm mb-1">Identity</span>
              <span className="text-white font-mono break-all">
                {conn.identity ? conn.identity.toHexString() : 'Not available'}
              </span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-white/60 text-sm mb-1">Token</span>
              <span className="text-white font-mono break-all">
                {conn.token || 'Not available'}
              </span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-white/60 text-sm mb-1">Connection Status</span>
              <span className="text-white">
                {conn.isActive ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-white/60 text-sm mb-1">Connection ID</span>
              <span className="text-white font-mono">
                {conn.connectionId ? conn.connectionId.toString() : 'Not available'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
