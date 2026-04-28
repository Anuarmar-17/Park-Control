"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast, ToastProvider } from "@/components/ui/Toast";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/authService";

// ─── SVG Icons ────────────────────────────────────────────────
const IconCar = () => (
  <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="white" strokeWidth={1.8}>
    <rect x="2" y="5" width="20" height="14" rx="3" />
    <path d="M16 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
    <path d="M2 9h20M7 15h.01" />
  </svg>
);

const IconCheck = () => (
  <svg viewBox="0 0 10 10" className="w-2.5 h-2.5" fill="none" stroke="white" strokeWidth={2}>
    <polyline points="2,5 4.2,7.5 8,3" />
  </svg>
);

const IconMail = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <rect x="2" y="4" width="20" height="16" rx="3" />
    <path d="M2 8l10 7 10-7" />
  </svg>
);

const IconLock = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconEye = ({ open }: { open: boolean }) =>
  open ? (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

const IconAlert = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12" y2="16.5" strokeWidth={2.5} />
  </svg>
);

const IconWhatsApp = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.557 4.121 1.532 5.855L0 24l6.306-1.513A11.954 11.954 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.006-1.371l-.36-.214-3.723.893.926-3.631-.235-.373A9.8 9.8 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z" />
  </svg>
);

// ─── Campo de entrada reutilizable ───────────────────────────
interface InputFieldProps {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  icon: React.ReactNode;
  disabled: boolean;
  isValid?: boolean | null;
  rightElement?: React.ReactNode;
  autoComplete?: string;
  "aria-describedby"?: string;
}

function InputField({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  icon,
  disabled,
  isValid,
  rightElement,
  autoComplete,
  "aria-describedby": ariaDescribedBy,
}: InputFieldProps) {
  const borderClass =
    isValid === true
      ? "border-green-500 bg-green-50 dark:bg-green-950/20 focus:ring-green-500/10"
      : isValid === false
        ? "border-red-400 bg-red-50 dark:bg-red-950/20 focus:ring-red-500/10"
        : "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 focus:ring-blue-500/10";

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[0.7rem] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-1.5"
      >
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none">
          {icon}
        </span>
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-describedby={ariaDescribedBy}
          className={`
            w-full pl-10 pr-${rightElement ? "10" : "4"} py-2.5
            border rounded-xl text-sm text-zinc-800 dark:text-zinc-100
            placeholder:text-zinc-400 dark:placeholder:text-zinc-600
            transition-all duration-200 outline-none
            focus:ring-4 focus:border-blue-500 dark:focus:border-blue-400
            disabled:opacity-60 disabled:cursor-not-allowed
            ${borderClass}
          `}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightElement}</div>
        )}
      </div>
    </div>
  );
}

// ─── Componente principal del formulario ─────────────────────
function LoginForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const { login, isAuthenticated, isLoading: authLoading, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [mounted, setMounted] = useState(false);

  // Estados de validación visual
  const emailValid = email.length > 3 ? email.includes("@") && email.includes(".") : null;
  const pwValid = password.length > 0 ? password.length >= 4 : null;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirigir automáticamente si ya hay sesión activa.
  // → Esperar a que AuthContext termine de leer localStorage (!authLoading)
  //   para no interrumpir un intento de login fallido con una redirección
  // La verificación de sesión ahora la maneja AuthContext y el middleware.
  // Pero podemos redirigir automáticamente si ya está autenticado.
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      if (user.rol_id === 1 || user.rol?.toLowerCase() === "admin") {
        router.push("/admin");
      } else if (user.rol_id === 2 || user.rol?.toLowerCase() === "operario") {
        router.push("/operative");
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !password) {
      setErrorMsg("Por favor, completa todos los campos.");
      return;
    }
    if (password.length < 4) {
      setErrorMsg("La contraseña debe tener al menos 4 caracteres.");
      return;
    }

    setIsLoading(true);
    try {
      const data = await authService.login(email, password);
      
      login(data.token, data.user);
      showToast("Inicio de sesión exitoso", "success");

      const rolId = data.user.rol_id;
      if (rolId === 1 || data.user.rol?.toLowerCase() === "admin") {
        router.push("/admin");
      } else if (rolId === 2 || data.user.rol?.toLowerCase() === "operario") {
        router.push("/operative");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Error al iniciar sesión");
      showToast(err.message || "Error al iniciar sesión", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="
        min-h-screen flex items-center justify-center p-4
        bg-gradient-to-br from-blue-50 via-zinc-50 to-emerald-50
        dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950
        font-sans relative overflow-hidden
      "
    >
      {/* Fondo decorativo — círculos difusos */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-32 -right-20 w-96 h-96 rounded-full bg-blue-400/10 dark:bg-blue-600/10" />
        <div className="absolute -bottom-24 -left-16 w-80 h-80 rounded-full bg-emerald-400/10 dark:bg-emerald-600/8" />
        <div className="absolute bottom-16 right-10 w-48 h-48 rounded-full bg-blue-300/6 dark:bg-blue-400/5" />
        {/* Dot pattern */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.12] dark:opacity-[0.06]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="#94a3b8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      {/* Tarjeta principal */}
      <div
        className={`
          relative w-full max-w-md
          bg-white dark:bg-zinc-900
          border border-zinc-200/80 dark:border-zinc-700/60
          rounded-2xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.04),0_20px_40px_-8px_rgba(0,0,0,0.08)]
          dark:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.2),0_20px_40px_-8px_rgba(0,0,0,0.3)]
          hover:shadow-[0_8px_12px_-2px_rgba(0,0,0,0.06),0_32px_56px_-10px_rgba(0,0,0,0.12)]
          dark:hover:shadow-[0_8px_12px_-2px_rgba(0,0,0,0.25),0_32px_56px_-10px_rgba(0,0,0,0.35)]
          transition-shadow duration-300
          px-8 pt-10 pb-8
          ${mounted ? "animate-[fadeUp_0.5s_ease_both]" : "opacity-0"}
        `}
        style={{
          // Fallback para la animación si Tailwind no la tiene registrada
          animation: mounted ? "fadeUp 0.5s ease both" : "none",
        }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div
              className="
                w-14 h-14 rounded-2xl flex items-center justify-center
                bg-gradient-to-br from-blue-600 to-blue-700
                shadow-[0_6px_20px_rgba(37,99,235,0.35)]
              "
              aria-hidden="true"
            >
              <IconCar />
            </div>
            {/* Badge de verificado */}
            <div
              className="
                absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full
                bg-green-500 border-2 border-white dark:border-zinc-900
                flex items-center justify-center
              "
              aria-hidden="true"
            >
              <IconCheck />
            </div>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            ParkControl
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 text-center">
            Accede a tu cuenta para gestionar el parqueadero
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <InputField
            id="email"
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="tu@email.com"
            icon={<IconMail />}
            disabled={isLoading}
            isValid={emailValid}
            autoComplete="email"
            aria-describedby={errorMsg ? "form-error" : undefined}
          />

          <InputField
            id="password"
            label="Contraseña"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            icon={<IconLock />}
            disabled={isLoading}
            isValid={pwValid}
            autoComplete="current-password"
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors p-0.5"
              >
                <IconEye open={showPassword} />
              </button>
            }
          />

          {/* Recordarme + olvidé contraseña */}
          <div className="flex items-center justify-between pt-0.5">
            <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
                className="w-3.5 h-3.5 rounded border-zinc-300 accent-blue-600 cursor-pointer"
                aria-label="Recordarme en este dispositivo"
              />
              Recordarme
            </label>
            <Link
              href="#"
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {/* Mensaje de error */}
          {errorMsg && (
            <div
              id="form-error"
              role="alert"
              className="
                flex items-center gap-2 p-3
                bg-red-50 dark:bg-red-950/30
                border border-red-200 dark:border-red-800/50
                text-red-600 dark:text-red-400
                text-sm rounded-xl
              "
            >
              <IconAlert />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Botón de submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="
              w-full flex items-center justify-center gap-2
              bg-gradient-to-r from-blue-700 to-blue-600
              hover:from-blue-600 hover:to-blue-500
              active:scale-[0.98]
              text-white font-medium text-sm
              rounded-xl px-6 py-3
              shadow-[0_4px_14px_rgba(37,99,235,0.3)]
              hover:shadow-[0_6px_20px_rgba(37,99,235,0.4)]
              transition-all duration-200
              disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none
              focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/40
              mt-1
            "
            aria-busy={isLoading}
          >
            {isLoading ? (
              <>
                <span
                  className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"
                  aria-hidden="true"
                />
                <span>Ingresando...</span>
              </>
            ) : (
              "Iniciar sesión"
            )}
          </button>
        </form>

        {/* Divisor con texto */}
        <div className="flex items-center gap-3 my-5" aria-hidden="true">
          <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
          <span className="text-[0.7rem] text-zinc-400 dark:text-zinc-600 whitespace-nowrap tracking-wide">
            Sistema de gestión de parqueadero
          </span>
          <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
        </div>

        {/* Footer */}
        <p className="text-center text-[0.7rem] text-zinc-400 dark:text-zinc-600">
          © {new Date().getFullYear()} ParkControl · Todos los derechos reservados
        </p>
      </div>

      {/* Botón WhatsApp flotante */}
      <a
        href="https://wa.me/573001234567"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar soporte por WhatsApp"
        className="
          fixed bottom-6 right-6
          w-12 h-12 rounded-full
          bg-green-500 hover:bg-green-600
          flex items-center justify-center
          shadow-[0_4px_14px_rgba(22,163,74,0.4)]
          hover:shadow-[0_6px_20px_rgba(22,163,74,0.5)]
          hover:scale-110 active:scale-95
          transition-all duration-200
          focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-500/40
          z-50
        "
      >
        <IconWhatsApp />
      </a>

      {/* Keyframe de animación */}
      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <ToastProvider>
      <LoginForm />
    </ToastProvider>
  );
}
