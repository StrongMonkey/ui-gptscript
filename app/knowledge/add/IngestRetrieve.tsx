import { useState } from 'react';
import { Input } from '@nextui-org/input';
import { Button } from '@nextui-org/react';

interface IngestRetrieveProps {
  onClickNext?: () => void;
  chunkSize: string;
  setChunkSize: (value: string) => void;
  chunkOverlap: string;
  setChunkOverlap: (value: string) => void;
  topK: string;
  setTopK: (value: string) => void;
}

export default function IngestStep({
  chunkSize,
  setChunkSize,
  chunkOverlap,
  setChunkOverlap,
  topK,
  setTopK,
  onClickNext,
}: IngestRetrieveProps) {
  const onChunkSizeChange = (event: any) => {
    setChunkSize(event.target.value);
  };
  const onChunkOverlapChange = (event: any) => {
    setChunkOverlap(event.target.value);
  };

  return (
    <div className="w-full px-20 mb-10 overflow-y-scroll mx-auto pt-10">
      <div className="space-y-12">
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-gray-900/10 pb-12 md:grid-cols-3">
          <div>
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              Chunk Setting
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Adjust the chunk size and chunk overlap size
            </p>
          </div>

          <div className="max-w-2xl space-y-8 md:col-span-2">
            <div>
              <Input
                type="number"
                label={'Chunk Size'}
                onChange={onChunkSizeChange}
                value={chunkSize}
                description="Specify the size of text segments or chunks that the retrieval system divides a document into."
                className="max-w-lg mt-2"
              />
              <Input
                type="number"
                label={'Chunk Overlap Size'}
                onChange={onChunkOverlapChange}
                value={chunkOverlap}
                description="Specify the amount of overlapping content between adjacent text chunks to ensure continuity and context when dividing a document"
                className="max-w-lg mt-2"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-gray-900/10 pb-12 md:grid-cols-3">
          <div>
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              Retriever Setting
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Adjust the retriever settings on how the document is retrieved
            </p>
          </div>

          <div>
            <Input
              type="number"
              label={'Top K'}
              onChange={(event) => setTopK(event.target.value)}
              value={topK}
              description="Specify the number of documents to retrieve for each query"
              className="max-w-lg mt-2"
            />
          </div>
        </div>
      </div>

      {onClickNext && (
        <div className="mt-6 flex items-center justify-end gap-x-6">
          <Button color="primary" onClick={onClickNext}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
