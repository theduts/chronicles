import { toast } from 'sonner';
import axios from 'axios';

export interface ProblemDetailBody {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  errors?: Record<string, string>;
  retryAfterSeconds?: number;
}

let rateLimitInterval: ReturnType<typeof setInterval> | null = null;

function formatCountdown(totalSeconds: number): string {
  const clampedSeconds = Math.min(Math.max(0, totalSeconds), 3599);
  const minutes = Math.floor(clampedSeconds / 60);
  const seconds = clampedSeconds % 60;
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  return `${mm}:${ss}`;
}

export function showApiErrorToast(error: unknown): void {
  let message = 'Ocorreu um erro inesperado.';

  if (axios.isAxiosError(error) && error.response?.data) {
    const data = error.response.data as ProblemDetailBody;
    if (typeof data.detail === 'string' && data.detail.trim().length > 0) {
      message = data.detail.trim();
    }
  }

  toast.error(message);
}

export function showRateLimitToast(retryAfterSeconds: number): void {
  const toastId = 'rate-limit-toast';

  if (rateLimitInterval) {
    clearInterval(rateLimitInterval);
    rateLimitInterval = null;
  }

  let remaining = Math.max(1, retryAfterSeconds);

  toast.info(`Muitas tentativas de login. Tente novamente em ${formatCountdown(remaining)}.`, {
    id: toastId,
    duration: (remaining + 2) * 1000,
    onDismiss: () => {
      if (rateLimitInterval) {
        clearInterval(rateLimitInterval);
        rateLimitInterval = null;
      }
    },
    onAutoClose: () => {
      if (rateLimitInterval) {
        clearInterval(rateLimitInterval);
        rateLimitInterval = null;
      }
    }
  });

  rateLimitInterval = setInterval(() => {
    remaining -= 1;
    if (remaining <= 0) {
      if (rateLimitInterval) {
        clearInterval(rateLimitInterval);
        rateLimitInterval = null;
      }
      toast.info('Você já pode tentar novamente.', {
        id: toastId,
        duration: 3000
      });
    } else {
      toast.info(`Muitas tentativas de login. Tente novamente em ${formatCountdown(remaining)}.`, {
        id: toastId,
        duration: (remaining + 2) * 1000
      });
    }
  }, 1000);
}

export function extractFieldErrors(error: unknown): Record<string, string> | null {
  if (axios.isAxiosError(error) && error.response?.status === 400 && error.response.data) {
    const data = error.response.data as ProblemDetailBody;
    if (data.errors && typeof data.errors === 'object' && Object.keys(data.errors).length > 0) {
      return data.errors;
    }
  }
  return null;
}

