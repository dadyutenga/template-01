import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import { Camera, CameraOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QrScannerProps {
  /** Called with the raw decoded text when a QR code is successfully scanned */
  onScan: (decodedText: string) => void;
  /** Called when the scanner encounters an error worth surfacing */
  onError?: (error: string) => void;
  /** Optional label above the viewfinder */
  label?: string;
}

export default function QrScanner({ onScan, onError, label }: QrScannerProps) {
  const viewfinderRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const stopScanner = async () => {
    try {
      if (
        scannerRef.current &&
        scannerRef.current.getState() === Html5QrcodeScannerState.SCANNING
      ) {
        await scannerRef.current.stop();
      }
    } catch {
      // ignore errors on stop
    }
    setIsScanning(false);
  };

  const startScanner = async () => {
    setCameraError(null);

    // Ensure any previous instance is cleaned up
    await stopScanner();

    const elementId = "qr-scanner-viewfinder";

    try {
      const html5QrCode = new Html5Qrcode(elementId);
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
          aspectRatio: 1,
        },
        (decodedText) => {
          // Success — pass decoded text to parent & stop scanner
          onScan(decodedText);
          void stopScanner();
        },
        () => {
          // QR code not found in this frame — no-op
        }
      );

      setIsScanning(true);
    } catch (err: any) {
      const message =
        err?.message ?? "Could not start camera. Check permissions.";
      setCameraError(message);
      onError?.(message);
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      void stopScanner();
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-3">
      {label && (
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
      )}

      {/* Viewfinder container */}
      <div
        className="relative mx-auto w-full max-w-[280px] overflow-hidden rounded-2xl border border-border bg-black"
        style={{ aspectRatio: "1" }}
      >
        <div id="qr-scanner-viewfinder" ref={viewfinderRef} className="h-full w-full" />

        {!isScanning && !cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted/80">
            <Camera className="h-10 w-10 text-muted-foreground" />
            <Button
              variant="hero"
              size="sm"
              className="rounded-2xl"
              onClick={startScanner}
            >
              <Camera className="mr-2 h-4 w-4" />
              Open Camera
            </Button>
          </div>
        )}

        {cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted/90 p-4 text-center">
            <CameraOff className="h-10 w-10 text-destructive" />
            <p className="text-xs text-destructive leading-snug">{cameraError}</p>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={startScanner}>
              <RefreshCw className="mr-2 h-3.5 w-3.5" /> Retry
            </Button>
          </div>
        )}
      </div>

      {isScanning && (
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl"
          onClick={stopScanner}
        >
          <CameraOff className="mr-2 h-4 w-4" />
          Stop Camera
        </Button>
      )}
    </div>
  );
}
