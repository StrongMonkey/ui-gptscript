'use server';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { KNOWLEDGE_DIR } from '@/config/env';
import { KnowledgeBase } from '@/types/knowledge';

const execPromise = promisify(exec);

interface KnowledgeOpts {
  files: string[];
  chunkSize: number;
  chunkOverlapSize: number;
  topK: number;
  name: string;
  description: string;
}

function generateRandomId(length: number = 5): string {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length);
}

export async function getKnowledgeBaseDir(id: string): Promise<string> {
  return path.join(KNOWLEDGE_DIR(), id);
}

export async function getKnoweledgeBase(id: string): Promise<KnowledgeBase> {
  const knowledgeDir = KNOWLEDGE_DIR();

  const config = fs.readFileSync(path.join(knowledgeDir, id, 'config.yaml'));

  const metadata = JSON.parse(
    fs.readFileSync(path.join(knowledgeDir, id, 'metadata.json')).toString()
  );

  const ready = fs.existsSync(path.join(knowledgeDir, id, 'data.tar.gz'));
  const errorFilePath = path.join(knowledgeDir, id, 'error.log');
  const error = fs.existsSync(errorFilePath)
    ? fs.readFileSync(errorFilePath).toString()
    : '';
  return {
    id,
    name: metadata.name,
    description: metadata.description,
    ready: ready,
    topK: metadata.topK,
    chunkSize: metadata.chunkSize,
    chunkOverlapSize: metadata.chunkOverlapSize,
    config: config.toString(),
    error: error,
    files: metadata.files,
  };
}

export async function listKnowledgeBases(): Promise<KnowledgeBase[]> {
  const knowledgeDir = KNOWLEDGE_DIR();
  const filesAndDirs = fs.readdirSync(knowledgeDir);
  const subdirs = filesAndDirs.filter((item) => {
    const itemPath = path.join(knowledgeDir, item);
    return fs.statSync(itemPath).isDirectory();
  });
  console.log(subdirs);
  return subdirs.map((dir) => {
    const id = path.basename(dir);
    const config = fs.readFileSync(path.join(knowledgeDir, id, 'config.yaml'));

    const metadata = JSON.parse(
      fs.readFileSync(path.join(knowledgeDir, id, 'metadata.json')).toString()
    );

    const ready = fs.existsSync(path.join(knowledgeDir, id, 'data.tar.gz'));
    const errorFilePath = path.join(knowledgeDir, id, 'error.log');
    const error = fs.existsSync(errorFilePath)
      ? fs.readFileSync(errorFilePath).toString()
      : '';
    return {
      id,
      name: metadata.name,
      description: metadata.description,
      ready: ready,
      topK: metadata.topK,
      chunkSize: metadata.chunkSize,
      chunkOverlapSize: metadata.chunkOverlapSize,
      config: config.toString(),
      error: error,
      files: metadata.files,
    };
  });
}

export async function deleteKnowledgeBase(id: string): Promise<void> {
  const knowledgeDir = KNOWLEDGE_DIR();

  fs.rmSync(path.join(knowledgeDir, id), { recursive: true, force: true });
  return;
}

export async function createKnowledgeBase({
  files,
  chunkSize,
  chunkOverlapSize,
  topK,
  name,
  description,
}: KnowledgeOpts): Promise<void> {
  const knowledgeDir = KNOWLEDGE_DIR();

  const randomId = generateRandomId();
  try {
    const knowledgePath = path.join(knowledgeDir, randomId);
    const dataDestination = path.join(knowledgePath, 'data');
    fs.mkdirSync(knowledgePath, { recursive: true });

    files.forEach((file) => {
      fs.mkdirSync(dataDestination, { recursive: true });
      fs.copyFileSync(file, path.join(dataDestination, path.basename(file)));
    });

    const yamlContent = `
flows:
  default:
    default: true
    ingestion:
    - filetypes: ["*"]
      textsplitter:
        name: default
        chunkSize: ${chunkSize}
        chunkOverlap: ${chunkOverlapSize}  
    retrieval:
      retriever:
        name: basic
        options:
          topK: ${topK}
`;

    fs.writeFileSync(path.join(knowledgePath, 'config.yaml'), yamlContent);

    const filesAndDirs = fs.readdirSync(dataDestination).map((file) => {
      return path.join(dataDestination, file);
    });

    const metadata: KnowledgeBase = {
      id: randomId,
      name: name,
      description: description,
      config: yamlContent,
      chunkOverlapSize: chunkOverlapSize,
      chunkSize: chunkSize,
      topK: topK,
      files: filesAndDirs,
    };

    // Define the path to the metadata.json file
    const metadataFilePath = path.join(knowledgePath, 'metadata.json');

    // Write the JSON content to the file
    fs.writeFileSync(metadataFilePath, JSON.stringify(metadata, null, 2));

    await runKnowledgeProcessInBackground(randomId, knowledgePath);
  } catch (error) {
    fs.rmSync(path.join(knowledgeDir, randomId), {
      recursive: true,
      force: true,
    });
    throw error;
  }

  return;
}

export async function updateKnowledgeBase(
  id: string,
  opts: KnowledgeOpts
): Promise<void> {
  const { files, chunkSize, chunkOverlapSize, topK, name, description } = opts;
  const knowledgePath = path.join(KNOWLEDGE_DIR(), id);
  const dataDestination = path.join(knowledgePath, 'data');
  const metadataFilePath = path.join(knowledgePath, 'metadata.json');
  const configFilePath = path.join(knowledgePath, 'config.yaml');
  const yamlContent = `
flows:
  default:
    default: true
    ingestion:
    - filetypes: ["*"]
      textsplitter:
        name: default
        chunkSize: ${chunkSize}
       
        chunkOverlap: ${chunkOverlapSize}  
    retrieval:
      retriever:
        name: basic
        options:
          topK: ${topK}
`;
  const metadata: KnowledgeBase = {
    id: id,
    name: name,
    description: description,
    config: yamlContent,
    chunkOverlapSize: chunkOverlapSize,
    chunkSize: chunkSize,
    topK: topK,
    files: files,
  };
  fs.writeFileSync(metadataFilePath, JSON.stringify(metadata, null, 2));
  fs.writeFileSync(configFilePath, yamlContent);

  files.forEach((file) => {
    fs.mkdirSync(dataDestination, { recursive: true });
    fs.copyFileSync(file, path.join(dataDestination, path.basename(file)));
  });
  return await runKnowledgeProcessInBackground(id, knowledgePath);
}

export async function runKnowledgeQuery(
  id: string,
  query: string
): Promise<string> {
  const knowledgePath = path.join(KNOWLEDGE_DIR(), id);
  const { stdout } = await execPromise(
    `knowledge retrieve --archive data.tar.gz --flows-file config.yaml --dataset ${id} "${query}"`,
    {
      cwd: knowledgePath,
    }
  );

  return stdout.toString();
}

async function runKnowledgeProcessInBackground(
  randomId: string,
  knowledgePath: string
): Promise<void> {
  try {
    // Start the ingestion process in the background
    await execPromise(`knowledge ingest --dataset ${randomId} ./data`, {
      cwd: knowledgePath,
    });

    // Start the export process in the background
    await execPromise(`knowledge export ${randomId} --output data.tar.gz`, {
      cwd: knowledgePath,
    });
  } catch (error) {
    console.log(error);
    handleError(knowledgePath, error as Error);
  }
}

function handleError(dir: string, error: Error): void {
  const errorFilePath = path.join(dir, 'error.log');
  fs.writeFileSync(errorFilePath, error.message);

  console.error(`Error logged to ${errorFilePath}`);
}
