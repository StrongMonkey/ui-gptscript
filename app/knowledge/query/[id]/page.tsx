'use client';

import { FaCheckCircle } from 'react-icons/fa';
import { IoArrowBackOutline } from 'react-icons/io5';
import { useEffect, useState } from 'react';
import AddDataStep from '@/app/knowledge/add/AddData';
import IngestStep from '@/app/knowledge/add/IngestRetrieve';
import FinishStep from '@/app/knowledge/add/Finish';
import {
  getKnoweledgeBase,
  updateKnowledgeBase,
} from '@/actions/knowledge/knowledge';
import { Divider } from '@nextui-org/react';
import { Query } from '@/app/knowledge/query/[id]/query';

interface Step {
  name: string;
  status: 'current' | 'upcoming' | 'complete';
}

export default function ConfigureKnowledge({
  params,
}: {
  params: { id: string };
}) {
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(1);
  const id = params.id;

  const [chunkSize, setChunkSize] = useState<string>('');
  const [chunkOverlap, setChunkOverlap] = useState<string>('');
  const [topK, setTopK] = useState<string>('');
  const [droppedFiles, setDroppedFiles] = useState<string[]>([]);
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  useEffect(() => {
    const fetchKnowledge = async () => {
      const knowledge = await getKnoweledgeBase(id);
      setChunkSize(knowledge.chunkSize.toString());
      setChunkOverlap(knowledge.chunkOverlapSize.toString());
      setTopK(knowledge.topK.toString());
      setName(knowledge.name);
      setDescription(knowledge.description);
      setDroppedFiles(knowledge.files);
    };
    fetchKnowledge();
  }, [id, currentStepIndex]);

  useEffect(() => {
    if (steps.length === 0) {
      setSteps([
        { name: 'Configure', status: 'complete' },
        { name: 'Query', status: 'current' },
      ]);
    }
  }, [steps]);

  const onClickUpdate = () => {
    const update = async () =>
      await updateKnowledgeBase(id, {
        chunkSize: parseInt(chunkSize),
        chunkOverlapSize: parseInt(chunkOverlap),
        topK: parseInt(topK),
        name,
        description,
        files: droppedFiles,
      });

    update().catch((err) => console.error(err));
    setCurrentStepIndex(1);
  };

  return (
    <div className="flex h-screen w-full">
      <div className="w-[15%] flex px-4 py-4 sm:px-6 lg:px-8 ml-2 border-r h-screen overflow-hidden">
        <nav aria-label="Progress" className="mt-10 justify-center h-screen">
          <ol role="list" className="space-y-6">
            <a href={'/knowledge'} className="group">
              <span className="flex items-start">
                <span className="relative flex h-5 w-5 flex-shrink-0 items-center justify-center">
                  <IoArrowBackOutline
                    aria-hidden="true"
                    className="h-full w-full text-indigo-600 group-hover:text-indigo-800"
                  />
                </span>
                <span className="ml-3 text-sm font-medium text-gray-500 group-hover:text-gray-900">
                  Back
                </span>
              </span>
            </a>
            {steps.map((step) => (
              <li
                key={step.name}
                onClick={() => {
                  setCurrentStepIndex(steps.indexOf(step));
                }}
              >
                {step.status === 'complete' ? (
                  <span className="group">
                    <span className="flex items-start hover:cursor-pointer">
                      <span className="relative flex h-5 w-5 flex-shrink-0 items-center justify-center">
                        <FaCheckCircle
                          aria-hidden="true"
                          className="h-full w-full text-indigo-600 group-hover:text-indigo-800"
                        />
                      </span>
                      <span className="ml-3 text-sm font-medium text-gray-500 group-hover:text-gray-900">
                        {step.name}
                      </span>
                    </span>
                  </span>
                ) : step.status === 'current' ? (
                  <span
                    aria-current="step"
                    className="flex items-start hover:cursor-pointer"
                  >
                    <span
                      aria-hidden="true"
                      className="relative flex h-5 w-5 flex-shrink-0 items-center justify-center"
                    >
                      <span className="absolute h-4 w-4 rounded-full bg-indigo-200" />
                      <span className="relative block h-2 w-2 rounded-full bg-indigo-600" />
                    </span>
                    <span className="ml-3 text-sm font-medium text-indigo-600">
                      {step.name}
                    </span>
                  </span>
                ) : (
                  <span className="group">
                    <div className="flex items-start hover:cursor-pointer">
                      <div
                        aria-hidden="true"
                        className="relative flex h-5 w-5 flex-shrink-0 items-center justify-center"
                      >
                        <div className="h-2 w-2 rounded-full bg-gray-300 group-hover:bg-gray-400" />
                      </div>
                      <p className="ml-3 text-sm font-medium text-gray-500 group-hover:text-gray-900">
                        {step.name}
                      </p>
                    </div>
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>
      <div className="flex overflow-auto w-full">
        {currentStepIndex === 0 && (
          <div className="w-full px-20 mb-10 overflow-y-scroll mx-auto">
            <AddDataStep
              showBasenameOnly
              droppedFiles={droppedFiles}
              setDroppedFiles={setDroppedFiles}
            />
            <Divider />
            <IngestStep
              chunkSize={chunkSize}
              chunkOverlap={chunkOverlap}
              topK={topK}
              setChunkOverlap={setChunkOverlap}
              setChunkSize={setChunkSize}
              setTopK={setTopK}
            />
            <Divider />
            <FinishStep
              onClickFinish={onClickUpdate}
              name={name}
              setName={setName}
              description={description}
              setDescription={setDescription}
            />
          </div>
        )}
        {currentStepIndex === 1 && <Query id={id} />}
      </div>
    </div>
  );
}
