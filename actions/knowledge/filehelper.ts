'use server';

import fs from 'fs';
import path from 'path';

export async function getFileOrFolderSizeInMB(
  filePath: string
): Promise<number> {
  const stats = fs.statSync(filePath);

  if (stats.isFile()) {
    // Convert file size from bytes to MB
    return parseFloat((stats.size / (1024 * 1024)).toFixed(2));
  }

  if (stats.isDirectory()) {
    const files = fs.readdirSync(filePath);
    const folderSize = await Promise.all(
      files.map(async (file) => {
        const currentPath = path.join(filePath, file);
        return await getFileOrFolderSizeInMB(currentPath);
      })
    ).then((sizes) => sizes.reduce((total, size) => total + size, 0));

    return parseFloat(folderSize.toFixed(2));
  }

  return 0;
}
