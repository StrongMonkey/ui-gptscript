import { Input } from '@nextui-org/input';
import { Button, Textarea } from '@nextui-org/react';

interface FinishProps {
  onClickFinish: () => void;
  name: string;
  setName: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
}

export default function FinishStep({
  name,
  setName,
  description,
  setDescription,
  onClickFinish,
}: FinishProps) {
  const onNameChange = (event: any) => {
    setName(event.target.value);
  };

  const onDescriptionChange = (event: any) => {
    setDescription(event.target.value);
  };

  return (
    <div className="w-full px-20 mb-10 overflow-y-scroll mx-auto pt-10">
      <div className="space-y-12">
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-gray-900/10 pb-12 md:grid-cols-3">
          <div>
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              Name and Description
            </h2>
          </div>

          <div className="max-w-2xl space-y-8 md:col-span-2">
            <div>
              <Input
                type="string"
                label={'Name'}
                onChange={onNameChange}
                value={name}
                description={'Give a name to your knowledge'}
                className="max-w-lg mt-2"
              />
              <Textarea
                type="string"
                label={'Description'}
                onChange={onDescriptionChange}
                value={description}
                description={
                  "Give a description on how to use your knowledge, for example: 'This is a knowledge about my company's insurance policy'"
                }
                className="max-w-lg mt-2"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        <Button color="primary" onClick={onClickFinish}>
          Save
        </Button>
      </div>
    </div>
  );
}
