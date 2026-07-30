"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import type { FaceDetector } from "@mediapipe/tasks-vision";
import { getCroppedImageBlob } from "@/lib/media/crop-image";
import { computeFaceCenteredCrop } from "@/lib/media/face-crop";
import {
  btnPrimaryClass,
  btnSecondaryClass,
  errorTextClass,
} from "@/components/admin/ui";

const MEDIAPIPE_ESM =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.0/+esm";
const WASM_CDN =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.0/wasm";
const FACE_MODEL =
  "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite";

type VisionApi = {
  FaceDetector: {
    createFromOptions: (
      fileset: unknown,
      options: {
        baseOptions: {
          modelAssetPath: string;
          delegate: "GPU" | "CPU";
        };
        runningMode: "IMAGE";
      },
    ) => Promise<FaceDetector>;
  };
  FilesetResolver: {
    forVisionTasks: (path: string) => Promise<unknown>;
  };
};

/**
 * Load MediaPipe via CDN with an opaque dynamic import so Turbopack/webpack
 * do not analyze the package's internal `import(url)` (build would fail with
 * "Module not found: Can't resolve <dynamic>").
 */
function loadVisionApi(): Promise<VisionApi> {
  const run = new Function(
    `return import(${JSON.stringify(MEDIAPIPE_ESM)})`,
  ) as () => Promise<VisionApi>;
  return run();
}

type Props = {
  file: File;
  open: boolean;
  onCancel: () => void;
  onCropped: (blob: Blob) => void;
};

let detectorPromise: Promise<FaceDetector> | null = null;

function getFaceDetector() {
  if (!detectorPromise) {
    detectorPromise = (async () => {
      const { FaceDetector, FilesetResolver } = await loadVisionApi();
      const vision = await FilesetResolver.forVisionTasks(WASM_CDN);
      try {
        return await FaceDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: FACE_MODEL,
            delegate: "GPU",
          },
          runningMode: "IMAGE",
        });
      } catch {
        return FaceDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: FACE_MODEL,
            delegate: "CPU",
          },
          runningMode: "IMAGE",
        });
      }
    })();
  }
  return detectorPromise;
}

export function FaceCropModal({ file, open, onCancel, onCropped }: Props) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [initialPixels, setInitialPixels] = useState<Area | null>(null);
  const [faceHint, setFaceHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!open) return;
    const url = URL.createObjectURL(file);
    setImageSrc(url);
    setReady(false);
    setError(null);
    setFaceHint(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setInitialPixels(null);

    let cancelled = false;

    (async () => {
      try {
        const img = await loadHtmlImage(url);
        if (cancelled) return;

        let faceRect = null as
          | { x: number; y: number; width: number; height: number }
          | null;

        try {
          const detector = await getFaceDetector();
          if (cancelled) return;
          const result = detector.detect(img);
          const box = result.detections[0]?.boundingBox;
          if (box) {
            faceRect = {
              x: box.originX,
              y: box.originY,
              width: box.width,
              height: box.height,
            };
          } else {
            setFaceHint(
              "얼굴을 찾지 못했습니다. 중앙 기준으로 조정해 주세요.",
            );
          }
        } catch {
          setFaceHint(
            "얼굴 자동 정렬을 사용할 수 없습니다. 직접 위치를 맞춰 주세요.",
          );
        }

        const pixels = computeFaceCenteredCrop(
          { width: img.naturalWidth, height: img.naturalHeight },
          faceRect,
        );
        if (cancelled) return;
        setInitialPixels(pixels);
        setCroppedAreaPixels(pixels);
        setReady(true);
      } catch {
        if (!cancelled) setError("이미지를 불러오지 못했습니다.");
      }
    })();

    return () => {
      cancelled = true;
      URL.revokeObjectURL(url);
    };
  }, [file, open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  async function applyCrop() {
    if (!imageSrc || !croppedAreaPixels) return;
    setBusy(true);
    setError(null);
    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels, 0.92);
      onCropped(blob);
    } catch (err) {
      setError(err instanceof Error ? err.message : "크롭에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 m-auto w-[min(100%,28rem)] max-h-[90vh] rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] p-0 text-[var(--color-ink)] shadow-[var(--shadow-soft)] open:flex open:flex-col backdrop:bg-black/50"
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      onClose={onCancel}
    >
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
        <h2 id={titleId} className="text-sm font-semibold">
          사진 크롭 (3:4)
        </h2>
        <button
          type="button"
          className="text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
          onClick={onCancel}
        >
          닫기
        </button>
      </div>

      <div className="relative aspect-[3/4] w-full bg-[var(--color-cream)]">
        {imageSrc && ready ? (
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={3 / 4}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            initialCroppedAreaPixels={initialPixels ?? undefined}
            showGrid={false}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-[var(--color-ink-muted)]">
            {error ? "오류" : "얼굴 위치 분석 중…"}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 px-4 py-3">
        <label className="flex flex-col gap-1 text-xs text-[var(--color-ink-muted)]">
          확대
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            disabled={!ready || busy}
          />
        </label>
        {faceHint ? (
          <p className="text-xs text-[var(--color-ink-muted)]" role="status">
            {faceHint}
          </p>
        ) : null}
        {error ? (
          <p className={`text-xs ${errorTextClass}`} role="alert">
            {error}
          </p>
        ) : null}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className={btnSecondaryClass}
            onClick={onCancel}
            disabled={busy}
          >
            취소
          </button>
          <button
            type="button"
            className={btnPrimaryClass}
            onClick={applyCrop}
            disabled={!ready || !croppedAreaPixels || busy}
          >
            {busy ? "적용 중…" : "적용"}
          </button>
        </div>
      </div>
    </dialog>
  );
}

function loadHtmlImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("load failed"));
    img.src = src;
  });
}
