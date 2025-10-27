/**
 * Rate Limiter utility для предотвращения спама запросов
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  /**
   * Проверяет, можно ли выполнить запрос
   * @param key - уникальный ключ для отслеживания (например, 'page-view' или 'button-click:название')
   * @param config - настройки: maxRequests (макс. запросов), windowMs (период в мс)
   */
  canRequest(key: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];
    
    // Фильтруем старые запросы за пределами окна
    const recentTimestamps = timestamps.filter(
      timestamp => now - timestamp < config.windowMs
    );
    
    // Проверяем лимит
    if (recentTimestamps.length >= config.maxRequests) {
      return false;
    }
    
    // Добавляем текущий запрос
    recentTimestamps.push(now);
    this.requests.set(key, recentTimestamps);
    
    return true;
  }

  /**
   * Очищает историю для конкретного ключа
   */
  clear(key: string): void {
    this.requests.delete(key);
  }

  /**
   * Очищает всю историю
   */
  clearAll(): void {
    this.requests.clear();
  }
}

// Singleton экземпляр
export const rateLimiter = new RateLimiter();

/**
 * Debounce функция - выполняет функцию только после того, как прошло delay мс с последнего вызова
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return function(...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Throttle функция - выполняет функцию максимум раз в limit мс
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
