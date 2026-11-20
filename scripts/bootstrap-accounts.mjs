import { mkdir, writeFile, chmod } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { MongoClient } from "mongodb";

function required(key) {
  const value = process.env[key];
  if (!value) throw new Error(`Set ${key} before bootstrapping accounts.`);
  return value;
}

const origin = required("BETTER_AUTH_URL");
const accounts = [
  { role: "admin", name: "Nafisa Sraboni", email: required("ADMIN_EMAIL"), password: required("ADMIN_PASSWORD") },
  { role: "owner", name: "Nafisa Sraboni", email: required("OWNER_EMAIL"), password: required("OWNER_PASSWORD") },
  { role: "customer", name: "GearNest Demo Customer", email: required("CUSTOMER_EMAIL"), password: required("CUSTOMER_PASSWORD") },
];

const client = new MongoClient(required("MONGODB_URI"), { maxPoolSize: 2 });
const result = {};
try {
  await client.connect();
  const db = client.db(process.env.MONGODB_DB ?? "gearnest");
  for (const account of accounts) {
    let user = await db.collection("users").findOne({ email: account.email });
    if (!user) {
      const response = await fetch(new URL("/api/auth/sign-up/email", origin), {
        method: "POST", headers: { "Content-Type": "application/json", Origin: origin },
        body: JSON.stringify({ name: account.name, email: account.email, password: account.password }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(`Account creation failed for ${account.role}: ${body.message ?? response.status}`);
      user = await db.collection("users").findOne({ email: account.email });
    }
    if (!user || typeof user._id !== "string") throw new Error("The authentication user identifier is incompatible with the API.");
    await db.collection("users").updateOne({ _id: user._id }, {
      $set: { role: account.role, status: "active", updatedAt: new Date() },
    });
    result[account.role] = { id: user._id, email: account.email, password: account.password };
    console.log(`Prepared ${account.role} account; credentials remain private.`);
  }
  const directory = join(homedir(), ".config", "gearnest");
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const destination = join(directory, "test-accounts.json");
  await writeFile(destination, JSON.stringify(result, null, 2) + "\n", { mode: 0o600 });
  await chmod(destination, 0o600);
  console.log("Private demo account handoff prepared.");
} finally {
  await client.close();
}
