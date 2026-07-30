"use client";

import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { isInsightBodyEmpty } from "@/lib/insights/body-empty";

type Props = {
  name: string;
  initialHtml?: string;
  required?: boolean;
  onHtmlChange?: (html: string) => void;
};

function ToolbarButton({
  onClick,
  active,
  children,
  label,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`rounded px-2 py-1 text-xs transition-colors ${
        active
          ? "bg-[var(--color-ink)] !text-white"
          : "text-[var(--color-ink-muted)] hover:bg-[var(--color-border)] hover:text-[var(--color-ink)]"
      }`}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({
  name,
  initialHtml = "",
  required,
  onHtmlChange,
}: Props) {
  const [html, setHtml] = useState(initialHtml || "");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      Placeholder.configure({
        placeholder: "본문을 작성하세요…",
      }),
    ],
    content: initialHtml || "<p></p>",
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => {
      const next = ed.getHTML();
      setHtml(next);
      onHtmlChange?.(next);
    },
    editorProps: {
      attributes: {
        class:
          "prose-aic min-h-[280px] max-w-none px-3 py-3 text-sm leading-relaxed outline-none focus:outline-none",
      },
    },
  });

  const isEmpty = isInsightBodyEmpty(html);

  const setLink = () => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("링크 URL", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="overflow-hidden rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)]">
      <input
        type="hidden"
        name={name}
        value={isEmpty ? "" : html}
        required={required}
      />
      <div className="flex flex-wrap items-center gap-0.5 border-b border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1.5">
        <ToolbarButton
          label="굵게"
          active={editor?.isActive("bold")}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton
          label="기울임"
          active={editor?.isActive("italic")}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton
          label="제목 2"
          active={editor?.isActive("heading", { level: 2 })}
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          label="제목 3"
          active={editor?.isActive("heading", { level: 3 })}
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          H3
        </ToolbarButton>
        <ToolbarButton
          label="글머리 목록"
          active={editor?.isActive("bulletList")}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          • 목록
        </ToolbarButton>
        <ToolbarButton
          label="번호 목록"
          active={editor?.isActive("orderedList")}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        >
          1. 목록
        </ToolbarButton>
        <ToolbarButton
          label="인용"
          active={editor?.isActive("blockquote")}
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
        >
          “ ”
        </ToolbarButton>
        <ToolbarButton
          label="링크"
          active={editor?.isActive("link")}
          onClick={setLink}
        >
          링크
        </ToolbarButton>
        <ToolbarButton
          label="구분선"
          onClick={() => editor?.chain().focus().setHorizontalRule().run()}
        >
          ―
        </ToolbarButton>
        <ToolbarButton
          label="실행 취소"
          onClick={() => editor?.chain().focus().undo().run()}
        >
          ↶
        </ToolbarButton>
        <ToolbarButton
          label="다시 실행"
          onClick={() => editor?.chain().focus().redo().run()}
        >
          ↷
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
