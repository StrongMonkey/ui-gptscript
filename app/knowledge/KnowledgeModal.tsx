'use client';

import {
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
  Button,
  Link,
  Divider,
  Accordion,
  AccordionItem,
} from '@nextui-org/react';
import { GoPaperAirplane } from 'react-icons/go';
import { useCallback, useState } from 'react';
import { TbListDetails } from 'react-icons/tb';
import { LiaExpandArrowsAltSolid } from 'react-icons/lia';
import { deleteKnowledgeBase } from '@/actions/knowledge/knowledge';
import { BiTrash } from 'react-icons/bi';
import { KnowledgeBase } from '@/types/knowledge';
import { GiBrain } from 'react-icons/gi';
import { FaCheckCircle } from 'react-icons/fa';

interface KnowledgeModalProps {
  knowledge: KnowledgeBase;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const KnowledgeModal = ({ knowledge, open, setOpen }: KnowledgeModalProps) => {
  const [expanded, setExpanded] = useState(false);

  const handleDelete = useCallback(
    (knowledge: KnowledgeBase) => {
      deleteKnowledgeBase(knowledge.id).catch((error) => {
        console.log(error);
      });
      setOpen(false);
    },
    [setOpen]
  );

  return (
    <Modal
      id="script-modal"
      isOpen={open}
      scrollBehavior="inside"
      classNames={{
        base: expanded
          ? 'w-[95%] max-w-none h-[95%] max-h-none'
          : 'max-w-none w-[40%] h-4/6',
      }}
      onClose={() => {
        setOpen(false);
        setTimeout(() => setExpanded(false), 300);
      }}
    >
      <ModalContent>
        <ModalHeader className="block mt-8">
          <Button
            className="absolute top-1 right-8"
            size="sm"
            variant="light"
            isIconOnly
            radius="full"
            onClick={() => setExpanded(!expanded)}
            startContent={<LiaExpandArrowsAltSolid />}
          />
          <div className="mb-4 mt-4 flex items-center justify-between">
            <div className="flex items-center">
              <GiBrain className="text-4xl mr-4" aria-hidden="true" />
              <h1 className="text-4xl truncate mb-2">{knowledge.name}</h1>
            </div>
          </div>
          <Divider className="mt-4" />
        </ModalHeader>
        <ModalBody className="overflow-y-scroll flex-col">
          <div className="px-2">
            <p>{knowledge.description}</p>
          </div>
          <Accordion aria-label="details" fullWidth>
            <AccordionItem
              key="config"
              title="Ingestion Config"
              startContent={<TbListDetails />}
            >
              <div className="h-full">
                <pre className="h-full p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 text-black dark:text-white dark:border-zinc-800 border-1 text-xs whitespace-pre-wrap">
                  {knowledge.config}
                </pre>
              </div>
            </AccordionItem>
          </Accordion>
        </ModalBody>
        <ModalFooter className="flex justify-between space-x-2">
          <Button
            as={Link}
            href={`/knowledge/query/${knowledge.id}`}
            color="primary"
            className="w-full"
            startContent={<GoPaperAirplane />}
          >
            Query
          </Button>
          <Button
            color="primary"
            className="w-full"
            startContent={<BiTrash />}
            onClick={() => handleDelete(knowledge)}
          >
            Delete
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default KnowledgeModal;
