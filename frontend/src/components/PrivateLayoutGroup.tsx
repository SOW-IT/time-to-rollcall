"use client";
import { currentSOWYearStr, currentYearStr } from "@/helper/Time";
import {
  EventsContext,
  GroupContext,
  MembersContext,
  MetadataContext,
  TagsContext,
  UserContext,
} from "@/lib/context";
import {
  useEventsListener,
  useGroupListener,
  useMembersListener,
  useMetadataListener,
  useTagsListener,
} from "@/lib/hooks";
import { GroupId } from "@/models/Group";
import { useSearchParams } from "next/navigation";
import React, { useContext } from "react";

export default function PrivateLayoutGroup({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { groupId: GroupId; year: string };
}) {
  const groupId = useSearchParams().get("fromGroupId");
  const user = useContext(UserContext);
  const group = useGroupListener(user, groupId ?? params.groupId);
  const members = useMembersListener(
    user,
    params.year === currentYearStr ? currentSOWYearStr : params.year,
    groupId ?? params.groupId
  );
  const metadata = useMetadataListener(user, groupId ?? params.groupId);
  const events = useEventsListener(
    user,
    params.year,
    groupId ?? params.groupId
  );
  const tags = useTagsListener(user, groupId ?? params.groupId);
  return (
    <GroupContext.Provider value={group}>
      <MembersContext.Provider value={members}>
        <MetadataContext.Provider value={metadata}>
          <EventsContext.Provider value={events}>
            <TagsContext.Provider value={tags}>{children}</TagsContext.Provider>
          </EventsContext.Provider>
        </MetadataContext.Provider>
      </MembersContext.Provider>
    </GroupContext.Provider>
  );
}
