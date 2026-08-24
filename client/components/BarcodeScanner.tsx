'use client';

import { useEffect, useRef, useState } from 'react';

export default function BarcodeScanner({
  onDetected,
  onClose,
}: {
  onDetected: (code: string) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let stream: MediaStream | null = null;
    let stopped = false;
    let intervalId: ReturnType<typeof setInterval>;

    async function start() {
      try {
        const { BarcodeDetector } = await import('barcode-detector/ponyfill');
        const detector = new BarcodeDetector({
          formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128'],
        });

        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });

        if (stopped) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        intervalId = setInterval(async () => {
          if (!videoRef.current || stopped) return;
          try {
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes.length > 0) {
              onDetected(barcodes[0].rawValue);
            }
          } catch {
            // ignore individual frame failures, keep scanning
          }
        }, 300);
      } catch (err) {
        setError('Could not access camera. Check your browser permissions.');
      }
    }

    start();

    return () => {
      stopped = true;
      clearInterval(intervalId);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [onDetected]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center p-4">
      {error ? (
        <p className="text-white">{error}</p>
      ) : (
        <video ref={videoRef} className="max-w-full max-h-[70vh] rounded" muted playsInline />
      )}
      <button
        type="button"
        onClick={onClose}
        className="mt-4 bg-white text-black px-4 py-2 rounded"
      >
        Cancel
      </button>
    </div>
  );
}