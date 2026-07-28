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
import Link from "next/link";
import { useState, useTransition } from "react";
import { reorderMembersAction } from "@/lib/actions/cms";

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
      className="border-b border-[var(--color-border)]"
    >
      <td className="py-3 pr-2">
        <button
          type="button"
          className="cursor-grab px-2 text-[var(--color-ink-muted)]"
          {...attributes}
          {...listeners}
        >
          ⋮⋮
        </button>
      </td>
      <td className="py-3 pr-4">
        <div className="font-medium">{member.nameKr}</div>
        <div className="text-xs text-[var(--color-ink-muted)]">{member.nameEn}</div>
      </td>
      <td className="py-3 pr-4 text-sm text-[var(--color-ink-muted)]">
        {member.bio}
      </td>
      <td className="py-3 pr-4 text-sm">
        {member.isVisible ? "노출" : "숨김"}
      </td>
      <td className="py-3">
        <Link
          href={`/admin/people/${member.id}/edit`}
          className="text-sm text-[var(--color-cta)] underline"
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
        <p className="mb-2 text-xs text-[var(--color-ink-muted)]">순서 저장 중…</p>
      ) : null}
      <div className="overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[var(--color-ink-muted)]">
                <th className="py-2 w-10" />
                <th className="py-2">이름</th>
                <th className="py-2">소개</th>
                <th className="py-2">상태</th>
                <th className="py-2"> </th>
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
