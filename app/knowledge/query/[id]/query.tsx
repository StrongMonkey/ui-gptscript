import {
  Accordion,
  AccordionItem,
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  ScrollShadow,
  Textarea,
} from '@nextui-org/react';
import { GoPaperAirplane } from 'react-icons/go';
import { useState } from 'react';
import { runKnowledgeQuery } from '@/actions/knowledge/knowledge';
import { PiTargetBold } from 'react-icons/pi';
import { TbListDetails } from 'react-icons/tb';

export function Query({ id }: { id: string }) {
  const [query, setQuery] = useState('');
  const [queryResults, setQueryResults] = useState<
    {
      content: string;
      metadata: { [key: string]: string };
      similarity_score: number;
    }[]
  >([]);

  const onSend = async () => {
    const output = JSON.parse(await runKnowledgeQuery(id, query));
    console.log(output[query]);
    setQueryResults(output[query]);
    setQuery('');
  };

  return (
    <div className="w-full px-20 mb-10 overflow-y-scroll mx-auto">
      <div className="flex w-full justify-between space-x-2 mt-10 mb-5">
        <div className="w-full">
          <span className="mt-2 mb-5 block text-lg font-semibold text-gray-900">
            Query Documents
          </span>
          <div className="mb-5">
            <Textarea
              size="lg"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your query"
            />
          </div>
          <div className="flex justify-end">
            <Button
              startContent={<GoPaperAirplane />}
              onClick={onSend}
              color="primary"
            >
              Query
            </Button>
          </div>
        </div>
      </div>
      <Divider />
      <div className="mt-10 grid gap-12 grid-cols-1 lg:grid-cols-3 2xl:grid-cols-4 4xl:grid-cols-5">
        {queryResults
          .sort((a, b) => b.similarity_score - a.similarity_score)
          .map((result) => (
            <div key={result.similarity_score.toString()}>
              <Card
                className="h-[350px] border-2 border-white dark:bg-zinc-900 p-6 dark:border-zinc-900 hover:border-primary hover:shadow-2xl dark:hover:border-primary cursor-pointer transition duration-300 ease-in-out transform hover:scale-105"
                key={result.similarity_score.toString()}
                shadow="md"
              >
                <CardHeader className="block">
                  <div className="flex space-x-4 w-full items-center">
                    <Avatar
                      color="primary"
                      icon={<PiTargetBold className="text-3xl" />}
                      classNames={{ base: 'w-14 h-14 p-2' }}
                    />
                    <div style={{ width: 'calc(100% - 70px)' }}>
                      <h1 className="text-2xl font-medium truncate">
                        {`Score: ${result.similarity_score}`}
                      </h1>
                    </div>
                  </div>
                  <Divider className="mt-4" />
                </CardHeader>
                <CardBody>
                  <Accordion aria-label="details" fullWidth>
                    <AccordionItem
                      key="result"
                      title="Result"
                      startContent={<TbListDetails />}
                    >
                      <div className="h-full">
                        <ScrollShadow className="w-[300px] h-[400px]">
                          {result.content}
                        </ScrollShadow>
                      </div>
                    </AccordionItem>
                    <AccordionItem
                      key="metadata"
                      title="Metadata"
                      startContent={<TbListDetails />}
                    >
                      <div className="h-full">
                        <Card>
                          <ul>
                            {Object.entries(result.metadata).map(
                              ([key, value]) => (
                                <li key={key}>
                                  <strong>{key}:</strong> {value}
                                </li>
                              )
                            )}
                          </ul>
                        </Card>
                      </div>
                    </AccordionItem>
                  </Accordion>
                </CardBody>
              </Card>
            </div>
          ))}
      </div>
    </div>
  );
}
