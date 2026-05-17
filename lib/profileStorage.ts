import { promises as fs } from "fs";
import path from "path";
import { GetCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { getDynamoDBDocumentClient } from "@/lib/aws/clients";
import { env, hasAwsConfig } from "@/lib/env";
import type { PersonPhoto, PersonProfile } from "@/lib/types";

const dataDir = path.join(process.cwd(), "data");
const dataFile = path.join(dataDir, "profiles.json");
const localProfiles: PersonProfile[] = [];
const AWS_STORAGE_TIMEOUT_MS = 5000;

function withStorageTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
  let timeout: ReturnType<typeof setTimeout>;

  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      timeout = setTimeout(
        () => reject(new Error(`${label} timed out; using local backup.`)),
        AWS_STORAGE_TIMEOUT_MS,
      );
    }),
  ]).finally(() => clearTimeout(timeout));
}

async function ensureStore() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(dataFile);
  } catch {
    await fs.writeFile(dataFile, "[]", "utf8");
  }
}

function profileKey(profileId: string) {
  return profileId.startsWith("person_") ? profileId : `person_${profileId}`;
}

function normalizeProfile(raw: Partial<PersonProfile>): PersonProfile {
  const now = new Date().toISOString();
  const profileId = profileKey(raw.profileId || `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);

  return {
    profileId,
    entityType: "person",
    personName: String(raw.personName || "New person"),
    relationship: raw.relationship || "other",
    country: String(raw.country || ""),
    language: raw.language || "English",
    birthday: raw.birthday || "",
    notes: raw.notes || "",
    photos: Array.isArray(raw.photos) ? raw.photos : [],
    createdAt: raw.createdAt || now,
    updatedAt: now,
  };
}

async function readLocalProfiles() {
  await ensureStore();
  const raw = await fs.readFile(dataFile, "utf8");
  const fileProfiles = (JSON.parse(raw) as Partial<PersonProfile>[]).map(normalizeProfile);
  const merged = [...localProfiles, ...fileProfiles];
  const byId = new Map(merged.map((profile) => [profile.profileId, profile]));
  return Array.from(byId.values());
}

async function writeLocalProfiles(profiles: PersonProfile[]) {
  await ensureStore();
  await fs.writeFile(dataFile, JSON.stringify(profiles, null, 2), "utf8");
}

export async function listProfiles(): Promise<PersonProfile[]> {
  const docClient = getDynamoDBDocumentClient();

  if (hasAwsConfig && docClient) {
    try {
      const result = await withStorageTimeout(
        docClient.send(
          new ScanCommand({
            TableName: env.DYNAMODB_TABLE_NAME,
            FilterExpression: "entityType = :entityType",
            ExpressionAttributeValues: { ":entityType": "person" },
          }),
        ),
        "DynamoDB profile list",
      );

      return ((result.Items || []) as PersonProfile[]).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    } catch (error) {
      console.warn(error instanceof Error ? error.message : "DynamoDB profile list failed; using local backup.");
    }
  }

  const profiles = await readLocalProfiles();
  return profiles.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getProfile(profileId: string): Promise<PersonProfile | null> {
  const normalizedId = profileKey(profileId);
  const docClient = getDynamoDBDocumentClient();

  if (hasAwsConfig && docClient) {
    try {
      const result = await withStorageTimeout(
        docClient.send(
          new GetCommand({
            TableName: env.DYNAMODB_TABLE_NAME,
            Key: { memoryId: normalizedId },
          }),
        ),
        "DynamoDB profile read",
      );

      return result.Item ? normalizeProfile(result.Item as PersonProfile) : null;
    } catch (error) {
      console.warn(error instanceof Error ? error.message : "DynamoDB profile read failed; using local backup.");
    }
  }

  const profiles = await readLocalProfiles();
  return profiles.find((profile) => profile.profileId === normalizedId) || null;
}

export async function saveProfile(profile: Partial<PersonProfile>): Promise<PersonProfile> {
  const normalized = normalizeProfile(profile);
  const docClient = getDynamoDBDocumentClient();

  if (hasAwsConfig && docClient) {
    try {
      await withStorageTimeout(
        docClient.send(
          new PutCommand({
            TableName: env.DYNAMODB_TABLE_NAME,
            Item: {
              ...normalized,
              memoryId: normalized.profileId,
            },
          }),
        ),
        "DynamoDB profile save",
      );
      return normalized;
    } catch (error) {
      console.warn(error instanceof Error ? error.message : "DynamoDB profile save failed; using local backup.");
    }
  }

  const profiles = await readLocalProfiles();
  const next = [normalized, ...profiles.filter((item) => item.profileId !== normalized.profileId)];
  localProfiles.splice(0, localProfiles.length, ...next);
  await writeLocalProfiles(next);
  return normalized;
}

export async function addProfilePhoto(profileId: string, photo: PersonPhoto): Promise<PersonProfile> {
  const current = await getProfile(profileId);
  const profile = normalizeProfile(current || { profileId });
  const photos = [photo, ...profile.photos.filter((item) => item.id !== photo.id)].slice(0, 12);
  return saveProfile({ ...profile, photos });
}
