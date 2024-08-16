import { useCallback, useContext, useEffect, useState } from 'react';
import RemoteImports from '@/components/edit/configure/imports';
import Loading from '@/components/loading';
import Models from '@/components/edit/configure/models';
import Visibility from '@/components/edit/configure/visibility';
import Code from '@/components/edit/configure/code';
import { EditContext } from '@/contexts/edit';
import { GoLightBulb } from 'react-icons/go';
import { HiCog } from 'react-icons/hi2';
import { LuCircuitBoard } from 'react-icons/lu';
import {
  Textarea,
  Input,
  Avatar,
  Tooltip,
  Accordion,
  AccordionItem,
  Button,
  Select,
  SelectItem,
} from '@nextui-org/react';
import { PiToolboxBold } from 'react-icons/pi';
import AssistantNotFound from '@/components/assistant-not-found';
import { useRouter } from 'next/navigation';
import { GiBrain } from 'react-icons/gi';
import { KnowledgeBase } from '@/types/knowledge';
import { listKnowledgeBases } from '@/actions/knowledge/knowledge';

interface ConfigureProps {
  collapsed?: boolean;
  className?: string;
}

const Configure: React.FC<ConfigureProps> = ({ collapsed }) => {
  const router = useRouter();
  const {
    root,
    setRoot,
    models,
    loading,
    notFound,
    visibility,
    setVisibility,
    dynamicInstructions,
    setDynamicInstructions,
    dependencies,
    setDependencies,
    knowledgeIds,
    setKnowledgeIds,
  } = useContext(EditContext);

  const [knowledgeOptions, setKnowledgeOptions] = useState<KnowledgeBase[]>([]);
  useEffect(() => {
    const getKnowledgeOptions = async () => {
      const knowledges = await listKnowledgeBases();
      setKnowledgeOptions(knowledges);
    };
    getKnowledgeOptions();
  }, []);

  const abbreviate = (name: string) => {
    const words = name.split(/(?=[A-Z])|[\s_-]/);
    const firstLetters = words.map((word) => word[0]);
    return firstLetters.slice(0, 2).join('').toUpperCase();
  };

  const setRootTools = useCallback(
    (newTools: string[]) => {
      setRoot({ ...root, tools: newTools });
    },
    [root]
  );

  if (loading)
    return <Loading>{`Loading your assistant's details...`}</Loading>;

  if (notFound) return <AssistantNotFound />;

  return (
    <>
      <div className="flex flex-col w-full justify-center items-center space-y-2 mb-6 mt-10">
        <Tooltip
          content={root.name || 'Unnamed Assistant'}
          placement="bottom"
          closeDelay={0.5}
        >
          <Avatar
            showFallback
            name={abbreviate(root.name || 'Unnamed Assistant')}
            className="w-[40px] cursor-default"
            classNames={{
              base: 'bg-white p-6 text-sm border dark:border-none dark:bg-zinc-900',
              name: 'text-lg text-default-600',
            }}
          />
        </Tooltip>
      </div>
      <div className="px-2 flex flex-col space-y-4 mb-6">
        <div className="relative">
          <div className="absolute top-3 right-0 z-40">
            <Visibility visibility={visibility} setVisibility={setVisibility} />
          </div>
          <Input
            color="primary"
            variant="bordered"
            label="Name"
            placeholder="Give your assistant a name..."
            defaultValue={root.name}
            onChange={(e) => setRoot({ ...root, name: e.target.value })}
          />
        </div>
        <Textarea
          color="primary"
          fullWidth
          variant="bordered"
          label="Description"
          placeholder="Describe what your assistant does..."
          defaultValue={root.description}
          onChange={(e) => setRoot({ ...root, description: e.target.value })}
        />
        <Textarea
          color="primary"
          fullWidth
          maxRows={50}
          variant="bordered"
          label="Instructions"
          placeholder="Give your assistant instructions on how to behave..."
          defaultValue={root.instructions}
          onChange={(e) => setRoot({ ...root, instructions: e.target.value })}
        />
        <Accordion isCompact fullWidth selectionMode="multiple">
          <AccordionItem
            aria-label="dynamic-instructions"
            title={<h1>Dynamic Instructions</h1>}
            startContent={<LuCircuitBoard />}
            classNames={{ content: collapsed ? 'pt-6 pb-10' : 'p-10 pt-6' }}
          >
            <div className="flex bg-primary-50 rounded-xl p-4 mb-4 text-tiny italic text-primary-500 items-center space-x-4">
              <GoLightBulb
                className={`inline mb-1 text-sm ${collapsed ? 'w-[200px] ' : 'w-fit'} `}
              />
              <p>
                Augment your instructions with code that can pull information
                from local or remote systems.
              </p>
            </div>
            <Code
              code={dynamicInstructions}
              onChange={setDynamicInstructions}
              dependencies={
                dependencies.find((d) => d.forTool === 'dynamic-instructions')
                  ?.content || ''
              }
              onDependenciesChange={(code, type) =>
                setDependencies([
                  ...dependencies.filter(
                    (d) => d.forTool !== 'dynamic-instructions'
                  ),
                  {
                    forTool: 'dynamic-instructions',
                    content: code,
                    type: type,
                  },
                ])
              }
            />
            {/* <div className="my-4"/>
                        <Code label="Dependencies" code={'// package.json'} onChange={(code) => {}} /> */}
          </AccordionItem>
          <AccordionItem
            aria-label="remote-tools"
            title={<h1>Tools</h1>}
            startContent={<PiToolboxBold />}
            classNames={{ content: collapsed ? 'pt-6 pb-10' : 'p-10 pt-6' }}
          >
            <RemoteImports
              tools={root.tools?.filter((t) => {
                const isKnowledgeNotFound = !knowledgeOptions.find(
                  (k) => k.name === t && !knowledgeIds.includes(k.id)
                );
                return !isKnowledgeNotFound;
              })}
              setTools={setRootTools}
              collapsed={collapsed}
            />
          </AccordionItem>
          <AccordionItem
            aria-label="knowledges"
            title={<h1>Knowledges</h1>}
            startContent={<GiBrain />}
            classNames={{ content: collapsed ? 'pt-6 pb-10' : 'p-10 pt-6' }}
          >
            <Select
              label="Knowledge select"
              placeholder="Select a knowledge"
              selectionMode="multiple"
              className="w-full"
              selectedKeys={knowledgeIds}
              onChange={(value) => {
                const ids = value.target.value.split(',');
                setKnowledgeIds(
                  knowledgeOptions
                    .filter((k) => ids.includes(k.id))
                    .map((k) => k.id)
                );
              }}
            >
              {knowledgeOptions.map((k) => (
                <SelectItem key={k.id}>{k.name}</SelectItem>
              ))}
            </Select>
          </AccordionItem>
          <AccordionItem
            aria-label="advanced"
            title={<h1>Advanced</h1>}
            startContent={<HiCog />}
            classNames={{
              content: collapsed
                ? 'py-6 pt-10 h-[500px]'
                : 'p-10 pt-6 h-[500px]',
            }}
          >
            <Models
              options={models}
              defaultValue={root.modelName}
              onChange={(model) => setRoot({ ...root, modelName: model })}
            />
          </AccordionItem>
        </Accordion>
      </div>
      <div className="w-full justify-end px-2 flex space-y-4 mb-6">
        <Button
          color="primary"
          onClick={() => {
            router.push('/build');
          }}
        >
          Finish
        </Button>
      </div>
    </>
  );
};

export default Configure;
