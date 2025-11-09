// Auto-generated module bindings stub for SpacetimeDB
// This is a minimal stub to allow the app to build

import { DbConnectionImpl, DbConnectionBuilder } from 'spacetimedb';

// Re-export types from spacetimedb
export type { ErrorContextInterface as ErrorContext } from 'spacetimedb';

// Table types
export interface Person {
  name: string;
}

export interface Game {
  id: bigint;
  phrase: string;
  created_at: bigint;
  state: string;
  game_mode: string;
}

export interface GameCountdown {
  game_id: bigint;
  scheduled_at: any;
}

// Create DbConnection class with builder method
export class DbConnection extends DbConnectionImpl {
  static builder(): DbConnectionBuilder<any, any, any> {
    // Create a minimal remote module stub
    const remoteModule = {
      reducers: {},
      tables: {},
      types: new Map(),
    } as any;
    
    return new DbConnectionBuilder(remoteModule, (impl: DbConnectionImpl) => impl as any);
  }
}
