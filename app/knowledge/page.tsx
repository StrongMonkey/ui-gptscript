'use client';

import { Avatar, Card, CardBody, CardHeader, Divider } from '@nextui-org/react';
import { GiBrain } from 'react-icons/gi';
import { IoAddOutline } from 'react-icons/io5';
import { useContext, useEffect, useState } from 'react';
import { NavContext } from '@/contexts/nav';
import { GoSearch } from 'react-icons/go';
import { Input } from '@nextui-org/input';
import { useRouter } from 'next/navigation';
import { listKnowledgeBases } from '@/actions/knowledge/knowledge';
import KnowledgeModal from '@/app/knowledge/KnowledgeModal';
import { KnowledgeBase } from '@/types/knowledge';
import { FaCheckCircle } from 'react-icons/fa';

export default function Knowledge() {
  const [knowledges, setKnowledges] = useState<KnowledgeBase[]>([]);
  const [selectedKnowledge, setSelectedKnowledge] = useState<KnowledgeBase>(
    {} as KnowledgeBase
  );
  const { setCurrent } = useContext(NavContext);
  const router = useRouter();
  const [query, setQuery] = useState<string>('');
  const [open, setOpen] = useState(false);
  useEffect(() => {
    setCurrent('/knowledge');
  }, [setCurrent]);

  useEffect(() => {
    const fetchKnowledges = async () => {
      const res = await listKnowledgeBases();
      console.log(res);
      setKnowledges(res);
    };
    fetchKnowledges();
  }, [open]);

  return (
    <div className="w-full px-20 h-full overflow-y-scroll mx-auto pt-10">
      <div className="flex w-full justify-between space-x-2 mt-10 mb-5">
        <h1 className="text-4xl font-bold text-primary-400">
          <GiBrain className="inline mb-2 mr-1 text-5xl" /> Knowledge
        </h1>

        <div className="w-3/4 flex justify-end space-x-4">
          <Input
            startContent={<GoSearch />}
            placeholder="Search for knowledges"
            color="primary"
            variant="bordered"
            isClearable
            size="lg"
            className="w-2/5"
            onChange={(e) => {
              setQuery(e.target.value);
            }}
          />
        </div>
      </div>
      <Divider className="mb-10" />
      <div className={'pb-10'}>
        <KnowledgeModal
          knowledge={selectedKnowledge}
          open={open}
          setOpen={setOpen}
        />
        <div className="grid gap-12 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 4xl:grid-cols-4">
          <div
            onClick={() => {
              setCurrent('/knowledge');
              router.push('/knowledge/add');
            }}
          >
            <Card
              className="h-[350px] border-2 border-white dark:bg-zinc-900 p-6 dark:border-zinc-900 hover:border-primary hover:shadow-2xl dark:hover:border-primary cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
              shadow="md"
              onClick={() => {
                setCurrent('/knowledge');
                router.push('/knowledge/add');
              }}
            >
              <IoAddOutline size={48} />
              <p className="text-wrap text-sm text-zinc-500">
                Add New Knowledge
              </p>
            </Card>
          </div>
          {knowledges
            .filter((k) => {
              if (query === '') {
                return k;
              } else if (
                k.name.toLowerCase().includes(query.toLowerCase()) ||
                k.description.toLowerCase().includes(query.toLowerCase())
              ) {
                return k;
              }
            })
            .map((knowledge) => (
              <div
                key={knowledge.id}
                onClick={() => {
                  setSelectedKnowledge(knowledge);
                  setOpen(true);
                }}
              >
                <Card
                  className="h-[350px] border-2 border-white dark:bg-zinc-900 p-6 dark:border-zinc-900 hover:border-primary hover:shadow-2xl dark:hover:border-primary cursor-pointer transition duration-300 ease-in-out transform hover:scale-105"
                  key={knowledge.id}
                  shadow="md"
                >
                  <CardHeader className="block">
                    <div className="flex space-x-4 w-full items-center">
                      <Avatar
                        color="primary"
                        icon={<GiBrain className="text-3xl" />}
                        classNames={{ base: 'w-14 h-14 p-2' }}
                      />
                      <div style={{ width: 'calc(100% - 70px)' }}>
                        <h1 className="text-2xl font-medium truncate">
                          {knowledge.name}
                        </h1>
                      </div>
                      {knowledge.ready && (
                        <FaCheckCircle
                          className="text-4xl text-green-500 ml-2"
                          aria-hidden="true"
                        />
                      )}
                    </div>
                    <Divider className="mt-4" />
                  </CardHeader>
                  <CardBody>
                    <p className="text-wrap text-sm text-zinc-500">
                      {knowledge.description}
                    </p>
                  </CardBody>
                </Card>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
