import Link from "next/link";

export default function LocaleNotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col justify-center gap-4 px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">페이지를 찾을 수 없습니다</h1>
      <p className="text-sm opacity-70">요청한 주소가 없거나 이동되었습니다.</p>
      <Link href="/ko" className="text-sm underline underline-offset-4">
        홈으로 돌아가기
      </Link>
    </div>
  );
}
