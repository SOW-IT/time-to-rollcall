import { downloadEventsToExcel } from "@/lib/excel";
import { TagModel } from "@/models/Tag";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Fragment, useContext, useEffect, useState } from "react";
import Tag from "../event/Tag";
import Loader from "../Loader";
import { MetadataContext } from "@/lib/context";
import { promiseToast } from "@/helper/Toast";
import { MetadataInputModel, MetadataSelectModel } from "@/models/Metadata";
import { GroupId } from "@/models/Group";

export default function Export({
  groupId,
  isOpen,
  closeModal,
  tags,
}: {
  groupId: GroupId;
  isOpen: boolean;
  closeModal: () => void;
  tags?: TagModel[];
}) {
  const metadata = useContext(MetadataContext);
  const [exportTags, setExportTags] = useState<TagModel[]>([]);
  const [exportMetadata, setExportMetadata] = useState<
    (MetadataInputModel | MetadataSelectModel)[]
  >([]);
  const [updating, setUpdating] = useState<boolean>(false);

  useEffect(() => {
    if (metadata) {
      setExportMetadata(metadata);
    }
  }, [metadata]);
  return (
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
              <DialogPanel className="rounded-t-3xl bg-white pt-4 pb-0 shadow-xl w-full">
                <div
                  className="absolute right-2 top-2 p-2 cursor-pointer"
                  onClick={closeModal}
                >
                  <XMarkIcon className="w-6 h-6 text-gray-600 hover:text-black active:text-black" />
                </div>
                <DialogTitle
                  as="h3"
                  className="text-xl font-medium leading-6 text-gray-900 text-center"
                >
                  Export data
                </DialogTitle>
                <div className="overflow-auto max-h-[70vh] pb-14 px-4">
                  <p className="my-2 text-xs font-light text-gray-400">
                    Select Event tags to export
                  </p>
                  <div className="flex flex-wrap max-h-32 overflow-auto">
                    {tags?.map((t, i) => (
                      <Tag
                        key={i}
                        tag={t}
                        selected={exportTags.map((t) => t.id).includes(t.id)}
                        onClick={() =>
                          setExportTags(
                            exportTags.map((t) => t.id).includes(t.id)
                              ? exportTags
                                  .slice(
                                    0,
                                    exportTags.map((t) => t.id).indexOf(t.id)
                                  )
                                  .concat(
                                    exportTags.slice(
                                      exportTags
                                        .map((t) => t.id)
                                        .indexOf(t.id) + 1
                                    )
                                  )
                              : exportTags.concat(t)
                          )
                        }
                      />
                    ))}
                  </div>
                  <p className="my-2 text-xs font-light text-gray-400">
                    Select fields to export
                  </p>
                  <div className="flex flex-col max-h-72 scroll-mt-4 gap-0.5 overflow-auto">
                    <div
                      className={`flex items-center justify-start gap-6 px-2 py-3 rounded-xl bg-gray-100`}
                    >
                      <input
                        defaultChecked
                        disabled
                        type="checkbox"
                        className="w-4 h-4"
                      />
                      <label className="text-slate-800 font-medium text-[15px]">
                        Sign In Time
                      </label>
                    </div>
                    <div
                      className={`flex items-center justify-start gap-6 px-2 py-3 rounded-xl bg-gray-100`}
                    >
                      <input
                        defaultChecked
                        disabled
                        type="checkbox"
                        className="w-4 h-4"
                      />
                      <label className="text-slate-800 font-medium text-[15px]">
                        Name
                      </label>
                    </div>
                    <div
                      className={`flex items-center justify-start gap-6 px-2 py-3 rounded-xl bg-gray-100`}
                    >
                      <input
                        defaultChecked
                        disabled
                        type="checkbox"
                        className="w-4 h-4"
                      />
                      <label className="text-slate-800 font-medium text-[15px]">
                        Email
                      </label>
                    </div>
                    {/* <div
                      className={`flex items-center justify-start gap-6 px-2 py-3 rounded-xl bg-gray-100`}
                    >
                      <input
                        defaultChecked
                        disabled
                        type="checkbox"
                        className="w-4 h-4"
                      />
                      <label className="text-slate-800 font-medium text-[15px]">
                        Notes
                      </label>
                    </div> */}
                    {metadata?.map((md, i) => (
                      <div
                        key={i}
                        onClick={() =>
                          setExportMetadata(
                            exportMetadata.map((emd) => emd.id).includes(md.id)
                              ? exportMetadata
                                  .slice(
                                    0,
                                    exportMetadata
                                      .map((emd) => emd.id)
                                      .indexOf(md.id)
                                  )
                                  .concat(
                                    exportMetadata.slice(
                                      exportMetadata
                                        .map((emd) => emd.id)
                                        .indexOf(md.id) + 1
                                    )
                                  )
                              : exportMetadata.concat(md)
                          )
                        }
                        className={`flex cursor-pointer items-center justify-start gap-6 px-2 py-3 rounded-xl ${
                          exportMetadata.map((emd) => emd.id).includes(md.id)
                            ? "bg-gray-100"
                            : ""
                        }`}
                      >
                        <input
                          checked={exportMetadata
                            .map((emd) => emd.id)
                            .includes(md.id)}
                          onChange={() => {}}
                          type="checkbox"
                          className="w-4 h-4"
                        />
                        <label className="text-slate-800 font-medium text-[15px]">
                          {md.key}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                {updating ? (
                  <div className="flex justify-center bottom-2 w-full absolute z-50">
                    <Loader show />
                  </div>
                ) : (
                  <div className="flex justify-center bottom-2 w-full absolute z-50">
                    <button
                      type="button"
                      className="mt-4 rounded-3xl border border-transparent bg-black px-4 py-2 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={async () => {
                        if (exportMetadata !== null) {
                          setUpdating(true);
                          await promiseToast<void>(
                            downloadEventsToExcel(
                              groupId,
                              exportTags,
                              exportMetadata
                            ),
                            "Exporting...",
                            "Events Exported!",
                            "Could not export events."
                          );
                          closeModal();
                          setUpdating(false);
                        }
                      }}
                    >
                      Export
                    </button>
                  </div>
                )}
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
