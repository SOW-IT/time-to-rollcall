import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Fragment, useState } from "react";
import Loader from "./Loader";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function DeleteConfirmation({
  description,
  isOpen,
  closeModal,
  confirm,
  updating,
  action,
  name,
}: {
  description: string;
  isOpen: boolean;
  closeModal: () => void;
  confirm: () => void;
  updating: boolean;
  action?: string;
  name?: string;
}) {
  const [deleteName, setDeleteName] = useState("");
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-hidden"
        onClose={() => {
          setDeleteName("");
          closeModal();
        }}
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
              <DialogPanel className="rounded-t-3xl bg-white p-4 shadow-xl">
                <div
                  className="absolute right-2 top-2 p-2 cursor-pointer"
                  onClick={() => {
                    setDeleteName("");
                    closeModal();
                  }}
                >
                  <XMarkIcon className="w-6 h-6 text-black" />
                </div>
                <DialogTitle
                  as="h3"
                  className="text-xl text-center font-medium leading-6 text-gray-900"
                >
                  Are you sure?
                </DialogTitle>
                <p className="mt-2 px-12 text-sm text-center text-gray-500">
                  {description}
                </p>
                {name && (
                  <div className="flex flex-col items-center w-full mt-2">
                    <p className="text-gray-500 text-sm">
                      To confirm deletion, type &quot;{name}&quot; in the box
                      below
                    </p>
                    <input
                      type="text"
                      autoFocus
                      className="text-center border-2 rounded-md border-red-500"
                      placeholder={name}
                      value={deleteName}
                      onChange={(e) => setDeleteName(e.target.value)}
                    />
                  </div>
                )}
                {updating ? (
                  <div className="flex justify-center items-center mt-16">
                    <Loader show />
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      className="inline-flex w-full mt-4 justify-center rounded-3xl border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 active:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => {
                        setDeleteName("");
                        closeModal();
                      }}
                    >
                      Go back
                    </button>
                    <button
                      type="button"
                      disabled={name ? deleteName !== name : false}
                      className="inline-flex w-full mt-4 justify-center rounded-3xl border border-transparent bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 active:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => {
                        setDeleteName("");
                        confirm();
                      }}
                    >
                      {action ?? "Delete"}
                    </button>
                  </>
                )}
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
