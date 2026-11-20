import "server-only";
import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { jwt } from "better-auth/plugins";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { MongoClient, type Db } from "mongodb";

interface AuthEnvironment {
  MONGODB_URI: string;
  MONGODB_DB?: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  API_URL?: string;
  NEXT_PUBLIC_API_URL?: string;
}

async function environment(): Promise<AuthEnvironment> {
  const local = process.env;
  if (local.MONGODB_URI && local.BETTER_AUTH_SECRET && local.BETTER_AUTH_URL) {
    return {
      MONGODB_URI: local.MONGODB_URI,
      MONGODB_DB: local.MONGODB_DB,
      BETTER_AUTH_SECRET: local.BETTER_AUTH_SECRET,
      BETTER_AUTH_URL: local.BETTER_AUTH_URL,
      GOOGLE_CLIENT_ID: local.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: local.GOOGLE_CLIENT_SECRET,
      API_URL: local.API_URL,
      NEXT_PUBLIC_API_URL: local.NEXT_PUBLIC_API_URL,
    };
  }
  const { env } = await getCloudflareContext({ async: true });
  const read = (key: string) => {
    const value = Reflect.get(env, key);
    return typeof value === "string" ? value : undefined;
  };
  const uri = read("MONGODB_URI");
  const secret = read("BETTER_AUTH_SECRET");
  const url = read("BETTER_AUTH_URL");
  if (!uri || !secret || !url) throw new Error("Authentication configuration is incomplete.");
  return {
    MONGODB_URI: uri, BETTER_AUTH_SECRET: secret, BETTER_AUTH_URL: url,
    MONGODB_DB: read("MONGODB_DB"), GOOGLE_CLIENT_ID: read("GOOGLE_CLIENT_ID"),
    GOOGLE_CLIENT_SECRET: read("GOOGLE_CLIENT_SECRET"), API_URL: read("API_URL"),
    NEXT_PUBLIC_API_URL: read("NEXT_PUBLIC_API_URL"),
  };
}

function createConfiguredAuth(db: Db, client: MongoClient, env: AuthEnvironment) {
  return betterAuth({
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    database: mongodbAdapter(db, { client, transaction: true }),
    advanced: { database: { generateId: () => crypto.randomUUID() } },
    trustedOrigins: [env.BETTER_AUTH_URL, "http://localhost:3000"],
    emailAndPassword: { enabled: true, minPasswordLength: 6, requireEmailVerification: false },
    session: { cookieCache: { enabled: true, maxAge: 300, strategy: "compact" } },
    socialProviders: env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET ? {
      google: { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET, prompt: "select_account" },
    } : {},
    user: {
      modelName: "users",
      additionalFields: {
        role: { type: "string", required: true, defaultValue: "customer", input: false },
        status: { type: "string", required: true, defaultValue: "active", input: false },
        phone: { type: "string", required: false },
        address: { type: "string", required: false },
      },
    },
    hooks: {
      before: createAuthMiddleware(async (ctx) => {
        if (ctx.path === "/sign-up/email") {
          const password = ctx.body?.password;
          if (typeof password !== "string" || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || password.length < 6) {
            throw new APIError("BAD_REQUEST", { message: "Use at least 6 characters, including an uppercase and a lowercase letter." });
          }
        }
      }),
    },
    plugins: [jwt({ jwt: {
      issuer: env.BETTER_AUTH_URL,
      audience: env.API_URL ?? env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000",
      expirationTime: "5m",
    } })],
  });
}

export type Auth = ReturnType<typeof createConfiguredAuth>;

export async function withAuth<T>(operation: (auth: Auth, db: Db) => Promise<T>): Promise<T> {
  const env = await environment();
  const client = new MongoClient(env.MONGODB_URI, {
    maxPoolSize: 2, serverSelectionTimeoutMS: 12_000, connectTimeoutMS: 12_000,
  });
  try {
    const db = client.db(env.MONGODB_DB ?? "gearnest");
    return await operation(createConfiguredAuth(db, client, env), db);
  } finally {
    await client.close();
  }
}
