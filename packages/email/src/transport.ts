import { createTransport } from "nodemailer";

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/** Email delivery port. */
export interface EmailTransport {
  send(message: EmailMessage): Promise<{ messageId: string }>;
  verify(): Promise<void>;
  close(): void;
}

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  password?: string;
  from: string;
}

export function createSmtpTransport(config: SmtpConfig): EmailTransport {
  const transporter = createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.user && config.password ? { user: config.user, pass: config.password } : undefined,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  return {
    async send(message) {
      const info = (await transporter.sendMail({ from: config.from, ...message })) as {
        messageId: string;
      };
      return { messageId: info.messageId };
    },
    async verify() {
      await transporter.verify();
    },
    close() {
      transporter.close();
    },
  };
}

/** Test adapter collecting messages in memory. */
export function createMemoryTransport(): EmailTransport & { sent: EmailMessage[] } {
  const sent: EmailMessage[] = [];
  return {
    sent,
    send(message) {
      sent.push(message);
      return Promise.resolve({ messageId: `memory-${sent.length}` });
    },
    verify: () => Promise.resolve(),
    close: () => undefined,
  };
}
