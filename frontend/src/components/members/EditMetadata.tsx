import {
  InitMetadataInput,
  MetadataModel,
  MetadataSelectModel,
  MetadataValueId,
} from "@/models/Metadata";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Dispatch, Fragment, SetStateAction, useState } from "react";
import Loader from "../Loader";
import DeleteConfirmation from "../event/DeleteEvent";

export default function EditMetadata({
  isOpen,
  closeModal,
  metadata,
  setMetadata,
  setDeleteMetadatas,
  submit,
  updating,
}: {
  isOpen: boolean;
  closeModal: () => void;
  metadata: MetadataModel[];
  setMetadata: Dispatch<SetStateAction<MetadataModel[] | null | undefined>>;
  setDeleteMetadatas: Dispatch<SetStateAction<MetadataModel[]>>;
  submit: () => void;
  updating: boolean;
}) {
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [deleteConfirmationIsOpen, setDeleteConfirmationIsOpen] =
    useState(false);
  const [deleteValue, setDeleteValue] = useState<MetadataValueId | null>(null);
  const [deleteValueConfirmationIsOpen, setDeleteValueConfirmationIsOpen] =
    useState(false);

  const getNextKey = (values: Record<string, string>) => {
    const maxKey = Object.keys(values).reduce(
      (max, num) => Math.max(Number(max), Number(num)).toString(),
      "1"
    );
    return (Number(maxKey) + 1).toString();
  };

  // Function to update the metadata with new values
  const updateMetadataValues = (md: MetadataSelectModel, i: number) => {
    const updatedValues = md.values
      ? { ...md.values, [getNextKey(md.values)]: "" }
      : { "1": "" };

    return [
      ...metadata.slice(0, i),
      { ...md, values: updatedValues } as MetadataModel,
      ...metadata.slice(i + 1),
    ];
  };

  return (
    <>
      <DeleteConfirmation
        description={
          (deleteIndex ? metadata[deleteIndex]?.key : "Data") +
          " will be deleted forever and all past events"
        }
        isOpen={deleteConfirmationIsOpen}
        closeModal={() => {
          setDeleteConfirmationIsOpen(false);
        }}
        confirm={() => {
          setMetadata(
            metadata.filter(
              (md) => deleteIndex && md.id !== metadata[deleteIndex].id
            )
          );
          setDeleteMetadatas((prevMD) =>
            deleteIndex ? prevMD.concat(metadata[deleteIndex]) : prevMD
          );
          setDeleteConfirmationIsOpen(false);
          setDeleteIndex(null);
        }}
        updating={false}
      />
      <DeleteConfirmation
        description={
          (deleteValue !== null && deleteIndex !== null
            ? (metadata[deleteIndex] as MetadataSelectModel).values[deleteValue]
            : "Value") + " will be deleted forever"
        }
        isOpen={deleteValueConfirmationIsOpen}
        closeModal={() => {
          setDeleteValueConfirmationIsOpen(false);
        }}
        confirm={() => {
          if (deleteIndex !== null && deleteValue !== null) {
            let deleteMetadata = metadata[deleteIndex];
            delete (deleteMetadata as MetadataSelectModel).values[deleteValue];
            setMetadata([
              ...metadata.slice(0, deleteIndex),
              deleteMetadata,
              ...metadata.slice(deleteIndex + 1),
            ]);
            setDeleteValueConfirmationIsOpen(false);
            setDeleteIndex(null);
            setDeleteValue(null);
          }
        }}
        updating={false}
      />
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-hidden"
          onClose={closeModal}
        >
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </TransitionChild>
          <div className="fixed inset-0 flex justify-center">
            <div className="fixed max-md:w-full md:w-[600px] bottom-0">
              <TransitionChild
                enter="transition ease-in-out duration-300 transform"
                enterFrom="transform translate-y-full"
                enterTo="transform translate-y-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="transform translate-y-0"
                leaveTo="transform translate-y-full"
              >
                <DialogPanel className="rounded-t-3xl bg-white pt-4 pb-0 shadow-xl">
                  <div
                    className="absolute right-2 top-2 p-2 cursor-pointer"
                    onClick={closeModal}
                  >
                    <XMarkIcon className="w-6 h-6 text-black" />
                  </div>
                  <DialogTitle
                    as="h3"
                    className="text-xl font-medium leading-6 text-gray-900 text-center mb-2"
                  >
                    Edit Metadata
                  </DialogTitle>
                  <div className="overflow-auto max-h-[70vh] pb-14 px-4">
                    {metadata.map((md, i) => (
                      <div className="my-4" key={i}>
                        <div className="flex justify-start">
                          <ArrowDownIcon
                            className="w-5 h-5 cursor-pointer"
                            onClick={() =>
                              i !== metadata.length - 1 &&
                              setMetadata((prevMD) => {
                                const updatedObjects = [...(prevMD ?? [])];

                                [updatedObjects[i], updatedObjects[i + 1]] = [
                                  updatedObjects[i + 1],
                                  updatedObjects[i],
                                ];

                                const tempId = updatedObjects[i].order;
                                updatedObjects[i].order =
                                  updatedObjects[i + 1].order;
                                updatedObjects[i + 1].order = tempId;

                                return updatedObjects;
                              })
                            }
                          />
                          <p className="text-sm text-gray-900">{i + 1}. Name</p>
                          <ArrowUpIcon
                            className="w-5 h-5 cursor-pointer"
                            onClick={() =>
                              i !== 0 &&
                              setMetadata((prevMD) => {
                                const updatedObjects = [...(prevMD ?? [])];

                                [updatedObjects[i - 1], updatedObjects[i]] = [
                                  updatedObjects[i],
                                  updatedObjects[i - 1],
                                ];

                                const tempId = updatedObjects[i - 1].order;
                                updatedObjects[i - 1].order =
                                  updatedObjects[i].order;
                                updatedObjects[i].order = tempId;

                                return updatedObjects;
                              })
                            }
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <input
                            type="text"
                            autoFocus
                            className="w-full rounded-none resize-none border-t-0 bg-transparent font-sans text-lg font-semibold text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border-blue-gray-200 focus:border-gray-900 focus:border-t-0 focus:outline-0"
                            placeholder="Notes"
                            value={md.key}
                            onChange={(e) => {
                              setMetadata([
                                ...metadata.slice(0, i),
                                {
                                  ...md,
                                  key: e.target.value,
                                },
                                ...metadata.slice(i + 1),
                              ]);
                            }}
                          />
                          <div
                            className="p-2 cursor-pointer"
                            onClick={() => {
                              if (md.id !== "placeholder") {
                                setDeleteIndex(i);
                                setDeleteConfirmationIsOpen(true);
                              }
                            }}
                          >
                            <TrashIcon
                              className={
                                "w-6 h-6 " +
                                (md.id === "placeholder"
                                  ? "text-gray-200"
                                  : "text-red-600")
                              }
                            />
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <p className="text-sm text-gray-900 font-bold">
                            Have Specific Values?
                          </p>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              id="mySwitch"
                              checked={md.type === "select"}
                              className="sr-only peer"
                              onChange={() =>
                                setMetadata([
                                  ...metadata.slice(0, i),
                                  {
                                    ...md,
                                    type:
                                      md.type === "select" ? "input" : "select",
                                  },
                                  ...metadata.slice(i + 1),
                                ])
                              }
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer-checked:bg-blue-600 transition-all duration-300"></div>
                            <div className="absolute w-5 h-5 bg-white rounded-full left-0.5 top-0.5 peer-checked:translate-x-full transition-transform duration-300"></div>
                          </label>
                        </div>
                        {md.type === "select" && (
                          <div>
                            <p className="text-sm text-gray-900">Values</p>
                            {Object.entries(
                              (md as MetadataSelectModel).values
                            ).map(([k, v], j) => (
                              <div
                                key={j}
                                className="flex w-full justify-between items-center"
                              >
                                <input
                                  key={j}
                                  type="text"
                                  autoFocus
                                  className="w-full rounded-none resize-none border-t-0 bg-transparent font-sans text-md text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border-blue-gray-200 focus:border-gray-900 focus:border-t-0 focus:outline-0"
                                  placeholder="Placeholder"
                                  value={v}
                                  onChange={(e) => {
                                    setMetadata([
                                      ...metadata.slice(0, i),
                                      {
                                        ...md,
                                        values: {
                                          ...(md as MetadataSelectModel).values,
                                          [k]: e.target.value,
                                        },
                                      } as MetadataModel,
                                      ...metadata.slice(i + 1),
                                    ]);
                                  }}
                                />
                                <div
                                  className="p-1 cursor-pointer"
                                  onClick={() => {
                                    if (md.id !== "placeholder") {
                                      setDeleteIndex(i);
                                      setDeleteValue(k);
                                      setDeleteValueConfirmationIsOpen(true);
                                    }
                                  }}
                                >
                                  <TrashIcon
                                    className={
                                      "w-5 h-5 " +
                                      (md.id === "placeholder"
                                        ? "text-gray-200"
                                        : "text-red-600")
                                    }
                                  />
                                </div>
                              </div>
                            ))}
                            <button
                              className="text-md text-gray-500 bg-gray-100"
                              onClick={() => {
                                setMetadata(
                                  updateMetadataValues(
                                    md as MetadataSelectModel,
                                    i
                                  )
                                );
                              }}
                            >
                              Add Value +
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                    <div className="flex justify-center">
                      <button
                        type="button"
                        className="rounded-3xl border-transparent border-2 bg-blue-200 px-3 py-1 mx-1 my-1 text-xs font-light text-blue-900"
                        onClick={() =>
                          setMetadata([
                            ...metadata,
                            InitMetadataInput(
                              metadata.reduce(
                                (max, obj) =>
                                  obj.order > max ? obj.order : max,
                                metadata[0].order
                              ) + 1
                            ),
                          ])
                        }
                      >
                        Create Data Point
                      </button>
                    </div>
                    <div className="flex justify-center">
                      {updating ? (
                        <div className="bottom-2 fixed flex justify-center items-center">
                          <Loader show />
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="bottom-2 fixed inline-flex mt-4 z-50 justify-center rounded-3xl border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={submit}
                        >
                          Update
                        </button>
                      )}
                    </div>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
