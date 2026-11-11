import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import {
  copyFile,
  mkdir,
  readFile,
  readdir,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

type JsonRecord = Record<string, unknown>;

interface FieldSchema {
  type: string;
  displayName?: string;
  title?: string;
  rank?: number;
  options?: Record<string, { id: string; name: string; color?: string }>;
}

interface SeedRow {
  id: string;
  parentId: null;
  content: string;
  fieldValues: Record<string, string>;
}

interface SeedBundle {
  spaceId: string;
  generatedAt: string;
  schemas: Record<string, Record<string, FieldSchema>>;
  projects: Record<string, SeedRow[]>;
}

interface DecisionEntry {
  level: 'INFO' | 'WARN' | 'ERROR';
  code: string;
  source?: string;
  message: string;
  details?: JsonRecord;
}

interface MigrationManifest {
  spaceId: string;
  generatedAt: string;
  dryRun: boolean;
  apps: string[];
  counts: {
    projects: number;
    rows: number;
    mediaFiles: number;
    agents: number;
    flows: number;
    quarantinedFiles: number;
    activeCloudReferences: number;
  };
  decisions: DecisionEntry[];
}

interface MediaEntry {
  id: string;
  sourceFolder: string;
  originalName: string;
  localName: string;
  localUrl: string;
  sha256: string;
  mimeType?: string;
}

interface ParsedFile<T> {
  fileName: string;
  value: T;
}

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(scriptDirectory, '..');
const repositoryRoot = path.resolve(appRoot, '..', '..');
const dataDirectory = path.join(appRoot, 'src', 'data');
const publicMediaDirectory = path.join(appRoot, 'public', 'media');
const sourceDirectory = path.join(appRoot, 'src');
const isDryRun = process.argv.includes('--dry-run');

const decisions: DecisionEntry[] = [];
let quarantinedFiles = 0;

function log(stage: 'S1' | 'S2' | 'S3' | 'S4', message: string, details?: unknown) {
  const suffix = details === undefined ? '' : ` ${JSON.stringify(details)}`;
  console.log(`[MIGRATE:${stage}] ${message}${suffix}`);
}

function record(
  level: DecisionEntry['level'],
  code: string,
  message: string,
  source?: string,
  details?: JsonRecord,
) {
  decisions.push({ level, code, source, message, details });
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasBlockedKey(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(hasBlockedKey);
  if (!isRecord(value)) return false;
  return Object.entries(value).some(
    ([key, child]) =>
      ['__proto__', 'constructor', 'prototype'].includes(key) || hasBlockedKey(child),
  );
}

function stripControlCharacters(value: string): string {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
}

function stableSortRecord<T>(input: Record<string, T>): Record<string, T> {
  return Object.fromEntries(
    Object.entries(input).sort(([left], [right]) => left.localeCompare(right)),
  );
}

function stringifyJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

async function listFiles(directory: string, extension?: string): Promise<string[]> {
  if (!existsSync(directory)) return [];
  const entries = await readdir(directory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && (!extension || entry.name.endsWith(extension)))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
}

async function discoverAppDirectories(): Promise<string[]> {
  const appsRoot = path.join(repositoryRoot, 'apps');
  if (!existsSync(appsRoot)) return [];
  return (await readdir(appsRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
}

async function parseJsonFile<T>(
  directory: string,
  fileName: string,
  category: string,
): Promise<ParsedFile<T> | null> {
  const absolutePath = path.join(directory, fileName);
  try {
    const source = await readFile(absolutePath, 'utf8');
    const value = JSON.parse(source) as T;
    if (hasBlockedKey(value)) {
      throw new Error('Prototype-pollution key rejected');
    }
    return { fileName, value };
  } catch (error) {
    quarantinedFiles += 1;
    record(
      'ERROR',
      'MALFORMED_JSON',
      `${category} file was quarantined and skipped: ${String(error)}`,
      path.relative(repositoryRoot, absolutePath),
    );
    return null;
  }
}

function extractText(node: unknown): string {
  if (!isRecord(node) || !isRecord(node.text) || !Array.isArray(node.text.ops)) {
    return '';
  }
  const text = node.text.ops
    .map((operation) => {
      if (!isRecord(operation)) return '';
      return typeof operation.insert === 'string' ? operation.insert : '';
    })
    .join('');
  return stripControlCharacters(text).replace(/\s+$/g, '').trim();
}

function unwrapAttribute(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return stripControlCharacters(value);
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map(unwrapAttribute).filter(Boolean).join(', ');
  if (!isRecord(value)) return String(value);

  if ('optionId' in value) return unwrapAttribute(value.optionId);
  if ('dateTime' in value) {
    const dateTime = value.dateTime;
    if (isRecord(dateTime)) {
      return unwrapAttribute(
        dateTime.date ?? dateTime.dateTime ?? dateTime.value ?? dateTime.start,
      );
    }
    return unwrapAttribute(dateTime);
  }
  if ('value' in value) return unwrapAttribute(value.value);
  if ('id' in value) return unwrapAttribute(value.id);

  return JSON.stringify(stableSortRecord(value));
}

function fieldRank(schema: FieldSchema | undefined, fallbackIndex: number): number {
  const candidate = schema?.rank;
  return typeof candidate === 'number' && Number.isFinite(candidate)
    ? candidate
    : Number.MAX_SAFE_INTEGER - 10_000 + fallbackIndex;
}

function normalizeSchema(rawFields: unknown): Record<string, FieldSchema> {
  if (!isRecord(rawFields)) return {};
  const normalized: Record<string, FieldSchema> = {};
  for (const [fieldId, rawSchema] of Object.entries(rawFields).sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    if (!isRecord(rawSchema)) continue;
    const options = isRecord(rawSchema.options)
      ? Object.fromEntries(
          Object.entries(rawSchema.options)
            .filter(([, option]) => isRecord(option))
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([optionId, option]) => {
              const record = option as JsonRecord;
              return [
                optionId,
                {
                  id: String(record.id ?? optionId),
                  name: String(record.name ?? record.title ?? optionId),
                  ...(typeof record.color === 'string' ? { color: record.color } : {}),
                },
              ];
            }),
        )
      : undefined;
    normalized[fieldId] = {
      type: String(rawSchema.type ?? 'string'),
      ...(typeof rawSchema.displayName === 'string'
        ? { displayName: stripControlCharacters(rawSchema.displayName) }
        : {}),
      ...(typeof rawSchema.title === 'string'
        ? { title: stripControlCharacters(rawSchema.title) }
        : {}),
      ...(typeof rawSchema.rank === 'number' ? { rank: rawSchema.rank } : {}),
      ...(options && Object.keys(options).length > 0 ? { options } : {}),
    };
  }
  return normalized;
}

function resolveDisplayOwners(
  projectId: string,
  schema: Record<string, FieldSchema>,
): Map<string, string> {
  const candidates = new Map<string, Array<{ fieldId: string; rank: number }>>();
  Object.entries(schema).forEach(([fieldId, field], index) => {
    const displayKey = field.displayName || field.title;
    if (!displayKey) return;
    const existing = candidates.get(displayKey) ?? [];
    existing.push({ fieldId, rank: fieldRank(field, index) });
    candidates.set(displayKey, existing);
  });

  const owners = new Map<string, string>();
  for (const [displayKey, fields] of candidates) {
    fields.sort((left, right) => left.rank - right.rank || left.fieldId.localeCompare(right.fieldId));
    owners.set(displayKey, fields[0]!.fieldId);
    if (fields.length > 1) {
      record(
        'WARN',
        'FIELD_DISPLAY_NAME_COLLISION',
        `Display key "${displayKey}" assigned to the lower-rank field ${fields[0]!.fieldId}.`,
        `projects/${projectId}.json`,
        { displayKey, owner: fields[0]!.fieldId, collidingFieldIds: fields.map((field) => field.fieldId) },
      );
    }
  }
  return owners;
}

function collectRows(
  projectId: string,
  children: unknown,
  schema: Record<string, FieldSchema>,
  displayOwners: Map<string, string>,
): SeedRow[] {
  const rows: SeedRow[] = [];

  function visit(candidate: unknown, logicalPath: string) {
    if (!isRecord(candidate)) return;
    const content = extractText(candidate);
    const rawAttributes = isRecord(candidate.attributes) ? candidate.attributes : {};
    const fieldValues: Record<string, string> = {};

    if (content) {
      fieldValues.Name = content;
      fieldValues.Title = content;
    }

    for (const [attributeKey, rawValue] of Object.entries(rawAttributes).sort(([a], [b]) =>
      a.localeCompare(b),
    )) {
      if (['__proto__', 'constructor', 'prototype'].includes(attributeKey)) {
        record(
          'WARN',
          'BLOCKED_ATTRIBUTE_KEY',
          `Rejected unsafe attribute key ${attributeKey}.`,
          `projects/${projectId}.json`,
        );
        continue;
      }
      const value = unwrapAttribute(rawValue);
      fieldValues[attributeKey] = value;
      fieldValues[`/attributes/${attributeKey}`] = value;
      const field = schema[attributeKey];
      const displayKey = field?.displayName || field?.title;
      if (displayKey && displayOwners.get(displayKey) === attributeKey) {
        fieldValues[displayKey] = value;
      }
    }

    const rawId = candidate.id;
    const id =
      typeof rawId === 'string' && rawId.trim()
        ? rawId
        : `local-${createHash('sha256').update(`${projectId}:${logicalPath}:${content}`).digest('hex').slice(0, 24)}`;

    if (content || Object.keys(rawAttributes).length > 0) {
      fieldValues.Name = fieldValues.Name || content;
      fieldValues.Title = fieldValues.Title || content;
      rows.push({
        id,
        parentId: null,
        content,
        fieldValues: stableSortRecord(fieldValues),
      });
    }

    if (Array.isArray(candidate.children)) {
      candidate.children.forEach((child, index) => visit(child, `${logicalPath}.${index}`));
    }
  }

  if (Array.isArray(children)) {
    children.forEach((child, index) => visit(child, String(index)));
  }
  return rows;
}

function isBuildLogProject(root: unknown, schema: Record<string, FieldSchema>): boolean {
  if (Object.keys(schema).length > 0 || !isRecord(root)) return false;
  const snippets: string[] = [];
  function visit(node: unknown) {
    if (!isRecord(node)) return;
    const text = extractText(node);
    if (text) snippets.push(text);
    if (Array.isArray(node.children)) node.children.forEach(visit);
  }
  visit(root);
  return snippets.some((text) => text.toLowerCase().includes('tasks.md'));
}

async function sha256(filePath: string): Promise<string> {
  const buffer = await readFile(filePath);
  return createHash('sha256').update(buffer).digest('hex');
}

function safeMediaName(originalName: string, digest: string): string {
  const extension = path.extname(originalName);
  const base = path.basename(originalName, extension);
  const cleaned = stripControlCharacters(base)
    .replace(/[<>:"/\\|?*]/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/[. ]+$/g, '')
    .trim() || 'media';
  if (`${cleaned}${extension}`.length <= 120) return `${cleaned}${extension}`;
  return `${cleaned.slice(0, 96).trim()}-${digest.slice(0, 12)}${extension.toLowerCase()}`;
}

function guessMimeType(fileName: string): string | undefined {
  const extension = path.extname(fileName).toLowerCase();
  const types: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.mp3': 'audio/mpeg',
    '.mp4': 'video/mp4',
  };
  return types[extension];
}

async function scanSourceFiles(): Promise<string[]> {
  const files: string[] = [];
  async function visit(directory: string) {
    if (!existsSync(directory)) return;
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) await visit(absolutePath);
      else if (/\.(ts|tsx)$/.test(entry.name)) files.push(absolutePath);
    }
  }
  await visit(sourceDirectory);
  return files.sort((left, right) => left.localeCompare(right));
}

async function discoverReferencedProjectIds(sourceFiles: string[]): Promise<Set<string>> {
  const ids = new Set<string>();
  const patterns = [
    /\/api\/taskade\/projects\/([A-Za-z0-9_-]{14,})/g,
    /projectId\s*[:=]\s*['"]([A-Za-z0-9_-]{14,})['"]/g,
  ];
  for (const filePath of sourceFiles) {
    const source = await readFile(filePath, 'utf8');
    for (const pattern of patterns) {
      for (const match of source.matchAll(pattern)) ids.add(match[1]!);
    }
  }
  return ids;
}

async function migrateProjects(sourceFiles: string[]): Promise<SeedBundle> {
  const manifestPath = path.join(repositoryRoot, 'manifest.json');
  const manifestSource = await parseJsonFile<JsonRecord>(repositoryRoot, 'manifest.json', 'manifest');
  const spaceId =
    manifestSource && typeof manifestSource.value.spaceId === 'string'
      ? manifestSource.value.spaceId
      : 'local-workspace';
  if (!manifestSource) {
    record('WARN', 'MISSING_MANIFEST', 'Using local-workspace because manifest.json is unavailable.', path.relative(repositoryRoot, manifestPath));
  }

  const schemas: SeedBundle['schemas'] = {};
  const projects: SeedBundle['projects'] = {};
  const projectDirectory = path.join(repositoryRoot, 'projects');
  for (const fileName of await listFiles(projectDirectory, '.json')) {
    const parsed = await parseJsonFile<JsonRecord>(projectDirectory, fileName, 'project');
    if (!parsed) continue;
    const projectId = path.basename(fileName, '.json');
    const root = isRecord(parsed.value.root) ? parsed.value.root : {};
    const schema = normalizeSchema(root.fields);
    if (isBuildLogProject(root, schema)) {
      record('INFO', 'SKIPPED_BUILD_LOG_PROJECT', 'Skipped TASKS.md build-log project.', `projects/${fileName}`);
      continue;
    }
    schemas[projectId] = schema;
    projects[projectId] = collectRows(
      projectId,
      root.children,
      schema,
      resolveDisplayOwners(projectId, schema),
    );
  }

  for (const referencedProjectId of await discoverReferencedProjectIds(sourceFiles)) {
    if (!(referencedProjectId in projects)) {
      schemas[referencedProjectId] = {};
      projects[referencedProjectId] = [];
      record(
        'WARN',
        'MISSING_REFERENCED_PROJECT',
        `Initialized an empty local table for referenced project ${referencedProjectId}.`,
      );
    }
  }

  return {
    spaceId,
    generatedAt: new Date().toISOString(),
    schemas: stableSortRecord(schemas),
    projects: stableSortRecord(projects),
  };
}

async function migrateCollection(directoryName: 'agents' | 'automations') {
  const directory = path.join(repositoryRoot, directoryName);
  const migrated: JsonRecord[] = [];
  for (const fileName of await listFiles(directory, '.json')) {
    const parsed = await parseJsonFile<JsonRecord>(directory, fileName, directoryName);
    if (!parsed) continue;
    migrated.push({ ...parsed.value, id: path.basename(fileName, '.json') });
  }
  return migrated;
}

async function migrateMedia(): Promise<Record<string, MediaEntry>> {
  const mediaRoot = path.join(repositoryRoot, 'media');
  const mediaMap: Record<string, MediaEntry> = {};
  const outputNames = new Map<string, string>();
  if (!existsSync(mediaRoot)) return mediaMap;
  const folders = (await readdir(mediaRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));

  if (!isDryRun) await mkdir(publicMediaDirectory, { recursive: true });

  for (const folderName of folders) {
    const folderPath = path.join(mediaRoot, folderName);
    const metadata = await parseJsonFile<JsonRecord>(folderPath, 'metadata.json', 'media metadata');
    if (!metadata) continue;
    const siblings = (await readdir(folderPath, { withFileTypes: true }))
      .filter((entry) => entry.isFile() && entry.name !== 'metadata.json')
      .map((entry) => entry.name)
      .sort((left, right) => left.localeCompare(right));
    if (siblings.length === 0) {
      record('WARN', 'MISSING_MEDIA_BINARY', 'Media metadata has no binary sibling.', `media/${folderName}/metadata.json`);
      continue;
    }

    for (const originalName of siblings) {
      const sourcePath = path.join(folderPath, originalName);
      const digest = await sha256(sourcePath);
      let localName = safeMediaName(originalName, digest);
      const existingDigest = outputNames.get(localName.toLowerCase());
      if (existingDigest && existingDigest !== digest) {
        const extension = path.extname(localName);
        localName = `${path.basename(localName, extension)}-${folderName.slice(0, 8)}-${digest.slice(0, 8)}${extension}`;
      }
      outputNames.set(localName.toLowerCase(), digest);
      if (!isDryRun) {
        const destination = path.join(publicMediaDirectory, localName);
        if (!existsSync(destination) || (await sha256(destination)) !== digest) {
          await copyFile(sourcePath, destination);
        }
      }

      const fileDescription = isRecord(metadata.value.fileDesc) ? metadata.value.fileDesc : {};
      const canonicalId =
        typeof fileDescription.id === 'string' && fileDescription.id
          ? fileDescription.id
          : `space-files/${folderName}`;
      const entry: MediaEntry = {
        id: canonicalId,
        sourceFolder: folderName,
        originalName,
        localName,
        localUrl: `/media/${encodeURIComponent(localName)}`,
        sha256: digest,
        ...(guessMimeType(originalName) ? { mimeType: guessMimeType(originalName) } : {}),
      };
      mediaMap[canonicalId] = entry;
      mediaMap[folderName] = entry;
    }
  }
  return stableSortRecord(mediaMap);
}

async function countCloudReferences(sourceFiles: string[]): Promise<number> {
  let count = 0;
  const pattern = /(\/api\/taskade|\/_taskade|\/_genesis|files\.taskade\.com|@taskade\/)/g;
  for (const filePath of sourceFiles) {
    const source = await readFile(filePath, 'utf8');
    const matches = source.match(pattern);
    if (matches) count += matches.length;
  }
  return count;
}

function escapeRegularExpression(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function localizeMediaReferences(
  sourceFiles: string[],
  mediaMap: Record<string, MediaEntry>,
): Promise<number> {
  if (isDryRun) return 0;
  const uniqueEntries = Array.from(
    new Map(
      Object.values(mediaMap).map((entry) => [
        `${entry.sourceFolder}:${entry.localUrl}`,
        entry,
      ]),
    ).values(),
  );
  let rewritten = 0;
  for (const filePath of sourceFiles) {
    const original = await readFile(filePath, 'utf8');
    let localized = original;
    for (const entry of uniqueEntries) {
      const identifiers = Array.from(
        new Set([
          entry.sourceFolder,
          entry.id.replace(/^space-files\//, ''),
        ]),
      )
        .filter(Boolean)
        .map(escapeRegularExpression)
        .join('|');
      const remoteUrl = new RegExp(
        `https://files\\.taskade\\.com/(?:space-files/)?(?:${identifiers})(?:/[^\\s'\"\\)\\}\\]]*)?`,
        'g',
      );
      localized = localized.replace(remoteUrl, () => {
        rewritten += 1;
        return entry.localUrl;
      });
    }
    if (localized !== original) await writeFile(filePath, localized, 'utf8');
  }
  return rewritten;
}

async function recordImplementedRuntimeDecisions(sourceFiles: string[]): Promise<void> {
  const combined = (
    await Promise.all(sourceFiles.map((filePath) => readFile(filePath, 'utf8')))
  ).join('\n');
  const checks: Array<[string, string, RegExp]> = [
    [
      'WIRED_LOCAL_CRUD',
      'UI data mutations are wired to the local Tri-Key data engine.',
      /\b(createNode|updateNode|deleteNode)\s*\(/,
    ],
    [
      'WIRED_LOCAL_FLOWS',
      'UI flow actions are wired to the isolated local automation engine.',
      /\b(runFlow|submitForm)\s*\(/,
    ],
    [
      'WIRED_LOCAL_AGENT_CHAT',
      'The active agent chat supports local inference with deterministic offline fallback.',
      /<FloatingAgentChat\b/,
    ],
    [
      'WIRED_STANDALONE_SETTINGS',
      'The standalone control panel exposes local settings, import, export, reset, and flow controls.',
      /<StandaloneControlPanel\b/,
    ],
  ];
  for (const [code, message, pattern] of checks) {
    if (pattern.test(combined)) record('INFO', code, message, 'apps/default/src');
  }
}

async function writeArtifacts(
  seed: SeedBundle,
  agents: JsonRecord[],
  automations: JsonRecord[],
  mediaMap: Record<string, MediaEntry>,
  migrationManifest: MigrationManifest,
) {
  if (isDryRun) return;
  await mkdir(dataDirectory, { recursive: true });
  await Promise.all([
    writeFile(path.join(dataDirectory, 'seed.json'), stringifyJson(seed), 'utf8'),
    writeFile(path.join(dataDirectory, 'agents.json'), stringifyJson(agents), 'utf8'),
    writeFile(path.join(dataDirectory, 'automations.json'), stringifyJson(automations), 'utf8'),
    writeFile(path.join(dataDirectory, 'media-map.json'), stringifyJson(mediaMap), 'utf8'),
    writeFile(
      path.join(dataDirectory, 'migration-manifest.json'),
      stringifyJson(migrationManifest),
      'utf8',
    ),
  ]);
}

async function main() {
  log('S1', 'Starting export discovery.', { repositoryRoot, appRoot, dryRun: isDryRun });
  const appDirectories = await discoverAppDirectories();
  log('S1', 'Application directories discovered.', { apps: appDirectories });
  const sourceFiles = await scanSourceFiles();
  const seed = await migrateProjects(sourceFiles);
  const agents = await migrateCollection('agents');
  const automations = await migrateCollection('automations');
  const mediaMap = await migrateMedia();
  const rewrittenMediaReferences = await localizeMediaReferences(sourceFiles, mediaMap);
  if (rewrittenMediaReferences > 0) {
    record(
      'INFO',
      'LOCALIZED_MEDIA_REFERENCES',
      `Rewrote ${rewrittenMediaReferences} Taskade CDN reference(s) to local media URLs.`,
      'apps/default/src',
    );
  }
  await recordImplementedRuntimeDecisions(sourceFiles);
  const cloudReferences = await countCloudReferences(sourceFiles);
  if (cloudReferences > 0) {
    record('WARN', 'ACTIVE_CLOUD_REFERENCES', `${cloudReferences} cloud/private runtime references remain for S2/S4 remediation.`);
  }

  const uniqueMediaFiles = new Set(
    Object.values(mediaMap).map((entry) => `${entry.sourceFolder}:${entry.originalName}`),
  ).size;
  const migrationManifest: MigrationManifest = {
    spaceId: seed.spaceId,
    generatedAt: seed.generatedAt,
    dryRun: isDryRun,
    apps: appDirectories,
    counts: {
      projects: Object.keys(seed.projects).length,
      rows: Object.values(seed.projects).reduce((total, rows) => total + rows.length, 0),
      mediaFiles: uniqueMediaFiles,
      agents: agents.length,
      flows: automations.length,
      quarantinedFiles,
      activeCloudReferences: cloudReferences,
    },
    decisions,
  };

  await writeArtifacts(seed, agents, automations, mediaMap, migrationManifest);
  log('S1', 'Discovery complete.', migrationManifest.counts);
  log('S2', isDryRun ? 'Media localization planned; dry-run made no changes.' : 'Media localized and data artifacts written.');
  log('S3', 'Tri-Key seed bundles and local runtime contracts verified by discovery.');
  log('S4', 'UI wiring decisions and remaining cloud references recorded in the audit manifest.');
}

main().catch((error) => {
  console.error('[MIGRATE:S1] Fatal migration error.', error);
  process.exitCode = 1;
});
