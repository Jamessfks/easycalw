import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker, DrawingUtils, type NormalizedLandmark } from '@mediapipe/tasks-vision';
import type { HandInputState } from './LowPolyGraphScene';
import { Camera, RefreshCw, AlertTriangle } from 'lucide-react';

interface HandTrackingControlProps {
    onHandUpdate: (state: HandInputState) => void;
}

const LANDMARK_COLOR = '#4ade80';
const CONNECTION_COLOR = '#fbbf24';
const PREVIEW_WIDTH = '18.75vw';
const PREVIEW_HEIGHT = '14.0625vw';

// Timeout for model loading (30 seconds)
const MODEL_LOAD_TIMEOUT = 30000;

export const HandTrackingControl: React.FC<HandTrackingControlProps> = ({ onHandUpdate }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [status, setStatus] = useState<string>('Initializing...');
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [debugInfo, setDebugInfo] = useState<string>('');

    const handLandmarkerRef = useRef<HandLandmarker | null>(null);
    const rootRequestRef = useRef<number>(0);
    const lastGestureRef = useRef<'OPEN' | 'CLOSED' | 'NONE'>('NONE');
    const gestureFrameCountRef = useRef<number>(0);

    const cleanup = () => {
        if (rootRequestRef.current) {
            cancelAnimationFrame(rootRequestRef.current);
            rootRequestRef.current = 0;
        }
        if (handLandmarkerRef.current) {
            handLandmarkerRef.current.close();
            handLandmarkerRef.current = null;
        }
        // Stop video stream
        if (videoRef.current?.srcObject) {
            const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
            tracks.forEach(track => track.stop());
        }
    };

    useEffect(() => {
        let mounted = true;
        let timeoutId: NodeJS.Timeout;

        const setupMediaPipe = async () => {
            try {
                cleanup();
                console.log(`[HandTracking] === Initialization Attempt ${retryCount + 1} ===`);

                // Step 1: Check model file with GET to verify content
                setStatus('Checking model file...');
                console.log("[HandTracking] Step 1: Checking model file...");

                const modelUrl = "/models/hand_landmarker.task";
                const checkResponse = await fetch(modelUrl);

                if (!checkResponse.ok) {
                    throw new Error(`Model file HTTP ${checkResponse.status}`);
                }

                // Verify size by reading blob (headers can be unreliable in proxies)
                const blob = await checkResponse.blob();
                const fileSize = blob.size;
                console.log(`[HandTracking] Model file size: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);

                if (fileSize < 1000000) { // Less than 1MB is suspicious
                    throw new Error(`Model file too small (${fileSize} bytes). Re-download required.`);
                }


                setDebugInfo(`Model: ${(fileSize / 1024 / 1024).toFixed(1)}MB`);

                if (!mounted) return;

                // Step 2: Load WASM
                setStatus('Loading WASM...');
                console.log("[HandTracking] Step 2: Loading WASM...");

                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
                );
                console.log("[HandTracking] WASM loaded successfully");

                if (!mounted) return;

                // Step 3: Create HandLandmarker with timeout and GPU/CPU fallback
                setStatus('Loading hand model...');
                console.log("[HandTracking] Step 3: Creating HandLandmarker...");

                // Set up timeout
                const loadPromise = createHandLandmarker(vision, "GPU");
                const timeoutPromise = new Promise<never>((_, reject) => {
                    timeoutId = setTimeout(() => {
                        reject(new Error(`Model load timeout (${MODEL_LOAD_TIMEOUT / 1000}s)`));
                    }, MODEL_LOAD_TIMEOUT);
                });

                let handLandmarker: HandLandmarker;
                try {
                    handLandmarker = await Promise.race([loadPromise, timeoutPromise]);
                    clearTimeout(timeoutId);
                } catch (gpuError: any) {
                    console.warn("[HandTracking] GPU delegate failed, trying CPU:", gpuError.message);
                    clearTimeout(timeoutId);

                    setStatus('Retrying with CPU...');
                    setDebugInfo('GPU failed, using CPU');

                    // Retry with CPU
                    handLandmarker = await createHandLandmarker(vision, "CPU");
                }

                console.log("[HandTracking] HandLandmarker created successfully!");

                if (!mounted) return;

                handLandmarkerRef.current = handLandmarker;
                setStatus('Starting camera...');
                setIsModelLoaded(true);

                // Step 4: Start camera
                console.log("[HandTracking] Step 4: Starting camera...");
                await startCamera();
                console.log("[HandTracking] === Initialization Complete ===");

            } catch (error: any) {
                console.error("[HandTracking] Setup failed:", error);
                clearTimeout(timeoutId!);
                if (mounted) {
                    setStatus(`Error: ${error.message}`);
                    setDebugInfo(error.stack?.split('\n')[0] || '');
                    setIsModelLoaded(false);
                }
            }
        };

        const createHandLandmarker = async (vision: any, delegate: "GPU" | "CPU"): Promise<HandLandmarker> => {
            console.log(`[HandTracking] Attempting to create HandLandmarker with ${delegate} delegate...`);

            return await HandLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: "/models/hand_landmarker.task",
                    delegate: delegate
                },
                runningMode: "VIDEO",
                numHands: 1
            });
        };

        setupMediaPipe();

        return () => {
            mounted = false;
            clearTimeout(timeoutId!);
            cleanup();
        };
    }, [retryCount]);

    const handleRetry = () => {
        setIsModelLoaded(false);
        setStatus('Retrying...');
        setDebugInfo('');
        setRetryCount(c => c + 1);
    };

    const startCamera = async () => {
        if (!videoRef.current) {
            throw new Error("Video element not found");
        }

        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 320 },
                height: { ideal: 240 },
                frameRate: { ideal: 30 }
            }
        });

        videoRef.current.srcObject = stream;

        return new Promise<void>((resolve) => {
            videoRef.current!.onloadeddata = () => {
                setStatus('Waiting for hand...');
                predictWebcam();
                resolve();
            };
        });
    };

    const detectGesture = (landmarks: NormalizedLandmark[]): 'OPEN' | 'CLOSED' | 'NONE' => {
        let extendedFingers = 0;
        const wrist = landmarks[0];

        const isExtended = (tipIdx: number, pipIdx: number) => {
            const tip = landmarks[tipIdx];
            const pip = landmarks[pipIdx];
            const dTip = Math.hypot(tip.x - wrist.x, tip.y - wrist.y);
            const dPip = Math.hypot(pip.x - wrist.x, pip.y - wrist.y);
            return dTip > dPip;
        };

        if (isExtended(4, 2)) extendedFingers++;
        if (isExtended(8, 5)) extendedFingers++;
        if (isExtended(12, 9)) extendedFingers++;
        if (isExtended(16, 13)) extendedFingers++;
        if (isExtended(20, 17)) extendedFingers++;

        if (extendedFingers >= 4) return 'OPEN';
        if (extendedFingers <= 1) return 'CLOSED';
        return 'NONE';
    };

    const predictWebcam = () => {
        if (!handLandmarkerRef.current || !videoRef.current || !canvasRef.current) {
            rootRequestRef.current = requestAnimationFrame(predictWebcam);
            return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
        }

        const startTimeMs = performance.now();
        let results;

        try {
            results = handLandmarkerRef.current.detectForVideo(video, startTimeMs);
        } catch (e) {
            console.warn("[HandTracking] Detection frame error:", e);
            rootRequestRef.current = requestAnimationFrame(predictWebcam);
            return;
        }

        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.scale(-1, 1);
        ctx.translate(-canvas.width, 0);

        const drawingUtils = new DrawingUtils(ctx);

        let newState: HandInputState = {
            isActive: false,
            x: 0.5,
            y: 0.5,
            gesture: 'NONE'
        };

        if (results.landmarks && results.landmarks.length > 0) {
            const landmarks = results.landmarks[0];

            drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, {
                color: CONNECTION_COLOR,
                lineWidth: 2
            });
            drawingUtils.drawLandmarks(landmarks, {
                color: LANDMARK_COLOR,
                lineWidth: 1,
                radius: 3
            });

            const indices = [0, 5, 9, 13, 17];
            let sumX = 0, sumY = 0;
            indices.forEach(i => {
                sumX += landmarks[i].x;
                sumY += landmarks[i].y;
            });

            newState.x = 1 - (sumX / indices.length);
            newState.y = sumY / indices.length;
            newState.isActive = true;

            const currentGesture = detectGesture(landmarks);
            if (currentGesture === lastGestureRef.current) {
                gestureFrameCountRef.current++;
            } else {
                gestureFrameCountRef.current = 0;
                lastGestureRef.current = currentGesture;
            }

            newState.gesture = gestureFrameCountRef.current > 5 ? currentGesture : 'NONE';
            setStatus(`Hand Detected (${currentGesture})`);
        } else {
            setStatus('No hand detected');
        }

        ctx.restore();
        onHandUpdate(newState);
        rootRequestRef.current = requestAnimationFrame(predictWebcam);
    };

    const isError = status.includes('Error');

    return (
        <div
            style={{
                position: 'absolute',
                bottom: '20px',
                right: '20px',
                width: PREVIEW_WIDTH,
                height: PREVIEW_HEIGHT,
                minWidth: '200px',
                minHeight: '150px',
                zIndex: 50,
                borderRadius: '12px',
                overflow: 'hidden',
                border: `1px solid ${isError ? 'rgba(239, 68, 68, 0.5)' : 'rgba(74, 222, 128, 0.3)'}`,
                boxShadow: `0 0 20px ${isError ? 'rgba(239, 68, 68, 0.2)' : 'rgba(74, 222, 128, 0.1)'}, inset 0 0 20px rgba(0,0,0,0.5)`,
                background: 'rgba(0, 0, 0, 0.9)',
                backdropFilter: 'blur(8px)',
            }}
        >
            {/* Status Header */}
            <div className="absolute top-0 left-0 w-full p-2 bg-black/70 text-[10px] font-mono z-30 flex items-center gap-2"
                style={{ color: isError ? '#ef4444' : '#4ade80' }}>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${status.includes('Detected') ? 'bg-green-500 animate-pulse' :
                    isError ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'
                    }`} />
                <span className="truncate">{status}</span>
            </div>

            {/* Debug Info */}
            {debugInfo && (
                <div className="absolute bottom-0 left-0 w-full p-1 bg-black/70 text-[8px] text-gray-400 font-mono z-30">
                    {debugInfo}
                </div>
            )}

            {/* Video Feed */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: 'scaleX(-1)',
                    opacity: isModelLoaded ? 0.7 : 0.3
                }}
            />

            {/* Canvas Overlay */}
            <canvas
                ref={canvasRef}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none'
                }}
            />

            {/* Loading/Error Overlay */}
            {!isModelLoaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 p-4 text-center">
                    {isError ? (
                        <>
                            <AlertTriangle className="text-red-400 mb-2" size={24} />
                            <div className="text-red-400 mb-3 text-[11px] max-w-[90%]">
                                {status.replace('Error: ', '')}
                            </div>
                            <button
                                onClick={handleRetry}
                                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/40 border border-red-500 rounded text-xs text-red-400 transition-colors cursor-pointer"
                            >
                                <RefreshCw size={14} />
                                Retry
                            </button>
                        </>
                    ) : (
                        <div className="flex flex-col items-center text-green-400">
                            <div className="animate-spin mb-3">
                                <Camera size={24} />
                            </div>
                            <span className="text-xs opacity-80">{status}</span>
                            {status.includes('model') && (
                                <span className="text-[10px] opacity-50 mt-1">This may take a moment...</span>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
