export class ContextUtils {
  static hour(date = new Date()) {
    return date.getUTCHours();
  }
}