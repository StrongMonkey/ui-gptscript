import { Button, Card } from '@nextui-org/react';
import { FaPaperclip } from 'react-icons/fa';
import { LuUpload } from 'react-icons/lu';
import { BiTrash } from 'react-icons/bi';
import { getFileOrFolderSizeInMB } from '@/actions/knowledge/filehelper';
import { useEffect, useState } from 'react';

interface AddDataProps {
  onClickNext?: () => void;
  showBasenameOnly?: boolean;
  droppedFiles: string[];
  setDroppedFiles: (value: (prevFiles: string[]) => string[]) => void;
}

export default function AddDataStep({
  onClickNext,
  droppedFiles,
  setDroppedFiles,
  showBasenameOnly,
}: AddDataProps) {
  const [fileSizeMap, setFileSizeMap] = useState<Record<string, number>>({});
  useEffect(() => {}, [fileSizeMap]);

  useEffect(() => {
    droppedFiles.forEach((file) => {
      if (!fileSizeMap[file]) {
        getFileOrFolderSizeInMB(file)
          .catch((error) => {
            console.error(error);
          })
          .then((size) => {
            setFileSizeMap((prevFileSizeMap) => ({
              ...prevFileSizeMap,
              [file]: size ?? prevFileSizeMap[file],
            }));
          });
      }
    });
  }, [droppedFiles]);
  const handleDrop = (event: any) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    const filePaths = files.map((file: any) => file.path);
    setDroppedFiles((prevFiles: string[]) => [...prevFiles, ...filePaths]);
  };

  const handleDragOver = (event: any) => {
    event.preventDefault();
  };

  const handleRemove = (file: string) => {
    setDroppedFiles((prevFiles: string[]) =>
      prevFiles.filter((f) => f !== file)
    );

    setFileSizeMap((prevFileSizeMap) => {
      const updatedFileSizeMap = { ...prevFileSizeMap };
      delete updatedFileSizeMap[file];
      return updatedFileSizeMap;
    });
  };

  const handleClick = () => {
    // Trigger file dialog to open
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = (event: any) => {
      const files = Array.from(event.target?.files);
      const filePaths = files.map((file: any) => file.path as string);
      setDroppedFiles((prevFiles: string[]) => [...prevFiles, ...filePaths]);
    };
    input.click();
  };

  return (
    <div className="w-full px-20 mb-10 overflow-y-scroll mx-auto">
      <div className="flex w-full justify-between space-x-2 mt-10 mb-5">
        <div>
          <span className="mt-2 block text-lg font-semibold text-gray-900">
            Upload files
          </span>
          <p className="mt-4 text-wrap text-sm text-zinc-500">
            Upload your files or folders below to get started
          </p>
        </div>
      </div>
      <div className="w-[70%]">
        <div onClick={handleClick}>
          <Card
            className="h-[150px] border-2 bg-gray-200 border-white dark:bg-zinc-900 p-6 dark:border-zinc-900 hover:border-primary hover:shadow-2xl dark:hover:border-primary cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
            shadow="md"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <LuUpload size={32}></LuUpload>
            <p className="text-wrap text-sm text-zinc-500">
              Drag & Drop your files or folders here
            </p>
          </Card>
        </div>

        <ul
          role="list"
          className="divide-y divide-white/10 rounded-md border border-white/20 mt-10"
        >
          {droppedFiles.map((file, index) => (
            <li
              key={index}
              className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6"
            >
              <div className="flex w-0 flex-1 items-center">
                <FaPaperclip
                  aria-hidden="true"
                  className="h-5 w-5 flex-shrink-0 text-gray-400"
                />
                <div className="ml-4 flex min-w-0 flex-1 gap-2">
                  <span className="truncate font-medium">
                    {showBasenameOnly ? file.split('/').pop() : file}
                  </span>
                  {fileSizeMap[file] && (
                    <span className="flex-shrink-0 text-gray-400">
                      {fileSizeMap[file]} mb
                    </span>
                  )}
                </div>
              </div>
              <div className="ml-4 flex-shrink-0">
                <Button isIconOnly onClick={() => handleRemove(file)}>
                  <BiTrash size={20} />
                </Button>
              </div>
            </li>
          ))}
        </ul>
        {onClickNext && (
          <div className="flex justify-end mt-10">
            <Button color="primary" onClick={onClickNext}>
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
