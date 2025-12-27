// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPTransport } from "@hono/mcp";
import { Hono } from "hono";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

// Create Hono app
const app = new Hono();

// Create your MCP server
const server = new McpServer({
    name: "supabase-mcp",
    version: "0.2.0",
});

// Initialize Supabase Client
const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const supabase = createClient(supabaseUrl, supabaseKey);

// --- TOOLS ---

// 1. READ (Select)
server.registerTool(
    "read_query",
    {
        title: "Read Data (Select)",
        description: "Read rows from a table with optional filtering and column selection",
        inputSchema: {
            table: z.string().describe("Table name"),
            columns: z.string().optional().describe("Columns to select (default: *)"),
            filter: z.record(z.any()).optional().describe("Equality filter object (e.g. {id: 1, status: 'active'})"),
            limit: z.number().optional().describe("Max rows to return (default: 10)"),
        },
    },
    async ({ table, columns = "*", filter = {}, limit = 10 }) => {
        try {
            let query = supabase.from(table).select(columns);

            // Apply simple quality match filters
            if (Object.keys(filter).length > 0) {
                query = query.match(filter);
            }

            const { data, error } = await query.limit(limit);

            if (error) {
                return {
                    content: [{ type: "text", text: `Error reading data: ${error.message}` }],
                    isError: true,
                };
            }

            return {
                content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
            };
        } catch (err: any) {
            return {
                content: [{ type: "text", text: `Unexpected error: ${err.message}` }],
                isError: true,
            };
        }
    }
);

// 2. INSERT
server.registerTool(
    "insert_data",
    {
        title: "Insert Data",
        description: "Insert a new row or rows into a table",
        inputSchema: {
            table: z.string().describe("Table name"),
            data: z.union([z.record(z.any()), z.array(z.record(z.any()))]).describe("Data object or array of objects to insert"),
        },
    },
    async ({ table, data }) => {
        try {
            const { data: inserted, error } = await supabase
                .from(table)
                .insert(data)
                .select();

            if (error) {
                return {
                    content: [{ type: "text", text: `Error inserting data: ${error.message}` }],
                    isError: true,
                };
            }

            return {
                content: [{ type: "text", text: `Successfully inserted: ${JSON.stringify(inserted, null, 2)}` }],
            };
        } catch (err: any) {
            return {
                content: [{ type: "text", text: `Unexpected error: ${err.message}` }],
                isError: true,
            };
        }
    }
);

// 3. UPDATE
server.registerTool(
    "update_data",
    {
        title: "Update Data",
        description: "Update existing rows in a table",
        inputSchema: {
            table: z.string().describe("Table name"),
            data: z.record(z.any()).describe("Data object with fields to update"),
            filter: z.record(z.any()).describe("Equality filter to identify rows to update (REQUIRED so you don't update everything)"),
        },
    },
    async ({ table, data, filter }) => {
        try {
            if (Object.keys(filter).length === 0) {
                return {
                    content: [{ type: "text", text: "Error: Filter is required for update operations to prevent accidental bulk updates." }],
                    isError: true,
                };
            }

            const { data: updated, error } = await supabase
                .from(table)
                .update(data)
                .match(filter)
                .select();

            if (error) {
                return {
                    content: [{ type: "text", text: `Error updating data: ${error.message}` }],
                    isError: true,
                };
            }

            return {
                content: [{ type: "text", text: `Successfully updated: ${JSON.stringify(updated, null, 2)}` }],
            };
        } catch (err: any) {
            return {
                content: [{ type: "text", text: `Unexpected error: ${err.message}` }],
                isError: true,
            };
        }
    }
);

// 4. DELETE
server.registerTool(
    "delete_data",
    {
        title: "Delete Data",
        description: "Delete rows from a table",
        inputSchema: {
            table: z.string().describe("Table name"),
            filter: z.record(z.any()).describe("Equality filter to identify rows to delete (REQUIRED)"),
        },
    },
    async ({ table, filter }) => {
        try {
            if (Object.keys(filter).length === 0) {
                return {
                    content: [{ type: "text", text: "Error: Filter is required for delete operations to prevent accidental bulk deletes." }],
                    isError: true,
                };
            }

            const { data: deleted, error } = await supabase
                .from(table)
                .delete()
                .match(filter)
                .select();

            if (error) {
                return {
                    content: [{ type: "text", text: `Error deleting data: ${error.message}` }],
                    isError: true,
                };
            }

            return {
                content: [{ type: "text", text: `Successfully deleted: ${JSON.stringify(deleted, null, 2)}` }],
            };
        } catch (err: any) {
            return {
                content: [{ type: "text", text: `Unexpected error: ${err.message}` }],
                isError: true,
            };
        }
    }
);

// 5. RUN RPC
server.registerTool(
    "run_rpc",
    {
        title: "Run RPC (Function)",
        description: "Execute a Supabase database function (stored procedure)",
        inputSchema: {
            func_name: z.string().describe("Name of the function to call"),
            args: z.record(z.any()).optional().describe("Arguments to pass to the function"),
        },
    },
    async ({ func_name, args = {} }) => {
        try {
            const { data, error } = await supabase.rpc(func_name, args);

            if (error) {
                return {
                    content: [{ type: "text", text: `Error running RPC '${func_name}': ${error.message}` }],
                    isError: true,
                };
            }

            return {
                content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
            };
        } catch (err: any) {
            return {
                content: [{ type: "text", text: `Unexpected error: ${err.message}` }],
                isError: true,
            };
        }
    }
);


// Handle MCP requests at any path (to avoid issues with Supabase path stripping)
app.all("*", async (c) => {
    const transport = new StreamableHTTPTransport();
    await server.connect(transport);
    return transport.handleRequest(c);
});

Deno.serve(app.fetch);
