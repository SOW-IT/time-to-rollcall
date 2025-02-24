"use client";
import { GroupPath, Path } from "@/helper/Path";
import {
  EventContext,
  GroupContext,
  MetadataContext,
  TagsContext,
  UserContext,
} from "@/lib/context";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import {
  UserGroupIcon,
  Cog6ToothIcon,
  PencilIcon,
  ArrowLeftEndOnRectangleIcon,
  ArrowDownTrayIcon,
  PresentationChartLineIcon,
} from "@heroicons/react/24/outline";
import {
  PresentationChartLineIcon as PresentationChartLineIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  PencilIcon as PencilIconSolid,
} from "@heroicons/react/24/solid";
import GroupBadge from "./event/GroupBadge";
import { getUniversityKey, University } from "@/models/University";
import { logOut } from "@/lib/auth";
import EditEvent from "./event/EditEvent";
import { InitEvent } from "@/models/Event";
import { updateEvent, deleteEvent } from "@/lib/events";
import { GroupModel } from "@/models/Group";
import { TagModel } from "@/models/Tag";
import { updateGroup } from "@/lib/groups";
import EditGroup from "./group/EditGroup";
import { promiseToast } from "@/helper/Toast";
import DeleteConfirmation from "./DeleteConfirmation";
import { MetadataModel } from "@/models/Metadata";
import EditMetadata from "./members/EditMetadata";
import { editMetadatas } from "@/lib/metadata";
import ExportEvent from "./event/ExportEvent";
import { currentYearStr } from "@/helper/Time";

export default function Topbar({
  year,
  toggleEdit,
  setToggleEdit,
}: {
  year?: string;
  toggleEdit?: boolean;
  setToggleEdit?: (toggleEdit: boolean) => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useContext(UserContext);
  const group = useContext(GroupContext);
  const tags = useContext(TagsContext);
  const event = useContext(EventContext);
  const metadata = useContext(MetadataContext);
  const [deleteTags, setDeleteTags] = useState<TagModel[]>([]);
  const [submitEventForm, setSubmitEventForm] = useState(InitEvent);
  const [updating, setUpdating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isOpenExport, setIsOpenExport] = useState(false);

  function openExportModal() {
    setIsOpenExport(true);
  }

  function closeExportModal() {
    setIsOpenExport(false);
  }

  async function editEvent() {
    setUpdating(true);
    if (group && event) {
      await promiseToast<void>(
        updateEvent(group.id, submitEventForm),
        "Updating event...",
        "Event Updated!",
        "Could not update event."
      );
      closeModal();
    }
  }

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    if (event) setSubmitEventForm(event);
    setUpdating(false);
    setIsOpen(true);
  }

  async function deleteEventIn() {
    setUpdatingDelete(true);
    if (group && event) {
      await deleteEvent(group.id, event.id);
      router.push(Path.Group + "/" + group.id + "/" + year);
    }
    setIsOpen(false);
    setDeleteConfirmationIsOpen(false);
  }

  const [updatingDelete, setUpdatingDelete] = useState(false);
  const [deleteConfirmationIsOpen, setDeleteConfirmationIsOpen] =
    useState(false);
  const [logoutConfirmationIsOpen, setLogoutConfirmationIsOpen] =
    useState(false);
  const [submitGroupForm, setSubmitGroupForm] = useState<
    GroupModel | null | undefined
  >(null);
  const [metadatas, setMetadatas] = useState<
    MetadataModel[] | null | undefined
  >(null);
  const [deleteMetadatas, setDeleteMetadatas] = useState<MetadataModel[]>([]);

  function closeDeleteConfirmationModal() {
    openModal();
    setDeleteConfirmationIsOpen(false);
  }

  function openDeleteConfirmationModal() {
    closeModal();
    setDeleteConfirmationIsOpen(true);
    setUpdatingDelete(false);
  }

  useEffect(() => {
    if (event) setSubmitEventForm(event);
    // eslint-disable-next-line
  }, [event]);
  const [submitTagsForm, setSubmitTagsForm] = useState<
    TagModel[] | null | undefined
  >(null);

  async function editGroup() {
    setUpdating(true);
    if (submitGroupForm) {
      await promiseToast<void>(
        updateGroup(submitGroupForm, submitTagsForm, deleteTags),
        "Updating Group...",
        "Group Updated!",
        "Could not update group."
      );
    }
    setDeleteTags([]);
    setUpdating(false);
    closeModal();
  }

  async function editMetadata() {
    setUpdating(true);
    if (group && metadatas) {
      await promiseToast<void>(
        editMetadatas(group.id, metadatas, deleteMetadatas),
        "Updating Metadata...",
        "Metadata Updated!",
        "Could not update group."
      );
    }
    setDeleteMetadatas([]);
    closeModal();
  }

  function openGroupModal() {
    if (group) setSubmitGroupForm(group);
    if (tags) setSubmitTagsForm(tags);
    setIsOpen(true);
  }

  function openMetadataModal() {
    setUpdating(false);
    if (metadata) setMetadatas(metadata);
    setIsOpen(true);
  }

  useEffect(() => {
    if (group !== null && tags !== null && metadata !== null) {
      setSubmitGroupForm(group);
      setSubmitTagsForm(tags);
      setMetadatas(metadata);
    }
    // eslint-disable-next-line
  }, [group, tags, metadata]);

  const disabled = currentYearStr !== year;

  return (
    <div>
      <nav className="bg-white flex items-center fixed justify-between px-4 py-4 w-full z-40 top-0">
        {!disabled && event && group && tags !== null && (
          <EditEvent
            groupId={group.id}
            tags={tags}
            isOpen={isOpen}
            closeModal={closeModal}
            submitEventForm={submitEventForm}
            setSubmitEventForm={setSubmitEventForm}
            submitEvent={editEvent}
            deleteConfirmationIsOpen={deleteConfirmationIsOpen}
            openDeleteConfirmationModal={openDeleteConfirmationModal}
            closeDeleteConfirmationModal={closeDeleteConfirmationModal}
            deleteEvent={deleteEventIn}
            updatingDelete={updatingDelete}
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
            updating={updating}
          />
        )}
        {!disabled &&
          submitGroupForm &&
          submitTagsForm !== null &&
          (pathname ===
            Path.Group + "/" + group?.id + "/" + year + GroupPath.Metrics ||
            pathname === Path.Group + "/" + group?.id + "/" + year) && (
            <EditGroup
              isOpen={isOpen}
              closeModal={closeModal}
              group={submitGroupForm}
              setGroup={setSubmitGroupForm}
              tags={submitTagsForm}
              setTags={setSubmitTagsForm}
              setDeleteTags={setDeleteTags}
              submit={editGroup}
              updating={updating}
            />
          )}
        {!disabled &&
          metadatas &&
          pathname ===
            Path.Group + "/" + group?.id + "/" + year + GroupPath.Members && (
            <EditMetadata
              isOpen={isOpen}
              closeModal={closeModal}
              metadata={metadatas}
              setMetadata={setMetadatas}
              setDeleteMetadatas={setDeleteMetadatas}
              submit={editMetadata}
              updating={updating}
            />
          )}
        {group ? (
          getUniversityKey(group.name as University) ? (
            <Link
              href={
                pathname === Path.Group + "/" + group.id + "/" + year
                  ? Path.Group
                  : Path.Group + "/" + group.id + "/" + year
              }
            >
              <GroupBadge
                campus={group.name as University}
                className="px-4 text-base"
              />
            </Link>
          ) : (
            <Link
              href={
                pathname === Path.Group + "/" + group.id + "/" + year
                  ? Path.Group
                  : Path.Group + "/" + group.id + "/" + year
              }
              className="bg-gray-500 rounded-full py-1 px-4 text-white font-light text-center hover:bg-black active:bg-black"
            >
              {group.name}
            </Link>
          )
        ) : user ? (
          <div>Hi {user.displayName}</div>
        ) : (
          <div />
        )}
        {year && disabled && (
          <button
            className="rounded-lg bg-gray-200 p-1 px-2 font-bold hover:bg-gray-400 active:bg-gray-400"
            onClick={() =>
              router.push(`${Path.Group}/${group?.id}/${currentYearStr}`)
            }
          >
            {year}
          </button>
        )}
        {!disabled && (
          <p className="rounded-lg bg-gray-200 p-1 px-2 font-bold">{year}</p>
        )}
        {event ? (
          <div className="flex items-center gap-4 justify-end">
            <ExportEvent
              event={event}
              isOpen={isOpenExport}
              closeModal={closeExportModal}
            />
            <ArrowDownTrayIcon
              className="cursor-pointer w-7 h-7 text-gray-500 hover:text-black active:text-black"
              onClick={openExportModal}
            />
            {!disabled && setToggleEdit && (
              <>
                {toggleEdit ? (
                  <PencilIconSolid
                    className="cursor-pointer w-7 h-7 text-gray-500 hover:text-black active:text-black"
                    onClick={() => !disabled && setToggleEdit(!toggleEdit)}
                  />
                ) : (
                  <PencilIcon
                    className="cursor-pointer w-7 h-7 text-gray-500 hover:text-black active:text-black"
                    onClick={() => !disabled && setToggleEdit(!toggleEdit)}
                  />
                )}
              </>
            )}
            {!disabled && (
              <Cog6ToothIcon
                className="cursor-pointer w-7 h-7 text-gray-500 hover:text-black active:text-black"
                onClick={openModal}
              />
            )}
          </div>
        ) : group ? (
          <div className="flex items-center justify-end gap-4">
            {pathname ===
            Path.Group + "/" + group.id + "/" + year + GroupPath.Metrics ? (
              <PresentationChartLineIconSolid
                className="cursor-pointer w-7 h-7 text-gray-500 hover:text-black active:text-black"
                onClick={() =>
                  router.push(Path.Group + "/" + group.id + "/" + year)
                }
              />
            ) : (
              <PresentationChartLineIcon
                className="cursor-pointer w-7 h-7 text-gray-500 hover:text-black active:text-black"
                onClick={() =>
                  router.push(
                    Path.Group + "/" + group.id + "/" + year + GroupPath.Metrics
                  )
                }
              />
            )}
            {pathname ===
            Path.Group + "/" + group.id + "/" + year + GroupPath.Members ? (
              <UserGroupIconSolid
                className="cursor-pointer w-7 h-7 text-gray-500 hover:text-black active:text-black"
                onClick={() =>
                  router.push(Path.Group + "/" + group.id + "/" + year)
                }
              />
            ) : (
              <UserGroupIcon
                className="cursor-pointer w-7 h-7 text-gray-500 hover:text-black active:text-black"
                onClick={() =>
                  router.push(
                    Path.Group + "/" + group.id + "/" + year + GroupPath.Members
                  )
                }
              />
            )}
            {!disabled && (
              <Cog6ToothIcon
                className="cursor-pointer w-7 h-7 text-gray-500 hover:text-black active:text-black"
                onClick={
                  pathname ===
                  Path.Group + "/" + group.id + "/" + year + GroupPath.Members
                    ? openMetadataModal
                    : openGroupModal
                }
              />
            )}
          </div>
        ) : user && pathname === Path.Group ? (
          <div className="flex items-center justify-end gap-4">
            <DeleteConfirmation
              description="You will be logged out"
              action="Log out"
              isOpen={logoutConfirmationIsOpen}
              closeModal={() => setLogoutConfirmationIsOpen(false)}
              confirm={logOut}
              updating={false}
            />
            <ArrowLeftEndOnRectangleIcon
              className="cursor-pointer w-7 h-7 text-gray-500 hover:text-black active:text-black"
              onClick={() => setLogoutConfirmationIsOpen(true)}
            />
          </div>
        ) : (
          <></>
        )}
      </nav>
    </div>
  );
}
