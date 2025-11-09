// Auto-generated SpacetimeDB client bindings
// Generated from schema in spacetimedb/src/index.ts
//
// These bindings are generated based on the SpacetimeDB schema and provide
// typed access to tables and reducers.

import {
  DbConnectionImpl,
  DbConnectionBuilder,
  type ErrorContextInterface as ErrorContext,
} from "spacetimedb";

// Table row types
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
  scheduled_at: any;  // ScheduleAt type
}

// Re-export ErrorContext
export type { ErrorContext };

// Database connection with typed tables and reducers
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
