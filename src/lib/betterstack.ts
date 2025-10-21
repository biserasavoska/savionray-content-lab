/**
 * Better Stack integration for SavionRay Content Lab
 * This module handles log collection and tracing via Better Stack HTTP API
 */

interface LogEntry {
  dt: string;
  message: string;
  level?: 'info' | 'warn' | 'error' | 'debug';
  service?: string;
  environment?: string;
  userId?: string;
  organizationId?: string;
  traceId?: string;
  spanId?: string;
  [key: string]: any;
}

interface MetricEntry {
  dt: string;
  name: string;
  value: number;
  tags?: Record<string, string>;
  service?: string;
  environment?: string;
}

class BetterStackClient {
  private readonly apiUrl: string;
  private readonly sourceToken: string;
  private readonly environment: string;
  private readonly service: string;

  constructor() {
    this.apiUrl = process.env.BETTERSTACK_API_URL || 'https://logs.betterstack.com';
    this.sourceToken = process.env.BETTERSTACK_SOURCE_TOKEN || '';
    this.environment = process.env.NODE_ENV || 'development';
    this.service = 'savionray-content-lab';
  }

  private isEnabled(): boolean {
    return Boolean(this.sourceToken && this.sourceToken.length > 0);
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.sourceToken}`,
    };
  }

  /**
   * Send logs to Better Stack
   */
  async sendLog(logEntry: Omit<LogEntry, 'dt'>): Promise<void> {
    if (!this.isEnabled()) {
      console.warn('Better Stack is not configured. Skipping log entry.');
      return;
    }

    try {
      const entry: LogEntry = {
        dt: new Date().toISOString(),
        service: this.service,
        environment: this.environment,
        ...logEntry,
      };

      const response = await fetch(`${this.apiUrl}/source/${this.sourceToken}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(entry),
      });

      if (!response.ok) {
        console.error('Failed to send log to Better Stack:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error sending log to Better Stack:', error);
    }
  }

  /**
   * Send metrics to Better Stack
   */
  async sendMetric(metricEntry: Omit<MetricEntry, 'dt'>): Promise<void> {
    if (!this.isEnabled()) {
      console.warn('Better Stack is not configured. Skipping metric entry.');
      return;
    }

    try {
      const entry: MetricEntry = {
        dt: new Date().toISOString(),
        service: this.service,
        environment: this.environment,
        ...metricEntry,
      };

      const response = await fetch(`${this.apiUrl}/source/${this.sourceToken}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(entry),
      });

      if (!response.ok) {
        console.error('Failed to send metric to Better Stack:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error sending metric to Better Stack:', error);
    }
  }

  /**
   * Log application events
   */
  async logInfo(message: string, context: Record<string, any> = {}): Promise<void> {
    await this.sendLog({
      message,
      level: 'info',
      ...context,
    });
  }

  async logWarning(message: string, context: Record<string, any> = {}): Promise<void> {
    await this.sendLog({
      message,
      level: 'warn',
      ...context,
    });
  }

  async logError(message: string, error?: Error, context: Record<string, any> = {}): Promise<void> {
    await this.sendLog({
      message,
      level: 'error',
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
      ...context,
    });
  }

  async logDebug(message: string, context: Record<string, any> = {}): Promise<void> {
    await this.sendLog({
      message,
      level: 'debug',
      ...context,
    });
  }

  /**
   * Track custom metrics
   */
  async trackMetric(name: string, value: number, tags: Record<string, string> = {}): Promise<void> {
    await this.sendMetric({
      name,
      value,
      tags,
    });
  }

  /**
   * Track user actions
   */
  async trackUserAction(action: string, userId?: string, organizationId?: string, metadata: Record<string, any> = {}): Promise<void> {
    await this.sendLog({
      message: `User action: ${action}`,
      level: 'info',
      userId,
      organizationId,
      action,
      ...metadata,
    });
  }

  /**
   * Track API requests
   */
  async trackApiRequest(
    method: string,
    endpoint: string,
    statusCode: number,
    duration: number,
    userId?: string,
    organizationId?: string
  ): Promise<void> {
    await this.sendLog({
      message: `API Request: ${method} ${endpoint}`,
      level: 'info',
      method,
      endpoint,
      statusCode,
      duration,
      userId,
      organizationId,
    });

    // Also track as metric
    await this.trackMetric('api_request_duration', duration, {
      method,
      endpoint,
      status_code: statusCode.toString(),
    });
  }
}

// Create singleton instance
const betterStack = new BetterStackClient();

export default betterStack;

// Convenience functions
export const logInfo = (message: string, context?: Record<string, any>) => betterStack.logInfo(message, context);
export const logWarning = (message: string, context?: Record<string, any>) => betterStack.logWarning(message, context);
export const logError = (message: string, error?: Error, context?: Record<string, any>) => betterStack.logError(message, error, context);
export const logDebug = (message: string, context?: Record<string, any>) => betterStack.logDebug(message, context);
export const trackMetric = (name: string, value: number, tags?: Record<string, string>) => betterStack.trackMetric(name, value, tags);
export const trackUserAction = (action: string, userId?: string, organizationId?: string, metadata?: Record<string, any>) => betterStack.trackUserAction(action, userId, organizationId, metadata);
export const trackApiRequest = (method: string, endpoint: string, statusCode: number, duration: number, userId?: string, organizationId?: string) => betterStack.trackApiRequest(method, endpoint, statusCode, duration, userId, organizationId);
