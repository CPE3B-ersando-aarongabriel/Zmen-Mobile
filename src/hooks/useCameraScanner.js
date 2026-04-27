import { useState } from "react";

export function useCameraScanner() {
  const [hasPermission, setHasPermission] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [capturedUri, setCapturedUri] = useState(null);

  const requestPermission = async () => {
    setHasPermission(true);
    return true;
  };

  const startScanner = () => setIsScanning(true);
  const stopScanner = () => setIsScanning(false);

  const mockCapture = () => {
    setCapturedUri(`scan-${Date.now()}.jpg`);
  };

  return {
    hasPermission,
    isScanning,
    capturedUri,
    requestPermission,
    startScanner,
    stopScanner,
    mockCapture,
  };
}
