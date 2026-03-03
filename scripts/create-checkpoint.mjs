import { spawnSync } from 'node:child_process';

const gitCandidates = [
  process.env.GIT_BIN,
  'git',
  'C:\\Program Files\\Git\\cmd\\git.exe',
].filter(Boolean);

const args = process.argv.slice(2);
const pushEnabled = args.includes('--push');
const messageInput = args.filter((arg) => arg !== '--push').join(' ').trim();
const checkpointMessage = messageInput || `snapshot ${new Date().toISOString()}`;

const runGit = (gitBin, gitArgs, options = {}) => {
  return spawnSync(gitBin, gitArgs, {
    stdio: 'pipe',
    encoding: 'utf8',
    ...options,
  });
};

const getGitBin = () => {
  for (const candidate of gitCandidates) {
    const probe = runGit(candidate, ['--version']);
    if (probe.status === 0) return candidate;
  }
  return null;
};

const gitBin = getGitBin();
if (!gitBin) {
  console.error('Git non trovato. Installa Git o imposta GIT_BIN.');
  process.exit(1);
}

const ensureRepo = runGit(gitBin, ['rev-parse', '--is-inside-work-tree']);
if (ensureRepo.status !== 0 || !ensureRepo.stdout.includes('true')) {
  console.error('Cartella non Git. Esegui prima: git init');
  process.exit(1);
}

const now = new Date();
const pad = (value) => String(value).padStart(2, '0');
const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
const slug = checkpointMessage
  .toLowerCase()
  .replace(/[^a-z0-9\s-]/g, '')
  .trim()
  .replace(/\s+/g, '-')
  .slice(0, 40) || 'checkpoint';
const tagName = `checkpoint-${timestamp}-${slug}`;

const addResult = runGit(gitBin, ['add', '-A']);
if (addResult.status !== 0) {
  console.error(addResult.stderr || 'Errore su git add');
  process.exit(1);
}

const statusResult = runGit(gitBin, ['status', '--porcelain']);
if (statusResult.status !== 0) {
  console.error(statusResult.stderr || 'Errore su git status');
  process.exit(1);
}

if (statusResult.stdout.trim().length > 0) {
  const commitResult = runGit(gitBin, ['commit', '-m', `checkpoint: ${checkpointMessage}`]);
  if (commitResult.status !== 0) {
    console.error(commitResult.stderr || 'Errore su git commit');
    process.exit(1);
  }
  process.stdout.write(commitResult.stdout);
}

const tagResult = runGit(gitBin, ['tag', '-a', tagName, '-m', `Checkpoint: ${checkpointMessage}`]);
if (tagResult.status !== 0) {
  console.error(tagResult.stderr || 'Errore su git tag');
  process.exit(1);
}

console.log(`Checkpoint creato: ${tagName}`);

if (!pushEnabled) {
  console.log('Checkpoint locale creato. Per inviarlo su GitHub: npm run checkpoint:push -- "messaggio"');
  process.exit(0);
}

const remoteResult = runGit(gitBin, ['remote']);
if (remoteResult.status !== 0 || !remoteResult.stdout.includes('origin')) {
  console.error('Remote origin non configurato. Aggiungilo prima di usare --push.');
  process.exit(1);
}

const pushBranch = runGit(gitBin, ['push', '-u', 'origin', 'main']);
if (pushBranch.status !== 0) {
  console.error(pushBranch.stderr || 'Errore push branch main');
  process.exit(1);
}
process.stdout.write(pushBranch.stdout);

const pushTag = runGit(gitBin, ['push', 'origin', tagName]);
if (pushTag.status !== 0) {
  console.error(pushTag.stderr || 'Errore push tag');
  process.exit(1);
}
process.stdout.write(pushTag.stdout);

console.log(`Checkpoint pubblicato su GitHub: ${tagName}`);
