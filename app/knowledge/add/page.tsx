'use client';

import { FaCheckCircle } from 'react-icons/fa';
import { IoArrowBackOutline } from 'react-icons/io5';
import { useEffect, useState } from 'react';
import AddDataStep from '@/app/knowledge/add/AddData';
import IngestStep from '@/app/knowledge/add/IngestRetrieve';
import FinishStep from '@/app/knowledge/add/Finish';
import { createKnowledgeBase } from '@/actions/knowledge/knowledge';
import { useRouter } from 'next/navigation';

interface Step {
  name: string;
  status: 'current' | 'upcoming' | 'complete';
}

export default function AddKnowledgePage() {
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [chunkSize, setChunkSize] = useState('1024');
  const [chunkOverlap, setChunkOverlap] = useState('256');
  const [topK, setTopK] = useState('5');
  const [droppedFiles, setDroppedFiles] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState(
    'This is a useful knowledge base for answering your questions about...'
  );
  const router = useRouter();

  useEffect(() => {
    if (steps.length === 0) {
      setSteps([
        { name: 'Add data source', status: 'current' },
        { name: 'Ingestion and Retrieval', status: 'upcoming' },
        { name: 'Finish', status: 'upcoming' },
      ]);
    }
  }, [steps]);

  const onClickNext = () => {
    setSteps((prevSteps) => {
      const newSteps = [...prevSteps];
      newSteps[currentStepIndex].status = 'complete';
      newSteps[currentStepIndex + 1].status = 'current';
      return newSteps;
    });
    setCurrentStepIndex((prevIndex) => prevIndex + 1);
  };

  const onClickFinish = () => {
    setSteps((prevSteps) => {
      const newSteps = [...prevSteps];
      newSteps[currentStepIndex].status = 'complete';
      return newSteps;
    });
    createKnowledgeBase({
      files: droppedFiles,
      chunkSize: Number(chunkSize),
      chunkOverlapSize: Number(chunkOverlap),
      topK: Number(topK),
      name,
      description,
    });
    router.push('/knowledge');
  };

  return (
    <div className="flex">
      <div className="w-[20%] px-4 py-4 sm:px-6 lg:px-8 ml-2 border-r h-screen">
        <nav aria-label="Progress" className="mt-10 justify-center">
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
                  for (let i = 0; i < steps.indexOf(step); i++) {
                    if (steps[i].status !== 'complete') {
                      return;
                    }
                  }
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
      {currentStepIndex === 0 && (
        <AddDataStep
          onClickNext={onClickNext}
          droppedFiles={droppedFiles}
          setDroppedFiles={setDroppedFiles}
        />
      )}
      {currentStepIndex === 1 && (
        <IngestStep
          onClickNext={onClickNext}
          chunkSize={chunkSize}
          chunkOverlap={chunkOverlap}
          topK={topK}
          setChunkOverlap={setChunkOverlap}
          setChunkSize={setChunkSize}
          setTopK={setTopK}
        />
      )}
      {currentStepIndex === 2 && (
        <FinishStep
          name={name}
          setName={setName}
          description={description}
          setDescription={setDescription}
          onClickFinish={onClickFinish}
        />
      )}
    </div>
  );
}
