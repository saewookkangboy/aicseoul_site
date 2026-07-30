"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
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
          className="inline-flex min-h-10 min-w-10 cursor-grab items-center justify-center rounded-md p-1 text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-cream)] hover:text-[var(--color-ink)] active:cursor-grabbing outline-none focus-visible:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-gold)_28%,transparent)]"
          aria-label={`${member.nameKr} 순서 변경`}
          {...attributes}
          {...listeners}
        >
          <DotsSixVertical className="size-5" weight="bold" aria-hidden />
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
          className="inline-flex min-h-10 items-center text-sm font-medium text-[var(--color-cta)] outline-none focus-visible:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-gold)_28%,transparent)]"
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
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

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
      <p className="mb-2 min-h-[1rem] text-xs text-[var(--color-ink-muted)]" role="status">
        {pending ? "순서 저장 중…" : "\u00a0"}
      </p>
      <div className={tableWrapClass}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={`${thClass} w-10`}>
                  <span className="sr-only">순서</span>
                </th>
                <th className={thClass}>이름</th>
                <th className={thClass}>소개</th>
                <th className={thClass}>상태</th>
                <th className={thClass}>
                  <span className="sr-only">작업</span>
                </th>
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
