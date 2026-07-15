"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./media-tool-workbench.module.css";

export type MediaToolMode =
  | "video_downloader"
  | "video_converter"
  | "video_compressor"
  | "video_trimmer";

interface Props {
  locale: string;
  maxDownloadMb?: number;
  maxFileSizeMb?: number;
  mode: MediaToolMode;
  toolTitle: string;
}

interface FFmpegProgressEvent {
  progress: number;
  time: number;
}

interface FFmpegInstance {
  load(config: {
    coreURL: string;
    wasmURL: string;
  }): Promise<boolean>;
  writeFile(path: string, data: Uint8Array): Promise<void>;
  exec(args: string[]): Promise<number>;
  readFile(path: string): Promise<Uint8Array | string>;
  deleteFile(path: string): Promise<void>;
  on(
    event: "progress",
    callback: (event: FFmpegProgressEvent) => void,
  ): void;
  terminate(): void;
}

interface FFmpegUtilApi {
  fetchFile(source: File | Blob | string): Promise<Uint8Array>;
  toBlobURL(url: string, mimeType: string): Promise<string>;
}

declare global {
  interface Window {
    FFmpegWASM?: {
      FFmpeg: new () => FFmpegInstance;
    };
    FFmpegUtil?: FFmpegUtilApi;
  }
}

const FFMPEG_SCRIPT =
  "https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.15/dist/umd/ffmpeg.js";
const FFMPEG_UTIL_SCRIPT =
  "https://cdn.jsdelivr.net/npm/@ffmpeg/util@0.12.2/dist/umd/index.js";
const FFMPEG_CORE_BASE =
  "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd";

const scriptLoads = new Map<string, Promise<void>>();

function loadScript(src: string, isReady: () => boolean): Promise<void> {
  if (isReady()) return Promise.resolve();

  const existing = scriptLoads.get(src);
  if (existing) return existing;

  const promise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = () => {
      if (isReady()) resolve();
      else reject(new Error("MEDIA_ENGINE_LOAD_FAILED"));
    };
    script.onerror = () => reject(new Error("MEDIA_ENGINE_LOAD_FAILED"));
    document.head.appendChild(script);
  });

  scriptLoads.set(src, promise);
  void promise.catch(() => scriptLoads.delete(src));
  return promise;
}

function safeFileName(value: string, fallback: string): string {
  const cleaned = value
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);

  return cleaned || fallback;
}

function extensionFromUrl(url: URL): string {
  const last = url.pathname.split("/").filter(Boolean).pop() ?? "";
  const extension = last.includes(".") ? last.split(".").pop() ?? "" : "";
  return /^[a-z0-9]{2,5}$/i.test(extension) ? extension.toLowerCase() : "mp4";
}

function validHttpUrl(value: string): URL | null {
  try {
    const parsed = new URL(value);
    return ["http:", "https:"].includes(parsed.protocol) ? parsed : null;
  } catch {
    return null;
  }
}

function contentDispositionName(value: string | null): string {
  if (!value) return "";

  const utf8 = value.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  if (utf8) {
    try {
      return decodeURIComponent(utf8.replace(/["']/g, ""));
    } catch {
      return utf8.replace(/["']/g, "");
    }
  }

  return value.match(/filename="?([^";]+)"?/i)?.[1] ?? "";
}

function formatBytes(value: number, locale: string): string {
  if (!Number.isFinite(value) || value <= 0) return "0 MB";
  const mb = value / (1024 * 1024);
  return `${new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US", {
    maximumFractionDigits: mb >= 100 ? 0 : 1,
  }).format(mb)} MB`;
}

function triggerDownload(url: string, fileName: string): void {
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

const copy = {
  ar: {
    privateBadge: "المعالجة محليًا داخل جهازك",
    downloaderIntro:
      "ألصق رابطًا مباشرًا لملف فيديو تملكه أو لديك تصريح بتنزيله. لا تدعم الأداة تجاوز حماية المنصات أو DRM.",
    mediaIntro:
      "اختر فيديو من جهازك. تتم المعالجة داخل المتصفح ولا يُرفع الملف إلى خوادم أمبراطورية الويب.",
    url: "رابط ملف الفيديو المباشر",
    urlPlaceholder: "https://example.com/video.mp4",
    fileName: "اسم الملف اختياريًا",
    fileNamePlaceholder: "my-video.mp4",
    rights:
      "أؤكد أنني أملك الملف أو لدي تصريح قانوني بتنزيله واستخدامه.",
    download: "تحميل الفيديو",
    openOriginal: "فتح الرابط الأصلي",
    chooseFile: "اختر ملف الفيديو",
    outputFormat: "صيغة الإخراج",
    quality: "الجودة",
    resolution: "الدقة",
    start: "بداية القص بالثواني",
    end: "نهاية القص بالثواني",
    high: "جودة عالية",
    balanced: "متوازن",
    small: "حجم أصغر",
    original: "الدقة الأصلية",
    convert: "تحويل الفيديو",
    compress: "ضغط الفيديو",
    trim: "قص الفيديو",
    loadingEngine: "جاري تحميل محرك التحويل لأول مرة…",
    processing: "جاري معالجة الفيديو…",
    ready: "الملف جاهز للتنزيل.",
    output: "تنزيل الملف الناتج",
    reset: "اختيار ملف جديد",
    sourceSize: "حجم المصدر",
    outputSize: "حجم الناتج",
    progress: "التقدم",
    invalidUrl: "أدخل رابط HTTP أو HTTPS صالحًا.",
    rightsRequired: "يجب تأكيد ملكية الملف أو وجود تصريح قبل التنزيل.",
    corsError:
      "تعذر تنزيل الملف مباشرة. قد يمنع الخادم الوصول من المتصفح؛ افتح الرابط الأصلي أو استخدم ملفًا يسمح صاحبه بالتنزيل.",
    fileRequired: "اختر ملف فيديو أولًا.",
    fileTooLarge: "حجم الملف أكبر من الحد المسموح لهذه الأداة.",
    invalidRange: "تأكد أن وقت النهاية أكبر من وقت البداية.",
    engineError:
      "تعذر تحميل محرك التحويل. تحقق من اتصال الإنترنت ثم أعد المحاولة.",
    conversionError:
      "تعذر معالجة هذا الملف أو أن الترميز غير مدعوم في المتصفح.",
    limit: "الحد الأقصى",
    privacy:
      "الخصوصية: الملف لا يُرفع إلى الخادم. تحتاج الأداة إلى الإنترنت لتحميل محرك FFmpeg WebAssembly عند أول استخدام.",
  },
  en: {
    privateBadge: "Processed locally on your device",
    downloaderIntro:
      "Paste a direct video-file URL that you own or are authorized to download. The tool does not bypass platform protections or DRM.",
    mediaIntro:
      "Choose a video from your device. Processing happens in your browser and the file is not uploaded to Web Empire servers.",
    url: "Direct video file URL",
    urlPlaceholder: "https://example.com/video.mp4",
    fileName: "Optional file name",
    fileNamePlaceholder: "my-video.mp4",
    rights: "I confirm that I own this file or have permission to download and use it.",
    download: "Download video",
    openOriginal: "Open original URL",
    chooseFile: "Choose video file",
    outputFormat: "Output format",
    quality: "Quality",
    resolution: "Resolution",
    start: "Trim start in seconds",
    end: "Trim end in seconds",
    high: "High quality",
    balanced: "Balanced",
    small: "Smaller file",
    original: "Original resolution",
    convert: "Convert video",
    compress: "Compress video",
    trim: "Trim video",
    loadingEngine: "Loading the conversion engine for the first time…",
    processing: "Processing video…",
    ready: "Your file is ready to download.",
    output: "Download output file",
    reset: "Choose another file",
    sourceSize: "Source size",
    outputSize: "Output size",
    progress: "Progress",
    invalidUrl: "Enter a valid HTTP or HTTPS URL.",
    rightsRequired: "Confirm ownership or permission before downloading.",
    corsError:
      "The file could not be downloaded directly. The host may block browser access; open the original URL or use a source that permits downloads.",
    fileRequired: "Choose a video file first.",
    fileTooLarge: "The file is larger than this tool's allowed limit.",
    invalidRange: "The end time must be greater than the start time.",
    engineError:
      "The conversion engine could not be loaded. Check your internet connection and try again.",
    conversionError:
      "This file could not be processed or its codec is not supported in the browser.",
    limit: "Maximum",
    privacy:
      "Privacy: the file is not uploaded to the server. Internet access is required to load the FFmpeg WebAssembly engine on first use.",
  },
};

export function MediaToolWorkbench({
  locale,
  maxDownloadMb = 500,
  maxFileSizeMb = 250,
  mode,
  toolTitle,
}: Props) {
  const isArabic = locale === "ar";
  const t = isArabic ? copy.ar : copy.en;
  const isDownloader = mode === "video_downloader";

  const [url, setUrl] = useState("");
  const [requestedName, setRequestedName] = useState("");
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState(
    mode === "video_compressor" || mode === "video_trimmer" ? "mp4" : "mp4",
  );
  const [quality, setQuality] = useState(
    mode === "video_compressor" ? "small" : "balanced",
  );
  const [resolution, setResolution] = useState(
    mode === "video_compressor" ? "720" : "original",
  );
  const [startTime, setStartTime] = useState("0");
  const [endTime, setEndTime] = useState("");
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [outputUrl, setOutputUrl] = useState("");
  const [outputName, setOutputName] = useState("");
  const [outputSize, setOutputSize] = useState(0);

  const ffmpegRef = useRef<FFmpegInstance | null>(null);
  const ffmpegLoadRef = useRef<Promise<FFmpegInstance> | null>(null);

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [outputUrl]);

  async function getFFmpeg(): Promise<FFmpegInstance> {
    if (ffmpegRef.current) return ffmpegRef.current;
    if (ffmpegLoadRef.current) return ffmpegLoadRef.current;

    ffmpegLoadRef.current = (async () => {
      setStatus(t.loadingEngine);
      await Promise.all([
        loadScript(FFMPEG_SCRIPT, () => Boolean(window.FFmpegWASM?.FFmpeg)),
        loadScript(FFMPEG_UTIL_SCRIPT, () => Boolean(window.FFmpegUtil)),
      ]);

      const FFmpegClass = window.FFmpegWASM?.FFmpeg;
      const util = window.FFmpegUtil;
      if (!FFmpegClass || !util) throw new Error("MEDIA_ENGINE_LOAD_FAILED");

      const ffmpeg = new FFmpegClass();
      ffmpeg.on("progress", ({ progress: nextProgress }) => {
        if (Number.isFinite(nextProgress)) {
          setProgress(Math.max(0, Math.min(100, Math.round(nextProgress * 100))));
        }
      });

      await ffmpeg.load({
        coreURL: await util.toBlobURL(
          `${FFMPEG_CORE_BASE}/ffmpeg-core.js`,
          "text/javascript",
        ),
        wasmURL: await util.toBlobURL(
          `${FFMPEG_CORE_BASE}/ffmpeg-core.wasm`,
          "application/wasm",
        ),
      });

      ffmpegRef.current = ffmpeg;
      return ffmpeg;
    })();

    try {
      return await ffmpegLoadRef.current;
    } catch (loadError) {
      ffmpegLoadRef.current = null;
      throw loadError;
    }
  }

  function clearOutput(): void {
    if (outputUrl) URL.revokeObjectURL(outputUrl);
    setOutputUrl("");
    setOutputName("");
    setOutputSize(0);
    setProgress(0);
    setStatus("");
    setError("");
  }

  async function downloadDirectFile(): Promise<void> {
    setError("");
    setStatus("");

    if (!rightsConfirmed) {
      setError(t.rightsRequired);
      return;
    }

    const parsed = validHttpUrl(url);
    if (!parsed) {
      setError(t.invalidUrl);
      return;
    }

    setPending(true);
    setProgress(5);

    try {
      const response = await fetch(parsed.toString(), {
        credentials: "omit",
        redirect: "follow",
      });
      if (!response.ok) throw new Error(`HTTP_${response.status}`);

      const contentLength = Number(response.headers.get("content-length") ?? 0);
      if (contentLength > maxDownloadMb * 1024 * 1024) {
        throw new Error("FILE_TOO_LARGE");
      }

      setProgress(45);
      const blob = await response.blob();
      if (blob.size > maxDownloadMb * 1024 * 1024) {
        throw new Error("FILE_TOO_LARGE");
      }

      const headerName = contentDispositionName(
        response.headers.get("content-disposition"),
      );
      const pathName = parsed.pathname.split("/").filter(Boolean).pop() ?? "";
      const extension = extensionFromUrl(parsed);
      const fileName = safeFileName(
        requestedName || headerName || pathName,
        `video-${Date.now()}.${extension}`,
      );
      const finalName = fileName.includes(".") ? fileName : `${fileName}.${extension}`;
      const objectUrl = URL.createObjectURL(blob);

      triggerDownload(objectUrl, finalName);
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 30_000);
      setProgress(100);
      setStatus(`${t.ready} ${formatBytes(blob.size, locale)}`);
    } catch (downloadError) {
      const message = downloadError instanceof Error ? downloadError.message : "";
      setError(message === "FILE_TOO_LARGE" ? `${t.fileTooLarge} ${t.limit}: ${maxDownloadMb} MB.` : t.corsError);
      setProgress(0);
    } finally {
      setPending(false);
    }
  }

  function buildArgs(inputName: string, generatedName: string): string[] {
    const args: string[] = [];
    const start = Math.max(0, Number(startTime) || 0);
    const end = Number(endTime);

    if (mode === "video_trimmer" && start > 0) {
      args.push("-ss", String(start));
    }

    args.push("-i", inputName);

    if (mode === "video_trimmer" && Number.isFinite(end) && end > start) {
      args.push("-t", String(end - start));
    }

    const scale = resolution === "original" ? "" : `scale=-2:${resolution}`;
    if (scale && !["mp3", "wav"].includes(outputFormat)) {
      args.push("-vf", scale);
    }

    if (outputFormat === "mp3") {
      args.push("-vn", "-c:a", "libmp3lame", "-b:a", quality === "small" ? "128k" : quality === "high" ? "256k" : "192k");
    } else if (outputFormat === "wav") {
      args.push("-vn", "-c:a", "pcm_s16le");
    } else if (outputFormat === "webm") {
      const crf = quality === "high" ? "24" : quality === "small" ? "38" : "31";
      args.push("-c:v", "libvpx-vp9", "-crf", crf, "-b:v", "0", "-c:a", "libopus");
    } else {
      const crf = quality === "high" ? "20" : quality === "small" ? "30" : "25";
      args.push(
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        crf,
        "-c:a",
        "aac",
        "-movflags",
        "+faststart",
      );
    }

    args.push("-y", generatedName);
    return args;
  }

  async function processVideo(): Promise<void> {
    clearOutput();

    if (!file) {
      setError(t.fileRequired);
      return;
    }

    if (file.size > maxFileSizeMb * 1024 * 1024) {
      setError(`${t.fileTooLarge} ${t.limit}: ${maxFileSizeMb} MB.`);
      return;
    }

    const start = Math.max(0, Number(startTime) || 0);
    const end = Number(endTime);
    if (mode === "video_trimmer" && endTime && (!Number.isFinite(end) || end <= start)) {
      setError(t.invalidRange);
      return;
    }

    setPending(true);
    setProgress(1);

    const inputExtension = file.name.includes(".")
      ? file.name.split(".").pop()?.toLowerCase() ?? "mp4"
      : "mp4";
    const inputName = `input-${Date.now()}.${inputExtension}`;
    const baseName = safeFileName(
      file.name.replace(/\.[^.]+$/, ""),
      `video-${Date.now()}`,
    );
    const generatedName = `${baseName}-${
      mode === "video_compressor"
        ? "compressed"
        : mode === "video_trimmer"
          ? "trimmed"
          : "converted"
    }.${outputFormat}`;

    try {
      const ffmpeg = await getFFmpeg();
      const util = window.FFmpegUtil;
      if (!util) throw new Error("MEDIA_ENGINE_LOAD_FAILED");

      setStatus(t.processing);
      await ffmpeg.writeFile(inputName, await util.fetchFile(file));
      const exitCode = await ffmpeg.exec(buildArgs(inputName, generatedName));
      if (exitCode !== 0) throw new Error(`FFMPEG_EXIT_${exitCode}`);

      const data = await ffmpeg.readFile(generatedName);
      if (typeof data === "string") throw new Error("INVALID_MEDIA_OUTPUT");

      const outputBytes = new Uint8Array(data);
      const mimeType =
        outputFormat === "mp3"
          ? "audio/mpeg"
          : outputFormat === "wav"
            ? "audio/wav"
            : outputFormat === "webm"
              ? "video/webm"
              : outputFormat === "mov"
                ? "video/quicktime"
                : "video/mp4";
      const blob = new Blob([outputBytes], { type: mimeType });
      const nextUrl = URL.createObjectURL(blob);

      setOutputUrl(nextUrl);
      setOutputName(generatedName);
      setOutputSize(blob.size);
      setProgress(100);
      setStatus(t.ready);

      await Promise.allSettled([
        ffmpeg.deleteFile(inputName),
        ffmpeg.deleteFile(generatedName),
      ]);
    } catch (processError) {
      const message = processError instanceof Error ? processError.message : "";
      setError(
        message === "MEDIA_ENGINE_LOAD_FAILED" ? t.engineError : t.conversionError,
      );
      setProgress(0);
      setStatus("");
    } finally {
      setPending(false);
    }
  }

  const safeOpenUrl = validHttpUrl(url)?.toString() ?? "";

  const actionLabel =
    mode === "video_compressor"
      ? t.compress
      : mode === "video_trimmer"
        ? t.trim
        : t.convert;

  return (
    <div className={styles.workbench} dir={isArabic ? "rtl" : "ltr"}>
      <div className={styles.heading}>
        <div>
          <span className={styles.badge}>{t.privateBadge}</span>
          <h2>{toolTitle}</h2>
          <p>{isDownloader ? t.downloaderIntro : t.mediaIntro}</p>
        </div>
      </div>

      {isDownloader ? (
        <div className={styles.panel}>
          <label className={styles.field}>
            <span>{t.url}</span>
            <input
              inputMode="url"
              onChange={(event) => setUrl(event.currentTarget.value)}
              placeholder={t.urlPlaceholder}
              type="url"
              value={url}
            />
          </label>

          <label className={styles.field}>
            <span>{t.fileName}</span>
            <input
              onChange={(event) => setRequestedName(event.currentTarget.value)}
              placeholder={t.fileNamePlaceholder}
              type="text"
              value={requestedName}
            />
          </label>

          <label className={styles.confirmation}>
            <input
              checked={rightsConfirmed}
              onChange={(event) => setRightsConfirmed(event.currentTarget.checked)}
              type="checkbox"
            />
            <span>{t.rights}</span>
          </label>

          <div className={styles.actions}>
            <button disabled={pending} onClick={downloadDirectFile} type="button">
              {pending ? t.processing : t.download}
            </button>
            {safeOpenUrl ? (
              <a href={safeOpenUrl} rel="noopener noreferrer" target="_blank">
                {t.openOriginal}
              </a>
            ) : null}
          </div>
        </div>
      ) : (
        <div className={styles.panel}>
          <label className={`${styles.field} ${styles.fileField}`}>
            <span>{t.chooseFile}</span>
            <input
              accept="video/*,.mov,.mkv,.avi,.m4v,.webm,.mp4"
              onChange={(event) => {
                clearOutput();
                setFile(event.currentTarget.files?.[0] ?? null);
              }}
              type="file"
            />
            {file ? (
              <small>
                {file.name} — {formatBytes(file.size, locale)}
              </small>
            ) : null}
          </label>

          <div className={styles.optionsGrid}>
            <label className={styles.field}>
              <span>{t.outputFormat}</span>
              <select
                onChange={(event) => setOutputFormat(event.currentTarget.value)}
                value={outputFormat}
              >
                <option value="mp4">MP4</option>
                <option value="webm">WebM</option>
                <option value="mov">MOV</option>
                {mode === "video_converter" ? (
                  <>
                    <option value="mp3">MP3</option>
                    <option value="wav">WAV</option>
                  </>
                ) : null}
              </select>
            </label>

            <label className={styles.field}>
              <span>{t.quality}</span>
              <select
                onChange={(event) => setQuality(event.currentTarget.value)}
                value={quality}
              >
                <option value="high">{t.high}</option>
                <option value="balanced">{t.balanced}</option>
                <option value="small">{t.small}</option>
              </select>
            </label>

            {!['mp3', 'wav'].includes(outputFormat) ? (
              <label className={styles.field}>
                <span>{t.resolution}</span>
                <select
                  onChange={(event) => setResolution(event.currentTarget.value)}
                  value={resolution}
                >
                  <option value="original">{t.original}</option>
                  <option value="1080">1080p</option>
                  <option value="720">720p</option>
                  <option value="480">480p</option>
                </select>
              </label>
            ) : null}

            {mode === "video_trimmer" ? (
              <>
                <label className={styles.field}>
                  <span>{t.start}</span>
                  <input
                    min="0"
                    onChange={(event) => setStartTime(event.currentTarget.value)}
                    step="0.1"
                    type="number"
                    value={startTime}
                  />
                </label>
                <label className={styles.field}>
                  <span>{t.end}</span>
                  <input
                    min="0"
                    onChange={(event) => setEndTime(event.currentTarget.value)}
                    step="0.1"
                    type="number"
                    value={endTime}
                  />
                </label>
              </>
            ) : null}
          </div>

          <div className={styles.actions}>
            <button disabled={pending || !file} onClick={processVideo} type="button">
              {pending ? t.processing : actionLabel}
            </button>
            {outputUrl ? (
              <button
                className={styles.secondary}
                onClick={() => triggerDownload(outputUrl, outputName)}
                type="button"
              >
                {t.output}
              </button>
            ) : null}
          </div>
        </div>
      )}

      {pending || progress > 0 ? (
        <div className={styles.progressBox} aria-live="polite">
          <div>
            <span>{t.progress}</span>
            <strong>{progress}%</strong>
          </div>
          <progress max="100" value={progress} />
        </div>
      ) : null}

      {status ? <div className={styles.success}>{status}</div> : null}
      {error ? <div className={styles.error} role="alert">{error}</div> : null}

      {file || outputSize ? (
        <div className={styles.stats}>
          {file ? (
            <div>
              <span>{t.sourceSize}</span>
              <strong>{formatBytes(file.size, locale)}</strong>
            </div>
          ) : null}
          {outputSize ? (
            <div>
              <span>{t.outputSize}</span>
              <strong>{formatBytes(outputSize, locale)}</strong>
            </div>
          ) : null}
        </div>
      ) : null}

      <p className={styles.privacy}>
        {t.privacy} {t.limit}: {isDownloader ? maxDownloadMb : maxFileSizeMb} MB.
      </p>
    </div>
  );
}
