export class LoggingService {
  lastLog: string;

  public printLog(message: string): void {
    console.log(message);
    console.log(this.lastLog);
    this.lastLog = message;
  }
}
