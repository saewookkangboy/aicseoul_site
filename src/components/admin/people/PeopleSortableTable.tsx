"use client";

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DotsSixVertical } from "@phosphor-icons/react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { reorderMembersAction } from "@/lib/actions/cms";
import {
  AdminBadge,
  tableClass,
  tableWrapClass,
  tdClass,
  thClass,
} from "@/components/admin/ui";

type MemberRow = {
  id: string;
  nameKr: string;
  nameEn: string;
  bio: string;
  isVisible: boolean;
  photoUrl: string | null;
};

function SortableRow({ member }: { member: MemberRow }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: member.id });

  return (
    <tr
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <td className={`${tdClass} w-10`}>
        <button
          type="button"
          className="cursor-grab rounded-md p-1 text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-cream)] hover:text-[var(--color-ink)] active:cursor-grabbing"
          aria-label="순서 변경"
          {...attributes}
          {...listeners}
        >
          <DotsSixVertical className="size-5" weight="bold" />
        </button>
      </td>
      <td className={tdClass}>
        <div className="font-medium">{member.nameKr}</div>
        <div className="text-xs text-[var(--color-ink-muted)]">
          {member.nameEn}
        </div>
      </td>
      <td className={`${tdClass} max-w-[28ch] text-[var(--color-ink-muted)]`}>
        {member.bio}
      </td>
      <td className={tdClass}>
        <AdminBadge tone={member.isVisible ? "success" : "neutral"}>
          {member.isVisible ? "노출" : "숨김"}
        </AdminBadge>
      </td>
      <td className={tdClass}>
        <Link
          href={`/admin/people/${member.id}/edit`}
          className="text-sm font-medium text-[var(--color-cta)]"
        >
          편집
        </Link>
      </td>
    </tr>
  );
}

export function PeopleSortableTable({ members }: { members: MemberRow[] }) {
  const [items, setItems] = useState(members);
  const [pending, start] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor));

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);
    start(async () => {
      await reorderMembersAction(next.map((m) => m.id));
    });
  }

  return (
    <div>
      {pending ? (
        <p className="mb-2 text-xs text-[var(--color-ink-muted)]">
          순서 저장 중…
        </p>
      ) : null}
      <div className={tableWrapClass}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={`${thClass} w-10`} />
                <th className={thClass}>이름</th>
                <th className={thClass}>소개</th>
                <th className={thClass}>상태</th>
                <th className={thClass}> </th>
              </tr>
            </thead>
            <SortableContext
              items={items.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              <tbody>
                {items.map((m) => (
                  <SortableRow key={m.id} member={m} />
                ))}
              </tbody>
            </SortableContext>
          </table>
        </DndContext>
      </div>
    </div>
  );
}
