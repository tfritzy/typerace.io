import { DbConnection } from "../module_bindings";

export class Database {
  public connection: DbConnection | undefined;

  public connect() {
    let builder = DbConnection.builder()
      .withUri(process.env.VITE_SPACETIMEDB_URI || "ws://localhost:3000")
      .withModuleName(process.env.VITE_SPACETIMEDB_MODULE || "typerace");

    this.connection = builder
      .onConnect((conn) => {
        this.connection = conn;
        console.log("Connected to SpacetimeDB");
      })
      .onDisconnect(() => {
        this.connection = undefined;
        console.warn("Disconnected from SpacetimeDB");
      })
      .build();
  }
}
