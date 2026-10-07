import { Injectable } from "@nestjs/common";
import axios from "axios";
import { ConfigService } from "@nestjs/config";
@Injectable()
export class SevenElevenClient {
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly retryCount: number;
  private readonly userAgent: string;
  constructor(c: ConfigService) {
    this.baseUrl = c.get(
      "SEVEN_ELEVEN_BASE_URL",
      "https://new.7-elevenapp.co.kr",
    );
    this.timeout = Number(
      c.get("HTTP_TIMEOUT_MS") ?? c.get("REQUEST_TIMEOUT") ?? 10000,
    );
    this.retryCount = Number(c.get("HTTP_RETRY_COUNT", 1));
    this.userAgent = c.get(
      "SEVEN_ELEVEN_USER_AGENT",
      "Mozilla/5.0 (Linux; Android 15)",
    );
  }
  private headers() {
    return {
      "Content-Type": "application/json",
      Accept: "application/json, text/plain, */*",
      "User-Agent": this.userAgent,
    };
  }
  private async request<T>(fn: () => Promise<{ data: T }>): Promise<T> {
    let lastError: unknown;
    for (let attempt = 0; attempt <= this.retryCount; attempt++) {
      try {
        return (await fn()).data;
      } catch (error) {
        lastError = error;
        if (attempt >= this.retryCount) break;
      }
    }
    throw lastError;
  }
  private post(path: string, body: any) {
    return this.request(() =>
      axios.post(`${this.baseUrl}${path}`, body, {
        timeout: this.timeout,
        headers: this.headers(),
      }),
    );
  }
  private get(path: string) {
    return this.request(() =>
      axios.get(`${this.baseUrl}${path}`, {
        timeout: this.timeout,
        headers: this.headers(),
      }),
    );
  }
  products(keyword: string) {
    return this.post("/api/v1/open/search/goods", {
      collection: "goods",
      query: keyword,
      sort: "quantity/desc,itemOnm/asc",
      startCount: 0,
      listCount: 100,
    });
  }
  stockMeta(itemCode: string) {
    return this.get(
      `/api/v1/open/product/search/stock?itemCd=${encodeURIComponent(itemCode)}`,
    );
  }
  stores(keyword: string) {
    const query = keyword
      .trim()
      .replace(/\s+/g, "")
      .replace(/(역|지점|점)$/g, "");
    return this.post("/api/v1/open/search/store", {
      collection: "store",
      query,
      sort: "Date/desc",
      listCount: 100,
    });
  }
  stock(body: {
    smCd: string;
    stokMngCd: string;
    stokMngQty: number;
    stockApplicationRate: string;
    storeList: string[];
  }) {
    return this.post("/api/v1/open/real-stock/multi/01/stocks", body);
  }
}
