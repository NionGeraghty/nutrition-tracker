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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState('');
  const [isFrontFacing, setIsFrontFacing] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let stopped = false;
    let intervalId: ReturnType<typeof setInterval>;
    let detected = false;

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

        // Detect whether we actually got the front-facing camera
        // (laptops with no rear camera fall back to the webcam, which is front-facing)
        const track = stream.getVideoTracks()[0];
        const settings = track.getSettings();
        setIsFrontFacing(settings.facingMode !== 'environment');

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        intervalId = setInterval(async () => {
          if (!videoRef.current || !canvasRef.current || stopped || detected) return;

          const video = videoRef.current;
          const canvas = canvasRef.current;
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          try {
            const barcodes = await detector.detect(video);
            if (barcodes.length > 0) {
                const box = barcodes[0].boundingBox;
                const verticalPadding = 40;
                ctx.strokeStyle = '#22c55e';
                ctx.lineWidth = 4;
                ctx.strokeRect(
                    box.x - 10,
                    box.y - verticalPadding,
                    box.width + 20,
                    box.height + verticalPadding * 2
                );

                detected = true;
                setTimeout(() => onDetected(barcodes[0].rawValue), 150);
            }
          } catch {
            // ignore individual frame failures, keep scanning
          }
        }, 200);
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
        <div className="relative max-w-full max-h-[70vh]">
          <video
            ref={videoRef}
            className="max-w-full max-h-[70vh] rounded"
            style={isFrontFacing ? { transform: 'scaleX(-1)' } : undefined}
            muted
            playsInline
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            style={isFrontFacing ? { transform: 'scaleX(-1)' } : undefined}
          />
        </div>
      )}
      <p className="text-white text-sm mt-2">Point the camera at a barcode</p>
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