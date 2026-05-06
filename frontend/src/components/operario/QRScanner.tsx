"use client";

import React, { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScanSuccess, onClose }: QRScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // Inicializar el escáner al montar
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        rememberLastUsedCamera: true,
      },
      false
    );

    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        // Al detectar con éxito, detenemos el escáner y llamamos el callback
        if (scannerRef.current) {
          scannerRef.current.clear().catch(console.error);
        }
        onScanSuccess(decodedText);
      },
      (errorMessage) => {
        // Solo para debug o manejo silencioso, html5-qrcode lanza errores continuamente 
        // cuando no detecta un QR en el frame actual.
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, [onScanSuccess]);

  return (
    <div className="modal-overlay open" style={{ zIndex: 9999 }}>
      <div className="modal" style={{ width: "100%", maxWidth: "400px", padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={{ margin: 0 }}>Escanear QR de Salida</h3>
          <button className="modal-close" onClick={onClose} style={{ position: "relative", top: 0, right: 0 }}>✕</button>
        </div>
        
        <div id="qr-reader" style={{ width: "100%" }}></div>

        <p style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--muted)", marginTop: "1rem" }}>
          Apunta la cámara al código QR impreso en el ticket de entrada.
        </p>

        <div className="modal-footer" style={{ marginTop: "1rem" }}>
          <button className="btn-modal-secondary" onClick={onClose} style={{ width: "100%" }}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}
