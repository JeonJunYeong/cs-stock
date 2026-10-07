import { Injectable } from "@nestjs/common";
import axios from "axios";
import { ConfigService } from "@nestjs/config";
@Injectable()
export class Emart24Client {
  private readonly timeout: number;
  constructor(config: ConfigService) {
    this.timeout = Number(config.get("REQUEST_TIMEOUT", 5000));
  }
  private async get<T>(url: string, params?: any): Promise<T> {
    return (
      await axios.get<T>(url, {
        params,
        timeout: this.timeout,
        headers: {
          Accept: "application/json, text/javascript, */*; q=0.01",
          "X-Requested-With": "XMLHttpRequest",
        },
      })
    ).data;
  }
  products(keyword: string) {
    const data = new URLSearchParams({
      currentPage: "1",
      pageCnt: "50",
      sortType: "SALE",
      saleProductYn: "N",
      searchWord: keyword,
    });
    return axios
      .post(
        "https://everse.emart24.co.kr/stock/stock/search",
        data.toString(),
        {
          timeout: this.timeout,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            Accept: "application/json, text/javascript, */*; q=0.01",
            "X-Requested-With": "XMLHttpRequest",
          },
        },
      )
      .then((r) => r.data);
  }
  stores(keyword: string) {
    return this.get<any>("https://emart24.co.kr/api1/store", {
      page: 1,
      search: keyword,
    });
  }
  inventory(productCode: string, storeCodes: string[]) {
    return this.get<any>(
      "https://everse.emart24.co.kr/api/stock/v2/stock-search/store",
      { searchPluCode: productCode, bizNoArr: storeCodes.join(",") },
    );
  }
}
