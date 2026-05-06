"use client";

import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScanSuccess, onClose }: QRScannerProps) {
  const [errorMsg, setErrorMsg] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isStoppingRef = useRef(false);

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("qr-reader");
    scannerRef.current = html5QrCode;

    html5QrCode.start(
      { facingMode: "environment" }, // Preferir cámara trasera
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      },
      (decodedText) => {
        // Éxito
        if (!isStoppingRef.current) {
          isStoppingRef.current = true;
          html5QrCode.stop().then(() => {
            onScanSuccess(decodedText);
          }).catch(console.error);
        }
      },
      (errorMessage) => {
        // Errores de escaneo (silenciosos)
      }
    ).catch((err) => {
      console.error("Error al iniciar cámara", err);
      setErrorMsg("No se pudo iniciar la cámara. Verifica los permisos.");
    });

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning && !isStoppingRef.current) {
        isStoppingRef.current = true;
        scannerRef.current.stop().catch(console.error);
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
